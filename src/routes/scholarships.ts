// এডুসব — স্কলারশিপ অটো-যোগ্যতা ইঞ্জিন ও অটো-কালেকশন API
import { Hono } from 'hono'
import { Bindings, getCookie, getSessionUser, SessionUser } from '../lib/auth'
import { runAutoCollection } from '../lib/autoCollector'

type Env = { Bindings: Bindings; Variables: { user: SessionUser | null } }
const scholarships = new Hono<Env>()

scholarships.use('*', async (c, next) => {
  const token = getCookie(c.req.header('Cookie'), 'edusob_session')
  c.set('user', await getSessionUser(c.env.DB, token))
  await next()
})

const requireAdmin = async (c: any, next: any) => {
  const u = c.get('user')
  if (!u) return c.json({ ok: false, error: 'লগইন প্রয়োজন' }, 401)
  if (u.role !== 'admin') return c.json({ ok: false, error: 'এডমিন অনুমতি প্রয়োজন' }, 403)
  await next()
}

// ---------- পাবলিক: স্কলারশিপ তালিকা ----------
const handleGetPublicList = async (c: any) => {
  const category = c.req.query('category') || ''
  const level = c.req.query('level') || ''
  const q = c.req.query('q') || ''

  let query = 'SELECT * FROM scholarships WHERE is_active=1'
  const params: any[] = []

  if (category) {
    query += ' AND category=?'
    params.push(category)
  }
  if (level && level !== 'all') {
    query += " AND (target_level=? OR target_level='all')"
    params.push(level)
  }
  if (q) {
    query += ' AND (title LIKE ? OR provider LIKE ? OR quota LIKE ?)'
    params.push(`%${q}%`, `%${q}%`, `%${q}%`)
  }

  query += ' ORDER BY id DESC LIMIT 100'

  const stmt = c.env.DB.prepare(query)
  const { results } = params.length ? await stmt.bind(...params).all() : await stmt.all()

  const formatted = (results as any[]).map(s => ({
    ...s,
    required_docs: JSON.parse(s.required_docs || '[]'),
    steps_roadmap: JSON.parse(s.steps_roadmap || '[]')
  }))

  return c.json({ ok: true, scholarships: formatted })
}

scholarships.get('/', handleGetPublicList)
scholarships.get('/list', handleGetPublicList)

// ---------- অটো স্কলারশিপ যোগ্যতা নির্ণয় ইঞ্জিন (Auto Eligibility Assessor) ----------
scholarships.post('/evaluate', async (c) => {
  const body = await c.req.json<any>().catch(() => ({}))
  const user = c.get('user')

  const level = String(body.level || user?.education_level || 'ssc').toLowerCase()
  const gpa = Number(body.gpa || body.ssc_gpa || 4.5)
  const familyIncome = Number(body.family_income || 100000) // বার্ষিক আয়
  const quota = String(body.quota || 'general').toLowerCase()
  const district = String(body.district || 'ঢাকা')
  const studyGoal = String(body.study_goal || 'domestic') // domestic | abroad

  const { results } = await c.env.DB.prepare('SELECT * FROM scholarships WHERE is_active=1').all()
  const allScholarships = results as any[]

  const evaluationResults = allScholarships.map(s => {
    let score = 100
    const passReasons: string[] = []
    const warningReasons: string[] = []
    const failReasons: string[] = []

    // ১. লেভেল চেক
    if (s.target_level !== 'all' && s.target_level !== level) {
      if ((s.target_level === 'bsc' || s.target_level === 'masters') && (level === 'ssc' || level === 'hsc')) {
        score -= 50
        failReasons.push(`এটি ${s.target_level.toUpperCase()} স্তরের জন্য প্রযোজ্য (আপনার বর্তমান স্তর: ${level.toUpperCase()})`)
      } else {
        score -= 20
        warningReasons.push(`প্রধানত ${s.target_level.toUpperCase()} এর জন্য, তবে বিশেষ ক্যাটাগরিতে আবেদন সম্ভব হতে পারে`)
      }
    } else {
      passReasons.push(`শিক্ষাগত স্তর (${level.toUpperCase()}) স্কলারশিপের নির্ধারিত শর্তের সাথে মিলেছে`)
    }

    // ২. GPA / CGPA চেক
    if (s.min_gpa > 0) {
      if (gpa >= s.min_gpa) {
        passReasons.push(`জিপিএ ${gpa.toFixed(2)} (প্রয়োজনীয় ন্যূনতম: ${s.min_gpa.toFixed(2)}) — সফলভাবে উত্তীর্ণ ✓`)
      } else {
        const diff = (s.min_gpa - gpa).toFixed(2)
        score -= 40
        failReasons.push(`জিপিএ শর্ত পূরণ হয়নি (আপনার: ${gpa.toFixed(2)}, ন্যূনতম প্রয়োজন: ${s.min_gpa.toFixed(2)}, কমতি: ${diff})`)
      }
    } else {
      passReasons.push('কোনো ন্যূনতম জিপিএ বাধ্যবাধকতা নেই')
    }

    // ৩. পারিবারিক আয় সীমা চেক
    if (s.max_family_income > 0) {
      if (familyIncome <= s.max_family_income) {
        passReasons.push(`বার্ষিক পারিবারিক আয় ৳${familyIncome.toLocaleString()} (সীমা: ৳${s.max_family_income.toLocaleString()}) — যোগ্য ✓`)
      } else {
        score -= 35
        failReasons.push(`পারিবারিক আয় সীমা অতিক্রম করেছে (সর্বোচ্চ নির্ধারিত: ৳${s.max_family_income.toLocaleString()})`)
      }
    } else {
      passReasons.push('আয়ের কোনো সর্বোচ্চ সীমা নেই (মেধা ভিত্তিক উন্মুক্ত বৃত্তি)')
    }

    // ৪. স্টাডি গোল ও ক্যাটাগরি ম্যাচিং
    if (studyGoal === 'abroad' && s.category === 'international') {
      score += 10
      passReasons.push('আন্তর্জাতিক উচ্চশিক্ষার লক্ষ্যের সাথে শতভাগ মানানসই')
    } else if (studyGoal === 'domestic' && s.category === 'international') {
      score -= 15
      warningReasons.push('এটি বিদেশে উচ্চশিক্ষার জন্য স্কলারশিপ')
    }

    // ৫. কোটা বা জেলা বোনাস
    if (quota !== 'general' && s.quota && (s.quota.includes('প্রতিবন্ধী') || s.quota.includes('অসচ্ছল') || s.quota.includes('উপজাতি'))) {
      score = Math.min(100, score + 10)
      passReasons.push(`বিশেষ কোটা (${quota}) সুবিধার আওতাভুক্ত`)
    }

    const finalScore = Math.max(0, Math.min(100, score))
    let status: 'eligible' | 'almost_eligible' | 'ineligible' = 'eligible'
    let statusText = '🎉 আপনি এই স্কলারশিপের জন্য শতভাগ যোগ্য!'
    let statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300'

    if (finalScore >= 80) {
      status = 'eligible'
      statusText = '🎉 আপনি এই স্কলারশিপের জন্য সরাসরি আবেদনযোগ্য!'
      statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300'
    } else if (finalScore >= 50) {
      status = 'almost_eligible'
      statusText = '⚡ কিছু শর্ত শিথিলযোগ্য / বিকল্প কোটায় আবেদন করা যেতে পারে'
      statusBadge = 'bg-amber-100 text-amber-800 border-amber-300'
    } else {
      status = 'ineligible'
      statusText = '❌ বর্তমান প্রোফাইল অনুযায়ী শর্ত পূরণ হয়নি'
      statusBadge = 'bg-rose-100 text-rose-800 border-rose-300'
    }

    return {
      id: s.id,
      title: s.title,
      provider: s.provider,
      category: s.category,
      target_level: s.target_level,
      stipend_amount: s.stipend_amount,
      deadline: s.deadline,
      apply_link: s.apply_link,
      match_score: finalScore,
      status,
      status_text: statusText,
      status_badge: statusBadge,
      pass_reasons: passReasons,
      warning_reasons: warningReasons,
      fail_reasons: failReasons,
      required_docs: JSON.parse(s.required_docs || '[]'),
      steps_roadmap: JSON.parse(s.steps_roadmap || '[]'),
      tips_guideline: s.tips_guideline
    }
  })

  // স্কোর অনুযায়ী সাজানো (সর্বোচ্চ ম্যাচ আগে)
  evaluationResults.sort((a, b) => b.match_score - a.match_score)

  return c.json({
    ok: true,
    user_inputs: { level, gpa, family_income: familyIncome, district, quota, study_goal: studyGoal },
    summary: {
      total_checked: evaluationResults.length,
      eligible_count: evaluationResults.filter(e => e.status === 'eligible').length,
      almost_eligible_count: evaluationResults.filter(e => e.status === 'almost_eligible').length,
    },
    matches: evaluationResults
  })
})

// ================= এডমিন ম্যানেজমেন্ট =================

// স্কলারশিপ CRUD (এডমিন) — /admin এবং /admin/list উভয় পাথেই সাপোর্ট
const handleGetAdminList = async (c: any) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM scholarships ORDER BY id DESC LIMIT 200').all()
  const formatted = (results as any[]).map(s => ({
    ...s,
    required_docs: JSON.parse(s.required_docs || '[]'),
    steps_roadmap: JSON.parse(s.steps_roadmap || '[]')
  }))
  return c.json({ ok: true, scholarships: formatted })
}
scholarships.get('/admin', requireAdmin, handleGetAdminList)
scholarships.get('/admin/list', requireAdmin, handleGetAdminList)

const handleCreateScholarship = async (c: any) => {
  const b: any = await c.req.json().catch(() => null)
  if (!b?.title || !b?.provider) return c.json({ ok: false, error: 'শিরোনাম ও প্রদানকারী প্রতিষ্ঠানের নাম আবশ্যক' }, 400)

  const reqDocs = Array.isArray(b.required_docs) ? JSON.stringify(b.required_docs) : (typeof b.required_docs === 'string' ? JSON.stringify(b.required_docs.split('\n').filter(Boolean)) : '[]')
  const steps = Array.isArray(b.steps_roadmap) ? JSON.stringify(b.steps_roadmap) : (typeof b.steps_roadmap === 'string' ? JSON.stringify(b.steps_roadmap.split('\n').filter(Boolean)) : '[]')

  const r = await c.env.DB.prepare(`
    INSERT INTO scholarships (title, provider, category, target_level, min_gpa, max_family_income, quota, eligible_districts, stipend_amount, deadline, apply_link, required_docs, steps_roadmap, tips_guideline, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).bind(
    String(b.title).slice(0, 200),
    String(b.provider).slice(0, 200),
    b.category || 'national',
    b.target_level || 'all',
    Number(b.min_gpa) || 0,
    Number(b.max_family_income) || 0,
    b.quota || '',
    b.eligible_districts || 'সকল জেলা',
    b.stipend_amount || '',
    b.deadline || '',
    b.apply_link || '',
    reqDocs,
    steps,
    b.tips_guideline || ''
  ).run()

  return c.json({ ok: true, id: r.meta.last_row_id })
}
scholarships.post('/admin', requireAdmin, handleCreateScholarship)
scholarships.post('/admin/create', requireAdmin, handleCreateScholarship)

scholarships.put('/admin/:id', requireAdmin, async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)

  const reqDocs = b.required_docs !== undefined ? (Array.isArray(b.required_docs) ? JSON.stringify(b.required_docs) : (typeof b.required_docs === 'string' ? JSON.stringify(b.required_docs.split('\n').filter(Boolean)) : '[]')) : null
  const steps = b.steps_roadmap !== undefined ? (Array.isArray(b.steps_roadmap) ? JSON.stringify(b.steps_roadmap) : (typeof b.steps_roadmap === 'string' ? JSON.stringify(b.steps_roadmap.split('\n').filter(Boolean)) : '[]')) : null

  await c.env.DB.prepare(`
    UPDATE scholarships SET
      title = COALESCE(?, title),
      provider = COALESCE(?, provider),
      category = COALESCE(?, category),
      target_level = COALESCE(?, target_level),
      min_gpa = COALESCE(?, min_gpa),
      max_family_income = COALESCE(?, max_family_income),
      quota = COALESCE(?, quota),
      eligible_districts = COALESCE(?, eligible_districts),
      stipend_amount = COALESCE(?, stipend_amount),
      deadline = COALESCE(?, deadline),
      apply_link = COALESCE(?, apply_link),
      required_docs = COALESCE(?, required_docs),
      steps_roadmap = COALESCE(?, steps_roadmap),
      tips_guideline = COALESCE(?, tips_guideline),
      is_active = COALESCE(?, is_active)
    WHERE id = ?
  `).bind(
    b.title ?? null,
    b.provider ?? null,
    b.category ?? null,
    b.target_level ?? null,
    b.min_gpa !== undefined ? Number(b.min_gpa) : null,
    b.max_family_income !== undefined ? Number(b.max_family_income) : null,
    b.quota ?? null,
    b.eligible_districts ?? null,
    b.stipend_amount ?? null,
    b.deadline ?? null,
    b.apply_link ?? null,
    reqDocs,
    steps,
    b.tips_guideline ?? null,
    (b.is_active === 0 || b.is_active === 1) ? b.is_active : null,
    c.req.param('id')
  ).run()

  return c.json({ ok: true })
})

scholarships.delete('/admin/:id', requireAdmin, async (c) => {
  await c.env.DB.prepare('DELETE FROM scholarships WHERE id=?').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

// ---------- ১-ক্লিকে অটো কালেকশন ও সিঙ্ক ইঞ্জিন (এডমিন মাস্টার অ্যাকশন) ----------
scholarships.post('/admin/auto-collect', requireAdmin, async (c) => {
  try {
    const body = await c.req.json<any>().catch(() => ({}))
    const scope = (body.scope || body.type || 'all') as any
    const result = await runAutoCollection(c.env.DB, scope)
    return c.json({
      ...result,
      collected: {
        scholarships: result.counts.scholarships,
        question_papers: result.counts.qpapers,
        syllabus: result.counts.syllabus,
        mcq: result.counts.mcq
      }
    })
  } catch (err: any) {
    console.error('[AutoCollect Route Error]:', err)
    return c.json({
      ok: false,
      error: err.message || 'কালেকশন প্রক্রিয়া চলাকালীন সমস্যা হয়েছে'
    }, 500)
  }
})

// ---------- একক স্কলারশিপ বিস্তারিত ----------
scholarships.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (isNaN(id)) return c.json({ ok: false, error: 'ভুল স্কলারশিপ আইডি' }, 400)
  const s: any = await c.env.DB.prepare('SELECT * FROM scholarships WHERE id=? AND is_active=1').bind(id).first()
  if (!s) return c.json({ ok: false, error: 'স্কলারশিপ পাওয়া যায়নি' }, 404)

  return c.json({
    ok: true,
    scholarship: {
      ...s,
      required_docs: JSON.parse(s.required_docs || '[]'),
      steps_roadmap: JSON.parse(s.steps_roadmap || '[]')
    }
  })
})

export default scholarships
