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

// সিকিউরিটি রেসপন্স হেডার
// Pages-এর `_headers` ফাইল শুধু স্ট্যাটিক অ্যাসেটে লাগে — এই অ্যাপের সব পেইজ
// SSR (ওয়ার্কার) থেকে আসে, তাই সেগুলোতে হেডার পৌঁছায় না। এখানে সেট করা হচ্ছে।
// CSP দেওয়া হয়নি: অ্যাপে ১২০+ ইনলাইন <script> ব্লক আছে, কড়া CSP সব ভেঙে দেবে।
app.use('*', async (c, next) => {
  await next()
  try {
    const h = c.res.headers
    h.set('X-Content-Type-Options', 'nosniff')
    h.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    h.set('X-Frame-Options', 'SAMEORIGIN')
    h.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=(), interest-cohort=()')
  } catch {
    // রেসপন্স Immutable/Streaming হলে হেডার সেট করা যায় না — চুপচাপ এড়িয়ে যাই
  }
})

// ---------- CSRF সুরক্ষা ----------
// সেশন কুকি `SameSite=None` — অর্থাৎ ক্রস-সাইট POST/PUT/DELETE-এও কুকি পাঠানো হয়।
// তাই শুধু SameSite-এর উপর ভরসা করা যায় না; Origin যাচাই বাধ্যতামূলক।
// ব্রাউজার state-changing রিকোয়েস্টে সবসময় Origin পাঠায়, তাই Origin থাকলে অবশ্যই
// Host-এর সাথে মিলতে হবে। সার্ভার-টু-সার্ভার কলে (গেটওয়ে IPN, curl) Origin থাকে না —
// সেগুলো ছাড় দেওয়া হয় (bKash কলব্যাক GET, তাই সেটিও প্রভাবিত নয়)।
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
app.use('*', async (c, next) => {
  if (SAFE_METHODS.has(c.req.method)) return next()
  const origin = c.req.header('Origin')
  if (!origin) return next()
  let originHost: string
  try {
    originHost = new URL(origin).host
  } catch {
    return c.json({ ok: false, error: 'অবৈধ Origin' }, 403)
  }
  const host = c.req.header('Host') || new URL(c.req.url).host
  if (originHost !== host) {
    return c.json({ ok: false, error: 'ক্রস-সাইট অনুরোধ অনুমোদিত নয় (CSRF)' }, 403)
  }
  return next()
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

// কয়েকটি হোস্টের পরিচিত উপনাম — ব্যাচ ও সিঙ্গেল দুই জায়গাতেই ব্যবহৃত
const KNOWN_HOST_ALIAS: Record<string, string> = {
  'sonaliseba.nu.ac.bd': 'results.nu.ac.bd',
  'bmeb.gov.bd': 'bmeb.ebmeb.gov.bd'
}

// হোস্ট অনুমোদিত কি না (www. সহ/ছাড়া, উপনামসহ)
function isAllowedStatusHost(rawHost: string): boolean {
  const host = String(rawHost || '').toLowerCase().replace(/^www\./, '')
  const effective = KNOWN_HOST_ALIAS[host] || host
  return ALLOWED_STATUS_HOSTS.has(effective) || ALLOWED_STATUS_HOSTS.has(String(rawHost || '').toLowerCase())
}

// দীর্ঘ URL-এর বদলে ছোট, স্টেবল ক্যাশ-কি (djb2 → base36)
function linkCacheKey(url: string): string {
  let h = 5381
  for (let i = 0; i < url.length; i++) h = ((h << 5) + h + url.charCodeAt(i)) | 0
  return 'link:' + (h >>> 0).toString(36) + ':' + url.length
}

// ---------- লিংক-স্ট্যাটাস ক্যাশ (৫ মিনিট) ----------
// /results পেজে ২৭টি আলাদা কল হতো, প্রতিটি ৮–১২ সেকেন্ড টাইমআউট → ১২+ সেকেন্ড লোড।
// এখন: ১টি ব্যাচ কল + ৫ মিনিট ক্যাশ + সীমিত কনকারেন্সি।
const linkStatusCache = new Map<string, { up: boolean; at: number }>()
const LINK_STATUS_TTL = 5 * 60 * 1000
const LINK_STATUS_TIMEOUT = 3500
const LINK_STATUS_CONCURRENCY = 8

async function probeLink(url: string): Promise<boolean> {
  try {
    if (!isAllowedStatusHost(new URL(url).hostname)) return false
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), LINK_STATUS_TIMEOUT)
    let res: Response | undefined
    try {
      res = await fetch(url, { method: 'HEAD', signal: ctrl.signal, redirect: 'follow' })
    } catch {
      // কিছু সার্ভার HEAD সাপোর্ট করে না — GET ফলব্যাক
      res = await fetch(url, { method: 'GET', signal: ctrl.signal, redirect: 'follow' })
    }
    clearTimeout(timer)
    return !!res && res.status < 500
  } catch {
    return false
  }
}
app.get('/api/link-status', async (c) => {
  const url = c.req.query('url') || ''
  try {
    const rawHost = new URL(url).hostname.toLowerCase()
    // www. প্রিফিক্স ও ভ্যারিয়েন্ট স্বীকার — যেমন www.bteb.gov.bd ≡ bteb.gov.bd
    const host = rawHost.replace(/^www\./, '')
    const effective = KNOWN_HOST_ALIAS[host] || host
    if (!ALLOWED_STATUS_HOSTS.has(effective) && !ALLOWED_STATUS_HOSTS.has(rawHost)) {
      return c.json({ up: false, error: 'অননুমোদিত' }, 400)
    }
    // ক্যাশ হিট হলে সার্ভারে কোনো রিকোয়েস্টই যাবে না
    const now0 = Date.now()
    const hit0 = linkStatusCache.get(url)
    if (hit0 && now0 - hit0.at < LINK_STATUS_TTL) return c.json({ up: hit0.up, cached: true })
    const up0 = await probeLink(url)
    linkStatusCache.set(url, { up: up0, at: Date.now() })
    return c.json({ up: up0 })
  } catch {
    return c.json({ up: false })
  }
})

// ---------- ব্যাচ লিংক-স্ট্যাটাস (২৭ কল → ১ কল) ----------
app.post('/api/link-status/batch', async (c) => {
  const body = await c.req.json<any>().catch(() => null)
  const urls: string[] = Array.isArray(body?.urls)
    ? [...new Set((body.urls as unknown[]).map((u) => String(u || '')).filter(Boolean))].slice(0, 60)
    : []
  if (!urls.length) return c.json({ ok: true, results: {}, cached: 0, checked: 0 })

  const db = (c.env as any).DB
  const now = Date.now()
  const results: Record<string, boolean> = {}
  const todo: string[] = []
  const keyOf = new Map<string, string>()

  for (const u of urls) { keyOf.set(u, linkCacheKey(u)); todo.push(u) }

  // স্তর ১: ইন-মেমোরি (একই isolate-এ অন্য রিকোয়েস্টের ফলাফল)
  let pending: string[] = []
  for (const u of todo) {
    const hit = linkStatusCache.get(u)
    if (hit && now - hit.at < LINK_STATUS_TTL) results[u] = hit.up
    else pending.push(u)
  }

  // স্তর ২: D1 feed_cache — আগের isolate-এর ফলাফলও কাজে লাগে (প্রোডাকশনে আসল উইন)
  if (pending.length && db) {
    try {
      const keys = pending.map((u) => keyOf.get(u)!)
      const placeholders = keys.map(() => '?').join(',')
      const rows = await db.prepare(
        `SELECT cache_key, value, updated_at FROM feed_cache WHERE cache_key IN (${placeholders})`
      ).bind(...keys).all()
      const fresh = new Map<string, { up: boolean; at: number }>()
      for (const r of (rows?.results || []) as any[]) {
        if (now - Number(r.updated_at) < LINK_STATUS_TTL) {
          try { fresh.set(String(r.cache_key), JSON.parse(String(r.value))) } catch {}
        }
      }
      const stillPending: string[] = []
      for (const u of pending) {
        const f = fresh.get(keyOf.get(u)!)
        if (f) { results[u] = f.up; linkStatusCache.set(u, { up: f.up, at: f.at }) }
        else stillPending.push(u)
      }
      pending = stillPending
    } catch (e) {
      console.warn('[link-status cache read]', e)
    }
  }

  const cachedCount = urls.length - pending.length

  // সীমিত কনকারেন্সি — সব সাইটে একসাথে ঝাঁপিয়ে পড়া শিষ্টাচারবিরুদ্ধ
  let cursor = 0
  async function worker() {
    while (cursor < pending.length) {
      const u = pending[cursor++]
      const up = await probeLink(u)
      results[u] = up
      const at = Date.now()
      linkStatusCache.set(u, { up, at })
    }
  }
  const lanes = Math.min(LINK_STATUS_CONCURRENCY, pending.length)
  if (lanes > 0) await Promise.all(Array.from({ length: lanes }, worker))

  // ফলাফল D1-এ সংরক্ষণ (পরবর্তী isolate/রিকোয়েস্টের জন্য)
  const checked = pending.length
  if (checked > 0 && db) {
    try {
      const nowMs = Date.now()
      await db.batch(pending.map((u) => db.prepare(
        'INSERT INTO feed_cache (cache_key, value, updated_at) VALUES (?, ?, ?) ' +
        'ON CONFLICT(cache_key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at'
      ).bind(keyOf.get(u)!, JSON.stringify({ up: !!results[u], at: nowMs }), nowMs)))
    } catch (e) {
      console.warn('[link-status cache write]', e)
    }
  }

  return c.json({ ok: true, results, cached: cachedCount, checked })
})

// ---------- সেশন হেল্পার ----------
async function currentUser(c: any) {
  let token = getCookie(c.req.header('Cookie'), 'edusob_session')
  if (!token) {
    const authHeader = c.req.header('Authorization')
    if (authHeader?.startsWith('Bearer ')) token = authHeader.slice(7).trim()
  }
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
