/**
 * FontAwesome আইকন উপস্থিতি-যাচাই (`node icon-audit.mjs`)।
 *
 * আমি UI-তে নতুন কোনো `fa-*` বসালে সেটি লোডেড FontAwesome-সংস্করণে
 * আছে কি নেই — এই স্ক্রিপ্ট দিয়ে ঠিক করে দেখতে হয়। সংস্করণে না থাকলে
 * আইকনটি ফাঁকা হয়ে যায় (আগে fa-plug ও fa-bag-shopping দিয়ে হয়েছিল)।
 *
 * সংকেত দুটিই দরকার:
 *   • `content !== 'none'`  → ওই আইকনের CSS-সংজ্ঞা আছে
 *   • `<i>`-এর বাক্স ২৪x২৪ → গ্লিফটি সত্যিই এঁকেছে
 *
 * ::before-এর প্রস্থ দিয়ে মাপা যাবে না — ইনলাইন সিউডো-এলিমেন্টের
 * ক্ষেত্রে getComputedStyle সবসময় ০px দেয় (এটিই প্রথম সংস্করণের ভুল)।
 */
/**
 * আমার বসানো প্রতিটি FontAwesome আইকন সত্যিই রেন্ডার হচ্ছে কি।
 * আইকনটি ফন্টে না থাকলে <i> এর প্রস্থ ০ হয় — অর্থাৎ ফাঁকা বাক্স/কিছুই নয়।
 */
import { chromium } from 'playwright'

const NEED = [
  'fa-arrow-right', 'fa-book', 'fa-pen', 'fa-bolt', 'fa-gift', 'fa-ellipsis',
  'fa-store', 'fa-bullseye', 'fa-cart-plus', 'fa-newspaper',
  'fa-chalkboard-user', 'fa-bullhorn', 'fa-graduation-cap', 'fa-book-open',
]
const PAGES = ['/', '/shop', '/tools', '/subscription']

const b = await chromium.launch()
const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage()

// একটি টেস্ট-পেজে সব আইকন একসাথে রেন্ডার করে মাপা
await p.goto('http://127.0.0.1:3000/', { waitUntil: 'load' })
await p.waitForTimeout(1500)

const res = await p.evaluate(async (names) => {
  const box = document.createElement('div')
  box.style.cssText = 'position:fixed;left:-9999px;top:0;font-size:24px'
  box.innerHTML = names.map(n => `<i class="fas ${n}" data-n="${n}"></i>`).join('')
  document.body.appendChild(box)
  await document.fonts.ready
  await new Promise(r => setTimeout(r, 600))
  /* <i> নিজে নয় — FontAwesome আইকনটি আঁকে ::before সিউডো-এলিমেন্ট।
     <i>-এর বাক্স CSS দিয়ে নির্ধারিত হতে পারে (যেমন min-width), তাই
     সেটি মাপলে মিথ্যা "আছে" দেখায়। ::before-এর প্রস্থই আসল প্রমাণ:
     গ্লিফ না থাকলে ::before-এর কোনো বিষয়বস্তু থাকে না ও প্রস্থ ০ হয়। */
  const out = names.map(n => {
    const el = box.querySelector(`[data-n="${n}"]`)
    const cs = getComputedStyle(el, '::before')
    const r = el.getBoundingClientRect()
    /* দুটো সংকেত একসাথে দরকার:
         • content !== 'none'  → ওই আইকনের CSS-সংজ্ঞা আছে
         • <i>-এর বাক্স ২৪x২৪ → গ্লিফটি সত্যিই এঁকেছে
       ::before-এর প্রস্থ দিয়ে কাজ হবে না — ইনলাইন সিউডো-এলিমেন্টের
       ক্ষেত্রে getComputedStyle সবসময় ০px দেয় (এটিই আগের ভুল)। */
    return { n, content: cs.content, bw: Math.round(r.width), bh: Math.round(r.height) }
  })
  box.remove()
  return out
}, NEED)

console.log('\n===== FontAwesome আইকন উপস্থিতি =====\n')
let bad = 0
for (const { n, bw, bh, content } of res) {
  const ok = content && content !== 'none' && content !== 'normal' && bh > 4
  if (!ok) bad++
  console.log(`  ${ok ? '✅' : '❌'} ${n.padEnd(20)} বাক্স ${String(bw).padStart(2)}x${String(bh).padEnd(2)}  content=${content}`)
}
console.log(`\n  ${res.length - bad}/${res.length} আইকন রেন্ডার হচ্ছে`)
if (bad) console.log('  ⚠️  যেগুলোর প্রস্থ ০, সেগুলো ফন্টে নেই — বদলাতে হবে')
await b.close()
