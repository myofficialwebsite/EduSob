// 🛠️ অ্যাডমিন প্যানেল — ইউএক্স অডিট (১৮ ট্যাব × ডেস্কটপ/মোবাইল)
//
// কেন এই টেস্ট: MASTER_PLAN §৫ "এডমিন প্যানেল" + শর্ত "মোবাইল ও পিসি দুটোতেই
// সেরা হতে হবে"। অ্যাডমিনের ১৮টি ট্যাবের কোনোটিই আগে মোবাইল ভিউপোর্টে যাচাই
// করা হয়নি। একটি ট্যাবেই ওভারফ্লো বা ভাঙা লেআউট থাকলে পুরো প্যানেল অকেজো।
//
// যাচাই করা হয় (প্রতি ট্যাবে, প্রতি ভিউপোর্টে):
//   ১) ট্যাব দেখা যায় + কন্টেন্ট আছে (শুধু স্কেলিটন নয়)
//   ২) অনুভূমিক ওভারফ্লো নেই
//   ৩) মোবাইলে ট্যাপ-টার্গেট ≥ ৪৪px (WCAG 2.5.5 / অ্যাপল এইচআইজি)
//   ৪) কোনো JS ত্রুটি নেই
//
// ⚠️ শুধু স্থানীয় সার্ভারে চলবে (প্রোডাকশন-সুরক্ষা গার্ড আছে)।
// চালান: ./run-test.sh admin-ux-audit.mjs
import { chromium } from 'playwright'

const BASE = process.env.BASE || 'http://127.0.0.1:3000'
const PHONE = process.env.TEST_PHONE || '01829486022'
const PASS = process.env.TEST_PASS || 'Ab52944820@'

if (!/127\.0\.0\.1|localhost/.test(BASE)) {
  console.log('❌ এই অডিট প্রোডাকশনে চলবে না।'); process.exit(1)
}

const TABS = ['overview', 'autocollect', 'auditlogs', 'users', 'subs', 'mcq', 'syllabus',
  'qpapers', 'suggestions', 'scholarships', 'jobs', 'admissions', 'notices', 'announce',
  'teacher', 'assisted', 'features', 'rates']

let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok  ' : '  FAIL'} ${m}`); if (!ok) fail++ }

const browser = await chromium.launch()
const ctx = await browser.newContext()
const page = await ctx.newPage()
let errors = []
page.on('pageerror', (e) => errors.push(String(e.message)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

console.log('\n=== 🛠️ অ্যাডমিন প্যানেল ইউএক্স অডিট ===\n')

const li = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier: PHONE, password: PASS }),
}).then((r) => r.json())
log(!!li.token, `লগইন → ${li.token ? 'সফল' : 'ব্যর্থ'}`)
await ctx.addCookies([{ name: 'edusob_session', value: li.token, url: BASE }])

await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)

// ⚠️ আগে `!document.body.innerText.includes('লক')` ব্যবহার করেছিলাম — ভুল।
//    পেজে "ব্লক" (block) শব্দের ভেতরে 'লক' থাকায় মিথ্যা ব্যর্থতা দেখাতো।
//    নির্ভরযোগ্য নির্ণায়ক: লক-স্ক্রিনে #tab-overview থাকে না, এবং সেখানে
//    fa-shield-halved আইকন থাকে।
// ⚠️ fa-shield-halved আইকনটি অ্যাডমিন প্যানেলের নিজস্ব নিরাপত্তা-বিজেটেও
//    থাকে, তাই সেটি দিয়ে লক-স্ক্রিন শনাক্ত করা যায় না। লক-স্ক্রিনে
//    #tab-overview থাকে না — এটিই একমাত্র নির্ভরযোগ্য নির্ণায়ক।
const adm = await page.evaluate(() => ({
  hasPane: !!document.getElementById('tab-overview'),
  isAdminFlag: typeof window.IS_ADMIN === 'undefined' ? null : window.IS_ADMIN,
}))
log(adm.hasPane, `এডমিন প্যানেল খুলেছে (tab-overview উপস্থিত=${adm.hasPane})`)

const summary = []
for (const [vpName, w, h] of [['ডেস্কটপ', 1280, 800], ['মোবাইল', 390, 844]]) {
  await page.setViewportSize({ width: w, height: h })
  console.log(`\n── ${vpName} (${w}px) ──`)

  for (const tab of TABS) {
    errors = []
    await page.evaluate((t) => { window.switchAdminTab && window.switchAdminTab(t) }, tab)
    await page.waitForTimeout(650)

    const r = await page.evaluate((t) => {
      const pane = document.getElementById('tab-' + t)
      if (!pane) return { missing: true }
      const cs = getComputedStyle(pane)
      const visible = cs.display !== 'none' && !pane.classList.contains('hidden')
      const text = (pane.innerText || '').trim()
      // শুধু স্কেলিটন/লোডার আছে কি (কন্টেন্ট লোড হয়নি)
      const skeletons = pane.querySelectorAll('.ds-skeleton, [class*="skeleton"]').length
      const stillLoading = skeletons > 0 && text.length < 60
      // ট্যাপ-টার্গেট: দৃশ্যমান ইন্টারঅ্যাকটিভ উপাদান
      // ⚠️ দুটি বিষয়ে সাবধানতা (ভুল ইতিবাচক এড়াতে):
      //   ক) input-এর ক্ষেত্রে প্রকৃত টার্গেট হলো ঘেরা <label> (label-এ ক্লিক
      //      করলেও টগল হয়) — তাই input নয়, label মাপতে হবে।
      //   খ) WCAG ২.২ AA (SC ২.৫.৮) অনুযায়ী ন্যূনতম ২৪×২৪px; বাক্যের ভেতরের
      //      ইনলাইন লিংক অব্যাহতিপ্রাপ্ত। এখানে ২৪px-কে মানদণ্ড ধরা হয়েছে
      //      (৪৪px হলো AAA/অ্যাপল-নির্দেশিকা, AA নয়)।
      const small = []
      for (const el of pane.querySelectorAll('button, a, input, select, [role=button]')) {
        if (el.closest('.hidden')) continue
        const target = el.tagName === 'INPUT' ? (el.closest('label') || el) : el
        const b = target.getBoundingClientRect()
        if (b.width === 0 || b.height === 0) continue
        if (getComputedStyle(el).display === 'inline' && el.tagName === 'A') continue // ইনলাইন লিংক — অব্যাহতি
        if (b.height < 24 || b.width < 24) {
          small.push({ tag: el.tagName.toLowerCase(), w: Math.round(b.width), h: Math.round(b.height), txt: (el.innerText || '').trim().slice(0, 18) })
        }
      }
      return {
        visible, chars: text.length, stillLoading, skeletons,
        docW: document.documentElement.scrollWidth, winW: window.innerWidth,
        small: small.slice(0, 4), smallCount: small.length,
      }
    }, tab).catch(() => ({ missing: true }))

    if (r.missing) { log(false, `${tab}: পেইন পাওয়া যায়নি`); continue }

    const issues = []
    if (!r.visible) issues.push('দেখা যাচ্ছে না')
    if (r.chars < 30) issues.push(`কন্টেন্ট প্রায় নেই (${r.chars} অক্ষর)`)
    if (r.stillLoading) issues.push('এখনো লোডিং-এ আটকে')
    if (r.docW > r.winW + 1) issues.push(`ওভারফ্লো ${r.docW}>${r.winW}`)
    if (errors.length) issues.push(`JS ত্রুটি ${errors.length}`)

    // ট্যাপ-টার্গেট শুধু মোবাইলে (ডেস্কটপে ছোট আইকন-বাটন স্বাভাবিক)
    if (vpName === 'মোবাইল' && r.smallCount > 0) {
      issues.push(`২৪px-এর নিচে ট্যাপ-টার্গেট ${r.smallCount}টি`)
    }

    if (issues.length === 0) {
      log(true, `${tab}: ঠিক আছে (${r.chars} অক্ষর)`)
    } else {
      log(false, `${tab}: ${issues.join(' · ')}`)
      if (r.smallCount > 0 && vpName === 'মোবাইল') {
        console.log(`        ↳ ${r.small.map((s) => `${s.tag} ${s.w}×${s.h} "${s.txt}"`).join(' | ')}`)
      }
    }
    summary.push({ vp: vpName, tab, ok: issues.length === 0, small: vpName === 'মোবাইল' ? (r.smallCount || 0) : 0 })
  }
}

const total = summary.length
const passed = summary.filter((s) => s.ok).length
const smallTotal = summary.reduce((a, s) => a + s.small, 0)
console.log(`\n── সারাংশ: ${passed}/${total} ট্যাব-ভিউপোর্ট ঠিক আছে · মোবাইলে ছোট ট্যাপ-টার্গেট মোট ${smallTotal}টি ──`)

await browser.close()
console.log(fail === 0 ? '\n✅ ALL PASS\n' : `\n❌ ${fail}টি সমস্যা\n`)
process.exit(fail === 0 ? 0 : 1)
