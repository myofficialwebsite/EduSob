// H1 অডিট: প্রতিটি পেইজ রুটে ঠিক একটি <h1> আছে কি না
// লোকাল ডেভ DB-এর টেস্ট পাসওয়ার্ড — প্রোডাকশনের পাসওয়ার্ড আলাদা ও রিপোতে নেই।
// প্রোডাকশনের বিপরীতে চালাতে: EDUSOB_ADMIN_PASS=... BASE=https://edusob.pages.dev node <script>
const BASE = process.env.BASE || 'http://127.0.0.1:3000'

const ROUTES = [
  '/', '/dashboard', '/profile', '/wallet', '/results', '/qpapers', '/syllabus',
  '/news', '/jobs', '/notices', '/cv', '/cv-maker', '/scholarships', '/scholarship',
  '/shop', '/subscription', '/admission', '/admissions', '/assisted',
  '/board-challenge', '/cgpa', '/mcq', '/planner', '/teacher-support', '/teachers',
  '/login', '/signup',
  '/admin', '/admin/shop', '/admin/cv-templates',
]

const login = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier: '01829486022', password: process.env.EDUSOB_ADMIN_PASS || 'Ab52944820@' }),
})
const j = await login.json()
if (!j.ok) { console.error('login failed', j); process.exit(1) }
const cookie = `edusob_session=${j.token}`

let bad = 0
console.log('route'.padEnd(22), 'code  h1  text')
console.log('-'.repeat(78))
for (const r of ROUTES) {
  const res = await fetch(BASE + r, { headers: { Cookie: cookie } })
  const raw = await res.text()
  // ইনলাইন <script>/<style> বাদ — JS স্ট্রিং-এর ভেতরে লেখা '<h1>' যেন ভুল হিসাব না হয়
  // (যেমন subsPages.ts-এর getOfficialHtml: সেটা শুধু PDF-এর জন্য hidden iframe-এ ব্যবহৃত)
  const html = raw.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '')
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
    m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
  )
  const flag = h1s.length === 1 ? '  ' : '!!'
  if (h1s.length !== 1) bad++
  console.log(
    flag,
    r.padEnd(20),
    String(res.status).padEnd(5),
    String(h1s.length).padEnd(3),
    (h1s[0] || '—').slice(0, 40),
  )
}
console.log('-'.repeat(78))
console.log(`${bad} route(s) without exactly one <h1>`)
