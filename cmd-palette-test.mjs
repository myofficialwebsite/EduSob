// ⌘K কমান্ড প্যালেট — রিয়েল-ফ্লো টেস্ট
//   ১) Ctrl/⌘+K দিয়ে খোলে, বোতাম দিয়েও খোলে, Esc/ব্যাকড্রপ দিয়ে বন্ধ হয়
//   ২) বাংলা ও ইংরেজি দুটোতেই খোঁজা যায় (MCQ → "mcq", ওয়ালেট → "wallet")
//   ৩) ↑↓ + Enter দিয়ে নেভিগেট; Enter-এ সত্যিই পেজ বদলায়
//   ৪) লগইন/অ্যাডমিন অনুযায়ী কমান্ড দেখা দেয় (গেস্টে "আমার ওয়ালেট" থাকবে না)
//   ৫) মোবাইলে (৩৯০px) ওভারফ্লো নেই, ট্যাপ টার্গেট যথেষ্ট বড়
//
// চালান: node cmd-palette-test.mjs   ·   BASE=https://edusob.pages.dev node cmd-palette-test.mjs
import { chromium } from 'playwright-core'

const BASE = process.env.BASE || 'http://127.0.0.1:3000'
let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok ' : '  FAIL'} ${m}`); if (!ok) fail++ }

const li = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier: process.env.TEST_PHONE || '01829486022', password: process.env.TEST_PASS || 'Ab52944820@' }),
}).then((r) => r.json())
log(!!li.token, 'admin login')

const b = await chromium.launch()
const errs = []
const mkCtx = async (vp, cookie) => {
  const ctx = await b.newContext({ viewport: vp })
  if (cookie) await ctx.addCookies([{ name: 'edusob_session', value: cookie, url: BASE }])
  const p = await ctx.newPage()
  p.on('pageerror', (e) => errs.push(String(e)))
  p.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()) })
  return p
}

const open = async (p) => {
  await p.keyboard.press('Control+k')
  await p.waitForTimeout(250)
}
const titles = (p) => p.evaluate(() => [...document.querySelectorAll('#cmdList li[data-idx] > span.min-w-0 > span:first-child')].map((s) => s.textContent))
const isOpen = (p) => p.evaluate(() => !document.getElementById('cmdRoot').classList.contains('hidden'))

// ================= ডেস্কটপ =================
console.log('\n=== ⌘K কমান্ড প্যালেট ===\n')
const p = await mkCtx({ width: 1440, height: 900 }, li.token)
await p.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' })
await p.waitForTimeout(800)

log(await p.evaluate(() => !!document.getElementById('cmdRoot')), 'প্যালেট মার্কআপ পেজে আছে')
log(await isOpen(p) === false, 'শুরুতে বন্ধ থাকে')

await open(p)
log(await isOpen(p), 'Ctrl + K দিয়ে খোলে')
log(await p.evaluate(() => document.activeElement && document.activeElement.id === 'cmdInput'), 'ইনপুটে ফোকাস চলে যায়')
log(await p.evaluate(() => document.body.style.overflow === 'hidden'), 'পেছনের পেজ স্ক্রল বন্ধ থাকে')

const all = await titles(p)
log(all.length > 10, `খালি সার্চে সব কমান্ড (${all.length}টি)`)
log(all.some((t) => t.indexOf('MCQ') === 0), 'MCQ কমান্ড আছে')

// ইংরেজি টাইপ করে বাংলা কমান্ড খোঁজা
await p.fill('#cmdInput', 'mcq')
await p.waitForTimeout(200)
let r = await titles(p)
log(r[0] === 'MCQ পরীক্ষা', `"mcq" লিখলে প্রথমে আসে: ${r[0]}`)

await p.fill('#cmdInput', 'wallet')
await p.waitForTimeout(200)
r = await titles(p)
log(r[0] === 'আমার ওয়ালেট', `"wallet" লিখলে: ${r[0]}`)

await p.fill('#cmdInput', 'বোনাস')
await p.waitForTimeout(200)
r = await titles(p)
log(r[0] === 'অনবোর্ডিং বোনাস ক্লেইম', `"বোনাস" লিখলে: ${r[0]}`)

// অ্যাডমিন-অনলি কমান্ড
await p.fill('#cmdInput', 'প্রশাসন')
await p.waitForTimeout(200)
r = await titles(p)
log(r.indexOf('প্রশাসন') !== -1, 'অ্যাডমিন হলে "প্রশাসন" কমান্ড দেখা যায়')

// ↑↓ নেভিগেশন
await p.fill('#cmdInput', '')
await p.waitForTimeout(200)
const before = await p.evaluate(() => document.querySelector('#cmdList li[data-idx="0"]').className)
await p.keyboard.press('ArrowDown')
await p.waitForTimeout(150)
const afterDown = await p.evaluate(() => ({
  sel0: document.querySelector('#cmdList li[data-idx="0"]').className,
  sel1: document.querySelector('#cmdList li[data-idx="1"]').className,
  activeDesc: document.getElementById('cmdInput').getAttribute('aria-activedescendant'),
}))
log(before.indexOf('bg-orange-500/15') !== -1 && afterDown.sel0.indexOf('bg-orange-500/15') === -1 && afterDown.sel1.indexOf('bg-orange-500/15') !== -1,
  '↓ চাপলে নির্বাচন পরের আইটেমে যায়')
log(afterDown.activeDesc === 'cmd-opt-1', 'aria-activedescendant আপডেট হয়')
await p.keyboard.press('ArrowUp')
await p.waitForTimeout(150)
log(await p.evaluate(() => document.getElementById('cmdInput').getAttribute('aria-activedescendant')) === 'cmd-opt-0', '↑ চাপলে আগের আইটেমে ফেরে')

// Esc → বন্ধ
await p.keyboard.press('Escape')
await p.waitForTimeout(200)
log(await isOpen(p) === false, 'Esc দিয়ে বন্ধ হয়')
log(await p.evaluate(() => document.body.style.overflow === ''), 'বন্ধ হলে স্ক্রল ফিরে আসে')

// বোতাম দিয়ে খোলা + ব্যাকড্রপ দিয়ে বন্ধ
await p.click('button[aria-label^="খুঁজুন"]')
await p.waitForTimeout(250)
log(await isOpen(p), 'হেডারের বোতাম দিয়েও খোলে')
await p.mouse.click(20, 20)
await p.waitForTimeout(250)
log(await isOpen(p) === false, 'ব্যাকড্রপে ক্লিক করলে বন্ধ হয়')

// Enter → নেভিগেশন
await open(p)
await p.fill('#cmdInput', 'result')
await p.waitForTimeout(250)
await p.keyboard.press('Enter')
await p.waitForTimeout(1200)
log(new URL(p.url()).pathname.indexOf('/result') === 0, `Enter-এ নেভিগেট করে (→ ${new URL(p.url()).pathname})`)

// ================= গেস্ট =================
console.log('\n  — গেস্ট (লগইন নেই) —')
const g = await mkCtx({ width: 1440, height: 900 }, null)
await g.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await g.waitForTimeout(600)
await open(g)
await g.waitForTimeout(500)
const gt = await titles(g)
log(gt.indexOf('লগইন') !== -1 && gt.indexOf('ফ্রি সাইন-আপ') !== -1, 'গেস্টের জন্য লগইন/সাইন-আপ কমান্ড')
log(gt.indexOf('আমার ওয়ালেট') === -1, 'গেস্টের কাছে "আমার ওয়ালেট" লুকানো')
log(gt.indexOf('প্রশাসন') === -1, 'গেস্টের কাছে "প্রশাসন" লুকানো')
log(gt.length > 10, `গেস্টেও পেজ কমান্ডগুলো আছে (${gt.length}টি)`)

// ================= মোবাইল =================
console.log('\n  — মোবাইল (৩৯০px) —')
const m = await mkCtx({ width: 390, height: 844 }, li.token)
await m.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' })
await m.waitForTimeout(700)
await m.click('button[aria-label^="খুঁজুন"]')
await m.waitForTimeout(300)
const mm = await m.evaluate(() => {
  const root = document.getElementById('cmdRoot')
  const box = root.querySelector('div:nth-child(2)').getBoundingClientRect()
  const rows = [...document.querySelectorAll('#cmdList li[data-idx]')]
  const input = document.getElementById('cmdInput')
  return {
    open: !root.classList.contains('hidden'),
    overflowX: box.right > window.innerWidth + 1 || box.left < -1,
    boxW: Math.round(box.width),
    vw: window.innerWidth,
    minRowH: Math.min(...rows.map((r) => Math.round(r.getBoundingClientRect().height))),
    inputFont: getComputedStyle(input).fontSize,
    docScrollW: document.documentElement.scrollWidth,
  }
})
log(mm.open, 'মোবাইলে বোতাম দিয়ে খোলে')
log(mm.overflowX === false, `মোবাইলে ওভারফ্লো নেই (বক্স ${mm.boxW}px / ভিউপোর্ট ${mm.vw}px)`)
log(mm.minRowH >= 44, `ট্যাপ টার্গেট যথেষ্ট বড় (সবচেয়ে ছোট সারি ${mm.minRowH}px)`)
log(parseFloat(mm.inputFont) >= 16, `ইনপুট ফন্ট ${mm.inputFont} — iOS অটো-জুম হবে না`)
log(mm.docScrollW <= mm.vw + 1, `পেজে হরাইজন্টাল স্ক্রল নেই (${mm.docScrollW}px)`)

await b.close()

console.log(`\n  JS ত্রুটি: ${errs.length}${errs.length ? ' → ' + errs.slice(0, 3).join(' | ') : ''}`)
log(errs.length === 0, 'কোনো JS ত্রুটি নেই')
console.log(fail === 0 ? '\n✅ ALL PASS\n' : `\n❌ ${fail} টি চেক ব্যর্থ\n`)
process.exit(fail === 0 ? 0 : 1)
