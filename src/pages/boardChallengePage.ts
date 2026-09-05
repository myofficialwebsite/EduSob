// এডুসব — বোর্ড চ্যালেঞ্জ ও খাতা পুনর্নিরীক্ষণ হাব (Board Challenge & Re-scrutiny)
import { pageShell } from './layout'

export function boardChallengePage(loggedIn: boolean): string {
  return pageShell('বোর্ড চ্যালেঞ্জ ও খাতা পুনর্নিরীক্ষণ', 'bg-slate-950 text-white min-h-screen', `
<header class="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
  <nav class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
    <a href="/" class="flex items-center gap-2 font-bold text-xl"><span class="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">📚</span> এডুসব</a>
    <div class="flex items-center gap-2 text-sm">
      <a href="/results" class="px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"><i class="fas fa-award text-amber-400"></i> রেজাল্ট হাব</a>
      ${loggedIn
        ? '<a href="/dashboard" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 font-semibold">ড্যাশবোর্ড</a>'
        : '<a href="/login" class="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 transition">লগইন</a><a href="/signup" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 font-semibold">সাইন-আপ</a>'}
    </div>
  </nav>
</header>

<main class="max-w-7xl mx-auto px-4 py-10">
  <!-- হিরো হেডার -->
  <header class="text-center mb-10">
    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
      <i class="fas fa-scale-balanced"></i> সকল শিক্ষা বোর্ড, জাতীয় বিশ্ববিদ্যালয় ও উন্মুক্ত
    </div>
    <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight">⚖️ বোর্ড চ্যালেঞ্জ ও খাতা পুনর্নিরীক্ষণ হাব</h1>
    <p class="text-slate-400 mt-2 max-w-2xl mx-auto text-sm sm:text-base">
      এসএসসি, এইচএসসি, ডিগ্রি, অনার্স ও উন্মুক্ত — সঠিক এসএমএস ফরমেট জেনারেটর, ফি ক্যালকুলেটর, ধাপে ধাপে নিয়মাবলী ও সরাসরি বোর্ড নোটিস-ফলাফল লিংক
    </p>
  </header>

  <!-- গুরুত্বপূর্ণ সতর্কতা ও পুনর্নিরীক্ষণ নীতি -->
  <section class="mb-10 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-400/30 rounded-3xl p-6">
    <div class="flex items-start gap-4">
      <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl shrink-0 mt-0.5">
        <i class="fas fa-circle-exclamation"></i>
      </div>
      <div class="space-y-2 text-sm text-slate-300">
        <h2 class="font-bold text-amber-300 text-base">খাতা পুনর্নিরীক্ষণে (বোর্ড চ্যালেঞ্জ) মূলত কী কী দেখা হয়?</h2>
        <p class="leading-relaxed">
          বোর্ড চ্যালেঞ্জ মানে খাতা নতুন করে সম্পূর্ণ রি-চেক করা নয়। বোর্ডের নিয়মানুযায়ী ৪টি বিষয় যাচাই করা হয়:
        </p>
        <ul class="grid sm:grid-cols-2 gap-2 text-xs text-slate-200 mt-2">
          <li class="bg-black/30 p-2.5 rounded-xl flex items-center gap-2 border border-white/5">
            <i class="fas fa-check-circle text-emerald-400"></i> ১. সব প্রশ্নের উত্তরে নম্বর দেওয়া হয়েছে কি না
          </li>
          <li class="bg-black/30 p-2.5 rounded-xl flex items-center gap-2 border border-white/5">
            <i class="fas fa-check-circle text-emerald-400"></i> ২. সকল প্রশ্নের প্রাপ্ত নম্বরের যোগফল সঠিক আছে কি না
          </li>
          <li class="bg-black/30 p-2.5 rounded-xl flex items-center gap-2 border border-white/5">
            <i class="fas fa-check-circle text-emerald-400"></i> ৩. ওএমআর (OMR) শিটের বৃত্ত ভরাট ও বৃত্ত অনুযায়ী মার্কস ঠিক আছে কি না
          </li>
          <li class="bg-black/30 p-2.5 rounded-xl flex items-center gap-2 border border-white/5">
            <i class="fas fa-check-circle text-emerald-400"></i> ৪. প্রাপ্ত নম্বর ট্যাবুলেশন শিটে তোলার সময় কোনো ভুল হয়েছে কি না
          </li>
        </ul>
        <p class="text-[12px] text-amber-200/90 font-medium pt-1">
          💡 <span class="underline">নম্বর কমার কোনো ভয় নেই:</span> পুনর্নিরীক্ষণে নম্বর হয় বৃদ্ধি পায়, অথবা অপরিবর্তিত থাকে — কখনো কমে না।
        </p>
      </div>
    </div>
  </section>

  <!-- ইন্টারেক্টিভ এসএমএস ও ফি জেনারেটর টুল (SSC / HSC / JSC / Dakhil / Alim / Technical) -->
  <section class="mb-12 bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
    <div class="absolute -right-16 -top-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="flex items-center justify-between flex-wrap gap-4 mb-6 pb-4 border-b border-white/10">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-500/20">
          <i class="fas fa-calculator"></i>
        </div>
        <div>
          <h2 class="font-bold text-xl text-white">📱 টেলিটক SMS ফরমেট ও স্বয়ংক্রিয় ফি ক্যালকুলেটর</h2>
          <p class="text-xs text-slate-400">পরীক্ষা, বোর্ড ও বিষয় কোড সিলেক্ট করুন — সাথে সাথে এসএমএস ও মোট খরচ তৈরি হবে</p>
        </div>
      </div>
      ${loggedIn ? '<button onclick="loadMyRollsForBc()" class="text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-3 py-2 rounded-xl transition font-semibold flex items-center gap-1.5"><i class="fas fa-bolt"></i> প্রোফাইল থেকে প্রি-ফিল</button>' : ''}
    </div>

    <div class="grid lg:grid-cols-12 gap-8">
      <!-- ইনপুট ফর্ম -->
      <div class="lg:col-span-7 space-y-4">
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">পরীক্ষার নাম</label>
            <select id="bcExam" onchange="updateBcSms()" class="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none">
              <option value="SSC" data-fee="125">SSC / দাখিল / ভোকেশনাল</option>
              <option value="HSC" data-fee="150" selected>HSC / আলিম / বিএম</option>
              <option value="JSC" data-fee="125">JSC / JDC</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">শিক্ষা বোর্ড</label>
            <select id="bcBoard" onchange="updateBcSms()" class="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none">
              <option value="DHA" selected>ঢাকা (DHA)</option>
              <option value="RAJ">রাজশাহী (RAJ)</option>
              <option value="COM">কুমিল্লা (COM)</option>
              <option value="JES">যশোর (JES)</option>
              <option value="CHI">চট্টগ্রাম (CHI)</option>
              <option value="BAR">বরিশাল (BAR)</option>
              <option value="SYL">সিলেট (SYL)</option>
              <option value="DIN">দিনাজপুর (DIN)</option>
              <option value="MYM">ময়মনসিংহ (MYM)</option>
              <option value="MAD">মাদ্রাসা (MAD)</option>
              <option value="TEC">কারিগরি (TEC)</option>
            </select>
          </div>
          <div class="col-span-2 sm:col-span-1">
            <label class="block text-xs font-semibold text-slate-400 mb-1">রোল নম্বর</label>
            <input type="text" id="bcRoll" value="123456" oninput="updateBcSms()" placeholder="যেমন: 123456" class="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none">
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">
            বিষয় কোডসমূহ (কমা দিয়ে একাধিক কোড দিন)
          </label>
          <div class="relative">
            <input type="text" id="bcSubjects" value="101,102" oninput="updateBcSms()" placeholder="যেমন: 101,102,107,108" class="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none font-mono">
          </div>
          <p class="text-[11px] text-slate-500 mt-1">
            ⚠️ <span class="text-amber-400/90 font-semibold">দ্বিপত্র বিশিষ্ট বিষয়:</span> বাংলা ও ইংরেজি বিষয়ের ক্ষেত্রে ১ম ও ২য় পত্র উভয় বিষয়ের আবেদন করতে হয় (যেমন: বাংলা ১০১, ১০২ — ২টি বিষয় হিসেবে ফি প্রযোজ্য)।
          </p>
        </div>

        <!-- কুইক সাবজেক্ট পিকার চিপস -->
        <div>
          <p class="text-xs text-slate-400 mb-1.5">জনপ্রিয় বিষয় কোড চিপস (ক্লিক করলেই যুক্ত হবে):</p>
          <div class="flex flex-wrap gap-1.5" id="subjectChips">
            <button type="button" onclick="toggleSubCode('101')" class="sub-chip text-[11px] bg-white/5 hover:bg-emerald-500/20 border border-white/10 px-2.5 py-1 rounded-lg transition" data-code="101">বাংলা ১ম (101)</button>
            <button type="button" onclick="toggleSubCode('102')" class="sub-chip text-[11px] bg-white/5 hover:bg-emerald-500/20 border border-white/10 px-2.5 py-1 rounded-lg transition" data-code="102">বাংলা ২য় (102)</button>
            <button type="button" onclick="toggleSubCode('107')" class="sub-chip text-[11px] bg-white/5 hover:bg-emerald-500/20 border border-white/10 px-2.5 py-1 rounded-lg transition" data-code="107">ইংরেজি ১ম (107)</button>
            <button type="button" onclick="toggleSubCode('108')" class="sub-chip text-[11px] bg-white/5 hover:bg-emerald-500/20 border border-white/10 px-2.5 py-1 rounded-lg transition" data-code="108">ইংরেজি ২য় (108)</button>
            <button type="button" onclick="toggleSubCode('109')" class="sub-chip text-[11px] bg-white/5 hover:bg-emerald-500/20 border border-white/10 px-2.5 py-1 rounded-lg transition" data-code="109">গণিত (109)</button>
            <button type="button" onclick="toggleSubCode('174')" class="sub-chip text-[11px] bg-white/5 hover:bg-emerald-500/20 border border-white/10 px-2.5 py-1 rounded-lg transition" data-code="174">পদার্থ (174)</button>
            <button type="button" onclick="toggleSubCode('176')" class="sub-chip text-[11px] bg-white/5 hover:bg-emerald-500/20 border border-white/10 px-2.5 py-1 rounded-lg transition" data-code="176">রসায়ন (176)</button>
            <button type="button" onclick="toggleSubCode('178')" class="sub-chip text-[11px] bg-white/5 hover:bg-emerald-500/20 border border-white/10 px-2.5 py-1 rounded-lg transition" data-code="178">জীববিজ্ঞান (178)</button>
            <button type="button" onclick="toggleSubCode('275')" class="sub-chip text-[11px] bg-white/5 hover:bg-emerald-500/20 border border-white/10 px-2.5 py-1 rounded-lg transition" data-code="275">আইসিটি (275)</button>
          </div>
        </div>

        <!-- ২য় নিশ্চিতকরণ এসএমএস সহকারী (PIN Confirmation) -->
        <div class="pt-3 border-t border-white/10">
          <p class="text-xs font-bold text-amber-300 mb-2"><i class="fas fa-reply mr-1"></i> ২য় নিশ্চিতকরণ SMS (টেলিটকের ফিরতি পিন পাওয়ার পর):</p>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] text-slate-400 mb-1">ফিরতি পিন (PIN)</label>
              <input type="text" id="bcPin" value="12345678" oninput="updateBcSms()" placeholder="পিন নম্বর" class="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs focus:border-amber-400 focus:outline-none font-mono">
            </div>
            <div>
              <label class="block text-[11px] text-slate-400 mb-1">যোগাযোগের মোবাইল নম্বর</label>
              <input type="text" id="bcContactPhone" value="01712345678" oninput="updateBcSms()" placeholder="যেকোনো অপারেটর নম্বর" class="w-full bg-slate-800 border border-white/15 rounded-xl px-3 py-2 text-xs focus:border-amber-400 focus:outline-none font-mono">
            </div>
          </div>
        </div>
      </div>

      <!-- ফলাফল প্রিভিউ ও সরাসরি অ্যাকশন বাটনসমূহ -->
      <div class="lg:col-span-5 flex flex-col justify-between bg-slate-950/70 border border-white/10 rounded-2xl p-5">
        <div>
          <!-- ফি সামারি -->
          <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4">
            <div class="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>আবেদনকৃত মোট বিষয়/পত্র:</span>
              <span id="bcSubCount" class="font-bold text-white text-sm">২টি</span>
            </div>
            <div class="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>প্রতি বিষয়/পত্র ফি:</span>
              <span id="bcPerFee" class="font-bold text-white">৳১৫০</span>
            </div>
            <div class="flex items-center justify-between text-xs text-slate-300 mb-2">
              <span>টেলিটক এসএমএস চার্জ (আনুমানিক):</span>
              <span class="font-bold text-white">৳৪.৮০ (২টি SMS)</span>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-emerald-500/20 text-sm font-bold text-emerald-400">
              <span>মোট প্রয়োজনীয় ব্যালেন্স:</span>
              <span id="bcTotalFee" class="text-lg">৳৩০৫.০০</span>
            </div>
          </div>

          <!-- ১ম SMS বক্স -->
          <div class="space-y-1.5 mb-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-300">১ম SMS (টেলিটক সিম থেকে ১৬২২২ নম্বরে):</span>
              <span class="text-[11px] text-emerald-400 font-mono">16222</span>
            </div>
            <div class="relative bg-slate-900 border border-white/15 rounded-xl p-3 font-mono text-xs text-emerald-300 break-all select-all flex items-center justify-between">
              <span id="bcSms1">RSC DHA 123456 101,102</span>
              <button onclick="copyText('bcSms1')" class="ml-2 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-[11px] shrink-0">
                <i class="fas fa-copy"></i>
              </button>
            </div>
            <a id="bcSms1Link" href="sms:16222?body=RSC DHA 123456 101,102" class="w-full text-center block bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-md">
              <i class="fas fa-paper-plane mr-1.5"></i> মোবাইলে ১-ক্লিকে SMS পাঠান
            </a>
          </div>

          <!-- ২য় SMS বক্স -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-300">২য় কনফার্মেশন SMS (পিন পাওয়ার পর):</span>
              <span class="text-[11px] text-amber-400 font-mono">16222</span>
            </div>
            <div class="relative bg-slate-900 border border-white/15 rounded-xl p-3 font-mono text-xs text-amber-300 break-all select-all flex items-center justify-between">
              <span id="bcSms2">RSC YES 12345678 01712345678</span>
              <button onclick="copyText('bcSms2')" class="ml-2 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-[11px] shrink-0">
                <i class="fas fa-copy"></i>
              </button>
            </div>
            <a id="bcSms2Link" href="sms:16222?body=RSC YES 12345678 01712345678" class="w-full text-center block bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-md">
              <i class="fas fa-check-double mr-1.5"></i> মোবাইলে কনফার্মেশন SMS পাঠান
            </a>
          </div>
        </div>

        <p class="text-[10px] text-slate-500 mt-4 text-center">
          * টেলিটক প্রি-পেইড সিমে পর্যাপ্ত ব্যালেন্স থাকতে হবে।
        </p>
      </div>
    </div>
  </section>

  <!-- কোন কোন পরীক্ষায় বোর্ড চ্যালেঞ্জ সুবিধা আছে ও তাদের পূর্ণ নিয়মাবলী -->
  <section class="mb-12">
    <div class="flex items-center justify-between mb-6 flex-wrap gap-2">
      <div>
        <h2 class="text-2xl font-bold text-white">📚 যেসব পরীক্ষায় বোর্ড চ্যালেঞ্জ / খাতা পুনর্নিরীক্ষণ প্রযোজ্য</h2>
        <p class="text-xs text-slate-400">প্রতিটি পরীক্ষার আবেদনের মাধ্যম, ফি এবং সরাসরি অফিসিয়াল গেটওয়ে</p>
      </div>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      <!-- ১. SSC / দাখিল / সমমান -->
      <article class="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 flex flex-col justify-between card-hover">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full">টেলিটক SMS পদ্ধতি</span>
            <span class="text-xs text-slate-400">ফি: ৳১২৫ / বিষয়</span>
          </div>
          <h3 class="font-bold text-lg text-white">SSC / দাখিল / ভোকেশনাল</h3>
          <p class="text-xs text-slate-400 mt-1">সব শিক্ষা বোর্ড (ঢাকা, রাজশাহী, মাদ্রাসা, কারিগরি ইত্যাদি)</p>
          <ul class="text-xs text-slate-300 space-y-1.5 mt-3">
            <li>• ফলাফল প্রকাশের পরদিন থেকে সাধারণত ৭ দিন পর্যন্ত আবেদন চলে।</li>
            <li>• Teletalk Prepaid থেকে: <code class="bg-black/50 text-emerald-300 px-1 py-0.5 rounded">RSC &lt;Board&gt; &lt;Roll&gt; &lt;SubCodes&gt;</code> পাঠিয়ে আবেদন।</li>
            <li>• একাধিক বিষয়ের ক্ষেত্রে কমা দিয়ে কোড দিতে হয়।</li>
          </ul>
        </div>
        <div class="mt-4 pt-3 border-t border-white/10 flex gap-2">
          <a href="https://eboardresults.com/v2/home" target="_blank" rel="noopener" class="flex-1 text-center text-xs bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 py-2.5 rounded-xl transition font-semibold">
            পুনর্নিরীক্ষণ রেজাল্ট <i class="fas fa-arrow-up-right-from-square ml-1"></i>
          </a>
        </div>
      </article>

      <!-- ২. HSC / আলিম / বিএম -->
      <article class="bg-slate-900 border border-teal-500/30 rounded-2xl p-5 flex flex-col justify-between card-hover">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full">টেলিটক SMS পদ্ধতি</span>
            <span class="text-xs text-slate-400">ফি: ৳১৫০ / বিষয়</span>
          </div>
          <h3 class="font-bold text-lg text-white">HSC / আলিম / কারিগরি বিএম</h3>
          <p class="text-xs text-slate-400 mt-1">সব সাধারণ শিক্ষা বোর্ড, মাদ্রাসা ও কারিগরি</p>
          <ul class="text-xs text-slate-300 space-y-1.5 mt-3">
            <li>• ফল প্রকাশের ৭ দিনের মধ্যে টেলিটকে আবেদন করতে হয়।</li>
            <li>• দ্বিপত্র বিশিষ্ট বিষয়ের ক্ষেত্রে উভয় পত্রের আবেদন গণ্য হয়।</li>
            <li>• পুনর্নিরীক্ষণের ফলাফল নিজ শিক্ষা বোর্ডের ওয়েবসাইটে PDF আকারে এবং মোবাইলে SMS এ জানিয়ে দেওয়া হয়।</li>
          </ul>
        </div>
        <div class="mt-4 pt-3 border-t border-white/10 flex gap-2">
          <a href="https://dhakaeducationboard.gov.bd/" target="_blank" rel="noopener" class="flex-1 text-center text-xs bg-teal-500/20 hover:bg-teal-500/40 text-teal-300 py-2.5 rounded-xl transition font-semibold">
            বোর্ড নোটিস ও ফল <i class="fas fa-arrow-up-right-from-square ml-1"></i>
          </a>
        </div>
      </article>

      <!-- ৩. জাতীয় বিশ্ববিদ্যালয় (NU Honours, Degree, Masters) -->
      <article class="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 flex flex-col justify-between card-hover">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full">সোনালী সেবা অনলাইন</span>
            <span class="text-xs text-slate-400">ফি: ৳৮০০ / পত্র</span>
          </div>
          <h3 class="font-bold text-lg text-white">জাতীয় বিশ্ববিদ্যালয় (অনার্স / ডিগ্রি / মাস্টার্স)</h3>
          <p class="text-xs text-slate-400 mt-1">NU Re-scrutiny Online Service</p>
          <ul class="text-xs text-slate-300 space-y-1.5 mt-3">
            <li>• অনলাইন সোনালী সেবা পেমেন্ট গেটওয়ের মাধ্যমে আবেদন।</li>
            <li>• পরীক্ষার রেজাল্ট শিটের রেজিস্ট্রেশন নম্বর দিয়ে বিষয় সিলেক্ট করতে হয়।</li>
            <li>• পে-স্লিপ প্রিন্ট করে সোনালী ব্যাংকে অথবা বিকাশ/নগদ/সোনালী ই-সেবায় ফি জমা দিতে হয়।</li>
          </ul>
        </div>
        <div class="mt-4 pt-3 border-t border-white/10 flex gap-2">
          <a href="https://sonaliseba.nu.ac.bd/" target="_blank" rel="noopener" class="flex-1 text-center text-xs bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 py-2.5 rounded-xl transition font-semibold">
            NU সোনালী সেবা পোর্টাল <i class="fas fa-arrow-up-right-from-square ml-1"></i>
          </a>
          <a href="https://results.nu.ac.bd/" target="_blank" rel="noopener" class="text-center text-xs bg-white/10 hover:bg-white/20 py-2.5 px-3 rounded-xl transition font-semibold">
            ফল দেখুন
          </a>
        </div>
      </article>

      <!-- ৪. বাংলাদেশ উন্মুক্ত বিশ্ববিদ্যালয় (BOU) -->
      <article class="bg-slate-900 border border-sky-500/30 rounded-2xl p-5 flex flex-col justify-between card-hover">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold bg-sky-500/20 text-sky-300 px-3 py-1 rounded-full">OSAPS অনলাইন গেটওয়ে</span>
            <span class="text-xs text-slate-400">ফি: ৳৩০০–৳৫০০ / কোর্স</span>
          </div>
          <h3 class="font-bold text-lg text-white">বাংলাদেশ উন্মুক্ত বিশ্ববিদ্যালয় (BOU)</h3>
          <p class="text-xs text-slate-400 mt-1">SSC, HSC, BA/BSS, BBA ও মাস্টার্স খাতা পুনর্নিরীক্ষণ</p>
          <ul class="text-xs text-slate-300 space-y-1.5 mt-3">
            <li>• OSAPS পোর্টালে স্টুডেন্ট প্রোফাইলে লগইন করে Re-scrutiny অপশনে আবেদন।</li>
            <li>• বিকাশ/রকেট/শিওরক্যাশ অথবা ব্যাংকের মাধ্যমে ফি পরিশোধ।</li>
            <li>• ফলাফল BOU এর পরীক্ষা পোর্টাল (<code class="text-sky-300">exam.bou.ac.bd</code>) এ দেওয়া হয়।</li>
          </ul>
        </div>
        <div class="mt-4 pt-3 border-t border-white/10 flex gap-2">
          <a href="https://osapsnew.bou.ac.bd/" target="_blank" rel="noopener" class="flex-1 text-center text-xs bg-sky-500/20 hover:bg-sky-500/40 text-sky-300 py-2.5 rounded-xl transition font-semibold">
            BOU OSAPS আবেদন <i class="fas fa-arrow-up-right-from-square ml-1"></i>
          </a>
        </div>
      </article>

      <!-- ৫. কারিগরি শিক্ষা বোর্ড (BTEB - ডিপ্লোমা / টেক্সটাইল / ভোকেশনাল) -->
      <article class="bg-slate-900 border border-indigo-500/30 rounded-2xl p-5 flex flex-col justify-between card-hover">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full">SMS ও অনলাইন গেটওয়ে</span>
            <span class="text-xs text-slate-400">ফি: ৳১৫০ / বিষয়</span>
          </div>
          <h3 class="font-bold text-lg text-white">কারিগরি ও পলিটেকনিক (BTEB)</h3>
          <p class="text-xs text-slate-400 mt-1">ডিপ্লোমা ইন ইঞ্জিনিয়ারিং, টেক্সটাইল ও নার্সিং ডিপ্লোমা</p>
          <ul class="text-xs text-slate-300 space-y-1.5 mt-3">
            <li>• টেলিটক এসএমএস অথবা BTEB এর নির্দিষ্ট অনলাইন নোটিস লিংকের মাধ্যমে আবেদন।</li>
            <li>• রোল ও রেজিস্ট্রেশন দিয়ে বিষয় কোড নির্বাচন করতে হয়।</li>
            <li>• সংশোধিত ফলাফল BTEB অফিশিয়াল ওয়েবসাইটে প্রকাশ করা হয়।</li>
          </ul>
        </div>
        <div class="mt-4 pt-3 border-t border-white/10 flex gap-2">
          <a href="http://www.bteb.gov.bd/" target="_blank" rel="noopener" class="flex-1 text-center text-xs bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 py-2.5 rounded-xl transition font-semibold">
            BTEB অফিশিয়াল গেটওয়ে <i class="fas fa-arrow-up-right-from-square ml-1"></i>
          </a>
        </div>
      </article>

      <!-- ৬. মেডিকেল (MBBS/BDS) ও নার্সিং ভর্তি পরীক্ষা -->
      <article class="bg-slate-900 border border-rose-500/30 rounded-2xl p-5 flex flex-col justify-between card-hover">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full">টেলিটক সার্ভিস</span>
            <span class="text-xs text-slate-400">ফি: ৳১,০০০</span>
          </div>
          <h3 class="font-bold text-lg text-white">মেডিকেল ও ডেন্টাল (MBBS/BDS)</h3>
          <p class="text-xs text-slate-400 mt-1">স্বাস্থ্য শিক্ষা অধিদপ্তর (DGME / DGHS)</p>
          <ul class="text-xs text-slate-300 space-y-1.5 mt-3">
            <li>• টেলিটক প্রি-পেইড থেকে: <code class="bg-black/50 text-rose-300 px-1 py-0.5 rounded">DGME &lt;space&gt; RSC &lt;space&gt; &lt;Roll&gt;</code> পাঠিয়ে আবেদন।</li>
            <li>• ওএমআর শিট পুনরায় স্ক্যান ও মার্কস ভেরিফিকেশন করা হয়।</li>
            <li>• ডিজিএমই ওয়েবসাইটে চূড়ান্ত ফলাফল পাওয়া যায়।</li>
          </ul>
        </div>
        <div class="mt-4 pt-3 border-t border-white/10 flex gap-2">
          <a href="http://result.dghs.gov.bd/" target="_blank" rel="noopener" class="flex-1 text-center text-xs bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 py-2.5 rounded-xl transition font-semibold">
            DGME রেজাল্ট পোর্টাল <i class="fas fa-arrow-up-right-from-square ml-1"></i>
          </a>
        </div>
      </article>
    </div>
  </section>

  <!-- বোর্ড অনুযায়ী সরাসরি পুনর্নিরীক্ষণ নোটিস ও রেজাল্ট লিংক (Direct Links) -->
  <section class="mb-12 bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-8">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-white"><i class="fas fa-link text-emerald-400 mr-2"></i>বোর্ডভিত্তিক সরাসরি পুনর্নিরীক্ষণ ফলাফল ও নোটিস ডিরেক্টরি</h2>
      <p class="text-xs text-slate-400">সকল শিক্ষা বোর্ডের অফিসিয়াল নোটিস বোর্ড ও পুনর্নিরীক্ষণ ফলাফলের সরাসরি লিংক</p>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
      <a href="https://dhakaeducationboard.gov.bd/" target="_blank" rel="noopener" class="bg-white/5 hover:bg-emerald-500/20 border border-white/10 p-3 rounded-xl transition flex items-center justify-between group">
        <span class="font-bold text-slate-200 group-hover:text-emerald-300">🏛️ ঢাকা শিক্ষা বোর্ড</span>
        <i class="fas fa-arrow-up-right-from-square text-slate-500 group-hover:text-emerald-400"></i>
      </a>
      <a href="https://rajshahieducationboard.gov.bd/" target="_blank" rel="noopener" class="bg-white/5 hover:bg-emerald-500/20 border border-white/10 p-3 rounded-xl transition flex items-center justify-between group">
        <span class="font-bold text-slate-200 group-hover:text-emerald-300">🏛️ রাজশাহী শিক্ষা বোর্ড</span>
        <i class="fas fa-arrow-up-right-from-square text-slate-500 group-hover:text-emerald-400"></i>
      </a>
      <a href="https://comillaboard.portal.gov.bd/" target="_blank" rel="noopener" class="bg-white/5 hover:bg-emerald-500/20 border border-white/10 p-3 rounded-xl transition flex items-center justify-between group">
        <span class="font-bold text-slate-200 group-hover:text-emerald-300">🏛️ কুমিল্লা শিক্ষা বোর্ড</span>
        <i class="fas fa-arrow-up-right-from-square text-slate-500 group-hover:text-emerald-400"></i>
      </a>
      <a href="https://www.jessoreboard.gov.bd/" target="_blank" rel="noopener" class="bg-white/5 hover:bg-emerald-500/20 border border-white/10 p-3 rounded-xl transition flex items-center justify-between group">
        <span class="font-bold text-slate-200 group-hover:text-emerald-300">🏛️ যশোর শিক্ষা বোর্ড</span>
        <i class="fas fa-arrow-up-right-from-square text-slate-500 group-hover:text-emerald-400"></i>
      </a>
      <a href="https://bise-ctg.portal.gov.bd/" target="_blank" rel="noopener" class="bg-white/5 hover:bg-emerald-500/20 border border-white/10 p-3 rounded-xl transition flex items-center justify-between group">
        <span class="font-bold text-slate-200 group-hover:text-emerald-300">🏛️ চট্টগ্রাম শিক্ষা বোর্ড</span>
        <i class="fas fa-arrow-up-right-from-square text-slate-500 group-hover:text-emerald-400"></i>
      </a>
      <a href="https://barisalboard.gov.bd/" target="_blank" rel="noopener" class="bg-white/5 hover:bg-emerald-500/20 border border-white/10 p-3 rounded-xl transition flex items-center justify-between group">
        <span class="font-bold text-slate-200 group-hover:text-emerald-300">🏛️ বরিশাল শিক্ষা বোর্ড</span>
        <i class="fas fa-arrow-up-right-from-square text-slate-500 group-hover:text-emerald-400"></i>
      </a>
      <a href="https://sylhetboard.gov.bd/" target="_blank" rel="noopener" class="bg-white/5 hover:bg-emerald-500/20 border border-white/10 p-3 rounded-xl transition flex items-center justify-between group">
        <span class="font-bold text-slate-200 group-hover:text-emerald-300">🏛️ সিলেট শিক্ষা বোর্ড</span>
        <i class="fas fa-arrow-up-right-from-square text-slate-500 group-hover:text-emerald-400"></i>
      </a>
      <a href="https://dinajpureducationboard.gov.bd/" target="_blank" rel="noopener" class="bg-white/5 hover:bg-emerald-500/20 border border-white/10 p-3 rounded-xl transition flex items-center justify-between group">
        <span class="font-bold text-slate-200 group-hover:text-emerald-300">🏛️ দিনাজপুর শিক্ষা বোর্ড</span>
        <i class="fas fa-arrow-up-right-from-square text-slate-500 group-hover:text-emerald-400"></i>
      </a>
      <a href="https://mymensingheducationboard.gov.bd/" target="_blank" rel="noopener" class="bg-white/5 hover:bg-emerald-500/20 border border-white/10 p-3 rounded-xl transition flex items-center justify-between group">
        <span class="font-bold text-slate-200 group-hover:text-emerald-300">🏛️ ময়মনসিংহ শিক্ষা বোর্ড</span>
        <i class="fas fa-arrow-up-right-from-square text-slate-500 group-hover:text-emerald-400"></i>
      </a>
      <a href="http://www.bmeb.gov.bd/" target="_blank" rel="noopener" class="bg-white/5 hover:bg-emerald-500/20 border border-white/10 p-3 rounded-xl transition flex items-center justify-between group">
        <span class="font-bold text-slate-200 group-hover:text-emerald-300">🕌 মাদ্রাসা শিক্ষা বোর্ড</span>
        <i class="fas fa-arrow-up-right-from-square text-slate-500 group-hover:text-emerald-400"></i>
      </a>
      <a href="http://www.bteb.gov.bd/" target="_blank" rel="noopener" class="bg-white/5 hover:bg-emerald-500/20 border border-white/10 p-3 rounded-xl transition flex items-center justify-between group">
        <span class="font-bold text-slate-200 group-hover:text-emerald-300">⚙️ কারিগরি শিক্ষা বোর্ড</span>
        <i class="fas fa-arrow-up-right-from-square text-slate-500 group-hover:text-emerald-400"></i>
      </a>
      <a href="https://eboardresults.com/v2/home" target="_blank" rel="noopener" class="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 p-3 rounded-xl transition flex items-center justify-between group">
        <span class="font-bold text-emerald-300">🌐 EBoardResults পোর্টাল</span>
        <i class="fas fa-arrow-up-right-from-square text-emerald-400"></i>
      </a>
    </div>
  </section>
</main>

<script>
function updateBcSms() {
  const exam = document.getElementById('bcExam').value;
  const opt = document.querySelector('#bcExam option:checked');
  const feePerSub = Number(opt ? opt.dataset.fee : 150) || 150;
  const board = document.getElementById('bcBoard').value;
  const roll = document.getElementById('bcRoll').value.trim() || '123456';
  const subsRaw = document.getElementById('bcSubjects').value.trim();
  const pin = document.getElementById('bcPin').value.trim() || '12345678';
  const phone = document.getElementById('bcContactPhone').value.trim() || '01712345678';

  // সাবজেক্ট গণনা (কমা সেপারেটেড)
  const subsArray = subsRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);
  const subCount = subsArray.length || 1;
  const subsClean = subsArray.length > 0 ? subsArray.join(',') : '101,102';

  const totalFee = (subCount * feePerSub) + 5; // 5 taka approx sms charge buffer

  document.getElementById('bcSubCount').textContent = subCount + 'টি';
  document.getElementById('bcPerFee').textContent = '৳' + feePerSub;
  document.getElementById('bcTotalFee').textContent = '৳' + totalFee.toFixed(2);

  // ১ম এসএমএস
  const sms1Text = 'RSC ' + board + ' ' + roll + ' ' + subsClean;
  document.getElementById('bcSms1').textContent = sms1Text;
  document.getElementById('bcSms1Link').href = 'sms:16222?body=' + encodeURIComponent(sms1Text);

  // ২য় এসএমএস
  const sms2Text = 'RSC YES ' + pin + ' ' + phone;
  document.getElementById('bcSms2').textContent = sms2Text;
  document.getElementById('bcSms2Link').href = 'sms:16222?body=' + encodeURIComponent(sms2Text);
}

function toggleSubCode(code) {
  const input = document.getElementById('bcSubjects');
  const current = input.value.split(',').map(s => s.trim()).filter(Boolean);
  if (current.includes(code)) {
    input.value = current.filter(c => c !== code).join(',');
  } else {
    current.push(code);
    input.value = current.join(',');
  }
  updateBcSms();
}

async function copyText(elId) {
  const text = document.getElementById(elId).textContent;
  await navigator.clipboard.writeText(text);
  alert('✅ SMS টেক্সট কপি হয়েছে: ' + text);
}

async function loadMyRollsForBc() {
  try {
    const r = await axios.get('/api/saved-rolls');
    const rolls = r.data.rolls || [];
    if (!rolls.length) {
      alert('আপনার কোনো সেভড রোল পাওয়া যায়নি। ড্যাশবোর্ড বা রেজাল্ট হাবে গিয়ে রোল সেভ করুন।');
      return;
    }
    const r0 = rolls[0];
    if (r0.roll) document.getElementById('bcRoll').value = r0.roll;
    const boardMap = {'ঢাকা':'DHA','রাজশাহী':'RAJ','কুমিল্লা':'COM','যশোর':'JES','চট্টগ্রাম':'CHI','বরিশাল':'BAR','সিলেট':'SYL','দিনাজপুর':'DIN','ময়মনসিংহ':'MYM','মাদ্রাসা':'MAD','কারিগরি':'TEC'};
    if (r0.board && boardMap[r0.board]) document.getElementById('bcBoard').value = boardMap[r0.board];
    if (r0.exam_type && ['ssc','hsc','jsc'].includes(r0.exam_type.toLowerCase())) {
      document.getElementById('bcExam').value = r0.exam_type.toUpperCase();
    }
    updateBcSms();
    alert('✅ আপনার সেভড রোল ও বোর্ড প্রি-ফিল করা হয়েছে!');
  } catch(e) {
    alert('তথ্য লোড করতে সমস্যা হয়েছে।');
  }
}

// প্রারম্ভিক ইনিট
updateBcSms();
</script>
`)
}
