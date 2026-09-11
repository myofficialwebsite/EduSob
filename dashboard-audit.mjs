/**
 * ব্যবহারকারীর ড্যাশবোর্ড ইন্টারঅ্যাকশন অডিট (`node dashboard-audit.mjs`).
 *
 * অ্যাডমিন যেভাবে যাচাই করা হয়েছে (`admin-audit.mjs`), ব্যবহারকারীর
 * ড্যাশবোর্ডও ঠিক সেভাবে — শুধু পেজ লোড করলে চলবে না, মোডাল ও টগলগুলো
 * সত্যি খুলে দেখতে হবে। এখানে মূল কাজগুলোই হয়: টাকা যোগ, শিক্ষকের প্রশ্ন,
 * রেজাল্ট সংরক্ষণ, বিজ্ঞপ্তি, ড্রয়ার, FAB।
 *
 * মোবাইল ভিউপোর্টে (৩৯০px) পরীক্ষা করা হয় — ড্যাশবোর্ড সবচেয়ে বেশি ব্যবহৃত
 * হয় ফোনেই, আর সেখানেই লেআউট ভাঙার সম্ভাবনা বেশি।
 *
 * ⚠️ ডিফল্টরূপে **লোকালেই** চলে (`EDUSOB_BASE` দিয়ে প্রোডাকশন দেওয়া যায়,
 *    কিন্তু কিছু টগল সত্যিকারের অবস্থা বদলাতে পারে — যেমন বিজ্ঞপ্তি)।
 */
import { chromium } from 'playwright'

const BASE = process.env.EDUSOB_BASE || 'http://127.0.0.1:3000'
const PHONE = process.env.EDUSOB_PHONE || '01829486022'
const PASS = process.env.EDUSOB_PASS || 'Ab52944820@'

const IGNORE = [/favicon/i, /ResizeObserver loop/i]

/** মোডাল — যেগুলো আর্গুমেন্ট ছাড়াই খোলা যায় */
const MODALS = [
  ['টাকা যোগ (ওয়ালেট)',   'openAddMoneyModal'],
  ['শিক্ষকের প্রশ্ন',      'openAskTeacherModal'],
  ['বিজ্ঞপ্তি',            'openNotificationsModal'],
  ['রেজাল্ট সংরক্ষণ',      'openSaveRollModal'],
]
/* ⚠️ toggleDrawer(show): আর্গুমেন্ট ছাড়া ডাকলে show=undefined → 'hidden' যোগ
   হয়, অর্থাৎ ড্রয়ার **বন্ধ** হয়, খোলে না। তাই true পাঠাতে হবে।
   ⚠️ FAB (toggleFab / #fabMenu / #dashFab) এখানে পরীক্ষা করা হয় না — সেই
   মার্কআপ ইচ্ছে করেই সরানো হয়েছিল, আর অবশিষ্ট মৃত JS-টি এই রিভিউতেই মুছে
   ফেলা হয়েছে। ফলে FAB এখন সম্পূর্ণ অনুপস্থিত (সেটিই প্রত্যাশিত)।
   ড্রয়ার position:fixed নয় (নেস্টেড), তাই জেনেরিক স্ক্যান মিস করতে পারে —
   নির্দিষ্ট লক্ষ্য-এলিমেন্ট চেক করতে হয়। */
const TOGGLES = [
  ['ড্রয়ার', 'toggleDrawer', 'true', '#mobileDrawerWrap'],
]

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
const page = await ctx.newPage()

const errors = []
const bad = []
page.on('console', (m) => {
  if (m.type() !== 'error') return
  const t = m.text()
  if (IGNORE.some((re) => re.test(t))) return
  errors.push(`console: ${t.slice(0, 150)}`)
})
page.on('pageerror', (e) => errors.push(`exception: ${String(e.message).slice(0, 150)}`))
page.on('response', (r) => { if (r.status() >= 400 && !/favicon/i.test(r.url())) bad.push(`${r.status()} ${r.url().replace(BASE, '').slice(0, 70)}`) })
page.on('requestfailed', (r) => { if (!/favicon/i.test(r.url())) bad.push(`FAIL ${r.url().replace(BASE, '').slice(0, 70)}`) })

console.log(`\n===== ড্যাশবোর্ড ইন্টারঅ্যাকশন অডিট — ${BASE} =====`)

await page.goto(BASE + '/login', { waitUntil: 'load', timeout: 45000 })
await page.fill('#loginPhoneInput', PHONE)
await page.fill('#loginPassInput', PASS)
await Promise.all([page.waitForLoadState('load'), page.click('button[type=submit]')])
await page.waitForTimeout(1500)

await page.goto(BASE + '/dashboard', { waitUntil: 'load', timeout: 45000 })
await page.waitForTimeout(2000)
console.log(`লগইন → ${new URL(page.url()).pathname}\n`)

const problems = []

/** একটি ফাংশন ডেকে একটি মোডাল/প্যানেল দেখা গেল কি */
async function openAndInspect(label, fn, argExpr = '', targetSel = '') {
  const before = errors.length + bad.length
  const r = await page.evaluate(({ f, arg, sel }) => {
    if (typeof window[f] !== 'function') return { missing: true }
    try { window[f](arg === '' ? undefined : (arg === 'true' ? true : arg)) } catch (e) { return { err: String(e.message) } }
    // নির্দিষ্ট লক্ষ্য থাকলে সেটিই চেক — নইলে যেকোনো দৃশ্যমান ওভারলে
    if (sel) {
      const el = document.querySelector(sel)
      if (!el) return { count: 0, text: '' }
      const visible = !el.classList.contains('hidden') && el.getBoundingClientRect().height > 0
      return { count: visible ? 1 : 0, text: visible ? (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 44) : '' }
    }
    const open = [...document.querySelectorAll('div,section,aside')].filter((d) => {
      const st = getComputedStyle(d)
      return !d.classList.contains('hidden') && st.position === 'fixed' &&
             d.getBoundingClientRect().width > 120 && (d.innerText || '').trim().length > 10
    })
    return { count: open.length, text: open.length ? (open[0].innerText || '').trim().replace(/\s+/g, ' ').slice(0, 44) : '' }
  }, { f: fn, arg: argExpr, sel: targetSel })
  await page.waitForTimeout(400)
  const newIssues = errors.length + bad.length - before
  if (r.missing) { console.log(`  ⚠️  ${label.padEnd(20)} — ${fn}() পাওয়া যায়নি`); problems.push(`${label}: ফাংশন নেই`) }
  else if (r.err) { console.log(`  ❌ ${label.padEnd(20)} — ${r.err.slice(0, 70)}`); problems.push(`${label}: এরর`) }
  else if (!r.count) { console.log(`  ⚠️  ${label.padEnd(20)} — খোলার পর কিছু দেখা গেল না`); problems.push(`${label}: ফাঁকা`) }
  else if (newIssues > 0) { console.log(`  ⚠️  ${label.padEnd(20)} — ${newIssues}টি নতুন সমস্যা`); problems.push(`${label}: ${newIssues} সমস্যা`) }
  else console.log(`  ✅ ${label.padEnd(20)} "${r.text}"`)
  // বন্ধ করা (Esc) — যাতে পরের মোডাল পরিষ্কার ভিত্তিতে খোলে
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForTimeout(250)
}

console.log('── মোডাল ─────────────────────────────────────────')
for (const [label, fn] of MODALS) await openAndInspect(label, fn)

console.log('\n── টগল ───────────────────────────────────────────')
for (const [label, fn, arg, sel] of TOGGLES) await openAndInspect(label, fn, arg, sel)

/* স্ক্রল-টু-টপ: ২০০px-এর নিচে লুকানো, ওপরে দেখা দেবে, ক্লিকে শীর্ষে যাবে */
console.log('\n── স্ক্রল-টু-টপ (মোবাইল) ─────────────────────────')
await page.goto(BASE + '/dashboard', { waitUntil: 'load', timeout: 45000 })
await page.waitForTimeout(1500)
const vis = () => page.evaluate(() => {
  const b = document.getElementById('dashScrollTopBtn')
  if (!b) return { missing: true }
  const st = getComputedStyle(b)
  return { display: st.display, opacity: st.opacity, pe: st.pointerEvents,
           right: Math.round(window.innerWidth - b.getBoundingClientRect().right),
           h: Math.round(b.getBoundingClientRect().height) }
})
const v0 = await vis()
if (v0.missing) { console.log('  ❌ #dashScrollTopBtn অনুপস্থিত'); problems.push('স্ক্রল-টু-টপ: বোতাম নেই') }
else {
  console.log(`  শীর্ষে:     display=${v0.display} opacity=${v0.opacity} ${v0.display === 'none' ? '✅ লুকানো' : '⚠️ দেখা যাচ্ছে'}`)
  if (v0.display !== 'none') problems.push('স্ক্রল-টু-টপ: শীর্ষে লুকানো নয়')
  await page.evaluate(() => window.scrollTo(0, 900))
  await page.waitForTimeout(700)
  const v1 = await vis()
  console.log(`  ৯০০px নিচে: display=${v1.display} opacity=${v1.opacity} pointer-events=${v1.pe} ${v1.display !== 'none' && v1.opacity === '1' ? '✅ দৃশ্যমান' : '⚠️ আসেনি'}`)
  if (v1.display === 'none' || v1.opacity !== '1') problems.push('স্ক্রল-টু-টপ: স্ক্রলে দেখা দিল না')
  await page.evaluate(() => document.getElementById('dashScrollTopBtn').click())
  await page.waitForTimeout(1200)
  const y = await page.evaluate(() => window.pageYOffset || 0)
  console.log(`  ক্লিকের পর: scrollY = ${Math.round(y)}px ${y < 50 ? '✅ শীর্ষে ফিরেছে' : '⚠️ ফেরেনি'}`)
  if (y >= 50) problems.push('স্ক্রল-টু-টপ: ক্লিকে ফেরেনি')
  console.log(`  ট্যাপ-টার্গেট: ${v1.h}px · ডান মার্জিন ${v1.right}px ${v1.h >= 44 ? '✅' : '⚠️ ৪৪px-এর কম'}`)
  if (v1.h < 44) problems.push('স্ক্রল-টু-টপ: ট্যাপ-টার্গেট ছোট')
}

/* মোবাইল লেআউট */
console.log('\n── মোবাইল লেআউট (৩৯০px) ──────────────────────────')
await page.goto(BASE + '/dashboard', { waitUntil: 'load', timeout: 45000 })
await page.waitForTimeout(1500)
const layout = await page.evaluate(() => {
  const de = document.documentElement
  const over = []
  for (const el of document.querySelectorAll('table, pre, code, .ds-hero, [class*="grid"]')) {
    const r = el.getBoundingClientRect()
    const st = getComputedStyle(el)
    if (r.width > de.clientWidth + 2 && el.scrollWidth > el.clientWidth + 2 &&
        st.overflowX !== 'auto' && st.overflowX !== 'scroll') {
      over.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]} (${Math.round(r.width)}px)`)
    }
  }
  // ট্যাপ-টার্গেট: ২৪px-এর কম কোনো ক্লিকযোগ্য উপাদান?
  let small = 0
  for (const el of document.querySelectorAll('button, a, [role="button"]')) {
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0 && r.height < 24) small++
  }
  return { docW: de.clientWidth, scrollW: de.scrollWidth, over: over.slice(0, 4), small }
})
console.log(`  পেজ-প্রস্থ ${layout.docW}px · স্ক্রল ${layout.scrollW}px ${layout.scrollW > layout.docW + 2 ? '⚠️ অনুভূমিক স্ক্রল' : '✅'}`)
console.log(`  ২৪px-এর ছোট ট্যাপ-টার্গেট: ${layout.small}`)
for (const o of layout.over) { console.log(`  ⚠️  ${o}`); problems.push(`ওভারফ্লো: ${o}`) }

await browser.close()

const uniqErr = [...new Set(errors)]
const uniqBad = [...new Set(bad)]
console.log(`\n${'='.repeat(56)}`)
if (uniqErr.length) { console.log('\n❌ কনসোল/ব্যতিক্রম:'); for (const e of uniqErr.slice(0, 10)) console.log(`   ${e}`) }
if (uniqBad.length) { console.log('\n❌ ব্যর্থ রিকোয়েস্ট:'); for (const b of uniqBad.slice(0, 10)) console.log(`   ${b}`) }
if (problems.length) { console.log(`\n⚠️  ${problems.length}টি বিষয়:`); for (const p of problems) console.log(`   ${p}`) }
if (!uniqErr.length && !uniqBad.length && !problems.length) console.log('\n✅ ব্যবহারকারীর ড্যাশবোর্ড সম্পূর্ণ কার্যকর')
console.log('='.repeat(56) + '\n')
