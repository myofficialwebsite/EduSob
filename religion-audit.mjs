import { readFileSync } from 'fs'
/**
 * ধর্ম-ভিত্তিক ড্যাশবোর্ড অডিট (`node religion-audit.mjs`).
 *
 * যাচাই করে:
 *   ১. প্রোফাইল পেজে ধর্ম বদলানোর সিলেক্ট আছে এবং বর্তমান মান নির্বাচিত
 *   ২. PUT /api/profile দিয়ে ধর্ম বদলানো যায় (আগে একেবারেই যেত না)
 *   ৩. বদলের পর ড্যাশবোর্ড সাড়া দেয় — অভিবাদন, থিম, ওয়াটারমার্ক সব বদলায়
 *   ৪. অবৈধ মান প্রত্যাখ্যাত হয় (হোয়াইটলিস্ট ঠিক আছে কি)
 *   ৫. শেষে মূল অবস্থায় ফেরত
 *
 * ⚠️ এটি লোকাল ডেটাবেসে ব্যবহারকারীর ধর্ম সাময়িকভাবে বদলে শেষে ফেরত দেয়।
 */
const BASE = process.env.EDUSOB_BASE || 'http://127.0.0.1:3000'
const PHONE = process.env.EDUSOB_PHONE || '01829486022'
const PASS = process.env.EDUSOB_PASS || 'Ab52944820@'

const EXPECT = {
  islam:    { greeting: 'আসসালামু আলাইকুম', theme: 'orange',  watermark: '☪' },
  sanatan:  { greeting: 'হরেকৃষ্ণ',        theme: 'saffron', watermark: 'ॐ' },
  buddhist: { greeting: 'নমো বুদ্ধায়',    theme: 'maroon',  watermark: '☸' },
  christian:{ greeting: 'শুভেচ্ছা ও শান্তি', theme: 'blue',   watermark: '✝' },
  other:    { greeting: 'শুভেচ্ছা',        theme: 'orange',  watermark: '📚' },
}
/* ধর্মীয় প্রতীক এখন SVG-পাথ — ফন্ট নির্বিশেষে সব ডিভাইসে একই রূপ।
   প্রত্যাশা-টেবিলটি সরাসরি মডিউল থেকে পড়া হয়, হার্ড-কোড করা নয়। */
const MOD = readFileSync('src/lib/religionWatermarks.ts', 'utf8')
const SVG_EXPECT = {}
for (const m of MOD.matchAll(/^  (\w+):\n    '([^']+)',$/gm)) SVG_EXPECT[m[1]] = m[2]
if (Object.keys(SVG_EXPECT).length !== 4) {
  console.log('  ❌ religionWatermarks.ts থেকে ৪টি পাথ পড়া যায়নি'); process.exit(1)
}
const results = []
const check = (name, ok, got = '') => {
  results.push({ name, ok })
  console.log(`  ${ok ? '✅' : '❌'} ${name.padEnd(42)} ${got}`)
}

async function api(path, cookie, method = 'GET', body) {
  const r = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const t = await r.text()
  let j = null; try { j = JSON.parse(t) } catch {}
  return { status: r.status, json: j, text: t }
}

console.log(`\n===== ধর্ম-ভিত্তিক ড্যাশবোর্ড অডিট — ${BASE} =====\n`)

const li = await api('/api/auth/login', null, 'POST', { identifier: PHONE, password: PASS })
if (!li.json?.token) { console.log('❌ লগইন ব্যর্থ:', li.text); process.exit(1) }
const cookie = `edusob_session=${li.json.token}`
const me = await api('/api/me', cookie)
const current = me.json?.user?.religion ?? 'other'
console.log(`লগইন ✅ · বর্তমান ধর্ম: ${current}\n`)

/* ১. প্রোফাইল পেজে সিলেক্ট আছে কি */
console.log('── প্রোফাইল ফর্ম ────────────────────────────────')
const prof = await api('/profile', cookie)
const html = prof.text || ''
check('ধর্ম-সিলেক্ট আছে', /name="religion"/.test(html))
check('বর্তমান মান নির্বাচিত', new RegExp(`value="${current}" selected`).test(html))
for (const v of Object.keys(EXPECT)) {
  check(`  ↳ অপশন "${v}"`, html.includes(`value="${v}"`))
}

/* ২. প্রতিটি ধর্মে বদলে ড্যাশবোর্ড যাচাই */
console.log('\n── প্রতিটি ধর্মে বদল → ড্যাশবোর্ড ──────────────')
for (const [rel, exp] of Object.entries(EXPECT)) {
  const up = await api('/api/profile', cookie, 'PUT', { religion: rel })
  if (!up.json?.ok) { check(`${rel} → আপডেট`, false, up.text.slice(0, 60)); continue }
  const dash = await api('/dashboard', cookie)
  const h = dash.text || ''
  const greetingOk = h.includes(exp.greeting)
  const themeOk = h.includes(`ds-hero--${exp.theme}`)
  // SVG থাকলে: সেই <div>-এর ভেতরে সঠিক পাথ আছে কি; নইলে: ইমোজি আছে কি
  const boxM = h.match(/<div class="ds-hero__watermark"[^>]*>([\s\S]*?)<\/div>/)
  const inner = boxM ? boxM[1] : ''
  const markOk = SVG_EXPECT[rel]
    ? inner.includes('<svg') && inner.includes(`d="${SVG_EXPECT[rel]}"`)
    : inner.includes(exp.watermark)
  check(`${rel.padEnd(9)} অভিবাদন "${exp.greeting}"`, greetingOk)
  check(`${rel.padEnd(9)} থিম ${exp.theme}`, themeOk)
  check(`${rel.padEnd(9)} ওয়াটারমার্ক ${exp.watermark}${SVG_EXPECT[rel] ? ' (SVG)' : ' (ইমোজি)'}`, markOk)
}

/* ৩. অবৈধ মান প্রত্যাখ্যাত হবে */
console.log('\n── নিরাপত্তা: অবৈধ মান ──────────────────────────')
const bad = await api('/api/profile', cookie, 'PUT', { religion: 'jedi' })
const after = await api('/api/me', cookie)
const still = after.json?.user?.religion
check('অবৈধ মানে ধর্ম অপরিবর্তিত', still === 'other', `এখন: ${still}`)

/* ৪. মূল অবস্থায় ফেরত */
await api('/api/profile', cookie, 'PUT', { religion: current })
const back = await api('/api/me', cookie)
check(`মূল অবস্থায় ফেরত (${current})`, back.json?.user?.religion === current)

const failed = results.filter((r) => !r.ok)
console.log(`\n${'='.repeat(56)}`)
console.log(`পরীক্ষা: ${results.length} · পাস: ${results.length - failed.length} · ব্যর্থ: ${failed.length}`)
if (failed.length) { console.log('\n❌ ব্যর্থ:'); for (const f of failed) console.log(`   ${f.name}`) }
else console.log('\n✅ ধর্ম-ভিত্তিক ড্যাশবোর্ড সম্পূর্ণ কার্যকর')
console.log('='.repeat(56) + '\n')
process.exit(failed.length ? 1 : 0)
