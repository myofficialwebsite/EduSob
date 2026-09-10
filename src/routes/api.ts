// এডুসব — API রাউট (auth, profile, saved rolls, wallet)
import { Hono } from 'hono'
import {
  Bindings, hashPassword, verifyPassword, randomHex, createSession,
  getSessionUser, destroySession, nextUserCode, getCookie,
  sessionCookie, clearSessionCookie, SessionUser
} from '../lib/auth'
import { religionInfo } from '../lib/dates'

type Env = { Bindings: Bindings; Variables: { user: SessionUser | null } }

const api = new Hono<Env>()

// সেশন লোডার
api.use('*', async (c, next) => {
  const token = getCookie(c.req.header('Cookie'), 'edusob_session')
  const user = await getSessionUser(c.env.DB, token)
  c.set('user', user)
  await next()
})

const requireAuth = async (c: any, next: any) => {
  if (!c.get('user')) return c.json({ ok: false, error: 'লগইন প্রয়োজন' }, 401)
  await next()
}

// ---------- লগইন রেট-লিমিট (ব্রুট-ফোর্স প্রতিরোধ) ----------
// সীমাবদ্ধতা: এটি isolate-ভিত্তিক ইন-মেমোরি, তাই বেস্ট-এফোর্ট — একই IP বারবার
// একই কলো/isolate-এ গেলেই কার্যকর। টেকসইভাবে আটকাতে Cloudflare WAF
// Rate Limiting rule ব্যবহার করুন (DEPLOY_STATUS.md-এ নির্দেশ আছে)।
const loginAttempts = new Map<string, { n: number; first: number }>()
const LOGIN_MAX_ATTEMPTS = 8
const LOGIN_WINDOW_MS = 10 * 60 * 1000

function clientIp(c: any): string {
  return c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'
}
function loginKey(c: any, identifier: string): string {
  return clientIp(c) + '|' + String(identifier || '').toLowerCase()
}
function loginBlocked(key: string, now: number): boolean {
  const rec = loginAttempts.get(key)
  if (!rec) return false
  if (now - rec.first >= LOGIN_WINDOW_MS) { loginAttempts.delete(key); return false }
  return rec.n >= LOGIN_MAX_ATTEMPTS
}
function loginFail(key: string, now: number): void {
  // মেমোরি ফাঁস আটকাতে মাঝে মাঝে পুরনো এন্ট্রি পরিষ্কার
  if (loginAttempts.size > 5000) {
    for (const [k, v] of loginAttempts) if (now - v.first >= LOGIN_WINDOW_MS) loginAttempts.delete(k)
  }
  const rec = loginAttempts.get(key)
  if (!rec || now - rec.first >= LOGIN_WINDOW_MS) loginAttempts.set(key, { n: 1, first: now })
  else rec.n++
}

// ---------- সাইন-আপ ----------
api.post('/auth/signup', async (c) => {
  const { DB } = c.env
  const body = await c.req.json<any>().catch(() => null)
  if (!body) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)

  // FIX (audit): ফ্রি-টেক্সট নামে HTML/মার্কআপ ঢোকানো বন্ধ (defence in depth)
  const name_bn = String(body.name_bn || '').replace(/[<>]/g, '').trim()
  const phone = String(body.phone || '').replace(/[^\d]/g, '')
  const password = String(body.password || '')
  const religion = ['islam', 'sanatan', 'buddhist', 'christian', 'other'].includes(body.religion) ? body.religion : 'other'
  const education_level = String(body.education_level || '').trim() || null
  const email = String(body.email || '').trim() || null
  const name_en = String(body.name_en || '').trim() || null

  if (name_bn.length < 2) return c.json({ ok: false, error: 'নাম (বাংলা) দিন' }, 400)
  if (!/^01[3-9]\d{8}$/.test(phone)) return c.json({ ok: false, error: 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)' }, 400)
  if (password.length < 6) return c.json({ ok: false, error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর' }, 400)

  const exists = await DB.prepare('SELECT id FROM users WHERE phone = ?').bind(phone).first()
  if (exists) return c.json({ ok: false, error: 'এই মোবাইল নম্বরে ইতিমধ্যে অ্যাকাউন্ট আছে — লগইন করুন' }, 409)

  // রেফারেল কোড যাচাই (ঐচ্ছিক): EDU-YYYY-NNNNN
  let referrer: any = null
  const refCode = String(body.referral_code || '').trim().toUpperCase()
  if (refCode) {
    referrer = await DB.prepare('SELECT id, user_code, phone FROM users WHERE user_code = ?').bind(refCode).first()
    if (!referrer) return c.json({ ok: false, error: 'রেফারেল কোডটি সঠিক নয় — খালি রাখুন অথবা সঠিক কোড দিন' }, 400)
    if (referrer.phone === phone) return c.json({ ok: false, error: 'নিজের ফোন নম্বর বা অ্যাকাউন্ট থেকে নিজেকে রেফার করা যাবে না' }, 400)
  }

  // বোনাস রেট (এডমিন-নিয়ন্ত্রিত)
  const rateRows = await DB.prepare("SELECT key, value FROM settings WHERE key IN ('signup_bonus','referral_bonus')").all()
  const rates: Record<string, number> = {}
  for (const r of rateRows.results as any[]) rates[r.key] = Math.max(0, Math.trunc(Number(r.value)) || 0)
  const signupBonus = rates.signup_bonus ?? 0
  const referralBonus = rates.referral_bonus ?? 0

  const salt = randomHex(16)
  const password_hash = await hashPassword(password, salt)
  const user_code = await nextUserCode(DB)

  const res = await DB.prepare(`
    INSERT INTO users (user_code, name_bn, name_en, email, phone, password_hash, salt, religion, education_level, referred_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(user_code, name_bn, name_en, email, phone, password_hash, salt, religion, education_level, referrer ? referrer.id : null).run()

  const userId = res.meta.last_row_id as number
  const stmts = [
    DB.prepare('INSERT INTO wallets (user_id, balance) VALUES (?, ?)').bind(userId, signupBonus),
    DB.prepare('INSERT INTO profiles (user_id) VALUES (?)').bind(userId),
  ]
  if (signupBonus > 0) {
    stmts.push(DB.prepare("INSERT INTO wallet_transactions (user_id, amount, type, note, status) VALUES (?, ?, 'referral', 'সাইনআপ বোনাস 🎁', 'approved')").bind(userId, signupBonus))
  }
  if (referrer && referralBonus > 0) {
    // রেফারকারী + নতুন ইউজার — দুজনেই বোনাস
    stmts.push(DB.prepare('INSERT INTO wallets (user_id, balance) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET balance = balance + excluded.balance').bind(referrer.id, referralBonus))
    stmts.push(DB.prepare("INSERT INTO wallet_transactions (user_id, amount, type, note, status) VALUES (?, ?, 'referral', ?, 'approved')").bind(referrer.id, referralBonus, `রেফারেল বোনাস — ${name_bn} যোগ দিয়েছেন 🎉`))
    stmts.push(DB.prepare('UPDATE wallets SET balance = balance + ? WHERE user_id = ?').bind(referralBonus, userId))
    stmts.push(DB.prepare("INSERT INTO wallet_transactions (user_id, amount, type, note, status) VALUES (?, ?, 'referral', ?, 'approved')").bind(userId, referralBonus, `রেফারেল বোনাস — ${refCode} এর মাধ্যমে যোগদান 🎉`))
  }
  await DB.batch(stmts)

  const token = await createSession(DB, userId)
  c.header('Set-Cookie', sessionCookie(token))
  return c.json({ ok: true, user_code, redirect: '/dashboard' })
})

// ---------- লগইন ----------
api.post('/auth/login', async (c) => {
  const { DB } = c.env
  const body = await c.req.json<any>().catch(() => null)
  if (!body) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)
  const identifier = String(body.phone || body.identifier || body.email || '').trim()
  const password = String(body.password || '')
  const trimmedPassword = password.trim()

  if (!identifier || !password) {
    return c.json({ ok: false, error: 'মোবাইল নম্বর / ইমেইল / ইউজার আইডি ও পাসওয়ার্ড দিন' }, 400)
  }

  // ব্রুট-ফোর্স গার্ড
  const rlKey = loginKey(c, identifier)
  const rlNow = Date.now()
  if (loginBlocked(rlKey, rlNow)) {
    return c.json({ ok: false, error: 'খুব বেশি ভুল চেষ্টা করেছেন। ১০ মিনিট পর আবার চেষ্টা করুন।' }, 429)
  }

  const cleanPhone = identifier.replace(/[^\d]/g, '')
  let row = await DB.prepare(`
    SELECT id, user_code, email, phone, password_hash, salt, status, role FROM users 
    WHERE (phone = ? AND ? != '') 
       OR LOWER(email) = LOWER(?) 
       OR UPPER(user_code) = UPPER(?)
  `).bind(cleanPhone, cleanPhone, identifier, identifier).first<any>()

  // যদি এডমিন ক্রেডেনশিয়াল সরাসরি সার্চ করা হয় (admin@edusob.com বা ab5353069@gmail.com)
  if (!row && (identifier.toLowerCase() === 'admin' || identifier.toLowerCase() === 'admin@edusob.com' || identifier.toLowerCase() === 'ab5353069@gmail.com')) {
    row = await DB.prepare("SELECT id, user_code, email, phone, password_hash, salt, status, role FROM users WHERE role = 'admin' LIMIT 1").first<any>()
  }

  if (!row) { loginFail(rlKey, rlNow); return c.json({ ok: false, error: 'এই নম্বর বা আইডিতে কোনো অ্যাকাউন্ট পাওয়া যায়নি' }, 404) }
  
  let okPass = await verifyPassword(password, row.salt, row.password_hash)
  if (!okPass && trimmedPassword !== password) {
    okPass = await verifyPassword(trimmedPassword, row.salt, row.password_hash)
  }
  if (!okPass) { loginFail(rlKey, rlNow); return c.json({ ok: false, error: 'ভুল পাসওয়ার্ড' }, 401) }
  if (row.status === 'suspended') return c.json({ ok: false, error: '⛔ আপনার অ্যাকাউন্টটি সাসপেন্ড করা হয়েছে। সহায়তার জন্য যোগাযোগ করুন।' }, 403)

  const token = await createSession(DB, row.id)
  c.header('Set-Cookie', sessionCookie(token))
  const redirect = row.role === 'admin' ? '/admin' : '/dashboard'
  loginAttempts.delete(rlKey)
  return c.json({ ok: true, redirect, role: row.role, token })
})

// ---------- কুইক লগইন নিরাপত্তা গার্ড (সম্পূর্ণ নিষ্ক্রিয়) ----------
api.post('/auth/admin-quick-login', async (c) => {
  return c.json({ ok: false, error: 'নিরাপত্তার স্বার্থে কুইক লগইন নিষ্ক্রিয় করা হয়েছে। অনুগ্রহ করে অফিসিয়াল পাসওয়ার্ড দিয়ে লগইন করুন।' }, 403)
})

// ---------- লগআউট ----------
api.post('/auth/logout', async (c) => {
  const token = getCookie(c.req.header('Cookie'), 'edusob_session')
  if (token) await destroySession(c.env.DB, token)
  c.header('Set-Cookie', clearSessionCookie())
  return c.json({ ok: true, redirect: '/' })
})

// ---------- বর্তমান ইউজার ----------
api.get('/me', async (c) => {
  const user = c.get('user')
  if (!user) return c.json({ ok: false, user: null })
  const info = religionInfo(user.religion)
  return c.json({ ok: true, user, religion_info: info })
})

// ---------- প্রোফাইল ----------
api.get('/profile', requireAuth, async (c) => {
  const user = c.get('user')!
  const profile = await c.env.DB.prepare('SELECT * FROM profiles WHERE user_id = ?').bind(user.id).first()
  return c.json({ ok: true, profile })
})

const PROFILE_FIELDS = [
  'father_bn', 'father_en', 'mother_bn', 'mother_en', 'nid', 'birth_reg', 'dob', 'gender', 'blood_group',
  'village', 'post_office', 'upazila', 'district', 'school_name', 'college_name',
  'ssc_board', 'ssc_roll', 'ssc_reg', 'ssc_year', 'ssc_gpa',
  'hsc_board', 'hsc_roll', 'hsc_reg', 'hsc_year', 'hsc_gpa',
  'nu_reg', 'nu_college', 'nu_subject', 'photo_data', 'sign_data'
]

api.put('/profile', requireAuth, async (c) => {
  const user = c.get('user')!
  const body = await c.req.json<any>().catch(() => null)
  if (!body) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)

  // ছবি/স্বাক্ষর সাইজ গার্ড (D1 রো লিমিট বাঁচাতে ~400KB প্রতিটা)
  for (const k of ['photo_data', 'sign_data']) {
    if (body[k] && String(body[k]).length > 550000) {
      return c.json({ ok: false, error: 'ছবি/স্বাক্ষর খুব বড় — ছোট ফাইল দিন' }, 413)
    }
  }

  const sets: string[] = []
  const vals: any[] = []
  for (const f of PROFILE_FIELDS) {
    if (f in body) { sets.push(`${f} = ?`); vals.push(body[f] === '' ? null : body[f]) }
  }
  const eduLevel = ['ssc', 'hsc', 'nu', 'masters', 'other'].includes(body.education_level) ? body.education_level : null
  const hasUserFields = !!(body.name_bn || body.name_en || body.email || eduLevel)
  if (!sets.length && !hasUserFields) return c.json({ ok: false, error: 'কিছু পরিবর্তন নেই' }, 400)
  if (sets.length) {
    sets.push(`updated_at = CURRENT_TIMESTAMP`)
    vals.push(user.id)
    await c.env.DB.prepare(`UPDATE profiles SET ${sets.join(', ')} WHERE user_id = ?`).bind(...vals).run()
  }

  // ইউজার টেবিলের নাম ও শিক্ষাস্তরও আপডেট করা যাবে
  if (hasUserFields) {
    await c.env.DB.prepare('UPDATE users SET name_bn = COALESCE(?, name_bn), name_en = COALESCE(?, name_en), email = COALESCE(?, email), education_level = COALESCE(?, education_level) WHERE id = ?')
      .bind(body.name_bn || null, body.name_en || null, body.email || null, eduLevel, user.id).run()
  }
  return c.json({ ok: true })
})

// ---------- সেভড রোল ----------
api.get('/saved-rolls', requireAuth, async (c) => {
  const user = c.get('user')!
  const { results } = await c.env.DB.prepare('SELECT * FROM saved_rolls WHERE user_id = ? ORDER BY id DESC').bind(user.id).all()
  return c.json({ ok: true, rolls: results })
})

api.post('/saved-rolls', requireAuth, async (c) => {
  const user = c.get('user')!
  const body = await c.req.json<any>().catch(() => null)
  if (!body?.exam_type) return c.json({ ok: false, error: 'পরীক্ষার ধরন দিন' }, 400)
  await c.env.DB.prepare(`
    INSERT INTO saved_rolls (user_id, exam_type, board, roll, reg, exam_year)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(user.id, body.exam_type, body.board || null, body.roll || null, body.reg || null, body.exam_year || null).run()
  return c.json({ ok: true })
})

api.delete('/saved-rolls/:id', requireAuth, async (c) => {
  const user = c.get('user')!
  await c.env.DB.prepare('DELETE FROM saved_rolls WHERE id = ? AND user_id = ?').bind(c.req.param('id'), user.id).run()
  return c.json({ ok: true })
})

// ---------- ওয়ালেট ----------
api.get('/wallet', requireAuth, async (c) => {
  const user = c.get('user')!
  const wallet = await c.env.DB.prepare('SELECT balance FROM wallets WHERE user_id = ?').bind(user.id).first()
  const { results } = await c.env.DB.prepare('SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY id DESC LIMIT 20').bind(user.id).all()
  return c.json({ ok: true, balance: (wallet as any)?.balance ?? 0, transactions: results })
})

// ---------- রেফারেল স্ট্যাট ----------
api.get('/referrals', requireAuth, async (c) => {
  const user = c.get('user')!
  const { results } = await c.env.DB.prepare('SELECT name_bn, user_code, created_at FROM users WHERE referred_by = ? ORDER BY id DESC LIMIT 50').bind(user.id).all()
  const earned = await c.env.DB.prepare("SELECT COALESCE(SUM(amount),0) s FROM wallet_transactions WHERE user_id = ? AND type = 'referral' AND amount > 0").bind(user.id).first<any>()
  const rate = await c.env.DB.prepare("SELECT value FROM settings WHERE key = 'referral_bonus'").first<any>()
  return c.json({ ok: true, code: user.user_code, referrals: results, total_earned: earned?.s ?? 0, bonus_rate: Math.trunc(Number(rate?.value)) || 0 })
})

// ---------- পাবলিক সেটিংস, সোশ্যাল লিংক ও ড্যাশবোর্ড কার্ড ভিজিবিলিটি ----------
api.get('/settings/public', async (c) => {
  const { DB } = c.env
  const { results } = await DB.prepare('SELECT key, value FROM settings').all()
  const map: Record<string, string> = {}
  for (const r of (results || []) as any[]) {
    map[r.key] = r.value
  }
  return c.json({
    ok: true,
    social: {
      facebook: map.facebook_url !== undefined ? map.facebook_url : 'https://facebook.com/groups/edusob.community',
      youtube: map.youtube_url !== undefined ? map.youtube_url : 'https://youtube.com/@edusob_official',
      whatsapp_number: map.whatsapp_number !== undefined ? map.whatsapp_number : '01835414122',
      whatsapp_group: map.whatsapp_group !== undefined ? map.whatsapp_group : 'https://chat.whatsapp.com/edusob-study-hub',
      telegram: map.telegram_url !== undefined ? map.telegram_url : 'https://t.me/edusob_channel',
      support_phone: map.support_phone !== undefined ? map.support_phone : '01835414122',
      support_email: map.support_email !== undefined ? map.support_email : 'support@edusob.com',
      notice_marquee: map.notice_marquee !== undefined ? map.notice_marquee : 'এডুসব ডিজিটাল শিক্ষা প্ল্যাটফর্মে স্বাগতম — সকল পরীক্ষার রেজাল্ট, প্রশ্নব্যাংক ও স্কলারশিপ তথ্য এক ঠিকানায়!'
    },
    features: {
      shop_enabled: map.shop_enabled !== '0',
      teacher_support_enabled: map.teacher_support_enabled !== '0',
      assisted_service_enabled: map.assisted_service_enabled !== '0',
      wallet_recharge_enabled: map.wallet_recharge_enabled !== '0'
    },
    cards: {
      shop: map.shop_enabled !== '0',
      card_social_hub: map.card_social_hub !== '0',
      card_announce: map.card_announce !== '0',
      card_stats: map.card_stats !== '0',
      card_quick_actions: map.card_quick_actions !== '0',
      card_quick_copy: map.card_quick_copy !== '0',
      card_study_goals: map.card_study_goals !== '0',
      card_teacher_support: map.card_teacher_support !== '0',
      card_referral: map.card_referral !== '0',
      card_religion: map.card_religion !== '0',
      card_news: map.card_news !== '0',
      card_jobs: map.card_jobs !== '0',
      card_saved_rolls: map.card_saved_rolls !== '0',
      card_community_fb: map.card_community_fb !== '0',
      card_community_yt: map.card_community_yt !== '0',
      card_community_wa: map.card_community_wa !== '0',
      card_community_tg: map.card_community_tg !== '0',
      card_community_help: map.card_community_help !== '0',
      social_hub: map.card_social_hub !== '0',
      announce: map.card_announce !== '0',
      stats: map.card_stats !== '0',
      quick_actions: map.card_quick_actions !== '0',
      quick_copy: map.card_quick_copy !== '0',
      study_goals: map.card_study_goals !== '0',
      teacher_support: map.card_teacher_support !== '0',
      referral: map.card_referral !== '0',
      religion: map.card_religion !== '0',
      news: map.card_news !== '0',
      jobs: map.card_jobs !== '0',
      saved_rolls: map.card_saved_rolls !== '0',
      community_fb: map.card_community_fb !== '0',
      community_yt: map.card_community_yt !== '0',
      community_wa: map.card_community_wa !== '0',
      community_tg: map.card_community_tg !== '0',
      community_help: map.card_community_help !== '0'
    },
    rates: {
      signup_bonus: Math.trunc(Number(map.signup_bonus)) || 0,
      referral_bonus: Math.trunc(Number(map.referral_bonus)) || 0,
      cod_charge: Math.trunc(Number(map.cod_charge)) || 50,
      bkash_number: map.bkash_number || '01835414122',
      nagad_number: map.nagad_number || '01835414122',
      rocket_number: map.rocket_number || '01835414122'
    }
  })
})

// ---------- জীবন্ত পরিসংখ্যান API (ল্যান্ডিং হিরো — আসল সংখ্যা, কাল্পনিক নয়) ----------
api.get('/stats/public', async (c) => {
  const { DB } = c.env
  const safe = async (sql: string): Promise<number> => {
    try { const r: any = await DB.prepare(sql).first(); return Number(r?.n ?? 0) } catch { return 0 }
  }
  const [mcq, qpapers, templates, scholarships, teachers, newsItems, jobPosts] = await Promise.all([
    safe('SELECT COUNT(*) n FROM mcq_questions WHERE is_active = 1'),
    safe("SELECT COUNT(*) n FROM question_papers WHERE is_active = 1 OR is_active IS NULL").catch(() => 0),
    safe('SELECT COUNT(*) n FROM cv_templates WHERE is_active = 1'),
    safe('SELECT COUNT(*) n FROM scholarships WHERE is_active = 1'),
    safe('SELECT COUNT(*) n FROM teachers WHERE is_active = 1'),
    safe("SELECT COUNT(*) n FROM feed_cache WHERE updated_at > datetime('now', '-2 days')").catch(() => 0),
    safe('SELECT COUNT(*) n FROM jobs WHERE is_active = 1')
  ])
  const resources = mcq + qpapers
  c.header('Cache-Control', 'public, max-age=300')
  return c.json({
    ok: true,
    stats: {
      practice_questions: mcq,
      resources,
      cv_templates: templates,
      scholarships,
      mentors: teachers,
      live_job_posts: jobPosts
    }
  })
})

export default api
