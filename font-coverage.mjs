/**
 * ফন্ট কভারেজ ম্যাপ (`node font-coverage.mjs`).
 *
 * কোন অক্ষরটি আসলে Hind Siliguri থেকে আসছে আর কোনটি গোপনে সিস্টেম ফলব্যাকে
 * যাচ্ছে — চোখে ধরা পড়ে "ফন্ট ভাঙা" বলে, কিন্তু কোডে দেখা যায় না।
 *
 * কৌশল: একই অক্ষর দুইভাবে মাপা হয় —
 *   (ক) font-family: 'Hind Siliguri'
 *   (খ) font-family: '__DefinitelyMissing__'  (নিশ্চিতভাবে অনুপস্থিত ফন্ট)
 * দুটির প্রস্থ **সমান** হলে বোঝা যায় Hind Siliguri সেই অক্ষরটি দেয়নি —
 * দুটোতেই একই ডিফল্ট ফলব্যাক ব্যবহৃত হয়েছে।
 *
 * ব্যবহার: EDUSOB_BASE=https://edusob.pages.dev node font-coverage.mjs
 */
import { chromium } from 'playwright'

const BASE = process.env.EDUSOB_BASE || 'http://127.0.0.1:3000'
const ROUTES = (process.env.EDUSOB_ROUTES || '/,/refund,/cgpa,/shop,/subscription,/dashboard').split(',')

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto(BASE + '/', { waitUntil: 'load', timeout: 45000 })
await page.evaluate(() => document.fonts.ready)

/* ১. সাইটে ব্যবহৃত সব distinct অক্ষর সংগ্রহ */
const chars = new Set()
for (const r of ROUTES) {
  try {
    await page.goto(BASE + r, { waitUntil: 'load', timeout: 45000 })
    await page.waitForTimeout(500)
    const t = await page.evaluate(() => document.body.innerText || '')
    for (const c of t) chars.add(c)
  } catch { /* রুট লোড না হলে এড়িয়ে যাওয়া */ }
}
const list = [...chars].filter((c) => c.trim() !== '')
console.log(`\n===== ফন্ট কভারেজ — ${BASE} =====`)
console.log(`সংগৃহীত অক্ষর: ${list.length}\n`)

/* ২. প্রতিটি অক্ষর দুই ফন্টে এঁকে **পিক্সেল** তুলনা।
      প্রস্থ-তুলনা ভুয়া পজিটিভ দেয় (অনেক ফন্টের ডিজিটের প্রস্থ একই), তাই
      রেন্ডার করা রূপটাই সরাসরি মেলানো হচ্ছে: দুটো রূপ হুবহু একই ⇒ হিন্দ
      সিলিগুড়ি সেই অক্ষর দেয়নি, দুটোতেই ডিফল্ট ফলব্যাক ব্যবহৃত হয়েছে। */
const report = await page.evaluate((chars) => {
  const W = 80, H = 80
  const cv = document.createElement('canvas')
  cv.width = W; cv.height = H
  const cx = cv.getContext('2d', { willReadFrequently: true })
  const MISSING = '__DefinitelyMissingFont_XYZ__'

  const draw = (ch, family) => {
    cx.clearRect(0, 0, W, H)
    cx.fillStyle = '#000'
    cx.textBaseline = 'top'
    cx.font = `56px ${family}`
    cx.fillText(ch, 4, 4)
    return cx.getImageData(0, 0, W, H).data
  }
  const same = (a, b) => {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
    return true
  }
  // ফাঁকা (কিছুই না আঁকা) অক্ষর বাদ — যেমন স্পেস
  const blank = (d) => { for (let i = 3; i < d.length; i += 4) if (d[i] !== 0) return false; return true }

  const out = { covered: [], fallback: [] }
  for (const ch of chars) {
    const a = draw(ch, "'Hind Siliguri'")
    const b = draw(ch, `'${MISSING}'`)
    if (blank(a)) continue          // যেমন স্পেস — তুলনার কিছু নেই
    if (same(a, b)) out.fallback.push(ch)
    else out.covered.push(ch)
  }
  return out
}, list)

const desc = (c) => `U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`

console.log(`✅ Hind Siliguri-তে আছে: ${report.covered.length}টি`)
console.log(`\n❌ ফলব্যাকে যাচ্ছে: ${report.fallback.length}টি`)
if (report.fallback.length) {
  console.log(`\n   অক্ষর   কোডপয়েন্ট   দেখতে`)
  for (const c of report.fallback) {
    const name = c === ' ' ? '(স্পেস)' : c
    console.log(`     ${name}      ${desc(c)}       ${c}`)
  }
  console.log(`\n   এক লাইনে: ${report.fallback.join(' ')}`)
}

await browser.close()
console.log(`\n${'='.repeat(52)}`)
console.log(report.fallback.length
  ? `⚠️  ${report.fallback.length}টি অক্ষর হিন্দ সিলিগুড়িতে নেই — এগুলোতেই ফন্ট মিশে যাচ্ছে`
  : '✅ সব অক্ষর হিন্দ সিলিগুড়িতেই রেন্ডার হচ্ছে')
console.log('='.repeat(52) + '\n')
