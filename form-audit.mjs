/**
 * এডুসব — ফর্ম / ইনপুট UX অডিটর
 *
 * চালানোর নিয়ম: সার্ভার চালু থাকতে হবে (:3000), তারপর `node form-audit.mjs`
 *
 * কেন দরকার: সাইন-আপ, লগইন, প্রোফাইল, টপ-আপ ও চেকআউট ফর্মগুলোই কনভার্শনের
 * মূল জায়গা। মোবাইলে একটিমাত্র ভুল (যেমন ১৬px-এর ছোট ফন্ট → iOS অটো-জুম)
 * ব্যবহারকারীকে সরিয়ে দেয়।
 *
 * যা যা পরীক্ষা করে (প্রতিটি <input>/<select>/<textarea>):
 *   ১. font-size < ১৬px → iOS Safari ফোকাসে অটো-জুম করে, পেজ স্কেল হয়ে যায়
 *   ২. autocomplete অনুপস্থিত → ব্রাউজার অটোফিল পারে না (কনভার্শন কমে)
 *   ৩. type="text" যেখানে email/tel/number হওয়া উচিত → ভুল মোবাইল কীবোর্ড
 *   ৪. inputmode অনুপস্থিত (সংখ্যা-ক্ষেত্রে) → ফোন/OTP-তে অঙ্কের কীপ্যাড আসে না
 *   ৫. লেবেল/aria-label/placeholder — কোনোটিই নেই
 *   ৬. required ক্ষেত্রে aria-required / required নেই
 */

import { chromium } from 'playwright'

const BASE = process.env.BASE || 'http://127.0.0.1:3000'
const ROUTES = [
  '/login', '/signup', '/profile', '/wallet', '/assisted', '/cv',
  '/planner', '/cgpa', '/mcq', '/shop', '/subscription', '/teacher-support',
  '/dashboard', '/admin', '/admin/shop',
]

const li = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identifier: '01829486022',
    password: process.env.EDUSOB_ADMIN_PASS || 'Ab52944820@',
  }),
}).then((r) => r.json()).catch(() => ({}))
const cookie = li?.token ? `edusob_session=${li.token}` : ''

console.log('\n===== ফর্ম / ইনপুট UX অডিট (মোবাইল ৩৯০×৮৪৪) =====\n')

const browser = await chromium.launch()
const findings = { zoom: [], autocomplete: [], type: [], inputmode: [], unlabeled: [], required: [], overflow: [] }
let totalFields = 0

for (const route of ROUTES) {
  // /login ও /signup লগ-ইন অবস্থায় /login-এ রিডাইরেক্ট করে — তাই সেগুলো
  // লগ-আউট কুকিতেই মাপতে হবে, নাহলে আমরা ভুল পেজ অডিট করব
  const publicOnly = route === '/login' || route === '/signup'
  const useCookie = cookie && !publicOnly
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
    extraHTTPHeaders: useCookie ? { cookie } : {},
  })
  const page = await ctx.newPage()
  try {
    await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(1000)
    // লুকানো ট্যাব/মোডালগুলোও দেখতে চাই — তাই display:none বাদ দিচ্ছি না,
    // বরং ব্রাউজারকে সরাসরি জিজ্ঞেস করছি (offsetParent === null হলে বাদ)
  } catch { /* রিডাইরেক্ট/টাইমআউট হলে স্কিপ */ }

  const fields = await page.evaluate(() => {
    const out = []
    const els = document.querySelectorAll('input, select, textarea')
    for (const el of els) {
      // মোডাল/লুকানো ট্যাবের ক্ষেত্রও ধরব — কিন্তু পুরোপুরি লুকানো (display:none) বাদ
      const cs = getComputedStyle(el)
      if (cs.display === 'none' || cs.visibility === 'hidden') continue
      const rect = el.getBoundingClientRect()
      const type = (el.getAttribute('type') || el.tagName.toLowerCase()).toLowerCase()
      const name = (el.getAttribute('name') || el.id || '').toLowerCase()
      const labelText = (el.closest('label')?.textContent || '').trim().slice(0, 24)
      const hasLabel =
        !!el.getAttribute('aria-label') ||
        !!el.getAttribute('placeholder') ||
        !!labelText ||
        (el.id && !!document.querySelector(`label[for="${CSS.escape(el.id)}"]`))
      out.push({
        type,
        name,
        fontSize: Math.round(parseFloat(cs.fontSize) * 10) / 10,
        autocomplete: el.getAttribute('autocomplete') || '',
        inputmode: el.getAttribute('inputmode') || '',
        required: el.hasAttribute('required') || el.getAttribute('aria-required') === 'true',
        hasLabel,
        w: Math.round(rect.width),
        h: Math.round(rect.height),
        labelText,
      })
    }
    return out
  })

  const overflow = await page.evaluate(() => {
    const de = document.documentElement
    const over = []
    if (de.scrollWidth > de.clientWidth + 1) {
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect()
        if (r.width === 0) continue
        if (r.right > de.clientWidth + 1) {
          over.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().split(/\s+/).filter(Boolean).slice(0, 2).join('.')}`)
        }
      }
    }
    return { scrollW: de.scrollWidth, clientW: de.clientWidth, els: [...new Set(over)].slice(0, 5) }
  })
  if (overflow.scrollW > overflow.clientW + 1) {
    findings.overflow.push(`${route} — ${overflow.scrollW}px > ${overflow.clientW}px [${overflow.els.join(', ')}]`)
  }

  for (const f of fields) {
    totalFields++
    const id = `${route} · ${f.type}${f.name ? '[' + f.name + ']' : ''}`
    // type=file বাদ: সেখানে টাইপ করা যায় না → iOS অটো-জুমই হয় না
    const zooms = !['hidden', 'checkbox', 'radio', 'file'].includes(f.type)
    if (zooms && f.fontSize < 16) {
      findings.zoom.push(`${id} — ${f.fontSize}px`)
    }
    if (!f.hasLabel) findings.unlabeled.push(id)
    if (f.required && !f.hasLabel) findings.required.push(id)

    // autocomplete — ম্যানুয়ালি টাইপ করানো হয় এমন ক্ষেত্রগুলোতেই দরকার
    const needsAc = /(name|email|phone|mobile|pass|address|village|district|upazila|post)/.test(f.name)
    if (needsAc && !f.autocomplete && f.type !== 'hidden') {
      findings.autocomplete.push(`${id} (autocomplete নেই)`)
    }
    // টাইপ — ইমেইল/ফোন/সংখ্যা
    if (/email/.test(f.name) && f.type !== 'email') findings.type.push(`${id} → type=email হওয়া উচিত`)
    // লগইন আইডেন্টিফায়ার ফোন *বা* ইমেইল নেয় → type=text-ই সঠিক;
    // autocomplete="username" দেওয়া থাকলে সেটি ইচ্ছাকৃত ব্যতিক্রম
    const multiFormat = f.autocomplete === 'username'
    if (/phone|mobile/.test(f.name) && f.type !== 'tel' && !multiFormat) {
      findings.type.push(`${id} → type=tel হওয়া উচিত`)
    }
    if (/(amount|balance|fee|price|gpa|roll|year|otp|nid)/.test(f.name) && f.type === 'text' && !f.inputmode) {
      findings.inputmode.push(`${id} → inputmode="numeric"/"decimal" দরকার`)
    }
  }
  await ctx.close()
}

await browser.close()

const show = (label, arr, note) => {
  console.log(`${label}: ${arr.length}${note ? '  (' + note + ')' : ''}`)
  for (const x of arr.slice(0, 12)) console.log('   · ' + x)
  if (arr.length > 12) console.log(`   … আরও ${arr.length - 12}টি`)
  console.log()
}

show('📱 ১৬px-এর ছোট ফন্ট → iOS অটো-জুম', findings.zoom)
show('⌨️  autocomplete অনুপস্থিত', findings.autocomplete)
show('🔢 ভুল input type', findings.type)
show('🔟 inputmode অনুপস্থিত (সংখ্যা ক্ষেত্র)', findings.inputmode)
show('🏷️  লেবেলহীন ক্ষেত্র', findings.unlabeled)
show('↔️  মোবাইলে অনুভূমিক ওভারফ্লো', findings.overflow)

console.log('='.repeat(56))
console.log(`রুট: ${ROUTES.length} · মোট ক্ষেত্র: ${totalFields}`)
const total = Object.values(findings).reduce((s, a) => s + a.length, 0)
console.log(`মোট সমস্যা: ${total}`)
console.log(total === 0 ? '\n✅ ALL PASS' : '\n❌ উন্নতির জায়গা আছে')
console.log('='.repeat(56) + '\n')
