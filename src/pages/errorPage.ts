/**
 * ৪০৪ পেজ (`/src/pages/errorPage.ts`).
 *
 * এর আগে সাইটে কোনো ডিজাইন করা ৪০৪ পেজই ছিল না — অজানা লিংকে শুধু
 * `404 Not Found` (১৩ বাইট প্লেইন-টেক্সট) আসত। প্রিমিয়াম সাইটে এটি বড় ফাঁক:
 * ভুল লিংকে আসা মানুষ সাথে সাথে চলে যান।
 *
 * এই পেজটি তাই করার চেষ্টা করে:
 *   ১. কী হয়েছে তা বাংলায় সহজ ভাষায় বলা (তক্তা-পড়ানো "Error 404" নয়)
 *   ২. জনপ্রিয় গন্তব্যে সরাসরি লিংক — যাতে মানুষ থেমে যায়, ফিরে না যায়
 *   ৩. ⌘K কমান্ড-প্যালেটের ইঙ্গিত (সাইটে আগেই আছে) — যেকোনো কিছু খোঁজার পথ
 *   ৪. হেল্পলাইন — কেউ আটকে গেলে কী করবে, তার ঠিকানা
 *
 * `noindex` জরুরি: ৪০৪ পেজ সার্চ ইঞ্জিনে ইনডেক্স হওয়া চলবে না।
 */
import { pageShell, siteHeader } from './layout'

/** জনপ্রিয় গন্তব্য — ভুল লিংকে আসা মানুষকে আবার পথ দেখানো */
const DESTINATIONS = [
  { href: '/', label: 'হোম', desc: 'শুরু থেকে দেখুন', icon: 'fa-house' },
  { href: '/results', label: 'রেজাল্ট হাব', desc: 'এসএসসি/এইচএসসি ফলাফল', icon: 'fa-award' },
  { href: '/admission', label: 'ভর্তি হাব', desc: 'বিশ্ববিদ্যালয় ভর্তি তথ্য', icon: 'fa-building-columns' },
  { href: '/mcq', label: 'MCQ মডেল টেস্ট', desc: 'অনুশীলন ও প্রস্তুতি', icon: 'fa-list-check' },
  { href: '/cgpa', label: 'CGPA ক্যালকুলেটর', desc: 'ক্রেডিট-ভিত্তিক হিসাব', icon: 'fa-calculator' },
  { href: '/teacher-support', label: 'শিক্ষক সহায়তা', desc: '১-অন-১ প্রশ্নের উত্তর', icon: 'fa-chalkboard-user' },
  { href: '/scholarships', label: 'স্কলারশিপ', desc: 'বৃত্তির খোঁজ', icon: 'fa-graduation-cap' },
  { href: '/shop', label: 'এডুসব শপ', desc: 'খাতা, নোট ও প্রস্তুতি সামগ্রী', icon: 'fa-bag-shopping' },
]

const EXTRA_CSS = `
.nf-404 { font-size: clamp(5rem, 22vw, 11rem); font-weight: 900; line-height: 0.85; letter-spacing: -0.05em;
  background: linear-gradient(135deg, #fbbf24 0%, #f97316 45%, #ea580c 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.nf-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.10); border-radius: 1rem;
  transition: border-color .18s, background-color .18s, transform .18s; }
.nf-card:hover { border-color: rgba(251,146,60,0.5); background: rgba(251,146,60,0.08); transform: translateY(-2px); }
`

/**
 * ৪০৪ পেজ।
 * @param loggedIn  হেডারে সঠিক অবস্থা দেখানোর জন্য
 * @param path      কোন URL-এ ৪০৪ হলো (ইচ্ছে করে রেন্ডার করা হয় না — ওপেন রিডাইরেক্ট/ইনজেকশন এড়াতে)
 */
export function notFoundPage(loggedIn: boolean): string {
  const links = DESTINATIONS.map(
    (d) => `
        <a href="${d.href}" class="nf-card flex items-start gap-3 p-3.5">
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-500/15 text-amber-400">
            <i class="fas ${d.icon} text-sm"></i>
          </span>
          <span class="min-w-0">
            <span class="block text-sm font-bold text-white leading-snug">${d.label}</span>
            <span class="block text-[11px] text-slate-400 leading-snug">${d.desc}</span>
          </span>
        </a>`
  ).join('')

  const content = `
${siteHeader({ theme: 'dark', loggedIn })}
<main class="min-h-screen bg-slate-950 text-white">
  <div class="mx-auto max-w-2xl px-4 py-14 sm:py-20 text-center">

    <p class="nf-404 select-none" aria-hidden="true">৪০৪</p>

    <h1 class="mt-5 text-2xl sm:text-3xl font-extrabold tracking-tight">এই পেজটি পাওয়া যায়নি</h1>
    <p class="mx-auto mt-3 max-w-md text-sm sm:text-base leading-relaxed text-slate-400">
      আপনি যে লিংকে এসেছেন সেটি হয়তো সরিয়ে দেওয়া হয়েছে, ঠিকানা বদলেছে — অথবা টাইপ করতে একটু ভুল হয়েছে।
      চিন্তার কিছু নেই, নিচে থেকে যা খুঁজছেন সেটি বেছে নিন।
    </p>

    <!-- দ্রুত খোঁজার উপায় -->
    <div class="mt-6 flex flex-wrap items-center justify-center gap-2.5">
      <button type="button" onclick="window.dispatchEvent(new KeyboardEvent('keydown',{key:'k',metaKey:true,bubbles:true}))"
        class="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 hover:bg-slate-200 transition">
        <i class="fas fa-magnifying-glass text-xs"></i> যেকোনো কিছু খুঁজুন
        <kbd class="hidden sm:inline rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">⌘K</kbd>
      </button>
      <a href="/" class="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition">
        <i class="fas fa-house text-xs"></i> হোমে যান
      </a>
    </div>

    <!-- জনপ্রিয় গন্তব্য -->
    <h2 class="mt-12 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">জনপ্রিয় পেজ</h2>
    <div class="mt-4 grid grid-cols-1 gap-2.5 text-left sm:grid-cols-2">
      ${links}
    </div>

    <!-- সাহায্য -->
    <div class="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p class="text-sm font-bold text-white">কী খুঁজছিলেন, পাচ্ছেন না?</p>
      <p class="mt-1 text-xs leading-relaxed text-slate-400">
        আমাদের জানান — আমরা নিজেরাই উত্তর দিই। কোনো বট বা স্বয়ংক্রিয় উত্তর নয়।
      </p>
      <div class="mt-3.5 flex flex-wrap justify-center gap-2.5">
        <a href="tel:+8801835414122" class="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 transition">
          <i class="fas fa-phone text-xs"></i> +88 01835414122
        </a>
        <a href="https://wa.me/880183541412" class="inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-bold text-emerald-300 hover:bg-emerald-500/20 transition">
          <i class="fab fa-whatsapp"></i> হোয়াটসঅ্যাপ
        </a>
      </div>
      <p class="mt-3 text-[11px] text-slate-500"><i class="far fa-clock"></i> সকাল ৯টা – রাত ১০টা</p>
    </div>

  </div>
</main>`

  return pageShell('পেজটি পাওয়া যায়নি', 'bg-slate-950 text-white min-h-screen', content, EXTRA_CSS, true, {
    description: 'এডুসবে এই পেজটি পাওয়া যায়নি। হোম, রেজাল্ট, ভর্তি, MCQ ও অন্যান্য জনপ্রিয় পেজে যান।',
    // ৪০৪ পেজ ইনডেক্স করা যাবে না — সার্চ ইঞ্জিনে মৃত লিংক জমা হয়
    noindex: true,
  })
}
