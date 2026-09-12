// 🎨 CV টেমপ্লেট কাস্টমাইজার — এডমিন API টেস্ট
//
// কেন এই টেস্ট: MASTER_PLAN §৩ "CV মেকার — ১০টি ডিজাইন … এডমিন কাস্টমাইজ
// সিস্টেম: প্রতিটি টেমপ্লেটের সেকশন-অর্ডার, ফিল্ড-পজিশন, কালার, ফন্ট —
// এডমিন প্যানেল থেকে বদলানো যাবে" + §৫ "CV টেমপ্লেট কাস্টমাইজার (…রেট)"।
// দাম বদলানো যায় বলে এটি সরাসরি অর্থের সাথে জড়িত — টেস্ট জরুরি।
//
// যাচাই করা হয়:
//   ১) অননুমোদিত অ্যাক্সেস বন্ধ (লগইন ছাড়া ৪০১)
//   ২) ১০টি টেমপ্লেটই তালিকায় আসে, config পার্সড অবজেক্ট
//   ৩) রঙ বদলালে সংরক্ষিত হয়
//   ৪) দাম বদলালে সংরক্ষিত হয়
//   ৫) 🔒 হোয়াইটলিস্ট: অননুমোদিত config-কী বাতিল হয় (ইনজেকশন প্রতিরোধ)
//   ৬) অবৈধ দাম (ঋণাত্মক/ভগ্নাংশ/স্ট্রিং) উপেক্ষিত হয়
//   ৭) অবৈধ JSON → ৪০০ · অবিদ্যমান slug → ৪০৪
//   ৮) পরীক্ষা শেষে মূল মান ফিরিয়ে দেওয়া হয় (কোনো স্থায়ী পরিবর্তন থাকে না)
//
// ⚠️ শুধু স্থানীয় সার্ভারে চলবে (প্রোডাকশন-সুরক্ষা গার্ড)।
// চালান: ./run-test.sh cv-admin-test.mjs
const BASE = process.env.BASE || 'http://127.0.0.1:3000'
const PHONE = process.env.TEST_PHONE || '01829486022'
const PASS = process.env.TEST_PASS || 'Ab52944820@'

if (!/127\.0\.0\.1|localhost/.test(BASE)) {
  console.log('❌ এই টেস্ট প্রোডাকশনে চলবে না — এটি টেমপ্লেটের দাম বদলায়।')
  process.exit(1)
}
let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok  ' : '  FAIL'} ${m}`); if (!ok) fail++ }

const call = async (method, path, body, cookie) => {
  const h = { 'Content-Type': 'application/json' }
  if (cookie) h.Cookie = 'edusob_session=' + cookie
  const r = await fetch(BASE + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined })
  let j = null
  try { j = await r.json() } catch {}
  return { s: r.status, j }
}

console.log('\n=== 🎨 CV টেমপ্লেট কাস্টমাইজার (এডমিন) ===\n')

// ── ১) অননুমোদিত অ্যাক্সেস বন্ধ ─────────────────────────────────────
const anon = await call('GET', '/api/cv/admin/templates')
log(anon.s === 401, `লগইন ছাড়া তালিকা → HTTP ${anon.s} (প্রত্যাশিত ৪০১)`)
const anonPut = await call('PUT', '/api/cv/admin/templates/executive-navy', { price: 1 })
log(anonPut.s === 401, `লগইন ছাড়া পরিবর্তন → HTTP ${anonPut.s} (প্রত্যাশিত ৪০১)`)

// ── লগইন ────────────────────────────────────────────────────────────
const li = await call('POST', '/api/auth/login', { identifier: PHONE, password: PASS })
log(!!li.j?.token, `এডমিন লগইন → ${li.j?.token ? 'সফল' : 'ব্যর্থ'}`)
const C = li.j?.token

// ── ২) তালিকা ───────────────────────────────────────────────────────
const list = await call('GET', '/api/cv/admin/templates', undefined, C)
log(list.s === 200 && list.j?.ok, `তালিকা → HTTP ${list.s}`)
const tpls = list.j?.templates || []
log(tpls.length === 10, `টেমপ্লেট সংখ্যা: ${tpls.length} (MASTER_PLAN অনুযায়ী ১০টি)`)
log(tpls.every((t) => t.config && typeof t.config === 'object'), 'সব টেমপ্লেটের config পার্সড অবজেক্ট')

// দাম যাচাই — পরিকল্পনা অনুযায়ী ৳০ / ৳৩০ / ৳৫০
const prices = [...new Set(tpls.map((t) => t.price))].sort((a, b) => a - b)
log(JSON.stringify(prices) === '[0,30,50]', `দামের স্তর: ${prices.join(', ')} টাকা (প্রত্যাশিত ০, ৩০, ৫০)`)

// ── পরীক্ষার লক্ষ্য: executive-navy (৳৩০) ───────────────────────────
const SLUG = 'executive-navy'
const orig = tpls.find((t) => t.slug === SLUG)
log(!!orig, `পরীক্ষার লক্ষ্য পাওয়া গেছে: ${SLUG}`)
const restore = { config: { primary: orig.config.primary, accent: orig.config.accent }, price: orig.price, is_active: orig.is_active }
console.log(`  (মূল: primary=${orig.config.primary} · accent=${orig.config.accent} · দাম=৳${orig.price})`)

// ── ৩) রঙ বদল ───────────────────────────────────────────────────────
const NEWPRI = '#123456', NEWACC = '#abcdef'
let r = await call('PUT', `/api/cv/admin/templates/${SLUG}`, { config: { primary: NEWPRI, accent: NEWACC } }, C)
log(r.s === 200 && r.j?.ok, `রঙ বদল → HTTP ${r.s}`)
r = await call('GET', '/api/cv/admin/templates', undefined, C)
let now = (r.j?.templates || []).find((t) => t.slug === SLUG)
log(now?.config?.primary === NEWPRI && now?.config?.accent === NEWACC,
  `রঙ সংরক্ষিত → primary=${now?.config?.primary} accent=${now?.config?.accent}`)

// ── ৪) দাম বদল ──────────────────────────────────────────────────────
r = await call('PUT', `/api/cv/admin/templates/${SLUG}`, { price: 77 }, C)
r = await call('GET', '/api/cv/admin/templates', undefined, C)
now = (r.j?.templates || []).find((t) => t.slug === SLUG)
log(now?.price === 77, `দাম বদল → ৳${now?.price} (প্রত্যাশিত ৭৭)`)

// ── ৫) 🔒 হোয়াইটলিস্ট — অননুমোদিত কী বাতিল ──────────────────────────
r = await call('PUT', `/api/cv/admin/templates/${SLUG}`, {
  config: { primary: NEWPRI, evilKey: 'ইনজেক্টেড', __proto__: { poll: 1 } },
}, C)
r = await call('GET', '/api/cv/admin/templates', undefined, C)
now = (r.j?.templates || []).find((t) => t.slug === SLUG)
log(now?.config?.evilKey === undefined, `অননুমোদিত কী বাতিল → evilKey=${now?.config?.evilKey ?? 'অনুপস্থিত ✅'}`)
log(now?.config?.primary === NEWPRI, 'অনুমোদিত কী তো বজায় আছে')

// ── ৬) অবৈধ দাম উপেক্ষিত ────────────────────────────────────────────
for (const [name, bad] of [['ঋণাত্মক', -5], ['ভগ্নাংশ', 12.5], ['স্ট্রিং', '৫০']]) {
  await call('PUT', `/api/cv/admin/templates/${SLUG}`, { price: bad }, C)
  const chk = await call('GET', '/api/cv/admin/templates', undefined, C)
  const t = (chk.j?.templates || []).find((x) => x.slug === SLUG)
  log(t?.price === 77, `অবৈধ দাম (${name}: ${JSON.stringify(bad)}) উপেক্ষিত → ৳${t?.price} (৭৭ বজায়)`)
}

// ── ৭) ত্রুটিপূর্ণ অনুরোধ ───────────────────────────────────────────
const badJson = await fetch(BASE + `/api/cv/admin/templates/${SLUG}`, {
  method: 'PUT', headers: { 'Content-Type': 'application/json', Cookie: 'edusob_session=' + C }, body: 'JSON নয়',
})
log(badJson.status === 400, `অবৈধ JSON → HTTP ${badJson.status} (প্রত্যাশিত ৪০০)`)
const ghost = await call('PUT', '/api/cv/admin/templates/এই-টেমপ্লেট-নেই', { price: 10 }, C)
log(ghost.s === 404, `অবিদ্যমান টেমপ্লেট → HTTP ${ghost.s} (প্রত্যাশিত ৪০৪)`)

// ── ৮) মূল অবস্থায় ফিরিয়ে দেওয়া ─────────────────────────────────────
const back = await call('PUT', `/api/cv/admin/templates/${SLUG}`, restore, C)
const fin = await call('GET', '/api/cv/admin/templates', undefined, C)
const f = (fin.j?.templates || []).find((t) => t.slug === SLUG)
log(back.s === 200 && f?.price === orig.price && f?.config?.primary === orig.config.primary && f?.config?.accent === orig.config.accent,
  `মূল অবস্থায় ফেরত → primary=${f?.config?.primary} accent=${f?.config?.accent} দাম=৳${f?.price}`)

console.log(fail === 0 ? '\n✅ ALL PASS\n' : `\n❌ ${fail}টি ব্যর্থ\n`)
process.exit(fail === 0 ? 0 : 1)
