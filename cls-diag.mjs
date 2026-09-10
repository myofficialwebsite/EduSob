import { chromium } from 'playwright'
const BASE = 'http://127.0.0.1:3000'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
const p = await ctx.newPage()
const cdp = await ctx.newCDPSession(p)
await cdp.send('Network.enable')
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 })
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
await p.addInitScript(() => {
  window.__shifts = []
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      if (e.hadRecentInput) continue
      window.__shifts.push({
        value: Math.round(e.value * 1000) / 1000,
        time: Math.round(e.startTime),
        sources: (e.sources || []).map((s) => {
          const n = s.node
          const tag = n && n.tagName ? n.tagName.toLowerCase() : '?'
          const cls = (n && n.className && typeof n.className === 'string') ? '.' + n.className.trim().split(/\s+/).slice(0, 2).join('.') : ''
          const txt = (n && n.textContent || '').trim().slice(0, 24)
          const r = (x) => x ? `y=${Math.round(x.y)} h=${Math.round(x.height)}` : ''
          return `${tag}${cls} "${txt}"  ${r(s.previousRect)} → ${r(s.currentRect)}`
        }),
      })
    }
  }).observe({ type: 'layout-shift', buffered: true })
})
await p.goto(BASE + '/board-challenge', { waitUntil: 'load', timeout: 60000 })
await p.waitForTimeout(3000)
const out = await p.evaluate(() => ({
  shifts: window.__shifts,
  fonts: performance.getEntriesByType('resource')
    .filter((r) => /\.woff2|\.css|\.webp|\.jpg/.test(r.name))
    .map((r) => ({ name: r.name.split('/').pop(), start: Math.round(r.startTime), end: Math.round(r.responseEnd) })),
  fontsReady: document.fonts ? document.fonts.status : '?',
  loaded: document.fonts ? [...document.fonts].map((f) => `${f.family} ${f.weight} ${f.status}`) : [],
}))
console.log('CLS শিফট:')
for (const s of out.shifts.filter((x) => x.value >= 0.003)) {
  console.log(`  ${s.value} @${s.time}ms`)
  for (const src of s.sources) console.log('     ↳', src)
}
console.log('\nফন্ট/রিসোর্স টাইমিং (ms):')
for (const f of out.fonts) console.log(`  ${String(f.end).padStart(5)}  ${f.name}`)
console.log('\ndocument.fonts.status:', out.fontsReady)
for (const f of out.loaded) console.log('  ', f)
await b.close()
