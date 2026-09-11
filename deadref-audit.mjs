/**
 * মৃত-রেফারেন্স অডিট (`node deadref-audit.mjs`) — "নীরবে নিষ্ক্রিয়" কোড খোঁজে।
 *
 * শ্রেণি: JS-এ `getElementById('X')` বা `querySelector('#X')` আছে, কিন্তু
 * সেই `id="X"` কোথাও তৈরি হয়নি। এমন কোড কোনো এরর ছাড়াই কিছুই করে না
 * (`if (el)` গার্ডের কারণে), তাই কেউ টেরই পায় না। ড্যাশবোর্ডের FAB ঠিক
 * এভাবেই ~১২ লাইন মৃত কোড হয়ে পড়ে ছিল।
 *
 * পদ্ধতি: প্রতিটি `src/**\/*.ts` ফাইলে `<script>`-এর ভেতর থেকে ID-রেফারেন্স
 * তুলে, সেই একই ফাইলের মার্কআপে `id="X"` খোঁজা হয়।
 *
 * ⚠️ সীমাবদ্ধতা: কিছু ID গতিশীলভাবে তৈরি হয় (যেমন `id="row-${id}"`) — সেগুলো
 *    "সম্ভবত গতিশীল" হিসেবে আলাদা করে দেখানো হয়, ভুল-ইতিবাচক এড়াতে।
 */
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const ROOT = 'src'

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.tsx?$/.test(p)) out.push(p)
  }
  return out
}

/** ফাইলের <script> ব্লক(গুলো) আলাদা করা */
function scriptBlocks(src) {
  const blocks = []
  const re = /<script[^>]*>([\s\S]*?)<\/script>/g
  let m
  while ((m = re.exec(src))) blocks.push({ code: m[1], at: src.slice(0, m.index).split('\n').length })
  return blocks
}

const files = walk(ROOT)
const findings = []
const dynamic = []

/* ⚠️ ID-সেটটি **গোটা src/ জুড়ে** তৈরি করতে হবে, ফাইল-ভিত্তিক নয়।
   প্রথম সংস্করণে ফাইল-ভিত্তিক করায় ৫০টিরও বেশি ভুল-ইতিবাচক এসেছিল —
   যেমন #recentUsers/#admRoleModal আসলে src/pages/admin/*.ts-এ আছে
   (অ্যাডমিনের ট্যাব <template> থেকে ক্লোন হয়), কিন্তু রেফারেন্স
   adminPages.ts-এ। মার্কআপ ও স্ক্রিপ্ট প্রায়ই আলাদা ফাইলে থাকে। */
const staticIds = new Set()
const idSource = new Map() // id → কোন ফাইলে পাওয়া গেছে
const dynPatterns = []
for (const f of files) {
  const src = readFileSync(f, 'utf8')
  for (const m of src.matchAll(/id\s*=\s*["']([A-Za-z0-9_-]+)["']/g)) {
    staticIds.add(m[1]); if (!idSource.has(m[1])) idSource.set(m[1], f)
  }
  for (const m of src.matchAll(/\.id\s*=\s*["']([A-Za-z0-9_-]+)["']/g)) staticIds.add(m[1])
  for (const m of src.matchAll(/id\s*:\s*["']([A-Za-z0-9_-]+)["']/g)) staticIds.add(m[1])
  for (const m of src.matchAll(/id\s*=\s*["']([^"']*\$\{[^"']*)["']/g)) dynPatterns.push(m[1])
}

for (const f of files) {
  const src = readFileSync(f, 'utf8')
  const blocks = scriptBlocks(src)
  if (!blocks.length) continue

  for (const b of blocks) {
    // getElementById('X')  /  querySelector('#X')  /  $('#X')
    const refs = new Map() // id -> লাইন
    for (const m of b.code.matchAll(/getElementById\(\s*["']([A-Za-z0-9_-]+)["']\s*\)/g)) {
      if (!refs.has(m[1])) refs.set(m[1], b.at + b.code.slice(0, m.index).split('\n').length - 1)
    }
    for (const m of b.code.matchAll(/(?:querySelector(?:All)?|closest|matches)\(\s*["']#([A-Za-z0-9_-]+)["']\s*\)/g)) {
      if (!refs.has(m[1])) refs.set(m[1], b.at + b.code.slice(0, m.index).split('\n').length - 1)
    }

    for (const [id, line] of refs) {
      if (staticIds.has(id)) continue
      // গতিশীলভাবে তৈরি হতে পারে? (id="row-${x}"-এর মতো প্যাটার্নের সাথে মিললে)
      const maybeDyn = dynPatterns.some((p) => p.startsWith(id) || id.startsWith(p.split('$')[0]))
      const entry = { file: f, line, id }
      ;(maybeDyn ? dynamic : findings).push(entry)
    }
  }
}

console.log(`\n===== মৃত-রেফারেন্স অডিট — ${files.length}টি .ts/.tsx ফাইল =====\n`)

if (!findings.length) {
  console.log('✅ কোনো মৃত রেফারেন্স পাওয়া যায়নি — সব getElementById/querySelector-এর\n   লক্ষ্য মার্কআপে বিদ্যমান।\n')
} else {
  console.log(`❌ ${findings.length}টি রেফারেন্সের লক্ষ্য মার্কআপে নেই:\n`)
  const byFile = {}
  for (const x of findings) (byFile[x.file] ||= []).push(x)
  for (const [file, list] of Object.entries(byFile).sort()) {
    console.log(`  ${file}`)
    for (const x of list) console.log(`     লাইন ${String(x.line).padStart(5)}  →  #${x.id}`)
  }
  console.log(`\n   ⚠️  প্রতিটি আলাদাভাবে দেখুন: এগুলো চুপচাপ কিছুই করে না (কোনো এরর নেই),\n      অথবা সেই সুবিধাটি কখনোই কাজ করেনি।\n`)
}

if (dynamic.length) {
  console.log(`ℹ️  ${dynamic.length}টি "সম্ভবত গতিশীল" (টেমপ্লেট-স্ট্রিংয়ে তৈরি) — আলাদা করে যাচাই করতে হবে:`)
  const seen = new Set()
  for (const x of dynamic) {
    const k = `${x.file}#${x.id}`
    if (seen.has(k)) continue
    seen.add(k)
    console.log(`     ${x.file}:${x.line} → #${x.id}`)
  }
  console.log()
}
console.log('='.repeat(60) + '\n')
