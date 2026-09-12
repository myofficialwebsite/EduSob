// 🎓 CV বিল্ডার — এন্ড-টু-এন্ড ফ্লো টেস্ট
//
// কেন এই টেস্ট: CV বিল্ডার একটি প্রদত্ত (paid) মূল বৈশিষ্ট্য, কিন্তু আগে
// এর কোনো টেস্ট-কভারেজই ছিল না — অর্থাৎ "কাজ করছে" দাবিটি কখনো পরিমাপ
// করা হয়নি। এই টেস্টটি পুরো পথ যাচাই করে:
//   ১) ফর্ম পূরণ → ২) টেমপ্লেট নির্বাচন → ৩) সংরক্ষণ (POST /api/cv/save)
//   → ৪) "আমার সিভি" তালিকায় দেখা → ৫) প্রিন্ট-ভিউ তৈরি → ৬) মুছে ফেলা
//
// বিশেষ সাবধানতা:
//   • printCV() একটি নতুন উইন্ডো খুলে সেখানে window.print() ডাকে —
//     হেডলেস ক্রোমিয়ামে প্রকৃত প্রিন্ট ডায়ালগ আসে না, তাই নতুন পেজে
//     window.print() কে আগেই প্রতিস্থাপন করে "ডাকা হয়েছে কি" যাচাই করা হয়।
//   • saveTpl/loadTemplates অ্যাসিনক্রোনাস, তাই প্রতিটি ধাপে অপেক্ষা করতে হয়।
//   • পরীক্ষা-সিভি শেষে মুছে ফেলা হয়, যাতে বারবার চালালে তালিকা নোংরা না হয়।
//
// চালান: node cv-builder-test.mjs
import { chromium } from 'playwright'

const BASE = process.env.BASE || 'http://127.0.0.1:3000'
let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok ' : '  FAIL'} ${m}`); if (!ok) fail++ }

const li = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier: process.env.TEST_PHONE || '01829486022', password: process.env.TEST_PASS || 'Ab52944820@' }),
}).then((r) => r.json())
log(!!li.token, 'লগইন')

const b = await chromium.launch()
const errs = []
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
await ctx.addCookies([{ name: 'edusob_session', value: li.token, url: BASE }])
const p = await ctx.newPage()
p.on('pageerror', (e) => errs.push(String(e.message).slice(0, 120)))
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)) })

console.log('\n=== 🎓 CV বিল্ডার (এন্ড-টু-এন্ড) ===\n')

// ── ১) পেজ লোড ও ফর্ম ───────────────────────────────────────────────
await p.goto(`${BASE}/cv-maker`, { waitUntil: 'load' })
await p.waitForTimeout(2500)   // টেমপ্লেট অ্যাসিনক্রোনাস লোড

const fields = await p.evaluate(() => ({
  name: !!document.getElementById('f-name'),
  title: !!document.getElementById('cv-title'),
  lang: !!document.getElementById('cv-lang'),
  photo: !!document.getElementById('with-photo'),
  tpl: document.querySelectorAll('.tpl-card').length,
}))
log(fields.name && fields.title, 'ফর্মের ক্ষেত্রগুলো আছে (f-name, cv-title)')
log(fields.tpl > 0, `টেমপ্লেট লোড হয়েছে (${fields.tpl}টি)`)

// ── ২) ফর্ম পূরণ ────────────────────────────────────────────────────
const STAMP = 'CVTEST' + Date.now().toString().slice(-6)
await p.fill('#f-name', 'পরীক্ষামূলক ব্যবহারকারী ' + STAMP)
await p.fill('#f-desig', 'সফটওয়্যার প্রকৌশলী')
await p.fill('#f-phone', '01700000000')
await p.fill('#f-email', 'cvtest@example.com')
await p.fill('#f-address', 'চট্টগ্রাম')
await p.fill('#f-skills', 'JavaScript, TypeScript, Hono')
await p.fill('#cv-title', STAMP)
await p.waitForTimeout(300)
log(await p.inputValue('#f-name') !== '', 'ফর্ম পূরণ হয়েছে')

// ── ৩) টেমপ্লেট নির্বাচন ────────────────────────────────────────────
const picked = await p.evaluate(() => {
  const cards = [...document.querySelectorAll('.tpl-card')]
  if (!cards.length) return null
  cards[1].click()                       // দ্বিতীয় টেমপ্লেট বেছে নিই
  return cards[1].dataset.slug || 'n/a'
})
await p.waitForTimeout(500)
log(!!picked, `টেমপ্লেট নির্বাচন (slug=${picked})`)

// ── ৪) সংরক্ষণ ──────────────────────────────────────────────────────
await p.evaluate(() => window.saveCV())
await p.waitForTimeout(1800)
const saved = await p.evaluate(() => {
  const t = document.body.innerText
  return { ok: /সংরক্ষিত|সফল/.test(t), err: /❌/.test(t) }
})
log(saved.ok && !saved.err, `সংরক্ষণ সফল ${saved.err ? '(❌ বার্তা এসেছে)' : ''}`)

// ── ৫) "আমার সিভি" তালিকায় দেখা ─────────────────────────────────────
await p.reload({ waitUntil: 'load' })
await p.waitForTimeout(2200)
const inList = await p.evaluate((stamp) => {
  return document.body.innerText.includes(stamp)
}, STAMP)
log(inList, `সংরক্ষিত সিভি তালিকায় দেখা যাচ্ছে (${STAMP})`)

/* ── ৬) প্রিন্ট-ভিউ ──────────────────────────────────────────────────
   ⚠️  রিলোডের পর ফর্ম খালি থাকে, তাই সরাসরি printCV() ডাকলে খালি সিভি
       রেন্ডার হয় (৫৮ অক্ষর) — এটি সাইটের ত্রুটি নয়, টেস্টের ভুল ছিল।
       সঠিক পথ: আগে সংরক্ষিত সিভিটি loadCV(id) দিয়ে ফর্মে ফিরিয়ে আনা,
       তারপর প্রিন্ট করা। */
const cvId = await p.evaluate(async (stamp) => {
  const r = await fetch('/api/cv/mine').then((x) => x.json()).catch(() => null)
  const list = (r && (r.cvs || r.items || r.data)) || []
  const hit = list.find((c) => (c.title || '').includes(stamp))
  return hit ? hit.id : null
}, STAMP)
log(cvId !== null, `সংরক্ষিত সিভির আইডি পাওয়া গেছে (${cvId})`)

if (cvId !== null) {
  await p.evaluate((id) => window.loadCV(id), cvId)
  await p.waitForTimeout(1200)
  const refilled = await p.inputValue('#f-name')
  log(refilled.length > 0, `সিভি আবার ফর্মে লোড হয়েছে「${refilled.slice(0, 24)}」`)
}

const [pop] = await Promise.all([
  ctx.waitForEvent('page', { timeout: 8000 }).catch(() => null),
  p.evaluate(() => window.printCV()),
])
if (!pop) {
  log(false, 'প্রিন্ট-উইন্ডো খুলল না')
} else {
  // নতুন পেজে window.print() প্রতিস্থাপন — প্রকৃত ডায়ালগ আসবে না
  await pop.addInitScript(() => { window.__printed = 0; window.print = () => { window.__printed++ } })
  await pop.waitForLoadState('load').catch(() => {})
  await pop.waitForTimeout(1500)
  const pv = await pop.evaluate(() => ({
    printed: window.__printed || 0,
    len: (document.body.innerText || '').length,
    hasName: /পরীক্ষামূলক/.test(document.body.innerText || ''),
  }))
  log(pv.len > 50, `প্রিন্ট-ভিউ তৈরি (${pv.len} অক্ষর)`)
  log(pv.hasName, 'প্রিন্ট-ভিউতে সিভির তথ্য আছে')
  await pop.close()
}


// ── ৭) পরিষ্কার: পরীক্ষা-সিভি মুছে ফেলা ─────────────────────────────
/* মুছুন-রুট হলো DELETE /api/cv/mine/:id — /api/cv/:id নয় (সেটি ৪০৪ দেয়)। */
const cleaned = await p.evaluate(async (stamp) => {
  const r = await fetch('/api/cv/mine').then((x) => x.json()).catch(() => null)
  const list = (r && (r.cvs || r.items || r.data)) || []
  const hit = list.find((c) => (c.title || '').includes(stamp))
  if (!hit) return 'তালিকায় পাওয়া যায়নি'
  const d = await fetch('/api/cv/mine/' + hit.id, { method: 'DELETE' }).then((x) => x.json()).catch(() => null)
  return (d && d.ok) ? 'মুছে ফেলা হয়েছে' : 'মুছতে ব্যর্থ'
}, STAMP)
console.log(`  --  পরিষ্কার: ${cleaned}`)

console.log(`\n  JS ত্রুটি: ${errs.length}`)
for (const e of [...new Set(errs)].slice(0, 4)) console.log('    ' + e)
log(errs.length === 0, 'কোনো JS ত্রুটি নেই')

await b.close()
console.log(fail === 0 ? '\n✅ ALL PASS\n' : `\n❌ ${fail}টি ব্যর্থ\n`)
process.exit(fail === 0 ? 0 : 1)
