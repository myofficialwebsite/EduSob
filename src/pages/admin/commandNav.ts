// সেন্ট্রাল এডমিন কমান্ড সেন্টার — গ্রুপড ও ক্যাটাগরাইজড ন্যাভিগেশন বার
export interface AdminCategory {
  id: string
  label: string
  icon: string
  tabs: { id: string; label: string; icon: string; badge?: string }[]
}

export const ADMIN_CATEGORIES: AdminCategory[] = [
  {
    id: 'cat-command',
    label: 'কমান্ড ও মনিটরিং',
    icon: 'fa-gauge-high',
    tabs: [
      { id: 'overview', label: 'লাইভ কমান্ড ডেক', icon: 'fa-chart-pie' },
      { id: 'autocollect', label: 'ডাটা সিঙ্ক ও অটো কালেকশন', icon: 'fa-bolt', badge: 'লাইভ' },
      { id: 'auditlogs', label: 'সিকিউরিটি অডিট ট্রেইল', icon: 'fa-shield-halved' }
    ]
  },
  {
    id: 'cat-users',
    label: 'ইউজার ও সিকিউরিটি',
    icon: 'fa-users-gear',
    tabs: [
      { id: 'users', label: 'ইউজার ও রোল প্রোটেকশন', icon: 'fa-users' },
      { id: 'subs', label: 'সাবস্ক্রিপশন ও প্ল্যান', icon: 'fa-crown' }
    ]
  },
  {
    id: 'cat-academics',
    label: 'শিক্ষা ও প্রশ্নব্যাংক',
    icon: 'fa-graduation-cap',
    tabs: [
      { id: 'mcq', label: 'MCQ ও কুইজ ব্যাংক', icon: 'fa-circle-question' },
      { id: 'syllabus', label: 'সিলেবাস হাব', icon: 'fa-book-open' },
      { id: 'qpapers', label: 'বোর্ড প্রশ্নপত্র', icon: 'fa-scroll' },
      { id: 'suggestions', label: 'সাজেশন ও মডেল টেস্ট', icon: 'fa-lightbulb' },
      { id: 'scholarships', label: 'স্কলারশিপ রোডম্যাপ', icon: 'fa-award' }
    ]
  },
  {
    id: 'cat-portals',
    label: 'সার্কুলার ও পোর্টাল',
    icon: 'fa-briefcase',
    tabs: [
      { id: 'jobs', label: 'চাকরি সার্কুলার', icon: 'fa-building-columns' },
      { id: 'admissions', label: 'ভর্তি তথ্য ও পোর্টাল', icon: 'fa-landmark' },
      { id: 'notices', label: 'এডমিশন ও জব নোটিস', icon: 'fa-bullhorn' },
      { id: 'announce', label: 'পুশ নোটিস ও ঘোষণা', icon: 'fa-bell' }
    ]
  },
  {
    id: 'cat-mentors',
    label: 'শিক্ষক ও মেন্টর হাব',
    icon: 'fa-chalkboard-user',
    tabs: [
      { id: 'teacher', label: 'পূর্ণ মেন্টর কন্ট্রোল', icon: 'fa-user-tie', badge: 'সক্রিয়' }
    ]
  },
  {
    id: 'cat-assisted',
    label: 'আবেদন কিউ',
    icon: 'fa-clipboard-check',
    tabs: [
      { id: 'assisted', label: 'অ্যাসিস্টেড আবেদন ট্র্যাকার', icon: 'fa-handshake-angle' }
    ]
  },
  {
    id: 'cat-settings',
    label: 'কনফিগারেশন',
    icon: 'fa-sliders',
    tabs: [
      { id: 'features', label: 'ফিচার টগল', icon: 'fa-toggle-on' },
      { id: 'rates', label: 'রেট ও হেল্পলাইন সেটিংস', icon: 'fa-gear' }
    ]
  }
]

export function renderAdminHeader(): string {
  return `
<header class="bg-slate-900 text-white sticky top-0 z-40 shadow-xl border-b border-slate-800">
  <!-- টপ বার -->
  <div class="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap border-b border-slate-800/80">
    <div class="flex items-center gap-3">
      <a href="/dashboard" class="flex items-center gap-2 font-black text-lg tracking-tight">
        <span class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-slate-950 font-bold shadow-md">📚</span>
        <span>এডুসব</span>
        <span class="text-[11px] font-extrabold bg-gradient-to-r from-rose-500 to-amber-500 text-white px-2.5 py-0.5 rounded-full shadow-sm uppercase tracking-wider">কমান্ড সেন্টার</span>
      </a>
      <span class="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded-lg">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span id="headerSyncStatus">ডাটাবেজ ও সিঙ্ক ইঞ্জিন লাইভ</span>
      </span>
    </div>

    <!-- কুইক অ্যাকশন ও শর্টকাট -->
    <div class="flex items-center gap-2 text-xs flex-wrap">
      <div class="relative hidden sm:block">
        <i class="fas fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
        <input id="quickModuleSearch" placeholder="যেকোনো মডিউল খুঁজুন (যেমন: mcq, job, শিক্ষক)..." oninput="filterAdminModules(this.value)" class="bg-slate-800/90 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 w-56 lg:w-64 transition">
        <div id="quickSearchResults" class="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 hidden z-50 text-xs space-y-1"></div>
      </div>
      <a href="/admin/shop" class="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5">
        <i class="fas fa-store text-amber-400"></i><span>শপ ও পেমেন্ট</span>
      </a>
      <a href="/admin/cv-templates" class="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5">
        <i class="fas fa-file-lines text-sky-400"></i><span>CV টেমপ্লেট</span>
      </a>
      <a href="/dashboard" class="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5">
        <i class="fas fa-arrow-left"></i><span>ড্যাশবোর্ড</span>
      </a>
    </div>
  </div>

  <!-- ক্যাটাগরি ন্যাভিগেশন সারি (Row 1: Groups) -->
  <div class="max-w-7xl mx-auto px-4 pt-2">
    <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
      ${ADMIN_CATEGORIES.map((cat, idx) => `
        <button 
          id="btn-${cat.id}" 
          onclick="switchAdminCategory('${cat.id}')"
          class="admin-cat-btn px-3.5 py-2 rounded-t-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${idx === 0 ? 'bg-slate-800 text-emerald-400 border-t-2 border-emerald-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}"
        >
          <i class="fas ${cat.icon}"></i>
          <span>${cat.label}</span>
        </button>
      `).join('')}
    </div>
  </div>

  <!-- সাব-মডিউল চিপস সারি (Row 2: Category's Modules) -->
  <div class="bg-slate-950/80 border-t border-slate-800 px-4 py-2">
    <div id="adminModuleChips" class="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
      <!-- ডাইনামিকালি লোড হবে switchAdminCategory() দ্বারা -->
    </div>
  </div>
</header>
`
}
