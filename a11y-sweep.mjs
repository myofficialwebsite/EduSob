// অ্যাক্সেসিবিলিটি ও ইউজেবিলিটি অডিট — পরিমাপ-ভিত্তিক
//   * কনট্রাস্ট (WCAG AA: সাধারণ টেক্সট ৪.৫:১, বড় টেক্সট ৩:১)
//   * ট্যাপ টার্গেট ≥ ৪৪×৪৪ (মোবাইল)
//   * কীবোর্ড-অ্যাক্সেস: onclick থাকলে ফোকাসযোগ্য/role থাকতে হবে
//   * নাম/লেবেল নেই এমন বোতাম-লিংক-ইনপুট, alt-হীন ছবি
//   * হেডিং ক্রম (h1 → h2 → h3, স্কিপ নেই তো)
//   * ১২px-এর চেয়ে ছোট টেক্সট
//
// চালান: node a11y-sweep.mjs
import { chromium } from 'playwright-core'

// লোকাল ডেভ DB-এর টেস্ট পাসওয়ার্ড — প্রোডাকশনের পাসওয়ার্ড আলাদা ও রিপোতে নেই।
// প্রোডাকশনের বিপরীতে চালাতে: EDUSOB_ADMIN_PASS=... BASE=https://edusob.pages.dev node <script>
const BASE = process.env.BASE || 'http://127.0.0.1:3000'
const ROUTES = ['/', '/results', '/admission', '/scholarships', '/mcq', '/cv', '/shop',
  '/subscription', '/qpapers', '/teacher-support', '/news', '/jobs', '/notices',
  '/planner', '/cgpa', '/syllabus', '/board-challenge',
  '/dashboard', '/profile', '/wallet', '/assisted', '/admin', '/admin/shop', '/admin/cv-templates']

const li = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier: '01829486022', password: process.env.EDUSOB_ADMIN_PASS || 'Ab52944820@' }),
}).then((r) => r.json())

const AUDIT = () => {
  // ---------- রং ----------
  const parse = (c) => {
    if (!c) return null
    const m = String(c).match(/rgba?\(([^)]+)\)/)
    if (!m) return null
    const p = m[1].split(',').map((x) => parseFloat(x))
    if (p.length < 3 || p.some((n) => !Number.isFinite(n))) return null
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }
  }
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  })
  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b)
  }
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b)
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
  }
  const effBg = (el) => {
    const stack = []
    let node = el
    while (node && node.nodeType === 1) {
      const cs = getComputedStyle(node)
      const bc = parse(cs.backgroundColor)
      const hasImage = cs.backgroundImage && cs.backgroundImage !== 'none'
      if (hasImage) return { unknown: true }
      if (bc && bc.a > 0) {
        stack.unshift(bc)
        if (bc.a === 1) break
      }
      node = node.parentElement
    }
    if (!stack.length) return { color: { r: 255, g: 255, b: 255, a: 1 } }
    let base = { r: 255, g: 255, b: 255, a: 1 }
    for (const c of stack) base = over(c, base)
    return { color: base }
  }

  const out = { contrast: [], tap: [], keyboard: [], unnamed: [], noAlt: [], headings: [], tiny: [] }
  const sel = (el) => {
    let s = el.tagName.toLowerCase()
    if (el.id) s += '#' + el.id
    const cls = (el.className || '').toString().split(/\s+/).filter(Boolean).slice(0, 3)
    if (cls.length) s += '.' + cls.join('.')
    return s
  }
  const label = (el) => (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40)

  // ---------- কনট্রাস্ট + ক্ষুদ্র টেক্সট ----------
  const textNodes = []
  const walk = (node) => {
    for (const child of node.childNodes) {
      if (child.nodeType === 3) { if (child.nodeValue.trim()) textNodes.push(child); continue }
      if (child.nodeType !== 1) continue
      const cs = getComputedStyle(child)
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) continue
      walk(child)
    }
  }
  walk(document.body)

  for (const tn of textNodes) {
    const el = tn.parentElement
    if (!el) continue
    const cs = getComputedStyle(el)
    const size = parseFloat(cs.fontSize)
    const weight = parseInt(cs.fontWeight, 10) || 400
    const fg = parse(cs.color)
    if (!fg) continue
    // সাজসজ্জামূলক টেক্সট বাদ: প্রায়-স্বচ্ছ (ওয়াটারমার্ক), আউটলাইন-স্ট্রোক, aria-hidden
    if (fg.a < 0.2) continue
    if (cs.webkitTextStrokeWidth && parseFloat(cs.webkitTextStrokeWidth) > 0) continue
    if (el.closest('[aria-hidden="true"]')) continue
    const bg = effBg(el)
    if (bg.unknown) continue // গ্রেডিয়েন্ট/ছবির ওপর — অনুমান করা ঠিক হবে না
    const cr = ratio(over(fg, bg.color), bg.color)
    const large = size >= 24 || (size >= 18.66 && weight >= 700)
    const need = large ? 3 : 4.5
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) continue
    if (cr < need) {
      const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
      out.contrast.push({ el: sel(el), text: tn.nodeValue.trim().slice(0, 30), ratio: Math.round(cr * 100) / 100, need, size: Math.round(size * 10) / 10, fg: hex(over(fg, bg.color)), bg: hex(bg.color) })
    }
    if (size < 11) out.tiny.push({ el: sel(el), size: Math.round(size * 10) / 10, text: tn.nodeValue.trim().slice(0, 24) })
  }

  // ---------- ইন্টারঅ্যাকটিভ ----------
  const interactive = [...document.querySelectorAll('button, a[href], input, select, textarea, [role="button"], [onclick]')]
  for (const el of interactive) {
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') continue
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue

    // নাম আছে?
    const tag = el.tagName.toLowerCase()
    let name = (el.getAttribute('aria-label') || '').trim()
    if (!name && el.getAttribute('title')) name = el.getAttribute('title').trim()
    if (!name) name = (el.textContent || '').replace(/\s+/g, ' ').trim()
    if (!name && ['input', 'textarea', 'select'].includes(tag)) {
      const id = el.id
      const lbl = (id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null) || el.closest('label')
      name = lbl ? lbl.textContent.replace(/\s+/g, ' ').trim() : (el.getAttribute('placeholder') || '').trim()
    }
    if (!name) out.unnamed.push({ el: sel(el), tag, html: el.outerHTML.slice(0, 70) })

    // ট্যাপ টার্গেট (মোবাইল ভিউপোর্টে)
    if (window.innerWidth < 500 && tag !== 'input') {
      const inline = cs.display === 'inline' || (el.tagName === 'A' && el.closest('p, li, td') !== null)
      // WCAG 2.2 (2.5.8 Target Size Minimum, AA): ২৪×২৪ CSS px; ইনলাইন লিংক অব্যাহতি
      if (!inline && (r.height < 24 || r.width < 24)) {
        out.tap.push({ el: sel(el), text: label(el), w: Math.round(r.width), h: Math.round(r.height) })
      }
    }

    // কীবোর্ড: div/span/li-তে onclick থাকলে tabindex/role/aria দরকার
    const hasClick = el.hasAttribute('onclick') || el.getAttribute('role') === 'button'
    const nativelyFocusable = ['button', 'a', 'input', 'select', 'textarea'].includes(tag)
    if (hasClick && !nativelyFocusable) {
      const ti = el.getAttribute('tabindex')
      if (ti === null) out.keyboard.push({ el: sel(el), text: label(el) })
    }
  }

  // ---------- alt ----------
  for (const img of document.querySelectorAll('img')) {
    const cs = getComputedStyle(img)
    if (cs.display === 'none') continue
    if (!img.hasAttribute('alt')) out.noAlt.push({ el: sel(img), src: (img.getAttribute('src') || '').slice(0, 50) })
  }

  // ---------- হেডিং ক্রম ----------
  const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter((h) => getComputedStyle(h).display !== 'none')
  let prev = 0
  for (const h of hs) {
    const lvl = Number(h.tagName[1])
    if (prev && lvl > prev + 1) out.headings.push({ from: prev, to: lvl, text: (h.textContent || '').trim().slice(0, 30) })
    prev = lvl
  }

  return out
}

const b = await chromium.launch()
const all = { contrast: [], tap: [], keyboard: [], unnamed: [], noAlt: [], headings: [], tiny: [] }
for (const vp of [{ width: 1440, height: 900, name: 'desktop' }, { width: 390, height: 844, name: 'mobile' }]) {
  const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height } })
  await ctx.addCookies([{ name: 'edusob_session', value: li.token, url: BASE }])
  for (const route of ROUTES) {
    const p = await ctx.newPage()
    try {
      await p.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await p.waitForTimeout(900)
      const r = await p.evaluate(AUDIT)
      for (const k of Object.keys(all)) for (const item of r[k]) all[k].push({ ...item, route, vp: vp.name })
    } catch (e) {
      console.log(`  ! ${route} (${vp.name}): ${String(e).slice(0, 60)}`)
    }
    await p.close()
  }
  await ctx.close()
}
await b.close()

const uniq = (arr, key) => {
  const seen = new Set()
  return arr.filter((x) => { const k = key(x); if (seen.has(k)) return false; seen.add(k); return true })
}

console.log('\n===== অ্যাক্সেসিবিলিটি / ইউজেবিলিটি অডিট =====\n')
console.log(`রুট: ${ROUTES.length} × ২ ভিউপোর্ট\n`)

const c = uniq(all.contrast, (x) => x.route + x.el + x.text).sort((a, b2) => a.ratio - b2.ratio)
console.log(`🔤 কনট্রাস্ট কম (WCAG AA-এর নিচে): ${c.length}`)
for (const x of c.slice(0, 60)) console.log(`   ${String(x.ratio).padStart(5)}:1 (দরকার ${x.need})  ${x.fg} on ${x.bg}  ${x.route} [${x.vp}] ${x.el}  "${x.text}"`)

const t = uniq(all.tap, (x) => x.route + x.el + x.text)
console.log(`\n🎯 ছোট ট্যাপ টার্গেট (<৪০px, মোবাইল): ${t.length}`)
for (const x of t.slice(0, 20)) console.log(`   ${x.w}×${x.h}  ${x.route} ${x.el}  "${x.text}"`)

const k = uniq(all.keyboard, (x) => x.route + x.el + x.text)
console.log(`\n⌨️  কীবোর্ড-অ্যাক্সেস নেই (onclick কিন্তু tabindex/role নেই): ${k.length}`)
for (const x of k.slice(0, 20)) console.log(`   ${x.route} ${x.el}  "${x.text}"`)

const u = uniq(all.unnamed, (x) => x.route + x.el)
console.log(`\n🏷️  নাম/লেবেল নেই: ${u.length}`)
for (const x of u.slice(0, 20)) console.log(`   ${x.route} ${x.el}  ${x.html}`)

const na = uniq(all.noAlt, (x) => x.route + x.el)
console.log(`\n🖼️  alt নেই: ${na.length}`)
for (const x of na.slice(0, 15)) console.log(`   ${x.route} ${x.el}`)

const h = uniq(all.headings, (x) => x.route + x.text)
console.log(`\n📑 হেডিং স্কিপ: ${h.length}`)
for (const x of h.slice(0, 10)) console.log(`   ${x.route} h${x.from} → h${x.to}  "${x.text}"`)

const ti = uniq(all.tiny, (x) => x.route + x.el)
console.log(`\n🔬 ১১px-এর চেয়ে ছোট টেক্সট: ${ti.length}`)
for (const x of ti.slice(0, 15)) console.log(`   ${x.size}px  ${x.route} ${x.el}  "${x.text}"`)

console.log('\n===========================================\n')
