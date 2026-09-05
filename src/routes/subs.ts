// এডুসব ফেজ-৭ — সাবস্ক্রিপশন + প্রশ্নপত্র ব্যাংক + ফিচার টগল API
import { Hono } from 'hono'
import { Bindings, getCookie, getSessionUser, SessionUser } from '../lib/auth'

type Env = { Bindings: Bindings; Variables: { user: SessionUser | null } }
const subs = new Hono<Env>()

subs.use('*', async (c, next) => {
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

// ইউজারের বর্তমান প্ল্যান বের করা (expired হলে free)
export async function getUserPlan(DB: any, userId: number | null): Promise<string> {
  if (!userId) return 'free'
  const row: any = await DB.prepare(
    "SELECT plan_slug FROM subscriptions WHERE user_id=? AND status='active' AND expires_at > datetime('now') ORDER BY id DESC LIMIT 1"
  ).bind(userId).first()
  return row?.plan_slug || 'free'
}
const PLAN_RANK: Record<string, number> = { free: 0, standard: 1, premium: 2 }

// ---------- প্ল্যান তালিকা (পাবলিক) ----------
subs.get('/plans', async (c) => {
  const rows = await c.env.DB.prepare('SELECT slug, name_bn, description, price, duration_days, features, badge, sort_order FROM plans WHERE is_active=1 ORDER BY sort_order').all()
  const plans = (rows.results as any[]).map(p => ({ ...p, features: JSON.parse(p.features || '[]') }))
  const user = c.get('user')
  const current = await getUserPlan(c.env.DB, user?.id ?? null)
  let expires: string | null = null
  if (user && current !== 'free') {
    const r: any = await c.env.DB.prepare("SELECT expires_at FROM subscriptions WHERE user_id=? AND status='active' AND expires_at > datetime('now') ORDER BY id DESC LIMIT 1").bind(user.id).first()
    expires = r?.expires_at || null
  }
  return c.json({ ok: true, plans, current_plan: current, expires_at: expires })
})

// ---------- সাবস্ক্রাইব (ওয়ালেট থেকে পেমেন্ট) ----------
subs.post('/subscribe', requireAuth, async (c) => {
  const user = c.get('user')!
  const body = await c.req.json<any>().catch(() => null)
  const slug = String(body?.plan || '')
  if (!['standard', 'premium'].includes(slug)) return c.json({ ok: false, error: 'ভুল প্ল্যান' }, 400)
  const plan: any = await c.env.DB.prepare('SELECT * FROM plans WHERE slug=? AND is_active=1').bind(slug).first()
  if (!plan) return c.json({ ok: false, error: 'প্ল্যান পাওয়া যায়নি' }, 404)

  const current = await getUserPlan(c.env.DB, user.id)
  if (PLAN_RANK[current] >= PLAN_RANK[slug]) return c.json({ ok: false, error: `আপনার ইতিমধ্যে ${current === 'premium' ? 'প্রিমিয়াম' : 'স্ট্যান্ডার্ড'} প্ল্যান সক্রিয় আছে` }, 400)

  const w: any = await c.env.DB.prepare('SELECT balance FROM wallets WHERE user_id=?').bind(user.id).first()
  if ((w?.balance ?? 0) < plan.price) return c.json({ ok: false, error: `ওয়ালেটে যথেষ্ট ব্যালেন্স নেই (দরকার ৳${plan.price}) — আগে টপ-আপ করুন`, need_topup: true }, 400)

  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE wallets SET balance=balance-? WHERE user_id=?').bind(plan.price, user.id),
    c.env.DB.prepare("INSERT INTO wallet_transactions (user_id, amount, type, note) VALUES (?,?,'purchase',?)").bind(user.id, -plan.price, `${plan.name_bn} সাবস্ক্রিপশন (${plan.duration_days} দিন)`),
    c.env.DB.prepare("UPDATE subscriptions SET status='cancelled' WHERE user_id=? AND status='active'").bind(user.id),
    c.env.DB.prepare("INSERT INTO subscriptions (user_id, plan_slug, price_paid, expires_at) VALUES (?,?,?, datetime('now', '+' || ? || ' days'))").bind(user.id, slug, plan.price, plan.duration_days),
  ])
  return c.json({ ok: true, plan: slug })
})

// ---------- আমার সাবস্ক্রিপশন স্ট্যাটাস ----------
subs.get('/my-plan', async (c) => {
  const user = c.get('user')
  const plan = await getUserPlan(c.env.DB, user?.id ?? null)
  let expires: string | null = null
  if (user && plan !== 'free') {
    const r: any = await c.env.DB.prepare("SELECT expires_at FROM subscriptions WHERE user_id=? AND status='active' AND expires_at > datetime('now') ORDER BY id DESC LIMIT 1").bind(user.id).first()
    expires = r?.expires_at || null
  }
  return c.json({ ok: true, plan, expires_at: expires })
})

// ---------- প্রশ্নপত্র ব্যাংক (তালিকা — অ্যাকসেস চিহ্নসহ; কন্টেন্ট সাইটেই) ----------
subs.get('/qpapers', async (c) => {
  try {
    const level = c.req.query('level')
    const user = c.get('user')
    const myPlan = await getUserPlan(c.env.DB, user?.id ?? null)
    const stmt = level
      ? c.env.DB.prepare("SELECT id, title, level, subject, board, year, description, access, downloads FROM question_papers WHERE is_active=1 AND level=? ORDER BY year DESC, id DESC LIMIT 200").bind(level)
      : c.env.DB.prepare("SELECT id, title, level, subject, board, year, description, access, downloads FROM question_papers WHERE is_active=1 ORDER BY year DESC, id DESC LIMIT 200")
    const { results } = await stmt.all()
    const isAdmin = user?.role === 'admin'
    const papers = (results as any[] || []).map(p => ({ ...p, unlocked: isAdmin || PLAN_RANK[myPlan] >= PLAN_RANK[p.access || 'free'] }))
    return c.json({ ok: true, papers, my_plan: myPlan })
  } catch (err) {
    console.error('Qpapers query error:', err)
    return c.json({ ok: true, papers: [], my_plan: 'free' })
  }
})

// ---------- ইউনিক ডাউনলোড লজিক (প্ল্যান-ভিত্তিক দৈনিক লিমিট, একই আইটেম পুনরায় ফ্রি) ----------
const DAILY_LIMIT: Record<string, number> = { free: 3, standard: 15, premium: 999 }
function dhakaDate(): string {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }))
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
async function gateAndTrack(c: any, itemType: 'qpaper' | 'suggestion', item: any): Promise<{ ok: boolean; error?: string; code?: number; extra?: any }> {
  const user = c.get('user')
  if (user?.role === 'admin') return { ok: true } // এডমিন সব কন্টেন্ট প্রিভিউ করতে পারেন
  const myPlan = await getUserPlan(c.env.DB, user?.id ?? null)
  const itemAccess = item.access || 'free'
  if (PLAN_RANK[myPlan] < PLAN_RANK[itemAccess]) {
    return { ok: false, error: `এটি ${itemAccess === 'premium' ? 'প্রিমিয়াম' : 'স্ট্যান্ডার্ড'} সদস্যদের জন্য — সাবস্ক্রাইব করুন`, code: 403, extra: { need_plan: itemAccess } }
  }
  // ফ্রি কন্টেন্ট লগইন ছাড়াও দেখা যায়, তবে লিমিট ট্র্যাক লগইন-ইউজারে
  if (!user) {
    if (itemAccess !== 'free') return { ok: false, error: 'লগইন প্রয়োজন', code: 401 }
    return { ok: true }
  }
  const today = dhakaDate()
  // একই আইটেম আজ আগেই নিলে পুনরায় গণনা হবে না (ইউনিক লজিক)
  try {
    const already = await c.env.DB.prepare('SELECT id FROM content_downloads WHERE user_id=? AND item_type=? AND item_id=? AND dl_date=?')
      .bind(user.id, itemType, item.id, today).first()
    if (!already) {
      const cnt: any = await c.env.DB.prepare('SELECT COUNT(*) n FROM content_downloads WHERE user_id=? AND dl_date=?').bind(user.id, today).first()
      const limit = DAILY_LIMIT[myPlan] ?? 3
      if ((cnt?.n ?? 0) >= limit) {
        return { ok: false, error: `আজকের ডাউনলোড লিমিট শেষ (${myPlan === 'free' ? 'ফ্রি: ৩টি/দিন' : 'স্ট্যান্ডার্ড: ১৫টি/দিন'}) — আগামীকাল আবার পাবেন, অথবা আপগ্রেড করুন`, code: 429, extra: { need_plan: myPlan === 'free' ? 'standard' : 'premium' } }
      }
      await c.env.DB.batch([
        c.env.DB.prepare('INSERT INTO content_downloads (user_id, item_type, item_id, dl_date) VALUES (?,?,?,?)').bind(user.id, itemType, item.id, today),
        c.env.DB.prepare(`UPDATE ${itemType === 'qpaper' ? 'question_papers' : 'suggestions'} SET downloads=downloads+1 WHERE id=?`).bind(item.id),
      ])
    }
  } catch(e) {
    console.warn('Download tracking notice:', e)
  }
  return { ok: true }
}

// ---------- প্রশ্নপত্র কন্টেন্ট (সাইটেই দেখা/ডাউনলোড — অ্যাকসেস গেট + ইউনিক লিমিট) ----------
subs.get('/qpapers/:id/content', async (c) => {
  try {
    const p: any = await c.env.DB.prepare("SELECT * FROM question_papers WHERE id=? AND is_active=1").bind(Number(c.req.param('id'))).first()
    if (!p) return c.json({ ok: false, error: 'প্রশ্নপত্র পাওয়া যায়নি' }, 404)
    const g = await gateAndTrack(c, 'qpaper', p)
    if (!g.ok) return c.json({ ok: false, error: g.error, ...(g.extra || {}) }, (g.code || 400) as any)
    const formattedContent = p.content || p.description || 'প্রশ্নপত্রের বিবরণ শীঘ্রই আপডেট করা হবে।'
    return c.json({ ok: true, id: p.id, title: p.title, subject: p.subject, level: p.level, board: p.board, year: p.year, content: formattedContent, updated_at: p.created_at || p.updated_at })
  } catch (err) {
    console.error('Qpaper content error:', err)
    return c.json({ ok: false, error: 'সার্ভার ত্রুটি' }, 500)
  }
})

// ---------- সাজেশন তালিকা ----------
subs.get('/suggestions', async (c) => {
  try {
    const level = c.req.query('level')
    const user = c.get('user')
    const myPlan = await getUserPlan(c.env.DB, user?.id ?? null)
    const stmt = level
      ? c.env.DB.prepare('SELECT id, title, level, subject, year, access, downloads, updated_at FROM suggestions WHERE is_active=1 AND level=? ORDER BY id DESC LIMIT 200').bind(level)
      : c.env.DB.prepare('SELECT id, title, level, subject, year, access, downloads, updated_at FROM suggestions WHERE is_active=1 ORDER BY id DESC LIMIT 200')
    const { results } = await stmt.all()
    const isAdminSg = user?.role === 'admin'
    const items = (results as any[] || []).map(p => ({ ...p, unlocked: isAdminSg || PLAN_RANK[myPlan] >= PLAN_RANK[p.access || 'free'] }))
    return c.json({ ok: true, suggestions: items, my_plan: myPlan })
  } catch (err) {
    console.error('Suggestions query error:', err)
    return c.json({ ok: true, suggestions: [], my_plan: 'free' })
  }
})

// ---------- সাজেশন কন্টেন্ট ----------
subs.get('/suggestions/:id/content', async (c) => {
  try {
    const p: any = await c.env.DB.prepare('SELECT * FROM suggestions WHERE id=? AND is_active=1').bind(Number(c.req.param('id'))).first()
    if (!p) return c.json({ ok: false, error: 'সাজেশন পাওয়া যায়নি' }, 404)
    const g = await gateAndTrack(c, 'suggestion', p)
    if (!g.ok) return c.json({ ok: false, error: g.error, ...(g.extra || {}) }, (g.code || 400) as any)
    const formattedContent = p.content || p.description || 'সাজেশনের বিস্তারিত শীঘ্রই আপডেট করা হবে।'
    return c.json({ ok: true, id: p.id, title: p.title, subject: p.subject, level: p.level, year: p.year, content: formattedContent, updated_at: p.updated_at })
  } catch (err) {
    console.error('Suggestion content error:', err)
    return c.json({ ok: false, error: 'সার্ভার ত্রুটি' }, 500)
  }
})

// ---------- ফিচার টগল (পাবলিক রিড) ----------
subs.get('/features', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT key, is_enabled FROM feature_toggles').all()
  const map: Record<string, number> = {}
  for (const r of results as any[]) map[r.key] = r.is_enabled
  return c.json({ ok: true, features: map })
})

// ================= এডমিন =================

// প্ল্যান তালিকা (এডমিন)
subs.get('/admin/plans', requireAdmin, async (c) => {
  const rows = await c.env.DB.prepare('SELECT * FROM plans ORDER BY sort_order').all()
  const plans = (rows.results as any[]).map(p => ({ ...p, features: JSON.parse(p.features || '[]') }))
  return c.json({ ok: true, plans })
})

// প্ল্যান আপডেট (দাম/মেয়াদ/বর্ণনা/ফিচার/সক্রিয়তা)
subs.put('/admin/plans/:slug', requireAdmin, async (c) => {
  const slug = c.req.param('slug')
  const b = await c.req.json<any>().catch(() => null)
  if (!b) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)
  const cur: any = await c.env.DB.prepare('SELECT * FROM plans WHERE slug=?').bind(slug).first()
  if (!cur) return c.json({ ok: false, error: 'প্ল্যান নেই' }, 404)
  const price = Number.isInteger(b.price) && b.price >= 0 && b.price <= 100000 ? b.price : cur.price
  const days = Number.isInteger(b.duration_days) && b.duration_days > 0 && b.duration_days <= 36500 ? b.duration_days : cur.duration_days
  const features = Array.isArray(b.features) ? JSON.stringify(b.features.slice(0, 12).map((f: any) => String(f).slice(0, 120))) : cur.features
  await c.env.DB.prepare('UPDATE plans SET name_bn=COALESCE(?,name_bn), description=COALESCE(?,description), price=?, duration_days=?, features=?, badge=COALESCE(?,badge), is_active=COALESCE(?,is_active) WHERE slug=?')
    .bind(b.name_bn ?? null, b.description ?? null, price, days, features, b.badge ?? null, (b.is_active === 0 || b.is_active === 1) ? b.is_active : null, slug).run()
  return c.json({ ok: true })
})

// সাবস্ক্রাইবার তালিকা
subs.get('/admin/subscribers', requireAdmin, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT s.id, s.plan_slug, s.price_paid, s.starts_at, s.expires_at, s.status,
           u.user_code, u.name_bn, u.phone
    FROM subscriptions s JOIN users u ON u.id = s.user_id
    ORDER BY s.id DESC LIMIT 100`).all()
  return c.json({ ok: true, subscribers: results })
})

// এডমিন: ইউজারকে ম্যানুয়ালি প্ল্যান দেওয়া (আইডি, ইউজার কোড, বা ফোন নম্বর দিয়ে)
subs.post('/admin/grant', requireAdmin, async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  const rawInput = String(b?.user_id || b?.user_query || '').trim()
  const slug = String(b?.plan || 'premium')
  const days = Number(b?.days) || 30

  if (!rawInput || !['standard', 'premium'].includes(slug)) {
    return c.json({ ok: false, error: 'ইউজার আইডি/ফোন/কোড এবং প্ল্যান দিন' }, 400)
  }

  // Find user by id, user_code, phone, or email
  let userRow: any = null
  if (/^\d+$/.test(rawInput) && Number(rawInput) < 100000) {
    userRow = await c.env.DB.prepare('SELECT id, name_bn, phone, user_code FROM users WHERE id = ? OR user_code = ? OR phone = ?').bind(Number(rawInput), rawInput, rawInput).first()
  }
  if (!userRow) {
    userRow = await c.env.DB.prepare('SELECT id, name_bn, phone, user_code FROM users WHERE user_code = ? OR phone = ? OR email = ? OR user_code LIKE ?').bind(rawInput, rawInput, rawInput, `%${rawInput}%`).first()
  }

  if (!userRow) {
    return c.json({ ok: false, error: `"${rawInput}" দিয়ে কোনো ইউজার পাওয়া যায়নি! সঠিক আইডি নম্বর (১, ২), কোড (EDU-2026-...) বা ফোন নম্বর দিন` }, 404)
  }

  const targetUserId = userRow.id
  await c.env.DB.batch([
    c.env.DB.prepare("UPDATE subscriptions SET status='cancelled' WHERE user_id=? AND status='active'").bind(targetUserId),
    c.env.DB.prepare("INSERT INTO subscriptions (user_id, plan_slug, price_paid, expires_at) VALUES (?,?,0, datetime('now', '+' || ? || ' days'))").bind(targetUserId, slug, days),
  ])
  return c.json({ ok: true, message: `${userRow.name_bn} (${userRow.user_code || userRow.phone}) কে সফলভাবে ${slug === 'premium' ? 'প্রিমিয়াম' : 'স্ট্যান্ডার্ড'} প্ল্যান দেওয়া হয়েছে (${days} দিন)` })
})

// প্রশ্নপত্র CRUD (এডমিন)
subs.get('/admin/qpapers', requireAdmin, async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM question_papers ORDER BY id DESC LIMIT 300').all()
  return c.json({ ok: true, papers: results })
})
subs.post('/admin/qpapers', requireAdmin, async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b?.title || !b.content) return c.json({ ok: false, error: 'শিরোনাম ও পূর্ণ কন্টেন্ট দিন (লিংক নয় — প্রশ্ন সাইটেই থাকবে)' }, 400)
  const access = ['free', 'standard', 'premium'].includes(b.access) ? b.access : 'free'
  const r = await c.env.DB.prepare("INSERT INTO question_papers (title, level, subject, board, year, link, description, access, content, is_active) VALUES (?,?,?,?,?,'',?,?,?,1)")
    .bind(String(b.title).slice(0, 200), b.level || 'ssc', b.subject || '', b.board || '', b.year || '', b.description || '', access, String(b.content).slice(0, 50000)).run()
  return c.json({ ok: true, id: r.meta.last_row_id })
})
subs.put('/admin/qpapers/:id', requireAdmin, async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)
  if (b.access && !['free', 'standard', 'premium'].includes(b.access)) return c.json({ ok: false, error: 'ভুল অ্যাকসেস' }, 400)
  await c.env.DB.prepare('UPDATE question_papers SET title=COALESCE(?,title), level=COALESCE(?,level), subject=COALESCE(?,subject), board=COALESCE(?,board), year=COALESCE(?,year), description=COALESCE(?,description), access=COALESCE(?,access), content=COALESCE(?,content), is_active=COALESCE(?,is_active) WHERE id=?')
    .bind(b.title ?? null, b.level ?? null, b.subject ?? null, b.board ?? null, b.year ?? null, b.description ?? null, b.access ?? null, b.content ? String(b.content).slice(0, 50000) : null, (b.is_active === 0 || b.is_active === 1) ? b.is_active : null, c.req.param('id')).run()
  return c.json({ ok: true })
})
subs.delete('/admin/qpapers/:id', requireAdmin, async (c) => {
  await c.env.DB.prepare('DELETE FROM question_papers WHERE id=?').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

// সাজেশন CRUD (এডমিন — আপডেট বাটনের জন্য PUT-ই যথেষ্ট)
subs.get('/admin/suggestions', requireAdmin, async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM suggestions ORDER BY id DESC LIMIT 300').all()
  return c.json({ ok: true, suggestions: results })
})
subs.post('/admin/suggestions', requireAdmin, async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b?.title || !b.content) return c.json({ ok: false, error: 'শিরোনাম ও পূর্ণ কন্টেন্ট দিন' }, 400)
  const access = ['free', 'standard', 'premium'].includes(b.access) ? b.access : 'free'
  const r = await c.env.DB.prepare('INSERT INTO suggestions (title, level, subject, year, access, content, is_active) VALUES (?,?,?,?,?,?,1)')
    .bind(String(b.title).slice(0, 200), b.level || 'ssc', b.subject || '', b.year || '', access, String(b.content).slice(0, 50000)).run()
  return c.json({ ok: true, id: r.meta.last_row_id })
})
subs.put('/admin/suggestions/:id', requireAdmin, async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)
  if (b.access && !['free', 'standard', 'premium'].includes(b.access)) return c.json({ ok: false, error: 'ভুল অ্যাকসেস' }, 400)
  await c.env.DB.prepare("UPDATE suggestions SET title=COALESCE(?,title), level=COALESCE(?,level), subject=COALESCE(?,subject), year=COALESCE(?,year), access=COALESCE(?,access), content=COALESCE(?,content), is_active=COALESCE(?,is_active), updated_at=CURRENT_TIMESTAMP WHERE id=?")
    .bind(b.title ?? null, b.level ?? null, b.subject ?? null, b.year ?? null, b.access ?? null, b.content ? String(b.content).slice(0, 50000) : null, (b.is_active === 0 || b.is_active === 1) ? b.is_active : null, c.req.param('id')).run()
  return c.json({ ok: true })
})
subs.delete('/admin/suggestions/:id', requireAdmin, async (c) => {
  await c.env.DB.prepare('DELETE FROM suggestions WHERE id=?').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

// ফিচার টগল (এডমিন)
subs.get('/admin/features', requireAdmin, async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM feature_toggles ORDER BY key').all()
  return c.json({ ok: true, features: results })
})
subs.put('/admin/features/:key', requireAdmin, async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b || (b.is_enabled !== 0 && b.is_enabled !== 1)) return c.json({ ok: false, error: 'is_enabled 0/1 দিন' }, 400)
  const key = c.req.param('key')
  const r = await c.env.DB.prepare('UPDATE feature_toggles SET is_enabled=? WHERE key=?').bind(b.is_enabled, key).run()
  if (!r.meta.changes) {
    await c.env.DB.prepare('INSERT INTO feature_toggles (key, name_bn, is_enabled, note) VALUES (?, ?, ?, ?)').bind(key, key, b.is_enabled, '').run()
  }
  return c.json({ ok: true })
})

export default subs
