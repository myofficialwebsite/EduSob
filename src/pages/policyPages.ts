/**
 * নীতিমালা পেজ (গোপনীয়তা · শর্তাবলী · পেমেন্ট ও রিফান্ড)।
 *
 * ⚠️ গুরুত্বপূর্ণ নিয়ম: এই পেজের **প্রতিটি দাবি কোডে বাস্তবায়িত আচরণ** থেকে নেওয়া।
 * এখানে এমন কোনো প্রতিশ্রুতি নেই যা সিস্টেম করতে পারে না — বিশেষ করে রিফান্ডের
 * মেয়াদ, ডেলিভারি সময় বা কোনো SLA। এগুলোর জন্য ব্যবসায়িক সিদ্ধান্ত প্রয়োজন।
 *
 * যাচাইকৃত তথ্যের উৎস:
 *  - migrations/0001_initial_schema.sql → users টেবিলের কলাম
 *  - src/routes/api.ts:91 → password_hash + salt
 *  - src/lib/auth.ts:94 → edusob_session, HttpOnly/Secure/SameSite=None, ৩০ দিন
 *  - src/routes/shop.ts:106-108 → cod_charge (এডমিন-নির্ধারিত)
 *  - src/routes/shop.ts:142 → ওয়ালেট অর্ডার = confirmed, COD = pending
 *  - src/routes/shop.ts:335-346 → বাতিল হলে স্টক ফেরত + ওয়ালেটে রিফান্ড
 *  - src/pages/shopPages.ts:276-305 → বিকাশ/নগদ ম্যানুয়াল টপ-আপ + বিকাশ অটো
 */

import { pageShell, siteHeader } from './layout'

const POLICY_CSS = `
.policy-prose h2 { font-size: 1.125rem; font-weight: 800; color: #0f172a; margin: 2.25rem 0 0.75rem; scroll-margin-top: 6rem; letter-spacing: -0.01em; }
.policy-prose h2:first-child { margin-top: 0; }
.policy-prose h3 { font-size: 0.9375rem; font-weight: 700; color: #1e293b; margin: 1.5rem 0 0.5rem; }
.policy-prose p { font-size: 0.875rem; line-height: 1.95; color: #475569; margin: 0 0 0.875rem; }
.policy-prose ul { margin: 0 0 0.875rem; padding-left: 0; list-style: none; }
.policy-prose li { font-size: 0.875rem; line-height: 1.9; color: #475569; padding-left: 1.375rem; position: relative; margin-bottom: 0.5rem; }
.policy-prose li::before { content: ''; position: absolute; left: 0.25rem; top: 0.7em; width: 5px; height: 5px; border-radius: 9999px; background: #f59e0b; }
.policy-prose strong { color: #0f172a; font-weight: 700; }
.policy-prose a { color: #b45309; font-weight: 600; text-decoration: underline; text-underline-offset: 2px; }
.policy-prose a:hover { color: #92400e; }
.policy-toc a { display: block; font-size: 0.8125rem; line-height: 1.6; color: #64748b; padding: 0.375rem 0.625rem; border-radius: 0.5rem; transition: all .15s; border-left: 2px solid transparent; }
.policy-toc a:hover { color: #b45309; background: #fffbeb; border-left-color: #fcd34d; }
.policy-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 1rem; }
@media (min-width: 1024px) { .policy-prose p, .policy-prose li { font-size: 0.9375rem; } }
`

/** প্রতিটি নীতিমালা পেজের ধাপ */
interface PolicySection {
  id: string
  heading: string
  body: string
}

interface PolicyPageOpts {
  title: string
  subtitle: string
  path: string
  description: string
  summary: string
  /** সতর্কতা বাক্স (যেখানে প্রযোজ্য) */
  callout?: { tone: 'amber' | 'rose'; title: string; body: string }
  sections: PolicySection[]
}

const POLICY_INDEX: { href: string; label: string; icon: string }[] = [
  { href: '/privacy', label: 'গোপনীয়তা নীতিমালা', icon: 'fa-shield-halved' },
  { href: '/terms', label: 'ব্যবহারের শর্তাবলী', icon: 'fa-file-contract' },
  { href: '/refund', label: 'পেমেন্ট ও রিফান্ড নীতিমালা', icon: 'fa-rotate-left' },
]

const HELPLINE = '01835414122'
const HELPLINE_HOURS = 'সকাল ৯টা – রাত ১০টা'

function contactBlock(): string {
  return `
    <div class="mt-10 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 sm:p-6">
      <h3 class="text-base font-extrabold text-slate-900 mb-1.5">এখনো কিছু বুঝতে অসুবিধা?</h3>
      <p class="text-sm text-slate-600 leading-relaxed mb-4">যেকোনো প্রশ্নে সরাসরি কল বা হোয়াটসঅ্যাপ করুন — আমরা নিজেরাই উত্তর দিই, কোনো বট বা গায়েবি এজেন্ট নয়।</p>
      <div class="flex flex-wrap gap-2.5">
        <a href="tel:+8801835414122" class="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition">
          <i class="fas fa-phone text-amber-400"></i> +88 ${HELPLINE}
        </a>
        <a href="https://wa.me/880183541412" class="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition">
          <i class="fab fa-whatsapp"></i> হোয়াটসঅ্যাপ
        </a>
      </div>
      <p class="text-xs text-slate-500 mt-3"><i class="far fa-clock"></i> ${HELPLINE_HOURS}</p>
    </div>`
}


function policyFooter(): string {
  return `
  <footer class="border-t border-slate-200 bg-white">
    <div class="mx-auto max-w-3xl px-4 py-8">
      <div class="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        ${POLICY_INDEX.map((p) => `<a href="${p.href}" class="inline-block py-1.5 text-xs font-semibold text-slate-500 hover:text-amber-700 transition">${p.label}</a>`).join('')}
      </div>
      <p class="mt-4 text-center text-xs text-slate-500">&copy; ${new Date().getFullYear()} এডুসব &middot; শিক্ষার্থীদের জন্য শিক্ষা ও ক্যারিয়ার পোর্টাল</p>
    </div>
  </footer>`
}

function policyShell(o: PolicyPageOpts, loggedIn: boolean): string {
  const toc = o.sections
    .map((s) => `<a href="#${s.id}">${s.heading}</a>`)
    .join('')

  const body = o.sections
    .map((s) => `<section id="${s.id}"><h2>${s.heading}</h2>${s.body}</section>`)
    .join('')

  const callout = o.callout
    ? `
    <div class="mb-8 rounded-xl border p-4 ${
      o.callout.tone === 'rose'
        ? 'border-rose-200 bg-rose-50'
        : 'border-amber-200 bg-amber-50'
    }">
      <p class="text-sm font-extrabold mb-1 ${o.callout.tone === 'rose' ? 'text-rose-900' : 'text-amber-900'}">
        <i class="fas ${o.callout.tone === 'rose' ? 'fa-triangle-exclamation' : 'fa-circle-info'}"></i> ${o.callout.title}
      </p>
      <p class="text-sm leading-relaxed ${o.callout.tone === 'rose' ? 'text-rose-800' : 'text-amber-800'}">${o.callout.body}</p>
    </div>`
    : ''

  const siblings = POLICY_INDEX.filter((p) => p.href !== o.path)

  return pageShell(
    o.title,
    'bg-slate-50 min-h-screen text-slate-900',
    `
${siteHeader({ theme: 'light', loggedIn })}
  <main class="min-h-screen bg-slate-50 text-slate-900">
    <!-- হিরো -->
    <div class="border-b border-slate-200 bg-white">
      <div class="mx-auto max-w-3xl px-4 py-10 sm:py-14 text-center">
        <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700 mb-3">এডুসব নীতিমালা</p>
        <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">${o.title}</h1>
        <p class="mt-3 text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl mx-auto">${o.subtitle}</p>
        <p class="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-500">
          <i class="far fa-calendar"></i> সর্বশেষ হালনাগাদ: ১১ সেপ্টেম্বর ২০২৬
        </p>
      </div>
    </div>

    <div class="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <!-- সারাংশ -->
      <div class="policy-card p-5 sm:p-6 border-l-4 border-l-amber-400 shadow-sm">
        <p class="text-[11px] font-bold uppercase tracking-widest text-amber-700 mb-2">সংক্ষেপে</p>
        <p class="text-sm sm:text-[0.9375rem] leading-relaxed text-slate-700">${o.summary}</p>
      </div>

      ${callout}

      <!-- সূচিপত্র (মোবাইলে কার্ড, ডেস্কটপে স্টিকি সাইডবার) -->
      <nav aria-label="সূচিপত্র" class="policy-card policy-toc p-3 my-6 lg:hidden">
        <p class="px-2 pb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">এই পেজে যা আছে</p>
        ${toc}
      </nav>

      <div class="lg:grid lg:grid-cols-[13rem_1fr] lg:gap-10 lg:items-start">
        <nav aria-label="সূচিপত্র" class="policy-card policy-toc hidden lg:block p-3 lg:sticky lg:top-24">
          <p class="px-2 pb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">এই পেজে যা আছে</p>
          ${toc}
        </nav>

        <article class="policy-prose">${body}${contactBlock()}</article>
      </div>

      <!-- অন্য নীতিমালা -->
      <div class="mt-10 grid gap-3 sm:grid-cols-2">
        ${siblings
          .map(
            (p) => `
          <a href="${p.href}" class="policy-card flex items-center gap-3 p-4 hover:border-amber-300 hover:shadow-md transition">
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600"><i class="fas ${p.icon}"></i></span>
            <span class="min-w-0">
              <span class="block text-sm font-bold text-slate-900">${p.label}</span>
              <span class="block text-xs text-slate-500">পড়ুন <i class="fas fa-arrow-right text-[10px]"></i></span>
            </span>
          </a>`
          )
          .join('')}
      </div>
    </div>
  </main>
${policyFooter()}`,
    POLICY_CSS,
    true,
    { description: o.description, path: o.path },
  )
}

/* ────────────────────────────────────────────────────────────
   ১. গোপনীয়তা নীতিমালা
   ──────────────────────────────────────────────────────────── */
export function privacyPage(loggedIn: boolean): string {
  return policyShell({
    title: 'গোপনীয়তা নীতিমালা',
    subtitle: 'আপনার ব্যক্তিগত তথ্য কীভাবে সংগ্রহ, ব্যবহার ও সুরক্ষিত রাখা হয় — সহজ ভাষায়।',
    path: '/privacy',
    description:
      'এডুসব-এর গোপনীয়তা নীতিমালা — আমরা কী তথ্য নিই, কেন নিই, কীভাবে সুরক্ষিত রাখি এবং কখনো বিক্রি করি না।',
    summary:
      'অ্যাকাউন্ট খুলতে আমরা শুধু আপনার <strong>নাম</strong> ও <strong>মোবাইল নম্বর</strong> চাই — বাকি সব তথ্য ঐচ্ছিক। পাসওয়ার্ড কখনো সরাসরি সংরক্ষণ করা হয় না। আপনার তথ্য আমরা <strong>বিক্রি করি না</strong>, কোনো বিজ্ঞাপন-ট্র্যাকারও ব্যবহার করি না।',
    sections: [
      {
        id: 'collect',
        heading: '১. আমরা কী তথ্য সংগ্রহ করি',
        body: `
          <p>অ্যাকাউন্ট তৈরির সময়:</p>
          <ul>
            <li><strong>নাম</strong> (বাধ্যতামূলক)</li>
            <li><strong>মোবাইল নম্বর</strong> (বাধ্যতামূলক — এটিই আপনার লগইন পরিচয়)</li>
            <li><strong>পাসওয়ার্ড</strong> (বাধ্যতামূলক — সংরক্ষণের নিয়ম নিচে দেখুন)</li>
            <li><strong>ইংরেজি নাম</strong>, <strong>ইমেইল</strong>, <strong>ধর্ম</strong>, <strong>শিক্ষা-স্তর</strong> — চাইলে দিতে পারেন, না দিলেও অ্যাকাউন্ট হবে</li>
          </ul>
          <p>শপে অর্ডার করলে: <strong>প্রাপকের নাম, মোবাইল নম্বর ও ঠিকানা</strong> — পণ্য পৌঁছে দিতেই শুধু।</p>
          <p>ওয়ালেটে টাকা জমা দিলে: <strong>পেমেন্ট মাধ্যম, পরিমাণ ও TrxID</strong> — জমা যাচাই করতে।</p>
          <p>এছাড়া প্রতিটি অ্যাকাউন্টে একটি স্বয়ংক্রিয় <strong>ইউজার কোড</strong> (যেমন EDU-2026-00001) তৈরি হয়, যাতে ফোনে কথা বলার সময় নাম্বার না বললেও চলে।</p>`,
      },
      {
        id: 'use',
        heading: '২. তথ্য কীভাবে ব্যবহার করি',
        body: `
          <ul>
            <li>আপনাকে <strong>লগইন করাতে</strong> ও অ্যাকাউন্ট সুরক্ষিত রাখতে</li>
            <li>শপের <strong>অর্ডার পৌঁছে দিতে</strong> এবং অর্ডার-সংক্রান্ত খোঁজ দিতে</li>
            <li><strong>সাবস্ক্রিপশনের সুবিধা</strong> চালু করতে (আপনার প্ল্যান অনুযায়ী)</li>
            <li><strong>ধর্ম</strong> দিলে ড্যাশবোর্ডের থিম সেই অনুযায়ী সাজাতে; <strong>শিক্ষা-স্তর</strong> দিলে সেই স্তরের কনটেন্ট আগে দেখাতে</li>
          </ul>
          <p>এগুলো ছাড়া অন্য কোনো কাজে তথ্য ব্যবহার করা হয় না।</p>`,
      },
      {
        id: 'security',
        heading: '৩. পাসওয়ার্ড ও নিরাপত্তা',
        body: `
          <p>আপনার পাসওয়ার্ড <strong>সরাসরি (plain text) সংরক্ষণ করা হয় না</strong>। প্রতিটি অ্যাকাউন্টের জন্য আলাদা একটি random <em>salt</em> তৈরি করা হয় এবং সেটির সাথে মিশিয়ে পাসওয়ার্ডটি <strong>হ্যাশ</strong> করে রাখা হয় — ফলে আমরাও আপনার পাসওয়ার্ড দেখতে পাই না।</p>
          <p>লগইনের পর একটি <strong>সেশন কুকি</strong> (<code>edusob_session</code>) ব্যবহার করা হয়, যা:</p>
          <ul>
            <li><strong>HttpOnly</strong> — জাভাস্ক্রিপ্ট দিয়ে পড়া যায় না</li>
            <li><strong>Secure</strong> — শুধু HTTPS-এ পাঠানো হয়</li>
            <li><strong>৩০ দিন</strong> পর নিজে নিজে মেয়াদ শেষ হয়</li>
          </ul>`,
      },
      {
        id: 'sharing',
        heading: '৪. আমরা কার সাথে তথ্য শেয়ার করি',
        body: `
          <p><strong>আপনার ব্যক্তিগত তথ্য আমরা বিক্রি করি না, ভাড়া দিই না, এবং বিজ্ঞাপনের জন্য কারো সাথে শেয়ার করি না।</strong></p>
          <p>তবে সেবা চালাতে কয়েকটি প্রযুক্তিগত সেবা ব্যবহার করা হয়, যাদের নিজস্ব নীতিমালা প্রযোজ্য:</p>
          <ul>
            <li><strong>Cloudflare</strong> — সাইট হোস্টিং ও ডেটাবেস (আপনার তথ্য তাদের সার্ভারে থাকে)</li>
            <li><strong>বিকাশ / নগদ</strong> — টপ-আপের টাকা পাঠানোর সময়; সেখানে তাদের নিয়মেই লেনদেন হয়</li>
          </ul>`,
      },
      {
        id: 'cookies',
        heading: '৫. কুকি ও ট্র্যাকার',
        body: `
          <p>এডুসব শুধু একটি মাত্র কুকি ব্যবহার করে — <code>edusob_session</code>, যা আপনাকে লগইন-অবস্থায় রাখে। এটি ছাড়া:</p>
          <ul>
            <li>কোনো <strong>বিজ্ঞাপন-ট্র্যাকার</strong> নেই (Google Analytics, Facebook Pixel — কোনোটিই নেই)</li>
            <li>কোনো <strong>তৃতীয়-পক্ষ স্ক্রিপ্ট</strong> লোড করা হয় না — ফন্ট, আইকন, সবকিছু আমাদের নিজস্ব সার্ভারে</li>
          </ul>`,
      },
      {
        id: 'rights',
        heading: '৬. আপনার অধিকার',
        body: `
          <p>যেকোনো সময় আপনি চাইতে পারেন:</p>
          <ul>
            <li>আপনার তথ্যের একটি <strong>কপি</strong> দেখতে</li>
            <li>ভুল তথ্য <strong>সংশোধন</strong> করতে</li>
            <li>অ্যাকাউন্ট <strong>মুছে ফেলতে</strong></li>
          </ul>
          <p>নিচের নম্বরে কল বা হোয়াটসঅ্যাপ করলেই আমরা প্রক্রিয়া করি — কোনো ফর্ম বা ইমেইল-নাটক ছাড়া।</p>`,
      },
    ],
  }, loggedIn)
}

/* ────────────────────────────────────────────────────────────
   ২. ব্যবহারের শর্তাবলী
   ──────────────────────────────────────────────────────────── */
export function termsPage(loggedIn: boolean): string {
  return policyShell({
    title: 'ব্যবহারের শর্তাবলী',
    subtitle: 'এডুসব ব্যবহার করার সময় যা যা মেনে চলতে হবে — সোজা কথায়।',
    path: '/terms',
    description:
      'এডুসব-এর ব্যবহারের শর্তাবলী — অ্যাকাউন্ট, সাবস্ক্রিপশন, শপ ও ফলাফল-সংক্রান্ত তথ্যের দায়িত্ব।',
    summary:
      'একটি মোবাইল নম্বরে <strong>একটিই</strong> অ্যাকাউন্ট। আপনার দেওয়া তথ্য সঠিক রাখা আপনার দায়িত্ব। আর ফলাফল বা ভর্তি-সংক্রান্ত যেকোনো বিষয়ে <strong>বোর্ড বা বিশ্ববিদ্যালয়ের নিজস্ব উৎসই চূড়ান্ত</strong> — এডুসব সেখানে সহায়ক মাত্র।',
    callout: {
      tone: 'amber',
      title: 'ফলাফল ও ভর্তি তথ্য সম্পর্কে',
      body: 'এডুসব আপনার দেওয়া তথ্যের ভিত্তিতে ফলাফল, জিপিএ, সিজিপিএ ও ভর্তি-সংক্রান্ত হিসাব করে <strong>সহায়ক হিসেবে</strong>। চূড়ান্ত সিদ্ধান্তের আগে অবশ্যই সংশ্লিষ্ট শিক্ষা বোর্ড বা বিশ্ববিদ্যালয়ের অফিশিয়াল উৎস যাচাই করুন।',
    },
    sections: [
      {
        id: 'account',
        heading: '১. অ্যাকাউন্ট',
        body: `
          <ul>
            <li>একটি মোবাইল নম্বরে <strong>একটিই</strong> অ্যাকাউন্ট করা যায়। একই নম্বরে দ্বিতীয়বার সাইনআপ করলে আগের অ্যাকাউন্টেই লগইন করতে হবে।</li>
            <li>আপনার পাসওয়ার্ড <strong>গোপন রাখা</strong> আপনার দায়িত্ব। কেউ পেয়ে গেলে সাথে সাথে আমাদের জানান।</li>
            <li>অ্যাকাউন্ট থেকে যা করা হয়, সেজন্য আপনিই দায়ী।</li>
          </ul>`,
      },
      {
        id: 'accuracy',
        heading: '২. তথ্যের নির্ভুলতা',
        body: `
          <p>আপনি যে তথ্য দেন (নাম, শিক্ষা-স্তর, ঠিকানা, মোবাইল) তা <strong>সঠিক</strong> হতে হবে। ভুল ঠিকানায় অর্ডার পাঠালে ডেলিভারি দেরি হতে পারে — সেক্ষেত্রে দায়িত্ব আমাদের নয়।</p>`,
      },
      {
        id: 'results',
        heading: '৩. ফলাফল, মডেল টেস্ট ও ক্যালকুলেটর',
        body: `
          <p>এডুসব-এর ফলাফল, মডেল টেস্ট, জিপিএ/সিজিপিএ ক্যালকুলেটর ও ভর্তি-সংক্রান্ত হিসাব <strong>সহায়ক সরঞ্জাম</strong>। এগুলো:</p>
          <ul>
            <li>কোনো বোর্ড, বিশ্ববিদ্যালয় বা সরকারি সংস্থার অফিশিয়াল ফলাফল <strong>নয়</strong></li>
            <li>কোনো সরকারি নথি বা সার্টিফিকেট হিসেবে <strong>ব্যবহারযোগ্য নয়</strong></li>
          </ul>
          <p>চূড়ান্ত যাচাইয়ের জন্য সংশ্লিষ্ট প্রতিষ্ঠানের অফিশিয়াল ওয়েবসাইট বা নোটিশ দেখুন।</p>`,
      },
      {
        id: 'subscription',
        heading: '৪. সাবস্ক্রিপশন',
        body: `
          <ul>
            <li>চলতি <strong>প্ল্যান ও দাম</strong> সবসময় <a href="/subscription">/subscription</a> পেজে দেখানো হয় — সেটিই বর্তমান তথ্য।</li>
            <li>পেমেন্ট যাচাইয়ের পর প্ল্যান চালু হয়।</li>
            <li>মেয়াদ শেষ হলে অ্যাকাউন্ট বা তথ্য মুছে যায় না — বিনামূল্যের সুবিধাগুলো আগের মতোই থাকে।</li>
          </ul>`,
      },
      {
        id: 'shop',
        heading: '৫. শপ, ওয়ালেট ও অর্ডার',
        body: `
          <p>শপ-এর অর্ডার, পেমেন্ট, ডেলিভারি ও রিফান্ড — সবকিছু <a href="/refund">পেমেন্ট ও রিফান্ড নীতিমালা</a> অনুযায়ী পরিচালিত হয়। অর্ডার করার আগে সেটি পড়ে নেওয়া ভালো।</p>`,
      },
      {
        id: 'prohibited',
        heading: '৬. যা করা যাবে না',
        body: `
          <ul>
            <li>সাইট থেকে তথ্য <strong>স্বয়ংক্রিয়ভাবে টেনে নেওয়া</strong> (scraping) বা সার্ভারে অতিরিক্ত চাপ দেওয়া</li>
            <li>অন্য কারো অ্যাকাউন্টে <strong>অননুমোদিত প্রবেশ</strong> বা নিরাপত্তা ফাঁক খোঁজা</li>
            <li>মিথ্যা পরিচয়ে অ্যাকাউন্ট খোলা বা প্রতারণামূলক পেমেন্ট দাবি করা</li>
            <li>ভুয়া অর্ডার দিয়ে <strong>স্টক আটকে রাখা</strong></li>
          </ul>
          <p>এগুলো করলে অ্যাকাউন্ট সাময়িক বা স্থায়ীভাবে বন্ধ করা হতে পারে।</p>`,
      },
      {
        id: 'availability',
        heading: '৭. সেবার প্রাপ্যতা',
        body: `
          <p>আমরা সাইটটি সবসময় চালু রাখতে চেষ্টা করি, তবে প্রযুক্তিগত ত্রুটি, রক্ষণাবেক্ষণ বা আমাদের নিয়ন্ত্রণের বাইরের কারণে মাঝে মাঝে বিরতি থাকতে পারে। এই ধরনের বিরতির জন্য আমরা দায়ী নই।</p>`,
      },
      {
        id: 'changes',
        heading: '৮. শর্তাবলীর পরিবর্তন',
        body: `
          <p>প্রয়োজনে এই শর্তাবলী হালনাগাদ করা হতে পারে। বড় কোনো পরিবর্তন হলে সাইটে জানিয়ে দেওয়া হবে। পেজের ওপরে <strong>"সর্বশেষ হালনাগাদ"</strong> তারিখ দেখলে বুঝতে পারবেন সবচেয়ে নতুন কোনটি।</p>`,
      },
    ],
  }, loggedIn)
}

/* ────────────────────────────────────────────────────────────
   ৩. পেমেন্ট, রিফান্ড ও ডেলিভারি নীতিমালা
   ──────────────────────────────────────────────────────────── */
export function refundPage(loggedIn: boolean): string {
  return policyShell({
    title: 'পেমেন্ট, রিফান্ড ও ডেলিভারি নীতিমালা',
    subtitle: 'টাকা কীভাবে জমা হয়, কোথায় ফেরত যায়, আর কীভাবে অর্ডার বাতিল করবেন।',
    path: '/refund',
    description:
      'এডুসব ওয়ালেট টপ-আপ, ক্যাশ অন ডেলিভারি, অর্ডার বাতিল ও রিফান্ড নীতিমালা — টাকা ফেরত কোথায় পাবেন ও কীভাবে।',
    summary:
      'ওয়ালেটে টপ-আপ করা টাকা দিয়ে শপে কেনাকাটা করা যায়। <strong>ওয়ালেটে পেইড</strong> অর্ডার বাতিল করালে <strong>সম্পূর্ণ টাকা</strong> আপনার ওয়ালেট ব্যালেন্সে ফেরত যায়। ক্যাশ অন ডেলিভারিতে <strong>পণ্য হাতে পাওয়ার পরই</strong> টাকা দেন।',
    callout: {
      tone: 'rose',
      title: 'রিফান্ড সম্পর্কে সবচেয়ে গুরুত্বপূর্ণ কথা',
      body: 'রিফান্ড <strong>আপনার এডুসব ওয়ালেট ব্যালেন্সে</strong> ফেরত যায় — বিকাশ বা নগদে নয়। ফেরত পাওয়া টাকা দিয়ে আপনি পরের অর্ডার করতে পারবেন।',
    },
    sections: [
      {
        id: 'topup',
        heading: '১. ওয়ালেটে টাকা জমা (টপ-আপ)',
        body: `
          <p>দুইভাবে টাকা জমা করা যায়:</p>
          <h3>ক) বিকাশ / নগদ (পার্সোনাল) — ম্যানুয়াল</h3>
          <p>আমাদের নম্বরে <em>Send Money</em> করে নিচের ফর্মে <strong>TrxID</strong> জমা দেন। আমাদের দল যাচাই করে অনুমোদন করলে ব্যালেন্স যোগ হয়।</p>
          <h3>খ) বিকাশ অটো টপ-আপ</h3>
          <p>বিকাশে পেমেন্ট সম্পন্ন হলেই <strong>সাথে সাথে</strong> ব্যালেন্স যোগ হয় — কোনো অপেক্ষা নেই।</p>
          <p><strong>⚠️ TrxID সঠিকভাবে দিন।</strong> ট্রানজেকশন আইডি ভুল হলে লেনদেনটি খুঁজে পাওয়া যায় না, ফলে ব্যালেন্স যোগ করা সম্ভব হয় না।</p>`,
      },
      {
        id: 'balance',
        heading: '২. ওয়ালেট ব্যালেন্স',
        body: `
          <ul>
            <li>ব্যালেন্স দিয়ে <strong>শপে কেনাকাটা</strong> করা যায়।</li>
            <li>ব্যালেন্স <strong>নগদে তুলে নেওয়ার</strong> কোনো ব্যবস্থা নেই — এটি শুধু এডুসব-এর ভেতরে কাজ করে।</li>
            <li>অন্য অ্যাকাউন্টে <strong>ব্যালেন্স স্থানান্তর</strong> করা যায় না।</li>
          </ul>`,
      },
      {
        id: 'payment',
        heading: '৩. অর্ডারের পেমেন্ট পদ্ধতি',
        body: `
          <h3>ওয়ালেট দিয়ে পেমেন্ট</h3>
          <p>অর্ডারটি <strong>সাথে সাথে নিশ্চিত (confirmed)</strong> হয় — আলাদা করে যাচাইয়ের অপেক্ষা করতে হয় না।</p>
          <h3>ক্যাশ অন ডেলিভারি (COD)</h3>
          <p>অর্ডারটি <strong>পেন্ডিং (pending)</strong> থাকে। পণ্য হাতে পাওয়ার পরই ডেলিভারি-ম্যানের কাছে টাকা দেন।</p>`,
      },
      {
        id: 'cod',
        heading: '৪. ক্যাশ অন ডেলিভারি চার্জ',
        body: `
          <p>COD-তে <strong>অতিরিক্ত ডেলিভারি চার্জ</strong> যুক্ত হয়। চার্জের সঠিক পরিমাণ <strong>চেকআউটের সময় মোট টাকার সাথেই দেখানো হয়</strong> — কোনো লুক্কায়িত খরচ নেই।</p>`,
      },
      {
        id: 'cancel',
        heading: '৫. অর্ডার বাতিল ও রিফান্ড',
        body: `
          <p>অর্ডার বাতিল করতে হলে আমাদের <strong>হেল্পলাইনে কল বা হোয়াটসঅ্যাপ</strong> করুন — আমাদের দল প্রক্রিয়া করে দেয়।</p>
          <h3>ওয়ালেটে পেইড অর্ডার বাতিল হলে:</h3>
          <ul>
            <li>অর্ডারের <strong>সম্পূর্ণ টাকা</strong> আপনার ওয়ালেট ব্যালেন্সে ফেরত যায়</li>
            <li>লেনদেনের তালিকায় <strong>"↩️ রিফান্ড"</strong> হিসেবে দেখানো হয়</li>
            <li>পণ্যের <strong>স্টক</strong> আবার মজুদে ফেরত যায়</li>
          </ul>
          <h3>ক্যাশ অন ডেলিভারি অর্ডার বাতিল হলে:</h3>
          <p>আপনি কোনো টাকা দেননি, তাই ফেরত দেওয়ার কিছু থাকে না — শুধু অর্ডারটি বাতিল হয়।</p>
          <p><strong>যেহেতু রিফান্ড ওয়ালেট ব্যালেন্সে যায়</strong>, সেটি দিয়ে আপনি পরবর্তী যেকোনো অর্ডার করতে পারবেন।</p>`,
      },
      {
        id: 'status',
        heading: '৬. অর্ডার স্ট্যাটাস',
        body: `
          <p>অর্ডার কোন পর্যায়ে আছে তা বুঝতে:</p>
          <ul>
            <li><strong>Pending (পেন্ডিং)</strong> — অর্ডার নেওয়া হয়েছে, প্রক্রিয়া শুরু হয়নি</li>
            <li><strong>Confirmed (নিশ্চিত)</strong> — অর্ডার পাকা করা হয়েছে</li>
            <li><strong>Shipped (পাঠানো)</strong> — কুরিয়ারে দেওয়া হয়েছে</li>
            <li><strong>Delivered (পৌঁছেছে)</strong> — পণ্য হাতে পেয়েছেন</li>
            <li><strong>Cancelled (বাতিল)</strong> — বাতিল করা হয়েছে</li>
          </ul>`,
      },
    ],
  }, loggedIn)
}

export { POLICY_CSS }
