// অনবোর্ডিং চেকলিস্ট + ওয়ালেট বোনাস — রিয়েল-ফ্লো টেস্ট
//   ১) নতুন ইউজার → ০/৫ ধাপ, বোনাস ০
//   ২) প্রোফাইল + সেভড রোল + MCQ শেষ → ৫/৫, পেন্ডিং ৳৭০
//   ৩) UI-তে ক্লেইম → ওয়ালেট ঠিক ৭০ বাড়ে, UI "পেয়েছেন ✓"
//   ৪) আবার ক্লেইম → ডবল-ক্রেডিট নেই (idempotent)
//   ৫) আংশিক সম্পন্ন ইউজার → কার্ড থাকে, শুধু পাওনাদার ধাপে ক্লেইম বাটন
//
// চালান:  node onboarding-test.mjs
//         BASE=https://edusob.pages.dev TEST_PHONE=019… TEST_PASS=… node onboarding-test.mjs
import { chromium } from 'playwright-core'

const BASE = process.env.BASE || 'http://127.0.0.1:3000'
const PASS = 'test1234'
let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok ' : '  FAIL'} ${m}`); if (!ok) fail++ }
const bn = (s) => String(s).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d])

function newPhone() {
  const tail = String(Date.now()).slice(-7)
  return '0197' + tail
}

async function api(path, { method = 'GET', body, cookie } = {}) {
  const r = await fetch(BASE + path, {
    method,
    headers: Object.assign(
      { 'Content-Type': 'application/json' },
      cookie ? { Cookie: `edusob_session=${cookie}` } : {},
    ),
    body: body ? JSON.stringify(body) : undefined,
  })
  const ct = r.headers.get('content-type') || ''
  return { status: r.status, data: ct.includes('application/json') ? await r.json() : await r.text() }
}

// ---------- নতুন ইউজার তৈরি ----------
async function makeUser() {
  const phone = process.env.TEST_PHONE || newPhone()
  if (!process.env.TEST_PHONE) {
    const s = await api('/api/auth/signup', {
      method: 'POST',
      body: { name_bn: 'টেস্ট শিক্ষার্থী', phone, password: PASS, religion: 'islam', education_level: 'hsc' },
    })
    if (!s.data || !s.data.ok) throw new Error('signup failed: ' + JSON.stringify(s.data))
  }
  const l = await api('/api/auth/login', { method: 'POST', body: { identifier: phone, password: process.env.TEST_PASS || PASS } })
  if (!l.data || !l.data.token) throw new Error('login failed: ' + JSON.stringify(l.data))
  return { phone, cookie: l.data.token }
}

// ---------- ধাপগুলো বাস্তবে সম্পন্ন করা ----------
const TINY_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

async function completeProfileBasics(cookie) {
  return api('/api/profile', {
    method: 'PUT',
    cookie,
    body: {
      father_bn: 'মোঃ আব্দুল করিম', mother_bn: 'মোসাম্মৎ আয়েশা', dob: '2005-01-15',
      upazila: 'সদর', district: 'চট্টগ্রাম',
    },
  })
}
async function completeEducation(cookie) {
  return api('/api/profile', {
    method: 'PUT', cookie,
    body: { ssc_board: 'চট্টগ্রাম', ssc_roll: '123456', ssc_year: '2021', ssc_gpa: '5.00' },
  })
}
async function completePhoto(cookie) {
  return api('/api/profile', {
    method: 'PUT', cookie,
    body: { photo_data: TINY_PNG, sign_data: TINY_PNG },
  })
}
async function completeSavedRoll(cookie) {
  return api('/api/saved-rolls', {
    method: 'POST', cookie,
    body: { exam_type: 'ssc', board: 'চট্টগ্রাম', roll: '123456', reg: '987654', exam_year: '2021' },
  })
}
async function completeMcq(cookie) {
  const q = await api('/api/tools/mcq/quiz?level=ssc&count=1', { cookie })
  const first = (q.data && q.data.questions && q.data.questions[0]) || null
  if (!first) return { status: 0, data: { ok: false } }
  return api('/api/tools/mcq/submit', {
    method: 'POST', cookie,
    body: { answers: [{ id: first.id, answer: 'a' }], subject: first.subject, level: 'ssc' },
  })
}

const walletBalance = async (cookie) => (await api('/api/wallet', { cookie })).data.balance
const state = async (cookie) => (await api('/api/onboarding', { cookie })).data

// ================= প্রধান ফ্লো =================
console.log('\n=== অনবোর্ডিং চেকলিস্ট + ওয়ালেট বোনাস ===\n')

const u1 = await makeUser()
console.log(`  → টেস্ট ইউজার: ${u1.phone}\n`)

// ১. ফ্রেশ স্টেট
let st = await state(u1.cookie)
log(st.ok === true, 'GET /api/onboarding সাড়া দিচ্ছে')
log((st.steps || []).length === 5, `৫টি ধাপ (পাওয়া: ${(st.steps || []).length})`)
log(st.bonus_total === 70, `মোট বোনাস ৳৭০ (পাওয়া: ${st.bonus_total})`)
log(st.done_count === 0, `নতুন ইউজারের ০টি ধাপ সম্পন্ন (পাওয়া: ${st.done_count})`)

// ২. ধাপগুলো বাস্তবে সম্পন্ন
await completeProfileBasics(u1.cookie)
st = await state(u1.cookie)
log(st.steps.find((s) => s.key === 'profile_basic').done === true, 'প্রোফাইল মূল তথ্য → ধাপ স্বয়ংক্রিয়ভাবে সম্পন্ন')

await completePhoto(u1.cookie)
st = await state(u1.cookie)
log(st.steps.find((s) => s.key === 'profile_photo').done === true, 'ছবি + স্বাক্ষর → ধাপ সম্পন্ন')

await completeEducation(u1.cookie)
st = await state(u1.cookie)
log(st.steps.find((s) => s.key === 'education').done === true, 'শিক্ষা তথ্য → ধাপ সম্পন্ন')

const sr = await completeSavedRoll(u1.cookie)
st = await state(u1.cookie)
log(sr.data.ok === true && st.steps.find((s) => s.key === 'first_result').done === true, 'প্রথম রেজাল্ট সেভ → ধাপ সম্পন্ন')

const mc = await completeMcq(u1.cookie)
st = await state(u1.cookie)
log(mc.data.ok === true && st.steps.find((s) => s.key === 'first_mcq').done === true, 'প্রথম MCQ টেস্ট → ধাপ সম্পন্ন')

log(st.done_count === 5, `৫/৫ ধাপ সম্পন্ন (পাওয়া: ${st.done_count})`)
log(st.pending === 70, `পেন্ডিং বোনাস ৳৭০ (পাওয়া: ${st.pending})`)

// ৩. UI — ক্লেইম
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
await ctx.addCookies([{ name: 'edusob_session', value: u1.cookie, url: BASE }])
const p = await ctx.newPage()
const errs = []
p.on('pageerror', (e) => errs.push(String(e)))
p.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()) })

await p.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' })
await p.waitForSelector('#obSteps li', { timeout: 10000 })

const ui = await p.evaluate(() => ({
  cardVisible: !document.getElementById('onboarding-card').classList.contains('hidden'),
  rows: document.querySelectorAll('#obSteps li').length,
  claimBtns: document.querySelectorAll('#obSteps button[data-ob-key]').length,
  links: document.querySelectorAll('#obSteps a').length,
  header: (document.getElementById('onboarding-card').querySelector('h2') || {}).textContent || '',
  count: (document.getElementById('obCount') || {}).textContent || '',
  pending: (document.getElementById('obPending') || {}).textContent || '',
  footerVisible: !document.getElementById('obFooter').classList.contains('hidden'),
}))
log(ui.cardVisible, 'ড্যাশবোর্ডে অনবোর্ডিং কার্ড দেখা যাচ্ছে')
log(ui.rows === 5, `৫টি ধাপের সারি রেন্ডার (পাওয়া: ${ui.rows})`)
log(ui.claimBtns === 5, `৫টি ক্লেইম বাটন (পাওয়া: ${ui.claimBtns})`)
log(ui.links === 0, `সব ধাপ শেষ → কোনো "শুরু করুন" লিংক নেই (পাওয়া: ${ui.links})`)
log(ui.count === bn('5') + '/' + bn('5'), `কাউন্টার ৫/৫ (পাওয়া: ${ui.count})`)
log(ui.pending === bn(70), `ক্লেইম-বার্তায় ৳${bn(70)} (পাওয়া: ${ui.pending})`)
log(ui.footerVisible, 'ক্লেইম-all বার দেখা যাচ্ছে')

const before = await walletBalance(u1.cookie)
await p.click('#obClaimBtn')
await p.waitForTimeout(1800)

const after = await walletBalance(u1.cookie)
log(after - before === 70, `ক্লেইমে ওয়ালেট ঠিক ৳৭০ বাড়ল (${before} → ${after})`)

const ui2 = await p.evaluate(() => ({
  cardVisible: !document.getElementById('onboarding-card').classList.contains('hidden'),
  walletVal: (document.querySelector('.wallet-val') || {}).textContent || '',
  toast: (document.getElementById('toast') || {}).textContent || '',
}))
log(ui2.walletVal === bn(after), `হেডারের ওয়ালেট সাথে সাথে আপডেট (${ui2.walletVal})`)
log(ui2.cardVisible === false, 'সব ধাপ শেষ + সব ক্লেইম → কার্ড স্বয়ংক্রিয়ভাবে লুকায়')

// ৪. idempotency — আবার ক্লেইম করলে এক টাকাও বাড়বে না
const re1 = await api('/api/onboarding/claim', { method: 'POST', cookie: u1.cookie, body: {} })
log((re1.data.granted || []).length === 0, `দ্বিতীয় ক্লেইমে কোনো গ্রান্ট নেই (পাওয়া: ${(re1.data.granted || []).length})`)
log(re1.data.balance === after, `ব্যালেন্স অপরিবর্তিত (${re1.data.balance})`)
const re2 = await api('/api/onboarding/claim', { method: 'POST', cookie: u1.cookie, body: { keys: ['profile_basic'] } })
log((re2.data.granted || []).length === 0 && re2.data.balance === after, 'একক ধাপ পুনরায় ক্লেইম → ডবল-ক্রেডিট নেই')

// ৫. রিলোড — কার্ড আর ফিরে আসবে না
await p.reload({ waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
const ui3 = await p.evaluate(() => !document.getElementById('onboarding-card').classList.contains('hidden'))
log(ui3 === false, 'রিলোডের পরেও সম্পন্ন কার্ড আর দেখায় না')

// ================= আংশিক সম্পন্ন ইউজার =================
console.log('\n  — আংশিক সম্পন্ন (শুধু প্রোফাইল মূল তথ্য) —')
const u2 = await makeUser()
await completeProfileBasics(u2.cookie)
const st2 = await state(u2.cookie)
log(st2.done_count === 1, `১/৫ ধাপ সম্পন্ন (পাওয়া: ${st2.done_count})`)
log(st2.pending === 20, `পেন্ডিং ৳২০ (পাওয়া: ${st2.pending})`)

const ctx2 = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
await ctx2.addCookies([{ name: 'edusob_session', value: u2.cookie, url: BASE }])
const p2 = await ctx2.newPage()
p2.on('pageerror', (e) => errs.push(String(e)))
p2.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()) })
await p2.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' })
await p2.waitForSelector('#obSteps li', { timeout: 10000 })

const m = await p2.evaluate(() => {
  const card = document.getElementById('onboarding-card')
  const r = card.getBoundingClientRect()
  return {
    rows: document.querySelectorAll('#obSteps li').length,
    claimBtns: document.querySelectorAll('#obSteps button[data-ob-key]').length,
    links: document.querySelectorAll('#obSteps a').length,
    overflowX: r.right > window.innerWidth + 1,
    cardWidth: Math.round(r.width),
    viewport: window.innerWidth,
  }
})
log(m.rows === 5 && m.claimBtns === 1 && m.links === 4, `মোবাইল: ১ ক্লেইম + ৪ সিটিএ (${m.claimBtns}/${m.links})`)
log(m.overflowX === false, `মোবাইলে হরাইজন্টাল ওভারফ্লো নেই (কার্ড ${m.cardWidth}px / ভিউপোর্ট ${m.viewport}px)`)

const b2 = await walletBalance(u2.cookie)
await p2.click('#obSteps button[data-ob-key]')
await p2.waitForTimeout(1500)
const a2 = await walletBalance(u2.cookie)
log(a2 - b2 === 20, `একক ধাপ ক্লেইমে ৳২০ যোগ (${b2} → ${a2})`)
const st2b = await state(u2.cookie)
log(st2b.pending === 0 && st2b.done_count === 1, 'ক্লেইমের পর পেন্ডিং ০ — বাকি ধাপ অপেক্ষমাণ')
const stillVisible = await p2.evaluate(() => !document.getElementById('onboarding-card').classList.contains('hidden'))
log(stillVisible === true, 'বাকি ধাপ থাকায় কার্ড স্ক্রিনে থাকে')

await b.close()

console.log(`\n  JS ত্রুটি: ${errs.length}${errs.length ? ' → ' + errs.slice(0, 3).join(' | ') : ''}`)
log(errs.length === 0, 'কোনো JS ত্রুটি নেই')
console.log(fail === 0 ? '\n✅ ALL PASS\n' : `\n❌ ${fail} টি চেক ব্যর্থ\n`)
process.exit(fail === 0 ? 0 : 1)
