// এডুসব — পঞ্জিকা (তিথি/একাদশী/পূর্ণিমা/অমাবস্যা) — astronomical গণনা, লোকাল কোড
// পদ্ধতি: সূর্য ও চাঁদের ecliptic longitude-এর পার্থক্য থেকে তিথি (প্রতি ১২° = ১ তিথি)
// নির্ভুলতা: ±১-২ ঘণ্টা (truncated series) — একাদশী/পূর্ণিমা দিন নির্ধারণে যথেষ্ট

import { toBn } from './dates'

const DEG = Math.PI / 180

// Julian Day (UTC)
function julianDay(d: Date): number {
  return d.getTime() / 86400000 + 2440587.5
}

// সূর্যের geocentric ecliptic longitude (ডিগ্রি) — truncated VSOP
function sunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * DEG) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M * DEG) +
    0.000289 * Math.sin(3 * M * DEG)
  return ((L0 + C) % 360 + 360) % 360
}

// চাঁদের geocentric ecliptic longitude (ডিগ্রি) — truncated ELP (মূল টার্মগুলো)
function moonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T
  const F = 93.272095 + 483202.0175233 * T - 0.0036539 * T * T
  let lon = Lp
  lon += 6.288774 * Math.sin(Mp * DEG)
  lon += 1.274027 * Math.sin((2 * D - Mp) * DEG)
  lon += 0.658314 * Math.sin(2 * D * DEG)
  lon += 0.213618 * Math.sin(2 * Mp * DEG)
  lon -= 0.185116 * Math.sin(M * DEG)
  lon -= 0.114332 * Math.sin(2 * F * DEG)
  lon += 0.058793 * Math.sin((2 * D - 2 * Mp) * DEG)
  lon += 0.057066 * Math.sin((2 * D - M - Mp) * DEG)
  lon += 0.053322 * Math.sin((2 * D + Mp) * DEG)
  lon += 0.045758 * Math.sin((2 * D - M) * DEG)
  lon -= 0.040923 * Math.sin((M - Mp) * DEG)
  lon -= 0.034720 * Math.sin(D * DEG)
  lon -= 0.030383 * Math.sin((M + Mp) * DEG)
  return ((lon % 360) + 360) % 360
}

// তিথি নম্বর (1-30): 1-15 শুক্লপক্ষ, 16-30 কৃষ্ণপক্ষ (30 = অমাবস্যা, 15 = পূর্ণিমা)
export function tithiAt(d: Date): number {
  const jd = julianDay(d)
  const diff = ((moonLongitude(jd) - sunLongitude(jd)) % 360 + 360) % 360
  return Math.floor(diff / 12) + 1
}

const TITHI_NAMES = ['প্রতিপদ', 'দ্বিতীয়া', 'তৃতীয়া', 'চতুর্থী', 'পঞ্চমী', 'ষষ্ঠী', 'সপ্তমী', 'অষ্টমী', 'নবমী', 'দশমী', 'একাদশী', 'দ্বাদশী', 'ত্রয়োদশী', 'চতুর্দশী']

export type Panchang = {
  tithi: number
  tithiName: string      // যেমন: শুক্লপক্ষ একাদশী
  paksha: string         // শুক্লপক্ষ | কৃষ্ণপক্ষ
  isEkadashi: boolean
  isPurnima: boolean
  isAmavasya: boolean
  nextEkadashi: { date: string; daysLeft: number; paksha: string } | null
  nextPurnima: { date: string; daysLeft: number } | null
  nextAmavasya: { date: string; daysLeft: number } | null
}

const BN_G_MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর']
function fmtBnDate(d: Date): string {
  // ঢাকা তারিখ
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(d)
  const day = +(p.find(x => x.type === 'day')?.value ?? 1)
  const mon = +(p.find(x => x.type === 'month')?.value ?? 1)
  return `${toBn(day)} ${BN_G_MONTHS[mon - 1]}`
}

function tithiLabel(t: number): { name: string; paksha: string } {
  if (t === 15) return { name: 'পূর্ণিমা', paksha: 'শুক্লপক্ষ' }
  if (t === 30) return { name: 'অমাবস্যা', paksha: 'কৃষ্ণপক্ষ' }
  if (t <= 14) return { name: TITHI_NAMES[t - 1], paksha: 'শুক্লপক্ষ' }
  return { name: TITHI_NAMES[t - 16], paksha: 'কৃষ্ণপক্ষ' }
}

// ঢাকায় সূর্যোদয়ের সময়ের তিথিই সেদিনের তিথি (প্রচলিত রীতি) — সূর্যোদয় ≈ ০৬:০০ BDT ধরা হয়েছে
function dhakaSunriseUTC(base: Date): Date {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(base)
  const y = +(p.find(x => x.type === 'year')?.value ?? 2026)
  const m = +(p.find(x => x.type === 'month')?.value ?? 1)
  const d = +(p.find(x => x.type === 'day')?.value ?? 1)
  // ০৬:০০ BDT = ০০:০০ UTC
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0))
}

export function getPanchang(now = new Date()): Panchang {
  const todaySunrise = dhakaSunriseUTC(now)
  const t = tithiAt(todaySunrise)
  const lbl = tithiLabel(t)

  let nextEkadashi: Panchang['nextEkadashi'] = null
  let nextPurnima: Panchang['nextPurnima'] = null
  let nextAmavasya: Panchang['nextAmavasya'] = null

  // পরবর্তী ৩৫ দিন স্ক্যান
  for (let i = 0; i <= 35; i++) {
    const day = new Date(todaySunrise.getTime() + i * 86400000)
    const dt = tithiAt(day)
    if (!nextEkadashi && (dt === 11 || dt === 26) && !(i === 0)) {
      nextEkadashi = { date: fmtBnDate(day), daysLeft: i, paksha: dt === 11 ? 'শুক্লপক্ষ' : 'কৃষ্ণপক্ষ' }
    }
    if (!nextPurnima && dt === 15 && i > 0) nextPurnima = { date: fmtBnDate(day), daysLeft: i }
    if (!nextAmavasya && dt === 30 && i > 0) nextAmavasya = { date: fmtBnDate(day), daysLeft: i }
    if (nextEkadashi && nextPurnima && nextAmavasya) break
  }

  return {
    tithi: t,
    tithiName: `${lbl.paksha} ${lbl.name}`,
    paksha: lbl.paksha,
    isEkadashi: t === 11 || t === 26,
    isPurnima: t === 15,
    isAmavasya: t === 30,
    nextEkadashi, nextPurnima, nextAmavasya
  }
}

// ---------- রমজান/ঈদ কাউন্টডাউন (হিজরি ক্যালেন্ডার umalqura দিয়ে) ----------
export type IslamicEvents = {
  hijriToday: string           // যেমন: ১৬ রবিউল আউয়াল ১৪৪৮
  nextRamadan: { daysLeft: number; dateBn: string } | null
  nextEidFitr: { daysLeft: number; dateBn: string } | null
  nextEidAdha: { daysLeft: number; dateBn: string } | null
}

function hijriParts(d: Date): { day: number; month: number; year: number } {
  const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
    timeZone: 'Asia/Dhaka', day: 'numeric', month: 'numeric', year: 'numeric'
  }).formatToParts(d)
  return {
    day: +(parts.find(p => p.type === 'day')?.value ?? 1),
    month: +(parts.find(p => p.type === 'month')?.value ?? 1),
    year: +(parts.find(p => p.type === 'year')?.value ?? 1448)
  }
}

export function getIslamicEvents(now = new Date()): IslamicEvents {
  let nextRamadan: IslamicEvents['nextRamadan'] = null
  let nextEidFitr: IslamicEvents['nextEidFitr'] = null
  let nextEidAdha: IslamicEvents['nextEidAdha'] = null

  // পরবর্তী ৪০০ দিন স্ক্যান — ১ রমজান, ১ শাওয়াল (ঈদুল ফিতর), ১০ জিলহজ (ঈদুল আজহা)
  for (let i = 0; i <= 400; i++) {
    const day = new Date(now.getTime() + i * 86400000)
    const h = hijriParts(day)
    if (!nextRamadan && h.month === 9 && h.day === 1) nextRamadan = { daysLeft: i, dateBn: fmtBnDate(day) }
    if (!nextEidFitr && h.month === 10 && h.day === 1) nextEidFitr = { daysLeft: i, dateBn: fmtBnDate(day) }
    if (!nextEidAdha && h.month === 12 && h.day === 10) nextEidAdha = { daysLeft: i, dateBn: fmtBnDate(day) }
    if (nextRamadan && nextEidFitr && nextEidAdha) break
  }
  return { hijriToday: '', nextRamadan, nextEidFitr, nextEidAdha }
}
