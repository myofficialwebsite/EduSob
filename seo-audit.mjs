/**
 * এডুসব — SEO / শেয়ার ইনফ্রা অডিটর
 *
 * চালানোর নিয়ম: সার্ভার চালু থাকতে হবে (:3000), তারপর `node seo-audit.mjs`
 *
 * যা যা পরীক্ষা করে:
 *   ১. robots.txt আছে কি না, সিনট্যাক্স ঠিক কি না, সাইটম্যাপ pointing
 *   ২. sitemap.xml — বৈধ XML, সব URL-ই 200 দিচ্ছে কি না
 *   ৩. প্রতিটি রুটে: <title>, description, canonical, og:*, twitter:card, JSON-LD, lang, h1
 *   ৪. description/og:title ডুপ্লিকেট (প্রতি পেজের নিজস্ব হওয়া উচিত)
 *   ৫. noindex দেওয়া আছে কি না — লগইন/অ্যাডমিন/প্রোফাইলে থাকা উচিত, পাবলিক পেজে নয়
 */

const BASE = process.env.BASE || 'http://127.0.0.1:3000'

const PUBLIC = [
  '/', '/results', '/admission', '/scholarships', '/mcq', '/cv', '/shop',
  '/subscription', '/qpapers', '/teacher-support', '/news', '/jobs', '/notices',
  '/planner', '/cgpa', '/syllabus', '/board-challenge', '/teachers',
  '/login', '/signup',
]

// যেগুলো সার্চ ইঞ্জিনে আসা উচিত নয়
const NOINDEX_EXPECTED = ['/login', '/signup']

const fail = []
const warn = []
const ok = (m) => console.log('  ok  ' + m)
const bad = (m) => { fail.push(m); console.log('  FAIL ' + m) }
const wrn = (m) => { warn.push(m); console.log('  warn ' + m) }

const stripTags = (s) => s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

function attr(html, re) {
  const m = html.match(re)
  return m ? m[1].trim() : null
}

// ---------------------------------------------------------------- robots.txt
console.log('\n===== SEO / শেয়ার ইনফ্রা অডিট =====\n')
console.log('— robots.txt —')

const robotsRes = await fetch(BASE + '/robots.txt')
const robotsStatus = robotsRes.status
const robotsBody = robotsStatus === 200 ? await robotsRes.text() : ''

if (robotsStatus !== 200) {
  bad(`robots.txt → HTTP ${robotsStatus} (থাকা উচিত, 200 দরকার)`)
} else {
  ok(`robots.txt → HTTP 200`)
  const hasUA = /User-agent:\s*\*/i.test(robotsBody)
  const hasSitemap = /^\s*Sitemap:\s*\S+/im.test(robotsBody)
  const disallowAdmin = /Disallow:\s*\/admin/i.test(robotsBody)
  const disallowApi = /Disallow:\s*\/api/i.test(robotsBody)
  hasUA ? ok('User-agent: * আছে') : bad('robots.txt-এ "User-agent: *" নেই')
  hasSitemap ? ok('Sitemap: লাইন আছে') : warn('robots.txt-এ Sitemap: লাইন নেই')
  disallowAdmin ? ok('/admin ক্রল করা থেকে বিরত রাখা হয়েছে') : warn('/admin Disallow করা হয়নি')
  disallowApi ? ok('/api Disallow করা হয়েছে') : warn('/api Disallow করা হয়নি')
}

// ---------------------------------------------------------------- sitemap.xml
console.log('\n— sitemap.xml —')

let sitemapUrls = []
const smRes = await fetch(BASE + '/sitemap.xml')
if (smRes.status !== 200) {
  bad(`sitemap.xml → HTTP ${smRes.status}`)
} else {
  const xml = await smRes.text()
  ok('sitemap.xml → HTTP 200')
  const isXml = /^<\?xml|<urlset/i.test(xml.trim())
  isXml ? ok('XML-এর মতো দেখতে') : bad('sitemap.xml বৈধ XML নয়')
  sitemapUrls = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1])
  sitemapUrls.length
    ? ok(`${sitemapUrls.length}টি URL তালিকাভুক্ত`)
    : bad('sitemap.xml-এ কোনো <loc> পাওয়া যায়নি')

  // robots.txt-এর Sitemap লাইন আসলে কাজ করছে তো?
  const smLine = robotsBody.match(/^\s*Sitemap:\s*(\S+)/im)
  if (smLine) {
    // robots.txt-এর Sitemap URL সবসময় প্রোডাকশন অরিজিনে থাকে — লোকাল টেস্টে
    // হোস্টটি BASE দিয়ে বদলে শুধু পাথটি যাচাই করি
    const smUrl = new URL(smLine[1].replace(/\r/g, ''))
    const baseUrl = new URL(BASE)
    smUrl.protocol = baseUrl.protocol
    smUrl.host = baseUrl.host
    const r = await fetch(smUrl.toString())
    r.status === 200 ? ok(`robots.txt-এর Sitemap URL কাজ করে (${smUrl.pathname})`) : bad(`robots.txt-এর Sitemap URL → HTTP ${r.status}`)
  }

  // সব URL-এর স্ট্যাটাস (প্রথম 40টি)
  let broken = 0
  for (const u of sitemapUrls.slice(0, 40)) {
    const r = await fetch(u, { redirect: 'manual' })
    if (r.status >= 400) { broken++; console.log(`       ✗ ${r.status} ${u}`) }
  }
  broken === 0 ? ok('সাইটম্যাপের সব URL 200/রিডাইরেক্ট') : bad(`সাইটম্যাপে ${broken}টি ভাঙা URL`)
}

// ---------------------------------------------------------------- প্রতি রুট
console.log('\n— প্রতি রুটের মেটা —')

const seen = { description: new Map(), ogTitle: new Map() }

for (const route of PUBLIC) {
  const res = await fetch(BASE + route, { redirect: 'manual' })
  if (res.status >= 400) { bad(`${route} → HTTP ${res.status}`); continue }
  if (res.status >= 300) { console.log(`  --   ${route} → ${res.status} (রিডাইরেক্ট, স্কিপ)`); continue }

  const html = await res.text()
  const title = attr(html, /<title>([^<]*)<\/title>/)
  const desc = attr(html, /<meta\s+name="description"\s+content="([^"]*)"/i)
  const canon = attr(html, /<link\s+rel="canonical"\s+href="([^"]*)"/i)
  const ogTitle = attr(html, /<meta\s+property="og:title"\s+content="([^"]*)"/i)
  const ogUrl = attr(html, /<meta\s+property="og:url"\s+content="([^"]*)"/i)
  const ogImage = attr(html, /<meta\s+property="og:image"\s+content="([^"]*)"/i)
  const twCard = attr(html, /<meta\s+name="twitter:card"\s+content="([^"]*)"/i)
  const robotsMeta = attr(html, /<meta\s+name="robots"\s+content="([^"]*)"/i)
  const hasJsonLd = /<script[^>]*type="application\/ld\+json"/i.test(html)
  const langOk = /<html[^>]*\slang="bn"/i.test(html)
  // h1 গোনার আগে <script>/<style> সরিয়ে ফেলি — JS স্ট্রিংয়ের ভেতরের '<h1...>' ভুল পজিটিভ
  const visible = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '')
  const h1Count = (visible.match(/<h1[\s>]/g) || []).length

  const problems = []
  if (!title || title.length < 10) problems.push('title নেই/ছোট')
  else if (title.length > 70) problems.push(`title ${title.length} অক্ষর (৬০-৭০ ভালো)`)
  if (!desc) problems.push('description নেই')
  else if (desc.length > 165) problems.push(`description ${desc.length} অক্ষর (>১৬৫)`)
  if (!canon) problems.push('canonical নেই')
  else if (!canon.endsWith(route) && !(route === '/' && canon.replace(/\/+$/, '').endsWith(''))) {
    // canonical-এর শেষাংশ রুটের সাথে মেলা উচিত
    const cPath = canon.replace(/^https?:\/\/[^/]+/, '') || '/'
    if (cPath !== route) problems.push(`canonical (${cPath}) ≠ রুট (${route})`)
  }
  if (!ogTitle) problems.push('og:title নেই')
  if (!ogUrl) problems.push('og:url নেই')
  if (!ogImage) problems.push('og:image নেই')
  if (!twCard) problems.push('twitter:card নেই')
  if (!langOk) problems.push('<html lang="bn"> নেই')
  if (h1Count !== 1) problems.push(`h1 ${h1Count}টি (১টি দরকার)`)

  const shouldNoindex = NOINDEX_EXPECTED.includes(route)
  if (shouldNoindex && !(robotsMeta && /noindex/i.test(robotsMeta))) problems.push('noindex দরকার')
  if (!shouldNoindex && robotsMeta && /noindex/i.test(robotsMeta)) problems.push('পাবলিক পেজে noindex দেওয়া আছে')

  // ডুপ্লিকেট ট্র্যাকিং
  if (desc) seen.description.set(desc, (seen.description.get(desc) || 0) + 1)
  if (ogTitle) seen.ogTitle.set(ogTitle, (seen.ogTitle.get(ogTitle) || 0) + 1)

  if (problems.length === 0) {
    ok(`${route.padEnd(18)} ${String(title).slice(0, 46)}`)
    if (!hasJsonLd) console.log(`       · JSON-LD নেই`)
  } else {
    console.log(`  FAIL ${route}`)
    for (const p of problems) console.log(`       · ${p}`)
    fail.push(`${route}: ${problems.join(', ')}`)
    if (!hasJsonLd) console.log(`       · JSON-LD নেই`)
  }
}

// ---------------------------------------------------------------- ডুপ্লিকেট
console.log('\n— ডুপ্লিকেট মেটা —')
const dupDesc = [...seen.description.entries()].filter(([, n]) => n > 1)
const dupOg = [...seen.ogTitle.entries()].filter(([, n]) => n > 1)
dupDesc.length === 0
  ? ok('প্রতিটি পেজের description আলাদা')
  : wrn(`${dupDesc.length}টি description একাধিক পেজে ব্যবহৃত (সবচেয়ে বেশি ${Math.max(...dupDesc.map(([, n]) => n))} বার)`)
dupOg.length === 0
  ? ok('প্রতিটি পেজের og:title আলাদা')
  : wrn(`${dupOg.length}টি og:title একাধিক পেজে ব্যবহৃত`)

// ---------------------------------------------------------------- সারাংশ
console.log('\n' + '='.repeat(50))
console.log(`রুট: ${PUBLIC.length}  ·  সাইটম্যাপ URL: ${sitemapUrls.length}`)
console.log(`ব্যর্থ: ${fail.length}   সতর্কতা: ${warn.length}`)
if (fail.length) { console.log('\n❌ FAIL'); for (const f of fail) console.log('   - ' + f) }
else console.log('\n✅ ALL PASS')
console.log('='.repeat(50) + '\n')

process.exit(fail.length ? 1 : 0)
