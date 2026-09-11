// এডুসব — কমন লেআউট হেল্পার

// হালকা থিমের পেজগুলোকে ডার্ক পোর্টাল থিমে রূপান্তরের গ্লোবাল ওভাররাইড
export const DARK_PORTAL_CSS = ``;

// ---------------------------------------------------------------------------
// SEO / শেয়ার মেটা — প্রতিটি পেজের নিজস্ব description, canonical, og:* ও JSON-LD
// আগে HEAD_COMMON-এর মেটা অংশটি সব পেজে একই ছিল (একই description, একই og:title,
// কোনো canonical বা og:url নেই) — ফেসবুক/WhatsApp-এ শেয়ার করলে ভুল প্রিভিউ যেত।
// ---------------------------------------------------------------------------
export const SITE_ORIGIN = 'https://edusob.pages.dev'
export const SITE_BRAND = 'এডুসব | EduSob'

const DEFAULT_DESCRIPTION =
  'এডুসব — বাংলাদেশের শিক্ষার্থীদের ডিজিটাল শিক্ষা সুপার-পোর্টাল: SSC/HSC/NU রেজাল্ট, ভর্তি তথ্য, MCQ প্র্যাকটিস, প্রশ্নব্যাংক, CV মেকার ও স্কলারশিপ।'
const DEFAULT_OG_DESCRIPTION =
  'SSC · HSC · NU রেজাল্ট, ভর্তি তথ্য, MCQ, প্রশ্নব্যাংক, CV মেকার, স্কলারশিপ ও মেন্টর সহায়তা — সম্পূর্ণ ফ্রি, এক প্ল্যাটফর্মে।'
const DEFAULT_OG_IMAGE = '/static/img/hero-students.jpg'
const SITE_KEYWORDS =
  'SSC result, HSC result, NU result, রেজাল্ট, ভর্তি, MCQ, CV maker, স্কলারশিপ, বাংলাদেশ শিক্ষা'

export interface PageSeo {
  /** <meta name="description"> — ১২০–১৬০ অক্ষর, প্রতি পেজে ইউনিক */
  description?: string
  /** ক্যানোনিকাল পাথ, যেমন '/results' — og:url-ও এ থেকেই বানানো হয় */
  path?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  keywords?: string
  /** true হলে noindex, nofollow — লগইন/অ্যাডমিন/ব্যক্তিগত পেজে */
  noindex?: boolean
  /** JSON-LD স্ট্রাকচার্ড ডেটা (অবজেক্ট বা অ্যারে) */
  jsonLd?: unknown
}

const escMeta = (v: unknown): string =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** JSON-LD-কে <script>-এ বসানোর আগে </script> ইনজেকশন আটকানো */
const jsonLdBlock = (data: unknown): string =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`

export function headMeta(seo: PageSeo = {}, pageTitle = ''): string {
  const desc = seo.description || DEFAULT_DESCRIPTION
  const ogTitle = seo.ogTitle || pageTitle || 'এডুসব — শিক্ষার সব, এক ঠিকানায়'
  const ogDesc = seo.ogDescription || seo.description || DEFAULT_OG_DESCRIPTION
  const ogImage = seo.ogImage || DEFAULT_OG_IMAGE
  const url = SITE_ORIGIN + (seo.path || '/')
  const robots = seo.noindex ? 'noindex, nofollow' : 'index, follow'
  return `<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#0b0d12">
<meta name="description" content="${escMeta(desc)}">
<meta name="keywords" content="${escMeta(seo.keywords || SITE_KEYWORDS)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${escMeta(url)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE_BRAND}">
<meta property="og:locale" content="bn_BD">
<meta property="og:title" content="${escMeta(ogTitle)}">
<meta property="og:description" content="${escMeta(ogDesc)}">
<meta property="og:image" content="${escMeta(ogImage)}">
<meta property="og:url" content="${escMeta(url)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escMeta(ogTitle)}">
<meta name="twitter:description" content="${escMeta(ogDesc)}">
<meta name="twitter:image" content="${escMeta(ogImage)}">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="এডুসব">
${seo.jsonLd ? jsonLdBlock(seo.jsonLd) : ''}`
}

/** Organization + WebSite (সার্চ-অ্যাকশন সহ) — শুধু হোমপেজে */
export function orgJsonLd(): unknown[] {
  return [
    {
      '@context': 'https://schema.org', '@type': 'EducationalOrganization', name: 'এডুসব',
      alternateName: 'EduSob', url: SITE_ORIGIN + '/', logo: SITE_ORIGIN + '/static/icons/icon-192.png',
      description: DEFAULT_DESCRIPTION, inLanguage: 'bn',
      areaServed: { '@type': 'Country', name: 'Bangladesh' },
    },
    {
      '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_BRAND, url: SITE_ORIGIN + '/',
      inLanguage: 'bn',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: SITE_ORIGIN + '/?q={search_term_string}' },
        'query-input': 'required name=search_term_string',
      },
    },
  ]
}

/** WebPage + BreadcrumbList — বাকি সব পাবলিক পেজে */
export function pageJsonLd(name: string, description: string, path: string): unknown[] {
  return [
    {
      '@context': 'https://schema.org', '@type': 'WebPage', name, description,
      url: SITE_ORIGIN + path, inLanguage: 'bn',
      isPartOf: { '@type': 'WebSite', name: SITE_BRAND, url: SITE_ORIGIN + '/' },
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'হোম', item: SITE_ORIGIN + '/' },
        { '@type': 'ListItem', position: 2, name, item: SITE_ORIGIN + path },
      ],
    },
  ]
}

// ---------------------------------------------------------------------------
// স্ট্যাটিক অ্যাসেট, ফন্ট, PWA স্ক্রিপ্ট (সব পেজে একই)
// ---------------------------------------------------------------------------
export const HEAD_ASSETS = `
<link rel="manifest" href="/manifest.webmanifest">
<link rel="apple-touch-icon" href="/static/icons/icon-192.png">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎓</text></svg>">
<link href="/static/tw.css" rel="stylesheet">
<!-- ⚡ FIX(audit): FontAwesome CDN (৬৩১ KB ফন্ট + ~১০০ KB CSS) → ব্যবহৃত ২০০টি
     আইকনের সেলফ-হোস্টেড সাবসেট (১৭ KB)। কোনো 3rd-party রিকোয়েস্ট নেই। -->
<link href="/static/icons-fa/fontawesome.css" rel="stylesheet">
<!-- ⚡ FIX(perf): আইকন ফন্ট font-display:block ব্যবহার করে — অর্থাৎ ফন্ট না
     আসা পর্যন্ত ব্রাউজার আইকন *এঁকেই* দেখায় না (৩ সেকেন্ড পর্যন্ত অপেক্ষা)।
     হিরোতে আইকন থাকায় LCP-ও আটকে যায়। ১৭ KB-এর এই তিনটি সাবসেট আগেই
     প্রিলোড করলে LCP ২১৫০ms → ১৫৫০ms (মোবাইল CPU×৪ + Fast 3G, ১০ বার)।
     পরিমাপেই দেখা গেছে CLS-এ কোনো প্রভাব নেই। -->
<link rel="preload" href="/static/icons-fa/fa-solid-900.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/static/icons-fa/fa-regular-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/static/icons-fa/fa-brands-400.woff2" as="font" type="font/woff2" crossorigin>
<!-- ⚡ FIX(audit): Google Fonts CDN (৪ ফ্যামিলি, ৮০৯ KB) → সেলফ-হোস্টেড সাবসেটেড woff2 (১০১ KB)।
     কোনো 3rd-party রিকোয়েস্ট নেই → preconnect-এর প্রয়োজনই নেই। -->
<link rel="preload" href="/static/fonts/hind-siliguri-400-bengali.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/static/fonts/hind-siliguri-600-bengali.woff2" as="font" type="font/woff2" crossorigin>
<!-- বোল্ড (<strong>/font-bold) টেক্সটের জন্য — এটি না থাকলে ৭০০-ওজনের
     টেক্সট দেরিতে লোড হয়ে প্রস্থ বদলে টিকার/হেডিং-এ CLS তৈরি করত। ৭.৬ KB। -->
<link rel="preload" href="/static/fonts/hind-siliguri-700-bengali.woff2" as="font" type="font/woff2" crossorigin>
<link href="/static/fonts/fonts.css" rel="stylesheet">
<!-- ⚡ FIX(audit): axios CDN সরানো হয়েছে — নিচের fetch-ভিত্তিক shim-ই যথেষ্ট।
     এর ফলে একটি render-blocking 3rd-party রিকোয়েস্ট কমলো। -->
<script>
// এডুসব PWA: সার্ভিস ওয়ার্কার + ইনস্টল প্রম্পট + পুশ নোটিফিকেশন
window.__edusobPwa = { deferredInstall: null };
window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); window.__edusobPwa.deferredInstall = e; });
document.addEventListener('DOMContentLoaded', function(){
  if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/static/sw.js').catch(function(){}); }
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
`

/** @deprecated pageShell() নিজেই headMeta() + HEAD_ASSETS ব্যবহার করে — এটি শুধু ব্যাকওয়ার্ড কম্প্যাটিবিলিটির জন্য */
export const HEAD_COMMON = `${headMeta()}${HEAD_ASSETS}`

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
        ? `text-orange-400 bg-orange-500/10 font-bold px-3 py-1.5 rounded-xl border border-orange-500/20 ${activeExtra}`
        : `text-slate-200 hover:text-white hover:bg-white/5 font-medium px-3 py-1.5 rounded-xl transition ${base}`;
    } else {
      return isActive
        ? `text-orange-700 bg-orange-50 font-bold px-3 py-1.5 rounded-xl border border-orange-200 ${activeExtra}`
        : `text-slate-700 hover:text-orange-700 hover:bg-slate-100 font-medium px-3 py-1.5 rounded-xl transition ${base}`;
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
      <div class="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center text-slate-950 shadow-md group-hover:scale-105 transition-transform">
        <i class="fas fa-graduation-cap text-base sm:text-lg"></i>
      </div>
      <div class="flex flex-col">
        <div class="flex items-center gap-1.5">
          <span class="text-lg sm:text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight">এডুসব</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 ${isDark ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'bg-orange-100 text-orange-800'} rounded-full font-en">EduSob</span>
        </div>
        <span class="hidden sm:block text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-500'} -mt-0.5 font-medium">শিক্ষার সব, এক ঠিকানায়</span>
      </div>
    </a>

    <!-- ২. ডেস্কটপ ও ট্যাবলেট নেভিগেশন (Consistent Navigation) -->
    <nav class="hidden lg:flex items-center gap-1 text-[13px] font-semibold" aria-label="মূল মেনু">
      <a href="/results" class="${navClass('results', '')}">রেজাল্ট হাব</a>
      <a href="/admission" class="${navClass('admission', '')}">ভর্তি হাব</a>
      <a href="/scholarships" class="${navClass('scholarships', '')} flex items-center gap-1.5">
        <i class="fas fa-award text-amber-400 text-xs"></i> স্কলারশিপ
        <span class="text-[10px] ${isDark ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-amber-200 text-amber-950'} px-1.5 py-0.2 rounded font-bold">AI</span>
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
            <span class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm"><i class="fas fa-calculator"></i></span>
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
      <button type="button" onclick="edusobOpenCommandPalette()" aria-label="খুঁজুন — Ctrl/⌘ + K" title="খুঁজুন — Ctrl/⌘ + K"
        class="flex items-center gap-2 p-2 sm:px-2.5 sm:py-1.5 rounded-xl border ${isDark ? 'border-white/10 text-slate-300 hover:text-white hover:bg-white/10' : 'border-slate-200 text-slate-700 hover:bg-slate-100'} transition">
        <i class="fas fa-magnifying-glass text-sm"></i>
        <span class="hidden xl:inline text-xs font-semibold">খুঁজুন</span>
        <kbd class="hidden xl:inline text-[10px] font-black ${isDark ? 'text-slate-400 bg-white/5 border-white/10' : 'text-slate-600 bg-slate-100 border-slate-200'} border rounded px-1.5 py-0.5">⌘K</kbd>
      </button>
      ${loggedIn ? `
        <a href="/wallet" title="আমার ওয়ালেট" class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${isDark ? 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-400/20' : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'} text-xs font-bold transition">
          <i class="fas fa-wallet text-amber-400"></i>
          <span>ওয়ালেট</span>
        </a>
        <a href="/dashboard" class="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5">
          <i class="fas fa-user-graduate text-xs"></i>
          <span>ড্যাশবোর্ড</span>
        </a>
      ` : `
        <a href="/login" class="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold ${isDark ? 'text-slate-200 hover:text-white hover:bg-white/10' : 'text-slate-700 hover:text-orange-700 hover:bg-slate-100'} transition">লগইন</a>
        <a href="/signup" class="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition">ফ্রি সাইন-আপ</a>
      `}

      <!-- মোবাইল মেনু টগল বাটন -->
      <button onclick="edusobToggleSiteNav()" aria-label="মোবাইল মেনু" class="lg:hidden p-2 rounded-xl ${isDark ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'} transition">
        <i class="fas fa-bars text-lg"></i>
      </button>
    </div>
  </div>

  <!-- ৪. ইউনিফাইড মোবাইল ড্রয়ার (Unified Responsive Mobile Drawer) -->
  <div id="siteMobileDrawer" class="hidden lg:hidden border-t ${isDark ? 'border-white/10 bg-slate-950/95 text-white' : 'border-slate-200 bg-white text-slate-800'} px-4 py-4 space-y-2 text-sm font-semibold shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar">
    <a href="/" class="flex items-center gap-2.5 p-2.5 rounded-xl ${active === 'home' ? 'bg-orange-500/20 text-orange-400 font-bold' : isDark ? 'hover:bg-slate-900 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}">
      <i class="fas fa-home text-orange-500 w-5"></i> হোম পেজ
    </a>
    <a href="/results" class="flex items-center gap-2.5 p-2.5 rounded-xl ${active === 'results' ? 'bg-orange-500/20 text-orange-400 font-bold' : isDark ? 'hover:bg-slate-900 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}">
      <i class="fas fa-graduation-cap text-amber-400 w-5"></i> রেজাল্ট ও মার্কশিট হাব
    </a>
    <a href="/admission" class="flex items-center gap-2.5 p-2.5 rounded-xl ${active === 'admission' ? 'bg-orange-500/20 text-orange-400 font-bold' : isDark ? 'hover:bg-slate-900 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}">
      <i class="fas fa-door-open text-sky-400 w-5"></i> ভর্তি আবেদন ও নির্দেশিকা
    </a>
    <a href="/scholarships" class="flex items-center justify-between p-2.5 rounded-xl ${active === 'scholarships' ? 'bg-orange-500/20 text-orange-400 font-bold' : isDark ? 'hover:bg-slate-900 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}">
      <span class="flex items-center gap-2.5"><i class="fas fa-award text-amber-400 w-5"></i> স্কলারশিপ ও বৃত্তি</span>
      <span class="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">AI ম্যাচিং</span>
    </a>
    <a href="/cv" class="flex items-center justify-between p-2.5 rounded-xl ${active === 'cv' ? 'bg-orange-500/20 text-orange-400 font-bold' : isDark ? 'hover:bg-slate-900 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}">
      <span class="flex items-center gap-2.5"><i class="fas fa-file-invoice text-cyan-400 w-5"></i> প্রফেশনাল CV ও বায়োডাটা মেকার</span>
      <span class="text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold">Pro</span>
    </a>
    <a href="/mcq" class="flex items-center gap-2.5 p-2.5 rounded-xl ${active === 'mcq' ? 'bg-orange-500/20 text-orange-400 font-bold' : isDark ? 'hover:bg-slate-900 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}">
      <i class="fas fa-list-check text-amber-400 w-5"></i> বিষয়ভিত্তিক MCQ প্র্যাকটিস
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
        <a href="/dashboard" class="flex-1 text-center py-2 rounded-xl bg-orange-500 text-slate-950 font-bold text-xs">ড্যাশবোর্ড</a>
      </div>
    ` : `
      <div class="pt-2 border-t ${isDark ? 'border-white/10' : 'border-slate-200'} flex gap-2">
        <a href="/login" class="flex-1 text-center py-2 rounded-xl border ${isDark ? 'border-white/20 text-slate-200' : 'border-slate-300 text-slate-700'} font-bold text-xs">লগইন</a>
        <a href="/signup" class="flex-1 text-center py-2 rounded-xl bg-orange-500 text-slate-950 font-bold text-xs">ফ্রি সাইন-আপ</a>
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
    <a id="edusob-shop-btn" href="/shop" title="এডুসব শপ — প্রোডাক্ট ও অফার" aria-label="এডুসব শপ" class="relative flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full text-amber-300 hover:text-slate-950 hover:bg-amber-600/30 transition">
      <i class="fas fa-store text-amber-400"></i>
      <span class="hidden md:inline">শপ</span>
      <span id="edusob-shop-badge" class="hidden absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-slate-950"></span>
    </a>

    <span class="w-px h-3.5 bg-white/15"></span>

    <!-- WhatsApp বাটন -->
    <a id="edusob-wa" href="#" onclick="return edusobWa()" title="সরাসরি WhatsApp সহায়তা" aria-label="WhatsApp সাপোর্ট" class="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full text-orange-300 hover:text-slate-950 hover:bg-orange-600/30 transition">
      <i class="fab fa-whatsapp text-orange-400 text-sm"></i>
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
    <a href="/shop" class="block bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 text-center font-bold py-3 hover:opacity-90 transition">সব প্রোডাক্ট দেখুন <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
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
      if(d.link)html+='<br><a href="'+d.link+'" class="inline-block mt-1.5 bg-violet-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90">'+edusobAiEsc(d.link_text||'দেখুন')+' <i class="fas fa-arrow-right" aria-hidden="true"></i></a>';
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
      // নিরাপত্তা ফলব্যাক: কোনো কারণে IntersectionObserver ফায়ার না করলেও কনটেন্ট চিরকাল লুকানো থাকবে না
      setTimeout(function(){
        var stuck = document.querySelectorAll('.reveal-on-scroll:not(.is-revealed), .stagger-cards:not(.is-revealed), .stagger-group:not(.is-revealed)');
        for (var s = 0; s < stuck.length; s++) {
          var r = stuck[s].getBoundingClientRect();
          if (r.top < window.innerHeight + 60) stuck[s].classList.add('is-revealed');
        }
      }, 1200);
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
<nav class="mobile-app-nav" aria-label="দ্রুত নেভিগেশন">
  <a href="/" data-nav="home"><i class="fas fa-house"></i><span>হোম</span></a>
  <a href="/results" data-nav="results"><i class="fas fa-medal"></i><span>রেজাল্ট</span></a>
  <a href="/mcq" data-nav="mcq"><i class="fas fa-list-check"></i><span>MCQ</span></a>
  <a href="/cv" data-nav="cv"><i class="fas fa-file-lines"></i><span>সিভি</span></a>
  <button type="button" onclick="edusobMobileMore()" aria-label="পুরো মেনু খুলুন"><i class="fas fa-bars"></i><span>মেনু</span></button>
</nav>
<script>
function edusobMobileMore(){
  var d = document.getElementById('siteMobileDrawer') || document.getElementById('mobileNav');
  if (d) { d.classList.toggle('hidden'); }
  else { window.scrollTo({ top: 0, behavior: 'smooth' }); }
}
(function(){
  if (document.body) document.body.classList.add('landing-mobile-nav');
  var map = { '/': 'home', '/results': 'results', '/board-challenge': 'results', '/mcq': 'mcq', '/cv': 'cv', '/cv-maker': 'cv' };
  var key = map[location.pathname] || '';
  if (!key) return;
  var el = document.querySelector('.mobile-app-nav [data-nav="' + key + '"]');
  if (el) el.classList.add('nav-active');
})();
</script>
`
}

// ============ ⌘K কমান্ড প্যালেট (Command Palette) ============
// যেকোনো পেজ থেকে Ctrl/⌘ + K — পেজ, টুল ও কাজ এক জায়গায় খোঁজা যায়।
export function commandPalette(): string {
  return `
<div id="cmdRoot" class="fixed inset-0 z-[100] hidden" role="dialog" aria-modal="true" aria-label="কমান্ড প্যালেট">
  <div id="cmdBackdrop" class="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"></div>
  <div class="absolute inset-x-0 top-0 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-[8vh] sm:w-full sm:max-w-xl sm:px-4">
    <div class="bg-slate-900 border border-white/10 shadow-2xl sm:rounded-2xl overflow-hidden">
      <div class="flex items-center gap-3 px-4 h-14 border-b border-white/10">
        <i class="fas fa-magnifying-glass text-slate-400 text-sm shrink-0"></i>
        <input id="cmdInput" type="text" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true"
               aria-controls="cmdList" aria-autocomplete="list" placeholder="পেজ, টুল বা কাজ খুঁজুন…"
               class="flex-1 min-w-0 bg-transparent text-[16px] sm:text-sm text-white placeholder-slate-500 outline-none border-0">
        <kbd class="hidden sm:inline-flex text-[10px] font-black text-slate-400 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 shrink-0">ESC</kbd>
      </div>
      <ul id="cmdList" role="listbox" aria-label="কমান্ড" class="max-h-[65vh] sm:max-h-[52vh] overflow-y-auto py-1.5"></ul>
      <div class="flex items-center gap-3 px-4 py-2 border-t border-white/10 text-[10px] text-slate-500">
        <span>↑↓ চলুন</span><span>↵ নির্বাচন</span><span>Esc বন্ধ</span>
        <span class="ml-auto hidden sm:inline">Ctrl/⌘ + K</span>
      </div>
    </div>
  </div>
</div>
<script>
// ============ ⌘K কমান্ড প্যালেট (Command Palette) ============
// যেকোনো পেজ থেকে Ctrl/⌘ + K — পেজ, টুল ও কাজ এক জায়গায়।
// প্রথমবার খোলার সময় /api/me দিয়ে বুঝি ইউজার লগইন / অ্যাডমিন কি না (ফলব্যাক: শুধু পেজ কমান্ড)।

const CMDS = [
  { t: 'হোম পেজ', h: 'এডুসব প্রথম পাতা', g: 'পেজ', i: 'fa-home', u: '/', k: 'home হোম প্রথম' },
  { t: 'রেজাল্ট হাব', h: 'SSC · HSC · NU ফলাফল ও মার্কশিট', g: 'পেজ', i: 'fa-graduation-cap', u: '/results', k: 'result results রেজাল্ট ফলাফল marksheet' },
  { t: 'MCQ পরীক্ষা', h: 'বিষয়ভিত্তিক প্র্যাকটিস টেস্ট', g: 'পেজ', i: 'fa-list-check', u: '/mcq', k: 'mcq quiz টেস্ট পরীক্ষা প্রশ্ন' },
  { t: 'ভর্তি হাব', h: 'কলেজ ও বিশ্ববিদ্যালয়ে ভর্তি তথ্য', g: 'পেজ', i: 'fa-door-open', u: '/admission', k: 'admission ভর্তি এডমিশন' },
  { t: 'স্কলারশিপ ও বৃত্তি', h: 'AI ম্যাচিং সহ বৃত্তির খোঁজ', g: 'পেজ', i: 'fa-award', u: '/scholarships', k: 'scholarship স্কলারশিপ বৃত্তি' },
  { t: 'প্রশ্নব্যাংক PDF', h: 'বিগত বছরের প্রশ্ন ও সমাধান', g: 'পেজ', i: 'fa-file-pdf', u: '/qpapers', k: 'qpapers question paper প্রশ্নব্যাংক' },
  { t: 'সিলেবাস', h: 'নতুন কারিকুলামের পূর্ণ সিলেবাস', g: 'পেজ', i: 'fa-book-open', u: '/syllabus', k: 'syllabus সিলেবাস পাঠ্যক্রম' },
  { t: 'নোটিস বোর্ড', h: 'বোর্ড ও শিক্ষা মন্ত্রণালয়ের নোটিশ', g: 'পেজ', i: 'fa-bullhorn', u: '/notices', k: 'notice নোটিশ বিজ্ঞপ্তি' },
  { t: 'চাকরির খবর', h: 'সরকারি ও বেসরকারি চাকরি', g: 'পেজ', i: 'fa-briefcase', u: '/jobs', k: 'job চাকরি নিয়োগ সার্কুলার' },
  { t: 'শিক্ষা সংবাদ', h: 'শিক্ষাজগতের সর্বশেষ খবর', g: 'পেজ', i: 'fa-newspaper', u: '/news', k: 'news খবর সংবাদ' },
  { t: 'শিক্ষক ও মেন্টর সহায়তা', h: '১৫-৩০ মিনিটে প্রশ্নের উত্তর', g: 'পেজ', i: 'fa-chalkboard-user', u: '/teacher-support', k: 'teacher মেন্টর শিক্ষক প্রশ্ন' },
  { t: 'প্রফেশনাল CV মেকার', h: 'বায়োডাটা তৈরি ও ডাউনলোড', g: 'পেজ', i: 'fa-file-invoice', u: '/cv', k: 'cv resume বায়োডাটা সিভি' },
  { t: 'স্টাডি প্ল্যানার', h: 'রুটিন, টাস্ক ও সিলেবাস ট্র্যাকার', g: 'পেজ', i: 'fa-calendar-check', u: '/planner', k: 'planner রুটিন প্ল্যানার টাস্ক' },
  { t: 'CGPA ক্যালকুলেটর', h: 'ভার্সিটি ও কলেজ গ্রেড হিসাব', g: 'পেজ', i: 'fa-calculator', u: '/cgpa', k: 'cgpa gpa গ্রেড হিসাব' },
  { t: 'বোর্ড চ্যালেঞ্জ গাইড', h: 'খাতা পুনঃনিরীক্ষণ নির্দেশিকা', g: 'পেজ', i: 'fa-scale-balanced', u: '/board-challenge', k: 'challenge বোর্ড চ্যালেঞ্জ পুনঃনিরীক্ষণ' },
  { t: 'আবেদন সহায়তা', h: 'ফর্ম পূরণে আমাদের সহায়তা', g: 'পেজ', i: 'fa-hands-helping', u: '/assisted', k: 'assisted আবেদন সহায়তা ফর্ম' },
  { t: 'এডুসব শপ', h: 'বই, নোট ও স্টাডি গ্যাজেট', g: 'পেজ', i: 'fa-store', u: '/shop', k: 'shop বই নোট গ্যাজেট' },
  { t: 'প্রশাসন', h: 'এডমিন কন্ট্রোল সেন্টার', g: 'প্রশাসন', i: 'fa-shield-halved', u: '/admin', k: 'admin প্রশাসন কন্ট্রোল', admin: true },
  { t: 'আমার ড্যাশবোর্ড', h: 'স্টাডি হাব, লক্ষ্য ও মিশন', g: 'আমার অ্যাকাউন্ট', i: 'fa-compass', u: '/dashboard', k: 'dashboard ড্যাশবোর্ড হাব', auth: true },
  { t: 'আমার প্রোফাইল', h: 'তথ্য, ছবি ও শিক্ষা বিবরণ', g: 'আমার অ্যাকাউন্ট', i: 'fa-id-card', u: '/profile', k: 'profile প্রোফাইল তথ্য ছবি', auth: true },
  { t: 'আমার ওয়ালেট', h: 'ব্যালেন্স, টপ-আপ ও লেনদেন', g: 'আমার অ্যাকাউন্ট', i: 'fa-wallet', u: '/wallet', k: 'wallet ওয়ালেট টাকা টপআপ ব্যালেন্স', auth: true },
  { t: 'সাবস্ক্রিপশন', h: 'প্ল্যান ও মেম্বারশিপ বিস্তারিত', g: 'আমার অ্যাকাউন্ট', i: 'fa-crown', u: '/subscription', k: 'subscription সাবস্ক্রিপশন প্ল্যান মেম্বারশিপ', auth: true },
  { t: 'লগইন', h: 'অ্যাকাউন্টে ঢুকুন', g: 'অ্যাকাউন্ট', i: 'fa-right-to-bracket', u: '/login', k: 'login লগইন সাইনইন', guest: true },
  { t: 'ফ্রি সাইন-আপ', h: 'নতুন অ্যাকাউন্ট খুলুন', g: 'অ্যাকাউন্ট', i: 'fa-user-plus', u: '/signup', k: 'signup সাইনআপ রেজিস্ট্রেশন নতুন', guest: true },
  { t: 'রেজাল্ট দেখুন', h: 'রোল ও রেজি. দিয়ে ফলাফল', g: 'কাজ', i: 'fa-magnifying-glass', a: 'result', k: 'result রেজাল্ট ফলাফল দেখুন' },
  { t: 'সংরক্ষিত রোল', h: 'সেভ করা রোল ও রেজি.', g: 'কাজ', i: 'fa-bookmark', a: 'saved', k: 'saved roll সেভ রোল সংরক্ষিত' },
  { t: 'ওয়ালেটে টাকা যোগ করুন', h: 'ক্যাশ-ইন ও টপ-আপ রিকোয়েস্ট', g: 'কাজ', i: 'fa-money-bill-transfer', a: 'addmoney', k: 'add money টপআপ ক্যাশইন টাকা যোগ' },
  { t: 'অনবোর্ডিং বোনাস ক্লেইম', h: 'শুরুর ধাপ শেষ করে ৳৭০ পর্যন্ত', g: 'কাজ', i: 'fa-gift', a: 'bonus', k: 'bonus বোনাস অনবোর্ডিং ক্লেইম gift', auth: true },
  { t: 'রেফারেল লিংক কপি', h: 'বন্ধুকে আমন্ত্রণ জানান', g: 'কাজ', i: 'fa-users-rays', a: 'refcopy', k: 'referral রেফারেল লিংক কপি আমন্ত্রণ', auth: true },
  { t: 'লগআউট', h: 'এই ডিভাইস থেকে বের হোন', g: 'অ্যাকাউন্ট', i: 'fa-right-from-bracket', a: 'logout', k: 'logout লগআউট বের', auth: true }
]

function cmdScore(q, c) {
  if (!q) return 1
  const t = c.t.toLowerCase()
  const hay = (c.t + ' ' + c.h + ' ' + (c.k || '')).toLowerCase()
  if (t.indexOf(q) === 0) return 100
  if (t.indexOf(q) > -1) return 80
  if (hay.indexOf(q) > -1) return 50
  let i = 0
  for (let n = 0; n < hay.length; n++) { if (hay[n] === q[i]) i++; if (i === q.length) return 20 }
  return 0
}

function cmdGo(u) { window.location.href = u }

const CMD_ACTIONS = {
  result: function () {
    if (typeof window.openResultModal === 'function') window.openResultModal()
    else cmdGo('/results')
  },
  saved: function () {
    if (typeof window.setDashTab === 'function') { try { sessionStorage.setItem('edusob.dash.tab', 'exams') } catch (e) {} cmdGo('/dashboard') }
    else cmdGo('/results')
  },
  addmoney: function () {
    if (typeof window.openAddMoneyModal === 'function') window.openAddMoneyModal()
    else cmdGo('/wallet')
  },
  bonus: function () {
    if (typeof window.claimOnboarding === 'function') window.claimOnboarding()
    else cmdGo('/dashboard')
  },
  refcopy: function () {
    if (typeof window.copyRefLink === 'function') window.copyRefLink()
    else cmdGo('/dashboard')
  },
  logout: function () {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' } })
      .then(function () { window.location.href = '/' })
      .catch(function () { window.location.href = '/' })
  }
}

var CMD_STATE = { open: false, items: [], idx: 0, lastFocus: null, me: null, meLoaded: false }

function cmdVisible(c) {
  if (c.admin) return !!(CMD_STATE.me && CMD_STATE.me.user && CMD_STATE.me.user.role === 'admin')
  if (c.auth) return !!(CMD_STATE.me && CMD_STATE.me.user)
  if (c.guest) return !(CMD_STATE.me && CMD_STATE.me.user)
  return true
}

function cmdRender() {
  const input = document.getElementById('cmdInput')
  const list = document.getElementById('cmdList')
  if (!input || !list) return
  const q = (input.value || '').trim().toLowerCase()
  const scored = []
  for (let i = 0; i < CMDS.length; i++) {
    const c = CMDS[i]
    if (!cmdVisible(c)) continue
    const sc = cmdScore(q, c)
    if (sc > 0) scored.push({ c: c, sc: sc, n: i })
  }
  scored.sort(function (a, b) { return b.sc - a.sc || a.n - b.n })
  CMD_STATE.items = scored.slice(0, 40)
  if (CMD_STATE.idx >= CMD_STATE.items.length) CMD_STATE.idx = 0

  if (!CMD_STATE.items.length) {
    list.innerHTML = '<li class="px-4 py-8 text-center text-xs text-slate-400">কিছু পাওয়া যায়নি — অন্য কিছু লিখে চেষ্টা করুন</li>'
    return
  }
  let html = ''
  let lastGroup = ''
  for (let i = 0; i < CMD_STATE.items.length; i++) {
    const it = CMD_STATE.items[i]
    if (it.c.g !== lastGroup) {
      lastGroup = it.c.g
      html += '<li class="px-4 pt-2.5 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-500"></li>'
    }
    html += '<li role="option" id="cmd-opt-' + i + '" data-idx="' + i + '" aria-selected="' + (i === CMD_STATE.idx) + '"' +
      ' class="mx-1.5 flex items-center gap-3 px-2.5 py-2.5 rounded-xl cursor-pointer ' +
      (i === CMD_STATE.idx ? 'bg-orange-500/15 text-slate-950' : 'text-slate-200 hover:bg-white/5') + '">' +
      '<span class="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] shrink-0 ' +
      (i === CMD_STATE.idx ? 'bg-orange-500/25 text-orange-300' : 'bg-white/5 text-slate-400') + '"><i class="fas ' + it.c.i + '"></i></span>' +
      '<span class="min-w-0 flex-1"><span class="block text-[13px] font-semibold truncate"></span>' +
      '<span class="block text-[11px] text-slate-400 truncate"></span></span>' +
      (it.c.u ? '<i class="fas fa-arrow-right text-[10px] text-slate-500 shrink-0"></i>' : '<span class="text-[10px] font-black text-slate-500 shrink-0">ENTER</span>') +
      '</li>'
  }
  list.innerHTML = html
  // টেক্সট textContent দিয়ে বসাই — ইউজার-ডেটা বা কোটেশন দিয়ে HTML ভাঙার কোনো সুযোগ নেই
  for (let i = 0; i < CMD_STATE.items.length; i++) {
    const li = list.querySelector('li[data-idx="' + i + '"]')
    if (!li) continue
    const spans = li.querySelectorAll('span.min-w-0 > span')
    if (spans.length === 2) { spans[0].textContent = CMD_STATE.items[i].c.t; spans[1].textContent = CMD_STATE.items[i].c.h }
  }
  const heads = list.querySelectorAll('li.uppercase')
  const groups = []
  for (let i = 0; i < CMD_STATE.items.length; i++) if (groups.indexOf(CMD_STATE.items[i].c.g) === -1) groups.push(CMD_STATE.items[i].c.g)
  for (let i = 0; i < heads.length && i < groups.length; i++) heads[i].textContent = groups[i]

  const active = list.querySelector('li[data-idx="' + CMD_STATE.idx + '"]')
  if (active) {
    input.setAttribute('aria-activedescendant', active.id)
    const lb = list.getBoundingClientRect(), ab = active.getBoundingClientRect()
    if (ab.bottom > lb.bottom) list.scrollTop += ab.bottom - lb.bottom
    else if (ab.top < lb.top) list.scrollTop -= lb.top - ab.top
  }
}

function cmdRun(i) {
  const it = CMD_STATE.items[i]
  if (!it) return
  edusobCloseCommandPalette()
  if (it.c.a && CMD_ACTIONS[it.c.a]) CMD_ACTIONS[it.c.a]()
  else if (it.c.u) cmdGo(it.c.u)
}

function edusobOpenCommandPalette() {
  if (CMD_STATE.open) return
  const root = document.getElementById('cmdRoot')
  const input = document.getElementById('cmdInput')
  if (!root || !input) return
  CMD_STATE.open = true
  CMD_STATE.lastFocus = document.activeElement
  root.classList.remove('hidden')
  document.body.style.overflow = 'hidden'
  input.value = ''
  CMD_STATE.idx = 0
  cmdRender()
  setTimeout(function () { input.focus() }, 10)
  if (!CMD_STATE.meLoaded) {
    CMD_STATE.meLoaded = true
    fetch('/api/me', { credentials: 'same-origin' })
      .then(function (r) { return r.json() })
      .then(function (d) { CMD_STATE.me = d || null; if (CMD_STATE.open) cmdRender() })
      .catch(function () {})
  }
}

function edusobCloseCommandPalette() {
  if (!CMD_STATE.open) return
  CMD_STATE.open = false
  const root = document.getElementById('cmdRoot')
  if (root) root.classList.add('hidden')
  document.body.style.overflow = ''
  if (CMD_STATE.lastFocus && CMD_STATE.lastFocus.focus) CMD_STATE.lastFocus.focus()
}

document.addEventListener('keydown', function (e) {
  const k = (e.key || '').toLowerCase()
  if ((e.ctrlKey || e.metaKey) && k === 'k') { e.preventDefault(); edusobOpenCommandPalette(); return }
  if (!CMD_STATE.open) {
    const ae = document.activeElement
    const typing = ae && (/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName) || ae.isContentEditable)
    if (k === '/' && !typing) { e.preventDefault(); edusobOpenCommandPalette() }
    return
  }
  if (k === 'escape') { e.preventDefault(); edusobCloseCommandPalette(); return }
  if (k === 'arrowdown') { e.preventDefault(); if (CMD_STATE.items.length) { CMD_STATE.idx = (CMD_STATE.idx + 1) % CMD_STATE.items.length; cmdRender() } return }
  if (k === 'arrowup') { e.preventDefault(); if (CMD_STATE.items.length) { CMD_STATE.idx = (CMD_STATE.idx - 1 + CMD_STATE.items.length) % CMD_STATE.items.length; cmdRender() } return }
  if (k === 'enter') { e.preventDefault(); cmdRun(CMD_STATE.idx); return }
  if (k === 'tab') {
    const f = document.getElementById('cmdRoot').querySelectorAll('input, li[role="option"]')
    if (f.length) { e.preventDefault(); f[0].focus() }
  }
})

document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById('cmdInput')
  const list = document.getElementById('cmdList')
  const root = document.getElementById('cmdRoot')
  if (!input || !list || !root) return
  input.addEventListener('input', function () { CMD_STATE.idx = 0; cmdRender() })
  list.addEventListener('mousemove', function (e) {
    const li = e.target.closest ? e.target.closest('li[data-idx]') : null
    if (li) { const i = Number(li.getAttribute('data-idx')); if (i !== CMD_STATE.idx) { CMD_STATE.idx = i; cmdRender() } }
  })
  list.addEventListener('click', function (e) {
    const li = e.target.closest ? e.target.closest('li[data-idx]') : null
    if (li) cmdRun(Number(li.getAttribute('data-idx')))
  })
  root.addEventListener('mousedown', function (e) { if (e.target.id === 'cmdRoot' || e.target.id === 'cmdBackdrop') edusobCloseCommandPalette() })
})

</script>
`
}

// ---------- XSS নিরাপত্তা: সার্ভার-সাইড HTML এস্কেপ (FIX — audit) ----------
// ইউজার-সরবরাহকৃত যেকোনো মান (নাম, ইউজার কোড, ঠিকানা...) HTML-এ বসানোর আগে
// অবশ্যই এটি দিয়ে এস্কেপ করতে হবে। ব্যবহার: ${escHtml(user.name_bn)}
export function escHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;')
}

export function pageShell(
  title: string,
  bodyClass: string,
  content: string,
  extraHead = '',
  showFloating = true,
  seo: PageSeo = {},
): string {
  // JSON-LD আলাদা করে না দিলে title + description + path থেকে নিজেই বানিয়ে নেয়
  // noindex পেজে JSON-LD দেওয়ার কোনো মানে হয় না (সার্চ ইঞ্জিন সেটি ইনডেক্স করবে না)
  const jsonLd = seo.noindex
    ? undefined
    : seo.jsonLd ?? (seo.path ? (seo.path === '/' ? orgJsonLd() : pageJsonLd(title, seo.description || '', seo.path)) : undefined)
  return `<!DOCTYPE html>
<html lang="bn">
<head>
<title>${escHtml(title)} — এডুসব | EduSob</title>
${headMeta({ ...seo, jsonLd }, title)}
${HEAD_ASSETS}
${extraHead}
</head>
<body class="${bodyClass}">
${content}
${showFloating ? floatingButtons() : ''}
${commandPalette()}
</body>
</html>`
}
