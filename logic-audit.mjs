/**
 * লজিক অডিট (`node logic-audit.mjs`).
 *
 * UI সুন্দর হলেই চলবে না — যে হিসাবের ওপর শিক্ষার্থী ভরসা করে (CGPA) আর
 * যেখানে টাকার হিসাব (ওয়ালেট/অর্ডার), সেখানে ভুল মানে সরাসরি ক্ষতি।
 *
 * এখানে গণনাগুলো *চালিয়ে* যাচাই করা হয় — জ্ঞাত ইনপুট দিয়ে জ্ঞাত ফলাফল প্রত্যাশিত,
 * কোড পড়ে অনুমান নয়। বাংলা অঙ্ক (toBn) আসে, তাই ASCII-তে ফিরিয়ে তুলনা করা হয়।
 *
 * ব্যবহার: EDUSOB_BASE=https://edusob.pages.dev node logic-audit.mjs
 */
import { chromium } from 'playwright'

const BASE = process.env.EDUSOB_BASE || 'http://127.0.0.1:3000'

/** বাংলা অঙ্ক → ASCII */
function toAscii(s) {
  return String(s).replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)))
}

const results = []
function check(name, actual, expected) {
  const ok = String(actual).trim() === String(expected).trim()
  results.push({ name, ok, actual, expected })
  console.log(`  ${ok ? '✅' : '❌'} ${name.padEnd(34)} পাওয়া: ${actual}${ok ? '' : `   প্রত্যাশিত: ${expected}`}`)
}

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
const page = await ctx.newPage()

console.log(`\n===== লজিক অডিট — ${BASE} =====`)

/* ───────── ১. CGPA ক্যালকুলেটর (ক্রেডিট-ওয়েটেড গড়) ───────── */
console.log('\n── CGPA ক্যালকুলেটর ─────────────────────────────')

await page.goto(BASE + '/cgpa', { waitUntil: 'load', timeout: 45000 })
await page.waitForTimeout(800)

async function runCgpa(courses) {
  await page.evaluate((n) => {
    document.querySelectorAll('.course-row').forEach((r) => r.remove())
    for (let i = 0; i < n; i++) window.addRow()
  }, courses.length)
  const rows = page.locator('.course-row')
  for (let i = 0; i < courses.length; i++) {
    await rows.nth(i).locator('.c-credit').fill(String(courses[i].credit))
    await rows.nth(i).locator('.c-grade').selectOption(String(courses[i].grade))
  }
  await page.evaluate(() => window.calcCgpa())
  await page.waitForTimeout(250)
  const val = toAscii(await page.locator('#cgpa-value').textContent())
  const gradeTxt = toAscii(await page.locator('#cgpa-grade').textContent())
  const grade = (gradeTxt.match(/গ্রেড: (\S+)/) || [])[1] || '?'
  return { val, grade }
}

// ৪ ক্রেডিটে A+(4.00) + ৩ ক্রেডিটে B(3.00) → (16+9)/7 = ৩.৫৭১৪ → ৩.৫৭, গ্রেড A-
{
  const r = await runCgpa([{ credit: 4, grade: 4 }, { credit: 3, grade: 3 }])
  check('ওয়েটেড গড় (৪cr A+ + ৩cr B)', r.val, '3.57')
  check('  ↳ গ্রেড', r.grade, 'A-')
}
// একটিমাত্র A+ → ৪.০০
{
  const r = await runCgpa([{ credit: 3, grade: 4 }])
  check('সব A+ → সর্বোচ্চ', r.val, '4.00')
  check('  ↳ গ্রেড', r.grade, 'A+')
}
// সব F → ০.০০
{
  const r = await runCgpa([{ credit: 3, grade: 0 }])
  check('সব F → সর্বনিম্ন', r.val, '0.00')
  check('  ↳ গ্রেড', r.grade, 'F')
}
// সীমান্ত মান: ঠিক ৩.৭৫ → A (A- নয়)
{
  const r = await runCgpa([{ credit: 1, grade: 3.75 }])
  check('সীমান্ত ৩.৭৫ → A', r.grade, 'A')
}
// সীমান্ত মান: ঠিক ৩.৫০ → A- (B+ নয়)
{
  const r = await runCgpa([{ credit: 1, grade: 3.5 }])
  check('সীমান্ত ৩.৫০ → A-', r.grade, 'A-')
}

/* ───────── ২. CGPA টার্গেট ক্যালকুলেটর ───────── */
console.log('\n── টার্গেট ক্যালকুলেটর ──────────────────────────')

async function runTarget(cur, done, left, target) {
  await page.fill('#tg-current', String(cur))
  await page.fill('#tg-done', String(done))
  await page.fill('#tg-left', String(left))
  await page.fill('#tg-target', String(target))
  await page.evaluate(() => window.calcTarget())
  await page.waitForTimeout(250)
  return (await page.locator('#target-result').textContent()).replace(/\s+/g, ' ').trim()
}

// need = (3.5×90 − 3.0×60)/30 = ৪.৫০ → ৪.০০-এর বেশি, অসম্ভব
{
  const t = await runTarget(3.0, 60, 30, 3.5)
  check('অসম্ভব টার্গেট সনাক্ত', /সম্ভব নয়/.test(t) ? 'সম্ভব নয়' : t.slice(0, 30), 'সম্ভব নয়')
  check('  ↳ প্রয়োজনীয় GPA', /৪\.৫০/.test(t) ? '4.50' : '?', '4.50')
}
// need = (3.2×90 − 3.0×60)/30 = ৩.৬০ → সম্ভব
{
  const t = await runTarget(3.0, 60, 30, 3.2)
  check('সম্ভব টার্গেট → ৩.৬০', /৩\.৬০/.test(t) ? '3.60' : t.slice(0, 30), '3.60')
  check('  ↳ পরামর্শ (>=৩ <৩.৭৫)', /ভালোভাবে/.test(t) ? 'ভালোভাবে' : '?', 'ভালোভাবে')
}
// need = (3.0×90 − 3.9×60)/30 = ১.২০ → ইতিমধ্যে নিশ্চিত
{
  const t = await runTarget(3.9, 60, 30, 3.0)
  check('সহজ টার্গেট → ১.২০', /১\.২০/.test(t) ? '1.20' : t.slice(0, 30), '1.20')
  check('  ↳ পরামর্শ (<৩)', /সহজেই/.test(t) ? 'সহজেই' : '?', 'সহজেই')
}
// কঠিন কিন্তু সম্ভব: need >= ৩.৭৫
// (3.9×120 − 3.0×90)/30 = (468−270)/30 = ৬.৬ → অসম্ভব। তাই ৩.৮ দরকার এমন কেস:
// cur=3.0, done=90, left=10, target=3.1 → (3.1×100 − 270)/10 = ৪.০ → সীমান্ত
{
  const t = await runTarget(3.0, 90, 10, 3.1)
  check('সীমান্ত ৪.০০ → সম্ভব', /৪\.০০/.test(t) ? '4.00' : t.slice(0, 30), '4.00')
}

await browser.close()

const failed = results.filter((r) => !r.ok)
console.log(`\n${'='.repeat(52)}`)
console.log(`পরীক্ষা: ${results.length} · পাস: ${results.length - failed.length} · ব্যর্থ: ${failed.length}`)
if (failed.length) {
  console.log(`\n❌ ব্যর্থ:`)
  for (const f of failed) console.log(`   ${f.name} — পাওয়া "${f.actual}", প্রত্যাশিত "${f.expected}"`)
} else {
  console.log(`\n✅ সব হিসাব সঠিক`)
}
console.log('='.repeat(52) + '\n')
process.exit(failed.length ? 1 : 0)
