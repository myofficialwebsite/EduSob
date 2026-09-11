/**
 * রেসপনসিভ অডিট (`node responsive-audit.mjs [--prod]`)
 *
 * "মোবাইল ও পিসি দুটোতেই সেরা" — এই শর্ত যাচাই করে। প্রতিটি রুট
 * তিনটি ভিউপোর্টে খুলে দেখে:
 *
 *   ১) অনুভূমিক স্ক্রল (overflow)      — মোবাইলে সবচেয়ে সাধারণ ত্রুটি
 *   ২) ভিউপোর্টের বাইরে চলে যাওয়া এলিমেন্ট
 *   ৩) ক্লিপ করা/উপচে পড়া টেক্সট (scrollWidth > clientWidth)
 *   ৪) অত্যন্ত ছোট ট্যাপ টার্গেট (<৪০px, শুধু মোবাইল)
 *
 * ⚠️  ফাঁদ (এই ভুল আগে হয়েছিল): যে এলিমেন্টের কোনো ক্লিকযোগ্য
 *     পূর্বপুরুষ আছে (যেমন <i> আইকন একটি <button>-এর ভেতরে), তাকে
 *     ছোট ট্যাপ-টার্গেট ধরা যাবে না — আসল লক্ষ্য সেই পূর্বপুরুষ।
 *     এখানে সেই ছাঁকনি চালু আছে (৩টি continue দিয়ে)।
 *
 * দুটি পার্থক্য মনে রাখা জরুরি:
 *   • documentElement.scrollWidth > innerWidth  → সত্যিকারের পেজ-স্ক্রল
 *   • কোনো এলিমেন্টের right > innerWidth        → সেই এলিমেন্ট উপচে পড়েছে
 *     (কিন্তু কন্টেইনারে overflow:hidden থাকলে পেজ স্ক্রল করে না —
 *      যেমন ড্যাশবোর্ডের ওয়াটারমার্ক। তাই দুটোই আলাদা করে দেখা হয়।)
 */
import { chromium } from 'playwright'

const PROD = process.argv.includes('--prod')
const BASE = PROD ? 'https://edusob.pages.dev' : 'http://127.0.0.1:3000'
const ROUTES = [
  '/', '/login', '/signup', '/dashboard', '/profile', '/wallet', '/subscription',
  '/results', '/mcq', '/cgpa', '/cv', '/cv-maker', '/shop', '/teacher-support',
  '/notices', '/jobs', '/news', '/scholarships', '/admission', '/planner',
  '/syllabus', '/qpapers', '/board-challenge', '/assisted', '/privacy',
  '/terms', '/refund', '/teachers',
]
const VIEWS = [
  ['মোবাইল  ৩৯০', 390, 844],
  ['ট্যাবলেট ৭৬৮', 768, 1024],
  ['ডেস্কটপ ১৪৪০', 1440, 900],
]

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await ctx.newPage()

/* লগইন — অনেক রুটে দরকার */
await page.goto(BASE + '/login', { waitUntil: 'load' })
await page.fill('#loginPhoneInput', '01829486022')
await page.fill('#loginPassInput', PROD ? 'EdDrgja06e9@' : 'Ab52944820@')
await Promise.all([page.waitForLoadState('load'), page.click('button[type=submit]')])
await page.waitForTimeout(1800)

const problems = []
for (const [vname, w, h] of VIEWS) {
  await page.setViewportSize({ width: w, height: h })
  console.log(`\n═══ ${vname} (${w}×${h}) ═══`)
  console.log('  রুট                     পেজ-স্ক্রল  উপচে-পড়া  ক্লিপড-টেক্সট  ছোট-ট্যাপ')
  console.log('  ' + '─'.repeat(70))
  for (const r of ROUTES) {
    await page.goto(BASE + r, { waitUntil: 'load' })
    await page.waitForTimeout(1100)
    const st = await page.evaluate((vw) => {
      const de = document.documentElement
      const pageScroll = de.scrollWidth > vw + 1 ? de.scrollWidth - vw : 0
      const over = []
      const clipped = []
      const small = []
      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el)
        if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue
        const rc = el.getBoundingClientRect()
        if (rc.width === 0 || rc.height === 0) continue
        // ভিউপোর্টের ডানপ্রান্ত ছাড়িয়ে গেলে
        if (rc.right > vw + 2 || rc.left < -2) {
          const tag = el.tagName.toLowerCase()
          const cls = (el.className || '').toString().split(' ').slice(0, 2).join('.')
          over.push(`${tag}.${cls}`.slice(0, 34))
        }
        // টেক্সট ক্লিপ (scrollWidth বেশি কিন্তু overflow লুকানো)
        if (el.children.length === 0 && el.textContent.trim() &&
            el.scrollWidth > el.clientWidth + 2 &&
            ['hidden', 'clip'].includes(cs.overflowX)) {
          clipped.push((el.textContent || '').trim().slice(0, 26))
        }
        /* ছোট ট্যাপ টার্গেট (মোবাইলে)।
           জরুরি শোধন: আগের সংস্করণ `<i>`/`<span>`-কেও গুনত, অথচ সেগুলো
           বড় কোনো ক্লিকযোগ্য পূর্বপুরুষের (বোতাম/লিংক) ভেতরে থাকে —
           আসল লক্ষ্য সেই পূর্বপুরুষ, আইকনটি নয়। তাই যার কোনো
           ক্লিকযোগ্য পূর্বপুরুষ আছে, তা বাদ দেওয়া হয়।
           (এ কারণেই এই স্ক্রিপ্ট আগে ৩টি করে দেখাত, অথচ a11y-sweep
            বলত ০ — দুটিই ভুল ছিল।) */
        if (vw <= 430) {
          const isClickable = (n) => n.tagName === 'BUTTON' || n.tagName === 'A' ||
            n.onclick || getComputedStyle(n).cursor === 'pointer'
          if (!isClickable(el)) continue
          if (rc.height >= 40 && rc.width >= 40) continue
          let a = el.parentElement, hasAnc = false
          while (a && a !== document.body) { if (isClickable(a)) { hasAnc = true; break } a = a.parentElement }
          if (hasAnc) continue
          small.push(`${el.tagName.toLowerCase()}:${Math.round(rc.width)}x${Math.round(rc.height)} "${(el.textContent||'').trim().slice(0,16)}"`)
        }
      }
      return { pageScroll, over: [...new Set(over)].slice(0, 3), clipped: [...new Set(clipped)].slice(0, 3), small: [...new Set(small)].slice(0, 3) }
    }, w)

    const bad = st.pageScroll || st.over.length || st.clipped.length || st.small.length
    if (bad) problems.push({ v: vname, r, ...st })
    console.log(`  ${r.padEnd(23)} ${(st.pageScroll ? '❌ +' + st.pageScroll + 'px' : '✅').padEnd(11)} ` +
      `${(st.over.length ? '❌ ' + st.over.length : '✅').padEnd(10)} ` +
      `${(st.clipped.length ? '❌ ' + st.clipped.length : '✅').padEnd(14)} ` +
      `${st.small.length ? '❌ ' + st.small.length : '✅'}`)
    if (st.over.length) console.log(`       উপচে: ${st.over.join(' , ')}`)
    if (st.clipped.length) console.log(`       ক্লিপ: ${st.clipped.join(' | ')}`)
    if (st.small.length) console.log(`       ছোট:  ${st.small.join(' , ')}`)
  }
}

console.log('\n' + '═'.repeat(72))
console.log(`  ${problems.length ? `❌ ${problems.length}টি রুট-ভিউপোর্টে সমস্যা` : '✅ সব রুট সব ভিউপোর্টে পরিষ্কার'}`)
console.log('═'.repeat(72) + '\n')
await browser.close()
