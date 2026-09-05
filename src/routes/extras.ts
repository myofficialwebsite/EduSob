// এডুসব ফেজ-৮ — রেজাল্ট API প্রক্সি + অ্যানাউন্সমেন্ট/পিন + ভর্তি হাব
import { Hono } from 'hono'
import { Bindings, getCookie, getSessionUser, SessionUser } from '../lib/auth'

type Env = { Bindings: Bindings; Variables: { user: SessionUser | null } }
const extras = new Hono<Env>()

extras.use('*', async (c, next) => {
  const token = getCookie(c.req.header('Cookie'), 'edusob_session')
  c.set('user', await getSessionUser(c.env.DB, token))
  await next()
})
const requireAuth = async (c: any, next: any) => {
  if (!c.get('user')) return c.json({ ok: false, error: 'লগইন প্রয়োজন' }, 401)
  await next()
}
const requireAdmin = async (c: any, next: any) => {
  const u = c.get('user')
  if (!u) return c.json({ ok: false, error: 'লগইন প্রয়োজন' }, 401)
  if (u.role !== 'admin') return c.json({ ok: false, error: 'এডমিন অনুমতি প্রয়োজন' }, 403)
  await next()
}

// ================= রেজাল্ট চেক (সার্ভার-সাইড প্রক্সি) =================
const VALID_EXAMS = new Set(['ssc', 'hsc', 'jsc'])
const VALID_BOARDS = new Set(['dhaka', 'barisal', 'chittagong', 'comilla', 'mymensingh', 'dinajpur', 'jessore', 'rajshahi', 'sylhet', 'madrasah', 'tec'])

extras.get('/result/check', async (c) => {
  const exam = String(c.req.query('exam') || '').toLowerCase()
  const year = String(c.req.query('year') || '')
  const board = String(c.req.query('board') || '').toLowerCase()
  const roll = String(c.req.query('roll') || '').replace(/\D/g, '')
  const reg = String(c.req.query('reg') || '').replace(/\D/g, '')

  if (!VALID_EXAMS.has(exam)) return c.json({ ok: false, error: 'পরীক্ষা নির্বাচন করুন (SSC/HSC/JSC)' }, 400)
  if (!/^20\d{2}$/.test(year)) return c.json({ ok: false, error: 'সঠিক পাসের বছর দিন' }, 400)
  if (!VALID_BOARDS.has(board)) return c.json({ ok: false, error: 'বোর্ড নির্বাচন করুন' }, 400)
  if (roll.length < 4 || roll.length > 8) return c.json({ ok: false, error: 'সঠিক রোল নম্বর দিন' }, 400)
  if (reg.length < 6 || reg.length > 12) return c.json({ ok: false, error: 'সঠিক রেজিস্ট্রেশন নম্বর দিন' }, 400)

  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 12000)
    const res = await fetch(`https://api.bangladeshgov.org/?exam=${exam}&year=${year}&board=${board}&roll=${roll}&reg=${reg}`, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'EduSob/1.0 (result checker)' }
    })
    clearTimeout(timer)
    const data: any = await res.json().catch(() => null)
    if (!data) return c.json({ ok: false, fallback: true, error: 'রেজাল্ট সার্ভারে সমস্যা — অফিসিয়াল সাইটে চেষ্টা করুন' }, 502)
    if (data.status !== 'success') {
      const msg = String(data.message || '')
      // API-side error (server down) vs not-found আলাদা করা
      const isNotFound = /not found|check your|HTTP 404/i.test(msg)
      return c.json({
        ok: false,
        fallback: !isNotFound,
        error: isNotFound ? 'রেজাল্ট পাওয়া যায়নি — রোল, রেজিস্ট্রেশন, বোর্ড ও পাসের বছর মিলিয়ে দেখুন' : 'রেজাল্ট সার্ভার সাময়িক ব্যস্ত — একটু পরে চেষ্টা করুন বা অফিসিয়াল সাইটে দেখুন'
      }, isNotFound ? 404 : 502)
    }
    return c.json({ ok: true, student: data.student || {}, subjects: data.subjects || [], result: data.result || {} })
  } catch {
    return c.json({ ok: false, fallback: true, error: 'রেজাল্ট সার্ভারে সংযোগ করা যায়নি — অফিসিয়াল সাইটে চেষ্টা করুন' }, 502)
  }
})

// ================= অ্যানাউন্সমেন্ট =================
// পাবলিক: অ্যাপ্রুভড ঘোষণা (লেভেল ফিল্টারসহ) + লগইন থাকলে পিন স্ট্যাটাস
extras.get('/announcements', async (c) => {
  const user = c.get('user')
  const { results } = await c.env.DB.prepare(`
    SELECT id, type, title, body, link, image_data, level, pinned_priority, expires_at, source, created_at
    FROM announcements
    WHERE status='approved' AND (expires_at IS NULL OR expires_at='' OR expires_at >= date('now'))
    ORDER BY pinned_priority DESC, id DESC LIMIT 30`).all()
  let pins: number[] = []
  if (user) {
    const p = await c.env.DB.prepare('SELECT announcement_id FROM user_pins WHERE user_id=?').bind(user.id).all()
    pins = (p.results as any[]).map(r => r.announcement_id)
  }
  const anns = (results as any[]).map(a => ({ ...a, pinned: pins.includes(a.id) }))
  return c.json({ ok: true, announcements: anns })
})

// পিন / আনপিন
extras.post('/announcements/:id/pin', requireAuth, async (c) => {
  const user = c.get('user')!
  const id = Number(c.req.param('id'))
  const ann = await c.env.DB.prepare("SELECT id FROM announcements WHERE id=? AND status='approved'").bind(id).first()
  if (!ann) return c.json({ ok: false, error: 'ঘোষণা পাওয়া যায়নি' }, 404)
  const ex = await c.env.DB.prepare('SELECT id FROM user_pins WHERE user_id=? AND announcement_id=?').bind(user.id, id).first()
  if (ex) {
    await c.env.DB.prepare('DELETE FROM user_pins WHERE user_id=? AND announcement_id=?').bind(user.id, id).run()
    return c.json({ ok: true, pinned: false })
  }
  const cnt: any = await c.env.DB.prepare('SELECT COUNT(*) n FROM user_pins WHERE user_id=?').bind(user.id).first()
  if ((cnt?.n ?? 0) >= 5) return c.json({ ok: false, error: 'সর্বোচ্চ ৫টি পিন করা যায় — আগে একটি আনপিন করুন' }, 400)
  await c.env.DB.prepare('INSERT INTO user_pins (user_id, announcement_id) VALUES (?,?)').bind(user.id, id).run()
  return c.json({ ok: true, pinned: true })
})

// আমার পিন করা ঘোষণা
extras.get('/announcements/pinned', requireAuth, async (c) => {
  const user = c.get('user')!
  const { results } = await c.env.DB.prepare(`
    SELECT a.id, a.type, a.title, a.body, a.link, a.image_data, a.level, a.created_at
    FROM user_pins p JOIN announcements a ON a.id = p.announcement_id
    WHERE p.user_id=? AND a.status='approved'
    ORDER BY p.id DESC`).bind(user.id).all()
  return c.json({ ok: true, pinned: results })
})

// এডমিন: অ্যানাউন্সমেন্ট CRUD
extras.get('/admin/announcements', requireAdmin, async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM announcements ORDER BY id DESC LIMIT 100').all()
  return c.json({ ok: true, announcements: results })
})
extras.post('/admin/announcements', requireAdmin, async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b?.title) return c.json({ ok: false, error: 'শিরোনাম দিন' }, 400)
  if (b.image_data && String(b.image_data).length > 550000) return c.json({ ok: false, error: 'ছবি খুব বড় — ছোট করুন' }, 413)
  const type = ['routine', 'question', 'result', 'admission', 'general'].includes(b.type) ? b.type : 'general'
  const level = ['all', 'ssc', 'hsc', 'nu', 'job'].includes(b.level) ? b.level : 'all'
  const r = await c.env.DB.prepare(`INSERT INTO announcements (type, title, body, link, image_data, level, status, pinned_priority, expires_at)
    VALUES (?,?,?,?,?,?,'approved',?,?)`)
    .bind(type, String(b.title).slice(0, 200), String(b.body || '').slice(0, 3000), String(b.link || '').slice(0, 500),
      b.image_data || null, level, Number(b.pinned_priority) || 0, b.expires_at || null).run()
  return c.json({ ok: true, id: r.meta.last_row_id })
})
extras.put('/admin/announcements/:id', requireAdmin, async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)
  const status = ['pending', 'approved', 'rejected'].includes(b.status) ? b.status : null
  await c.env.DB.prepare(`UPDATE announcements SET title=COALESCE(?,title), body=COALESCE(?,body), link=COALESCE(?,link),
    level=COALESCE(?,level), status=COALESCE(?,status), pinned_priority=COALESCE(?,pinned_priority), expires_at=COALESCE(?,expires_at) WHERE id=?`)
    .bind(b.title ?? null, b.body ?? null, b.link ?? null, b.level ?? null, status,
      Number.isInteger(b.pinned_priority) ? b.pinned_priority : null, b.expires_at ?? null, c.req.param('id')).run()
  return c.json({ ok: true })
})
extras.delete('/admin/announcements/:id', requireAdmin, async (c) => {
  const id = c.req.param('id')
  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM user_pins WHERE announcement_id=?').bind(id),
    c.env.DB.prepare('DELETE FROM announcements WHERE id=?').bind(id),
  ])
  return c.json({ ok: true })
})

// // ================= ভর্তি ও সরাসরি আবেদন হাব =================
export const DEFAULT_ADMISSIONS = [
  {
    id: 101, title: 'একাদশ শ্রেণি ভর্তি (XI Class Admission)', level: 'hsc', org: 'শিক্ষা বোর্ড সমন্বিত ভর্তি পরিষদ',
    apply_link: 'https://xiclassadmission.gov.bd/', direct_form_url: 'https://xiclassadmission.gov.bd/',
    fee: '৳২২৮ (আবেদন ফি)',
    start_date: '2026-05-15', deadline: '2026-06-15',
    steps: ['xiclassadmission.gov.bd সাইটে যান', '"Apply Now" এ ক্লিক করুন', 'SSC রোল, বোর্ড, পাসের বছর ও রেজিস্ট্রেশন নম্বর দিন', 'মোবাইল নম্বর ও সিকিউরিটি কোড দিন', 'পছন্দের কলেজ তালিকা দিন (সর্বনিম্ন ৫টি, সর্বোচ্চ ১০টি)', 'আবেদন ফি বিকাশ/নগদ/রকেটে পরিশোধ করুন', 'আবেদন ফরম ও সিকিউরিটি কোড সংরক্ষণ করুন'],
    required_info: ['ssc_roll', 'ssc_board', 'ssc_year', 'ssc_reg', 'phone'],
    description: 'এসএসসি পাসের পর দেশের সকল সরকারি ও বেসরকারি কলেজে একাদশ শ্রেণিতে ভর্তির সমন্বিত অনলাইন আবেদন।',
    is_active: 1
  },
  {
    id: 102, title: 'GST গুচ্ছ ২৪ পাবলিক বিশ্ববিদ্যালয় ভর্তি', level: 'cluster', org: 'গুচ্ছ বিশ্ববিদ্যালয় ভর্তি কমিটি',
    apply_link: 'https://gstadmission.ac.bd/', direct_form_url: 'https://gstadmission.ac.bd/apply',
    fee: '৳১,৫০০ (ইউনিট ফি)',
    start_date: '2026-03-01', deadline: '2026-03-30',
    steps: ['gstadmission.ac.bd পোর্টালে যান', 'HSC ও SSC এর রোল, বোর্ড ও পাসের বছর দিয়ে লগইন/রেজিস্ট্রেশন করুন', 'ছবি ও স্বাক্ষর আপলোড করুন', 'ইউনিট (A-বিজ্ঞান, B-মানবিক, C-ব্যবসায়) নির্বাচন করুন', 'পরীক্ষাকেন্দ্র পছন্দক্রম দিন', 'ফি বিকাশ/নগদে পরিশোধ করে প্রবেশপত্র ডাউনলোড করুন'],
    required_info: ['hsc_roll', 'hsc_board', 'hsc_year', 'ssc_roll', 'ssc_board', 'ssc_year', 'photo_data', 'phone'],
    description: '২৪টি সাধারণ এবং বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়ের সমন্বিত গুচ্ছ (GST) স্নাতক ১ম বর্ষ ভর্তি পরীক্ষা।',
    is_active: 1
  },
  {
    id: 103, title: 'কৃষি গুচ্ছ ৯ বিশ্ববিদ্যালয় সমন্বিত ভর্তি (Agri Cluster)', level: 'cluster', org: 'কৃষি গুচ্ছ বিশ্ববিদ্যালয় পরিষদ',
    apply_link: 'https://acas.edu.bd/', direct_form_url: 'https://acas.edu.bd/',
    fee: '৳১,২০০',
    start_date: '2026-04-01', deadline: '2026-04-30',
    steps: ['acas.edu.bd ওয়েবসাইটে যান', 'SSC ও HSC তথ্য দিয়ে পিন/পাসওয়ার্ড দিয়ে আবেদন শুরু করুন', 'পছন্দের কেন্দ্র নির্বাচন করুন', 'ফি পরিশোধ করে স্লিপ প্রিন্ট করুন'],
    required_info: ['hsc_roll', 'hsc_board', 'hsc_year', 'ssc_roll', 'ssc_board', 'ssc_year', 'phone'],
    description: 'বাংলাদেশ কৃষি বিশ্ববিদ্যালয় (বাকৃবি), শেরেবাংলা কৃষি বিশ্ববিদ্যালয়সহ ৯টি কৃষি বিশ্ববিদ্যালয়ের সমন্বিত ভর্তি পরীক্ষা।',
    is_active: 1
  },
  {
    id: 104, title: 'প্রকৌশল গুচ্ছ সমন্বিত ভর্তি (RUET, KUET, CUET)', level: 'cluster', org: 'প্রকৌশল বিশ্ববিদ্যালয় ভর্তি পরিষদ',
    apply_link: 'https://admissionckruet.ac.bd/', direct_form_url: 'https://admissionckruet.ac.bd/',
    fee: '৳১,২০০–৳১,৩০০',
    start_date: '2026-01-15', deadline: '2026-02-15',
    steps: ['admissionckruet.ac.bd পোর্টালে আবেদন ফরম পূরণ করুন', 'ছবি ও স্বাক্ষর আপলোড করুন', 'গ্রুপ (ক-ইঞ্জিনিয়ারিং / খ-আর্কিটেকচার) বাছুন', 'মোবাইল ব্যাংকিংয়ে ফি প্রদান করুন'],
    required_info: ['hsc_roll', 'hsc_board', 'hsc_year', 'ssc_roll', 'ssc_board', 'ssc_year', 'photo_data', 'phone'],
    description: 'রুয়েট, কুয়েট ও চুয়েট — দেশের শীর্ষ ৩টি প্রযুক্তি বিশ্ববিদ্যালয়ের স্নাতক সমন্বিত প্রকৌশল ভর্তি পরীক্ষা।',
    is_active: 1
  },
  {
    id: 105, title: 'ঢাকা বিশ্ববিদ্যালয় (DU) স্নাতক ভর্তি', level: 'university', org: 'ঢাকা বিশ্ববিদ্যালয়',
    apply_link: 'https://admission.eis.du.ac.bd/', direct_form_url: 'https://admission.eis.du.ac.bd/index.php?act=login/index',
    fee: '৳১,০৫০ (প্রতি ইউনিট)',
    start_date: '2025-11-04', deadline: '2025-11-27',
    steps: ['admission.eis.du.ac.bd পোর্টালে যান', 'লগইন অপশনে SSC ও HSC রোল, বোর্ড ও সন দিন', 'ছবি আপলোড করুন', 'এসএমএস ভেরিফিকেশন করুন', 'ইউনিট নির্বাচন করে মোবাইল ব্যাংকিংয়ে ফি দিন'],
    required_info: ['hsc_roll', 'hsc_board', 'hsc_year', 'ssc_roll', 'ssc_board', 'ssc_year', 'photo_data', 'phone'],
    description: 'ঢাকা বিশ্ববিদ্যালয়ের কলা, আইন ও সামাজিক বিজ্ঞান, বিজ্ঞান, ব্যবসায় শিক্ষা ও চারুকলা ইউনিটের স্নাতক ভর্তি।',
    is_active: 1
  },
  {
    id: 106, title: 'বুয়েট (BUET) স্নাতক ভর্তি পরীক্ষা', level: 'university', org: 'বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয় (BUET)',
    apply_link: 'https://buet.ac.bd/admission', direct_form_url: 'https://buet.ac.bd/admission',
    fee: '৳১,০০০–৳১,২০০',
    start_date: '2026-01-20', deadline: '2026-02-10',
    steps: ['buet.ac.bd/admission এ অনলাইন আবেদন করুন', 'প্রাক-নির্বাচনী (Preliminary) ও চূড়ান্ত পরীক্ষার ফরম পূরণ করুন', 'ফি পরিশোধ করুন ও অ্যাডমিট কার্ড নিন'],
    required_info: ['hsc_roll', 'hsc_board', 'hsc_year', 'ssc_roll', 'ssc_board', 'ssc_year', 'phone'],
    description: 'দেশের প্রধানতম প্রকৌশল বিদ্যাপীঠ বুয়েটের প্রাক-নির্বাচনী ও মূল লিখিত ভর্তি পরীক্ষা।',
    is_active: 1
  },
  {
    id: 107, title: 'বাংলাদেশ উন্মুক্ত বিশ্ববিদ্যালয় (BOU) — OSAPS সরাসরি আবেদন', level: 'bou', org: 'বাংলাদেশ উন্মুক্ত বিশ্ববিদ্যালয় (BOU)',
    apply_link: 'https://osapsnew.bou.ac.bd/', direct_form_url: 'https://osapsnew.bou.ac.bd/',
    fee: '৳৩০০–৳২,৫০০ (কোর্সভেদে)',
    start_date: '2026-01-01', deadline: '2026-12-31',
    steps: ['osapsnew.bou.ac.bd পোর্টালে যান', 'কাঙ্ক্ষিত প্রোগ্রাম (SSC / HSC / BA / BSS / BBA / LLB / Masters) বেছে নিন', '"Apply Online" এ ক্লিক করে ব্যক্তিগত ও শিক্ষাগত তথ্য দিন', 'ছবি ও প্রয়োজনীয় সার্টিফিকেট স্ক্যান কপি দিন', 'অনলাইন পেমেন্ট গেটওয়েতে ফি পরিশোধ করে প্রিন্ট কপি সংরক্ষণ করুন'],
    required_info: ['ssc_roll', 'ssc_board', 'ssc_year', 'nid', 'birth_reg', 'photo_data', 'phone', 'father_bn', 'mother_bn'],
    description: 'কর্মজীবী ও দূরশিক্ষণের শিক্ষার্থীদের জন্য উন্মুক্ত বিশ্ববিদ্যালয়ের SSC, HSC, ডিগ্রি, অনার্স ও স্নাতকোত্তর ভর্তি পোর্টাল।',
    is_active: 1
  },
  {
    id: 108, title: 'জাতীয় বিশ্ববিদ্যালয় অনার্স ১ম বর্ষ — সরাসরি আবেদন ফরম', level: 'nu', org: 'জাতীয় বিশ্ববিদ্যালয়',
    apply_link: 'http://app1.nu.edu.bd/', direct_form_url: 'http://app1.nu.edu.bd/nu-web/application/honoursApplicationForm',
    fee: '৳২৫০ (প্রাথমিক আবেদন)',
    start_date: '2026-01-22', deadline: '2026-02-11',
    steps: ['সরাসরি অনার্স আবেদন ফরমে প্রবেশ করুন (app1.nu.edu.bd/nu-web/application/honoursApplicationForm)', 'SSC ও HSC এর রোল, বোর্ড, পাসের বছর দিন', 'ছবি আপলোড করুন (120×150px)', 'কলেজ ও বিষয় পছন্দক্রম দিন', 'আবেদন ফর্ম প্রিন্ট করুন ও নির্ধারিত কলেজে ফি সহ জমা দিন'],
    required_info: ['ssc_roll', 'ssc_board', 'ssc_year', 'hsc_roll', 'hsc_board', 'hsc_year', 'photo_data', 'phone'],
    description: 'জাতীয় বিশ্ববিদ্যালয়ের অধিভুক্ত সকল সরকারি ও বেসরকারি কলেজে অনার্স ১ম বর্ষে মেধাভিত্তিক সরাসরি অনলাইন আবেদন ফরম।',
    is_active: 1
  },
  {
    id: 109, title: 'জাতীয় বিশ্ববিদ্যালয় ডিগ্রি (পাস) — সরাসরি আবেদন ফরম (Direct Form)', level: 'nu', org: 'জাতীয় বিশ্ববিদ্যালয়',
    apply_link: 'https://app55.nu.edu.bd/nu-web/application/degpApplicationForm', direct_form_url: 'https://app55.nu.edu.bd/nu-web/application/degpApplicationForm',
    fee: '৳২৫০ (প্রাথমিক আবেদন)',
    start_date: '2026-06-01', deadline: '2026-06-30',
    steps: ['সরাসরি ডিগ্রি আবেদন লিংকে যান (app55.nu.edu.bd/nu-web/application/degpApplicationForm)', 'SSC ও HSC রোল, বোর্ড ও বছর দিন', 'পছন্দের কলেজ ও কোর্স (BA, BSS, BSc, BBS) নির্বাচন করুন', 'ফর্ম প্রিন্ট করে কলেজে নির্ধারিত ফি সহ জমা দিন'],
    required_info: ['ssc_roll', 'ssc_board', 'ssc_year', 'hsc_roll', 'hsc_board', 'hsc_year', 'phone'],
    description: 'ডিগ্রি (পাস — BA, BSS, BSc, BBS) কোর্সে ৩ বছর মেয়াদী স্নাতক প্রোগ্রামে ভর্তির সরাসরি অভ্যন্তরীণ আবেদন ফরম।',
    is_active: 1
  },
  {
    id: 115, title: 'জাতীয় বিশ্ববিদ্যালয় মাস্টার্স ও প্রফেশনাল — সরাসরি আবেদন', level: 'nu', org: 'জাতীয় বিশ্ববিদ্যালয়',
    apply_link: 'http://app1.nu.edu.bd/', direct_form_url: 'http://app1.nu.edu.bd/nu-web/application/mpApplicationForm',
    fee: '৳৩০০–৳৫০০',
    start_date: '2026-02-01', deadline: '2026-03-15',
    steps: ['app1.nu.edu.bd পোর্টালে Masters / Professional ট্যাবে যান', 'প্রিলিমিনারি টু মাস্টার্স (mpApplicationForm) বা মাস্টার্স ফাইনাল (mfApplicationForm) বাছুন', 'ডিগ্রি/অনার্স রেজিস্ট্রেশন ও রোল নম্বর দিন', 'কলেজ পছন্দ দিয়ে ফি দিন'],
    required_info: ['hsc_roll', 'hsc_board', 'hsc_year', 'photo_data', 'phone'],
    description: 'মাস্টার্স প্রিলিমিনারি, মাস্টার্স ফাইনাল ও প্রফেশনাল কোর্সের কেন্দ্রীয় সরাসরি অনলাইন আবেদন।',
    is_active: 1
  },
  {
    id: 110, title: 'মেডিকেল (MBBS) ও ডেন্টাল (BDS) কেন্দ্রীয় ভর্তি', level: 'medical', org: 'স্বাস্থ্য শিক্ষা অধিদপ্তর (DGME)',
    apply_link: 'http://dgme.teletalk.com.bd/', direct_form_url: 'http://dgme.teletalk.com.bd/',
    fee: '৳১,০০০ (টেলিটক)',
    start_date: '2026-01-10', deadline: '2026-01-25',
    steps: ['dgme.teletalk.com.bd পোর্টালে যান', 'SSC ও HSC রোল, রেজিস্ট্রেশন ও বোর্ড দিন', 'মেডিকেল কলেজগুলোর পছন্দক্রম (College Preference) দিন', 'ছবি ও স্বাক্ষর আপলোড করুন', 'টেলিটক প্রি-পেইড এসএমএসের মাধ্যমে ফি প্রদান করুন'],
    required_info: ['hsc_roll', 'hsc_board', 'hsc_year', 'ssc_roll', 'ssc_board', 'ssc_year', 'photo_data', 'phone', 'district'],
    description: 'দেশের সকল সরকারি ও বেসরকারি মেডিকেল এবং ডেন্টাল কলেজের সমন্বিত এমবিবিএস ও বিডিএস ভর্তি পরীক্ষা।',
    is_active: 1
  },
  {
    id: 111, title: 'নার্সিং ও মিডওয়াইফারি (বিএসসি, ডিপ্লোমা) ভর্তি', level: 'medical', org: 'বাংলাদেশ নার্সিং ও মিডওয়াইফারি কাউন্সিল (BNMC)',
    apply_link: 'http://bnmc.teletalk.com.bd/', direct_form_url: 'http://bnmc.teletalk.com.bd/',
    fee: '৳৫০০–৳৭০০',
    start_date: '2026-03-10', deadline: '2026-04-05',
    steps: ['bnmc.teletalk.com.bd এ আবেদন করুন', 'বিএসসি নার্সিং / ডিপ্লোমা ইন নার্সিং নির্বাচন করুন', 'প্রতিষ্ঠান পছন্দক্রম দিন', 'টেলিটকে ফি দিন'],
    required_info: ['hsc_roll', 'hsc_board', 'hsc_year', 'ssc_roll', 'ssc_board', 'ssc_year', 'photo_data', 'phone'],
    description: '৪ বছর মেয়াদী বিএসসি ইন নার্সিং এবং ৩ বছর মেয়াদী ডিপ্লোমা ইন নার্সিং সায়েন্স অ্যান্ড মিডওয়াইফারি কেন্দ্রীয় ভর্তি।',
    is_active: 1
  },
  {
    id: 112, title: 'কারিগরি ও পলিটেকনিক (ডিপ্লোমা ইন ইঞ্জিনিয়ারিং)', level: 'polytechnic', org: 'বাংলাদেশ কারিগরি শিক্ষা বোর্ড (BTEB)',
    apply_link: 'https://btebadmission.gov.bd/', direct_form_url: 'https://btebadmission.gov.bd/',
    fee: '৳২৩৫',
    start_date: '2026-05-20', deadline: '2026-06-25',
    steps: ['btebadmission.gov.bd সাইটে যান', 'ডিপ্লোমা ইন ইঞ্জিনিয়ারিং / টেক্সটাইল / মেরিন নির্বাচন করুন', 'SSC রোল ও বোর্ড দিন', 'পছন্দের সরকারি পলিটেকনিক ও শিফট পছন্দ দিন', 'ফি পরিশোধ করুন'],
    required_info: ['ssc_roll', 'ssc_board', 'ssc_year', 'ssc_reg', 'phone'],
    description: 'সরকারি ও বেসরকারি পলিটেকনিক ইনস্টিটিউটে ৪ বছর মেয়াদী ডিপ্লোমা ইন ইঞ্জিনিয়ারিং ভর্তি।',
    is_active: 1
  },
  {
    id: 113, title: 'সরকারি ও বেসরকারি বিদ্যালয় ডিজিটাল লটারি ভর্তি (১ম-৯ম)', level: 'school', org: 'মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর (DSHE)',
    apply_link: 'https://gsa.teletalk.com.bd/', direct_form_url: 'https://gsa.teletalk.com.bd/',
    fee: '৳১১০',
    start_date: '2025-11-12', deadline: '2025-11-30',
    steps: ['gsa.teletalk.com.bd পোর্টালে যান', 'শিক্ষার্থীর জন্ম নিবন্ধন নম্বর (১৭ ডিজিট) ও জন্ম তারিখ দিন', 'বিদ্যালয় পছন্দক্রম দিন (প্রতি আবেদনে সর্বোচ্চ ৫টি)', 'টেলিটকে ফি পরিশোধ করুন'],
    required_info: ['birth_reg', 'dob', 'father_bn', 'mother_bn', 'phone'],
    description: 'দেশের সকল সরকারি ও বেসরকারি মাধ্যমিক বিদ্যালয়ে ১ম থেকে ৯ম শ্রেণিতে কেন্দ্রীয় ডিজিটাল লটারি ভর্তি।',
    is_active: 1
  },
  {
    id: 114, title: 'ক্যাডেট কলেজ ৭ম শ্রেণি ভর্তি পরীক্ষা', level: 'school', org: 'ক্যাডেট কলেজ পরিচালনা পরিষদ (বাংলাদেশ সেনাবাহিনী)',
    apply_link: 'https://cadetcollege.army.mil.bd/', direct_form_url: 'https://cadetcollege.army.mil.bd/',
    fee: '৳২,০০০',
    start_date: '2025-11-01', deadline: '2025-12-15',
    steps: ['cadetcollege.army.mil.bd ওয়েবসাইটে যান', '"Online Admission" এ ক্লিক করে অ্যাকাউন্ট খুলুন', 'শিক্ষার্থীর পূর্ণাঙ্গ তথ্য, ছবি ও অভিভাবকের তথ্য দিন', 'অনলাইন ফি পেমেন্ট করে প্রবেশপত্র ডাউনলোড করুন'],
    required_info: ['birth_reg', 'dob', 'father_bn', 'mother_bn', 'phone', 'photo_data'],
    description: 'দেশের ১২টি ক্যাডেট কলেজে ৭ম শ্রেণিতে ভর্তির মর্যাদাপূর্ণ লিখিত ও মৌখিক ভর্তি পরীক্ষা।',
    is_active: 1
  },
  {
    id: 120, title: 'NTRCA শিক্ষক নিবন্ধন সরাসরি আবেদন (Teletalk)', level: 'job', org: 'বেসরকারি শিক্ষক নিবন্ধন ও প্রত্যয়ন কর্তৃপক্ষ (NTRCA)',
    apply_link: 'http://ntrca.teletalk.com.bd/', direct_form_url: 'http://ntrca.teletalk.com.bd/',
    fee: '৳৩৫০',
    start_date: '2026-01-01', deadline: '2026-12-31',
    steps: ['ntrca.teletalk.com.bd সাইটে যান', 'চলমান শিক্ষক নিবন্ধন বিজ্ঞপ্তি নির্বাচন করুন', 'Application Form এ গিয়ে বিষয় ও পদ নির্বাচন করুন', 'ব্যক্তিগত, শিক্ষাগত তথ্য, ছবি (300×300) ও স্বাক্ষর (300×80) আপলোড করুন', 'টেলিটক এসএমএস এর মাধ্যমে ফি দিন'],
    required_info: ['nid', 'photo_data', 'phone', 'father_bn', 'mother_bn', 'ssc_roll', 'hsc_roll'],
    description: 'বেসরকারি স্কুল, কলেজ ও মাদ্রাসায় শিক্ষক পদে নিয়োগের প্রিলিমিনারি ও লিখিত নিবন্ধন পরীক্ষা সরাসরি আবেদন পোর্টাল।',
    is_active: 1
  },
  {
    id: 121, title: 'বিপিএসসি বিসিএস ও নন-ক্যাডার সরাসরি আবেদন', level: 'job', org: 'বাংলাদেশ সরকারি কর্ম কমিশন (BPSC)',
    apply_link: 'http://bpsc.teletalk.com.bd/', direct_form_url: 'http://bpsc.teletalk.com.bd/',
    fee: '৳৭০০ (বিসিএস) / ৳২০০-৳৫০০ (নন-ক্যাডার)',
    start_date: '2026-01-01', deadline: '2026-12-31',
    steps: ['bpsc.teletalk.com.bd পোর্টালে যান', 'BCS Application অথবা Non-Cadre অপশনে ক্লিক করুন', 'BPSC Form-1 পূরণ করুন', 'ক্যাডার পছন্দক্রম দিন', 'টেলিটক এসএমএসে ফি পরিশোধ করে প্রবেশপত্র নিশ্চিত করুন'],
    required_info: ['nid', 'photo_data', 'phone', 'father_bn', 'mother_bn', 'ssc_roll', 'hsc_roll'],
    description: 'বিসিএস ক্যাডার এবং ৯ম-১২তম গ্রেড নন-ক্যাডার সরকারি পদের সরাসরি অনলাইন আবেদন পোর্টাল।',
    is_active: 1
  },
  {
    id: 122, title: 'টেলিটক AllJobs — সকল সরকারি চাকরির কেন্দ্রীয় আবেদন', level: 'job', org: 'টেলিটক বাংলাদেশ লিমিটেড',
    apply_link: 'https://alljobs.teletalk.com.bd/', direct_form_url: 'https://alljobs.teletalk.com.bd/',
    fee: 'বিজ্ঞপ্তি অনুযায়ী (৳১০০–৳১,০০০)',
    start_date: '2026-01-01', deadline: '2026-12-31',
    steps: ['alljobs.teletalk.com.bd পোর্টালে যান', 'চলমান সকল সরকারি ও স্বায়ত্তশাসিত প্রতিষ্ঠানের চাকরি তালিকা দেখুন', 'নির্দিষ্ট পদের পাশে "Apply" বাটনে চাপুন', 'AllJobs প্রিমিয়াম বা সাধারণ প্রোফাইল থেকে ১-ক্লিকে ফর্ম পূরণ করুন'],
    required_info: ['nid', 'photo_data', 'phone', 'father_bn', 'mother_bn', 'ssc_roll', 'hsc_roll'],
    description: 'মন্ত্রণালয়, অধিদপ্তর, ব্যাংক, রেলওয়ে ও স্বায়ত্তশাসিত প্রতিষ্ঠানের সকল চলমান চাকরির সরাসরি কেন্দ্রীয় আবেদন পোর্টাল।',
    is_active: 1
  },
  {
    id: 123, title: 'প্রাথমিক বিদ্যালয় সহকারী শিক্ষক নিয়োগ (DPE)', level: 'job', org: 'প্রাথমিক শিক্ষা অধিদপ্তর (DPE)',
    apply_link: 'http://dpe.teletalk.com.bd/', direct_form_url: 'http://dpe.teletalk.com.bd/',
    fee: '৳২২০ (টেলিটক)',
    start_date: '2026-01-01', deadline: '2026-12-31',
    steps: ['dpe.teletalk.com.bd সাইটে যান', 'Assistant Teacher Application Form খুলুন', 'এসএসসি, এইচএসসি ও স্নাতক তথ্য দিন', 'জেলা ও উপজেলা নির্বাচন করুন', 'ফি দিয়ে স্লিপ ডাউনলোড করুন'],
    required_info: ['nid', 'photo_data', 'phone', 'father_bn', 'mother_bn', 'ssc_roll', 'hsc_roll'],
    description: 'সরকারি প্রাথমিক বিদ্যালয়ে সহকারী শিক্ষক পদে সরাসরি অনলাইন আবেদন ও প্রবেশপত্র পোর্টাল।',
    is_active: 1
  }
]

extras.get('/admissions', async (c) => {
  const levelParam = c.req.query('level')
  const level = levelParam && levelParam !== 'all' ? levelParam : null
  try {
    const stmt = level
      ? c.env.DB.prepare('SELECT * FROM admissions WHERE is_active=1 AND level=? ORDER BY id DESC').bind(level)
      : c.env.DB.prepare('SELECT * FROM admissions WHERE is_active=1 ORDER BY id DESC')
    const { results } = await stmt.all()
    const dbItems = (results as any[]).map(a => ({
      ...a,
      steps: typeof a.steps === 'string' ? JSON.parse(a.steps || '[]') : (a.steps || []),
      required_info: typeof a.required_info === 'string' ? JSON.parse(a.required_info || '[]') : (a.required_info || [])
    }))
    
    // যদি DB তে কম এন্ট্রি থাকে, তবে ডিফল্ট রিচ লিস্ট মার্জ করা
    const existingTitles = new Set(dbItems.map(i => i.title.toLowerCase().trim()))
    const filteredDefaults = DEFAULT_ADMISSIONS.filter(d => !existingTitles.has(d.title.toLowerCase().trim()) && (!level || d.level === level))
    const combined = [...dbItems, ...filteredDefaults]
    
    return c.json({ ok: true, admissions: combined })
  } catch (e) {
    const filteredDefaults = level ? DEFAULT_ADMISSIONS.filter(d => d.level === level) : DEFAULT_ADMISSIONS
    return c.json({ ok: true, admissions: filteredDefaults })
  }
})

// ভর্তির জন্য আমার তথ্য (কপি প্যানেল — required_info অনুযায়ী)
extras.get('/admissions/:id/myinfo', requireAuth, async (c) => {
  const user = c.get('user')!
  const idNum = Number(c.req.param('id'))
  let requiredInfoKeys: string[] = []
  
  const adm: any = await c.env.DB.prepare('SELECT required_info FROM admissions WHERE id=? AND is_active=1').bind(idNum).first().catch(() => null)
  if (adm && adm.required_info) {
    requiredInfoKeys = typeof adm.required_info === 'string' ? JSON.parse(adm.required_info || '[]') : adm.required_info
  } else {
    const foundDefault = DEFAULT_ADMISSIONS.find(d => d.id === idNum)
    if (foundDefault) requiredInfoKeys = foundDefault.required_info as string[]
  }
  
  if (!requiredInfoKeys.length) {
    requiredInfoKeys = ['ssc_roll', 'ssc_board', 'ssc_year', 'ssc_reg', 'phone']
  }

  const profile: any = await c.env.DB.prepare('SELECT * FROM profiles WHERE user_id=?').bind(user.id).first().catch(() => null) || {}
  const LABELS: Record<string, string> = {
    ssc_roll: 'SSC রোল', ssc_board: 'SSC বোর্ড', ssc_year: 'SSC পাসের বছর', ssc_reg: 'SSC রেজিস্ট্রেশন', ssc_gpa: 'SSC GPA',
    hsc_roll: 'HSC রোল', hsc_board: 'HSC বোর্ড', hsc_year: 'HSC পাসের বছর', hsc_reg: 'HSC রেজিস্ট্রেশন', hsc_gpa: 'HSC GPA',
    phone: 'মোবাইল নম্বর', photo_data: 'ছবি', nid: 'NID', birth_reg: 'জন্ম নিবন্ধন', dob: 'জন্ম তারিখ',
    father_bn: 'পিতার নাম', mother_bn: 'মাতার নাম', district: 'জেলা'
  }
  const info = requiredInfoKeys.map(k => ({
    key: k, label: LABELS[k] || k,
    value: k === 'phone' ? (user as any).phone : (k === 'photo_data' ? (profile.photo_data ? '__PHOTO__' : '') : (profile[k] || '')),
    filled: k === 'phone' ? true : !!(profile[k])
  }))
  return c.json({ ok: true, info, has_photo: !!profile.photo_data })
})

// এডমিন: ভর্তি CRUD
extras.get('/admin/admissions', requireAdmin, async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM admissions ORDER BY id DESC').all()
  const items = (results as any[]).map(a => ({ ...a, steps: JSON.parse(a.steps || '[]'), required_info: JSON.parse(a.required_info || '[]') }))
  return c.json({ ok: true, admissions: items })
})
extras.post('/admin/admissions', requireAdmin, async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b?.title) return c.json({ ok: false, error: 'শিরোনাম দিন' }, 400)
  const steps = Array.isArray(b.steps) ? JSON.stringify(b.steps.slice(0, 20).map((s: any) => String(s).slice(0, 300))) : '[]'
  const req = Array.isArray(b.required_info) ? JSON.stringify(b.required_info.slice(0, 20)) : '[]'
  const r = await c.env.DB.prepare(`INSERT INTO admissions (title, level, org, apply_link, fee, start_date, deadline, steps, required_info, description, is_active)
    VALUES (?,?,?,?,?,?,?,?,?,?,1)`)
    .bind(String(b.title).slice(0, 200), b.level || 'hsc', b.org || '', b.apply_link || '', b.fee || '', b.start_date || null, b.deadline || null, steps, req, b.description || '').run()
  return c.json({ ok: true, id: r.meta.last_row_id })
})
extras.put('/admin/admissions/:id', requireAdmin, async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)
  const steps = Array.isArray(b.steps) ? JSON.stringify(b.steps.slice(0, 20).map((s: any) => String(s).slice(0, 300))) : null
  const req = Array.isArray(b.required_info) ? JSON.stringify(b.required_info.slice(0, 20)) : null
  await c.env.DB.prepare(`UPDATE admissions SET title=COALESCE(?,title), level=COALESCE(?,level), org=COALESCE(?,org), apply_link=COALESCE(?,apply_link),
    fee=COALESCE(?,fee), start_date=COALESCE(?,start_date), deadline=COALESCE(?,deadline), steps=COALESCE(?,steps), required_info=COALESCE(?,required_info),
    description=COALESCE(?,description), is_active=COALESCE(?,is_active) WHERE id=?`)
    .bind(b.title ?? null, b.level ?? null, b.org ?? null, b.apply_link ?? null, b.fee ?? null, b.start_date ?? null, b.deadline ?? null,
      steps, req, b.description ?? null, (b.is_active === 0 || b.is_active === 1) ? b.is_active : null, c.req.param('id')).run()
  return c.json({ ok: true })
})
extras.delete('/admin/admissions/:id', requireAdmin, async (c) => {
  await c.env.DB.prepare('DELETE FROM admissions WHERE id=?').bind(c.req.param('id')).run()
  return c.json({ ok: true })
})

export default extras
