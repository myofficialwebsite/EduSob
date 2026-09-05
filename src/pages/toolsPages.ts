// এডুসব ফেজ-৩ — স্টুডেন্ট টুলস পেজ: MCQ, প্ল্যানার+নোট, CGPA, সিলেবাস
import { pageShell, siteHeader } from './layout'

function toolsHeader(active: string, loggedIn: boolean): string {
  return siteHeader({ activeKey: active, loggedIn, theme: 'dark' })
}

const helpersJs = `
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function toBn(n){var d={'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};return String(n).replace(/[0-9]/g,function(x){return d[x]})}
`

// ============ MCQ পেজ ============
export function mcqPage(loggedIn: boolean, userLevel: string = ''): string {
  const content = `
${siteHeader({ activeKey: 'mcq', loggedIn, theme: 'dark' })}
<main class="max-w-7xl mx-auto px-4 py-8">
  <!-- ১. স্পষ্ট ভিজ্যুয়াল হায়ারার্কি ও নির্দেশিকা -->
  <header class="mb-6 pb-4 border-b border-white/10">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">স্মার্ট মডেল টেস্ট</span>
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">স্পেসড রিভিশন ১→৩→৭ দিন</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black flex items-center gap-2.5 text-white">
          <span class="text-emerald-400"><i class="fas fa-list-check mr-1.5"></i>MCQ প্র্যাকটিস ও রিভিশন হাব</span>
        </h1>
        <p class="text-slate-300 text-xs sm:text-sm mt-1">বিষয়ভিত্তিক প্রশ্নব্যাংক — পরীক্ষা দিন, ভুল প্রশ্ন স্বয়ংক্রিয়ভাবে ভুল-ব্যাংকে সেভ হবে ও সময়মতো মনে করিয়ে দেবে</p>
      </div>
    </div>

    <!-- ৩-ধাপের স্পষ্ট গাইডলাইন রিবন (প্রথম নজরে কী করতে হবে) -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
      <div class="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/30">
        <span class="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">১</span>
        <div>
          <p class="text-xs font-bold text-white">লেভেল ও বিষয় নির্বাচন</p>
          <p class="text-[11px] text-slate-300">SSC, HSC বা সরকারি চাকরি</p>
        </div>
      </div>
      <div class="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-cyan-500/30">
        <span class="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-xs">২</span>
        <div>
          <p class="text-xs font-bold text-white">১০টি প্রশ্নের দ্রুত উত্তর</p>
          <p class="text-[11px] text-slate-300">সঠিক বিকল্পে ক্লিক করুন</p>
        </div>
      </div>
      <div class="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-purple-500/30">
        <span class="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center shrink-0 text-xs">৩</span>
        <div>
          <p class="text-xs font-bold text-white">ফলাফল ও ভুল প্রশ্ন রিভিশন</p>
          <p class="text-[11px] text-slate-300">ভুল প্রশ্ন ভুল-ব্যাংকে সেভ</p>
        </div>
      </div>
    </div>
  </header>

  ${loggedIn ? '' : `
  <section class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 mb-6 text-center max-w-2xl mx-auto">
    <p class="text-amber-300 font-semibold text-sm">🔒 MCQ পরীক্ষা দিতে ফ্রি সাইন-আপ করুন — স্কোর ও ভুল প্রশ্ন অটো-সেভ হবে!</p>
    <a href="/signup" class="inline-block mt-3 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold transition text-xs">ফ্রি সাইন-আপ</a>
  </section>`}

  <!-- ২. ফ্ল্যাট এডিটোরিয়াল ২-কলাম লেআউট: বামে টেস্ট/সেটআপ, ডানে ভুল-ব্যাংক ও লিডারবোর্ড -->
  <div class="grid lg:grid-cols-12 gap-6 items-start">
    <!-- বাম পাশ: পরীক্ষা স্টেজ -->
    <div class="lg:col-span-8 space-y-6">
      <!-- সেটআপ প্যানেল -->
      <section id="quiz-setup" class="bg-slate-900 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <h2 class="font-bold text-base text-white flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> পরীক্ষা সেটআপ
          </h2>
          <span class="text-xs text-slate-300 font-medium">১০টি প্রশ্ন · তাৎক্ষণিক ফলাফল</span>
        </div>

        <div class="space-y-4">
          <div>
            <label class="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">১. শিক্ষাস্তর বেছে নিন</label>
            <div class="flex flex-wrap gap-2" id="level-btns">
              <button data-level="ssc" class="lvl-btn px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs transition shadow-sm">SSC ও সমমান</button>
              <button data-level="hsc" class="lvl-btn px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition">HSC ও সমমান</button>
              <button data-level="nu" class="lvl-btn px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition">অনার্স / ডিগ্রি (NU)</button>
              <button data-level="job" class="lvl-btn px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition">বিসিএস ও চাকরি প্রস্তুতি</button>
            </div>
          </div>

          <div>
            <label class="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">২. বিষয় বেছে নিন</label>
            <div id="subject-btns" class="flex flex-wrap gap-2 text-xs min-h-[38px] items-center">
              <span class="text-slate-400 text-xs flex items-center gap-1.5"><i class="fas fa-spinner fa-spin text-emerald-400"></i> বিষয় লোড হচ্ছে...</span>
            </div>
          </div>

          <div class="pt-3 border-t border-white/10">
            <button id="start-btn" class="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl font-black transition shadow-lg text-sm flex items-center justify-center gap-2">
              <span>🚀 পরীক্ষা শুরু করুন (১০ প্রশ্ন)</span>
            </button>
          </div>
        </div>
      </section>

      <!-- পরীক্ষা ক্ষেত্র -->
      <section id="quiz-area" class="hidden bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5"></section>

      <!-- ফলাফল বিশ্লেষণ -->
      <section id="quiz-result" class="hidden space-y-4"></section>
    </div>

    <!-- ডান পাশ: ভুল-ব্যাংক, সাম্প্রতিক টেস্ট ও লিডারবোর্ড -->
    <div class="lg:col-span-4 space-y-5">
      ${loggedIn ? `
      <!-- ভুল-ব্যাংক -->
      <section class="bg-slate-900 border border-rose-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
          <h2 class="font-bold text-sm text-white flex items-center gap-1.5">
            <i class="fas fa-rotate-left text-rose-400"></i> ভুল প্রশ্ন ব্যাংক
          </h2>
          <span id="wb-stats" class="text-[11px] text-rose-300 font-bold px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20"></span>
        </div>
        <p class="text-[11px] text-slate-300 mb-3">যেসব প্রশ্নে ভুল হয়েছিল, সেগুলো স্পেসড রিভিশনের মাধ্যমে আয়ত্তে আনুন।</p>
        <div id="wrong-bank-list" class="space-y-2.5 text-xs max-h-72 overflow-y-auto pr-1"><p class="text-slate-400">লোড হচ্ছে…</p></div>
      </section>

      <!-- ইতিহাস -->
      <section class="bg-slate-900 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
          <h2 class="font-bold text-sm text-white flex items-center gap-1.5">
            <i class="fas fa-clock-rotate-left text-sky-400"></i> আমার সাম্প্রতিক পরীক্ষা
          </h2>
        </div>
        <div id="history-list" class="text-xs text-slate-300 max-h-56 overflow-y-auto pr-1">লোড হচ্ছে…</div>
      </section>` : ''}

      <!-- লিডারবোর্ড -->
      <section class="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
          <h2 class="font-bold text-sm text-white flex items-center gap-1.5">
            <i class="fas fa-trophy text-amber-400"></i> শীর্ষ স্কোরার (লিডারবোর্ড)
          </h2>
        </div>
        <div id="leaderboard" class="text-xs text-slate-300 max-h-64 overflow-y-auto pr-1">লোড হচ্ছে…</div>
      </section>
    </div>
  </div>
</main>

<script>
${helpersJs}
var LOGGED_IN = ${loggedIn ? 'true' : 'false'};
// স্মার্ট ডিফল্ট: ইউজারের শিক্ষাস্তর অনুযায়ী লেভেল (ট্যাব থেকে যেকোনো সময় বদলানো যায়)
var USER_LEVEL = '${userLevel}';
var SMART_LV = {ssc:'ssc', hsc:'hsc', nu:'nu', job:'job', masters:'job'};
var curLevel = SMART_LV[USER_LEVEL] || 'ssc', curSubject = '', quizQs = [], answers = {};

function updateLevelButtons(){
  document.querySelectorAll('.lvl-btn').forEach(function(x){
    if(x.dataset.level === curLevel){
      x.className = 'lvl-btn px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs transition shadow-sm';
    } else {
      x.className = 'lvl-btn px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition';
    }
  });
}
updateLevelButtons();
loadSubjects();

function loadSubjects(){
  var box = document.getElementById('subject-btns');
  box.innerHTML = '<span class="text-slate-400 text-xs flex items-center gap-1.5"><i class="fas fa-spinner fa-spin text-emerald-400"></i> বিষয় লোড হচ্ছে...</span>';
  fetch('/api/tools/mcq/subjects?level='+curLevel)
    .then(function(r){
      if(!r.ok) throw new Error('সার্ভার সাড়া দেয়নি');
      return r.json();
    })
    .then(function(d){
      var subs = (d && d.subjects) || [];
      curSubject = '';
      if(!subs.length){
        box.innerHTML = '<button data-sub="" class="sub-btn px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs">সব বিষয়</button> <span class="text-slate-400 text-xs ml-2">এই স্তরের সব প্রশ্ন একত্রে প্র্যাকটিস করতে পারবেন</span>';
        return;
      }
      box.innerHTML = '<button data-sub="" class="sub-btn px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs">সব বিষয়</button>' +
        subs.map(function(s){
          return '<button data-sub="'+esc(s.subject)+'" class="sub-btn px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition">'+esc(s.subject)+' ('+toBn(s.cnt)+')</button>';
        }).join('');
      box.querySelectorAll('.sub-btn').forEach(function(b){
        b.onclick = function(){
          curSubject = b.dataset.sub;
          box.querySelectorAll('.sub-btn').forEach(function(x){
            x.className = 'sub-btn px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition';
          });
          b.className = 'sub-btn px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs';
        };
      });
    })
    .catch(function(err){
      box.innerHTML = '<span class="text-rose-400 text-xs">বিষয় লোড করা যায়নি। <button onclick="loadSubjects()" class="underline text-emerald-400 ml-1 font-bold">পুনরায় চেষ্টা করুন</button></span>';
    });
}
document.querySelectorAll('.lvl-btn').forEach(function(b){
  b.onclick = function(){
    curLevel = b.dataset.level;
    updateLevelButtons();
    loadSubjects();
  };
});

document.getElementById('start-btn').onclick = function(){
  var btn = document.getElementById('start-btn');
  btn.disabled = true;
  var origHtml = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> প্রশ্ন প্রস্তুত হচ্ছে...';
  fetch('/api/tools/mcq/quiz?level='+curLevel+'&subject='+encodeURIComponent(curSubject)+'&count=10')
    .then(function(r){
      if(!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function(d){
      quizQs = (d && d.questions) || [];
      answers = {};
      if(!quizQs.length){
        btn.disabled = false;
        btn.innerHTML = origHtml;
        alert('এই বিষয়ে বর্তমানে কোনো প্রশ্ন অন্তর্ভুক্ত নেই। অনুগ্রহ করে অন্য বিষয় বেছে নিন।');
        return;
      }
      document.getElementById('quiz-setup').classList.add('hidden');
      document.getElementById('quiz-result').classList.add('hidden');
      renderQuiz();
    })
    .catch(function(err){
      btn.disabled = false;
      btn.innerHTML = origHtml;
      alert('পরীক্ষা শুরু করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    });
};

function renderQuiz(){
  var area = document.getElementById('quiz-area');
  area.classList.remove('hidden');
  area.innerHTML = '<div class="flex items-center justify-between pb-3 mb-4 border-b border-white/10">' +
    '<h2 class="font-bold text-white text-base flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>প্রশ্ন: '+toBn(quizQs.length)+'টি</h2>' +
    '<span id="answered-count" class="text-xs font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">উত্তর: ০/'+toBn(quizQs.length)+'</span>' +
    '</div>' +
    quizQs.map(function(q,i){
      var opts = ['a','b','c','d'].map(function(o){
        return '<label class="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-white/15 hover:border-emerald-500/50 cursor-pointer transition min-h-[44px]">' +
          '<input type="radio" name="q'+q.id+'" value="'+o+'" class="mt-0.5 accent-emerald-500 w-4 h-4 shrink-0" onchange="pick('+q.id+',\\''+o+'\\')">' +
          '<span class="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">'+esc(q['option_'+o])+'</span>' +
          '</label>';
      }).join('');
      return '<article class="mb-5 pb-5 border-b border-white/10 last:border-0">' +
        '<p class="font-bold text-white text-sm sm:text-base mb-3 leading-relaxed">'+toBn(i+1)+'. '+esc(q.question)+' <span class="text-xs text-emerald-400 font-normal">['+esc(q.subject)+(q.chapter?' · '+esc(q.chapter):'')+']</span></p>' +
        '<div class="grid sm:grid-cols-2 gap-2.5">'+opts+'</div>' +
        '</article>';
    }).join('') +
    '<div class="pt-3 border-t border-white/10">' +
    '<button id="quiz-submit-btn" onclick="submitQuiz()" class="w-full px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 rounded-xl font-black hover:opacity-95 transition shadow-xl text-sm flex items-center justify-center gap-2">' +
    '<span>✅ উত্তর জমা দিন ও ফলাফল দেখুন</span>' +
    '</button></div>';
  window.scrollTo({top: area.offsetTop - 80, behavior: 'smooth'});
}
window.pick = function(id, o){answers[id]=o; document.getElementById('answered-count').textContent='উত্তর: '+toBn(Object.keys(answers).length)+'/'+toBn(quizQs.length)};

window.submitQuiz = function(){
  var subBtn = document.getElementById('quiz-submit-btn');
  if(subBtn) { subBtn.disabled = true; subBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> ফলাফল তৈরি হচ্ছে...'; }
  var arr = quizQs.map(function(q){return {id:q.id, answer:answers[q.id]||''}});
  fetch('/api/tools/mcq/submit',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({answers:arr, subject:curSubject})
  })
  .then(function(r){ return r.json(); })
  .then(function(d){
    if(!d.ok){
      if(subBtn) { subBtn.disabled = false; subBtn.innerHTML = '<span>✅ উত্তর জমা দিন ও ফলাফল দেখুন</span>'; }
      alert(d.error||'ফলাফল প্রকাশে সমস্যা হয়েছে');
      return;
    }
    document.getElementById('quiz-area').classList.add('hidden');
    var res = document.getElementById('quiz-result');
    res.classList.remove('hidden');
    var color = d.pct>=80?'emerald':d.pct>=50?'amber':'rose';
    var qmap = {}; quizQs.forEach(function(q){qmap[q.id]=q});
    
    var guestBanner = d.guest ? 
      '<div class="bg-amber-500/10 border border-amber-400/20 rounded-xl p-3 text-xs text-amber-300 mt-3 flex items-center justify-between flex-wrap gap-2">' +
      '<span>🌟 আপনার স্কোর সেভ রাখতে ও লিডারবোর্ডে নাম দেখতে ফ্রি অ্যাকাউন্ট খুলুন!</span>' +
      '<a href="/signup" class="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 transition">অ্যাকাউন্ট খুলুন →</a>' +
      '</div>' : '';

    res.innerHTML = '<div class="bg-slate-900 border border-'+color+'-500/40 rounded-2xl p-6 text-center shadow-xl mb-4">'+
      '<p class="text-4xl font-black text-'+color+'-400">'+toBn(d.pct)+'%</p>'+
      '<p class="mt-2 text-slate-100 font-semibold text-base">সঠিক: '+toBn(d.correct)+'/'+toBn(d.total)+(d.guest ? '' : (d.total-d.correct>0?' — ভুল '+toBn(d.total-d.correct)+'টি ভুল-ব্যাংকে সেভ হলো':' — অসাধারণ! সম্পূর্ণ সঠিক 🎉'))+'</p>'+
      guestBanner +
      '<button onclick="location.reload()" class="mt-4 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow">🔄 নতুন পরীক্ষা দিন</button></div>'+
      '<div class="bg-slate-900 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">'+
      '<h3 class="font-bold text-white text-sm pb-2 border-b border-white/10">পূর্ণাঙ্গ উত্তরমালা ও ব্যাখ্যা</h3>'+
      d.results.map(function(r,i){
        var q = qmap[r.id]||{};
        return '<div class="pb-3 border-b border-white/5 last:border-0"><p class="font-bold text-slate-100 text-sm">'+toBn(i+1)+'. '+esc(q.question||'')+'</p>'+
        '<p class="mt-1.5 text-xs">'+(r.isCorrect?'<span class="text-emerald-400 font-bold">✔ সঠিক উত্তর</span>':'<span class="text-rose-400 font-bold">✘ ভুল উত্তর</span> — সঠিক বিকল্প: <b class="text-emerald-300 font-bold">'+esc(q['option_'+r.correct]||r.correct)+'</b>')+'</p>'+
        (r.explanation?'<div class="text-xs text-slate-300 mt-1.5 bg-slate-800/80 p-2.5 rounded-lg border border-white/5">💡 '+esc(r.explanation)+'</div>':'')+'</div>';
      }).join('')+'</div>';
    if(LOGGED_IN){loadWrongBank();loadHistory();}
    loadLeaderboard();
    window.scrollTo({top:0, behavior:'smooth'});
  })
  .catch(function(err){
    if(subBtn) { subBtn.disabled = false; subBtn.innerHTML = '<span>✅ উত্তর জমা দিন ও ফলাফল দেখুন</span>'; }
    alert('সার্ভার রেসপন্স দেয়নি। আবার চেষ্টা করুন।');
  });
};

function loadWrongBank(){
  fetch('/api/tools/wrong-bank').then(r=>r.json()).then(function(d){
    var el = document.getElementById('wrong-bank-list'); if(!el) return;
    document.getElementById('wb-stats').textContent = 'মোট: '+toBn(d.total)+' · আয়ত্তে: '+toBn(d.mastered);
    var due = d.due||[];
    if(!due.length){el.innerHTML='<p class="text-emerald-400 font-semibold p-2">🎉 আজ কোনো রিভিশন বাকি নেই!</p>';return}
    el.innerHTML = due.map(function(q){
      return '<details class="bg-slate-800/80 border border-white/10 rounded-xl p-3"><summary class="cursor-pointer font-semibold text-slate-100">'+esc(q.question)+' <span class="text-[10px] text-rose-400 font-bold">(ভুল '+toBn(q.wrong_count)+' বার)</span></summary>'+
      '<p class="mt-2 text-emerald-300 font-bold">✔ সঠিক: '+esc(q['option_'+q.correct])+'</p>'+(q.explanation?'<p class="text-xs text-slate-300 mt-1.5 bg-slate-900/60 p-2 rounded">💡 '+esc(q.explanation)+'</p>':'')+'</details>';
    }).join('');
  });
}
function loadHistory(){
  fetch('/api/tools/mcq/history').then(r=>r.json()).then(function(d){
    var el = document.getElementById('history-list'); if(!el) return;
    var a = d.attempts||[];
    if(!a.length){el.innerHTML='<p class="text-slate-400">এখনো কোনো পরীক্ষা দেননি।</p>';return}
    el.innerHTML = '<div class="space-y-2">'+a.map(function(t){
      var c = t.score_pct>=80?'text-emerald-400':t.score_pct>=50?'text-amber-400':'text-rose-400';
      return '<div class="flex justify-between items-center bg-slate-800/80 border border-white/5 rounded-xl px-3 py-2.5"><span><strong class="text-white font-semibold">'+esc(t.subject||t.level.toUpperCase())+'</strong> <span class="text-[10px] text-slate-400 ml-1">'+esc((t.taken_at||'').slice(0,10))+'</span></span><span class="font-bold '+c+'">'+toBn(t.correct_count)+'/'+toBn(t.total)+' ('+toBn(t.score_pct)+'%)</span></div>';
    }).join('')+'</div>';
  });
}
function loadLeaderboard(){
  fetch('/api/tools/leaderboard').then(r=>r.json()).then(function(d){
    var el = document.getElementById('leaderboard');
    var b = d.board||[];
    if(!b.length){el.innerHTML='<p class="text-slate-400">এখনো কেউ পরীক্ষা দেয়নি — প্রথম হোন! 🏆</p>';return}
    var medals=['🥇','🥈','🥉'];
    el.innerHTML = b.map(function(u,i){
      return '<div class="flex justify-between items-center bg-slate-800/80 border border-white/5 rounded-xl px-3 py-2 mb-2"><span class="text-slate-200">'+(medals[i]||toBn(i+1)+'.')+' <b class="text-white font-bold">'+esc(u.name_bn)+'</b> <span class="text-[10px] text-slate-400">('+esc(u.user_code)+')</span></span><span class="font-bold text-amber-300">'+toBn(u.avg_pct)+'% <span class="text-[10px] text-slate-400">('+toBn(u.quizzes)+')</span></span></div>';
    }).join('');
  });
}
loadSubjects(); loadLeaderboard();
if(LOGGED_IN){loadWrongBank();loadHistory();}
</script>`
  return pageShell('MCQ প্র্যাকটিস', 'bg-slate-950 text-white', content)
}

// ============ প্ল্যানার + নোট পেজ ============
export function plannerPage(loggedIn: boolean): string {
  const content = `
${toolsHeader('planner', loggedIn)}
<main class="max-w-7xl mx-auto px-4 py-8">
  <header class="mb-6 pb-4 border-b border-white/10">
    <div class="flex items-center gap-2 mb-1.5">
      <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">স্মার্ট স্টাডি টুল</span>
      <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">ক্লাউড অটো-সেভ</span>
    </div>
    <h1 class="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
      <i class="fas fa-calendar-check text-purple-400"></i>
      <span>স্টাডি প্ল্যানার ও অধ্যায়ভিত্তিক নোট</span>
    </h1>
    <p class="text-xs sm:text-sm text-slate-300 mt-1">দৈনিক পড়ার রুটিন, লক্ষ্য ট্র্যাকিং এবং বিষয়ভিত্তিক নোটবুক — সব এক জায়গায় সুরক্ষিত</p>
  </header>

  ${loggedIn ? `
  <div class="grid lg:grid-cols-12 gap-6 items-start">
    <!-- প্ল্যানার -->
    <section class="lg:col-span-6 bg-slate-900 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-white/10">
        <h2 class="font-bold text-white text-base flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> আজকের পড়ার তালিকা
        </h2>
        <span id="task-progress" class="text-xs text-emerald-300 font-semibold"></span>
      </div>
      <form id="task-form" class="flex flex-col sm:flex-row gap-2">
        <input id="t-title" placeholder="কী পড়বেন? যেমন: পদার্থ বিজ্ঞান অধ্যায় ৩" class="w-full sm:flex-1 min-w-0 bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 outline-none focus:border-emerald-400 transition" required>
        <input id="t-date" type="date" class="w-full sm:w-auto bg-slate-800 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-100 outline-none focus:border-emerald-400 transition">
        <button class="w-full sm:w-auto px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 shrink-0 shadow">
          <span>+ যোগ</span>
        </button>
      </form>
      <div id="task-list" class="space-y-2 text-xs sm:text-sm max-h-96 overflow-y-auto pr-1"><p class="text-slate-400">লোড হচ্ছে…</p></div>
    </section>

    <!-- নোট -->
    <section class="lg:col-span-6 bg-slate-900 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-white/10">
        <h2 class="font-bold text-white text-base flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-purple-400"></span> অধ্যায়ভিত্তিক ডিজিটাল নোট
        </h2>
      </div>
      <form id="note-form" class="space-y-2.5">
        <div class="flex flex-col sm:flex-row gap-2">
          <input id="n-subject" placeholder="বিষয় (যেমন: রসায়ন)" class="w-full sm:w-1/3 bg-slate-800 border border-white/10 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 outline-none focus:border-purple-400 transition">
          <input id="n-title" placeholder="নোটের শিরোনাম" class="w-full sm:flex-1 min-w-0 bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 outline-none focus:border-purple-400 transition" required>
        </div>
        <textarea id="n-content" rows="3" placeholder="গুরুত্বপূর্ণ সূত্র, পয়েন্ট বা সারসংক্ষেপ লিখুন…" class="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 outline-none focus:border-purple-400 transition"></textarea>
        <button class="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow">
          <span>💾 নোট সেভ করুন</span>
        </button>
      </form>
      <div id="note-list" class="space-y-2 text-xs sm:text-sm max-h-80 overflow-y-auto pr-1"><p class="text-slate-400">লোড হচ্ছে…</p></div>
    </section>
  </div>` : `
  <section class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-8 text-center max-w-xl mx-auto shadow-xl">
    <p class="text-3xl mb-2">🔒</p>
    <p class="text-amber-300 font-bold text-base">প্ল্যানার ও নোট ব্যবহার করতে ফ্রি সাইন-আপ করুন</p>
    <p class="text-xs text-slate-300 mt-1.5 leading-relaxed">আপনার সব পড়ার রুটিন ও নোট অ্যাকাউন্টে অটো-সেভ থাকবে — যেকোনো ডিভাইস থেকে ব্যবহার করতে পারবেন।</p>
    <a href="/signup" class="inline-block mt-4 px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold transition text-xs shadow-lg">ফ্রি সাইন-আপ করুন</a>
  </section>`}
</main>

<script>
${helpersJs}
${loggedIn ? `
function loadTasks(){
  fetch('/api/tools/planner').then(r=>r.json()).then(function(d){
    var el = document.getElementById('task-list');
    var ts = d.tasks||[];
    if(!ts.length){el.innerHTML='<p class="text-slate-500">কোনো কাজ নেই — উপরে যোগ করুন!</p>';document.getElementById('task-progress').textContent='';return}
    var done = ts.filter(function(t){return t.status==='done'}).length;
    document.getElementById('task-progress').textContent = 'অগ্রগতি: '+toBn(done)+'/'+toBn(ts.length)+' সম্পন্ন ('+toBn(Math.round(done/ts.length*100))+'%)';
    el.innerHTML = ts.map(function(t){
      return '<div class="flex items-center gap-2 bg-slate-800/60 rounded-xl px-3 py-2.5 '+(t.status==='done'?'opacity-60':'')+'">'+
      '<input type="checkbox" '+(t.status==='done'?'checked':'')+' class="accent-emerald-500 w-4 h-4" onchange="toggleTask('+t.id+', this.checked)">'+
      '<span class="flex-1 '+(t.status==='done'?'line-through text-slate-500':'')+'">'+esc(t.title)+(t.due_date?' <span class="text-[10px] text-sky-400">📅 '+esc(t.due_date)+'</span>':'')+'</span>'+
      '<button onclick="delTask('+t.id+')" class="text-rose-400 hover:text-rose-300 text-xs">✕</button></div>';
    }).join('');
  });
}
window.toggleTask=function(id,done){fetch('/api/tools/planner/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:done?'done':'pending'})}).then(loadTasks)};
window.delTask=function(id){fetch('/api/tools/planner/'+id,{method:'DELETE'}).then(loadTasks)};
document.getElementById('task-form').onsubmit=function(e){e.preventDefault();
  var t=document.getElementById('t-title').value.trim(); if(!t)return;
  fetch('/api/tools/planner',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:t,due_date:document.getElementById('t-date').value})}).then(function(){document.getElementById('t-title').value='';loadTasks()});
};

function loadNotes(){
  fetch('/api/tools/notes').then(r=>r.json()).then(function(d){
    var el = document.getElementById('note-list');
    var ns = d.notes||[];
    if(!ns.length){el.innerHTML='<p class="text-slate-500">কোনো নোট নেই।</p>';return}
    el.innerHTML = ns.map(function(n){
      return '<details class="bg-slate-800/60 rounded-xl p-3"><summary class="cursor-pointer font-semibold">'+(n.subject?'<span class="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full mr-1.5">'+esc(n.subject)+'</span>':'')+esc(n.title)+'</summary>'+
      '<p class="mt-2 whitespace-pre-wrap text-slate-300">'+esc(n.content||'(খালি)')+'</p>'+
      '<button onclick="delNote('+n.id+')" class="mt-2 text-xs text-rose-400 hover:text-rose-300">🗑 মুছুন</button></details>';
    }).join('');
  });
}
window.delNote=function(id){if(confirm('নোটটি মুছবেন?'))fetch('/api/tools/notes/'+id,{method:'DELETE'}).then(loadNotes)};
document.getElementById('note-form').onsubmit=function(e){e.preventDefault();
  var t=document.getElementById('n-title').value.trim(); if(!t)return;
  fetch('/api/tools/notes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:t,subject:document.getElementById('n-subject').value,content:document.getElementById('n-content').value})}).then(function(){document.getElementById('n-title').value='';document.getElementById('n-content').value='';loadNotes()});
};
loadTasks(); loadNotes();` : ''}
</script>`
  return pageShell('স্টাডি প্ল্যানার', 'bg-slate-950 text-white', content)
}

// ============ CGPA ক্যালকুলেটর পেজ ============
export function cgpaPage(loggedIn: boolean): string {
  const content = `
${toolsHeader('cgpa', loggedIn)}
<main class="max-w-7xl mx-auto px-4 py-8">
  <header class="mb-6 pb-4 border-b border-white/10">
    <div class="flex items-center gap-2 mb-1.5">
      <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">NU ও বিশ্ববিদ্যালয় স্কেল</span>
      <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">৪.০০ পয়েন্ট স্কেল</span>
    </div>
    <h1 class="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
      <i class="fas fa-calculator text-emerald-400"></i>
      <span>CGPA ক্যালকুলেটর ও টার্গেট প্ল্যানার</span>
    </h1>
    <p class="text-xs sm:text-sm text-slate-300 mt-1">কোর্স অনুযায়ী CGPA গণনা এবং নির্দিষ্ট টার্গেটে পৌঁছাতে বাকি সেমিস্টারে কত GPA প্রয়োজন তা সহজে নির্ধারণ করুন</p>
  </header>

  <div class="grid lg:grid-cols-12 gap-6 items-start">
    <!-- CGPA গণনা -->
    <section class="lg:col-span-6 bg-slate-900 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-white/10">
        <h2 class="font-bold text-white text-base flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> সেমিস্টার / মোট CGPA গণনা
        </h2>
        <span class="text-xs text-slate-300">কোর্সভিত্তিক ক্রেডিট ও গ্রেড</span>
      </div>
      
      <div id="course-rows" class="space-y-2.5"></div>
      
      <div class="flex gap-2.5 pt-2 border-t border-white/10">
        <button onclick="addRow()" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5">
          <span>+ কোর্স যোগ</span>
        </button>
        <button onclick="calcCgpa()" class="flex-1 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs sm:text-sm font-black transition shadow">
          <span>গণনা করুন</span>
        </button>
      </div>

      <div id="cgpa-result" class="hidden mt-4 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl p-5 text-center shadow-lg">
        <p class="text-xs text-slate-300 font-medium">আপনার অর্জিত CGPA</p>
        <p id="cgpa-value" class="text-4xl font-black text-emerald-400 my-1"></p>
        <p id="cgpa-grade" class="text-sm font-bold text-slate-100"></p>
      </div>

      <details class="mt-4 text-xs text-slate-300 bg-slate-800/60 p-3.5 rounded-xl border border-white/5">
        <summary class="cursor-pointer font-bold text-slate-200">জাতীয় বিশ্ববিদ্যালয় ও বোর্ড স্ট্যান্ডার্ড গ্রেডিং স্কেল</summary>
        <table class="w-full mt-2.5 text-left border-collapse text-xs">
          <thead>
            <tr class="text-emerald-400 border-b border-white/10"><th class="py-1">মার্কস</th><th>লেটার গ্রেড</th><th>গ্রেড পয়েন্ট</th></tr>
          </thead>
          <tbody class="divide-y divide-white/5 text-slate-200">
            <tr><td class="py-1">৮০% বা তদূর্ধ্ব</td><td class="font-bold text-emerald-300">A+</td><td>৪.০০</td></tr>
            <tr><td class="py-1">৭৫% থেকে ৭৯%</td><td class="font-bold">A</td><td>৩.৭৫</td></tr>
            <tr><td class="py-1">৭০% থেকে ৭৪%</td><td class="font-bold">A-</td><td>৩.৫০</td></tr>
            <tr><td class="py-1">৬৫% থেকে ৬৯%</td><td class="font-bold">B+</td><td>৩.২৫</td></tr>
            <tr><td class="py-1">৬০% থেকে ৬৪%</td><td class="font-bold">B</td><td>৩.০০</td></tr>
            <tr><td class="py-1">৫৫% থেকে ৫৯%</td><td class="font-bold">B-</td><td>২.৭৫</td></tr>
            <tr><td class="py-1">৫০% থেকে ৫৪%</td><td class="font-bold">C+</td><td>২.৫০</td></tr>
            <tr><td class="py-1">৪৫% থেকে ৪৯%</td><td class="font-bold">C</td><td>২.২৫</td></tr>
            <tr><td class="py-1">৪০% থেকে ৪৪%</td><td class="font-bold">D</td><td>২.০০</td></tr>
            <tr><td class="py-1">৪০% এর নিচে</td><td class="font-bold text-rose-400">F</td><td>০.০০</td></tr>
          </tbody>
        </table>
      </details>
    </section>

    <!-- টার্গেট ক্যালকুলেটর -->
    <section class="lg:col-span-6 bg-slate-900 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-white/10">
        <h2 class="font-bold text-white text-base flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span> CGPA টার্গেট ক্যালকুলেটর
        </h2>
        <span class="text-xs text-amber-300 font-semibold">ভবিষ্যতের লক্ষ্য নির্ধারণ</span>
      </div>
      <p class="text-xs text-slate-300">টার্গেট CGPA অর্জন করতে বাকি সেমিস্টার বা কোর্সে গড়ে কত GPA পেতে হবে?</p>
      
      <div class="space-y-3.5 text-xs sm:text-sm">
        <div>
          <label class="text-xs font-bold text-slate-200 block mb-1">বর্তমান অর্জিত CGPA</label>
          <input id="tg-current" type="number" step="0.01" min="0" max="4" placeholder="যেমন: 3.25" class="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-amber-400 transition">
        </div>
        <div>
          <label class="text-xs font-bold text-slate-200 block mb-1">ইতোমধ্যে সম্পন্ন ক্রেডিট</label>
          <input id="tg-done" type="number" min="0" placeholder="যেমন: 60" class="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-amber-400 transition">
        </div>
        <div>
          <label class="text-xs font-bold text-slate-200 block mb-1">ভবিষ্যতে বাকি থাকা মোট ক্রেডিট</label>
          <input id="tg-left" type="number" min="1" placeholder="যেমন: 40" class="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-amber-400 transition">
        </div>
        <div>
          <label class="text-xs font-bold text-slate-200 block mb-1">টার্গেট কাঙ্ক্ষিত CGPA</label>
          <input id="tg-target" type="number" step="0.01" min="0" max="4" placeholder="যেমন: 3.50" class="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-amber-400 transition">
        </div>
        <button onclick="calcTarget()" class="w-full px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black transition shadow text-xs sm:text-sm">
          🎯 প্রয়োজনীয় টার্গেট হিসাব করুন
        </button>
      </div>
      <div id="target-result" class="hidden mt-4 rounded-2xl p-5 text-center shadow-lg"></div>
    </section>
  </div>
</main>

<script>
${helpersJs}
var GRADES = [['A+ (4.00)',4],['A (3.75)',3.75],['A- (3.50)',3.5],['B+ (3.25)',3.25],['B (3.00)',3],['B- (2.75)',2.75],['C+ (2.50)',2.5],['C (2.25)',2.25],['D (2.00)',2],['F (0.00)',0]];
function rowHtml(){
  return '<div class="course-row flex gap-2"><input placeholder="কোর্স (ঐচ্ছিক)" class="c-name flex-1 bg-slate-800 rounded-xl px-3 py-2 text-sm outline-none">'+
  '<input type="number" placeholder="ক্রেডিট" min="0.5" step="0.5" value="3" class="c-credit w-20 bg-slate-800 rounded-xl px-3 py-2 text-sm outline-none">'+
  '<select class="c-grade bg-slate-800 rounded-xl px-2 py-2 text-sm outline-none">'+GRADES.map(function(g){return '<option value="'+g[1]+'">'+g[0]+'</option>'}).join('')+'</select>'+
  '<button onclick="this.parentElement.remove()" class="text-rose-400 px-1">✕</button></div>';
}
window.addRow=function(){document.getElementById('course-rows').insertAdjacentHTML('beforeend', rowHtml())};
for(var i=0;i<4;i++) addRow();
window.calcCgpa=function(){
  var rows=document.querySelectorAll('.course-row'); var tc=0, tp=0;
  rows.forEach(function(r){
    var cr=parseFloat(r.querySelector('.c-credit').value)||0;
    var gp=parseFloat(r.querySelector('.c-grade').value)||0;
    if(cr>0){tc+=cr; tp+=cr*gp;}
  });
  if(!tc){alert('ক্রেডিট দিন');return}
  var cgpa=tp/tc;
  var g = cgpa>=4?'A+':cgpa>=3.75?'A':cgpa>=3.5?'A-':cgpa>=3.25?'B+':cgpa>=3?'B':cgpa>=2.75?'B-':cgpa>=2.5?'C+':cgpa>=2.25?'C':cgpa>=2?'D':'F';
  document.getElementById('cgpa-result').classList.remove('hidden');
  document.getElementById('cgpa-value').textContent=toBn(cgpa.toFixed(2));
  document.getElementById('cgpa-grade').textContent='গ্রেড: '+g+' · মোট ক্রেডিট: '+toBn(tc);
};
window.calcTarget=function(){
  var cur=parseFloat(document.getElementById('tg-current').value);
  var done=parseFloat(document.getElementById('tg-done').value);
  var left=parseFloat(document.getElementById('tg-left').value);
  var target=parseFloat(document.getElementById('tg-target').value);
  if(isNaN(cur)||isNaN(done)||isNaN(left)||isNaN(target)||left<=0){alert('সব ঘর পূরণ করুন');return}
  var need=(target*(done+left)-cur*done)/left;
  var el=document.getElementById('target-result');
  el.classList.remove('hidden');
  if(need>4){
    el.className='mt-4 rounded-2xl p-5 text-center bg-rose-500/10 border border-rose-500/40';
    el.innerHTML='<p class="text-2xl font-bold text-rose-400">সম্ভব নয় 😔</p><p class="text-sm text-slate-300 mt-1">দরকার গড়ে '+toBn(need.toFixed(2))+' — যা ৪.০০-এর বেশি। টার্গেট কমিয়ে দেখুন।</p>';
  }else if(need<=0){
    el.className='mt-4 rounded-2xl p-5 text-center bg-emerald-500/10 border border-emerald-500/40';
    el.innerHTML='<p class="text-2xl font-bold text-emerald-400">টার্গেট ইতিমধ্যে অর্জিত! 🎉</p>';
  }else{
    var hard=need>=3.75?' (কঠিন কিন্তু সম্ভব 💪)':need>=3?' (ভালোভাবে পড়লেই হবে ✅)':' (সহজেই সম্ভব 😊)';
    el.className='mt-4 rounded-2xl p-5 text-center bg-amber-500/10 border border-amber-500/40';
    el.innerHTML='<p class="text-xs text-slate-400">বাকি '+toBn(left)+' ক্রেডিটে গড়ে দরকার</p><p class="text-4xl font-bold text-amber-400">'+toBn(need.toFixed(2))+'</p><p class="text-sm text-slate-300 mt-1">'+hard+'</p>';
  }
};
</script>`
  return pageShell('CGPA ক্যালকুলেটর', 'bg-slate-950 text-white', content)
}

// ============ সিলেবাস পেজ (পূর্ণাঙ্গ অন-সাইট সিলেবাস ও পাঠ্যক্রম রিডার) ============
export function syllabusPage(loggedIn: boolean, userLevel = ''): string {
  const content = `
${toolsHeader('syllabus', loggedIn)}
<main class="max-w-7xl mx-auto px-4 py-8">
  <header class="mb-6 pb-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <div class="flex items-center gap-2 mb-1.5">
        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">অফিসিয়াল ২০২৬</span>
        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">অন-সাইট পূর্ণাঙ্গ ডাটাবেজ</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
        <i class="fas fa-book-open-reader text-emerald-400"></i>
        <span>সিলেবাস, পাঠ্যক্রম ও মানবণ্টন হাব</span>
      </h1>
      <p class="text-xs sm:text-sm text-slate-300 mt-1">জাতীয় শিক্ষাক্রম, বোর্ড পরীক্ষা, বিশ্ববিদ্যালয় ও চাকরির পূর্ণাঙ্গ বিষয়ভিত্তিক সিলেবাস</p>
    </div>

    <!-- সার্চ বার -->
    <div class="relative w-full md:w-80">
      <i class="fas fa-search absolute left-3.5 top-3.5 text-slate-400 text-xs"></i>
      <input type="text" id="sylSearchInput" oninput="filterSyllabus()" placeholder="বিষয় বা অধ্যায় খুঁজুন..." class="w-full bg-slate-900 border border-white/15 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition">
    </div>
  </header>

  <!-- শিক্ষাস্তর ট্যাব -->
  <div class="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-white/10 no-scrollbar" id="lvl-tabs">
    <button data-lvl="ssc" class="s-tab px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm whitespace-nowrap transition flex items-center gap-1.5 shadow">
      <i class="fas fa-school text-xs"></i> SSC ও সমমান
    </button>
    <button data-lvl="hsc" class="s-tab px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 font-semibold text-xs sm:text-sm whitespace-nowrap transition flex items-center gap-1.5 border border-white/10">
      <i class="fas fa-graduation-cap text-xs"></i> HSC ও সমমান
    </button>
    <button data-lvl="nu" class="s-tab px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 font-semibold text-xs sm:text-sm whitespace-nowrap transition flex items-center gap-1.5 border border-white/10">
      <i class="fas fa-university text-xs"></i> জাতীয় বিশ্ববিদ্যালয় (NU)
    </button>
    <button data-lvl="job" class="s-tab px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 font-semibold text-xs sm:text-sm whitespace-nowrap transition flex items-center gap-1.5 border border-white/10">
      <i class="fas fa-briefcase text-xs"></i> বিসিএস ও সরকারি চাকরি
    </button>
    <button data-lvl="masters" class="s-tab px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 font-semibold text-xs sm:text-sm whitespace-nowrap transition flex items-center gap-1.5 border border-white/10">
      <i class="fas fa-award text-xs"></i> ডিগ্রি ও মাস্টার্স
    </button>
  </div>

  <!-- সিলেবাস কার্ড গ্রিড -->
  <div id="syllabus-list" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <div class="col-span-full py-12 text-center text-slate-400">
      <i class="fas fa-spinner fa-spin text-2xl text-emerald-400 mb-2"></i>
      <p class="text-sm">সিলেবাস লোড হচ্ছে...</p>
    </div>
  </div>
</main>

<!-- পূর্ণাঙ্গ অন-সাইট সিলেবাস রিডার মোডাল -->
<div id="sylReaderModal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm hidden items-center justify-center p-3 sm:p-4">
  <div class="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
    <!-- হেডার বার -->
    <div class="p-4 bg-slate-950 border-b border-white/10 flex items-center justify-between gap-3">
      <div class="min-w-0">
        <span id="sylModalBadge" class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">SSC</span>
        <h2 id="sylModalTitle" class="text-base sm:text-lg font-bold text-white truncate mt-1">সিলেবাসের নাম</h2>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="printCurrentSyllabus()" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition flex items-center gap-1" title="প্রিন্ট করুন">
          <i class="fas fa-print"></i> <span class="hidden sm:inline">প্রিন্ট</span>
        </button>
        <button onclick="copyCurrentSyllabus()" class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition flex items-center gap-1" title="টেক্সট কপি করুন">
          <i class="fas fa-copy"></i> <span class="hidden sm:inline">কপি</span>
        </button>
        <button onclick="closeSylModal()" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-rose-500/80 hover:text-white text-slate-400 flex items-center justify-center transition">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- বডি কন্টেন্ট -->
    <div class="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm text-slate-200 leading-relaxed bg-slate-900/90" id="sylModalContentContainer">
      <!-- মার্কস ও সোর্স -->
      <div class="grid sm:grid-cols-2 gap-3 bg-white/5 border border-white/10 rounded-xl p-3.5">
        <div>
          <span class="text-[11px] text-slate-400 font-semibold block">মানবণ্টন ও পূর্ণমান:</span>
          <span id="sylModalMarks" class="text-xs font-bold text-amber-300">-</span>
        </div>
        <div>
          <span class="text-[11px] text-slate-400 font-semibold block">অনুমোদিত সোর্স:</span>
          <span id="sylModalSource" class="text-xs font-semibold text-sky-300">-</span>
        </div>
      </div>

      <!-- অধ্যায় তালিকা -->
      <div id="sylModalChaptersWrapper" class="hidden">
        <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <i class="fas fa-list-check"></i> পাঠ্যসূচির মূল অধ্যায়সমূহ
        </h4>
        <div id="sylModalChapters" class="grid sm:grid-cols-2 gap-2 text-xs"></div>
      </div>

      <!-- মূল সিলেবাস টেক্সট -->
      <div>
        <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <i class="fas fa-file-lines"></i> বিস্তারিত সিলেবাস ও পরীক্ষার রূপরেখা
        </h4>
        <div id="sylModalBody" class="bg-black/40 border border-white/10 rounded-xl p-4 text-xs sm:text-sm font-mono whitespace-pre-wrap leading-relaxed text-slate-200"></div>
      </div>
    </div>

    <!-- ফুটার -->
    <div class="p-3 bg-slate-950 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
      <span class="flex items-center gap-1.5">
        <i class="fas fa-circle-check text-emerald-400"></i> এডুসব অনুমোদিত কারিকুলাম
      </span>
      <button onclick="closeSylModal()" class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition">
        সম্পন্ন
      </button>
    </div>
  </div>
</div>

<script>
${helpersJs}
var USER_LEVEL = '${userLevel}';
var currentLevel = ['ssc','hsc','nu','job','masters'].indexOf(USER_LEVEL) >= 0 ? USER_LEVEL : 'ssc';
var syllabusData = [];
var activeModalSyllabus = null;

function loadSyllabus() {
  document.querySelectorAll('.s-tab').forEach(function(b){
    var isActive = b.dataset.lvl === currentLevel;
    b.className = 's-tab px-4 py-2.5 rounded-xl text-xs sm:text-sm whitespace-nowrap transition flex items-center gap-1.5 ' + 
      (isActive ? 'bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-slate-300 hover:bg-slate-800 font-semibold');
  });

  var listEl = document.getElementById('syllabus-list');
  listEl.innerHTML = '<div class="col-span-full py-12 text-center text-slate-500"><i class="fas fa-spinner fa-spin text-2xl text-emerald-400 mb-2"></i><p class="text-sm">সিলেবাস লোড হচ্ছে...</p></div>';

  fetch('/api/tools/syllabus?level=' + currentLevel)
    .then(function(r){ return r.json(); })
    .then(function(d){
      syllabusData = d.items || [];
      renderSyllabusList(syllabusData);
    })
    .catch(function(){
      listEl.innerHTML = '<div class="col-span-full py-8 text-center text-rose-400 text-sm">সিলেবাস লোড করতে সমস্যা হয়েছে। <button onclick="loadSyllabus()" class="underline font-bold ml-2">পুনরায় চেষ্টা করুন</button></div>';
    });
}

function renderSyllabusList(items) {
  var listEl = document.getElementById('syllabus-list');
  if (!items || !items.length) {
    listEl.innerHTML = '<div class="col-span-full py-12 text-center text-slate-400"><i class="fas fa-folder-open text-3xl mb-2 text-slate-600"></i><p class="text-sm font-semibold">এই স্তরে কোনো সিলেবাস পাওয়া যায়নি</p></div>';
    return;
  }

  listEl.innerHTML = items.map(function(s, idx){
    var chaptersCount = 0;
    try {
      var ch = JSON.parse(s.chapters || '[]');
      chaptersCount = ch.length;
    } catch(e){}

    return '<div class="bg-slate-900 border border-white/10 hover:border-emerald-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-sm hover:shadow-emerald-500/5">'+
      '<div>'+
        '<div class="flex items-start justify-between gap-3 mb-2.5">'+
          '<span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">'+esc(s.level)+'</span>'+
          (s.source ? '<span class="text-[11px] text-sky-400 font-medium truncate max-w-[180px] sm:max-w-xs"><i class="fas fa-building-columns mr-1"></i>'+esc(s.source)+'</span>' : '')+
        '</div>'+
        '<h3 class="font-bold text-white text-base leading-snug group-hover:text-emerald-300 transition mb-2">'+esc(s.title)+'</h3>'+
        (s.description ? '<p class="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">'+esc(s.description)+'</p>' : '')+
        (s.marks_distribution ? '<div class="text-[11px] bg-white/5 border border-white/5 rounded-lg px-2.5 py-1.5 text-amber-300/90 mb-3"><i class="fas fa-calculator mr-1"></i> '+esc(s.marks_distribution)+'</div>' : '')+
      '</div>'+
      '<div class="pt-3 border-t border-white/10 flex items-center justify-between gap-2 mt-2">'+
        '<button onclick="openSylModal('+idx+')" class="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md">'+
          '<i class="fas fa-eye"></i> সিলেবাস পড়ুন ও প্রিন্ট'+
        '</button>'+
        (s.link ? '<a href="'+esc(s.link)+'" target="_blank" rel="noopener" class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs transition" title="অফিসিয়াল সাইট"><i class="fas fa-external-link"></i></a>' : '')+
      '</div>'+
    '</div>';
  }).join('');
}

function filterSyllabus() {
  var q = (document.getElementById('sylSearchInput').value || '').trim().toLowerCase();
  if (!q) {
    renderSyllabusList(syllabusData);
    return;
  }
  var filtered = syllabusData.filter(function(s){
    return (s.title || '').toLowerCase().includes(q) ||
           (s.subject || '').toLowerCase().includes(q) ||
           (s.description || '').toLowerCase().includes(q) ||
           (s.content || '').toLowerCase().includes(q) ||
           (s.chapters || '').toLowerCase().includes(q);
  });
  renderSyllabusList(filtered);
}

function openSylModal(idx) {
  var s = syllabusData[idx];
  if (!s) return;
  activeModalSyllabus = s;

  document.getElementById('sylModalBadge').textContent = s.level.toUpperCase();
  document.getElementById('sylModalTitle').textContent = s.title;
  document.getElementById('sylModalMarks').textContent = s.marks_distribution || 'বোর্ড/জাতীয় স্ট্যান্ডার্ড অনুযায়ী';
  document.getElementById('sylModalSource').textContent = s.source || 'শিক্ষা মন্ত্রণালয় ও NCTB';

  var chWrapper = document.getElementById('sylModalChaptersWrapper');
  var chContainer = document.getElementById('sylModalChapters');
  var chapters = [];
  try {
    chapters = JSON.parse(s.chapters || '[]');
  } catch(e){}

  if (chapters && chapters.length) {
    chWrapper.classList.remove('hidden');
    chContainer.innerHTML = chapters.map(function(ch, i){
      return '<div class="bg-black/30 border border-white/5 rounded-lg p-2 flex items-start gap-2">'+
        '<span class="w-5 h-5 rounded bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0">'+(i+1)+'</span>'+
        '<span class="text-slate-300">'+esc(ch)+'</span>'+
      '</div>';
    }).join('');
  } else {
    chWrapper.classList.add('hidden');
  }

  document.getElementById('sylModalBody').textContent = s.content || s.description || 'সিলেবাসের বিস্তারিত কন্টেন্ট প্রস্তুত হচ্ছে...';

  var modal = document.getElementById('sylReaderModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeSylModal() {
  var modal = document.getElementById('sylReaderModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  activeModalSyllabus = null;
}

function printCurrentSyllabus() {
  if (!activeModalSyllabus) return;
  var s = activeModalSyllabus;
  var printWin = window.open('', '_blank');
  var printContent = '<html><head><title>'+esc(s.title)+' - এডুসব সিলেবাস</title>'+
    '<style>'+
    'body { font-family: "Hind Siliguri", "Segoe UI", Arial, sans-serif; padding: 25px; color: #111; line-height: 1.6; }'+
    '.header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 18px; }'+
    '.badge { background: #059669; color: white; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }'+
    '.meta { background: #f3f4f6; padding: 10px; border-radius: 6px; margin-bottom: 16px; font-size: 13px; }'+
    '.body-text { white-space: pre-wrap; font-size: 14px; }'+
    '</style></head><body>'+
    '<div class="header">'+
    '<h2>এডুসব শিক্ষা ও ক্যারিয়ার হাব (EduSob)</h2>'+
    '<h3>'+esc(s.title)+'</h3>'+
    '<span class="badge">'+esc(s.level.toUpperCase())+' সিলেবাস ২০২৬</span>'+
    '</div>'+
    '<div class="meta">'+
    '<strong>মানবণ্টন:</strong> '+esc(s.marks_distribution || 'স্ট্যান্ডার্ড')+' | <strong>অনুমোদিত সোর্স:</strong> '+esc(s.source || 'NCTB')+
    '</div>'+
    '<div class="body-text">'+esc(s.content || s.description)+'</div>'+
    '<div style="text-align:center;margin-top:30px;font-size:11px;color:#666;border-top:1px solid #ddd;padding-top:10px;">সংগৃহীত: edusob.com — সর্বস্বত্ব সংরক্ষিত</div>'+
    '</body></html>';
  printWin.document.write(printContent);
  printWin.document.close();
  printWin.focus();
  setTimeout(function(){ printWin.print(); }, 250);
}

function copyCurrentSyllabus() {
  if (!activeModalSyllabus) return;
  var text = activeModalSyllabus.title + '\n\nমানবণ্টন: ' + (activeModalSyllabus.marks_distribution || '') + '\nসোর্স: ' + (activeModalSyllabus.source || '') + '\n\n' + (activeModalSyllabus.content || activeModalSyllabus.description || '');
  navigator.clipboard.writeText(text).then(function(){
    alert('সিলেবাস সফলভাবে কপি করা হয়েছে!');
  }).catch(function(){
    alert('কপি করা সম্ভব হয়নি।');
  });
}

document.querySelectorAll('.s-tab').forEach(function(b){
  b.onclick = function(){
    currentLevel = b.dataset.lvl;
    loadSyllabus();
  };
});

loadSyllabus();
</script>`
  return pageShell('সিলেবাস ও পাঠ্যক্রম', 'bg-slate-950 text-white', content)
}
