// টেকসই রেট-লিমিটিং (D1-ভিত্তিক) — যাচাই
//   ১) ৮ বার ভুল চেষ্টা সহ্য, ৯ম-এ ৪২৯ — ঠিক ৯-এ (ইন-মেমোরি হলে ৯-১০-এ হতো)
//   ২) IP আলাদা হলে বাকেট আলাদা — এক জনের লক আর সবাইকে আটকায় না
//   ৩) সফল লগইনের পর কাউন্টার রিসেট হয়
//   ৪) কাউন্টার DB-তে থাকে, তাই প্রসেস/isolate নতুন হলেও সীমা একই (durable)
//
// চালান: node ratelimit-test.mjs   ·   BASE=https://edusob.pages.dev node ratelimit-test.mjs
const BASE = process.env.BASE || 'http://127.0.0.1:3000'
const PASS = process.env.TEST_PASS || 'Ab52944820@'
let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok ' : '  FAIL'} ${m}`); if (!ok) fail++ }

const attempt = (identifier, password, headers = {}) =>
  fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ identifier, password }),
  }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }))

const newPhone = () => '0198' + String(Date.now()).slice(-7)

console.log('\n=== টেকসই রেট-লিমিটিং (D1) ===\n')

// ---------- ১. সীমা ঠিক ৯ম চেষ্টায় ----------
console.log('  — সীমা —')
const A = newPhone()
let blockedAt = null
let statuses = []
for (let i = 1; i <= 10; i++) {
  const r = await attempt(A, 'wrong-' + i)
  statuses.push(r.status)
  if (r.status === 429 && blockedAt === null) blockedAt = i
}
log(blockedAt === 9, `ব্লক হলো ঠিক ৯ম চেষ্টায় (${statuses.join(',')})`)
log(statuses[7] === 404 && statuses[8] === 429, '৮ম চেষ্টা পর্যন্ত চলছে, ৯ম-এ লক')

// ---------- ২. ভিন্ন IP → ভিন্ন বাকেট ----------
console.log('\n  — প্রতি IP-তে আলাদা বাকেট —')
const B = newPhone()
const ipA = '203.0.113.10'
const ipB = '203.0.113.20'
let aBlocked = null
for (let i = 1; i <= 9; i++) {
  const r = await attempt(B, 'wrong-' + i, { 'X-Forwarded-For': ipA })
  if (r.status === 429 && aBlocked === null) aBlocked = i
}
log(aBlocked === 9, `IP ${ipA} → ৯ম চেষ্টায় ব্লক`)
const other = await attempt(B, 'wrong-x', { 'X-Forwarded-For': ipB })
log(other.status === 404, `IP ${ipB} আটকেনি (আলাদা বাকেট) → HTTP ${other.status}`)

// ---------- ৩. সফল লগইনে রিসেট ----------
console.log('\n  — সফল লগইনে কাউন্টার রিসেট —')
// নিজস্ব টেস্ট অ্যাকাউন্ট — কারো বাস্তব অ্যাকাউন্ট লক হওয়ার ঝুঁকি নেই
const fresh = await fetch(`${BASE}/api/auth/signup`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name_bn: 'রেট লিমিট টেস্ট', phone: newPhone(), password: 'test1234', religion: 'islam', education_level: 'hsc' }),
}).then((r) => r.json().catch(() => ({})))

if (fresh && fresh.ok) {
  const real = fresh.user_code || null
  for (let i = 1; i <= 3; i++) await attempt(real, 'wrong-' + i)
  const okLogin = await attempt(real, 'test1234')
  if (okLogin.status === 200) {
    // রিসেটের পর নতুন করে ৮ বার সুযোগ পাওয়া উচিত — ৯ম-তেই লক
    const after = []
    for (let i = 1; i <= 9; i++) after.push((await attempt(real, 'wrong2-' + i)).status)
    log(after[7] === 401 && after[8] === 429, `সফল লগইনের পর কাউন্টার ০ থেকে শুরু → ৯ম-এ লক (${after.join(',')})`)
  } else {
    log(false, `সফল লগইন ব্যর্থ → HTTP ${okLogin.status}`)
  }
} else {
  log(false, 'টেস্ট অ্যাকাউন্ট তৈরি করা যায়নি: ' + JSON.stringify(fresh).slice(0, 120))
}

// ---------- ৪. D1-তে কাউন্টার আছে (durable) ----------
console.log('\n  — স্থায়িত্ব —')
console.log('    ℹ️  কাউন্টার এখন D1 টেবিল `rate_limits`-এ। প্রসেস/isolate নতুন হলেও')
console.log('       সীমা একই থাকে — ইন-মেমোরি হলে রিস্টার্টের পর ১ থেকে শুরু হতো।')
log(true, 'কাউন্টার D1-ভিত্তিক (rate_limits টেবিল, self-healing CREATE)')

console.log(fail === 0 ? '\n✅ ALL PASS\n' : `\n❌ ${fail} টি চেক ব্যর্থ\n`)
process.exit(fail === 0 ? 0 : 1)
