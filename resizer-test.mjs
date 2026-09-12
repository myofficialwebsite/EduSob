// 🖼️ ছবি/স্বাক্ষর অটো-রিসাইজার — ব্রাউজার টেস্ট
//
// কেন এই টেস্ট: MASTER_PLAN: "ছবি/স্বাক্ষর অটো-রিসাইজ: প্রতিটি আবেদনের
// নির্ধারিত সাইজ (যেমন 300x300px, 300x80px) সফটওয়্যার জানে → এক ক্লিকে
// রিসাইজ+ডাউনলোড"। সম্পূর্ণ ক্লায়েন্ট-সাইড (ক্যানভাস), তাই ব্রাউজার ছাড়া
// যাচাই করা যায় না। আগে কোনো টেস্ট ছিল না।
//
// যাচাই করা হয়:
//   ১) প্রোফাইল পেজে রিসাইজ-নিয়ন্ত্রণ আছে (#cw, #ch, #ctype)
//   ২) অবৈধ সাইজ (খুব ছোট/বড়) → সতর্কবার্তা, কোনো ডাউনলোড নেই
//   ৩) ছবি না থাকলে → "আগে ছবি আপলোড করুন"
//   ৪) বাস্তব ছবি আপলোড → রিসাইজ → ডাউনলোড হয়, নাম ও আকার সঠিক
//   ৫) কোনো JS ত্রুটি নেই
//
// চালান: ./run-test.sh resizer-test.mjs
import { chromium } from 'playwright'
import fs from 'fs'
import os from 'os'
import path from 'path'

const BASE = process.env.BASE || 'http://127.0.0.1:3000'
const PHONE = process.env.TEST_PHONE || '01829486022'
const PASS = process.env.TEST_PASS || 'Ab52944820@'
let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok  ' : '  FAIL'} ${m}`); if (!ok) fail++ }

// একটি বৈধ পরীক্ষা-ছবি তৈরি (৪০০×৩০০ লাল PNG) — zlib দিয়ে বানানো,
// কোনো বাইনারি ফাইল রিপোজিটরিতে রাখতে হয় না।
import zlib from 'zlib'
const tmpPng = path.join(os.tmpdir(), 'edusob_test_photo.png')
const crcTable = (() => {
  const t = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
const pngChunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  let crc = 0xFFFFFFFF
  for (const b of body) crc = crcTable[(crc ^ b) & 0xFF] ^ (crc >>> 8)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE((crc ^ 0xFFFFFFFF) >>> 0)
  return Buffer.concat([len, body, crcBuf])
}
const makePng = (w, h) => {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8; ihdr[9] = 2   // ৮-বিট, ট্রু-কালার RGB
  const raw = Buffer.alloc(h * (1 + w * 3))
  for (let y = 0; y < h; y++) {
    const off = y * (1 + w * 3)
    for (let x = 0; x < w; x++) {
      raw[off + 1 + x * 3] = 200
      raw[off + 2 + x * 3] = 40
      raw[off + 3 + x * 3] = 40
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}
fs.writeFileSync(tmpPng, makePng(400, 300))

const browser = await chromium.launch()
const ctx = await browser.newContext({ acceptDownloads: true })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

console.log('\n=== 🖼️ ছবি/স্বাক্ষর রিসাইজার ===\n')

// ── লগইন (কুকি সরাসরি) ──────────────────────────────────────────────
const li = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier: PHONE, password: PASS }),
}).then((r) => r.json())
log(!!li.token, `লগইন → ${li.token ? 'সফল' : 'ব্যর্থ'}`)
await ctx.addCookies([{ name: 'edusob_session', value: li.token, url: BASE }])

await page.goto(`${BASE}/profile`, { waitUntil: 'networkidle' })

// ── ১) নিয়ন্ত্রণ আছে ────────────────────────────────────────────────
const hasW = await page.locator('#cw').count()
const hasH = await page.locator('#ch').count()
const hasT = await page.locator('#ctype').count()
log(hasW > 0 && hasH > 0 && hasT > 0,
  `রিসাইজ-নিয়ন্ত্রণ: #cw=${hasW} #ch=${hasH} #ctype=${hasT}`)

// ── ২) অবৈধ সাইজ → সতর্কবার্তা, কোনো ডাউনলোড নেই ────────────────────
let alerted = false
let alertMsg = ''
page.on('dialog', async (d) => { alerted = true; alertMsg = d.message(); await d.dismiss() })

const bad = async (w, h, label) => {
  alerted = false
  await page.fill('#cw', String(w))
  await page.fill('#ch', String(h))
  await page.evaluate(() => window.customResize && window.customResize())
  await page.waitForTimeout(150)
  log(alerted, `অবৈধ সাইজ ${label} (${w}×${h}) → সতর্কবার্তা: "${alertMsg.slice(0, 30)}"`)
}
await bad(5, 5, 'খুব ছোট')
await bad(5000, 5000, 'খুব বড়')
await bad(0, 300, 'শূন্য')

// ── ৩) ছবি না থাকলে ─────────────────────────────────────────────────
alerted = false
await page.fill('#cw', '300')
await page.fill('#ch', '300')
await page.evaluate(() => window.resizeAndDownload && window.resizeAndDownload('photo', 300, 300))
await page.waitForTimeout(300)
log(alerted, `ছবি ছাড়া রিসাইজ → সতর্কবার্তা: "${alertMsg.slice(0, 32)}"`)

// ── ৪) বাস্তব ছবি → রিসাইজ → ডাউনলোড ────────────────────────────────
const fileInputs = await page.locator('input[type="file"]').count()
log(fileInputs > 0, `ছবি আপলোডের ইনপুট আছে: ${fileInputs} টি`)

if (fileInputs > 0) {
  try {
    // ⚠️ photoData/signData স্কোপ-ভেতরের `let` (profile.ts:166) — window-এর
    //    প্রপার্টি নয়, তাই সরাসরি পড়া যায় না। বদলে #photoPreview-এর <img>
    //    যাচাই করা হয় (আপলোড হ্যান্ডলার সেখানে data-URI বসায়)।
    await page.locator('#photoInput').setInputFiles(tmpPng)
    await page.waitForTimeout(900)
    const imgSrc = await page.locator('#photoPreview img').first().getAttribute('src').catch(() => null)
    const hasData = !!imgSrc && imgSrc.startsWith('data:image')
    log(hasData, `আপলোড সফল — প্রিভিউতে ছবি এসেছে (${imgSrc ? imgSrc.slice(0, 24) + '…' : 'নেই'})`)

    if (hasData) {
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 8000 }).catch(() => null),
        page.evaluate(() => window.resizeAndDownload('photo', 300, 300)),
      ])
      if (download) {
        const name = download.suggestedFilename()
        log(/300x300/.test(name), `ডাউনলোড: ${name} (নামে 300x300 আছে)`)
        const p = await download.path()
        if (p) {
          const size = fs.statSync(p).size
          log(size > 100, `ডাউনলোডের আকার: ${size} বাইট (ফাঁকা নয়)`)
        }
      } else {
        log(false, 'ডাউনলোড শুরু হয়নি')
      }
    }
  } catch (e) {
    log(false, `আপলোড/রিসাইজে ব্যতিক্রম: ${String(e.message).slice(0, 70)}`)
  }
}

// ── ৫) JS ত্রুটি ────────────────────────────────────────────────────
log(errors.length === 0, `JS ত্রুটি: ${errors.length}${errors.length ? ' → ' + errors.slice(0, 2).join(' | ').slice(0, 90) : ''}`)

await browser.close()
try { fs.unlinkSync(tmpPng) } catch {}
console.log(fail === 0 ? '\n✅ ALL PASS\n' : `\n❌ ${fail}টি ব্যর্থ\n`)
process.exit(fail === 0 ? 0 : 1)
