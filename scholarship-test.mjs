// 🏅 স্কলারশিপ — তালিকা, ক্যাটাগরি ফিল্টার ও যোগ্যতা-মূল্যায়ন টেস্ট
//
// কেন এই টেস্ট: MASTER_PLAN-এ স্কলারশিপ একটি স্বতন্ত্র বৈশিষ্ট্য (ফেজ ২-এ
// "ধর্মভিত্তিক ড্যাশবোর্ড ... কলেজভিত্তিক ড্যাশবোর্ড" ও অটো-সংগ্রহ)।
// /evaluate রুটটি অতিথিদেরও ব্যবহার করতে দেওয়া হয় (রূপান্তর-পথ), তাই
// এটি ভাঙলে সরাসরি ব্যবহারকারীর সামনে ত্রুটি দেখা যায়। আগে কোনো টেস্ট ছিল না।
//
// ⚠️ পরীক্ষিত পথ: /list ও /evaluate — ফ্রন্টএন্ড ঠিক এই দুটিই ব্যবহার করে
//    (scholarshipsPage.ts:154 ও :326)। ট্রেইলিং-স্ল্যাশ `/api/scholarships/`
//    ৪০৪ দেয়, কিন্তু ফ্রন্টএন্ডে সেটি ব্যবহৃত নয় — তাই ত্রুটি নয়।
//
// চালান: ./run-test.sh scholarship-test.mjs
const BASE = process.env.BASE || 'http://127.0.0.1:3000'
let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok  ' : '  FAIL'} ${m}`); if (!ok) fail++ }

const getJSON = async (p) => {
  const r = await fetch(`${BASE}${p}`)
  let j = null
  try { j = await r.json() } catch { j = null }
  return { s: r.status, j }
}
const postJSON = async (p, body) => {
  const r = await fetch(`${BASE}${p}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  let j = null
  try { j = await r.json() } catch { j = null }
  return { s: r.status, j }
}

console.log('\n=== 🏅 স্কলারশিপ ===\n')

// ── ১) তালিকা (ফ্রন্টএন্ডের পথ) ─────────────────────────────────────
const list = await getJSON('/api/scholarships/list')
const items = list.j?.scholarships || list.j?.items || list.j?.data || []
log(list.s === 200 && list.j?.ok !== false, `তালিকা /list → HTTP ${list.s} · ok=${list.j?.ok ?? '(নেই)'}`)
log(items.length > 0, `মোট স্কলারশিপ: ${items.length} টি`)

const titled = items.every((s) => typeof s.title === 'string' && s.title.trim())
log(titled, 'প্রতিটিতে শিরোনাম আছে')

// ── ২) ক্যাটাগরি ফিল্টার ────────────────────────────────────────────
const cats = [...new Set(items.map((s) => s.category).filter(Boolean))]
log(cats.length > 0, `উপলব্ধ ক্যাটাগরি: ${cats.join(', ')}`)

if (cats.length) {
  const c = encodeURIComponent(cats[0])
  const r = await getJSON(`/api/scholarships/list?category=${c}`)
  const sub = r.j?.scholarships || r.j?.items || r.j?.data || []
  const pure = sub.every((s) => s.category === cats[0])
  log(r.s === 200 && sub.length > 0 && pure, `category=${cats[0]} → ${sub.length} টি, সবই মিলে`)
}

const bad = await getJSON('/api/scholarships/list?category=অজানা')
log(bad.s === 200, `অজানা ক্যাটাগরি → HTTP ${bad.s} (ক্র্যাশ নয়)`)

// ── ৩) যোগ্যতা-মূল্যায়ন (অতিথি — রূপান্তর-পথ) ──────────────────────
const ev = await postJSON('/api/scholarships/evaluate', {
  level: 'hsc', gpa: 5, family_income: 50000, quota: 'general', district: 'ঢাকা',
})
log(ev.s === 200, `evaluate (উচ্চ যোগ্যতা) → HTTP ${ev.s}`)
log(ev.j !== null, 'JSON প্রতিক্রিয়া এসেছে')
if (ev.j) {
  console.log(`        ↳ চাবি: ${Object.keys(ev.j).join(', ')}`.slice(0, 120))
}

// সীমান্ত মান: খুব কম জিপিএ
const ev2 = await postJSON('/api/scholarships/evaluate', {
  level: 'ssc', gpa: 1, family_income: 9999999, quota: 'general', district: 'ঢাকা',
})
log(ev2.s === 200, `evaluate (নিম্ন যোগ্যতা) → HTTP ${ev2.s}`)

// ফাঁকা বডি → ডিফল্ট মানে চলবে, ৫০০ নয়
const ev3 = await postJSON('/api/scholarships/evaluate', {})
log(ev3.s !== 500, `evaluate (ফাঁকা বডি) → HTTP ${ev3.s} (৫০০ নয়)`)

// অবৈধ JSON → সুন্দরভাবে ব্যর্থ
const badJson = await fetch(`${BASE}/api/scholarships/evaluate`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'এটি JSON নয়',
})
log(badJson.status !== 500, `evaluate (অবৈধ JSON) → HTTP ${badJson.status} (৫০০ নয়)`)

// ── ৪) অ্যাডমিন সুরক্ষিত ────────────────────────────────────────────
const adm = await getJSON('/api/scholarships/admin')
log(adm.s === 401 || adm.s === 403, `অ্যাডমিন তালিকা (লগইন ছাড়া) বন্ধ → HTTP ${adm.s}`)

console.log(fail === 0 ? '\n✅ ALL PASS\n' : `\n❌ ${fail}টি ব্যর্থ\n`)
process.exit(fail === 0 ? 0 : 1)
