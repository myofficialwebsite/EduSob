// MCQ কোটা শেষ হলে UI-তে কী দেখায় — ব্রাউজারে যাচাই
import { chromium } from 'playwright-core'
const BASE = 'http://127.0.0.1:3000'
let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok ' : '  FAIL'} ${m}`); if (!ok) fail++ }

// অতিথি কোটা (৪০) আগেই শেষ করে ফেলি
let got = 0
for (let i = 0; i < 6; i++) {
  const r = await fetch(`${BASE}/api/tools/mcq/quiz?level=ssc&count=10`)
  if (r.status !== 200) break
  got += ((await r.json()).questions || []).length
}
console.log(`\n[setup] guest quota consumed: ${got} questions`)

const b = await chromium.launch()
const p = await b.newPage()
const errs = []
p.on('pageerror', (e) => errs.push(String(e)))
await p.goto(`${BASE}/mcq`, { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)

// প্রথমে একটি বিষয় সিলেক্ট + স্টার্ট
const start = p.locator('#start-btn')
log(await start.count() > 0, 'start button present')
await start.click()
await p.waitForTimeout(1800)

const notice = await p.locator('#quiz-notice').count()
const noticeText = notice ? (await p.locator('#quiz-notice').innerText()).trim() : null
const cta = notice ? await p.locator('#quiz-notice a').count() : 0
const ctaHref = cta ? await p.locator('#quiz-notice a').first().getAttribute('href') : null

console.log('\n[notice]', JSON.stringify(noticeText))
log(notice > 0, 'quota notice rendered in-page (not a generic alert)')
log(!!noticeText && noticeText.includes('সীমা'), 'notice explains the limit')
log(cta > 0 && !!ctaHref && ctaHref.includes('/login'), `login CTA present -> ${ctaHref}`)
log(errs.length === 0, `no JS errors (${errs.length}) ${errs.slice(0, 1)}`)

await p.screenshot({ path: '/tmp/mcq-quota.png' })
await b.close()
console.log(`\n${fail === 0 ? '✅ ALL PASS' : `❌ ${fail} FAILED`}`)
process.exit(fail === 0 ? 0 : 1)
