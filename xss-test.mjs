// রিয়েল-ব্রাউজার stored-XSS টেস্ট
// ১) সাধারণ সাইনআপ পথেই ক্ষতিকর নামে ইউজার তৈরি (name_bn-এ কোট — যা ফিল্টার হয় না)
// ২) এডমিন সেশনে /admin লোড করে Users ট্যাব
// ৩) ওই ইউজারের "রোল" বাটনে ক্লিক — XSS থাকলে alert ফায়ার করবে
import { chromium } from 'playwright-core'

// লোকাল ডেভ DB-এর টেস্ট পাসওয়ার্ড — প্রোডাকশনের পাসওয়ার্ড আলাদা ও রিপোতে নেই।
// প্রোডাকশনের বিপরীতে চালাতে: EDUSOB_ADMIN_PASS=... BASE=https://edusob.pages.dev node <script>
const BASE = process.env.BASE || 'http://127.0.0.1:3000'
const PAYLOAD = "রহিম'); alert('XSS-PWNED'); //"
const PHONE = '019' + String(Date.now()).slice(-8)

let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok ' : '  FAIL'} ${m}`); if (!ok) fail++ }

// ---- ১) malicious user (real signup path) ----
const su = await fetch(`${BASE}/api/auth/signup`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name_bn: PAYLOAD, phone: PHONE, password: 'test1234', religion: 'islam', education_level: 'hsc' }),
})
const suJson = await su.json().catch(() => ({}))
console.log(`\n[setup] signup ${PHONE} -> ok=${suJson.ok} code=${suJson.user_code || '-'}`)
log(!!suJson.ok, 'signup succeeded (payload stored via the normal user path)')

const li = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier: '01829486022', password: process.env.EDUSOB_ADMIN_PASS || 'Ab52944820@' }),
})
const liJson = await li.json()
log(!!liJson.token, 'admin login')

// ---- ২) admin panel ----
const browser = await chromium.launch()
const ctx = await browser.newContext()
await ctx.addCookies([{ name: 'edusob_session', value: liJson.token, url: BASE }])
const page = await ctx.newPage()

const dialogs = []
page.on('dialog', async (d) => { dialogs.push(d.message()); await d.dismiss() })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))

await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)

// Users ট্যাব — এখানেই jsq() ব্যবহার করা হয়েছে
const usersTab = page.locator('button', { hasText: /ইউজার|ব্যবহারকারী/ }).first()
if (await usersTab.count()) { await usersTab.click(); await page.waitForTimeout(2500) }
await page.waitForTimeout(1500)

// ক্ষতিকর নামটি টেবিলে এসেছে কি না
const payloadVisible = await page.locator(`text=${PHONE}`).count()
log(payloadVisible > 0, `malicious user row rendered (phone ${PHONE} visible)`)

const rawOnclick = await page.evaluate(() => {
  const b = [...document.querySelectorAll('button[onclick]')]
    .find((x) => (x.getAttribute('onclick') || '').includes('XSS-PWNED'))
  return b ? b.getAttribute('onclick') : null
})
console.log('\n[onclick attribute]')
console.log('  ' + (rawOnclick || '(not found)'))

// ---- ৩) ক্লিক — XSS থাকলে এখানেই alert আসবে ----
const btn = page.locator('button[onclick]', { hasText: 'রোল' })
const candidates = await page.evaluate(() =>
  [...document.querySelectorAll('button[onclick]')]
    .map((b, i) => ({ i, oc: (b.getAttribute('onclick') || '').slice(0, 400) }))
    .filter((x) => x.oc.includes('XSS-PWNED')).map((x) => x.i))
console.log(`\n[click] malicious buttons found: ${candidates.length}`)
for (const i of candidates.slice(0, 2)) {
  await page.evaluate((idx) => document.querySelectorAll('button[onclick]')[idx].click(), i)
  await page.waitForTimeout(900)
}
await page.waitForTimeout(1200)

console.log('\n[result]')
log(dialogs.length === 0, `no alert() after clicking (dialogs: ${JSON.stringify(dialogs)})`)
log(errors.length === 0, `no uncaught JS errors (${errors.length}) ${errors.slice(0, 2).join(' | ')}`)
log(candidates.length > 0, 'test was meaningful (found a button carrying the payload)')

await page.screenshot({ path: '/tmp/xss-admin.png', fullPage: false })
await browser.close()
console.log(`\n${fail === 0 ? '✅ ALL PASS — XSS NOT exploitable' : `❌ ${fail} check(s) FAILED`}`)
process.exit(fail === 0 ? 0 : 1)
