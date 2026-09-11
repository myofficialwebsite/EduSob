/**
 * যুক্তবর্ণ পরীক্ষা (`node conjunct-test.mjs [--prod]`)
 *
 * বাংলায় যুক্তবর্ণ (ক + ্ + ত = ক্ত) জোড়া লাগলে "ত" নিচে বসে, ফলে
 * পুরো জোড়ার প্রস্থ **কমে** যায়। ভেঙে গেলে হসন্ত আলাদা জায়গা নেয় ও
 * প্রস্থ **বাড়ে**। তাই:  প্রস্থ(ক্ত) < প্রস্থ(কত)  → যুক্তবর্ণ টিকেছে।
 *
 * ⚠️  জরুরি সতর্কতা (এটিই আগের সংস্করণের ভুল)
 * ─────────────────────────────────────────
 * `page.setContent()` দিয়ে পেজ বানালে তার origin আলাদা হয়, আর
 * **ওয়েবফন্ট লোড করতে CORS লাগে**। তখন `fonts.css` ঠিক লোড হলেও
 * woff2 ফাইলটি CORS-এ ব্লক হয়ে যায় → ব্রাউজার সিস্টেম ফন্টে ফেরত
 * যায় → যুক্তবর্ণ ভাঙা দেখায়। ফলাফল: ০/২০ "ভেঙেছে" — সম্পূর্ণ মিথ্যা।
 *
 * সমাধান: সরাসরি **প্রকৃত পেজে** naviggate করতে হবে, যাতে ফন্ট
 * একই origin থেকে লোড হয়। মাপার আগে `document.fonts.ready`-ও
 * অপেক্ষা করতে হবে এবং লোডেড ফন্টের তালিকা ছাপিয়ে যাচাই করতে হবে।
 */
import { chromium } from 'playwright'

const PROD  = process.argv.includes('--prod')
const BASE  = PROD ? 'https://edusob.pages.dev' : 'http://127.0.0.1:3000'
const PAIRS = [
  ['ক্ত', 'কত'], ['ন্ত', 'নত'], ['স্প', 'সপ'], ['ষ্ক', 'ষক'], ['ন্দ্র', 'নদর'],
]
const SPACINGS = [
  ['normal (উদাহরণ)', 'normal'],
  ['-0.01em (হেডিং)', '-0.01em'],
  ['-0.02em (হেডিং)', '-0.02em'],
  ['+0.09em (লেবেল)', '0.09em'],
]

const browser = await chromium.launch()
const page = await (await browser.newContext()).newPage()

/* setContent() নয় — প্রকৃত রুট। ফন্ট একই origin থেকে লোড হবে। */
await page.goto(BASE + '/', { waitUntil: 'load' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(1200)

const { rows, loaded } = await page.evaluate(({ PAIRS, SPACINGS }) => {
  const mk = (t, ls) => {
    const s = document.createElement('span')
    s.style.cssText = `position:absolute;left:-9999px;white-space:pre;` +
      `font-family:'Hind Siliguri',sans-serif;font-size:64px;letter-spacing:${ls}`
    s.textContent = t
    document.body.appendChild(s)
    const w = s.getBoundingClientRect().width
    s.remove()
    return w
  }
  const rows = []
  for (const [label, ls] of SPACINGS)
    for (const [conj, plain] of PAIRS)
      rows.push({ label, conj, plain, wc: mk(conj, ls), wp: mk(plain, ls) })
  return {
    rows,
    loaded: [...document.fonts].filter(f => f.status === 'loaded')
      .map(f => `${f.family} ${f.weight}`),
  }
}, { PAIRS, SPACINGS })

console.log(`\n===== যুক্তবর্ণ পরীক্ষা (${PROD ? 'প্রোডাকশন' : 'স্থানীয়'}: ${BASE}) =====\n`)

/* ফন্ট না লোড হলে পুরো পরীক্ষাই অর্থহীন — আগেই জানিয়ে দেওয়া হচ্ছে */
const hasHind = loaded.some(f => f.startsWith('Hind Siliguri'))
console.log(`  হিন্দ সিলিগুরি লোড: ${hasHind ? '✅' : '❌ না — ফলাফল বিশ্বাসযোগ্য নয়!'}`)
console.log(`  লোডেড: ${[...new Set(loaded)].join(' | ')}\n`)

let cur = '', pass = 0, total = 0
console.log('  যুক্তবর্ণ   প্রস্থ   সাধারণ   প্রস্থ   রায়')
console.log('  ' + '─'.repeat(52))
for (const r of rows) {
  if (r.label !== cur) { cur = r.label; console.log(`  [${cur}]`) }
  const ok = r.wc < r.wp
  if (ok) pass++
  total++
  console.log(`     ${r.conj.padEnd(5)}  ${Math.round(r.wc).toString().padStart(4)}     ${r.plain.padEnd(4)}  ${Math.round(r.wp).toString().padStart(4)}    ${ok ? '✅ টিকেছে' : '❌ ভেঙেছে'}`)
}

console.log('\n' + '='.repeat(56))
console.log(hasHind && pass === total
  ? `✅ ${pass}/${total} — সব যুক্তবর্ণ টিকে আছে`
  : `❌ ${pass}/${total} — সমস্যা আছে`)
console.log('='.repeat(56) + '\n')
await browser.close()
