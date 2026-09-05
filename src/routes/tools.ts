// এডুসব ফেজ-৩ — স্টুডেন্ট টুলস API: MCQ, ভুল-ব্যাংক, প্ল্যানার, নোট, সিলেবাস, লিডারবোর্ড
import { Hono } from 'hono'
import { Bindings, getCookie, getSessionUser, SessionUser } from '../lib/auth'

type Env = { Bindings: Bindings; Variables: { user: SessionUser | null } }
const tools = new Hono<Env>()

// সেশন লোডার
tools.use('*', async (c, next) => {
  const token = getCookie(c.req.header('Cookie'), 'edusob_session')
  c.set('user', await getSessionUser(c.env.DB, token))
  await next()
})
const requireAuth = async (c: any, next: any) => {
  if (!c.get('user')) return c.json({ ok: false, error: 'লগইন প্রয়োজন' }, 401)
  await next()
}

// ---------- MCQ: বিষয় তালিকা ----------
tools.get('/mcq/subjects', async (c) => {
  const level = c.req.query('level') || ''
  const rows = level
    ? await c.env.DB.prepare('SELECT level, subject, COUNT(*) as cnt FROM mcq_questions WHERE is_active=1 AND level=? GROUP BY level, subject').bind(level).all()
    : await c.env.DB.prepare('SELECT level, subject, COUNT(*) as cnt FROM mcq_questions WHERE is_active=1 GROUP BY level, subject').all()
  return c.json({ ok: true, subjects: rows.results })
})

// ---------- MCQ: পরীক্ষা শুরু (র‍্যান্ডম প্রশ্ন, উত্তর ছাড়া) ----------
tools.get('/mcq/quiz', async (c) => {
  const level = c.req.query('level') || 'ssc'
  const subject = c.req.query('subject') || ''
  const count = Math.min(parseInt(c.req.query('count') || '10') || 10, 20)
  const rows = subject
    ? await c.env.DB.prepare('SELECT id, level, subject, chapter, question, option_a, option_b, option_c, option_d FROM mcq_questions WHERE is_active=1 AND level=? AND subject=? ORDER BY RANDOM() LIMIT ?').bind(level, subject, count).all()
    : await c.env.DB.prepare('SELECT id, level, subject, chapter, question, option_a, option_b, option_c, option_d FROM mcq_questions WHERE is_active=1 AND level=? ORDER BY RANDOM() LIMIT ?').bind(level, count).all()
  return c.json({ ok: true, questions: rows.results })
})

// ---------- MCQ: উত্তর জমা → স্কোর + ভুল-ব্যাংক আপডেট ----------
tools.post('/mcq/submit', async (c) => {
  const user = c.get('user')
  const body = await c.req.json<any>().catch(() => null)
  if (!body || !Array.isArray(body.answers) || body.answers.length === 0) return c.json({ ok: false, error: 'উত্তর পাওয়া যায়নি' }, 400)
  const answers: { id: number; answer: string }[] = body.answers.slice(0, 20)
  const ids = answers.map(a => Number(a.id)).filter(n => Number.isInteger(n))
  if (!ids.length) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)

  const qs = await c.env.DB.prepare(`SELECT id, correct, explanation, question, option_a, option_b, option_c, option_d, level, subject FROM mcq_questions WHERE id IN (${ids.map(() => '?').join(',')})`).bind(...ids).all()
  const qmap = new Map((qs.results as any[]).map(q => [q.id, q]))

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(new Date())
  const tomorrow = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(new Date(Date.now() + 86400000))

  let correctCount = 0
  const results: any[] = []
  const stmts: any[] = []
  for (const a of answers) {
    const q: any = qmap.get(Number(a.id))
    if (!q) continue
    const isCorrect = String(a.answer).toLowerCase() === q.correct
    if (isCorrect) {
      correctCount++
      if (user) {
        // সঠিক হলে ভুল-ব্যাংকে থাকলে স্টেজ এগোও (১→৩→৭ দিন)
        stmts.push(c.env.DB.prepare(`UPDATE wrong_bank SET stage = stage + 1, next_review = CASE stage WHEN 0 THEN date(?, '+3 days') WHEN 1 THEN date(?, '+7 days') ELSE '9999-12-31' END WHERE user_id=? AND question_id=?`).bind(today, today, user.id, q.id))
      }
    } else {
      if (user) {
        stmts.push(c.env.DB.prepare(`INSERT INTO wrong_bank (user_id, question_id, wrong_count, stage, next_review) VALUES (?, ?, 1, 0, ?) ON CONFLICT(user_id, question_id) DO UPDATE SET wrong_count = wrong_count + 1, stage = 0, next_review = excluded.next_review`).bind(user.id, q.id, tomorrow))
      }
    }
    results.push({ id: q.id, your: a.answer, correct: q.correct, isCorrect, explanation: q.explanation })
  }
  const total = results.length
  const pct = total ? Math.round((correctCount / total) * 100) : 0
  const first: any = qmap.get(ids[0])
  if (user && stmts.length) {
    stmts.push(c.env.DB.prepare('INSERT INTO mcq_attempts (user_id, level, subject, total, correct_count, score_pct) VALUES (?, ?, ?, ?, ?, ?)').bind(user.id, first?.level || 'ssc', body.subject || first?.subject || '', total, correctCount, pct))
    await c.env.DB.batch(stmts).catch(() => {})
  }
  return c.json({ ok: true, total, correct: correctCount, pct, results, guest: !user })
})

// ---------- MCQ: আমার ইতিহাস ----------
tools.get('/mcq/history', requireAuth, async (c) => {
  const user = c.get('user')!
  const rows = await c.env.DB.prepare('SELECT level, subject, total, correct_count, score_pct, taken_at FROM mcq_attempts WHERE user_id=? ORDER BY taken_at DESC LIMIT 15').bind(user.id).all()
  return c.json({ ok: true, attempts: rows.results })
})

// ---------- ভুল-ব্যাংক: আজকের রিভিশন ----------
tools.get('/wrong-bank', requireAuth, async (c) => {
  const user = c.get('user')!
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(new Date())
  const due = await c.env.DB.prepare(`SELECT w.id as wid, w.wrong_count, w.stage, w.next_review, q.id, q.subject, q.chapter, q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.correct, q.explanation FROM wrong_bank w JOIN mcq_questions q ON q.id = w.question_id WHERE w.user_id=? AND w.next_review <= ? AND w.stage < 3 ORDER BY w.next_review LIMIT 20`).bind(user.id, today).all()
  const stats = await c.env.DB.prepare(`SELECT COUNT(*) as total, SUM(CASE WHEN stage >= 3 THEN 1 ELSE 0 END) as mastered FROM wrong_bank WHERE user_id=?`).bind(user.id).first<any>()
  return c.json({ ok: true, due: due.results, total: stats?.total || 0, mastered: stats?.mastered || 0 })
})

// ---------- লিডারবোর্ড (কলেজভিত্তিক গড় স্কোর) ----------
tools.get('/leaderboard', async (c) => {
  const rows = await c.env.DB.prepare(`SELECT u.name_bn, u.user_code, COUNT(a.id) as quizzes, ROUND(AVG(a.score_pct)) as avg_pct, MAX(a.score_pct) as best FROM mcq_attempts a JOIN users u ON u.id = a.user_id GROUP BY a.user_id ORDER BY avg_pct DESC, quizzes DESC LIMIT 10`).all()
  return c.json({ ok: true, board: rows.results })
})

// ---------- প্ল্যানার ----------
tools.get('/planner', requireAuth, async (c) => {
  const user = c.get('user')!
  const rows = await c.env.DB.prepare('SELECT id, title, subject, due_date, status FROM planner_tasks WHERE user_id=? ORDER BY status ASC, due_date ASC, id DESC LIMIT 100').bind(user.id).all()
  return c.json({ ok: true, tasks: rows.results })
})
tools.get('/planner/tasks', requireAuth, async (c) => {
  const user = c.get('user')!
  const rows = await c.env.DB.prepare('SELECT id, title, subject, due_date, status FROM planner_tasks WHERE user_id=? ORDER BY status ASC, due_date ASC, id DESC LIMIT 100').bind(user.id).all()
  return c.json({ ok: true, tasks: rows.results })
})
tools.post('/planner', requireAuth, async (c) => {
  const user = c.get('user')!
  const b = await c.req.json<any>().catch(() => null)
  const title = String(b?.title || '').trim().slice(0, 200)
  if (!title) return c.json({ ok: false, error: 'কাজের নাম দিন' }, 400)
  const r = await c.env.DB.prepare('INSERT INTO planner_tasks (user_id, title, subject, due_date) VALUES (?, ?, ?, ?)').bind(user.id, title, String(b?.subject || '').slice(0, 50), String(b?.due_date || '').slice(0, 10)).run()
  return c.json({ ok: true, id: r.meta.last_row_id, task: { id: r.meta.last_row_id, title } })
})
tools.post('/planner/tasks', requireAuth, async (c) => {
  const user = c.get('user')!
  const b = await c.req.json<any>().catch(() => null)
  const title = String(b?.title || '').trim().slice(0, 200)
  if (!title) return c.json({ ok: false, error: 'কাজের নাম দিন' }, 400)
  const r = await c.env.DB.prepare('INSERT INTO planner_tasks (user_id, title, subject, due_date) VALUES (?, ?, ?, ?)').bind(user.id, title, String(b?.subject || '').slice(0, 50), String(b?.due_date || '').slice(0, 10)).run()
  return c.json({ ok: true, id: r.meta.last_row_id, task: { id: r.meta.last_row_id, title } })
})
tools.put('/planner/:id', requireAuth, async (c) => {
  const user = c.get('user')!
  const id = parseInt(c.req.param('id'))
  const b = await c.req.json<any>().catch(() => ({}))
  const status = b?.status === 'done' ? 'done' : 'pending'
  await c.env.DB.prepare('UPDATE planner_tasks SET status=? WHERE id=? AND user_id=?').bind(status, id, user.id).run()
  return c.json({ ok: true })
})
tools.delete('/planner/:id', requireAuth, async (c) => {
  const user = c.get('user')!
  await c.env.DB.prepare('DELETE FROM planner_tasks WHERE id=? AND user_id=?').bind(parseInt(c.req.param('id')), user.id).run()
  return c.json({ ok: true })
})

// ---------- প্রশ্নপত্র ও মডেল টেস্ট তালিকা ----------
tools.get('/qpapers', async (c) => {
  const level = c.req.query('level') || ''
  const subject = c.req.query('subject') || ''
  const year = c.req.query('year') || ''
  let q = 'SELECT id, title, level, subject, board, year, description, access, downloads FROM question_papers WHERE is_active=1'
  const args: any[] = []
  if (level) { q += ' AND level=?'; args.push(level); }
  if (subject) { q += ' AND subject LIKE ?'; args.push(`%${subject}%`); }
  if (year) { q += ' AND year=?'; args.push(year); }
  q += ' ORDER BY year DESC, id DESC LIMIT 50'
  const rows = await c.env.DB.prepare(q).bind(...args).all()
  return c.json({ ok: true, papers: rows.results || [] })
})

// ---------- নোট ----------
tools.get('/notes', requireAuth, async (c) => {
  const user = c.get('user')!
  const rows = await c.env.DB.prepare('SELECT id, subject, chapter, title, content, updated_at FROM notes WHERE user_id=? ORDER BY updated_at DESC LIMIT 100').bind(user.id).all()
  return c.json({ ok: true, notes: rows.results })
})
tools.post('/notes', requireAuth, async (c) => {
  const user = c.get('user')!
  const b = await c.req.json<any>().catch(() => null)
  const title = String(b?.title || '').trim().slice(0, 200)
  if (!title) return c.json({ ok: false, error: 'শিরোনাম দিন' }, 400)
  const r = await c.env.DB.prepare('INSERT INTO notes (user_id, subject, chapter, title, content) VALUES (?, ?, ?, ?, ?)').bind(user.id, String(b?.subject || '').slice(0, 50), String(b?.chapter || '').slice(0, 100), title, String(b?.content || '').slice(0, 10000)).run()
  return c.json({ ok: true, id: r.meta.last_row_id })
})
tools.put('/notes/:id', requireAuth, async (c) => {
  const user = c.get('user')!
  const b = await c.req.json<any>().catch(() => ({}))
  await c.env.DB.prepare(`UPDATE notes SET title=?, subject=?, chapter=?, content=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?`).bind(String(b?.title || '').slice(0, 200), String(b?.subject || '').slice(0, 50), String(b?.chapter || '').slice(0, 100), String(b?.content || '').slice(0, 10000), parseInt(c.req.param('id')), user.id).run()
  return c.json({ ok: true })
})
tools.delete('/notes/:id', requireAuth, async (c) => {
  const user = c.get('user')!
  await c.env.DB.prepare('DELETE FROM notes WHERE id=? AND user_id=?').bind(parseInt(c.req.param('id')), user.id).run()
  return c.json({ ok: true })
})

// ---------- সিলেবাস (পাবলিক - পূর্ণাঙ্গ অন-সাইট ডাটাবেজ) ----------
tools.get('/syllabus', async (c) => {
  const level = c.req.query('level') || ''
  try {
    const rows = level
      ? await c.env.DB.prepare('SELECT id, level, subject, title, description, link, source, content, chapters, marks_distribution FROM syllabus WHERE is_active=1 AND level=? ORDER BY id').bind(level).all()
      : await c.env.DB.prepare('SELECT id, level, subject, title, description, link, source, content, chapters, marks_distribution FROM syllabus WHERE is_active=1 ORDER BY level, id').all()
    return c.json({ ok: true, items: rows.results || [] })
  } catch (err) {
    console.error('Syllabus query error:', err)
    return c.json({ ok: true, items: [] })
  }
})

tools.get('/syllabus/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  try {
    const item = await c.env.DB.prepare('SELECT * FROM syllabus WHERE id=? AND is_active=1').bind(id).first()
    if (!item) return c.json({ ok: false, error: 'সিলেবাস পাওয়া যায়নি' }, 404)
    return c.json({ ok: true, item })
  } catch (err) {
    return c.json({ ok: false, error: 'ডাটাবেজ ত্রুটি' }, 500)
  }
})

export default tools
