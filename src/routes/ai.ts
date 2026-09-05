// এডুসব ফেজ-৬ — AI সহকারী: সাইট-গাইড (রুল-ভিত্তিক, ইনস্ট্যান্ট) + Workers AI (পড়াশোনা)
import { Hono } from 'hono'
import { Bindings, getCookie, getSessionUser } from '../lib/auth'

type Env = { Bindings: Bindings & { AI?: any } }
const ai = new Hono<Env>()

// ---------- সাইট নলেজ বেস: কীওয়ার্ড → উত্তর + লিংক ----------
type Guide = { kw: RegExp; answer: string; link?: string; linkText?: string }
const GUIDES: Guide[] = [
  { kw: /রেজাল্ট|ফলাফল|result|ssc.*দেখ|hsc.*দেখ|মার্কশিট/i,
    answer: 'রেজাল্ট হাব-এ SSC, HSC, JSC, NU অনার্স (১ম-৪র্থ বর্ষ), ডিগ্রি ও মাস্টার্স — সব রেজাল্টের একাধিক ব্যাকআপ লিংক আছে, সার্ভার ডাউন থাকলে অটো পরের লিংক দেখানো হয়। প্রতিটিতে ধাপে ধাপে সহায়িকাও পাবেন।',
    link: '/results', linkText: 'রেজাল্ট হাবে যান' },
  { kw: /cv|সিভি|জীবনবৃত্তান্ত|বায়োডাটা|resume/i,
    answer: 'CV মেকারে ১০টি প্রিমিয়াম ডিজাইন আছে — সরল বাংলা টেমপ্লেট সম্পূর্ণ ফ্রি! প্রোফাইলের তথ্য অটো বসে যায়, বাংলা+ইংরেজি দুই ভাষাতেই বানানো যায়।',
    link: '/cv', linkText: 'CV বানান' },
  { kw: /mcq|এমসিকিউ|মডেল টেস্ট|কুইজ|প্রশ্ন.*(অনুশীলন|প্র্যাকটিস)/i,
    answer: 'MCQ সেকশনে বিষয়/অধ্যায়ভিত্তিক পরীক্ষা দিতে পারবেন। ভুল প্রশ্নগুলো অটো "ভুল ব্যাংকে" জমা হয় এবং ১→৩→৭ দিনের স্মার্ট রিভিশন শিডিউলে ফিরে আসে।',
    link: '/mcq', linkText: 'MCQ পরীক্ষা দিন' },
  { kw: /চাকরি|জব|job|নিয়োগ|সার্কুলার|circular/i,
    answer: 'চাকরির পাতায় সরকারি (টেলিটক), ব্যাংক ও বেসরকারি চাকরির খবর আছে — আপনার শিক্ষাস্তর অনুযায়ী ফিল্টার করে দেখতে পারবেন। ডেডলাইনও দেখানো হয়।',
    link: '/jobs', linkText: 'চাকরির খবর দেখুন' },
  { kw: /cgpa|সিজিপিএ|জিপিএ|gpa|গ্রেড/i,
    answer: 'CGPA ক্যালকুলেটরে গ্রেড থেকে CGPA হিসাব করা যায়, আর টার্গেট ক্যালকুলেটরে দেখা যায় — টার্গেট CGPA পেতে সামনের কোর্সগুলোতে কত পেতে হবে।',
    link: '/cgpa', linkText: 'CGPA ক্যালকুলেটর' },
  { kw: /সিলেবাস|syllabus|পাঠ্যসূচি|বই.*(ডাউনলোড|pdf)/i,
    answer: 'সিলেবাস পাতায় SSC/HSC/NU/মাস্টার্স — শিক্ষাস্তর অনুযায়ী NCTB ও NU-এর অফিসিয়াল সিলেবাস ও বইয়ের লিংক সাজানো আছে, সব ফ্রি।',
    link: '/syllabus', linkText: 'সিলেবাস দেখুন' },
  { kw: /প্ল্যানার|রুটিন|পড়ার.*(পরিকল্পনা|প্ল্যান)|planner|নোট/i,
    answer: 'স্টাডি প্ল্যানারে পড়ার টাস্ক ও ডেডলাইন রাখতে পারবেন, আর অধ্যায়ভিত্তিক নোটও লিখে রাখা যায় — সব অটো-সেভ হয়।',
    link: '/planner', linkText: 'প্ল্যানার খুলুন' },
  { kw: /নিউজ|খবর|সংবাদ|news/i,
    answer: 'নিউজ পাতায় দেশের শীর্ষ সংবাদ (প্রথম আলো, বিডিনিউজ২৪ প্রভৃতি RSS থেকে অটো) + শিক্ষা ও চাকরি ফিল্টার আছে।',
    link: '/news', linkText: 'নিউজ পড়ুন' },
  { kw: /নোটিস|notice|বিজ্ঞপ্তি/i,
    answer: 'নোটিস পাতায় NU, বোর্ড, DSHE, NTRCA-সহ শিক্ষা সংক্রান্ত নোটিস ক্যাটাগরি অনুযায়ী পাবেন।',
    link: '/notices', linkText: 'নোটিস দেখুন' },
  { kw: /শপ|কিন|প্রোডাক্ট|অর্ডার|shop|delivery|ডেলিভারি/i,
    answer: 'এডুসব শপে শিক্ষা উপকরণ কিনতে পারবেন — লগইন ছাড়াই ক্যাশ অন ডেলিভারি, আর লগইন করলে ওয়ালেট দিয়েও পেমেন্ট করা যায়।',
    link: '/shop', linkText: 'শপে যান' },
  { kw: /ওয়ালেট|টাকা.*(যোগ|রিচার্জ|অ্যাড)|টপ.?আপ|বিকাশ|নগদ|bkash|nagad|পেমেন্ট/i,
    answer: 'ওয়ালেট পাতায় বিকাশ/নগদে টাকা পাঠিয়ে TrxID ও স্ক্রিনশট দিলে এডমিন যাচাই করে ব্যালেন্স যোগ করে দেন। ওয়ালেট দিয়ে CV, শপ ও অ্যাসিস্টেড সার্ভিসে পেমেন্ট করা যায়।',
    link: '/wallet', linkText: 'ওয়ালেটে যান' },
  { kw: /অ্যাসিস্টেড|আবেদন.*(করে দ|সাহায্য)|এডমিন.*আবেদন|form.*fill|ফরম.*(পূরণ|ফিলাপ)/i,
    answer: 'অ্যাসিস্টেড আবেদন সার্ভিসে আপনার হয়ে এডমিন-ই আবেদন করে দেবেন! রিকোয়েস্ট দিলে এডমিন ফি জানাবেন, ওয়ালেট থেকে পেমেন্ট করলেই কাজ শুরু।',
    link: '/assisted', linkText: 'অ্যাসিস্টেড আবেদন' },
  { kw: /ছবি|স্বাক্ষর|সাইন|রিসাইজ|resize|photo|300x300/i,
    answer: 'প্রোফাইলে ছবি ও স্বাক্ষর একবার আপলোড করে রাখলে, CV মেকারের রিসাইজ টুল দিয়ে যেকোনো আবেদনের নির্ধারিত সাইজে (যেমন 300×300px) এক ক্লিকে রিসাইজ+ডাউনলোড করতে পারবেন।',
    link: '/cv', linkText: 'রিসাইজ টুল' },
  { kw: /প্রোফাইল|profile|তথ্য.*(সেভ|আপডেট)|nid|জন্মনিবন্ধন/i,
    answer: 'প্রোফাইলে নাম, পিতা-মাতা, NID/জন্মনিবন্ধন, ঠিকানা, শিক্ষাগত তথ্য, ছবি-স্বাক্ষর — সব সেভ থাকে। কপি প্যানেল থেকে এক ক্লিকে যেকোনো তথ্য কপি করে অন্য সাইটে আবেদনে ব্যবহার করতে পারবেন।',
    link: '/profile', linkText: 'প্রোফাইলে যান' },
  { kw: /রেফার|referral|বন্ধু.*(আন|ইনভাইট)|invite/i,
    answer: 'রেফারেল সিস্টেম: সাইন-আপ পেজে আপনার ইউজার আইডি (EDU-XXXX-XXXXX) রেফারেল কোড হিসেবে দিলে আপনি ও আপনার বন্ধু — দুজনেই ওয়ালেটে বোনাস ক্রেডিট পাবেন! আপনার কোড ড্যাশবোর্ডে পাবেন।',
    link: '/dashboard', linkText: 'আমার রেফারেল কোড' },
  { kw: /সাইন.?আপ|রেজিস্ট|অ্যাকাউন্ট.*(খুল|তৈরি)|signup|register/i,
    answer: 'ফ্রি সাইন-আপ করলেই পাবেন: ইউনিক আইডি, সাইনআপ বোনাস ক্রেডিট, ধর্মভিত্তিক থিমসহ ড্যাশবোর্ড, MCQ, প্ল্যানার, CV মেকার — সব ফ্রি!',
    link: '/signup', linkText: 'ফ্রি সাইন-আপ' },
  { kw: /লগ.?ইন|login|পাসওয়ার্ড/i,
    answer: 'মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে লগইন করুন। পাসওয়ার্ড ভুলে গেলে হোয়াটসঅ্যাপে এডমিনের সাথে যোগাযোগ করুন (সবুজ বাটন)।',
    link: '/login', linkText: 'লগইন করুন' },
  { kw: /নামাজ|সালাত|ইফতার|সেহরি|হিজরি/i,
    answer: 'মুসলিম ইউজারদের ড্যাশবোর্ডে জেলাভিত্তিক নামাজের সময়, হিজরি তারিখ ও রোজা/ঈদ কাউন্টডাউন দেখানো হয় (AlAdhan API)।',
    link: '/dashboard', linkText: 'ড্যাশবোর্ডে দেখুন' },
  { kw: /একাদশী|পূর্ণিমা|অমাবস্যা|তিথি|পূজা|পঞ্জিকা/i,
    answer: 'সনাতনী ইউজারদের ড্যাশবোর্ডে আজকের তিথি, একাদশী/পূর্ণিমা/অমাবস্যা ও বাংলা সন দেখানো হয় — রিয়েলটাইম গণনায়।',
    link: '/dashboard', linkText: 'ড্যাশবোর্ডে দেখুন' },
  { kw: /যোগাযোগ|contact|হোয়াটসঅ্যাপ|whatsapp|নম্বর/i,
    answer: 'ডান-নিচের সবুজ হোয়াটসঅ্যাপ বাটনে ক্লিক করলে সরাসরি এডমিনের সাথে চ্যাট করতে পারবেন।' },
  { kw: /এডুসব|edusob|সাইট.*(কী|কি)|কী.*(পাওয়া|আছে)|ফিচার|help|সাহায্য/i,
    answer: 'এডুসব — শিক্ষার সব, এক ঠিকানায়! এখানে পাবেন: 📊 রেজাল্ট হাব, 📰 নিউজ, 💼 চাকরি, 📝 MCQ ও মডেল টেস্ট, 📅 স্টাডি প্ল্যানার, 🧮 CGPA ক্যালকুলেটর, 📄 CV মেকার (১০ ডিজাইন), 🛒 শপ, 💰 ওয়ালেট, 🤝 অ্যাসিস্টেড আবেদন। কোনটা দরকার বলুন!' },
]

function matchGuide(msg: string): Guide | null {
  for (const g of GUIDES) if (g.kw.test(msg)) return g
  return null
}

// ---------- চ্যাট এন্ডপয়েন্ট (পাবলিক — গেস্টও ব্যবহার করতে পারবে) ----------
ai.post('/chat', async (c) => {
  const body = await c.req.json<any>().catch(() => null)
  const message = String(body?.message || '').trim().slice(0, 500)
  if (!message) return c.json({ ok: false, error: 'প্রশ্ন লিখুন' }, 400)

  // ১) সাইট-গাইড ইনটেন্ট ম্যাচ — ইনস্ট্যান্ট, খরচ শূন্য
  const guide = matchGuide(message)
  if (guide) {
    return c.json({ ok: true, source: 'guide', answer: guide.answer, link: guide.link || null, link_text: guide.linkText || null })
  }

// ২) পড়াশোনা/সাধারণ প্রশ্ন → Gemini API বা Workers AI (থাকলে)
  const geminiKey = (c.env as any).GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined)
  if (geminiKey) {
    try {
      const { GoogleGenAI } = await import('@google/genai')
      const aiClient = new GoogleGenAI({ apiKey: geminiKey })
      const token = getCookie(c.req.header('Cookie'), 'edusob_session')
      const user = await getSessionUser(c.env.DB, token)
      const systemInstruction = 'তুমি "এডুসব AI" — বাংলাদেশের শিক্ষার্থীদের সহকারী। সবসময় সহজ বাংলায়, সংক্ষেপে (সর্বোচ্চ ১২০ শব্দ) উত্তর দাও। পড়াশোনা (SSC/HSC/NU সিলেবাস, বাংলা, ইংরেজি, গণিত, বিজ্ঞান, সাধারণ জ্ঞান), পরীক্ষা প্রস্তুতি ও ক্যারিয়ার বিষয়ে সাহায্য করো। নিশ্চিত না হলে "নিশ্চিত নই" বলো — ভুল তথ্য দিও না।' + (user ? ` ব্যবহারকারীর নাম: ${user.name_bn}।` : '')
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: message,
        config: {
          systemInstruction,
          maxOutputTokens: 1200
        }
      })
      const answer = response.text ? response.text.trim() : ''
      if (answer) return c.json({ ok: true, source: 'ai', answer, link: null, link_text: null })
    } catch (e) {
      console.warn('Gemini chat fallback:', e)
    }
  }

  const AI = (c.env as any).AI
  if (AI) {
    try {
      const token = getCookie(c.req.header('Cookie'), 'edusob_session')
      const user = await getSessionUser(c.env.DB, token)
      const res: any = await AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
        messages: [
          { role: 'system', content: 'তুমি "এডুসব AI" — বাংলাদেশের শিক্ষার্থীদের সহকারী। সবসময় সহজ বাংলায়, সংক্ষেপে (সর্বোচ্চ ১২০ শব্দ) উত্তর দাও। পড়াশোনা (SSC/HSC/NU সিলেবাস, বাংলা, ইংরেজি, গণিত, বিজ্ঞান, সাধারণ জ্ঞান), পরীক্ষা প্রস্তুতি ও ক্যারিয়ার বিষয়ে সাহায্য করো। নিশ্চিত না হলে "নিশ্চিত নই" বলো — ভুল তথ্য দিও না।' + (user ? ` ব্যবহারকারীর নাম: ${user.name_bn}।` : '') },
          { role: 'user', content: message },
        ],
        max_tokens: 400,
      })
      const answer = String(res?.response || '').trim()
      if (answer) return c.json({ ok: true, source: 'ai', answer, link: null, link_text: null })
    } catch { /* ফলব্যাকে যাবে */ }
  }

  // ৩) ফলব্যাক — সাজেশনসহ
  return c.json({
    ok: true, source: 'fallback',
    answer: 'এই প্রশ্নটা ঠিক বুঝতে পারিনি 😅 আমি সাইট ব্যবহারে সবচেয়ে ভালো সাহায্য করতে পারি — যেমন: "রেজাল্ট কীভাবে দেখবো?", "CV বানাতে চাই", "ওয়ালেটে টাকা যোগ করবো কীভাবে?", "রেফারেল কী?" — এভাবে জিজ্ঞেস করুন। জটিল প্রশ্নের জন্য হোয়াটসঅ্যাপে এডমিনকে জিজ্ঞেস করতে পারেন (সবুজ বাটন)।',
    link: null, link_text: null,
  })
})

export default ai
