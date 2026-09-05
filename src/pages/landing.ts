// এডুসব — প্রিমিয়াম ডার্ক এডিটরিয়াল ল্যান্ডিং পেজ (Obsidian + Terracotta Redesign)
import { pageShell } from './layout'

export function landingPage(): string {
  const extraHead = `
<style>
.font-display { font-family: 'Syne', 'Hind Siliguri', sans-serif; }
.tab-active { background-color: #f97316 !important; color: #ffffff !important; border-color: #f97316 !important; }
.service-tab-active { background-color: #f97316 !important; color: #ffffff !important; border-color: #f97316 !important; }
.faq-content { max-height: 0; overflow: hidden; transition: max-height 0.35s cubic-bezier(0.16, 1, 0.3, 1), padding 0.3s ease; }
.faq-content.open { max-height: 480px; }
.hero-slider-slide { transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.step-node { position: relative; }
@media (min-width: 1024px) {
  .timeline-track::before {
    content: '';
    position: absolute;
    top: 24px;
    left: 48px;
    right: 48px;
    height: 2px;
    background: rgba(255,255,255,0.08);
    z-index: 1;
  }
}
::selection { background: #f97316; color: #0b0d12; }
.hero-glow {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(circle at 30% 15%, rgba(249,115,22,0.14) 0%, rgba(6,182,212,0.05) 45%, transparent 75%);
}
@keyframes marquee-drift { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.marquee-track { animation: marquee-drift 42s linear infinite; }
.marquee-track:hover { animation-play-state: paused; }
.text-outline { -webkit-text-stroke: 1px rgba(249,115,22,0.55); color: transparent; }
.grain::after {
  content: ""; position: fixed; inset: 0; z-index: 60; pointer-events: none; opacity: 0.045;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
</style>`

  const html = `
<!-- ১. প্রিমিয়াম ইউটিলিটি বার -->
<div class="bg-[#090b0f] text-slate-400 text-xs border-b border-white/5 select-none">
  <div class="max-w-7xl mx-auto px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-2">
    <div class="flex items-center gap-4 flex-wrap justify-center md:justify-start">
      <a href="tel:+8801835414122" class="hover:text-orange-400 flex items-center gap-1.5 transition">
        <i class="fas fa-headset text-orange-400"></i> হেল্পলাইন: <span class="font-en font-semibold text-slate-100">+88 01835414122</span>
      </a>
      <span class="text-slate-700 hidden sm:inline">•</span>
      <a href="mailto:support@edusob.com" class="hover:text-orange-400 flex items-center gap-1.5 transition">
        <i class="fas fa-envelope text-slate-500"></i> support@edusob.com
      </a>
      <span class="text-slate-700 hidden sm:inline">•</span>
      <span class="flex items-center gap-1.5 text-amber-400 font-medium">
        <span class="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_2px_rgba(251,191,36,0.6)]"></span> প্রতিদিন সকাল ৯টা – রাত ১০টা
      </span>
    </div>

    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10 text-[11px] text-slate-300">
        <span class="bg-orange-500 text-white font-bold px-1.5 py-0.2 rounded text-[10px]">আপডেট</span>
        <span class="truncate max-w-xs sm:max-w-md">২০২৬ সেশনের ভর্তি, রেজাল্ট ও প্রশ্নব্যাংক লাইভ</span>
      </div>
    </div>
  </div>
</div>

<!-- ২. গ্লাস ন্যাভিগেশন -->
<header class="sticky top-0 z-40 bg-[#0b0d12]/85 backdrop-blur-xl border-b border-white/10">
  <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
    <a href="/" class="flex items-center gap-3 group">
      <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(249,115,22,0.35)] group-hover:scale-105 transition-transform">
        <i class="fas fa-graduation-cap text-lg"></i>
      </div>
      <div class="flex flex-col">
        <div class="flex items-center gap-1.5">
          <span class="font-display text-xl font-bold text-white tracking-tight">এডুসব</span>
          <span class="text-[10px] font-bold px-2 py-0.5 bg-orange-500/10 text-orange-300 border border-orange-500/30 rounded-full font-en">EduSob</span>
        </div>
        <span class="text-[11px] text-slate-500 -mt-0.5 font-medium">শিক্ষার সব, এক ঠিকানায়</span>
      </div>
    </a>

    <nav class="hidden lg:flex items-center gap-1 text-[13px] font-semibold text-slate-300">
      <a href="/" class="px-3.5 py-2 rounded-xl text-orange-300 bg-orange-500/10 font-bold transition">হোম</a>
      <a href="/results" class="px-3.5 py-2 rounded-xl hover:text-orange-300 hover:bg-white/5 transition">রেজাল্ট হাব</a>
      <a href="/admission" class="px-3.5 py-2 rounded-xl hover:text-orange-300 hover:bg-white/5 transition">ভর্তি হাব</a>
      <a href="/cv" class="px-3.5 py-2 rounded-xl hover:text-orange-300 hover:bg-white/5 transition">সিভি মেকার</a>
      <a href="/scholarships" class="px-3.5 py-2 rounded-xl text-amber-300 hover:text-amber-200 bg-amber-400/10 hover:bg-amber-400/15 border border-amber-400/20 transition flex items-center gap-1.5">
        <i class="fas fa-award text-amber-400 text-xs"></i> স্কলারশিপ <span class="text-[9px] bg-amber-400/20 text-amber-200 px-1.5 py-0.2 rounded font-bold">AI</span>
      </a>

      <div class="relative group">
        <button class="px-3.5 py-2 rounded-xl hover:text-orange-300 hover:bg-white/5 transition flex items-center gap-1.5">
          <span>টুলস ও সেবা</span>
          <i class="fas fa-chevron-down text-[10px] text-slate-500 group-hover:rotate-180 transition-transform"></i>
        </button>
        <div class="absolute left-0 mt-1 w-64 bg-[#121620] border border-white/10 rounded-2xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
          <a href="/teacher-support" class="flex items-center gap-3 px-4 py-2.5 text-xs text-amber-300 hover:bg-amber-400/10 font-bold">
            <span class="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center text-sm">👨‍🏫</span>
            <div>
              <p>শিক্ষক ও মেন্টর সহায়তা</p>
              <p class="text-[10px] text-slate-500 font-normal">১৫-৩০ মিনিটে সমাধান</p>
            </div>
          </a>
          <a href="/qpapers" class="flex items-center gap-3 px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5">
            <span class="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center text-sm"><i class="fas fa-file-pdf"></i></span>
            <div>
              <p class="font-bold">প্রশ্নপত্র ও মডেল টেস্ট</p>
              <p class="text-[10px] text-slate-500">বোর্ড প্রশ্ন PDF ডাউনলোড</p>
            </div>
          </a>
          <a href="/mcq" class="flex items-center gap-3 px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5">
            <span class="w-8 h-8 rounded-lg bg-teal-400/10 text-teal-300 flex items-center justify-center text-sm"><i class="fas fa-list-check"></i></span>
            <div>
              <p class="font-bold">MCQ প্র্যাকটিস হাব</p>
              <p class="text-[10px] text-slate-500">স্পেসড রিপিটেশন রিভিশন</p>
            </div>
          </a>
          <a href="/planner" class="flex items-center gap-3 px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5">
            <span class="w-8 h-8 rounded-lg bg-purple-400/10 text-purple-300 flex items-center justify-center text-sm"><i class="fas fa-calendar-check"></i></span>
            <div>
              <p class="font-bold">স্টাডি প্ল্যানার</p>
              <p class="text-[10px] text-slate-500">পড়ার রুটিন ও ট্র্যাকিং</p>
            </div>
          </a>
          <a href="/cgpa" class="flex items-center gap-3 px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5">
            <span class="w-8 h-8 rounded-lg bg-sky-400/10 text-sky-300 flex items-center justify-center text-sm"><i class="fas fa-calculator"></i></span>
            <div>
              <p class="font-bold">CGPA ক্যালকুলেটর</p>
              <p class="text-[10px] text-slate-500">NU ও বোর্ড গ্রেডিং সিস্টেম</p>
            </div>
          </a>
          <div class="border-t border-white/5 my-1"></div>
          <a href="/shop" class="feature-shop-link flex items-center gap-3 px-4 py-2 text-xs text-slate-300 hover:bg-white/5">
            <i class="fas fa-store text-orange-400 w-4"></i> এডুসব স্টুডেন্ট শপ
          </a>
          <a href="/jobs" class="flex items-center gap-3 px-4 py-2 text-xs text-slate-300 hover:bg-white/5">
            <i class="fas fa-briefcase text-slate-500 w-4"></i> চাকরির সার্কুলার
          </a>
        </div>
      </div>

      <a href="#about-section" class="px-3.5 py-2 rounded-xl hover:text-orange-300 hover:bg-white/5 transition">পরিচিতি</a>
      <a href="#faq-section" class="px-3.5 py-2 rounded-xl hover:text-orange-300 hover:bg-white/5 transition">জিজ্ঞাসা</a>
      <a href="#contact-section" class="px-3.5 py-2 rounded-xl hover:text-orange-300 hover:bg-white/5 transition">যোগাযোগ</a>
    </nav>

    <div class="flex items-center gap-2 sm:gap-3">
      <a href="/login" class="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border border-white/15 text-slate-300 hover:bg-white/5 hover:border-orange-500/40 transition">
        <i class="fas fa-arrow-right-to-bracket text-xs"></i> লগইন
      </a>
      <a href="/signup" class="inline-flex items-center gap-1.5 text-xs font-extrabold px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.55)]">
        <span>ফ্রি রেজিস্ট্রেশন</span>
        <i class="fas fa-arrow-right text-[10px]"></i>
      </a>
      <button onclick="document.getElementById('mobileNav').classList.toggle('hidden')" class="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-white/15 text-slate-300 hover:bg-white/5 transition" aria-label="মেনু">
        <i class="fas fa-bars text-lg"></i>
      </button>
    </div>
  </div>

  <!-- মোবাইল ড্রয়ার -->
  <div id="mobileNav" class="hidden lg:hidden border-t border-white/10 bg-[#0b0d12] px-4 py-4 space-y-2 text-sm font-semibold text-slate-300 shadow-xl max-h-[85vh] overflow-y-auto no-scrollbar">
    <a href="/" class="flex items-center gap-2.5 p-2.5 rounded-xl bg-orange-500/10 text-orange-300 font-bold"><i class="fas fa-home text-orange-400"></i> হোম পেজ</a>
    <a href="/results" class="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/5"><i class="fas fa-graduation-cap text-amber-400"></i> রেজাল্ট ও মার্কশিট হাব</a>
    <a href="/teacher-support" class="flex items-center justify-between p-2.5 rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/20 font-bold">
      <span class="flex items-center gap-2"><i class="fas fa-chalkboard-user text-amber-400"></i> শিক্ষক ও মেন্টর সহায়তা</span>
      <span class="text-[10px] bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-full font-bold">NEW</span>
    </a>
    <a href="/scholarships" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5">
      <span class="flex items-center gap-2"><i class="fas fa-award text-amber-400"></i> স্কলারশিপ হাব</span>
      <span class="text-[10px] bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded font-bold">AI পথ</span>
    </a>
    <a href="/qpapers" class="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/5"><i class="fas fa-file-pdf text-orange-400"></i> প্রশ্নপত্র ও মডেল টেস্ট (PDF)</a>
    <a href="/admission" class="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/5"><i class="fas fa-door-open text-sky-400"></i> ভর্তি হাব</a>
    <a href="/cv" class="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/5"><i class="fas fa-file-invoice text-indigo-400"></i> ১-৩ পেজ সিভি মেকার</a>
    <a href="/mcq" class="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/5"><i class="fas fa-list-check text-teal-400"></i> MCQ মডেল টেস্ট</a>
    <a href="/planner" class="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/5"><i class="fas fa-calendar-check text-purple-400"></i> স্টাডি প্ল্যানার</a>
    <a href="/cgpa" class="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/5"><i class="fas fa-calculator text-sky-400"></i> CGPA ক্যালকুলেটর</a>
    <div class="pt-3 border-t border-white/5 flex gap-2">
      <a href="/login" class="flex-1 text-center py-2.5 rounded-xl border border-white/15 text-xs font-bold text-slate-300">লগইন</a>
      <a href="/signup" class="flex-1 text-center py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold">রেজিস্ট্রেশন</a>
    </div>
  </div>
</header>

<!-- ৩. রিয়েলটাইম নোটিস টিকার -->
<div class="bg-orange-500/[0.06] border-b border-orange-500/20 py-2 select-none overflow-hidden">
  <div class="max-w-7xl mx-auto px-4 flex items-center gap-3">
    <span class="bg-orange-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1 uppercase tracking-wider">
      <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> লাইভ নোটিস
    </span>
    <div class="overflow-hidden relative w-full">
      <div id="ticker-track" class="flex whitespace-nowrap ticker-track text-xs font-medium text-orange-200/90">
        <span class="mx-6">👨‍🏫 <strong>নতুন ফিচার:</strong> ১-অন-১ প্রিমিয়াম শিক্ষক ও মেন্টর সহায়তা — ১৫-৩০ মিনিটে স্টেপ-বাই-স্টেপ সমাধান নিন!</span>
        <span class="mx-6">📢 এডুসব রেজাল্ট হাব — জাতীয় ও সকল শিক্ষা বোর্ডের ফলাফল একাধিক ব্যাকআপ লিংকে লাইভ।</span>
        <span class="mx-6">🎓 প্রফেশনাল ১, ২ ও ৩ পেজ সিভি মেকার — ১৪টি স্ট্যান্ডার্ড টেমপ্লেটে পিডিএফ ডাউনলোড।</span>
        <span class="mx-6">📚 ৫০,০০০+ প্রশ্নব্যাংক ও প্রতিদিনের মডেল টেস্টে অংশ নিন সম্পূর্ণ ফ্রিতে।</span>
      </div>
    </div>
  </div>
</div>

<!-- ৪. হিরো সেকশন -->
<section class="relative bg-[#0b0d12] border-b border-white/5 py-12 md:py-20 overflow-hidden">
  <div class="hero-glow"></div>
  <div class="relative max-w-7xl mx-auto px-4">
    <div class="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">

      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-bold px-3.5 py-1.5 rounded-full">
          <span class="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
          <span>বাংলাদেশের শিক্ষার্থীদের একক ডিজিটাল শিক্ষা প্ল্যাটফর্ম</span>
        </div>

        <h1 class="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.2] tracking-tight">
          পরীক্ষার প্রস্তুতি থেকে ক্যারিয়ার— <br>
          <span class="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">সবকিছু এক ঠিকানায়</span>
        </h1>

        <p class="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl">
          বোর্ড পরীক্ষার দ্রুত ফলাফল, কলেজ ও বিশ্ববিদ্যালয়ের ভর্তি তথ্য, ১-অন-১ শিক্ষক সহায়তা, ৫০,০০০+ প্রশ্নব্যাংক ও প্রফেশনাল সিভি মেকার—সব এক সমন্বিত সিস্টেমে।
        </p>

        <div class="flex items-center gap-2 text-xs text-slate-400">
          <span class="w-5 h-5 rounded-full bg-orange-500/15 text-orange-400 flex items-center justify-center text-[10px] font-bold">✓</span>
          <span><strong class="text-slate-200">৯ থেকে ৩০ বছর বয়সী</strong> স্কুল, কলেজ, মাদ্রাসা, বিশ্ববিদ্যালয় শিক্ষার্থী ও চাকরিপ্রার্থীদের জন্য উন্মুক্ত</span>
        </div>

        <div class="flex flex-wrap items-center gap-3 pt-1">
          <a href="/signup" class="px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow-[0_0_24px_rgba(249,115,22,0.4)] hover:shadow-[0_0_36px_rgba(249,115,22,0.6)] transition flex items-center gap-2">
            <span>ফ্রি রেজিস্ট্রেশন করুন</span>
            <i class="fas fa-arrow-right text-xs"></i>
          </a>
          <a href="/results" class="px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 font-bold text-sm border border-white/15 hover:border-cyan-400/40 transition flex items-center gap-2">
            <i class="fas fa-graduation-cap text-orange-400"></i>
            <span>রেজাল্ট চেক</span>
          </a>
          <a href="/teacher-support" class="px-5 py-3 rounded-full bg-amber-400/10 hover:bg-amber-400/15 text-amber-300 font-bold text-sm border border-amber-400/25 transition flex items-center gap-2">
            <span>👨‍🏫 শিক্ষক সহায়তা</span>
            <span class="text-[9px] bg-amber-400/20 text-amber-200 px-1.5 py-0.5 rounded font-black">NEW</span>
          </a>
        </div>

        <div class="bg-[#121620] border border-white/10 rounded-2xl p-4 flex flex-wrap sm:flex-nowrap items-center divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          <div class="w-full sm:w-1/3 py-2 sm:py-0 sm:px-4 text-center sm:text-left">
            <p class="font-display text-2xl font-extrabold text-white leading-tight">১০,০০০<span class="text-orange-500">+</span></p>
            <p class="text-[11px] text-slate-500 font-medium mt-0.5">প্রশ্নব্যাংক ও রিসোর্স</p>
          </div>
          <div class="w-full sm:w-1/3 py-2 sm:py-0 sm:px-4 text-center sm:text-left">
            <p class="font-display text-2xl font-extrabold text-white leading-tight">সকল বোর্ড</p>
            <p class="text-[11px] text-slate-500 font-medium mt-0.5">ফলাফল ও মার্কশিট সাপোর্ট</p>
          </div>
          <div class="w-full sm:w-1/3 py-2 sm:py-0 sm:px-4 text-center sm:text-left">
            <p class="font-display text-2xl font-extrabold text-orange-400 leading-tight">১০০% ফ্রি</p>
            <p class="text-[11px] text-slate-500 font-medium mt-0.5">ডিজিটাল স্টাডি প্ল্যাটফর্ম</p>
          </div>
        </div>
      </div>

      <div class="lg:col-span-5">
        <div class="relative bg-[#121620] rounded-3xl p-3 sm:p-4 shadow-2xl border border-white/10 text-white overflow-hidden">

          <div class="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#090b0f]">
            <div id="slide-1" class="hero-slider-slide absolute inset-0 opacity-100 bg-gradient-to-br from-orange-950/60 via-[#121620] to-slate-950 flex flex-col justify-between p-6">
              <div class="flex items-center justify-between">
                <span class="inline-flex items-center gap-1.5 bg-orange-500/15 text-orange-300 border border-orange-500/30 text-[11px] font-bold px-3 py-1 rounded-full">
                  <i class="fas fa-sparkles text-orange-400"></i> এডুসব লার্নিং হাব ২০২৬
                </span>
                <span class="text-2xl opacity-40">📚</span>
              </div>
              <div class="my-auto text-center py-4">
                <div class="w-14 h-14 mx-auto rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-300 text-2xl mb-3">
                  <i class="fas fa-graduation-cap"></i>
                </div>
                <h4 class="font-display text-lg font-bold text-white">স্মার্ট শিক্ষার্থী প্রস্তুতি প্ল্যাটফর্ম</h4>
                <p class="text-xs text-slate-400 mt-1 max-w-xs mx-auto">বোর্ড পরীক্ষার ফলাফল, সিলেবাস, প্রশ্নব্যাংক ও স্কলারশিপ এক ছাতার নিচে</p>
              </div>
              <div class="border-t border-white/10 pt-3 flex items-center justify-between text-xs text-slate-400">
                <span>১০০% ভেরিফাইড কারিকুলাম</span>
                <span class="text-orange-400 font-bold">৫ লক্ষ+ শিক্ষার্থী ট্রাস্টেড</span>
              </div>
            </div>

            <div id="slide-2" class="hero-slider-slide absolute inset-0 opacity-0 bg-gradient-to-br from-teal-950/60 via-[#121620] to-slate-950 flex flex-col justify-between p-6">
              <div class="flex items-center justify-between">
                <span class="inline-flex items-center gap-1.5 bg-teal-500/15 text-teal-300 border border-teal-500/30 text-[11px] font-bold px-3 py-1 rounded-full">
                  <i class="fas fa-bolt text-teal-400"></i> লাইভ মডেল টেস্ট
                </span>
                <span class="text-2xl opacity-40">📝</span>
              </div>
              <div class="my-auto text-center py-4">
                <div class="w-14 h-14 mx-auto rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 text-2xl mb-3">
                  <i class="fas fa-list-check"></i>
                </div>
                <h4 class="font-display text-lg font-bold text-white">স্মার্ট MCQ প্র্যাকটিস ও এনালাইসিস</h4>
                <p class="text-xs text-slate-400 mt-1 max-w-xs mx-auto">ভুল প্রশ্ন ট্র্যাকিং ও তাৎক্ষণিক ব্যাখ্যা সহ শতভাগ পরীক্ষার প্রস্তুতি</p>
              </div>
              <div class="border-t border-white/10 pt-3 flex items-center justify-between text-xs text-slate-400">
                <span>স্বয়ংক্রিয় মূল্যায়ন</span>
                <span class="text-teal-400 font-bold">রিয়েল-টাইম স্কোর</span>
              </div>
            </div>

            <div id="slide-3" class="hero-slider-slide absolute inset-0 opacity-0 bg-gradient-to-br from-indigo-950/60 via-[#121620] to-slate-950 flex flex-col justify-between p-6">
              <div class="flex items-center justify-between">
                <span class="inline-flex items-center gap-1.5 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold px-3 py-1 rounded-full">
                  <i class="fas fa-id-card text-indigo-400"></i> ক্যারিয়ার হাব
                </span>
                <span class="text-2xl opacity-40">💼</span>
              </div>
              <div class="my-auto text-center py-4">
                <div class="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-2xl mb-3">
                  <i class="fas fa-file-lines"></i>
                </div>
                <h4 class="font-display text-lg font-bold text-white">১-ক্লিক প্রফেশনাল CV ও জব পোর্টাল</h4>
                <p class="text-xs text-slate-400 mt-1 max-w-xs mx-auto">স্কলারশিপ সুযোগ, নোটিস বোর্ড ও ভেরিফাইড আবেদন সহায়তা</p>
              </div>
              <div class="border-t border-white/10 pt-3 flex items-center justify-between text-xs text-slate-400">
                <span>আন্তর্জাতিক স্ট্যান্ডার্ড</span>
                <span class="text-indigo-400 font-bold">PDF ডাউনলোড</span>
              </div>
            </div>

            <div class="absolute bottom-3 right-4 flex gap-1.5 z-10">
              <button onclick="setSlide(0)" id="dot-0" class="w-2.5 h-2.5 rounded-full bg-white transition-all"></button>
              <button onclick="setSlide(1)" id="dot-1" class="w-2.5 h-2.5 rounded-full bg-white/50 transition-all"></button>
              <button onclick="setSlide(2)" id="dot-2" class="w-2.5 h-2.5 rounded-full bg-white/50 transition-all"></button>
            </div>
          </div>

          <div class="pt-3 px-1 flex items-center justify-between text-xs">
            <div class="flex items-center gap-2 text-slate-400 font-semibold">
              <span class="w-2 h-2 rounded-full bg-orange-400"></span>
              <span>এডুসব একাডেমি ও ট্যালেন্ট হাব</span>
            </div>
            <a href="/signup" class="text-orange-400 font-bold hover:underline flex items-center gap-1">
              <span>অংশ নিন</span> <i class="fas fa-arrow-right text-[10px]"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ৪.৫ এডিটরিয়াল মার্কি -->
<div class="overflow-hidden border-b border-white/5 bg-[#0d1017] py-5 select-none">
  <div class="marquee-track flex w-max items-center gap-10 whitespace-nowrap">
    ${(() => {
      const items = ['শিক্ষার সব, এক ঠিকানায়', 'RESULT HUB', 'MCQ PRACTICE', 'CV MAKER', 'SCHOLARSHIP AI', '১-অন-১ মেন্টর সহায়তা', 'ADMISSION HUB']
      const row = items.map((t) => `<span class="flex items-center gap-10"><span class="font-display text-xl sm:text-2xl font-bold uppercase tracking-wide text-outline">${t}</span><span class="w-2 h-2 rotate-45 bg-orange-500/60 inline-block"></span></span>`).join('')
      return row + row + row + row
    })()}
  </div>
</div>

<!-- ৫. পরিচিতি ও ৪টি প্রধান স্তম্ভ -->
<section id="about-section" class="reveal-on-scroll py-16 bg-[#0b0d12] border-b border-white/5">
  <div class="max-w-7xl mx-auto px-4">
    <div class="grid lg:grid-cols-12 gap-12 items-center">

      <div class="lg:col-span-5 space-y-5">
        <span class="font-mono text-orange-400/90 text-xs font-bold uppercase tracking-[0.25em]">এডুসব পরিচিতি</span>
        <h2 class="font-display text-2xl sm:text-3xl font-bold text-white leading-snug">
          দক্ষ, আত্মবিশ্বাসী ও ভবিষ্যৎ-উপযোগী নাগরিক গড়ার অঙ্গীকার
        </h2>
        <p class="text-slate-400 text-sm leading-relaxed">
          বাংলাদেশের প্রতিটি অঞ্চলের শিক্ষার্থীদের কাছে আধুনিক শিক্ষাসেবা সহজে ও সাশ্রয়ী মূল্যে পৌঁছে দেওয়াই এডুসব-এর প্রধান লক্ষ্য। জটিল পরীক্ষার ফলাফল অনুসন্ধান থেকে শুরু করে প্রফেশনাল সিভি তৈরি পর্যন্ত—প্রতিটি ধাপে আমরা আপনার পাশে।
        </p>
        <div class="p-4 rounded-2xl bg-[#121620] border border-white/10 space-y-2 text-xs text-slate-300">
          <p class="font-bold text-white flex items-center gap-2"><i class="fas fa-certificate text-orange-400"></i> আমাদের অঙ্গীকার:</p>
          <p class="leading-relaxed text-slate-400">কোনো বিজ্ঞাপনজনিত বিভ্রান্তি ছাড়া শতভাগ বিশুদ্ধ শিক্ষামূলক সহায়তা ও দ্রুততম সার্ভার রেসপন্স।</p>
        </div>
      </div>

      <div class="lg:col-span-7 grid sm:grid-cols-2 gap-4 stagger-cards">
        <div class="card-hover group relative overflow-hidden p-5 rounded-2xl bg-[#121620] border border-white/[0.08] hover:border-orange-500/40 transition space-y-2">
          <div class="absolute -right-3 -top-4 font-display text-6xl font-extrabold text-white/[0.04] group-hover:text-orange-500/10 transition-colors">০১</div>
          <div class="flex items-center justify-between relative">
            <span class="text-orange-400/80 font-mono font-bold text-sm">০১</span>
            <div class="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center text-sm"><i class="fas fa-bullseye"></i></div>
          </div>
          <h3 class="font-bold text-base text-white">মূল উদ্দেশ্য</h3>
          <p class="text-slate-400 text-xs leading-relaxed">
            দেশের প্রতিটি অঞ্চলের শিক্ষার্থীদের জন্য ডিজিটাল শিক্ষা সহায়তা, নিখুঁত রেজাল্ট ও ক্যারিয়ার গঠন সহজলভ্য করা।
          </p>
        </div>

        <div class="card-hover group relative overflow-hidden p-5 rounded-2xl bg-[#121620] border border-white/[0.08] hover:border-teal-400/40 transition space-y-2">
          <div class="absolute -right-3 -top-4 font-display text-6xl font-extrabold text-white/[0.04] group-hover:text-teal-400/10 transition-colors">০২</div>
          <div class="flex items-center justify-between relative">
            <span class="text-teal-300/80 font-mono font-bold text-sm">০২</span>
            <div class="w-9 h-9 rounded-xl bg-teal-400/10 text-teal-300 flex items-center justify-center text-sm"><i class="fas fa-user-graduate"></i></div>
          </div>
          <h3 class="font-bold text-base text-white">বয়স ও যোগ্যতা</h3>
          <p class="text-slate-400 text-xs leading-relaxed">
            প্রাথমিক, মাধ্যমিক, উচ্চমাধ্যমিক, জাতীয় বিশ্ববিদ্যালয়, মাদ্রাসা ও ডিগ্রি সকল শিক্ষার্থী ও চাকরিপ্রার্থীরা অংশ নিতে পারবেন।
          </p>
        </div>

        <div class="card-hover group relative overflow-hidden p-5 rounded-2xl bg-[#121620] border border-white/[0.08] hover:border-sky-400/40 transition space-y-2">
          <div class="absolute -right-3 -top-4 font-display text-6xl font-extrabold text-white/[0.04] group-hover:text-sky-400/10 transition-colors">০৩</div>
          <div class="flex items-center justify-between relative">
            <span class="text-sky-300/80 font-mono font-bold text-sm">০৩</span>
            <div class="w-9 h-9 rounded-xl bg-sky-400/10 text-sky-300 flex items-center justify-center text-sm"><i class="fas fa-network-wired"></i></div>
          </div>
          <h3 class="font-bold text-base text-white">সেবার ধাপসমূহ</h3>
          <p class="text-slate-400 text-xs leading-relaxed">
            প্রোফাইল তৈরি থেকে শুরু করে অনলাইন অনুশীলন, সরাসরি রেজাল্ট চেক এবং স্বয়ংক্রিয় সিভি তৈরির সমন্বিত ৪টি ধাপ।
          </p>
        </div>

        <div class="card-hover group relative overflow-hidden p-5 rounded-2xl bg-[#121620] border border-white/[0.08] hover:border-amber-400/40 transition space-y-2">
          <div class="absolute -right-3 -top-4 font-display text-6xl font-extrabold text-white/[0.04] group-hover:text-amber-400/10 transition-colors">০৪</div>
          <div class="flex items-center justify-between relative">
            <span class="text-amber-300/80 font-mono font-bold text-sm">০৪</span>
            <div class="w-9 h-9 rounded-xl bg-amber-400/10 text-amber-300 flex items-center justify-center text-sm"><i class="fas fa-gift"></i></div>
          </div>
          <h3 class="font-bold text-base text-white">সুযোগ-সুবিধা</h3>
          <p class="text-slate-400 text-xs leading-relaxed">
            লাইভ রেজাল্ট ট্র্যাকিং, ধর্ম অনুযায়ী পারসোনালাইজড ড্যাশবোর্ড, ফ্রি স্টাডি টুলস এবং এআই চ্যাট সাপোর্ট।
          </p>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ৬. সেবাসমূহ -->
<section id="services-section" class="reveal-on-scroll py-16 bg-[#0d1017] border-b border-white/5">
  <div class="max-w-7xl mx-auto px-4">

    <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
      <div>
        <span class="font-mono text-orange-400/90 text-xs font-bold uppercase tracking-[0.25em]">আমাদের সেবাসমূহ</span>
        <h2 class="font-display text-2xl sm:text-3xl font-bold text-white mt-2">শিক্ষার্থী ও চাকরিপ্রার্থীদের সম্পূর্ণ সমাধান</h2>
        <p class="text-slate-500 text-xs sm:text-sm mt-1">প্রয়োজনীয় প্রতিটি টুলস ও ফিচার সাজানো হয়েছে এক ক্লিকে ব্যবহারের জন্য</p>
      </div>

      <div class="flex items-center gap-1.5 overflow-x-auto p-1 bg-[#121620] border border-white/10 rounded-xl shrink-0 select-none">
        <button onclick="filterServices('all', this)" class="service-tab service-tab-active px-3.5 py-1.5 rounded-lg text-xs font-bold transition">সবগুলো (৮)</button>
        <button onclick="filterServices('exam', this)" class="service-tab px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-200 transition">পরীক্ষা ও রেজাল্ট</button>
        <button onclick="filterServices('prep', this)" class="service-tab px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-200 transition">প্রস্তুতি ও পড়াশোনা</button>
        <button onclick="filterServices('career', this)" class="service-tab px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-200 transition">ক্যারিয়ার ও সিভি</button>
      </div>
    </div>

    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-cards">

      <a href="/teacher-support" class="service-item col-span-1 sm:col-span-2 lg:col-span-1 card-hover bg-gradient-to-br from-amber-400/10 via-orange-500/5 to-[#121620] border-2 border-amber-400/40 rounded-2xl p-5 block group" data-category="prep">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-amber-400/10 border border-amber-400/30 text-amber-300 rounded-xl flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
            👨‍🏫
          </div>
          <span class="text-[10px] bg-amber-400/20 text-amber-200 font-extrabold px-2.5 py-0.5 rounded-full uppercase">PREMIUM · ১৫-৩০ মিনিট</span>
        </div>
        <h3 class="font-extrabold text-white text-base group-hover:text-amber-300 transition">১-অন-১ শিক্ষক ও মেন্টর সহায়তা</h3>
        <p class="text-slate-400 text-xs mt-1.5 leading-relaxed">
          যেকোনো কঠিন গণিত বা বিষয়ভিত্তিক ডাউট প্রশ্ন শিক্ষকের কাছে জমা দিন এবং ধাপে ধাপে বিস্তারিত সমাধান পান।
        </p>
        <div class="mt-4 pt-3 border-t border-amber-400/15 flex items-center justify-between text-xs font-bold text-amber-300">
          <span>প্রশ্ন করুন ও সমাধান নিন</span>
          <i class="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
        </div>
      </a>

      <a href="/results" class="service-item card-hover bg-[#121620] border border-white/[0.08] hover:border-orange-500/40 rounded-2xl p-5 block group transition-colors" data-category="exam">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-orange-500/10 border border-orange-500/25 text-orange-400 rounded-xl flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
            <i class="fas fa-graduation-cap"></i>
          </div>
          <span class="text-[10px] bg-orange-500/15 text-orange-300 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-orange-400 pulse-soft"></span> লাইভ সার্ভার
          </span>
        </div>
        <h3 class="font-bold text-white text-base group-hover:text-orange-300 transition">রেজাল্ট ও মার্কশিট হাব</h3>
        <p class="text-slate-400 text-xs mt-1.5 leading-relaxed">
          SSC, HSC, আলিম, দাখিল ও জাতীয় বিশ্ববিদ্যালয়ের অনার্স/ডিগ্রি/মাস্টার্স পরীক্ষার রেজাল্ট একাধিক ব্যাকআপ লিঙ্কসহ।
        </p>
        <div class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-orange-400">
          <span>রেজাল্ট দেখুন</span>
          <i class="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
        </div>
      </a>

      <a href="/cv" class="service-item card-hover bg-[#121620] border border-white/[0.08] hover:border-indigo-400/40 rounded-2xl p-5 block group transition-colors" data-category="career">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-indigo-400/10 border border-indigo-400/25 text-indigo-300 rounded-xl flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
            <i class="fas fa-file-invoice"></i>
          </div>
          <span class="text-[10px] bg-indigo-400/15 text-indigo-200 font-bold px-2.5 py-0.5 rounded-full">১৪+ ডিজাইন</span>
        </div>
        <h3 class="font-bold text-white text-base group-hover:text-indigo-300 transition">১, ২ ও ৩ পেজ সিভি মেকার</h3>
        <p class="text-slate-400 text-xs mt-1.5 leading-relaxed">
          চাকরি ও স্কলারশিপের জন্য প্রফেশনাল রেজুমে, বায়োডাটা ও মনোগ্রাম হেডারসহ ইনস্ট্যান্ট লাইভ প্রিভিউ ও PDF ডাউনলোড।
        </p>
        <div class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-indigo-300">
          <span>সিভি তৈরি করুন</span>
          <i class="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
        </div>
      </a>

      <a href="/admission" class="service-item card-hover bg-[#121620] border border-white/[0.08] hover:border-sky-400/40 rounded-2xl p-5 block group transition-colors" data-category="exam">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-sky-400/10 border border-sky-400/25 text-sky-300 rounded-xl flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
            <i class="fas fa-door-open"></i>
          </div>
          <span class="text-[10px] bg-sky-400/15 text-sky-200 font-bold px-2.5 py-0.5 rounded-full">২০২৬ সেশন</span>
        </div>
        <h3 class="font-bold text-white text-base group-hover:text-sky-300 transition">ভর্তি হাব ও গাইডলাইন</h3>
        <p class="text-slate-400 text-xs mt-1.5 leading-relaxed">
          একাদশ শ্রেণি ও জাতীয় বিশ্ববিদ্যালয়ের ডিগ্রি/অনার্স ভর্তির ধাপে ধাপে নির্দেশিকা এবং এক ক্লিকে তথ্য কপি প্যানেল।
        </p>
        <div class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-sky-300">
          <span>ভর্তি তথ্য দেখুন</span>
          <i class="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
        </div>
      </a>

      <a href="/mcq" class="service-item card-hover bg-[#121620] border border-white/[0.08] hover:border-teal-400/40 rounded-2xl p-5 block group transition-colors" data-category="prep">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-teal-400/10 border border-teal-400/25 text-teal-300 rounded-xl flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
            <i class="fas fa-list-check"></i>
          </div>
          <span class="text-[10px] bg-teal-400/15 text-teal-200 font-bold px-2.5 py-0.5 rounded-full">স্পেসড রিভিশন</span>
        </div>
        <h3 class="font-bold text-white text-base group-hover:text-teal-300 transition">MCQ প্র্যাকটিস ও প্রশ্নব্যাংক</h3>
        <p class="text-slate-400 text-xs mt-1.5 leading-relaxed">
          অধ্যায়ভিত্তিক বহুনির্বাচনী প্রশ্ন অনুশীলন, ভুল প্রশ্ন ১→৩→৭ দিন ব্যবধানে অটো-রিভিশন ও তাৎক্ষণিক স্কোর।
        </p>
        <div class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-teal-300">
          <span>পরীক্ষা দিন</span>
          <i class="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
        </div>
      </a>

      <a href="/qpapers" class="service-item card-hover bg-[#121620] border border-white/[0.08] hover:border-orange-500/40 rounded-2xl p-5 block group transition-colors" data-category="prep">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-orange-500/10 border border-orange-500/25 text-orange-400 rounded-xl flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
            <i class="fas fa-file-pdf"></i>
          </div>
          <span class="text-[10px] bg-orange-500/15 text-orange-300 font-bold px-2.5 py-0.5 rounded-full">A4 অফিশিয়াল PDF</span>
        </div>
        <h3 class="font-bold text-white text-base group-hover:text-orange-300 transition">প্রশ্নপত্র ও মডেল টেস্ট ব্যাংক</h3>
        <p class="text-slate-400 text-xs mt-1.5 leading-relaxed">
          সকল শিক্ষা বোর্ডের বিগত বছরের মূল প্রশ্নপত্র, মডেল টেস্ট ও সমাধান সংবলিত প্রিন্ট-রেডি PDF ফাইল ডাউনলোড।
        </p>
        <div class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-orange-400">
          <span>প্রশ্নপত্র ডাউনলোড</span>
          <i class="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
        </div>
      </a>

      <a href="/scholarships" class="service-item card-hover bg-[#121620] border border-white/[0.08] hover:border-amber-400/40 rounded-2xl p-5 block group transition-colors" data-category="career">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-amber-400/10 border border-amber-400/25 text-amber-300 rounded-xl flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
            <i class="fas fa-award"></i>
          </div>
          <span class="text-[10px] bg-amber-400/15 text-amber-200 font-bold px-2.5 py-0.5 rounded-full">যোগ্যতা যাচাই</span>
        </div>
        <h3 class="font-bold text-white text-base group-hover:text-amber-300 transition">স্কলারশিপ ও উপবৃত্তি হাব</h3>
        <p class="text-slate-400 text-xs mt-1.5 leading-relaxed">
          সরকারি, বেসরকারি ও আন্তর্জাতিক স্কলারশিপের স্বয়ংক্রিয় যোগ্যতা যাচাই, ডেডলাইন ট্র্যাকার ও আবেদন পোর্টাল।
        </p>
        <div class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-amber-300">
          <span>স্কলারশিপ দেখুন</span>
          <i class="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
        </div>
      </a>

      <a href="/cgpa" class="service-item card-hover bg-[#121620] border border-white/[0.08] hover:border-purple-400/40 rounded-2xl p-5 block group transition-colors" data-category="exam">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-purple-400/10 border border-purple-400/25 text-purple-300 rounded-xl flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
            <i class="fas fa-calculator"></i>
          </div>
          <span class="text-[10px] bg-purple-400/15 text-purple-200 font-bold px-2.5 py-0.5 rounded-full">NU / বোর্ড গ্রেডিং</span>
        </div>
        <h3 class="font-bold text-white text-base group-hover:text-purple-300 transition">CGPA ও টার্গেট ক্যালকুলেটর</h3>
        <p class="text-slate-400 text-xs mt-1.5 leading-relaxed">
          জাতীয় বিশ্ববিদ্যালয় এবং সাধারণ বিশ্ববিদ্যালয়ের নির্ভুল CGPA ক্যালকুলেশন ও কাঙ্ক্ষিত ফলাফল অর্জনের টার্গেট সিমুলেশন।
        </p>
        <div class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-purple-300">
          <span>হিসাব করুন</span>
          <i class="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
        </div>
      </a>

    </div>
  </div>
</section>

<!-- ৭. কার্যপদ্ধতি — ৬টি ধাপ -->
<section class="reveal-on-scroll py-16 bg-[#0b0d12] border-b border-white/5">
  <div class="max-w-7xl mx-auto px-4">
    <div class="text-center max-w-2xl mx-auto mb-12">
      <span class="font-mono text-orange-400/90 text-xs font-bold uppercase tracking-[0.25em]">কার্যপদ্ধতি</span>
      <h2 class="font-display text-2xl sm:text-3xl font-bold text-white mt-2">এডুসব-এ অংশগ্রহণের ৬টি সহজ ধাপ</h2>
      <p class="text-slate-500 text-xs sm:text-sm mt-1.5">শুরু থেকে কাঙ্ক্ষিত লক্ষ্য অর্জন পর্যন্ত আপনার সম্পূর্ণ অগ্রগতি রূপরেখা</p>
    </div>

    <div class="relative timeline-track grid sm:grid-cols-2 lg:grid-cols-6 gap-5 stagger-cards">

      <div class="step-node card-hover relative z-10 bg-[#121620] border border-white/[0.08] rounded-2xl p-4.5 flex flex-col justify-between hover:border-orange-500/40 transition-colors">
        <div>
          <div class="w-10 h-10 rounded-full bg-orange-500 text-white font-bold text-xs flex items-center justify-center shadow-[0_0_14px_rgba(249,115,22,0.4)] mb-3">০১</div>
          <h3 class="font-bold text-sm text-white mb-1">প্রোফাইল রেজিস্ট্রেশন</h3>
          <p class="text-slate-500 text-[11px] leading-relaxed">
            নাম, ফোন নম্বর ও শিক্ষাগত স্তর দিয়ে ৩০ সেকেন্ডে ফ্রি অ্যাকাউন্ট খুলুন।
          </p>
        </div>
        <span class="text-[10px] text-orange-400 font-bold mt-3 block">শুরু</span>
      </div>

      <div class="step-node relative z-10 bg-[#121620] border border-white/[0.08] rounded-2xl p-4.5 flex flex-col justify-between hover:border-teal-400/40 transition-colors">
        <div>
          <div class="w-10 h-10 rounded-full bg-teal-500 text-white font-bold text-xs flex items-center justify-center mb-3">০২</div>
          <h3 class="font-bold text-sm text-white mb-1">পারসোনালাইজড ড্যাশবোর্ড</h3>
          <p class="text-slate-500 text-[11px] leading-relaxed">
            ধর্ম ও ক্লাস অনুযায়ী বিশেষ ক্যালেন্ডার, নোটিস ও ড্যাশবোর্ড সক্রিয়করণ।
          </p>
        </div>
        <span class="text-[10px] text-teal-300 font-bold mt-3 block">কাস্টমাইজ</span>
      </div>

      <div class="step-node relative z-10 bg-[#121620] border border-white/[0.08] rounded-2xl p-4.5 flex flex-col justify-between hover:border-sky-400/40 transition-colors">
        <div>
          <div class="w-10 h-10 rounded-full bg-sky-500 text-white font-bold text-xs flex items-center justify-center mb-3">০৩</div>
          <h3 class="font-bold text-sm text-white mb-1">মডেল টেস্ট ও প্র্যাকটিস</h3>
          <p class="text-slate-500 text-[11px] leading-relaxed">
            অধ্যায়ভিত্তিক MCQ প্র্যাকটিস ও বিগত বছরের বোর্ড প্রশ্নব্যাংক ডাউনলোড।
          </p>
        </div>
        <span class="text-[10px] text-sky-300 font-bold mt-3 block">প্রস্তুতি</span>
      </div>

      <div class="step-node relative z-10 bg-[#121620] border border-white/[0.08] rounded-2xl p-4.5 flex flex-col justify-between hover:border-amber-400/40 transition-colors">
        <div>
          <div class="w-10 h-10 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center mb-3">০৪</div>
          <h3 class="font-bold text-sm text-white mb-1">রেজাল্ট ও মার্কশিট</h3>
          <p class="text-slate-500 text-[11px] leading-relaxed">
            একাধিক সার্ভার থেকে দ্রুততম সময়ে ফলাফল যাচাই ও রোল সংরক্ষণ।
          </p>
        </div>
        <span class="text-[10px] text-amber-300 font-bold mt-3 block">ফলাফল</span>
      </div>

      <div class="step-node relative z-10 bg-[#121620] border border-white/[0.08] rounded-2xl p-4.5 flex flex-col justify-between hover:border-indigo-400/40 transition-colors">
        <div>
          <div class="w-10 h-10 rounded-full bg-indigo-500 text-white font-bold text-xs flex items-center justify-center mb-3">০৫</div>
          <h3 class="font-bold text-sm text-white mb-1">সিভি ও স্কলারশিপ</h3>
          <p class="text-slate-500 text-[11px] leading-relaxed">
            ১, ২ ও ৩ পেজ আন্তর্জাতিক ফরম্যাটে প্রফেশনাল রেজুমে ও আবেদন তৈরি।
          </p>
        </div>
        <span class="text-[10px] text-indigo-300 font-bold mt-3 block">রেজুমে</span>
      </div>

      <div class="step-node relative z-10 bg-[#121620] border border-white/[0.08] rounded-2xl p-4.5 flex flex-col justify-between hover:border-orange-500/40 transition-colors">
        <div>
          <div class="w-10 h-10 rounded-full bg-white/10 border border-orange-500/30 text-white font-bold text-xs flex items-center justify-center mb-3">০৬</div>
          <h3 class="font-bold text-sm text-white mb-1">ক্যারিয়ার ও সাফল্য</h3>
          <p class="text-slate-500 text-[11px] leading-relaxed">
            চাকরির নিয়মিত সার্কুলার, মেন্টর সহায়তা ও উচ্চশিক্ষার সম্পূর্ণ পথ।
          </p>
        </div>
        <span class="text-[10px] text-slate-300 font-bold mt-3 block">লক্ষ্য অর্জন 🎯</span>
      </div>

    </div>
  </div>
</section>

<!-- ৯. সাধারণ জিজ্ঞাসা -->
<section id="faq-section" class="reveal-on-scroll py-16 bg-[#0b0d12] border-b border-white/5">
  <div class="max-w-4xl mx-auto px-4">
    <div class="text-center mb-12">
      <span class="font-mono text-orange-400/90 text-xs font-bold uppercase tracking-[0.25em]">সচরাচর প্রশ্ন</span>
      <h2 class="font-display text-2xl sm:text-3xl font-bold text-white mt-2">সাধারণ জিজ্ঞাসা (FAQ)</h2>
      <p class="text-slate-500 text-xs sm:text-sm mt-1.5">এডুসব প্ল্যাটফর্ম ও সেবাসমূহ সম্পর্কিত সাধারণ প্রশ্নের উত্তর</p>
    </div>

    <div class="space-y-3">
      ${[
        {
          num: '০১',
          q: 'এডুসব প্ল্যাটফর্ম কাদের ব্যবহারের জন্য তৈরি করা হয়েছে?',
          a: 'এডুসব মূলত বাংলাদেশের প্রাথমিক, মাধ্যমিক, উচ্চমাধ্যমিক, জাতীয় বিশ্ববিদ্যালয় এবং মাদ্রাসা শিক্ষাব্যবস্থার সকল শিক্ষার্থী, অভিভাবক ও চাকরিপ্রার্থীদের জন্য তৈরি করা হয়েছে।'
        },
        {
          num: '০২',
          q: 'এখানে অ্যাকাউন্ট তৈরি করতে কি কোনো ফি দিতে হবে?',
          a: 'না, এডুসব-এ সাধারণ রেজিস্ট্রেশন ও অ্যাকাউন্ট খোলা সম্পূর্ণ ফ্রি। আপনি ফ্রিতে ড্যাশবোর্ড, রেজাল্ট ট্র্যাকিং, স্টাডি প্ল্যানার এবং ফ্রি মডেল টেস্ট উপভোগ করতে পারবেন।'
        },
        {
          num: '০৩',
          q: 'অফিসিয়াল সার্ভার ডাউন থাকলেও কি রেজাল্ট দেখা যাবে?',
          a: 'হ্যাঁ! রেজাল্ট প্রকাশের দিন অফিসিয়াল শিক্ষা বোর্ড বা জাতীয় বিশ্ববিদ্যালয়ের সার্ভার ব্যস্ত থাকলে এডুসব-এর একাধিক ব্যাকআপ সার্ভার লিঙ্ক স্বয়ংক্রিয়ভাবে কার্যকর হয়।'
        },
        {
          num: '০৪',
          q: 'সিভি মেকারে কি ১, ২ ও ৩ পেজ ফরম্যাট সাপোর্ট করে?',
          a: 'অবশ্যই। আমাদের সিভি মেকার সম্পূর্ণ ডাইনামিক। আপনি আপনার প্রয়োজন অনুযায়ী ১-পেজ কমপ্যাক্ট ফ্রেশার সিভি, ২-পেজ স্ট্যান্ডার্ড কর্পোরেট সিভি অথবা ৩-পেজ একাডেমিক ও সরকারি বায়োডাটা ফরম্যাট তৈরি ও প্রিন্ট/পিডিএফ ডাউনলোড করতে পারবেন।'
        },
        {
          num: '০৫',
          q: 'MCQ প্র্যাকটিস এবং ভুল প্রশ্ন রিভিশন কীভাবে কাজ করে?',
          a: 'মডেল টেস্টে আপনি যেসব প্রশ্ন ভুল করবেন, সিস্টেম তা অটোমেটিক ভুল প্রশ্নব্যাংকে জমা রাখে এবং বৈজ্ঞানিক স্পেসড রিপিটেশন পদ্ধতিতে ১ দিন, ৩ দিন ও ৭ দিন পর পুনরায় রিভিশনের জন্য সাজেস্ট করে।'
        },
        {
          num: '০৬',
          q: 'শিক্ষক সহায়তা ও ১-অন-১ মেন্টর সার্ভিস কীভাবে পেতে পারি?',
          a: 'আপনি যেকোনো কঠিন অংক বা বিষয়ের প্রশ্ন ছবি বা টেক্সট লিখে সাবমিট করলে আমাদের অভিজ্ঞ শিক্ষক ও মেন্টর টিম ১৫-৩০ মিনিটের মধ্যে ধাপে ধাপে সমাধান লিখে পাঠাবে। এছাড়াও গুগল মিটের মাধ্যমে ১-অন-১ লাইভ সেশন বুকিংয়ের সুবিধাও রয়েছে।'
        },
        {
          num: '০৭',
          q: 'এডমিন অ্যাসিস্টেড আবেদন সুবিধাটি কী?',
          a: 'যদি কোনো শিক্ষার্থী চাকরির সার্কুলার বা ভর্তির জটিল ফরম নিজে পূরণ করতে না পারেন, তবে আমাদের অভিজ্ঞ এডমিন টিম নামমাত্র সেবামূল্যে সম্পূর্ণ আবেদনটি নির্ভুলভাবে সম্পন্ন করে দেয়।'
        },
        {
          num: '০৮',
          q: 'মোবাইল থেকে কি ওয়েবসাইটটি স্বাচ্ছন্দ্যে ব্যবহার করা যাবে?',
          a: 'হ্যাঁ, এডুসব সম্পূর্ণ মোবাইল-ফ্রেন্ডলি ও রেসপনসিভ। কম্পিউটার, ল্যাপটপ, ট্যাবলেট কিংবা স্মার্টফোন যেকোনো ডিভাইস থেকেই মসৃণভাবে ব্যবহার করা যায়।'
        },
      ].map((faq, i) => `
        <div class="border border-white/[0.08] rounded-2xl overflow-hidden bg-[#121620]/70 hover:border-orange-500/30 transition">
          <button onclick="toggleFaq(${i})" class="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-slate-200 hover:text-orange-300 transition">
            <div class="flex items-center gap-3 pr-2">
              <span class="text-xs font-mono font-bold text-orange-300 bg-orange-500/10 px-2 py-0.5 rounded-md">${faq.num}</span>
              <span class="text-sm sm:text-base">${faq.q}</span>
            </div>
            <div id="faq-icon-${i}" class="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 shrink-0 text-xs transition-transform">
              <i class="fas fa-plus"></i>
            </div>
          </button>
          <div id="faq-ans-${i}" class="faq-content px-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/5">
            <div class="py-4">${faq.a}</div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
</section>

<!-- ১০. নিবন্ধন নির্দেশিকা -->
<section id="guide-section" class="reveal-on-scroll py-16 bg-[#0d1017] border-b border-white/5">
  <div class="max-w-6xl mx-auto px-4">
    <div class="text-center mb-12">
      <span class="font-mono text-orange-400/90 text-xs font-bold uppercase tracking-[0.25em]">নির্দেশিকা</span>
      <h2 class="font-display text-2xl sm:text-3xl font-bold text-white mt-2">নিবন্ধন করার সম্পূর্ণ নির্দেশিকা</h2>
      <p class="text-slate-500 text-xs sm:text-sm mt-1.5">সঠিক তথ্য দিয়ে এক ক্লিকে আপনার প্রোফাইল প্রস্তুত করুন</p>
    </div>

    <div class="grid lg:grid-cols-12 gap-8 items-start">

      <div class="lg:col-span-7 space-y-3.5 stagger-cards">
        <div class="card-hover bg-[#121620] border border-white/[0.08] hover:border-orange-500/30 rounded-2xl p-5 flex items-start gap-4 transition-colors">
          <div class="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-sm shrink-0">১</div>
          <div>
            <h3 class="font-bold text-white text-sm mb-1">সঠিক মোবাইল নম্বর ব্যবহার</h3>
            <p class="text-slate-400 text-xs leading-relaxed">
              রেজিস্ট্রেশনের সময় আপনার নিয়মিত সচল ১১ ডিজিটের মোবাইল নম্বর ব্যবহার করুন। এটি আপনার লগইন আইডি হিসেবে সংরক্ষিত থাকবে।
            </p>
          </div>
        </div>

        <div class="card-hover bg-[#121620] border border-white/[0.08] hover:border-teal-400/30 rounded-2xl p-5 flex items-start gap-4 transition-colors">
          <div class="w-10 h-10 rounded-xl bg-teal-400/10 text-teal-300 flex items-center justify-center font-bold text-sm shrink-0">২</div>
          <div>
            <h3 class="font-bold text-white text-sm mb-1">ছবি ও স্বাক্ষর আপলোড (স্বয়ংক্রিয় রিসাইজ)</h3>
            <p class="text-slate-400 text-xs leading-relaxed">
              সরকারি ও বিশ্ববিদ্যালয়ের আবেদনের জন্য ছবি ৩০০×৩০০ এবং স্বাক্ষর ৩০০×৮০ সাইজে বিল্ট-ইন রিসাইজার দিয়ে তাৎক্ষণিক তৈরি করে নিন।
            </p>
          </div>
        </div>

        <div class="card-hover bg-[#121620] border border-white/[0.08] hover:border-sky-400/30 rounded-2xl p-5 flex items-start gap-4 transition-colors">
          <div class="w-10 h-10 rounded-xl bg-sky-400/10 text-sky-300 flex items-center justify-center font-bold text-sm shrink-0">৩</div>
          <div>
            <h3 class="font-bold text-white text-sm mb-1">শিক্ষাগত তথ্য ও রোল সংরক্ষণ</h3>
            <p class="text-slate-400 text-xs leading-relaxed">
              বোর্ড, রোল ও রেজিস্ট্রেশন একবার সেট করে রাখলে প্রতিবার রেজাল্ট অনুসন্ধানে সময় নষ্ট করতে হবে না।
            </p>
          </div>
        </div>

        <div class="card-hover bg-[#121620] border border-white/[0.08] hover:border-indigo-400/30 rounded-2xl p-5 flex items-start gap-4 transition-colors">
          <div class="w-10 h-10 rounded-xl bg-indigo-400/10 text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0">৪</div>
          <div>
            <h3 class="font-bold text-white text-sm mb-1">ড্যাশবোর্ড ও নোটিফিকেশন অ্যাক্টিভেশন</h3>
            <p class="text-slate-400 text-xs leading-relaxed">
              এক ক্লিকে আপনার পারসোনালাইজড ড্যাশবোর্ড চালু হয়ে যাবে এবং গুরুত্বপূর্ণ সব নোটিস পুশ অ্যালার্ট পাবেন।
            </p>
          </div>
        </div>
      </div>

      <div class="lg:col-span-5 bg-[#121620] border border-white/10 rounded-3xl p-6 space-y-5">
        <h3 class="font-bold text-white text-base border-b border-white/5 pb-3 flex items-center gap-2">
          <i class="fas fa-shield-check text-orange-400"></i> তথ্যের নিরাপত্তা ও স্পেসিফিকেশন
        </h3>

        <div class="space-y-3 text-xs text-slate-400">
          <div class="p-3 bg-[#0b0d12] rounded-xl border border-white/[0.08]">
            <p class="font-bold text-white">📷 ছবি স্পেসিফিকেশন:</p>
            <p class="mt-0.5">রঙিন ছবি, ৩০০ × ৩০০ পিক্সেল, সর্বোচ্চ ১০০ KB (বিল্ট-ইন রিসাইজ সুবিধা রয়েছে)।</p>
          </div>
          <div class="p-3 bg-[#0b0d12] rounded-xl border border-white/[0.08]">
            <p class="font-bold text-white">✍️ স্বাক্ষর স্পেসিফিকেশন:</p>
            <p class="mt-0.5">সাদা কাগজে কালো কালিতে স্বাক্ষর, ৩০০ × ৮০ পিক্সেল, সর্বোচ্চ ৬০ KB।</p>
          </div>
          <div class="p-3 bg-orange-500/[0.07] rounded-xl border border-orange-500/20 text-orange-100">
            <p class="font-bold flex items-center gap-1.5"><i class="fas fa-lock text-orange-400"></i> ১০০% ডেটা এনক্রিপশন:</p>
            <p class="mt-0.5 text-[11px] leading-relaxed text-orange-200/70">আপনার রোল, রেজাল্ট ও ব্যক্তিগত তথ্য সম্পূর্ণ সুরক্ষিত। আপনার অনুমতি ছাড়া অন্য কেউ দেখতে পাবে না।</p>
          </div>
        </div>

        <a href="/signup" class="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-full text-center block text-xs transition shadow-[0_0_20px_rgba(249,115,22,0.35)]">
          এখনই ফ্রি অ্যাকাউন্ট খুলুন →
        </a>
      </div>

    </div>
  </div>
</section>

<!-- ১১. যোগাযোগ -->
<section id="contact-section" class="reveal-on-scroll py-16 bg-[#0b0d12] border-b border-white/5">
  <div class="max-w-6xl mx-auto px-4">
    <div class="text-center mb-12">
      <span class="font-mono text-orange-400/90 text-xs font-bold uppercase tracking-[0.25em]">হেল্পডেস্ক ও সহায়তা</span>
      <h2 class="font-display text-2xl sm:text-3xl font-bold text-white mt-2">যোগাযোগ করুন</h2>
      <p class="text-slate-500 text-xs sm:text-sm mt-1.5">যেকোনো প্রশ্ন, পরামর্শ বা সেবামূলক সহযোগিতার জন্য আমাদের লিখুন</p>
    </div>

    <div class="grid md:grid-cols-12 gap-8 items-start">
      <div class="md:col-span-7 bg-[#121620] border border-white/10 rounded-3xl p-6 sm:p-8">
        <h3 class="text-lg font-bold text-white mb-1">আপনার বার্তা পাঠান</h3>
        <p class="text-slate-500 text-xs mb-6">নিচের ফরমটি পূরণ করে বার্তা পাঠালে আমাদের টিম দ্রুত উত্তর দেবে।</p>

        <form id="contactForm" onsubmit="return handleContact(event)" class="space-y-4 text-xs font-semibold text-slate-300">
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block mb-1">আপনার নাম *</label>
              <input type="text" id="c_name" required placeholder="নাম লিখুন" class="w-full bg-[#0b0d12] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/60">
            </div>
            <div>
              <label class="block mb-1">ইমেইল ঠিকানা *</label>
              <input type="email" id="c_email" required placeholder="example@mail.com" class="w-full bg-[#0b0d12] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/60">
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block mb-1">মোবাইল নম্বর *</label>
              <input type="tel" id="c_phone" required placeholder="018XXXXXXXX" class="w-full bg-[#0b0d12] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/60">
            </div>
            <div>
              <label class="block mb-1">বিষয় *</label>
              <input type="text" id="c_subject" required placeholder="বার্তার বিষয়" class="w-full bg-[#0b0d12] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/60">
            </div>
          </div>

          <div>
            <label class="block mb-1">বিস্তারিত বার্তা *</label>
            <textarea id="c_msg" required rows="4" placeholder="আপনার প্রশ্ন বা মতামত বিস্তারিত লিখুন..." class="w-full bg-[#0b0d12] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/60"></textarea>
          </div>

          <div class="bg-[#0b0d12] border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3">
            <span class="text-xs text-slate-300 font-bold">নিরাপত্তা কোড: <span class="text-orange-400 text-sm">৪ + ৭ = ?</span></span>
            <input type="number" id="c_captcha" required placeholder="ফলাফল লিখুন" class="w-28 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-center font-bold text-white focus:outline-none focus:border-orange-500/60">
          </div>

          <button type="submit" id="c_btn" class="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-full transition shadow-[0_0_20px_rgba(249,115,22,0.35)] flex items-center justify-center gap-2">
            <span>বার্তা পাঠান</span> <i class="fas fa-paper-plane text-xs"></i>
          </button>
        </form>
      </div>

      <div class="md:col-span-5 space-y-6">
        <div class="bg-[#121620] border border-white/10 rounded-3xl p-6 space-y-4">
          <h3 class="text-base font-bold text-white border-b border-white/5 pb-3">তথ্য ও সহায়তা কেন্দ্র</h3>

          <div class="flex items-start gap-3.5 text-xs text-slate-400">
            <div class="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center text-sm shrink-0">
              <i class="fas fa-map-marker-alt"></i>
            </div>
            <div>
              <p class="font-bold text-white">যোগাযোগের ঠিকানা</p>
              <p class="mt-0.5 leading-relaxed">ঢাকা, বাংলাদেশ (অনলাইন ডিজিটাল এডুটেক প্ল্যাটফর্ম ও স্টুডেন্ট হেল্পডেস্ক)।</p>
            </div>
          </div>

          <div class="flex items-start gap-3.5 text-xs text-slate-400">
            <div class="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center text-sm shrink-0">
              <i class="fas fa-phone-alt"></i>
            </div>
            <div>
              <p class="font-bold text-white">হেল্পলাইন</p>
              <p class="mt-0.5 font-en font-semibold text-orange-400">+88 01835414122</p>
              <p class="text-[11px] text-slate-500">প্রতিদিন সকাল ৯টা - রাত ১০টা</p>
            </div>
          </div>

          <div class="flex items-start gap-3.5 text-xs text-slate-400">
            <div class="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center text-sm shrink-0">
              <i class="fas fa-envelope"></i>
            </div>
            <div>
              <p class="font-bold text-white">ইমেইল</p>
              <p class="mt-0.5 text-orange-400">support@edusob.com</p>
            </div>
          </div>
        </div>

        <div class="bg-[#121620] border border-white/10 text-white rounded-3xl p-6 text-center">
          <p class="font-bold text-sm mb-1">আমাদের সাথে যুক্ত থাকুন</p>
          <p class="text-slate-500 text-xs mb-4">সকল নোটিস ও আপডেট সবার আগে পেতে অনুসরণ করুন</p>
          <div class="flex justify-center gap-3 text-base">
            <a id="landingFb" href="https://facebook.com/groups/edusob.community" target="_blank" rel="noopener" class="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-orange-500 hover:border-orange-500 flex items-center justify-center transition" title="ফেসবুক"><i class="fab fa-facebook-f"></i></a>
            <a id="landingYt" href="https://youtube.com/@edusob_official" target="_blank" rel="noopener" class="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-red-600 hover:border-red-600 flex items-center justify-center transition" title="ইউটিউব"><i class="fab fa-youtube"></i></a>
            <a id="landingTg" href="https://t.me/edusob_channel" target="_blank" rel="noopener" class="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-sky-500 hover:border-sky-500 flex items-center justify-center transition" title="টেলিগ্রাম"><i class="fab fa-telegram-plane"></i></a>
            <a id="landingWa" href="https://chat.whatsapp.com/edusob-study-hub" target="_blank" rel="noopener" class="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-green-600 hover:border-green-600 flex items-center justify-center transition" title="হোয়াটসঅ্যাপ"><i class="fab fa-whatsapp"></i></a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ১২. ফুটার -->
<footer class="bg-[#090b0f] text-slate-400 text-xs border-t border-white/5">
  <div class="max-w-7xl mx-auto px-4 py-12">
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 pb-10 border-b border-white/5">

      <div class="col-span-2">
        <a href="/" class="flex items-center gap-2.5 mb-3">
          <div class="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold">🎓</div>
          <span class="font-display text-lg font-bold text-white tracking-tight">এডুসব <span class="text-xs text-orange-400 font-normal font-en">EduSob</span></span>
        </a>
        <p class="text-slate-500 text-xs leading-relaxed max-w-sm mb-4">
          বাংলাদেশের শিক্ষার্থীদের জন্য একক সমন্বিত প্ল্যাটফর্ম। পরীক্ষার রেজাল্ট, ভর্তি প্রস্তুতি, ১-৩ পেজ সিভি মেকার ও আধুনিক স্টাডি টুলস।
        </p>
        <p class="text-[11px] text-slate-600 font-en">হেল্পলাইন: +88 01835414122 · ইমেইল: support@edusob.com</p>
      </div>

      <div>
        <p class="font-bold text-slate-200 text-sm mb-3">মূল মেনু</p>
        <ul class="space-y-2">
          <li><a href="/" class="hover:text-orange-400 transition">হোম পেজ</a></li>
          <li><a href="#about-section" class="hover:text-orange-400 transition">এডুসব পরিচিতি</a></li>
          <li><a href="/results" class="hover:text-orange-400 transition">রেজাল্ট হাব</a></li>
          <li><a href="/admission" class="hover:text-orange-400 transition">ভর্তি হাব</a></li>
          <li><a href="/cv" class="hover:text-orange-400 transition">সিভি মেকার</a></li>
        </ul>
      </div>

      <div>
        <p class="font-bold text-slate-200 text-sm mb-3">টুলস ও রিসোর্স</p>
        <ul class="space-y-2">
          <li><a href="/teacher-support" class="text-amber-400 font-semibold hover:text-amber-300 transition flex items-center gap-1.5"><i class="fas fa-chalkboard-user text-xs"></i> শিক্ষক সহায়তা (মেন্টর)</a></li>
          <li><a href="/mcq" class="hover:text-orange-400 transition">MCQ মডেল টেস্ট</a></li>
          <li><a href="/planner" class="hover:text-orange-400 transition">স্টাডি প্ল্যানার</a></li>
          <li><a href="/cgpa" class="hover:text-orange-400 transition">CGPA ক্যালকুলেটর</a></li>
          <li><a href="/jobs" class="hover:text-orange-400 transition">চাকরির সার্কুলার</a></li>
          <li><a href="/shop" class="feature-shop-link hover:text-orange-400 transition">এডুসব শপ</a></li>
        </ul>
      </div>

      <div>
        <p class="font-bold text-slate-200 text-sm mb-3">সহায়তা ও নীতি</p>
        <ul class="space-y-2">
          <li><a href="#faq-section" class="hover:text-orange-400 transition">সাধারণ জিজ্ঞাসা (FAQ)</a></li>
          <li><a href="#guide-section" class="hover:text-orange-400 transition">আবেদন নির্দেশিকা</a></li>
          <li><a href="#contact-section" class="hover:text-orange-400 transition">যোগাযোগ ও হেল্পডেস্ক</a></li>
          <li><a href="/login" class="hover:text-orange-400 transition">এডমিন / ইউজার লগইন</a></li>
        </ul>
      </div>
    </div>

    <div class="select-none overflow-hidden py-6 border-b border-white/5">
      <p class="font-display text-center text-[18vw] lg:text-[10rem] font-extrabold leading-none tracking-tight text-white/[0.04]">EDUSOB</p>
    </div>

    <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-600">
      <p>© ২০২৬ এডুসব (EduSob) — সর্বস্বত্ব সংরক্ষিত।</p>
      <p>বাংলাদেশের সকল শিক্ষার্থীর ডিজিটাল শিক্ষা ও ক্যারিয়ার সঙ্গী 🇧🇩</p>
    </div>
  </div>
</footer>

<script>
// হিরো স্লাইডার
var currentSlide = 0;
var totalSlides = 3;
function setSlide(idx) {
  currentSlide = idx;
  for (var i = 0; i < totalSlides; i++) {
    var sl = document.getElementById('slide-' + (i + 1));
    var dt = document.getElementById('dot-' + i);
    if (sl) sl.style.opacity = (i === idx) ? '1' : '0';
    if (dt) {
      dt.style.backgroundColor = (i === idx) ? '#f97316' : 'rgba(255,255,255,0.3)';
      dt.style.width = (i === idx) ? '20px' : '10px';
    }
  }
}
setInterval(function() {
  currentSlide = (currentSlide + 1) % totalSlides;
  setSlide(currentSlide);
}, 4500);

// সার্ভিস ট্যাব ফিল্টার
function filterServices(cat, btn) {
  var tabs = document.querySelectorAll('.service-tab');
  tabs.forEach(function(t){
    t.classList.remove('service-tab-active');
    t.classList.add('text-slate-500');
  });
  btn.classList.add('service-tab-active');
  btn.classList.remove('text-slate-500');

  var items = document.querySelectorAll('.service-item');
  items.forEach(function(el){
    if (cat === 'all' || el.getAttribute('data-category') === cat) {
      el.style.display = 'block';
    } else {
      el.style.display = 'none';
    }
  });
}

// FAQ অ্যাকর্ডিয়ান
function toggleFaq(idx) {
  var ans = document.getElementById('faq-ans-' + idx);
  var icon = document.getElementById('faq-icon-' + idx);
  var isOpen = ans.classList.contains('open');

  for (var i = 0; i < 8; i++) {
    var a = document.getElementById('faq-ans-' + i);
    var ic = document.getElementById('faq-icon-' + i);
    if (a) a.classList.remove('open');
    if (ic) ic.innerHTML = '<i class="fas fa-plus"></i>';
  }

  if (!isOpen) {
    ans.classList.add('open');
    if (icon) icon.innerHTML = '<i class="fas fa-minus"></i>';
  }
}

// যোগাযোগ ফর্ম
function handleContact(e) {
  e.preventDefault();
  var ans = document.getElementById('c_captcha').value.trim();
  var alertBox = document.getElementById('contactStatusMsg');
  if (!alertBox) {
    alertBox = document.createElement('div');
    alertBox.id = 'contactStatusMsg';
    alertBox.className = 'p-3 rounded-xl text-xs font-bold text-center mt-3';
    document.getElementById('contactForm').appendChild(alertBox);
  }
  if (ans !== '11') {
    alertBox.className = 'p-3 rounded-xl text-xs font-bold text-center mt-3 bg-red-500/20 text-red-300 border border-red-500/30';
    alertBox.textContent = 'নিরাপত্তা কোডের উত্তর ভুল হয়েছে (৪ + ৭ = ১১)। অনুগ্রহ করে সঠিক উত্তর লিখুন।';
    return false;
  }
  var name = (document.getElementById('c_name').value || '').trim();
  var sub = (document.getElementById('c_subject').value || '').trim();
  var msg = (document.getElementById('c_msg').value || '').trim();
  var btn = document.getElementById('c_btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> পাঠানো হচ্ছে...';

  setTimeout(function() {
    alertBox.className = 'p-3 rounded-xl text-xs font-bold text-center mt-3 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    alertBox.innerHTML = '✓ আপনার বার্তাটি সফলভাবে জমা হয়েছে! হেল্পডেস্ক টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।<br><a href="https://wa.me/8801835414122?text=' + encodeURIComponent('এডুসব হেল্পডেস্ক: নাম: ' + name + ', বিষয়: ' + sub + ' - ' + msg) + '" target="_blank" class="inline-block mt-2 underline text-white font-extrabold">দ্রুত হোয়াটসঅ্যাপে বার্তা পাঠান →</a>';
    document.getElementById('contactForm').reset();
    btn.disabled = false;
    btn.innerHTML = '<span>বার্তা পাঠান</span> <i class="fas fa-paper-plane text-xs"></i>';
  }, 600);
  return false;
}
</script>
`

  return pageShell('হোম — শিক্ষার সব, এক ঠিকানায়', 'bg-[#0b0d12] text-slate-100 grain', html, extraHead)
}
