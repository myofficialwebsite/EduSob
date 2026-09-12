// 📢 নোটিশ ও নিউজ ফিড — ক্যাটাগরি ফিল্টার টেস্ট
//
// কেন এই টেস্ট: MASTER_PLAN-এ "নিউজ পোর্টাল: দেশের শীর্ষ সংবাদ (RSS অটো) +
// শিক্ষা + চাকরি ফিল্টারসহ" এবং "নোটিস/নিউজ/জব — CRUD (অটো-ফেচ + ম্যানুয়াল
// ওভাররাইড)" আছে। ক্যাটাগরি ফিল্টারটি সরাসরি ব্যবহারকারীর সামনে থাকে,
// কিন্তু এর কোনো টেস্ট ছিল না।
//
// বৈধ ক্যাটাগরি (src/routes/feeds.ts): nu, board, dshe, ntrca, college, general
//
// চালান: node notices-test.mjs
const BASE = process.env.BASE || 'http://127.0.0.1:3000'
let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok  ' : '  FAIL'} ${m}`); if (!ok) fail++ }

const getJSON = async (p) => {
  const r = await fetch(`${BASE}${p}`)
  let j = null
  try { j = await r.json() } catch { j = null }
  return { s: r.status, j }
}

console.log('\n=== 📢 নোটিশ ও নিউজ ফিড ===\n')

// ── ১) সব নোটিশ ─────────────────────────────────────────────────────
const all = await getJSON('/api/feeds/notices')
const items = all.j?.notices || []
log(all.s === 200 && all.j?.ok === true, `তালিকা → HTTP ${all.s} · ok=${all.j?.ok}`)
log(items.length > 0, `মোট নোটিশ: ${items.length} টি`)

const fieldsOk = items.every((n) => typeof n.title === 'string' && n.title.trim().length > 0)
log(fieldsOk, 'প্রতিটিতে শিরোনাম আছে')

// ── ২) বৈধ ক্যাটাগরি ফিল্টার ────────────────────────────────────────
const VALID = ['nu', 'board', 'dshe', 'ntrca', 'college', 'general']
const present = [...new Set(items.map((n) => n.category).filter(Boolean))]
log(present.every((c) => VALID.includes(c)),
  `তথ্যের ক্যাটাগরি বৈধ তালিকার মধ্যে: ${present.join(', ') || '(কোনোটিই নয়)'}`)

for (const cat of present.slice(0, 4)) {
  const r = await getJSON(`/api/feeds/notices?cat=${cat}`)
  const sub = r.j?.notices || []
  const pure = sub.every((n) => n.category === cat)
  log(r.s === 200 && sub.length > 0 && pure,
    `cat=${cat.padEnd(8)} → ${sub.length} টি, সবই "${cat}"`)
}

// ── ৩) অবৈধ ক্যাটাগরি উপেক্ষা (সব দেখায়, ক্র্যাশ নয়) ────────────────
const bad = await getJSON('/api/feeds/notices?cat=ভুলক্যাটাগরি')
const badItems = bad.j?.notices || []
log(bad.s === 200 && badItems.length === items.length,
  `অবৈধ cat → HTTP ${bad.s} · ${badItems.length} টি (সব নোটিশ, ফিল্টার উপেক্ষা)`)

// ── ৪) SQL ইনজেকশন-সদৃশ ইনপুট ───────────────────────────────────────
const inj = await getJSON(`/api/feeds/notices?cat=${encodeURIComponent("nu' OR '1'='1")}`)
log(inj.s === 200 && Array.isArray(inj.j?.notices),
  `ইনজেকশন-সদৃশ cat → HTTP ${inj.s} · ${(inj.j?.notices || []).length} টি (ক্র্যাশ নয়)`)

// ── ৫) সীমা (LIMIT ৫০) ──────────────────────────────────────────────
log(items.length <= 50, `তালিকা ৫০-এর মধ্যে (${items.length} টি)`)

console.log(fail === 0 ? '\n✅ ALL PASS\n' : `\n❌ ${fail}টি ব্যর্থ\n`)
process.exit(fail === 0 ? 0 : 1)
