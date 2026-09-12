// 💼 চাকরির খবর — তালিকা, ফিল্টার ও "ম্যাচ %" যুক্তি টেস্ট
//
// কেন এই টেস্ট: MASTER_PLAN-এ আছে "চাকরি নোটিফিকেশন: যোগ্যতা (শিক্ষাস্তর)
// ম্যাচ করে অটো নোটিফাই + ম্যাচ % ব্যাজ"। এই match স্কোরটি ব্যবহারকারীর
// কাছে দেখানো হয়, তাই ভুল হলে সরাসরি বিভ্রান্তি তৈরি হয়। এর আগে কোনো
// টেস্ট ছিল না।
//
// ম্যাচ-যুক্তি (src/routes/feeds.ts, LEVEL_RANK: ssc=1 hsc=2 nu=3 masters=4):
//   job.education_level === 'any'  → ৮০
//   ব্যবহারকারীর স্তর == চাকরির স্তর → ১০০
//   ব্যবহারকারীর স্তর  > চাকরির স্তর → ৮৫  (অতিরিক্ত যোগ্যতা)
//   ব্যবহারকারীর স্তর  > ০ কিন্তু কম → ৩০  (যোগ্যতা কম)
//   কোনো স্তর দেওয়া হয়নি        → ৬০  (ডিফল্ট)
//
// চালান: node jobs-test.mjs
const BASE = process.env.BASE || 'http://127.0.0.1:3000'
let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok  ' : '  FAIL'} ${m}`); if (!ok) fail++ }

const getJSON = async (p) => {
  const r = await fetch(`${BASE}${p}`)
  let j = null
  try { j = await r.json() } catch { j = null }
  return { s: r.status, j }
}

console.log('\n=== 💼 চাকরির খবর ===\n')

// ── ১) তালিকা ───────────────────────────────────────────────────────
const noLevel = await getJSON('/api/feeds/jobs')
const base = noLevel.j?.jobs || []
log(noLevel.s === 200 && noLevel.j?.ok === true, `তালিকা → HTTP ${noLevel.s} · ok=${noLevel.j?.ok}`)
log(base.length > 0, `মোট চাকরি: ${base.length} টি`)

const fieldsOk = base.every((j) => j.title && j.org !== undefined && 'match' in j)
log(fieldsOk, 'প্রতিটিতে title/org/match আছে')

// স্তর না দিলে সবার match = ৬০ বা ৮০ ('any')
const noLevelOk = base.every((j) => j.match === 60 || j.match === 80)
log(noLevelOk, `স্তর না দিলে match = ৬০/৮০ (যাচাই: ${[...new Set(base.map((j) => j.match))].join(', ')})`)

// ── ২) ম্যাচ যুক্তি — প্রতিটি স্তর দিয়ে ─────────────────────────────
const RANK = { ssc: 1, hsc: 2, nu: 3, masters: 4 }
let matchOk = true
let checked = 0
for (const lv of Object.keys(RANK)) {
  const r = await getJSON(`/api/feeds/jobs?level=${lv}`)
  const jobs = r.j?.jobs || []
  for (const j of jobs) {
    const u = RANK[lv]
    const jr = RANK[j.education_level] ?? 0
    const want = j.education_level === 'any' ? 80
      : u === jr ? 100
      : u > jr ? 85
      : u > 0 ? 30
      : 60
    checked++
    if (j.match !== want) {
      matchOk = false
      console.log(`        ↳ level=${lv} · job.edu=${j.education_level} → match ${j.match} (প্রত্যাশিত ${want})`)
    }
  }
}
log(matchOk && checked > 0, `ম্যাচ % গণনা সঠিক (${checked} বার যাচাই)`)

// ── ৩) অজানা স্তর → ডিফল্ট ৬০ (ক্র্যাশ নয়) ─────────────────────────
const unk = await getJSON('/api/feeds/jobs?level=অজানা')
const unkJobs = unk.j?.jobs || []
log(unk.s === 200 && unkJobs.length === base.length,
  `অজানা স্তর → HTTP ${unk.s} · ${unkJobs.length} টি (তালিকা অক্ষত)`)
const unkOk = unkJobs.every((j) => j.match === 60 || j.match === 80)
log(unkOk, 'অজানা স্তরে match ডিফল্ট (৬০/৮০) — কোনো NaN নেই')

// ── ৪) মান বৈধ সীমায় ────────────────────────────────────────────────
const allSane = [...base, ...unkJobs].every((j) => typeof j.match === 'number' && j.match >= 0 && j.match <= 100)
log(allSane, 'সব match ০–১০০ এর মধ্যে (NaN/ঋণাত্মক নেই)')

console.log(fail === 0 ? '\n✅ ALL PASS\n' : `\n❌ ${fail}টি ব্যর্থ\n`)
process.exit(fail === 0 ? 0 : 1)
