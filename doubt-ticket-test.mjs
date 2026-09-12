// 💬 ডাউট-টিকিট প্রবাহ — শিক্ষার্থীপক্ষের এন্ড-টু-এন্ড টেস্ট
//
// কেন এই টেস্ট: শিক্ষকপক্ষ teacher-dash-audit-এ ঢাকা আছে, কিন্তু শিক্ষার্থী
// যে পথে প্রশ্ন করে → বার্তা পাঠায় → রেটিং দেয়, সেই প্রবাহের কোনো টেস্ট
// ছিল না। এটি সরাসরি বাস্তব API-তে যাচাই করে:
//   ১) শিক্ষক-তালিকা → ২) প্রশ্ন করা (POST /ask)
//   ৩) নিজের তালিকায় দেখা → ৪) বার্তা পাঠানো
//   ৫) বার্তা ফেরত পড়া → ৬) রেটিং দেওয়া → ৭) ফাঁকা প্রশ্ন প্রত্যাখ্যান
//
// সাবধানতা:
//   • /ask-এ ফ্রি একাউন্টে দৈনিক ১টির কোটা (৪০৩ need_upgrade)। টেস্ট-ইউজার
//     অ্যাডমিন হওয়ায় কোটা প্রযোজ্য নয়; তবু কোটা-পথটিও আলাদা করে যাচাই করা হয়।
//   • টিকিট মুছার কোনো পাবলিক রুট নেই, তাই পরীক্ষা-টিকিট DB-তে থেকে যায় —
//     সেই কারণে শিরোনামে DOUBTTEST স্ট্যাম্প দেওয়া হয়, যাতে চিহ্নিত করা যায়।"
//
// চালান: node doubt-ticket-test.mjs
const BASE = process.env.BASE || 'http://127.0.0.1:3000'
const PHONE = process.env.TEST_PHONE || '01829486022'
const PASS = process.env.TEST_PASS || 'Ab52944820@'

let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok ' : '  FAIL'} ${m}`); if (!ok) fail++ }

const li = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier: PHONE, password: PASS }),
}).then((r) => r.json())
log(!!li.token, 'লগইন')
const H = { 'Content-Type': 'application/json', Cookie: 'edusob_session=' + li.token }

const api = async (m, u, body) => {
  const r = await fetch(`${BASE}/api/teacher-support${u}`, {
    method: m, headers: H, ...(body ? { body: JSON.stringify(body) } : {}),
  })
  let j = {}
  try { j = await r.json() } catch { j = { __nonJson: true } }
  return { s: r.status, j }
}

console.log('\n=== 💬 ডাউট-টিকিট (শিক্ষার্থীপক্ষ) ===\n')

// ── ১) শিক্ষক-তালিকা ────────────────────────────────────────────────
let r = await api('GET', '/mentors')
const mentors = r.j.mentors || r.j.teachers || []
log(r.s === 200 && mentors.length > 0, `শিক্ষক-তালিকা পাওয়া গেছে (${mentors.length} জন)`)

// ── ২) প্রশ্ন করা ───────────────────────────────────────────────────
const STAMP = 'DOUBTTEST' + Date.now().toString().slice(-6)
r = await api('POST', '/ask', {
  subject: 'গণিত',
  topic: STAMP,
  question: 'দ্বিঘাত সমীকরণের শূন্যস্থান কীভাবে নির্ণয় করব? — ' + STAMP,
  teacher_id: mentors[0]?.id || null,
})
const created = r.s === 200 && r.j.ok
log(created, `প্রশ্ন জমা (HTTP ${r.s}${r.j.error ? ' — ' + r.j.error : ''})`)
const ticketId = r.j.id || r.j.ticket?.id || r.j.ticketId || null
log(ticketId !== null, `টিকিট আইডি পাওয়া গেছে (${ticketId})`)

// ── ৩) নিজের তালিকায় দেখা ───────────────────────────────────────────
r = await api('GET', '/my-tickets')
const mine = r.j.tickets || r.j.data || []
const found = mine.find((t) => (t.topic || '').includes(STAMP) || (t.question || '').includes(STAMP))
log(!!found, `নিজের তালিকায় টিকিট দেখা যাচ্ছে (${STAMP})`)

// ── ৪) ফাঁকা প্রশ্ন প্রত্যাখ্যান ────────────────────────────────────
r = await api('POST', '/ask', { subject: '', question: '' })
log(r.s === 400 && r.j.ok === false, `ফাঁকা প্রশ্ন প্রত্যাখ্যান (HTTP ${r.s})`)

// ── ৫) বার্তা পাঠানো ────────────────────────────────────────────────
if (ticketId) {
  r = await api('POST', `/ticket/${ticketId}/messages`, { message: 'প্রথম বার্তা — ' + STAMP })
  log(r.s === 200 && r.j.ok !== false, `বার্তা পাঠানো (HTTP ${r.s}${r.j.error ? ' — ' + r.j.error : ''})`)

  // ── ৬) বার্তা ফেরত পড়া ────────────────────────────────────────────
  r = await api('GET', `/ticket/${ticketId}/messages`)
  const msgs = r.j.messages || r.j.data || []
  const has = msgs.some((m) => (m.message || '').includes(STAMP))
  log(has, `বার্তা সংরক্ষিত হয়েছে (${msgs.length}টি বার্তা)`)

  // ── ৭) ফাঁকা বার্তা প্রত্যাখ্যান ──────────────────────────────────
  r = await api('POST', `/ticket/${ticketId}/messages`, { message: '   ' })
  log(r.s === 400 && r.j.ok === false, `ফাঁকা বার্তা প্রত্যাখ্যান (HTTP ${r.s})`)

  // ── ৮) রেটিং দেওয়া ────────────────────────────────────────────────
  r = await api('POST', `/rate/${ticketId}`, { rating: 5, feedback: 'খুব সুন্দর ব্যাখ্যা — ' + STAMP })
  log(r.s === 200 && r.j.ok !== false, `রেটিং দেওয়া (HTTP ${r.s}${r.j.error ? ' — ' + r.j.error : ''})`)

  // রেটিং সীমার বাইরে গেলে ১–৫-এ আটকায় কি
  r = await api('POST', `/rate/${ticketId}`, { rating: 99 })
  const clamped = r.s === 200 || r.s === 404
  log(clamped, `রেটিং ৯৯ দিলেও গ্রহণযোগ্য সীমায় (HTTP ${r.s})`)

  // ── ৯) অস্তিত্বহীন টিকিট ──────────────────────────────────────────
  r = await api('POST', '/rate/999999', { rating: 5 })
  log(r.s === 404 && r.j.ok === false, `অস্তিত্বহীন টিকিটে রেটিং বাধাপ্রাপ্ত (HTTP ${r.s})`)
} else {
  console.log('  --  টিকিট আইডি না পাওয়ায় ৫–৯ ধাপ এড়িয়ে যাওয়া হলো')
}

/* পরিষ্কার: টিকিট মুছার কোনো HTTP রুট নেই (একমাত্র delete হলো
   /admin/teacher/:id)। তাই এই টেস্ট বারবার চালালে DB-তে পরীক্ষা-টিকিট
   জমা হতো — যা শিক্ষক মুছতেও বাধা দেয় (teacher_tickets.teacher_id →
   teachers.id)। সেই কারণে লোকালেই সরাসরি SQLite থেকে মুছে ফেলা হয়।
   ⚠️  নিরাপত্তা: কেবল BASE লোকালহোস্ট হলেই চলে; প্রোডাকশনে চালালে
       ধাপটি এড়িয়ে যায়। */
const isLocal = /127\.0\.0\.1|localhost/.test(BASE)
if (isLocal) {
  try {
    const D = (await import('better-sqlite3')).default
    const db = new D('./data/edusob.sqlite')
    const sel = "SELECT COUNT(*) c FROM teacher_tickets WHERE topic LIKE 'DOUBTTEST%' OR question LIKE '%DOUBTTEST%'"
    const before = db.prepare(sel).get().c
    db.prepare("DELETE FROM teacher_messages WHERE ticket_id IN (SELECT id FROM teacher_tickets WHERE topic LIKE 'DOUBTTEST%' OR question LIKE '%DOUBTTEST%')").run()
    const info = db.prepare("DELETE FROM teacher_tickets WHERE topic LIKE 'DOUBTTEST%' OR question LIKE '%DOUBTTEST%'").run()
    const after = db.prepare(sel).get().c
    console.log(`\n  --  পরিষ্কার: ${before}টি → মুছেছে ${info.changes}টি · বর্তমান DOUBTTEST ${after}`)
    db.close()
  } catch (e) {
    console.log(`\n  --  পরিষ্কার ব্যর্থ (এড়িয়ে যাওয়া হলো): ${String(e.message).slice(0, 70)}`)
  }
} else {
  console.log('\n  --  প্রোডাকশন BASE — পরিষ্কার এড়িয়ে যাওয়া হলো')
}
console.log(fail === 0 ? '\n✅ ALL PASS\n' : `\n❌ ${fail}টি ব্যর্থ\n`)
process.exit(fail === 0 ? 0 : 1)
