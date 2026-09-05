// এডুসব — স্কলারশিপ অটো-যোগ্যতা ইঞ্জিন ও স্টাডি পাথ ফাইন্ডার পেজ
import { pageShell, siteHeader } from './layout'

export function scholarshipsPage(loggedIn: boolean, userLevel: string = '', userGpa: string = ''): string {
  const content = `
${siteHeader({ activeKey: 'scholarships', loggedIn, theme: 'dark' })}

<main class="max-w-7xl mx-auto px-4 py-8 space-y-8">
  <!-- হিরো হেডার -->
  <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 border border-amber-500/20 p-6 md:p-10 shadow-2xl">
    <div class="relative z-10 max-w-3xl space-y-3">
      <span class="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-semibold">
        <i class="fas fa-wand-magic-sparkles"></i> এআই অটো-যোগ্যতা ও রোডম্যাপ সিস্টেম
      </span>
      <h1 class="text-2xl md:text-4xl font-extrabold text-white leading-tight">
        আপনার যোগ্যতা অনুযায়ী <span class="bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">উপযুক্ত স্কলারশিপ</span> ও আবেদনের পূর্ণাঙ্গ পথরেখা
      </h1>
      <p class="text-slate-300 text-sm md:text-base leading-relaxed">
        আপনার শিক্ষাগত স্তর, জিপিএ, পারিবারিক আয় ও কোটা প্রবেশ করান — আমাদের সিস্টেম নিমিষেই যাচাই করে জানাবে আপনি কোন কোন সরকারি, বোর্ড, ব্যাংক ও আন্তর্জাতিক ফুল-ফান্ডেড স্কলারশিপের জন্য শতভাগ যোগ্য!
      </p>
    </div>
    <div class="absolute -right-12 -bottom-12 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
  </section>

  <!-- যোগ্যতা নির্ণয় ক্যালকুলেটর ও ফিল্টার ফর্ম -->
  <section class="bg-slate-900/90 border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl">
    <div class="flex items-center justify-between gap-4 mb-6 flex-wrap border-b border-white/10 pb-4">
      <div>
        <h2 class="text-xl font-bold text-white flex items-center gap-2">
          <i class="fas fa-sliders text-amber-400"></i> আপনার তথ্য দিয়ে অটো যাচাই করুন
        </h2>
        <p class="text-xs text-slate-400 mt-0.5">১ ক্লিকে আপনার প্রোফাইলের সাথে সকল স্কলারশিপের ক্রাইটেরিয়া মিলিয়ে দেখুন</p>
      </div>
      <button id="btnAutoProfile" class="text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-4 py-2 rounded-xl transition flex items-center gap-1.5 font-semibold">
        <i class="fas fa-user-check"></i> আমার প্রোফাইল থেকে স্বয়ংক্রিয় পূরণ
      </button>
    </div>

    <form id="evalForm" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-sm">
      <!-- শিক্ষাগত স্তর -->
      <div>
        <label class="block text-slate-300 text-xs font-semibold mb-1.5">বর্তমান শিক্ষাগত স্তর *</label>
        <select id="inpLevel" name="level" class="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-amber-400 focus:outline-none">
          <option value="ssc" ${userLevel === 'ssc' ? 'selected' : ''}>এসএসসি / দাখিল / সমমান (SSC)</option>
          <option value="hsc" ${userLevel === 'hsc' ? 'selected' : ''}>এইচএসসি / আলিম / ডিপ্লোমা (HSC)</option>
          <option value="nu" ${userLevel === 'nu' ? 'selected' : ''}>অনার্স / ডিগ্রি (জাতীয় বিশ্ববিদ্যালয় / পাবলিক)</option>
          <option value="bsc">স্নাতক সম্মান (BSc / BBA / BA)</option>
          <option value="masters" ${userLevel === 'masters' ? 'selected' : ''}>মাস্টার্স / স্নাতকোত্তর (Masters)</option>
        </select>
      </div>

      <!-- প্রাপ্ত জিপিএ -->
      <div>
        <label class="block text-slate-300 text-xs font-semibold mb-1.5">সর্বশেষ প্রাপ্ত GPA / CGPA *</label>
        <input id="inpGpa" name="gpa" type="number" step="0.01" min="1.00" max="5.00" value="${userGpa || '4.50'}" required class="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-amber-400 focus:outline-none" placeholder="যেমন: 4.80 বা 3.65">
      </div>

      <!-- পারিবারিক বার্ষিক আয় -->
      <div>
        <label class="block text-slate-300 text-xs font-semibold mb-1.5">পারিবারিক বার্ষিক আয় (টাকা/বছর) *</label>
        <select id="inpIncome" name="family_income" class="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-amber-400 focus:outline-none">
          <option value="60000">৬০,০০০ টাকার কম (অতি অসচ্ছল)</option>
          <option value="100000" selected>১,০০,০০০ টাকার নিচে (দরিদ্র/মধ্যবিত্ত)</option>
          <option value="150000">১,৫০,০০০ টাকার নিচে</option>
          <option value="250000">২,৫০,০০০ টাকার নিচে</option>
          <option value="500000">৫,০০,০০০ টাকার নিচে</option>
          <option value="1000000">আয়ের কোনো সীমাবদ্ধতা নেই (উন্মুক্ত)</option>
        </select>
      </div>

      <!-- জেলা / এলাকা -->
      <div>
        <label class="block text-slate-300 text-xs font-semibold mb-1.5">স্থায়ী জেলা / এলাকা</label>
        <input id="inpDistrict" name="district" type="text" value="ঢাকা" class="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-amber-400 focus:outline-none" placeholder="যেমন: বগুড়া, চট্টগ্রাম, রংপুর">
      </div>

      <!-- বিশেষ কোটা -->
      <div>
        <label class="block text-slate-300 text-xs font-semibold mb-1.5">বিশেষ সুবিধা / কোটা</label>
        <select id="inpQuota" name="quota" class="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-amber-400 focus:outline-none">
          <option value="general">সাধারণ (General)</option>
          <option value="merit">মেধা কোটা (ট্যালেন্টপুল)</option>
          <option value="poor">দরিদ্র ও সুবিধাবঞ্চিত</option>
          <option value="disabled">প্রতিবন্ধী শিক্ষার্থী</option>
          <option value="tribal">ক্ষুদ্র নৃগোষ্ঠী / উপজাতি</option>
          <option value="female">নারী শিক্ষার্থী</option>
          <option value="freedom_fighter">মুক্তিযোদ্ধা সন্তান/নাতি</option>
        </select>
      </div>

      <!-- লক্ষ্য / আগ্রহ -->
      <div>
        <label class="block text-slate-300 text-xs font-semibold mb-1.5">অধ্যয়নের মূল লক্ষ্য</label>
        <select id="inpGoal" name="study_goal" class="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-amber-400 focus:outline-none">
          <option value="domestic">🇧🇩 দেশে পড়াশোনা (সরকারি, বোর্ড ও ব্যাংক বৃত্তি)</option>
          <option value="abroad">🌍 বিদেশে উচ্চশিক্ষা (ফুল-ফান্ডেড স্কলারশিপ)</option>
          <option value="both">উভয় ধরনের সুযোগ দেখতে চাই</option>
        </select>
      </div>

      <div class="sm:col-span-2 lg:col-span-3 pt-2">
        <button type="submit" class="w-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 hover:opacity-95 text-slate-950 font-extrabold py-3.5 rounded-2xl transition shadow-lg text-base flex items-center justify-center gap-2">
          <i class="fas fa-calculator"></i> আমার স্কলারশিপ ম্যাচ ও রোডম্যাপ জেনারেট করুন
        </button>
      </div>
    </form>
  </section>

  <!-- মূল্যায়ন ফলাফল ও স্কলারশিপ তালিকা কার্ডস -->
  <section class="space-y-6">
    <!-- ক্যাটাগরি ফিল্টার ট্যাব -->
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-sm w-full sm:w-auto" id="catFilterTabs">
        <button data-cat="" class="cat-btn px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold whitespace-nowrap transition">🎯 সকল সুযোগ (<span id="countAll">0</span>)</button>
        <button data-cat="national" class="cat-btn px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white font-semibold whitespace-nowrap transition">🇧🇩 জাতীয় ও সরকারি</button>
        <button data-cat="board" class="cat-btn px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white font-semibold whitespace-nowrap transition">🏫 বোর্ড মেধা বৃত্তি</button>
        <button data-cat="bank" class="cat-btn px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white font-semibold whitespace-nowrap transition">🏦 ব্যাংক ও ট্রাস্ট</button>
        <button data-cat="international" class="cat-btn px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white font-semibold whitespace-nowrap transition">🌍 আন্তর্জাতিক ফুল-ফান্ডেড</button>
      </div>
      <div id="evalSummaryBanner" class="hidden text-xs bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-3.5 py-1.5 rounded-xl font-bold">
        🎉 <span id="summaryEligibleCount">0</span>টি স্কলারশিপের জন্য শতভাগ যোগ্য!
      </div>
    </div>

    <!-- স্কলারশিপ কার্ড গ্রিড -->
    <div id="scholarshipsGrid" class="grid lg:grid-cols-2 gap-6">
      <div class="col-span-full text-center py-12 text-slate-400 bg-slate-900/50 rounded-2xl border border-white/5">
        <i class="fas fa-spinner fa-spin text-2xl text-amber-400 mb-3"></i>
        <p>স্কলারশিপ ও উপবৃত্তির ডাটাবেজ লোড হচ্ছে...</p>
      </div>
    </div>
  </section>

  <!-- পূর্ণাঙ্গ বিস্তারিত মোডাল / রোডম্যাপ পপআপ -->
  <div id="modalDetails" class="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative text-slate-100">
      <button onclick="closeModal()" class="absolute top-5 right-5 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition">
        <i class="fas fa-times"></i>
      </button>
      <div id="modalBody" class="space-y-6"></div>
    </div>
  </div>
</main>

<script>
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function toBn(n){var d={'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};return String(n).replace(/[0-9]/g,function(x){return d[x]})}

var SCHOLARSHIPS_DATA = [];
var ACTIVE_CAT = '';

async function loadScholarships(cat = '') {
  try {
    var url = '/api/scholarships/list' + (cat ? '?category=' + cat : '');
    var res = await fetch(url);
    var d = await res.json();
    if (d && d.ok) {
      SCHOLARSHIPS_DATA = d.scholarships || [];
      document.getElementById('countAll').textContent = toBn(SCHOLARSHIPS_DATA.length);
      renderCards(SCHOLARSHIPS_DATA);
    }
  } catch (e) {
    console.error(e);
  }
}

function renderCards(items, isEvaluated = false) {
  var grid = document.getElementById('scholarshipsGrid');
  if (!items || items.length === 0) {
    grid.innerHTML = '<div class="col-span-full text-center py-12 text-slate-400 bg-slate-900/50 rounded-2xl border border-white/5"><i class="fas fa-folder-open text-3xl mb-2 text-slate-600"></i><p>কোনো স্কলারশিপের তথ্য পাওয়া যায়নি</p></div>';
    return;
  }

  var catBadges = {
    national: '🇧🇩 সরকারি / জাতীয়',
    board: '🏫 শিক্ষা বোর্ড মেধা',
    bank: '🏦 ব্যাংক ও ফাউন্ডেশন',
    international: '🌍 আন্তর্জাতিক ফুল-ফান্ডেড'
  };

  grid.innerHTML = items.map(function(s) {
    var matchBadge = '';
    if (s.match_score !== undefined) {
      var scoreColor = s.match_score >= 80 ? 'from-emerald-500 to-teal-500 text-slate-950' : (s.match_score >= 50 ? 'from-amber-500 to-orange-500 text-slate-950' : 'from-rose-500 to-red-600 text-white');
      matchBadge = '<div class="bg-gradient-to-r ' + scoreColor + ' px-3 py-1 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 shrink-0">' +
        '<i class="fas fa-chart-pie"></i> ' + toBn(s.match_score) + '% ম্যাচ' +
      '</div>';
    }

    var docsCount = (s.required_docs || []).length;
    var stepsCount = (s.steps_roadmap || []).length;

    return '<div class="bg-slate-900/80 border border-white/10 hover:border-amber-400/40 rounded-3xl p-6 transition-all duration-200 shadow-lg flex flex-col justify-between space-y-4 relative group">' +
      '<div class="space-y-3">' +
        '<div class="flex items-start justify-between gap-3">' +
          '<div class="space-y-1">' +
            '<span class="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-lg border border-amber-400/20">' +
              (catBadges[s.category] || s.category) +
            '</span>' +
            '<h3 class="font-extrabold text-white text-lg group-hover:text-amber-300 transition">' + esc(s.title) + '</h3>' +
            '<p class="text-xs text-slate-400 flex items-center gap-1.5"><i class="fas fa-building-columns text-slate-500"></i> ' + esc(s.provider) + '</p>' +
          '</div>' +
          matchBadge +
        '</div>' +

        (s.status_text ? '<div class="p-2.5 rounded-xl text-xs border font-semibold ' + s.status_badge + '">' + esc(s.status_text) + '</div>' : '') +

        '<div class="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-2xl border border-white/5">' +
          '<div><span class="text-slate-500">ন্যূনতম জিপিএ:</span> <b class="text-slate-200">' + (s.min_gpa > 0 ? toBn(s.min_gpa) : 'উন্মুক্ত') + '</b></div>' +
          '<div><span class="text-slate-500">আয় সীমা:</span> <b class="text-slate-200">' + (s.max_family_income > 0 ? '৳' + toBn(s.max_family_income) : 'সীমাহীন') + '</b></div>' +
          '<div class="col-span-2"><span class="text-slate-500">বৃত্তি সুবিধা:</span> <b class="text-emerald-400">' + esc(s.stipend_amount || 'নির্ধারিত নয়') + '</b></div>' +
          '<div class="col-span-2 text-slate-400"><i class="fas fa-clock mr-1 text-slate-500"></i>' + esc(s.deadline || 'নিয়মিত আপডেট') + '</div>' +
        '</div>' +
      '</div>' +

      '<div class="pt-2 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">' +
        '<div class="text-xs text-slate-400">' +
          '<span><i class="fas fa-file-invoice mr-1 text-amber-400"></i>' + toBn(docsCount) + 'টি ডকুমেন্ট</span> · ' +
          '<span><i class="fas fa-route mr-1 text-teal-400"></i>' + toBn(stepsCount) + ' ধাপের রোডম্যাপ</span>' +
        '</div>' +
        '<div class="flex items-center gap-2">' +
          '<button onclick="viewDetails(' + s.id + ')" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl text-xs transition border border-white/10 flex items-center gap-1">' +
            '<i class="fas fa-eye"></i> বিস্তারিত ও পথরেখা' +
          '</button>' +
          (s.apply_link ? '<a href="' + esc(s.apply_link) + '" target="_blank" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow flex items-center gap-1">' +
            'আবেদন পোর্টাল <i class="fas fa-external-link text-[10px]"></i></a>' : '') +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function viewDetails(id) {
  var item = SCHOLARSHIPS_DATA.find(function(x){ return x.id === id; });
  if (!item) return;

  var docsHtml = (item.required_docs || []).map(function(doc, idx) {
    return '<li class="flex items-start gap-2 text-xs text-slate-200">' +
      '<i class="fas fa-check-circle text-emerald-400 mt-0.5 shrink-0"></i> ' +
      '<span>' + esc(doc) + '</span>' +
    '</li>';
  }).join('') || '<p class="text-xs text-slate-400">সাধারণ একাডেমিক কাগজপত্র প্রয়োজন</p>';

  var stepsHtml = (item.steps_roadmap || []).map(function(step, idx) {
    return '<div class="flex items-start gap-3 text-xs bg-slate-950/70 p-3 rounded-2xl border border-white/5">' +
      '<span class="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">' + toBn(idx+1) + '</span>' +
      '<p class="text-slate-200 leading-relaxed">' + esc(step) + '</p>' +
    '</div>';
  }).join('') || '<p class="text-xs text-slate-400">অফিসিয়াল পোর্টাল নির্দেশিকা অনুসরণ করুন</p>';

  document.getElementById('modalBody').innerHTML =
    '<div class="border-b border-white/10 pb-4">' +
      '<span class="text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/20 uppercase">' + esc(item.category) + ' SCHOLARSHIP</span>' +
      '<h2 class="text-xl md:text-2xl font-black text-white mt-2">' + esc(item.title) + '</h2>' +
      '<p class="text-xs text-slate-400 mt-1"><i class="fas fa-building-columns mr-1 text-slate-500"></i> প্রদানকারী: ' + esc(item.provider) + '</p>' +
    '</div>' +

    '<div class="grid sm:grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-2xl border border-white/5">' +
      '<div><span class="text-slate-400">যোগ্য স্তর:</span> <b class="text-slate-100 uppercase">' + esc(item.target_level) + '</b></div>' +
      '<div><span class="text-slate-400">ন্যূনতম জিপিএ:</span> <b class="text-slate-100">' + (item.min_gpa > 0 ? toBn(item.min_gpa) : 'উন্মুক্ত') + '</b></div>' +
      '<div><span class="text-slate-400">সর্বোচ্চ পারিবারিক আয়:</span> <b class="text-slate-100">' + (item.max_family_income > 0 ? '৳' + toBn(item.max_family_income) : 'কোনো বাধ্যবাধকতা নেই') + '</b></div>' +
      '<div><span class="text-slate-400">কোটা সুবিধা:</span> <b class="text-slate-100">' + esc(item.quota || 'সাধারণ') + '</b></div>' +
      '<div class="sm:col-span-2"><span class="text-slate-400">আর্থিক অনুদান / বৃত্তি পরিমাণ:</span> <b class="text-emerald-400 text-sm">' + esc(item.stipend_amount) + '</b></div>' +
    '</div>' +

    '<div class="space-y-2">' +
      '<h4 class="font-bold text-amber-400 text-sm flex items-center gap-2"><i class="fas fa-file-circle-check"></i> প্রয়োজনীয় ডকুমেন্টস চেকলিস্ট</h4>' +
      '<ul class="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-white/5">' + docsHtml + '</ul>' +
    '</div>' +

    '<div class="space-y-2">' +
      '<h4 class="font-bold text-teal-400 text-sm flex items-center gap-2"><i class="fas fa-route"></i> ধাপে ধাপে আবেদনের পূর্ণাঙ্গ পথরেখা (Roadmap)</h4>' +
      '<div class="space-y-2">' + stepsHtml + '</div>' +
    '</div>' +

    (item.tips_guideline ? '<div class="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl text-xs text-amber-300"><i class="fas fa-lightbulb mr-1.5"></i><b>বিশেষ টিপস:</b> ' + esc(item.tips_guideline) + '</div>' : '') +

    '<div class="pt-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">' +
      '<button onclick="closeModal()" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition">বন্ধ করুন</button>' +
      (item.apply_link ? '<a href="' + esc(item.apply_link) + '" target="_blank" class="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl text-xs transition shadow-lg flex items-center gap-2">অফিসিয়াল সাইটে সরাসরি আবেদন করুন <i class="fas fa-arrow-up-right-from-square"></i></a>' : '') +
    '</div>';

  document.getElementById('modalDetails').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modalDetails').classList.add('hidden');
}

// ক্যালকুলেটর সাবমিট ইভেন্ট
document.getElementById('evalForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  var payload = {
    level: document.getElementById('inpLevel').value,
    gpa: parseFloat(document.getElementById('inpGpa').value) || 4.0,
    family_income: parseInt(document.getElementById('inpIncome').value) || 100000,
    district: document.getElementById('inpDistrict').value,
    quota: document.getElementById('inpQuota').value,
    study_goal: document.getElementById('inpGoal').value
  };

  var btn = e.target.querySelector('button[type=submit]');
  var orig = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>প্রোফাইল যাচাই ও ম্যাচিং চলছে...';
  btn.disabled = true;

  try {
    var res = await fetch('/api/scholarships/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    var d = await res.json();
    if (d && d.ok) {
      SCHOLARSHIPS_DATA = d.matches || [];
      var banner = document.getElementById('evalSummaryBanner');
      banner.classList.remove('hidden');
      document.getElementById('summaryEligibleCount').textContent = toBn(d.summary.eligible_count || 0);
      renderCards(SCHOLARSHIPS_DATA, true);
      document.getElementById('scholarshipsGrid').scrollIntoView({ behavior: 'smooth' });
    }
  } catch (err) {
    alert('মূল্যায়নে সমস্যা হয়েছে, আবার চেষ্টা করুন');
  } finally {
    btn.innerHTML = orig;
    btn.disabled = false;
  }
});

// ক্যাটাগরি ফিল্টার বাটনসমূহ
document.querySelectorAll('.cat-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.cat-btn').forEach(function(b){
      b.className = 'cat-btn px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white font-semibold whitespace-nowrap transition';
    });
    btn.className = 'cat-btn px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold whitespace-nowrap transition';
    ACTIVE_CAT = btn.dataset.cat;
    loadScholarships(ACTIVE_CAT);
  });
});

// অটো প্রোফাইল ফিল বাটন
document.getElementById('btnAutoProfile').addEventListener('click', function() {
  if (!${loggedIn ? 'true' : 'false'}) {
    alert('প্রোফাইল স্বয়ংক্রিয় পূরণের জন্য আগে লগইন করুন');
    window.location.href = '/login';
    return;
  }
  document.getElementById('evalForm').dispatchEvent(new Event('submit'));
});

// ইনিশিয়াল লোড
loadScholarships();
</script>
`
  return pageShell('স্কলারশিপ অটো-যোগ্যতা ইঞ্জিন ও স্টাডি পাথফাইন্ডার', 'bg-slate-950 text-white min-h-screen', content)
}
