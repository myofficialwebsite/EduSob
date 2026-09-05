// সেন্ট্রাল এডমিন কমান্ড সেন্টার — লাইভ ওভারভিউ ও মনিটরিং ডেক
export function renderOverviewTab(): string {
  return `
<section id="tab-overview" class="tab-pane space-y-6">
  <!-- ১. সিস্টেম হেলথ ও রিয়েল-টাইম স্ট্যাটাস বার -->
  <div class="bg-slate-900 text-white border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl">
    <div class="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-800">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg">
          ⚡
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-base sm:text-lg font-black tracking-tight">এডুসব সিস্টেম কমান্ড সেন্টার</h2>
            <span class="inline-flex items-center gap-1 text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> লাইভ মনিটরিং
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">রিয়েল-টাইম ডাটাবেজ স্ট্যাটাস, অটো-কালেকশন স্বাস্থ্য ও উচ্চ-অগ্রাধিকার অ্যালার্ট</p>
        </div>
      </div>

      <!-- সিঙ্ক ও রিফ্রেশ শর্টকাট বাটন -->
      <div class="flex items-center gap-2">
        <button onclick="loadStats()" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
          <i class="fas fa-rotate"></i> রিফ্রেশ
        </button>
        <button onclick="triggerAutoCollection('all')" class="px-4 py-2 bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-lg">
          <i class="fas fa-bolt"></i> মাস্টার অটো-সিঙ্ক
        </button>
      </div>
    </div>

    <!-- সিস্টেম নোড মেট্রিক্স সারি -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
      <div class="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 flex items-center gap-3">
        <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
          <i class="fas fa-database"></i>
        </div>
        <div>
          <p class="text-slate-400 text-[11px]">ডাটাবেজ ইঞ্জিন</p>
          <p class="font-bold text-white">D1 / SQLite সচল</p>
        </div>
      </div>

      <div class="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 flex items-center gap-3">
        <div class="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm">
          <i class="fas fa-arrows-rotate"></i>
        </div>
        <div>
          <p class="text-slate-400 text-[11px]">অটো-সিঙ্ক সোর্স</p>
          <p class="font-bold text-white"><span id="metricActiveSources">৬টি</span> সক্রিয়</p>
        </div>
      </div>

      <div class="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 flex items-center gap-3">
        <div class="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm">
          <i class="fas fa-shield-halved"></i>
        </div>
        <div>
          <p class="text-slate-400 text-[11px]">নিরাপত্তা ও অডিট</p>
          <p class="font-bold text-white">প্রটেকশন সক্রিয়</p>
        </div>
      </div>

      <div class="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 flex items-center gap-3">
        <div class="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-sm">
          <i class="fas fa-bell"></i>
        </div>
        <div>
          <p class="text-slate-400 text-[11px]">অপেক্ষমান নোটিফিকেশন</p>
          <p class="font-bold text-rose-300" id="metricTotalAlerts">০টি অ্যালার্ট</p>
        </div>
      </div>
    </div>
  </div>

  <!-- ২. উচ্চ-অগ্রাধিকার অ্যালার্ট ডেক (Urgent Pending Items) -->
  <div id="urgentAlertsBox" class="grid sm:grid-cols-3 gap-3">
    <!-- ১. অ্যাসিস্টেড আবেদন -->
    <div onclick="navigateToTab('assisted')" class="cursor-pointer bg-white border border-rose-200 rounded-2xl p-4 shadow-sm hover:border-rose-400 hover:shadow transition flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">
          📋
        </div>
        <div>
          <p class="text-xs text-slate-500 font-semibold">অপেক্ষমান আবেদন কিউ</p>
          <p class="text-base font-black text-slate-900"><span id="alertPendingAssist">০</span> টি আবেদন</p>
        </div>
      </div>
      <span class="text-xs text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded-lg">যাচাই করুন →</span>
    </div>

    <!-- ২. অনুত্তরিত ডাউট টিকিট -->
    <div onclick="navigateToTab('teacher')" class="cursor-pointer bg-white border border-amber-200 rounded-2xl p-4 shadow-sm hover:border-amber-400 hover:shadow transition flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
          💬
        </div>
        <div>
          <p class="text-xs text-slate-500 font-semibold">অনুত্তরিত ডাউট টিকেট</p>
          <p class="text-base font-black text-slate-900"><span id="alertPendingTickets">০</span> টি প্রশ্ন</p>
        </div>
      </div>
      <span class="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-lg">অ্যাসাইন করুন →</span>
    </div>

    <!-- ৩. পেমেন্ট রিকোয়েস্ট -->
    <div onclick="navigateToTab('subs')" class="cursor-pointer bg-white border border-emerald-200 rounded-2xl p-4 shadow-sm hover:border-emerald-400 hover:shadow transition flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
          💳
        </div>
        <div>
          <p class="text-xs text-slate-500 font-semibold">পেমেন্ট রিকোয়েস্ট</p>
          <p class="text-base font-black text-slate-900"><span id="alertPendingPayments">০</span> টি অনুরোধ</p>
        </div>
      </div>
      <span class="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg">সেটেল করুন →</span>
    </div>
  </div>

  <!-- ৩. আট-ব্লক কমান্ড মেট্রিক্স গ্রিড (8-Card KPI Grid) -->
  <div>
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-extrabold text-slate-800 text-sm flex items-center gap-2">
        <i class="fas fa-layer-group text-emerald-600"></i> এডুসব সেন্ট্রাল কন্টেন্ট ও সিস্টেম মেট্রিক্স
      </h3>
      <span class="text-xs text-slate-400">প্রতিটি ব্লকে ক্লিক করে সরাসরি সংশ্লিষ্ট মডিউলে যেতে পারবেন</span>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <!-- ১. ইউজার -->
      <div onclick="navigateToTab('users')" class="cursor-pointer bg-white border border-slate-200/80 rounded-2xl p-4 hover:border-emerald-500/50 hover:shadow-md transition">
        <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span class="font-semibold">নিবন্ধিত শিক্ষার্থী</span>
          <span class="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs"><i class="fas fa-users"></i></span>
        </div>
        <p class="text-2xl font-black text-slate-900" id="cmdMetricUsers">০</p>
        <p class="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
          <span>সক্রিয়: <b id="cmdSubActiveUsers" class="text-emerald-600">০</b></span>
          <span>স্থগিত: <b id="cmdSubSuspendedUsers" class="text-rose-500">০</b></span>
        </p>
      </div>

      <!-- ২. চাকরি -->
      <div onclick="navigateToTab('jobs')" class="cursor-pointer bg-white border border-slate-200/80 rounded-2xl p-4 hover:border-sky-500/50 hover:shadow-md transition">
        <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span class="font-semibold">চাকরি সার্কুলার</span>
          <span class="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs"><i class="fas fa-briefcase"></i></span>
        </div>
        <p class="text-2xl font-black text-slate-900" id="cmdMetricJobs">০</p>
        <p class="text-[11px] text-sky-600 mt-1 font-semibold flex items-center gap-1">
          <i class="fas fa-check-circle text-[10px]"></i> BPSC ও সরকারি পোর্টাল লাইভ
        </p>
      </div>

      <!-- ৩. ভর্তি -->
      <div onclick="navigateToTab('admissions')" class="cursor-pointer bg-white border border-slate-200/80 rounded-2xl p-4 hover:border-teal-500/50 hover:shadow-md transition">
        <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span class="font-semibold">ভর্তি ও ফলাফল</span>
          <span class="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs"><i class="fas fa-landmark"></i></span>
        </div>
        <p class="text-2xl font-black text-slate-900" id="cmdMetricAdmissions">০</p>
        <p class="text-[11px] text-teal-600 mt-1 font-semibold flex items-center gap-1">
          <i class="fas fa-check-circle text-[10px]"></i> বোর্ড ও বিশ্ববিদ্যালয় সার্কুলার
        </p>
      </div>

      <!-- ৪. MCQ -->
      <div onclick="navigateToTab('mcq')" class="cursor-pointer bg-white border border-slate-200/80 rounded-2xl p-4 hover:border-purple-500/50 hover:shadow-md transition">
        <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span class="font-semibold">MCQ ও প্রশ্নব্যাংক</span>
          <span class="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs"><i class="fas fa-circle-question"></i></span>
        </div>
        <p class="text-2xl font-black text-slate-900" id="cmdMetricMCQ">০</p>
        <p class="text-[11px] text-purple-600 mt-1 font-semibold flex items-center gap-1">
          <i class="fas fa-check-circle text-[10px]"></i> ব্যাখ্যাসহ কুইজ ডাটাবেজ
        </p>
      </div>

      <!-- ৫. সিলেবাস -->
      <div onclick="navigateToTab('syllabus')" class="cursor-pointer bg-white border border-slate-200/80 rounded-2xl p-4 hover:border-indigo-500/50 hover:shadow-md transition">
        <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span class="font-semibold">সিলেবাস হাব</span>
          <span class="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs"><i class="fas fa-book-open"></i></span>
        </div>
        <p class="text-2xl font-black text-slate-900" id="cmdMetricSyllabus">০</p>
        <p class="text-[11px] text-indigo-600 mt-1 font-semibold flex items-center gap-1">
          <i class="fas fa-check-circle text-[10px]"></i> NCTB ও NU পাঠ্যক্রম
        </p>
      </div>

      <!-- ৬. বিগত প্রশ্নপত্র -->
      <div onclick="navigateToTab('qpapers')" class="cursor-pointer bg-white border border-slate-200/80 rounded-2xl p-4 hover:border-amber-500/50 hover:shadow-md transition">
        <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span class="font-semibold">বোর্ড প্রশ্নপত্র (২০১৭-২৪)</span>
          <span class="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs"><i class="fas fa-scroll"></i></span>
        </div>
        <p class="text-2xl font-black text-slate-900" id="cmdMetricQpapers">০</p>
        <p class="text-[11px] text-amber-600 mt-1 font-semibold flex items-center gap-1">
          <i class="fas fa-check-circle text-[10px]"></i> উত্তরমালা ও PDF ড্রাইভ
        </p>
      </div>

      <!-- ৭. শিক্ষক ও মেন্টর -->
      <div onclick="navigateToTab('teacher')" class="cursor-pointer bg-white border border-slate-200/80 rounded-2xl p-4 hover:border-emerald-500/50 hover:shadow-md transition">
        <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span class="font-semibold">শিক্ষক ও মেন্টর হাব</span>
          <span class="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs"><i class="fas fa-chalkboard-user"></i></span>
        </div>
        <p class="text-2xl font-black text-slate-900" id="cmdMetricMentors">০</p>
        <p class="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
          <span>অনলাইন: <b id="cmdSubOnlineMentors" class="text-emerald-600">০</b></span>
          <span>সমাধান: <b id="cmdSubSolvedTickets" class="text-sky-600">০</b></span>
        </p>
      </div>

      <!-- ৮. স্কলারশিপ -->
      <div onclick="navigateToTab('scholarships')" class="cursor-pointer bg-white border border-slate-200/80 rounded-2xl p-4 hover:border-rose-500/50 hover:shadow-md transition">
        <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span class="font-semibold">স্কলারশিপ ও অনুদান</span>
          <span class="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs"><i class="fas fa-award"></i></span>
        </div>
        <p class="text-2xl font-black text-slate-900" id="cmdMetricScholarships">০</p>
        <p class="text-[11px] text-rose-600 mt-1 font-semibold flex items-center gap-1">
          <i class="fas fa-check-circle text-[10px]"></i> সরকারি ও ব্যাংক বৃত্তি
        </p>
      </div>
    </div>
  </div>

  <!-- ৪. সিঙ্ক হেলথ ও লাইভ ফিড (Dual Column) -->
  <div class="grid lg:grid-cols-2 gap-5">
    <!-- বাম কলাম: সাম্প্রতিক ইউজার রেজিস্ট্রেশন -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-3">
      <div class="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 class="font-extrabold text-slate-800 text-sm flex items-center gap-2">
          <i class="fas fa-user-plus text-emerald-600"></i> সাম্প্রতিক ইউজার তালিকা
        </h3>
        <button onclick="navigateToTab('users')" class="text-xs text-emerald-600 hover:text-emerald-700 font-bold">
          সব ইউজার দেখুন →
        </button>
      </div>
      <div id="recentUsers" class="divide-y divide-slate-100 text-xs">
        <div class="py-4 text-center text-slate-400">ইউজার লোড হচ্ছে...</div>
      </div>
    </div>

    <!-- ডান কলাম: লাইভ সিস্টেম অ্যাক্টিভিটি ও সিঙ্ক লগ স্ট্রিম -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-3">
      <div class="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 class="font-extrabold text-slate-800 text-sm flex items-center gap-2">
          <i class="fas fa-clock-rotate-left text-sky-600"></i> লাইভ অ্যাক্টিভিটি ও সিঙ্ক টাইমলাইন
        </h3>
        <button onclick="navigateToTab('autocollect')" class="text-xs text-sky-600 hover:text-sky-700 font-bold">
          সিঙ্ক সেন্টার →
        </button>
      </div>
      <div id="recentActivityTimeline" class="space-y-2.5 text-xs max-h-96 overflow-y-auto pr-1">
        <div class="py-4 text-center text-slate-400">টাইমলাইন লোড হচ্ছে...</div>
      </div>
    </div>
  </div>
</section>
`
}
