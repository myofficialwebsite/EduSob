// এডুসব ফেজ-৪ — CV মেকার API: টেমপ্লেট, ইউজার CV সেভ/লোড, এডমিন কাস্টমাইজার
import { Hono } from 'hono'
import { Bindings, getCookie, getSessionUser, SessionUser } from '../lib/auth'

type Env = { Bindings: Bindings; Variables: { user: SessionUser | null } }
const cv = new Hono<Env>()

// সেশন লোডার
cv.use('*', async (c, next) => {
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

// ---------- টেমপ্লেট তালিকা (পাবলিক) ----------
cv.get('/templates', async (c) => {
  const rows = await c.env.DB.prepare('SELECT slug, name_bn, price, config, sort_order FROM cv_templates WHERE is_active=1 ORDER BY sort_order').all()
  const templates = (rows.results as any[]).map(t => ({ ...t, config: JSON.parse(t.config) }))
  return c.json({ ok: true, templates })
})

// ---------- আমার CV তালিকা ----------
cv.get('/mine', requireAuth, async (c) => {
  const user = c.get('user')!
  const rows = await c.env.DB.prepare('SELECT id, title, template_slug, lang, with_photo, updated_at FROM user_cvs WHERE user_id=? ORDER BY updated_at DESC').bind(user.id).all()
  return c.json({ ok: true, cvs: rows.results })
})

// ---------- একটি CV লোড ----------
cv.get('/mine/:id', requireAuth, async (c) => {
  const user = c.get('user')!
  const id = Number(c.req.param('id'))
  const row: any = await c.env.DB.prepare('SELECT * FROM user_cvs WHERE id=? AND user_id=?').bind(id, user.id).first()
  if (!row) return c.json({ ok: false, error: 'পাওয়া যায়নি' }, 404)
  return c.json({ ok: true, cv: { ...row, data: JSON.parse(row.data) } })
})

// ---------- CV সেভ (নতুন/আপডেট) ----------
cv.post('/save', requireAuth, async (c) => {
  const user = c.get('user')!
  const body = await c.req.json<any>().catch(() => null)
  if (!body || typeof body.data !== 'object') return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)
  const title = String(body.title || 'আমার সিভি').slice(0, 100)
  const slug = String(body.template_slug || 'sorol-bangla').slice(0, 50)
  const lang = body.lang === 'en' ? 'en' : 'bn'
  const withPhoto = body.with_photo ? 1 : 0
  const dataStr = JSON.stringify(body.data).slice(0, 60000)
  const id = Number(body.id) || 0

  if (id) {
    const r = await c.env.DB.prepare(`UPDATE user_cvs SET title=?, template_slug=?, lang=?, with_photo=?, data=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?`)
      .bind(title, slug, lang, withPhoto, dataStr, id, user.id).run()
    if (!r.meta.changes) return c.json({ ok: false, error: 'পাওয়া যায়নি' }, 404)
    return c.json({ ok: true, id })
  }
  // ইউজারপ্রতি সর্বোচ্চ ৫টি CV
  const cnt: any = await c.env.DB.prepare('SELECT COUNT(*) as n FROM user_cvs WHERE user_id=?').bind(user.id).first()
  if ((cnt?.n ?? 0) >= 5) return c.json({ ok: false, error: 'সর্বোচ্চ ৫টি CV সেভ করা যায় — পুরনোটি ডিলিট করুন' }, 400)
  const r = await c.env.DB.prepare(`INSERT INTO user_cvs (user_id, title, template_slug, lang, with_photo, data) VALUES (?,?,?,?,?,?)`)
    .bind(user.id, title, slug, lang, withPhoto, dataStr).run()
  return c.json({ ok: true, id: r.meta.last_row_id })
})

// ---------- CV ডিলিট ----------
cv.delete('/mine/:id', requireAuth, async (c) => {
  const user = c.get('user')!
  await c.env.DB.prepare('DELETE FROM user_cvs WHERE id=? AND user_id=?').bind(Number(c.req.param('id')), user.id).run()
  return c.json({ ok: true })
})

// ---------- প্রোফাইল থেকে CV ডেটা প্রি-ফিল ----------
cv.get('/prefill', requireAuth, async (c) => {
  const user = c.get('user')!
  const p: any = await c.env.DB.prepare('SELECT * FROM profiles WHERE user_id=?').bind(user.id).first()
  const education: any[] = []
  if (p?.ssc_year || p?.ssc_gpa) education.push({ exam: 'এসএসসি', institute: p?.school_name || '', board: p?.ssc_board || '', year: p?.ssc_year || '', result: p?.ssc_gpa ? 'GPA ' + p.ssc_gpa : '' })
  if (p?.hsc_year || p?.hsc_gpa) education.push({ exam: 'এইচএসসি', institute: p?.college_name || '', board: p?.hsc_board || '', year: p?.hsc_year || '', result: p?.hsc_gpa ? 'GPA ' + p.hsc_gpa : '' })
  if (p?.nu_subject) education.push({ exam: 'অনার্স (NU)', institute: p?.nu_college || '', board: 'জাতীয় বিশ্ববিদ্যালয়', year: '', result: p?.nu_subject })
  const address = [p?.village, p?.post_office, p?.upazila, p?.district].filter(Boolean).join(', ')
  return c.json({
    ok: true,
    prefill: {
      name: user.name_bn || '', name_en: (user as any).name_en || '',
      phone: user.phone || '', email: user.email || '',
      father: p?.father_bn || '', mother: p?.mother_bn || '',
      dob: p?.dob || '', address,
      photo: p?.photo_data || '',
      education
    }
  })
})

// ================= এডমিন কাস্টমাইজার =================

// সব টেমপ্লেট (এডমিন — inactive সহ)
cv.get('/admin/templates', requireAdmin, async (c) => {
  const rows = await c.env.DB.prepare('SELECT * FROM cv_templates ORDER BY sort_order').all()
  const templates = (rows.results as any[]).map(t => ({ ...t, config: JSON.parse(t.config) }))
  return c.json({ ok: true, templates })
})

// টেমপ্লেট আপডেট (কালার/ফন্ট/সেকশন-অর্ডার/লেআউট/দাম/সক্রিয়তা)
cv.put('/admin/templates/:slug', requireAdmin, async (c) => {
  const slug = c.req.param('slug')
  const body = await c.req.json<any>().catch(() => null)
  if (!body) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)
  const cur: any = await c.env.DB.prepare('SELECT config, price, is_active, name_bn FROM cv_templates WHERE slug=?').bind(slug).first()
  if (!cur) return c.json({ ok: false, error: 'টেমপ্লেট নেই' }, 404)

  const cfg = JSON.parse(cur.config)
  const allowedKeys = ['primary', 'accent', 'font', 'layout', 'headerStyle', 'contactPos', 'sectionOrder', 'watermark']
  if (body.config && typeof body.config === 'object') {
    for (const k of allowedKeys) if (k in body.config) cfg[k] = body.config[k]
  }
  const price = Number.isInteger(body.price) && body.price >= 0 ? body.price : cur.price
  const isActive = body.is_active === 0 || body.is_active === 1 ? body.is_active : cur.is_active
  const nameBn = typeof body.name_bn === 'string' && body.name_bn.trim() ? body.name_bn.trim().slice(0, 60) : cur.name_bn

  await c.env.DB.prepare('UPDATE cv_templates SET config=?, price=?, is_active=?, name_bn=?, updated_at=CURRENT_TIMESTAMP WHERE slug=?')
    .bind(JSON.stringify(cfg), price, isActive, nameBn, slug).run()
  return c.json({ ok: true })
})

export default cv
