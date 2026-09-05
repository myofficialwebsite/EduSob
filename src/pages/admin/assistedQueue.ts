// সেন্ট্রাল এডমিন — অ্যাসিস্টেড আবেদন ট্র্যাকার কিউ (Assisted Applications Hub)
export function renderAssistedQueueTab(): string {
  return `
<section id="tab-assisted" class="tab-pane space-y-6">
  <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-4">
    <div class="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-100">
      <div>
        <div class="inline-flex items-center gap-1 text-[11px] bg-sky-100 text-sky-800 font-bold px-2.5 py-0.5 rounded-full mb-1">
          📋 স্টুডেন্ট হেল্পডেস্ক
        </div>
        <h2 class="text-xl font-black text-slate-900 flex items-center gap-2">
          অ্যাসিস্টেড আবেদন ম্যানেজমেন্ট ও প্রসেসিং কিউ
        </h2>
        <p class="text-xs text-slate-500 mt-0.5">
          শিক্ষার্থীদের জন্য কলেজ ভর্তি, সরকারি চাকরি ও স্কলারশিপ ফরম ফিলাপ সহায়তার আবেদনসমূহ পরিচালনা ও স্ট্যাটাস আপডেট করুন।
        </p>
      </div>

      <!-- ফিল্টার বাটনস -->
      <div class="flex items-center gap-1.5 flex-wrap text-xs">
        <button onclick="loadAssistedApps('')" class="px-3 py-1.5 rounded-xl font-bold bg-slate-900 text-white assisted-flt-btn" data-flt="">সবগুলো</button>
        <button onclick="loadAssistedApps('requested')" class="px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 assisted-flt-btn" data-flt="requested">⌛ নতুন অনুরোধ</button>
        <button onclick="loadAssistedApps('paid')" class="px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 assisted-flt-btn" data-flt="paid">💳 ফি পরিশোধিত</button>
        <button onclick="loadAssistedApps('processing')" class="px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 assisted-flt-btn" data-flt="processing">🔄 প্রসেসিং চলছে</button>
        <button onclick="loadAssistedApps('completed')" class="px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 assisted-flt-btn" data-flt="completed">✅ সম্পন্ন</button>
      </div>
    </div>

    <!-- আবেদন তালিকা -->
    <div id="assistedAppsList" class="space-y-3">
      <div class="py-12 text-center text-slate-400">আবেদন তালিকা লোড হচ্ছে...</div>
    </div>
  </div>
</section>
`
}
