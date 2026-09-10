/**
 * এডুসব — FontAwesome অপটিমাইজেশন
 * পুরো FA CDN (~২৫০ KB ফন্ট + ~১০০ KB CSS) → শুধু ব্যবহৃত ~২০০টি আইকনের সাবসেট (~২০ KB)
 *
 * ধাপ:
 *  1. src/ ও public/ স্ক্যান করে ব্যবহৃত `fa-<name>` ক্লাস বের করা
 *  2. FA metadata (icons.json) থেকে প্রতিটি নামের codepoint + স্টাইল (solid/regular/brands) ম্যাপ
 *  3. pyftsubset দিয়ে প্রতি স্টাইলের TTF ছাঁটাই → woff2
 *  4. প্রয়োজনীয় `.fa-*` ক্লাসসহ CSS তৈরি
 *
 * চালান: node scripts/optimize-icons.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const FA = 'node_modules/@fortawesome/fontawesome-free'
const OUT = 'public/static/icons-fa'
fs.mkdirSync(OUT, { recursive: true })

// ---------- ১. ব্যবহৃত ক্লাস স্ক্যান ----------
const used = new Set()
function scan(dir) {
  if (!fs.existsSync(dir)) return
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) { if (!['node_modules', '.git'].includes(e.name)) scan(p); continue }
    if (!/\.(ts|tsx|html|css)$/.test(e.name)) continue
    const txt = fs.readFileSync(p, 'utf8')
    for (const m of txt.matchAll(/\bfab?[sr]?\s+fa-[a-z0-9-]+/g)) used.add(m[0])
    for (const m of txt.matchAll(/["'`]fa[srb]?\s+fa-[a-z0-9-]+/g)) used.add(m[0].slice(1))
  }
}
scan('src'); scan('public/samples')
console.log(`→ ${used.size} টি ব্যবহৃত আইকন ক্লাস পাওয়া গেছে`)

// ---------- ২. codepoint ম্যাপ ----------
const icons = JSON.parse(fs.readFileSync('/tmp/fa-icons.json', 'utf8'))
// FA4 shims (shims.yml) + সাধারণ FA5→FA6 নাম-বদল — পুরোনো ক্লাস যাতে কাজ করে
const shims = JSON.parse(fs.readFileSync('/tmp/fa-shims.json', 'utf8'))
const RENAMES = {
  'check-circle': 'circle-check', 'times-circle': 'circle-xmark', 'check-square': 'square-check',
  'external-link-alt': 'arrow-up-right-from-square', 'external-link': 'arrow-up-right-from-square',
  search: 'magnifying-glass', times: 'xmark', 'hands-helping': 'handshake-angle',
  edit: 'pen-to-square', magic: 'wand-magic-sparkles', 'comments-question': 'comment-dots',
  'comment-question': 'comment-dots', cog: 'gear', 'trash-alt': 'trash-can',
  'arrow-alt-circle-right': 'circle-right', 'long-arrow-alt-right': 'arrow-right',
  'file-alt': 'file-lines', 'map-marker-alt': 'location-dot', 'envelope-open-text': 'envelope-open-text',
  // FA6 Free-এ নেই (Pro-only / FA5) → কাছাকাছি ফ্রি বিকল্প
  sparkles: 'wand-sparkles', tools: 'screwdriver-wrench', 'shield-check': 'shield-halved',
  'phone-alt': 'phone-flip', 'telegram-plane': 'telegram', 'shopping-basket': 'basket-shopping',
  'clipboard-list-check': 'clipboard-check', history: 'clock-rotate-left',
  university: 'building-columns', 'plus-circle': 'circle-plus',
}
const FALLBACK = 'circle'
function resolveIcon(name) {
  if (icons[name]) return { meta: icons[name], name }
  const shim = shims[name]
  if (shim?.name && icons[shim.name]) return { meta: icons[shim.name], name: shim.name, prefix: shim.prefix }
  const renamed = RENAMES[name]
  if (renamed && icons[renamed]) return { meta: icons[renamed], name: renamed }
  console.log(`     ↳ '${name}' → '${FALLBACK}' (ফ্রি সেটে নেই)`)
  return { meta: icons[FALLBACK], name: FALLBACK }
}
const STYLE_FONT = { solid: 'fa-solid-900', regular: 'fa-regular-400', brands: 'fa-brands-400' }
const byStyle = { solid: new Map(), regular: new Map(), brands: new Map() }
const missing = []

for (const token of used) {
  const m = token.match(/^(fa[srb]?)\s+fa-([a-z0-9-]+)$/)
  if (!m) continue
  const style = { fas: 'solid', fa: 'solid', far: 'regular', fab: 'brands' }[m[1]] || 'solid'
  const name = m[2]
  const resolved = resolveIcon(name)
  if (!resolved) { missing.push(`${style}/${name}`); continue }
  const styles = resolved.meta.styles || []
  // স্টাইল উপলব্ধ না হলে যেকোনো উপলব্ধ স্টাইল ব্যবহার
  const target = resolved.prefix === 'far' && styles.includes('regular') ? 'regular'
    : styles.includes(style) ? style : styles[0]
  const cp = resolved.meta.unicode
  if (cp && byStyle[target]) {
    byStyle[target].set(name, cp)          // পুরোনো নামেও ক্লাস থাকবে
    byStyle[target].set(resolved.name, cp) // নতুন নামেও
  }
}
if (missing.length) console.log(`  ⚠️  রিজলভ করা যায়নি (${missing.length}): ${missing.join(', ')}`)

// সবসময় দরকারি — ডায়নামিকভাবে তৈরি হতে পারে
const ALWAYS = ['spinner', 'circle-check', 'circle-xmark', 'xmark', 'chevron-down', 'chevron-right', 'magnifying-glass']
for (const n of ALWAYS) {
  const meta = icons[n]; if (!meta) continue
  for (const s of (meta.styles || [])) if (byStyle[s] && !byStyle[s].has(n)) byStyle[s].set(n, meta.unicode)
}

let totalBefore = 0, totalAfter = 0
const cssBlocks = []

for (const [style, map] of Object.entries(byStyle)) {
  if (!map.size) continue
  const font = STYLE_FONT[style]
  const src = path.join(FA, 'webfonts', `${font}.ttf`)
  const dst = path.join(OUT, `${font}.woff2`)
  const codepoints = [...map.values()].map(cp => `U+${cp.toUpperCase()}`).join(',')
  const unicodes = `U+0020,${codepoints}`

  const before = fs.statSync(src).size
  totalBefore += before
  execSync(
    `pyftsubset "${src}" --unicodes="${unicodes}" --layout-features='' ` +
    `--flavor=woff2 --no-hinting --output-file="${dst}"`,
    { stdio: 'pipe' }
  )
  const after = fs.statSync(dst).size
  totalAfter += after
  console.log(`  ${font.padEnd(18)} ${String(map.size).padStart(3)} আইকন   ${(before / 1024).toFixed(0).padStart(4)} KB → ${(after / 1024).toFixed(0).padStart(3)} KB`)

  const classes = [...map.entries()]
    .map(([name, cp]) => `.fa-${name}::before{content:"\\${cp}"}`)
    .join('')

  cssBlocks.push(`@font-face{
  font-family:'Font Awesome 6 ${style === 'brands' ? 'Brands' : 'Free'}';
  font-style:normal;font-weight:${style === 'brands' ? 400 : style === 'solid' ? 900 : 400};
  font-display:block;src:url('/static/icons-fa/${font}.woff2') format('woff2');
}
.fa-${style === 'brands' ? 'brands' : style === 'solid' ? 'solid' : 'regular'},
.fa${style === 'brands' ? 'b' : style === 'solid' ? 's' : 'r'}{
  font-family:'Font Awesome 6 ${style === 'brands' ? 'Brands' : 'Free'}';font-weight:${style === 'brands' ? 400 : style === 'solid' ? 900 : 400};
}
${classes}`)
}

// বেস ক্লাস (FA core)
const base = `
.fa,.fas,.far,.fab,.fa-solid,.fa-regular,.fa-brands{
  -moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;
  display:var(--fa-display,inline-block);font-style:normal;font-variant:normal;
  line-height:1;text-rendering:auto;
}
.fa-2x{font-size:2em}.fa-lg{font-size:1.25em}.fa-sm{font-size:.875em}.fa-xs{font-size:.75em}
.fa-spin{animation:fa-spin 2s infinite linear}
@keyframes fa-spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
.fa-pull-left{float:left}.fa-pull-right{float:right}
`

fs.writeFileSync(path.join(OUT, 'fontawesome.css'), base + cssBlocks.join('\n'))

console.log(`\n✅ FontAwesome: ${(totalBefore / 1024).toFixed(0)} KB (TTF সোর্স) → ${(totalAfter / 1024).toFixed(0)} KB (woff2, সাবসেট)`)
console.log(`→ ${OUT}/fontawesome.css`)
