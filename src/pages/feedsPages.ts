// এডুসব ফেজ-২ — পাবলিক পেজ: নিউজ পোর্টাল, চাকরির খবর, নোটিস বোর্ড
import { pageShell } from './layout'

// কমন পাবলিক হেডার
function publicHeader(active: string, loggedIn: boolean): string {
  const link = (href: string, label: string, key: string) =>
    `<a href="${href}" class="${active === key ? 'text-emerald-400 font-bold' : 'text-slate-300 hover:text-white'} transition">${label}</a>`
  return `
<header class="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
  <nav class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
    <a href="/" class="flex items-center gap-2 font-bold text-xl shrink-0">
      <span class="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">📚</span> এডুসব
    </a>
    <div class="hidden md:flex items-center gap-5 text-sm">
      ${link('/results', 'রেজাল্ট হাব', 'results')}
      ${link('/news', 'নিউজ', 'news')}
      ${link('/jobs', 'চাকরি', 'jobs')}
      ${link('/notices', 'নোটিস', 'notices')}
    </div>
    <div class="flex items-center gap-2 text-sm shrink-0">
      ${loggedIn
        ? `<a href="/dashboard" class="bg-emerald-500 hover:bg-emerald-400 px-4 py-2 rounded-xl font-semibold transition">ড্যাশবোর্ড</a>`
        : `<a href="/login" class="px-3 py-2 text-slate-300 hover:text-white transition">লগইন</a>
           <a href="/signup" class="bg-emerald-500 hover:bg-emerald-400 px-4 py-2 rounded-xl font-semibold transition">ফ্রি সাইন-আপ</a>`}
    </div>
  </nav>
  <div class="md:hidden flex gap-4 px-4 pb-2 text-xs overflow-x-auto">
    ${link('/results', 'রেজাল্ট', 'results')} ${link('/news', 'নিউজ', 'news')} ${link('/jobs', 'চাকরি', 'jobs')} ${link('/notices', 'নোটিস', 'notices')}
  </div>
</header>`
}

const timeAgoJs = `
function timeAgo(ds){
  if(!ds) return '';
  const d = new Date(ds); if(isNaN(d)) return '';
  const s = Math.floor((Date.now()-d.getTime())/1000);
  const BN = x => String(x).replace(/[0-9]/g, n => '০১২৩৪৫৬৭৮৯'[n]);
  if(s < 3600) return BN(Math.max(1,Math.floor(s/60))) + ' মিনিট আগে';
  if(s < 86400) return BN(Math.floor(s/3600)) + ' ঘণ্টা আগে';
  return BN(Math.floor(s/86400)) + ' দিন আগে';
}
const BN = x => String(x).replace(/[0-9]/g, n => '০১২৩৪৫৬৭৮৯'[n]);
function esc(s){const d=document.createElement('div');d.textContent=s||'';return d.innerHTML}
function fmtNewsDate(ds){
  if(!ds) return '';
  const d = new Date(ds); if(isNaN(d)) return '';
  const bd = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
  const W = ['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার'];
  const p2 = n => String(n).padStart(2,'0');
  return '· ' + W[bd.getDay()] + ', ' + BN(p2(bd.getDate())) + '/' + BN(p2(bd.getMonth()+1)) + '/' + BN(bd.getFullYear());
}
`

// ---------- নিউজ পোর্টাল ----------
export function newsPage(loggedIn: boolean): string {
  return pageShell('নিউজ পোর্টাল', 'bg-slate-950 text-white min-h-screen', `
${publicHeader('news', loggedIn)}
<main class="max-w-4xl mx-auto px-4 py-8">
  <section id="news-header" class="mb-6">
    <h1 class="text-3xl font-bold"><i class="fas fa-newspaper text-emerald-400 mr-2"></i>নিউজ পোর্টাল</h1>
    <p class="text-slate-400 text-sm mt-1">দেশের শীর্ষ সংবাদ — অটো-আপডেট (প্রথম আলো, বিবিসি বাংলা, গুগল নিউজ)</p>
  </section>

  <div id="news-tabs" class="flex gap-2 mb-6 overflow-x-auto">
    <button onclick="loadNews('latest')" data-cat="latest" class="tab-btn bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap">🔥 সর্বশেষ</button>
    <button onclick="loadNews('education')" data-cat="education" class="tab-btn bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition">🎓 শিক্ষা</button>
    <button onclick="loadNews('jobs')" data-cat="jobs" class="tab-btn bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition">💼 চাকরি</button>
  </div>

  <div id="newsList" class="space-y-3">
    <p class="text-center text-slate-400 py-10"><i class="fas fa-spinner fa-spin mr-2"></i>নিউজ লোড হচ্ছে...</p>
  </div>
</main>

<script>
${timeAgoJs}
async function loadNews(cat){
  document.querySelectorAll('.tab-btn').forEach(b=>{
    if(b.dataset.cat===cat){b.className='tab-btn bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap'}
    else{b.className='tab-btn bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition'}
  });
  const list = document.getElementById('newsList');
  list.innerHTML = '<p class="text-center text-slate-400 py-10"><i class="fas fa-spinner fa-spin mr-2"></i>নিউজ লোড হচ্ছে...</p>';
  try {
    const r = await axios.get('/api/feeds/news?cat=' + cat);
    const items = r.data.items || [];
    if(!items.length){ list.innerHTML = '<p class="text-center text-slate-400 py-10">এই মুহূর্তে নিউজ আনা যাচ্ছে না — একটু পরে চেষ্টা করুন</p>'; return; }
    list.innerHTML = items.map((n,i) => \`
      <a href="\${n.link}" target="_blank" rel="noopener" class="card-hover block bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition">
        <div class="flex items-start gap-3">
          <span class="text-emerald-400 font-bold text-lg w-8 shrink-0 text-center">\${BN(i+1)}</span>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold leading-snug">\${esc(n.title)}</h3>
            <p class="text-xs text-slate-400 mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span class="bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full font-semibold"><i class="fas fa-newspaper mr-1"></i>সূত্র: \${esc(n.source)}</span>
              <span><i class="fas fa-clock mr-1"></i>\${timeAgo(n.pubDate)}</span>
              <span class="text-slate-500">\${fmtNewsDate(n.pubDate)}</span>
            </p>
          </div>
          <i class="fas fa-arrow-up-right-from-square text-slate-500 text-xs mt-1"></i>
        </div>
      </a>\`).join('');
  } catch(e){ list.innerHTML = '<p class="text-center text-rose-400 py-10">নিউজ লোডে সমস্যা হয়েছে</p>'; }
}
loadNews('latest');
</script>
`)
}

// ---------- চাকরির খবর ----------
export function jobsPage(loggedIn: boolean, userLevel = ''): string {
  return pageShell('চাকরির খবর', 'bg-slate-950 text-white min-h-screen', `
${publicHeader('jobs', loggedIn)}
<main class="max-w-4xl mx-auto px-4 py-8">
  <section id="jobs-header" class="mb-6">
    <h1 class="text-3xl font-bold"><i class="fas fa-briefcase text-emerald-400 mr-2"></i>চাকরির খবর</h1>
    <p class="text-slate-400 text-sm mt-1">সরকারি (টেলিটক) + ব্যাংক + বেসরকারি — শিক্ষাস্তর অনুযায়ী ম্যাচ %</p>
    ${loggedIn ? '' : `<p class="text-xs text-amber-300 mt-2 bg-amber-500/10 border border-amber-400/20 rounded-xl px-3 py-2 inline-block"><i class="fas fa-lock mr-1"></i> সাইন-আপ করলে আপনার শিক্ষাস্তর অনুযায়ী অটো ম্যাচ % দেখাবে — <a href="/signup" class="underline font-semibold">ফ্রি সাইন-আপ</a></p>`}
  </section>

  <div id="job-filters" class="flex gap-2 mb-6 overflow-x-auto">
    <button onclick="loadJobs('')" data-lv="" class="lv-btn bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap">সব</button>
    <button onclick="loadJobs('ssc')" data-lv="ssc" class="lv-btn bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition">SSC পাস</button>
    <button onclick="loadJobs('hsc')" data-lv="hsc" class="lv-btn bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition">HSC পাস</button>
    <button onclick="loadJobs('nu')" data-lv="nu" class="lv-btn bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition">স্নাতক</button>
    <button onclick="loadJobs('masters')" data-lv="masters" class="lv-btn bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition">মাস্টার্স</button>
  </div>

  <div id="jobsList" class="space-y-3">
    <p class="text-center text-slate-400 py-10"><i class="fas fa-spinner fa-spin mr-2"></i>লোড হচ্ছে...</p>
  </div>
</main>

<script>
${timeAgoJs}
const USER_LEVEL = ${JSON.stringify(userLevel)};
const CAT_BN = { govt:'সরকারি', bank:'ব্যাংক', private:'বেসরকারি', ngo:'এনজিও' };
const LV_BN = { any:'যেকোনো', ssc:'SSC পাস', hsc:'HSC পাস', nu:'স্নাতক', masters:'মাস্টার্স' };
function deadlineInfo(ds){
  if(!ds) return {txt:'', cls:'text-slate-400'};
  const diff = Math.ceil((new Date(ds+'T23:59:59+06:00') - Date.now())/86400000);
  if(diff < 0) return {txt:'সময় শেষ', cls:'text-rose-400'};
  if(diff <= 5) return {txt:'আর '+BN(diff)+' দিন!', cls:'text-rose-300 font-bold'};
  return {txt:'ডেডলাইন: '+BN(ds.split('-').reverse().join('-')), cls:'text-slate-400'};
}
function matchBadge(m){
  const color = m >= 90 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : m >= 70 ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' : 'bg-slate-500/20 text-slate-300 border-slate-400/30';
  return '<span class="text-xs px-2.5 py-1 rounded-full border '+color+' font-bold whitespace-nowrap">ম্যাচ '+BN(m)+'%</span>';
}
async function loadJobs(lv){
  document.querySelectorAll('.lv-btn').forEach(b=>{
    if(b.dataset.lv===lv){b.className='lv-btn bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap'}
    else{b.className='lv-btn bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition'}
  });
  const list = document.getElementById('jobsList');
  list.innerHTML = '<p class="text-center text-slate-400 py-10"><i class="fas fa-spinner fa-spin mr-2"></i>লোড হচ্ছে...</p>';
  try {
    const r = await axios.get('/api/feeds/jobs?level=' + (lv || USER_LEVEL));
    let jobs = r.data.jobs || [];
    if(lv) jobs = jobs.filter(j => j.education_level === lv || j.education_level === 'any');
    if(!jobs.length){ list.innerHTML = '<p class="text-center text-slate-400 py-10">এই ফিল্টারে কোনো চাকরি নেই</p>'; return; }
    list.innerHTML = jobs.map(j => {
      const dl = deadlineInfo(j.deadline);
      return \`
      <div class="card-hover bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex-1 min-w-0 w-full">
            <h3 class="font-bold text-base sm:text-lg leading-snug">\${esc(j.title)}</h3>
            <p class="text-sm text-slate-400 mt-1"><i class="fas fa-building mr-1"></i>\${esc(j.org||'')}</p>
            <p class="text-xs text-slate-400 mt-2 leading-relaxed">\${esc(j.description||'')}</p>
            <div class="flex flex-wrap gap-1.5 sm:gap-2 mt-3 text-xs">
              <span class="bg-white/10 px-2.5 py-1 rounded-full">\${CAT_BN[j.category]||j.category}</span>
              <span class="bg-white/10 px-2.5 py-1 rounded-full">🎓 \${LV_BN[j.education_level]||j.education_level}</span>
              <span class="px-2.5 py-1 rounded-full bg-white/5 \${dl.cls}">⏰ \${dl.txt}</span>
            </div>
          </div>
          <div class="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t border-white/10 sm:border-t-0">
            \${(USER_LEVEL || lv) ? matchBadge(j.match) : '<span></span>'}
            <a href="\${j.apply_link}" target="_blank" rel="noopener" class="bg-emerald-500 hover:bg-emerald-400 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition text-center">আবেদন লিংক <i class="fas fa-arrow-up-right-from-square ml-1 text-xs"></i></a>
          </div>
        </div>
      </div>\`;
    }).join('');
  } catch(e){ list.innerHTML = '<p class="text-center text-rose-400 py-10">লোডে সমস্যা হয়েছে</p>'; }
}
loadJobs(${JSON.stringify(userLevel)} && ['ssc','hsc','nu','masters'].includes(USER_LEVEL) ? USER_LEVEL : '');
</script>
`)
}

// ---------- নোটিস বোর্ড ----------
export function noticesPage(loggedIn: boolean): string {
  return pageShell('নোটিস বোর্ড', 'bg-slate-950 text-white min-h-screen', `
${publicHeader('notices', loggedIn)}
<main class="max-w-4xl mx-auto px-4 py-8">
  <section id="notices-header" class="mb-6">
    <h1 class="text-3xl font-bold"><i class="fas fa-bullhorn text-emerald-400 mr-2"></i>নোটিস বোর্ড</h1>
    <p class="text-slate-400 text-sm mt-1">NU · শিক্ষা বোর্ড · DSHE · NTRCA — গুরুত্বপূর্ণ বিজ্ঞপ্তি এক জায়গায়</p>
  </section>

  <div id="notice-tabs" class="flex gap-2 mb-6 overflow-x-auto">
    <button onclick="loadNotices('')" data-cat="" class="nt-btn bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap">সব</button>
    <button onclick="loadNotices('nu')" data-cat="nu" class="nt-btn bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition">জাতীয় বিশ্ববিদ্যালয়</button>
    <button onclick="loadNotices('board')" data-cat="board" class="nt-btn bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition">শিক্ষা বোর্ড</button>
    <button onclick="loadNotices('dshe')" data-cat="dshe" class="nt-btn bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition">DSHE/মন্ত্রণালয়</button>
    <button onclick="loadNotices('ntrca')" data-cat="ntrca" class="nt-btn bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition">NTRCA</button>
  </div>

  <div id="noticesList" class="space-y-3">
    <p class="text-center text-slate-400 py-10"><i class="fas fa-spinner fa-spin mr-2"></i>লোড হচ্ছে...</p>
  </div>
</main>

<script>
${timeAgoJs}
const NCAT = { nu:'জাতীয় বিশ্ববিদ্যালয়', board:'শিক্ষা বোর্ড', dshe:'DSHE', ntrca:'NTRCA', college:'কলেজ', general:'সাধারণ' };
const WD_BN = ['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার'];
function fmtNoticeDate(s){
  try { const d = new Date(s + 'T00:00:00'); const p = s.split('-'); return WD_BN[d.getDay()] + ', ' + BN(p[2]) + '/' + BN(p[1]) + '/' + BN(p[0]); } catch(e){ return BN(s); }
}
function toggleBody(id, btn){
  const el = document.getElementById('nb-' + id);
  if (!el) return;
  el.classList.toggle('hidden');
  btn.innerHTML = el.classList.contains('hidden') ? '<i class="fas fa-eye mr-1"></i> বিস্তারিত পড়ুন' : '<i class="fas fa-eye-slash mr-1"></i> বন্ধ করুন';
}
const NCOLOR = { nu:'bg-blue-500/15 text-blue-300', board:'bg-emerald-500/15 text-emerald-300', dshe:'bg-purple-500/15 text-purple-300', ntrca:'bg-amber-500/15 text-amber-300', college:'bg-teal-500/15 text-teal-300', general:'bg-slate-500/15 text-slate-300' };
async function loadNotices(cat){
  document.querySelectorAll('.nt-btn').forEach(b=>{
    if(b.dataset.cat===cat){b.className='nt-btn bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap'}
    else{b.className='nt-btn bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition'}
  });
  const list = document.getElementById('noticesList');
  list.innerHTML = '<p class="text-center text-slate-400 py-10"><i class="fas fa-spinner fa-spin mr-2"></i>লোড হচ্ছে...</p>';
  try {
    const r = await axios.get('/api/feeds/notices' + (cat ? '?cat='+cat : ''));
    const items = r.data.notices || [];
    if(!items.length){ list.innerHTML = '<p class="text-center text-slate-400 py-10">কোনো নোটিস নেই</p>'; return; }
    list.innerHTML = items.map(n => \`
      <div class="card-hover bg-white/5 border border-white/10 rounded-2xl p-4 transition">
        <div class="flex items-start gap-3">
          <span class="w-10 h-10 rounded-xl \${(NCOLOR[n.category]||NCOLOR.general).split(' ')[0]} flex items-center justify-center shrink-0"><i class="fas fa-file-lines"></i></span>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold leading-snug">\${esc(n.title)}</h3>
            <p class="text-xs mt-1.5">
              <span class="\${NCOLOR[n.category]||NCOLOR.general} px-2 py-0.5 rounded-full">\${NCAT[n.category]||n.category}</span>
              \${n.published_at ? '<span class="text-slate-400 ml-2"><i class="fas fa-calendar-day mr-1"></i>'+fmtNoticeDate(n.published_at)+'</span>' : ''}
            </p>
            \${n.body ? \`<div id="nb-\${n.id}" class="hidden mt-3 text-sm text-slate-300 whitespace-pre-line bg-white/5 rounded-xl p-3 border border-white/10">\${esc(n.body)}</div>\` : ''}
            <div class="flex flex-wrap gap-2 mt-3">
              \${n.body ? \`<button onclick="toggleBody(\${n.id}, this)" class="text-xs bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-lg font-semibold transition"><i class="fas fa-eye mr-1"></i> বিস্তারিত পড়ুন</button>\` : ''}
              \${n.link ? \`<a href="\${n.link}" target="_blank" rel="noopener" class="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition">মূল নোটিস <i class="fas fa-arrow-up-right-from-square"></i></a>\` : ''}
            </div>
          </div>
        </div>
      </div>\`).join('');
  } catch(e){ list.innerHTML = '<p class="text-center text-rose-400 py-10">লোডে সমস্যা হয়েছে</p>'; }
}
loadNotices('');
</script>
`)
}
