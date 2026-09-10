/**
 * এডুসব — ফন্ট অপটিমাইজেশন
 * Google Fonts CDN (~৮০৯ KB) → সেলফ-হোস্টেড, সাবসেটেড woff2 (~২০০ KB)
 *
 * ধাপ:
 *  1. Google Fonts CSS2 থেকে woff2 ডাউনলোড (latin + bengali সাবসেট)
 *  2. pyftsubset দিয়ে ছাঁটাই — সীমিত OpenType ফিচার (যুক্তাক্ষর অক্ষুণ্ণ রেখে)
 *  3. @font-face CSS + unicode-range তৈরি
 *
 * চালান: node scripts/optimize-fonts.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
const OUT_DIR = 'public/static/fonts'

// ব্র্যান্ড ভয়েস: Hind Siliguri (UI/বডি) + Noto Serif Bengali (হেডলাইন)
// ওজন সীমিত রাখা হয়েছে — প্রতিটি অতিরিক্ত ওজন = একটি অতিরিক্ত ফন্ট ডাউনলোড
const FAMILIES = {
  'Hind Siliguri': [400, 600, 700],
  'Noto Serif Bengali': [700],
}

// প্রয়োজনীয় ইউনিকোড: ল্যাটিন + বাংলা (U+0980–09FE) + ৳ (U+20B9) + সাধারণ বিরাম
const UNICODES = 'U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+20AC,U+20B9,U+2122,U+2190-2193,U+2212,U+2215,U+0951-0952,U+0964-0965,U+0980-09FE,U+200C-200D,U+25CC'

// যুক্তাক্ষর/মাত্রা গঠনের জন্য প্রয়োজনীয় ফিচারই রাখা হচ্ছে (--layout-features='*' ফাইল ৫× বাড়ায়)
// ⚠️ --desubroutinize ব্যবহার করবেন না — CFF ফন্টের সাইজ বিপুল বাড়িয়ে দেয়
const FEATURES = 'ccmp,nukt,akhn,rphf,blwf,half,pstf,vatu,cjct,liga,calt,kern,mark,mkmk'

const q = Object.entries(FAMILIES)
  .map(([f, w]) => `family=${encodeURIComponent(f)}:wght@${w.join(';')}`)
  .join('&')
const CSS_URL = `https://fonts.googleapis.com/css2?${q}&display=swap`

fs.mkdirSync(OUT_DIR, { recursive: true })
console.log('→ Google Fonts CSS ডাউনলোড...')
const css = execSync(`curl -s -A "${UA}" "${CSS_URL}"`, { maxBuffer: 1 << 24 }).toString()

const blocks = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([\s\S]*?)\}/g)]
const faces = blocks.map(([, subset, body]) => {
  const get = (k) => (body.match(new RegExp(k + ':\\s*([^;]+);')) || [])[1]?.trim()
  return {
    subset,
    family: get('font-family')?.replace(/['"]/g, ''),
    style: get('font-style') || 'normal',
    weight: get('font-weight'),
    url: get('src')?.match(/url\(([^)]+)\)/)?.[1],
    unicodeRange: get('unicode-range'),
  }
}).filter(f => f.url && (f.subset === 'latin' || f.subset === 'bengali'))

console.log(`→ ${faces.length} টি face ডাউনলোড হচ্ছে (latin + bengali, latin-ext বাদ)\n`)

const out = []
let before = 0, after = 0

for (const f of faces) {
  const slug = `${f.family.toLowerCase().replace(/\s+/g, '-')}-${f.weight}-${f.subset}`
  const tmp = `/tmp/edusob-${slug}.woff2`
  const final = path.join(OUT_DIR, `${slug}.woff2`)

  execSync(`curl -s -A "${UA}" -o "${tmp}" "${f.url}"`)
  const b = fs.statSync(tmp).size
  before += b

  let ok = true
  try {
    execSync(
      `pyftsubset "${tmp}" --unicodes="${UNICODES}" --layout-features='${FEATURES}' ` +
      `--flavor=woff2 --no-hinting --output-file="${final}"`,
      { stdio: 'pipe' }
    )
  } catch {
    console.log(`  ⚠️  subset ব্যর্থ: ${slug} — আসল ফাইল রাখা হচ্ছে`)
    fs.copyFileSync(tmp, final)
    ok = false
  }
  const a = fs.statSync(final).size
  after += a
  console.log(`  ${slug.padEnd(36)} ${(b / 1024).toFixed(0).padStart(4)} KB → ${(a / 1024).toFixed(0).padStart(4)} KB${ok ? '' : '  (fallback)'}`)
  out.push({ ...f, file: `/static/fonts/${slug}.woff2` })
}

const faceCss = out.map(f => `@font-face{
  font-family:'${f.family}';
  font-style:${f.style};
  font-weight:${f.weight};
  font-display:swap;
  src:url('${f.file}') format('woff2');
  unicode-range:${f.unicodeRange};
}`).join('\n')

fs.writeFileSync(path.join(OUT_DIR, 'fonts.css'), faceCss)

console.log(`\n✅ ফন্ট: ${(before / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB ` +
  `(${Math.round((1 - after / before) * 100)}% সাশ্রয়)`)
console.log(`→ ${out.length} ফাইল: ${OUT_DIR}/`)
console.log(`→ CSS: ${OUT_DIR}/fonts.css`)
