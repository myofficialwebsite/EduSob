// এডুসব — পার্সোনাল স্টাডি হাব ও স্টুডেন্ট ড্যাশবোর্ড (Personal Study Hub & Student Dashboard)
import { pageShell } from './layout'
import type { SessionUser } from '../lib/auth'
import { religionInfo, toBn } from '../lib/dates'

const THEMES: Record<string, { grad: string; side: string; accent: string; accentBg: string; chip: string; border: string }> = {
  emerald: { grad: 'from-slate-950 via-slate-900 to-emerald-950', side: 'bg-slate-900/95', accent: 'text-emerald-400', accentBg: 'bg-emerald-500', chip: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', border: 'border-emerald-500/20' },
  saffron: { grad: 'from-slate-950 via-slate-900 to-amber-950', side: 'bg-slate-900/95', accent: 'text-amber-400', accentBg: 'bg-amber-500', chip: 'bg-amber-500/15 text-amber-300 border-amber-500/30', border: 'border-amber-500/20' },
  maroon: { grad: 'from-slate-950 via-slate-900 to-rose-950', side: 'bg-slate-900/95', accent: 'text-rose-400', accentBg: 'bg-rose-600', chip: 'bg-rose-500/15 text-rose-300 border-rose-500/30', border: 'border-rose-500/20' },
  blue: { grad: 'from-slate-950 via-slate-900 to-sky-950', side: 'bg-slate-900/95', accent: 'text-sky-400', accentBg: 'bg-sky-500', chip: 'bg-sky-500/15 text-sky-300 border-sky-500/30', border: 'border-sky-500/20' },
}

export function dashboardPage(user: SessionUser): string {
  const info = religionInfo(user.religion)
  const t = THEMES[info.theme] ?? THEMES.emerald
  const firstLetter = user.name_bn ? user.name_bn.charAt(0) : 'এ'

  const sidebarNav = `
    <div class="px-3 pb-2 text-[10px] uppercase tracking-wider font-bold text-slate-400">আমার স্টাডি স্পেস</div>
    <a href="/dashboard" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl ${t.accentBg} text-white font-bold shadow-sm transition"><i class="fas fa-compass w-4"></i> <span>স্টুডেন্ট ড্যাশবোর্ড</span></a>
    <a href="/results" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 font-semibold transition"><i class="fas fa-graduation-cap w-4 text-amber-400"></i> <span>রেজাল্ট হাব</span></a>
    <a href="/profile" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 font-semibold transition"><i class="fas fa-id-card w-4 text-teal-400"></i> <span>আমার প্রোফাইল</span></a>

    <div class="pt-4 px-3 pb-2 text-[10px] uppercase tracking-wider font-bold text-slate-400">স্টাডি ও প্র্যাকটিস</div>
    <a href="/mcq" class="flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 font-medium transition text-xs"><i class="fas fa-list-check w-4 text-emerald-400"></i> <span>MCQ টেস্ট</span></a>
    <a href="/qpapers" class="flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 font-medium transition text-xs"><i class="fas fa-file-pdf w-4 text-amber-400"></i> <span>প্রশ্নব্যাংক PDF</span></a>
    <a href="/scholarships" class="flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 font-medium transition text-xs"><i class="fas fa-award w-4 text-yellow-400"></i> <span>স্কলারশিপ হাব</span></a>
    <a href="/planner" class="flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 font-medium transition text-xs"><i class="fas fa-calendar-check w-4 text-purple-400"></i> <span>স্টাডি প্ল্যানার</span></a>

    <div class="pt-4 px-3 pb-2 text-[10px] uppercase tracking-wider font-bold text-slate-400">স্টুডেন্ট টুলস</div>
    <a href="/teacher-support" class="flex items-center gap-3 px-3.5 py-2 rounded-xl text-amber-300 hover:bg-amber-500/20 font-semibold transition text-xs bg-amber-500/10 border border-amber-400/20"><i class="fas fa-chalkboard-user w-4 text-amber-400"></i> <span>শিক্ষক সহায়তা</span> <span class="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full ml-auto">LIVE</span></a>
    <a href="/cv" class="flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 font-medium transition text-xs"><i class="fas fa-file-lines w-4 text-sky-400"></i> <span>CV মেকার</span></a>
    <a href="/wallet" class="flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 font-medium transition text-xs"><i class="fas fa-wallet w-4 text-teal-400"></i> <span>ওয়ালেট</span></a>
    <a href="/assisted" class="flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 font-medium transition text-xs"><i class="fas fa-hands-helping w-4 text-rose-400"></i> <span>আবেদন সহায়তা</span></a>

    <div class="pt-4 px-3 pb-2 text-[10px] uppercase tracking-wider font-bold text-slate-400">আপডেট ও সার্কুলার</div>
    <a href="/notices" class="flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 font-medium transition text-xs"><i class="fas fa-bullhorn w-4 text-amber-400"></i> <span>নোটিস বোর্ড</span></a>
    <a href="/admissions" class="flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 font-medium transition text-xs"><i class="fas fa-door-open w-4 text-emerald-400"></i> <span>ভর্তি হাব</span></a>
    <a href="/jobs" class="flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 font-medium transition text-xs"><i class="fas fa-briefcase w-4 text-teal-400"></i> <span>চাকরির খবর</span></a>
    <a href="/news" class="flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 font-medium transition text-xs"><i class="fas fa-newspaper w-4 text-sky-400"></i> <span>শিক্ষা সংবাদ</span></a>

    ${user.role === 'admin' ? `
    <div class="pt-4 px-3 pb-2 text-[10px] uppercase tracking-wider font-bold text-rose-400">প্রশাসন</div>
    <a href="/admin" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 font-bold transition text-xs"><i class="fas fa-shield-halved w-4"></i> <span>এডমিন কন্ট্রোল</span></a>
    ` : ''}
  `

  return pageShell('আমার ড্যাশবোর্ড — এডুসব', `bg-gradient-to-br ${t.grad} text-slate-100 min-h-screen selection:bg-emerald-500 selection:text-black`, `
<div class="flex min-h-screen">
  <!-- ১. আধুনিক সাইডবার -->
  <aside id="sidebar" class="hidden lg:flex flex-col w-64 shrink-0 ${t.side} backdrop-blur-2xl border-r border-white/10 sticky top-0 h-screen overflow-hidden z-20">
    <div class="p-5 border-b border-white/10">
      <a href="/" class="flex items-center gap-3 group">
        <div class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white text-lg shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
          <i class="fas fa-graduation-cap"></i>
        </div>
        <div class="flex flex-col">
          <span class="text-white font-black text-lg tracking-tight leading-none">এডুসব</span>
          <span class="text-[10px] text-emerald-400 font-semibold tracking-wide uppercase mt-1">Student Study Hub</span>
        </div>
      </a>
    </div>

    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar text-sm">
      ${sidebarNav}
    </nav>

    <div class="p-4 border-t border-white/10 bg-black/20">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-white/10 border border-white/15 overflow-hidden flex items-center justify-center shrink-0">
          <span class="user-init font-bold text-white">${firstLetter}</span>
          <img class="user-photo w-full h-full object-cover hidden" alt="${user.name_bn}">
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-bold text-white truncate">${user.name_bn}</p>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-[10px] text-emerald-400 font-mono">৳ <span class="wallet-val">০</span></span>
            <span class="text-[10px] text-slate-400">·</span>
            <button onclick="logout()" class="text-[10px] text-rose-400 hover:underline">লগআউট</button>
          </div>
        </div>
      </div>
    </div>
  </aside>

  <!-- মোবাইল ড্রয়ার -->
  <div id="mobileDrawerWrap" class="hidden fixed inset-0 z-50 lg:hidden">
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onclick="toggleDrawer(false)"></div>
    <aside class="absolute left-0 top-0 h-full w-72 max-w-[85vw] ${t.side} backdrop-blur-2xl border-r border-white/10 p-5 overflow-y-auto flex flex-col z-10 shadow-2xl">
      <div class="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
        <a href="/" class="flex items-center gap-2.5">
          <span class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white text-sm"><i class="fas fa-graduation-cap"></i></span>
          <span class="font-extrabold text-white text-base">এডুসব</span>
        </a>
        <button onclick="toggleDrawer(false)" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center"><i class="fas fa-xmark"></i></button>
      </div>
      <nav class="space-y-1 text-sm flex-1">
        ${sidebarNav}
      </nav>
      <div class="pt-4 border-t border-white/10 mt-4">
        <button onclick="logout()" class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-bold transition">
          <i class="fas fa-right-from-bracket"></i> লগআউট
        </button>
      </div>
    </aside>
  </div>

  <!-- ২. মূল স্টাডি হাব বডি -->
  <main class="flex-1 min-w-0 flex flex-col">
    <!-- টপবার স্ট্যাটাস স্ট্রিপ (Clean & Minimalist, No Box Nesting) -->
    <header class="sticky top-0 z-30 ${t.side} backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <button onclick="toggleDrawer(true)" class="lg:hidden w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center shrink-0" aria-label="মেনু"><i class="fas fa-bars text-sm"></i></button>
        <div class="flex items-center gap-2 min-w-0 text-xs">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span class="text-slate-200 font-semibold truncate hidden sm:inline">আমার স্টাডি স্পেস</span>
          <span class="text-slate-500 hidden sm:inline">|</span>
          <span class="text-slate-400 truncate text-[11px]">${info.gregLine}</span>
        </div>
      </div>

      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <!-- ১-ক্লিক রেজাল্ট বাটন -->
        <button onclick="openResultModal()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition shadow-sm">
          <i class="fas fa-search text-[10px]"></i> <span>রেজাল্ট চেক</span>
        </button>

        <!-- নোটিফিকেশন বেল -->
        <button onclick="openNotificationsModal()" class="relative w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200 flex items-center justify-center border border-white/10 transition" title="নোটিফিকেশন সেন্টার">
          <i class="fas fa-bell text-amber-400 text-xs"></i>
          <span id="notifBadge" class="hidden absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">১</span>
        </button>

        <!-- পুশ অ্যালার্ট টগল -->
        <button id="pushNotifBtn" onclick="togglePushNotifications()" class="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition">
          <i id="pushBellIcon" class="fas fa-bell text-amber-400 text-xs"></i>
          <span id="pushStatusText">পুশ</span>
        </button>

        <!-- ওয়ালেট পিল -->
        <a href="/wallet" class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs font-bold transition">
          <i class="fas fa-wallet text-[10px]"></i>
          <span>৳ <span class="wallet-val">০</span></span>
        </a>

        <!-- প্রোফাইল শর্টকাট -->
        <a href="/profile" class="w-8 h-8 rounded-lg ${t.accentBg} text-white font-bold flex items-center justify-center overflow-hidden border border-white/20 shadow-xs hover:opacity-90 transition" title="প্রোফাইল">
          <span class="user-init text-xs">${firstLetter}</span>
          <img class="user-photo w-full h-full object-cover hidden" alt="${user.name_bn}">
        </a>
      </div>
    </header>

    <div class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">

      <!-- ১. ইন্টেলিজেন্ট হেডলাইন ও কমান্ড স্ট্রিপ (Borderless, Integrated Layout) -->
      <section class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <!-- বামে: স্টুডেন্ট আইডেন্টিটি ও গ্রিটিং -->
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="relative shrink-0">
            <div class="w-13 h-13 sm:w-14 sm:h-14 ${t.accentBg} rounded-2xl flex items-center justify-center text-xl font-black shadow-md overflow-hidden border border-white/20">
              <span class="user-init">${firstLetter}</span>
              <img class="user-photo w-full h-full object-cover hidden" alt="${user.name_bn}">
            </div>
            <a href="/profile" class="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-900 border border-white/20 text-white rounded-full flex items-center justify-center text-[9px] hover:bg-emerald-600 transition" title="প্রোফাইল"><i class="fas fa-pen"></i></a>
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-lg sm:text-xl font-black text-white truncate">${info.greeting}, ${user.name_bn}</h1>
              <span class="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.2 rounded-full font-bold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> ভেরিফাইড
              </span>
            </div>
            <div class="flex items-center gap-2 mt-1 text-xs text-slate-400 flex-wrap">
              <span>${({ ssc: 'SSC (মাধ্যমিক)', hsc: 'HSC (উচ্চ মাধ্যমিক)', nu: 'অনার্স / ডিগ্রি', masters: 'মাস্টার্স', other: 'সাধারণ' } as any)[user.education_level ?? ''] ?? 'শিক্ষার্থী'}</span>
              <span>·</span>
              <span class="text-slate-300">${info.dateLine}</span>
            </div>
          </div>
        </div>

        <!-- ডানে: কম্প্যাক্ট মেট্রিক স্ট্রিপ (No Heavy Boxes!) -->
        <div class="flex items-center gap-3 sm:gap-5 flex-wrap bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
          <!-- আইডি চিপ -->
          <div class="flex items-center gap-1.5 text-xs">
            <span class="text-slate-400 text-[11px]">আইডি:</span>
            <code class="font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-white/10 ${t.accent}">${user.user_code}</code>
            <button onclick="copyText('${user.user_code}', 'আইডি কপি হয়েছে!')" class="text-slate-400 hover:text-white transition" title="কপি"><i class="fas fa-copy text-xs"></i></button>
          </div>

          <div class="h-4 w-px bg-white/10 hidden sm:block"></div>

          <!-- সেভড রোল -->
          <button onclick="setDashTab('exams')" class="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition">
            <i class="fas fa-bookmark text-amber-400"></i>
            <span>রোল: <b class="text-white" id="rollCount">০</b>টি</span>
          </button>

          <div class="h-4 w-px bg-white/10 hidden sm:block"></div>

          <!-- প্রোফাইল প্রগ্রেস -->
          <a href="/profile" class="flex items-center gap-2 text-xs text-slate-300 hover:text-white transition" title="প্রোফাইল আপডেট">
            <div class="w-14 bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/10">
              <div id="profileProgressBar" class="bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full transition-all duration-500" style="width:0%"></div>
            </div>
            <span id="profilePct" class="font-mono font-bold text-emerald-400 text-[11px]">০%</span>
          </a>

          <div class="h-4 w-px bg-white/10 hidden sm:block"></div>

          <!-- ওয়ালেট কুইক রিচার্জ -->
          <button onclick="openAddMoneyModal()" class="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
            <i class="fas fa-plus-circle text-[11px]"></i> ক্যাশ-ইন
          </button>
        </div>
      </section>

      <!-- ২. “আজ কী করব?” — আজকের পড়ার লক্ষ্য ও মিশন (Daily Study Goals & Priority Hub) -->
      <section id="daily-command-deck" class="space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <h2 class="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              আজকের পড়ার লক্ষ্য ও মিশন
            </h2>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span id="deckTaskSummary" class="text-slate-400 font-mono text-[11px]">০/৪ লক্ষ্য সম্পন্ন</span>
            <span class="text-slate-600">·</span>
            <button onclick="initDailyTasks()" class="text-[11px] text-slate-400 hover:text-white" title="রিলোড"><i class="fas fa-rotate-right"></i></button>
          </div>
        </div>

        <!-- প্রায়োরিটি ফিড গ্রিড (Timeline & Compact Action Strip) -->
        <div class="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/10 overflow-hidden">

          <!-- প্রায়োরিটি ১ (জরুরি অ্যালার্ট / ডেডলাইন কাউন্টডাউন) -->
          <div id="urgentPriorityItem" class="p-3 sm:p-4 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-start sm:items-center gap-3 min-w-0">
              <span class="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center text-xs shrink-0 mt-0.5 sm:mt-0">
                <i class="fas fa-bell"></i>
              </span>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase">জরুরি আপডেট</span>
                  <span id="urgentNoticeTitle" class="text-xs sm:text-sm font-bold text-white truncate">জরুরি নোটিস ও সময়সূচি চেক</span>
                </div>
                <p id="urgentNoticeDesc" class="text-[11px] text-slate-300 mt-0.5 truncate">বোর্ড পরীক্ষা, ভর্তি আবেদন ও স্কলারশিপের ডেডলাইন সক্রিয় রয়েছে।</p>
              </div>
            </div>
            <div class="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <a href="/admissions" id="urgentNoticeAction" class="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold transition flex items-center gap-1.5">
                <span>ভর্তি হাব দেখুন</span> <i class="fas fa-arrow-right text-[10px]"></i>
              </a>
            </div>
          </div>

          <!-- প্রায়োরিটি ২ (স্টাডি মিশন চেকলিস্ট — ইন্টারেক্টিভ ও লোকালস্টোরেজ সিঙ্কড) -->
          <div id="cardStudyMissionBox" class="p-3 sm:p-4 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-300 flex items-center gap-2">
                <i class="fas fa-list-check text-emerald-400"></i> আজকের পড়ার চেকলিস্ট
              </span>
              <span id="studyMissionPct" class="text-[11px] font-mono text-emerald-400 font-bold">০% সম্পন্ন</span>
            </div>

            <!-- প্রগ্রেস বার -->
            <div class="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/10">
              <div id="deckProgressBar" class="bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 h-full rounded-full transition-all duration-300" style="width:0%"></div>
            </div>

            <!-- কম্প্যাক্ট টাস্ক লিস্ট (No box within box!) -->
            <div class="grid sm:grid-cols-2 gap-2 pt-1">
              <label class="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition border border-transparent hover:border-white/5">
                <input type="checkbox" onchange="toggleTask(0)" id="task_0" class="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-white/20">
                <span id="task_text_0" class="text-xs text-slate-200 flex-1 select-none transition-all">২০টি বিষয়ভিত্তিক MCQ অনুশীলন</span>
                <a href="/mcq" class="text-[10px] text-emerald-400 font-bold hover:underline shrink-0" onclick="event.stopPropagation()">টেস্ট দিন →</a>
              </label>

              <label class="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition border border-transparent hover:border-white/5">
                <input type="checkbox" onchange="toggleTask(1)" id="task_1" class="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-white/20">
                <span id="task_text_1" class="text-xs text-slate-200 flex-1 select-none transition-all">বিগত বছরের ১টি প্রশ্ন সমাধান</span>
                <a href="/qpapers" class="text-[10px] text-amber-400 font-bold hover:underline shrink-0" onclick="event.stopPropagation()">PDF →</a>
              </label>

              <label class="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition border border-transparent hover:border-white/5">
                <input type="checkbox" onchange="toggleTask(2)" id="task_2" class="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-white/20">
                <span id="task_text_2" class="text-xs text-slate-200 flex-1 select-none transition-all">নতুন স্কলারশিপ বা উপবৃত্তি যোগ্যতা চেক</span>
                <a href="/scholarships" class="text-[10px] text-yellow-400 font-bold hover:underline shrink-0" onclick="event.stopPropagation()">যাচাই →</a>
              </label>

              <label class="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition border border-transparent hover:border-white/5">
                <input type="checkbox" onchange="toggleTask(3)" id="task_3" class="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-white/20">
                <span id="task_text_3" class="text-xs text-slate-200 flex-1 select-none transition-all">আজকের বোর্ড নোটিস ও রুটিন দেখা</span>
                <a href="/notices" class="text-[10px] text-sky-400 font-bold hover:underline shrink-0" onclick="event.stopPropagation()">নোটিস →</a>
              </label>
            </div>
          </div>

          <!-- প্রায়োরিটি ৩ (১-ক্লিক ফরম কপি র্যাপিডার — নো হেভি কার্ড) -->
          <div id="cardQuickCopyBox" class="p-3 sm:p-4 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <i class="fas fa-copy text-amber-400"></i> ১-ক্লিক ফরম ফিলিং ক্লিপবোর্ড
              </span>
              <a href="/profile" class="text-[11px] text-emerald-400 hover:underline">প্রোফাইল এডিট</a>
            </div>
            <div id="quickCopyStrip" class="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <div class="text-[11px] text-slate-400 animate-pulse">প্রোফাইল চিপস লোড হচ্ছে...</div>
            </div>
          </div>

          <!-- প্রায়োরিটি ৪ (লাইভ ওয়াক্ত / পঞ্জিকা ও অনুপ্রেরণামূলক বাণী কম্প্যাক্ট স্ট্রিপ) -->
          <div id="cardReligionBox" class="p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <!-- বামে: ওয়াক্ত বা পঞ্জিকা -->
            <div id="compactPrayerOrPanchang" class="flex items-center gap-3 min-w-0">
              <span class="text-slate-400 text-xs animate-pulse">দৈনিক শিডিউল লোড হচ্ছে...</span>
            </div>

            <!-- ডানে: দৈনিক বাণী -->
            <div id="compactVerseBox" class="flex items-center gap-2 text-[11px] text-slate-300 italic min-w-0 truncate md:max-w-md">
              <i class="fas fa-quote-left text-amber-400 shrink-0"></i>
              <span id="compactVerseText" class="truncate">অনুপ্রেরণা লোড হচ্ছে...</span>
              <button onclick="copyVerseText()" class="text-emerald-400 hover:underline shrink-0 not-italic ml-1" title="কপি"><i class="fas fa-copy"></i></button>
            </div>
          </div>

        </div>
      </section>

      <!-- ৩. প্রয়োজনীয় স্টাডি টুলস ও সেবা (Refined Visual Hierarchy & Whitespace) -->
      <section id="cardQuickActionsBox" class="space-y-2.5">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <i class="fas fa-bolt text-amber-400"></i> প্রয়োজনীয় স্টাডি টুলস ও সেবা
          </h3>
          <span class="text-[11px] text-slate-500">১-ক্লিকে দ্রুত প্রবেশ</span>
        </div>

        <!-- প্রাইমারি হাই-ইনটেন্ট বাটনস (বড় ও বিশিষ্ট) -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button onclick="openResultModal()" class="group bg-gradient-to-br from-white/10 to-white/5 hover:from-emerald-500/20 hover:to-teal-500/20 border border-white/10 hover:border-emerald-400/50 rounded-2xl p-3.5 text-left transition flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition"><i class="fas fa-magnifying-glass"></i></div>
            <div class="min-w-0">
              <h4 class="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 truncate">রেজাল্ট চেক</h4>
              <p class="text-[10px] text-slate-400 truncate">SSC/HSC অফিসিয়াল ডাটা</p>
            </div>
          </button>

          <a href="/mcq" class="group bg-gradient-to-br from-white/10 to-white/5 hover:from-teal-500/20 hover:to-emerald-500/20 border border-white/10 hover:border-teal-400/50 rounded-2xl p-3.5 text-left transition flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition"><i class="fas fa-list-check"></i></div>
            <div class="min-w-0">
              <h4 class="text-xs sm:text-sm font-bold text-white group-hover:text-teal-300 truncate">MCQ টেস্ট</h4>
              <p class="text-[10px] text-slate-400 truncate">অধ্যায়ভিত্তিক প্রশ্ন অনুশীলন</p>
            </div>
          </a>

          <button id="dashTeacherSupportBtn" onclick="openAskTeacherModal()" class="group bg-gradient-to-br from-amber-500/15 to-orange-500/10 hover:from-amber-500/25 hover:to-orange-500/20 border border-amber-400/30 hover:border-amber-400/60 rounded-2xl p-3.5 text-left transition flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/30 text-amber-300 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition"><i class="fas fa-chalkboard-user"></i></div>
            <div class="min-w-0">
              <h4 class="text-xs sm:text-sm font-bold text-amber-200 truncate">শিক্ষক সহায়তা</h4>
              <p class="text-[10px] text-amber-300/70 truncate">সরাসরি সমাধান বুঝে নিন</p>
            </div>
          </button>

          <a href="/qpapers" class="group bg-gradient-to-br from-white/10 to-white/5 hover:from-sky-500/20 hover:to-indigo-500/20 border border-white/10 hover:border-sky-400/50 rounded-2xl p-3.5 text-left transition flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition"><i class="fas fa-file-pdf"></i></div>
            <div class="min-w-0">
              <h4 class="text-xs sm:text-sm font-bold text-white group-hover:text-sky-300 truncate">প্রশ্নব্যাংক ও সাজেশন</h4>
              <p class="text-[10px] text-slate-400 truncate">বিগত ১০ বছরের বোর্ড PDF</p>
            </div>
          </a>
        </div>

        <!-- সেকেন্ডারি কম্প্যাক্ট কুইক লিঙ্ক বার (Non-intrusive) -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <a href="/scholarships" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs whitespace-nowrap transition flex items-center gap-1.5">
            <i class="fas fa-award text-yellow-400 text-[10px]"></i> স্কলারশিপ হাব
          </a>
          <a href="/cv" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs whitespace-nowrap transition flex items-center gap-1.5">
            <i class="fas fa-file-lines text-sky-400 text-[10px]"></i> সিভি মেকার
          </a>
          <a href="/assisted" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs whitespace-nowrap transition flex items-center gap-1.5">
            <i class="fas fa-hands-helping text-rose-400 text-[10px]"></i> আবেদন সেবা
          </a>
          <a id="dashQuickShopBtn" href="/shop" class="feature-shop-link px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs whitespace-nowrap transition flex items-center gap-1.5">
            <i class="fas fa-store text-emerald-400 text-[10px]"></i> এডুসব শপ
          </a>
          <a href="/planner" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs whitespace-nowrap transition flex items-center gap-1.5">
            <i class="fas fa-calendar-check text-purple-400 text-[10px]"></i> স্টাডি প্ল্যানার
          </a>
        </div>
      </section>

      <!-- ৪. স্টাডি হাব ও অ্যাক্টিভিটি ট্যাব (Clean Timelines, Reduced Boxiness) -->
      <section class="space-y-4">
        <!-- ট্যাব সিলেক্টর -->
        <div class="flex items-center gap-1 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar">
          <button onclick="setDashTab('exams')" id="tabBtn_exams" class="dash-tab-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 bg-white/15 text-white shadow-xs">
            <i class="fas fa-graduation-cap text-amber-400"></i> পরীক্ষা ও সেভড রোল
          </button>
          <button onclick="setDashTab('feed')" id="tabBtn_feed" class="dash-tab-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 text-slate-400 hover:text-white hover:bg-white/10">
            <i class="fas fa-rss text-sky-400"></i> স্টাডি ফিড ও সার্কুলার
          </button>
          <button onclick="setDashTab('community')" id="tabBtn_community" class="dash-tab-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 text-slate-400 hover:text-white hover:bg-white/10">
            <i class="fas fa-users-rays text-teal-400"></i> বোনাস ও সাপোর্ট
          </button>
        </div>

        <!-- কনসোল প্যানেল ১: পরীক্ষা ও সেভড রোল -->
        <div id="tabContent_exams" class="tab-pane space-y-4">
          <div class="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <i class="fas fa-bookmark text-amber-400"></i> সেভ করা রোল ও মার্কশিট
                </h3>
                <p class="text-[11px] text-slate-400 mt-0.5">এক ক্লিকে রেজাল্ট বা মার্কশিট অনুসন্ধান করুন</p>
              </div>
              <button onclick="openSaveRollModal()" class="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5">
                <i class="fas fa-plus text-[10px]"></i> রোল সেভ
              </button>
            </div>

            <div id="rollsList" class="space-y-2 text-xs">
              <p class="text-slate-400 text-center py-4 text-xs animate-pulse">রোল তালিকা প্রস্তুত হচ্ছে...</p>
            </div>

            <!-- ইন-লাইন বোর্ড রেজাল্ট চেকার ফর্ম (কম্প্যাক্ট) -->
            <div class="pt-4 border-t border-white/10 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-white flex items-center gap-2">
                  <i class="fas fa-search text-emerald-400"></i> দ্রুত যে কোনো রেজাল্ট খুঁজুন
                </span>
                <span class="text-[10px] text-slate-400">অফিসিয়াল ডাটা প্রক্সি</span>
              </div>
              <form onsubmit="handleQuickResultSubmit(event)" class="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                <div>
                  <label class="block text-[10px] text-slate-400 mb-0.5">পরীক্ষা</label>
                  <select id="qrExam" class="w-full bg-slate-900 border border-white/15 rounded-xl px-2.5 py-1.5 text-white font-semibold">
                    <option value="ssc">SSC / দাখিল</option>
                    <option value="hsc">HSC / আলিম</option>
                    <option value="jsc">JSC / JDC</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] text-slate-400 mb-0.5">সাল</label>
                  <select id="qrYear" class="w-full bg-slate-900 border border-white/15 rounded-xl px-2.5 py-1.5 text-white font-semibold">
                    <option value="2024">২০২৪</option>
                    <option value="2023">২০২৩</option>
                    <option value="2022">২০২২</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] text-slate-400 mb-0.5">বোর্ড</label>
                  <select id="qrBoard" class="w-full bg-slate-900 border border-white/15 rounded-xl px-2.5 py-1.5 text-white font-semibold">
                    <option value="dhaka">ঢাকা</option>
                    <option value="chittagong">চট্টগ্রাম</option>
                    <option value="rajshahi">রাজশাহী</option>
                    <option value="comilla">কুমিল্লা</option>
                    <option value="jessore">যশোর</option>
                    <option value="barisal">বরিশাল</option>
                    <option value="sylhet">সিলেট</option>
                    <option value="dinajpur">দিনাজপুর</option>
                    <option value="mymensingh">ময়মনসিংহ</option>
                    <option value="madrasah">মাদ্রাসা</option>
                    <option value="tec">কারিগরি</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] text-slate-400 mb-0.5">রোল</label>
                  <input type="text" id="qrRoll" placeholder="রোল নম্বর" required class="w-full bg-slate-900 border border-white/15 rounded-xl px-2.5 py-1.5 text-white font-mono">
                </div>
                <div>
                  <label class="block text-[10px] text-slate-400 mb-0.5">রেজি নম্বর</label>
                  <input type="text" id="qrReg" placeholder="রেজি নম্বর" required class="w-full bg-slate-900 border border-white/15 rounded-xl px-2.5 py-1.5 text-white font-mono">
                </div>
                <div class="col-span-2 sm:col-span-5 flex justify-end">
                  <button type="submit" id="qrSubmitBtn" class="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold transition flex items-center gap-1.5 text-xs shadow-md">
                    <i class="fas fa-search text-[10px]"></i> রেজাল্ট অনুসন্ধান
                  </button>
                </div>
              </form>
              <div id="qrResultContainer" class="hidden pt-2"></div>
            </div>
          </div>
        </div>

        <!-- কনসোল প্যানেল ২: স্মার্ট ফিড ও সার্কুলার (Unified Feed Timeline) -->
        <div id="tabContent_feed" class="tab-pane hidden space-y-4">
          <!-- জরুরি ঘোষণা ও নোটিস স্ট্রিপ -->
          <div class="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <i class="fas fa-bullhorn text-amber-400"></i> জরুরি ঘোষণা ও নোটিস
              </h3>
              <a href="/notices" class="text-xs text-amber-400 hover:underline">সকল নোটিস →</a>
            </div>
            <div id="announceListTimeline" class="space-y-2 text-xs">
              <p class="text-slate-400 text-center py-4 text-xs animate-pulse">ঘোষণা লোড হচ্ছে...</p>
            </div>
          </div>

          <!-- শিক্ষা সংবাদ ও চাকরির বিজ্ঞপ্তি (কম্প্যাক্ট ২ কলাম) -->
          <div class="grid md:grid-cols-2 gap-4">
            <!-- শিক্ষা সংবাদ -->
            <div id="cardNewsBox" class="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-white flex items-center gap-2">
                  <i class="fas fa-newspaper text-sky-400"></i> শিক্ষা সংবাদ
                </h4>
                <a href="/news" class="text-[11px] text-sky-400 hover:underline">সকল খবর →</a>
              </div>
              <div id="newsPreviewTimeline" class="divide-y divide-white/5 space-y-2 pt-1 text-xs">
                <p class="text-slate-400 text-center py-3 text-xs animate-pulse">খবর লোড হচ্ছে...</p>
              </div>
            </div>

            <!-- ক্যারিয়ার ও সার্কুলার -->
            <div id="cardJobsBox" class="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-white flex items-center gap-2">
                  <i class="fas fa-briefcase text-teal-400"></i> নতুন চাকরির সার্কুলার
                </h4>
                <a href="/jobs" class="text-[11px] text-teal-400 hover:underline">সকল চাকরি →</a>
              </div>
              <div id="jobsPreviewTimeline" class="divide-y divide-white/5 space-y-2 pt-1 text-xs">
                <p class="text-slate-400 text-center py-3 text-xs animate-pulse">চাকরি লোড হচ্ছে...</p>
              </div>
            </div>
          </div>
        </div>

        <!-- কনসোল প্যানেল ৩: বোনাস ও হেল্পলাইন -->
        <div id="tabContent_community" class="tab-pane hidden space-y-4">
          <!-- রেফারেল বোনাস -->
          <div id="cardReferralBox" class="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3.5 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-lg shrink-0">🎁</div>
              <div class="min-w-0">
                <h4 class="text-xs sm:text-sm font-bold text-white">রেফারেল প্রোগ্রাম — বন্ধুকে আমন্ত্রণ জানান</h4>
                <p class="text-[11px] text-slate-400 mt-0.5">আপনার রেফারেল কোডে রেজিস্ট্রেশন করলে দুজনের ওয়ালেটেই ক্যাশব্যাক যোগ হবে।</p>
                <div class="flex items-center gap-2 mt-2">
                  <code class="bg-black/40 border border-white/15 px-2.5 py-0.5 rounded text-xs font-mono text-emerald-400 font-bold">${user.user_code}</code>
                  <button onclick="copyRefLink()" class="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition flex items-center gap-1">
                    <i class="fas fa-link text-[9px]"></i> লিংক কপি
                  </button>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-4 self-end sm:self-auto shrink-0 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0 w-full sm:w-auto justify-between sm:justify-end">
              <div>
                <p class="text-[10px] text-slate-400">আমন্ত্রিত</p>
                <p class="text-base font-black text-white"><span id="refCount">০</span> জন</p>
              </div>
              <div class="text-right">
                <p class="text-[10px] text-slate-400">মোট বোনাস</p>
                <p class="text-base font-black text-emerald-400">৳<span id="refEarned">০</span></p>
              </div>
            </div>
          </div>

          <!-- অফিশিয়াল কমিউনিটি কানেক্ট স্ট্রিপ -->
          <div id="cardSocialHubBox" class="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold text-white flex items-center gap-2">
                <i class="fas fa-headset text-amber-400"></i> অফিসিয়াল সাপোর্ট ও কমিউনিটি
              </h4>
              <span class="text-[10px] text-emerald-400 font-semibold">সরাসরি যুক্ত থাকুন</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <a id="linkFacebook" href="https://facebook.com/groups/edusob.community" target="_blank" rel="noopener" class="p-2.5 rounded-xl bg-white/5 hover:bg-blue-600/20 border border-white/5 hover:border-blue-400/40 text-left transition flex items-center gap-2.5">
                <i class="fab fa-facebook-f text-blue-400 text-sm"></i>
                <div class="min-w-0">
                  <p class="font-bold text-white truncate text-[11px]">ফেসবুক</p>
                  <p class="text-[9px] text-slate-400 truncate">গ্রুপ ডিসকাশন</p>
                </div>
              </a>
              <a id="linkYoutube" href="https://youtube.com/@edusob_official" target="_blank" rel="noopener" class="p-2.5 rounded-xl bg-white/5 hover:bg-red-600/20 border border-white/5 hover:border-red-400/40 text-left transition flex items-center gap-2.5">
                <i class="fab fa-youtube text-red-400 text-sm"></i>
                <div class="min-w-0">
                  <p class="font-bold text-white truncate text-[11px]">ইউটিউব</p>
                  <p class="text-[9px] text-slate-400 truncate">ভিডিও ক্লাস</p>
                </div>
              </a>
              <a id="linkWhatsapp" href="https://chat.whatsapp.com/edusob-study-hub" target="_blank" rel="noopener" class="p-2.5 rounded-xl bg-white/5 hover:bg-emerald-600/20 border border-white/5 hover:border-emerald-400/40 text-left transition flex items-center gap-2.5">
                <i class="fab fa-whatsapp text-emerald-400 text-sm"></i>
                <div class="min-w-0">
                  <p class="font-bold text-white truncate text-[11px]">হোয়াটসঅ্যাপ</p>
                  <p class="text-[9px] text-slate-400 truncate">গ্রুপ আপডেট</p>
                </div>
              </a>
              <a id="linkTelegram" href="https://t.me/edusob_channel" target="_blank" rel="noopener" class="p-2.5 rounded-xl bg-white/5 hover:bg-sky-600/20 border border-white/5 hover:border-sky-400/40 text-left transition flex items-center gap-2.5">
                <i class="fab fa-telegram text-sky-400 text-sm"></i>
                <div class="min-w-0">
                  <p class="font-bold text-white truncate text-[11px]">টেলিগ্রাম</p>
                  <p class="text-[9px] text-slate-400 truncate">বই ও নোটিস</p>
                </div>
              </a>
              <a id="linkHelpline" href="tel:01835414122" class="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-white/5 hover:bg-amber-600/20 border border-white/5 hover:border-amber-400/40 text-left transition flex items-center gap-2.5">
                <i class="fas fa-phone text-amber-400 text-sm"></i>
                <div class="min-w-0">
                  <p class="font-bold text-white truncate text-[11px]">হেল্পলাইন</p>
                  <p id="helplineText" class="text-[9px] text-slate-400 truncate">০১৮৩৫৪১৪১২২</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  </main>
</div>

<!-- ৫. ফ্লোটিং অ্যাকশন স্পিড ডায়াল (FAB) ও ১-ক্লিক স্ক্রোল-টু-টপ -->
<div id="dashFab" class="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
  <!-- কুইক স্ক্রোল টু টপ বাটন (২০০px নিচে স্ক্রোল করলে অটো দৃশ্যমান হয়) -->
  <button id="dashScrollTopBtn" onclick="dashScrollToTop()" class="hidden opacity-0 translate-y-2 pointer-events-none transition-all duration-300 w-10 h-10 rounded-full bg-slate-900/90 hover:bg-slate-800 text-emerald-400 border border-white/20 shadow-xl items-center justify-center text-sm active:scale-95 group mb-0.5" title="পৃষ্ঠার শীর্ষে যান">
    <i class="fas fa-arrow-up group-hover:-translate-y-0.5 transition-transform"></i>
  </button>

  <div id="fabMenu" class="hidden flex-col items-end gap-2 mb-1 transition-all">
    <button onclick="dashScrollToTop(); toggleFab(false)" class="flex items-center gap-2 bg-slate-900/95 border border-sky-400/40 text-sky-300 px-3 py-1.5 rounded-xl shadow-xl text-xs font-bold hover:bg-slate-800 transition">
      <span>পৃষ্ঠার শীর্ষে যান</span>
      <i class="fas fa-arrow-up text-sky-400 text-xs"></i>
    </button>
    <button onclick="openAskTeacherModal(); toggleFab(false)" class="flex items-center gap-2 bg-slate-900/95 border border-amber-400/40 text-amber-300 px-3 py-1.5 rounded-xl shadow-xl text-xs font-bold hover:bg-slate-800 transition">
      <span>শিক্ষককে প্রশ্ন করুন</span>
      <i class="fas fa-chalkboard-user text-amber-400 text-xs"></i>
    </button>
    <button onclick="openResultModal(); toggleFab(false)" class="flex items-center gap-2 bg-slate-900/95 border border-emerald-400/40 text-emerald-300 px-3 py-1.5 rounded-xl shadow-xl text-xs font-bold hover:bg-slate-800 transition">
      <span>রেজাল্ট চেক</span>
      <i class="fas fa-graduation-cap text-emerald-400 text-xs"></i>
    </button>
    <a href="https://wa.me/8801835414122" target="_blank" rel="noopener" class="flex items-center gap-2 bg-slate-900/95 border border-teal-400/40 text-teal-300 px-3 py-1.5 rounded-xl shadow-xl text-xs font-bold hover:bg-slate-800 transition">
      <span>সরাসরি হোয়াটসঅ্যাপ</span>
      <i class="fab fa-whatsapp text-teal-400 text-xs"></i>
    </a>
  </div>

  <button id="fabMainBtn" onclick="toggleFab()" class="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-xl hover:scale-105 active:scale-95 transition flex items-center justify-center text-base border border-white/20" title="কুইক মেনু">
    <i id="fabIcon" class="fas fa-bolt"></i>
  </button>
</div>

<!-- ৬. ক্লায়েন্ট স্ক্রিপ্ট ও ইন্টারঅ্যাকশন -->
<script>
const USER_RELIGION = ${JSON.stringify(user.religion)};
const USER_LEVEL = ${JSON.stringify(user.education_level ?? '')};
const USER_CODE = ${JSON.stringify(user.user_code)};
const BN = s => String(s).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]);
const EXAM_NAMES = { ssc:'SSC/দাখিল', hsc:'HSC/আলিম', jsc:'JSC/JDC', nu_honours:'NU অনার্স', nu_degree:'NU ডিগ্রি', nu_masters:'NU মাস্টার্স' };

function escH(s){ const d=document.createElement('div'); d.textContent=s||''; return d.innerHTML; }

async function logout(){
  try { await axios.post('/api/auth/logout'); } catch(e){}
  window.location.href = '/';
}

function toggleDrawer(show){
  const w = document.getElementById('mobileDrawerWrap');
  if (w) {
    w.classList.toggle('hidden', !show);
    document.body.style.overflow = show ? 'hidden' : '';
  }
}

let isFabOpen = false;
function toggleFab(force){
  isFabOpen = typeof force === 'boolean' ? force : !isFabOpen;
  const m = document.getElementById('fabMenu');
  const icon = document.getElementById('fabIcon');
  if (m) m.classList.toggle('hidden', !isFabOpen);
  if (icon) icon.className = isFabOpen ? 'fas fa-xmark' : 'fas fa-bolt';
}
document.addEventListener('click', e => {
  const fab = document.getElementById('dashFab');
  if (fab && !fab.contains(e.target) && isFabOpen) toggleFab(false);
});

// ১-ক্লিকে পৃষ্ঠার শীর্ষে নিয়ে যাওয়ার আদর্শ সিস্টেম
function dashScrollToTop(){
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.dashScrollToTop = dashScrollToTop;

// স্ক্রোল ট্র্যাকিং: ইউজার ২০০px এর বেশি স্ক্রোল করলে স্ক্রোল-টু-টপ বাটন সফটলি ভেসে উঠবে
(function initScrollTopWatcher(){
  const btn = document.getElementById('dashScrollTopBtn');
  if (!btn) return;
  let isShown = false;
  function updateScrollBtn(){
    const y = window.pageYOffset || document.documentElement.scrollTop || 0;
    if (y > 200) {
      if (!isShown) {
        isShown = true;
        btn.classList.remove('hidden');
        btn.classList.add('flex');
        requestAnimationFrame(() => {
          btn.classList.remove('opacity-0', 'translate-y-2', 'pointer-events-none');
          btn.classList.add('opacity-100', 'translate-y-0');
        });
      }
    } else {
      if (isShown) {
        isShown = false;
        btn.classList.remove('opacity-100', 'translate-y-0');
        btn.classList.add('opacity-0', 'translate-y-2', 'pointer-events-none');
        setTimeout(() => {
          if (!isShown) {
            btn.classList.remove('flex');
            btn.classList.add('hidden');
          }
        }, 300);
      }
    }
  }
  window.addEventListener('scroll', updateScrollBtn, { passive: true });
  updateScrollBtn();
})();

// ট্যাব হ্যান্ডলার
let CURRENT_TAB = 'exams';
function setDashTab(tab){
  CURRENT_TAB = tab;
  document.querySelectorAll('.dash-tab-btn').forEach(b => {
    b.className = 'dash-tab-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 text-slate-400 hover:text-white hover:bg-white/10';
  });
  const activeBtn = document.getElementById('tabBtn_' + tab);
  if (activeBtn) {
    activeBtn.className = 'dash-tab-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 bg-white/15 text-white shadow-xs';
  }

  document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
  const activePane = document.getElementById('tabContent_' + tab);
  if (activePane) activePane.classList.remove('hidden');
}

// মোডাল ও টোস্ট
function showModal(title, bodyHtml){
  closeModal();
  const wrap = document.createElement('div');
  wrap.id = 'dashModal';
  wrap.className = 'fixed inset-0 z-[60] flex items-center justify-center p-4';
  wrap.innerHTML =
    '<div class="absolute inset-0 bg-black/75 backdrop-blur-sm" onclick="closeModal()"></div>' +
    '<div class="relative bg-slate-900 border border-white/20 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">' +
      '<div class="flex items-center justify-between px-5 py-3.5 border-b border-white/10">' +
        '<h3 class="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">' + title + '</h3>' +
        '<button onclick="closeModal()" class="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition"><i class="fas fa-xmark text-xs"></i></button>' +
      '</div>' +
      '<div class="p-5 overflow-y-auto text-xs sm:text-sm text-slate-200 custom-scrollbar">' + bodyHtml + '</div>' +
    '</div>';
  document.body.appendChild(wrap);
  document.body.style.overflow = 'hidden';
}
function closeModal(){
  const m = document.getElementById('dashModal');
  if (m) { m.remove(); document.body.style.overflow = ''; }
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function showToast(msg){
  let t = document.getElementById('dashToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'dashToast';
    t.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 border border-emerald-500/40 text-emerald-300 font-bold px-4 py-2 rounded-xl shadow-2xl text-xs flex items-center gap-2 transition-all opacity-0 pointer-events-none transform translate-y-3';
    document.body.appendChild(t);
  }
  t.innerHTML = '<i class="fas fa-circle-check text-emerald-400"></i> ' + msg;
  t.classList.remove('opacity-0', 'translate-y-3');
  t.classList.add('opacity-100', 'translate-y-0');
  setTimeout(function(){
    t.classList.remove('opacity-100', 'translate-y-0');
    t.classList.add('opacity-0', 'translate-y-3');
  }, 2000);
}

function copyText(str, msg){
  if (!str) { showToast('কপি করার মতো তথ্য নেই'); return; }
  navigator.clipboard.writeText(str).then(function(){
    showToast(msg || 'ক্লিপবোর্ডে কপি হয়েছে ✓');
  }).catch(function(){
    prompt('কপি করুন:', str);
  });
}

function copyRefLink(){
  const link = location.origin + '/signup?ref=' + encodeURIComponent(USER_CODE);
  copyText(link, 'রেফারেল লিংক কপি হয়েছে! 🎁');
}

// ব্রাউজার পুশ
function updatePushStatusUI(){
  const icon = document.getElementById('pushBellIcon');
  const txt = document.getElementById('pushStatusText');
  if (!icon || !txt) return;
  if (!('Notification' in window)) { txt.textContent = 'পুশ বন্ধ'; return; }
  if (Notification.permission === 'granted') {
    icon.className = 'fas fa-bell text-emerald-400';
    txt.textContent = 'পুশ অন';
  } else if (Notification.permission === 'denied') {
    icon.className = 'fas fa-bell-slash text-rose-400';
    txt.textContent = 'পুশ ব্লকড';
  } else {
    icon.className = 'fas fa-bell text-amber-400';
    txt.textContent = 'পুশ';
  }
}
async function togglePushNotifications(){
  if (!('Notification' in window)) { showToast('ডিভাইসে নোটিফিকেশন সাপোর্ট নেই'); return; }
  if (Notification.permission === 'granted') { showToast('পুশ অ্যালার্ট আগেই চালু আছে 🔔'); return; }
  try {
    const perm = await Notification.requestPermission();
    updatePushStatusUI();
    if (perm === 'granted') {
      showToast('পুশ অ্যালার্ট চালু হয়েছে! 🎉');
      new Notification('এডুসব', { body: 'পরীক্ষার রেজাল্ট ও জরুরি নোটিস সরাসরি পাবেন।' });
    }
  } catch(e){}
}
setTimeout(updatePushStatusUI, 600);

// “আজ কী করব?” ডেইলি স্টাডি মিশন ট্র্যাকার
function initDailyTasks(){
  const todayKey = 'edusob_task_' + new Date().toISOString().slice(0,10);
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem(todayKey) || '[]'); } catch(e){}
  let count = 0;
  [0,1,2,3].forEach(i => {
    const el = document.getElementById('task_' + i);
    if (el) {
      el.checked = saved.includes(i);
      if (el.checked) count++;
    }
  });
  updateDailyDeckUI(count);
}
function toggleTask(idx){
  const todayKey = 'edusob_task_' + new Date().toISOString().slice(0,10);
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem(todayKey) || '[]'); } catch(e){}
  const el = document.getElementById('task_' + idx);
  if (el && el.checked) {
    if (!saved.includes(idx)) saved.push(idx);
    showToast('পড়ার লক্ষ্য সম্পন্ন! দারুণ অগ্রগতি 🎯');
  } else {
    saved = saved.filter(x => x !== idx);
  }
  localStorage.setItem(todayKey, JSON.stringify(saved));
  updateDailyDeckUI(saved.length);
}
function updateDailyDeckUI(cnt){
  const summary = document.getElementById('deckTaskSummary');
  const pctEl = document.getElementById('studyMissionPct');
  const bar = document.getElementById('deckProgressBar');
  const pct = Math.round((cnt / 4) * 100);
  if (summary) summary.textContent = BN(cnt) + '/৪ লক্ষ্য সম্পন্ন' + (cnt === 4 ? ' 🎉' : '');
  if (pctEl) pctEl.textContent = BN(pct) + '% সম্পন্ন';
  if (bar) bar.style.width = pct + '%';
  [0,1,2,3].forEach(i => {
    const el = document.getElementById('task_' + i);
    const txt = document.getElementById('task_text_' + i);
    if (el && txt) {
      if (el.checked) {
        txt.className = 'text-xs text-slate-400 line-through flex-1 select-none transition-all';
      } else {
        txt.className = 'text-xs text-slate-200 flex-1 select-none transition-all';
      }
    }
  });
}
initDailyTasks();

// কোর ডাটা লোডার
async function loadDashboardCore(){
  try {
    const results = await Promise.allSettled([
      axios.get('/api/wallet'),
      axios.get('/api/saved-rolls'),
      axios.get('/api/profile'),
      axios.get('/api/referrals')
    ]);

    if (results[0].status === 'fulfilled' && results[0].value.data.ok) {
      const bal = BN(results[0].value.data.balance ?? 0);
      document.querySelectorAll('.wallet-val').forEach(el => el.textContent = bal);
    }

    if (results[1].status === 'fulfilled' && results[1].value.data.ok) {
      const rolls = results[1].value.data.rolls || [];
      const rc = document.getElementById('rollCount');
      if (rc) rc.textContent = BN(rolls.length);
      renderSavedRolls(rolls);
    } else {
      renderSavedRolls([]);
    }

    if (results[2].status === 'fulfilled' && results[2].value.data.ok) {
      const prof = results[2].value.data.profile || {};
      if (prof.photo_data) {
        document.querySelectorAll('.user-photo').forEach(img => {
          img.src = prof.photo_data;
          img.classList.remove('hidden');
        });
        document.querySelectorAll('.user-init').forEach(init => init.classList.add('hidden'));
      }
      const fields = ['father_bn','mother_bn','nid','dob','district','school_name','ssc_roll','photo_data','sign_data'];
      const filled = fields.filter(f => prof[f]).length;
      const pct = Math.round(filled / fields.length * 100);
      const pctEl = document.getElementById('profilePct');
      if (pctEl) pctEl.textContent = BN(pct) + '%';
      const pBar = document.getElementById('profileProgressBar');
      if (pBar) pBar.style.width = pct + '%';

      renderQuickCopyStrip(prof);
    }

    if (results[3].status === 'fulfilled' && results[3].value.data.ok) {
      const d = results[3].value.data;
      const cnt = document.getElementById('refCount');
      const earn = document.getElementById('refEarned');
      if (cnt) cnt.textContent = BN((d.referrals || []).length);
      if (earn) earn.textContent = BN(d.total_earned || 0);
    }
  } catch(e){}
}
loadDashboardCore();

// ১-ক্লিক ফরম চিপস স্ট্রিপ (Borderless, Compact Pills)
function renderQuickCopyStrip(prof){
  const strip = document.getElementById('quickCopyStrip');
  if (!strip) return;

  const items = [
    { label: 'SSC রোল', val: prof.ssc_roll },
    { label: 'SSC রেজি', val: prof.ssc_reg },
    { label: 'SSC বোর্ড', val: prof.ssc_board ? prof.ssc_board.toUpperCase() : '' },
    { label: 'SSC GPA', val: prof.ssc_gpa },
    { label: 'HSC রোল', val: prof.hsc_roll },
    { label: 'HSC রেজি', val: prof.hsc_reg },
    { label: 'NID/জন্মনিবন্ধন', val: prof.nid || prof.birth_reg }
  ];

  strip.innerHTML = items.map(c => {
    if (!c.val) {
      return '<a href="/profile" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-dashed border-white/15 text-slate-400 hover:text-white text-[11px] whitespace-nowrap transition inline-flex items-center gap-1">' +
        escH(c.label) + ': <span class="text-amber-300 font-bold">+ যোগ</span>' +
      '</a>';
    }
    return '<button onclick="copyPillDirect(this, \\''+escH(c.val)+'\\', \\''+escH(c.label)+'\\')" class="copy-chip-btn px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 text-[11px] whitespace-nowrap transition inline-flex items-center gap-1.5 active:scale-95 group">' +
      '<span class="text-slate-400">'+escH(c.label)+':</span>' +
      '<span class="font-mono font-bold text-white">'+escH(c.val)+'</span>' +
      '<i class="copy-icon fas fa-copy text-[9px] text-emerald-400 group-hover:scale-110"></i>' +
    '</button>';
  }).join('');
}

function copyPillDirect(btn, val, label){
  if (!val) return;
  navigator.clipboard.writeText(val).then(() => {
    const icon = btn.querySelector('.copy-icon');
    if (icon) {
      icon.className = 'copy-icon fas fa-check text-[9px] text-emerald-300 animate-bounce';
      setTimeout(() => { icon.className = 'copy-icon fas fa-copy text-[9px] text-emerald-400 group-hover:scale-110'; }, 1500);
    }
    showToast(label + ' কপি হয়েছে ✓');
  }).catch(() => {
    copyText(val, label + ' কপি হয়েছে ✓');
  });
}

// সেভ করা রোল তালিকা
function renderSavedRolls(rolls){
  const list = document.getElementById('rollsList');
  if (!list) return;

  if (!rolls.length) {
    list.innerHTML =
      '<div class="text-center py-4 border border-dashed border-white/15 rounded-xl bg-white/5">' +
        '<p class="text-slate-400 text-xs">এখনো কোনো রোল সেভ করেননি</p>' +
        '<button onclick="openSaveRollModal()" class="mt-2 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 py-1 rounded-lg font-bold transition inline-flex items-center gap-1">' +
          '<i class="fas fa-plus text-[10px]"></i> রোল সেভ করুন' +
        '</button>' +
      '</div>';
    return;
  }

  list.innerHTML = rolls.map(x =>
    '<div class="flex items-center justify-between gap-3 bg-white/5 rounded-xl px-3 py-2 border border-white/10 hover:border-white/20 transition">' +
      '<div class="flex items-center gap-2.5 min-w-0">' +
        '<div class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs shrink-0"><i class="fas fa-graduation-cap"></i></div>' +
        '<div class="min-w-0">' +
          '<p class="font-bold text-xs text-white truncate">' + (EXAM_NAMES[x.exam_type] || x.exam_type) + (x.board ? ' · ' + x.board.toUpperCase() : '') + (x.exam_year ? ' (' + x.exam_year + ')' : '') + '</p>' +
          '<p class="text-slate-400 text-[11px] font-mono">রোল: ' + (x.roll || '—') + (x.reg ? ' · রেজি: ' + x.reg : '') + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="flex items-center gap-1.5 shrink-0">' +
        '<button onclick="quickCheckSpecificRoll(\\''+x.exam_type+'\\', \\''+x.exam_year+'\\', \\''+x.board+'\\', \\''+x.roll+'\\', \\''+x.reg+'\\')" class="text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1">' +
          '<i class="fas fa-search text-[9px]"></i> রেজাল্ট' +
        '</button>' +
        '<button onclick="deleteSavedRoll('+x.id+')" class="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 transition flex items-center justify-center" title="মুছে ফেলুন">' +
          '<i class="fas fa-trash-can text-[10px]"></i>' +
        '</button>' +
      '</div>' +
    '</div>'
  ).join('');
}

async function deleteSavedRoll(id){
  if (!confirm('রোলটি মুছে ফেলতে চান?')) return;
  try {
    await axios.delete('/api/saved-rolls/' + id);
    showToast('রোল মুছে ফেলা হয়েছে ✓');
    loadDashboardCore();
  } catch(e){}
}

// ফিড ও নোটিস লোডার (Unified Timeline)
let currentVerseText = '';
async function loadFeedsAndTimelines(){
  try {
    // ১. নামাজ বা পঞ্জিকা
    const prayerBox = document.getElementById('compactPrayerOrPanchang');
    if (prayerBox) {
      if (USER_RELIGION === 'islam') {
        try {
          const r = await axios.get('/api/feeds/prayer?city=Dhaka');
          if (r.data && r.data.ok && r.data.timings) {
            const t = r.data.timings;
            const NAMES = { Fajr:'ফজর', Dhuhr:'যোহর', Asr:'আসর', Maghrib:'মাগরিব', Isha:'এশা' };
            const order = ['Fajr','Dhuhr','Asr','Maghrib','Isha'];
            const nowBd = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
            const nowMin = nowBd.getHours() * 60 + nowBd.getMinutes();
            let nextName = 'ফজর', nextMin = null;
            for (const k of order) {
              const [h, m] = t[k].split(':').map(Number);
              if (h * 60 + m > nowMin) { nextName = NAMES[k]; nextMin = h * 60 + m; break; }
            }
            prayerBox.innerHTML =
              '<i class="fas fa-mosque text-emerald-400 text-sm shrink-0"></i>' +
              '<span class="text-slate-300 font-semibold">নামাজ (ঢাকা): পরবর্তী <b class="text-white">' + nextName + '</b></span>' +
              '<div class="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 ml-2 font-mono">' +
                order.map(k => '<span class="bg-black/30 px-1.5 py-0.5 rounded">'+NAMES[k]+': '+BN(t[k])+'</span>').join('') +
              '</div>';
          }
        } catch(e){}
      } else if (USER_RELIGION === 'sanatan' || USER_RELIGION === 'buddhist') {
        try {
          const r = await axios.get('/api/feeds/panchang');
          if (r.data && r.data.ok && r.data.panchang) {
            prayerBox.innerHTML =
              '<i class="fas fa-om text-amber-400 text-sm shrink-0"></i>' +
              '<span class="text-slate-300">আজকের তিথি: <b class="text-amber-300">' + escH(r.data.panchang.tithi || 'শুক্লা') + '</b></span>';
          }
        } catch(e){}
      } else {
        prayerBox.innerHTML = '<i class="fas fa-compass text-sky-400"></i> <span class="text-slate-300">প্রতিদিন নতুন উদ্যমে নিজের লক্ষ্য অর্জন করুন!</span>';
      }
    }

    // ২. বাণী
    try {
      const vRes = await axios.get('/api/feeds/verse?religion=' + encodeURIComponent(USER_RELIGION));
      if (vRes.data && vRes.data.ok && vRes.data.verse) {
        currentVerseText = vRes.data.verse.text + ' — ' + (vRes.data.verse.ref || '');
        const vt = document.getElementById('compactVerseText');
        if (vt) vt.textContent = '“' + vRes.data.verse.text + '”';
      }
    } catch(e){}

    // ৩. নোটিস ও ঘোষণা
    loadAnnouncementsFeed();

    // ৪. খবর ও চাকরি
    loadNewsAndJobsFeed();

    // ৫. সোশ্যাল সেটিংস
    loadAdminCardSettings();
  } catch(e){}
}
loadFeedsAndTimelines();

function copyVerseText(){
  if (currentVerseText) copyText(currentVerseText, 'বাণী কপি হয়েছে! 🌟');
}

let ALL_ANNOUNCEMENTS = [];
async function loadAnnouncementsFeed(){
  try {
    const res = await axios.get('/api/announcements');
    if (res.data && res.data.ok) {
      const list = res.data.announcements || [];
      // পিন্ড ও প্রায়োরিটি অনুযায়ী সাজানো
      list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.pinned_priority || 0) - (a.pinned_priority || 0));
      ALL_ANNOUNCEMENTS = list;

      const badge = document.getElementById('notifBadge');
      if (badge && ALL_ANNOUNCEMENTS.length) {
        badge.textContent = BN(ALL_ANNOUNCEMENTS.length);
        badge.classList.remove('hidden');
      }

      // প্রায়োরিটি সেকশনে শীর্ষ নোটিস দেখাই
      if (ALL_ANNOUNCEMENTS.length) {
        const topNotice = ALL_ANNOUNCEMENTS[0];
        const titleEl = document.getElementById('urgentNoticeTitle');
        const descEl = document.getElementById('urgentNoticeDesc');
        const actEl = document.getElementById('urgentNoticeAction');
        if (titleEl) titleEl.textContent = topNotice.title;
        if (descEl) descEl.textContent = topNotice.body || 'গুরুত্বপূর্ণ অফিসিয়াল নোটিস ও আপডেট বিস্তারিত জেনে নিন।';
        if (actEl) {
          if (topNotice.link) {
            actEl.href = topNotice.link;
            actEl.target = topNotice.link.startsWith('http') ? '_blank' : '';
            actEl.onclick = null;
            actEl.innerHTML = '<span>বিস্তারিত</span> <i class="fas fa-arrow-right text-[10px]"></i>';
          } else {
            actEl.href = 'javascript:void(0)';
            actEl.target = '';
            actEl.onclick = () => openNotificationsModal();
            actEl.innerHTML = '<span>নোটিস পড়ুন</span> <i class="fas fa-book-open text-[10px]"></i>';
          }
        }
      }

      // টাইমলাইন ট্যাবে রেন্ডার
      const tl = document.getElementById('announceListTimeline');
      if (tl) {
        if (!ALL_ANNOUNCEMENTS.length) {
          tl.innerHTML = '<p class="text-slate-400 text-center py-3">বর্তমানে কোনো নতুন নোটিস নেই</p>';
          return;
        }
        tl.innerHTML = ALL_ANNOUNCEMENTS.slice(0, 4).map(a =>
          '<div class="flex items-start justify-between gap-3 p-2.5 rounded-xl hover:bg-white/5 transition">' +
            '<div class="min-w-0">' +
              '<div class="flex items-center gap-2 mb-0.5">' +
                '<span class="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold uppercase">' + (a.pinned ? '📌 পিন্ড' : (a.type || 'নোটিস')) + '</span>' +
                '<h5 class="text-xs font-bold text-white truncate">' + escH(a.title) + '</h5>' +
              '</div>' +
              '<p class="text-[11px] text-slate-300 line-clamp-1">' + escH(a.body || '') + '</p>' +
            '</div>' +
            (a.link ? '<a href="'+a.link+'" '+(a.link.startsWith('http') ? 'target="_blank" rel="noopener"' : '')+' class="text-[10px] text-emerald-400 font-bold hover:underline shrink-0">দেখুন →</a>' : '<button onclick="openNotificationsModal()" class="text-[10px] text-amber-400 font-bold hover:underline shrink-0">পড়ুন</button>') +
          '</div>'
        ).join('');
      }
    }
  } catch(e){}
}

async function loadNewsAndJobsFeed(){
  try {
    const [nRes, jRes] = await Promise.allSettled([
      axios.get('/api/feeds/news?cat=education'),
      axios.get('/api/feeds/jobs?level=' + encodeURIComponent(USER_LEVEL))
    ]);

    const newsBox = document.getElementById('newsPreviewTimeline');
    if (newsBox && nRes.status === 'fulfilled' && nRes.value.data.ok) {
      const items = (nRes.value.data.items || []).slice(0, 4);
      newsBox.innerHTML = items.length ? items.map(n =>
        '<div class="py-2 first:pt-0 last:pb-0">' +
          '<a href="' + n.link + '" target="_blank" rel="noopener" class="font-semibold text-white hover:text-sky-300 line-clamp-1 block transition">' + escH(n.title) + '</a>' +
          '<p class="text-[10px] text-slate-400 mt-0.5">' + escH(n.source) + '</p>' +
        '</div>'
      ).join('') : '<p class="text-slate-400 text-center py-2">সংবাদ লোড হয়নি</p>';
    }

    const jobsBox = document.getElementById('jobsPreviewTimeline');
    if (jobsBox && jRes.status === 'fulfilled' && jRes.value.data.ok) {
      const jobs = (jRes.value.data.jobs || []).slice(0, 4);
      jobsBox.innerHTML = jobs.length ? jobs.map(j =>
        '<div class="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-2">' +
          '<div class="min-w-0">' +
            '<p class="font-semibold text-white truncate">' + escH(j.title) + '</p>' +
            '<p class="text-[10px] text-slate-400 truncate">' + escH(j.org || '') + (j.deadline ? ' · শেষ: ' + BN(j.deadline) : '') + '</p>' +
          '</div>' +
          '<a href="' + (j.apply_link || '/jobs') + '" ' + (j.apply_link ? 'target="_blank" rel="noopener"' : '') + ' class="text-[10px] bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 px-2 py-0.5 rounded font-bold shrink-0 transition">আবেদন</a>' +
        '</div>'
      ).join('') : '<p class="text-slate-400 text-center py-2">চাকরি লোড হয়নি</p>';
    }
  } catch(e){}
}

async function loadAdminCardSettings(){
  try {
    const res = await axios.get('/api/settings/public');
    if (res.data && res.data.ok) {
      const s = res.data.social || {};
      const c = res.data.cards || {};
      const f = res.data.features || {};

      // ১. সোশ্যাল লিঙ্ক ও চ্যানেল অন/অফ
      const fb = document.getElementById('linkFacebook'); 
      if (fb) {
        if (s.facebook) fb.href = s.facebook;
        fb.style.display = (c.card_community_fb !== false && s.facebook && s.facebook.trim() !== '') ? '' : 'none';
      }

      const yt = document.getElementById('linkYoutube'); 
      if (yt) {
        if (s.youtube) yt.href = s.youtube;
        yt.style.display = (c.card_community_yt !== false && s.youtube && s.youtube.trim() !== '') ? '' : 'none';
      }

      const wa = document.getElementById('linkWhatsapp'); 
      if (wa) {
        if (s.whatsapp_group) wa.href = s.whatsapp_group;
        wa.style.display = (c.card_community_wa !== false && s.whatsapp_group && s.whatsapp_group.trim() !== '') ? '' : 'none';
      }

      const tg = document.getElementById('linkTelegram'); 
      if (tg) {
        if (s.telegram) tg.href = s.telegram;
        tg.style.display = (c.card_community_tg !== false && s.telegram && s.telegram.trim() !== '') ? '' : 'none';
      }

      const hp = document.getElementById('linkHelpline'); 
      if (hp) {
        if (s.support_phone) {
          hp.href = 'tel:' + s.support_phone;
          const hpt = document.getElementById('helplineText');
          if (hpt) hpt.textContent = s.support_phone;
        }
        hp.style.display = (c.card_community_help !== false && s.support_phone && s.support_phone.trim() !== '') ? '' : 'none';
      }

      // ২. মাস্টার সোশ্যাল ও সাপোর্ট হাব অন/অফ
      const socialHub = document.getElementById('cardSocialHubBox');
      if (socialHub) socialHub.style.display = (c.card_social_hub !== false) ? '' : 'none';

      // ৩. কোর ফিচারসমূহ (Shop, Teacher Support)
      const shopBtn = document.getElementById('dashQuickShopBtn');
      if (shopBtn) shopBtn.style.display = (f.shop_enabled !== false) ? '' : 'none';

      const teacherBtn = document.getElementById('dashTeacherSupportBtn');
      if (teacherBtn) teacherBtn.style.display = (f.teacher_support_enabled !== false && c.card_teacher_support !== false) ? '' : 'none';

      // ৪. ড্যাশবোর্ড কার্ডসমূহ
      const announce = document.getElementById('urgentPriorityItem');
      if (announce) {
        announce.style.display = (c.card_announce !== false) ? '' : 'none';
        const unDesc = document.getElementById('urgentNoticeDesc');
        if (unDesc && s.notice_marquee) unDesc.textContent = s.notice_marquee;
      }

      const studyGoals = document.getElementById('cardStudyMissionBox');
      if (studyGoals) studyGoals.style.display = (c.card_study_goals !== false) ? '' : 'none';

      const quickCopy = document.getElementById('cardQuickCopyBox');
      if (quickCopy) quickCopy.style.display = (c.card_quick_copy !== false) ? '' : 'none';

      const religion = document.getElementById('cardReligionBox');
      if (religion) religion.style.display = (c.card_religion !== false) ? '' : 'none';

      const quickActions = document.getElementById('cardQuickActionsBox');
      if (quickActions) quickActions.style.display = (c.card_quick_actions !== false) ? '' : 'none';

      const newsBox = document.getElementById('cardNewsBox');
      if (newsBox) newsBox.style.display = (c.card_news !== false) ? '' : 'none';

      const jobsBox = document.getElementById('cardJobsBox');
      if (jobsBox) jobsBox.style.display = (c.card_jobs !== false) ? '' : 'none';

      const referralBox = document.getElementById('cardReferralBox');
      if (referralBox) referralBox.style.display = (c.card_referral !== false) ? '' : 'none';

      const savedRolls = document.getElementById('tabContent_exams');
      const savedRollsTab = document.getElementById('tabBtn_exams');
      if (c.card_saved_rolls === false) {
        if (savedRolls) savedRolls.style.display = 'none';
        if (savedRollsTab) savedRollsTab.style.display = 'none';
        if (typeof setDashTab === 'function') setDashTab('feed');
      } else {
        if (savedRolls) savedRolls.style.display = '';
        if (savedRollsTab) savedRollsTab.style.display = '';
      }
    }
  } catch(e){}
}

// =================== ফাংশনাল মোডালসমূহ ===================

// রেজাল্ট মোডাল
function openResultModal(){
  showModal('ইনস্ট্যান্ট বোর্ড রেজাল্ট অনুসন্ধান',
    '<form onsubmit="handleModalResultSubmit(event)" class="space-y-3 text-xs">' +
      '<div>' +
        '<label class="block text-slate-400 mb-1 font-semibold">পরীক্ষার নাম</label>' +
        '<select id="mResExam" class="w-full bg-slate-800 border border-white/20 rounded-xl p-2.5 text-white font-bold">' +
          '<option value="ssc">SSC / দাখিল</option>' +
          '<option value="hsc">HSC / আলিম</option>' +
          '<option value="jsc">JSC / JDC</option>' +
        '</select>' +
      '</div>' +
      '<div class="grid grid-cols-2 gap-2">' +
        '<div>' +
          '<label class="block text-slate-400 mb-1 font-semibold">পাসের সাল</label>' +
          '<select id="mResYear" class="w-full bg-slate-800 border border-white/20 rounded-xl p-2.5 text-white font-bold">' +
            '<option value="2024">২০২৪</option>' +
            '<option value="2023">২০২৩</option>' +
            '<option value="2022">২০২২</option>' +
          '</select>' +
        '</div>' +
        '<div>' +
          '<label class="block text-slate-400 mb-1 font-semibold">বোর্ড</label>' +
          '<select id="mResBoard" class="w-full bg-slate-800 border border-white/20 rounded-xl p-2.5 text-white font-bold">' +
            '<option value="dhaka">ঢাকা</option>' +
            '<option value="chittagong">চট্টগ্রাম</option>' +
            '<option value="rajshahi">রাজশাহী</option>' +
            '<option value="comilla">কুমিল্লা</option>' +
            '<option value="jessore">যশোর</option>' +
            '<option value="barisal">বরিশাল</option>' +
            '<option value="sylhet">সিলেট</option>' +
            '<option value="dinajpur">দিনাজপুর</option>' +
            '<option value="mymensingh">ময়মনসিংহ</option>' +
            '<option value="madrasah">মাদ্রাসা</option>' +
            '<option value="tec">কারিগরি</option>' +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div class="grid grid-cols-2 gap-2">' +
        '<div>' +
          '<label class="block text-slate-400 mb-1 font-semibold">রোল নম্বর</label>' +
          '<input type="text" id="mResRoll" placeholder="রোল দিন" required class="w-full bg-slate-800 border border-white/20 rounded-xl p-2.5 text-white font-mono">' +
        '</div>' +
        '<div>' +
          '<label class="block text-slate-400 mb-1 font-semibold">রেজিস্ট্রেশন নম্বর</label>' +
          '<input type="text" id="mResReg" placeholder="রেজি নম্বর দিন" required class="w-full bg-slate-800 border border-white/20 rounded-xl p-2.5 text-white font-mono">' +
        '</div>' +
      '</div>' +
      '<button type="submit" id="mResSubmitBtn" class="w-full mt-3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black transition flex items-center justify-center gap-2 shadow-lg">' +
        '<i class="fas fa-search"></i> রেজাল্ট দেখুন' +
      '</button>' +
      '<div id="mResOutput" class="pt-2"></div>' +
    '</form>'
  );
}

async function handleModalResultSubmit(e){
  e.preventDefault();
  const exam = document.getElementById('mResExam').value;
  const year = document.getElementById('mResYear').value;
  const board = document.getElementById('mResBoard').value;
  const roll = document.getElementById('mResRoll').value.trim();
  const reg = document.getElementById('mResReg').value.trim();
  const btn = document.getElementById('mResSubmitBtn');
  const out = document.getElementById('mResOutput');

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> অনুসন্ধান চলছে...';
  out.innerHTML = '<p class="text-center text-slate-400 py-3 animate-pulse">শিক্ষা বোর্ডের সার্ভারে অনুসন্ধান করা হচ্ছে...</p>';

  try {
    const res = await axios.get('/api/result/check', { params: { exam, year, board, roll, reg } });
    if (res.data && res.data.ok) {
      const s = res.data.student || {};
      const r = res.data.result || {};
      out.innerHTML =
        '<div class="bg-emerald-500/15 rounded-xl p-3.5 border border-emerald-500/40 space-y-1.5">' +
          '<div class="flex items-center justify-between">' +
            '<h4 class="font-bold text-white text-xs sm:text-sm">' + (s.name || 'শিক্ষার্থী') + '</h4>' +
            '<span class="text-xs bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded">GPA: ' + (r.gpa || 'Passed') + '</span>' +
          '</div>' +
          '<p class="text-slate-300 text-xs">রোল: ' + roll + ' · বোর্ড: ' + board.toUpperCase() + ' · ফলাফল: ' + (r.status || 'উত্তীর্ণ') + '</p>' +
          '<a href="/results" class="inline-block pt-1 text-xs text-emerald-400 font-bold hover:underline">পূর্ণাঙ্গ মার্কশিট হাব →</a>' +
        '</div>';
    } else {
      out.innerHTML = '<p class="text-rose-400 text-xs text-center py-2">' + (res.data?.error || 'রেজাল্ট পাওয়া যায়নি') + '</p>';
    }
  } catch(err){
    out.innerHTML = '<p class="text-rose-400 text-xs text-center py-2">' + (err.response?.data?.error || 'রেজাল্ট সার্ভার ব্যস্ত') + '</p>';
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-search"></i> রেজাল্ট দেখুন';
  }
}

function quickCheckSpecificRoll(exam, year, board, roll, reg){
  openResultModal();
  setTimeout(() => {
    if (document.getElementById('mResExam')) document.getElementById('mResExam').value = exam || 'ssc';
    if (document.getElementById('mResYear')) document.getElementById('mResYear').value = year || '2024';
    if (document.getElementById('mResBoard')) document.getElementById('mResBoard').value = board || 'dhaka';
    if (document.getElementById('mResRoll')) document.getElementById('mResRoll').value = roll || '';
    if (document.getElementById('mResReg')) document.getElementById('mResReg').value = reg || '';
    const form = document.querySelector('#dashModal form');
    if (form) form.requestSubmit();
  }, 100);
}

// ইন-ড্যাশবোর্ড দ্রুত রেজাল্ট অনুসন্ধান
async function handleQuickResultSubmit(e){
  e.preventDefault();
  const exam = document.getElementById('qrExam').value;
  const year = document.getElementById('qrYear').value;
  const board = document.getElementById('qrBoard').value;
  const roll = document.getElementById('qrRoll').value.trim();
  const reg = document.getElementById('qrReg').value.trim();
  const btn = document.getElementById('qrSubmitBtn');
  const container = document.getElementById('qrResultContainer');

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> খোঁজা হচ্ছে...';
  container.classList.remove('hidden');
  container.innerHTML = '<p class="text-center text-slate-400 py-2 animate-pulse">ডাটা প্রক্সি থেকে রেজাল্ট আনা হচ্ছে...</p>';

  try {
    const res = await axios.get('/api/result/check', { params: { exam, year, board, roll, reg } });
    if (res.data && res.data.ok) {
      const s = res.data.student || {};
      const r = res.data.result || {};
      container.innerHTML =
        '<div class="bg-emerald-500/15 border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between gap-3">' +
          '<div>' +
            '<p class="text-xs font-bold text-white">' + (s.name || 'শিক্ষার্থী') + ' · বোর্ড: ' + board.toUpperCase() + '</p>' +
            '<p class="text-[11px] text-slate-300">রোল: ' + roll + ' | রেজি: ' + reg + ' | সাল: ' + year + '</p>' +
          '</div>' +
          '<div class="flex items-center gap-2">' +
            '<span class="text-xs font-black bg-emerald-500 text-slate-950 px-2.5 py-1 rounded">GPA ' + (r.gpa || 'উত্তীর্ণ') + '</span>' +
            '<a href="/results" class="text-xs bg-white/10 text-white font-bold px-2 py-1 rounded hover:bg-white/20">মার্কশিট</a>' +
          '</div>' +
        '</div>';
    } else {
      container.innerHTML = '<p class="text-center text-rose-400 text-xs py-1">' + (res.data?.error || 'রেজাল্ট পাওয়া যায়নি') + '</p>';
    }
  } catch(err){
    container.innerHTML = '<p class="text-center text-rose-400 text-xs py-1">' + (err.response?.data?.error || 'রেজাল্ট সার্ভার সাময়িক ব্যস্ত।') + '</p>';
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-search text-[10px]"></i> রেজাল্ট অনুসন্ধান';
  }
}

// রোল সেভ মোডাল
function openSaveRollModal(){
  showModal('রোল ও রেজিস্ট্রেশন সংরক্ষণ',
    '<form onsubmit="handleSaveRollSubmit(event)" class="space-y-3 text-xs">' +
      '<div>' +
        '<label class="block text-slate-400 mb-1 font-semibold">পরীক্ষার নাম</label>' +
        '<select id="srExam" class="w-full bg-slate-800 border border-white/20 rounded-xl p-2.5 text-white font-bold">' +
          '<option value="ssc">SSC / দাখিল</option>' +
          '<option value="hsc">HSC / আলিম</option>' +
          '<option value="jsc">JSC / JDC</option>' +
          '<option value="nu_honours">জাতীয় বিশ্ববিদ্যালয় (অনার্স)</option>' +
          '<option value="nu_degree">জাতীয় বিশ্ববিদ্যালয় (ডিগ্রি)</option>' +
        '</select>' +
      '</div>' +
      '<div class="grid grid-cols-2 gap-2">' +
        '<div>' +
          '<label class="block text-slate-400 mb-1 font-semibold">শিক্ষা বোর্ড</label>' +
          '<select id="srBoard" class="w-full bg-slate-800 border border-white/20 rounded-xl p-2.5 text-white font-bold">' +
            '<option value="dhaka">ঢাকা</option>' +
            '<option value="chittagong">চট্টগ্রাম</option>' +
            '<option value="rajshahi">রাজশাহী</option>' +
            '<option value="comilla">কুমিল্লা</option>' +
            '<option value="jessore">যশোর</option>' +
            '<option value="barisal">বরিশাল</option>' +
            '<option value="sylhet">সিলেট</option>' +
            '<option value="dinajpur">দিনাজপুর</option>' +
            '<option value="mymensingh">ময়মনসিংহ</option>' +
            '<option value="madrasah">মাদ্রাসা</option>' +
            '<option value="tec">কারিগরি</option>' +
          '</select>' +
        '</div>' +
        '<div>' +
          '<label class="block text-slate-400 mb-1 font-semibold">পাসের সাল</label>' +
          '<input type="text" id="srYear" placeholder="যেমন: 2024" class="w-full bg-slate-800 border border-white/20 rounded-xl p-2.5 text-white font-mono">' +
        '</div>' +
      '</div>' +
      '<div class="grid grid-cols-2 gap-2">' +
        '<div>' +
          '<label class="block text-slate-400 mb-1 font-semibold">রোল নম্বর</label>' +
          '<input type="text" id="srRoll" placeholder="রোল" required class="w-full bg-slate-800 border border-white/20 rounded-xl p-2.5 text-white font-mono">' +
        '</div>' +
        '<div>' +
          '<label class="block text-slate-400 mb-1 font-semibold">রেজিস্ট্রেশন নম্বর</label>' +
          '<input type="text" id="srReg" placeholder="রেজি নম্বর" class="w-full bg-slate-800 border border-white/20 rounded-xl p-2.5 text-white font-mono">' +
        '</div>' +
      '</div>' +
      '<button type="submit" id="srSubmitBtn" class="w-full mt-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black transition flex items-center justify-center gap-2 shadow-lg">' +
        '<i class="fas fa-bookmark"></i> রোল সংরক্ষণ করুন' +
      '</button>' +
    '</form>'
  );
}

async function handleSaveRollSubmit(e){
  e.preventDefault();
  const exam_type = document.getElementById('srExam').value;
  const board = document.getElementById('srBoard').value;
  const exam_year = document.getElementById('srYear').value.trim();
  const roll = document.getElementById('srRoll').value.trim();
  const reg = document.getElementById('srReg').value.trim();
  const btn = document.getElementById('srSubmitBtn');

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> সংরক্ষণ হচ্ছে...';

  try {
    const res = await axios.post('/api/saved-rolls', { exam_type, board, exam_year, roll, reg });
    if (res.data && res.data.ok) {
      showToast('রোল সংরক্ষিত হয়েছে! ✓');
      closeModal();
      loadDashboardCore();
    }
  } catch(err){
    alert(err.response?.data?.error || 'সংরক্ষণ ব্যর্থ');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-bookmark"></i> রোল সংরক্ষণ করুন';
  }
}

// শিক্ষক সহায়তা মোডাল
function openAskTeacherModal(){
  showModal('শিক্ষককে প্রশ্ন পাঠান',
    '<form onsubmit="handleAskTeacherSubmit(event)" class="space-y-3 text-xs">' +
      '<div class="grid grid-cols-2 gap-2">' +
        '<div>' +
          '<label class="block text-slate-400 mb-1 font-semibold">বিষয়</label>' +
          '<select id="tsSubject" class="w-full bg-slate-800 border border-white/20 rounded-xl p-2.5 text-white font-bold">' +
            '<option value="গনিত">উচ্চতর ও সাধারণ গণিত</option>' +
            '<option value="পদার্থবিজ্ঞান">পদার্থবিজ্ঞান</option>' +
            '<option value="রসায়ন">রসায়ন</option>' +
            '<option value="ইংরেজি">ইংরেজি ১ম ও ২য় পত্র</option>' +
            '<option value="আইসিটি">তথ্য ও যোগাযোগ প্রযুক্তি (ICT)</option>' +
            '<option value="অন্যান্য">অন্যান্য বিষয়</option>' +
          '</select>' +
        '</div>' +
        '<div>' +
          '<label class="block text-slate-400 mb-1 font-semibold">জরুরিতা</label>' +
          '<select id="tsUrgency" class="w-full bg-slate-800 border border-white/20 rounded-xl p-2.5 text-white font-bold">' +
            '<option value="normal">সাধারণ (১-২ ঘণ্টা)</option>' +
            '<option value="urgent">জরুরি (১৫-৩০ মিনিট)</option>' +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div>' +
        '<label class="block text-slate-400 mb-1 font-semibold">টপিক / অধ্যায়</label>' +
        '<input type="text" id="tsTopic" placeholder="যেমন: গতিবিদ্যা, অধ্যায় ৩" required class="w-full bg-slate-800 border border-white/20 rounded-xl p-2.5 text-white">' +
      '</div>' +
      '<div>' +
        '<label class="block text-slate-400 mb-1 font-semibold">প্রশ্নের বিবরণ</label>' +
        '<textarea id="tsQuestion" rows="4" placeholder="সমস্যাটি বিস্তারিত লিখুন..." required class="w-full bg-slate-800 border border-white/20 rounded-xl p-2.5 text-white custom-scrollbar"></textarea>' +
      '</div>' +
      '<button type="submit" id="tsSubmitBtn" class="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black transition flex items-center justify-center gap-2 shadow-lg">' +
        '<i class="fas fa-paper-plane"></i> প্রশ্ন জমা দিন' +
      '</button>' +
    '</form>'
  );
}

async function handleAskTeacherSubmit(e){
  e.preventDefault();
  const subject = document.getElementById('tsSubject').value;
  const urgency = document.getElementById('tsUrgency').value;
  const topic = document.getElementById('tsTopic').value.trim();
  const question = document.getElementById('tsQuestion').value.trim();
  const btn = document.getElementById('tsSubmitBtn');

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> পাঠানো হচ্ছে...';

  try {
    const res = await axios.post('/api/teacher-support/ask', { subject, urgency, topic, question });
    if (res.data && res.data.ok) {
      showToast('শিক্ষকের কাছে প্রশ্ন পৌঁছেছে! টিকেট: ' + (res.data.ticket_code || '✓'));
      closeModal();
    }
  } catch(err){
    alert(err.response?.data?.error || 'প্রশ্ন পাঠাতে সমস্যা হয়েছে');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> প্রশ্ন জমা দিন';
  }
}

// ক্যাশ-ইন মোডাল
function openAddMoneyModal(){
  showModal('এডুসব ওয়ালেটে ক্যাশ-ইন',
    '<div class="space-y-3.5 text-xs">' +
      '<p class="text-slate-300">বিকাশ, নগদ বা রকেটের মাধ্যমে খুব সহজেই ওয়ালেট রিচার্জ করুন। ব্যালেন্স দিয়ে বিভিন্ন পরীক্ষার ফরম পূরণ ও প্রিমিয়াম স্টুডেন্ট টুলস ব্যবহার করতে পারবেন।</p>' +
      '<div class="bg-white/5 border border-white/15 rounded-xl p-3 space-y-1.5">' +
        '<p class="font-bold text-white flex items-center gap-2"><i class="fas fa-money-bill-transfer text-emerald-400"></i> সেন্ড মানি নম্বর (Personal):</p>' +
        '<div class="flex items-center justify-between bg-black/40 px-3 py-2 rounded-lg border border-white/10">' +
          '<code class="font-mono font-bold text-sm text-emerald-300">01835414122</code>' +
          '<button onclick="copyText(\\'01835414122\\', \\'নম্বর কপি হয়েছে!\\')" class="text-[11px] bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded text-slate-200 transition">কপি</button>' +
        '</div>' +
        '<p class="text-[10px] text-slate-400">টাকা পাঠিয়ে ট্রানজেকশন আইডি ওয়ালেট পেজে সাবমিট করুন।</p>' +
      '</div>' +
      '<a href="/wallet" class="block text-center w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black transition shadow-lg">' +
        'ওয়ালেট ড্যাশবোর্ডে যান →' +
      '</a>' +
    '</div>'
  );
}

// নোটিফিকেশন সেন্টার মোডাল
function openNotificationsModal(){
  if (!ALL_ANNOUNCEMENTS.length) {
    showModal('নোটিফিকেশন সেন্টার', '<p class="text-center text-slate-400 py-6 text-xs">বর্তমানে কোনো নতুন নোটিফিকেশন নেই।</p>');
    return;
  }
  showModal('নোটিফিকেশন সেন্টার (' + BN(ALL_ANNOUNCEMENTS.length) + ')',
    '<div class="space-y-2.5">' +
      ALL_ANNOUNCEMENTS.map(a =>
        '<div class="bg-white/5 rounded-xl p-3 border border-white/10 space-y-1">' +
          '<div class="flex items-center justify-between gap-2">' +
            '<span class="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold uppercase">' + (a.type || 'নোটিস') + '</span>' +
            '<span class="text-[10px] text-slate-400">' + (a.created_at ? a.created_at.slice(0,10) : '') + '</span>' +
          '</div>' +
          '<h4 class="font-bold text-white text-xs sm:text-sm">' + escH(a.title) + '</h4>' +
          '<p class="text-[11px] text-slate-300">' + escH(a.body || '') + '</p>' +
          (a.link ? '<a href="'+a.link+'" target="_blank" class="inline-block pt-1 text-emerald-400 font-bold text-xs hover:underline">বিস্তারিত →</a>' : '') +
        '</div>'
      ).join('') +
    '</div>'
  );
}
</script>
`)
}
