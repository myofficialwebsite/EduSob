// এডুসব ফেজ-২ — ফিড API: নিউজ RSS, নামাজ সময়, পঞ্জিকা, চাকরি, নোটিস, দৈনিক বাণী
// সব এক্সটার্নাল কল D1 feed_cache-এ ক্যাশ হয় (ফ্রি টিয়ার + রেট-লিমিট বাঁচাতে)

import { Hono } from 'hono'
import type { Bindings } from '../lib/auth'
import { getPanchang, getIslamicEvents } from '../lib/panchang'
import { toBn, toHijriDate } from '../lib/dates'

const feeds = new Hono<{ Bindings: Bindings }>()

// ---------- D1 ক্যাশ হেল্পার ----------
async function cached<T>(db: any, key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
  try {
    const row: any = await db.prepare('SELECT value, updated_at FROM feed_cache WHERE cache_key = ?').bind(key).first()
    if (row && Date.now() - row.updated_at < ttlMs) return JSON.parse(row.value) as T
  } catch { /* টেবিল না থাকলে সরাসরি ফেচ */ }
  const fresh = await fetcher()
  // খালি অ্যারে ক্যাশ করব না — সাময়িক ফেচ-ব্যর্থতা ৩০ মিনিট আটকে থাকা ঠেকাতে
  const isEmpty = Array.isArray(fresh) && fresh.length === 0
  if (!isEmpty) {
    try {
      await db.prepare('INSERT INTO feed_cache (cache_key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(cache_key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at')
        .bind(key, JSON.stringify(fresh), Date.now()).run()
    } catch { /* ক্যাশ ব্যর্থ হলেও রেসপন্স যাবে */ }
  }
  return fresh
}

// ---------- RSS পার্সার (রেজেক্স-ভিত্তিক, হালকা) ----------
type NewsItem = { title: string; link: string; source: string; pubDate: string }

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ').trim()
}

function parseRss(xml: string, sourceName: string, max = 15): NewsItem[] {
  const items: NewsItem[] = []
  const blocks = xml.split(/<item[\s>]/).slice(1)
  for (const b of blocks.slice(0, max)) {
    const title = decodeEntities((b.match(/<title[^>]*>([\s\S]*?)<\/title>/) || [])[1] || '')
    let link = decodeEntities((b.match(/<link[^>]*>([\s\S]*?)<\/link>/) || [])[1] || '')
    if (!link) link = decodeEntities((b.match(/<guid[^>]*>([\s\S]*?)<\/guid>/) || [])[1] || '')
    const pubDate = decodeEntities((b.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/) || [])[1] || '')
    if (title && link.startsWith('http')) items.push({ title, link, source: sourceName, pubDate })
  }
  return items
}

async function fetchRss(url: string, sourceName: string, max = 15): Promise<NewsItem[]> {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 9000)
    const res = await fetch(url, {
      signal: ctrl.signal, redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) EduSobBot/1.0', 'Accept': 'application/rss+xml, application/xml, text/xml, */*' }
    })
    clearTimeout(timer)
    if (!res.ok) return []
    return parseRss(await res.text(), sourceName, max)
  } catch { return [] }
}

// গুগল নিউজ ব্লকড হলে প্রথম আলো + বিবিসি থেকে কীওয়ার্ড-মিল খবর
async function keywordFallback(keywords: string[]): Promise<NewsItem[]> {
  const [pa, bbc] = await Promise.all([
    fetchRss('https://www.prothomalo.com/feed/', 'প্রথম আলো', 25),
    fetchRss('https://feeds.bbci.co.uk/bengali/rss.xml', 'বিবিসি বাংলা', 20),
  ])
  return [...pa, ...bbc].filter(it => keywords.some(k => it.title.includes(k)))
}

// গুগল নিউজ সোর্স-নাম টাইটেল থেকে আলাদা করা: "শিরোনাম - সোর্স"
function splitGoogleTitle(items: NewsItem[]): NewsItem[] {
  return items.map(it => {
    const m = it.title.match(/^(.*)\s-\s([^-]+)$/)
    if (m) return { ...it, title: m[1].trim(), source: m[2].trim() }
    return it
  })
}

// ---------- ১) নিউজ ফিড: /api/feeds/news?cat=latest|education|jobs ----------
feeds.get('/news', async (c) => {
  const cat = ['latest', 'education', 'jobs'].includes(c.req.query('cat') || '') ? c.req.query('cat')! : 'latest'
  const data = await cached(c.env.DB, `news:${cat}`, 30 * 60 * 1000, async () => {
    let items: NewsItem[] = []
    if (cat === 'latest') {
      const [pa, gn, bbc] = await Promise.all([
        fetchRss('https://www.prothomalo.com/feed/', 'প্রথম আলো', 12),
        fetchRss('https://news.google.com/rss?hl=bn&gl=BD&ceid=BD:bn', 'গুগল নিউজ', 15),
        fetchRss('https://feeds.bbci.co.uk/bengali/rss.xml', 'বিবিসি বাংলা', 10),
      ])
      items = [...pa, ...splitGoogleTitle(gn), ...bbc]
    } else if (cat === 'education') {
      const [gn1, gn2] = await Promise.all([
        fetchRss('https://news.google.com/rss/search?q=%E0%A6%B6%E0%A6%BF%E0%A6%95%E0%A7%8D%E0%A6%B7%E0%A6%BE%20%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE%E0%A6%A6%E0%A7%87%E0%A6%B6&hl=bn&gl=BD&ceid=BD:bn', 'গুগল নিউজ', 15),
        fetchRss('https://news.google.com/rss/search?q=%E0%A6%AA%E0%A6%B0%E0%A7%80%E0%A6%95%E0%A7%8D%E0%A6%B7%E0%A6%BE%20OR%20%E0%A6%AD%E0%A6%B0%E0%A7%8D%E0%A6%A4%E0%A6%BF%20OR%20%E0%A6%B0%E0%A7%87%E0%A6%9C%E0%A6%BE%E0%A6%B2%E0%A7%8D%E0%A6%9F&hl=bn&gl=BD&ceid=BD:bn', 'গুগল নিউজ', 12),
      ])
      items = splitGoogleTitle([...gn1, ...gn2])
      // ফলব্যাক: গুগল নিউজ ব্লকড হলে প্রথম আলো+বিবিসি থেকে কীওয়ার্ড ফিল্টার
      if (items.length === 0) items = await keywordFallback(['শিক্ষ', 'পরীক্ষা', 'ভর্তি', 'রেজাল্ট', 'বিশ্ববিদ্যালয়', 'কলেজ', 'স্কুল', 'এসএসসি', 'এইচএসসি', 'শিক্ষার্থী', 'পাঠ'])
    } else {
      const [gn1, gn2] = await Promise.all([
        fetchRss('https://news.google.com/rss/search?q=%E0%A6%9A%E0%A6%BE%E0%A6%95%E0%A6%B0%E0%A6%BF%20%E0%A6%A8%E0%A6%BF%E0%A6%AF%E0%A6%BC%E0%A7%8B%E0%A6%97&hl=bn&gl=BD&ceid=BD:bn', 'গুগল নিউজ', 15),
        fetchRss('https://news.google.com/rss/search?q=%E0%A6%A8%E0%A6%BF%E0%A6%AF%E0%A6%BC%E0%A7%8B%E0%A6%97%20%E0%A6%AC%E0%A6%BF%E0%A6%9C%E0%A7%8D%E0%A6%9E%E0%A6%AA%E0%A7%8D%E0%A6%A4%E0%A6%BF&hl=bn&gl=BD&ceid=BD:bn', 'গুগল নিউজ', 12),
      ])
      items = splitGoogleTitle([...gn1, ...gn2])
      if (items.length === 0) items = await keywordFallback(['চাকরি', 'নিয়োগ', 'বিজ্ঞপ্তি', 'পদে', 'কর্মকর্তা', 'কর্মচারী', 'সার্কুলার', 'বেতন'])
    }
    // ডুপ্লিকেট শিরোনাম বাদ + সময় অনুযায়ী সাজানো
    const seen = new Set<string>()
    items = items.filter(it => { const k = it.title.slice(0, 60); if (seen.has(k)) return false; seen.add(k); return true })
    items.sort((a, b) => new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime())
    return items.slice(0, 30)
  })
  return c.json({ ok: true, cat, items: data })
})

// ---------- ২) নামাজের সময়: /api/feeds/prayer?city=Dhaka ----------
const BD_CITIES = new Set(['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh', 'Cumilla', 'Gazipur', 'Narayanganj', 'Bogura', 'Jashore', 'Dinajpur', 'Tangail'])

function getDhakaFallbackPrayer(month: number) {
  const schedules: Record<number, { Fajr: string; Sunrise: string; Dhuhr: string; Asr: string; Maghrib: string; Isha: string }> = {
    1:  { Fajr: '05:15', Sunrise: '06:40', Dhuhr: '12:08', Asr: '15:20', Maghrib: '17:35', Isha: '18:55' },
    2:  { Fajr: '05:10', Sunrise: '06:30', Dhuhr: '12:12', Asr: '15:40', Maghrib: '17:55', Isha: '19:10' },
    3:  { Fajr: '04:50', Sunrise: '06:10', Dhuhr: '12:10', Asr: '15:55', Maghrib: '18:10', Isha: '19:25' },
    4:  { Fajr: '04:20', Sunrise: '05:40', Dhuhr: '12:00', Asr: '16:05', Maghrib: '18:22', Isha: '19:40' },
    5:  { Fajr: '03:55', Sunrise: '05:18', Dhuhr: '11:58', Asr: '16:15', Maghrib: '18:35', Isha: '19:55' },
    6:  { Fajr: '03:45', Sunrise: '05:12', Dhuhr: '12:01', Asr: '16:25', Maghrib: '18:48', Isha: '20:12' },
    7:  { Fajr: '03:52', Sunrise: '05:18', Dhuhr: '12:05', Asr: '16:28', Maghrib: '18:50', Isha: '20:12' },
    8:  { Fajr: '04:10', Sunrise: '05:30', Dhuhr: '12:04', Asr: '16:22', Maghrib: '18:36', Isha: '19:55' },
    9:  { Fajr: '04:24', Sunrise: '05:41', Dhuhr: '11:58', Asr: '16:28', Maghrib: '18:15', Isha: '19:31' },
    10: { Fajr: '04:36', Sunrise: '05:50', Dhuhr: '11:50', Asr: '15:45', Maghrib: '17:40', Isha: '18:56' },
    11: { Fajr: '04:52', Sunrise: '06:10', Dhuhr: '11:48', Asr: '15:15', Maghrib: '17:15', Isha: '18:35' },
    12: { Fajr: '05:08', Sunrise: '06:30', Dhuhr: '11:58', Asr: '15:10', Maghrib: '17:14', Isha: '18:34' },
  }
  const m = Math.min(12, Math.max(1, month || 1))
  return schedules[m] || schedules[9]
}

feeds.get('/prayer', async (c) => {
  let city = c.req.query('city') || 'Dhaka'
  if (!BD_CITIES.has(city)) city = 'Dhaka'
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(new Date())
  const data = await cached(c.env.DB, `prayer:${city}:${today}`, 6 * 60 * 60 * 1000, async () => {
    const [dd, mm, yy] = [today.slice(8, 10), today.slice(5, 7), today.slice(0, 4)]
    const res = await fetch(`https://api.aladhan.com/v1/timingsByCity/${dd}-${mm}-${yy}?city=${encodeURIComponent(city)}&country=Bangladesh&method=1&school=1`, {
      headers: { 'User-Agent': 'EduSob/1.0' }
    })
    if (!res.ok) throw new Error('aladhan failed')
    const j: any = await res.json()
    const t = j.data.timings
    return { Fajr: t.Fajr, Sunrise: t.Sunrise, Dhuhr: t.Dhuhr, Asr: t.Asr, Maghrib: t.Maghrib, Isha: t.Isha }
  }).catch(() => null)
  
  const events = getIslamicEvents()
  const timings = data || getDhakaFallbackPrayer(parseInt(today.slice(5, 7), 10))
  return c.json({ ok: true, city, date: today, timings, fallback: !data, hijri: toHijriDate(new Date()).formatted, events })
})

// ---------- ৩) পঞ্জিকা (তিথি/একাদশী): /api/feeds/panchang ----------
feeds.get('/panchang', async (c) => {
  const p = getPanchang()
  return c.json({ ok: true, panchang: p })
})

// ---------- ৪) দৈনিক বাণী: /api/feeds/verse?religion=... ----------
const GITA_BN = [
  { text: 'কর্মেই তোমার অধিকার, ফলে কখনো নয়। কর্মফলের হেতু হয়ো না, নিষ্কর্মেও আসক্ত হয়ো না।', ref: 'শ্রীমদ্ভগবদ্গীতা ২.৪৭' },
  { text: 'যখনই ধর্মের গ্লানি ও অধর্মের অভ্যুত্থান হয়, তখনই আমি নিজেকে প্রকাশ করি।', ref: 'শ্রীমদ্ভগবদ্গীতা ৪.৭' },
  { text: 'আত্মা অবিনাশী, নিত্য, অজ ও অব্যয় — শরীর নাশ হলেও আত্মার নাশ নেই।', ref: 'শ্রীমদ্ভগবদ্গীতা ২.২০' },
  { text: 'সংশয়াত্মা বিনশ্যতি — সংশয়ী ব্যক্তির ইহলোক-পরলোক কোথাও সুখ নেই।', ref: 'শ্রীমদ্ভগবদ্গীতা ৪.৪০' },
  { text: 'মনই মানুষের বন্ধু, মনই শত্রু। যে মন জয় করেছে, তার মন পরম বন্ধু।', ref: 'শ্রীমদ্ভগবদ্গীতা ৬.৫-৬' },
  { text: 'যে আমাকে পত্র, পুষ্প, ফল বা জল ভক্তিভরে অর্পণ করে — আমি তা প্রীতিভরে গ্রহণ করি।', ref: 'শ্রীমদ্ভগবদ্গীতা ৯.২৬' },
  { text: 'সর্বধর্ম পরিত্যাগ করে একমাত্র আমার শরণ নাও; আমি তোমাকে সর্ব পাপ থেকে মুক্ত করবো।', ref: 'শ্রীমদ্ভগবদ্গীতা ১৮.৬৬' },
]
const DHAMMA_BN = [
  { text: 'মনই সব কিছুর অগ্রগামী, মনই শ্রেষ্ঠ; সব কিছু মন থেকেই সৃষ্ট।', ref: 'ধম্মপদ ১' },
  { text: 'ঘৃণা দিয়ে ঘৃণা কখনো শান্ত হয় না; অহিংসা দিয়েই ঘৃণা শান্ত হয় — এটাই সনাতন নিয়ম।', ref: 'ধম্মপদ ৫' },
  { text: 'হাজার যুদ্ধজয়ীর চেয়ে আত্মজয়ী শ্রেষ্ঠ।', ref: 'ধম্মপদ ১০৩' },
  { text: 'নিজেই নিজের রক্ষক, অন্য কে রক্ষক হবে? আত্মসংযমী ব্যক্তি দুর্লভ রক্ষক লাভ করে।', ref: 'ধম্মপদ ১৬০' },
  { text: 'সব পাপ বর্জন, কুশল সঞ্চয় ও চিত্তশুদ্ধি — এই হলো বুদ্ধগণের শাসন।', ref: 'ধম্মপদ ১৮৩' },
]
const BIBLE_BN = [
  { text: 'কারণ ঈশ্বর জগৎকে এমন প্রেম করলেন যে, নিজের একজাত পুত্রকে দান করলেন।', ref: 'যোহন ৩:১৬' },
  { text: 'সদাপ্রভু আমার পালক, আমার অভাব হবে না।', ref: 'গীতসংহিতা ২৩:১' },
  { text: 'তোমরা প্রথমে ঈশ্বরের রাজ্য ও তাঁর ধার্মিকতার খোঁজ করো, তাহলে এসবও তোমাদের দেওয়া হবে।', ref: 'মথি ৬:৩৩' },
  { text: 'আমি তোমাকে আদেশ দিয়েছি — বলবান হও ও সাহস করো; ভয় কোরো না, কারণ তোমার ঈশ্বর সদাপ্রভু তোমার সঙ্গে আছেন।', ref: 'যিহোশূয় ১:৯' },
  { text: 'প্রেম চিরসহিষ্ণু, প্রেম দয়ালু।', ref: '১ করিন্থীয় ১৩:৪' },
]
// কুরআন — জনপ্রিয় আয়াত নম্বর (আল-কুরআন ক্লাউড API, বাংলা অনুবাদ)
const QURAN_AYAHS = [262, 2, 285, 1, 255, 286, 3413, 4784, 6236, 2201, 293, 1160]

feeds.get('/verse', async (c) => {
  const religion = c.req.query('religion') || 'other'
  const dayIdx = Math.floor(Date.now() / 86400000) // দিন-ভিত্তিক রোটেশন
  if (religion === 'islam') {
    const ayahNo = QURAN_AYAHS[dayIdx % QURAN_AYAHS.length]
    const data = await cached(c.env.DB, `verse:islam:${ayahNo}`, 7 * 24 * 60 * 60 * 1000, async () => {
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${ayahNo}/bn.bengali`)
      if (!res.ok) throw new Error('quran api failed')
      const j: any = await res.json()
      return { text: j.data.text as string, ref: `সূরা ${j.data.surah.englishName} ${j.data.surah.number}:${j.data.numberInSurah}` }
    }).catch(() => ({ text: 'নিশ্চয়ই কষ্টের সাথে স্বস্তি আছে।', ref: 'সূরা আল-ইনশিরাহ ৯৪:৬' }))
    return c.json({ ok: true, verse: data })
  }
  if (religion === 'sanatan') return c.json({ ok: true, verse: GITA_BN[dayIdx % GITA_BN.length] })
  if (religion === 'buddhist') return c.json({ ok: true, verse: DHAMMA_BN[dayIdx % DHAMMA_BN.length] })
  if (religion === 'christian') return c.json({ ok: true, verse: BIBLE_BN[dayIdx % BIBLE_BN.length] })
  return c.json({ ok: true, verse: { text: 'শিক্ষাই জাতির মেরুদণ্ড।', ref: 'প্রবাদ' } })
})

// ---------- ৫) চাকরি: /api/feeds/jobs?level=any|ssc|hsc|nu|masters ----------
const LEVEL_RANK: Record<string, number> = { ssc: 1, hsc: 2, nu: 3, masters: 4 }
feeds.get('/jobs', async (c) => {
  const level = c.req.query('level') || ''
  const { results } = await c.env.DB.prepare(
    "SELECT id, title, org, category, education_level, deadline, apply_link, description FROM jobs WHERE is_active = 1 ORDER BY (deadline IS NULL), deadline ASC LIMIT 50"
  ).all()
  const jobs = (results as any[]).map(j => {
    let match = 60
    const userRank = LEVEL_RANK[level] ?? 0
    const jobRank = LEVEL_RANK[j.education_level] ?? 0
    if (j.education_level === 'any') match = 80
    else if (userRank === jobRank) match = 100
    else if (userRank > jobRank) match = 85
    else if (userRank > 0) match = 30
    return { ...j, match }
  })
  return c.json({ ok: true, jobs })
})

// ---------- ৬) নোটিস: /api/feeds/notices?cat=nu|board|dshe|ntrca|general ----------
feeds.get('/notices', async (c) => {
  const cat = c.req.query('cat') || ''
  const validCats = ['nu', 'board', 'dshe', 'ntrca', 'college', 'general']
  let query = 'SELECT id, category, title, link, published_at, body FROM notices WHERE is_active = 1'
  const binds: string[] = []
  if (validCats.includes(cat)) { query += ' AND category = ?'; binds.push(cat) }
  query += ' ORDER BY published_at DESC, id DESC LIMIT 50'
  const { results } = await c.env.DB.prepare(query).bind(...binds).all()
  return c.json({ ok: true, notices: results })
})

export default feeds
