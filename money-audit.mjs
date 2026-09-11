/**
 * টাকার হিসাব অডিট (`node money-audit.mjs`).
 *
 * UI বা গণনা ঠিক থাকলেও টাকার পথে ভুল থাকলে সবচেয়ে বড় ক্ষতি হয়। এখানে
 * বাস্তব API-তে অর্ডার তৈরি ও বাতিল করে যাচাই করা হয়:
 *
 *   ১. ওয়ালেট থেকে **নির্দিষ্ট** টাকা কাটে (কম-বেশি নয়)
 *   ২. বাতিল করলে **হুবহু** ফেরত যায়
 *   ৩. **দুইবার** বাতিল করলে দ্বিগুণ ফেরত যায় না (idempotency — সবচেয়ে ভয়ঙ্কর বাগ)
 *   ৪. রিফান্ড লেনদেন-ইতিহাসে রেকর্ড হয়
 *   ৫. স্টক ফেরত যায়
 *
 * ⚠️ এটি লোকাল ডেটাবেসে একটি বাস্তব অর্ডার তৈরি ও বাতিল করে। নেট ব্যালেন্স
 *    পরিবর্তন শূন্য (কাটা → ফেরত), তবে অর্ডার/ট্রানজেকশন রেকর্ড থেকে যায়।
 *    প্রোডাকশনে চালাবেন না (EDUSOB_BASE দিয়ে প্রোডাকশন দিলে সতর্ক থাকুন)।
 */
const BASE = process.env.EDUSOB_BASE || 'http://127.0.0.1:3000'
const PHONE = process.env.EDUSOB_PHONE || '01829486022'
const PASS = process.env.EDUSOB_PASS || 'Ab52944820@'

const results = []
function check(name, actual, expected) {
  // সংখ্যা হলে সংখ্যায় তুলনা, নইলে স্ট্রিং-এ (Number('confirmed') = NaN, আর NaN !== NaN)
  const na = Number(actual), ne = Number(expected)
  const ok = (Number.isNaN(na) || Number.isNaN(ne)) ? String(actual) === String(expected) : na === ne
  results.push({ name, ok, actual, expected })
  console.log(`  ${ok ? '✅' : '❌'} ${name.padEnd(40)} ${actual}${ok ? '' : `   (প্রত্যাশিত ${expected})`}`)
}

async function api(path, cookie, method = 'GET', body) {
  const r = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const t = await r.text()
  let j = null
  try { j = JSON.parse(t) } catch { /* JSON নয় */ }
  return { status: r.status, json: j, text: t.slice(0, 200) }
}

console.log(`\n===== টাকার হিসাব অডিট — ${BASE} =====\n`)

/* ১. লগইন */
const li = await api('/api/auth/login', null, 'POST', { identifier: PHONE, password: PASS })
if (!li.json?.token) { console.log('❌ লগইন ব্যর্থ:', li.text); process.exit(1) }
const cookie = `edusob_session=${li.json.token}`
console.log('লগইন: ✅\n')

/* ২. নিজের আইডি */
const me = await api('/api/me', cookie)
const uid = me.json?.user?.id ?? me.json?.id
if (!uid) { console.log('❌ ইউজার আইডি পাওয়া যায়নি:', me.text); process.exit(1) }

/* ৩. ব্যালেন্স একটি নির্দিষ্ট মানে নিয়ে আসা (যাতে হিসাব নির্ভরযোগ্য হয়) */
const TARGET = 5000
const w0 = await api('/api/wallet', cookie)
const bal0 = Number(w0.json?.balance ?? 0)
console.log(`বর্তমান ব্যালেন্স: ৳${bal0} → ৳${TARGET}-এ নিয়ে যাওয়া হচ্ছে`)
if (bal0 !== TARGET) {
  const adj = await api(`/api/admin/users/${uid}/wallet`, cookie, 'POST', { amount: TARGET - bal0, note: 'মানি-অডিট: ব্যালেন্স নির্ধারণ' })
  if (!adj.json?.ok) { console.log('❌ ব্যালেন্স সেট করা যায়নি:', adj.text); process.exit(1) }
}
const wStart = await api('/api/wallet', cookie)
check('প্রারম্ভিক ব্যালেন্স', wStart.json?.balance, TARGET)

/* ৪. একটি পণ্য বেছে নেওয়া (স্টক আছে এমন) */
const prod = await api('/api/shop/products', cookie)
const p = (prod.json?.products || []).find((x) => x.stock >= 2)
if (!p) { console.log('❌ পর্যাপ্ত স্টকসহ কোনো পণ্য নেই'); process.exit(1) }
const unit = p.offer_price ?? p.price
const QTY = 2
const EXPECTED_TOTAL = unit * QTY
console.log(`পণ্য: ${p.name_bn} (id ${p.id}) · ইউনিট ৳${unit} × ${QTY} = ৳${EXPECTED_TOTAL}\n`)

const stockBefore = p.stock

/* ৫. ওয়ালেট দিয়ে অর্ডার */
const ord = await api('/api/shop/orders', cookie, 'POST', {
  customer_name: 'মানি অডিট টেস্ট',
  customer_phone: '01712345678',
  address: 'চট্টগ্রাম, বাংলাদেশ',
  payment_method: 'wallet',
  items: [{ product_id: p.id, qty: QTY }],
})
if (!ord.json?.ok) { console.log('❌ অর্ডার ব্যর্থ:', ord.text); process.exit(1) }
const orderId = ord.json.order_id
console.log('── অর্ডার তৈরি ──────────────────────────────────')
check('সার্ভার-হিসাবকৃত মোট', ord.json.total, EXPECTED_TOTAL)
check('ওয়ালেট অর্ডার সাথে সাথে confirmed', ord.json.status, 'confirmed')

const wAfterOrder = await api('/api/wallet', cookie)
check('কর্তনের পর ব্যালেন্স', wAfterOrder.json?.balance, TARGET - EXPECTED_TOTAL)

/* ৬. বাতিল → রিফান্ড */
const cancel1 = await api(`/api/shop/admin/orders/${orderId}`, cookie, 'PUT', { status: 'cancelled' })
console.log('\n── বাতিল (১ম বার) ───────────────────────────────')
if (!cancel1.json?.ok) console.log('❌ বাতিল ব্যর্থ:', cancel1.text)
const wAfterCancel = await api('/api/wallet', cookie)
check('রিফান্ডের পর ব্যালেন্স', wAfterCancel.json?.balance, TARGET)

/* ৭. আবার বাতিল → দ্বিগুণ রিফান্ড হওয়া চলবে না */
const cancel2 = await api(`/api/shop/admin/orders/${orderId}`, cookie, 'PUT', { status: 'cancelled' })
console.log('\n── বাতিল (২য় বার — দ্বিগুণ রিফান্ড পরীক্ষা) ──────')
const wAfterCancel2 = await api('/api/wallet', cookie)
check('দ্বিতীয় বাতিলে ব্যালেন্স অপরিবর্তিত', wAfterCancel2.json?.balance, TARGET)

/* ৮. লেনদেন-ইতিহাসে রিফান্ড রেকর্ড */
const tx = (await api('/api/wallet', cookie)).json?.transactions || []
const refunds = tx.filter((t) => t.type === 'refund' && String(t.note || '').includes(String(orderId)))
console.log('\n── লেনদেন ইতিহাস ────────────────────────────────')
check(`অর্ডার #${orderId}-এর রিফান্ড এন্ট্রি`, refunds.length, 1)

/* ৯. স্টক ফেরত */
const prod2 = await api('/api/shop/products', cookie)
const pAfter = (prod2.json?.products || []).find((x) => x.id === p.id)
check('স্টক ফেরত', pAfter?.stock, stockBefore)

/* শেষ: ব্যালেন্স আগের জায়গায় */
const wEnd = await api('/api/wallet', cookie)
if (wEnd.json?.balance !== bal0) {
  await api(`/api/admin/users/${uid}/wallet`, cookie, 'POST', { amount: bal0 - wEnd.json.balance, note: 'মানি-অডিট: পূর্বাবস্থা' })
  console.log(`\n(ব্যালেন্স আগের ৳${bal0}-এ ফেরত দেওয়া হয়েছে)`)
}

await new Promise((r) => setTimeout(r, 100))
const failed = results.filter((r) => !r.ok)
console.log(`\n${'='.repeat(56)}`)
console.log(`পরীক্ষা: ${results.length} · পাস: ${results.length - failed.length} · ব্যর্থ: ${failed.length}`)
if (failed.length) { console.log('\n❌ ব্যর্থ:'); for (const f of failed) console.log(`   ${f.name} — পাওয়া ${f.actual}, প্রত্যাশিত ${f.expected}`) }
else console.log('\n✅ টাকার হিসাব নিখুঁত — কর্তন, রিফান্ড ও দ্বিগুণ-রিফান্ড প্রতিরোধ সব ঠিক')
console.log('='.repeat(56) + '\n')
process.exit(failed.length ? 1 : 0)
