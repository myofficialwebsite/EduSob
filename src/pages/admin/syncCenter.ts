// সেন্ট্রাল এডমিন ডাটা সিঙ্ক ও অটো কালেকশন সেন্টার
export function renderSyncCenterTab(): string {
  return `
<section id="tab-autocollect" class="tab-pane space-y-6">
  <!-- হেডার ও পরিচিতি ব্যানার -->
  <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800">
    <div class="flex items-start justify-between gap-4 flex-wrap pb-5 border-b border-slate-700/60">
      <div>
        <div class="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
          <i class="fas fa-bolt text-amber-400"></i> সেন্ট্রাল ইনজেশন ও ডাটা অটোমেশন ইঞ্জিন
        </div>
        <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">
          ডাটা সিঙ্ক সেন্টার ও অটো কালেকশন হাব
        </h2>
        <p class="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
          বাংলাদেশের সরকারি শিক্ষা বোর্ড, BPSC, জাতীয় বিশ্ববিদ্যালয়, NCTB ও শিক্ষা মন্ত্রণালয় থেকে স্বয়ংক্রিয়ভাবে সার্কুলার, সিলেবাস, প্রশ্নপত্র ও স্কলারশিপ সংগ্রহ, ডুপ্লিকেট ফিল্টারিং ও স্ট্যাজিং ব্যবস্থাপনা।
        </p>
      </div>

      <!-- মাস্টার সিঙ্ক ট্রিগার -->
      <div class="flex items-center gap-2">
        <button onclick="triggerAutoCollection('all')" id="btnMasterSync" class="bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs transition shadow-xl flex items-center gap-2 transform active:scale-95">
          <i class="fas fa-wand-magic-sparkles text-sm"></i>
          <span>১-ক্লিক সম্পূর্ণ মাস্টার সিঙ্ক চালান</span>
        </button>
      </div>
    </div>

    <!-- সিঙ্ক সামারি মেট্রিক্স -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 text-xs">
      <div>
        <span class="text-slate-400">সক্রিয় সিঙ্ক সোর্স</span>
        <p class="text-xl font-black text-white mt-0.5" id="syncStatSources">৬টি সোর্স</p>
      </div>
      <div>
        <span class="text-slate-400">সর্বশেষ সফল সিঙ্ক</span>
        <p class="text-xl font-black text-emerald-400 mt-0.5" id="syncStatLastTime">কিছুক্ষণ আগে</p>
      </div>
      <div>
        <span class="text-slate-400">মোট সংগৃহীত কন্টেন্ট</span>
        <p class="text-xl font-black text-sky-400 mt-0.5" id="syncStatTotal">১,৪৫০+</p>
      </div>
      <div>
        <span class="text-slate-400">ডুপ্লিকেট প্রতিরোধ হার</span>
        <p class="text-xl font-black text-amber-400 mt-0.5">৯৯.৮%</p>
      </div>
    </div>
  </div>

  <!-- ১. সিঙ্ক সোর্স মনিটরিং টেবিল (Live Data Sources Grid) -->
  <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h3 class="font-black text-slate-900 text-base flex items-center gap-2">
          <i class="fas fa-tower-broadcast text-emerald-600"></i> অটো কালেকশন সোর্স ও ইনজেশন পাইপলাইন
        </h3>
        <p class="text-xs text-slate-500">প্রতিটি শিক্ষা সোর্সের লাইভ স্ট্যাটাস, নতুন আইটেম সংখ্যা এবং ম্যানুয়াল ফোর্স সিঙ্ক</p>
      </div>
      <button onclick="loadSyncSources()" class="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold transition flex items-center gap-1">
        <i class="fas fa-rotate"></i> স্ট্যাটাস রিফ্রেশ
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-xs text-left">
        <thead>
          <tr class="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
            <th class="py-3 px-3">সোর্স ও পোর্টাল</th>
            <th class="py-3 px-3">টার্গেট মডিউল</th>
            <th class="py-3 px-3">সর্বশেষ সিঙ্ক</th>
            <th class="py-3 px-3 text-center">স্ক্যানকৃত</th>
            <th class="py-3 px-3 text-center">নতুন যুক্ত</th>
            <th class="py-3 px-3 text-center">ডুপ্লিকেট ফিল্টার</th>
            <th class="py-3 px-3 text-center">স্ট্যাটাস</th>
            <th class="py-3 px-3 text-right">একশন</th>
          </tr>
        </thead>
        <tbody id="syncSourcesTableBody" class="divide-y divide-slate-100">
          <tr><td colspan="8" class="text-center py-6 text-slate-400">সোর্স তালিকা লোড হচ্ছে...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ২. রিয়েলটাইম সিঙ্ক লগ ও এক্সিকিউশন হিস্ট্রি কনসোল -->
  <div class="grid lg:grid-cols-3 gap-5">
    <!-- বামে: রিয়েল-টাইম টার্মিনাল লগ -->
    <div class="lg:col-span-1 bg-slate-950 text-slate-200 rounded-3xl p-4 sm:p-5 font-mono text-xs border border-slate-800 flex flex-col justify-between space-y-3">
      <div>
        <div class="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
          <span class="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
            <i class="fas fa-terminal"></i> লাইভ এক্সিকিউশন টার্মিনাল
          </span>
          <span id="autoCollectTime" class="text-[10px] text-slate-500">প্রস্তুত</span>
        </div>
        <div id="autoCollectLogs" class="mt-3 max-h-72 overflow-y-auto space-y-1.5 text-[11px] text-slate-300 leading-relaxed">
          <p class="text-slate-500">» এডমিন অটোমেশন ইঞ্জিন প্রস্তুত।</p>
          <p class="text-slate-500">» যেকোনো সোর্সের পাশে "ফোর্স সিঙ্ক" বা উপরে "মাস্টার সিঙ্ক" চাপুন।</p>
        </div>
      </div>
      <button onclick="clearSyncLogsConsole()" class="text-[10px] text-slate-500 hover:text-slate-300 transition text-right pt-2 border-t border-slate-900">
        কনসোল পরিষ্কার করুন
      </button>
    </div>

    <!-- ডানে: ডাটাবেজ সিঙ্ক হিস্ট্রি টেবিল (sync_logs) -->
    <div class="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-3">
      <div class="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 class="font-extrabold text-slate-800 text-sm flex items-center gap-2">
          <i class="fas fa-clock-rotate-left text-emerald-600"></i> সিঙ্ক হিস্ট্রি ও ডায়াগনস্টিক অডিট (sync_logs)
        </h3>
        <span class="text-xs text-slate-400">বিগত ৫০টি সিঙ্ক ইভেন্ট</span>
      </div>

      <div class="overflow-x-auto max-h-72 overflow-y-auto">
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 sticky top-0">
              <th class="py-2 px-3">সময়</th>
              <th class="py-2 px-3">সোর্স নাম</th>
              <th class="py-2 px-3 text-center">স্ট্যাটাস</th>
              <th class="py-2 px-3 text-center">নতুন</th>
              <th class="py-2 px-3 text-center">সময় (ms)</th>
              <th class="py-2 px-3">ট্রিগারকারী</th>
            </tr>
          </thead>
          <tbody id="syncLogsTableBody" class="divide-y divide-slate-100 text-[11px]">
            <tr><td colspan="6" class="text-center py-6 text-slate-400">লগ লোড হচ্ছে...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</section>
`
}
