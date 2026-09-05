// এডুসব — ধর্মভিত্তিক সন সিস্টেম (সার্ভার-সাইড, নির্ভুল গণনা)

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
export function toBn(n: number | string): string {
  return String(n).replace(/\d/g, d => BN_DIGITS[+d])
}

// ---------- বাংলা সন (সংশোধিত বাংলা ক্যালেন্ডার, বাংলাদেশ ২০১৯ সংস্করণ) ----------
// বৈশাখ ১৪ এপ্রিল শুরু। মাস দৈর্ঘ্য: বৈশাখ-আশ্বিন=৩১, কার্তিক-চৈত্র=৩০ (ফাল্গুন লিপ-ইয়ারে ৩১)
const BN_MONTHS = ['বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন', 'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র']
const BN_DAYS = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার']

function isGregLeap(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
}

export function toBanglaDate(d: Date): { day: number; monthName: string; year: number; weekday: string; formatted: string } {
  // ঢাকা টাইমজোনে দিন হিসাব
  const dhaka = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }))
  const gy = dhaka.getFullYear()
  const start = new Date(gy, 3, 14) // ১৪ এপ্রিল = ১ বৈশাখ
  let bYear: number, dayOfBn: number
  if (dhaka >= start) {
    bYear = gy - 593
    dayOfBn = Math.floor((dhaka.getTime() - start.getTime()) / 86400000)
  } else {
    bYear = gy - 594
    const prevStart = new Date(gy - 1, 3, 14)
    dayOfBn = Math.floor((dhaka.getTime() - prevStart.getTime()) / 86400000)
  }
  // ফাল্গুন লিপ চেক: বাংলা বছরের ফাল্গুন পড়ে গ্রেগরিয়ান ফেব্রু-মার্চে (bYear+594 এর পরের বছর)
  const falgunGregYear = bYear + 595
  const monthLens = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, isGregLeap(falgunGregYear) ? 31 : 30, 30]
  let m = 0, rem = dayOfBn
  while (m < 12 && rem >= monthLens[m]) { rem -= monthLens[m]; m++ }
  if (m > 11) m = 11
  const day = rem + 1
  const weekday = BN_DAYS[dhaka.getDay()]
  return { day, monthName: BN_MONTHS[m], year: bYear, weekday, formatted: `${toBn(day)} ${BN_MONTHS[m]} ${toBn(bYear)} বঙ্গাব্দ` }
}

// ---------- হিজরি সন (Intl islamic-umalqura — ব্রাউজার/Workers বিল্ট-ইন, নির্ভুল) ----------
const HIJRI_MONTHS_BN: Record<string, string> = {
  'Muharram': 'মুহাররম', 'Safar': 'সফর', "Rabiʻ I": 'রবিউল আউয়াল', "Rabiʻ II": 'রবিউস সানি',
  'Jumada I': 'জমাদিউল আউয়াল', 'Jumada II': 'জমাদিউস সানি', 'Rajab': 'রজব', 'Shaʻban': 'শাবান',
  'Ramadan': 'রমজান', 'Shawwal': 'শাওয়াল', "Dhuʻl-Qiʻdah": 'জিলকদ', "Dhuʻl-Hijjah": 'জিলহজ'
}
export function toHijriDate(d: Date): { formatted: string } {
  try {
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      timeZone: 'Asia/Dhaka', day: 'numeric', month: 'long', year: 'numeric'
    }).formatToParts(d)
    const day = parts.find(p => p.type === 'day')?.value ?? ''
    const month = parts.find(p => p.type === 'month')?.value ?? ''
    const year = parts.find(p => p.type === 'year')?.value ?? ''
    const monthBn = HIJRI_MONTHS_BN[month] ?? month
    return { formatted: `${toBn(day)} ${monthBn} ${toBn(year)} হিজরি` }
  } catch {
    return { formatted: '' }
  }
}

// ---------- বুদ্ধাব্দ (Buddhist Era = গ্রেগরিয়ান + ৫৪৩; বৈশাখী পূর্ণিমায় বছর বদলায় — সরল রূপ: থাই রীতি) ----------
export function toBuddhistDate(d: Date): { formatted: string } {
  const dhaka = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }))
  const be = dhaka.getFullYear() + 543
  const bn = toBanglaDate(d)
  return { formatted: `${toBn(bn.day)} ${bn.monthName}, ${toBn(be)} বুদ্ধাব্দ` }
}

// ---------- খ্রিস্টাব্দ (বাংলায়) ----------
const GREG_MONTHS_BN = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর']
export const WEEKDAYS_BN = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার']
export function toGregorianBn(d: Date): { formatted: string } {
  const dhaka = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }))
  const dd = String(dhaka.getDate()).padStart(2, '0')
  const mm = String(dhaka.getMonth() + 1).padStart(2, '0')
  // ফরম্যাট: বার, DD/MM/YYYY (যেমন: শনিবার, ২৯/০৮/২০২৬)
  return { formatted: `${WEEKDAYS_BN[dhaka.getDay()]}, ${toBn(dd)}/${toBn(mm)}/${toBn(dhaka.getFullYear())}` }
}

// ---------- ধর্ম অনুযায়ী গ্রিটিং + সন ----------
export type ReligionInfo = {
  greeting: string
  dateLine: string       // ধর্মের নিজস্ব সন
  gregLine: string       // সাথে খ্রিস্টাব্দও
  theme: string          // থিম কী
  watermark: string
}

export function religionInfo(religion: string, now = new Date()): ReligionInfo {
  const greg = toGregorianBn(now).formatted
  const bn = toBanglaDate(now)
  switch (religion) {
    case 'islam':
      return { greeting: 'আসসালামু আলাইকুম', dateLine: toHijriDate(now).formatted, gregLine: greg, theme: 'emerald', watermark: '☪' }
    case 'sanatan':
      return { greeting: 'হরেকৃষ্ণ', dateLine: bn.formatted, gregLine: greg, theme: 'saffron', watermark: 'ॐ' }
    case 'buddhist':
      return { greeting: 'নমো বুদ্ধায়', dateLine: toBuddhistDate(now).formatted, gregLine: greg, theme: 'maroon', watermark: '☸' }
    case 'christian':
      return { greeting: 'শুভেচ্ছা ও শান্তি', dateLine: greg, gregLine: bn.formatted, theme: 'blue', watermark: '✝' }
    default:
      return { greeting: 'শুভেচ্ছা', dateLine: bn.formatted, gregLine: greg, theme: 'emerald', watermark: '📚' }
  }
}
