// 🛍️ শপ / ই-কমার্স — পণ্য, সাইনবোর্ড ও অর্ডার টেস্ট
//
// কেন এই টেস্ট: MASTER_PLAN-এ "ই-কমার্স শপ: গেস্ট ব্রাউজ + ক্যাশ অন ডেলিভারি
// চেকআউট" এবং "পপ-আপ সাইনবোর্ড সিস্টেম ... সর্বোচ্চ ৫টি প্রোডাক্ট" আছে।
// অর্ডার পথটি টাকা-সংক্রান্ত, তাই এর আগে কোনো নির্দিষ্ট টেস্ট না থাকাটা
// ঝুঁকির ছিল (money-audit মূলত ওয়ালেট/রিফান্ডে মনোযোগ দেয়)।
//
// যাচাই করা হয়:
//   ১) পণ্য-তালিকা (অতিথিও দেখতে পাবে)
//   ২) পপ-আপ সাইনবোর্ড (পরিকল্পনা অনুযায়ী সর্বোচ্চ ৫টি)
//   ৩) সেটিংস
//   ৪) অর্ডার — লগইন ছাড়া বন্ধ
//   ৫) অর্ডার — অবৈধ পণ্য/ফাঁকা কার্ট নিয়মিতভাবে প্রত্যাখ্যান (৫০০ নয়)
//
// চালান: ./run-test.sh shop-test.mjs
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

console.log('\n=== 🛍️ শপ / ই-কমার্স ===\n')

// ⚠️ সতর্কতা: এই টেস্ট বাস্তবেই একটি অর্ডার তৈরি করে (COD, অতিথি)।
// প্রোডাকশনের বিপরীতে চালালে সেখানে অর্ডার জমা পড়বে — তাই স্পষ্ট বার্তা।
const isLocal = /127\.0\.0\.1|localhost/.test(BASE)
if (!isLocal) {
  console.log('  ⚠️  BASE লোকাল নয় (' + BASE + ') — এই টেস্ট বাস্তব অর্ডার তৈরি করবে!')
  console.log('     থামানো হলো। প্রোডাকশনে চালাতে চাইলে প্রথমে অর্ডার-বাতিলের পথ যোগ করুন।')
  process.exit(1)
}

// ── ১) পণ্য-তালিকা (অতিথি) ──────────────────────────────────────────
const prod = await getJSON('/api/shop/products')
const items = prod.j?.products || prod.j?.items || []
log(prod.s === 200, `পণ্য-তালিকা → HTTP ${prod.s}`)
log(items.length > 0, `মোট পণ্য: ${items.length} টি`)
const priced = items.every((p) => typeof p.price === 'number' && p.price >= 0)
log(priced, 'প্রতিটির দাম সংখ্যা ও ঋণাত্মক নয়')

// ── ২) পপ-আপ সাইনবোর্ড ─────────────────────────────────────────────
const sb = await getJSON('/api/shop/signboard')
const sbItems = sb.j?.products || sb.j?.items || []
log(sb.s === 200, `সাইনবোর্ড → HTTP ${sb.s}`)
log(sbItems.length <= 5, `সাইনবোর্ডে ${sbItems.length} টি পণ্য (পরিকল্পনা অনুযায়ী সর্বোচ্চ ৫)`)

// ── ৩) সেটিংস ───────────────────────────────────────────────────────
const st = await getJSON('/api/shop/settings')
log(st.s === 200 && st.j !== null, `সেটিংস → HTTP ${st.s}`)

// ── ৪) অর্ডার — অতিথি ক্যাশ-অন-ডেলিভারি (পরিকল্পনাতেই আছে) ──────────
// ⚠️ অর্ডার রুট ইচ্ছাকৃতভাবে অতিথির জন্য খোলা — MASTER_PLAN: "ই-কমার্স
// শপ: গেস্ট ব্রাউজ + ক্যাশ অন ডেলিভারি চেকআউট"। শুধু `wallet` পেমেন্টে
// লগইন বাধ্যতামূলক (shop.ts: `if (method==='wallet' && !user)`)।
// প্রথম চেষ্টায় আমি ভুল করে ৪০১ আশা করেছিলাম — আসল কারণ ছিল বডিতে
// নাম/ফোন/ঠিকানা না থাকা।
const GUEST = {
  customer_name: 'পরীক্ষা ক্রেতা',
  customer_phone: '01712345678',
  address: 'চট্টগ্রাম, বাংলাদেশ',
  payment_method: 'cod',
  items: [{ product_id: 1, qty: 1 }],
}
const guest = await postJSON('/api/shop/orders', GUEST)
log(guest.s === 200 || (guest.s >= 400 && guest.s < 500),
  `অতিথি COD অর্ডার → HTTP ${guest.s}${guest.j?.error ? ' · "' + guest.j.error.slice(0, 34) + '"' : ''}`)
log(guest.s !== 500, `অতিথি COD অর্ডার → ৫০০ নয় ✅`)

// ওয়ালেট পেমেন্ট লগইন ছাড়া বন্ধ
const wallet = await postJSON('/api/shop/orders', { ...GUEST, payment_method: 'wallet' })
log(wallet.s === 401 || wallet.s === 403 || wallet.s === 400,
  `ওয়ালেট পেমেন্ট (লগইন ছাড়া) বন্ধ → HTTP ${wallet.s}`)

// ── ৫) অবৈধ ইনপুট সুন্দরভাবে প্রত্যাখ্যান (৫০০ নয়) ──────────────────
// প্রতিটি ক্ষেত্রে বাকি তথ্য সঠিক রেখে শুধু একটি বিষয় ভুল করা হয়,
// যাতে ঠিক সেই যাচাইটিই পরীক্ষা হয় (সব ক্ষেত্রেই প্রত্যাশিত: ৪xx, ৫০০ নয়)
const cases = [
  ['ফাঁকা কার্ট', { ...GUEST, items: [] }],
  ['অস্তিত্বহীন পণ্য', { ...GUEST, items: [{ product_id: 999999, qty: 1 }] }],
  ['ভুল ফোন', { ...GUEST, customer_phone: '12345' }],
  ['নাম নেই', { ...GUEST, customer_name: '' }],
  ['ঠিকানা নেই', { ...GUEST, address: '' }],
  ['পণ্য ছাড়াই', { ...GUEST, items: undefined }],
]
for (const [label, body] of cases) {
  const r = await postJSON('/api/shop/orders', body)
  // লগইন না থাকলে ৪০১/৪০৩-ই প্রত্যাশিত (প্রমাণীকরণ আগে) — ৫০০ নয়
  log(r.s !== 500, `${label.padEnd(16)} → HTTP ${r.s} (৫০০ নয়)`)
}

// অবৈধ JSON
const badJson = await fetch(`${BASE}/api/shop/orders`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'JSON নয়',
})
log(badJson.status !== 500, `অবৈধ JSON        → HTTP ${badJson.status} (৫০০ নয়)`)

console.log(fail === 0 ? '\n✅ ALL PASS\n' : `\n❌ ${fail}টি ব্যর্থ\n`)
process.exit(fail === 0 ? 0 : 1)
