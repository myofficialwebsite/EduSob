// সেন্ট্রাল এডমিন — কন্টেন্ট ওয়ার্কফ্লো ও অটো-সিঙ্ক স্ট্যাজিং বার (Auto Sync → Preview → Source Verify → Admin Approve → Publish)

export interface ContentModuleConfig {
  moduleKey: string
  title: string
  sourceKey: string
  sourcePortalName: string
  sourcePortalUrl: string
  scope: string
}

export function renderContentWorkflowBar(cfg: ContentModuleConfig): string {
  return `
<div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 sm:p-5 mb-5 space-y-3">
  <div class="flex items-center justify-between gap-3 flex-wrap">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-black text-base">
        ⚡
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h3 class="font-extrabold text-slate-900 text-sm">${cfg.title} — অটো-কালেকশন ও ভেরিফিকেশন পাইপলাইন</h3>
          <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">স্বয়ংক্রিয় সিঙ্ক</span>
        </div>
        <p class="text-xs text-slate-500 mt-0.5">
          সোর্স: <a href="${cfg.sourcePortalUrl}" target="_blank" class="text-sky-600 hover:underline font-semibold">${cfg.sourcePortalName} ↗</a> • অটো-সিঙ্ক থেকে সংগৃহীত ডাটা যাচাই ও ১-ক্লিকে অনুমোদন
        </p>
      </div>
    </div>

    <div class="flex items-center gap-2 flex-wrap">
      <button onclick="triggerAutoCollection('${cfg.scope}')" class="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 font-black rounded-xl text-xs transition shadow flex items-center gap-1.5">
        <i class="fas fa-rotate"></i> ${cfg.sourcePortalName} সিঙ্ক করুন
      </button>
      <button onclick="toggleManualCrudForm('${cfg.moduleKey}')" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5">
        <i class="fas fa-plus"></i> <span id="btnManualToggle-${cfg.moduleKey}">ম্যানুয়ালি যোগ করুন</span>
      </button>
    </div>
  </div>

  <!-- ফিল্টার স্ট্যাটাস পিলস -->
  <div class="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
    <span class="text-slate-400 font-medium">ফিল্টার:</span>
    <button onclick="filterContentStaging('${cfg.moduleKey}', 'all')" class="content-flt-${cfg.moduleKey} px-2.5 py-1 rounded-lg font-bold bg-slate-900 text-white" data-status="all">সবগুলো</button>
    <button onclick="filterContentStaging('${cfg.moduleKey}', 'published')" class="content-flt-${cfg.moduleKey} px-2.5 py-1 rounded-lg font-bold bg-slate-100 text-slate-700 hover:bg-slate-200" data-status="published">🟢 অনুমোদিত ও লাইভ</button>
    <button onclick="filterContentStaging('${cfg.moduleKey}', 'pending')" class="content-flt-${cfg.moduleKey} px-2.5 py-1 rounded-lg font-bold bg-slate-100 text-slate-700 hover:bg-slate-200" data-status="pending">🟡 অপেক্ষমান যাচাই</button>
  </div>
</div>
`
}
