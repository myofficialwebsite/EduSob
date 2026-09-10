// nonce-ভিত্তিক CSP — রিয়েল-ফ্লো টেস্ট
//   ১) প্রতি রিকোয়েস্টে nonce বদলায়
//   ২) প্রতিটি রুটে ইনলাইন স্ক্রিপ্ট সত্যিই চলে (nonce মিলছে)
//   ৩) কোনো CSP ভায়োলেশন নেই (ইনলাইন স্ক্রিপ্ট, স্টাইল, ছবি, ফন্ট সব ঠিকঠাক)
//   ৪) নেগেটিভ কন্ট্রোল: nonce ছাড়া ইনজেক্ট করা <script> ব্লক হয় — নইলে টেস্টের মানে নেই
//   ৫) 3rd-party স্ক্রিপ্ট লোড ব্লক হয়
//
// চালান: node csp-test.mjs   ·   BASE=https://edusob.pages.dev node csp-test.mjs
import { chromium } from 'playwright-core'

const BASE = process.env.BASE || 'http://127.0.0.1:3000'
let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok ' : '  FAIL'} ${m}`); if (!ok) fail++ }

const ROUTES = [
  '/', '/results', '/mcq', '/admission', '/scholarships', '/qpapers', '/syllabus', '/notices', '/jobs', '/news',
  '/teacher-support', '/cv', '/planner', '/cgpa', '/board-challenge', '/shop', '/assisted', '/subscription',
  '/dashboard', '/profile', '/wallet', '/admin', '/admin/shop', '/admin/cv-templates',
  '/teachers', '/admissions', '/cv-maker', '/scholarship', '/login', '/signup',
]

const li = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier: process.env.TEST_PHONE || '01829486022', password: process.env.TEST_PASS || 'Ab52944820@' }),
}).then((r) => r.json())
log(!!li.token, 'admin login')

// ---------- ১. nonce প্রতিবার বদলায় ----------
console.log('\n=== nonce-ভিত্তিক CSP ===\n')
const grab = async () => {
  const r = await fetch(`${BASE}/dashboard`, { headers: { Cookie: 'edusob_session=' + li.token } })
  const csp = r.headers.get('content-security-policy') || ''
  const m = csp.match(/'nonce-([A-Za-z0-9+/]+)'/)
  return { csp, nonce: m ? m[1] : null, html: await r.text() }
}
const a1 = await grab()
const a2 = await grab()
log(!!a1.nonce, `CSP হেডারে nonce আছে (${a1.nonce ? a1.nonce.slice(0, 8) + '…' : 'নেই'})`)
log(!!a1.nonce && a1.nonce !== a2.nonce, 'প্রতি রিকোয়েস্টে nonce বদলায়')
log(a1.csp.includes("default-src 'self'") && a1.csp.includes("script-src 'self' 'nonce-"), "script-src 'self' + nonce")
log(!a1.csp.includes("script-src 'self' 'unsafe-inline'"), "script-src-এ 'unsafe-inline' নেই")
const scriptTags = (a1.html.match(/<script\b[^>]*>/gi) || [])
const nonced = scriptTags.filter((t) => /nonce=/.test(t))
log(scriptTags.length > 0 && scriptTags.length === nonced.length,
  `সব <script> ট্যাগে nonce বসেছে (${nonced.length}/${scriptTags.length})`)

// ---------- ২/৩. প্রতি রুটে ভায়োলেশন নেই + ইনলাইন স্ক্রিপ্ট চলে ----------
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } })
await ctx.addCookies([{ name: 'edusob_session', value: li.token, url: BASE }])

const initScript = () => {
  window.__csp = []
  document.addEventListener('securitypolicyviolation', function (e) {
    window.__csp.push((e.violatedDirective || '?') + ' ← ' + (e.blockedURI || '?'))
  })
}

let worst = []
for (const route of ROUTES) {
  const p = await ctx.newPage()
  const errs = []
  p.on('pageerror', (e) => errs.push(String(e)))
  p.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()) })
  await p.addInitScript(initScript)
  await p.goto(BASE + route, { waitUntil: 'networkidle' })
  await p.waitForTimeout(700)
  const r = await p.evaluate(() => ({
    viol: window.__csp || [],
    inlineRan: typeof window.CMD_STATE !== 'undefined' || typeof window.edusobOpenCommandPalette === 'function',
    scripts: document.querySelectorAll('script').length,
    external: [...document.querySelectorAll('script[src]')].filter((s) => !s.src.startsWith(location.origin)).length,
  }))
  const bad = r.viol.length > 0 || errs.length > 0 || !r.inlineRan
  if (bad) worst.push(route)
  console.log(`  ${bad ? 'FAIL' : ' ok '} ${route.padEnd(20)} scripts=${String(r.scripts).padStart(2)} inlineচলেছে=${r.inlineRan ? 'হ্যাঁ' : 'না'} ভায়োলেশন=${r.viol.length} এরর=${errs.length}` +
    (r.viol.length ? ' → ' + r.viol.slice(0, 2).join(' | ') : '') + (errs.length ? ' → ' + errs[0].slice(0, 90) : ''))
  if (bad) fail++
  await p.close()
}
log(worst.length === 0, `সব ${ROUTES.length} রুটে CSP ভায়োলেশন ০ ও ইনলাইন স্ক্রিপ্ট চলছে`)

// ---------- ৪. নেগেটিভ কন্ট্রোল: nonce ছাড়া ইনজেক্টেড স্ক্রিপ্ট ব্লক হবে ----------
console.log('\n  — নেগেটিভ কন্ট্রোল (ইনজেকশন আসলেই ব্লক হচ্ছে তো?) —')
const p2 = await ctx.newPage()
await p2.addInitScript(initScript)
await p2.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' })
await p2.waitForTimeout(600)
const inj = await p2.evaluate(() => {
  return new Promise((resolve) => {
    window.__pwned = false
    const s = document.createElement('script')
    s.textContent = 'window.__pwned = true;'
    document.body.appendChild(s)
    setTimeout(() => resolve({ pwned: window.__pwned, viol: window.__csp || [] }), 500)
  })
})
log(inj.pwned === false, 'nonce ছাড়া ইনজেক্টেড <script> চলেনি (XSS ব্লক)')
log(inj.viol.length > 0, `ব্রাউজার CSP ভায়োলেশন রিপোর্ট করেছে (${inj.viol[0] || '—'})`)

// ---------- ৫. 3rd-party স্ক্রিপ্ট ব্লক ----------
const ext = await p2.evaluate(() => {
  return new Promise((resolve) => {
    window.__ext = false
    const s = document.createElement('script')
    s.src = 'https://example.com/should-be-blocked.js'
    s.onload = () => { window.__ext = true }
    document.body.appendChild(s)
    setTimeout(() => resolve({ loaded: window.__ext, viol: window.__csp || [] }), 1500)
  })
})
log(ext.loaded === false, '3rd-party স্ক্রিপ্ট লোড ব্লক হয়েছে')
log(ext.viol.some((v) => v.indexOf('script-src') === 0), `script-src ভায়োলেশন নথিভুক্ত (${ext.viol.filter((v) => v.indexOf('script-src') === 0).length}টি)`)

await b.close()
console.log(fail === 0 ? '\n✅ ALL PASS\n' : `\n❌ ${fail} টি চেক ব্যর্থ\n`)
process.exit(fail === 0 ? 0 : 1)
