import { pageShell } from './layout'

/**
 * শিক্ষকের নিজস্ব ড্যাশবোর্ড (`/teacher`).
 *
 * আগে শিক্ষকদের কোনো ড্যাশবোর্ডই ছিল না — শিক্ষক শুধু `teachers` টেবিলের একটি
 * রেকর্ড ছিলেন, আর তাঁর কাছে পাঠানো প্রশ্ন/চ্যাট দেখার কোনো উপায় ছিল না
 * (`/my-tickets` ছিল কেবল ছাত্রের জন্য)। অ্যাডমিন প্যানেল থেকেই সব উত্তর
 * দিতে হতো।
 *
 * এই পেজে:
 *   • বরাদ্দ হওয়া চ্যাটের তালিকা + চ্যাট-থ্রেড + উত্তর লেখা
 *   • নতুন বার্তা এলে **শব্দ + টোস্ট + ব্রাউজার-নোটিফিকেশন** — যাতে শিক্ষক
 *     বুঝতে পারেন তাঁর কাছে চ্যাট এসেছে
 *
 * ⚠️ দুটি জিনিস ইচ্ছে করেই এড়ানো হয়েছে:
 *   ১) কোনো অডিও-ফাইল/সিডিএন নেই — শব্দটি Web Audio API দিয়ে তৈরি (০ বাইট,
 *      কোনো বাহ্যিক রিকোয়েস্ট নয়, গোপনীয়তা-নীতি মেনে)।
 *   ২) "পঠিত" অবস্থা সার্ভারে রাখা হয়নি (`teacher_messages`-এ কোনো is_read
 *      কলাম নেই) — মাইগ্রেশনের ঝুঁকি নেওয়ার বদলে localStorage-এ "শেষ দেখা
 *      বার্তা" রাখা হয়েছে। ব্রাউজার-ভিত্তিক, কিন্তু কোনো স্কিমা-পরিবর্তন নেই।
 *
 * ⚠️ স্ক্রিপ্টটি TS টেম্পলেট-লিটারেলের ভেতরে — তাই ভেতরে কোনো ব্যাকটিক (`)
 *    বা ব্যাকস্ল্যাশ (\) ব্যবহার করা হয়নি। সব স্ট্রিং সিঙ্গেল-কোট ও
 *    কনক্যাটেনেশন দিয়ে লেখা।
 */
const NAV = (loggedIn: boolean) => `
<header class="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-white/10">
  <nav class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <a href="/" class="flex items-center gap-2 font-bold text-xl">
        <span class="w-9 h-9 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-lg shadow-orange-500/20">🎓</span>
        <span>এডুসব <span class="text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">PREMIUM</span></span>
      </a>
    </div>
    <div class="flex items-center gap-2 text-sm">
      ${loggedIn
        ? '<a href="/dashboard" class="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 font-bold hover:shadow-lg transition">ড্যাশবোর্ড</a>'
        : '<a href="/login" class="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 transition">লগইন</a>'}
    </div>
  </nav>
</header>`

export function teacherDashPage(loggedIn: boolean): string {
  return pageShell(
    'শিক্ষক ড্যাশবোর্ড — আমার চ্যাট',
    'bg-slate-950 text-white min-h-screen selection:bg-orange-500/30',
    `
${NAV(loggedIn)}

<main class="max-w-7xl mx-auto px-3 sm:px-4 py-5">

  <!-- হেডার -->
  <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
    <div class="flex items-center gap-3 min-w-0">
      <div id="tchAvatar" class="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-slate-950 font-black flex items-center justify-center text-lg flex-shrink-0">শ</div>
      <div class="min-w-0">
        <h1 class="text-base sm:text-lg font-black truncate">শিক্ষক ড্যাশবোর্ড</h1>
        <p id="tchSub" class="text-[11px] text-slate-400 truncate">লোড হচ্ছে...</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button id="tchSoundBtn" type="button" onclick="tchToggleSound()"
        class="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1.5 transition"
        aria-pressed="true">
        <i class="fas fa-volume-high" aria-hidden="true"></i><span id="tchSoundTxt">শব্দ চালু</span>
      </button>
      <button id="tchNotifyBtn" type="button" onclick="tchAskNotify()"
        class="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1.5 transition"
        aria-pressed="false">
        <i class="fas fa-bell" aria-hidden="true"></i><span id="tchNotifyTxt">নোটিফিকেশন অন</span>
      </button>
      <span id="tchLive" class="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[10px] font-bold hidden sm:inline-flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> সরাসরি
      </span>
    </div>
  </div>

  <!-- অননুমোদিত / লগইন নেই -->
  <div id="tchGate" class="hidden rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-center max-w-lg mx-auto">
    <div class="text-3xl mb-2">🔒</div>
    <p id="tchGateMsg" class="text-sm font-bold text-amber-200 mb-3"></p>
    <a href="/login" class="inline-block px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 text-xs font-black transition">লগইন করুন</a>
  </div>

  <!-- মূল অংশ: বামে তালিকা, ডানে চ্যাট -->
  <div id="tchMain" class="hidden grid lg:grid-cols-[320px_1fr] gap-4">

    <!-- চ্যাট তালিকা -->
    <section class="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden flex flex-col max-h-[70vh]">
      <div class="px-3 py-2.5 border-b border-white/10 flex items-center justify-between gap-2">
        <h2 class="text-xs font-black uppercase tracking-wide text-slate-300">আমার চ্যাট</h2>
        <span id="tchUnreadAll" class="hidden px-1.5 py-0.5 rounded-full bg-orange-500 text-slate-950 text-[10px] font-black">0</span>
      </div>
      <div id="tchList" class="flex-1 overflow-y-auto divide-y divide-white/5">
        <div class="p-6 text-center text-xs text-slate-500">লোড হচ্ছে...</div>
      </div>
    </section>

    <!-- চ্যাট থ্রেড -->
    <section class="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden flex flex-col max-h-[70vh]">
      <div class="px-3 py-2.5 border-b border-white/10 flex items-center gap-2">
        <button type="button" onclick="tchBack()" class="lg:hidden px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold" aria-label="তালিকায় ফিরুন">←</button>
        <div class="min-w-0 flex-1">
          <p id="tchChatTitle" class="text-xs font-black truncate">একটি চ্যাট বেছে নিন</p>
          <p id="tchChatMeta" class="text-[10px] text-slate-400 truncate"></p>
        </div>
      </div>
      <div id="tchMsgs" class="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
        <div class="h-full flex items-center justify-center text-slate-500 text-center px-6">
          বামে থেকে একটি চ্যাট বেছে নিন
        </div>
      </div>
      <form id="tchForm" onsubmit="return tchSend(event)" class="border-t border-white/10 p-2.5 flex gap-2">
        <input id="tchInput" type="text" autocomplete="off" placeholder="উত্তর লিখুন..."
          class="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/60">
        <button type="submit" class="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 text-xs font-black transition">
          <i class="fas fa-paper-plane" aria-hidden="true"></i> পাঠান
        </button>
      </form>
    </section>
  </div>
</main>

<script>
var tchLoggedIn = ${loggedIn ? 'true' : 'false'};
var tchTickets = [];
var tchActive = null;
var tchSound = localStorage.getItem('tch_sound') !== '0';
var tchSeen = {};        // ticket_id -> সর্বশেষ দেখা message_id
var tchTotalUnread = 0;
var tchAudio = null;

try { tchSeen = JSON.parse(localStorage.getItem('tch_seen') || '{}'); } catch (e) { tchSeen = {}; }

// ─────────────────────────────────────────────────────────────
// শব্দ: Web Audio API দিয়ে তৈরি — কোনো অডিও-ফাইল বা সিডিএন নয়
// ─────────────────────────────────────────────────────────────
function tchChime() {
  try {
    if (!tchAudio) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      tchAudio = new AC();
    }
    if (tchAudio.state === 'suspended') tchAudio.resume();
    var t0 = tchAudio.currentTime;
    // দুটি সুর — নরম ও মনোযোগ আকর্ষী (কানে কাটে না)
    [ [880, 0], [1174.7, 0.13] ].forEach(function (n) {
      var o = tchAudio.createOscillator();
      var g = tchAudio.createGain();
      o.type = 'sine';
      o.frequency.value = n[0];
      g.gain.setValueAtTime(0.0001, t0 + n[1]);
      g.gain.exponentialRampToValueAtTime(0.16, t0 + n[1] + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + n[1] + 0.34);
      o.connect(g); g.connect(tchAudio.destination);
      o.start(t0 + n[1]);
      o.stop(t0 + n[1] + 0.36);
    });
  } catch (e) { /* শব্দ ব্যর্থ হলে নীরবে উপেক্ষা */ }
}

function tchToggleSound() {
  tchSound = !tchSound;
  localStorage.setItem('tch_sound', tchSound ? '1' : '0');
  var btn = document.getElementById('tchSoundBtn');
  btn.setAttribute('aria-pressed', tchSound ? 'true' : 'false');
  btn.innerHTML = '<i class="fas ' + (tchSound ? 'fa-volume-high' : 'fa-volume-xmark') + '" aria-hidden="true"></i><span>' + (tchSound ? 'শব্দ চালু' : 'শব্দ বন্ধ') + '</span>';
  if (tchSound) tchChime();
}

function tchAskNotify() {
  if (!('Notification' in window)) { tchToast('এই ব্রাউজারে নোটিফিকেশন নেই'); return; }
  if (Notification.permission === 'granted') { tchToast('নোটিফিকেশন ইতিমধ্যেই চালু'); return; }
  Notification.requestPermission().then(function (p) {
    tchSetNotifyLabel(p === 'granted');
    if (p === 'granted') tchToast('নোটিফিকেশন চালু হয়েছে ✓');
  });
}
function tchSetNotifyLabel(on) {
  var el = document.getElementById('tchNotifyTxt');
  var btn = document.getElementById('tchNotifyBtn');
  if (!el || !btn) return;
  el.textContent = on ? 'নোটিফিকেশন চালু' : 'নোটিফিকেশন অন';
  btn.setAttribute('aria-pressed', on ? 'true' : 'false');
}

function tchToast(msg) {
  var t = document.createElement('div');
  t.className = 'fixed bottom-5 left-1/2 -translate-x-1/2 z-[90] bg-slate-900 border border-orange-500/40 text-orange-200 font-bold px-4 py-2.5 rounded-xl shadow-2xl text-xs';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function () { t.remove(); }, 3200);
}

// ─────────────────────────────────────────────────────────────
// তালিকা ও থ্রেড
// ─────────────────────────────────────────────────────────────
function tchEsc(s) {
  return String(s === null || s === undefined ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function tchLoad(isPoll) {
  var res = await fetch('/api/teacher-support/teacher/inbox');
  var d = await res.json().catch(function () { return { ok: false }; });
  if (!d.ok) return;

  if (!d.isTeacher && !d.isAdmin) {
    document.getElementById('tchGate').classList.remove('hidden');
    document.getElementById('tchGateMsg').textContent = tchLoggedIn
      ? 'আপনার অ্যাকাউন্টটি কোনো শিক্ষক-প্রোফাইলের সাথে যুক্ত নয়।'
      : 'এই পেজ দেখতে লগইন করতে হবে।';
    document.getElementById('tchMain').classList.add('hidden');
    return;
  }

  document.getElementById('tchMain').classList.remove('hidden');
  document.getElementById('tchGate').classList.add('hidden');

  if (d.teacher && d.teacher.name) {
    document.getElementById('tchSub').textContent = d.teacher.name + (d.teacher.subject ? ' · ' + d.teacher.subject : '');
  } else if (d.isAdmin) {
    document.getElementById('tchSub').textContent = 'অ্যাডমিন — সব চ্যাট';
  }

  var prev = {};
  tchTickets.forEach(function (t) { prev[t.id] = t.last_message_id || 0; });

  tchTickets = d.tickets || [];

  // নতুন বার্তা শনাক্ত (শুধু পোলিংয়ের সময়, প্রথম লোডে নয়)
  if (isPoll) {
    var fresh = tchTickets.filter(function (t) {
      return (t.last_message_id || 0) > (prev[t.id] || 0);
    });
    // নিজের পাঠানো বার্তায় শব্দ বাজবে না
    var incoming = fresh.filter(function (t) { return t.last_sender !== 'teacher' && t.last_sender !== 'admin'; });
    if (incoming.length) {
      if (tchSound) tchChime();
      tchToast(incoming.length + 'টি নতুন বার্তা এসেছে');
      if ('Notification' in window && Notification.permission === 'granted') {
        incoming.slice(0, 1).forEach(function (t) {
          try {
            new Notification('নতুন চ্যাট: ' + (t.student_name || 'শিক্ষার্থী'), {
              body: String(t.last_message || '').slice(0, 90),
              icon: '/static/img/logo.png'
            });
          } catch (e) { /* কিছু ব্রাউজারে ব্যর্থ হতে পারে */ }
        });
      }
    }
  }

  tchRenderList();

  if (tchActive) {
    var still = tchTickets.filter(function (t) { return String(t.id) === String(tchActive); })[0];
    if (still) tchOpenThread(tchActive, true);
  }
}

function tchUnread(t) {
  var seen = tchSeen[t.id] || 0;
  return Math.max(0, (t.last_message_id || 0) - seen);
}

function tchRenderList() {
  var box = document.getElementById('tchList');
  if (!box) return;
  if (!tchTickets.length) {
    box.innerHTML = '<div class="p-6 text-center text-xs text-slate-500">আপনার কাছে কোনো চ্যাট নেই</div>';
    document.getElementById('tchUnreadAll').classList.add('hidden');
    return;
  }
  tchTotalUnread = tchTickets.reduce(function (a, t) { return a + tchUnread(t); }, 0);
  var badge = document.getElementById('tchUnreadAll');
  if (tchTotalUnread > 0) { badge.textContent = tchTotalUnread; badge.classList.remove('hidden'); }
  else badge.classList.add('hidden');

  box.innerHTML = tchTickets.map(function (t) {
    var un = tchUnread(t);
    var who = t.last_sender === 'teacher' || t.last_sender === 'admin' ? 'আপনি: ' : '';
    var last = String(t.last_message || t.question || '').slice(0, 58);
    return '<button type="button" onclick="tchOpenThread(' + t.id + ')" '
      + 'class="w-full text-left px-3 py-2.5 hover:bg-white/5 transition '
      + (String(tchActive) === String(t.id) ? 'bg-orange-500/10 border-l-2 border-orange-500' : '') + '">'
      + '<div class="flex items-start gap-2">'
      + '<div class="min-w-0 flex-1">'
      + '<div class="flex items-center gap-1.5">'
      + '<p class="text-[11px] font-bold truncate">' + tchEsc(t.student_name || 'শিক্ষার্থী') + '</p>'
      + (un > 0 ? '<span class="ml-auto flex-shrink-0 px-1.5 py-0.5 rounded-full bg-orange-500 text-slate-950 text-[9px] font-black">' + un + '</span>' : '')
      + '</div>'
      + '<p class="text-[10px] text-slate-400 truncate mt-0.5">' + tchEsc(who + last) + '</p>'
      + '<p class="text-[9px] text-slate-500 truncate mt-0.5">' + tchEsc(t.subject || '') + (t.topic ? ' · ' + tchEsc(t.topic) : '') + '</p>'
      + '</div></div></button>';
  }).join('');
}

async function tchOpenThread(id, silent) {
  tchActive = id;
  tchRenderList();
  var t = tchTickets.filter(function (x) { return String(x.id) === String(id); })[0];
  if (t) {
    document.getElementById('tchChatTitle').textContent = t.student_name || 'শিক্ষার্থী';
    document.getElementById('tchChatMeta').textContent = (t.subject || '') + (t.topic ? ' · ' + t.topic : '') + (t.ticket_code ? ' · ' + t.ticket_code : '');
  }
  var r = await fetch('/api/teacher-support/tickets/' + id + '/messages');
  var d = await r.json().catch(function () { return { ok: false }; });
  var box = document.getElementById('tchMsgs');
  if (!d.ok || !d.messages) { box.innerHTML = '<div class="p-4 text-center text-slate-500">বার্তা লোড করা যায়নি</div>'; return; }

  box.innerHTML = d.messages.map(function (m) {
    var mine = m.sender_type === 'teacher' || m.sender_type === 'admin';
    return '<div class="flex ' + (mine ? 'justify-end' : 'justify-start') + '">'
      + '<div class="max-w-[80%] rounded-2xl px-3 py-2 ' + (mine ? 'bg-orange-500 text-slate-950' : 'bg-white/10 text-slate-100') + '">'
      + '<p class="text-[10px] font-bold opacity-70 mb-0.5">' + tchEsc(m.sender_name || (mine ? 'আপনি' : 'শিক্ষার্থী')) + '</p>'
      + '<p class="whitespace-pre-wrap break-words">' + tchEsc(m.message) + '</p>'
      + '</div></div>';
  }).join('') || '<div class="p-4 text-center text-slate-500">কোনো বার্তা নেই</div>';
  box.scrollTop = box.scrollHeight;

  // এই থ্রেডটি দেখা হয়েছে বলে চিহ্নিত
  if (d.messages.length) {
    tchSeen[id] = d.messages[d.messages.length - 1].id;
    try { localStorage.setItem('tch_seen', JSON.stringify(tchSeen)); } catch (e) {}
    tchRenderList();
  }
  if (!silent) {
    document.getElementById('tchMsgs').scrollTop = 999999;
    document.getElementById('tchInput').focus();
  }
}

function tchBack() {
  tchActive = null;
  tchRenderList();
  document.getElementById('tchChatTitle').textContent = 'একটি চ্যাট বেছে নিন';
  document.getElementById('tchChatMeta').textContent = '';
  document.getElementById('tchMsgs').innerHTML = '<div class="h-full flex items-center justify-center text-slate-500 text-center px-6">বামে থেকে একটি চ্যাট বেছে নিন</div>';
}

async function tchSend(e) {
  e.preventDefault();
  if (!tchActive) return false;
  var input = document.getElementById('tchInput');
  var msg = input.value.trim();
  if (!msg) return false;
  var btn = e.target.querySelector('button[type=submit]');
  if (btn) btn.disabled = true;
  try {
    var r = await fetch('/api/teacher-support/tickets/' + tchActive + '/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    var d = await r.json().catch(function () { return { ok: false }; });
    if (d.ok) { input.value = ''; await tchOpenThread(tchActive, true); await tchLoad(false); }
    else tchToast('বার্তা পাঠানো যায়নি');
  } catch (err) { tchToast('সংযোগে সমস্যা'); }
  if (btn) btn.disabled = false;
  return false;
}

// শুরু
tchSetNotifyLabel('Notification' in window && Notification.permission === 'granted');
if (tchSound) {
  document.getElementById('tchSoundBtn').setAttribute('aria-pressed', 'true');
} else {
  document.getElementById('tchSoundBtn').innerHTML = '<i class="fas fa-volume-xmark" aria-hidden="true"></i><span>শব্দ বন্ধ</span>';
  document.getElementById('tchSoundBtn').setAttribute('aria-pressed', 'false');
}

if (tchLoggedIn) {
  tchLoad(false);
  // প্রতি ১০ সেকেন্ডে নতুন বার্তা খোঁজা — পেজ ফোকাসে থাকলেই
  setInterval(function () {
    if (document.visibilityState === 'visible') tchLoad(true);
  }, 10000);
} else {
  document.getElementById('tchGate').classList.remove('hidden');
  document.getElementById('tchGateMsg').textContent = 'এই পেজ দেখতে লগইন করতে হবে।';
}
</script>
`,
    '',
    true,
    {
      description: 'শিক্ষকদের নিজস্ব ড্যাশবোর্ড — বরাদ্দ হওয়া চ্যাটের উত্তর দিন, নতুন বার্তায় শব্দ-সহ বিজ্ঞপ্তি পান।',
      path: '/teacher',
      noindex: true,
    },
  )
}
