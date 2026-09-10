// লকড কনটেন্টের কনটেক্সচুয়াল আপসেল CTA — ব্রাউজারে যাচাই
import { chromium } from 'playwright-core'
const BASE = process.env.BASE || 'http://127.0.0.1:3000'
let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok ' : '  FAIL'} ${m}`); if (!ok) fail++ }

// ফ্রি-প্ল্যান ইউজার (লকড কনটেন্ট দেখতে হবে)
const li = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier: process.env.TEST_PHONE || '01911000001', password: process.env.TEST_PASS || 'test1234' }),
}).then((r) => r.json())
log(!!li.token, `free user login (${li.role || 'user'})`)

const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } })
await ctx.addCookies([{ name: 'edusob_session', value: li.token, url: BASE }])
const p = await ctx.newPage()
const errs = []
p.on('pageerror', (e) => errs.push(String(e)))

// ---------- ১) /qpapers-এ লকড কার্ডের CTA ----------
await p.goto(`${BASE}/qpapers`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)

const ctas = await p.evaluate(() => {
  return [...document.querySelectorAll('a[href*="/subscription?plan="]')].map((a) => ({
    text: (a.textContent || '').trim(),
    href: a.getAttribute('href'),
    title: a.getAttribute('title') || '',
  }))
})
console.log('\n[locked CTAs on /qpapers]', JSON.stringify(ctas.slice(0, 3), null, 1))
log(ctas.length > 0, `found ${ctas.length} locked-item CTA(s)`)
log(ctas.every((c) => c.href.includes('plan=')), 'every CTA deep-links to a specific plan')
log(ctas.every((c) => /স্ট্যান্ডার্ড|প্রিমিয়াম/.test(c.text)), 'CTA names the required plan (not generic "আনলক")')

const distinct = [...new Set(ctas.map((c) => (c.href.match(/plan=([^&]*)/) || [])[1]))].sort()
console.log('[plans referenced]', distinct)
log(distinct.length > 0 && distinct.every((d) => ['standard', 'premium'].includes(d)), `plans valid: ${distinct.join(', ')}`)

// ---------- ২) /subscription?plan=premium হাইলাইট ----------
const plan = distinct.includes('premium') ? 'premium' : distinct[0]
await p.goto(`${BASE}/subscription?plan=${plan}&from=qpapers`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2200)

const up = await p.evaluate((slug) => {
  const el = document.getElementById('plan-card-' + slug)
  return {
    cardExists: !!el,
    highlighted: el ? el.className.includes('ring-2') : false,
    banner: [...document.querySelectorAll('div')]
      .map((d) => (d.textContent || '').trim())
      .filter((t) => t.includes('প্যাকেজে পাবেন'))[0] || null,
  }
}, plan)
console.log('\n[/subscription?plan=' + plan + ']', JSON.stringify(up, null, 1))
log(up.cardExists, `plan card #plan-card-${plan} exists`)
log(up.highlighted, 'target plan is visually highlighted (ring)')
log(!!up.banner, 'contextual banner explains why they are here')
log(errs.length === 0, `no JS errors (${errs.length}) ${errs.slice(0, 1)}`)

await p.screenshot({ path: '/tmp/upsell.png' })
await b.close()
console.log(`\n${fail === 0 ? '✅ ALL PASS' : `❌ ${fail} FAILED`}`)
process.exit(fail === 0 ? 0 : 1)
