// 📝 MCQ (মডেল টেস্ট) — প্রবাহ, সীমা ও নিরাপত্তা টেস্ট
//
// কেন এই টেস্ট: MCQ সোর্সে ১৮টি ফাইলজুড়ে থাকা একটি মূল (ফেজ ৩) ফিচার,
// কিন্তু এর আগে কোনো টেস্টই ছিল না। এই টেস্ট লেখার সময়ই `count` প্যারামিটারে
// একটি বাস্তব ত্রুটি পাওয়া গেছে — সেটি নিচে রিগ্রেশন-টেস্ট হিসেবে আটকানো হয়েছে।
//
// আবিষ্কৃত ত্রুটি (ঠিক করার আগে মাপা):
//   GET /api/tools/mcq/quiz?count=-1  →  ৩০টি প্রশ্ন (অতিথির সীমা ১০!)
//   কারণ: count সরাসরি SQL-এর LIMIT-এ বাঁধা হয় এবং SQLite-তে `LIMIT -1`
//   মানে "কোনো সীমা নেই" — ফলে পুরো প্রশ্নব্যাংক একবারেই বেরিয়ে আসতো।
//   এছাড়া কোটায় `used + (-1)` যোগ হওয়ায় দৈনিক সীমা উল্টো কমে যেতো,
//   অর্থাৎ সীমা কখনো শেষই হতো না।
//
// চালান: node mcq-test.mjs
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
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  let j = null
  try { j = await r.json() } catch { j = null }
  return { s: r.status, j }
}

console.log('\n=== 📝 MCQ (মডেল টেস্ট) ===\n')

// ── ১) বিষয়-তালিকা ──────────────────────────────────────────────────
const sub = await getJSON('/api/tools/mcq/subjects')
const list = sub.j?.subjects || []
log(sub.s === 200 && list.length > 0, `বিষয়-তালিকা → HTTP ${sub.s} · ${list.length} টি বিষয়`)
const first = list[0]
log(!!first?.subject && Number(first?.cnt) > 0,
  `প্রথম বিষয়ে প্রশ্ন আছে → ${first?.level}/${first?.subject} = ${first?.cnt} টি`)

// ── ২) পরীক্ষা শুরু — স্বাভাবিক ──────────────────────────────────────
const q = await getJSON('/api/tools/mcq/quiz?count=5')
const qs = q.j?.questions || []
log(q.s === 200 && qs.length === 5, `count=5 → ${qs.length} টি প্রশ্ন (প্রত্যাশিত ৫)`)

// নিরাপত্তা যাচাই: সঠিক উত্তর কখনো আগেই পাঠানো যাবে না
const leaked = qs.some(x => 'correct' in x)
log(!leaked, 'প্রশ্নের সাথে সঠিক উত্তর ফাঁস হয়নি (`correct` ক্ষেত্র নেই)')

// ── ৩) রিগ্রেশন: ঋণাত্মক count (আগে ৩০টি আসতো) ──────────────────────
for (const [val, label] of [['-1', 'count=-1'], ['-100', 'count=-100'], ['0', 'count=0']]) {
  const r = await getJSON(`/api/tools/mcq/quiz?count=${val}`)
  const n = (r.j?.questions || []).length
  log(r.s === 200 && n >= 1 && n <= 10,
    `${label.padEnd(11)} → ${n} টি (অতিথির সীমার মধ্যে, আগে ৩০ আসতো)`)
}

// ── ৪) অতিরিক্ত count → সীমায় আটকানো ────────────────────────────────
const big = await getJSON('/api/tools/mcq/quiz?count=999')
const bn = (big.j?.questions || []).length
log(big.s === 200 && bn <= 10, `count=999 → ${bn} টি (সর্বোচ্চ ১০-এ আটকানো)`)

// ── ৫) উত্তর জমা ────────────────────────────────────────────────────
const one = await getJSON('/api/tools/mcq/quiz?count=3')
const oqs = one.j?.questions || []
const answers = oqs.map((x, i) => ({ id: x.id, answer: i === 0 ? 'a' : 'b' }))
const res = await postJSON('/api/tools/mcq/submit', { answers })
log(res.s === 200 && res.j?.ok === true, `উত্তর জমা → HTTP ${res.s} · ok=${res.j?.ok}`)
log(typeof res.j?.pct === 'number' && res.j?.total === oqs.length,
  `স্কোর গণনা → ${res.j?.correct}/${res.j?.total} সঠিক · ${res.j?.pct}%`)

// প্রতিটি উত্তরের ফলাফলে ব্যাখ্যা/সঠিক উত্তর থাকতে হবে
const hasCorrect = (res.j?.results || []).every(r => 'correct' in r && 'isCorrect' in r)
log(hasCorrect, 'ফলাফলে সঠিক উত্তর ও সঠিক/ভুয়া চিহ্ন আছে')

// ── ৬) অবৈধ জমা প্রত্যাখ্যান ────────────────────────────────────────
const empty = await postJSON('/api/tools/mcq/submit', { answers: [] })
log(empty.s === 400 || empty.j?.ok === false, `ফাঁকা উত্তর প্রত্যাখ্যান → HTTP ${empty.s}`)
const bad = await postJSON('/api/tools/mcq/submit', { answers: [{ id: 'abc', answer: 'x' }] })
log(bad.s === 400 || bad.j?.ok === false, `অবৈধ আইডি প্রত্যাখ্যান → HTTP ${bad.s}`)

// ── ৭) সুরক্ষিত রুটে বেনামী প্রবেশ বন্ধ ─────────────────────────────
const hist = await getJSON('/api/tools/mcq/history')
log(hist.s === 401 || hist.s === 403, `ইতিহাস (লগইন ছাড়া) বন্ধ → HTTP ${hist.s}`)
const wb = await getJSON('/api/tools/wrong-bank')
log(wb.s === 401 || wb.s === 403, `ভুল-ব্যাংক (লগইন ছাড়া) বন্ধ → HTTP ${wb.s}`)

console.log(fail === 0 ? '\n✅ ALL PASS\n' : `\n❌ ${fail}টি ব্যর্থ\n`)
process.exit(fail === 0 ? 0 : 1)
