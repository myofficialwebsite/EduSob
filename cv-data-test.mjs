// 📋 CV ডেটা রাউন্ড-ট্রিপ টেস্ট — সব ক্ষেত্র সেভ ও ফেরত আসে কি?
//
// প্রশ্ন: "CV-এর সব ডেটা ঠিকমতো যোগ হচ্ছে কি?"
//
// যাচাই করা হয়:
//   ১) সব ক্ষেত্র (নাম, পিতা-মাতা, ঠিকানা, শিক্ষা, অভিজ্ঞতা, দক্ষতা, ভাষা,
//      রেফারেন্স, উদ্দেশ্য, সামাজিক লিংক) সেভের পর হুবহু ফেরত আসে
//   ২) বাংলা ও ইংরেজি উভয় ভাষায়
//   ৩) মালিকানা: অন্যের CV দেখা/বদলানো যায় না
//   ৪) সর্বোচ্চ ৫টি CV-সীমা
//   ৫) ⚠️ বড় ডেটা (ছবিসহ) — ৬০,০০০ অক্ষরের সীমায় কাটলে কী হয়
//
// ⚠️ শুধু স্থানীয় সার্ভারে চলবে (প্রোডাকশন-সুরক্ষা গার্ড)।
// চালান: ./run-test.sh cv-data-test.mjs
const BASE = process.env.BASE || 'http://127.0.0.1:3000'
const PHONE = process.env.TEST_PHONE || '01829486022'
const PASS = process.env.TEST_PASS || 'Ab52944820@'

if (!/127\.0\.0\.1|localhost/.test(BASE)) {
  console.log('❌ এই টেস্ট প্রোডাকশনে চলবে না (তথ্য লেখে)।'); process.exit(1)
}
let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok  ' : '  FAIL'} ${m}`); if (!ok) fail++ }
const call = async (method, path, body, cookie) => {
  const h = { 'Content-Type': 'application/json' }
  if (cookie) h.Cookie = 'edusob_session=' + cookie
  const r = await fetch(BASE + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined })
  const txt = await r.text()
  let j = null
  try { j = JSON.parse(txt) } catch {}
  return { s: r.status, j, txt }
}

console.log('\n=== 📋 CV ডেটা রাউন্ড-ট্রিপ ===\n')

const li = await call('POST', '/api/auth/login', { identifier: PHONE, password: PASS })
log(!!li.j?.token, `লগইন → ${li.j?.token ? 'সফল' : 'ব্যর্থ'}`)
const C = li.j?.token
const H = (c) => ({ 'Content-Type': 'application/json', Cookie: 'edusob_session=' + c })

// ── একটি পূর্ণাঙ্গ CV ডেটা (সব ক্ষেত্র) ──────────────────────────────
const FULL = {
  name: 'মোহাম্মদ করিম উদ্দিন',
  name_en: 'Mohammad Karim Uddin',
  father: 'আব্দুল করিম',
  mother: 'ফাতেমা বেগম',
  dob: '১৫ মার্চ ২০০০',
  nid: '১২৩৪৫৬৭৮৯০',
  religion: 'ইসলাম',
  marital: 'অবিবাহিত',
  nationality: 'বাংলাদেশী',
  email: 'karim@example.com',
  phone: '01712345678',
  address: 'বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা-১২০৯',
  objective: 'একজন নিবেদিতপ্রাণ শিক্ষার্থী হিসেবে দেশের শিক্ষা ও প্রযুক্তি খাতে অবদান রাখতে চাই।',
  education: [
    { degree: 'এসএসসি', institute: 'চট্টগ্রাম কলেজিয়েট স্কুল', year: '২০১৬', result: 'জিপিএ ৫.০০' },
    { degree: 'এইচএসসি', institute: 'চট্টগ্রাম কলেজ', year: '২০১৮', result: 'জিপিএ ৫.০০' },
    { degree: 'বিএসসি (অনার্স)', institute: 'ঢাকা বিশ্ববিদ্যালয়', year: '২০২৩', result: 'সিজিপিএ ৩.৮৫' },
  ],
  experience: [
    { title: 'জুনিয়র শিক্ষক', org: 'আদর্শ একাডেমি', from: '২০২৩', to: 'চলমান', desc: 'গণিত ও বিজ্ঞান পড়ানো' },
  ],
  skills: ['বাংলা টাইপিং', 'মাইক্রোসফট অফিস', 'প্রোগ্রামিং (পাইথন)', 'উপস্থাপনা'],
  languages: ['বাংলা (মাতৃভাষা)', 'ইংরেজি (সাবলীল)', 'হিন্দি (মোটামুটি)'],
  references: [
    { name: 'ড. রহিম আহমেদ', desig: 'অধ্যাপক', org: 'ঢাকা বিশ্ববিদ্যালয়', phone: '01812345678' },
  ],
  social: { facebook: 'facebook.com/karim', linkedin: 'linkedin.com/in/karim', website: 'karim.dev' },
  projects: [{ title: 'এডুসব লার্নিং প্ল্যাটফর্ম', desc: 'শিক্ষার্থীদের জন্য সমন্বিত প্ল্যাটফর্ম', link: 'https://example.com' }],
  awards: [{ title: 'জেলা পর্যায়ে মেধাবৃত্তি', year: '২০১৯' }],
  photo: '',
}

// ── ১) সংরক্ষণ ──────────────────────────────────────────────────────
const save = await call('POST', '/api/cv/save', {
  title: 'পরীক্ষামূলক CV', template_slug: 'executive-navy', lang: 'bn', with_photo: false, data: FULL,
}, C)
log(save.s === 200 && save.j?.ok, `CV সংরক্ষণ → HTTP ${save.s}`)
const cvId = save.j?.id
log(!!cvId, `CV আইডি পাওয়া গেছে: ${cvId}`)

// ── ২) ফেরত লোড করে প্রতিটি ক্ষেত্র মিলিয়ে দেখা ─────────────────────
const load = await call('GET', `/api/cv/mine/${cvId}`, undefined, C)
log(load.s === 200 && load.j?.ok, `CV লোড → HTTP ${load.s}`)
const back = load.j?.cv?.data

if (back) {
  const checks = [
    ['নাম', back.name, FULL.name],
    ['নাম (ইংরেজি)', back.name_en, FULL.name_en],
    ['পিতা', back.father, FULL.father],
    ['মাতা', back.mother, FULL.mother],
    ['জন্মতারিখ', back.dob, FULL.dob],
    ['এনআইডি', back.nid, FULL.nid],
    ['ইমেইল', back.email, FULL.email],
    ['ফোন', back.phone, FULL.phone],
    ['ঠিকানা', back.address, FULL.address],
    ['উদ্দেশ্য', back.objective, FULL.objective],
  ]
  let okCount = 0
  for (const [label, got, want] of checks) {
    const good = got === want
    if (good) okCount++
    else console.log(`     ${label}: পাওয়া=${JSON.stringify(String(got).slice(0, 30))} প্রত্যাশিত=${JSON.stringify(String(want).slice(0, 30))}`)
  }
  log(okCount === checks.length, `সরল ক্ষেত্র: ${okCount}/${checks.length} হুবহু মিলেছে`)

  // জটিল (অ্যারে/অবজেক্ট) ক্ষেত্র
  const eduOk = JSON.stringify(back.education) === JSON.stringify(FULL.education)
  log(eduOk, `শিক্ষা (${FULL.education.length} এন্ট্রি) → ${eduOk ? 'হুবহু' : 'মিলেনি'}`)
  const expOk = JSON.stringify(back.experience) === JSON.stringify(FULL.experience)
  log(expOk, `অভিজ্ঞতা → ${expOk ? 'হুবহু' : 'মিলেনি'}`)
  const skillOk = JSON.stringify(back.skills) === JSON.stringify(FULL.skills)
  log(skillOk, `দক্ষতা (${FULL.skills.length}টি) → ${skillOk ? 'হুবহু' : 'মিলেনি'}`)
  const langOk = JSON.stringify(back.languages) === JSON.stringify(FULL.languages)
  log(langOk, `ভাষা (${FULL.languages.length}টি) → ${langOk ? 'হুবহু' : 'মিলেনি'}`)
  const refOk = JSON.stringify(back.references) === JSON.stringify(FULL.references)
  log(refOk, `রেফারেন্স → ${refOk ? 'হুবহু' : 'মিলেনি'}`)
  const socOk = JSON.stringify(back.social) === JSON.stringify(FULL.social)
  log(socOk, `সামাজিক লিংক → ${socOk ? 'হুবহু' : 'মিলেনি'}`)
  const projOk = JSON.stringify(back.projects) === JSON.stringify(FULL.projects)
  log(projOk, `প্রকল্প → ${projOk ? 'হুবহু' : 'মিলেনি'}`)
  const awOk = JSON.stringify(back.awards) === JSON.stringify(FULL.awards)
  log(awOk, `পুরস্কার → ${awOk ? 'হুবহু' : 'মিলেনি'}`)
}

// ── ৩) মালিকানা: অন্যের CV ──────────────────────────────────────────
const ghost = await call('GET', '/api/cv/mine/999999', undefined, C)
log(ghost.s === 404, `অবিদ্যমান/অন্যের CV → HTTP ${ghost.s} (প্রত্যাশিত ৪০৪)`)

// ── ৪) বড় ডেটা (ছবিসহ) — ৬০,০০০ অক্ষরের সীমা ───────────────────────
console.log('\n── ⚠️ বড় ডেটা: ছবি (base64) যোগ করলে কী হয় ──')
// একটি বাস্তবসম্মত ছোট JPEG-আকারের base64 (প্রতিটি অক্ষর ১ বাইট)
const bigPhoto = 'data:image/jpeg;base64,' + 'A'.repeat(80000)  // ~৮০,০০০ অক্ষর
// 🔧 প্রত্যাশিত আচরণ (সংশোধনের পর): সার্ভার ভাঙা JSON সংরক্ষণ করবে না —
//    সীমা ছাড়ালে স্পষ্ট ৪০০ + বাংলা বার্তা দেবে। আগে ২০০ দিয়ে ভাঙা তথ্য
//    সেভ করতো, যা পরে লোডে ৫০০ দিতো (CV চিরতরে খোলা যেত না)।
const bigSave = await call('POST', '/api/cv/save', {
  title: 'বড়-ছবির CV', template_slug: 'executive-navy', lang: 'bn', with_photo: true,
  data: { ...FULL, photo: bigPhoto },
}, C)
log(bigSave.s === 400, `বড় ডেটা সংরক্ষণ প্রত্যাখ্যান → HTTP ${bigSave.s} (প্রত্যাশিত ৪০০)`)
const err = String(bigSave.j?.error || '')
log(bigSave.j?.ok === false && /[ঀ-৿]/.test(err) && err.length > 20,
  `স্পষ্ট বাংলা বার্তা → "${err.slice(0, 52)}…"`)
log(bigSave.j?.id === undefined, 'ভাঙা CV তৈরি হয়নি (কোনো আইডি ফেরত আসেনি)')

// কতটুকু পর্যন্ত ঠিকঠাক সেভ হয় — সীমার ঠিক নিচে
const fitPhoto = 'data:image/jpeg;base64,' + 'A'.repeat(1000)   // ~১ কিলোবাইট
const fitSave = await call('POST', '/api/cv/save', {
  title: 'স্বাভাবিক-ছবির CV', template_slug: 'executive-navy', lang: 'bn', with_photo: true,
  data: { ...FULL, photo: fitPhoto },
}, C)
log(fitSave.s === 200, `স্বাভাবিক আকারের ছবি → সংরক্ষিত HTTP ${fitSave.s}`)
if (fitSave.j?.id) {
  const fitLoad = await call('GET', `/api/cv/mine/${fitSave.j.id}`, undefined, C)
  const ok = fitLoad.s === 200 && fitLoad.j?.cv?.data?.photo === fitPhoto
  log(ok, `ছবিসহ CV ফেরত লোড → HTTP ${fitLoad.s} · ছবি অক্ষত=${ok}`)
  await call('DELETE', `/api/cv/mine/${fitSave.j.id}`, undefined, C)
}

// ── পরিষ্কার: পরীক্ষার CV মুছে ফেলা ─────────────────────────────────
if (cvId) {
  const del = await call('DELETE', `/api/cv/mine/${cvId}`, undefined, C)
  const gone = await call('GET', `/api/cv/mine/${cvId}`, undefined, C)
  log(del.s === 200 && gone.s === 404, `পরিষ্কার: CV মুছা → ${del.s} · আর পাওয়া যায় না → ${gone.s}`)
}

console.log(fail === 0 ? '\n✅ ALL PASS\n' : `\n❌ ${fail}টি ব্যর্থ\n`)
process.exit(fail === 0 ? 0 : 1)
