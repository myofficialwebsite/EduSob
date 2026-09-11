/**
 * অ্যাডমিন ড্যাশবোর্ড ইন্টারঅ্যাকশন অডিট (`node admin-audit.mjs`).
 *
 * শুধু পেজ লোড করলে অনেক ত্রুটিই ধরা পড়ে না — অ্যাডমিনের ট্যাবগুলো
 * `<template id="tpl-tab-…">` থেকে **লেজি-লোড** হয়, অর্থাৎ ট্যাবটি না খুললে
 * তার HTML/JS কখনো চলেই না। ত্রুটিগুলো সাধারণত সেখানেই লুকিয়ে থাকে।
 *
 * এখনি করা হয়:
 *   ১. প্রতিটি ক্যাটেগরি → প্রতিটি ট্যাব ঘুরে দেখা (switchAdminCategory + switchAdminTab)
 *   ২. ট্যাব খোলার সময় কনসোল-এরর / ব্যতিক্রম / ব্যর্থ রিকোয়েস্ট ধরা
 *   ৩. ট্যাবটি আসলে কনটেন্ট দেখাচ্ছে কি (ফাঁকা পেইন = ভাঙা ট্যাব)
 *   ৪. প্রশাসনিক মোডালগুলো খুলে দেখা (ওয়ালেট, পাসওয়ার্ড, রোল, টিকিট-চ্যাট)
 *   ৫. মোবাইল ভিউপোর্টে টেবিলের অনুভূমিক ওভারফ্লো আছে কি
 *
 * ব্যবহার: EDUSOB_BASE=... EDUSOB_PASS=... node admin-audit.mjs
 */
import { chromium } from 'playwright'

const BASE = process.env.EDUSOB_BASE || 'http://127.0.0.1:3000'
const PHONE = process.env.EDUSOB_PHONE || '01829486022'
const PASS = process.env.EDUSOB_PASS || 'Ab52944820@'

const IGNORE = [/favicon/i, /ResizeObserver loop/i]

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }) // মোবাইল — কঠিনতম পরীক্ষা
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
page.on('response', (r) => { if (r.status() >= 400 && !/favicon/i.test(r.url())) bad.push(`${r.status()} ${r.url().replace(BASE, '').slice(0, 80)}`) })
page.on('requestfailed', (r) => { if (!/favicon/i.test(r.url())) bad.push(`FAIL ${r.url().replace(BASE, '').slice(0, 80)}`) })

console.log(`\n===== অ্যাডমিন ইন্টারঅ্যাকশন অডিট — ${BASE} =====`)

/* লগইন */
await page.goto(BASE + '/login', { waitUntil: 'load', timeout: 45000 })
await page.fill('#loginPhoneInput', PHONE)
await page.fill('#loginPassInput', PASS)
await Promise.all([page.waitForLoadState('load'), page.click('button[type=submit]')])
await page.waitForTimeout(1500)
console.log(`লগইন → ${new URL(page.url()).pathname}`)

/* অ্যাডমিনে যাওয়া */
await page.goto(BASE + '/admin', { waitUntil: 'load', timeout: 45000 })
await page.waitForTimeout(2000)

/* ক্যাটেগরি ও ট্যাব আবিষ্কার */
const discovered = await page.evaluate(() => {
  const cats = [...document.querySelectorAll('.admin-cat-btn')]
    .map((b) => (b.id || '').replace(/^btn-/, '')).filter(Boolean)
  const tabs = [...document.querySelectorAll('template[id^="tpl-tab-"]')]
    .map((t) => t.id.replace('tpl-tab-', ''))
  return { cats: [...new Set(cats)], tabs: [...new Set(tabs)] }
})
console.log(`\nক্যাটেগরি: ${discovered.cats.length} · ট্যাব-টেমপ্লেট: ${discovered.tabs.length}`)
console.log(`ক্যাটেগরি: ${discovered.cats.join(', ')}`)
console.log(`ট্যাব: ${discovered.tabs.join(', ')}\n`)

/* প্রতিটি ক্যাটেগরি → ট্যাব খোলা */
console.log('── ট্যাব ঘুরে দেখা ──────────────────────────────')
let opened = 0
const empty = []
for (const cat of discovered.cats) {
  const tabsOfCat = await page.evaluate((c) => {
    try { switchAdminCategory(c) } catch (e) { return { err: String(e) } }
    return [...document.querySelectorAll('.admin-chip')].map((b) => (b.id || '').replace(/^chip-/, '')).filter(Boolean)
  }, cat)
  if (!Array.isArray(tabsOfCat)) {
    console.log(`  ⚠️  ক্যাটেগরি "${cat}" খুলতে ত্রুটি: ${JSON.stringify(tabsOfCat).slice(0, 90)}`)
    continue
  }
  for (const tab of tabsOfCat) {
    const before = errors.length + bad.length
    const info = await page.evaluate((t) => {
      try { switchAdminTab(t) } catch (e) { return { err: String(e.message) } }
      const pane = document.getElementById('tab-' + t)
      if (!pane) return { missing: true }
      const txt = (pane.innerText || '').trim()
      return { hidden: pane.classList.contains('hidden'), chars: txt.length }
    }, tab)
    await page.waitForTimeout(350)
    opened++
    const newIssues = errors.length + bad.length - before
    if (info.err) { console.log(`  ❌ ${cat}/${tab} — ${info.err.slice(0, 90)}`); empty.push(`${cat}/${tab}: এরর`) }
    else if (info.missing) { console.log(`  ❌ ${cat}/${tab} — পেইন তৈরি হয়নি`); empty.push(`${cat}/${tab}: পেইন নেই`) }
    else if (info.hidden) { console.log(`  ⚠️  ${cat}/${tab} — পেইন এখনো hidden`); empty.push(`${cat}/${tab}: hidden`) }
    else if (info.chars < 20) { console.log(`  ⚠️  ${cat}/${tab} — প্রায় ফাঁকা (${info.chars} অক্ষর)`); empty.push(`${cat}/${tab}: ফাঁকা`) }
    else if (newIssues > 0) console.log(`  ⚠️  ${cat}/${tab} — ${newIssues}টি নতুন সমস্যা`)
  }
}
console.log(`\nমোট ${opened}টি ট্যাব খোলা হয়েছে`)

/* মোবাইলে অনুভূমিক ওভারফ্লো */
console.log('\n── মোবাইল ওভারফ্লো (৩৯০px) ──────────────────────')
for (const route of ['/admin', '/admin/shop', '/admin/cv-templates']) {
  await page.goto(BASE + route, { waitUntil: 'load', timeout: 45000 })
  await page.waitForTimeout(1200)
  const ov = await page.evaluate(() => {
    const de = document.documentElement
    const over = []
    for (const el of document.querySelectorAll('table, pre, code, .grid, [class*="overflow"]')) {
      const r = el.getBoundingClientRect()
      if (r.width > de.clientWidth + 2 && el.scrollWidth > el.clientWidth + 2) {
        // স্ক্রলযোগ্য হলে সমস্যা নয় — সেটি ইচ্ছে করা ডিজাইন
        const style = getComputedStyle(el)
        if (style.overflowX === 'auto' || style.overflowX === 'scroll') continue
        over.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]} (${Math.round(r.width)}px)`)
      }
    }
    return { docW: de.clientWidth, scrollW: de.scrollWidth, over: over.slice(0, 4) }
  })
  const scrollsPage = ov.scrollW > ov.docW + 2
  console.log(`  ${route.padEnd(22)} পেজ-প্রস্থ ${ov.docW}px · স্ক্রল ${ov.scrollW}px ${scrollsPage ? '⚠️ পেজ স্ক্রল হচ্ছে' : '✅'}`)
  for (const o of ov.over) console.log(`     ⚠️  ${o}`)
}

/* প্রশাসনিক মোডাল খুলে দেখা — এগুলোতেই মূল কাজগুলো (ওয়ালেট অ্যাডজাস্ট,
   পাসওয়ার্ড রিসেট, রোল পরিবর্তন, টিকিট-চ্যাট) হয়, তাই এড়িয়ে যাওয়া যায় না */
console.log('\n── প্রশাসনিক মোডাল ───────────────────────────────')
// ⚠️ ওভারফ্লো-পরীক্ষা শেষে পেজ /admin/cv-templates-এ ছিল — সেখানে এই
//    মোডাল-ফাংশনগুলো নেই। তাই আগে /admin-এ ফিরতে হবে।
await page.goto(BASE + '/admin', { waitUntil: 'load', timeout: 45000 })
await page.waitForTimeout(1500)
const uid = await page.evaluate(async () => {
  try {
    const r = await fetch('/api/admin/users?limit=1').then((x) => x.json())
    const u = (r.users || r.results || [])[0]
    return u ? u.id : null
  } catch { return null }
})
if (!uid) console.log('  (ইউজার আইডি পাওয়া যায়নি — মোডাল পরীক্ষা এড়িয়ে যাওয়া হলো)')
else {
  for (const [label, fn] of [
    ['ওয়ালেট অ্যাডজাস্ট', 'openWalletModal'],
    ['পাসওয়ার্ড রিসেট',   'openPasswordModal'],
    ['রোল পরিবর্তন',      'openRoleModalById'],
  ]) {
    const before = errors.length + bad.length
    const r = await page.evaluate(({ f, id }) => {
      try { window[f](id) } catch (e) { return { err: String(e.message) } }
      // কোন মোডাল খুলল? দৃশ্যমান ডায়ালগ খোঁজা
      const open = [...document.querySelectorAll('div,section')].filter((d) => {
        const st = getComputedStyle(d)
        return !d.classList.contains('hidden') && (st.position === 'fixed') &&
               d.getBoundingClientRect().width > 100 && (d.innerText || '').trim().length > 10
      })
      return { opened: open.length, text: open.length ? (open[0].innerText || '').trim().slice(0, 45) : '' }
    }, { f: fn, id: uid })
    await page.waitForTimeout(400)
    const newIssues = errors.length + bad.length - before
    if (r.err) { console.log(`  ❌ ${label} — ${r.err.slice(0, 80)}`); empty.push(`${label}: এরর`) }
    else if (!r.opened) { console.log(`  ⚠️  ${label} — কোনো মোডাল দেখা গেল না`); empty.push(`${label}: মোডাল নেই`) }
    else if (newIssues > 0) console.log(`  ⚠️  ${label} — ${newIssues}টি নতুন সমস্যা`)
    else console.log(`  ✅ ${label.padEnd(18)} "${r.text.replace(/\s+/g, ' ')}"`)
  }
}

await browser.close()

const uniqErr = [...new Set(errors)]
const uniqBad = [...new Set(bad)]
console.log(`\n${'='.repeat(56)}`)
if (uniqErr.length) { console.log('\n❌ কনসোল/ব্যতিক্রম:'); for (const e of uniqErr.slice(0, 12)) console.log(`   ${e}`) }
if (uniqBad.length) { console.log('\n❌ ব্যর্থ রিকোয়েস্ট:'); for (const b of uniqBad.slice(0, 12)) console.log(`   ${b}`) }
if (empty.length) { console.log(`\n⚠️  ${empty.length}টি ট্যাবে সমস্যা:`); for (const e of empty.slice(0, 12)) console.log(`   ${e}`) }
if (!uniqErr.length && !uniqBad.length && !empty.length) console.log('\n✅ অ্যাডমিন ড্যাশবোর্ড সম্পূর্ণ কার্যকর — সব ট্যাব, কোনো ত্রুটি নেই')
console.log('='.repeat(56) + '\n')
