// এডুসব — আধুনিক রেজাল্ট হাব (যাচাইকৃত সরাসরি সরকারি লিংক + লাইভ স্ট্যাটাস + বোর্ড চ্যালেঞ্জ + সেভড রোল)
import { pageShell, siteHeader } from './layout'

// সত্যিকারের, যাচাইকৃত সরাসরি অফিসিয়াল রেজাল্ট সোর্স
export const RESULT_SOURCES = [
  {
    id: 'ssc', title: 'SSC / দাখিল / ভোকেশনাল', category: 'board', icon: 'fa-graduation-cap', color: 'emerald',
    desc: 'সকল সাধারণ শিক্ষা বোর্ড, মাদ্রাসা ও কারিগরি বোর্ড — মার্কশিটসহ ফলাফল',
    needs: ['বোর্ড', 'রোল', 'রেজিস্ট্রেশন', 'পাসের সন'],
    sms_format: 'SSC <Space> DHA <Space> ROLL <Space> YEAR (পাঠান 16222 নম্বরে)',
    links: [
      { name: 'EBoardResults — সরাসরি মার্কশিট পেজ ✅', url: 'https://eboardresults.com/v2/home', note: 'মার্কশিটসহ বিস্তারিত রেজাল্ট — সরাসরি ভেরিফায়েড পেজ' },
      { name: 'Education Board Results (সরকারি মূল)', url: 'https://www.educationboardresults.gov.bd/', note: 'সরকারি মূল কেন্দ্রীয় রেজাল্ট সার্ভার' },
    ],
    guide: ['বোর্ড, রোল ও রেজিস্ট্রেশন নম্বর সঙ্গে রাখুন', 'পরীক্ষা: SSC/Dakhil/Vocational নির্বাচন করুন', 'ক্যাপচা (সাধারণ যোগফল) পূরণ করে "Submit" বাটনে চাপুন', 'ফলাফল প্রকাশের দিনে কোনো একটি সার্ভার ব্যস্ত থাকলে বিকল্প লিংকে প্রবেশ করুন']
  },
  {
    id: 'hsc', title: 'HSC / আলিম / কারিগরি বিএম', category: 'board', icon: 'fa-user-graduate', color: 'teal',
    desc: 'উচ্চ মাধ্যমিক সার্টিফিকেট, আলিম ও ভোকেশনাল — মার্কশিটসহ ফলাফল',
    needs: ['বোর্ড', 'রোল', 'রেজিস্ট্রেশন', 'পাসের সন'],
    sms_format: 'HSC <Space> DHA <Space> ROLL <Space> YEAR (পাঠান 16222 নম্বরে)',
    links: [
      { name: 'EBoardResults — সরাসরি মার্কশিট পেজ ✅', url: 'https://eboardresults.com/v2/home', note: 'মার্কশিটসহ বিস্তারিত বিষয়ভিত্তিক গ্রেড' },
      { name: 'Education Board Results (সরকারি মূল)', url: 'https://www.educationboardresults.gov.bd/', note: 'সরকারি মূল কেন্দ্রীয় সার্ভার' },
    ],
    guide: ['বোর্ড, রোল ও রেজিস্ট্রেশন নম্বর দিন', 'পরীক্ষা: HSC/Alim/BM নির্বাচন করুন', 'ক্যাপচা পূরণ করে Submit দিন']
  },
  {
    id: 'jsc', title: 'JSC / JDC', category: 'board', icon: 'fa-school', color: 'sky',
    desc: 'জুনিয়র স্কুল সার্টিফিকেট ও জুনিয়র দাখিল সার্টিফিকেট',
    needs: ['বোর্ড', 'রোল', 'পাসের সন'],
    sms_format: 'JSC <Space> DHA <Space> ROLL <Space> YEAR (পাঠান 16222 নম্বরে)',
    links: [
      { name: 'EBoardResults — সরাসরি রেজাল্ট ✅', url: 'https://eboardresults.com/v2/home', note: 'সরাসরি ফলাফল পেজ' },
      { name: 'Education Board Results', url: 'https://www.educationboardresults.gov.bd/', note: 'সরকারি মূল সার্ভার' },
    ],
    guide: ['বোর্ড ও রোল নম্বর দিন', 'পরীক্ষা: JSC/JDC নির্বাচন করে সাবমিট করুন']
  },
  {
    id: 'primary', title: 'প্রাথমিক বৃত্তি ও সমাপনী (DPE)', category: 'board', icon: 'fa-award', color: 'indigo',
    desc: 'প্রাথমিক শিক্ষা অধিদপ্তর — বৃত্তি ও সমাপনী পরীক্ষার ফলাফল',
    needs: ['রোল / স্টুডেন্ট আইডি', 'সাল', 'বিভাগ ও জেলা'],
    sms_format: 'DPEP <Space> Student_ID <Space> YEAR (পাঠান 16222 নম্বরে)',
    links: [
      { name: 'DPE Teletalk রেজাল্ট পোর্টাল ✅', url: 'http://dperesult.teletalk.com.bd/', note: 'প্রাথমিক শিক্ষা অধিদপ্তর সরাসরি রেজাল্ট পেজ' },
      { name: 'প্রাথমিক শিক্ষা অধিদপ্তর (DPE Portal)', url: 'http://dpe.gov.bd/', note: 'অফিসিয়াল নোটিস ও গ্যাজেট' },
    ],
    guide: ['শিক্ষার্থীর আইডি অথবা রোল নম্বর দিন', 'সাল, বিভাগ, জেলা ও উপজেলা নির্বাচন করুন']
  },
  {
    id: 'nu_honours', title: 'NU অনার্স (১ম–৪র্থ বর্ষ + CGPA)', category: 'university', icon: 'fa-building-columns', color: 'amber',
    desc: 'জাতীয় বিশ্ববিদ্যালয় অনার্স বর্ষভিত্তিক ও সমন্বিত সিজিপিএ ফলাফল',
    needs: ['রেজিস্ট্রেশন নম্বর', 'রোল', 'পরীক্ষার সন'],
    sms_format: 'NU <Space> H1/H2/H3/H4 <Space> ROLL (পাঠান 16222 নম্বরে)',
    links: [
      { name: 'NU অনার্স রেজাল্ট — সরাসরি Honours পেজ ✅', url: 'https://results.nu.ac.bd/honours', note: 'অনার্স ১ম-৪র্থ বর্ষ — সরাসরি রেজাল্ট পেজ' },
      { name: 'NU BD রেজাল্ট পোর্টাল (বিকল্প)', url: 'http://nubd.info/results/', note: 'দ্রুত লোডিং ব্যাকআপ রেজাল্ট পোর্টাল' },
      { name: 'NU মূল রেজাল্ট পোর্টাল', url: 'https://results.nu.ac.bd/', note: 'জাতীয় বিশ্ববিদ্যালয় কেন্দ্রীয় পোর্টাল' },
    ],
    guide: ['Honours ট্যাব নির্বাচন করুন', 'বর্ষ (1st/2nd/3rd/4th Year/Consolidated) বাছুন', 'রোল ও রেজিস্ট্রেশন নম্বর দিন', 'ক্যাপচা কোড দিয়ে Search দিন']
  },
  {
    id: 'nu_degree', title: 'NU ডিগ্রি (পাস ও সার্টিফিকেট)', category: 'university', icon: 'fa-scroll', color: 'orange',
    desc: 'জাতীয় বিশ্ববিদ্যালয় ৩ বছর মেয়াদী ডিগ্রি পাস কোর্স ফলাফল',
    needs: ['রেজিস্ট্রেশন নম্বর', 'পরীক্ষার সন'],
    sms_format: 'NU <Space> DEG <Space> ROLL (পাঠান 16222 নম্বরে)',
    links: [
      { name: 'NU ডিগ্রি রেজাল্ট — সরাসরি Degree পেজ ✅', url: 'https://results.nu.ac.bd/degree', note: 'ডিগ্রি পাস — সরাসরি রেজাল্ট পেজ' },
      { name: 'NU মূল পোর্টাল', url: 'https://results.nu.ac.bd/', note: 'কেন্দ্রীয় গেটওয়ে' },
    ],
    guide: ['Degree ট্যাব নির্বাচন করুন', '১ম, ২য় বা ৩য় বর্ষ নির্বাচন করুন', 'রেজিস্ট্রেশন নম্বর ও পাসের সাল দিয়ে সাবমিট করুন']
  },
  {
    id: 'nu_masters', title: 'NU মাস্টার্স ও প্রফেশনাল', category: 'university', icon: 'fa-user-tie', color: 'fuchsia',
    desc: 'মাস্টার্স প্রিলিমিনারি/ফাইনাল, BBA, CSE, LLB ইত্যাদি ফলাফল',
    needs: ['রেজিস্ট্রেশন নম্বর', 'পরীক্ষার সন'],
    links: [
      { name: 'NU মাস্টার্স রেজাল্ট — সরাসরি Masters পেজ ✅', url: 'https://results.nu.ac.bd/masters', note: 'মাস্টার্স প্রিলিমিনারি ও ফাইনাল' },
      { name: 'NU প্রফেশনাল রেজাল্ট পেজ ✅', url: 'https://results.nu.ac.bd/professional', note: 'BBA/CSE/LLB প্রফেশনাল কোর্স রেজাল্ট' },
    ],
    guide: ['Masters বা Professional ট্যাব সিলেক্ট করুন', 'কোর্স ও বর্ষ নির্বাচন করে রেজিস্ট্রেশন নম্বর দিন']
  },
  {
    id: 'bou', title: 'বাংলাদেশ উন্মুক্ত বিশ্ববিদ্যালয় (BOU)', category: 'university', icon: 'fa-globe', color: 'cyan',
    desc: 'উন্মুক্ত বিশ্ববিদ্যালয় SSC, HSC, ডিগ্রি, BA/BSS, BBA ও মাস্টার্স রেজাল্ট',
    needs: ['স্টুডেন্ট আইডি (Student ID)', 'প্রোগ্রাম নির্বাচন'],
    sms_format: 'BOU <Space> Student_ID (পাঠান 16222 নম্বরে)',
    links: [
      { name: 'BOU সরাসরি রেজাল্ট পোর্টাল (Exam BOU) ✅', url: 'https://exam.bou.ac.bd/', note: 'সকল প্রোগ্রামের সরাসরি গ্রেডশিট ফলাফল' },
      { name: 'BOU অফিসিয়াল রেজাল্ট আর্কাইভ', url: 'https://bou.ac.bd/result', note: 'উন্মুক্ত বিশ্ববিদ্যালয় অফিসিয়াল গ্যাজেট' },
    ],
    guide: ['exam.bou.ac.bd পোর্টালে যান', 'আপনার প্রোগ্রাম (SSC/HSC/Degree/Honours) নির্বাচন করুন', '১১ ডিজিটের স্টুডেন্ট আইডি নম্বর দিন', '"View Result" বাটনে চাপুন']
  },
  {
    id: 'bteb', title: 'কারিগরি শিক্ষা বোর্ড (BTEB)', category: 'university', icon: 'fa-gears', color: 'rose',
    desc: 'ডিপ্লোমা ইন ইঞ্জিনিয়ারিং, টেক্সটাইল, মেডিকেল ও ভোকেশনাল রেজাল্ট',
    needs: ['রোল নম্বর', 'রেজিস্ট্রেশন নম্বর', 'প্রবিধান'],
    sms_format: 'BTEB <Space> ROLL (পাঠান 16222 নম্বরে)',
    links: [
      { name: 'BTEB সরাসরি রেজাল্ট পোর্টাল ✅', url: 'http://btebresult.gov.bd/', note: 'পলিটেকনিক ও ডিপ্লোমা সরাসরি রেজাল্ট পেজ' },
      { name: 'কারিগরি শিক্ষা বোর্ড মূল সাইট', url: 'http://www.bteb.gov.bd/site/page/8724cb1c-fb23-41bb-b68e-5b12da6f8e79', note: 'ডিপ্লোমা রেজাল্ট ও নোটিস' },
    ],
    guide: ['ডিপ্লোমা ইন ইঞ্জিনিয়ারিং বা নির্দিষ্ট কোর্স সিলেক্ট করুন', 'রোল নম্বর ও পরীক্ষার সাল দিন', 'সেমিস্টার রেজাল্ট তাৎক্ষণিক প্রিন্ট করুন']
  },
  {
    id: 'medical', title: 'মেডিকেল (MBBS) ও ডেন্টাল (BDS) ভর্তি রেজাল্ট', category: 'admission', icon: 'fa-user-doctor', color: 'emerald',
    desc: 'স্বাস্থ্য শিক্ষা অধিদপ্তর (DGME) — সরকারি ও বেসরকারি মেডিকেল ভর্তি ফলাফল',
    needs: ['মেডিকেল ভর্তি পরীক্ষার রোল নম্বর'],
    sms_format: 'DGME <Space> RESULT <Space> ROLL (পাঠান 16222 নম্বরে)',
    links: [
      { name: 'DGHS সরাসরি রেজাল্ট পোর্টাল ✅', url: 'http://result.dghs.gov.bd/', note: 'MBBS ও BDS রেজাল্ট সরাসরি মার্কস ও কলেজ বরাদ্ধ' },
      { name: 'DGME Teletalk গেটওয়ে', url: 'http://dgme.teletalk.com.bd/', note: 'স্বাস্থ্য শিক্ষা অধিদপ্তর ফলাফল গেটওয়ে' },
    ],
    guide: ['result.dghs.gov.bd লিংকে প্রবেশ করুন', 'MBBS অথবা BDS অপশনে আপনার ৭ ডিজিটের ভর্তি রোল দিন', 'ফলাফল, মেধা স্কোর ও বরাদ্ধকৃত কলেজ দেখতে পাবেন']
  },
  {
    id: 'nursing', title: 'নার্সিং ও মিডওয়াইফারি ভর্তি রেজাল্ট', category: 'admission', icon: 'fa-heart-pulse', color: 'rose',
    desc: 'বিএসসি ইন নার্সিং ও ডিপ্লোমা নার্সিং কেন্দ্রীয় ভর্তি ফলাফল',
    needs: ['ভর্তি পরীক্ষার রোল নম্বর'],
    links: [
      { name: 'DGNM Teletalk রেজাল্ট পোর্টাল ✅', url: 'http://dgnm.teletalk.com.bd/', note: 'নার্সিং ভর্তি পরীক্ষার সরাসরি ফলাফল পেজ' },
      { name: 'বাংলাদেশ নার্সিং কাউন্সিল (BNMC)', url: 'https://bnmc.gov.bd/', note: 'অফিসিয়াল গ্যাজেট ও নোটিস' },
    ],
    guide: ['নার্সিং ভর্তি রোল নম্বর দিন', 'রেজাল্ট শিট ও বরাদ্ধকৃত নার্সিং কলেজ তালিকা দেখুন']
  },
  {
    id: 'ntrca', title: 'NTRCA শিক্ষক নিবন্ধন রেজাল্ট', category: 'job', icon: 'fa-chalkboard-user', color: 'teal',
    desc: 'বেসরকারি শিক্ষক নিবন্ধন প্রিলিমিনারি, লিখিত ও ভাইভা ফলাফল',
    needs: ['রোল নম্বর', 'পরীক্ষার নাম (নিবন্ধন নম্বর)'],
    sms_format: 'NTRCA <Space> ROLL (পাঠান 16222 নম্বরে)',
    links: [
      { name: 'NTRCA Teletalk সরাসরি রেজাল্ট পেজ ✅', url: 'http://ntrca.teletalk.com.bd/result/', note: 'প্রিলিমিনারি/লিখিত/চূড়ান্ত ফলাফল সরাসরি চেক' },
      { name: 'NTRCA মূল ওয়েবসাইট', url: 'http://ntrca.gov.bd/', note: 'অফিসিয়াল শিক্ষক নিবন্ধন নোটিস ও ফলাফল' },
    ],
    guide: ['পরীক্ষার ধাপ (যেমন: 18th NTRCA Exam) সিলেক্ট করুন', 'আপনার রোল নম্বর দিন এবং সাবমিট বাটনে চাপুন']
  },
  {
    id: 'bpsc', title: 'বিসিএস ও নন-ক্যাডার রেজাল্ট (BPSC)', category: 'job', icon: 'fa-landmark', color: 'purple',
    desc: 'বাংলাদেশ সরকারি কর্ম কমিশন (বিপিএসসি) প্রিলিমিনারি ও লিখিত ফলাফল',
    needs: ['রেজিস্ট্রেশন নম্বর / রোল'],
    sms_format: 'PSC <Space> <RegNo> (পাঠান 16222 নম্বরে)',
    links: [
      { name: 'BPSC Teletalk রেজাল্ট পোর্টাল ✅', url: 'http://bpsc.teletalk.com.bd/', note: 'বিসিএস প্রিলিমিনারি/লিখিত ফলাফল অনুসন্ধান' },
      { name: 'বিপিএসসি মূল নোটিস বোর্ড', url: 'http://www.bpsc.gov.bd/', note: 'অফিসিয়াল বিসিএস গ্যাজেট ও রেজাল্ট শিট' },
    ],
    guide: ['নির্দিষ্ট বিসিএস পরীক্ষা সিলেক্ট করুন', 'আপনার রেজিস্ট্রেশন নম্বর দিন']
  }
]

export function resultsPage(loggedIn: boolean): string {
  const sourcesJson = JSON.stringify(RESULT_SOURCES)
  return pageShell('রেজাল্ট হাব', 'bg-slate-950 text-white min-h-screen', `
${siteHeader({ activeKey: 'results', loggedIn, theme: 'dark' })}

<main class="max-w-7xl mx-auto px-4 py-10">
  <!-- হিরো হেডার -->
  <header class="text-center mb-8">
    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
      <i class="fas fa-circle-check"></i> শতভাগ যাচাইকৃত সরাসরি সরকারি ও প্রাতিষ্ঠানিক ফলাফল লিংক
    </div>
    <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight">🎓 কেন্দ্রীয় রেজাল্ট হাব</h1>
    <p class="text-slate-400 mt-2 max-w-2xl mx-auto text-sm sm:text-base">
      SSC · HSC · অনার্স · ডিগ্রি · উন্মুক্ত (BOU) · কারিগরি · মেডিকেল · NTRCA · BCS — সরাসরি রেজাল্ট গেটওয়ে, এসএমএস পদ্ধতি ও লাইভ সার্ভার স্ট্যাটাস
    </p>
    ${loggedIn ? '' : '<p class="mt-3 text-xs inline-block bg-amber-500/20 border border-amber-400/30 text-amber-300 px-4 py-2 rounded-full">💡 সাইন-আপ করলে রোল ও রেজিস্ট্রেশন সেভ থাকবে — রেজাল্টের দিন এক-ক্লিক প্রি-ফিল!</p>'}
  </header>

  <!-- ⚖️ বোর্ড চ্যালেঞ্জ ও খাতা পুনর্নিরীক্ষণ প্রমোশনাল কার্ড -->
  <section class="mb-10 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-400/40 rounded-3xl p-6 sm:p-7 shadow-xl">
    <div class="flex flex-col md:flex-row items-center justify-between gap-5">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center text-2xl font-bold shrink-0 shadow-lg">
          <i class="fas fa-scale-balanced"></i>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="font-extrabold text-lg sm:text-xl text-amber-200">⚖️ বোর্ড চ্যালেঞ্জ / খাতা পুনর্নিরীক্ষণ হাব</h2>
            <span class="text-[10px] bg-amber-400 text-black px-2 py-0.5 rounded-full font-black">নতুন টুল</span>
          </div>
          <p class="text-xs sm:text-sm text-slate-300 mt-1">
            ফলাফলে সন্তুষ্ট নন? এসএমএস ফরমেট জেনারেটর, সঠিক ফি হিসাব, দ্বিপত্র বিষয়ের নিয়মাবলী এবং সকল বোর্ডের সরাসরি নোটিস-ফলাফল লিংক দেখুন
          </p>
        </div>
      </div>
      <a href="/board-challenge" class="w-full md:w-auto text-center px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm hover:scale-105 transition shadow-lg whitespace-nowrap">
        বোর্ড চ্যালেঞ্জ পোর্টাল খুলুন <i class="fas fa-arrow-right ml-1"></i>
      </a>
    </div>
  </section>

  <!-- ⚡ ডিরেক্ট রেজাল্ট চেকার (SSC/HSC/JSC প্রক্সি) -->
  <section id="direct-checker" class="mb-10 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-400/30 rounded-3xl p-6 sm:p-8">
    <div class="flex items-center gap-3 mb-1">
      <div class="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 text-xl"><i class="fas fa-bolt"></i></div>
      <div>
        <h2 class="font-bold text-xl text-white">⚡ সরাসরি রেজাল্ট দেখুন — এডুসবেই!</h2>
        <p class="text-xs text-slate-400">SSC · HSC · JSC — রোল ও রেজিস্ট্রেশন দিলেই সরাসরি মার্কশিটসহ রেজাল্ট দেখতে পাবেন</p>
      </div>
    </div>
    <form id="checkerForm" class="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5 text-sm">
      <div>
        <label class="text-xs text-slate-400 font-semibold">পরীক্ষা</label>
        <select name="exam" id="ckExam" class="w-full mt-1 bg-slate-800 border border-white/15 rounded-xl px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none">
          <option value="ssc">SSC / দাখিল</option>
          <option value="hsc">HSC / আলিম</option>
          <option value="jsc">JSC / JDC</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-slate-400 font-semibold">পাসের সন</label>
        <select name="year" id="ckYear" class="w-full mt-1 bg-slate-800 border border-white/15 rounded-xl px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none"></select>
      </div>
      <div>
        <label class="text-xs text-slate-400 font-semibold">শিক্ষা বোর্ড</label>
        <select name="board" id="ckBoard" class="w-full mt-1 bg-slate-800 border border-white/15 rounded-xl px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none">
          <option value="dhaka">ঢাকা</option>
          <option value="rajshahi">রাজশাহী</option>
          <option value="comilla">কুমিল্লা</option>
          <option value="jessore">যশোর</option>
          <option value="chittagong">চট্টগ্রাম</option>
          <option value="barisal">বরিশাল</option>
          <option value="sylhet">সিলেট</option>
          <option value="dinajpur">দিনাজপুর</option>
          <option value="mymensingh">ময়মনসিংহ</option>
          <option value="madrasah">মাদ্রাসা</option>
          <option value="tec">কারিগরি</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-slate-400 font-semibold">রোল নম্বর</label>
        <input name="roll" id="ckRoll" inputmode="numeric" class="w-full mt-1 bg-slate-800 border border-white/15 rounded-xl px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none" placeholder="যেমন: 123456" required>
      </div>
      <div>
        <label class="text-xs text-slate-400 font-semibold">রেজিস্ট্রেশন নম্বর</label>
        <input name="reg" id="ckReg" inputmode="numeric" class="w-full mt-1 bg-slate-800 border border-white/15 rounded-xl px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none" placeholder="যেমন: 1234567890" required>
      </div>
      <button type="submit" id="ckBtn" class="col-span-2 md:col-span-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-3 rounded-xl transition shadow-lg">
        <i class="fas fa-magnifying-glass mr-1"></i> রেজাল্ট অনুসন্ধান করুন
      </button>
    </form>
    <p class="text-[11px] text-slate-500 mt-2.5"><i class="fas fa-circle-info"></i> সার্ভার অতিরিক্ত লোডের কারণে সাড়া না দিলে নিচের অফিসিয়াল সরকারি সরাসরি লিংকগুলো ব্যবহার করুন।</p>
    <div id="ckResult" class="mt-4"></div>
  </section>

  <!-- ফিল্টার চিপস ও সার্চ বার -->
  <div class="mb-6 space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <h2 class="font-bold text-lg text-slate-200"><i class="fas fa-landmark mr-2 text-emerald-400"></i>সকল পরীক্ষার অফিসিয়াল সরাসরি রেজাল্ট ডিরেক্টরি</h2>
      <div class="w-full sm:w-72 relative">
        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
        <input type="text" id="resSearch" oninput="filterResults()" placeholder="পরীক্ষা বা বোর্ডের নাম খুঁজুন..." class="w-full bg-slate-900 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs focus:border-emerald-400 focus:outline-none">
      </div>
    </div>

    <!-- ক্যাটাগরি ট্যাবসমূহ -->
    <div class="flex flex-wrap gap-2" id="catTabs">
      <button onclick="setResultCategory('')" data-cat="" class="cat-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-500 text-white transition shadow-sm">সব ফলাফল</button>
      <button onclick="setResultCategory('board')" data-cat="board" class="cat-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 transition">স্কুল ও বোর্ড (SSC/HSC)</button>
      <button onclick="setResultCategory('university')" data-cat="university" class="cat-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 transition">বিশ্ববিদ্যালয় (NU/BOU/BTEB)</button>
      <button onclick="setResultCategory('admission')" data-cat="admission" class="cat-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 transition">ভর্তি পরীক্ষা (Medical/Nursing)</button>
      <button onclick="setResultCategory('job')" data-cat="job" class="cat-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 transition">চাকরি ও পেশাগত (NTRCA/BCS)</button>
    </div>
  </div>

  <section id="result-cards" class="grid md:grid-cols-2 lg:grid-cols-2 gap-5"></section>
</main>

<!-- গাইড মডাল -->
<div id="guideModal" class="hidden fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" onclick="if(event.target===this)closeGuide()">
  <div class="bg-slate-900 border border-white/15 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl">
    <div class="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
      <h3 id="guideTitle" class="font-bold text-lg text-white"></h3>
      <button onclick="closeGuide()" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"><i class="fas fa-times"></i></button>
    </div>
    <div id="guideBody" class="space-y-4 text-sm"></div>
  </div>
</div>

${loggedIn ? `
<!-- রোল সেভ মডাল -->
<div id="rollModal" class="hidden fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" onclick="if(event.target===this)closeRoll()">
  <div class="bg-slate-900 border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl">
    <div class="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
      <h3 class="font-bold text-lg text-white">🔖 রোল/রেজিস্ট্রেশন সেভ করুন</h3>
      <button onclick="closeRoll()" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"><i class="fas fa-times"></i></button>
    </div>
    <form id="rollForm" class="space-y-3 text-sm">
      <input type="hidden" name="exam_type" id="rollExamType">
      <div><label class="text-xs text-slate-400">বোর্ড (প্রযোজ্য হলে)</label>
        <select name="board" class="w-full mt-1 bg-slate-800 border border-white/15 rounded-xl px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none">
          <option value="">— নেই / প্রযোজ্য নয় —</option>
          ${['ঢাকা', 'রাজশাহী', 'কুমিল্লা', 'যশোর', 'চট্টগ্রাম', 'বরিশাল', 'সিলেট', 'দিনাজপুর', 'ময়মনসিংহ', 'মাদ্রাসা', 'কারিগরি'].map(b => `<option>${b}</option>`).join('')}
        </select></div>
      <div><label class="text-xs text-slate-400">রোল নম্বর</label>
        <input name="roll" class="w-full mt-1 bg-slate-800 border border-white/15 rounded-xl px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none" placeholder="123456"></div>
      <div><label class="text-xs text-slate-400">রেজিস্ট্রেশন নম্বর</label>
        <input name="reg" class="w-full mt-1 bg-slate-800 border border-white/15 rounded-xl px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none" placeholder="1234567890"></div>
      <div><label class="text-xs text-slate-400">পাসের/পরীক্ষার সন</label>
        <input name="exam_year" class="w-full mt-1 bg-slate-800 border border-white/15 rounded-xl px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none" placeholder="2026"></div>
      <button type="submit" class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-2.5 rounded-xl transition shadow-md">সেভ করুন</button>
    </form>
  </div>
</div>` : ''}

<script>
const SOURCES = ${sourcesJson};
const LOGGED_IN = ${loggedIn};
let savedRolls = [];
let curCategory = '';

function statusBadge(state){
  if(state==='up') return '<span class="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20"><span class="w-1.5 h-1.5 bg-emerald-400 rounded-full pulse-soft"></span> সচল</span>';
  if(state==='down') return '<span class="flex items-center gap-1 text-[11px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20"><span class="w-1.5 h-1.5 bg-rose-400 rounded-full"></span> ডাউন</span>';
  return '<span class="flex items-center gap-1 text-[11px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full"><span class="w-1.5 h-1.5 bg-slate-400 rounded-full pulse-soft"></span> চেক হচ্ছে</span>';
}

function setResultCategory(cat) {
  curCategory = cat;
  document.querySelectorAll('.cat-btn').forEach(b => {
    if (b.dataset.cat === cat) {
      b.className = 'cat-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-500 text-white transition shadow-sm';
    } else {
      b.className = 'cat-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 transition';
    }
  });
  render();
}

function filterResults() {
  render();
}

function render(){
  const query = (document.getElementById('resSearch')?.value || '').toLowerCase().trim();
  let list = curCategory ? SOURCES.filter(s => s.category === curCategory) : SOURCES;
  if (query) {
    list = list.filter(s =>
      (s.title || '').toLowerCase().includes(query) ||
      (s.desc || '').toLowerCase().includes(query)
    );
  }

  const box = document.getElementById('result-cards');
  if (!list.length) {
    box.innerHTML = '<div class="col-span-full bg-slate-900/60 border border-white/10 rounded-2xl p-8 text-center text-slate-400 text-sm">কোনো রেজাল্ট সোর্স পাওয়া যায়নি</div>';
    return;
  }

  box.innerHTML = list.map(s => {
    const roll = savedRolls.find(r => r.exam_type === s.id);
    return \`
    <article class="card-hover bg-slate-900 border border-\${s.color}-500/30 rounded-2xl p-5 flex flex-col justify-between">
      <div>
        <div class="flex items-start gap-3 mb-3">
          <div class="w-12 h-12 bg-\${s.color}-500/20 rounded-xl flex items-center justify-center text-\${s.color}-400 shrink-0"><i class="fas \${s.icon} text-xl"></i></div>
          <div class="flex-1 min-w-0">
            <h2 class="font-bold text-base text-white leading-tight">\${s.title}</h2>
            <p class="text-xs text-slate-400 mt-1">\${s.desc}</p>
          </div>
        </div>

        \${roll ? \`<div class="mb-3 text-xs bg-emerald-500/10 border border-emerald-400/20 rounded-xl px-3 py-2 flex items-center gap-2 flex-wrap">
          <i class="fas fa-bookmark text-emerald-400"></i> সেভড: রোল \${roll.roll || '—'} \${roll.board ? '· '+roll.board : ''} \${roll.exam_year ? '· '+roll.exam_year : ''}
          <button onclick="copyRoll('\${roll.id}')" class="ml-auto bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg transition text-[11px]">কপি <i class="fas fa-copy"></i></button>
          \${['ssc','hsc','jsc'].includes(s.id) ? \`<button onclick="prefillChecker('\${s.id}')" class="bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-300 px-2 py-1 rounded-lg transition font-semibold text-[11px]">⚡ এখানেই দেখুন</button>\` : ''}
        </div>\` : ''}

        <!-- সরাসরি লিংকসমূহ -->
        <div class="space-y-2 mb-3">
          \${s.links.map((l, i) => \`
          <div class="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3 py-2">
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-slate-200 truncate">\${i===0?'🥇':'🥈'} \${l.name}</p>
              <p class="text-[10px] text-slate-400 truncate">\${l.note}</p>
            </div>
            <span id="st-\${s.id}-\${i}">\${statusBadge('checking')}</span>
            <a href="\${l.url}" target="_blank" rel="noopener" class="text-xs bg-\${s.color}-500/20 hover:bg-\${s.color}-500/40 text-\${s.color}-300 px-3 py-1.5 rounded-lg transition font-semibold whitespace-nowrap">সরাসরি যান <i class="fas fa-arrow-up-right-from-square text-[10px] ml-0.5"></i></a>
          </div>\`).join('')}
        </div>

        \${s.sms_format ? \`
        <div class="bg-black/30 border border-white/5 rounded-xl p-2.5 mb-3 text-[11px]">
          <span class="text-slate-400">📱 এসএমএস ফরমেট:</span>
          <div class="font-mono text-emerald-300 font-semibold mt-0.5 select-all">\${s.sms_format}</div>
        </div>\` : ''}
      </div>

      <div class="flex gap-2 pt-2 border-t border-white/10">
        <button onclick="openGuide('\${s.id}')" class="flex-1 text-xs bg-white/10 hover:bg-white/20 py-2 rounded-xl transition font-semibold"><i class="fas fa-circle-info mr-1"></i> নির্দেশিকা</button>
        \${LOGGED_IN
          ? \`<button onclick="openRoll('\${s.id}')" class="flex-1 text-xs bg-white/10 hover:bg-white/20 py-2 rounded-xl transition font-semibold"><i class="fas fa-bookmark mr-1"></i> \${roll ? 'রোল আপডেট' : 'রোল সেভ'}</button>\`
          : \`<a href="/signup" class="flex-1 text-center text-xs bg-white/10 hover:bg-white/20 py-2 rounded-xl transition font-semibold"><i class="fas fa-bookmark mr-1"></i> রোল সেভ করুন</a>\`}
      </div>
    </article>\`;
  }).join('');
  checkStatuses();
}

// লাইভ সার্ভার স্ট্যাটাস — সার্ভার-সাইড প্রক্সি চেক
async function checkStatuses(){
  for (const s of SOURCES){
    s.links.forEach(async (l, i) => {
      try {
        const r = await axios.get('/api/link-status', { params: { url: l.url }, timeout: 12000 });
        const el = document.getElementById('st-'+s.id+'-'+i);
        if (el) el.innerHTML = statusBadge(r.data.up ? 'up' : 'down');
      } catch(e) {
        const el = document.getElementById('st-'+s.id+'-'+i);
        if (el) el.innerHTML = statusBadge('down');
      }
    });
  }
}

function openGuide(id){
  const s = SOURCES.find(x => x.id === id);
  if (!s) return;
  document.getElementById('guideTitle').textContent = '📘 ' + s.title + ' — রেজাল্ট নির্দেশিকা';
  document.getElementById('guideBody').innerHTML = \`
    <div class="bg-white/5 rounded-xl p-3 border border-white/5">
      <p class="text-xs text-slate-400 mb-2 font-semibold">যা যা সাথে রাখতে হবে:</p>
      <div class="flex flex-wrap gap-2">\${s.needs.map(n => '<span class="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-medium">'+n+'</span>').join('')}</div>
    </div>
    <ol class="space-y-2">\${s.guide.map((g, i) => \`
      <li class="flex gap-3 bg-white/5 rounded-xl px-3 py-2.5 border border-white/5">
        <span class="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-xs font-bold shrink-0">\${i+1}</span>
        <span class="text-slate-200 leading-relaxed">\${g}</span>
      </li>\`).join('')}
    </ol>
    \${s.sms_format ? \`
    <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs">
      <p class="font-bold text-emerald-300 mb-1">📱 দ্রুত রেজাল্ট পেতে Teletalk SMS পদ্ধতি:</p>
      <p class="font-mono text-slate-200 select-all">\${s.sms_format}</p>
    </div>\` : ''}\`;
  document.getElementById('guideModal').classList.remove('hidden');
}
function closeGuide(){ document.getElementById('guideModal').classList.add('hidden'); }

async function copyRoll(id){
  const r = savedRolls.find(x => String(x.id) === String(id));
  if (!r) return;
  const text = ['রোল: ' + (r.roll || ''), r.reg ? 'রেজি: ' + r.reg : '', r.board ? 'বোর্ড: ' + r.board : '', r.exam_year ? 'সন: ' + r.exam_year : ''].filter(Boolean).join(' | ');
  await navigator.clipboard.writeText(text);
  alert('✅ কপি হয়েছে: ' + text);
}

// ===== ডিরেক্ট রেজাল্ট চেকার =====
(function initYears(){
  const sel = document.getElementById('ckYear');
  const now = new Date().getFullYear();
  let opts = '';
  for (let y = now; y >= now - 10; y--) opts += '<option>' + y + '</option>';
  sel.innerHTML = opts;
})();

const BOARD_BN = {dhaka:'ঢাকা',rajshahi:'রাজশাহী',comilla:'কুমিল্লা',jessore:'যশোর',chittagong:'চট্টগ্রাম',barisal:'বরিশাল',sylhet:'সিলেট',dinajpur:'দিনাজপুর',mymensingh:'ময়মনসিংহ',madrasah:'মাদ্রাসা',tec:'কারিগরি'};

function gradeColor(g){
  if(!g) return 'slate';
  g = String(g).toUpperCase();
  if(g.startsWith('A+')) return 'emerald';
  if(g.startsWith('A-')) return 'teal';
  if(g.startsWith('A')) return 'teal';
  if(g.startsWith('B')) return 'sky';
  if(g.startsWith('C')) return 'amber';
  if(g.startsWith('D')) return 'orange';
  if(g==='F' || g.startsWith('FAIL')) return 'rose';
  return 'slate';
}

document.getElementById('checkerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('ckBtn');
  const box = document.getElementById('ckResult');
  const exam = document.getElementById('ckExam').value;
  const year = document.getElementById('ckYear').value;
  const board = document.getElementById('ckBoard').value;
  const roll = document.getElementById('ckRoll').value.trim();
  const reg = document.getElementById('ckReg').value.trim();
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> রেজাল্ট আনা হচ্ছে...';
  box.innerHTML = '';
  try {
    const r = await axios.get('/api/result/check', { params: { exam, year, board, roll, reg }, timeout: 20000 });
    if (r.data.ok) renderMarksheet(r.data);
    else showCheckError(r.data);
  } catch (err) {
    const d = err.response && err.response.data ? err.response.data : { fallback: true, error: 'সার্ভারে সংযোগ করা যায়নি' };
    showCheckError(d);
  }
  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-magnifying-glass mr-1"></i> রেজাল্ট অনুসন্ধান করুন';
});

function esc(s){ return String(s == null ? '' : s).replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c])); }

function renderMarksheet(d){
  const st = d.student || {};
  const subs = d.subjects || [];
  const res = d.result || {};
  const passed = String(res.status || '').toLowerCase().includes('pass');
  const gpa = res.gpa || res.detail || '';
  const infoRows = [
    ['নাম', st.name], ['পিতার নাম', st.father], ['মাতার নাম', st.mother],
    ['রোল', st.roll], ['রেজিস্ট্রেশন', st.regno], ['বোর্ড', BOARD_BN[String(st.board||'').toLowerCase()] || st.board],
    ['পরীক্ষা', String(st.exam||'').toUpperCase() + ' ' + (st.year||'')], ['গ্রুপ', st.group], ['প্রতিষ্ঠান', st.institute]
  ].filter(r => r[1]);
  document.getElementById('ckResult').innerHTML = \`
  <div id="marksheet" class="bg-slate-900 border \${passed ? 'border-emerald-400/40' : 'border-rose-400/40'} rounded-2xl overflow-hidden shadow-2xl">
    <div class="\${passed ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20' : 'bg-gradient-to-r from-rose-500/20 to-orange-500/20'} px-5 py-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="font-bold text-lg">\${passed ? '🎉' : '📋'} \${esc(st.name || 'রেজাল্ট')}</p>
        <p class="text-xs text-slate-400">\${esc(String(st.exam||'').toUpperCase())} \${esc(st.year||'')} · \${esc(BOARD_BN[String(st.board||'').toLowerCase()] || st.board || '')} বোর্ড</p>
      </div>
      <div class="text-right">
        <p class="text-2xl font-extrabold \${passed ? 'text-emerald-400' : 'text-rose-400'}">\${esc(gpa ? 'GPA ' + gpa : (res.status || ''))}</p>
        <p class="text-xs \${passed ? 'text-emerald-300' : 'text-rose-300'} font-semibold">\${passed ? '✅ উত্তীর্ণ' : esc(res.status || '')}</p>
      </div>
    </div>
    <div class="p-5 grid md:grid-cols-2 gap-5">
      <div>
        <p class="text-xs font-bold text-slate-400 mb-2">📇 শিক্ষার্থীর তথ্য</p>
        <table class="w-full text-sm">\${infoRows.map(r => \`<tr class="border-b border-white/5"><td class="py-1.5 text-slate-400 text-xs pr-3 whitespace-nowrap">\${r[0]}</td><td class="py-1.5 font-semibold">\${esc(r[1])}</td></tr>\`).join('')}</table>
      </div>
      <div>
        <p class="text-xs font-bold text-slate-400 mb-2">📊 বিষয়ভিত্তিক গ্রেড</p>
        \${subs.length ? \`<table class="w-full text-sm">
          <tr class="text-[11px] text-slate-500 border-b border-white/10"><th class="text-left py-1.5">কোড</th><th class="text-left py-1.5">বিষয়</th><th class="text-right py-1.5">গ্রেড</th></tr>
          \${subs.map(s => { const g = s.grade || s.letter_grade || s.gp || ''; const col = gradeColor(g); return \`
          <tr class="border-b border-white/5"><td class="py-1.5 text-slate-400 text-xs">\${esc(s.code || s.sub_code || '')}</td><td class="py-1.5">\${esc(s.name || s.sub_name || s.subject || '')}</td>
          <td class="py-1.5 text-right"><span class="text-xs font-bold bg-\${col}-500/20 text-\${col}-300 px-2 py-0.5 rounded-lg">\${esc(g)}</span></td></tr>\`; }).join('')}
        </table>\` : '<p class="text-xs text-slate-500">বিষয়ভিত্তিক গ্রেড পাওয়া যায়নি</p>'}
      </div>
    </div>
    <div class="px-5 pb-4 flex flex-wrap gap-2">
      <button onclick="printMarksheet()" class="text-xs bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition font-semibold"><i class="fas fa-print mr-1"></i> প্রিন্ট / PDF</button>
      <button onclick="copyMarksheet()" class="text-xs bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition font-semibold"><i class="fas fa-copy mr-1"></i> টেক্সট কপি</button>
      <a href="/board-challenge" class="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-4 py-2 rounded-xl transition font-bold"><i class="fas fa-scale-balanced mr-1"></i> বোর্ড চ্যালেঞ্জ করবেন?</a>
    </div>
  </div>\`;
  document.getElementById('ckResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.__lastResult = d;
}

function showCheckError(d){
  const notFound = !d.fallback;
  document.getElementById('ckResult').innerHTML = \`
  <div class="bg-\${notFound ? 'amber' : 'rose'}-500/10 border border-\${notFound ? 'amber' : 'rose'}-400/30 rounded-2xl p-5 text-sm">
    <p class="font-bold \${notFound ? 'text-amber-300' : 'text-rose-300'}"><i class="fas fa-\${notFound ? 'circle-question' : 'triangle-exclamation'} mr-1"></i> \${esc(d.error || 'রেজাল্ট পাওয়া যায়নি')}</p>
    \${notFound
      ? '<p class="text-xs text-slate-400 mt-2">রোল, রেজিস্ট্রেশন, বোর্ড ও সন আবার মিলিয়ে দেখুন। রেজাল্ট এখনো প্রকাশ না হলে পাওয়া যাবে না।</p>'
      : \`<p class="text-xs text-slate-400 mt-2">সার্ভিসটি এই মুহূর্তে ব্যস্ত/ডাউন। চিন্তা নেই — নিচের <b>অফিসিয়াল সরকারি সরাসরি লিংক</b> থেকে রেজাল্ট দেখুন:</p>
         <button onclick="document.getElementById('result-cards').scrollIntoView({behavior:'smooth'})" class="mt-3 text-xs bg-gradient-to-r from-emerald-500 to-teal-500 font-bold px-4 py-2 rounded-xl"><i class="fas fa-arrow-down mr-1"></i> অফিসিয়াল লিংকে যান</button>\`}
  </div>\`;
}

function printMarksheet(){
  const el = document.getElementById('marksheet');
  if (!el) return;
  const w = window.open('', '_blank');
  w.document.write('<html><head><title>এডুসব — রেজাল্ট</title><script src="https://cdn.tailwindcss.com"><\\/script></head><body class="bg-white text-black p-6">' + el.outerHTML.replace(/bg-slate-900/g,'bg-white').replace(/text-slate-4\\d\\d/g,'text-gray-600').replace(/border-white\\/\\d+/g,'border-gray-200') + '<p class="text-xs text-gray-400 mt-4">সূত্র: এডুসব — প্রাথমিক ফলাফল</p></body></html>');
  w.document.close();
  setTimeout(() => w.print(), 800);
}

async function copyMarksheet(){
  const d = window.__lastResult; if (!d) return;
  const st = d.student || {}, res = d.result || {};
  const lines = ['📊 ' + String(st.exam||'').toUpperCase() + ' ' + (st.year||'') + ' রেজাল্ট', 'নাম: ' + (st.name||''), 'রোল: ' + (st.roll||'') + ' | বোর্ড: ' + (st.board||''), 'ফলাফল: ' + (res.status||'') + (res.gpa ? ' | GPA: ' + res.gpa : ''), ...(d.subjects||[]).map(s => '• ' + (s.name||s.subject||'') + ': ' + (s.grade||s.gp||'')), '— এডুসব থেকে'];
  await navigator.clipboard.writeText(lines.join('\\n'));
  alert('✅ রেজাল্ট কপি হয়েছে!');
}

function prefillChecker(examType){
  const r = savedRolls.find(x => x.exam_type === examType);
  if (!r) return;
  const map = {'ঢাকা':'dhaka','রাজশাহী':'rajshahi','কুমিল্লা':'comilla','যশোর':'jessore','চট্টগ্রাম':'chittagong','বরিশাল':'barisal','সিলেট':'sylhet','দিনাজপুর':'dinajpur','ময়মনসিংহ':'mymensingh','মাদ্রাসা':'madrasah','কারিগরি':'tec'};
  document.getElementById('ckExam').value = examType;
  if (r.board && map[r.board]) document.getElementById('ckBoard').value = map[r.board];
  if (r.roll) document.getElementById('ckRoll').value = r.roll;
  if (r.reg) document.getElementById('ckReg').value = r.reg;
  if (r.exam_year) document.getElementById('ckYear').value = r.exam_year;
  document.getElementById('direct-checker').scrollIntoView({ behavior: 'smooth' });
}

${loggedIn ? `
function openRoll(examType){
  document.getElementById('rollExamType').value = examType;
  const existing = savedRolls.find(r => r.exam_type === examType);
  const f = document.getElementById('rollForm');
  if (existing) { f.board.value = existing.board || ''; f.roll.value = existing.roll || ''; f.reg.value = existing.reg || ''; f.exam_year.value = existing.exam_year || ''; }
  else f.reset(), document.getElementById('rollExamType').value = examType;
  document.getElementById('rollModal').classList.remove('hidden');
}
function closeRoll(){ document.getElementById('rollModal').classList.add('hidden'); }
document.getElementById('rollForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  const existing = savedRolls.find(r => r.exam_type === data.exam_type);
  if (existing) await axios.delete('/api/saved-rolls/' + existing.id);
  await axios.post('/api/saved-rolls', data);
  closeRoll(); await loadRolls(); render();
});
async function loadRolls(){
  try { const r = await axios.get('/api/saved-rolls'); savedRolls = r.data.rolls || []; } catch(e){}
}
loadRolls().then(render);
` : 'render();'}
</script>
`)
}
