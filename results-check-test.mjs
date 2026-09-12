// 🎓 রেজাল্ট-চেকার — ভ্যালিডেশন ও স্থিতিস্থাপকতা টেস্ট
//
// কেন এই টেস্ট: /api/result/check একটি বহিরাগত সার্ভিস
// (api.bangladeshgov.org)-এর ওপর নির্ভরশীল প্রক্সি। বাইরের সার্ভিস
// ব্যর্থ হলে সাইট যেন ৫০০/HTML না দিয়ে সুন্দর বাংলা বার্তা দেয় — সেই
// সবচেয়ে ভঙ্গুর পথটিই আগে অপরীক্ষিত ছিল।
//
// যাচাই করা হয়:
//   ১) প্রতিটি ভ্যালিডেশন পথ (exam/year/board/roll/reg) → ৪০০ + বাংলা বার্তা
//   ২) ইনজেকশন চেষ্টা (URL-এ বিদেশী অক্ষর, অতিরিক্ত ক্যোয়ারি) → প্রত্যাখ্যান
//   ৩) বৈধ অনুরোধ → হয় সফল, নয়তো সুন্দর ব্যর্থতা (fallback) — কখনো ৫০০ নয়
//   ৪) সব আকারে JSON ফেরত যায় (HTML/টেক্সট নয়)
//
// ⚠️  ধাপ ৩-এ বাইরের সার্ভিস ডাকা হয়; স্যান্ডবক্সে নেটওয়ার্ক না থাকলে
//     সেটিকে ব্যর্থতা ধরা হয় না — বরং "সুন্দরভাবে সামলানো" যাচাই করা হয়।
//
// চালান: node results-check-test.mjs
const BASE = process.env.BASE || 'http://127.0.0.1:3000'
let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok  ' : '  FAIL'} ${m}`); if (!ok) fail++ }

const call = async (qs) => {
  const r = await fetch(`${BASE}/api/result/check?${qs}`)
  const ct = r.headers.get('content-type') || ''
  let j = null
  try { j = await r.json() } catch { j = null }
  return { s: r.status, j, ct }
}

console.log('\n=== 🎓 রেজাল্ট-চেকার ===\n')

// ── ১) ভ্যালিডেশন ───────────────────────────────────────────────────
const cases = [
  ['exam=xyz&year=2024&board=dhaka&roll=123456&reg=1234567890', 'অবৈধ পরীক্ষা'],
  ['exam=ssc&year=1999&board=dhaka&roll=123456&reg=1234567890', 'অবৈধ বছর'],
  ['exam=ssc&year=20ab&board=dhaka&roll=123456&reg=1234567890', 'বছরে অক্ষর'],
  ['exam=ssc&year=2024&board=oxford&roll=123456&reg=1234567890', 'অবৈধ বোর্ড'],
  ['exam=ssc&year=2024&board=dhaka&roll=12&reg=1234567890', 'রোল খুব ছোট'],
  ['exam=ssc&year=2024&board=dhaka&roll=12345678901&reg=1234567890', 'রোল খুব বড়'],
  ['exam=ssc&year=2024&board=dhaka&roll=123456&reg=123', 'রেজি. খুব ছোট'],
  ['', 'কোনো প্যারামিটার নেই'],
]
for (const [qs, label] of cases) {
  const r = await call(qs)
  const ok = r.s === 400 && r.j && r.j.ok === false && /[ঀ-৿]/.test(r.j.error || '')
  log(ok, `${label.padEnd(22)} → HTTP ${r.s}${r.j?.error ? ' · "' + r.j.error.slice(0, 34) + '"' : ''}`)
}

// ── ২) ইনজেকশন চেষ্টা ───────────────────────────────────────────────
const inject = [
  ['exam=ssc&year=2024&board=dhaka&roll=123456&reg=1234567890&admin=1', 'অতিরিক্ত ক্যোয়ারি'],
  ['exam=ssc%27%20OR%201%3D1&year=2024&board=dhaka&roll=123456&reg=1234567890', 'SQL-সদৃশ exam'],
  ['exam=ssc&year=2024&board=dhaka&roll=12%3Cscript%3E&reg=1234567890', 'রোলে স্ক্রিপ্ট'],
]
for (const [qs, label] of inject) {
  const r = await call(qs)
  const rejected = r.s === 400 || r.s === 404 || (r.j && r.j.ok === false)
  log(rejected, `${label.padEnd(22)} → HTTP ${r.s}${r.j?.error ? ' · "' + String(r.j.error).slice(0, 28) + '"' : ''}`)
}

// ── ৩) বৈধ অনুরোধ — সুন্দর ব্যর্থতা বা সফলতা, কখনো ৫০০ নয় ───────────
const r = await call('exam=ssc&year=2024&board=dhaka&roll=123456&reg=1234567890')
const graceful = r.j !== null && r.j.ok !== undefined && [200, 404, 502].includes(r.s)
log(graceful, `বৈধ অনুরোধ সুন্দরভাবে সামলানো → HTTP ${r.s} · ok=${r.j?.ok} · fallback=${r.j?.fallback ?? '—'}`)
if (r.j?.ok === false) {
  log(/[ঀ-৿]/.test(r.j.error || ''), `ব্যর্থতায় বাংলা বার্তা → "${String(r.j.error).slice(0, 46)}"`)
}

// ── ৪) সবসময় JSON ───────────────────────────────────────────────────
const allJson = [r, ...await Promise.all(cases.slice(0, 3).map(([q]) => call(q)))]
  .every((x) => /application\/json/.test(x.ct))
log(allJson, 'সব প্রতিক্রিয়াই JSON (HTML/টেক্সট নয়)')

console.log(fail === 0 ? '\n✅ ALL PASS\n' : `\n❌ ${fail}টি ব্যর্থ\n`)
process.exit(fail === 0 ? 0 : 1)
