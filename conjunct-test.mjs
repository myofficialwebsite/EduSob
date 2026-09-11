/**
 * যুক্তবর্ণ পরীক্ষা (`node conjunct-test.mjs`).
 *
 * বাংলায় যুক্তবর্ণ (যেমন ক + ্ + ত = ক্ত) জোড়া লাগার সময় "ত" নিচে বসে যায়,
 * তাই পুরো জোড়াটির প্রস্থ **কমে** যায়। আর ভেঙে গেলে হসন্ত (্) দৃশ্যমান হয়ে
 * ফাঁকা তৈরি করে, ফলে প্রস্থ **বাড়ে**।
 *
 * পরীক্ষা: "ক্ত"-এর প্রস্থ < "কত"-এর প্রস্থ → যুক্তবর্ণ টিকে আছে ✅
 *          "ক্ত"-এর প্রস্থ ≈ বা > "কত"      → ভেঙে গেছে ❌
 *
 * letter-spacing-এর প্রভাব আলাদা করে মাপা হয় (বাংলায় এটিই প্রধান সন্দেহভাজন)।
 */
import { chromium } from 'playwright'

const FONT = "'Hind Siliguri', sans-serif"
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
await page.goto('http://127.0.0.1:3000/static/fonts/fonts.css').catch(() => {})
await page.setContent(`<html><head>
<link rel="stylesheet" href="http://127.0.0.1:3000/static/fonts/fonts.css">
<style>body{margin:0}span{font-family:${FONT};font-size:64px;white-space:pre}</style>
</head><body></body></html>`, { waitUntil: 'load' })
await page.evaluate(() => document.fonts.ready)

const results = await page.evaluate(({ PAIRS, SPACINGS }) => {
  const out = []
  for (const [label, ls] of SPACINGS) {
    for (const [conj, plain] of PAIRS) {
      const mk = (t) => {
        const s = document.createElement('span')
        s.style.letterSpacing = ls
        s.textContent = t
        document.body.appendChild(s)
        const w = s.getBoundingClientRect().width
        s.remove()
        return w
      }
      const wc = mk(conj), wp = mk(plain)
      out.push({ ls: label, conj, plain, wc: +wc.toFixed(1), wp: +wp.toFixed(1), diff: +(wc - wp).toFixed(1) })
    }
  }
  return out
}, { PAIRS, SPACINGS })

await browser.close()

console.log('\n===== যুক্তবর্ণ পরীক্ষা (Hind Siliguri, 64px) =====\n')
console.log('  letter-spacing      যুক্ত  সাধারণ   পার্থক্য   অবস্থা')
console.log('  ' + '─'.repeat(54))
let broken = 0, total = 0
let cur = ''
for (const r of results) {
  if (r.ls !== cur) { cur = r.ls; console.log(`  [${cur}]`) }
  total++
  // যুক্তবর্ণ টিকে থাকলে প্রস্থ কম (নেতিবাচক পার্থক্য)
  const ok = r.diff < -1
  if (!ok) broken++
  console.log(`     ${r.conj.padEnd(5)} ${String(r.wc).padStart(7)} ${String(r.wp).padStart(8)} ${String(r.diff).padStart(9)}   ${ok ? '✅ টিকে আছে' : '❌ ভেঙেছে'}`)
}
console.log('\n' + '='.repeat(58))
console.log(broken === 0
  ? `✅ সব ${total}টি ক্ষেত্রেই যুক্তবর্ণ সঠিকভাবে গঠিত হচ্ছে`
  : `❌ ${total}-এর মধ্যে ${broken}টিতে যুক্তবর্ণ ভেঙেছে`)
console.log('='.repeat(58) + '\n')
