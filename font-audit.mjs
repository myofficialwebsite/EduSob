/**
 * বাংলা ফন্ট রেন্ডারিং অডিট (`node font-audit.mjs`).
 *
 * CSS দেখলে বোঝা যায় না বাংলা আসলে **কোন ফন্টে** ছাপা হচ্ছে — ফন্ট স্ট্যাকে
 * প্রথম ফন্টে বাংলা গ্লিফ না থাকলে ব্রাউজার চুপচাপ পরেরটায় যায়। ফলে একই শব্দের
 * ভেতরেই দুই ফন্ট মিশে যায় — চোখে পড়ে "ফন্ট ভাঙা" বলে।
 *
 * এখানে Chrome DevTools Protocol-এর `CSS.getPlatformFontsForNode` ব্যবহার করা
 * হয়েছে, যা সরাসরি বলে দেয় প্রতিটি নোড বাস্তবে কোন ফন্ট ব্যবহার করেছে এবং
 * কয়টি গ্লিফ সেখান থেকে এসেছে।
 *
 * একটি নোডে ২+ ফন্ট ব্যবহৃত হলে সেটি সমস্যা — মিশ্র রেন্ডারিংয়ের লক্ষণ।
 *
 * ব্যবহার: EDUSOB_BASE=https://edusob.pages.dev node font-audit.mjs
 */
import { chromium } from 'playwright'

const BASE = process.env.EDUSOB_BASE || 'http://127.0.0.1:3000'
const ROUTES = (process.env.EDUSOB_ROUTES || '/,/refund,/cgpa,/shop,/subscription').split(',')

/** বাংলা অক্ষর আছে কি */
const hasBn = (s) => /[\u0980-\u09FF]/.test(s || '')

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await ctx.newPage()
const client = await ctx.newCDPSession(page)
await client.send('DOM.enable')
await client.send('CSS.enable')

let totalNodes = 0
let mixedNodes = 0
const familyTally = new Map() // ফন্ট → কত গ্লিফ
const problems = []

console.log(`\n===== বাংলা ফন্ট রেন্ডারিং অডিট — ${BASE} =====`)

for (const route of ROUTES) {
  await page.goto(BASE + route, { waitUntil: 'load', timeout: 45000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1200) // ফন্ট লোডের জন্য অপেক্ষা

  const { root } = await client.send('DOM.getDocument', { depth: 0 })
  const { nodeIds } = await client.send('DOM.querySelectorAll', {
    nodeId: root.nodeId,
    selector: 'h1,h2,h3,p,a,button,li,span,td,th,label,summary',
  })

  const routeFams = new Map()
  let routeMixed = []

  for (const nodeId of nodeIds) {
    let html = ''
    try {
      const { outerHTML } = await client.send('DOM.getOuterHTML', { nodeId })
      html = outerHTML || ''
    } catch { continue }
    if (!hasBn(html)) continue

    let fonts = []
    try {
      const r = await client.send('CSS.getPlatformFontsForNode', { nodeId })
      fonts = r.fonts || []
    } catch { continue }
    if (!fonts.length) continue

    totalNodes++
    for (const f of fonts) {
      if (!f.glyphCount) continue
      routeFams.set(f.familyName, (routeFams.get(f.familyName) || 0) + f.glyphCount)
      familyTally.set(f.familyName, (familyTally.get(f.familyName) || 0) + f.glyphCount)
    }

    // একাধিক ফন্ট → মিশ্র রেন্ডারিং
    const used = fonts.filter((f) => f.glyphCount > 0)
    if (used.length > 1) {
      mixedNodes++
      const text = html.replace(/<[^>]*>/g, '').trim().slice(0, 42)
      routeMixed.push({ text, fonts: used.map((f) => `${f.familyName}(${f.glyphCount})`).join(' + ') })
    }
  }

  const top = [...routeFams.entries()].sort((a, b) => b[1] - a[1])
  console.log(`\n── ${route}`)
  if (!top.length) console.log('   (বাংলা টেক্সট পাওয়া যায়নি)')
  for (const [fam, n] of top.slice(0, 5)) console.log(`   ${String(n).padStart(6)} গ্লিফ  ${fam}`)
  for (const m of routeMixed.slice(0, 4)) {
    console.log(`   ⚠️  মিশ্র: ${m.fonts}  →  "${m.text}"`)
    problems.push({ route, ...m })
  }
  if (routeMixed.length > 4) console.log(`   ⚠️  আরও ${routeMixed.length - 4}টি মিশ্র নোড`)
}

await browser.close()

console.log(`\n${'='.repeat(56)}`)
console.log('সারাংশ — সবচেয়ে বেশি ব্যবহৃত ফন্ট:')
for (const [fam, n] of [...familyTally.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`   ${String(n).padStart(7)} গ্লিফ  ${fam}`)
}
console.log(`\nবাংলা নোড: ${totalNodes} · মিশ্র-ফন্ট নোড: ${mixedNodes}`)
if (mixedNodes === 0) console.log('\n✅ কোথাও একাধিক ফন্ট মিশে রেন্ডার হচ্ছে না')
else console.log(`\n⚠️  ${mixedNodes}টি নোডে একাধিক ফন্ট মিশে রেন্ডার হচ্ছে`)
console.log('='.repeat(56) + '\n')
