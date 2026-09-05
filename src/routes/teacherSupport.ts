import { Hono } from 'hono'
import { Bindings, getCookie, getSessionUser, SessionUser, hashPassword, randomHex } from '../lib/auth'
import { getUserPlan } from './subs'

type Env = { Bindings: Bindings; Variables: { user: SessionUser | null } }
const teacherSupport = new Hono<Env>()

teacherSupport.use('*', async (c, next) => {
  const token = getCookie(c.req.header('Cookie'), 'edusob_session')
  c.set('user', await getSessionUser(c.env.DB, token))
  await next()
})

const requireAuth = async (c: any, next: any) => {
  if (!c.get('user')) return c.json({ ok: false, error: 'লগইন প্রয়োজন' }, 401)
  await next()
}

const requireAdmin = async (c: any, next: any) => {
  const u = c.get('user')
  if (!u) return c.json({ ok: false, error: 'লগইন প্রয়োজন' }, 401)
  if (u.role !== 'admin') return c.json({ ok: false, error: 'এডমিন অনুমতি প্রয়োজন' }, 403)
  await next()
}

const requireTeacherOrAdmin = async (c: any, next: any) => {
  const u = c.get('user')
  if (!u) return c.json({ ok: false, error: 'লগইন প্রয়োজন' }, 401)
  if (u.role !== 'admin' && u.role !== 'teacher' && u.role !== 'mentor') {
    return c.json({ ok: false, error: 'শিক্ষক বা এডমিন অনুমতি প্রয়োজন' }, 403)
  }
  await next()
}

// ১. শিক্ষক ও মেন্টর তালিকা (পাবলিক / ইউজার)
teacherSupport.get('/mentors', async (c) => {
  const subject = c.req.query('subject') || ''
  let query = 'SELECT id, name, designation, subject, education_level, avatar, experience_years, rating, total_solved, response_time, bio, is_online, phone FROM teachers WHERE is_active = 1'
  const params: any[] = []
  if (subject) {
    query += ' AND (subject LIKE ? OR designation LIKE ?)'
    params.push(`%${subject}%`, `%${subject}%`)
  }
  query += ' ORDER BY is_online DESC, rating DESC, total_solved DESC'

  const { results } = await c.env.DB.prepare(query).bind(...params).all()
  return c.json({ ok: true, mentors: results || [] })
})

// ২. ব্যবহারকারীর টিকিটের তালিকা
teacherSupport.get('/my-tickets', requireAuth, async (c) => {
  const user = c.get('user')!
  const rows = await c.env.DB.prepare(`
    SELECT t.id, t.ticket_code, t.subject, t.education_level, t.topic, t.question, t.attachment_url,
           t.urgency, t.status, t.answer, t.answered_by_name, t.answered_at, t.rating, t.user_feedback, t.created_at,
           t.teacher_id,
           m.name as teacher_name, m.avatar as teacher_avatar, m.designation as teacher_designation, m.phone as teacher_phone,
           (SELECT COUNT(*) FROM teacher_messages tm WHERE tm.ticket_id = t.id) as message_count,
           (SELECT room_code FROM teacher_video_rooms vr WHERE vr.ticket_id = t.id AND vr.status = 'active' ORDER BY vr.id DESC LIMIT 1) as active_video_room
    FROM teacher_tickets t
    LEFT JOIN teachers m ON t.teacher_id = m.id
    WHERE t.user_id = ?
    ORDER BY t.id DESC
  `).bind(user.id).all()

  const plan = await getUserPlan(c.env.DB, user.id)
  return c.json({ ok: true, tickets: rows.results || [], plan })
})

// ৩. একক টিকিট ডিটেইলস
teacherSupport.get('/ticket/:id', requireAuth, async (c) => {
  const user = c.get('user')!
  const id = Number(c.req.param('id'))
  const row: any = await c.env.DB.prepare(`
    SELECT t.*, m.name as teacher_name, m.avatar as teacher_avatar, m.designation as teacher_designation, m.phone as teacher_phone,
           u.name_bn as student_name, u.phone as student_phone, u.user_code as student_code,
           (SELECT room_code FROM teacher_video_rooms vr WHERE vr.ticket_id = t.id AND vr.status = 'active' ORDER BY vr.id DESC LIMIT 1) as active_video_room
    FROM teacher_tickets t
    JOIN users u ON t.user_id = u.id
    LEFT JOIN teachers m ON t.teacher_id = m.id
    WHERE t.id = ?
  `).bind(id).first()

  if (!row) return c.json({ ok: false, error: 'টিকিট পাওয়া যায়নি' }, 404)
  if (row.user_id !== user.id && user.role !== 'admin' && user.role !== 'teacher' && user.role !== 'mentor') {
    return c.json({ ok: false, error: 'অনুমতি নেই' }, 403)
  }

  // মেসেজ হিস্ট্রি
  const msgs = await c.env.DB.prepare(`
    SELECT * FROM teacher_messages WHERE ticket_id = ? ORDER BY id ASC
  `).bind(id).all()

  return c.json({ ok: true, ticket: row, messages: msgs.results || [] })
})

// ৪. নতুন প্রশ্ন / ডাউট জমা দেওয়া (Ask Question)
teacherSupport.post('/ask', requireAuth, async (c) => {
  const user = c.get('user')!
  const plan = await getUserPlan(c.env.DB, user.id)
  
  // প্রিমিয়াম বা স্ট্যান্ডার্ড প্ল্যান চেক (অথবা ফ্রি প্ল্যানে দিনে ১টি প্রশ্ন সুযোগ)
  if (plan === 'free' && user.role !== 'admin') {
    const todayCount: any = await c.env.DB.prepare(`
      SELECT COUNT(*) as cnt FROM teacher_tickets WHERE user_id = ? AND date(created_at) = date('now')
    `).bind(user.id).first()
    
    if ((todayCount?.cnt || 0) >= 1) {
      return c.json({ 
        ok: false, 
        error: 'ফ্রি একাউন্টে দৈনিক সর্বোচ্চ ১টি প্রশ্ন করা যায়। আনলিমিটেড ও দ্রুত শিক্ষক সমাধানের জন্য প্রিমিয়াম প্ল্যানে আপগ্রেড করুন।',
        need_upgrade: true 
      }, 403)
    }
  }

  const body = await c.req.json<any>().catch(() => null)
  const subject = String(body?.subject || '').trim()
  const topic = String(body?.topic || '').trim()
  const question = String(body?.question || '').trim()
  const attachmentUrl = String(body?.attachment_url || '').trim()
  const teacherId = body?.teacher_id ? Number(body.teacher_id) : null
  const urgency = (plan === 'premium' && body?.urgency === 'urgent') ? 'urgent' : 'normal'
  const educationLevel = String(body?.education_level || (user as any).education_level || 'general')

  if (!subject || !question) {
    return c.json({ ok: false, error: 'বিষয় এবং প্রশ্ন লেখা আবশ্যক' }, 400)
  }

  // টিকিট কোড জেনারেট
  const randNum = Math.floor(1000 + Math.random() * 9000)
  const code = `TS-2026-${randNum}`

  const res = await c.env.DB.prepare(`
    INSERT INTO teacher_tickets 
      (ticket_code, user_id, teacher_id, subject, education_level, topic, question, attachment_url, urgency, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `).bind(code, user.id, teacherId, subject, educationLevel, topic || subject, question, attachmentUrl, urgency).run()

  const ticketId = res.meta.last_row_id

  // প্রাথমিক মেসেজ সিস্টেমে যুক্ত করা
  await c.env.DB.prepare(`
    INSERT INTO teacher_messages (ticket_id, sender_type, sender_id, sender_name, message, attachment_url)
    VALUES (?, 'student', ?, ?, ?, ?)
  `).bind(ticketId, user.id, user.name_bn, question, attachmentUrl).run()

  return c.json({ 
    ok: true, 
    message: 'আপনার প্রশ্নটি সফলভাবে জমা নেওয়া হয়েছে। খুব শীঘ্রই শিক্ষক বা এডমিন সমাধান প্রদান করবেন।', 
    ticket_code: code, 
    id: ticketId,
    ticket: { id: ticketId, ticket_code: code }
  })
})

// ৫. সমাধানের রেটিং ও ফিডব্যাক দেওয়া
teacherSupport.post('/rate/:id', requireAuth, async (c) => {
  const user = c.get('user')!
  const id = Number(c.req.param('id'))
  const body = await c.req.json<any>().catch(() => null)
  const rating = Math.min(5, Math.max(1, Number(body?.rating || 5)))
  const feedback = String(body?.feedback || '').trim()

  const ticket: any = await c.env.DB.prepare('SELECT id, teacher_id FROM teacher_tickets WHERE id = ? AND user_id = ?').bind(id, user.id).first()
  if (!ticket) return c.json({ ok: false, error: 'টিকিট পাওয়া যায়নি' }, 404)

  await c.env.DB.prepare(`
    UPDATE teacher_tickets SET rating = ?, user_feedback = ? WHERE id = ?
  `).bind(rating, feedback, id).run()

  // শিক্ষকের গড় রেটিং আপডেট
  if (ticket.teacher_id) {
    const avg: any = await c.env.DB.prepare(`
      SELECT AVG(rating) as avg_r FROM teacher_tickets WHERE teacher_id = ? AND rating > 0
    `).bind(ticket.teacher_id).first()
    if (avg?.avg_r) {
      await c.env.DB.prepare('UPDATE teachers SET rating = ? WHERE id = ?').bind(Math.round(avg.avg_r * 100) / 100, ticket.teacher_id).run()
    }
  }

  return c.json({ ok: true, message: 'রেটিং জমা হয়েছে। আপনার মতামতের জন্য ধন্যবাদ!' })
})

// ৬. লাইভ ১-অন-১ কনসাল্টেশন স্লট বুকিং
teacherSupport.post('/book-consultation', requireAuth, async (c) => {
  const user = c.get('user')!
  const plan = await getUserPlan(c.env.DB, user.id)
  
  if (plan !== 'premium' && user.role !== 'admin') {
    return c.json({ 
      ok: false, 
      error: '১-অন-১ লাইভ শিক্ষক কনসাল্টেশন বুকিং শুধুমাত্র "প্রিমিয়াম" সাবস্ক্রাইবারদের জন্য উন্মুক্ত।',
      need_upgrade: true 
    }, 403)
  }

  const body = await c.req.json<any>().catch(() => null)
  const teacherId = Number(body?.teacher_id || 1)
  const topic = String(body?.topic || '').trim()
  const preferredDate = String(body?.preferred_date || '').trim()
  const preferredTime = String(body?.preferred_time || '').trim()
  const note = String(body?.note || '').trim()

  if (!topic || !preferredDate || !preferredTime) {
    return c.json({ ok: false, error: 'বিষয়, তারিখ এবং সময় উল্লেখ করুন' }, 400)
  }

  await c.env.DB.prepare(`
    INSERT INTO teacher_consultations (user_id, teacher_id, topic, preferred_date, preferred_time, note, status)
    VALUES (?, ?, ?, ?, ?, ?, 'requested')
  `).bind(user.id, teacherId, topic, preferredDate, preferredTime, note).run()

  return c.json({ ok: true, message: 'আপনার লাইভ কনসাল্টেশন স্লট অনুরোধ গ্রহণ করা হয়েছে। শিক্ষক অনুমোদনের পর ভিডিও কল রুমে যোগ দিতে পারবেন।' })
})

// ৭. আমার কনসাল্টেশন স্লটসমূহ
teacherSupport.get('/my-consultations', requireAuth, async (c) => {
  const user = c.get('user')!
  const rows = await c.env.DB.prepare(`
    SELECT c.*, t.name as teacher_name, t.avatar as teacher_avatar, t.designation as teacher_designation, t.subject as teacher_subject,
           (SELECT room_code FROM teacher_video_rooms vr WHERE vr.consultation_id = c.id AND vr.status = 'active' ORDER BY vr.id DESC LIMIT 1) as active_video_room
    FROM teacher_consultations c
    JOIN teachers t ON c.teacher_id = t.id
    WHERE c.user_id = ?
    ORDER BY c.id DESC
  `).bind(user.id).all()

  return c.json({ ok: true, consultations: rows.results || [] })
})

// ৮. দ্বিমুখী চ্যাট ও মেসেজ পাঠানো (Student / Teacher / Admin SMS & Messages)
const handleGetTicketMessages = async (c: any) => {
  const ticketId = Number(c.req.param('id'))
  const user = c.get('user')!

  const ticket: any = await c.env.DB.prepare('SELECT user_id, teacher_id FROM teacher_tickets WHERE id = ?').bind(ticketId).first()
  if (!ticket) return c.json({ ok: false, error: 'টিকিট পাওয়া যায়নি' }, 404)
  if (ticket.user_id !== user.id && user.role !== 'admin' && user.role !== 'teacher' && user.role !== 'mentor') {
    return c.json({ ok: false, error: 'অনুমতি নেই' }, 403)
  }

  const msgs = await c.env.DB.prepare(`
    SELECT * FROM teacher_messages WHERE ticket_id = ? ORDER BY id ASC
  `).bind(ticketId).all()

  return c.json({ ok: true, messages: msgs.results || [] })
}

const handlePostTicketMessage = async (c: any) => {
  const ticketId = Number(c.req.param('id'))
  const user = c.get('user')!
  const body = await c.req.json().catch(() => null)
  const message = String(body?.message || '').trim()
  const attachmentUrl = String(body?.attachment_url || '').trim()

  if (!message && !attachmentUrl) {
    return c.json({ ok: false, error: 'মেসেজ বা ফাইল সংযুক্ত করুন' }, 400)
  }

  const ticket: any = await c.env.DB.prepare('SELECT user_id, teacher_id, subject, topic FROM teacher_tickets WHERE id = ?').bind(ticketId).first()
  if (!ticket) return c.json({ ok: false, error: 'টিকিট পাওয়া যায়নি' }, 404)

  const isTeacherOrAdmin = user.role === 'admin' || user.role === 'teacher' || user.role === 'mentor'
  const senderType = isTeacherOrAdmin ? (user.role === 'admin' ? 'admin' : 'teacher') : 'student'

  const res = await c.env.DB.prepare(`
    INSERT INTO teacher_messages (ticket_id, sender_type, sender_id, sender_name, message, attachment_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(ticketId, senderType, user.id, user.name_bn, message, attachmentUrl).run()

  // যদি শিক্ষক বা এডমিন রিপ্লাই দেন, স্ট্যাটাস 'answered' এবং আনসার ফিল্ড সিঙ্ক করা
  if (isTeacherOrAdmin) {
    await c.env.DB.prepare(`
      UPDATE teacher_tickets 
      SET answer = COALESCE(NULLIF(answer, ''), ?), answered_by_name = ?, answered_at = datetime('now'), status = 'answered'
      WHERE id = ?
    `).bind(message, user.name_bn, ticketId).run()
  }

  return c.json({ ok: true, message_id: res.meta.last_row_id })
}

// রুট রেজিস্ট্রেশন — ফ্রন্টএন্ডে একক/বহুবচন দুটোই ব্যবহৃত হয়, তাই দুটোতেই অ্যালিয়াস
teacherSupport.get('/ticket/:id/messages', requireAuth, handleGetTicketMessages)
teacherSupport.get('/tickets/:id/messages', requireAuth, handleGetTicketMessages)
teacherSupport.post('/ticket/:id/messages', requireAuth, handlePostTicketMessage)
teacherSupport.post('/tickets/:id/messages', requireAuth, handlePostTicketMessage)
teacherSupport.post('/tickets/:id/message', requireAuth, handlePostTicketMessage)

// ৯. লাইভ ভিডিও কল রুম তৈরি ও ম্যানেজমেন্ট (Live 1-on-1 Video Room)
teacherSupport.post('/room/create', requireAuth, async (c) => {
  const user = c.get('user')!
  const body = await c.req.json<any>().catch(() => null)
  const ticketId = body?.ticket_id ? Number(body.ticket_id) : null
  const consultationId = body?.consultation_id ? Number(body.consultation_id) : null
  const title = String(body?.title || '১-অন-১ লাইভ শিক্ষক সমাধান সেশন').trim()

  let targetUserId = user.id
  let targetUserName = user.name_bn
  let teacherId = null
  let teacherName = user.name_bn

  if (ticketId) {
    const t: any = await c.env.DB.prepare(`
      SELECT t.user_id, t.teacher_id, t.subject, t.topic, u.name_bn as student_name
      FROM teacher_tickets t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `).bind(ticketId).first()
    if (t) {
      targetUserId = t.user_id
      targetUserName = t.student_name
      teacherId = t.teacher_id
    }
  }

  // ইউনিক রুম কোড জেনারেট
  const roomCode = `edu-call-${Math.random().toString(36).substring(2, 9)}`

  await c.env.DB.prepare(`
    INSERT INTO teacher_video_rooms (room_code, ticket_id, consultation_id, teacher_id, teacher_name, user_id, user_name, title, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
  `).bind(roomCode, ticketId, consultationId, teacherId, teacherName, targetUserId, targetUserName, title).run()

  // টিকিট বা কনসাল্টেশনে মিটিং লিংক সিঙ্ক
  if (consultationId) {
    await c.env.DB.prepare(`
      UPDATE teacher_consultations SET meeting_link = ?, status = 'approved' WHERE id = ?
    `).bind(`/teacher-support?room=${roomCode}`, consultationId).run()
  }

  return c.json({ ok: true, room_code: roomCode, room_url: `/teacher-support?room=${roomCode}` })
})

teacherSupport.get('/room/:code', async (c) => {
  const code = c.req.param('code')
  const room: any = await c.env.DB.prepare(`
    SELECT * FROM teacher_video_rooms WHERE room_code = ?
  `).bind(code).first()

  if (!room) return c.json({ ok: false, error: 'ভিডিও রুম পাওয়া যায়নি' }, 404)
  return c.json({ ok: true, room })
})

teacherSupport.post('/room/:code/end', requireAuth, async (c) => {
  const code = c.req.param('code')
  await c.env.DB.prepare(`
    UPDATE teacher_video_rooms SET status = 'ended', ended_at = datetime('now') WHERE room_code = ?
  `).bind(code).run()
  return c.json({ ok: true, message: 'ভিডিও কল সফলভাবে সমাপ্ত হয়েছে।' })
})

// ১০. সলভড প্রবলেমস ব্যাংক / পাবলিক লাইব্রেরি
teacherSupport.get('/public-solutions', async (c) => {
  const subject = c.req.query('subject') || ''
  const search = c.req.query('q') || ''
  let query = `
    SELECT t.id, t.ticket_code, t.subject, t.education_level, t.topic, t.question, t.answer, t.answered_by_name, t.answered_at, t.rating,
           m.name as teacher_name, m.avatar as teacher_avatar, m.designation as teacher_designation
    FROM teacher_tickets t
    LEFT JOIN teachers m ON t.teacher_id = m.id
    WHERE t.status = 'answered' AND t.is_public = 1
  `
  const params: any[] = []
  if (subject) {
    query += ' AND t.subject = ?'
    params.push(subject)
  }
  if (search) {
    query += ' AND (t.topic LIKE ? OR t.question LIKE ? OR t.answer LIKE ?)'
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }
  query += ' ORDER BY t.rating DESC, t.id DESC LIMIT 50'

  const { results } = await c.env.DB.prepare(query).bind(...params).all()
  return c.json({ ok: true, solutions: results || [] })
})

// ================= এডমিন ও মেন্টর ম্যানেজমেন্ট এন্ডপয়েন্ট =================

// ১১. এডমিন: সকল শিক্ষক তালিকা (ম্যানেজমেন্টের জন্য)
teacherSupport.get('/admin/teachers', requireAdmin, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT t.*, u.phone as login_phone, u.user_code
    FROM teachers t
    LEFT JOIN users u ON t.user_id = u.id
    ORDER BY t.id DESC
  `).all()
  return c.json({ ok: true, teachers: results || [] })
})

// ১২. এডমিন: নতুন শিক্ষক মেন্টর আইডি তৈরি ও সেভ (Login Phone & Password সহ)
teacherSupport.post('/admin/teacher-create', requireAdmin, async (c) => {
  const body = await c.req.json<any>().catch(() => null)
  const name = String(body?.name || '').trim()
  const designation = String(body?.designation || '').trim()
  const subject = String(body?.subject || '').trim()
  const educationLevel = String(body?.education_level || 'all').trim()
  const avatar = String(body?.avatar || '').trim()
  const experienceYears = Number(body?.experience_years) || 5
  const rating = Number(body?.rating) || 4.95
  const responseTime = String(body?.response_time || '১৫-৩০ মিনিট').trim()
  const bio = String(body?.bio || '').trim()
  const phone = String(body?.phone || '').trim()
  const password = String(body?.password || '').trim()
  const isOnline = body?.is_online ? 1 : 0
  const isActive = body?.is_active !== 0 ? 1 : 0

  if (!name || !subject || !designation) {
    return c.json({ ok: false, error: 'শিক্ষকের নাম, পদবি/যোগ্যতা এবং বিষয় প্রদান করুন' }, 400)
  }

  let linkedUserId: number | null = null

  // যদি ফোন নম্বর দেওয়া হয়, তাহলে তার জন্য লগইন অ্যাকাউন্ট তৈরি বা লিংক করা
  if (phone) {
    const existingUser: any = await c.env.DB.prepare('SELECT id, role FROM users WHERE phone = ?').bind(phone).first()
    if (existingUser) {
      linkedUserId = existingUser.id
      // রোল মেন্টর বা টিচারে আপগ্রেড
      if (existingUser.role !== 'admin') {
        await c.env.DB.prepare("UPDATE users SET role = 'teacher' WHERE id = ?").bind(linkedUserId).run()
      }
      if (password) {
        const salt = randomHex(16)
        const hash = await hashPassword(password, salt)
        await c.env.DB.prepare('UPDATE users SET password_hash = ?, salt = ? WHERE id = ?').bind(hash, salt, linkedUserId).run()
      }
    } else {
      // নতুন মেন্টর ইউজার তৈরি
      const salt = randomHex(16)
      const passToUse = password || '12345678'
      const hash = await hashPassword(passToUse, salt)
      const userCode = `MENTOR-${Math.floor(1000 + Math.random() * 9000)}`

      const uRes = await c.env.DB.prepare(`
        INSERT INTO users (user_code, name_bn, phone, password_hash, salt, religion, education_level, role)
        VALUES (?, ?, ?, ?, ?, 'islam', ?, 'teacher')
      `).bind(userCode, name, phone, hash, salt, educationLevel).run()

      linkedUserId = uRes?.meta?.last_row_id ?? null
      if (linkedUserId) {
        await c.env.DB.prepare('INSERT OR IGNORE INTO wallets (user_id, balance) VALUES (?, 0)').bind(linkedUserId).run()
        await c.env.DB.prepare('INSERT OR IGNORE INTO profiles (user_id) VALUES (?)').bind(linkedUserId).run()
      }
    }
  }

  const res = await c.env.DB.prepare(`
    INSERT INTO teachers 
      (name, designation, subject, education_level, avatar, experience_years, rating, total_solved, response_time, bio, is_online, is_active, phone, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)
  `).bind(name, designation, subject, educationLevel, avatar, experienceYears, rating, responseTime, bio, isOnline, isActive, phone, linkedUserId).run()

  return c.json({ 
    ok: true, 
    id: res.meta.last_row_id, 
    message: `শিক্ষক/মেন্টর "${name}" সফলভাবে যুক্ত হয়েছেন। ${phone ? `(লগইন ফোন: ${phone})` : ''}` 
  })
})

// ১৩. এডমিন: শিক্ষক মেন্টর প্রোফাইল এডিট
teacherSupport.put('/admin/teacher/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json<any>().catch(() => null)
  if (!body) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)

  const name = String(body?.name || '').trim()
  const designation = String(body?.designation || '').trim()
  const subject = String(body?.subject || '').trim()
  const educationLevel = String(body?.education_level || 'all').trim()
  const avatar = String(body?.avatar || '').trim()
  const experienceYears = Number(body?.experience_years) || 5
  const rating = Number(body?.rating) || 4.95
  const responseTime = String(body?.response_time || '১৫-৩০ মিনিট').trim()
  const bio = String(body?.bio || '').trim()
  const phone = String(body?.phone || '').trim()
  const password = String(body?.password || '').trim()
  const isOnline = body?.is_online !== undefined ? (body.is_online ? 1 : 0) : 1
  const isActive = body?.is_active !== undefined ? (body.is_active ? 1 : 0) : 1

  await c.env.DB.prepare(`
    UPDATE teachers 
    SET name = COALESCE(NULLIF(?, ''), name),
        designation = COALESCE(NULLIF(?, ''), designation),
        subject = COALESCE(NULLIF(?, ''), subject),
        education_level = ?,
        avatar = COALESCE(NULLIF(?, ''), avatar),
        experience_years = ?,
        rating = ?,
        response_time = ?,
        bio = ?,
        is_online = ?,
        is_active = ?,
        phone = COALESCE(NULLIF(?, ''), phone)
    WHERE id = ?
  `).bind(name, designation, subject, educationLevel, avatar, experienceYears, rating, responseTime, bio, isOnline, isActive, phone, id).run()

  // পাসওয়ার্ড বা ফোন আপডেট হলে ইউজার সিঙ্ক
  if (phone && password) {
    const curTeacher: any = await c.env.DB.prepare('SELECT user_id FROM teachers WHERE id = ?').bind(id).first()
    if (curTeacher?.user_id) {
      const salt = randomHex(16)
      const hash = await hashPassword(password, salt)
      await c.env.DB.prepare('UPDATE users SET phone = ?, password_hash = ?, salt = ? WHERE id = ?').bind(phone, hash, salt, curTeacher.user_id).run()
    }
  }

  return c.json({ ok: true, message: 'শিক্ষক তথ্য আপডেট সম্পন্ন হয়েছে।' })
})

// ১৪. এডমিন: শিক্ষক প্রোফাইল ডিলিট
teacherSupport.delete('/admin/teacher/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'))
  await c.env.DB.prepare('DELETE FROM teachers WHERE id = ?').bind(id).run()
  return c.json({ ok: true, message: 'শিক্ষক প্রোফাইল মুছে ফেলা হয়েছে।' })
})

// ১৫. এডমিন: সকল ডাউট টিকিট তালিকা ও ফিল্টার
const handleGetAdminTickets = async (c: any) => {
  const status = c.req.query('status') || ''
  let query = `
    SELECT t.*, u.name_bn as user_name, u.phone as user_phone, u.user_code,
           m.name as teacher_name, m.avatar as teacher_avatar,
           (SELECT COUNT(*) FROM teacher_messages tm WHERE tm.ticket_id = t.id) as message_count,
           (SELECT room_code FROM teacher_video_rooms vr WHERE vr.ticket_id = t.id AND vr.status = 'active' ORDER BY vr.id DESC LIMIT 1) as active_video_room
    FROM teacher_tickets t
    JOIN users u ON t.user_id = u.id
    LEFT JOIN teachers m ON t.teacher_id = m.id
  `
  const params: any[] = []
  if (status) {
    query += ' WHERE t.status = ?'
    params.push(status)
  }
  query += " ORDER BY CASE WHEN t.urgency='urgent' AND t.status='pending' THEN 1 WHEN t.status='pending' THEN 2 ELSE 3 END, t.id DESC LIMIT 100"

  const { results } = await c.env.DB.prepare(query).bind(...params).all()
  return c.json({ ok: true, tickets: results || [] })
}
teacherSupport.get('/admin/tickets', requireAdmin, handleGetAdminTickets)
teacherSupport.get('/tickets', requireTeacherOrAdmin, handleGetAdminTickets)

// ১৬. এডমিন: কোনো নির্দিষ্ট শিক্ষককে টিকেট অ্যাসাইন করা
teacherSupport.put('/admin/assign-ticket/:id', requireAdmin, async (c) => {
  const ticketId = Number(c.req.param('id'))
  const body = await c.req.json<any>().catch(() => null)
  const teacherId = body?.teacher_id ? Number(body.teacher_id) : null

  await c.env.DB.prepare(`
    UPDATE teacher_tickets SET teacher_id = ? WHERE id = ?
  `).bind(teacherId, ticketId).run()

  return c.json({ ok: true, message: 'টিকিট সফলভাবে শিক্ষকের কাছে বরাদ্দ করা হয়েছে।' })
})

// ১৭. এডমিন / শিক্ষক: ডাউটের উত্তর দেওয়া
const handleAnswerTicket = async (c: any) => {
  const paramId = c.req.param('id') ? Number(c.req.param('id')) : null
  const body: any = await c.req.json().catch(() => null)
  const ticketId = paramId || Number(body?.ticket_id)
  const answer = String(body?.answer || body?.answer_text || '').trim()
  const teacherName = String(body?.teacher_name || 'এডুসব মেন্টর').trim()
  const solutionSteps = String(body?.solution_steps || '').trim()
  const videoUrl = String(body?.video_url || '').trim()
  const teacherId = body?.teacher_id ? Number(body.teacher_id) : null
  const user = c.get('user')!

  if (!ticketId || !answer) {
    return c.json({ ok: false, error: 'টিকিট আইডি এবং উত্তর প্রয়োজন' }, 400)
  }

  await c.env.DB.prepare(`
    UPDATE teacher_tickets 
    SET answer = ?, answered_by_name = ?, teacher_id = COALESCE(?, teacher_id), answered_at = datetime('now'), status = 'answered'
    WHERE id = ?
  `).bind(answer, teacherName, teacherId, ticketId).run()

  // মেসেজ থ্রেডেও উত্তর পোস্ট করা
  await c.env.DB.prepare(`
    INSERT INTO teacher_messages (ticket_id, sender_type, sender_id, sender_name, message)
    VALUES (?, 'teacher', ?, ?, ?)
  `).bind(ticketId, user.id, teacherName, answer).run()

  if (teacherId) {
    await c.env.DB.prepare('UPDATE teachers SET total_solved = total_solved + 1 WHERE id = ?').bind(teacherId).run()
  }

  return c.json({ ok: true, message: 'সমাধান সফলভাবে প্রকাশ করা হয়েছে।' })
}
teacherSupport.post('/admin/answer', requireTeacherOrAdmin, handleAnswerTicket)
teacherSupport.put('/tickets/:id/answer', requireTeacherOrAdmin, handleAnswerTicket)
teacherSupport.post('/tickets/:id/answer', requireTeacherOrAdmin, handleAnswerTicket)

// ১৮. এডমিন: কনসাল্টেশন স্লট আপডেট (অ্যাপ্রুভ ও ভিডিও লিংক প্রদান)
teacherSupport.post('/admin/slot-action', requireAdmin, async (c) => {
  const body = await c.req.json<any>().catch(() => null)
  const slotId = Number(body?.slot_id)
  const status = String(body?.status || 'approved')
  const meetingLink = String(body?.meeting_link || '').trim()
  const note = String(body?.note || '').trim()

  await c.env.DB.prepare(`
    UPDATE teacher_consultations 
    SET status = ?, meeting_link = COALESCE(NULLIF(?, ''), meeting_link), note = ?
    WHERE id = ?
  `).bind(status, meetingLink, note, slotId).run()

  return c.json({ ok: true, message: 'কনসাল্টেশন স্লট স্ট্যাটাস আপডেট সম্পন্ন।' })
})

export default teacherSupport

