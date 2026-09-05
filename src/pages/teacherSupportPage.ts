// এডুসব — প্রিমিয়াম শিক্ষক সহায়তা ও ১-অন-১ মেন্টরশিপ পোর্টাল
import { pageShell, floatingButtons } from './layout'

const NAV = (loggedIn: boolean) => `
<header class="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-white/10">
  <nav class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <a href="/" class="flex items-center gap-2 font-bold text-xl">
        <span class="w-9 h-9 bg-gradient-to-br from-amber-400 via-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">🎓</span>
        <span>এডুসব <span class="text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">PREMIUM</span></span>
      </a>
    </div>
    <div class="flex items-center gap-2 text-sm">
      <a href="/subscription" class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 font-semibold hover:bg-amber-500/25 transition">
        <i class="fas fa-crown text-amber-400"></i>সাবস্ক্রিপশন
      </a>
      ${loggedIn
        ? '<a href="/dashboard" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 font-bold hover:shadow-lg transition">ড্যাশবোর্ড</a>'
        : '<a href="/login" class="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 transition">লগইন</a><a href="/signup" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 font-bold">সাইন-আপ</a>'}
    </div>
  </nav>
</header>`

export function teacherSupportPage(loggedIn: boolean): string {
  return pageShell('শিক্ষক সহায়তা ও মেন্টর পোর্টাল', 'bg-slate-950 text-white min-h-screen selection:bg-amber-500 selection:text-slate-950', `
${NAV(loggedIn)}

<main class="max-w-7xl mx-auto px-4 py-8">
  <!-- হিরো হেডার ব্যানার -->
  <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-amber-400/25 p-6 sm:p-10 mb-8 shadow-2xl">
    <div class="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
    
    <div class="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
      <div class="space-y-4 text-center lg:text-left max-w-2xl">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-bold">
          <i class="fas fa-crown text-amber-400"></i> ১-অন-১ প্রিমিয়াম শিক্ষক সহায়তা
        </div>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
          কঠিন অংক বা পড়ায় আটকে গেছেন? <br class="hidden sm:inline" />
          <span class="bg-gradient-to-r from-amber-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">সরাসরি সমাধান নিন সেরা শিক্ষকের কাছে</span>
        </h1>
        <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
          গণিত, উচ্চতর গণিত, ইংরেজি গ্রামার, পদার্থবিজ্ঞান, হিসাববিজ্ঞান কিংবা বিসিএস/চাকরি প্রস্তুতি — আপনার যেকোনো ডাউটের স্টেপ-বাই-স্টেপ সমাধান ও অডিও/ভিজ্যুয়াল ব্যাখ্যা প্রদান করবেন অভিজ্ঞ শিক্ষকমণ্ডলী।
        </p>

        <!-- কী স্ট্যাটস -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div class="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <p class="text-xs text-slate-400">গড় সমাধান সময়</p>
            <p class="text-lg sm:text-xl font-extrabold text-amber-400">১৫-৩০ মিনিট</p>
          </div>
          <div class="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <p class="text-xs text-slate-400">অভিজ্ঞ মেন্টর</p>
            <p class="text-lg sm:text-xl font-extrabold text-emerald-400">১২+ শিক্ষক</p>
          </div>
          <div class="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <p class="text-xs text-slate-400">সফল সমাধান</p>
            <p class="text-lg sm:text-xl font-extrabold text-sky-400">১,৫০০+ প্রশ্ন</p>
          </div>
          <div class="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <p class="text-xs text-slate-400">শিক্ষার্থী সন্তুষ্টি</p>
            <p class="text-lg sm:text-xl font-extrabold text-amber-300">৪.৯৬ / ৫.০</p>
          </div>
        </div>
      </div>

      <!-- ডানপাশের অ্যাকশন কার্ড -->
      <div class="w-full lg:w-96 bg-slate-900/90 border border-white/15 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-sm">
        <div id="userPlanBadge" class="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center text-sm">
          <i class="fas fa-spinner fa-spin text-emerald-400 mr-2"></i>প্ল্যান যাচাই হচ্ছে...
        </div>
        <button onclick="openAskModal()" class="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-extrabold text-base shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2">
          <i class="fas fa-paper-plane text-slate-950"></i> নতুন প্রশ্ন / ডাউট জমা দিন
        </button>
        <button onclick="switchMainTab('consultation')" class="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm transition flex items-center justify-center gap-2">
          <i class="fas fa-video text-emerald-400"></i> ১-অন-১ লাইভ সেশন বুকিং
        </button>
      </div>
    </div>
  </div>

  <!-- প্রধান ন্যাভিগেশন ট্যাব -->
  <div class="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-white/10 no-scrollbar">
    <button onclick="switchMainTab('mentors')" id="tab-btn-mentors" class="main-tab-btn px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm whitespace-nowrap transition flex items-center gap-2">
      <i class="fas fa-chalkboard-user"></i> শিক্ষক প্যানেল
    </button>
    <button onclick="switchMainTab('my-tickets')" id="tab-btn-my-tickets" class="main-tab-btn px-5 py-2.5 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 font-bold text-sm whitespace-nowrap transition flex items-center gap-2">
      <i class="fas fa-comments-question"></i> আমার ডাউট ও সমাধান (<span id="ticketCountBadge">0</span>)
    </button>
    <button onclick="switchMainTab('solutions-bank')" id="tab-btn-solutions-bank" class="main-tab-btn px-5 py-2.5 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 font-bold text-sm whitespace-nowrap transition flex items-center gap-2">
      <i class="fas fa-lightbulb"></i> সলভড ডাউট লাইব্রেরি
    </button>
    <button onclick="switchMainTab('consultation')" id="tab-btn-consultation" class="main-tab-btn px-5 py-2.5 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 font-bold text-sm whitespace-nowrap transition flex items-center gap-2">
      <i class="fas fa-calendar-check"></i> লাইভ সেশন
    </button>
  </div>

  <!-- ট্যাব ১: অভিজ্ঞ শিক্ষক প্যানেল -->
  <div id="tab-content-mentors" class="main-tab-content space-y-6">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-white flex items-center gap-2">
          <i class="fas fa-users-viewfinder text-amber-400"></i> অনলাইন শিক্ষক ও বিষয়ভিত্তিক মেন্টরবৃন্দ
        </h2>
        <p class="text-xs sm:text-sm text-slate-400">যেকোনো শিক্ষকের প্রোফাইল দেখে সরাসরি তাঁর কাছে প্রশ্ন করতে পারেন</p>
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <select id="mentorSubjectFilter" onchange="filterMentors()" class="w-full sm:w-48 bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-400">
          <option value="">সকল বিষয়</option>
          <option value="গণিত">গণিত ও ক্যালকুলাস</option>
          <option value="পদার্থ">পদার্থবিজ্ঞান</option>
          <option value="ইংরেজি">ইংরেজি ও গ্রামার</option>
          <option value="হিসাববিজ্ঞান">হিসাববিজ্ঞান ও বাণিজ্য</option>
          <option value="রসায়ন">রসায়ন ও জীববিজ্ঞান</option>
          <option value="ICT">ICT ও প্রোগ্রামিং</option>
        </select>
      </div>
    </div>

    <!-- মেন্টর গ্রিড -->
    <div id="mentorsGrid" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="col-span-full py-12 text-center text-slate-500">
        <i class="fas fa-spinner fa-spin text-3xl text-emerald-400 mb-2"></i>
        <p>শিক্ষকদের তথ্য লোড হচ্ছে...</p>
      </div>
    </div>
  </div>

  <!-- ট্যাব ২: আমার ডাউট ও সমাধানসমূহ -->
  <div id="tab-content-my-tickets" class="main-tab-content hidden space-y-6">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-white flex items-center gap-2">
          <i class="fas fa-clipboard-list-check text-emerald-400"></i> আপনার জমাকৃত প্রশ্ন ও শিক্ষকের সমাধান
        </h2>
        <p class="text-xs sm:text-sm text-slate-400">শিক্ষক উত্তর প্রদান করলে আপনি এখানে বিস্তারিত সমাধান ও সূত্র পাবেন</p>
      </div>
      <button onclick="openAskModal()" class="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-bold text-sm text-white hover:opacity-90 transition">
        <i class="fas fa-plus mr-1"></i> নতুন প্রশ্ন করুন
      </button>
    </div>

    <div id="myTicketsList" class="space-y-4">
      <div class="text-center py-12 text-slate-500">
        <i class="fas fa-spinner fa-spin text-3xl text-emerald-400 mb-2"></i>
        <p>প্রশ্নাবলি লোড হচ্ছে...</p>
      </div>
    </div>
  </div>

  <!-- ট্যাব ৩: সলভড ডাউট লাইব্রেরি -->
  <div id="tab-content-solutions-bank" class="main-tab-content hidden space-y-6">
    <div class="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div class="max-w-2xl mx-auto text-center space-y-3">
        <h2 class="text-2xl font-bold text-white">🔍 সলভড প্রশ্ন ও সমাধান ব্যাংক</h2>
        <p class="text-xs sm:text-sm text-slate-300">বিগত সময়ে শিক্ষার্থীদের করা গুরুত্বপূর্ণ প্রশ্ন ও শিক্ষকদের দেওয়া নিখুঁত সমাধানগুলো পড়ে জ্ঞান সমৃদ্ধ করুন।</p>
        <div class="flex gap-2">
          <input type="text" id="libSearchInput" placeholder="টপিক বা প্রশ্ন লিখে খুঁজুন (যেমন: লিমিট, গ্রামার, কাজ ক্ষমতা...)" class="flex-1 bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400">
          <button onclick="loadPublicSolutions()" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition">
            <i class="fas fa-search mr-1"></i> খুঁজুন
          </button>
        </div>
      </div>
    </div>

    <div id="solutionsBankGrid" class="space-y-4">
      <div class="text-center py-12 text-slate-500">
        <i class="fas fa-spinner fa-spin text-3xl text-amber-400 mb-2"></i>
        <p>সমাধান ব্যাংক লোড হচ্ছে...</p>
      </div>
    </div>
  </div>

  <!-- ট্যাব ৪: লাইভ ১-অন-১ সেশন বুকিং -->
  <div id="tab-content-consultation" class="main-tab-content hidden space-y-6">
    <div class="grid lg:grid-cols-12 gap-8">
      <div class="lg:col-span-6 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
          <i class="fas fa-video text-emerald-400"></i> লাইভ ভিডিও গাইডলাইন সেশন
        </div>
        <h2 class="text-2xl font-black text-white">শিক্ষকের সাথে লাইভ ১-অন-১ সেশন বুক করুন</h2>
        <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
          পড়াশোনার রোডম্যাপ, স্পেশাল চ্যাপ্টার রিভিশন কিংবা পরীক্ষার সার্বিক স্ট্র্যাটেজি নিয়ে শিক্ষকের সাথে সরাসরি ২০-৩০ মিনিটের ভিডিও/অডিও সেশনে কথা বলুন।
        </p>

        <form id="consultationForm" onsubmit="submitConsultation(event)" class="space-y-4 pt-2">
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">পছন্দের শিক্ষক / মেন্টর</label>
            <select id="consTeacherSelect" required class="w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-400"></select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">যে বিষয়ে আলোচনা করতে চান</label>
            <input type="text" id="consTopic" required placeholder="উদা: HSC গণিত রিভিশন স্ট্র্যাটেজি / NU অনার্স ৩য় বর্ষ হিসাববিজ্ঞান গাইডলাইন" class="w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">পছন্দের তারিখ</label>
              <input type="date" id="consDate" required class="w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">পছন্দের সময়</label>
              <select id="consTime" required class="w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400">
                <option value="বিকাল ০৪:০০ - ০৪:৩০">বিকাল ০৪:০০ - ০৪:৩০</option>
                <option value="সন্ধ্যা ০৬:০০ - ০৬:৩০">সন্ধ্যা ০৬:০০ - ০৬:৩০</option>
                <option value="রাত ০৮:০০ - ০৮:৩০">রাত ০৮:০০ - ০৮:৩০</option>
                <option value="রাত ০৯:০০ - ০৯:৩০">রাত ০৯:০০ - ০৯:৩০</option>
                <option value="রাত ১০:০০ - ১০:৩০">রাত ১০:০০ - ১০:৩০</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">আপনার নির্দিষ্ট কোনো সমস্যা বা নোট (ঐচ্ছিক)</label>
            <textarea id="consNote" rows="2" placeholder="নির্দিষ্ট কোনো চ্যাপ্টার বা বইয়ের কথা লিখে রাখতে পারেন..." class="w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"></textarea>
          </div>

          <button type="submit" id="consSubmitBtn" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-sm shadow-lg hover:brightness-110 transition">
            <i class="fas fa-calendar-plus mr-1"></i> সেশন বুকিং রিকোয়েস্ট পাঠান
          </button>
        </form>
      </div>

      <div class="lg:col-span-6 space-y-4">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <i class="fas fa-history text-amber-400"></i> আপনার পূর্বের ও আসন্ন সেশনসমূহ
        </h3>
        <div id="myConsultationsList" class="space-y-3">
          <div class="text-center py-8 text-slate-500">
            <i class="fas fa-spinner fa-spin text-2xl text-emerald-400 mb-2"></i>
            <p>সেশন তালিকা লোড হচ্ছে...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

<!-- প্রশ্ন করার মোডাল (Ask Modal) -->
<div id="askModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden items-center justify-center p-4">
  <div class="bg-slate-900 border border-white/20 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-5">
    <div class="flex items-center justify-between pb-3 border-b border-white/10">
      <div class="flex items-center gap-2">
        <span class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">✍️</span>
        <h3 class="text-lg sm:text-xl font-bold text-white">শিক্ষককে আপনার ডাউট / প্রশ্ন পাঠান</h3>
      </div>
      <button onclick="closeAskModal()" class="text-slate-400 hover:text-white text-xl">✕</button>
    </div>

    <form id="askForm" onsubmit="submitQuestion(event)" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">বিষয় নির্বাচন করুন *</label>
          <select id="askSubject" required class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400">
            <option value="গণিত">গণিত / উচ্চতর গণিত</option>
            <option value="পদার্থবিজ্ঞান">পদার্থবিজ্ঞান</option>
            <option value="রসায়ন">রসায়ন</option>
            <option value="জীববিজ্ঞান">জীববিজ্ঞান</option>
            <option value="ইংরেজি">ইংরেজি ও গ্রামার</option>
            <option value="হিসাববিজ্ঞান">হিসাববিজ্ঞান ও ফিন্যান্স</option>
            <option value="ICT">ICT ও প্রোগ্রামিং</option>
            <option value="সাধারণ জ্ঞান">সাধারণ জ্ঞান ও চাকরি প্রস্তুতি</option>
            <option value="অন্যান্য">অন্যান্য বিষয়</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">নির্দিষ্ট শিক্ষক (ঐচ্ছিক)</label>
          <select id="askTeacher" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400">
            <option value="">স্বয়ংক্রিয়ভাবে বিশেষজ্ঞ শিক্ষককে দেওয়া হবে</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-300 mb-1">চ্যাপ্টার / টপিক শিরোনাম *</label>
        <input type="text" id="askTopic" required placeholder="উদা: বৃত্তের স্পর্শক নির্ণয় / ত্রিকোণমিতি সূত্র / রাইট ফর্ম অফ ভার্বস" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400">
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-300 mb-1">বিস্তারিত প্রশ্ন বা ডাউট বর্ণনা করুন *</label>
        <textarea id="askQuestion" rows="5" required placeholder="আপনার প্রশ্নের পুরো বক্তব্য, কোন লাইনে বুঝতে সমস্যা হচ্ছে তা স্পষ্টভাবে লিখুন..." class="w-full bg-slate-950 border border-white/15 rounded-xl p-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 leading-relaxed"></textarea>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-300 mb-1">খাতার পাতার ছবি বা স্ক্রিনশট লিংক (ঐচ্ছিক)</label>
        <input type="url" id="askAttachment" placeholder="https://... (ইমেজ বা ড্রাইভ লিংক থাকলে পেস্ট করুন)" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400">
        <p class="text-[11px] text-slate-400 mt-1">অংকের ছবি থাকলে লিংক দিতে পারেন, শিক্ষক সহজে দেখে সমাধান দেবেন।</p>
      </div>

      <div class="p-3.5 bg-amber-500/10 border border-amber-400/20 rounded-xl flex items-center justify-between">
        <div class="flex items-center gap-2">
          <input type="checkbox" id="askUrgent" class="w-4 h-4 rounded text-amber-500 focus:ring-amber-400">
          <label for="askUrgent" class="text-xs font-bold text-amber-300 cursor-pointer">
            🚨 জরুরি প্রশ্ন (১৫ মিনিটের মধ্যে সমাধান অগ্রাধিকার)
          </label>
        </div>
        <span class="text-[11px] text-amber-200/80 bg-amber-400/20 px-2 py-0.5 rounded-full font-semibold">প্রিমিয়াম সুবিধা</span>
      </div>

      <div class="flex gap-3 pt-2">
        <button type="button" onclick="closeAskModal()" class="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 font-semibold text-sm transition">বাতিল</button>
        <button type="submit" id="askSubmitBtn" class="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-extrabold text-sm hover:brightness-110 transition flex items-center justify-center gap-2">
          <i class="fas fa-paper-plane"></i> প্রশ্ন জমা দিন
        </button>
      </div>
    </form>
  </div>
</div>

<!-- সমাধান দেখার মোডাল (View Ticket Solution Modal) -->
<div id="solutionModal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden items-center justify-center p-4">
  <div class="bg-slate-900 border border-white/20 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
    <div class="flex items-center justify-between pb-3 border-b border-white/10">
      <div class="flex items-center gap-2">
        <span class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">💡</span>
        <div>
          <h3 id="solModalTopic" class="text-lg font-bold text-white">টপিক শিরোনাম</h3>
          <p id="solModalCode" class="text-xs text-slate-400">TS-2026-XXXX</p>
        </div>
      </div>
      <button onclick="closeSolutionModal()" class="text-slate-400 hover:text-white text-xl">✕</button>
    </div>

    <!-- শিক্ষার্থীর প্রশ্ন -->
    <div class="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-2">
      <p class="text-xs font-bold text-amber-400 uppercase tracking-wider">আপনার প্রশ্ন:</p>
      <div id="solModalQuestion" class="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed"></div>
      <div id="solModalAttachment" class="pt-2 hidden"></div>
    </div>

    <!-- শিক্ষকের পূর্ণাঙ্গ সমাধান -->
    <div id="solAnswerBox" class="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 space-y-4">
      <div class="flex items-center justify-between border-b border-emerald-500/20 pb-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold text-lg">👨‍🏫</div>
          <div>
            <p id="solTeacherName" class="text-sm font-bold text-emerald-300">শিক্ষকের নাম</p>
            <p id="solAnsweredTime" class="text-[11px] text-slate-400">উত্তর দেওয়ার সময়</p>
          </div>
        </div>
        <span class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
          ✅ ভেরিফাইড সমাধান
        </span>
      </div>

      <div class="space-y-2">
        <p class="text-xs font-bold text-emerald-400 uppercase tracking-wider">স্টেপ-বাই-স্টেপ সমাধান ও বিশ্লেষণ:</p>
        <div id="solModalAnswer" class="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed font-sans bg-black/20 p-4 rounded-xl border border-white/5"></div>
      </div>

      <!-- রেটিং সেকশন -->
      <div id="solRatingSection" class="pt-3 border-t border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p class="text-xs text-slate-300">এই সমাধানটি আপনার কেমন লাগলো?</p>
        <div class="flex items-center gap-1.5" id="solStarRatingBtns">
          <button onclick="rateSolution(1)" class="text-lg text-slate-600 hover:text-amber-400 transition">★</button>
          <button onclick="rateSolution(2)" class="text-lg text-slate-600 hover:text-amber-400 transition">★</button>
          <button onclick="rateSolution(3)" class="text-lg text-slate-600 hover:text-amber-400 transition">★</button>
          <button onclick="rateSolution(4)" class="text-lg text-slate-600 hover:text-amber-400 transition">★</button>
          <button onclick="rateSolution(5)" class="text-lg text-slate-600 hover:text-amber-400 transition">★</button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- শিক্ষার্থীর দ্বিমুখী লাইভ চ্যাট / SMS মোডাল -->
<div id="studentChatModal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden items-center justify-center p-4">
  <div class="bg-slate-900 border border-white/20 rounded-3xl max-w-2xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
    <div class="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-white/10">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center font-bold">💬</div>
        <div>
          <h3 id="stdChatModalTitle" class="font-bold text-sm leading-tight">শিক্ষকের সাথে লাইভ চ্যাট / মেসেজ</h3>
          <p id="stdChatModalSub" class="text-[11px] text-slate-400">টিকেট #... • সরাসরি শিক্ষক সাপোর্ট</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button id="stdChatVideoBtn" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1"><i class="fas fa-video"></i> ভিডিও রুম</button>
        <button onclick="closeStudentChat()" class="text-slate-400 hover:text-white text-lg font-bold">✕</button>
      </div>
    </div>

    <!-- চ্যাট হিস্ট্রি -->
    <div id="stdChatMessagesBox" class="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/60 text-xs">
      <div class="text-center py-6 text-slate-500">মেসেজ লোড হচ্ছে...</div>
    </div>

    <!-- মেসেজ ইনপুট ফর্ম -->
    <form onsubmit="return sendStudentChatMsg(event)" class="p-3 bg-slate-900 border-t border-white/10 flex gap-2 items-center">
      <input type="hidden" id="stdChatActiveTicketId">
      <input type="text" id="stdChatInputText" required placeholder="শিক্ষককে আপনার প্রশ্ন বা জিজ্ঞাসা লিখুন..." class="flex-1 bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400">
      <button type="submit" class="bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow flex items-center gap-1"><i class="fas fa-paper-plane"></i> পাঠান</button>
    </form>
  </div>
</div>

<!-- শিক্ষার্থীর ১-অন-১ লাইভ ভিডিও কল রুম মোডাল -->
<div id="studentVideoModal" class="fixed inset-0 z-50 bg-black/90 backdrop-blur-md hidden items-center justify-center p-4">
  <div class="bg-slate-900 border border-white/20 rounded-3xl max-w-4xl w-full h-[88vh] flex flex-col shadow-2xl overflow-hidden">
    <div class="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-white/10">
      <div class="flex items-center gap-2.5">
        <span class="w-3 h-3 bg-rose-500 rounded-full animate-ping"></span>
        <h3 id="stdVideoModalTitle" class="font-bold text-sm">🔴 লাইভ ১-অন-১ মেন্টরিং ভিডিও কল রুম</h3>
      </div>
      <div class="flex items-center gap-2">
        <span id="stdVideoRoomCodeBadge" class="text-xs font-mono bg-white/10 px-2.5 py-1 rounded-lg text-amber-300">রুম আইডি: ...</span>
        <button onclick="closeStudentVideoModal()" class="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition">লিভ নিন</button>
      </div>
    </div>

    <div class="flex-1 relative bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
      <div class="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 via-emerald-400 to-teal-400 text-slate-950 text-4xl font-extrabold flex items-center justify-center shadow-2xl mb-4">
        🎓
      </div>
      <h2 class="text-xl font-bold mb-1">শিক্ষকের সাথে লাইভ ভিডিও সেশন</h2>
      <p class="text-xs text-slate-300 max-w-md mb-6">আপনি সফলভাবে ১-অন-১ লাইভ মেন্টরিং রুমে প্রবেশ করেছেন। শিক্ষক আপনার ডাউট স্টেপ-বাই-স্টেপ সমাধান করে দিচ্ছেন।</p>
      
      <div class="flex gap-3 flex-wrap justify-center">
        <button onclick="toggleStdVideoMic()" id="stdVMicBtn" class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"><i class="fas fa-microphone"></i> মাইক অন</button>
        <button onclick="toggleStdVideoCam()" id="stdVCamBtn" class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"><i class="fas fa-video"></i> ক্যামেরা অন</button>
      </div>
    </div>
  </div>
</div>

${floatingButtons()}

<script>
var loggedIn = ${loggedIn ? 'true' : 'false'};
var userPlan = 'free';
var mentorsList = [];
var myTicketsList = [];
var activeTicketId = null;

function esc(s){var d=document.createElement('div');d.textContent=s==null?'':s;return d.innerHTML}

function switchMainTab(tab) {
  document.querySelectorAll('.main-tab-content').forEach(function(el){ el.classList.add('hidden'); });
  document.querySelectorAll('.main-tab-btn').forEach(function(btn){
    btn.classList.remove('bg-emerald-500', 'text-white');
    btn.classList.add('bg-white/5', 'text-slate-300');
  });

  var targetContent = document.getElementById('tab-content-' + tab);
  var targetBtn = document.getElementById('tab-btn-' + tab);
  if (targetContent) targetContent.classList.remove('hidden');
  if (targetBtn) {
    targetBtn.classList.remove('bg-white/5', 'text-slate-300');
    targetBtn.classList.add('bg-emerald-500', 'text-white');
  }

  if (tab === 'my-tickets') loadMyTickets();
  else if (tab === 'solutions-bank') loadPublicSolutions();
  else if (tab === 'consultation') loadMyConsultations();
}

function checkUserStatus() {
  axios.get('/api/subs/my-plan').then(function(res){
    var d = res.data;
    userPlan = d.plan || 'free';
    var badge = document.getElementById('userPlanBadge');
    if (userPlan === 'premium') {
      badge.className = 'p-3.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 text-center text-sm font-bold flex items-center justify-center gap-2';
      badge.innerHTML = '<i class="fas fa-crown text-amber-400"></i> আপনার প্রিমিয়াম সুবিধা সক্রিয় (আনলিমিটেড ডাউট ও প্রায়োরিটি)';
    } else if (userPlan === 'standard') {
      badge.className = 'p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-center text-sm font-semibold flex items-center justify-center gap-2';
      badge.innerHTML = '<i class="fas fa-bolt text-emerald-400"></i> স্ট্যান্ডার্ড প্ল্যান — <a href="/subscription" class="text-amber-400 underline font-bold ml-1">প্রিমিয়ামে আপগ্রেড করুন</a>';
    } else {
      badge.className = 'p-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-center text-sm';
      badge.innerHTML = 'ফ্রি প্ল্যান (দৈনিক ১টি ডাউট) — <a href="/subscription" class="text-amber-400 underline font-bold">প্রিমিয়াম নিন (৳১০০/মাস)</a>';
    }
  }).catch(function(){
    var badge = document.getElementById('userPlanBadge');
    badge.innerHTML = '<a href="/login" class="text-emerald-400 font-bold">লগইন করুন</a> ডাউট সমাধান পেতে';
  });
}

function loadMentors() {
  axios.get('/api/teacher-support/mentors').then(function(res){
    if (!res.data.ok) return;
    mentorsList = res.data.mentors || [];
    renderMentors(mentorsList);
    populateTeacherDropdowns(mentorsList);
  });
}

function renderMentors(list) {
  var grid = document.getElementById('mentorsGrid');
  if (!list.length) {
    grid.innerHTML = '<div class="col-span-full py-12 text-center text-slate-400">কোনো শিক্ষক পাওয়া যায়নি</div>';
    return;
  }

  grid.innerHTML = list.map(function(m){
    var avatarHtml = m.avatar && m.avatar.indexOf('unsplash.com') === -1
      ? '<img src="'+esc(m.avatar)+'" alt="'+esc(m.name)+'" class="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 group-hover:border-emerald-400 transition">'
      : '<div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 border-2 border-white/20 flex items-center justify-center text-white text-xl font-bold shadow-md group-hover:border-emerald-400 transition"><span>'+esc((m.name||'শি').charAt(0))+'</span></div>';

    return '<div class="bg-white/5 border border-white/10 hover:border-emerald-400/40 rounded-3xl p-6 transition-all duration-200 flex flex-col justify-between group">'+
      '<div>'+
        '<div class="flex items-start gap-4 mb-4">'+
          '<div class="relative">'+
            avatarHtml+
            (m.is_online ? '<span class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-slate-900 rounded-full" title="অনলাইন আছেন"></span>' : '')+
          '</div>'+
          '<div class="flex-1 min-w-0">'+
            '<div class="flex items-center justify-between">'+
              '<h3 class="font-bold text-white text-base truncate">'+esc(m.name)+'</h3>'+
              '<span class="text-xs font-bold text-amber-400 flex items-center gap-1"><i class="fas fa-star text-[10px]"></i> '+Number(m.rating).toFixed(2)+'</span>'+
            '</div>'+
            '<p class="text-xs text-emerald-300 font-medium truncate">'+esc(m.designation)+'</p>'+
            '<span class="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-semibold text-slate-300">'+esc(m.subject)+'</span>'+
          '</div>'+
        '</div>'+
        '<p class="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed">'+esc(m.bio)+'</p>'+
        '<div class="grid grid-cols-2 gap-2 bg-black/30 p-2.5 rounded-xl mb-4 text-center text-xs">'+
          '<div><p class="text-[10px] text-slate-400">সমাধান করেছেন</p><p class="font-bold text-white">'+m.total_solved+'টি প্রশ্ন</p></div>'+
          '<div><p class="text-[10px] text-slate-400">গড় সময়</p><p class="font-bold text-amber-300">'+esc(m.response_time)+'</p></div>'+
        '</div>'+
      '</div>'+
      '<div class="flex gap-2 pt-2 border-t border-white/10">'+
        '<button onclick="askSpecificTeacher('+m.id+', \\''+esc(m.name)+'\\', \\''+esc(m.subject)+'\\')" class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-xs hover:brightness-110 transition">'+
          '<i class="fas fa-paper-plane mr-1"></i> প্রশ্ন করুন'+
        '</button>'+
        '<button onclick="bookSpecificTeacher('+m.id+')" class="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition" title="লাইভ সেশন">'+
          '<i class="fas fa-video"></i>'+
        '</button>'+
      '</div>'+
    '</div>';
  }).join('');
}

function filterMentors() {
  var sub = document.getElementById('mentorSubjectFilter').value.toLowerCase();
  var filtered = mentorsList.filter(function(m){
    if (!sub) return true;
    return (m.subject && m.subject.toLowerCase().indexOf(sub) !== -1) || (m.designation && m.designation.toLowerCase().indexOf(sub) !== -1);
  });
  renderMentors(filtered);
}

function populateTeacherDropdowns(list) {
  var askSelect = document.getElementById('askTeacher');
  var consSelect = document.getElementById('consTeacherSelect');
  
  var options = '<option value="">স্বয়ংক্রিয়ভাবে বিশেষজ্ঞ শিক্ষককে দেওয়া হবে</option>' +
    list.map(function(m){ return '<option value="'+m.id+'">'+esc(m.name)+' ('+esc(m.subject)+')</option>'; }).join('');
  
  if (askSelect) askSelect.innerHTML = options;
  if (consSelect) {
    consSelect.innerHTML = list.map(function(m){ return '<option value="'+m.id+'">'+esc(m.name)+' — '+esc(m.subject)+' ('+esc(m.designation)+')</option>'; }).join('');
  }
}

function openAskModal() {
  if (!loggedIn) { location.href = '/login'; return; }
  document.getElementById('askModal').classList.remove('hidden');
  document.getElementById('askModal').classList.add('flex');
}
function closeAskModal() {
  document.getElementById('askModal').classList.add('hidden');
  document.getElementById('askModal').classList.remove('flex');
}

function askSpecificTeacher(id, name, subject) {
  openAskModal();
  var sel = document.getElementById('askTeacher');
  if (sel) sel.value = id;
}

function bookSpecificTeacher(id) {
  switchMainTab('consultation');
  var sel = document.getElementById('consTeacherSelect');
  if (sel) sel.value = id;
}

function submitQuestion(e) {
  e.preventDefault();
  var btn = document.getElementById('askSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> জমা হচ্ছে...';

  var data = {
    subject: document.getElementById('askSubject').value,
    teacher_id: document.getElementById('askTeacher').value || null,
    topic: document.getElementById('askTopic').value,
    question: document.getElementById('askQuestion').value,
    attachment_url: document.getElementById('askAttachment').value,
    urgency: document.getElementById('askUrgent').checked ? 'urgent' : 'normal'
  };

  axios.post('/api/teacher-support/ask', data).then(function(res){
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> প্রশ্ন জমা দিন';
    if (res.data.ok) {
      alert('🎉 ' + res.data.message);
      closeAskModal();
      document.getElementById('askForm').reset();
      switchMainTab('my-tickets');
    }
  }).catch(function(err){
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> প্রশ্ন জমা দিন';
    var d = err.response && err.response.data;
    if (d && d.need_upgrade) {
      if (confirm(d.error + '\\n\\nএখনই প্রিমিয়াম প্ল্যান দেখতে চান?')) {
        location.href = '/subscription';
      }
    } else {
      alert(d && d.error || 'সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  });
}

function loadMyTickets() {
  if (!loggedIn) {
    document.getElementById('myTicketsList').innerHTML = '<div class="text-center py-12 text-slate-400">প্রশ্ন দেখতে <a href="/login" class="text-emerald-400 font-bold underline">লগইন করুন</a></div>';
    return;
  }

  axios.get('/api/teacher-support/my-tickets').then(function(res){
    if (!res.data.ok) return;
    myTicketsList = res.data.tickets || [];
    document.getElementById('ticketCountBadge').textContent = myTicketsList.length;

    var container = document.getElementById('myTicketsList');
    if (!myTicketsList.length) {
      container.innerHTML = '<div class="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-slate-400 space-y-3">'+
        '<i class="fas fa-inbox text-4xl text-slate-600"></i>'+
        '<p class="text-base font-semibold text-white">আপনার কোনো সক্রিয় প্রশ্ন বা ডাউট নেই</p>'+
        '<p class="text-xs text-slate-400">পড়াশোনায় যেকোনো সমস্যা থাকলে এখনই প্রশ্ন করুন।</p>'+
        '<button onclick="openAskModal()" class="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-xs rounded-xl shadow">'+
          'প্রথম প্রশ্নটি করুন →'+
        '</button>'+
      '</div>';
      return;
    }

    container.innerHTML = myTicketsList.map(function(t){
      var isAnswered = t.status === 'answered';
      var statusBadge = isAnswered
        ? '<span class="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold flex items-center gap-1"><i class="fas fa-check-circle"></i> সমাধান সম্পন্ন</span>'
        : '<span class="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold flex items-center gap-1"><i class="fas fa-clock"></i> শিক্ষক সমাধান করছেন</span>';

      return '<div class="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-5 sm:p-6 transition space-y-4">'+
        '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">'+
          '<div class="flex items-center gap-2 flex-wrap">'+
            '<span class="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">'+esc(t.ticket_code)+'</span>'+
            '<span class="text-xs font-bold text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full">'+esc(t.subject)+'</span>'+
            (t.urgency === 'urgent' ? '<span class="text-[10px] font-bold text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded-full">🚨 জরুরি</span>' : '')+
          '</div>'+
          '<div>'+statusBadge+'</div>'+
        '</div>'+
        '<div>'+
          '<h3 class="text-base sm:text-lg font-bold text-white mb-1.5">'+esc(t.topic)+'</h3>'+
          '<p class="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">'+esc(t.question)+'</p>'+
        '</div>'+
        '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-400">'+
          '<div>জমা দেওয়ার সময়: '+esc(t.created_at ? t.created_at.slice(0, 16) : '')+'</div>'+
          '<div class="flex items-center gap-2 flex-wrap">'+
            '<button onclick="openStudentChat('+t.id+', \\''+esc(t.topic || t.subject)+'\\')" class="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 font-bold transition flex items-center gap-1"><i class="fas fa-comments"></i> 💬 চ্যাট / SMS</button>'+
            '<button onclick="joinStudentVideoRoom('+t.id+', \\''+esc(t.topic || t.subject)+'\\')" class="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 font-bold transition flex items-center gap-1"><i class="fas fa-video"></i> 📹 ১-অন-১ ভিডিও রুম</button>'+
            (isAnswered
              ? '<button onclick="viewSolution('+t.id+')" class="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:shadow-lg transition flex items-center gap-1.5"><i class="fas fa-eye"></i> সম্পূর্ণ সমাধান</button>'
              : '<span class="text-amber-400/90 text-xs italic">শিক্ষক সমাধান করছেন</span>')+
          '</div>'+
        '</div>'+
      '</div>';
    }).join('');
  });
}

function viewSolution(id) {
  var t = myTicketsList.find(function(item){ return item.id === id; });
  if (!t) return;
  activeTicketId = id;

  document.getElementById('solModalTopic').textContent = t.topic;
  document.getElementById('solModalCode').textContent = t.ticket_code + ' • ' + t.subject;
  document.getElementById('solModalQuestion').textContent = t.question;

  var attachBox = document.getElementById('solModalAttachment');
  if (t.attachment_url) {
    attachBox.innerHTML = '<a href="'+esc(t.attachment_url)+'" target="_blank" class="text-xs text-sky-400 hover:underline flex items-center gap-1"><i class="fas fa-paperclip"></i> সংযুক্ত ছবি/ডকুমেন্ট দেখুন</a>';
    attachBox.classList.remove('hidden');
  } else {
    attachBox.classList.add('hidden');
  }

  document.getElementById('solTeacherName').textContent = t.answered_by_name || t.teacher_name || 'এডুসব বিশেষজ্ঞ শিক্ষক';
  document.getElementById('solAnsweredTime').textContent = t.answered_at ? 'সমাধানের সময়: ' + t.answered_at.slice(0, 16) : '';
  document.getElementById('solModalAnswer').textContent = t.answer || 'সমাধান প্রস্তুত হচ্ছে...';

  // রেটিং স্টার সেট
  renderRatingStars(t.rating || 0);

  document.getElementById('solutionModal').classList.remove('hidden');
  document.getElementById('solutionModal').classList.add('flex');
}

function closeSolutionModal() {
  document.getElementById('solutionModal').classList.add('hidden');
  document.getElementById('solutionModal').classList.remove('flex');
}

function renderRatingStars(r) {
  var container = document.getElementById('solStarRatingBtns');
  var html = '';
  for (var i = 1; i <= 5; i++) {
    var col = i <= r ? 'text-amber-400' : 'text-slate-600';
    html += '<button onclick="rateSolution('+i+')" class="text-xl '+col+' hover:text-amber-300 transition">★</button>';
  }
  container.innerHTML = html;
}

function rateSolution(rating) {
  if (!activeTicketId) return;
  axios.post('/api/teacher-support/rate/' + activeTicketId, { rating: rating }).then(function(res){
    if (res.data.ok) {
      renderRatingStars(rating);
      alert('ধন্যবাদ! আপনার রেটিং সংরক্ষিত হয়েছে।');
      loadMyTickets();
    }
  });
}

function loadPublicSolutions() {
  var q = document.getElementById('libSearchInput').value;
  axios.get('/api/teacher-support/public-solutions?q=' + encodeURIComponent(q)).then(function(res){
    if (!res.data.ok) return;
    var list = res.data.solutions || [];
    var container = document.getElementById('solutionsBankGrid');

    if (!list.length) {
      container.innerHTML = '<div class="text-center py-12 text-slate-500">কোনো সমাধান পাওয়া যায়নি।</div>';
      return;
    }

    container.innerHTML = list.map(function(s){
      return '<div class="bg-white/5 border border-white/10 hover:border-emerald-400/30 rounded-2xl p-5 space-y-3 transition">'+
        '<div class="flex items-center justify-between gap-2">'+
          '<span class="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">'+esc(s.subject)+'</span>'+
          '<span class="text-xs text-slate-400">শিক্ষক: '+esc(s.answered_by_name || s.teacher_name)+'</span>'+
        '</div>'+
        '<h4 class="text-base font-bold text-white">'+esc(s.topic)+'</h4>'+
        '<div class="p-3 bg-black/30 rounded-xl text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">'+
          '<p class="font-bold text-amber-300 mb-1">প্রশ্ন:</p>'+esc(s.question)+
          '<hr class="my-2 border-white/10">'+
          '<p class="font-bold text-emerald-300 mb-1">সমাধান:</p>'+esc(s.answer)+
        '</div>'+
      '</div>';
    }).join('');
  });
}

function submitConsultation(e) {
  e.preventDefault();
  if (!loggedIn) { location.href = '/login'; return; }

  var btn = document.getElementById('consSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> বুকিং অনুরোধ পাঠানো হচ্ছে...';

  var data = {
    teacher_id: document.getElementById('consTeacherSelect').value,
    topic: document.getElementById('consTopic').value,
    preferred_date: document.getElementById('consDate').value,
    preferred_time: document.getElementById('consTime').value,
    note: document.getElementById('consNote').value
  };

  axios.post('/api/teacher-support/book-consultation', data).then(function(res){
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-calendar-plus mr-1"></i> সেশন বুকিং রিকোয়েস্ট পাঠান';
    if (res.data.ok) {
      alert('🎉 ' + res.data.message);
      document.getElementById('consultationForm').reset();
      loadMyConsultations();
    }
  }).catch(function(err){
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-calendar-plus mr-1"></i> সেশন বুকিং রিকোয়েস্ট পাঠান';
    var d = err.response && err.response.data;
    if (d && d.need_upgrade) {
      if (confirm(d.error + '\\n\\nএখনই প্রিমিয়াম প্ল্যান দেখতে চান?')) {
        location.href = '/subscription';
      }
    } else {
      alert(d && d.error || 'সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  });
}

function loadMyConsultations() {
  if (!loggedIn) {
    document.getElementById('myConsultationsList').innerHTML = '<div class="text-center py-6 text-slate-400 text-xs">সেশন দেখতে <a href="/login" class="text-emerald-400 font-bold underline">লগইন করুন</a></div>';
    return;
  }

  axios.get('/api/teacher-support/my-consultations').then(function(res){
    if (!res.data.ok) return;
    var list = res.data.consultations || [];
    var container = document.getElementById('myConsultationsList');

    if (!list.length) {
      container.innerHTML = '<div class="bg-white/5 border border-white/10 rounded-2xl p-6 text-center text-slate-400 text-xs">আপনার কোনো লাইভ সেশন বুকিং নেই।</div>';
      return;
    }

    container.innerHTML = list.map(function(c){
      var isApproved = c.status === 'approved';
      var badge = isApproved
        ? '<span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">অনুমোদিত</span>'
        : '<span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold">অপেক্ষমান</span>';

      return '<div class="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">'+
        '<div class="flex items-center justify-between">'+
          '<h4 class="font-bold text-white text-sm">'+esc(c.topic)+'</h4>'+
          badge+
        '</div>'+
        '<p class="text-xs text-slate-300">শিক্ষক: <span class="text-amber-300 font-semibold">'+esc(c.teacher_name)+'</span> ('+esc(c.teacher_subject)+')</p>'+
        '<div class="text-[11px] text-slate-400 flex items-center gap-3">'+
          '<span>📅 '+esc(c.preferred_date)+'</span>'+
          '<span>⏰ '+esc(c.preferred_time)+'</span>'+
        '</div>'+
        (c.meeting_link
          ? '<a href="'+esc(c.meeting_link)+'" target="_blank" class="inline-block mt-2 px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-400 transition"><i class="fas fa-video mr-1"></i> গুগল মিট লিংকে প্রবেশ করুন</a>'
          : '')+
      '</div>';
    }).join('');
  });
}

// ==========================================
// ---------- শিক্ষার্থীর লাইভ চ্যাট ও SMS ----------
// ==========================================
var STD_ACTIVE_TICKET_ID = null;
var STD_CHAT_POLL = null;

function openStudentChat(ticketId, topic) {
  if (!loggedIn) { location.href = '/login'; return; }
  STD_ACTIVE_TICKET_ID = ticketId;
  document.getElementById('stdChatActiveTicketId').value = ticketId;
  document.getElementById('stdChatModalTitle').textContent = 'শিক্ষকের সাথে সরাসরি চ্যাট: ' + (topic || 'টিকেট #' + ticketId);
  document.getElementById('stdChatModalSub').textContent = 'টিকেট #' + ticketId + ' • অভিজ্ঞ মেন্টর সাপোর্ট';
  document.getElementById('stdChatVideoBtn').onclick = function(){ joinStudentVideoRoom(ticketId, topic); };

  document.getElementById('studentChatModal').classList.remove('hidden');
  document.getElementById('studentChatModal').classList.add('flex');
  loadStudentMessages(ticketId);

  clearInterval(STD_CHAT_POLL);
  STD_CHAT_POLL = setInterval(function(){
    if (STD_ACTIVE_TICKET_ID === ticketId) {
      loadStudentMessages(ticketId, true);
    }
  }, 4000);
}

function closeStudentChat() {
  STD_ACTIVE_TICKET_ID = null;
  clearInterval(STD_CHAT_POLL);
  document.getElementById('studentChatModal').classList.add('hidden');
  document.getElementById('studentChatModal').classList.remove('flex');
}

function loadStudentMessages(ticketId, silent) {
  axios.get('/api/teacher-support/tickets/' + ticketId + '/messages').then(function(res){
    if (!res.data.ok) return;
    var list = res.data.messages || [];
    var box = document.getElementById('stdChatMessagesBox');
    if (!box) return;

    if (!list.length) {
      box.innerHTML = '<div class="text-center py-8 text-slate-500"><i class="fas fa-comment-dots text-3xl mb-2 text-slate-600"></i><p>শিক্ষককে আপনার সম্পূরক প্রশ্ন বা বার্তা পাঠান।</p></div>';
      return;
    }

    box.innerHTML = list.map(function(m){
      var isMe = m.sender_role === 'student' || m.sender_role === 'user';
      return '<div class="flex flex-col '+(isMe?'items-end':'items-start')+' space-y-1">'+
        '<div class="flex items-center gap-1.5 text-[10px] text-slate-400">'+
          '<span class="font-bold '+(isMe?'text-amber-400':'text-emerald-400')+'">'+(isMe?'🎓 আপনি':'👨‍🏫 '+esc(m.sender_name||'শিক্ষক'))+'</span>'+
          '<span>'+esc(String(m.created_at||'').slice(11,16))+'</span>'+
        '</div>'+
        '<div class="max-w-[80%] rounded-2xl px-4 py-2.5 text-xs '+(isMe?'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-medium rounded-tr-none shadow-md':'bg-slate-800 text-white border border-white/10 rounded-tl-none shadow-sm')+' leading-relaxed whitespace-pre-wrap">'+
          esc(m.message)+
        '</div>'+
      '</div>';
    }).join('');

    if (!silent) {
      box.scrollTop = box.scrollHeight;
    }
  });
}

function sendStudentChatMsg(e) {
  e.preventDefault();
  var id = STD_ACTIVE_TICKET_ID;
  var text = document.getElementById('stdChatInputText').value.trim();
  if (!text || !id) return false;

  axios.post('/api/teacher-support/tickets/' + id + '/message', { message: text }).then(function(res){
    if (res.data.ok) {
      document.getElementById('stdChatInputText').value = '';
      loadStudentMessages(id);
    }
  });
  return false;
}

// ==========================================
// ---------- শিক্ষার্থীর লাইভ ভিডিও রুম ----------
// ==========================================
function joinStudentVideoRoom(ticketId, topic) {
  if (!loggedIn) { location.href = '/login'; return; }
  axios.post('/api/teacher-support/tickets/' + ticketId + '/video-room').then(function(res){
    if (!res.data.ok || !res.data.room) return;
    document.getElementById('stdVideoModalTitle').textContent = '🔴 লাইভ ভিডিও রুম: ' + (topic || 'টিকেট #' + ticketId);
    document.getElementById('stdVideoRoomCodeBadge').textContent = 'রুম কোড: ' + res.data.room.room_code;
    document.getElementById('studentVideoModal').classList.remove('hidden');
    document.getElementById('studentVideoModal').classList.add('flex');
  });
}

function closeStudentVideoModal() {
  document.getElementById('studentVideoModal').classList.add('hidden');
  document.getElementById('studentVideoModal').classList.remove('flex');
}

function toggleStdVideoMic() {
  var btn = document.getElementById('stdVMicBtn');
  btn.classList.toggle('bg-emerald-600');
  alert('মাইক্রোফোন টগল হয়েছে');
}
function toggleStdVideoCam() {
  var btn = document.getElementById('stdVCamBtn');
  btn.classList.toggle('bg-emerald-600');
  alert('ক্যামেরা টগল হয়েছে');
}

// Auto join if ?room= parameter exists in URL
(function checkUrlVideoRoom(){
  var params = new URLSearchParams(window.location.search);
  var room = params.get('room');
  if (room) {
    document.getElementById('stdVideoModalTitle').textContent = '🔴 লাইভ মেন্টরিং রুম: ' + room;
    document.getElementById('stdVideoRoomCodeBadge').textContent = 'রুম কোড: ' + room;
    document.getElementById('studentVideoModal').classList.remove('hidden');
    document.getElementById('studentVideoModal').classList.add('flex');
  }
})();

// Initial Calls
checkUserStatus();
loadMentors();
</script>
`)
}

