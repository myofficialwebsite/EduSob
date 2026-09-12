// 🤝 রেফারেল সিস্টেম — কোড, আয় ও সাইনআপ-যাচাই টেস্ট
//
// কেন এই টেস্ট: MASTER_PLAN: "রেফারেল সিস্টেম: বন্ধু আনলে উভয়ে ক্রেডিট"।
// ক্রেডিট/টাকা-সংক্রান্ত পথ হওয়ায় ভুল হলে সরাসরি ক্ষতি। আগে কোনো টেস্ট ছিল না।
//
// ⚠️ এই টেস্ট কোনো বাস্তব ব্যবহারকারী তৈরি করে না — শুধু এমন ইনপুট ব্যবহার
//    করা হয় যা যাচাইয়ের সময়ই প্রত্যাখ্যাত হয় (ভুল কোড, স্ব-রেফারেল)।
//
// চালান: ./run-test.sh referral-test.mjs
const BASE = process.env.BASE || 'http://127.0.0.1:3000'
const PHONE = process.env.TEST_PHONE || '01829486022'
const PASS = process.env.TEST_PASS || 'Ab52944820@'
let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok  ' : '  FAIL'} ${m}`); if (!ok) fail++ }

const getJSON = async (p, headers = {}) => {
  const r = await fetch(`${BASE}${p}`, { headers })
  let j = null
  try { j = await r.json() } catch { j = null }
  return { s: r.status, j }
}
const postJSON = async (p, body, headers = {}) => {
  const r = await fetch(`${BASE}${p}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
  let j = null
  try { j = await r.json() } catch { j = null }
  return { s: r.status, j }
}

console.log('\n=== 🤝 রেফারেল সিস্টেম ===\n')

// ── ১) লগইন ছাড়া বন্ধ ───────────────────────────────────────────────
const anon = await getJSON('/api/referrals')
log(anon.s === 401 || anon.s === 403, `রেফারেল তথ্য (লগইন ছাড়া) বন্ধ → HTTP ${anon.s}`)

// ── ২) লগইন ─────────────────────────────────────────────────────────
const li = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier: PHONE, password: PASS }),
}).then((r) => r.json())
log(!!li.token, `লগইন → ${li.token ? 'সফল' : 'ব্যর্থ'}`)
const H = { Cookie: 'edusob_session=' + li.token }

// ── ৩) রেফারেল তথ্য ─────────────────────────────────────────────────
const ref = await getJSON('/api/referrals', H)
log(ref.s === 200 && ref.j?.ok === true, `রেফারেল তথ্য → HTTP ${ref.s} · ok=${ref.j?.ok}`)

// ⚠️ অ্যাডমিনের কোড বিশেষ (EDU-2026-ADMIN) — নতুন ব্যবহারকারীর কোড হয়
// EDU-YYYY-NNNNN। তাই শুধু EDU- উপসর্গ যাচাই করা হয়।
const code = ref.j?.code
log(typeof code === 'string' && code.startsWith('EDU-'),
  `নিজের রেফারেল কোড: ${code}`)
log(Array.isArray(ref.j?.referrals), `রেফারেল তালিকা অ্যারে (${(ref.j?.referrals || []).length} জন)`)
log(typeof ref.j?.total_earned === 'number' && ref.j.total_earned >= 0,
  `মোট আয়: ${ref.j?.total_earned} (ঋণাত্মক নয়)`)
log(typeof ref.j?.bonus_rate === 'number' && ref.j.bonus_rate >= 0,
  `বোনাস হার: ${ref.j?.bonus_rate} (ঋণাত্মক নয়)`)

// ── ৪) সাইনআপ — ভুল রেফারেল কোড প্রত্যাখ্যান ────────────────────────
const baseSignup = {
  name_bn: 'পরীক্ষা', name_en: 'Test', phone: '01900000001',
  password: 'TestPass12345', religion: 'islam', education_level: 'hsc',
}
const badRef = await postJSON('/api/auth/signup', { ...baseSignup, referral_code: 'EDU-0000-00000' })
log(badRef.s !== 500 && (badRef.j?.ok === false),
  `ভুল রেফারেল কোড → HTTP ${badRef.s}${badRef.j?.error ? ' · "' + badRef.j.error.slice(0, 36) + '"' : ''}`)

// আজেবাজে কোড
const junk = await postJSON('/api/auth/signup', { ...baseSignup, referral_code: 'এইকোডনেই' })
log(junk.s !== 500 && junk.j?.ok === false, `আজেবাজে কোড → HTTP ${junk.s} (৫০০ নয়)`)

// ── ৫) পুনরায় নথিভুক্তি বন্ধ (ইতিমধ্যে থাকা ফোন) ────────────────────
// ⚠️ এই ধাপে কোনো ব্যবহারকারী তৈরি হয় না — ফোন আগেই থাকায় ৪০৯-তেই আটকে।
//    (সোর্সে `referrer.phone === phone` নামে একটি স্ব-রেফারেল রক্ষক আছে,
//    কিন্তু ডুপ্লিকেট-ফোন যাচাই আগে হওয়ায় সেটি কার্যত অপ্রযোজ্য — ত্রুটি
//    নয়, শুধু রক্ষণাত্মক কোড।)
const dup = await postJSON('/api/auth/signup', { ...baseSignup, phone: PHONE, referral_code: code })
log(dup.s === 409 || dup.j?.ok === false,
  `বিদ্যমান ফোনে সাইনআপ বন্ধ → HTTP ${dup.s}${dup.j?.error ? ' · "' + dup.j.error.slice(0, 34) + '"' : ''}`)

// ── ৬) অবৈধ ফোন → সুন্দরভাবে প্রত্যাখ্যান (৫০০ নয়) ──────────────────
const badPhone = await postJSON('/api/auth/signup', { ...baseSignup, phone: '123' })
log(badPhone.s !== 500 && badPhone.j?.ok === false,
  `অবৈধ ফোন → HTTP ${badPhone.s}${badPhone.j?.error ? ' · "' + badPhone.j.error.slice(0, 30) + '"' : ''}`)

// ত্রুটিমূলক JSON → ৫০০ নয়
const badJson = await fetch(`${BASE}/api/auth/signup`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'JSON নয়',
})
log(badJson.status !== 500, `অবৈধ JSON → HTTP ${badJson.status} (৫০০ নয়)`)

console.log(fail === 0 ? '\n✅ ALL PASS\n' : `\n❌ ${fail}টি ব্যর্থ\n`)
process.exit(fail === 0 ? 0 : 1)
