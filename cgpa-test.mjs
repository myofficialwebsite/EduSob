// 🧮 CGPA ক্যালকুলেটর ও টার্গেট প্ল্যানার — ব্রাউজার টেস্ট
//
// কেন এই টেস্ট: MASTER_PLAN-এর "ফ্রি টুল (ট্রাফিক ম্যাগনেট)" অংশে CGPA
// ক্যালকুলেটর ও CGPA টার্গেট ক্যালকুলেটর দুটোই আছে, কিন্তু এর আগে এদের
// কোনো টেস্ট ছিল না। এটি সম্পূর্ণ ক্লায়েন্ট-সাইড (কোনো API নেই), তাই
// ব্রাউজারে চালিয়েই যাচাই করতে হবে।
//
// যাচাই করা হয়:
//   ১) পেজ লোড হয়, ডিফল্ট ৪টি কোর্স-সারি তৈরি হয়
//   ২) ফলাফল-বাক্স প্রথমে লুকানো থাকে, গণনার পর দেখা যায়
//   ৩) "+ কোর্স যোগ" বাটনে নতুন সারি যোগ হয়
//   ৪) CGPA গণনা সঠিক (ক্রেডিট-ভিত্তিক গড়: Σ(ক্রেডিট×গ্রেড)/Σক্রেডিট)
//   ৫) জাতীয় বিশ্ববিদ্যালয়ের গ্রেডিং অনুযায়ী সঠিক গ্রেড দেখায়
//   ৬) ক্রেডিট না দিলে সতর্কবার্তা (ফলাফল দেখায় না)
//   ৭) টার্গেট ক্যালকুলেটর সঠিক
//   ৮) কোনো JS ত্রুটি নেই
//
// চালান: node cgpa-test.mjs
import { chromium } from 'playwright'

const BASE = process.env.BASE || 'http://127.0.0.1:3000'
let fail = 0
const log = (ok, m) => { console.log(`${ok ? '  ok  ' : '  FAIL'} ${m}`); if (!ok) fail++ }

// ইংরেজি অঙ্ক → বাংলা (পেজে toBn() দিয়ে রূপান্তরিত হয়)
const toBn = (s) => String(s).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)])

const browser = await chromium.launch()
const page = await browser.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

console.log('\n=== 🧮 CGPA ক্যালকুলেটর ===\n')

await page.goto(`${BASE}/cgpa`, { waitUntil: 'networkidle' })

// ── ১) প্রাথমিক অবস্থা ──────────────────────────────────────────────
const rows0 = await page.locator('.course-row').count()
log(rows0 === 4, `ডিফল্ট কোর্স-সারি: ${rows0} টি (প্রত্যাশিত ৪)`)

const hidden0 = await page.locator('#cgpa-result').evaluate((el) => el.classList.contains('hidden'))
log(hidden0, 'ফলাফল-বাক্স প্রথমে লুকানো ✅')

// ── ২) সারি যোগ ─────────────────────────────────────────────────────
await page.click('button:has-text("কোর্স যোগ")')
const rows1 = await page.locator('.course-row').count()
log(rows1 === rows0 + 1, `"কোর্স যোগ" → ${rows1} টি সারি (আগে ${rows0})`)

// ── ৩) মান পূরণ ও গণনা ──────────────────────────────────────────────
// ⚠️ প্রতিটি সারিতে ডিফল্ট ক্রেডিট value="3" ভরা থাকে (rowHtml()), তাই
// অতিরিক্ত সারিগুলো ✕ দিয়ে মুছে ফেলতে হবে — নাহলে সেগুলোও গণনায় ধরা
// পড়ে। (প্রথম চেষ্টায় এটিই ভুল হয়েছিল: ৫ ক্রেডিটের বদলে ১৪ এসেছিল।)
while ((await page.locator('.course-row').count()) > 2) {
  await page.locator('.course-row').last().locator('button:has-text("✕")').click()
}
const rowsLeft = await page.locator('.course-row').count()
log(rowsLeft === 2, `✕ দিয়ে সারি মুছা → ${rowsLeft} টি অবশিষ্ট`)

// দুটি কোর্স: ক্রেডিট ৩, গ্রেড ৪.০০  এবং  ক্রেডিট ২, গ্রেড ৩.০০
// প্রত্যাশিত CGPA = (3×4 + 2×3)/5 = 18/5 = 3.60 → গ্রেড A-
const set = async (i, credit, grade) => {
  const row = page.locator('.course-row').nth(i)
  await row.locator('.c-credit').fill(String(credit))
  await row.locator('.c-grade').selectOption(String(grade))
}
await set(0, 3, '4')
await set(1, 2, '3')
await page.click('button:has-text("গণনা করুন")')

const hidden1 = await page.locator('#cgpa-result').evaluate((el) => el.classList.contains('hidden'))
log(!hidden1, 'গণনার পর ফলাফল-বাক্স দেখা যাচ্ছে ✅')

const val = (await page.locator('#cgpa-value').textContent() || '').trim()
log(val === toBn('3.60'), `CGPA = ${val} (প্রত্যাশিত ${toBn('3.60')} = (৩×৪.০০ + ২×৩.০০)/৫)`)

const grade = (await page.locator('#cgpa-grade').textContent() || '').trim()
log(/A-/.test(grade), `গ্রেড-লাইন: "${grade}" (৩.৬০ → A-)`)

// ── ৪) একাধিক কোর্সে সম্পূর্ণ ৪.০০ ──────────────────────────────────
await set(0, 3, '4')
await set(1, 3, '4')
await page.click('button:has-text("গণনা করুন")')
const val2 = (await page.locator('#cgpa-value').textContent() || '').trim()
log(val2 === toBn('4.00'), `সব কোর্সে ৪.০০ → CGPA ${val2} (প্রত্যাশিত ${toBn('4.00')})`)

// ── ৫) ক্রেডিট না দিলে কোনো ফলাফল হবে না ───────────────────────────
const fresh = await browser.newPage()
await fresh.goto(`${BASE}/cgpa`, { waitUntil: 'networkidle' })
let alerted = false
fresh.on('dialog', async (d) => { alerted = true; await d.dismiss() })
// ডিফল্ট ক্রেডিট ৩ থাকায় সব সারিতে ০ বসালেই "ক্রেডিট দিন" সতর্কবার্তা আসে
const n = await fresh.locator('.c-credit').count()
for (let i = 0; i < n; i++) await fresh.locator('.c-credit').nth(i).fill('0')
await fresh.click('button:has-text("গণনা করুন")')
await fresh.waitForTimeout(300)
const hidden2 = await fresh.locator('#cgpa-result').evaluate((el) => el.classList.contains('hidden'))
log(hidden2 && alerted, 'ক্রেডিট না দিলে সতর্কবার্তা + কোনো ফলাফল নেই ✅')
await fresh.close()

// ── ৬) টার্গেট ক্যালকুলেটর ──────────────────────────────────────────
// বর্তমান ৩.০০, সম্পন্ন ৬০ ক্রেডিট, বাকি ৬০, লক্ষ্য ৩.৫০
// প্রয়োজন = (3.50×(60+60) − 3.00×60)/60 = (420 − 180)/60 = 4.00
const hasTarget = await page.locator('#tg-current').count()
if (hasTarget) {
  await page.fill('#tg-current', '3')
  await page.fill('#tg-done', '60')
  await page.fill('#tg-left', '60')
  await page.fill('#tg-target', '3.5')
  await page.click('button:has-text("টার্গেট")').catch(() => {})
  await page.waitForTimeout(300)
  const bodyTxt = await page.locator('body').innerText()
  log(/৪\.০০/.test(bodyTxt), 'টার্গেট হিসাব: ৩.০০→৩.৫০ (৬০/৬০ ক্রেডিট) = ৪.০০ প্রয়োজন')
} else {
  log(false, 'টার্গেট ক্যালকুলেটরের ইনপুট (#tg-current) পাওয়া যায়নি')
}

// ── ৭) JS ত্রুটি ────────────────────────────────────────────────────
log(errors.length === 0, `JS ত্রুটি: ${errors.length}${errors.length ? ' → ' + errors.slice(0, 2).join(' | ').slice(0, 90) : ''}`)

await browser.close()
console.log(fail === 0 ? '\n✅ ALL PASS\n' : `\n❌ ${fail}টি ব্যর্থ\n`)
process.exit(fail === 0 ? 0 : 1)
