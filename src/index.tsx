// এডুসব (EduSob) — মূল অ্যাপ্লিকেশন
import { Hono } from 'hono'
import api from './routes/api'
import feeds from './routes/feeds'
import tools from './routes/tools'
import cvRoutes from './routes/cv'
import shopRoutes from './routes/shop'
import adminRoutes from './routes/admin'
import aiRoutes from './routes/ai'
import subsRoutes from './routes/subs'
import extrasRoutes from './routes/extras'
import teacherSupport from './routes/teacherSupport'
import scholarshipsRoutes from './routes/scholarships'
import paymentsRoutes from './routes/payments'
import pushRoutes from './routes/push'
import { Bindings, getCookie, getSessionUser } from './lib/auth'
import { getD1Db, ensureD1Schema } from './lib/db'
import { landingPage } from './pages/landing'
import { signupPage, loginPage } from './pages/auth'
import { dashboardPage } from './pages/dashboard'
import { resultsPage } from './pages/results'
import { profilePage } from './pages/profile'
import { newsPage, jobsPage, noticesPage } from './pages/feedsPages'
import { mcqPage, plannerPage, cgpaPage, syllabusPage } from './pages/toolsPages'
import { cvMakerPage, cvAdminPage } from './pages/cvPages'
import { shopPage, walletPage, assistedPage, shopAdminPage } from './pages/shopPages'
import { adminPage } from './pages/adminPages'
import { subscriptionPage, qpapersPage } from './pages/subsPages'
import { admissionPage } from './pages/admissionPage'
import { teacherSupportPage } from './pages/teacherSupportPage'
import { boardChallengePage } from './pages/boardChallengePage'
import { scholarshipsPage } from './pages/scholarshipsPage'

const app = new Hono<{ Bindings: Bindings }>()

// Database & Environment binding middleware
app.use('*', async (c, next) => {
  if (!c.env) (c as any).env = {}
  if (!(c.env as any).DB) (c.env as any).DB = await getD1Db()
  await ensureD1Schema((c.env as any).DB)
  await next()
})

// ---------- API ----------
app.route('/api', api)
app.route('/api/feeds', feeds)
app.route('/api/tools', tools)
app.route('/api/cv', cvRoutes)
app.route('/api/shop', shopRoutes)
app.route('/api/admin', adminRoutes)
app.route('/api/ai', aiRoutes)
app.route('/api/subs', subsRoutes)
app.route('/api', extrasRoutes)
app.route('/api/teacher-support', teacherSupport)
app.route('/api/scholarships', scholarshipsRoutes)
app.route('/api/payments', paymentsRoutes)
app.route('/api/push', pushRoutes)

// PWA: ম্যানিফেস্ট ও সার্ভিস ওয়ার্কার রুট স্কোপে সার্ভ
app.get('/manifest.webmanifest', async (c) => {
  if ((c.env as any).ASSETS) {
    const r = await (c.env as any).ASSETS.fetch(new Request(new URL('/static/manifest.webmanifest', c.req.url)))
    return new Response(r.body, { headers: { 'Content-Type': 'application/manifest+json', 'Cache-Control': 'no-cache' } })
  }
  const { readFileSync } = await import('node:fs')
  return c.body(readFileSync('public/static/manifest.webmanifest', 'utf8'), 200, { 'Content-Type': 'application/manifest+json', 'Cache-Control': 'no-cache' })
})
app.get('/sw.js', async (c) => {
  const headers = { 'Content-Type': 'application/javascript', 'Service-Worker-Allowed': '/', 'Cache-Control': 'no-cache' }
  if ((c.env as any).ASSETS) {
    const r = await (c.env as any).ASSETS.fetch(new Request(new URL('/static/sw.js', c.req.url)))
    return new Response(r.body, { headers })
  }
  const { readFileSync } = await import('node:fs')
  return c.body(readFileSync('public/static/sw.js', 'utf8'), 200, headers)
})

// Backward-compatible aliases for admin content routes to prevent 404
app.all('/api/jobs/admin', (c) => app.fetch(new Request(new URL('/api/admin/jobs', c.req.url).toString(), c.req.raw)))
app.all('/api/jobs/admin/:id', (c) => app.fetch(new Request(new URL(`/api/admin/jobs/${c.req.param('id')}`, c.req.url).toString(), c.req.raw)))
app.all('/api/admissions/admin', (c) => app.fetch(new Request(new URL('/api/admin/admissions', c.req.url).toString(), c.req.raw)))
app.all('/api/admissions/admin/:id', (c) => app.fetch(new Request(new URL(`/api/admin/admissions/${c.req.param('id')}`, c.req.url).toString(), c.req.raw)))
app.all('/api/notices/admin', (c) => app.fetch(new Request(new URL('/api/admin/notices', c.req.url).toString(), c.req.raw)))
app.all('/api/notices/admin/:id', (c) => app.fetch(new Request(new URL(`/api/admin/notices/${c.req.param('id')}`, c.req.url).toString(), c.req.raw)))
app.all('/api/mcq/admin', (c) => app.fetch(new Request(new URL('/api/admin/mcq', c.req.url).toString(), c.req.raw)))
app.all('/api/mcq/admin/:id', (c) => app.fetch(new Request(new URL(`/api/admin/mcq/${c.req.param('id')}`, c.req.url).toString(), c.req.raw)))
app.all('/api/syllabus/admin', (c) => app.fetch(new Request(new URL('/api/admin/syllabus', c.req.url).toString(), c.req.raw)))
app.all('/api/syllabus/admin/:id', (c) => app.fetch(new Request(new URL(`/api/admin/syllabus/${c.req.param('id')}`, c.req.url).toString(), c.req.raw)))
app.all('/api/qpapers/admin', (c) => app.fetch(new Request(new URL('/api/admin/qpapers', c.req.url).toString(), c.req.raw)))
app.all('/api/qpapers/admin/:id', (c) => app.fetch(new Request(new URL(`/api/admin/qpapers/${c.req.param('id')}`, c.req.url).toString(), c.req.raw)))
app.all('/api/suggestions/admin', (c) => app.fetch(new Request(new URL('/api/admin/suggestions', c.req.url).toString(), c.req.raw)))
app.all('/api/suggestions/admin/:id', (c) => app.fetch(new Request(new URL(`/api/admin/suggestions/${c.req.param('id')}`, c.req.url).toString(), c.req.raw)))
app.all('/api/announcements/admin', (c) => app.fetch(new Request(new URL('/api/admin/announcements', c.req.url).toString(), c.req.raw)))
app.all('/api/announcements/admin/:id', (c) => app.fetch(new Request(new URL(`/api/admin/announcements/${c.req.param('id')}`, c.req.url).toString(), c.req.raw)))

// লিংক লাইভ-স্ট্যাটাস চেকার (রেজাল্ট ও ভর্তি হাবের জন্য; CORS এড়াতে সার্ভার-সাইড)
const ALLOWED_STATUS_HOSTS = new Set([
  'www.educationboardresults.gov.bd', 'educationboardresults.gov.bd',
  'eboardresults.com', 'results.nu.ac.bd', 'www.nu.ac.bd', 'app1.nu.edu.bd', 'app55.nu.edu.bd',
  'nubd.info', 'bou.ac.bd', 'exam.bou.ac.bd', 'osapsnew.bou.ac.bd',
  'btebresult.gov.bd', 'bteb.gov.bd', 'btebadmission.gov.bd',
  'dperesult.teletalk.com.bd', 'dpe.gov.bd', 'result.dghs.gov.bd',
  'dgme.teletalk.com.bd', 'dgnm.teletalk.com.bd', 'bnmc.gov.bd',
  'ntrca.teletalk.com.bd', 'ntrca.gov.bd', 'ngi.teletalk.com.bd',
  'bpsc.teletalk.com.bd', 'bpsc.gov.bd', 'alljobs.teletalk.com.bd',
  'br.teletalk.com.bd', 'police.teletalk.com.bd', 'dpe.teletalk.com.bd',
  'xiclassadmission.gov.bd', 'gstadmission.ac.bd', 'acas.edu.bd',
  'admissionckruet.ac.bd', 'admission.eis.du.ac.bd', 'buet.ac.bd',
  'gsa.teletalk.com.bd', 'cadetcollege.army.mil.bd',
  'dhakaeducationboard.gov.bd', 'rajshahieducationboard.gov.bd',
  'comillaboard.portal.gov.bd', 'jessoreboard.gov.bd', 'bise-ctg.portal.gov.bd',
  'barisalboard.gov.bd', 'sylhetboard.gov.bd', 'dinajpureducationboard.gov.bd',
  'mymensingheducationboard.gov.bd', 'bmeb.ebmeb.gov.bd', 'bteb.gov.bd'
])
app.get('/api/link-status', async (c) => {
  const url = c.req.query('url') || ''
  try {
    const host = new URL(url).hostname
    if (!ALLOWED_STATUS_HOSTS.has(host)) return c.json({ up: false, error: 'অননুমোদিত' }, 400)
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 8000)
    const res = await fetch(url, { method: 'HEAD', signal: ctrl.signal, redirect: 'follow' }).catch(async () => {
      // কিছু সার্ভার HEAD সাপোর্ট করে না — GET fallback
      return fetch(url, { method: 'GET', signal: ctrl.signal, redirect: 'follow' })
    })
    clearTimeout(timer)
    return c.json({ up: res.status < 500 })
  } catch {
    return c.json({ up: false })
  }
})

// ---------- সেশন হেল্পার ----------
async function currentUser(c: any) {
  const token = getCookie(c.req.header('Cookie'), 'edusob_session')
  return getSessionUser(c.env.DB, token)
}

// ---------- পেজ ----------
app.get('/', async (c) => {
  return c.html(landingPage())
})

app.get('/signup', async (c) => {
  const user = await currentUser(c)
  if (user) return c.redirect('/dashboard')
  return c.html(signupPage())
})

app.get('/auth/signup', (c) => c.redirect('/signup'))
app.get('/auth/login', (c) => c.redirect('/login'))

app.get('/login', async (c) => {
  const user = await currentUser(c)
  if (user) return c.redirect('/dashboard')
  return c.html(loginPage())
})

app.get('/dashboard', async (c) => {
  const user = await currentUser(c)
  if (!user) return c.redirect('/login')
  return c.html(dashboardPage(user))
})

app.get('/results', async (c) => {
  const user = await currentUser(c)
  return c.html(resultsPage(!!user))
})

app.get('/board-challenge', async (c) => {
  const user = await currentUser(c)
  return c.html(boardChallengePage(!!user))
})

app.get('/news', async (c) => {
  const user = await currentUser(c)
  return c.html(newsPage(!!user))
})

app.get('/jobs', async (c) => {
  const user = await currentUser(c)
  return c.html(jobsPage(!!user, (user as any)?.education_level ?? ''))
})

app.get('/notices', async (c) => {
  const user = await currentUser(c)
  return c.html(noticesPage(!!user))
})

app.get('/mcq', async (c) => {
  const user = await currentUser(c)
  return c.html(mcqPage(!!user, (user as any)?.education_level ?? ''))
})

app.get('/cv', async (c) => {
  const user = await currentUser(c)
  return c.html(cvMakerPage(!!user))
})

app.get('/cv-maker', (c) => c.redirect('/cv'))

app.get('/admin/cv-templates', async (c) => {
  const user = await currentUser(c)
  return c.html(cvAdminPage((user as any)?.role === 'admin'))
})

app.get('/shop', async (c) => {
  const user = await currentUser(c)
  return c.html(shopPage(!!user))
})

app.get('/wallet', async (c) => {
  const user = await currentUser(c)
  if (!user) return c.redirect('/login')
  return c.html(walletPage(true))
})

app.get('/assisted', async (c) => {
  const user = await currentUser(c)
  if (!user) return c.redirect('/login')
  return c.html(assistedPage(true))
})

app.get('/admin/shop', async (c) => {
  const user = await currentUser(c)
  return c.html(shopAdminPage((user as any)?.role === 'admin'))
})

app.get('/admin', async (c) => {
  const user = await currentUser(c)
  return c.html(adminPage((user as any)?.role === 'admin'))
})

app.get('/planner', async (c) => {
  const user = await currentUser(c)
  return c.html(plannerPage(!!user))
})

app.get('/cgpa', async (c) => {
  const user = await currentUser(c)
  return c.html(cgpaPage(!!user))
})

app.get('/syllabus', async (c) => {
  const user = await currentUser(c)
  return c.html(syllabusPage(!!user, (user as any)?.education_level ?? ''))
})

app.get('/subscription', async (c) => {
  const user = await currentUser(c)
  return c.html(subscriptionPage(!!user))
})

app.get('/qpapers', async (c) => {
  const user = await currentUser(c)
  return c.html(qpapersPage(!!user, (user as any)?.education_level ?? ''))
})

app.get('/admission', async (c) => {
  const user = await currentUser(c)
  return c.html(admissionPage(!!user, (user as any)?.education_level ?? ''))
})
app.get('/admissions', async (c) => {
  const user = await currentUser(c)
  return c.html(admissionPage(!!user, (user as any)?.education_level ?? ''))
})

app.get('/scholarships', async (c) => {
  const user = await currentUser(c)
  return c.html(scholarshipsPage(!!user, (user as any)?.education_level ?? '', (user as any)?.ssc_gpa || (user as any)?.hsc_gpa || ''))
})
app.get('/scholarship', async (c) => {
  const user = await currentUser(c)
  return c.html(scholarshipsPage(!!user, (user as any)?.education_level ?? '', (user as any)?.ssc_gpa || (user as any)?.hsc_gpa || ''))
})

app.get('/teacher-support', async (c) => {
  const user = await currentUser(c)
  return c.html(teacherSupportPage(!!user))
})
app.get('/teachers', async (c) => {
  const user = await currentUser(c)
  return c.html(teacherSupportPage(!!user))
})

app.get('/profile', async (c) => {
  const user = await currentUser(c)
  if (!user) return c.redirect('/login')
  return c.html(profilePage(user))
})

export default app
