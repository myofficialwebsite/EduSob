import { chromium } from 'playwright-core'

const BASE = process.env.BASE || 'http://localhost:3000'
const TOKEN = await fetch(BASE + '/api/auth/login', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier: '01829486022', password: 'Ab52944820@' }),
}).then((r) => r.json()).then((d) => d.token)
if (!TOKEN) { console.error('admin login failed'); process.exit(1) }

const routes = ['/', '/results', '/admission', '/scholarships', '/mcq', '/cv', '/shop',
  '/subscription', '/qpapers', '/teacher-support', '/news', '/jobs', '/notices',
  '/planner', '/cgpa', '/syllabus', '/board-challenge',
  '/dashboard', '/profile', '/wallet', '/assisted', '/admin', '/admin/shop', '/admin/cv-templates']

const browser = await chromium.launch({ args: ['--no-sandbox'] })
const rows = []
const issues = []

for (const path of routes) {
  for (const [vp, w, h] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: h }, isMobile: vp === 'mobile', hasTouch: vp === 'mobile',
    })
    await ctx.addCookies([{ name: 'edusob_session', value: TOKEN, url: BASE, sameSite: 'Lax', secure: false }])
    const page = await ctx.newPage()
    const errs = []
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)) })
    page.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0, 120)))
    page.on('requestfailed', r => {
      const u = r.url()
      if (u.startsWith(BASE)) errs.push('REQFAIL ' + u.replace(BASE, '').slice(0, 90))
    })
    let bytes = 0, ms = 0
    const t0 = Date.now()
    try {
      const resp = await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 })
      bytes = (await resp.body()).length
      ms = Date.now() - t0
      await page.waitForTimeout(1200)
      const m = await page.evaluate(() => {
        const d = document.documentElement
        const imgs = [...document.querySelectorAll('img')]
        return {
          overflow: d.scrollWidth - d.clientWidth,
          nodes: document.querySelectorAll('*').length,
          brokenImgs: imgs.filter(i => i.complete && i.naturalWidth === 0).length,
          h1: document.querySelectorAll('h1').length,
          title: document.title.slice(0, 40),
          metaDesc: !!document.querySelector('meta[name=description]'),
        }
      })
      rows.push({ path, vp, kb: (bytes / 1024).toFixed(0), ms, nodes: m.nodes, ovf: m.overflow, h1: m.h1, broken: m.brokenImgs })
      if (m.overflow > 2) issues.push(`⚠️  H-OVERFLOW ${path} [${vp}] +${m.overflow}px`)
      if (m.h1 !== 1) issues.push(`ℹ️  H1 count ${m.h1} on ${path} [${vp}]`)
      if (m.broken > 0) issues.push(`🖼️  broken imgs ${m.broken} on ${path} [${vp}]`)
    } catch (e) {
      rows.push({ path, vp, kb: '-', ms, nodes: '-', ovf: '-', h1: '-', broken: '-' })
      issues.push(`❌ NAVFAIL ${path} [${vp}] ${String(e).slice(0, 80)}`)
    }
    const uniq = [...new Set(errs)]
    if (uniq.length) issues.push(`JS ${path} [${vp}]:\n     ` + uniq.slice(0, 4).join('\n     '))
    await ctx.close()
  }
}
await browser.close()

const pad = (s, n) => String(s).padEnd(n)
console.log(pad('ROUTE', 22) + pad('VP', 9) + pad('HTML KB', 9) + pad('ms', 7) + pad('DOM', 7) + pad('Ovf', 6) + pad('H1', 4) + 'BrokenImg')
console.log('-'.repeat(80))
for (const r of rows) {
  console.log(pad(r.path, 22) + pad(r.vp, 9) + pad(r.kb, 9) + pad(r.ms, 7) + pad(r.nodes, 7) + pad(r.ovf, 6) + pad(r.h1, 4) + r.broken)
}
console.log('\n===== ISSUES =====')
console.log(issues.length ? issues.join('\n') : 'none')
