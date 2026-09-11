/**
 * এডুসব — কনভার্শন ফানেল অডিটর
 *
 * চালানোর নিয়ম: সার্ভার চালু থাকতে হবে (:3000), তারপর `node funnel-audit.mjs`
 *
 * কেন দরকার: একটি পোর্টাল যতই সুন্দর হোক, সাইন-আপ → সাবস্ক্রিপশন → পেমেন্ট
 * পথে ঘর্ষণ থাকলে ব্যবহারকারী পালায়। এই অডিটর সেই পথটি *নিজে হেঁটে* মাপে:
 *
 *   ১. দাম কি সাইন-আপের আগেই দেখা যায়? (দাম লুকালে কনভার্শন কমে)
 *   ২. সাইন-আপ ফর্মে কতগুলো ক্ষেত্র — আর ভুল দিলে কী বার্তা আসে?
 *   ৩. ভুলের পর ব্যবহারকারীর টাইপ করা তথ্য টিকে থাকে? (না থাকলে ভয়াবহ বিরক্তি)
 *   ৪. সাইন-আপের পর প্রথম স্ক্রিনে পরের পদক্ষেপ স্পষ্ট?
 *   ৫. পেমেন্ট/চেকআউটের পাশে বিশ্বাসের চিহ্ন (হেল্পলাইন, রিফান্ড, নিরাপত্তা)?
 *   ৬. লগ-ইন ছাড়াই কী কী দেখা/ব্যবহার করা যায়? (ট্রায়াল প্রভাব)
 */

import { chromium } from 'playwright'

const BASE = process.env.BASE || 'http://127.0.0.1:3000'
const findings = []
const notes = []
const add = (area, msg) => findings.push({ area, msg })
const note = (area, msg) => notes.push({ area, msg })

const browser = await chromium.launch()
console.log('\n===== কনভার্শন ফানেল অডিট =====\n')

/* ─────────────────────────────────────────────────────────
   ১. ল্যান্ডিং: দাম ও প্রধান CTA
   ───────────────────────────────────────────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true })
  const p = await ctx.newPage()
  await p.goto(BASE + '/', { waitUntil: 'load', timeout: 30000 })
  await p.waitForTimeout(800)

  const r = await p.evaluate(() => {
    const text = document.body.innerText
    // দাম: "৳" বা "টাকা" বা "মূল্য" বা "/মাস"
    // সতর্কতা: ৳ + বাংলা অঙ্ক (tk() 'bn-BD' লোকেলে ফরম্যাট করে) — শুধু \d দিলে মেলে না
    const priceHits = (text.match(/৳\s?[০-৯0-9,]+|টাকা|\/\s?মাস|মাসিক/gi) || []).length
    const pricingLinks = [...document.querySelectorAll('a')]
      .filter((a) => /সাবস্ক্রিপ|মূল্য|প্যাকেজ|প্রাইস|প্ল্যান|দাম/i.test(a.textContent))
      .map((a) => (a.textContent || '').trim().slice(0, 24))
    // প্রধান CTA (হিরোর ভেতরের লিংক/বাটন)
    const hero = document.querySelector('section') || document.body
    const ctas = [...hero.querySelectorAll('a,button')]
      .map((e) => (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 26))
      .filter((t) => t && t.length > 2)
    return { priceHits, pricingLinks: [...new Set(pricingLinks)], ctas: [...new Set(ctas)].slice(0, 8) }
  })

  note('ল্যান্ডিং', `দাম-সংক্রান্ত উল্লেখ: ${r.priceHits}টি`)
  note('ল্যান্ডিং', `দাম/প্ল্যান লিংক: ${r.pricingLinks.length ? r.pricingLinks.join(' | ') : 'কোনোটিই নেই'}`)
  note('ল্যান্ডিং', `হিরো CTA: ${r.ctas.slice(0, 5).join(' | ')}`)
  if (r.priceHits === 0) add('ল্যান্ডিং', 'হোমপেজে কোথাও কোনো দাম বা মূল্যের উল্লেখ নেই — ব্যবহারকারী সাইন-আপের আগে বুঝতে পারছে না খরচ কত')
  if (r.pricingLinks.length === 0) add('ল্যান্ডিং', 'হোমপেজ থেকে সাবস্ক্রিপশন/মূল্য পেজে কোনো লিংক নেই')
  await ctx.close()
}

/* ─────────────────────────────────────────────────────────
   ২. সাবস্ক্রিপশন পেজ: লগ-ইন ছাড়াই দেখা যায়?
   ───────────────────────────────────────────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true })
  const p = await ctx.newPage()
  const resp = await p.goto(BASE + '/subscription', { waitUntil: 'load', timeout: 30000 })
  await p.waitForTimeout(800)
  const url = new URL(p.url()).pathname
  const status = resp?.status()
  const r = await p.evaluate(() => {
    const text = document.body.innerText
    const prices = (text.match(/৳\s?[০-৯0-9,]+/g) || []).slice(0, 10)
    const planNames = [...document.querySelectorAll('h2,h3')]
      .map((h) => (h.textContent || '').trim().slice(0, 20))
      .filter(Boolean)
    return { prices, planNames: [...new Set(planNames)].slice(0, 6) }
  })
  note('সাবস্ক্রিপশন', `HTTP ${status} · লগ-আউট অবস্থায় পথ: ${url}`)
  note('সাবস্ক্রিপশন', `পাওয়া দাম: ${r.prices.length ? r.prices.join(', ') : 'কোনোটিই নেই'}`)
  note('সাবস্ক্রিপশন', `প্ল্যান/শিরোনাম: ${r.planNames.join(' | ') || '—'}`)
  if (url !== '/subscription') add('সাবস্ক্রিপশন', `লগ-ইন ছাড়া /subscription দেখা যাচ্ছে না — ${url}-এ রিডাইরেক্ট করে`)
  else if (r.prices.length === 0) add('সাবস্ক্রিপশন', '/subscription পেজে কোনো দাম দেখা যাচ্ছে না')
  await ctx.close()
}

/* ─────────────────────────────────────────────────────────
   ৩. সাইন-আপ: ক্ষেত্র-সংখ্যা, ভুল বার্তা, তথ্য সংরক্ষণ
   ───────────────────────────────────────────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true })
  const p = await ctx.newPage()
  await p.goto(BASE + '/signup', { waitUntil: 'load', timeout: 30000 })
  await p.waitForTimeout(600)

  const fields = await p.evaluate(() => {
    const f = [...document.querySelectorAll('#signupForm input, #signupForm select')]
    return {
      total: f.length,
      required: f.filter((e) => e.hasAttribute('required')).length,
      names: f.map((e) => e.getAttribute('name') || e.id),
    }
  })
  note('সাইন-আপ', `মোট ক্ষেত্র ${fields.total}টি · বাধ্যতামূলক ${fields.required}টি`)
  note('সাইন-আপ', `ক্ষেত্র: ${fields.names.join(', ')}`)
  if (fields.required > 4) add('সাইন-আপ', `সাইন-আপে ${fields.required}টি বাধ্যতামূলক ক্ষেত্র — প্রথম ধাপে ২–৩টি (নাম, ফোন, পাসওয়ার্ড) আদর্শ`)

  // নেটিভ ভ্যালিডেশনের বার্তা কোন ভাষায়? (বাংলা সাইটে ইংরেজি বার্তা = বিসঙ্গতি)
  const nativeMsg = await p.evaluate(() => {
    const el = document.querySelector('#signupForm input[name="phone"]')
    if (!el) return null
    el.value = '0123456789'
    return { valid: el.checkValidity(), msg: el.validationMessage.slice(0, 60) }
  })
  if (nativeMsg && !nativeMsg.valid && /[a-zA-Z]/.test(nativeMsg.msg) && !/[\u0980-\u09FF]/.test(nativeMsg.msg)) {
    add('সাইন-আপ', `ভুল ফরম্যাটে ব্রাউজারের বার্তাটি ইংরেজিতে: "${nativeMsg.msg}" — বাংলায় দেওয়া উচিত`)
  }
  if (nativeMsg) note('সাইন-আপ', `নেটিভ ভ্যালিডেশন: ${nativeMsg.valid ? 'নেই' : 'আছে'} · বার্তা: "${nativeMsg.msg}"`)

  // সার্ভার-পর্যায়ের এরর (ইতিমধ্যে থাকা নম্বর) → ইনলাইন বার্তা আসে?
  await p.fill('#signupForm input[name="name_bn"]', 'টেস্ট ব্যবহারকারী')
  await p.fill('#signupForm input[name="phone"]', '01829486022') // আগে থেকেই আছে
  await p.fill('#signupForm input[name="password"]', 'test1234')
  await p.click('#signupBtn')
  await p.waitForTimeout(2500)

  const after = await p.evaluate(() => {
    const err = document.getElementById('signupError')
    const btn = document.getElementById('signupBtn')
    return {
      errVisible: err ? !err.classList.contains('hidden') : false,
      errText: err ? (err.textContent || '').trim().slice(0, 80) : '',
      btnReEnabled: btn ? !btn.disabled : true,
      btnText: btn ? (btn.textContent || '').trim().slice(0, 30) : '',
      keptName: document.querySelector('#signupForm input[name="name_bn"]')?.value || '',
      keptPhone: document.querySelector('#signupForm input[name="phone"]')?.value || '',
    }
  })
  note('সাইন-আপ', `ভুল নম্বরে বার্তা: "${after.errText}"`)
  if (!after.errVisible || !after.errText) add('সাইন-আপ', 'ভুল তথ্য দিলে কোনো বার্তা দেখা যাচ্ছে না')
  else if (!/মোবাইল|নম্বর|ফোন/i.test(after.errText)) add('সাইন-আপ', `বার্তাটি কোন ক্ষেত্রের ভুল তা বলছে না: "${after.errText}"`)
  if (!after.btnReEnabled) add('সাইন-আপ', 'ভুলের পর সাবমিট বাটন আবার চালু হচ্ছে না — ব্যবহারকারী আটকে যাবে')
  if (after.keptName && after.keptPhone) note('সাইন-আপ', `ভুলের পর তথ্য টিকে আছে ✓ (নাম: "${after.keptName.slice(0, 12)}")`)
  else add('সাইন-আপ', 'ভুলের পর টাইপ করা তথ্য মুছে যায় — ব্যবহারকারীকে আবার লিখতে হবে')
  await ctx.close()
}

/* ─────────────────────────────────────────────────────────
   ৪. পেমেন্ট/চেকআউট: বিশ্বাসের চিহ্ন
   ───────────────────────────────────────────────────────── */
{
  const li = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: '01829486022', password: process.env.EDUSOB_ADMIN_PASS || 'Ab52944820@' }),
  }).then((r) => r.json()).catch(() => ({}))
  const cookie = li?.token ? `edusob_session=${li.token}` : ''

  for (const route of ['/wallet', '/shop']) {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 }, isMobile: true,
      extraHTTPHeaders: cookie ? { cookie } : {},
    })
    const p = await ctx.newPage()
    await p.goto(BASE + route, { waitUntil: 'load', timeout: 30000 }).catch(() => {})
    await p.waitForTimeout(900)
    const r = await p.evaluate(() => {
      const t = document.body.innerText
      const has = (re) => re.test(t)
      return {
        helpline: has(/হেল্পলাইন|01835|ফোন|কল/i),
        refund: has(/রিফান্ড|ফেরত|রিটার্ন/i),
        secure: has(/নিরাপদ|সুরক্ষা|এনক্রিপ্ট|secure|ssl/i),
        privacy: has(/গোপনীয়তা|প্রাইভেসি|তথ্য সুরক্ষা/i),
        amountFields: [...document.querySelectorAll('input')].filter((e) =>
          /amount|balance|fee|price/i.test((e.getAttribute('name') || e.id || ''))).length,
        payButtons: [...document.querySelectorAll('button,a')]
          .map((e) => (e.textContent || '').trim().slice(0, 22))
          .filter((t2) => /পেমেন্ট|কিনুন|কনফার্ম|অর্ডার|সাবমিট|জমা|টপ.?আপ/i.test(t2)),
      }
    })
    note(route, `হেল্পলাইন:${r.helpline ? '✓' : '✗'} রিফান্ড:${r.refund ? '✓' : '✗'} নিরাপত্তা:${r.secure ? '✓' : '✗'} গোপনীয়তা:${r.privacy ? '✓' : '✗'}`)
    note(route, `পেমেন্ট বাটন: ${r.payButtons.slice(0, 3).join(' | ') || '—'}`)
    if (!r.helpline) add(route, 'পেমেন্ট পেজে কোনো হেল্পলাইন/যোগাযোগ নম্বর নেই — টাকা দেওয়ার আগে মানুষ যোগাযোগের মাধ্যম খোঁজে')
    // সতর্কতা: রিফান্ড/নিরাপত্তার *দাবি* এখানে যোগ করা যায় না — সাইটে কোনো
    // রিফান্ড/প্রাইভেসি নীতিমালা পেজই নেই, তাই লিখলে তা কাল্পনিক প্রতিশ্রুতি
    // হয়। বরং নীতিমালা পেজের অনুপস্থিতিই আলাদা ফলাফল হিসেবে ধরা হয়েছে।

    await ctx.close()
  }
}

/* ─────────────────────────────────────────────────────────
   ৫. লগ-ইন ছাড়া কী কী পাওয়া যায়? (ট্রায়াল প্রভাব)
   ───────────────────────────────────────────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true })
  const p = await ctx.newPage()
  const rows = []
  for (const route of ['/results', '/mcq', '/cgpa', '/cv', '/notices', '/scholarships', '/qpapers']) {
    const resp = await p.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => null)
    await p.waitForTimeout(500)
    const path = new URL(p.url()).pathname
    const usable = await p.evaluate(() => {
      // ফর্ম/ইনপুট/তালিকা — কিছু ব্যবহার করা যায় কি?
      const inputs = [...document.querySelectorAll('input,select,textarea')].filter((e) => {
        const cs = getComputedStyle(e); return cs.display !== 'none' && !e.disabled
      }).length
      const wall = /লগইন|লগ-ইন করুন|সাইন.?আপ করুন|প্রিমিয়াম|আনলক/i.test(document.body.innerText)
      return { inputs, wall }
    })
    rows.push(`      ${route.padEnd(15)} ${String(resp?.status() ?? '-').padEnd(4)} → ${path.padEnd(14)} ইনপুট:${String(usable.inputs).padStart(2)}  ${usable.wall ? 'লগইন-প্রাচীর' : 'ব্যবহারযোগ্য'}`)
  }
  note('ট্রায়াল', 'লগ-আউট অবস্থায়:\n' + rows.join('\n'))
  await ctx.close()
}

/* ─────────────────────────────────────────────────────────
   ৬. নীতিমালা / আইনি পেজ (বিশ্বাস ও সম্মতির ভিত্তি)
   ───────────────────────────────────────────────────────── */
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const p = await ctx.newPage()
  await p.goto(BASE + '/', { waitUntil: 'load', timeout: 30000 })
  await p.waitForTimeout(600)
  const r = await p.evaluate(() => {
    const hrefs = [...document.querySelectorAll('a')].map((a) => a.getAttribute('href') || '')
    const has = (re) => hrefs.some((h) => re.test(h))
    return {
      privacy: has(/privacy|গোপনীয়তা/i),
      terms: has(/terms|শর্তাবলী/i),
      refund: has(/refund|রিফান্ড/i),
      contact: has(/contact|যোগাযোগ/i),
      totalLinks: hrefs.length,
    }
  })
  note('নীতিমালা', `প্রাইভেসি:${r.privacy ? '✓' : '✗'} শর্তাবলী:${r.terms ? '✓' : '✗'} রিফান্ড:${r.refund ? '✓' : '✗'} যোগাযোগ:${r.contact ? '✓' : '✗'}`)
  if (!r.privacy && !r.terms && !r.refund) {
    add('নীতিমালা', 'সাইটে কোনো প্রাইভেসি/শর্তাবলী/রিফান্ড নীতিমালা পেজ নেই — পেমেন্ট নেওয়া সাইটে এটি বিশ্বাস ও আইনি সম্মতি দুটোতেই ঘাটতি (ব্যবসায়িক সিদ্ধান্ত — কোডে উদ্ভাবন করে লেখা ঠিক নয়)')
  }
  await ctx.close()
}

await browser.close()

console.log('ℹ️  পর্যবেক্ষণ (ইনফরমেশন):')
for (const n of notes) console.log(`   [${n.area}] ${n.msg}`)
console.log()
if (findings.length) {
  console.log(`🔧 উন্নতির জায়গা: ${findings.length}`)
  for (const f of findings) console.log(`   [${f.area}] ${f.msg}`)
} else {
  console.log('✅ কোনো ঘর্ষণ পাওয়া যায়নি')
}
console.log('\n==========================================\n')
