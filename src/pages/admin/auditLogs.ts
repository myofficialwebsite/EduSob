// সেন্ট্রাল এডমিন — সিকিউরিটি অডিট ট্রেইল ও একশন হিস্ট্রি (Audit Logs)
export function renderAuditLogsTab(): string {
  return `
<section id="tab-auditlogs" class="tab-pane space-y-6">
  <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-4">
    <div class="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-100">
      <div>
        <div class="inline-flex items-center gap-1 text-[11px] bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full mb-1">
          🛡️ সিস্টেম সিকিউরিটি গার্ড
        </div>
        <h2 class="text-xl font-black text-slate-900 flex items-center gap-2">
          এডমিন সিকিউরিটি অডিট লগ ও অ্যাকশন ট্রেইল
        </h2>
        <p class="text-xs text-slate-500 mt-0.5">
          ইউজার রোল পরিবর্তন, পাসওয়ার্ড রিসেট, ওয়ালেট অ্যাডজাস্টমেন্ট, ফোর্স সিঙ্ক ও কন্টেন্ট পাবলিশের অপরিবর্তনীয় লগ।
        </p>
      </div>

      <div class="flex items-center gap-2">
        <input id="auditSearchInput" oninput="filterAuditLogs(this.value)" placeholder="অডিট খুঁজুন (এডমিন/অ্যাকশন)..." class="border border-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500 w-52">
        <button onclick="loadAuditLogs()" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold text-xs flex items-center gap-1">
          <i class="fas fa-rotate"></i> রিফ্রেশ
        </button>
      </div>
    </div>

    <!-- অডিট লগ টেবিল -->
    <div class="overflow-x-auto">
      <table class="w-full text-xs text-left">
        <thead>
          <tr class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <th class="py-2.5 px-3">সময়</th>
            <th class="py-2.5 px-3">অ্যাকশন ধরণ</th>
            <th class="py-2.5 px-3">এডমিনের নাম</th>
            <th class="py-2.5 px-3">টার্গেট</th>
            <th class="py-2.5 px-3">বিস্তারিত ও সিদ্ধান্ত</th>
          </tr>
        </thead>
        <tbody id="auditLogsTableBody" class="divide-y divide-slate-100 text-[11px]">
          <tr><td colspan="5" class="text-center py-8 text-slate-400">অডিট লগ লোড হচ্ছে...</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</section>
`
}
