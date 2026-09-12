// 📷 CV ছবি কম্প্রেশন — ব্রাউজার টেস্ট
//
// কেন: CV সেভের সময় data-এর সীমা ৬০,০০০ অক্ষর। আগে ছবি সরাসরি
// readAsDataURL দিয়ে পড়া হতো (কোনো ছাঁটাই নেই), ফলে ফোনের ছবি সীমা ছাড়িয়ে
// CV সেভ হলেও আর খোলা যেত না (৫০০)। এখন ক্যানভাস দিয়ে ৪০০px-এ কম্প্রেস
// করা হয় — এই টেস্ট সেটি বাস্তবে মেপে যাচাই করে (দাবি নয়, পরিমাপ)।
//
// যাচাই:
//   • ২০০০x১৫০০ পিক্সেলের বড় PNG আপলোড → window._photo সীমার ভেতরে থাকে
//   • ফলাফল JPEG (image/jpeg) — PNG নয়
//   • গুণগত মান বজায়: ক্যানভাসের মাপ ৪০০px-এর বেশি নয়
//   • কোনো JS ত্রুটি নেই
//
// ⚠️ শুধু স্থানীয় সার্ভারে চলবে।
// চালান: ./run-test.sh cv-photo-test.mjs
import { chromium } from 'playwright'
import fs from 'fs'
import zlib from 'zlib'
import os from 'os'
import path from 'path'

const BASE = process.env.BASE || 'http://127.0.0.1:3000'
const PHONE = process.env.TEST_PHONE || '01829486022'
const PASS = process.env.TEST_PASS || 'Ab52944820@'
if (!/127\.0\.0\.1|localhost/.test(BASE)) { console.log('❌ প্রোডাকশনে চলবে না'); process.exit(1) }

let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok  ' : '  FAIL'} ${m}`); if (!ok) fail++ }

// একটি বড় বৈধ PNG তৈরি (২০০০x১৫০০) — zlib দিয়ে, কোনো বাইনারি ফাইল ছাড়াই
const crcT = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0 } return t })()
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  let crc = 0xFFFFFFFF
  for (const b of body) crc = crcT[(crc ^ b) & 0xFF] ^ (crc >>> 8)
  const cb = Buffer.alloc(4); cb.writeUInt32BE((crc ^ 0xFFFFFFFF) >>> 0)
  return Buffer.concat([len, body, cb])
}
const makePng = (w, h) => {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2
  const raw = Buffer.alloc(h * (1 + w * 3))
  for (let y = 0; y < h; y++) {
    const off = y * (1 + w * 3)
    for (let x = 0; x < w; x++) {
      raw[off + 1 + x * 3] = (x * 255 / w) | 0
      raw[off + 2 + x * 3] = (y * 255 / h) | 0
      raw[off + 3 + x * 3] = 120
    }
  }
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}
const tmpPng = path.join(os.tmpdir(), 'edusob_big_photo.png')
fs.writeFileSync(tmpPng, makePng(2000, 1500))
const origKB = Math.round(fs.statSync(tmpPng).size / 1024)
console.log(`\nপরীক্ষা-ছবি: ২০০০×১৫০০ PNG (${origKB} কিলোবাইট, ফাইল হিসেবে)\n`)

const browser = await chromium.launch()
const ctx = await browser.newContext()
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

const li = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier: PHONE, password: PASS }),
}).then((r) => r.json())
log(!!li.token, `লগইন → ${li.token ? 'সফল' : 'ব্যর্থ'}`)
await ctx.addCookies([{ name: 'edusob_session', value: li.token, url: BASE }])

await page.goto(`${BASE}/cv`, { waitUntil: 'networkidle' })
await page.waitForTimeout(900)

console.log('\n=== 📷 CV ছবি কম্প্রেশন ===\n')
const input = page.locator('#photo-file')
log(await input.count() > 0, `ছবি-আপলোড ইনপুট আছে (#photo-file)`)

await input.setInputFiles(tmpPng)
await page.waitForTimeout(1800)

const res = await page.evaluate(() => {
  const p = window._photo || ''
  return { len: p.length, head: p.slice(0, 24), has: !!p }
})
log(res.has, 'window._photo সেট হয়েছে')
log(res.head.startsWith('data:image/jpeg'), `ফরম্যাট: ${res.head}… (প্রত্যাশিত JPEG)`)

const kb = Math.round(res.len / 1024)
log(res.len > 0 && res.len < 60000,
  `কম্প্রেসড আকার: ${res.len.toLocaleString()} অক্ষর (${kb} কিলোবাইট) — ৬০,০০০ সীমার ${res.len < 60000 ? 'ভেতরে ✅' : 'বাইরে ❌'}`)

// প্রসারিত ছবির তুলনা
const ratio = ((res.len / (origKB * 1024)) * 100).toFixed(1)
console.log(`  ↳ মূল PNG-এর ${ratio}% (সঙ্কুচিত)`)

// ক্যানভাসের প্রকৃত পিক্সেল-মাপ যাচাই (৪০০px সীমা)
const dim = await page.evaluate(() => new Promise((resolve) => {
  const img = new Image()
  img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
  img.onerror = () => resolve(null)
  img.src = window._photo
}))
if (dim) {
  log(dim.w <= 400 && dim.h <= 400, `কম্প্রেসড মাপ: ${dim.w}×${dim.h} (সীমা ৪০০×৪০০)`)
} else {
  log(false, 'কম্প্রেসড ছবির মাপ পড়া যায়নি')
}

log(errors.length === 0, `JS ত্রুটি: ${errors.length}${errors.length ? ' → ' + errors.slice(0, 2).join(' | ').slice(0, 90) : ''}`)

await browser.close()
try { fs.unlinkSync(tmpPng) } catch {}
console.log(fail === 0 ? '\n✅ ALL PASS\n' : `\n❌ ${fail}টি ব্যর্থ\n`)
process.exit(fail === 0 ? 0 : 1)
