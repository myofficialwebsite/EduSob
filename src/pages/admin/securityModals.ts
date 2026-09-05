// সেন্ট্রাল এডমিন সিকিউরিটি মোডালস (রোল পরিবর্তন সিকিউরিটি, পাসওয়ার্ড রিসেট ও কন্টেন্ট প্রিভিউ)
export function renderSecurityModals(): string {
  return `
<!-- ১. হাই-সিকিউরিটি রোল পরিবর্তন মোডাল -->
<div id="admRoleModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden items-center justify-center p-4">
  <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
    <div class="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center font-bold text-lg">
          🛡️
        </div>
        <div>
          <h3 class="font-extrabold text-sm">ইউজার রোল সিকিউরিটি পরিবর্তন</h3>
          <p class="text-[11px] text-slate-300">এডমিন ও বিশেষ ক্ষমতা প্রদান গার্ড</p>
        </div>
      </div>
      <button onclick="closeRoleModal()" class="text-slate-400 hover:text-white text-lg font-bold">✕</button>
    </div>

    <form onsubmit="return submitRoleChange(event)" class="p-5 space-y-4 text-xs text-slate-700">
      <input type="hidden" id="roleTargetUserId">
      
      <!-- টার্গেট ইউজার পরিচিতি -->
      <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
        <p class="font-bold text-slate-900 text-sm" id="roleTargetUserName">—</p>
        <p class="text-slate-500" id="roleTargetUserPhone">ফোন: —</p>
        <p class="text-slate-500">বর্তমান রোল: <span id="roleTargetCurrentRole" class="font-bold text-slate-800">—</span></p>
      </div>

      <!-- সুপার এডমিন প্রোটেকশন ব্যানার -->
      <div id="roleSuperAdminWarning" class="hidden p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
        ⚠️ এটি সুরক্ষিত সুপার এডমিন অ্যাকাউন্ট। এই অ্যাকাউন্টের রোল পরিবর্তন সম্পূর্ণরূপে সংরক্ষিত ও নিষিদ্ধ।
      </div>

      <!-- নতুন রোল নির্বাচন -->
      <label class="block font-semibold">
        নতুন রোল নির্বাচন করুন *
        <select id="roleSelectNew" onchange="onRoleSelectChange(this.value)" class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-amber-500 bg-white">
          <option value="user">👤 সাধারণ ইউজার (Student / User)</option>
          <option value="teacher">👨‍🏫 শিক্ষক ও মেন্টর (Teacher / Mentor)</option>
          <option value="admin">👑 সম্পূর্ণ সিস্টেম এডমিন (Super Admin)</option>
        </select>
      </label>

      <!-- এডমিন রোলের ক্ষেত্রে বাধ্যতামূলক কনফার্মেশন বক্স -->
      <div id="roleAdminConfirmBox" class="hidden p-3.5 bg-rose-50 border border-rose-300 rounded-2xl space-y-2">
        <p class="text-rose-900 font-bold flex items-center gap-1.5">
          <i class="fas fa-triangle-exclamation text-rose-600"></i> নিরাপত্তা সতর্কতা: সম্পূর্ণ এডমিন এক্সেস!
        </p>
        <p class="text-[11px] text-rose-800 leading-tight">
          এডমিন রোল পেলে এই ইউজার পুরো সিস্টেম ও ডাটাবেজ নিয়ন্ত্রণ করতে পারবেন। নিশ্চিত করতে নিচের ঘরে <b>CONFIRM</b> টাইপ করুন:
        </p>
        <input type="text" id="roleConfirmPhrase" placeholder="CONFIRM টাইপ করুন..." class="w-full border border-rose-400 rounded-xl px-3 py-1.5 text-xs font-mono font-bold uppercase focus:outline-none bg-white text-rose-950">
      </div>

      <!-- রোল পরিবর্তনের কারণ (অডিট ট্রেইলের জন্য) -->
      <label class="block font-semibold">
        রোল পরিবর্তনের কারণ / অডিট নোট *
        <textarea id="roleChangeReason" required placeholder="কী কারণে বা কোন সিদ্ধান্তের প্রেক্ষিতে এই রোল দেওয়া হচ্ছে লিখুন..." rows="2" class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"></textarea>
      </label>

      <div class="flex gap-2 pt-2 border-t border-slate-100">
        <button type="button" onclick="closeRoleModal()" class="flex-1 bg-slate-100 hover:bg-slate-200 font-bold py-2.5 rounded-xl transition text-slate-700">বাতিল</button>
        <button type="submit" id="btnSubmitRole" class="flex-1 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-white font-extrabold py-2.5 rounded-xl transition shadow">রোল নিশ্চিত করুন</button>
      </div>
    </form>
  </div>
</div>

<!-- ২. পাসওয়ার্ড রিসেট মোডাল -->
<div id="admPasswordModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden items-center justify-center p-4">
  <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
    <div class="p-5 bg-slate-900 text-white flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">🔑</span>
        <h3 class="font-bold text-sm">ইউজার পাসওয়ার্ড রিসেট</h3>
      </div>
      <button onclick="closePasswordModal()" class="text-slate-400 hover:text-white text-lg font-bold">✕</button>
    </div>

    <form onsubmit="return submitPasswordReset(event)" class="p-5 space-y-4 text-xs text-slate-700">
      <input type="hidden" id="passTargetUserId">
      <p class="text-slate-600">ইউজার: <b id="passTargetUserName">—</b> (<span id="passTargetUserPhone">—</span>)</p>

      <label class="block font-semibold">
        নতুন পাসওয়ার্ড লিখুন (কমপক্ষে ৬ অক্ষর) *
        <div class="relative mt-1">
          <input type="text" id="passNewValue" required minlength="6" placeholder="যেমন: edusob1234" class="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:border-sky-500 focus:outline-none">
          <button type="button" onclick="generateRandomPass()" class="absolute right-2 top-1.5 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold">র‍্যান্ডম পিন</button>
        </div>
      </label>

      <div class="flex gap-2 pt-2 border-t border-slate-100">
        <button type="button" onclick="closePasswordModal()" class="flex-1 bg-slate-100 hover:bg-slate-200 font-bold py-2.5 rounded-xl transition text-slate-700">বাতিল</button>
        <button type="submit" class="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl transition shadow">পাসওয়ার্ড সেভ করুন</button>
      </div>
    </form>
  </div>
</div>

<!-- ৩. ওয়ালেট অ্যাডজাস্ট মোডাল -->
<div id="admWalletModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden items-center justify-center p-4">
  <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
    <div class="p-5 bg-slate-900 text-white flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">💰</span>
        <h3 class="font-bold text-sm">ওয়ালেট ব্যালেন্স অ্যাডজাস্ট</h3>
      </div>
      <button onclick="closeWalletModal()" class="text-slate-400 hover:text-white text-lg font-bold">✕</button>
    </div>

    <form onsubmit="return submitWalletAdjust(event)" class="p-5 space-y-4 text-xs text-slate-700">
      <input type="hidden" id="walletTargetUserId">
      <p class="text-slate-600">ইউজার: <b id="walletTargetUserName">—</b> • বর্তমান ব্যালেন্স: <b class="text-emerald-600" id="walletTargetCurrentBalance">০ ৳</b></p>

      <label class="block font-semibold">
        টাকার পরিমাণ (+ বা - দিয়ে যোগ/কর্তন করুন) *
        <input type="number" id="walletAdjustAmount" required placeholder="যেমন: 50 বা -20" class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none">
      </label>

      <label class="block font-semibold">
        অ্যাডজাস্টের কারণ / নোট *
        <input type="text" id="walletAdjustNote" required placeholder="যেমন: রেফারেল বোনাস অ্যাডজাস্ট বা রিফান্ড" class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none">
      </label>

      <div class="flex gap-2 pt-2 border-t border-slate-100">
        <button type="button" onclick="closeWalletModal()" class="flex-1 bg-slate-100 hover:bg-slate-200 font-bold py-2.5 rounded-xl transition text-slate-700">বাতিল</button>
        <button type="submit" class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition shadow">ব্যালেন্স আপডেট করুন</button>
      </div>
    </form>
  </div>
</div>

<!-- ৪. কন্টেন্ট প্রিভিউ ও সোর্স ভেরিফাই মোডাল -->
<div id="admContentPreviewModal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm hidden items-center justify-center p-4">
  <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
    <div class="p-5 bg-slate-900 text-white flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <span class="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">👁️</span>
        <div>
          <h3 id="cpModalModule" class="font-extrabold text-sm uppercase tracking-wider text-teal-400">কন্টেন্ট প্রিভিউ</h3>
          <p id="cpModalTitle" class="font-bold text-xs text-slate-200 truncate max-w-md">—</p>
        </div>
      </div>
      <button onclick="closeContentPreviewModal()" class="text-slate-400 hover:text-white text-lg font-bold">✕</button>
    </div>

    <div id="cpModalBody" class="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-700">
      <!-- ডাইনামিকালি লোড হবে -->
    </div>

    <div class="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
      <a id="cpModalSourceLink" href="#" target="_blank" class="text-xs text-sky-600 hover:underline flex items-center gap-1 font-semibold">
        <i class="fas fa-arrow-up-right-from-square"></i> অফিশিয়াল সোর্স সরাসরি যাচাই করুন
      </a>
      <div class="flex gap-2">
        <button onclick="closeContentPreviewModal()" class="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs">বন্ধ করুন</button>
        <button id="cpModalApproveBtn" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow">
          <i class="fas fa-check mr-1"></i> পাবলিশ অনুমোদন করুন
        </button>
      </div>
    </div>
  </div>
</div>
`
}
