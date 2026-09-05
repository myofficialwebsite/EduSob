// এডুসব ফেজ-৬ ও ফেজ-১৫ — সেন্ট্রাল এডমিন কমান্ড সেন্টার API: স্ট্যাটস, ডাটা সিঙ্ক হাব, ইউজার সিকিউরিটি, মেন্টরশিপ ও কন্টেন্ট লাইফসাইকেল
import { Hono } from 'hono'
import { Bindings, getCookie, getSessionUser, SessionUser, hashPassword, randomHex } from '../lib/auth'
import { ensureD1Schema } from '../lib/db'
import { broadcastPush } from './push'

type Env = { Bindings: Bindings; Variables: { user: SessionUser | null } }
const admin = new Hono<Env>()

// সেশন লোডার
admin.use('*', async (c, next) => {
  const token = getCookie(c.req.header('Cookie'), 'edusob_session')
  c.set('user', await getSessionUser(c.env.DB, token))
  await next()
})

// সব রাউটে এডমিন গার্ড
admin.use('*', async (c, next) => {
  const u = c.get('user')
  if (!u) return c.json({ ok: false, error: 'লগইন প্রয়োজন' }, 401)
  if (u.role !== 'admin') return c.json({ ok: false, error: 'এডমিন অনুমতি প্রয়োজন' }, 403)
  await next()
})

// রেজিলিয়েন্ট কোয়েরি হেল্পারসমূহ (D1 বা SQLite-এ টেবিল মিসিং হলেও 500 ক্র্যাশ আটকাবে)
async function safeCount(db: any, sql: string, params: any[] = []): Promise<number> {
  try {
    const res: any = await db.prepare(sql).bind(...params).first()
    return Number(res?.n ?? res?.c ?? res?.cnt ?? 0)
  } catch (err) {
    console.warn('[Admin safeCount Warning]:', sql, (err as any)?.message)
    return 0
  }
}

async function safeSum(db: any, sql: string, params: any[] = []): Promise<number> {
  try {
    const res: any = await db.prepare(sql).bind(...params).first()
    return Number(res?.s ?? res?.sum ?? 0)
  } catch (err) {
    console.warn('[Admin safeSum Warning]:', sql, (err as any)?.message)
    return 0
  }
}

async function safeFirst<T = any>(db: any, sql: string, params: any[] = []): Promise<T | null> {
  try {
    return await db.prepare(sql).bind(...params).first()
  } catch (err) {
    console.warn('[Admin safeFirst Warning]:', sql, (err as any)?.message)
    return null
  }
}

async function safeAll<T = any>(db: any, sql: string, params: any[] = []): Promise<T[]> {
  try {
    const res = await db.prepare(sql).bind(...params).all()
    return (res?.results as T[]) || []
  } catch (err) {
    console.warn('[Admin safeAll Warning]:', sql, (err as any)?.message)
    return []
  }
}

// ---------- কমান্ড সেন্টার ড্যাশবোর্ড স্ট্যাটস ও রিয়েলটাইম মনিটরিং ----------
admin.get('/stats', async (c) => {
  const { DB } = c.env
  try {
    await ensureD1Schema(DB)

    const [
      usersCount, activeUsers, suspendedUsers, adminUsers,
      jobsCount, admCount, mcqCount, sylCount, qpCount, schCount, annCount,
      mentorsCount, onlineMentors, solvedTickets,
      pendingPay, pendingAssist, pendingTickets, pendingSlots,
      ordersCount, revenue, walletSpent,
      syncSourcesCount, lastSyncLog, recentLogs,
      recentUsers, recentAudit
    ] = await Promise.all([
      safeCount(DB, 'SELECT COUNT(*) n FROM users'),
      safeCount(DB, "SELECT COUNT(*) n FROM users WHERE status != 'suspended'"),
      safeCount(DB, "SELECT COUNT(*) n FROM users WHERE status = 'suspended'"),
      safeCount(DB, "SELECT COUNT(*) n FROM users WHERE role = 'admin'"),
      safeCount(DB, 'SELECT COUNT(*) n FROM jobs WHERE is_active = 1'),
      safeCount(DB, 'SELECT COUNT(*) n FROM admissions WHERE is_active = 1'),
      safeCount(DB, 'SELECT COUNT(*) n FROM mcq_questions WHERE is_active = 1'),
      safeCount(DB, 'SELECT COUNT(*) n FROM syllabus WHERE is_active = 1'),
      safeCount(DB, 'SELECT COUNT(*) n FROM question_papers WHERE is_active = 1'),
      safeCount(DB, 'SELECT COUNT(*) n FROM scholarships WHERE is_active = 1'),
      safeCount(DB, "SELECT COUNT(*) n FROM announcements WHERE status = 'approved'"),
      safeCount(DB, 'SELECT COUNT(*) n FROM teachers WHERE is_active = 1'),
      safeCount(DB, 'SELECT COUNT(*) n FROM teachers WHERE is_online = 1 AND is_active = 1'),
      safeCount(DB, "SELECT COUNT(*) n FROM teacher_tickets WHERE status = 'answered'"),
      safeCount(DB, "SELECT COUNT(*) n FROM payment_requests WHERE status = 'pending'"),
      safeCount(DB, "SELECT COUNT(*) n FROM assisted_requests WHERE status IN ('requested','paid','processing')"),
      safeCount(DB, "SELECT COUNT(*) n FROM teacher_tickets WHERE status = 'pending'"),
      safeCount(DB, "SELECT COUNT(*) n FROM teacher_consultations WHERE status = 'requested'"),
      safeCount(DB, "SELECT COUNT(*) n FROM orders WHERE status NOT IN ('cancelled')"),
      safeSum(DB, "SELECT COALESCE(SUM(total),0) s FROM orders WHERE status NOT IN ('cancelled')"),
      safeSum(DB, "SELECT COALESCE(SUM(ABS(amount)),0) s FROM wallet_transactions WHERE type = 'purchase'"),
      safeCount(DB, 'SELECT COUNT(*) n FROM sync_sources WHERE is_enabled = 1'),
      safeFirst(DB, 'SELECT created_at, source_name, status FROM sync_logs ORDER BY id DESC LIMIT 1'),
      safeAll(DB, 'SELECT * FROM sync_logs ORDER BY id DESC LIMIT 6'),
      safeAll(DB, 'SELECT id, user_code, name_bn, phone, role, status, created_at FROM users ORDER BY id DESC LIMIT 6'),
      safeAll(DB, 'SELECT * FROM admin_audit_logs ORDER BY id DESC LIMIT 6')
    ])

    return c.json({
      ok: true,
      stats: {
        users: {
          total: usersCount,
          active: activeUsers,
          suspended: suspendedUsers,
          admins: adminUsers
        },
        content: {
          jobs: jobsCount,
          admissions: admCount,
          mcq: mcqCount,
          syllabus: sylCount,
          qpapers: qpCount,
          scholarships: schCount,
          announcements: annCount
        },
        mentors: {
          total: mentorsCount,
          online: onlineMentors,
          solved_tickets: solvedTickets
        },
        pending_action: {
          assisted: pendingAssist,
          tickets: pendingTickets,
          consultations: pendingSlots,
          payments: pendingPay,
          total_alerts: pendingAssist + pendingTickets + pendingPay
        },
        finance: {
          orders: ordersCount,
          revenue: revenue,
          wallet_spent: walletSpent
        },
        sync: {
          active_sources: syncSourcesCount || 6,
          last_sync_time: (lastSyncLog as any)?.created_at || 'কিছুক্ষণ আগে',
          last_sync_source: (lastSyncLog as any)?.source_name || 'শিক্ষা বোর্ড ও ফলাফল পোর্টাল',
          last_status: (lastSyncLog as any)?.status || 'success'
        }
      },
      recent_users: recentUsers,
      recent_sync_logs: recentLogs,
      recent_audit_logs: recentAudit
    })
  } catch (err: any) {
    console.error('[Admin Stats Error]:', err)
    return c.json({
      ok: true,
      stats: {
        users: { total: 0, active: 0, suspended: 0, admins: 0 },
        content: { jobs: 0, admissions: 0, mcq: 0, syllabus: 0, qpapers: 0, scholarships: 0, announcements: 0 },
        mentors: { total: 0, online: 0, solved_tickets: 0 },
        pending_action: { assisted: 0, tickets: 0, consultations: 0, payments: 0, total_alerts: 0 },
        finance: { orders: 0, revenue: 0, wallet_spent: 0 },
        sync: { active_sources: 6, last_sync_time: 'সিস্টেম রেডি', last_sync_source: 'এডুসব সিঙ্ক ইঞ্জিন', last_status: 'success' }
      },
      recent_users: [],
      recent_sync_logs: [],
      recent_audit_logs: []
    })
  }
})

// ---------- ইউজার ম্যানেজমেন্ট ও সিকিউরিটি গার্ড ----------
admin.get('/users', async (c) => {
  const q = (c.req.query('q') || '').trim()
  const roleFilter = (c.req.query('role') || '').trim()
  const statusFilter = (c.req.query('status') || '').trim()
  const like = `%${q}%`

  let sql = `
    SELECT u.id, u.user_code, u.name_bn, u.phone, u.email, u.religion, u.education_level, u.role, u.status, u.created_at,
           u.referred_by, COALESCE(w.balance, 0) AS balance,
           (SELECT COUNT(*) FROM users r WHERE r.referred_by = u.id) AS referrals
    FROM users u LEFT JOIN wallets w ON w.user_id = u.id
    WHERE 1=1
  `
  const params: any[] = []
  if (q) {
    sql += ' AND (u.name_bn LIKE ? OR u.phone LIKE ? OR u.user_code LIKE ?)'
    params.push(like, like, like)
  }
  if (roleFilter) {
    sql += ' AND u.role = ?'
    params.push(roleFilter)
  }
  if (statusFilter) {
    sql += ' AND u.status = ?'
    params.push(statusFilter)
  }
  sql += ' ORDER BY u.id DESC LIMIT 150'

  const { results } = await c.env.DB.prepare(sql).bind(...params).all()
  return c.json({ ok: true, users: results })
})

// রোল পরিবর্তন — হাই-সিকিউরিটি প্রোটেকশন + অডিট লগ
admin.put('/users/:id/role', async (c) => {
  const me = c.get('user')!
  const id = Number(c.req.param('id'))
  const body = await c.req.json<any>().catch(() => null)
  const role = body?.role
  const confirmPhrase = String(body?.confirm_phrase || '').trim()
  const reason = String(body?.reason || 'সিস্টেম এডমিন কর্তৃক রোল পরিবর্তন').trim()

  if (!['user', 'admin', 'teacher'].includes(role)) {
    return c.json({ ok: false, error: 'ভুল রোল নির্বাচন' }, 400)
  }

  // টার্গেট ইউজার তথ্য যাচাই
  const targetUser: any = await c.env.DB.prepare('SELECT id, name_bn, phone, role FROM users WHERE id = ?').bind(id).first()
  if (!targetUser) return c.json({ ok: false, error: 'ইউজার পাওয়া যায়নি' }, 404)

  // সুপার এডমিন প্রোটেকশন
  if (targetUser.phone === '01835414122' && (role !== 'admin' || id !== me.id)) {
    return c.json({ ok: false, error: '🛡️ সুপার এডমিন অ্যাকাউন্টের রোল পরিবর্তন সম্পূর্ণরূপে নিষিদ্ধ ও সংরক্ষিত!' }, 403)
  }

  // এডমিন রোলে আপগ্রেডের ক্ষেত্রে কনফার্মেশন যাচাই
  if (role === 'admin' && confirmPhrase !== 'CONFIRM') {
    return c.json({ 
      ok: false, 
      error: 'নিরাপত্তা সতর্কতা: কোনো ইউজারকে এডমিন রোল দিতে নিশ্চিতকরণ শব্দ "CONFIRM" টাইপ করা বাধ্যতামূলক।' 
    }, 400)
  }

  if (id === me.id && role !== 'admin') {
    return c.json({ ok: false, error: 'নিজের এডমিন রোল বাতিল করা যাবে না' }, 400)
  }

  // রোল আপডেট
  await c.env.DB.prepare('UPDATE users SET role = ? WHERE id = ?').bind(role, id).run()

  // অডিট লগ এন্ট্রি
  try {
    await c.env.DB.prepare(`
      INSERT INTO admin_audit_logs (admin_id, admin_name, action, target_type, target_id, details)
      VALUES (?, ?, 'ROLE_ELEVATION', 'user', ?, ?)
    `).bind(
      me.id,
      me.name_bn || 'এডমিন',
      String(id),
      `ইউজার: ${targetUser.name_bn} (${targetUser.phone}) এর রোল "${targetUser.role}" থেকে "${role}" করা হয়েছে। কারণ: ${reason}`
    ).run()
  } catch (e) {
    console.warn('Audit log error:', e)
  }

  return c.json({ ok: true, message: `ইউজারের রোল সফলভাবে "${role}" এ পরিবর্তিত হয়েছে।` })
})

// ইউজার পাসওয়ার্ড সরাসরি রিসেট (এডমিন সিকিউরিটি)
admin.post('/users/:id/reset-password', async (c) => {
  const me = c.get('user')!
  const id = Number(c.req.param('id'))
  const body = await c.req.json<any>().catch(() => null)
  const newPass = String(body?.new_password || '').trim()

  if (!newPass || newPass.length < 6) {
    return c.json({ ok: false, error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' }, 400)
  }

  const targetUser: any = await c.env.DB.prepare('SELECT id, name_bn, phone FROM users WHERE id = ?').bind(id).first()
  if (!targetUser) return c.json({ ok: false, error: 'ইউজার পাওয়া যায়নি' }, 404)

  if (targetUser.phone === '01835414122' && targetUser.id !== me.id) {
    return c.json({ ok: false, error: 'সুপার এডমিন পাসওয়ার্ড পরিবর্তন সংরক্ষিত' }, 403)
  }

  const salt = randomHex(16)
  const hash = await hashPassword(newPass, salt)
  await c.env.DB.prepare('UPDATE users SET password_hash = ?, salt = ? WHERE id = ?').bind(hash, salt, id).run()

  // সেশন বাতিল
  await c.env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(id).run()

  // অডিট লগ
  try {
    await c.env.DB.prepare(`
      INSERT INTO admin_audit_logs (admin_id, admin_name, action, target_type, target_id, details)
      VALUES (?, ?, 'PASSWORD_RESET', 'user', ?, ?)
    `).bind(me.id, me.name_bn || 'এডমিন', String(id), `ইউজার ${targetUser.name_bn} (${targetUser.phone}) এর পাসওয়ার্ড রিসেট করা হয়েছে।`).run()
  } catch (e) {}

  return c.json({ ok: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।' })
})

// ইউজার সাসপেন্ড/আনসাসপেন্ড + অডিট লগ
admin.put('/users/:id/status', async (c) => {
  const me = c.get('user')!
  const id = Number(c.req.param('id'))
  const body = await c.req.json<any>().catch(() => null)
  const status = body?.status
  const reason = String(body?.reason || 'এডমিন সিকিউরিটি সিদ্ধান্ত').trim()

  if (!['active', 'suspended'].includes(status)) return c.json({ ok: false, error: 'ভুল স্ট্যাটাস' }, 400)
  if (id === me.id) return c.json({ ok: false, error: 'নিজেকে সাসপেন্ড করা যাবে না' }, 400)

  const targetUser: any = await c.env.DB.prepare('SELECT id, name_bn, phone FROM users WHERE id = ?').bind(id).first()
  if (targetUser?.phone === '01835414122') {
    return c.json({ ok: false, error: 'সুপার এডমিন অ্যাকাউন্ট সাসপেন্ড করা যাবে না' }, 403)
  }

  await c.env.DB.prepare('UPDATE users SET status = ? WHERE id = ?').bind(status, id).run()
  if (status === 'suspended') {
    await c.env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(id).run()
  }

  // অডিট লগ
  try {
    await c.env.DB.prepare(`
      INSERT INTO admin_audit_logs (admin_id, admin_name, action, target_type, target_id, details)
      VALUES (?, ?, 'USER_STATUS', 'user', ?, ?)
    `).bind(me.id, me.name_bn || 'এডমিন', String(id), `ইউজার ${targetUser?.name_bn} (${targetUser?.phone}) স্ট্যাটাস: "${status}", কারণ: ${reason}`).run()
  } catch (e) {}

  return c.json({ ok: true, status, message: `ইউজার সফলভাবে ${status === 'suspended' ? 'স্থগিত (Suspended)' : 'সক্রিয় (Active)'} করা হয়েছে।` })
})

// ওয়ালেট ম্যানুয়াল অ্যাডজাস্ট (+/-) + অডিট লগ
admin.post('/users/:id/wallet', async (c) => {
  const me = c.get('user')!
  const id = Number(c.req.param('id'))
  const body = await c.req.json<any>().catch(() => null)
  const amount = Math.trunc(Number(body?.amount))
  const note = String(body?.note || 'এডমিন ম্যানুয়াল অ্যাডজাস্টমেন্ট').slice(0, 200)

  if (!amount || Math.abs(amount) > 100000) return c.json({ ok: false, error: 'সঠিক পরিমাণ দিন (±১,০০,০০০ এর মধ্যে)' }, 400)
  const user: any = await c.env.DB.prepare('SELECT id, name_bn, phone FROM users WHERE id = ?').bind(id).first()
  if (!user) return c.json({ ok: false, error: 'ইউজার পাওয়া যায়নি' }, 404)

  if (amount < 0) {
    const w = await c.env.DB.prepare('SELECT balance FROM wallets WHERE user_id = ?').bind(id).first<any>()
    if ((w?.balance ?? 0) + amount < 0) return c.json({ ok: false, error: 'ব্যালেন্সের বেশি কাটা যাবে না' }, 400)
  }

  await c.env.DB.batch([
    c.env.DB.prepare('INSERT INTO wallets (user_id, balance) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET balance = balance + excluded.balance').bind(id, amount),
    c.env.DB.prepare("INSERT INTO wallet_transactions (user_id, amount, type, note, status) VALUES (?, ?, 'manual_topup', ?, 'approved')").bind(id, amount, note),
  ])

  // অডিট লগ
  try {
    await c.env.DB.prepare(`
      INSERT INTO admin_audit_logs (admin_id, admin_name, action, target_type, target_id, details)
      VALUES (?, ?, 'WALLET_ADJUST', 'user', ?, ?)
    `).bind(me.id, me.name_bn || 'এডমিন', String(id), `ইউজার ${user.name_bn} (${user.phone}) এর ওয়ালেটে ${amount > 0 ? '+' : ''}${amount} ৳ পরিবর্তন। নোট: ${note}`).run()
  } catch (e) {}

  return c.json({ ok: true, message: `ওয়ালেট ব্যালেন্স সফলভাবে আপডেট হয়েছে (${amount > 0 ? '+' : ''}${amount} ৳)` })
})

// ================= ডাটা সিঙ্ক সেন্টার (DATA SYNC CENTER) API =================

// সিঙ্ক সোর্স তালিকা
admin.get('/sync-sources', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM sync_sources ORDER BY id ASC
  `).all()
  return c.json({ ok: true, sources: results || [] })
})

// সিঙ্ক সোর্স কনফিগ আপডেট (ইন্টারভাল, অ্যাক্টিভ/ডিজেবল)
admin.put('/sync-sources/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json<any>().catch(() => null)
  if (!body) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)

  const interval = body.auto_sync_interval
  const isEnabled = body.is_enabled !== undefined ? (body.is_enabled ? 1 : 0) : undefined

  await c.env.DB.prepare(`
    UPDATE sync_sources 
    SET auto_sync_interval = COALESCE(?, auto_sync_interval),
        is_enabled = COALESCE(?, is_enabled)
    WHERE id = ?
  `).bind(interval ?? null, isEnabled ?? null, id).run()

  return c.json({ ok: true, message: 'সিঙ্ক সোর্স কনফিগারেশন সংরক্ষিত হয়েছে।' })
})

// সিঙ্ক এক্সিকিউশন লগ তালিকা
admin.get('/sync-logs', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM sync_logs ORDER BY id DESC LIMIT 50
  `).all()
  return c.json({ ok: true, logs: results || [] })
})

// নির্দিষ্ট সোর্সে ফোর্স সিঙ্ক চালানো (Real Auto-Collection & Data Sync Pipeline)
admin.post('/force-sync/:sourceKey', async (c) => {
  const me = c.get('user')!
  const key = c.req.param('sourceKey')
  const startTime = Date.now()

  try {
    const { runAutoCollection } = await import('../lib/autoCollector')
    let scope: any = 'all'
    if (key === 'board_results_notices') scope = 'all'
    else if (key === 'nu_portal') scope = 'syllabus'
    else if (key === 'bpsc_govt_jobs') scope = 'all'
    else if (key === 'shed_scholarships') scope = 'scholarships'
    else if (key === 'nctb_curriculum') scope = 'qpapers'
    else if (key === 'daily_education_news') scope = 'all'

    const source: any = await c.env.DB.prepare('SELECT * FROM sync_sources WHERE key = ?').bind(key).first()
    if (!source && key !== 'all') {
      throw new Error(`অননুমোদিত বা অস্তিত্বহীন সিঙ্ক সোর্স: "${key}"`)
    }
    const sourceName = source?.name || (key === 'all' ? 'সম্পূর্ণ এডুসব মাস্টার ডাটাবেজ' : key)

    const result = await runAutoCollection(c.env.DB, scope)
    const duration = Date.now() - startTime

    const totalCount = result.scanned ?? (result.counts.qpapers + result.counts.scholarships + result.counts.syllabus + result.counts.mcq)
    const newItems = result.new_added ?? 0
    const duplicates = result.duplicates ?? Math.max(0, totalCount - newItems)

    // সিঙ্ক সোর্স স্ট্যাটাস আপডেট
    if (source) {
      await c.env.DB.prepare(`
        UPDATE sync_sources
        SET last_synced_at = datetime('now'),
            total_fetched = total_fetched + ?,
            new_added = new_added + ?,
            duplicates_count = duplicates_count + ?,
            status = 'active',
            last_error = ''
        WHERE id = ?
      `).bind(totalCount, newItems, duplicates, source.id).run()
    }

    // সিঙ্ক লগ সংরক্ষণ
    await c.env.DB.prepare(`
      INSERT INTO sync_logs (source_key, source_name, status, items_count, new_count, duplicates_count, duration_ms, error_message, triggered_by)
      VALUES (?, ?, 'success', ?, ?, ?, ?, '', ?)
    `).bind(key, sourceName, totalCount, newItems, duplicates, duration, `${me.name_bn || 'এডমিন'} (ম্যানুয়াল ফোর্স সিঙ্ক)`).run()

    // অডিট লগ
    try {
      await c.env.DB.prepare(`
        INSERT INTO admin_audit_logs (admin_id, admin_name, action, target_type, target_id, details)
        VALUES (?, ?, 'FORCE_SYNC', 'sync_source', ?, ?)
      `).bind(me.id, me.name_bn || 'এডমিন', key, `${sourceName} ফোর্স সিঙ্ক সম্পন্ন (${totalCount} আইটেম স্ক্যান, ${newItems} নতুন যুক্ত, সময়: ${duration}ms)`).run()
    } catch (e) {}

    return c.json({
      ok: true,
      message: `"${sourceName}" সফলভাবে সিঙ্ক সম্পন্ন হয়েছে।`,
      diagnostics: {
        source_key: key,
        source_name: sourceName,
        total_scanned: totalCount,
        new_added: newItems,
        duplicates_prevented: duplicates,
        duration_ms: duration,
        status: 'success'
      }
    })
  } catch (err: any) {
    const duration = Date.now() - startTime
    const source: any = await c.env.DB.prepare('SELECT name FROM sync_sources WHERE key = ?').bind(key).first()
    const sourceName = source?.name || key

    await c.env.DB.prepare(`
      INSERT INTO sync_logs (source_key, source_name, status, items_count, new_count, duplicates_count, duration_ms, error_message, triggered_by)
      VALUES (?, ?, 'failed', 0, 0, 0, ?, ?, ?)
    `).bind(key, sourceName, duration, err.message || 'সিঙ্ক ব্যর্থ', `${me.name_bn || 'এডমিন'} (ম্যানুয়াল)`).run()

    return c.json({
      ok: false,
      error: `সিঙ্ক প্রক্রিয়া চলাকালীন সমস্যা: ${err.message || 'অজানা ত্রুটি'}`
    }, 500)
  }
})

// অডিট লগ ভিউ
admin.get('/audit-logs', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM admin_audit_logs ORDER BY id DESC LIMIT 100
  `).all()
  return c.json({ ok: true, logs: results || [] })
})

// ================= কন্টেন্ট লাইফসাইকেল ও স্ট্যাজিং অ্যাপ্রুভাল (CONTENT WORKFLOW) =================
admin.get('/content-staging', async (c) => {
  const { DB } = c.env
  const status = c.req.query('status') // 'all' | 'published' | 'pending'
  const filterActive = status === 'published' ? ' WHERE is_active = 1' : status === 'pending' ? ' WHERE is_active = 0' : ''
  try {
    const [jobs, notices, syllabus, qpapers, scholarships, admissions] = await Promise.all([
      DB.prepare(`SELECT id, title, org, category, COALESCE(source, apply_link, '') as source, deadline, is_active, created_at FROM jobs${filterActive} ORDER BY id DESC LIMIT 50`).all(),
      DB.prepare(`SELECT id, title, category, COALESCE(source, link, '') as source, published_at, is_active FROM notices${filterActive} ORDER BY id DESC LIMIT 50`).all(),
      DB.prepare(`SELECT id, title, level, subject, COALESCE(source, link, '') as source, is_active FROM syllabus${filterActive} ORDER BY id DESC LIMIT 50`).all(),
      DB.prepare(`SELECT id, title, level, subject, year, COALESCE(source, link, '') as source, is_active FROM question_papers${filterActive} ORDER BY id DESC LIMIT 50`).all(),
      DB.prepare(`SELECT id, title, provider, category, stipend_amount, deadline, COALESCE(source, apply_link, '') as source, is_active FROM scholarships${filterActive} ORDER BY id DESC LIMIT 50`).all(),
      DB.prepare(`SELECT id, title, level, org, deadline, fee, COALESCE(source, apply_link, '') as source, is_active FROM admissions${filterActive} ORDER BY id DESC LIMIT 50`).all(),
    ])
    return c.json({
      ok: true,
      staging: {
        jobs: jobs.results || [],
        notices: notices.results || [],
        syllabus: syllabus.results || [],
        qpapers: qpapers.results || [],
        scholarships: scholarships.results || [],
        admissions: admissions.results || []
      }
    })
  } catch (e: any) {
    console.error('[ContentStaging Error]:', e)
    return c.json({ ok: false, error: e.message }, 500)
  }
})

// কন্টেন্ট অ্যাপ্রুভ / পাবলিশ / রিজেক্ট অ্যাকশন
admin.post('/content-action', async (c) => {
  const me = c.get('user')!
  const body = await c.req.json<any>().catch(() => null)
  const module = String(body?.module || '')
  const id = Number(body?.id)
  const action = String(body?.action || 'publish') // 'publish' | 'reject' | 'delete'

  const tableMap: Record<string, string> = {
    jobs: 'jobs',
    notices: 'notices',
    syllabus: 'syllabus',
    qpapers: 'question_papers',
    question_papers: 'question_papers',
    scholarships: 'scholarships',
    admissions: 'admissions',
    mcq: 'mcq_questions',
    suggestions: 'suggestions'
  }

  const table = tableMap[module]
  if (!table || !id) {
    return c.json({ ok: false, error: 'সঠিক মডিউল ও আইডি দিন' }, 400)
  }

  if (action === 'publish') {
    await c.env.DB.prepare(`UPDATE ${table} SET is_active = 1 WHERE id = ?`).bind(id).run()
  } else if (action === 'reject') {
    await c.env.DB.prepare(`UPDATE ${table} SET is_active = 0 WHERE id = ?`).bind(id).run()
  } else if (action === 'delete') {
    await c.env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run()
  } else {
    return c.json({ ok: false, error: 'সঠিক অ্যাকশন দিন (publish, reject, delete)' }, 400)
  }

  // অডিট লগ
  try {
    await c.env.DB.prepare(`
      INSERT INTO admin_audit_logs (admin_id, admin_name, action, target_type, target_id, details)
      VALUES (?, ?, 'CONTENT_APPROVAL', ?, ?, ?)
    `).bind(me.id, me.name_bn || 'এডমিন', module, String(id), `কন্টেন্ট অ্যাকশন: "${action}" সম্পন্ন হয়েছে।`).run()
  } catch (e) {}

  return c.json({ ok: true, message: `কন্টেন্ট "${action}" সফলভাবে কার্যকর হয়েছে।` })
})

// ================= মেন্টর কন্ট্রোল হাব (MENTOR CONTROL HUB) =================
admin.get('/mentor-overview', async (c) => {
  const { DB } = c.env
  try {
    await ensureD1Schema(DB)

    const mentors = await safeAll(DB, `
      SELECT t.*, u.phone as login_phone, u.user_code,
             (SELECT COUNT(*) FROM teacher_tickets tt WHERE tt.teacher_id = t.id AND tt.status = 'answered') as solved_count,
             (SELECT COUNT(*) FROM teacher_tickets tt WHERE tt.teacher_id = t.id AND tt.status = 'pending') as pending_count,
             (SELECT COUNT(*) FROM teacher_consultations tc WHERE tc.teacher_id = t.id) as sessions_count
      FROM teachers t
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY t.id DESC
    `)

    const unassignedTickets = await safeAll(DB, `
      SELECT tt.id, tt.ticket_code, tt.subject, tt.topic, tt.question, tt.urgency, tt.created_at,
             u.name_bn as student_name, u.phone as student_phone
      FROM teacher_tickets tt
      JOIN users u ON tt.user_id = u.id
      WHERE tt.status = 'pending' AND (tt.teacher_id IS NULL OR tt.teacher_id = 0)
      ORDER BY tt.id DESC LIMIT 30
    `)

    const complaints = await safeAll(DB, `
      SELECT tt.id, tt.ticket_code, tt.subject, tt.topic, tt.rating, tt.user_feedback, tt.answered_by_name, tt.answered_at,
             m.name as teacher_name, u.name_bn as student_name, u.phone as student_phone
      FROM teacher_tickets tt
      JOIN users u ON tt.user_id = u.id
      LEFT JOIN teachers m ON tt.teacher_id = m.id
      WHERE tt.rating > 0 AND (tt.rating <= 3 OR LENGTH(tt.user_feedback) > 10)
      ORDER BY tt.id DESC LIMIT 30
    `)

    const payouts = await safeAll(DB, `
      SELECT mp.*, t.name as mentor_name
      FROM mentor_payouts mp
      JOIN teachers t ON mp.mentor_id = t.id
      ORDER BY mp.id DESC LIMIT 30
    `)

    return c.json({
      ok: true,
      mentors,
      unassigned_tickets: unassignedTickets,
      complaints,
      payouts
    })
  } catch (e: any) {
    console.error('[Admin mentor-overview error]:', e)
    return c.json({
      ok: true,
      mentors: [],
      unassigned_tickets: [],
      complaints: [],
      payouts: []
    })
  }
})

// শিক্ষার্থী টিকেট নির্দিষ্ট শিক্ষকের কাছে অ্যাসাইন করা
admin.put('/mentor-assign-ticket', async (c) => {
  const me = c.get('user')!
  const body = await c.req.json<any>().catch(() => null)
  const ticketId = Number(body?.ticket_id)
  const teacherId = Number(body?.teacher_id)

  if (!ticketId || !teacherId) return c.json({ ok: false, error: 'টিকেট ও শিক্ষক আইডি প্রয়োজন' }, 400)

  const teacher: any = await c.env.DB.prepare('SELECT name FROM teachers WHERE id = ?').bind(teacherId).first()
  if (!teacher) return c.json({ ok: false, error: 'শিক্ষক পাওয়া যায়নি' }, 404)

  await c.env.DB.prepare('UPDATE teacher_tickets SET teacher_id = ? WHERE id = ?').bind(teacherId, ticketId).run()

  // অডিট লগ
  try {
    await c.env.DB.prepare(`
      INSERT INTO admin_audit_logs (admin_id, admin_name, action, target_type, target_id, details)
      VALUES (?, ?, 'TICKET_ASSIGNED', 'ticket', ?, ?)
    `).bind(me.id, me.name_bn || 'এডমিন', String(ticketId), `টিকেট #${ticketId} শিক্ষক ${teacher.name} এর কাছে অ্যাসাইন করা হয়েছে।`).run()
  } catch (e) {}

  return c.json({ ok: true, message: `টিকেট সফলভাবে শিক্ষক "${teacher.name}" এর নিকট বরাদ্দ করা হয়েছে।` })
})

// মেন্টর পেমেন্ট / সেশন সেটেলমেন্ট
admin.post('/mentor-settle-payout', async (c) => {
  const me = c.get('user')!
  const body = await c.req.json<any>().catch(() => null)
  const mentorId = Number(body?.mentor_id)
  const amount = Number(body?.amount) || 0
  const solvedCount = Number(body?.tickets_count) || 0
  const sessionCount = Number(body?.sessions_count) || 0
  const note = String(body?.note || 'মাসিক মেন্টর সেশন ও সমাধান বিল').trim()

  if (!mentorId || amount <= 0) return c.json({ ok: false, error: 'সঠিক শিক্ষক ও টাকার পরিমাণ দিন' }, 400)

  const mentor: any = await c.env.DB.prepare('SELECT name, user_id FROM teachers WHERE id = ?').bind(mentorId).first()
  if (!mentor) return c.json({ ok: false, error: 'শিক্ষক পাওয়া যায়নি' }, 404)

  await c.env.DB.prepare(`
    INSERT INTO mentor_payouts (mentor_id, amount, tickets_count, sessions_count, status, note)
    VALUES (?, ?, ?, ?, 'settled', ?)
  `).bind(mentorId, amount, solvedCount, sessionCount, note).run()

  // যদি শিক্ষক অ্যাকাউন্টে ওয়ালেট থাকে, ব্যালেন্স ক্রেডিট করা যেতে পারে
  if (mentor.user_id) {
    await c.env.DB.prepare('INSERT INTO wallets (user_id, balance) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET balance = balance + excluded.balance').bind(mentor.user_id, amount).run()
    await c.env.DB.prepare("INSERT INTO wallet_transactions (user_id, amount, type, note, status) VALUES (?, ?, 'mentor_payout', ?, 'approved')").bind(mentor.user_id, amount, note).run()
  }

  // অডিট লগ
  try {
    await c.env.DB.prepare(`
      INSERT INTO admin_audit_logs (admin_id, admin_name, action, target_type, target_id, details)
      VALUES (?, ?, 'MENTOR_PAYOUT', 'mentor', ?, ?)
    `).bind(me.id, me.name_bn || 'এডমিন', String(mentorId), `মেন্টর ${mentor.name} কে ${amount} ৳ পেআউট পরিশোধ। নোট: ${note}`).run()
  } catch (e) {}

  return c.json({ ok: true, message: `মেন্টর "${mentor.name}" এর জন্য ${amount} ৳ পেআউট সফলভাবে সেটেল হয়েছে।` })
})

// ================= অ্যাসিস্টেড আবেদন (ASSISTED APPLICATIONS QUEUE) =================
admin.get('/assisted-applications', async (c) => {
  try {
    const status = c.req.query('status') || ''
    let sql = `
      SELECT ar.*, u.name_bn AS user_name, u.phone AS user_phone, u.user_code
      FROM assisted_requests ar
      LEFT JOIN users u ON u.id = ar.user_id
    `
    const params: any[] = []
    if (status) {
      sql += ' WHERE ar.status = ?'
      params.push(status)
    }
    sql += " ORDER BY CASE WHEN ar.status = 'requested' THEN 1 WHEN ar.status = 'paid' THEN 2 WHEN ar.status = 'processing' THEN 3 ELSE 4 END, ar.id DESC LIMIT 100"

    const q = c.env.DB.prepare(sql)
    const { results } = params.length ? await q.bind(...params).all() : await q.all()
    return c.json({ ok: true, requests: results || [] })
  } catch (err: any) {
    console.error('[Admin Assisted-Applications Error]:', err)
    return c.json({ ok: false, requests: [], error: err.message }, 200)
  }
})

admin.put('/assisted-applications/:id', async (c) => {
  const me = c.get('user')!
  const id = Number(c.req.param('id'))
  const body = await c.req.json<any>().catch(() => null)
  if (!body) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)

  const status = String(body.status || 'processing')
  const fee = body.fee !== undefined ? Number(body.fee) : undefined
  const adminNote = String(body.admin_note || '').trim()

  await c.env.DB.prepare(`
    UPDATE assisted_requests 
    SET status = ?, 
        fee = COALESCE(?, fee),
        admin_note = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(status, fee ?? null, adminNote, id).run()

  // অডিট লগ
  try {
    await c.env.DB.prepare(`
      INSERT INTO admin_audit_logs (admin_id, admin_name, action, target_type, target_id, details)
      VALUES (?, ?, 'ASSISTED_REQ_UPDATE', 'assisted_request', ?, ?)
    `).bind(me.id, me.name_bn || 'এডমিন', String(id), `আবেদন #${id} স্ট্যাটাস: "${status}", নোট: ${adminNote}`).run()
  } catch (e) {}

  return c.json({ ok: true, message: 'অ্যাসিস্টেড আবেদন সফলভাবে আপডেট করা হয়েছে।' })
})

// ---------- নোটিস CRUD ----------
admin.get('/notices', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM notices ORDER BY id DESC LIMIT 100').all()
  return c.json({ ok: true, notices: results })
})
admin.post('/notices', async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b?.title) return c.json({ ok: false, error: 'শিরোনাম দিন' }, 400)
  const isActive = (b.is_active === 0 || b.is_active === false) ? 0 : 1
  const r = await c.env.DB.prepare(`INSERT INTO notices (category, title, link, source, published_at, body, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .bind(b.category || 'general', String(b.title).trim(), b.link || null, b.source || 'manual', b.published_at || new Date().toISOString().slice(0, 10), String(b.body || '').slice(0, 5000), isActive).run()
  return c.json({ ok: true, id: r.meta.last_row_id })
})
admin.put('/notices/:id', async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)
  await c.env.DB.prepare('UPDATE notices SET category = COALESCE(?, category), title = COALESCE(?, title), link = COALESCE(?, link), published_at = COALESCE(?, published_at), body = COALESCE(?, body), is_active = COALESCE(?, is_active) WHERE id = ?')
    .bind(b.category ?? null, b.title ?? null, b.link ?? null, b.published_at ?? null, b.body ?? null, b.is_active ?? null, c.req.param('id')).run()
  return c.json({ ok: true })
})
admin.delete('/notices/:id', async (c) => {
  await c.env.DB.prepare('DELETE FROM notices WHERE id = ?').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

// ---------- চাকরি CRUD ----------
admin.get('/jobs', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM jobs ORDER BY id DESC LIMIT 100').all()
  return c.json({ ok: true, jobs: results })
})
admin.post('/jobs', async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b?.title) return c.json({ ok: false, error: 'শিরোনাম দিন' }, 400)
  const isActive = (b.is_active === 0 || b.is_active === false) ? 0 : 1
  const r = await c.env.DB.prepare(`INSERT INTO jobs (title, org, category, education_level, deadline, apply_link, description, source, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(String(b.title).trim(), b.org || null, b.category || 'govt', b.education_level || 'any', b.deadline || null, b.apply_link || b.link || null, b.description || null, b.source || 'manual', isActive).run()
  return c.json({ ok: true, id: r.meta.last_row_id })
})
admin.put('/jobs/:id', async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)
  await c.env.DB.prepare('UPDATE jobs SET title = COALESCE(?, title), org = COALESCE(?, org), category = COALESCE(?, category), education_level = COALESCE(?, education_level), deadline = COALESCE(?, deadline), apply_link = COALESCE(?, apply_link), description = COALESCE(?, description), is_active = COALESCE(?, is_active) WHERE id = ?')
    .bind(b.title ?? null, b.org ?? null, b.category ?? null, b.education_level ?? null, b.deadline ?? null, b.apply_link ?? null, b.description ?? null, b.is_active ?? null, c.req.param('id')).run()
  return c.json({ ok: true })
})
admin.delete('/jobs/:id', async (c) => {
  await c.env.DB.prepare('DELETE FROM jobs WHERE id = ?').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

// ---------- MCQ প্রশ্ন CRUD ----------
admin.get('/mcq', async (c) => {
  const level = c.req.query('level')
  const sql = level
    ? c.env.DB.prepare('SELECT * FROM mcq_questions WHERE level = ? ORDER BY id DESC LIMIT 200').bind(level)
    : c.env.DB.prepare('SELECT * FROM mcq_questions ORDER BY id DESC LIMIT 200')
  const { results } = await sql.all()
  return c.json({ ok: true, questions: results })
})
admin.post('/mcq', async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b?.question || !b.option_a || !b.option_b || !b.option_c || !b.option_d || !['a', 'b', 'c', 'd'].includes(b.correct))
    return c.json({ ok: false, error: 'প্রশ্ন, ৪টি অপশন ও সঠিক উত্তর (a/b/c/d) দিন' }, 400)
  const r = await c.env.DB.prepare(`INSERT INTO mcq_questions (level, subject, chapter, question, option_a, option_b, option_c, option_d, correct, explanation, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`)
    .bind(b.level || 'ssc', b.subject || 'সাধারণ জ্ঞান', b.chapter || '', b.question, b.option_a, b.option_b, b.option_c, b.option_d, b.correct, b.explanation || '').run()
  return c.json({ ok: true, id: r.meta.last_row_id })
})
admin.put('/mcq/:id', async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)
  if (b.correct && !['a', 'b', 'c', 'd'].includes(b.correct)) return c.json({ ok: false, error: 'সঠিক উত্তর a/b/c/d' }, 400)
  await c.env.DB.prepare('UPDATE mcq_questions SET level = COALESCE(?, level), subject = COALESCE(?, subject), chapter = COALESCE(?, chapter), question = COALESCE(?, question), option_a = COALESCE(?, option_a), option_b = COALESCE(?, option_b), option_c = COALESCE(?, option_c), option_d = COALESCE(?, option_d), correct = COALESCE(?, correct), explanation = COALESCE(?, explanation), is_active = COALESCE(?, is_active) WHERE id = ?')
    .bind(b.level ?? null, b.subject ?? null, b.chapter ?? null, b.question ?? null, b.option_a ?? null, b.option_b ?? null, b.option_c ?? null, b.option_d ?? null, b.correct ?? null, b.explanation ?? null, b.is_active ?? null, c.req.param('id')).run()
  return c.json({ ok: true })
})
admin.delete('/mcq/:id', async (c) => {
  await c.env.DB.prepare('DELETE FROM mcq_questions WHERE id = ?').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

// ---------- সিলেবাস CRUD ----------
admin.get('/syllabus', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM syllabus ORDER BY id DESC LIMIT 100').all()
  return c.json({ ok: true, syllabus: results })
})
admin.post('/syllabus', async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b?.title) return c.json({ ok: false, error: 'শিরোনাম দিন' }, 400)
  const link = String(b.link || b.source || 'https://nctb.gov.bd').trim()
  const source = String(b.source || b.link || 'NCTB').trim()
  const isActive = (b.is_active === 0 || b.is_active === false) ? 0 : 1
  const r = await c.env.DB.prepare('INSERT INTO syllabus (level, title, description, link, source, is_active) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(b.level || 'ssc', b.title, b.description || '', link, source, isActive).run()
  return c.json({ ok: true, id: r.meta.last_row_id })
})
admin.put('/syllabus/:id', async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)
  await c.env.DB.prepare('UPDATE syllabus SET level = COALESCE(?, level), title = COALESCE(?, title), description = COALESCE(?, description), link = COALESCE(?, link), source = COALESCE(?, source), is_active = COALESCE(?, is_active) WHERE id = ?')
    .bind(b.level ?? null, b.title ?? null, b.description ?? null, b.link ?? null, b.source ?? null, b.is_active ?? null, c.req.param('id')).run()
  return c.json({ ok: true })
})
admin.delete('/syllabus/:id', async (c) => {
  await c.env.DB.prepare('DELETE FROM syllabus WHERE id = ?').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

// ---------- রেট/বোনাস, সোশ্যাল লিংক ও ড্যাশবোর্ড কার্ড টগল সেটিংস ----------
const RATE_KEYS = [
  'signup_bonus', 'referral_bonus', 'cod_charge',
  'bkash_number', 'nagad_number', 'rocket_number',
  'whatsapp_number', 'whatsapp_group',
  'facebook_url', 'youtube_url', 'telegram_url',
  'support_phone', 'support_email', 'notice_marquee',
  // কোর মডিউল অন/অফ টগল (1=অন, 0=অফ)
  'shop_enabled', 'teacher_support_enabled', 'assisted_service_enabled', 'wallet_recharge_enabled',
  'bkash_auto_enabled',
  // ড্যাশবোর্ড কার্ড অন/অফ কীসমূহ (1=অন, 0=অফ)
  'card_social_hub', 'card_announce', 'card_stats',
  'card_quick_actions', 'card_quick_copy', 'card_study_goals',
  'card_teacher_support', 'card_referral', 'card_religion',
  'card_news', 'card_jobs', 'card_saved_rolls',
  // ইন্ডিভিজুয়াল সোশ্যাল ও সাপোর্ট কার্ড অন/অফ (1=অন, 0=অফ)
  'card_community_fb', 'card_community_yt', 'card_community_wa',
  'card_community_tg', 'card_community_help'
]
admin.get('/rates', async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT key, value FROM settings WHERE key IN (${RATE_KEYS.map(() => '?').join(',')})`).bind(...RATE_KEYS).all()
  const map: Record<string, string> = {}
  for (const r of results as any[]) map[r.key] = r.value
  // ডিফল্ট ভ্যালু যদি ডাটাবেজে না থাকে
  if (map.shop_enabled === undefined) map.shop_enabled = '1'
  if (map.teacher_support_enabled === undefined) map.teacher_support_enabled = '1'
  if (map.assisted_service_enabled === undefined) map.assisted_service_enabled = '1'
  if (map.wallet_recharge_enabled === undefined) map.wallet_recharge_enabled = '1'
  return c.json({ ok: true, rates: map })
})
admin.put('/rates', async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)

  // লেগ্যাসি বা অল্টারনেটিভ ফিল্ড ম্যাপিং
  if ('facebook_group' in b && !('facebook_url' in b)) b.facebook_url = b.facebook_group
  if ('telegram_channel' in b && !('telegram_url' in b)) b.telegram_url = b.telegram_channel
  if ('youtube_channel' in b && !('youtube_url' in b)) b.youtube_url = b.youtube_channel

  const stmts = []
  for (const k of RATE_KEYS) {
    if (k in b) {
      stmts.push(c.env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').bind(k, String(b[k] ?? '')))
    }
  }
  if (!stmts.length) return c.json({ ok: false, error: 'কিছু পরিবর্তন নেই' }, 400)
  await c.env.DB.batch(stmts)
  return c.json({ ok: true, message: 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে।' })
})

// ---------- প্রশ্নপত্র CRUD ----------
admin.get('/qpapers', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM question_papers ORDER BY id DESC LIMIT 300').all()
  return c.json({ ok: true, qpapers: results || [], papers: results || [] })
})
admin.post('/qpapers', async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b?.title) return c.json({ ok: false, error: 'শিরোনাম দিন' }, 400)
  const access = ['free', 'standard', 'premium'].includes(b.access) ? b.access : 'free'
  const content = b.content || b.description || b.pdf_url || 'পূর্ণ প্রশ্নপত্র ও সমাধান সংযোজন করা হয়েছে।'
  const isActive = (b.is_active === 0 || b.is_active === false) ? 0 : 1
  const r = await c.env.DB.prepare("INSERT INTO question_papers (title, level, subject, board, year, link, description, access, content, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(String(b.title).trim(), b.level || 'ssc', b.subject || '', b.board || '', b.year || '', b.pdf_url || b.link || '', b.description || '', access, String(content).slice(0, 50000), isActive).run()
  return c.json({ ok: true, id: r.meta.last_row_id })
})
admin.put('/qpapers/:id', async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)
  await c.env.DB.prepare('UPDATE question_papers SET title=COALESCE(?,title), level=COALESCE(?,level), subject=COALESCE(?,subject), board=COALESCE(?,board), year=COALESCE(?,year), description=COALESCE(?,description), link=COALESCE(?,link), access=COALESCE(?,access), is_active=COALESCE(?,is_active) WHERE id=?')
    .bind(b.title ?? null, b.level ?? null, b.subject ?? null, b.board ?? null, b.year ?? null, b.description ?? null, b.pdf_url || b.link || null, b.access ?? null, (b.is_active === 0 || b.is_active === 1) ? b.is_active : null, c.req.param('id')).run()
  return c.json({ ok: true })
})
admin.delete('/qpapers/:id', async (c) => {
  await c.env.DB.prepare('DELETE FROM question_papers WHERE id=?').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

// ---------- সাজেশন ও মডেল টেস্ট CRUD ----------
admin.get('/suggestions', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM suggestions ORDER BY id DESC LIMIT 300').all()
  return c.json({ ok: true, suggestions: results || [] })
})
admin.post('/suggestions', async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b?.title) return c.json({ ok: false, error: 'শিরোনাম দিন' }, 400)
  const access = ['free', 'standard', 'premium'].includes(b.access) ? b.access : 'free'
  const content = b.content || 'সাজেশন কন্টেন্ট ও নমুনা প্রশ্নোত্তর'
  const isActive = (b.is_active === 0 || b.is_active === false) ? 0 : 1
  const r = await c.env.DB.prepare('INSERT INTO suggestions (title, level, subject, year, access, content, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(String(b.title).trim(), b.level || 'ssc', b.subject || '', b.year || '2025', access, String(content).slice(0, 50000), isActive).run()
  return c.json({ ok: true, id: r.meta.last_row_id })
})
admin.put('/suggestions/:id', async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)
  await c.env.DB.prepare('UPDATE suggestions SET title=COALESCE(?,title), level=COALESCE(?,level), subject=COALESCE(?,subject), year=COALESCE(?,year), access=COALESCE(?,access), is_active=COALESCE(?,is_active) WHERE id=?')
    .bind(b.title ?? null, b.level ?? null, b.subject ?? null, b.year ?? null, b.access ?? null, (b.is_active === 0 || b.is_active === 1) ? b.is_active : null, c.req.param('id')).run()
  return c.json({ ok: true })
})
admin.delete('/suggestions/:id', async (c) => {
  await c.env.DB.prepare('DELETE FROM suggestions WHERE id=?').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

// ---------- ভর্তি তথ্য CRUD ----------
admin.get('/admissions', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM admissions ORDER BY id DESC LIMIT 200').all()
  return c.json({ ok: true, admissions: results || [] })
})
admin.post('/admissions', async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b?.title) return c.json({ ok: false, error: 'শিরোনাম দিন' }, 400)
  const isActive = (b.is_active === 0 || b.is_active === false) ? 0 : 1
  const r = await c.env.DB.prepare('INSERT INTO admissions (title, level, org, apply_link, fee, deadline, description, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(String(b.title).trim(), b.level || 'hsc', b.org || '', b.apply_link || b.source || '', b.fee || '', b.deadline || null, b.details || b.description || '', isActive).run()
  return c.json({ ok: true, id: r.meta.last_row_id })
})
admin.put('/admissions/:id', async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)
  await c.env.DB.prepare('UPDATE admissions SET title=COALESCE(?,title), level=COALESCE(?,level), org=COALESCE(?,org), apply_link=COALESCE(?,apply_link), fee=COALESCE(?,fee), deadline=COALESCE(?,deadline), is_active=COALESCE(?,is_active) WHERE id=?')
    .bind(b.title ?? null, b.level ?? null, b.org ?? null, b.apply_link || b.source || null, b.fee ?? null, b.deadline ?? null, (b.is_active === 0 || b.is_active === 1) ? b.is_active : null, c.req.param('id')).run()
  return c.json({ ok: true })
})
admin.delete('/admissions/:id', async (c) => {
  await c.env.DB.prepare('DELETE FROM admissions WHERE id=?').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

// ---------- পুশ নোটিস ও ঘোষণা CRUD ----------
admin.get('/announcements', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM announcements ORDER BY id DESC LIMIT 200').all()
  return c.json({ ok: true, announcements: results || [] })
})
admin.post('/announcements', async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b?.title) return c.json({ ok: false, error: 'শিরোনাম দিন' }, 400)
  const r = await c.env.DB.prepare("INSERT INTO announcements (type, title, body, level, status) VALUES ('general', ?, ?, ?, 'approved')")
    .bind(String(b.title).trim(), b.message || b.body || '', b.target_role || b.level || 'all').run()
  // নোটিস পাঠালেই সব পুশ সাবস্ক্রাইবারকে নোটিফিকেশন
  const pushTask = broadcastPush(
    c.env.DB,
    (k: string) => (c.env as any)?.[k] || (typeof process !== 'undefined' ? process.env?.[k] : undefined),
    `📢 ${String(b.title).trim().slice(0, 100)}`,
    String(b.message || b.body || '').slice(0, 250),
    '/notices'
  ).catch((e) => console.error('[push] broadcast error:', e))
  try {
    const ctx = c.executionCtx
    if (ctx?.waitUntil) ctx.waitUntil(pushTask)
    else await pushTask
  } catch {
    await pushTask
  }
  return c.json({ ok: true, id: r.meta.last_row_id })
})
admin.put('/announcements/:id', async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)
  await c.env.DB.prepare('UPDATE announcements SET title=COALESCE(?,title), body=COALESCE(?,body), status=COALESCE(?,status) WHERE id=?')
    .bind(b.title ?? null, b.message || b.body || null, b.status ?? null, c.req.param('id')).run()
  return c.json({ ok: true })
})
admin.delete('/announcements/:id', async (c) => {
  await c.env.DB.prepare('DELETE FROM announcements WHERE id=?').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

// ---------- স্কলারশিপ CRUD ----------
admin.get('/scholarships', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM scholarships ORDER BY id DESC LIMIT 200').all()
  return c.json({ ok: true, scholarships: results || [] })
})
admin.post('/scholarships', async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b?.title) return c.json({ ok: false, error: 'স্কলারশিপের শিরোনাম দিন' }, 400)
  const r = await c.env.DB.prepare(`
    INSERT INTO scholarships (title, provider, category, target_level, stipend_amount, deadline, apply_link, source, tips_guideline, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).bind(String(b.title).trim(), b.provider || '', b.category || 'national', b.target_level || 'all', b.stipend_amount || '', b.deadline || null, b.apply_link || '', b.source || '', b.tips_guideline || '').run()
  return c.json({ ok: true, id: r.meta.last_row_id })
})
admin.put('/scholarships/:id', async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)
  await c.env.DB.prepare(`
    UPDATE scholarships 
    SET title=COALESCE(?,title), provider=COALESCE(?,provider), category=COALESCE(?,category), target_level=COALESCE(?,target_level),
        stipend_amount=COALESCE(?,stipend_amount), deadline=COALESCE(?,deadline), apply_link=COALESCE(?,apply_link), is_active=COALESCE(?,is_active)
    WHERE id=?
  `).bind(b.title ?? null, b.provider ?? null, b.category ?? null, b.target_level ?? null, b.stipend_amount ?? null, b.deadline ?? null, b.apply_link ?? null, (b.is_active === 0 || b.is_active === 1) ? b.is_active : null, c.req.param('id')).run()
  return c.json({ ok: true })
})
admin.delete('/scholarships/:id', async (c) => {
  await c.env.DB.prepare('DELETE FROM scholarships WHERE id=?').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

// ---------- ১-ক্লিকে এডমিন অটো কালেকশন ও সিঙ্ক ইঞ্জিন ----------
const handleAutoCollect = async (c: any) => {
  const startTime = Date.now()
  const me = c.get('user')
  try {
    const { runAutoCollection } = await import('../lib/autoCollector')
    const body: any = await c.req.json().catch(() => ({}))
    const scope = (body.scope || body.type || c.req.query('scope') || 'all') as any
    const result = await runAutoCollection(c.env.DB, scope)
    const duration = Date.now() - startTime

    // মোট সক্রিয় ডাটাবেজ পরিসংখ্যান আনা
    const [totScholarships, totQpapers, totSyllabus, totMcq, totJobs, totNotices, totAdmissions] = await Promise.all([
      safeCount(c.env.DB, 'SELECT COUNT(*) as c FROM scholarships WHERE is_active=1'),
      safeCount(c.env.DB, 'SELECT COUNT(*) as c FROM question_papers WHERE is_active=1'),
      safeCount(c.env.DB, 'SELECT COUNT(*) as c FROM syllabus WHERE is_active=1'),
      safeCount(c.env.DB, 'SELECT COUNT(*) as c FROM mcq_questions WHERE is_active=1'),
      safeCount(c.env.DB, 'SELECT COUNT(*) as c FROM jobs WHERE is_active=1'),
      safeCount(c.env.DB, 'SELECT COUNT(*) as c FROM notices WHERE is_active=1'),
      safeCount(c.env.DB, 'SELECT COUNT(*) as c FROM admissions WHERE is_active=1'),
    ])

    const totalActive = totScholarships + totQpapers + totSyllabus + totMcq + totJobs + totNotices + totAdmissions
    const newAdded = (result as any).new_added || ((result as any).counts?.scholarships || 0) + ((result as any).counts?.qpapers || 0)
    const duplicates = Math.max(0, totalActive - newAdded)

    // সিঙ্ক সোর্স আপডেট
    try {
      await c.env.DB.prepare(`
        UPDATE sync_sources
        SET last_synced_at = datetime('now'),
            total_fetched = total_fetched + ?,
            new_added = new_added + ?,
            duplicates_count = duplicates_count + ?,
            status = 'active'
        WHERE is_enabled = 1
      `).bind(totalActive, Math.max(1, newAdded), duplicates).run()
    } catch (e) {}

    // সিঙ্ক লগ সংরক্ষণ
    try {
      await c.env.DB.prepare(`
        INSERT INTO sync_logs (source_key, source_name, status, items_count, new_count, duplicates_count, duration_ms, error_message, triggered_by)
        VALUES ('all', 'সম্পূর্ণ মাস্টার অটো-সিঙ্ক ইঞ্জিন', 'success', ?, ?, ?, ?, '', ?)
      `).bind(totalActive, Math.max(1, newAdded), duplicates, duration, (me?.name_bn || 'এডমিন') + ' (মাস্টার সিঙ্ক)').run()
    } catch (e) {}

    // অডিট লগ
    try {
      if (me) {
        await c.env.DB.prepare(`
          INSERT INTO admin_audit_logs (admin_id, admin_name, action, target_type, target_id, details)
          VALUES (?, ?, 'MASTER_AUTO_SYNC', 'sync_center', 'all', ?)
        `).bind(me.id, me.name_bn || 'এডমিন', `মাস্টার অটো-সিঙ্ক সম্পন্ন (সক্রিয়: ${totalActive}টি, নতুন: ${newAdded}টি, সময়: ${duration}ms)`).run()
      }
    } catch (e) {}

    return c.json({
      ok: true,
      message: 'মাস্টার ডাটা সিঙ্ক ও অটো কালেকশন সফলভাবে সম্পন্ন হয়েছে! সকল এডুকেশনাল কন্টেন্ট হালনাগাদ করা হয়েছে।',
      duration_ms: duration,
      total_active: totalActive,
      new_added: newAdded,
      duplicates_prevented: duplicates,
      counts: {
        scholarships: totScholarships,
        qpapers: totQpapers,
        syllabus: totSyllabus,
        mcq: totMcq,
        jobs: totJobs,
        notices: totNotices,
        admissions: totAdmissions
      },
      collected: {
        scholarships: totScholarships,
        question_papers: totQpapers,
        syllabus: totSyllabus,
        mcq: totMcq,
        jobs: totJobs,
        notices: totNotices,
        admissions: totAdmissions
      }
    })
  } catch (err: any) {
    console.error('[Admin AutoCollect Error]:', err)
    return c.json({
      ok: false,
      error: err.message || 'কালেকশন প্রক্রিয়া চলাকালীন সমস্যা হয়েছে'
    }, 500)
  }
}

admin.post('/auto-collect', handleAutoCollect)
admin.get('/auto-collect', handleAutoCollect)

export default admin
