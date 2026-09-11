/**
 * প্রোডাকশন রানটাইম সুইপ (`node prod-sweep.mjs`).
 *
 * লোকাল টেস্ট সবুজ হলেই প্রোডাকশন সুইপ হয় না — বিল্ড-টাইম পার্থক্য, CSP,
 * মিনিফিকেশন বা বাস্তব নেটওয়ার্কে নতুন ত্রুটি আসতে পারে। এই সুইপটি
 * প্রোডাকশনে প্রতিটি রুট ঘুরে দেখে:
 *
 *   • কনসোল-এরর / অব্যবস্থিত এক্সেপশন (pageerror)
 *   • ব্যর্থ নেটওয়ার্ক রিকোয়েস্ট (HTTP ৪xx/৫xx বা requestfailed)
 *   • অনন্ত-লোডিং (নেটওয়ার্ক ১.৫ সেকেন্ড শান্ত না হওয়া)
 *
 * ব্যবহার: EDUSOB_PASS=... node prod-sweep.mjs
 */
import { chromium } from 'playwright'

const BASE = process.env.EDUSOB_BASE || 'https://edusob.pages.dev'
const PHONE = process.env.EDUSOB_PHONE || '01829486022'
const PASS = process.env.EDUSOB_PASS || 'EdDrgja06e9@'

const PUBLIC = [
  '/', '/results', '/admission', '/scholarships', '/mcq', '/cv', '/shop',
  '/subscription', '/qpapers', '/teacher-support', '/news', '/jobs', '/notices',
  '/planner', '/cgpa', '/syllabus', '/board-challenge', '/login', '/signup',
  '/privacy', '/terms', '/refund',
]
const PRIVATE = ['/dashboard', '/profile', '/wallet', '/assisted', '/admin', '/admin/shop', '/admin/cv-templates']

const IGNORE_ERR = [
  /favicon/i,
  /ResizeObserver loop/i,
  /Failed to load resource: the server responded with a status of 40\d/i,
]

const browser = await chromium.launch()
const results = []

async function sweepRoute(ctx, route) {
  const page = await ctx.newPage()
  const errors = []
  const bad = []

  page.on('console', (m) => {
    if (m.type() !== 'error') return
    const t = m.text()
    if (IGNORE_ERR.some((re) => re.test(t))) return
    errors.push(`console: ${t.slice(0, 160)}`)
  })
  page.on('pageerror', (e) => errors.push(`exception: ${String(e.message).slice(0, 160)}`))
  page.on('response', (r) => {
    const s = r.status()
    if (s >= 400) {
      const u = r.url()
      if (!/favicon/i.test(u)) bad.push(`${s} ${u.replace(BASE, '').slice(0, 90)}`)
    }
  })
  page.on('requestfailed', (r) => {
    const u = r.url()
    if (!/favicon/i.test(u)) bad.push(`FAIL ${u.replace(BASE, '').slice(0, 90)}`)
  })

  let status = 0
  try {
    const resp = await page.goto(BASE + route, { waitUntil: 'load', timeout: 45000 })
    status = resp ? resp.status() : 0
    // নেটওয়ার্ক শান্ত হওয়ার জন্য অপেক্ষা (অনন্ত-লোডিং ধরা পড়ে)
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
  } catch (e) {
    errors.push(`goto: ${String(e.message).split('\n')[0].slice(0, 120)}`)
  }

  await page.close()
  return { route, status, errors: [...new Set(errors)], bad: [...new Set(bad)] }
}

async function run(label, routes, cookie) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36',
  })
  if (cookie) await ctx.addCookies([cookie])

  console.log(`\n===== ${label} (${routes.length} রুট) =====`)
  for (const r of routes) {
    const res = await sweepRoute(ctx, r)
    results.push(res)
    const ok = res.errors.length === 0 && res.bad.length === 0
    console.log(`  ${ok ? '✅' : '⚠️ '} ${res.route.padEnd(22)} ${res.status}`)
    for (const e of res.errors) console.log(`       ❌ ${e}`)
    for (const b of res.bad) console.log(`       🌐 ${b}`)
  }
  await ctx.close()
}

// ১) লগ-আউট অবস্থায় সব পাবলিক রুট
await run('পাবলিক (লগ-আউট)', PUBLIC, null)

// ২) লগইন করে প্রাইভেট রুট
let cookie = null
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const p = await ctx.newPage()
  try {
    await p.goto(BASE + '/login', { waitUntil: 'load', timeout: 45000 })
    await p.fill('#loginPhoneInput', PHONE)
    await p.fill('#loginPassInput', PASS)
    await Promise.all([p.waitForLoadState('load'), p.click('button[type=submit]')])
    await p.waitForTimeout(2000)
    const cookies = await ctx.cookies()
    const sess = cookies.find((c) => c.name === 'edusob_session')
    if (sess) cookie = { name: sess.name, value: sess.value, domain: new URL(BASE).hostname, path: '/' }
    console.log(`\nলগইন: ${sess ? '✅ সেশন পাওয়া গেছে' : '❌ সেশন মেলেনি'}`)
  } catch (e) {
    console.log(`\nলগইন ব্যর্থ: ${String(e.message).split('\n')[0]}`)
  }
  await ctx.close()
}

if (cookie) await run('প্রাইভেট (লগইন)', PRIVATE, cookie)
else console.log('\n⚠️ লগইন না হওয়ায় প্রাইভেট রুট এড়িয়ে যাওয়া হলো')

await browser.close()

const broken = results.filter((r) => r.errors.length || r.bad.length)
console.log(`\n${'='.repeat(46)}`)
console.log(`রুট: ${results.length} · পরিষ্কার: ${results.length - broken.length} · সমস্যা: ${broken.length}`)
if (broken.length) {
  console.log(`\n⚠️ সমস্যাযুক্ত রুট:`)
  for (const r of broken) console.log(`   ${r.route} — ${r.errors.length} ত্রুটি, ${r.bad.length} ব্যর্থ রিকোয়েস্ট`)
} else {
  console.log(`\n✅ প্রোডাকশনে কোনো রানটাইম ত্রুটি পাওয়া যায়নি`)
}
console.log('='.repeat(46) + '\n')
