// এডুসব — ভর্তি ও সকল আবেদনের কেন্দ্রীয় হাব (ডিগ্রি, অনার্স, মাস্টার্স, একাদশ, গুচ্ছ, উন্মুক্ত, মেডিকেল, নার্সিং, চাকরি ও ক্যাডেট সরাসরি আবেদন ফরম)
import { pageShell, siteHeader } from './layout'

export function admissionPage(loggedIn: boolean, eduLevel: string): string {
  return pageShell('ভর্তি ও সরাসরি আবেদন হাব', 'bg-slate-950 text-white min-h-screen', `
${siteHeader({ activeKey: 'admission', loggedIn, theme: 'dark' })}

<main class="max-w-7xl mx-auto px-4 py-10">
  <header class="text-center mb-8">
    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
      <i class="fas fa-bolt text-amber-400"></i> শতভাগ সরাসরি আবেদন ফরম (Direct Internal Forms) ও সেন্ট্রাল গেটওয়ে
    </div>
    <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight">🎓 কেন্দ্রীয় ভর্তি ও আবেদন হাব</h1>
    <p class="text-slate-400 mt-2 max-w-2xl mx-auto text-sm sm:text-base">
      জাতীয় বিশ্ববিদ্যালয় (ডিগ্রি/অনার্স/মাস্টার্স) · একাদশ শ্রেণি · গুচ্ছ (GST) · উন্মুক্ত (BOU) · মেডিকেল ও নার্সিং · সরকারি চাকরি (NTRCA/BCS/Primary) — সরাসরি আবেদন ফরম লিংক ও নির্দেশিকা
    </p>
    
    <!-- সরাসরি ডিরেক্ট ফর্মের বিশেষ হাইলাইট বক্স -->
    <div class="mt-4 max-w-2xl mx-auto bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-3 text-xs text-slate-300 flex items-center justify-center gap-3">
      <span class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-base"><i class="fas fa-link"></i></span>
      <span class="text-left"><b>সরাসরি আবেদন লিংক:</b> কোনো অপ্রয়োজনীয় পেজ ছাড়াই সরাসরি নির্দিষ্ট ফরমের ডিরেক্ট লিংক (যেমন: NU ডিগ্রির সরাসরি ফর্ম <code>app55.nu.edu.bd</code>) এবং ১-ক্লিক কপি সুবিধা সংযুক্ত।</span>
    </div>
  </header>

  <!-- সার্চ বার ও ক্যাটাগরি ফিল্টার -->
  <div class="mb-8 space-y-4">
    <div class="max-w-xl mx-auto relative">
      <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
      <input type="text" id="admSearch" oninput="filterAdmissions()" placeholder="ডিগ্রি, অনার্স, একাদশ, বিসিএস, NTRCA বা বিশ্ববিদ্যালয়ের নাম দিয়ে খুঁজুন..." class="w-full bg-slate-900 border border-white/15 rounded-2xl pl-11 pr-4 py-3 text-sm focus:border-emerald-400 focus:outline-none shadow-inner">
    </div>

    <!-- ক্যাটাগরি ফিল্টার চিপস -->
    <div class="flex flex-wrap gap-2 justify-center" id="lvTabs">
      <button onclick="setTab('')" data-lv="" class="lv-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-500 text-white transition shadow-sm">সকল আবেদন ও ভর্তি</button>
      <button onclick="setTab('nu')" data-lv="nu" class="lv-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 transition">জাতীয় বিশ্ববিদ্যালয় (NU ডিগ্রি/অনার্স/মাস্টার্স)</button>
      <button onclick="setTab('hsc')" data-lv="hsc" class="lv-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 transition">একাদশ (XI) শ্রেণি</button>
      <button onclick="setTab('job')" data-lv="job" class="lv-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 transition">💼 সরকারি চাকরি ও NTRCA</button>
      <button onclick="setTab('cluster')" data-lv="cluster" class="lv-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 transition">গুচ্ছ ভর্তি (GST/Agri/Engg)</button>
      <button onclick="setTab('university')" data-lv="university" class="lv-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 transition">পাবলিক বিশ্ববিদ্যালয় (DU/BUET)</button>
      <button onclick="setTab('bou')" data-lv="bou" class="lv-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 transition">উন্মুক্ত বিশ্ববিদ্যালয় (BOU)</button>
      <button onclick="setTab('medical')" data-lv="medical" class="lv-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 transition">মেডিকেল ও নার্সিং</button>
      <button onclick="setTab('polytechnic')" data-lv="polytechnic" class="lv-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 transition">পলিটেকনিক ও কারিগরি</button>
      <button onclick="setTab('school')" data-lv="school" class="lv-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 transition">স্কুল ও ক্যাডেট লটারি</button>
    </div>
  </div>

  <section id="adm-cards" class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
    <p class="text-slate-400 text-sm col-span-full text-center py-10"><i class="fas fa-spinner fa-spin mr-2"></i>আবেদন তথ্য লোড হচ্ছে...</p>
  </section>

  <!-- আবেদন সহায়তা ব্যানার -->
  <section class="mt-12 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-violet-500/10 border border-violet-400/30 rounded-3xl p-6 sm:p-8">
    <div class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
      <div class="w-12 h-12 sm:w-14 sm:h-14 bg-violet-500/20 rounded-2xl flex items-center justify-center text-violet-400 text-xl sm:text-2xl shrink-0"><i class="fas fa-hands-helping"></i></div>
      <div class="flex-1 min-w-0">
        <h2 class="font-bold text-lg sm:text-xl text-white">🤝 নিজে আবেদন করতে সমস্যা হচ্ছে বা সার্ভার ঝামেলা?</h2>
        <p class="text-xs sm:text-sm text-slate-300 mt-1">এডুসবের <b>সহায়তা সার্ভিস</b> দিয়ে আমাদের অভিজ্ঞ টিম আপনার পছন্দের ডিগ্রি, অনার্স, কলেজ বা চাকরিতে নির্ভুলভাবে আবেদন করে দেবে — পেমেন্ট ওয়ালেট থেকেই।</p>
      </div>
      <div class="w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
      ${loggedIn
        ? '<a href="/assisted" class="block sm:inline-block text-center px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-bold text-sm shadow-lg hover:scale-105 transition">সহায়তা নিন <i class="fas fa-arrow-right ml-1"></i></a>'
        : '<a href="/signup" class="block sm:inline-block text-center px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-bold text-sm shadow-lg hover:scale-105 transition">সাইন-আপ করে সহায়তা নিন</a>'}
      </div>
    </div>
  </section>
</main>

<!-- গাইড + কপি প্যানেল মডাল -->
<div id="admModal" class="hidden fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" onclick="if(event.target===this)closeAdm()">
  <div class="bg-slate-900 border border-white/15 rounded-3xl max-w-2xl w-full max-h-[88vh] overflow-y-auto p-6 shadow-2xl">
    <div class="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
      <h3 id="admTitle" class="font-bold text-lg text-white"></h3>
      <button onclick="closeAdm()" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"><i class="fas fa-times"></i></button>
    </div>
    <div id="admBody" class="space-y-4 text-sm"></div>
  </div>
</div>

<script>
const LOGGED_IN = ${loggedIn};
const MY_LEVEL = ${JSON.stringify(eduLevel || '')};
let ADMISSIONS = [];
let curLv = '';

function esc(s){ return String(s == null ? '' : s).replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c])); }
const LV_BN = {
  hsc: 'একাদশ শ্রেণি',
  cluster: 'গুচ্ছ সমন্বিত',
  university: 'পাবলিক বিশ্ববিদ্যালয়',
  nu: 'জাতীয় বিশ্ববিদ্যালয়',
  bou: 'উন্মুক্ত বিশ্ববিদ্যালয়',
  medical: 'মেডিকেল ও নার্সিং',
  polytechnic: 'পলিটেকনিক ও কারিগরি',
  job: 'চাকরি ও নিয়োগ',
  school: 'বিদ্যালয় ও ক্যাডেট',
  other: 'অন্যান্য'
};
const LV_COLOR = {
  hsc: 'emerald',
  cluster: 'teal',
  university: 'sky',
  nu: 'amber',
  bou: 'cyan',
  medical: 'rose',
  polytechnic: 'indigo',
  job: 'teal',
  school: 'purple',
  other: 'slate'
};

function fmtDate(d){
  if (!d) return '';
  try {
    const dt = new Date(d + 'T00:00:00');
    const days = ['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার'];
    const p = d.split('-');
    return days[dt.getDay()] + ', ' + p[2] + '/' + p[1] + '/' + p[0];
  } catch(e){ return d; }
}

function setTab(lv) {
  curLv = lv;
  document.querySelectorAll('.lv-tab').forEach(b => {
    if (b.dataset.lv === lv) {
      b.className = 'lv-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-500 text-white transition shadow-sm';
    } else {
      b.className = 'lv-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 transition';
    }
  });
  render();
}

function filterAdmissions() {
  render();
}

function render(){
  const query = (document.getElementById('admSearch')?.value || '').toLowerCase().trim();
  let list = curLv ? ADMISSIONS.filter(a => a.level === curLv) : ADMISSIONS;
  if (query) {
    list = list.filter(a =>
      (a.title || '').toLowerCase().includes(query) ||
      (a.org || '').toLowerCase().includes(query) ||
      (a.description || '').toLowerCase().includes(query)
    );
  }

  const box = document.getElementById('adm-cards');
  if (!list.length) {
    box.innerHTML = '<div class="col-span-full bg-slate-900/60 border border-white/10 rounded-2xl p-10 text-center text-slate-400 text-sm"><i class="fas fa-magnifying-glass text-2xl mb-2 block text-slate-500"></i>কোনো আবেদন তথ্য পাওয়া যায়নি</div>';
    return;
  }

  box.innerHTML = list.map(a => {
    const col = LV_COLOR[a.level] || 'emerald';
    const deadlinePassed = a.deadline && new Date(a.deadline + 'T23:59:59') < new Date();
    const directUrl = a.direct_form_url || a.apply_link || '';
    const isDirectForm = !!a.direct_form_url;

    return \`
    <article class="card-hover bg-slate-900 border border-\${col}-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
      <div>
        <div class="flex items-start justify-between gap-2 mb-2">
          <span class="text-[11px] bg-\${col}-500/20 text-\${col}-300 px-2.5 py-1 rounded-full font-semibold">\${LV_BN[a.level] || a.level}</span>
          \${isDirectForm ? '<span class="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">⚡ ডিরেক্ট ফর্ম</span>' : ''}
          \${a.deadline ? \`<span class="text-[11px] \${deadlinePassed ? 'bg-rose-500/20 text-rose-300' : 'bg-white/10 text-slate-300'} px-2.5 py-1 rounded-full">⏰ \${fmtDate(a.deadline)}\${deadlinePassed ? ' (শেষ)' : ''}</span>\` : ''}
        </div>
        <h2 class="font-bold text-base sm:text-lg text-white mt-1 leading-snug">\${esc(a.title)}</h2>
        \${a.org ? \`<p class="text-xs text-slate-400 mt-1"><i class="fas fa-building-columns text-slate-500 mr-1"></i>\${esc(a.org)}</p>\` : ''}
        \${a.description ? \`<p class="text-xs text-slate-300 mt-2.5 line-clamp-3 leading-relaxed">\${esc(a.description)}</p>\` : ''}
        
        <div class="flex flex-wrap gap-1.5 mt-3 text-xs">
          \${a.fee ? \`<span class="bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg text-emerald-300"><i class="fas fa-money-bill-wave mr-1 text-emerald-400"></i>\${esc(a.fee)}</span>\` : ''}
        </div>

        \${directUrl ? \`
        <div class="mt-3 bg-slate-950/70 border border-white/10 rounded-xl p-2.5 text-[11px] flex items-center justify-between gap-2">
          <span class="text-slate-400 truncate flex-1 min-w-0 font-mono"><i class="fas fa-link text-emerald-400 mr-1"></i>\${esc(directUrl)}</span>
          <button data-link="\${esc(directUrl)}" onclick="copyDirectLink(this, this.dataset.link)" class="px-2 py-1 bg-white/10 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 rounded text-[10px] font-semibold shrink-0 transition">
            <i class="fas fa-copy mr-1"></i>লিংক কপি
          </button>
        </div>\` : ''}
      </div>

      <div class="space-y-2 mt-4 pt-3 border-t border-white/10">
        \${directUrl ? \`
        <a href="\${esc(directUrl)}" target="_blank" rel="noopener" class="w-full block text-center text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-2.5 px-3 rounded-xl transition shadow-md">
          <i class="fas fa-bolt mr-1"></i> \${isDirectForm ? 'সরাসরি আবেদন ফরম খুলুন' : 'আবেদন সাইটে যান'} <i class="fas fa-arrow-up-right-from-square text-[10px] ml-0.5"></i>
        </a>\` : ''}
        <div class="flex gap-2">
          <button onclick="openAdm(\${a.id})" class="flex-1 text-xs bg-white/10 hover:bg-white/20 py-2 rounded-xl transition font-semibold text-slate-200"><i class="fas fa-list-ol mr-1"></i> গাইড ও কপি</button>
          \${a.apply_link && a.apply_link !== directUrl ? \`<a href="\${esc(a.apply_link)}" target="_blank" rel="noopener" class="flex-1 text-center text-xs bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-xl transition font-semibold">মূল পোর্টাল</a>\` : ''}
        </div>
      </div>
    </article>\`;
  }).join('');
}

async function copyDirectLink(btn, url) {
  if (!url) return;
  await navigator.clipboard.writeText(url);
  const old = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-check text-emerald-400 mr-1"></i>কপি হয়েছে!';
  btn.classList.add('bg-emerald-500/30', 'text-emerald-300');
  setTimeout(() => {
    btn.innerHTML = old;
    btn.classList.remove('bg-emerald-500/30', 'text-emerald-300');
  }, 1500);
}

async function openAdm(id){
  const a = ADMISSIONS.find(x => x.id === id);
  if (!a) return;
  document.getElementById('admTitle').textContent = '🎓 ' + a.title;
  const directUrl = a.direct_form_url || a.apply_link || '';

  let stepsHtml = a.steps && a.steps.length ? \`
    <div><p class="text-xs font-bold text-slate-400 mb-2">📋 ধাপে ধাপে আবেদন নির্দেশিকা:</p>
    <ol class="space-y-2">\${a.steps.map((g, i) => \`
      <li class="flex gap-3 bg-white/5 rounded-xl px-3 py-2.5 border border-white/5">
        <span class="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-black">\${i+1}</span>
        <span class="text-slate-200 text-xs sm:text-sm leading-relaxed">\${esc(g)}</span>
      </li>\`).join('')}
    </ol></div>\` : '';
  let infoHtml = '';
  if (LOGGED_IN && a.required_info && a.required_info.length) {
    infoHtml = '<div id="myInfoBox"><p class="text-xs font-bold text-slate-400 mb-2">📇 আমার তথ্য (কপি প্যানেল)</p><p class="text-xs text-slate-500"><i class="fas fa-spinner fa-spin mr-1"></i>লোড হচ্ছে...</p></div>';
  } else if (!LOGGED_IN && a.required_info && a.required_info.length) {
    infoHtml = '<div class="bg-amber-500/10 border border-amber-400/20 rounded-xl p-3 text-xs text-amber-300"><i class="fas fa-lock mr-1"></i> লগইন করলে আপনার প্রোফাইলের রোল, জিপিএ, বোর্ড ও তথ্য এখানে এক-ক্লিক কপি-প্যানেলে পাবেন — <a href="/login" class="underline font-bold">লগইন করুন</a></div>';
  }
  document.getElementById('admBody').innerHTML = \`
    \${directUrl ? \`
    <div class="space-y-2">
      <a href="\${esc(directUrl)}" target="_blank" rel="noopener" class="block text-center bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3 rounded-xl text-sm transition shadow-lg">
        ⚡ সরাসরি আবেদন ফরম পেজে প্রবেশ করুন <i class="fas fa-arrow-up-right-from-square ml-1"></i>
      </a>
      <div class="flex items-center justify-between gap-2 p-2 bg-slate-950 rounded-xl border border-white/10 text-xs">
        <span class="truncate font-mono text-slate-400">\${esc(directUrl)}</span>
        <button data-link="\${esc(directUrl)}" onclick="copyDirectLink(this, this.dataset.link)" class="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded font-semibold whitespace-nowrap hover:bg-emerald-500/30 transition">
          <i class="fas fa-copy mr-1"></i>কপি লিংক
        </button>
      </div>
    </div>\` : ''}
    \${stepsHtml}
    \${infoHtml}
    <div class="bg-violet-500/10 border border-violet-400/20 rounded-xl p-3 text-xs">
      <p class="text-violet-300 font-semibold">🤝 নিজে করতে ঝামেলা মনে হলে:</p>
      <p class="text-slate-400 mt-1">এডুসবের সহায়তা সার্ভিস দিয়ে আমরা নির্ভুলভাবে আবেদন সম্পন্ন করে দেব — <a href="/assisted" class="text-violet-300 underline font-bold">সহায়তা নিন</a></p>
    </div>\`;
  document.getElementById('admModal').classList.remove('hidden');
  if (LOGGED_IN && a.required_info && a.required_info.length) loadMyInfo(id);
}

function closeAdm(){
  document.getElementById('admModal').classList.add('hidden');
}

async function loadMyInfo(id){
  try {
    const res = await fetch('/api/admissions/' + id + '/myinfo');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const r = await res.json();
    const box = document.getElementById('myInfoBox');
    if (!box) return;
    const items = r.info || [];
    box.innerHTML = \`<p class="text-xs font-bold text-slate-400 mb-2">📇 আমার সংরক্ষিত তথ্য — ক্লিক করলেই কপি:</p>
      <div class="grid grid-cols-2 gap-2">\${items.map(it => it.key === 'photo_data'
        ? \`<div class="bg-white/5 rounded-xl px-3 py-2 text-xs border border-white/5"><span class="text-slate-500">\${esc(it.label)}:</span> \${it.filled ? '<span class="text-emerald-400">✅ প্রোফাইলে আছে</span>' : '<a href="/profile" class="text-amber-400 underline">প্রোফাইলে দিন</a>'}</div>\`
        : \`<button data-val="\${esc(it.value)}" onclick="copyVal(this, this.dataset.val)" class="text-left bg-white/5 hover:bg-emerald-500/20 border border-white/5 rounded-xl px-3 py-2 text-xs transition \${it.filled ? '' : 'opacity-60'}">
          <span class="text-slate-500">\${esc(it.label)}:</span> <b class="text-slate-200">\${it.filled ? esc(it.value) : '—'}</b> \${it.filled ? '<i class="fas fa-copy text-emerald-400 ml-1"></i>' : '<a href="/profile" class="text-amber-400 underline" onclick="event.stopPropagation()">যোগ করুন</a>'}
        </button>\`).join('')}</div>
      <button onclick="copyAllInfo()" class="mt-2 w-full text-xs bg-white/10 hover:bg-white/20 py-2 rounded-xl transition font-semibold"><i class="fas fa-copy mr-1"></i> সকল তথ্য একসাথে কপি করুন</button>\`;
    window.__myInfo = items;
  } catch(e){
    const box = document.getElementById('myInfoBox');
    if (box) box.innerHTML = '<p class="text-xs text-rose-400">তথ্য লোড করা যায়নি</p>';
  }
}

async function copyVal(btn, val){
  if (!val || val === '—') return;
  try {
    await navigator.clipboard.writeText(val);
    btn.classList.add('bg-emerald-500/30');
    setTimeout(() => btn.classList.remove('bg-emerald-500/30'), 800);
  } catch(e){}
}

async function copyAllInfo(){
  if (!window.__myInfo) return;
  const lines = window.__myInfo.filter(it => it.filled && it.key !== 'photo_data').map(it => it.label + ': ' + it.value);
  try {
    await navigator.clipboard.writeText(lines.join('\\n'));
    alert('✅ সকল তথ্য ক্লিপবোর্ডে কপি হয়েছে!');
  } catch(e){}
}

async function loadAdmissions(){
  const box = document.getElementById('adm-cards');
  try {
    const res = await fetch('/api/admissions');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    ADMISSIONS = (data && data.admissions) || [];
    render();
  } catch(e){
    console.error('Admissions error:', e);
    if (box) {
      box.innerHTML = '<div class="col-span-full bg-slate-900/60 border border-white/10 rounded-2xl p-8 text-center text-rose-400 text-sm">' +
        '<i class="fas fa-circle-exclamation text-2xl mb-2 block text-rose-400"></i>' +
        '<p>আবেদন তথ্য লোড করা যায়নি।</p>' +
        '<button onclick="loadAdmissions()" class="mt-3 px-4 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs transition hover:bg-emerald-400">পুনরায় চেষ্টা করুন</button>' +
        '</div>';
    }
  }
}
loadAdmissions();
</script>
`)
}
