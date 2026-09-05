// এডুসব — কমন লেআউট হেল্পার

// হালকা থিমের পেজগুলোকে ডার্ক পোর্টাল থিমে রূপান্তরের গ্লোবাল ওভাররাইড
export const DARK_PORTAL_CSS = `
<style>
body { background:#0b0d12 !important; color:#e2e8f0 !important; }
.bg-white { background-color:#121620 !important; }
.bg-slate-50 { background-color:#0d1017 !important; }
.bg-slate-100 { background-color:#121620 !important; }
.text-slate-900 { color:#f1f5f9 !important; }
.text-slate-800 { color:#e2e8f0 !important; }
.text-slate-700 { color:#cbd5e1 !important; }
.text-slate-600 { color:#94a3b8 !important; }
.border-slate-200, .border-slate-300, .border-slate-100 { border-color:rgba(255,255,255,.09) !important; }
.bg-emerald-50 { background-color:rgba(249,115,22,.08) !important; }
.bg-emerald-100 { background-color:rgba(249,115,22,.14) !important; }
.text-emerald-700, .text-emerald-800 { color:#fb923c !important; }
.bg-pink-50 { background-color:rgba(236,72,153,.08) !important; }
.bg-orange-50 { background-color:rgba(249,115,22,.08) !important; }
.bg-indigo-50 { background-color:rgba(129,140,248,.08) !important; }
.bg-sky-50 { background-color:rgba(56,189,248,.08) !important; }
.bg-amber-50 { background-color:rgba(251,191,36,.08) !important; }
.bg-teal-50 { background-color:rgba(45,212,191,.08) !important; }
.bg-purple-50 { background-color:rgba(168,85,247,.08) !important; }
input:not([type=checkbox]):not([type=radio]):not([type=file]), select, textarea { background-color:#0b0d12 !important; color:#f1f5f9 !important; border-color:rgba(255,255,255,.12) !important; }
input::placeholder, textarea::placeholder { color:#475569 !important; }
::selection { background:#f97316; color:#0b0d12; }
.shop-header { background:rgba(11,13,18,.88) !important; border-color:rgba(255,255,255,.1) !important; }
</style>`

export const HEAD_COMMON = `
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#0b0d12">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="এডুসব">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="apple-touch-icon" href="/static/icons/icon-192.png">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎓</text></svg>">
<link href="/static/tw.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;600;700&family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
<style>
/* এডুসব ব্র্যান্ড ইউনিফিকেশন — emerald অ্যাকসেন্ট → টেরাকোটা অরেঞ্জ, গ্রেডিয়েন্ট পার্টনার teal → amber */
html { scroll-behavior: smooth; }
.bg-emerald-400 { background-color:#fb923c !important; }
.bg-emerald-500 { background-color:#f97316 !important; }
.bg-emerald-600 { background-color:#ea580c !important; }
.bg-emerald-700 { background-color:#c2410c !important; }
.bg-emerald-50 { background-color:rgba(249,115,22,.07) !important; }
.bg-emerald-100 { background-color:rgba(249,115,22,.14) !important; }
.bg-emerald-500\/10 { background-color:rgba(249,115,22,.10) !important; }
.bg-emerald-500\/15 { background-color:rgba(249,115,22,.15) !important; }
.bg-emerald-500\/20 { background-color:rgba(249,115,22,.18) !important; }
.bg-emerald-500\/25 { background-color:rgba(249,115,22,.25) !important; }
.bg-emerald-500\/30 { background-color:rgba(249,115,22,.30) !important; }
.text-emerald-100 { color:#fed7aa !important; }
.text-emerald-200 { color:#fdba74 !important; }
.text-emerald-300, .text-emerald-400, .text-emerald-500 { color:#fb923c !important; }
.text-emerald-600, .text-emerald-700 { color:#f97316 !important; }
.text-emerald-800 { color:#fb923c !important; }
.border-emerald-300 { border-color:#fdba74 !important; }
.border-emerald-400 { border-color:rgba(251,146,60,.55) !important; }
.border-emerald-500 { border-color:#f97316 !important; }
.border-emerald-400\/20 { border-color:rgba(251,146,60,.20) !important; }
.border-emerald-400\/30 { border-color:rgba(251,146,60,.30) !important; }
.border-emerald-400\/40 { border-color:rgba(251,146,60,.40) !important; }
.border-emerald-500\/20 { border-color:rgba(249,115,22,.20) !important; }
.border-emerald-500\/30 { border-color:rgba(249,115,22,.30) !important; }
.border-emerald-500\/40 { border-color:rgba(249,115,22,.40) !important; }
.border-emerald-500\/50 { border-color:rgba(249,115,22,.50) !important; }
.hover\:bg-emerald-400:hover { background-color:#fb923c !important; }
.hover\:bg-emerald-500:hover { background-color:#f97316 !important; }
.hover\:bg-emerald-600:hover { background-color:#ea580c !important; }
.hover\:bg-emerald-700:hover { background-color:#c2410c !important; }
.hover\:bg-emerald-500\/10:hover { background-color:rgba(249,115,22,.10) !important; }
.hover\:bg-emerald-500\/20:hover { background-color:rgba(249,115,22,.22) !important; }
.hover\:bg-emerald-500\/30:hover { background-color:rgba(249,115,22,.30) !important; }
.hover\:text-emerald-300:hover { color:#fdba74 !important; }
.hover\:text-emerald-400:hover { color:#fb923c !important; }
.hover\:border-emerald-400:hover { border-color:rgba(251,146,60,.55) !important; }
.hover\:border-emerald-500:hover { border-color:#f97316 !important; }
.hover\:border-emerald-500\/40:hover { border-color:rgba(249,115,22,.40) !important; }
.hover\:border-emerald-500\/50:hover { border-color:rgba(249,115,22,.50) !important; }
.from-emerald-400 { --tw-gradient-from:#fb923c !important; --tw-gradient-stops:var(--tw-gradient-from), var(--tw-gradient-to, rgba(251,146,60,0)) !important; }
.from-emerald-500 { --tw-gradient-from:#f97316 !important; --tw-gradient-stops:var(--tw-gradient-from), var(--tw-gradient-to, rgba(249,115,22,0)) !important; }
.from-emerald-600 { --tw-gradient-from:#ea580c !important; --tw-gradient-stops:var(--tw-gradient-from), var(--tw-gradient-to, rgba(234,88,12,0)) !important; }
.from-emerald-700 { --tw-gradient-from:#c2410c !important; --tw-gradient-stops:var(--tw-gradient-from), var(--tw-gradient-to, rgba(194,65,12,0)) !important; }
.to-teal-400 { --tw-gradient-to:#fbbf24 !important; }
.to-teal-500 { --tw-gradient-to:#f59e0b !important; }
.to-teal-600 { --tw-gradient-to:#d97706 !important; }
.via-emerald-500 { --tw-gradient-via:#f97316 !important; --tw-gradient-stops:var(--tw-gradient-from), #f97316, var(--tw-gradient-to, rgba(249,115,22,0)) !important; }
.ring-emerald-500\/30, .ring-emerald-400\/30 { --tw-ring-color:rgba(249,115,22,.35) !important; }
.shadow-emerald-500\/20 { --tw-shadow-color:rgba(249,115,22,.25) !important; }
</style>
<script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
<script>
// এডুসব PWA: সার্ভিস ওয়ার্কার + ইনস্টল প্রম্পট + পুশ নোটিফিকেশন
window.__edusobPwa = { deferredInstall: null };
window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); window.__edusobPwa.deferredInstall = e; });
document.addEventListener('DOMContentLoaded', function(){
  if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').catch(function(){}); }
  var dismissed = localStorage.getItem('edusob_pwa_dismissed');
  // নতুন ব্যবহারকারীকে তৎক্ষণাৎ বিরক্ত না করে ৫ সেকেন্ড পর এবং শুধুমাত্র যদি আগে বরখাস্ত না করে থাকে
  if (!dismissed) {
    setTimeout(function(){
      showPwaBanner();
    }, 5000);
  }
});
function showPwaBanner(){
  if (document.getElementById('pwa-banner')) return;
  var dismissed = localStorage.getItem('edusob_pwa_dismissed');
  if (dismissed) return;
  var canInstall = !!window.__edusobPwa.deferredInstall;
  var canPush = ('Notification' in window) && Notification.permission === 'default';
  if (!canInstall && !canPush) return;
  var b = document.createElement('div');
  b.id = 'pwa-banner';
  b.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:70;background:#121620;border:1px solid rgba(249,115,22,.35);border-radius:16px;padding:10px 16px;display:flex;gap:10px;align-items:center;box-shadow:0 10px 40px rgba(0,0,0,.5);max-width:92vw;flex-wrap:wrap;justify-content:center;animation:fadeIn 0.3s ease';
  var btns = '';
  if (canInstall) btns += '<button onclick="pwaInstall()" style="background:#f97316;color:#fff;font-weight:700;font-size:12px;padding:6px 14px;border-radius:999px;border:none;cursor:pointer">📱 ইনস্টল</button>';
  if (canPush) btns += '<button onclick="pwaEnablePush()" style="background:rgba(255,255,255,.08);color:#fdba74;font-weight:700;font-size:12px;padding:6px 14px;border-radius:999px;border:1px solid rgba(249,115,22,.3);cursor:pointer">🔔 নোটিফিকেশন</button>';
  b.innerHTML = '<span style="color:#e2e8f0;font-size:12px;font-weight:600">এডুসব অ্যাপ</span>' + btns + '<button onclick="pwaDismiss()" title="বন্ধ করুন" style="color:#94a3b8;font-size:16px;border:none;background:none;cursor:pointer;padding:4px">✕</button>';
  document.body.appendChild(b);
}
function pwaDismiss(){ var b=document.getElementById('pwa-banner'); if(b) b.remove(); localStorage.setItem('edusob_pwa_dismissed','1'); }
function pwaInstall(){
  var p = window.__edusobPwa.deferredInstall;
  if (!p) return;
  p.prompt();
  p.userChoice.then(function(){ window.__edusobPwa.deferredInstall = null; pwaDismiss(); });
}
function pwaEnablePush(){
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) { pwaDismiss(); return; }
  Notification.requestPermission().then(function(perm){
    if (perm !== 'granted') { pwaDismiss(); return; }
    axios.get('/api/push/vapid-key').then(function(r){
      if (!r.data || !r.data.ok) { pwaDismiss(); return; }
      var key = r.data.key;
      var raw = atob(key.replace(/-/g,'+').replace(/_/g,'/'));
      var arr = new Uint8Array(raw.length);
      for (var i=0;i<raw.length;i++) arr[i]=raw.charCodeAt(i);
      navigator.serviceWorker.ready.then(function(reg){
        reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: arr }).then(function(sub){
          var j = sub.toJSON();
          axios.post('/api/push/subscribe', { endpoint: j.endpoint, keys: j.keys }).then(function(){
            pwaDismiss();
            new Notification('এডুসব', { body: 'নোটিফিকেশন চালু হয়েছে! রেজাল্ট ও নোটিস এলেই জানিয়ে দেব 🎓', icon: '/static/icons/icon-192.png' });
          });
        }).catch(function(){ pwaDismiss(); });
      });
    }).catch(function(){ pwaDismiss(); });
  });
}
</script>
<script>
// EduSob Resilient Network Layer: Fallback for axios using native Fetch API
(function(){
  function buildUrl(url, params) {
    if (!params || typeof params !== 'object') return url;
    var q = Object.keys(params).filter(function(k){ return params[k] !== undefined && params[k] !== null; })
      .map(function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); }).join('&');
    if (!q) return url;
    return url + (url.indexOf('?') === -1 ? '?' : '&') + q;
  }
  function request(cfg) {
    var url = typeof cfg === 'string' ? cfg : cfg.url;
    var opts = typeof cfg === 'string' ? {} : (cfg || {});
    var method = (opts.method || 'GET').toUpperCase();
    var fullUrl = buildUrl(url, opts.params);
    var headers = Object.assign({}, opts.headers || {});
    var fetchOpts = { method: method, headers: headers };
    if (opts.data !== undefined && opts.data !== null && method !== 'GET' && method !== 'HEAD') {
      if (typeof opts.data === 'string') {
        fetchOpts.body = opts.data;
      } else if (typeof FormData !== 'undefined' && opts.data instanceof FormData) {
        fetchOpts.body = opts.data;
        delete headers['Content-Type'];
      } else {
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
        fetchOpts.body = JSON.stringify(opts.data);
      }
    }
    return fetch(fullUrl, fetchOpts).then(function(res) {
      return res.text().then(function(text) {
        var parsed;
        try { parsed = JSON.parse(text); } catch(e) { parsed = text; }
        var response = { data: parsed, status: res.status, statusText: res.statusText, headers: res.headers, config: opts };
        if (!res.ok) {
          var msg = (parsed && (parsed.error || parsed.message)) || ('Request failed with status ' + res.status);
          var err = new Error(msg);
          err.response = response;
          throw err;
        }
        return response;
      });
    });
  }
  var ax = function(cfg) { return request(cfg); };
  ax.get = function(url, cfg) { return request(Object.assign({}, cfg || {}, { url: url, method: 'GET' })); };
  ax.post = function(url, data, cfg) { return request(Object.assign({}, cfg || {}, { url: url, method: 'POST', data: data })); };
  ax.put = function(url, data, cfg) { return request(Object.assign({}, cfg || {}, { url: url, method: 'PUT', data: data })); };
  ax.delete = function(url, cfg) { return request(Object.assign({}, cfg || {}, { url: url, method: 'DELETE' })); };
  ax.all = Promise.all.bind(Promise);
  ax.spread = function(fn) { return function(arr) { return fn.apply(null, arr); }; };
  ax.create = function(defaultCfg) { return ax; };
  if (!window.axios) window.axios = ax;
  setTimeout(function(){ if (!window.axios) window.axios = ax; }, 800);
})();
</script>
<style>
html { 
  scroll-behavior: smooth; 
  overflow-x: hidden; 
  width: 100%; 
  max-width: 100vw;
  -webkit-text-size-adjust: 100%;
}
body { 
  overflow-x: hidden; 
  width: 100%; 
  max-width: 100vw; 
  min-height: 100vh; 
  margin: 0; 
  padding: 0;
}
*, *::before, *::after { 
  box-sizing: border-box; 
}
img, svg, video, canvas, audio, iframe, embed, object {
  max-width: 100%;
  height: auto;
}
pre, code, table {
  max-width: 100%;
}
* { font-family: 'Hind Siliguri', 'Plus Jakarta Sans', sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
.font-en { font-family: 'Plus Jakarta Sans', sans-serif; }
/* Refined Micro-Interactions & Surfaces */
.card-hover { 
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease !important; 
  position: relative; 
  will-change: transform, box-shadow;
}
@media (hover: hover) and (pointer: fine) {
  .card-hover:hover { 
    transform: translateY(-4px); 
    box-shadow: 0 16px 36px -10px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(16, 185, 129, 0.25) !important; 
  }
}
.card-hover:active {
  transform: translateY(-1px) scale(0.985);
}

/* 1. Scroll Section Reveal */
.reveal-on-scroll {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, transform;
}
.reveal-on-scroll.is-revealed {
  opacity: 1 !important;
  transform: translateY(0) !important;
}

/* 2. Staggered Card Entrance / Elevation */
.stagger-cards > *,
.stagger-group .stagger-item {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), 
              transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), 
              box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), 
              border-color 0.25s ease;
  will-change: opacity, transform;
}
.is-revealed.stagger-cards > *,
.is-revealed .stagger-cards > *,
.is-revealed .stagger-item,
.stagger-item.is-revealed {
  opacity: 1 !important;
  transform: translateY(0) !important;
}
.is-revealed.stagger-cards > *:nth-child(1), .is-revealed .stagger-item:nth-child(1) { transition-delay: 0.04s; }
.is-revealed.stagger-cards > *:nth-child(2), .is-revealed .stagger-item:nth-child(2) { transition-delay: 0.08s; }
.is-revealed.stagger-cards > *:nth-child(3), .is-revealed .stagger-item:nth-child(3) { transition-delay: 0.12s; }
.is-revealed.stagger-cards > *:nth-child(4), .is-revealed .stagger-item:nth-child(4) { transition-delay: 0.16s; }
.is-revealed.stagger-cards > *:nth-child(5), .is-revealed .stagger-item:nth-child(5) { transition-delay: 0.20s; }
.is-revealed.stagger-cards > *:nth-child(6), .is-revealed .stagger-item:nth-child(6) { transition-delay: 0.24s; }
.is-revealed.stagger-cards > *:nth-child(7), .is-revealed .stagger-item:nth-child(7) { transition-delay: 0.28s; }
.is-revealed.stagger-cards > *:nth-child(8), .is-revealed .stagger-item:nth-child(8) { transition-delay: 0.32s; }
.is-revealed.stagger-cards > *:nth-child(9), .is-revealed .stagger-item:nth-child(9) { transition-delay: 0.36s; }
.is-revealed.stagger-cards > *:nth-child(10), .is-revealed .stagger-item:nth-child(10) { transition-delay: 0.40s; }
.is-revealed.stagger-cards > *:nth-child(11), .is-revealed .stagger-item:nth-child(11) { transition-delay: 0.44s; }
.is-revealed.stagger-cards > *:nth-child(12), .is-revealed .stagger-item:nth-child(12) { transition-delay: 0.48s; }

/* 3. Dynamic Sticky Scroll Navbar */
header.sticky {
  transition: padding 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
              background-color 0.3s ease, 
              border-color 0.3s ease, 
              box-shadow 0.3s ease, 
              backdrop-filter 0.3s ease !important;
}
header.sticky.scrolled-nav {
  padding-top: 0.45rem !important;
  padding-bottom: 0.45rem !important;
  backdrop-filter: blur(20px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 4px 10px -2px rgba(15, 23, 42, 0.04) !important;
  border-color: rgba(226, 232, 240, 0.95) !important;
}
/* Dark styled headers on scroll */
header.sticky.scrolled-nav.dark-nav,
.dark header.sticky.scrolled-nav,
header.sticky.scrolled-nav[class*="bg-slate-950"],
header.sticky.scrolled-nav[class*="bg-slate-900"] {
  background-color: rgba(15, 23, 42, 0.95) !important;
  border-color: rgba(255, 255, 255, 0.14) !important;
  box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.5) !important;
}

/* 4. Micro-Interactions: Press-down, Icon Shift & Focus Ring */
button, a[role="button"], .btn-touch {
  transition: transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.16s ease, background-color 0.16s ease, color 0.16s ease;
}
button:active, a[role="button"]:active, .btn-touch:active {
  transform: scale(0.965);
}
.hover-arrow, .group-hover-arrow {
  display: inline-block;
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
.group:hover .hover-arrow, :hover > .hover-arrow, .group:hover .group-hover-arrow {
  transform: translateX(4px);
}

/* Reduced motion accessibility */
@media (prefers-reduced-motion: reduce) {
  .reveal-on-scroll,
  .stagger-cards > *,
  .stagger-group .stagger-item,
  .card-hover,
  header.sticky {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
.shiny-card { position: relative; transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.25); }
.shiny-card:hover { border-color: rgba(52, 211, 153, 0.4); box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.35); }
.glass-panel { background: rgba(255, 255, 255, 0.04); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); }
.glass-panel-light { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(226, 232, 240, 0.8); }
.shiny-glow-emerald { border: 1px solid rgba(16, 185, 129, 0.25); }
.shiny-glow-emerald:hover { border-color: rgba(52, 211, 153, 0.6); box-shadow: 0 12px 28px -6px rgba(16, 185, 129, 0.25); }
.shiny-glow-amber { border: 1px solid rgba(245, 158, 11, 0.25); }
.shiny-glow-amber:hover { border-color: rgba(245, 158, 11, 0.6); box-shadow: 0 12px 28px -6px rgba(245, 158, 11, 0.25); }
.shiny-glow-blue { border: 1px solid rgba(59, 130, 246, 0.25); }
.shiny-glow-blue:hover { border-color: rgba(59, 130, 246, 0.6); box-shadow: 0 12px 28px -6px rgba(59, 130, 246, 0.25); }
@keyframes floaty { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
.floaty { animation: floaty 4s ease-in-out infinite; }
@keyframes pulse-soft { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .75; transform: scale(0.97); } }
.pulse-soft { animation: pulse-soft 2.5s infinite ease-in-out; }
.awning-stripe { background: repeating-linear-gradient(45deg, #dc2626 0 14px, #fff 14px 28px); }
@keyframes sb-pop { 0% { transform: scale(.92) translateY(16px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
.sb-pop { animation: sb-pop .3s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
.ticker-track { animation: ticker 35s linear infinite; }
.ticker-track:hover { animation-play-state: paused; }
/* Custom refined scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4); border-radius: 9999px; }
::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.7); }
.no-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* Dark UI Text Contrast & Visual Hierarchy Polish */
.dark, [class*="bg-slate-950"], [class*="bg-slate-900"] {
  color: #f8fafc;
}
/* Ensure secondary text never drops below WCAG AA contrast against dark canvases */
[class*="bg-slate-950"] .text-slate-400,
[class*="bg-slate-900"] .text-slate-400,
[class*="bg-slate-950"] .text-slate-500,
[class*="bg-slate-900"] .text-slate-500 {
  color: #cbd5e1 !important; /* High-contrast readable slate-300 tone */
}
[class*="bg-slate-950"] .text-slate-600,
[class*="bg-slate-900"] .text-slate-600 {
  color: #94a3b8 !important; /* slate-400 */
}
</style>
`

// ============ ইউনিফাইড সাইট হেডার (Unified Header System) ============
export interface SiteHeaderOptions {
  activeKey?: string; // 'home' | 'results' | 'admission' | 'scholarships' | 'cv' | 'mcq' | 'teacher' | 'planner' | 'cgpa' | 'shop'
  loggedIn?: boolean;
  theme?: 'dark' | 'light';
  titleBadge?: string;
}

export function siteHeader(options: SiteHeaderOptions = {}): string {
  const isDark = options.theme !== 'light';
  const loggedIn = !!options.loggedIn;
  const active = options.activeKey || '';

  const navClass = (key: string, base: string, activeExtra = '') => {
    const isActive = active === key;
    if (isDark) {
      return isActive 
        ? `text-emerald-400 bg-emerald-500/10 font-bold px-3 py-1.5 rounded-xl border border-emerald-500/20 ${activeExtra}`
        : `text-slate-200 hover:text-white hover:bg-white/5 font-medium px-3 py-1.5 rounded-xl transition ${base}`;
    } else {
      return isActive
        ? `text-emerald-700 bg-emerald-50 font-bold px-3 py-1.5 rounded-xl border border-emerald-200 ${activeExtra}`
        : `text-slate-700 hover:text-emerald-700 hover:bg-slate-100 font-medium px-3 py-1.5 rounded-xl transition ${base}`;
    }
  };

  const bgStyle = isDark
    ? 'bg-slate-950/85 backdrop-blur-xl border-b border-white/10 text-white shadow-xs'
    : 'bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-slate-900 shadow-xs';

  return `
<header class="sticky top-0 z-40 ${bgStyle} transition-all duration-200">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
    <!-- ১. ব্র‍্যান্ড লোগো (Consistent Identity) -->
    <a href="/" class="flex items-center gap-2.5 sm:gap-3 group shrink-0" aria-label="এডুসব হোম">
      <div class="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
        <i class="fas fa-graduation-cap text-base sm:text-lg"></i>
      </div>
      <div class="flex flex-col">
        <div class="flex items-center gap-1.5">
          <span class="text-lg sm:text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight">এডুসব</span>
          <span class="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 ${isDark ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800'} rounded-full font-en">EduSob</span>
        </div>
        <span class="hidden sm:block text-[10px] ${isDark ? 'text-slate-300' : 'text-slate-500'} -mt-0.5 font-medium">শিক্ষার সব, এক ঠিকানায়</span>
      </div>
    </a>

    <!-- ২. ডেস্কটপ ও ট্যাবলেট নেভিগেশন (Consistent Navigation) -->
    <nav class="hidden lg:flex items-center gap-1 text-[13px] font-semibold" aria-label="মূল মেনু">
      <a href="/results" class="${navClass('results', '')}">রেজাল্ট হাব</a>
      <a href="/admission" class="${navClass('admission', '')}">ভর্তি হাব</a>
      <a href="/scholarships" class="${navClass('scholarships', '')} flex items-center gap-1.5">
        <i class="fas fa-award text-amber-400 text-xs"></i> স্কলারশিপ
        <span class="text-[9px] ${isDark ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-amber-200 text-amber-950'} px-1.5 py-0.2 rounded font-bold">AI</span>
      </a>
      <a href="/cv" class="${navClass('cv', '')} flex items-center gap-1.5">
        <i class="fas fa-file-invoice text-cyan-400 text-xs"></i> সিভি মেকার Pro
      </a>
      <a href="/mcq" class="${navClass('mcq', '')}">MCQ পরীক্ষা</a>

      <!-- টুলস ও সেবা ড্রপডাউন -->
      <div class="relative group">
        <button class="${navClass('tools', 'flex items-center gap-1.5 cursor-pointer')}">
          <span>টুলস ও সেবা</span>
          <i class="fas fa-chevron-down text-[10px] text-slate-400 group-hover:rotate-180 transition-transform"></i>
        </button>
        <div class="absolute left-0 mt-2 w-64 ${isDark ? 'bg-slate-900 border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-800'} rounded-2xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
          <a href="/teacher-support" class="flex items-center gap-3 px-4 py-2.5 text-xs ${isDark ? 'hover:bg-slate-800 text-amber-300' : 'hover:bg-amber-50 text-amber-900'} font-bold">
            <span class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm">👨‍🏫</span>
            <div>
              <p>শিক্ষক ও মেন্টর সহায়তা</p>
              <p class="text-[10px] ${isDark ? 'text-slate-300' : 'text-slate-500'} font-normal">১৫-৩০ মিনিটে প্রশ্ন সমাধান</p>
            </div>
          </a>
          <a href="/planner" class="flex items-center gap-3 px-4 py-2.5 text-xs ${isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}">
            <span class="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm"><i class="fas fa-calendar-check"></i></span>
            <div>
              <p class="font-bold">স্টাডি প্ল্যানার ও নোট</p>
              <p class="text-[10px] ${isDark ? 'text-slate-300' : 'text-slate-500'} font-normal">রুটিন ও সিলেবাস ট্র্যাকার</p>
            </div>
          </a>
          <a href="/cgpa" class="flex items-center gap-3 px-4 py-2.5 text-xs ${isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}">
            <span class="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm"><i class="fas fa-calculator"></i></span>
            <div>
              <p class="font-bold">CGPA ক্যালকুলেটর</p>
              <p class="text-[10px] ${isDark ? 'text-slate-300' : 'text-slate-500'} font-normal">ভার্সিটি ও কলেজ গ্রেড হিসাব</p>
            </div>
          </a>
          <a href="/board-challenge" class="flex items-center gap-3 px-4 py-2.5 text-xs ${isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}">
            <span class="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center text-sm"><i class="fas fa-scale-balanced"></i></span>
            <div>
              <p class="font-bold">বোর্ড চ্যালেঞ্জ গাইড</p>
              <p class="text-[10px] ${isDark ? 'text-slate-300' : 'text-slate-500'} font-normal">খাতা পুনঃনিরীক্ষণ নির্দেশিকা</p>
            </div>
          </a>
          <a href="/shop" class="feature-shop-link flex items-center gap-3 px-4 py-2.5 text-xs ${isDark ? 'hover:bg-slate-800 text-amber-300' : 'hover:bg-amber-50 text-amber-800'} font-semibold border-t ${isDark ? 'border-white/5' : 'border-slate-100'} mt-1 pt-2">
            <span class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm"><i class="fas fa-store"></i></span>
            <div>
              <p class="font-bold">এডুসব শপ</p>
              <p class="text-[10px] ${isDark ? 'text-slate-300' : 'text-slate-500'} font-normal">বই, নোট ও স্টাডি গ্যাজেট</p>
            </div>
          </a>
        </div>
      </div>
    </nav>

    <!-- ৩. ডানপাশের অ্যাকশন গ্রুপ ও অথেনটিকেশন (Consistent Action Group) -->
    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
      ${loggedIn ? `
        <a href="/wallet" title="আমার ওয়ালেট" class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${isDark ? 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-400/20' : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'} text-xs font-bold transition">
          <i class="fas fa-wallet text-amber-400"></i>
          <span>ওয়ালেট</span>
        </a>
        <a href="/dashboard" class="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5">
          <i class="fas fa-user-graduate text-xs"></i>
          <span>ড্যাশবোর্ড</span>
        </a>
      ` : `
        <a href="/login" class="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold ${isDark ? 'text-slate-200 hover:text-white hover:bg-white/10' : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-100'} transition">লগইন</a>
        <a href="/signup" class="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition">ফ্রি সাইন-আপ</a>
      `}

      <!-- মোবাইল মেনু টগল বাটন -->
      <button onclick="edusobToggleSiteNav()" aria-label="মোবাইল মেনু" class="lg:hidden p-2 rounded-xl ${isDark ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'} transition">
        <i class="fas fa-bars text-lg"></i>
      </button>
    </div>
  </div>

  <!-- ৪. ইউনিফাইড মোবাইল ড্রয়ার (Unified Responsive Mobile Drawer) -->
  <div id="siteMobileDrawer" class="hidden lg:hidden border-t ${isDark ? 'border-white/10 bg-slate-950/95 text-white' : 'border-slate-200 bg-white text-slate-800'} px-4 py-4 space-y-2 text-sm font-semibold shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar">
    <a href="/" class="flex items-center gap-2.5 p-2.5 rounded-xl ${active === 'home' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : isDark ? 'hover:bg-slate-900 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}">
      <i class="fas fa-home text-emerald-500 w-5"></i> হোম পেজ
    </a>
    <a href="/results" class="flex items-center gap-2.5 p-2.5 rounded-xl ${active === 'results' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : isDark ? 'hover:bg-slate-900 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}">
      <i class="fas fa-graduation-cap text-amber-400 w-5"></i> রেজাল্ট ও মার্কশিট হাব
    </a>
    <a href="/admission" class="flex items-center gap-2.5 p-2.5 rounded-xl ${active === 'admission' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : isDark ? 'hover:bg-slate-900 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}">
      <i class="fas fa-door-open text-sky-400 w-5"></i> ভর্তি আবেদন ও নির্দেশিকা
    </a>
    <a href="/scholarships" class="flex items-center justify-between p-2.5 rounded-xl ${active === 'scholarships' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : isDark ? 'hover:bg-slate-900 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}">
      <span class="flex items-center gap-2.5"><i class="fas fa-award text-amber-400 w-5"></i> স্কলারশিপ ও বৃত্তি</span>
      <span class="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">AI ম্যাচিং</span>
    </a>
    <a href="/cv" class="flex items-center justify-between p-2.5 rounded-xl ${active === 'cv' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : isDark ? 'hover:bg-slate-900 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}">
      <span class="flex items-center gap-2.5"><i class="fas fa-file-invoice text-cyan-400 w-5"></i> প্রফেশনাল CV ও বায়োডাটা মেকার</span>
      <span class="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">Pro</span>
    </a>
    <a href="/mcq" class="flex items-center gap-2.5 p-2.5 rounded-xl ${active === 'mcq' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : isDark ? 'hover:bg-slate-900 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}">
      <i class="fas fa-list-check text-teal-400 w-5"></i> বিষয়ভিত্তিক MCQ প্র্যাকটিস
    </a>
    <a href="/teacher-support" class="flex items-center justify-between p-2.5 rounded-xl ${isDark ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 'bg-amber-50 text-amber-900 border border-amber-200'} font-bold">
      <span class="flex items-center gap-2.5"><i class="fas fa-chalkboard-user text-amber-500 w-5"></i> শিক্ষক ও মেন্টর সহায়তা</span>
      <span class="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-black">১৫-৩০ মি.</span>
    </a>
    <a href="/planner" class="flex items-center gap-2.5 p-2.5 rounded-xl ${isDark ? 'hover:bg-slate-900 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}">
      <i class="fas fa-calendar-check text-purple-400 w-5"></i> স্টাডি প্ল্যানার ও সিলেবাস
    </a>
    <a href="/shop" class="feature-shop-link flex items-center gap-2.5 p-2.5 rounded-xl ${isDark ? 'hover:bg-slate-900 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}">
      <i class="fas fa-store text-amber-400 w-5"></i> এডুসব শপ
    </a>
    ${loggedIn ? `
      <div class="pt-2 border-t ${isDark ? 'border-white/10' : 'border-slate-200'} flex gap-2">
        <a href="/wallet" class="flex-1 text-center py-2 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">ওয়ালেট</a>
        <a href="/dashboard" class="flex-1 text-center py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">ড্যাশবোর্ড</a>
      </div>
    ` : `
      <div class="pt-2 border-t ${isDark ? 'border-white/10' : 'border-slate-200'} flex gap-2">
        <a href="/login" class="flex-1 text-center py-2 rounded-xl border ${isDark ? 'border-white/20 text-slate-200' : 'border-slate-300 text-slate-700'} font-bold text-xs">লগইন</a>
        <a href="/signup" class="flex-1 text-center py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">ফ্রি সাইন-আপ</a>
      </div>
    `}
  </div>
</header>
<script>
function edusobToggleSiteNav(){
  var drawer = document.getElementById('siteMobileDrawer');
  if(drawer) drawer.classList.toggle('hidden');
}
</script>
`
}

// ============ স্লিক মিনিমাল ফ্লোটিং ডক (Non-intrusive Minimalist Floating Pill Dock) ============
export function floatingButtons(): string {
  return `
<!-- এডুসব স্লিক ফ্লোটিং ডক: স্ক্রিন বা কনটেন্ট ব্লক করে না -->
<aside id="edusobActionDock" aria-label="দ্রুত সেবা ও সহায়তা" class="fixed bottom-4 right-4 sm:bottom-5 sm:right-6 z-40 transition-all duration-300">
  <div class="inline-flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-full bg-slate-950/85 hover:bg-slate-950/95 backdrop-blur-xl border border-white/15 shadow-xl transition-all group">
    <!-- AI সহকারী বাটন -->
    <button onclick="edusobToggleAI()" title="এডুসব AI সহকারী" aria-label="AI সহকারী" class="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full text-violet-300 hover:text-white hover:bg-violet-600/30 transition">
      <i class="fas fa-sparkles text-violet-400"></i>
      <span class="hidden md:inline">AI সহায়তা</span>
    </button>
    
    <span class="w-px h-3.5 bg-white/15"></span>

    <!-- শপ বাটন (স্মার্ট ব্যাজসহ) -->
    <a id="edusob-shop-btn" href="/shop" title="এডুসব শপ — প্রোডাক্ট ও অফার" aria-label="এডুসব শপ" class="relative flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full text-amber-300 hover:text-white hover:bg-amber-600/30 transition">
      <i class="fas fa-store text-amber-400"></i>
      <span class="hidden md:inline">শপ</span>
      <span id="edusob-shop-badge" class="hidden absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-slate-950"></span>
    </a>

    <span class="w-px h-3.5 bg-white/15"></span>

    <!-- WhatsApp বাটন -->
    <a id="edusob-wa" href="#" onclick="return edusobWa()" title="সরাসরি WhatsApp সহায়তা" aria-label="WhatsApp সাপোর্ট" class="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full text-emerald-300 hover:text-white hover:bg-emerald-600/30 transition">
      <i class="fab fa-whatsapp text-emerald-400 text-sm"></i>
      <span class="hidden md:inline">হেল্প</span>
    </a>

    <!-- গ্লোবাল স্ক্রোল-টু-টপ বাটন (২০০px স্ক্রোলে অটো দৃশ্যমান হয়) -->
    <button id="edusobGlobalScrollTop" onclick="window.scrollTo({top:0,behavior:'smooth'})" title="পৃষ্ঠার শীর্ষে ফিরে যান" aria-label="পৃষ্ঠার শীর্ষে যান" class="hidden items-center justify-center w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition ml-0.5">
      <i class="fas fa-arrow-up text-xs"></i>
    </button>
  </div>
</aside>

<div id="edusobSignboard" class="hidden fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onclick="if(event.target===this)edusobSbClose()">
  <div class="sb-pop bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
    <div class="awning-stripe h-8 relative">
      <div class="absolute inset-x-0 -bottom-2 flex justify-center gap-0">
        <span class="w-1/5 h-3 awning-stripe rounded-b-full"></span><span class="w-1/5 h-3 awning-stripe rounded-b-full"></span><span class="w-1/5 h-3 awning-stripe rounded-b-full"></span><span class="w-1/5 h-3 awning-stripe rounded-b-full"></span><span class="w-1/5 h-3 awning-stripe rounded-b-full"></span>
      </div>
    </div>
    <div class="px-5 pt-6 pb-2 flex items-center justify-between">
      <p class="font-bold text-lg text-slate-800">🛒 এডুসব শপ — বিশেষ অফার!</p>
      <button onclick="edusobSbClose()" class="text-slate-400 hover:text-slate-700 text-xl leading-none">&times;</button>
    </div>
    <div id="edusobSbList" class="px-5 pb-4 space-y-2 max-h-72 overflow-y-auto"></div>
    <a href="/shop" class="block bg-gradient-to-r from-amber-500 to-orange-600 text-white text-center font-bold py-3 hover:opacity-90 transition">সব প্রোডাক্ট দেখুন →</a>
  </div>
</div>

<div id="edusobAiPopup" class="hidden fixed bottom-16 sm:bottom-20 right-3 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-96 max-w-sm bg-white rounded-2xl shadow-2xl border border-violet-200 overflow-hidden flex flex-col h-[70vh] max-h-[500px]">
  <div class="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
    <p class="font-bold"><i class="fas fa-sparkles mr-2"></i>এডুসব AI সহকারী</p>
    <button onclick="edusobToggleAI()" class="hover:opacity-70"><i class="fas fa-times"></i></button>
  </div>
  <div id="edusobAiMsgs" class="flex-1 overflow-y-auto p-3 space-y-2 text-sm bg-slate-50">
    <div class="bg-violet-100 text-slate-700 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%]">👋 আমি এডুসব AI! সাইট ব্যবহার বা পড়াশোনা — যেকোনো প্রশ্ন করুন।</div>
  </div>
  <div id="edusobAiChips" class="px-3 py-2 flex flex-wrap gap-1.5 border-t border-slate-100 shrink-0">
    <button onclick="edusobAiAsk('SSC রেজাল্ট কীভাবে দেখবো?')" class="text-[11px] bg-slate-100 hover:bg-violet-100 px-2.5 py-1 rounded-full text-slate-700">রেজাল্ট দেখবো</button>
    <button onclick="edusobAiAsk('CV বানাতে চাই')" class="text-[11px] bg-slate-100 hover:bg-violet-100 px-2.5 py-1 rounded-full text-slate-700">CV বানাবো</button>
    <button onclick="edusobAiAsk('ওয়ালেটে টাকা যোগ করবো কীভাবে?')" class="text-[11px] bg-slate-100 hover:bg-violet-100 px-2.5 py-1 rounded-full text-slate-700">ওয়ালেট টপ-আপ</button>
    <button onclick="edusobAiAsk('MCQ পরীক্ষা দেবো')" class="text-[11px] bg-slate-100 hover:bg-violet-100 px-2.5 py-1 rounded-full text-slate-700">MCQ পরীক্ষা</button>
  </div>
  <form onsubmit="return edusobAiSend(event)" class="p-3 border-t border-slate-200 flex gap-2 shrink-0">
    <input id="edusobAiInput" maxlength="500" placeholder="প্রশ্ন লিখুন..." class="flex-1 border border-slate-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-violet-500 text-slate-800" autocomplete="off">
    <button type="submit" id="edusobAiSendBtn" aria-label="পাঠান" class="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white w-10 h-10 rounded-full shrink-0 hover:opacity-90 flex items-center justify-center"><i class="fas fa-paper-plane text-xs"></i></button>
  </form>
</div>
<script>
function edusobToggleAI(){
  var p=document.getElementById('edusobAiPopup');p.classList.toggle('hidden');
  if(!p.classList.contains('hidden'))document.getElementById('edusobAiInput').focus();
}
function edusobAiEsc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}
function edusobAiBubble(html,me){
  var m=document.getElementById('edusobAiMsgs'),d=document.createElement('div');
  d.className=me?'bg-violet-600 text-white rounded-2xl rounded-tr-sm px-3 py-2 max-w-[85%] ml-auto':'bg-violet-100 text-slate-700 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%]';
  d.innerHTML=html;m.appendChild(d);m.scrollTop=m.scrollHeight;return d;
}
function edusobAiAsk(q){document.getElementById('edusobAiInput').value=q;edusobAiSend()}
var edusobAiBusy=false;
function edusobAiSend(e){
  if(e)e.preventDefault();
  if(edusobAiBusy)return false;
  var inp=document.getElementById('edusobAiInput'),msg=inp.value.trim();
  if(!msg)return false;
  inp.value='';edusobAiBusy=true;
  edusobAiBubble(edusobAiEsc(msg),true);
  var typing=edusobAiBubble('<i class="fas fa-ellipsis fa-fade"></i>',false);
  fetch('/api/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg})})
    .then(function(r){return r.json()})
    .then(function(d){
      var html=edusobAiEsc(d.answer||'সমস্যা হয়েছে, আবার চেষ্টা করুন');
      if(d.link)html+='<br><a href="'+d.link+'" class="inline-block mt-1.5 bg-violet-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90">'+edusobAiEsc(d.link_text||'দেখুন')+' →</a>';
      typing.innerHTML=html;
    })
    .catch(function(){typing.innerHTML='নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন 😅'})
    .finally(function(){edusobAiBusy=false});
  return false;
}
var edusobWaNum='';
var edusobWaGroup='';
function edusobWa(){
  if(edusobWaGroup){window.open(edusobWaGroup,'_blank');return false}
  if(edusobWaNum){window.open('https://wa.me/88'+edusobWaNum.replace(/[^\d]/g,''),'_blank');return false}
  window.open('https://wa.me/8801835414122','_blank');return false;
}
function edusobSbClose(){document.getElementById('edusobSignboard').classList.add('hidden')}
function edusobFabToggle(){
  var items=document.getElementById('edusobFabItems'),icon=document.getElementById('edusobFabIcon');
  var open=items.classList.contains('hidden');
  if(open){items.classList.remove('hidden');items.classList.add('flex');icon.style.transform='rotate(45deg)'}
  else{items.classList.add('hidden');items.classList.remove('flex');icon.style.transform=''}
}
function edusobTk(n){return '৳'+Number(n).toLocaleString('bn-BD')}
(function(){
  fetch('/api/settings/public').then(function(r){return r.json()}).then(function(d){
    if(d && d.ok){
      if(d.social){
        if(d.social.whatsapp_number) edusobWaNum = d.social.whatsapp_number;
        if(d.social.whatsapp_group) edusobWaGroup = d.social.whatsapp_group;
      }
      // Features On/Off (Shop, etc.)
      var shopOn = !d.features || d.features.shop_enabled !== false;
      var shopBtn = document.getElementById('edusob-shop-btn');
      if(shopBtn) shopBtn.style.display = shopOn ? '' : 'none';
      var navShopLinks = document.querySelectorAll('.feature-shop-link');
      navShopLinks.forEach(function(el){ el.style.display = shopOn ? '' : 'none'; });

      // Community & WhatsApp Action Pill
      var waOn = !d.cards || (d.cards.card_community_wa !== false || d.cards.card_community_help !== false);
      var waBtn = document.getElementById('edusob-wa');
      if(waBtn) waBtn.style.display = waOn ? '' : 'none';

      // Landing Footer Social Links (Live sync with Admin Controls)
      var landingFb = document.getElementById('landingFb');
      if(landingFb) {
        if(d.social && d.social.facebook) landingFb.href = d.social.facebook;
        landingFb.style.display = (!d.cards || d.cards.card_community_fb !== false) && (d.social && d.social.facebook && d.social.facebook.trim() !== '') ? '' : 'none';
      }
      var landingYt = document.getElementById('landingYt');
      if(landingYt) {
        if(d.social && d.social.youtube) landingYt.href = d.social.youtube;
        landingYt.style.display = (!d.cards || d.cards.card_community_yt !== false) && (d.social && d.social.youtube && d.social.youtube.trim() !== '') ? '' : 'none';
      }
      var landingTg = document.getElementById('landingTg');
      if(landingTg) {
        if(d.social && d.social.telegram) landingTg.href = d.social.telegram;
        landingTg.style.display = (!d.cards || d.cards.card_community_tg !== false) && (d.social && d.social.telegram && d.social.telegram.trim() !== '') ? '' : 'none';
      }
      var landingWa = document.getElementById('landingWa');
      if(landingWa) {
        if(d.social && d.social.whatsapp_group) landingWa.href = d.social.whatsapp_group;
        landingWa.style.display = (!d.cards || d.cards.card_community_wa !== false) && (d.social && d.social.whatsapp_group && d.social.whatsapp_group.trim() !== '') ? '' : 'none';
      }

      // If shop is enabled, fetch signboard products
      if (shopOn) {
        fetch('/api/shop/signboard').then(function(r){return r.json()}).then(function(sd){
          if(!sd.ok||!sd.products||!sd.products.length)return;
          var badge=document.getElementById('edusob-shop-badge');
          if(badge){badge.textContent=sd.products.length;badge.classList.remove('hidden')}
          var fb=document.getElementById('edusob-fab-badge');
          if(fb){fb.textContent=sd.products.length;fb.classList.remove('hidden')}
          // নোটিফিকেশন ব্যাজ আপডেট হবে, তবে ব্যবহারকারীকে জোরপূর্বক পপআপ দেখিয়ে রিডিং ব্যাহত করা হবে না
          var list=document.getElementById('edusobSbList');
          if(!list) return;
          list.innerHTML=sd.products.map(function(p){
            var offer=p.offer_price?'<span class="absolute -top-1.5 -left-1.5 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full rotate-[-6deg]">অফার!</span>':'';
            var price=p.offer_price?'<span class="line-through text-slate-400 text-xs mr-1">'+edusobTk(p.price)+'</span><span class="text-red-600 font-bold">'+edusobTk(p.offer_price)+'</span>':'<span class="font-bold text-slate-700">'+edusobTk(p.price)+'</span>';
            return '<a href="/shop" class="relative flex items-center gap-3 bg-amber-50 hover:bg-amber-100 rounded-xl p-3 transition">'+offer+'<span class="text-3xl">'+(p.image_url||'📦')+'</span><span class="flex-1 min-w-0"><span class="block text-sm font-semibold text-slate-800 truncate">'+p.name_bn+'</span><span class="text-sm">'+price+'</span></span></a>'
          }).join('');
        }).catch(function(){});
      }
    }
  }).catch(function(){});
  fetch('/api/shop/settings').then(function(r){return r.json()}).then(function(d){
    if(d.ok&&d.settings&&d.settings.whatsapp_number&&!edusobWaNum)edusobWaNum=d.settings.whatsapp_number
  }).catch(function(){});
})();

// EduSob Global Interaction Engine (Scroll Reveal, Staggered Cards & Dynamic Navbar)
(function(){
  function initEduSobInteractions(){
    // 1. Dynamic Scroll Sticky Navbar & Scroll-to-Top Button
    var navbars = document.querySelectorAll('header.sticky');
    var globalScrollBtn = document.getElementById('edusobGlobalScrollTop');
    var isScrolledLast = null;
    function checkScroll(){
      var scrollY = window.scrollY || window.pageYOffset || 0;
      var isScrolled = scrollY > 15;
      if (isScrolled !== isScrolledLast) {
        isScrolledLast = isScrolled;
        for (var i = 0; i < navbars.length; i++) {
          if (isScrolled) {
            navbars[i].classList.add('scrolled-nav');
          } else {
            navbars[i].classList.remove('scrolled-nav');
          }
        }
      }
      if (globalScrollBtn) {
        if (scrollY > 250) {
          globalScrollBtn.classList.remove('hidden');
          globalScrollBtn.classList.add('flex');
        } else {
          globalScrollBtn.classList.add('hidden');
          globalScrollBtn.classList.remove('flex');
        }
      }
    }
    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();

    // 2. IntersectionObserver for Reveal-on-Scroll & Staggered Cards
    if ('IntersectionObserver' in window) {
      var revealObserver = new IntersectionObserver(function(entries, obs){
        entries.forEach(function(entry){
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.05,
        rootMargin: '0px 0px -25px 0px'
      });

      var targets = document.querySelectorAll('.reveal-on-scroll, .stagger-cards, .stagger-group, main > section:not(:first-child), #about-section, #services-section, #faq-section, #guide-section, #contact-section, .dash-card-item');
      for (var j = 0; j < targets.length; j++) {
        var el = targets[j];
        if (!el.classList.contains('reveal-on-scroll') && !el.classList.contains('stagger-cards') && !el.classList.contains('stagger-group')) {
          el.classList.add('reveal-on-scroll');
        }
        revealObserver.observe(el);
      }
    } else {
      var allTargets = document.querySelectorAll('.reveal-on-scroll, .stagger-cards, .stagger-group, main > section, .dash-card-item');
      for (var k = 0; k < allTargets.length; k++) {
        allTargets[k].classList.add('is-revealed');
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEduSobInteractions);
  } else {
    initEduSobInteractions();
  }
})();
</script>
`
}

export function pageShell(title: string, bodyClass: string, content: string, extraHead = ''): string {
  return `<!DOCTYPE html>
<html lang="bn">
<head>
<title>${title} — এডুসব | EduSob</title>
${HEAD_COMMON}
${extraHead}
</head>
<body class="${bodyClass}">
${content}
${floatingButtons()}
</body>
</html>`
}
