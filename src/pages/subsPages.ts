// এডুসব ফেজ-৭ — সাবস্ক্রিপশন পেজ + প্রশ্নপত্র ব্যাংক পেজ
import { pageShell, floatingButtons } from './layout'

const NAV = (loggedIn: boolean) => `
<header class="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
  <nav class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
    <a href="/" class="flex items-center gap-2 font-bold text-xl"><span class="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">📚</span> এডুসব</a>
    <div class="flex items-center gap-2 text-sm">
      ${loggedIn
        ? '<a href="/wallet" class="px-3 py-2 rounded-xl border border-white/20 hover:bg-white/10 transition"><i class="fas fa-wallet mr-1"></i>ওয়ালেট</a><a href="/dashboard" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 font-semibold">ড্যাশবোর্ড</a>'
        : '<a href="/login" class="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 transition">লগইন</a><a href="/signup" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 font-semibold">সাইন-আপ</a>'}
    </div>
  </nav>
</header>`

// ================= সাবস্ক্রিপশন পেজ =================
export function subscriptionPage(loggedIn: boolean): string {
  return pageShell('সাবস্ক্রিপশন', 'bg-slate-950 text-white min-h-screen', `
${NAV(loggedIn)}
<main class="max-w-6xl mx-auto px-4 py-10">
  <div class="text-center mb-10">
    <h1 class="text-3xl sm:text-4xl font-bold mb-3">👑 এডুসব সাবস্ক্রিপশন</h1>
    <p class="text-slate-400">আপনার পড়াশোনার গতি বাড়ান — পছন্দের প্ল্যান বেছে নিন</p>
    <p id="currentPlanBar" class="hidden mt-4 inline-block bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 px-4 py-2 rounded-full text-sm"></p>
  </div>
  <div id="plansGrid" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
    <div class="text-center text-slate-500 col-span-full py-10"><i class="fas fa-spinner fa-spin text-2xl"></i></div>
  </div>
  <div class="mt-10 bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-slate-300">
    <p class="font-semibold text-white mb-2"><i class="fas fa-circle-info mr-2 text-sky-400"></i>কীভাবে কাজ করে?</p>
    <ul class="space-y-1.5 list-disc list-inside">
      <li>পেমেন্ট হয় আপনার <a href="/wallet" class="text-emerald-400 underline">এডুসব ওয়ালেট</a> থেকে — আগে বিকাশ/নগদে টপ-আপ করুন</li>
      <li>মেয়াদ শেষ হলে অটোমেটিক ফ্রি প্ল্যানে ফিরে যাবেন — কোনো লুকানো চার্জ নেই</li>
      <li>আপগ্রেড করলে নতুন প্ল্যানের পুরো মেয়াদ পাবেন</li>
    </ul>
  </div>
</main>
${floatingButtons()}
<script>
function tk(n){return '৳'+Number(n).toLocaleString('bn-BD')}
function esc(s){var d=document.createElement('div');d.textContent=s==null?'':s;return d.innerHTML}
var loggedIn=${loggedIn ? 'true' : 'false'};
function loadPlans(){
  axios.get('/api/subs/plans').then(function(res){
    var d=res.data; if(!d.ok) return;
    var cur=d.current_plan;
    if(cur!=='free'){
      var bar=document.getElementById('currentPlanBar');
      bar.textContent='✅ আপনার বর্তমান প্ল্যান: '+(cur==='premium'?'প্রিমিয়াম':'স্ট্যান্ডার্ড')+(d.expires_at?' — মেয়াদ: '+d.expires_at.slice(0,10):'');
      bar.classList.remove('hidden');
    }
    var rank={free:0,standard:1,premium:2};
    document.getElementById('plansGrid').innerHTML=d.plans.map(function(p){
      var isCur=p.slug===cur;
      var popular=p.badge?'<span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 text-xs font-bold px-4 py-1 rounded-full shadow-lg">'+esc(p.badge)+'</span>':'';
      var ring=p.slug==='premium'?'border-amber-400/50 shadow-[0_0_40px_rgba(251,191,36,.15)]':p.slug==='standard'?'border-emerald-400/40':'border-white/10';
      var btn;
      if(p.slug==='free') btn='<span class="block text-center py-3 rounded-xl bg-white/10 text-slate-400 font-semibold">সবসময় ফ্রি</span>';
      else if(isCur) btn='<span class="block text-center py-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold">✅ সক্রিয় আছে</span>';
      else if(rank[cur]>rank[p.slug]) btn='<span class="block text-center py-3 rounded-xl bg-white/5 text-slate-500 font-semibold">নিম্নতর প্ল্যান</span>';
      else btn='<button onclick="subscribe(\\''+p.slug+'\\','+p.price+')" class="w-full py-3 rounded-xl bg-gradient-to-r '+(p.slug==='premium'?'from-amber-400 to-orange-500 text-slate-900':'from-emerald-500 to-teal-500 text-white')+' font-bold hover:opacity-90 transition">সাবস্ক্রাইব করুন →</button>';
      return '<div class="relative bg-white/5 border '+ring+' rounded-2xl p-6 flex flex-col">'+popular+
        '<p class="text-lg font-bold '+(p.slug==='premium'?'text-amber-300':p.slug==='standard'?'text-emerald-300':'text-slate-300')+'">'+esc(p.name_bn)+'</p>'+
        '<p class="text-slate-400 text-sm mb-4">'+esc(p.description)+'</p>'+
        '<p class="mb-5"><span class="text-4xl font-bold">'+(p.price===0?'ফ্রি':tk(p.price))+'</span>'+(p.price>0?'<span class="text-slate-400 text-sm"> / '+(p.duration_days===30?'মাস':p.duration_days+' দিন')+'</span>':'')+'</p>'+
        '<ul class="space-y-2.5 text-sm text-slate-300 flex-1 mb-6">'+p.features.map(function(f){return '<li class="flex gap-2"><i class="fas fa-check text-emerald-400 mt-0.5"></i><span>'+esc(f)+'</span></li>'}).join('')+'</ul>'+btn+'</div>';
    }).join('');
  });
}
function subscribe(slug, price){
  if(!loggedIn){location.href='/login';return}
  if(!confirm('ওয়ালেট থেকে '+tk(price)+' কেটে '+(slug==='premium'?'প্রিমিয়াম':'স্ট্যান্ডার্ড')+' প্ল্যান চালু হবে। নিশ্চিত?'))return;
  axios.post('/api/subs/subscribe',{plan:slug}).then(function(res){
    if(res.data.ok){alert('🎉 অভিনন্দন! আপনার প্ল্যান সক্রিয় হয়েছে');loadPlans()}
  }).catch(function(e){
    var d=e.response&&e.response.data;
    if(d&&d.need_topup){if(confirm(d.error+'\\n\\nএখনই টপ-আপ করবেন?'))location.href='/wallet'}
    else alert(d&&d.error||'সমস্যা হয়েছে');
  });
}
loadPlans();
</script>
`)
}

// ================= প্রশ্নপত্র ও সাজেশন পেজ (সাইটেই পড়া/প্রিন্ট ও অফিশিয়াল PDF ডাউনলোড) =================
export function qpapersPage(loggedIn: boolean, userLevel: string = ''): string {
  return pageShell('প্রশ্নপত্র ও সাজেশন ব্যাংক', 'bg-slate-950 text-white min-h-screen', `
${NAV(loggedIn)}
<main class="max-w-6xl mx-auto px-4 py-8 space-y-6">
  <!-- হিরো হেডার -->
  <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 border border-emerald-500/20 p-6 sm:p-8 shadow-xl text-center">
    <span class="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
      <i class="fas fa-certificate"></i> অফিশিয়াল বোর্ড ও মডেল টেস্ট সংগ্রহশালা
    </span>
    <h1 class="text-2xl sm:text-4xl font-extrabold text-white mb-2">📜 প্রশ্নপত্র, মডেল টেস্ট ও সাজেশন ব্যাংক</h1>
    <p class="text-slate-300 text-sm max-w-2xl mx-auto">
      নতুন কারিকুলাম, বিগত ৫-৭ বছরের সকল বোর্ড প্রশ্ন (২০১৭-২০২৪), বিসিএস ও চাকরির প্রশ্নব্যাংক — সাইটেই পড়ুন এবং এক ক্লিকে বুকস্টোর-গ্রেড অফিশিয়াল A4 PDF প্রিন্ট/ডাউনলোড করুন।
    </p>
  </div>

  <!-- ট্যাব ও ফিল্টার কন্ট্রোল -->
  <div class="bg-slate-900 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap shadow-lg">
    <div class="flex gap-2">
      <button id="tab-qp" onclick="switchKind('qp')" class="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs sm:text-sm transition shadow"><i class="fas fa-file-invoice mr-1.5"></i>প্রশ্নপত্র ও মডেল টেস্ট</button>
      <button id="tab-sg" onclick="switchKind('sg')" class="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs sm:text-sm transition"><i class="fas fa-lightbulb mr-1.5"></i>১০০% কমন সাজেশন</button>
    </div>
    <div class="flex items-center gap-2 flex-wrap flex-1 justify-end">
      <div class="relative w-full sm:w-48">
        <i class="fas fa-search absolute left-3 top-2.5 text-slate-500 text-xs"></i>
        <input type="text" id="paperSearchInput" oninput="filterPapers()" placeholder="অনুসন্ধান করুন..." class="w-full bg-slate-950 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400">
      </div>
      <div id="levelTabs" class="flex gap-1.5 overflow-x-auto text-xs">
        <button data-lv="" class="lv-tab px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold whitespace-nowrap">সব লেভেল</button>
        <button data-lv="ssc" class="lv-tab px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap">SSC</button>
        <button data-lv="hsc" class="lv-tab px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap">HSC</button>
        <button data-lv="nu" class="lv-tab px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap">NU / ডিগ্রি</button>
        <button data-lv="job" class="lv-tab px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap">বিসিএস ও চাকরি</button>
      </div>
    </div>
  </div>

  <!-- কার্ড গ্রিড -->
  <div id="papersList" class="grid sm:grid-cols-2 gap-4">
    <div class="text-center text-slate-500 col-span-full py-12"><i class="fas fa-spinner fa-spin text-3xl text-emerald-400"></i><p class="mt-2 text-xs">প্রশ্নব্যাংক লোড হচ্ছে...</p></div>
  </div>

  <div class="text-center py-4 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-500/20 rounded-2xl p-4">
    <p class="text-xs text-amber-300 font-semibold mb-2">⭐ প্রিমিয়াম সদস্যরা প্রতিদিন আনলিমিটেড প্রশ্নপত্র ও পূর্ণাঙ্গ সমাধান সরাসরি অফিশিয়াল ফরম্যাটে ডাউনলোড করতে পারেন</p>
    <a href="/subscription" class="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-xl transition shadow text-xs">
      <i class="fas fa-crown"></i> আনলিমিটেড ডাউনলোড প্যাকেজ সক্রিয় করুন
    </a>
  </div>
</main>

<!-- অফিশিয়াল এক্সাম শিট ও PDF ভিউয়ার মোডাল -->
<div id="viewerWrap" class="hidden fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4">
  <div class="absolute inset-0 bg-slate-950/85 backdrop-blur-md" onclick="closeViewer()"></div>
  <div class="relative max-w-4xl w-full bg-slate-900 border border-emerald-500/30 rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden z-10">
    <!-- হেডার বার -->
    <div class="flex items-center justify-between gap-3 px-6 py-4 border-b border-white/10 bg-slate-950/70">
      <div class="min-w-0">
        <span id="viewerBadge" class="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">OFFICIAL EXAM SHEET</span>
        <h3 id="viewerTitle" class="font-extrabold text-white text-base sm:text-lg truncate mt-1"></h3>
      </div>
      <div class="flex items-center gap-2 shrink-0 flex-wrap">
        <button onclick="zoomText(1)" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition" title="ফন্ট বড় করুন">A+</button>
        <button onclick="zoomText(-1)" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition" title="ফন্ট ছোট করুন">A-</button>
        <button onclick="copyViewerContent()" class="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition flex items-center gap-1" title="টেক্সট কপি করুন">
          <i class="fas fa-copy"></i> <span class="hidden sm:inline">কপি</span>
        </button>
        <button onclick="downloadOfficialPdf()" class="bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-slate-950 text-xs font-black px-4 py-2 rounded-xl transition shadow flex items-center gap-1.5">
          <i class="fas fa-file-pdf"></i> <span class="hidden sm:inline">A4 PDF</span> প্রিন্ট / সেভ
        </button>
        <button onclick="downloadFileDoc()" class="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1">
          <i class="fas fa-download"></i> <span class="hidden sm:inline">ফাইল</span> ডাউনলোড
        </button>
        <button onclick="closeViewer()" class="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition flex items-center justify-center">
          <i class="fas fa-xmark"></i>
        </button>
      </div>
    </div>

    <!-- মেটা ইনফো বার -->
    <div class="px-6 py-2.5 border-b border-white/10 bg-slate-950/40 text-xs text-slate-400 flex items-center justify-between gap-2 flex-wrap">
      <p id="viewerMeta"></p>
      <span class="text-emerald-400 font-semibold flex items-center gap-1"><i class="fas fa-shield-halved"></i> ১০০% নির্ভুল ও পরীক্ষিত</span>
    </div>

    <!-- কন্টেন্ট বডি (এক্সাম শিট স্টাইলিং) -->
    <div class="p-6 overflow-y-auto text-slate-200 text-sm leading-relaxed space-y-4">
      <div id="examPaperDoc" class="bg-white text-slate-900 p-6 sm:p-10 rounded-2xl shadow-inner border border-slate-200 select-text font-sans">
        <!-- পরীক্ষার অফিশিয়াল হেডার -->
        <div class="text-center border-b-2 border-slate-900 pb-4 mb-6">
          <p class="text-xs font-bold text-slate-600 tracking-wider">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত কারিকুলাম ও এডুসব পরীক্ষা হাব</p>
          <h2 id="docExamTitle" class="text-xl sm:text-2xl font-black text-slate-950 mt-1"></h2>
          <div id="docExamSubHeader" class="flex items-center justify-center gap-4 text-xs font-bold text-slate-700 mt-2 flex-wrap"></div>
          <div class="mt-3 flex items-center justify-between text-xs font-bold border-t border-slate-300 pt-2 px-2">
            <span id="docTimeMarks" class="text-slate-800">সময়: ৩ ঘণ্টা | পূর্ণমান: ১০০</span>
            <span class="text-slate-500 font-mono">EDUSOB-EXAM-VERIFIED</span>
          </div>
        </div>

        <!-- মূল প্রশ্নপত্র টেক্সট -->
        <div id="viewerBody" class="whitespace-pre-line text-slate-900 font-sans text-sm sm:text-base leading-relaxed"></div>

        <!-- ফুটার ও ওয়াটারমার্ক -->
        <div class="mt-8 pt-4 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-500">
          <span>এডুসব ডিজিটাল শিক্ষা পোর্টাল — edusob.com</span>
          <span>© কপিরাইট ও মেধা স্বত্ব সংরক্ষিত</span>
        </div>
      </div>
    </div>
  </div>
</div>
${floatingButtons()}
<script>
function esc(s){var d=document.createElement('div');d.textContent=s==null?'':s;return d.innerHTML}
function toBn(n){var d={'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};return String(n).replace(/[0-9]/g,function(x){return d[x]})}

var LV={ssc:'SSC',hsc:'HSC',nu:'NU / ডিগ্রি',job:'চাকরি ও বিসিএস'};
var ACCESS={free:['ফ্রি অ্যাকসেস','bg-emerald-500/15 text-emerald-300 border-emerald-400/30'],standard:['স্ট্যান্ডার্ড','bg-sky-500/15 text-sky-300 border-sky-400/30'],premium:['প্রিমিয়াম','bg-amber-500/15 text-amber-300 border-amber-400/30']};
var KIND='qp', CUR_LV='';
var rawLoadedItems = [];
var currentFontSize = 14;

function zoomText(delta){
  currentFontSize = Math.max(12, Math.min(22, currentFontSize + delta * 2));
  var vb = document.getElementById('viewerBody');
  if(vb) vb.style.fontSize = currentFontSize + 'px';
}

function copyViewerContent(){
  if(!CUR_ITEM) return;
  var text = (CUR_ITEM.title || '') + '\n\n' + (CUR_ITEM.content || '');
  navigator.clipboard.writeText(text).then(function(){
    alert('প্রশ্নপত্র সফলভাবে কপি হয়েছে!');
  }).catch(function(){
    alert('কপি করা সম্ভব হয়নি।');
  });
}

function switchKind(k){
  KIND=k;
  document.getElementById('tab-qp').className='px-5 py-2.5 rounded-xl '+(k==='qp'?'bg-emerald-500 text-slate-950 font-extrabold':'bg-white/10 hover:bg-white/20 text-slate-200 font-bold')+' text-xs sm:text-sm transition shadow';
  document.getElementById('tab-sg').className='px-5 py-2.5 rounded-xl '+(k==='sg'?'bg-emerald-500 text-slate-950 font-extrabold':'bg-white/10 hover:bg-white/20 text-slate-200 font-bold')+' text-xs sm:text-sm transition shadow';
  load(CUR_LV);
}

function card(p, icon){
  var a=ACCESS[p.access]||ACCESS.free;
  var btn=p.unlocked
    ?'<button onclick="openItem('+p.id+')" class="shrink-0 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-slate-950 text-xs font-black px-4 py-2 rounded-xl transition shadow flex items-center gap-1.5"><i class="fas fa-file-lines"></i> পড়ুন ও PDF</button>'
    :'<a href="/subscription" class="shrink-0 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1"><i class="fas fa-lock text-[10px]"></i> আনলক</a>';

  return '<div class="bg-slate-900 border border-white/10 hover:border-emerald-500/40 rounded-2xl p-5 flex items-start gap-4 transition shadow-md group">'+
    '<div class="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition">'+icon+'</div>'+
    '<div class="flex-1 min-w-0">'+
      '<p class="font-bold text-white text-sm sm:text-base leading-snug group-hover:text-emerald-300 transition">'+esc(p.title)+'</p>'+
      '<p class="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">'+
        '<span class="text-emerald-400 font-semibold">'+(LV[p.level]||p.level)+'</span>'+
        (p.subject?'<span>• '+esc(p.subject)+'</span>':'')+
        (p.board?'<span>• '+esc(p.board)+'</span>':'')+
        (p.year?'<span>• '+esc(p.year)+'</span>':'')+
      '</p>'+
      (p.description?'<p class="text-xs text-slate-500 mt-1 line-clamp-2">'+esc(p.description)+'</p>':'')+
      '<div class="flex items-center gap-2 mt-3">'+
        '<span class="text-[10px] border px-2 py-0.5 rounded-full font-semibold '+a[1]+'">'+a[0]+'</span>'+
        '<span class="text-[11px] text-slate-500 flex items-center gap-1"><i class="fas fa-download text-[10px]"></i> '+toBn(p.downloads||0)+' ডাউনলোড</span>'+
      '</div>'+
    '</div>'+
    btn+
  '</div>';
}

function renderCards(list){
  var el=document.getElementById('papersList');
  if(!list.length){
    el.innerHTML='<p class="col-span-full text-center text-slate-500 py-10"><i class="fas fa-folder-open text-2xl mb-2 block"></i>কোনো '+ (KIND==='qp'?'প্রশ্নপত্র':'সাজেশন') +' পাওয়া যায়নি</p>';
    return;
  }
  var icon = KIND==='qp'?'📄':'💡';
  el.innerHTML=list.map(function(p){return card(p, icon)}).join('');
}

function filterPapers(){
  var q = (document.getElementById('paperSearchInput').value || '').trim().toLowerCase();
  if(!q){
    renderCards(rawLoadedItems);
    return;
  }
  var filtered = rawLoadedItems.filter(function(p){
    return (p.title||'').toLowerCase().includes(q) ||
           (p.subject||'').toLowerCase().includes(q) ||
           (p.board||'').toLowerCase().includes(q) ||
           (p.year||'').toLowerCase().includes(q) ||
           (p.description||'').toLowerCase().includes(q);
  });
  renderCards(filtered);
}

function load(level){
  CUR_LV=level;
  var el=document.getElementById('papersList');
  el.innerHTML='<div class="text-center text-slate-500 col-span-full py-12"><i class="fas fa-spinner fa-spin text-2xl text-emerald-400"></i><p class="mt-2 text-xs">লোড হচ্ছে...</p></div>';
  var endpoint = KIND==='qp' ? ('/api/subs/qpapers'+(level?'?level='+level:'')) : ('/api/subs/suggestions'+(level?'?level='+level:''));

  axios.get(endpoint).then(function(res){
    var d=res.data;
    if(!d || !d.ok) {
      el.innerHTML='<p class="col-span-full text-center text-rose-400 py-10">ডাটা লোড করতে সমস্যা হয়েছে। <button onclick="load(\\''+level+'\\')" class="underline ml-2">পুনরায় চেষ্টা করুন</button></p>';
      return;
    }
    rawLoadedItems = (KIND==='qp' ? d.papers : d.suggestions) || [];
    renderCards(rawLoadedItems);
  }).catch(function(err){
    el.innerHTML='<p class="col-span-full text-center text-rose-400 py-10">সার্ভার সংযোগ সমস্যা। <button onclick="load(\\''+level+'\\')" class="underline ml-2">পুনরায় চেষ্টা করুন</button></p>';
  });
}

// ---------- ভিউয়ার ও অফিশিয়াল PDF এক্সপোর্ট ইঞ্জিন ----------
var CUR_ITEM=null;
function openItem(id){
  var url=KIND==='qp'?'/api/subs/qpapers/'+id+'/content':'/api/subs/suggestions/'+id+'/content';
  axios.get(url).then(function(res){
    var d=res.data; if(!d.ok){alert(d.error||'সমস্যা হয়েছে');return}
    CUR_ITEM=d;
    document.getElementById('viewerTitle').textContent=d.title;
    document.getElementById('docExamTitle').textContent=d.title;

    var metaText = [LV[d.level]||d.level, d.subject, d.board?d.board+' বোর্ড':'', d.year ? 'সাল: '+d.year : ''].filter(Boolean).join(' • ');
    document.getElementById('viewerMeta').textContent = metaText + ' • এডুসব ভেরিফাইড কোড: EDS-'+d.id;

    document.getElementById('docExamSubHeader').innerHTML =
      '<span>স্তর: '+(LV[d.level]||d.level)+'</span>' +
      (d.subject?'<span>বিষয়: '+esc(d.subject)+'</span>':'') +
      (d.board?'<span>বোর্ড: '+esc(d.board)+'</span>':'') +
      (d.year?'<span>পরীক্ষার সাল: '+esc(d.year)+'</span>':'');

    document.getElementById('viewerBody').textContent=d.content;
    document.getElementById('viewerWrap').classList.remove('hidden');
    document.body.style.overflow='hidden';
  }).catch(function(e){
    var st=e.response&&e.response.status, d=e.response&&e.response.data;
    if(st===401){if(confirm('এই কন্টেন্ট পড়তে বা ডাউনলোড করতে ফ্রি লগইন করুন।\\n\\nলগইন পেজে যাবেন?'))location.href='/login'}
    else if(d&&d.need_plan){if(confirm((d.error||'')+'\\n\\nসাবস্ক্রিপশন পেজে যাবেন?'))location.href='/subscription'}
    else alert(d&&d.error||'সমস্যা হয়েছে');
  });
}

function closeViewer(){
  document.getElementById('viewerWrap').classList.add('hidden');
  document.body.style.overflow='';
}

document.addEventListener('keydown',function(e){if(e.key==='Escape')closeViewer()});

// বুকস্টোর-গ্রেড অফিশিয়াল A4 PDF প্রিন্ট ও এক্সপোর্ট ইঞ্জিন
function getOfficialHtml(item){
  return '<!DOCTYPE html>' +
  '<html lang="bn">' +
  '<head>' +
  '<meta charset="UTF-8">' +
  '<title>' + esc(item.title) + ' - EDUSOB OFFICIAL EXAM PAPER</title>' +
  '<link rel="preconnect" href="https://fonts.googleapis.com">' +
  '<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap" rel="stylesheet">' +
  '<style>' +
    '@page { size: A4 portrait; margin: 15mm 15mm 15mm 15mm; }' +
    'body { font-family: "Hind Siliguri", "Segoe UI", Arial, sans-serif; color: #0f172a; margin: 0; padding: 0; line-height: 1.6; font-size: 13.5px; }' +
    '.exam-container { max-width: 100%; margin: 0 auto; position: relative; }' +
    '.exam-header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 16px; }' +
    '.exam-header h1 { font-size: 20px; font-weight: 700; margin: 4px 0; color: #000; }' +
    '.exam-header .sub { font-size: 11.5px; color: #475569; font-weight: 600; }' +
    '.exam-info-grid { display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; border-top: 1px dashed #94a3b8; padding-top: 6px; margin-top: 6px; }' +
    '.exam-body { white-space: pre-wrap; font-size: 13px; line-height: 1.65; color: #1e293b; margin-top: 14px; }' +
    '.watermark { position: fixed; top: 45%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 60px; color: rgba(15, 23, 42, 0.04); font-weight: 900; pointer-events: none; text-align: center; width: 100%; }' +
    '.exam-footer { margin-top: 25px; border-top: 1px solid #cbd5e1; padding-top: 8px; display: flex; justify-content: space-between; font-size: 10.5px; color: #64748b; }' +
    '@media print { .no-print { display: none; } body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }' +
  '</style>' +
  '</head>' +
  '<body>' +
    '<div class="watermark">EDUSOB OFFICIAL • EDUSOB.COM</div>' +
    '<div class="exam-container">' +
      '<div class="exam-header">' +
        '<div class="sub">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত পাঠ্যক্রম ও এডুসব প্রশ্নব্যাংক</div>' +
        '<h1>' + esc(item.title) + '</h1>' +
        '<div class="sub" style="margin-top:2px;">' +
          'স্তর: ' + esc(LV[item.level]||item.level) +
          (item.subject ? ' | বিষয়: ' + esc(item.subject) : '') +
          (item.board ? ' | বোর্ড: ' + esc(item.board) : '') +
          (item.year ? ' | সাল: ' + esc(item.year) : '') +
        '</div>' +
        '<div class="exam-info-grid">' +
          '<span>পূর্ণমান: ১০০ | সময়: ৩ ঘণ্টা (অথবা নির্ধারিত মানবণ্টন)</span>' +
          '<span>ডকুমেন্ট আইডি: EDS-' + item.id + '-VERIFIED</span>' +
        '</div>' +
      '</div>' +
      '<div class="exam-body">' + esc(item.content) + '</div>' +
      '<div class="exam-footer">' +
        '<span>এডুসব ডিজিটাল এডুকেশন পোর্টাল (edusob.com)</span>' +
        '<span>পৃষ্ঠা ১ • সর্বস্বত্ব সংরক্ষিত</span>' +
      '</div>' +
    '</div>' +
  '</body>' +
  '</html>';
}

function downloadOfficialPdf(){
  if(!CUR_ITEM) return;
  var htmlContent = getOfficialHtml(CUR_ITEM);

  // Use hidden iframe method (safe in all browsers & iframes)
  var iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  var doc = iframe.contentWindow.document;
  doc.open();
  doc.write(htmlContent);
  doc.close();

  setTimeout(function(){
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch(e) {
      // Fallback to direct file download
      downloadFileDoc();
    }
    setTimeout(function(){ iframe.remove(); }, 15000);
  }, 400);
}

function downloadFileDoc(){
  if(!CUR_ITEM) return;
  var content = "====================================================\n" +
    CUR_ITEM.title + "\n" +
    "স্তর: " + (LV[CUR_ITEM.level]||CUR_ITEM.level) + " | বিষয়: " + (CUR_ITEM.subject||'') + " | সাল: " + (CUR_ITEM.year||'') + "\n" +
    "এডুসব ভেরিফাইড কোড: EDS-" + CUR_ITEM.id + " | edusob.com\n" +
    "====================================================\n\n" +
    CUR_ITEM.content + "\n\n" +
    "----------------------------------------------------\n" +
    "© এডুসব ডিজিটাল এডুকেশন পোর্টাল — edusob.com\n";

  var blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (CUR_ITEM.title || 'edusob-question').replace(/[^a-zA-Z0-9\u0980-\u09FF_-]/g, '_') + '.txt';
  document.body.appendChild(a);
  a.click();
  setTimeout(function(){ a.remove(); }, 1000);
}

function printContent(){
  downloadOfficialPdf();
}

document.querySelectorAll('.lv-tab').forEach(function(b){
  b.onclick=function(){
    document.querySelectorAll('.lv-tab').forEach(function(x){x.className='lv-tab px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap'});
    b.className='lv-tab px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold whitespace-nowrap';
    load(b.dataset.lv);
  };
});

var USER_LEVEL='${userLevel}';
var SMART={ssc:'ssc',hsc:'hsc',nu:'nu',masters:'nu'};
var defLv=SMART[USER_LEVEL]||'';
if(defLv){var db=document.querySelector('.lv-tab[data-lv="'+defLv+'"]');if(db){db.click()}else{load('')}}
else load('');
</script>
`)
}
