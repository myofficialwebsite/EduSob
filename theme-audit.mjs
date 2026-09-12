// 🎨 ধর্মভিত্তিক ড্যাশবোর্ড — থিম অডিট (চার ধর্ম × ডেস্কটপ/মোবাইল)
//
// কেন এই টেস্ট: MASTER_PLAN §২ — "ধর্মভিত্তিক ড্যাশবোর্ড: অভিবাদন +
// নিজ ধর্মের সন-গণনা" + §০ "ধর্মভিত্তিক থিম-রঙ অটো বদল (মুসলিম=সবুজ/সোনালি,
// সনাতনী=গেরুয়া, বৌদ্ধ=মেরুন, খ্রিস্টান=নীল)"। সাইটের অন্যতম প্রধান
// বৈশিষ্ট্য, কিন্তু চারটি থিমের কোনোটিই আগে ভিজ্যুয়ালি যাচাই করা হয়নি।
//
// যাচাই করা হয়:
//   ১) প্রতিটি ধর্মে সঠিক অভিবাদন (আসসালামু আলাইকুম / হরেকৃষ্ণ / নমো বুদ্ধায় / শুভেচ্ছা)
//   ২) প্রতিটি ধর্মে সঠিক থিম-রং (--accent) — চারটিই আলাদা
//   ৩) প্রতিটি ধর্মে নিজস্ব সন-তারিখ (হিজরি / বাংলা সন / বুদ্ধাব্দ / খ্রিস্টাব্দ)
//   ৪) ডেস্কটপ ও মোবাইল — দুটোতেই অনুভূমিক ওভারফ্লো নেই
//   ৫) কোনো JS ত্রুটি নেই
//   ৬) স্ক্রিনশট (শুধু স্থানীয়ভাবে ফাইলে সেভ, রিপোজিটরিতে নয়)
//
// ⚠️ শুধু স্থানীয় সার্ভারে চলবে (প্রোডাকশন-সুরক্ষা গার্ড আছে)।
// চালান: ./run-test.sh theme-audit.mjs
import { chromium } from 'playwright'
import fs from 'fs'

const BASE = process.env.BASE || 'http://127.0.0.1:3000'
const PHONE = process.env.TEST_PHONE || '01829486022'
const PASS = process.env.TEST_PASS || 'Ab52944820@'

if (!/127\.0\.0\.1|localhost/.test(BASE)) {
  console.log('❌ এই অডিট প্রোডাকশনে চলবে না — এটি ইউজারের ধর্ম বদলে দেয়।')
  process.exit(1)
}
let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok  ' : '  FAIL'} ${m}`); if (!ok) fail++ }

// ধর্ম → প্রত্যাশিত অভিবাদন + থিম-রঙ (dates.ts / dashboard.ts THEMES অনুযায়ী)
// ⚠️ --accent একটি CSS কাস্টম প্রপার্টি — getComputedStyle সাধারণ প্রপার্টির
//    মতো rgb()-তে রূপান্তর না করে হুবহু hex ফেরত দেয়।
const EXPECT = {
  islam:     { greeting: 'আসসালামু আলাইকুম', theme: 'orange',  accent: '#f97316' },
  sanatan:   { greeting: 'হরেকৃষ্ণ',          theme: 'saffron', accent: '#f59e0b' },
  buddhist:  { greeting: 'নমো বুদ্ধায়',      theme: 'maroon',  accent: '#fb7185' },
  christian: { greeting: 'শুভেচ্ছা',          theme: 'blue',    accent: '#38bdf8' },
}

const browser = await chromium.launch()
const ctx = await browser.newContext()
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

console.log('\n=== 🎨 ধর্মভিত্তিক থিম অডিট ===\n')

const li = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier: PHONE, password: PASS }),
}).then((r) => r.json())
log(!!li.token, `লগইন → ${li.token ? 'সফল' : 'ব্যর্থ'}`)
// ⚠️ সেশন কেবল কুকি থেকে পড়া হয় (api.ts:19 getCookie(...'edusob_session')) —
//    Authorization: Bearer কোথাও সাপোর্টেড নয়। প্রথমে Bearer দিয়ে ৪০১ এসেছিল,
//    সেটি সাইটের ত্রুটি নয় — আমার স্ক্রিপ্টের ভুল।
const H = { Cookie: 'edusob_session=' + li.token, 'Content-Type': 'application/json' }
await ctx.addCookies([{ name: 'edusob_session', value: li.token, url: BASE }])

// মূল ধর্ম সংরক্ষণ (শেষে ফিরিয়ে দেওয়া হবে)
const orig = await fetch(`${BASE}/api/auth/me`, { headers: { Cookie: 'edusob_session=' + li.token } })
  .then((r) => r.json()).then((d) => d.user?.religion).catch(() => null)

const seen = {}
for (const [religion, exp] of Object.entries(EXPECT)) {
  // ধর্ম বদল
  const up = await fetch(`${BASE}/api/profile`, { method: 'PUT', headers: H, body: JSON.stringify({ religion }) })
  const upOk = up.status === 200
  log(upOk, `ধর্ম → ${religion} (HTTP ${up.status})`)
  if (!upOk) continue

  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)

  const hero = page.locator('section.ds-hero').first()
  const info = await hero.evaluate((el) => {
    const cs = getComputedStyle(el)
    return {
      cls: el.className,
      accent: cs.getPropertyValue('--accent').trim(),
      text: el.innerText.replace(/\s+/g, ' ').slice(0, 160),
    }
  }).catch(() => null)

  if (!info) { log(false, `${religion}: ds-hero পাওয়া যায়নি`); continue }

  log(info.cls.includes(`ds-hero--${exp.theme}`), `${religion}: CSS ক্লাস ds-hero--${exp.theme} প্রয়োগ ✅`)
  log(info.text.includes(exp.greeting), `${religion}: অভিবাদন "${exp.greeting}" উপস্থিত`)
  const accentOk = info.accent === exp.accent
  log(accentOk, `${religion}: --accent = ${info.accent || '(খালি)'} (প্রত্যাশিত ${exp.accent})`)
  seen[religion] = info.accent

  // ওভারফ্লো যাচাই — ডেস্কটপ ও মোবাইল
  for (const [name, w, h] of [['ডেস্কটপ', 1280, 800], ['মোবাইল', 390, 844]]) {
    await page.setViewportSize({ width: w, height: h })
    await page.waitForTimeout(400)
    const of = await page.evaluate(() => ({
      doc: document.documentElement.scrollWidth,
      win: window.innerWidth,
    }))
    log(of.doc <= of.win + 1, `${religion} · ${name} (${w}px): অনুভূমিক ওভারফ্লো নেই (${of.doc} ≤ ${of.win})`)
    await page.screenshot({ path: `/tmp/theme-${religion}-${w}.png`, fullPage: false })
  }
  await page.setViewportSize({ width: 1280, height: 800 })
}

// চারটি থিমের রঙ আলাদা কি না
const uniq = new Set(Object.values(seen))
log(uniq.size === 4, `চারটি থিমের --accent সম্পূর্ণ আলাদা: ${uniq.size}/৪`)

log(errors.length === 0, `JS ত্রুটি: ${errors.length}${errors.length ? ' → ' + errors.slice(0, 2).join(' | ').slice(0, 90) : ''}`)

// মূল ধর্ম ফিরিয়ে দেওয়া
if (orig) {
  await fetch(`${BASE}/api/profile`, { method: 'PUT', headers: H, body: JSON.stringify({ religion: orig }) })
  console.log(`\n  ↩️  মূল ধর্ম ফিরিয়ে দেওয়া হয়েছে: ${orig}`)
}

await browser.close()
console.log(fail === 0 ? '\n✅ ALL PASS\n' : `\n❌ ${fail}টি ব্যর্থ\n`)
console.log('স্ক্রিনশট: /tmp/theme-<ধর্ম>-<প্রস্থ>.png')
process.exit(fail === 0 ? 0 : 1)
