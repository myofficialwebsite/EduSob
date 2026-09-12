// 🤖 AI সহকারী — সাইট-গাইড ইনটেন্ট ও স্থিতিস্থাপকতা টেস্ট
//
// কেন এই টেস্ট: MASTER_PLAN: "AI সহকারী: পড়াশোনা + সাইট ব্যবহারের গাইড
// (কোন ফিচার কোথায়, নিয়ে যাবে)" + "AI-এর আলাদা ফ্লোটিং বাটন — সব পেজে"।
// এর আগে কোনো টেস্ট ছিল না।
//
// /api/ai/chat তিন স্তরে কাজ করে (src/routes/ai.ts):
//   ১) matchGuide() — সাইট-গাইড কীওয়ার্ড → তাৎক্ষণিক উত্তর + লিংক
//      (কোনো API-কী লাগে না — এই টেস্ট মূলত এটিই যাচাই করে)
//   ২) GEMINI_API_KEY থাকলে Gemini
//   ৩) নাহলে Workers AI
//
// ⚠️ ২ ও ৩ নম্বর স্তর বাইরের সার্ভিসে নির্ভরশীল, তাই সেগুলোর *বিষয়বস্তু*
//    যাচাই করা হয় না — শুধু যাচাই করা হয় যে ব্যর্থ হলেও সাইট সুন্দর
//    বাংলা বার্তা দেয়, কোনো ৫০০/HTML নয়।
//
// চালান: ./run-test.sh ai-guide-test.mjs
const BASE = process.env.BASE || 'http://127.0.0.1:3000'
let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok  ' : '  FAIL'} ${m}`); if (!ok) fail++ }

const chat = async (message) => {
  const r = await fetch(`${BASE}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  const ct = r.headers.get('content-type') || ''
  let j = null
  try { j = await r.json() } catch { j = null }
  return { s: r.status, j, ct }
}

console.log('\n=== 🤖 AI সহকারী (সাইট-গাইড) ===\n')

// ── ১) ফাঁকা প্রশ্ন প্রত্যাখ্যান ─────────────────────────────────────
const empty = await chat('')
log(empty.s === 400 && empty.j?.ok === false, `ফাঁকা প্রশ্ন → HTTP ${empty.s} · ok=${empty.j?.ok}`)
const blanks = await chat('    ')
log(blanks.s === 400, `শুধু স্পেস → HTTP ${blanks.s}`)

// ── ২) সাইট-গাইড ইনটেন্ট — প্রতিটিতে উত্তর ও লিংক ───────────────────
const intents = [
  ['সিজিপিএ ক্যালকুলেটর কোথায়?', 'cgpa|সিজিপিএ'],
  ['রেজাল্ট কোথায় দেখবো?', 'result|রেজাল্ট'],
  ['সিভি কীভাবে বানাবো?', 'cv|সিভি'],
  ['রেফারেল কোড কোথায় পাবো?', 'dashboard|রেফার'],
  ['লগইন করতে পারছি না', 'login|লগ'],
  ['নামাজের সময় কোথায়?', 'dashboard|নামাজ'],
  ['ছবি রিসাইজ করবো কীভাবে?', 'resize|রিসাইজ|profile|cv'],
  // ⚠️ যোগাযোগ-ইনটেন্টে কোনো লিংক নেই (ইচ্ছাকৃত — উত্তরে হোয়াটসঅ্যাপ
  //    বাটনের কথা বলা হয়), এবং উত্তর বাংলায় "হোয়াটসঅ্যাপ" — তাই
  //    ইংরেজি whatsapp দিয়ে মিলবে না।
  ['যোগাযোগ করবো কীভাবে?', 'যোগাযোগ|হোয়াটসঅ্যাপ|হোয়াটসঅ্যাপ|whatsapp|contact'],
]
let guideHits = 0
for (const [q, expect] of intents) {
  const r = await chat(q)
  const ans = r.j?.answer || ''
  const link = r.j?.link || ''
  const hit = r.s === 200 && r.j?.ok === true && ans.length > 10 && new RegExp(expect, 'i').test(ans + ' ' + link)
  if (hit) guideHits++
  log(hit, `"${q.slice(0, 26)}" → source=${r.j?.source ?? '?'} · ${ans.length} অক্ষর · link=${link || '(নেই)'}`)
}
log(guideHits >= 6, `গাইড ইনটেন্ট সাড়া দিচ্ছে: ${guideHits}/${intents.length} টি`)

// ── ৩) অজানা প্রশ্ন → সুন্দরভাবে ব্যর্থ (৫০০ নয়) ────────────────────
const unknown = await chat('আজ রাতে খাবারে কী হবে?')
log(unknown.s !== 500, `অজানা প্রশ্ন → HTTP ${unknown.s} (৫০০ নয়)`)
log(/application\/json/.test(unknown.ct), `অজানা প্রশ্ন JSON ফেরত দেয় (${unknown.ct.split(';')[0]})`)
if (unknown.j?.ok === false) {
  log(/[ঀ-৿]/.test(unknown.j.error || ''), `ব্যর্থতায় বাংলা বার্তা: "${String(unknown.j.error).slice(0, 40)}"`)
}

// ── ৪) সীমা: ৫০০ অক্ষরের বেশি কাটা যায় ──────────────────────────────
const long = await chat('ক'.repeat(2000))
log(long.s !== 500, `২০০০ অক্ষরের প্রশ্ন → HTTP ${long.s} (৫০০ নয়)`)

// ── ৫) অবৈধ JSON ───────────────────────────────────────────────────
const badJson = await fetch(`${BASE}/api/ai/chat`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'JSON নয়',
})
log(badJson.status !== 500, `অবৈধ JSON → HTTP ${badJson.status} (৫০০ নয়)`)

console.log(fail === 0 ? '\n✅ ALL PASS\n' : `\n❌ ${fail}টি ব্যর্থ\n`)
process.exit(fail === 0 ? 0 : 1)
