/**
 * এডুসব — পারফরম্যান্স অডিটর
 *
 * চালানোর নিয়ম: সার্ভার চালু থাকতে হবে (:3000), তারপর `node perf-audit.mjs`
 *
 * কী মাপে (মোবাইল: ৩৯০×৮৪৪, CPU ×৪ ধীর, Fast-3G নেটওয়ার্ক):
 *   • TTFB, DOMContentLoaded, load
 *   • LCP (Largest Contentful Paint) — Core Web Vital
 *   • CLS (Cumulative Layout Shift)   — Core Web Vital
 *   • মোট ট্রান্সফার (HTML + CSS + ফন্ট + JS), রিকোয়েস্ট সংখ্যা
 *   • সবচেয়ে ভারী রিসোর্স
 *
 * থ্রেশহোল্ড (Google-এর "Good" সীমা):
 *   LCP  < ২.৫ সে  · CLS < ০.১  · TTFB < ০.৮ সে  · মোট ট্রান্সফার < ১ MB
 */

import { chromium } from 'playwright'
import { gzipSync } from 'node:zlib'

// লোকাল ডেভ DB-এর টেস্ট পাসওয়ার্ড — প্রোডাকশনের পাসওয়ার্ড আলাদা ও রিপোতে নেই।
// প্রোডাকশনের বিপরীতে চালাতে: EDUSOB_ADMIN_PASS=... BASE=https://edusob.pages.dev node <script>
const BASE = process.env.BASE || 'http://127.0.0.1:3000'
const ROUTES = [
  '/', '/results', '/admission', '/scholarships', '/mcq', '/cv', '/shop',
  '/subscription', '/qpapers', '/teacher-support', '/news', '/jobs', '/notices',
  '/planner', '/cgpa', '/syllabus', '/board-challenge',
]

const LCP_GOOD = 2500
const CLS_GOOD = 0.1
const TTFB_GOOD = 800
const BYTES_GOOD = 400 * 1024   // gzip-এ ৪০০ KB (প্রোডাকশন-সমতুল্য)

console.log('\n===== পারফরম্যান্স অডিট (মোবাইল, CPU ×৪, Fast 3G) =====\n')
console.log('রুট'.padEnd(20) + 'TTFB'.padStart(7) + 'DOMC'.padStart(7) + 'load'.padStart(7) +
            'LCP'.padStart(7) + 'CLS'.padStart(7) + 'gzip'.padStart(8) + '  রিকোয়েস্ট')
console.log('-'.repeat(74))
console.log('(gzip = প্রোডাকশন-সমতুল্য ট্রান্সফার; কাঁচা আকার নিচে আলাদা করে দেখানো হয়েছে)')

const browser = await chromium.launch()

// গেস্ট + লগ-ইন — লগ-ইন করা অবস্থায় /dashboard-ও মাপব
const login = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier: '01829486022', password: process.env.EDUSOB_ADMIN_PASS || 'Ab52944820@' }),
}).then((r) => r.json()).catch(() => ({}))
const session = login?.token ? `edusob_session=${login.token}` : ''

const results = []
const problems = []

for (const route of ROUTES) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 11; moto g power) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36',
    extraHTTPHeaders: session ? { cookie: session } : {},
  })
  const page = await ctx.newPage()

  // নেটওয়ার্ক ও CPU থ্রটলিং (CDP)
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,                        // ms
    downloadThroughput: (1.6 * 1024 * 1024) / 8,   // 1.6 Mbps
    uploadThroughput: (750 * 1024) / 8,            // 750 Kbps
  })
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })

  // ওয়েব-ভাইটাল সংগ্রহ
  await page.addInitScript(() => {
    window.__v = { lcp: 0, cls: 0 }
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (e.size > window.__v.lcp) window.__v.lcp = e.size ? e.startTime : 0
    }).observe({ type: 'largest-contentful-paint', buffered: true })
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__v.cls += e.value
    }).observe({ type: 'layout-shift', buffered: true })
  })

  // প্রতি রিসোর্সের আকার
  let totalBytes = 0
  let gzipBytes = 0
  let requests = 0
  const heavy = []
  // লোকাল tsx সার্ভার কমপ্রেস করে না, কিন্তু Cloudflare Pages করে (gzip/brotli)।
  // তাই প্রোডাকশন-সমতুল্য সংখ্যা পেতে প্রতিটি রেসপন্স gzip করে মাপছি।
  page.on('response', async (res) => {
    requests++
    let size = 0
    let gz = 0
    try {
      const h = res.headers()
      const alreadyEncoded = /gzip|br|deflate/i.test(h['content-encoding'] || '')
      const b = await res.body().catch(() => null)
      size = b ? b.length : parseInt(h['content-length'] || '0', 10) || 0
      gz = b ? (alreadyEncoded ? b.length : gzipSync(b, 9).length) : size
    } catch { /* কিছু রেসপন্স পড়া যায় না */ }
    totalBytes += size
    gzipBytes += gz
    const url = res.url()
    heavy.push({ url: url.replace(BASE, ''), size, gz, type: res.request().resourceType() })
  })

  let nav = {}
  try {
    const resp = await page.goto(BASE + route, { waitUntil: 'load', timeout: 60000 })
    // LCP-এর শেষ মান পেতে একটু অপেক্ষা
    await page.waitForTimeout(1500)
    const t = await page.evaluate(() => {
      const n = performance.getEntriesByType('navigation')[0] || {}
      return {
        ttfb: Math.round(n.responseStart || 0),
        domc: Math.round(n.domContentLoadedEventEnd || 0),
        load: Math.round(n.loadEventEnd || 0),
        lcp: Math.round(window.__v.lcp || 0),
        cls: Math.round((window.__v.cls || 0) * 1000) / 1000,
      }
    })
    nav = t
    if (!resp || resp.status() >= 400) console.log(`   ! ${route} → HTTP ${resp?.status()}`)
  } catch (e) {
    console.log(`   ! ${route} → ${e.message.slice(0, 50)}`)
  }
  await ctx.close()

  const kb = Math.round(totalBytes / 1024)
  const gkb = Math.round(gzipBytes / 1024)
  const flag = []
  if (nav.ttfb > TTFB_GOOD) flag.push(`TTFB ${nav.ttfb}ms`)
  if (nav.lcp > LCP_GOOD) flag.push(`LCP ${(nav.lcp / 1000).toFixed(1)}s`)
  if (nav.cls > CLS_GOOD) flag.push(`CLS ${nav.cls}`)
  if (gzipBytes > BYTES_GOOD) flag.push(`ট্রান্সফার ${gkb}KB (gzip)`)
  if (flag.length) problems.push(`${route}: ${flag.join(', ')}`)

  console.log(
    route.padEnd(20) +
    String(nav.ttfb ?? '-').padStart(7) +
    String(nav.domc ?? '-').padStart(7) +
    String(nav.load ?? '-').padStart(7) +
    String(nav.lcp ?? '-').padStart(7) +
    String(nav.cls ?? '-').padStart(7) +
    (gkb + 'KB').padStart(8) +
    String(requests).padStart(6) +
    (flag.length ? '   ⚠ ' + flag.join(', ') : ''),
  )

  results.push({ route, ...nav, kb, gkb, requests, heavy })
}

await browser.close()

// ------------------------------------------------ সবচেয়ে ভারী রিসোর্স
console.log('\n— সবচেয়ে ভারী রিসোর্স (গড়, KB) —')
const agg = new Map()
for (const r of results) {
  for (const h of r.heavy) {
    const key = h.url.length > 46 ? h.url.slice(0, 46) + '…' : h.url
    const cur = agg.get(key) || { size: 0, gz: 0, type: h.type, n: 0 }
    cur.size += h.size
    cur.gz += h.gz
    cur.n += 1
    agg.set(key, cur)
  }
}
const top = [...agg.entries()]
  .map(([url, v]) => ({ url, kb: Math.round(v.size / v.n / 1024 * 10) / 10, gkb: Math.round(v.gz / v.n / 1024 * 10) / 10, type: v.type }))
  .sort((a, b) => b.gkb - a.gkb)
  .slice(0, 12)
for (const t of top) console.log(`  ${String(t.gkb).padStart(7)} KB gzip (কাঁচা ${t.kb} KB)  ${t.type.padEnd(10)} ${t.url}`)

// ------------------------------------------------ সারাংশ
const avg = (f) => Math.round(results.reduce((s, r) => s + (r[f] || 0), 0) / results.length)
console.log('\n' + '='.repeat(74))
console.log(`রুট: ${results.length}`)
console.log(`গড় TTFB ${avg('ttfb')}ms · DOMC ${avg('domc')}ms · load ${avg('load')}ms · LCP ${avg('lcp')}ms`)
console.log(`গড় ট্রান্সফার: gzip ${Math.round(results.reduce((s, r) => s + r.gkb, 0) / results.length)}KB (কাঁচা ${Math.round(results.reduce((s, r) => s + r.kb, 0) / results.length)}KB) · রিকোয়েস্ট ${avg('requests')}`)
console.log(`থ্রেশহোল্ড ছাড়িয়েছে: ${problems.length}টি রুট`)
if (problems.length) { console.log('\n❌ উন্নতির জায়গা আছে'); for (const p of problems) console.log('   - ' + p) }
else console.log('\n✅ ALL PASS')
console.log('='.repeat(74) + '\n')
