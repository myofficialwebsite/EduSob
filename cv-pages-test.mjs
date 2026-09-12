// 📄 CV পেজ-মোড যাচাই — "১ পেজ ফিট" সত্যিই এক পেজে ফিট করে কি?
//
// প্রশ্ন: "CV-এর ১/২/৩ পেজ লজিক" — MASTER_PLAN §৩ "১/২/৩ পেজ ভ্যারিয়েন্ট"।
//
// getDensityStyles() (cvPages.ts:50) পেজ-মোড অনুযায়ী শুধু ফন্ট/প্যাডিং/ফাঁক
// বদলায় — কিন্তু বিষয়বস্তু আসলে এক পেজে ফিট করলো কি না, তা কোথাও মাপা হয় না।
// এই টেস্ট বাস্তবে মেপে দেখে (দাবি নয়, পরিমাপ):
//
//   • প্রতিটি মোডে রেন্ডার্ড প্রিভিউয়ের উচ্চতা কত
//   • A4 এক পেজ = ২৯৭ মিমি ≈ ১১২৩ পিক্সেল (৯৬ dpi)
//   • "১ পেজ ফিট" নির্বাচনে প্রচুর তথ্য থাকলে সত্যিই এক পেজে থাকে কি না
//   • ১ < ২ < ৩ ক্রমে আকার বাড়ছে কি না (যুক্তি সামঞ্জস্যপূর্ণ কি না)
//
// ⚠️ শুধু স্থানীয় সার্ভারে চলবে।
// চালান: ./run-test.sh cv-pages-test.mjs
import { chromium } from 'playwright'

const BASE = process.env.BASE || 'http://127.0.0.1:3000'
const PHONE = process.env.TEST_PHONE || '01829486022'
const PASS = process.env.TEST_PASS || 'Ab52944820@'
if (!/127\.0\.0\.1|localhost/.test(BASE)) { console.log('❌ প্রোডাকশনে চলবে না'); process.exit(1) }

let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok  ' : '  FAIL'} ${m}`); if (!ok) fail++ }
const A4_PX = 1123   // ২৯৭ মিমি @ ৯৬ dpi

const browser = await chromium.launch()
const ctx = await browser.newContext()
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

const li = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier: PHONE, password: PASS }),
}).then((r) => r.json())
log(!!li.token, `লগইন → ${li.token ? 'সফল' : 'ব্যর্থ'}`)
await ctx.addCookies([{ name: 'edusob_session', value: li.token, url: BASE }])

await page.goto(`${BASE}/cv`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)

console.log('\n=== 📄 CV পেজ-মোড যাচাই ===\n')

// ── প্রিভিউ-ধারক খুঁজে বের করা ──────────────────────────────────────
const holder = await page.evaluate(() => {
  const cands = ['#cvPreview', '#preview', '.cv-paper', '#cv-preview', '[id*=preview]', '[class*=paper]']
  for (const s of cands) {
    const el = document.querySelector(s)
    if (el) return { sel: s, h: Math.round(el.getBoundingClientRect().height) }
  }
  return null
})
log(!!holder, `প্রিভিউ-ধারক: ${holder ? holder.sel : 'পাওয়া যায়নি'}`)
if (!holder) { await browser.close(); process.exit(1) }
const SEL = holder.sel

// ── প্রতিটি মোডে উচ্চতা মাপা (স্বাভাবিক বিষয়বস্তু) ──────────────────
const measure = async (mode) => {
  await page.selectOption('#cv-page-mode', mode)
  await page.waitForTimeout(700)
  // ⚠️ প্রিভিউ-ধারকটি স্থির-উচ্চতার A4 কাগজ (সব মোডে ১১২৩px) — সেটি মাপলে
  //    সব মোডে একই মান আসে। বিষয়বস্তুর প্রকৃত উচ্চতা scrollHeight-এ পাওয়া যায়।
  return page.evaluate((s) => {
    const el = document.querySelector(s)
    const inner = el.firstElementChild || el
    return {
      h: Math.round(el.getBoundingClientRect().height),
      inner: Math.round(el.scrollHeight),
      content: Math.round(inner.scrollHeight || inner.getBoundingClientRect().height),
      fs: getComputedStyle(inner).fontSize,
    }
  }, SEL)
}

const modes = { auto: 'স্বাভাবিক (Auto)', '1': '১ পেজ ফিট', '2': '২ পেজ', '3': '৩ পেজ' }
const base = {}
for (const [m, label] of Object.entries(modes)) {
  base[m] = await measure(m)
  console.log(`  ${label.padEnd(18)} বিষয়বস্তু ${String(base[m].content).padStart(5)}px · ফন্ট ${base[m].fs}`)
}

// ⚠️ ফাঁকা CV-তে সব মোডেই বিষয়বস্তু ১১২৩px (কন্টেইনারের ন্যূনতম উচ্চতা) —
//    তাই ক্রম-যাচাই তথ্য-পূরণের পরেই করা হচ্ছে (নিচে)। এখানে শুধু ফন্ট
//    যাচাই করা হয়, যা মোডভেদে স্পষ্টতই বদলায়।
log(base['1'].fs !== base['3'].fs, `ফন্ট মোডভেদে বদলায়: ১-পেজ=${base['1'].fs} · ৩-পেজ=${base['3'].fs}`)

// ── মূল প্রশ্ন: "১ পেজ ফিট" — প্রচুর তথ্য দিলে কী হয়? ────────────────
// ⚠️ collect() (cvPages.ts:835) ফর্ম-ক্ষেত্র থেকে পড়ে — কোনো গ্লোবাল স্টেট
//    নেই। তাই বাস্তব UI-তেই তথ্য বসাতে হবে: f-name/f-objective/f-skills
//    (কমা-পৃথক), আর সারিগুলো window.addEdu()/addExp()/addRef() দিয়ে যোগ করে
//    [data-k=...] ইনপুট পূরণ করতে হবে।
console.log('\n── প্রচুর তথ্য (দীর্ঘ CV) দিয়ে পরীক্ষা ──')

// ১) সরল ক্ষেত্র
await page.evaluate(() => {
  const set = (id, v) => { const el = document.getElementById(id); if (el) { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })) } }
  set('f-name', 'মোহাম্মদ করিম উদ্দিন')
  set('f-desig', 'সিনিয়র শিক্ষক ও প্রশিক্ষক')
  set('f-phone', '01712345678')
  set('f-email', 'karim@example.com')
  set('f-address', 'বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা-১২০৯')
  set('f-objective', 'একজন নিবেদিতপ্রাণ শিক্ষক হিসেবে দেশের শিক্ষা ও প্রযুক্তি খাতে অবদান রাখতে চাই। ' .repeat(6))
  set('f-father', 'আব্দুল করিম'); set('f-mother', 'ফাতেমা বেগম')
  set('f-dob', '১৫ মার্চ ২০০০'); set('f-blood', 'O+')
  set('f-religion', 'ইসলাম'); set('f-marital', 'অবিবাহিত'); set('f-nid', '১২৩৪৫৬৭৮৯০')
  set('f-skills', Array.from({ length: 24 }, (_, i) => 'দক্ষতা' + (i + 1)).join(', '))
  set('f-langs', 'বাংলা, ইংরেজি, হিন্দি, আরবি, জাপানি, জার্মান')
})

// ২) গতিশীল সারি (শিক্ষা / অভিজ্ঞতা / প্রকল্প / রেফারেন্স)
const fillRows = async (addFn, wrap, cols, rows) => {
  return page.evaluate(({ addFn, wrap, cols, rows }) => {
    if (typeof window[addFn] !== 'function') return addFn + ' নেই'
    for (let i = 0; i < rows; i++) window[addFn]()
    const list = document.querySelectorAll('#' + wrap + ' .row')
    list.forEach((r, ri) => {
      cols.forEach((c) => {
        const el = r.querySelector('[data-k="' + c.k + '"]')
        if (el) { el.value = c.v + ' ' + (ri + 1); el.dispatchEvent(new Event('input', { bubbles: true })) }
      })
    })
    return list.length + 'টি সারি'
  }, { addFn, wrap, cols, rows })
}

const eduCount = await fillRows('addEdu', 'edu-rows', [
  { k: 'exam', v: 'পরীক্ষা' }, { k: 'institute', v: 'প্রতিষ্ঠান' },
  { k: 'board', v: 'বোর্ড' }, { k: 'year', v: '২০২' }, { k: 'result', v: 'জিপিএ ৫.০০' },
], 8)
console.log('  শিক্ষা: ' + eduCount)

const expCount = await fillRows('addExp', 'exp-rows', [
  { k: 'title', v: 'পদ' }, { k: 'org', v: 'সংস্থা' }, { k: 'location', v: 'ঢাকা' },
  { k: 'period', v: '২০২০-চলমান' },
  { k: 'detail', v: 'কাজের বিবরণ — দীর্ঘ বর্ণনা যাতে জায়গা নেয়, এমন কিছু লেখা' },
], 6)
console.log('  অভিজ্ঞতা: ' + expCount)

const refCount = await fillRows('addRef', 'ref-rows', [
  { k: 'name', v: 'রেফারেন্স' }, { k: 'designation', v: 'অধ্যাপক' },
  { k: 'org', v: 'বিশ্ববিদ্যালয়' }, { k: 'phone', v: '01812345678' }, { k: 'email', v: 'ref@example.com' },
], 4)
console.log('  রেফারেন্স: ' + refCount)

await page.evaluate(() => { if (typeof window.refresh === 'function') window.refresh() })
await page.waitForTimeout(1200)

const bigModes = {}
for (const [m, label] of Object.entries(modes)) {
  bigModes[m] = await measure(m)
  const pages = (bigModes[m].content / A4_PX).toFixed(2)
  console.log(`  ${label.padEnd(18)} বিষয়বস্তু ${String(bigModes[m].content).padStart(5)}px ≈ ${pages} পেজ`)
}

// ── ক্রম সামঞ্জস্যপূর্ণ কি (তথ্য-পূরণের পর): ১ < ২/auto < ৩ ─────────
log(bigModes['1'].content < bigModes['2'].content && bigModes['2'].content < bigModes['3'].content,
  `ক্রম: ১(${bigModes['1'].content}) < ২(${bigModes['2'].content}) < ৩(${bigModes['3'].content}) ✅`)
log(bigModes['2'].content === bigModes['auto'].content,
  `২-পেজ ও Auto অভিন্ন (${bigModes['2'].content}px) — 'standard' মানেই ডিফল্ট`)

// ── রায়: নির্বাচকের নাম মিথ্যে ছিল → এখন প্রকৃত পেজ-সংখ্যা দেখানো হয় ──
const onePage = bigModes['1'].content
console.log(`\n  A4 এক পেজ = ${A4_PX} পিক্সেল`)

// সংশোধনের আগে: "১ পেজ ফিট" নির্বাচন করলেও দীর্ঘ CV ১.২৯ পেজ হতো,
// কিন্তু কোথাও জানানো হতো না — ব্যবহারকারী ভুল ধারণা নিয়ে PDF নামাতো।
// সংশোধনের পর: #cv-page-info প্রকৃত পেজ-সংখ্যা দেখায়।
const info = await page.evaluate(() => {
  const el = document.getElementById('cv-page-info')
  return el ? { text: el.textContent.trim(), cls: el.className } : null
})
log(!!info, `পেজ-সূচক উপস্থিত (#cv-page-info)${info ? ` → "${info.text}"` : ''}`)

const expectedPages = Math.max(1, Math.ceil(onePage / A4_PX))
const bnDigits = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' }
const bn = String(expectedPages).replace(/[0-9]/g, (d) => bnDigits[d])
log(!!info && info.text.includes(bn),
  `সূচকটি সত্যি: পরিমাপ ${(onePage / A4_PX).toFixed(2)} পেজ → সূচকে "${bn}" পেজ দেখাচ্ছে ${info && info.text.includes(bn) ? '✅' : '❌'}`)

log(errors.length === 0, `JS ত্রুটি: ${errors.length}${errors.length ? ' → ' + errors.slice(0, 2).join(' | ').slice(0, 90) : ''}`)

await browser.close()
console.log(fail === 0 ? '\n✅ ALL PASS\n' : `\n❌ ${fail}টি ব্যর্থ\n`)
process.exit(fail === 0 ? 0 : 1)
