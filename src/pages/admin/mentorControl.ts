// সেন্ট্রাল এডমিন — শিক্ষক ও মেন্টর কন্ট্রোল হাব
export function renderMentorControlTab(): string {
  return `
<section id="tab-teacher" class="tab-pane space-y-6">
  <!-- মেন্টর কন্ট্রোল হেডার ব্যানার -->
  <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
    <div class="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-700/60">
      <div>
        <div class="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider mb-2">
          👨‍🏫 শিক্ষক ও মেন্টর সেন্ট্রাল কন্ট্রোল
        </div>
        <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">
          শিক্ষক প্যানেল, ডাউট কিউ ও মেন্টরশিপ হাব
        </h2>
        <p class="text-xs sm:text-sm text-slate-300 mt-0.5">
          শিক্ষকদের অনুমোদন, লাইভ অনলাইন স্ট্যাটাস, শিক্ষার্থী ডাউট অ্যাসাইনমেন্ট, ভিডিও রুম মনিটরিং, রিভিউ অডিট ও পেআউট হিসাব।
        </p>
      </div>
      <button onclick="openNewTeacherModal()" class="px-4 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 transition shadow-xl flex items-center gap-2">
        <i class="fas fa-user-plus"></i> নতুন শিক্ষক / মেন্টর যোগ করুন
      </button>
    </div>

    <!-- সাব-ট্যাব ন্যাভিগেশন বার -->
    <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pt-4 text-xs">
      <button onclick="switchMentorSubTab('list')" id="mSubBtn-list" class="mentor-sub-btn px-3.5 py-2 rounded-xl font-bold bg-amber-500 text-slate-950 transition flex items-center gap-1.5 shadow">
        <i class="fas fa-users-gear"></i> শিক্ষক তালিকা (<span id="mCountTeachers">০</span>)
      </button>
      <button onclick="switchMentorSubTab('tickets')" id="mSubBtn-tickets" class="mentor-sub-btn px-3.5 py-2 rounded-xl font-bold bg-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5">
        <i class="fas fa-comments-question"></i> ডাউট কিউ ও অ্যাসাইনমেন্ট (<span id="mCountPendingTickets">০</span>)
      </button>
      <button onclick="switchMentorSubTab('complaints')" id="mSubBtn-complaints" class="mentor-sub-btn px-3.5 py-2 rounded-xl font-bold bg-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5">
        <i class="fas fa-star-half-stroke"></i> রিভিউ ও কমপ্লেন (<span id="mCountComplaints">০</span>)
      </button>
      <button onclick="switchMentorSubTab('payouts')" id="mSubBtn-payouts" class="mentor-sub-btn px-3.5 py-2 rounded-xl font-bold bg-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5">
        <i class="fas fa-money-bill-transfer"></i> পেআউট ও সেশন বিল (<span id="mCountPayouts">০</span>)
      </button>
    </div>
  </div>

  <!-- ১. শিক্ষক তালিকা সাব-ট্যাব -->
  <div id="mSubTab-list" class="space-y-4">
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 class="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <i class="fas fa-chalkboard-user text-amber-500"></i> অনুমোদিত শিক্ষক ও মেন্টর প্যানেল
          </h3>
          <p class="text-xs text-slate-500">যোগ্যতা, বিশেষায়িত বিষয়, রেটিং ও অনলাইন সক্রিয়তা নিয়ন্ত্রণ করুন</p>
        </div>
        <button onclick="loadAdminTeachers()" class="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold transition flex items-center gap-1">
          <i class="fas fa-rotate"></i> রিফ্রেশ
        </button>
      </div>

      <div id="admTeachersGrid" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="col-span-full py-8 text-center text-slate-400">শিক্ষক তালিকা লোড হচ্ছে...</div>
      </div>
    </div>
  </div>

  <!-- ২. শিক্ষার্থী ডাউট কিউ ও অ্যাসাইনমেন্ট সাব-ট্যাব -->
  <div id="mSubTab-tickets" class="hidden space-y-4">
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4">
      <div class="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-slate-100">
        <div>
          <h3 class="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <i class="fas fa-comments-question text-sky-600"></i> শিক্ষার্থীর প্রশ্নের সমাধান কিউ ও শিক্ষক বরাদ্দ
          </h3>
          <p class="text-xs text-slate-500">শিক্ষার্থীর অমীমাংসিত প্রশ্ন সরাসরি উপযুক্ত শিক্ষকের কাছে অ্যাসাইন বা উত্তর দিন</p>
        </div>
        <div class="flex gap-2">
          <button onclick="loadTeacherTickets('pending')" class="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs">⌛ অপেক্ষমান প্রশ্ন</button>
          <button onclick="loadTeacherTickets('')" class="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">সকল প্রশ্ন</button>
        </div>
      </div>

      <div id="admTicketsList" class="space-y-3">
        <div class="py-8 text-center text-slate-400">প্রশ্নপত্র কিউ লোড হচ্ছে...</div>
      </div>
    </div>
  </div>

  <!-- ৩. রিভিউ ও শিক্ষার্থী কমপ্লেন সাব-ট্যাব -->
  <div id="mSubTab-complaints" class="hidden space-y-4">
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4">
      <div class="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-slate-100">
        <div>
          <h3 class="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <i class="fas fa-star-half-stroke text-amber-500"></i> শিক্ষার্থী ফিডব্যাক, রেটিং ও কমপ্লেন অডিট
          </h3>
          <p class="text-xs text-slate-500">শিক্ষার্থীদের দেওয়া কম রেটিং (৩ বা তার নিচে) ও লিখিত সমাধান অভিযোগ পর্যালোচনা</p>
        </div>
        <button onclick="loadMentorOverview()" class="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold">
          <i class="fas fa-rotate"></i> রিফ্রেশ
        </button>
      </div>

      <div id="admComplaintsList" class="space-y-3">
        <div class="py-8 text-center text-slate-400">রিভিউ ও কমপ্লেন লোড হচ্ছে...</div>
      </div>
    </div>
  </div>

  <!-- ৪. মেন্টর পেআউট ও সেশন বিল সাব-ট্যাব -->
  <div id="mSubTab-payouts" class="hidden space-y-4">
    <div class="grid lg:grid-cols-3 gap-5">
      <!-- পেআউট সেটেলমেন্ট ফর্ম -->
      <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4 lg:col-span-1">
        <div>
          <h3 class="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <i class="fas fa-wallet text-emerald-600"></i> মেন্টর পেআউট সেটেলমেন্ট
          </h3>
          <p class="text-xs text-slate-500">সংশ্লিষ্ট শিক্ষকের সমাধান বিল পরিশোধ ও ওয়ালেট ট্রান্সফার</p>
        </div>

        <form onsubmit="return submitMentorPayout(event)" class="space-y-3 text-xs text-slate-700">
          <label class="block font-semibold">
            শিক্ষক নির্বাচন করুন *
            <select id="payoutTeacherSelect" required class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 bg-white">
              <option value="">-- শিক্ষক বেছে নিন --</option>
            </select>
          </label>

          <label class="block font-semibold">
            পরিশোধের পরিমাণ (৳) *
            <input type="number" min="1" id="payoutAmount" required placeholder="যেমন: 500" class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500">
          </label>

          <div class="grid grid-cols-2 gap-2">
            <label class="block font-semibold">
              সমাধানকৃত টিকেট
              <input type="number" min="0" id="payoutTicketsCount" value="0" class="w-full mt-1 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs">
            </label>
            <label class="block font-semibold">
              ভিডিও সেশন
              <input type="number" min="0" id="payoutSessionsCount" value="0" class="w-full mt-1 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs">
            </label>
          </div>

          <label class="block font-semibold">
            নোট / রেফারেন্স *
            <input type="text" id="payoutNote" required placeholder="যেমন: ফেব্রুয়ারি মাসের টিকেট সমাধান বিল" class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500">
          </label>

          <button type="submit" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs transition shadow">
            বিল সেটেল ও ওয়ালেট ক্রেডিট করুন
          </button>
        </form>
      </div>

      <!-- পেআউট হিস্ট্রি -->
      <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-3 lg:col-span-2">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 class="font-extrabold text-slate-900 text-sm">
            <i class="fas fa-receipt text-sky-600 mr-1.5"></i> পরিশোধিত পেআউট রেকর্ড
          </h3>
          <span class="text-xs text-slate-400">সর্বশেষ ৩০টি ট্রানজ্যাকশন</span>
        </div>
        <div id="admPayoutsList" class="space-y-2 text-xs max-h-96 overflow-y-auto">
          <div class="py-6 text-center text-slate-400">পেআউট রেকর্ড লোড হচ্ছে...</div>
        </div>
      </div>
    </div>
  </div>
</section>
`
}
