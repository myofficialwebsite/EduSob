// তিনটি সিকিউরিটি ফিক্স যাচাই: CSRF, লগইন রেট-লিমিট, MCQ কোটা
const BASE = process.env.BASE || 'http://127.0.0.1:3000'
let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok ' : '  FAIL'} ${m}`); if (!ok) fail++ }

// ---------- ১) CSRF: Origin যাচাই ----------
console.log('\n[CSRF — Origin check]')
const r1 = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://evil.example.com' },
  body: JSON.stringify({ identifier: '01829486022', password: 'Ab52944820@' }),
})
log(r1.status === 403, `foreign Origin blocked -> HTTP ${r1.status} ${JSON.stringify(await r1.json()).slice(0, 60)}`)

const r2 = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: BASE },
  body: JSON.stringify({ identifier: '01829486022', password: 'Ab52944820@' }),
})
const j2 = await r2.json()
log(r2.status === 200 && !!j2.token, `same Origin allowed -> HTTP ${r2.status}`)

// GET-এ কোনো বাধা নেই (bKash কলব্যাক GET)
const r3 = await fetch(`${BASE}/mcq`, { headers: { Origin: 'https://evil.example.com' } })
log(r3.status === 200, `GET unaffected by CSRF check -> HTTP ${r3.status}`)

// ---------- ২) লগইন রেট-লিমিট ----------
console.log('\n[Login rate-limit — 8 attempts / 10 min]')
const FAKE = '0199' + String(Date.now()).slice(-7)
let last = null, blockedAt = null
for (let i = 1; i <= 10; i++) {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: FAKE, password: 'wrongpass' + i }),
  })
  last = { status: r.status, body: await r.json() }
  if (r.status === 429 && blockedAt === null) blockedAt = i
}
// কাউন্টার এখন D1-ভিত্তিক (isolate-নিরপেক্ষ), তাই সীমা সব জায়গায় একই:
// ৮ বার ভুল চেষ্টা সহ্য করা হয়, ৯ম চেষ্টাতেই ৪২৯।
log(blockedAt === 9, `blocked exactly on attempt #${blockedAt} (limit 8 — durable D1 counter, was 9-10 with in-memory)`)
log(last.status === 429, `still blocked at attempt 10 -> HTTP ${last.status}: ${last.body.error}`)

// ভিন্ন আইডেন্টিফায়ারে কাজ করছে (একটার লক সব আটকায়নি)
const rOther = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier: '01829486022', password: 'wrongpass' }),
})
log(rOther.status === 401, `different identifier not over-blocked -> HTTP ${rOther.status}`)

// ---------- ৩) MCQ কোটা ----------
console.log('\n[MCQ quota — guest 40/day]')
let total = 0, quotaHit = null
for (let i = 1; i <= 8; i++) {
  const r = await fetch(`${BASE}/api/tools/mcq/quiz?level=ssc&count=10`)
  const d = await r.json()
  if (r.status === 429) { quotaHit = { at: i, body: d }; break }
  total += (d.questions || []).length
}
log(quotaHit !== null, `quota enforced (served ${total} before blocking)`)
// স্টেট-নিরপেক্ষ: আগের রানে কোটা খরচ হয়ে থাকলে served=0 হলেও used>=limit হবে
log(quotaHit && quotaHit.body.quota.used >= quotaHit.body.quota.limit,
    `blocked once cumulative usage reached the limit (used=${quotaHit && quotaHit.body.quota.used}, limit=${quotaHit && quotaHit.body.quota.limit})`)
log(total <= 40, `never served beyond the 40/day guest cap (served ${total})`)
if (quotaHit) console.log('       ->', quotaHit.body.error, JSON.stringify(quotaHit.body.quota))

// লগইনকৃত ইউজারের কোটা বেশি
const li = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier: '01829486022', password: 'Ab52944820@' }),
}).then((r) => r.json())
const rl = await fetch(`${BASE}/api/tools/mcq/quiz?level=ssc&count=20`, { headers: { Cookie: `edusob_session=${li.token}` } })
log(rl.status === 200, `logged-in user not blocked -> HTTP ${rl.status}`)

console.log(`\n${fail === 0 ? '✅ ALL PASS' : `❌ ${fail} FAILED`}`)
process.exit(fail === 0 ? 0 : 1)
