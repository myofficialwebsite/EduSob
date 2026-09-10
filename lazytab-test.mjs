// অ্যাডমিন ট্যাব লেজি-হাইড্রেশন: DOM নোড কমছে কি না + সব ট্যাব এখনও কাজ করে কি না
import { chromium } from 'playwright-core'
// লোকাল ডেভ DB-এর টেস্ট পাসওয়ার্ড — প্রোডাকশনের পাসওয়ার্ড আলাদা ও রিপোতে নেই।
// প্রোডাকশনের বিপরীতে চালাতে: EDUSOB_ADMIN_PASS=... BASE=https://edusob.pages.dev node <script>
const BASE = process.env.BASE || 'http://127.0.0.1:3000'
let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok ' : '  FAIL'} ${m}`); if (!ok) fail++ }

const li = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier: '01829486022', password: process.env.EDUSOB_ADMIN_PASS || 'Ab52944820@' }),
}).then((r) => r.json())
log(!!li.token, 'admin login')

const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
await ctx.addCookies([{ name: 'edusob_session', value: li.token, url: BASE }])
const p = await ctx.newPage()
const errs = []
p.on('pageerror', (e) => errs.push(String(e)))
p.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()) })

const t0 = Date.now()
await p.goto(`${BASE}/admin`, { waitUntil: 'networkidle' })
await p.waitForTimeout(2000)
const loadMs = Date.now() - t0

const initial = await p.evaluate(() => ({
  nodes: document.getElementsByTagName('*').length,
  panesInDom: document.querySelectorAll('.tab-pane').length,
  templates: document.querySelectorAll('template[id^="tpl-tab-"]').length,
  visiblePanes: [...document.querySelectorAll('.tab-pane')].filter((e) => !e.classList.contains('hidden')).length,
}))
console.log('\n[initial]', JSON.stringify(initial), `load=${loadMs}ms`)
log(initial.nodes < 1128, `DOM nodes reduced: ${initial.nodes} (was 1128)`)
log(initial.panesInDom === 1, `only the active pane is in the DOM (${initial.panesInDom})`)
log(initial.templates >= 15, `inactive panes parked as <template> (${initial.templates})`)
log(initial.visiblePanes === 1, 'exactly one pane visible')

// সব ট্যাবে ঘুরে দেখি — প্রতিটি হাইড্রেট হয় ও দেখায়
const tabIds = await p.evaluate(() =>
  [...document.querySelectorAll('template[id^="tpl-tab-"]')].map((t) => t.id.replace('tpl-tab-', '')))
console.log('\n[tabs to visit]', tabIds.join(', '))

const broken = []
for (const id of tabIds) {
  const r = await p.evaluate((tid) => {
    try {
      if (typeof window.navigateToTab === 'function') window.navigateToTab(tid)
      else if (typeof window.switchAdminTab === 'function') window.switchAdminTab(tid)
      else return 'no-switch-fn'
      const el = document.getElementById('tab-' + tid)
      if (!el) return 'missing'
      if (el.classList.contains('hidden')) return 'still-hidden'
      return 'ok'
    } catch (e) { return 'err:' + e.message }
  }, id)
  await p.waitForTimeout(320)
  if (r !== 'ok') broken.push(`${id}=${r}`)
}
log(broken.length === 0, `all ${tabIds.length} tabs hydrate and display ${broken.length ? JSON.stringify(broken) : ''}`)

const after = await p.evaluate(() => document.getElementsByTagName('*').length)
console.log(`\n[nodes after visiting all tabs] ${after}`)
log(errs.length === 0, `no JS errors (${errs.length}) ${errs.slice(0, 2).join(' | ')}`)

await b.close()
console.log(`\n${fail === 0 ? '✅ ALL PASS' : `❌ ${fail} FAILED`}`)
process.exit(fail === 0 ? 0 : 1)
