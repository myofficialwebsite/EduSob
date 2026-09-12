// 🎓 ভর্তি (Admissions) — তালিকা, ফিল্টার ও কপি-প্যানেল টেস্ট
//
// কেন এই টেস্ট: MASTER_PLAN-এ ভর্তি একটি মূল রূপান্তর-পথ ("প্রতিটি লিংকে
// ধাপে ধাপে সহায়িকা", "কপি প্যানেল"), কিন্তু এর আগে কোনো টেস্ট ছিল না।
//
// যাচাই করা হয়:
//   ১) তালিকা লোড ও গঠন (title/level, steps/required_info অ্যারে)
//   ২) level ফিল্টার শুধু মিল থাকা স্তরই দেয়
//   ৩) অজানা স্তর → ফাঁকা তালিকা (ত্রুটি নয়)
//   ৪) কপি-প্যানেল (/admissions/:id/myinfo) লগইন ছাড়া বন্ধ
//   ৫) অবৈধ আইডি → নিয়মিত ত্রুটি (৫০০ নয়)
//   ৬) ভর্তি-পেজ রেন্ডার হয়
//
// চালান: node admission-test.mjs
const BASE = process.env.BASE || 'http://127.0.0.1:3000'
let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok  ' : '  FAIL'} ${m}`); if (!ok) fail++ }

const getJSON = async (p) => {
  const r = await fetch(`${BASE}${p}`)
  let j = null
  try { j = await r.json() } catch { j = null }
  return { s: r.status, j }
}

console.log('\n=== 🎓 ভর্তি (Admissions) ===\n')

// ── ১) তালিকা ───────────────────────────────────────────────────────
const list = await getJSON('/api/admissions')
const items = list.j?.admissions || []
log(list.s === 200 && list.j?.ok === true, `তালিকা → HTTP ${list.s} · ok=${list.j?.ok}`)
log(items.length > 0, `মোট ভর্তি-তথ্য: ${items.length} টি`)

const allHaveTitle = items.every((a) => typeof a.title === 'string' && a.title.trim().length > 0)
log(allHaveTitle, 'প্রতিটিতে শিরোনাম আছে')

// steps/required_info JSON.parse হয়ে অ্যারে হতে হবে (স্ট্রিং থাকলে কপি-প্যানেল ভাঙবে)
const stepsOk = items.every((a) => Array.isArray(a.steps))
const infoOk = items.every((a) => a.required_info === undefined || Array.isArray(a.required_info))
log(stepsOk && infoOk, `steps/required_info সব অ্যারে (steps ${stepsOk ? '✅' : '❌'} · info ${infoOk ? '✅' : '❌'})`)

// ── ২) level ফিল্টার ────────────────────────────────────────────────
const levels = [...new Set(items.map((a) => a.level).filter(Boolean))]
log(levels.length > 0, `উপলব্ধ স্তর: ${levels.join(', ')}`)

for (const lv of levels.slice(0, 3)) {
  const r = await getJSON(`/api/admissions?level=${encodeURIComponent(lv)}`)
  const sub = r.j?.admissions || []
  const pure = sub.every((a) => a.level === lv)
  log(r.s === 200 && sub.length > 0 && pure,
    `level=${lv.padEnd(11)} → ${sub.length} টি, সবই "${lv}" স্তরের`)
}

// ── ৩) অজানা স্তর → ফাঁকা (ত্রুটি নয়) ───────────────────────────────
const unk = await getJSON('/api/admissions?level=এইস্তরনেই')
log(unk.s === 200 && Array.isArray(unk.j?.admissions),
  `অজানা স্তর → HTTP ${unk.s} · ${(unk.j?.admissions || []).length} টি (ক্র্যাশ নয়)`)

// ── ৪) কপি-প্যানেল সুরক্ষিত ─────────────────────────────────────────
const my = await getJSON('/api/admissions/1/myinfo')
log(my.s === 401 || my.s === 403, `কপি-প্যানেল (লগইন ছাড়া) বন্ধ → HTTP ${my.s}`)

// ── ৫) অবৈধ আইডি → ৫০০ নয় ──────────────────────────────────────────
const bad = await getJSON('/api/admissions/abc/myinfo')
log(bad.s !== 500, `অবৈধ আইডি → HTTP ${bad.s} (৫০০ নয়)`)
const missing = await getJSON('/api/admissions/999999/myinfo')
log(missing.s !== 500, `অস্তিত্বহীন আইডি → HTTP ${missing.s} (৫০০ নয়)`)

// ── ৬) পেজ রেন্ডার ──────────────────────────────────────────────────
const pg = await fetch(`${BASE}/admission`)
const html = await pg.text()
log(pg.status === 200 && html.length > 1000, `ভর্তি-পেজ → HTTP ${pg.status} · ${html.length} বাইট`)
log(/<h1[\s>]/i.test(html), 'পেজে একটি <h1> আছে')

console.log(fail === 0 ? '\n✅ ALL PASS\n' : `\n❌ ${fail}টি ব্যর্থ\n`)
process.exit(fail === 0 ? 0 : 1)
