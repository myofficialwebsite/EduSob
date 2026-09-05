// এডুসব ফেজ-৬ ও ফেজ-১৫ — সেন্ট্রাল এডমিন কমান্ড সেন্টার (/admin)
import { pageShell, DARK_PORTAL_CSS } from './layout'
import { renderAdminHeader, ADMIN_CATEGORIES } from './admin/commandNav'
import { renderOverviewTab } from './admin/commandOverview'
import { renderSyncCenterTab } from './admin/syncCenter'
import { renderSecurityModals } from './admin/securityModals'
import { renderMentorControlTab } from './admin/mentorControl'
import { renderAssistedQueueTab } from './admin/assistedQueue'
import { renderAuditLogsTab } from './admin/auditLogs'
import { renderContentWorkflowBar } from './admin/contentWorkflow'

const lockScreen = `
<main class="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
  <section class="text-center max-w-md">
    <p class="text-6xl mb-4">🔒</p>
    <h1 class="text-2xl font-bold mb-2">এডমিন অনুমতি প্রয়োজন</h1>
    <p class="text-slate-400 mb-6">এই পাতাটি শুধুমাত্র এডমিনদের জন্য। এডমিন অ্যাকাউন্টে লগইন করুন।</p>
    <a href="/login" class="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl transition">লগইন করুন</a>
  </section>
</main>`

export function adminPage(isAdmin: boolean): string {
  if (!isAdmin) return pageShell('এডমিন প্যানেল', 'bg-slate-950', lockScreen)
  return pageShell('এডমিন কমান্ড সেন্টার', 'bg-slate-100 min-h-screen', ADMIN_BODY + ADMIN_SCRIPT, DARK_PORTAL_CSS)
}

const ADMIN_BODY = `
${renderAdminHeader()}

<main class="max-w-7xl mx-auto px-4 py-6 space-y-6">
  <!-- ১. লাইভ কমান্ড সেন্টার ও ওভারভিউ -->
  ${renderOverviewTab()}

  <!-- ২. ডাটা সিঙ্ক ও অটো কালেকশন সেন্টার -->
  ${renderSyncCenterTab()}

  <!-- ৩. সিকিউরিটি অডিট ট্রেইল -->
  ${renderAuditLogsTab()}

  <!-- ৪. ইউজার ও সিকিউরিটি ম্যানেজমেন্ট -->
  <section id="tab-users" class="tab-pane hidden space-y-4">
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-4">
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div class="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full mb-1">
            👥 ইউজার ও রোল গভর্ন্যান্স
          </div>
          <h2 class="text-xl font-black text-slate-900">ইউজার ম্যানেজমেন্ট ও প্রোটেক্টেড রোল কন্ট্রোল</h2>
          <p class="text-xs text-slate-500 mt-0.5">নিরাপদ রোল পরিবর্তন, পাসওয়ার্ড পুনরুদ্ধার, ওয়ালেট সামঞ্জস্য ও স্থিতি নিয়ন্ত্রণ</p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <input id="userSearch" oninput="debounceUserSearch()" placeholder="নাম / ফোন / কোড দিয়ে খুঁজুন..." class="border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500 w-full sm:w-60">
          <select id="userRoleFilter" onchange="loadUsers()" class="border border-slate-300 rounded-xl px-3 py-2 text-xs bg-white">
            <option value="">সকল রোল</option>
            <option value="admin">👑 এডমিন</option>
            <option value="teacher">👨‍🏫 শিক্ষক</option>
            <option value="user">👤 সাধারণ ইউজার</option>
          </select>
          <select id="userStatusFilter" onchange="loadUsers()" class="border border-slate-300 rounded-xl px-3 py-2 text-xs bg-white">
            <option value="">সকল স্ট্যাটাস</option>
            <option value="active">সক্রিয়</option>
            <option value="suspended">স্থগিত</option>
          </select>
        </div>
      </div>

      <!-- ইউজার তালিকা টেবিল -->
      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <th class="py-3 px-3">ইউজার পরিচিতি</th>
              <th class="py-3 px-3">ফোন নম্বর</th>
              <th class="py-3 px-3">ব্যালেন্স</th>
              <th class="py-3 px-3">রেফারেল</th>
              <th class="py-3 px-3 text-center">সুরক্ষিত রোল</th>
              <th class="py-3 px-3 text-center">স্ট্যাটাস</th>
              <th class="py-3 px-3 text-right">সিকিউরিটি ও অ্যাকশন</th>
            </tr>
          </thead>
          <tbody id="userRows" class="divide-y divide-slate-100">
            <tr><td colspan="7" class="text-center py-8 text-slate-400">ইউজার তালিকা লোড হচ্ছে...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- ৫. চাকরি সার্কুলার হাব -->
  <section id="tab-jobs" class="tab-pane hidden">
    ${renderContentWorkflowBar({
      moduleKey: 'jobs',
      title: 'চাকরি সার্কুলার',
      sourceKey: 'bpsc_govt_jobs',
      sourcePortalName: 'BPSC ও সরকারি জব পোর্টাল',
      sourcePortalUrl: 'https://bpsc.gov.bd',
      scope: 'all'
    })}
    <div id="contentBox-jobs"></div>
  </section>

  <!-- ৬. ভর্তি তথ্য ও পোর্টাল -->
  <section id="tab-admissions" class="tab-pane hidden">
    ${renderContentWorkflowBar({
      moduleKey: 'admissions',
      title: 'ভর্তি তথ্য ও ফলাফল',
      sourceKey: 'board_results_notices',
      sourcePortalName: 'শিক্ষা বোর্ড ও বিশ্ববিদ্যালয় পোর্টাল',
      sourcePortalUrl: 'https://dhakaeducationboard.gov.bd',
      scope: 'all'
    })}
    <div id="contentBox-admissions"></div>
  </section>

  <!-- ৭. নোটিস বোর্ড -->
  <section id="tab-notices" class="tab-pane hidden">
    ${renderContentWorkflowBar({
      moduleKey: 'notices',
      title: 'এডমিশন ও জব নোটিস',
      sourceKey: 'board_results_notices',
      sourcePortalName: 'শিক্ষা বোর্ড সেন্ট্রাল নোটিস',
      sourcePortalUrl: 'https://dhakaeducationboard.gov.bd',
      scope: 'all'
    })}
    <div id="contentBox-notices"></div>
  </section>

  <!-- ৮. MCQ ও কুইজ ব্যাংক -->
  <section id="tab-mcq" class="tab-pane hidden">
    ${renderContentWorkflowBar({
      moduleKey: 'mcq',
      title: 'MCQ ও কুইজ ব্যাংক',
      sourceKey: 'nctb_curriculum',
      sourcePortalName: 'NCTB ও জাতীয় প্রশ্নব্যাংক',
      sourcePortalUrl: 'https://nctb.gov.bd',
      scope: 'all'
    })}
    <div id="contentBox-mcq"></div>
  </section>

  <!-- ৯. সিলেবাস হাব -->
  <section id="tab-syllabus" class="tab-pane hidden">
    ${renderContentWorkflowBar({
      moduleKey: 'syllabus',
      title: 'পাঠ্যক্রম ও সিলেবাস হাব',
      sourceKey: 'nu_portal',
      sourcePortalName: 'NCTB ও জাতীয় বিশ্ববিদ্যালয় (NU)',
      sourcePortalUrl: 'https://nu.ac.bd',
      scope: 'syllabus'
    })}
    <div id="contentBox-syllabus"></div>
  </section>

  <!-- ১০. বোর্ড প্রশ্নপত্র -->
  <section id="tab-qpapers" class="tab-pane hidden">
    ${renderContentWorkflowBar({
      moduleKey: 'qpapers',
      title: 'বোর্ড প্রশ্নপত্র ও মডেল টেস্ট (২০১৭-২৪)',
      sourceKey: 'nctb_curriculum',
      sourcePortalName: 'জাতীয় বোর্ড প্রশ্ন সংরক্ষণাগার',
      sourcePortalUrl: 'https://nctb.gov.bd',
      scope: 'qpapers'
    })}
    <div id="contentBox-qpapers"></div>
  </section>

  <!-- ১১. সাজেশন হাব -->
  <section id="tab-suggestions" class="tab-pane hidden">
    ${renderContentWorkflowBar({
      moduleKey: 'suggestions',
      title: 'সাজেশন ও মডেল টেস্ট পেপার',
      sourceKey: 'nctb_curriculum',
      sourcePortalName: 'এডুসব এক্সপার্ট প্যানেল',
      sourcePortalUrl: 'https://nctb.gov.bd',
      scope: 'all'
    })}
    <div id="contentBox-suggestions"></div>
  </section>

  <!-- ১২. স্কলারশিপ ও অনুদান -->
  <section id="tab-scholarships" class="tab-pane hidden">
    ${renderContentWorkflowBar({
      moduleKey: 'scholarships',
      title: 'স্কলারশিপ ও উপবৃত্তি রোডম্যাপ',
      sourceKey: 'shed_scholarships',
      sourcePortalName: 'শিক্ষা মন্ত্রণালয় (SHED) ও PMEAT',
      sourcePortalUrl: 'https://shed.gov.bd',
      scope: 'scholarships'
    })}
    <div id="contentBox-scholarships"></div>
  </section>

  <!-- ১৩. শিক্ষক ও মেন্টর কন্ট্রোল -->
  ${renderMentorControlTab()}

  <!-- ১৪. অ্যাসিস্টেড আবেদন কিউ -->
  ${renderAssistedQueueTab()}

  <!-- ১৫. সাবস্ক্রিপশন ও প্ল্যান -->
  <section id="tab-subs" class="tab-pane hidden">
    <div class="grid lg:grid-cols-2 gap-5">
      <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <h2 class="font-extrabold text-slate-800 text-sm flex items-center gap-2">
          <i class="fas fa-crown text-amber-500"></i> সাবস্ক্রিপশন প্ল্যান সম্পাদনা
        </h2>
        <div id="planEditor" class="space-y-4"></div>
      </div>
      <div class="space-y-5">
        <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <h2 class="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <i class="fas fa-gift text-emerald-600"></i> সরাসরি প্ল্যান প্রদান (ম্যানুয়াল গ্রান্ট)
          </h2>
          <form id="grantForm" class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label class="block text-slate-600 sm:col-span-2 font-semibold">
              ইউজার আইডি / ফোন নম্বর *
              <input name="user_id" id="grantUserIdInput" type="text" placeholder="যেমন: 1, 2 বা 018..." required class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500">
            </label>
            <label class="block text-slate-600 font-semibold">
              প্ল্যান
              <select name="plan" class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs bg-white">
                <option value="premium">👑 প্রিমিয়াম</option>
                <option value="standard">⚡ স্ট্যান্ডার্ড</option>
              </select>
            </label>
            <label class="block text-slate-600 font-semibold">
              মেয়াদ (দিন)
              <input name="days" type="number" value="30" min="1" class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs">
            </label>
            <button class="sm:col-span-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl transition shadow">
              সরাসরি প্ল্যান দিন
            </button>
          </form>
          <p class="text-[11px] text-slate-400">💡 টিপ: ইউজার তালিকা থেকে যেকোনো ইউজারের নামের পাশে <b>👑 প্ল্যান</b> বাটনে ক্লিক করলে স্বয়ংক্রিয়ভাবে এখানে আইডি বসে যাবে।</p>
        </div>
        <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-3">
          <h2 class="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <i class="fas fa-list text-sky-600"></i> সক্রিয় সাবস্ক্রাইবার তালিকা
          </h2>
          <div id="subsList" class="divide-y divide-slate-100 text-xs max-h-80 overflow-y-auto"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- ১৬. পুশ নোটিস ও ঘোষণা -->
  <section id="tab-announce" class="tab-pane hidden space-y-4">
    <div id="contentBox-announce"></div>
  </section>

  <!-- ১৭. ফিচার টগল -->
  <section id="tab-features" class="tab-pane hidden">
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 max-w-2xl space-y-3">
      <h2 class="font-extrabold text-slate-800 text-sm flex items-center gap-2"><i class="fas fa-toggle-on text-emerald-600"></i> প্ল্যাটফর্ম ফিচার অন/অফ</h2>
      <p class="text-xs text-slate-400">বন্ধ করলে সংশ্লিষ্ট মডিউল সাধারণ শিক্ষার্থীদের কাছে লুকানো থাকবে</p>
      <div id="featureList" class="divide-y divide-slate-100 text-xs"></div>
    </div>
  </section>

  <!-- ১৮. রেট ও হেল্পলাইন সেটিংস -->
  <section id="tab-rates" class="tab-pane hidden">
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 max-w-5xl space-y-6">
      
      <!-- হেডার ও পরিচিতি -->
      <div class="pb-4 border-b border-slate-200">
        <div class="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <span class="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">সেন্ট্রাল কন্ট্রোল আর্কিটেকচার</span>
            <h2 class="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
              <i class="fas fa-sliders text-emerald-600"></i> এডমিন মাস্টার কন্ট্রোল, ভিজিবিলিটি ও প্ল্যাটফর্ম সেটিংস
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">মডিউল অন/অফ, পাবলিক ড্যাশবোর্ড কার্ড ফিল্টারিং, সোশ্যাল চ্যানেল লিংক ও পেমেন্ট রেট নিয়ন্ত্রণ করুন।</p>
          </div>
          <button type="button" onclick="document.getElementById('ratesFormSubmitBtn').click()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-2 rounded-xl text-xs transition shadow flex items-center gap-1.5">
            <i class="fas fa-check"></i> সেটিংস সংরক্ষণ করুন
          </button>
        </div>
      </div>

      <form id="ratesForm" class="space-y-6 text-xs text-slate-700">

        <!-- ১. কোর প্ল্যাটফর্ম ফিচার ও সার্ভিসেস সুইচবোর্ড -->
        <div class="p-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <i class="fas fa-power-off text-amber-500"></i> ১. কোর মডিউল অন/অফ (Master Feature Toggles)
            </h3>
            <span class="text-[10px] text-slate-500">তাত্ক্ষণিক সাইট-জুড়ে কার্যকর</span>
          </div>
          <p class="text-[11px] text-slate-500">কোনো মডিউল অফ করলে পাবলিক ন্যাভবার, ড্যাশবোর্ড, ফ্লোটিং বাটন ও সংশ্লিষ্ট পেজ থেকে তা স্বয়ংক্রিয়ভাবে বন্ধ হয়ে যাবে।</p>

          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <label class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-emerald-300 transition">
              <div>
                <p class="font-bold text-slate-900 text-xs">🛍️ এডুসব শপ</p>
                <p class="text-[10px] text-slate-500">বই, গ্যাজেট ও কার্ট</p>
              </div>
              <input type="checkbox" name="shop_enabled" class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer">
            </label>

            <label class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-emerald-300 transition">
              <div>
                <p class="font-bold text-slate-900 text-xs">👨‍🏫 শিক্ষক সহায়তা</p>
                <p class="text-[10px] text-slate-500">মেন্টর ডাউট সলভ</p>
              </div>
              <input type="checkbox" name="teacher_support_enabled" class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer">
            </label>

            <label class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-emerald-300 transition">
              <div>
                <p class="font-bold text-slate-900 text-xs">🤝 আবেদন সেবা</p>
                <p class="text-[10px] text-slate-500">অ্যাসিস্টেড অ্যাডমিশন/জব</p>
              </div>
              <input type="checkbox" name="assisted_service_enabled" class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer">
            </label>

            <label class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-emerald-300 transition">
              <div>
                <p class="font-bold text-slate-900 text-xs">💳 ওয়ালেট রিচার্জ</p>
                <p class="text-[10px] text-slate-500">অ্যাড মানি ও ব্যালেন্স</p>
              </div>
              <input type="checkbox" name="wallet_recharge_enabled" class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer">
            </label>

            <label class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-emerald-300 transition">
              <div>
                <p class="font-bold text-slate-900 text-xs">⚡ বিকাশ অটো পেমেন্ট</p>
                <p class="text-[10px] text-slate-500">টোকেনাইজড চেকআউট টপ-আপ</p>
              </div>
              <input type="checkbox" name="bkash_auto_enabled" class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer">
            </label>
          </div>
        </div>

        <!-- ২. সোশ্যাল মিডিয়া ও কমিউনিটি হাব অন/অফ এবং লিংক কনফিগারেশন -->
        <div class="p-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <i class="fas fa-users-rays text-teal-600"></i> ২. সোশ্যাল মিডিয়া ও অফিসিয়াল কমিউনিটি চ্যানেল
            </h3>
            <label class="inline-flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              <input type="checkbox" name="card_social_hub" class="w-3.5 h-3.5 rounded text-teal-600">
              <span>মাস্টার সোশ্যাল স্ট্রিপ সক্রিয়</span>
            </label>
          </div>
          <p class="text-[11px] text-slate-500">প্রতিটি চ্যানেলের অন/অফ সুইচ এবং সংশ্লিষ্ট গ্রুপ/চ্যানেল লিঙ্ক নির্ধারণ করুন। সুইচ অফ থাকলে ড্যাশবোর্ড ও ল্যান্ডিং থেকে সেই বাটনটি লুকানো থাকবে।</p>

          <div class="grid sm:grid-cols-2 gap-3.5 pt-1">
            <!-- WhatsApp -->
            <div class="bg-white p-3 border border-slate-200 rounded-xl space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-emerald-700 flex items-center gap-1.5"><i class="fab fa-whatsapp text-emerald-500"></i> হোয়াটসঅ্যাপ গ্রুপ</span>
                <label class="inline-flex items-center gap-1 cursor-pointer text-[10px] font-semibold text-slate-600">
                  <input type="checkbox" name="card_community_wa" class="w-3.5 h-3.5 rounded text-emerald-600"> অন
                </label>
              </div>
              <input name="whatsapp_group" placeholder="https://chat.whatsapp.com/..." class="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs">
            </div>

            <!-- Facebook -->
            <div class="bg-white p-3 border border-slate-200 rounded-xl space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-blue-700 flex items-center gap-1.5"><i class="fab fa-facebook-f text-blue-500"></i> ফেসবুক গ্রুপ / পেজ</span>
                <label class="inline-flex items-center gap-1 cursor-pointer text-[10px] font-semibold text-slate-600">
                  <input type="checkbox" name="card_community_fb" class="w-3.5 h-3.5 rounded text-blue-600"> অন
                </label>
              </div>
              <input name="facebook_url" placeholder="https://facebook.com/groups/..." class="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs">
            </div>

            <!-- Telegram -->
            <div class="bg-white p-3 border border-slate-200 rounded-xl space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-sky-700 flex items-center gap-1.5"><i class="fab fa-telegram text-sky-500"></i> টেলিগ্রাম চ্যানেল</span>
                <label class="inline-flex items-center gap-1 cursor-pointer text-[10px] font-semibold text-slate-600">
                  <input type="checkbox" name="card_community_tg" class="w-3.5 h-3.5 rounded text-sky-600"> অন
                </label>
              </div>
              <input name="telegram_url" placeholder="https://t.me/..." class="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs">
            </div>

            <!-- YouTube -->
            <div class="bg-white p-3 border border-slate-200 rounded-xl space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-red-700 flex items-center gap-1.5"><i class="fab fa-youtube text-red-500"></i> ইউটিউব চ্যানেল</span>
                <label class="inline-flex items-center gap-1 cursor-pointer text-[10px] font-semibold text-slate-600">
                  <input type="checkbox" name="card_community_yt" class="w-3.5 h-3.5 rounded text-red-600"> অন
                </label>
              </div>
              <input name="youtube_url" placeholder="https://youtube.com/@..." class="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs">
            </div>
          </div>

          <!-- হেল্পলাইন ও কন্টাক্ট নম্বর -->
          <div class="bg-white p-3 border border-slate-200 rounded-xl space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-amber-800 flex items-center gap-1.5"><i class="fas fa-headset text-amber-600"></i> সরাসরি হেল্পলাইন ও সাপোর্ট সাপোর্ট বক্স</span>
              <label class="inline-flex items-center gap-1 cursor-pointer text-[10px] font-semibold text-slate-600">
                <input type="checkbox" name="card_community_help" class="w-3.5 h-3.5 rounded text-amber-600"> অন
              </label>
            </div>
            <div class="grid sm:grid-cols-3 gap-2.5">
              <label class="block font-semibold text-[11px]">হেল্পলাইন ফোন নম্বর
                <input name="support_phone" placeholder="01835414122" class="w-full mt-0.5 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs">
              </label>
              <label class="block font-semibold text-[11px]">হোয়াটসঅ্যাপ হেল্প নম্বর
                <input name="whatsapp_number" placeholder="01835414122" class="w-full mt-0.5 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs">
              </label>
              <label class="block font-semibold text-[11px]">সাপোর্ট ইমেইল
                <input name="support_email" placeholder="support@edusob.com" class="w-full mt-0.5 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs">
              </label>
            </div>
          </div>
        </div>

        <!-- ৩. ইউজার ড্যাশবোর্ড কার্ড ভিজিবিলিটি কন্ট্রোল -->
        <div class="p-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <i class="fas fa-table-columns text-indigo-600"></i> ৩. ইউজার ড্যাশবোর্ড কার্ড ভিজিবিলিটি ম্যাট্রিক্স
            </h3>
            <span class="text-[10px] text-slate-500">কোন কোন কার্ড স্টুডেন্টরা দেখতে পাবে</span>
          </div>
          <p class="text-[11px] text-slate-500">ড্যাশবোর্ডকে ক্লিন ও ফোকাসড রাখতে এডমিন যেকোনো কার্ড তাৎক্ষণিকভাবে হাইড করতে পারবেন।</p>

          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            <label class="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-indigo-300 transition">
              <span class="font-semibold text-slate-800 text-xs">📢 জরুরি নোটিস ও মারকুই</span>
              <input type="checkbox" name="card_announce" class="w-4 h-4 rounded text-indigo-600">
            </label>

            <label class="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-indigo-300 transition">
              <span class="font-semibold text-slate-800 text-xs">🎯 দৈনিক স্টাডি মিশন চেকলিস্ট</span>
              <input type="checkbox" name="card_study_goals" class="w-4 h-4 rounded text-indigo-600">
            </label>

            <label class="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-indigo-300 transition">
              <span class="font-semibold text-slate-800 text-xs">📋 ১-ক্লিক ফরম ক্লিপবোর্ড</span>
              <input type="checkbox" name="card_quick_copy" class="w-4 h-4 rounded text-indigo-600">
            </label>

            <label class="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-indigo-300 transition">
              <span class="font-semibold text-slate-800 text-xs">🕌 নামাজের সময়সূচি ও বাণী</span>
              <input type="checkbox" name="card_religion" class="w-4 h-4 rounded text-indigo-600">
            </label>

            <label class="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-indigo-300 transition">
              <span class="font-semibold text-slate-800 text-xs">⚡ দ্রুত কমান্ড ও সার্ভিসেস</span>
              <input type="checkbox" name="card_quick_actions" class="w-4 h-4 rounded text-indigo-600">
            </label>

            <label class="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-indigo-300 transition">
              <span class="font-semibold text-slate-800 text-xs">🔖 সেভড রোল ও মার্কশিট প্যানেল</span>
              <input type="checkbox" name="card_saved_rolls" class="w-4 h-4 rounded text-indigo-600">
            </label>

            <label class="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-indigo-300 transition">
              <span class="font-semibold text-slate-800 text-xs">📰 শিক্ষা সংবাদ লাইভ ফিড</span>
              <input type="checkbox" name="card_news" class="w-4 h-4 rounded text-indigo-600">
            </label>

            <label class="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-indigo-300 transition">
              <span class="font-semibold text-slate-800 text-xs">💼 চাকরির সার্কুলার ফিড</span>
              <input type="checkbox" name="card_jobs" class="w-4 h-4 rounded text-indigo-600">
            </label>

            <label class="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-indigo-300 transition">
              <span class="font-semibold text-slate-800 text-xs">🎁 রেফারেল প্রোগ্রাম ও বোনাস</span>
              <input type="checkbox" name="card_referral" class="w-4 h-4 rounded text-indigo-600">
            </label>
          </div>

          <!-- নোটিস মারকুই বার্তা -->
          <div class="pt-2">
            <label class="block font-semibold text-slate-700">জরুরি নোটিস বার বার্তা (Marquee Announcement)
              <input name="notice_marquee" placeholder="সাইটের শীর্ষে যে ঘোষণা চলবে..." class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs">
            </label>
          </div>
        </div>

        <!-- ৪. পেমেন্ট নম্বর ও রেট সেটিংস -->
        <div class="p-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <i class="fas fa-bangladeshi-taka-sign text-emerald-600"></i> ৪. পেমেন্ট নম্বর, ডেলিভারি ও বোনাস রেট
            </h3>
            <span class="text-[10px] text-slate-500">আর্থিক কনফিগারেশন</span>
          </div>

          <div class="grid sm:grid-cols-3 gap-3">
            <label class="block font-semibold">বিকাশ (bKash) নম্বর
              <input name="bkash_number" placeholder="01835414122" class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs">
            </label>
            <label class="block font-semibold">নগদ (Nagad) নম্বর
              <input name="nagad_number" placeholder="01835414122" class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs">
            </label>
            <label class="block font-semibold">রকেট (Rocket) নম্বর
              <input name="rocket_number" placeholder="01835414122" class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs">
            </label>
          </div>

          <div class="grid sm:grid-cols-3 gap-3 pt-1">
            <label class="block font-semibold">ক্যাশ অন ডেলিভারি (COD) চার্জ (টাকা)
              <input type="number" name="cod_charge" placeholder="50" class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs">
            </label>
            <label class="block font-semibold">নতুন ইউজার সাইন-আপ বোনাস (টাকা)
              <input type="number" name="signup_bonus" placeholder="0" class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs">
            </label>
            <label class="block font-semibold">সফল রেফারেল বোনাস (টাকা)
              <input type="number" name="referral_bonus" placeholder="0" class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs">
            </label>
          </div>
        </div>

        <!-- ৫. সিস্টেম কন্ট্রোল আর্কিটেকচার ম্যাট্রিক্স (Structural Responsibilities) -->
        <div class="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-extrabold text-emerald-900 text-xs sm:text-sm flex items-center gap-2">
              <i class="fas fa-sitemap text-emerald-600"></i> ৫. EduSob কন্ট্রোল দায়িত্ব বণ্টন ম্যাট্রিক্স (Responsibility Matrix)
            </h3>
            <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">সিস্টেম ব্লুপ্রিন্ট</span>
          </div>
          <div class="grid md:grid-cols-3 gap-3 text-[11px] text-slate-700">
            <div class="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
              <p class="font-bold text-emerald-800 flex items-center gap-1.5"><i class="fas fa-user-shield text-emerald-600"></i> এডমিন কন্ট্রোল (Manual Policy)</p>
              <ul class="list-disc list-inside text-[10px] space-y-0.5 text-slate-600">
                <li>শপ ও শিক্ষক মডিউল অন/অফ</li>
                <li>সোশ্যাল লিংক ও কার্ড ভিজিবিলিটি</li>
                <li>bKash/Nagad পেমেন্ট অনুমোদন</li>
                <li>নতুন মেন্টর/টিচার নিয়োগ ও স্ট্যাটাস</li>
                <li>ক্যাশ অন ডেলিভারি ও বোনাস রেট</li>
              </ul>
            </div>
            <div class="p-3 bg-white rounded-xl border border-sky-100 space-y-1">
              <p class="font-bold text-sky-800 flex items-center gap-1.5"><i class="fas fa-robot text-sky-600"></i> অটো সিস্টেম ইঞ্জিন (Cron & Workers)</p>
              <ul class="list-disc list-inside text-[10px] space-y-0.5 text-slate-600">
                <li>NCTB, BPSC, বোর্ড প্রশ্ন স্বয়ংক্রিয় সিঙ্ক</li>
                <li>লাইভ এক্সটার্নাল লিংক স্ট্যাটাস ট্র্যাকিং</li>
                <li>ডুপ্লিকেট নোটিস/স্কলারশিপ ফিল্টার</li>
                <li>ইউজার স্টাডি স্ট্রিক ও পয়েন্ট গণনা</li>
                <li>সিঙ্ক ফেইল হলে ক্যাশ ফলব্যাক পরিবেশন</li>
              </ul>
            </div>
            <div class="p-3 bg-white rounded-xl border border-amber-100 space-y-1">
              <p class="font-bold text-amber-800 flex items-center gap-1.5"><i class="fas fa-user-graduate text-amber-600"></i> ইউজার ও মেন্টর (Self-Service)</p>
              <ul class="list-disc list-inside text-[10px] space-y-0.5 text-slate-600">
                <li>স্টুডেন্ট নিজের রোল ও তথ্য সংরক্ষণ</li>
                <li>দৈনিক মিশন সম্পন্ন টিক দেওয়া</li>
                <li>পণ্য অর্ডার, কার্ট ও ওয়ালেট ব্যবহার</li>
                <li>মেন্টর অনলাইন/অফলাইন উপস্থিতি টগল</li>
                <li>শিক্ষার্থীর প্রশ্নের লাইভ সমাধান প্রদান</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span class="text-[11px] text-slate-500">যেকোনো পরিবর্তন সাথে সাথে পাবলিক সাইট ও ড্যাশবোর্ডে প্রযোজ্য হবে।</span>
          <button id="ratesFormSubmitBtn" type="submit" class="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs transition shadow flex items-center gap-1.5">
            <i class="fas fa-check"></i> সেটিংস সংরক্ষণ করুন
          </button>
        </div>
      </form>
    </div>
  </section>
</main>

<!-- সিকিউরিটি ও ভেরিফিকেশন মোডালস -->
${renderSecurityModals()}

<!-- শিক্ষক ফর্ম মোডাল -->
<div id="admTeacherModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden items-center justify-center p-4">
  <div class="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
    <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
      <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
        <i class="fas fa-chalkboard-user text-amber-500"></i> <span id="tf_modal_title">নতুন শিক্ষক যোগ করুন</span>
      </h3>
      <button onclick="closeTeacherModal()" class="text-slate-400 hover:text-slate-700 text-lg font-bold">✕</button>
    </div>
    <form id="teacherForm" onsubmit="return saveTeacherForm(event)" class="space-y-3 text-xs text-slate-700">
      <input type="hidden" name="teacher_id" id="tf_id">
      <div class="grid sm:grid-cols-2 gap-3">
        <label class="block font-semibold">শিক্ষকের নাম *
          <input name="name" id="tf_name" required placeholder="যেমন: ড. রফিকুল ইসলাম" class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs">
        </label>
        <label class="block font-semibold">পদবি ও শিক্ষাগত যোগ্যতা *
          <input name="designation" id="tf_designation" required placeholder="সহকারী অধ্যাপক / ৩৮তম বিসিএস ক্যাডার" class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs">
        </label>
      </div>
      <div class="grid sm:grid-cols-2 gap-3">
        <label class="block font-semibold">বিশেষায়িত বিষয় *
          <input name="subject" id="tf_subject" required placeholder="উচ্চতর গণিত ও পদার্থবিজ্ঞান" class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs">
        </label>
        <label class="block font-semibold">শিক্ষা স্তর
          <select name="education_level" id="tf_level" class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs bg-white">
            <option value="all">সকল স্তর</option>
            <option value="ssc">এসএসসি (SSC)</option>
            <option value="hsc">এইচএসসি (HSC)</option>
            <option value="nu">জাতীয় বিশ্ববিদ্যালয়</option>
            <option value="job">বিসিএস ও সরকারি চাকরি</option>
          </select>
        </label>
      </div>
      <div class="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
        <label class="font-bold text-amber-900 flex items-center gap-1.5"><i class="fas fa-key text-amber-600"></i>শিক্ষক লগইন আইডি (ফোন) ও পাসওয়ার্ড</label>
        <div class="grid sm:grid-cols-2 gap-2.5">
          <input name="phone" id="tf_phone" placeholder="01XXXXXXXXX" class="w-full border border-slate-300 rounded-xl px-3 py-1.5 text-xs bg-white">
          <input name="password" id="tf_password" type="password" placeholder="পাসওয়ার্ড" class="w-full border border-slate-300 rounded-xl px-3 py-1.5 text-xs bg-white">
        </div>
      </div>
      <div class="flex items-center gap-4 py-1">
        <label class="inline-flex items-center gap-1.5 cursor-pointer font-semibold">
          <input type="checkbox" name="is_online" id="tf_online" checked class="w-4 h-4 rounded text-emerald-600"> 🟢 সরাসরি অনলাইন আছেন
        </label>
        <label class="inline-flex items-center gap-1.5 cursor-pointer font-semibold">
          <input type="checkbox" name="is_active" id="tf_active" checked class="w-4 h-4 rounded text-emerald-600"> ✓ সক্রিয় প্রোফাইল
        </label>
      </div>
      <div class="flex gap-2 pt-2 border-t border-slate-100">
        <button type="button" onclick="closeTeacherModal()" class="flex-1 bg-slate-100 hover:bg-slate-200 font-bold py-2 rounded-xl transition text-slate-700">বাতিল</button>
        <button type="submit" class="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-2 rounded-xl transition shadow">সংরক্ষণ করুন</button>
      </div>
    </form>
  </div>
</div>

<!-- দ্বিমুখী মেসেজ ও লাইভ চ্যাট মোডাল -->
<div id="admChatModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden items-center justify-center p-4">
  <div class="bg-white rounded-3xl max-w-2xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
    <div class="p-4 bg-slate-900 text-white flex items-center justify-between">
      <div>
        <h3 id="chatModalTitle" class="font-bold text-sm">শিক্ষার্থীর সাথে লাইভ সমাধান চ্যাট</h3>
        <p id="chatModalSub" class="text-[11px] text-slate-300">টিকেট #...</p>
      </div>
      <button onclick="closeTicketChat()" class="text-slate-400 hover:text-white text-lg font-bold">✕</button>
    </div>
    <div id="chatMessagesBox" class="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs"></div>
    <form onsubmit="return sendTicketChatMsg(event)" class="p-3 bg-white border-t border-slate-200 flex gap-2 items-center">
      <input type="hidden" id="chatActiveTicketId">
      <input type="text" id="chatInputText" required placeholder="শিক্ষার্থীকে সমাধান মেসেজ লিখুন..." class="flex-1 border border-slate-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-amber-500">
      <button type="submit" class="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition shadow flex items-center gap-1">
        <i class="fas fa-paper-plane"></i> পাঠান
      </button>
    </form>
  </div>
</div>
`

// স্ক্রিপ্ট অংশ
const ADMIN_SCRIPT = `
<script>
var ACTIVE_CATEGORY = 'cat-command';
var ACTIVE_TAB = 'overview';
var CATEGORIES_DATA = ${JSON.stringify(ADMIN_CATEGORIES)};

// টোস্ট
function toastMsg(msg){
  var el = document.createElement('div');
  el.className = 'fixed bottom-5 right-5 z-50 bg-slate-900 text-white border border-emerald-400/40 text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl transition transform translate-y-2 opacity-0 flex items-center gap-2';
  el.innerHTML = '<span class="text-emerald-400">✓</span> ' + msg;
  document.body.appendChild(el);
  requestAnimationFrame(function(){ el.classList.remove('translate-y-2','opacity-0'); });
  setTimeout(function(){ el.classList.add('translate-y-2','opacity-0'); setTimeout(function(){ el.remove(); }, 300); }, 3000);
}

function toBn(num){
  var bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  return String(num == null ? 0 : num).replace(/[0-9]/g, function(w){ return bn[+w]; });
}

function tk(amt){ return toBn(amt || 0) + ' ৳'; }
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

async function api(method, url, data){
  try {
    var res = await axios({ method: method, url: url, data: data });
    return res.data;
  } catch(e) {
    var msg = (e.response && e.response.data && e.response.data.error) || e.message || 'নেটওয়ার্ক ত্রুটি';
    toastMsg('ত্রুটি: ' + msg);
    return null;
  }
}

// ============================================================
// ১. ক্যাটাগরি ও মডিউল ন্যাভিগেশন কন্ট্রোল
// ============================================================
function switchAdminCategory(catId, targetTabId){
  ACTIVE_CATEGORY = catId;
  document.querySelectorAll('.admin-cat-btn').forEach(function(b){
    b.className = 'admin-cat-btn px-3.5 py-2 rounded-t-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50';
  });
  var activeBtn = document.getElementById('btn-' + catId);
  if(activeBtn) {
    activeBtn.className = 'admin-cat-btn px-3.5 py-2 rounded-t-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 bg-slate-800 text-emerald-400 border-t-2 border-emerald-400';
  }

  var cat = CATEGORIES_DATA.find(function(c){ return c.id === catId; }) || CATEGORIES_DATA[0];
  var chipsBox = document.getElementById('adminModuleChips');
  if(chipsBox && cat){
    chipsBox.innerHTML = cat.tabs.map(function(t){
      return '<button onclick="switchAdminTab(\\''+t.id+'\\')" id="chip-'+t.id+'" class="admin-chip px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 text-slate-300 hover:bg-slate-800">'+
        '<i class="fas '+t.icon+' text-[11px]"></i><span>'+t.label+'</span>'+
        (t.badge ? ' <span class="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">'+t.badge+'</span>' : '')+
      '</button>';
    }).join('');
  }

  var tabToOpen = targetTabId || (cat && cat.tabs[0] && cat.tabs[0].id) || 'overview';
  switchAdminTab(tabToOpen);
}

function switchAdminTab(tabId){
  ACTIVE_TAB = tabId;
  document.querySelectorAll('.tab-pane').forEach(function(p){ p.classList.add('hidden'); });
  var activePane = document.getElementById('tab-' + tabId);
  if(activePane) activePane.classList.remove('hidden');

  document.querySelectorAll('.admin-chip').forEach(function(c){
    c.className = 'admin-chip px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 text-slate-300 hover:bg-slate-800';
  });
  var activeChip = document.getElementById('chip-' + tabId);
  if(activeChip){
    activeChip.className = 'admin-chip px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition flex items-center gap-1.5 bg-emerald-500 text-slate-950 shadow-md';
  }

  // ট্যাব অনুযায়ী স্পেসিফিক লোডার কল
  if(tabId === 'overview') loadStats();
  else if(tabId === 'autocollect') { loadSyncSources(); loadSyncLogs(); }
  else if(tabId === 'auditlogs') loadAuditLogs();
  else if(tabId === 'users') loadUsers();
  else if(tabId === 'teacher') loadMentorOverview();
  else if(tabId === 'assisted') loadAssistedApps('');
  else if(tabId === 'subs') loadSubsTab();
  else if(tabId === 'features') loadFeatures();
  else if(tabId === 'rates') loadRates();
  else if(CRUD[tabId]) renderCrud(tabId);
}

function navigateToTab(tabId){
  for(var i=0; i<CATEGORIES_DATA.length; i++){
    var found = CATEGORIES_DATA[i].tabs.some(function(t){ return t.id === tabId; });
    if(found){
      switchAdminCategory(CATEGORIES_DATA[i].id, tabId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
  }
  switchAdminTab(tabId);
}

function filterAdminModules(q){
  var query = (q || '').trim().toLowerCase();
  var box = document.getElementById('quickSearchResults');
  if(!box) return;
  if(!query){ box.classList.add('hidden'); return; }

  var matched = [];
  CATEGORIES_DATA.forEach(function(cat){
    cat.tabs.forEach(function(tab){
      if(tab.label.toLowerCase().includes(query) || tab.id.toLowerCase().includes(query)){
        matched.push({ catId: cat.id, tabId: tab.id, label: tab.label, catLabel: cat.label });
      }
    });
  });

  if(!matched.length){
    box.innerHTML = '<p class="text-slate-400 p-2 text-center">কোনো মডিউল মেলেনি</p>';
  } else {
    box.innerHTML = matched.slice(0, 6).map(function(m){
      return '<button onclick="navigateToTab(\\''+m.tabId+'\\'); document.getElementById(\\'quickSearchResults\\').classList.add(\\'hidden\\');" class="w-full text-left p-2 rounded-lg hover:bg-slate-800 transition flex items-center justify-between text-slate-200">'+
        '<span class="font-bold">'+m.label+'</span><span class="text-[10px] text-slate-400 font-normal">'+m.catLabel+'</span>'+
      '</button>';
    }).join('');
  }
  box.classList.remove('hidden');
}

// ============================================================
// ২. কমান্ড সেন্টার ওভারভিউ ও স্ট্যাটস
// ============================================================
async function loadStats(){
  var d = await api('get', '/api/admin/stats');
  if(!d || !d.stats) return;

  var s = d.stats;
  // মেট্রিক্স গ্রিড
  if(s.users){
    document.getElementById('cmdMetricUsers').textContent = toBn(s.users.total);
    document.getElementById('cmdSubActiveUsers').textContent = toBn(s.users.active);
    document.getElementById('cmdSubSuspendedUsers').textContent = toBn(s.users.suspended);
  }
  if(s.content){
    document.getElementById('cmdMetricJobs').textContent = toBn(s.content.jobs);
    document.getElementById('cmdMetricAdmissions').textContent = toBn(s.content.admissions);
    document.getElementById('cmdMetricMCQ').textContent = toBn(s.content.mcq);
    document.getElementById('cmdMetricSyllabus').textContent = toBn(s.content.syllabus);
    document.getElementById('cmdMetricQpapers').textContent = toBn(s.content.qpapers);
    document.getElementById('cmdMetricScholarships').textContent = toBn(s.content.scholarships);
  }
  if(s.mentors){
    document.getElementById('cmdMetricMentors').textContent = toBn(s.mentors.total);
    document.getElementById('cmdSubOnlineMentors').textContent = toBn(s.mentors.online);
    document.getElementById('cmdSubSolvedTickets').textContent = toBn(s.mentors.solved_tickets);
  }

  // অ্যালার্টস
  if(s.pending_action){
    document.getElementById('metricTotalAlerts').textContent = toBn(s.pending_action.total_alerts) + 'টি অ্যালার্ট';
    document.getElementById('alertPendingAssist').textContent = toBn(s.pending_action.assisted);
    document.getElementById('alertPendingTickets').textContent = toBn(s.pending_action.tickets);
    document.getElementById('alertPendingPayments').textContent = toBn(s.pending_action.payments);
  }

  // সাম্প্রতিক ইউজার তালিকা
  var ruBox = document.getElementById('recentUsers');
  if(ruBox && d.recent_users){
    ruBox.innerHTML = d.recent_users.map(function(u){
      var roleBadge = u.role === 'admin' ? '<span class="bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded text-[10px]">👑 এডমিন</span>' : (u.role === 'teacher' ? '<span class="bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded text-[10px]">👨‍🏫 শিক্ষক</span>' : '<span class="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">ইউজার</span>');
      return '<div class="py-2.5 flex items-center justify-between gap-2">'+
        '<div><p class="font-bold text-slate-900">'+esc(u.name_bn||'শিক্ষার্থী')+'</p><p class="text-slate-400 text-[10px]">'+esc(u.phone)+' • '+esc(u.user_code)+'</p></div>'+
        '<div class="flex items-center gap-1.5">'+roleBadge+
          '<button onclick="openRoleModalById('+u.id+', \\''+esc(u.name_bn||'')+'\\', \\''+esc(u.phone)+'\\', \\''+u.role+'\\')" class="text-[10px] px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700">রোল</button>'+
        '</div>'+
      '</div>';
    }).join('') || '<p class="text-slate-400 py-3">কোনো ইউজার নেই</p>';
  }

  // টাইমলাইন ফিড
  var tlBox = document.getElementById('recentActivityTimeline');
  if(tlBox){
    var items = [];
    (d.recent_sync_logs || []).forEach(function(l){
      items.push({
        time: l.created_at || 'কিছুক্ষণ আগে',
        icon: 'fa-bolt',
        color: 'text-amber-500 bg-amber-50',
        text: '<b>' + esc(l.source_name) + '</b> অটো-সিঙ্ক সম্পন্ন (' + toBn(l.new_count||0) + 'টি নতুন যুক্ত)'
      });
    });
    (d.recent_audit_logs || []).forEach(function(a){
      items.push({
        time: a.created_at || 'কিছুক্ষণ আগে',
        icon: 'fa-shield',
        color: 'text-emerald-600 bg-emerald-50',
        text: '<b>' + esc(a.admin_name||'এডমিন') + '</b>: ' + esc(a.details||a.action)
      });
    });

    if(!items.length){
      tlBox.innerHTML = '<p class="text-slate-400 py-4 text-center">কোনো সাম্প্রতিক অ্যাক্টিভিটি নেই</p>';
    } else {
      tlBox.innerHTML = items.slice(0, 8).map(function(it){
        return '<div class="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition">'+
          '<div class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs '+it.color+'"><i class="fas '+it.icon+'"></i></div>'+
          '<div class="flex-1 min-w-0 text-[11px]"><p class="text-slate-700 leading-snug">'+it.text+'</p><p class="text-slate-400 text-[9px] mt-0.5">'+it.time+'</p></div>'+
        '</div>';
      }).join('');
    }
  }
}

// ============================================================
// ৩. ইউজার ম্যানেজমেন্ট ও সিকিউরিটি রোল কন্ট্রোল
// ============================================================
var USERS_CACHE = [];
var userSearchTimer = null;
function debounceUserSearch(){
  clearTimeout(userSearchTimer);
  userSearchTimer = setTimeout(loadUsers, 300);
}

async function loadUsers(){
  var q = document.getElementById('userSearch') ? document.getElementById('userSearch').value : '';
  var role = document.getElementById('userRoleFilter') ? document.getElementById('userRoleFilter').value : '';
  var status = document.getElementById('userStatusFilter') ? document.getElementById('userStatusFilter').value : '';

  var url = '/api/admin/users?q=' + encodeURIComponent(q) + '&role=' + encodeURIComponent(role) + '&status=' + encodeURIComponent(status);
  var d = await api('get', url);
  if(!d) return;

  USERS_CACHE = d.users || [];
  var tbody = document.getElementById('userRows');
  if(!tbody) return;

  if(!USERS_CACHE.length){
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-slate-400">কোনো ইউজার পাওয়া যায়নি</td></tr>';
    return;
  }

  tbody.innerHTML = USERS_CACHE.map(function(u){
    var isSuperAdmin = u.phone === '01835414122' || u.id === 1;
    var roleBadge = u.role === 'admin' ? '<span class="bg-rose-100 text-rose-800 font-extrabold px-2 py-0.5 rounded-full text-[10px]">👑 এডমিন</span>' : (u.role === 'teacher' ? '<span class="bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full text-[10px]">👨‍🏫 শিক্ষক</span>' : '<span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">👤 ইউজার</span>');
    var isSuspended = u.status === 'suspended';

    return '<tr class="hover:bg-slate-50 transition border-b border-slate-100">'+
      '<td class="py-2.5 px-3"><b>'+esc(u.name_bn||'শিক্ষার্থী')+'</b><div class="text-[10px] text-slate-400">'+esc(u.user_code)+'</div></td>'+
      '<td class="py-2.5 px-3 font-mono">'+esc(u.phone)+'</td>'+
      '<td class="py-2.5 px-3 font-bold '+(u.balance>0?'text-emerald-600':'text-slate-500')+'">'+tk(u.balance)+'</td>'+
      '<td class="py-2.5 px-3 text-slate-500">'+toBn(u.referrals||0)+' জন</td>'+
      '<td class="py-2.5 px-3 text-center">'+roleBadge+'</td>'+
      '<td class="py-2.5 px-3 text-center">'+
        '<button onclick="confirmUserStatus('+u.id+', \\''+u.status+'\\')" class="text-[10px] font-bold px-2 py-1 rounded-lg '+(isSuspended?'bg-rose-100 text-rose-700':'bg-emerald-100 text-emerald-700')+' hover:opacity-80">'+
          (isSuspended ? '⛔ স্থগিত' : '✓ সক্রিয়')+
        '</button>'+
      '</td>'+
      '<td class="py-2.5 px-3 text-right">'+
        '<div class="flex items-center justify-end gap-1">'+
          '<button onclick="openRoleModalById('+u.id+', \\''+esc(u.name_bn||'')+'\\', \\''+esc(u.phone)+'\\', \\''+u.role+'\\')" class="text-[10px] px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg font-bold" title="রোল পরিবর্তন"><i class="fas fa-shield-halved"></i> রোল</button>'+
          '<button onclick="openPasswordModal('+u.id+', \\''+esc(u.name_bn||'')+'\\', \\''+esc(u.phone)+'\\')" class="text-[10px] px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg font-bold" title="পাসওয়ার্ড রিসেট"><i class="fas fa-key"></i></button>'+
          '<button onclick="openWalletModal('+u.id+', \\''+esc(u.name_bn||'')+'\\', '+u.balance+')" class="text-[10px] px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold" title="ব্যালেন্স"><i class="fas fa-wallet"></i> +/-</button>'+
          '<button onclick="grantPlanForUser(\\''+esc(u.phone)+'\\')" class="text-[10px] px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg font-bold" title="প্ল্যান দিন">👑 প্ল্যান</button>'+
        '</div>'+
      '</td>'+
    '</tr>';
  }).join('');
}

// রোল সিকিউরিটি মোডাল হ্যান্ডলার
function openRoleModalById(id, name, phone, currentRole){
  document.getElementById('roleTargetUserId').value = id;
  document.getElementById('roleTargetUserName').textContent = name || 'ইউজার #' + id;
  document.getElementById('roleTargetUserPhone').textContent = 'ফোন: ' + phone;
  document.getElementById('roleTargetCurrentRole').textContent = currentRole;
  document.getElementById('roleSelectNew').value = currentRole;
  document.getElementById('roleChangeReason').value = '';
  document.getElementById('roleConfirmPhrase').value = '';

  var isSuper = phone === '01835414122';
  document.getElementById('roleSuperAdminWarning').classList.toggle('hidden', !isSuper);
  document.getElementById('btnSubmitRole').disabled = isSuper;

  onRoleSelectChange(currentRole);
  document.getElementById('admRoleModal').classList.remove('hidden');
  document.getElementById('admRoleModal').classList.add('flex');
}
function closeRoleModal(){
  document.getElementById('admRoleModal').classList.add('hidden');
  document.getElementById('admRoleModal').classList.remove('flex');
}
function onRoleSelectChange(newRole){
  var confirmBox = document.getElementById('roleAdminConfirmBox');
  if(confirmBox){
    confirmBox.classList.toggle('hidden', newRole !== 'admin');
  }
}
async function submitRoleChange(e){
  e.preventDefault();
  var id = document.getElementById('roleTargetUserId').value;
  var newRole = document.getElementById('roleSelectNew').value;
  var phrase = document.getElementById('roleConfirmPhrase').value;
  var reason = document.getElementById('roleChangeReason').value;

  if(newRole === 'admin' && phrase.trim() !== 'CONFIRM'){
    toastMsg('সতর্কতা: নিশ্চিত করতে "CONFIRM" টাইপ করা বাধ্যতামূলক!');
    return false;
  }

  var res = await api('put', '/api/admin/users/' + id + '/role', {
    role: newRole,
    confirm_phrase: phrase,
    reason: reason
  });
  if(res && res.ok){
    toastMsg(res.message || 'ইউজারের রোল সফলভাবে পরিবর্তিত হয়েছে ✓');
    closeRoleModal();
    loadUsers();
  }
  return false;
}

// পাসওয়ার্ড রিসেট মোডাল
function openPasswordModal(id, name, phone){
  document.getElementById('passTargetUserId').value = id;
  document.getElementById('passTargetUserName').textContent = name;
  document.getElementById('passTargetUserPhone').textContent = phone;
  document.getElementById('passNewValue').value = '';
  document.getElementById('admPasswordModal').classList.remove('hidden');
  document.getElementById('admPasswordModal').classList.add('flex');
}
function closePasswordModal(){
  document.getElementById('admPasswordModal').classList.add('hidden');
  document.getElementById('admPasswordModal').classList.remove('flex');
}
function generateRandomPass(){
  var pin = Math.floor(100000 + Math.random() * 900000);
  document.getElementById('passNewValue').value = 'edu' + pin;
}
async function submitPasswordReset(e){
  e.preventDefault();
  var id = document.getElementById('passTargetUserId').value;
  var newPass = document.getElementById('passNewValue').value;
  var res = await api('post', '/api/admin/users/' + id + '/reset-password', { new_password: newPass });
  if(res && res.ok){
    toastMsg('পাসওয়ার্ড রিসেট সফল হয়েছে ✓');
    closePasswordModal();
  }
  return false;
}

// ওয়ালেট মোডাল
function openWalletModal(id, name, balance){
  document.getElementById('walletTargetUserId').value = id;
  document.getElementById('walletTargetUserName').textContent = name;
  document.getElementById('walletTargetCurrentBalance').textContent = tk(balance);
  document.getElementById('walletAdjustAmount').value = '';
  document.getElementById('walletAdjustNote').value = '';
  document.getElementById('admWalletModal').classList.remove('hidden');
  document.getElementById('admWalletModal').classList.add('flex');
}
function closeWalletModal(){
  document.getElementById('admWalletModal').classList.add('hidden');
  document.getElementById('admWalletModal').classList.remove('flex');
}
async function submitWalletAdjust(e){
  e.preventDefault();
  var id = document.getElementById('walletTargetUserId').value;
  var amt = document.getElementById('walletAdjustAmount').value;
  var note = document.getElementById('walletAdjustNote').value;
  var res = await api('post', '/api/admin/users/' + id + '/wallet', { amount: amt, note: note });
  if(res && res.ok){
    toastMsg('ব্যালেন্স অ্যাডজাস্ট সফল হয়েছে ✓');
    closeWalletModal();
    loadUsers();
  }
  return false;
}

async function confirmUserStatus(id, currentStatus){
  var nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
  var msg = nextStatus === 'suspended' ? 'এই ইউজারকে কি স্থগিত (Suspend) করতে চান? লগইন বাতিল হবে।' : 'এই ইউজারকে কি পুনরায় সক্রিয় করতে চান?';
  if(!confirm(msg)) return;

  var res = await api('put', '/api/admin/users/' + id + '/status', { status: nextStatus, reason: 'এডমিন কর্তৃক স্ট্যাটাস টগল' });
  if(res && res.ok){
    toastMsg('স্ট্যাটাস আপডেট সম্পন্ন ✓');
    loadUsers();
  }
}

function grantPlanForUser(phoneOrId){
  navigateToTab('subs');
  setTimeout(function(){
    var inp = document.getElementById('grantUserIdInput');
    if(inp){ inp.value = phoneOrId; inp.focus(); }
  }, 200);
}

// ============================================================
// ৪. ডাটা সিঙ্ক সেন্টার (DATA SYNC CENTER)
// ============================================================
async function loadSyncSources(){
  var d = await api('get', '/api/admin/sync-sources');
  if(!d) return;

  var tbody = document.getElementById('syncSourcesTableBody');
  if(!tbody) return;

  tbody.innerHTML = (d.sources || []).map(function(s){
    var isLive = s.status === 'active';
    return '<tr class="hover:bg-slate-50 transition">'+
      '<td class="py-3 px-3">'+
        '<p class="font-bold text-slate-900">'+esc(s.name)+'</p>'+
        '<a href="'+esc(s.source_url)+'" target="_blank" class="text-[10px] text-sky-600 hover:underline flex items-center gap-1">'+
          '<i class="fas fa-arrow-up-right-from-square text-[9px]"></i> '+esc(s.source_url)+
        '</a>'+
      '</td>'+
      '<td class="py-3 px-3"><span class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[10px]">'+esc(s.category)+'</span></td>'+
      '<td class="py-3 px-3 text-slate-500">'+esc(s.last_synced_at || 'এখনো সিঙ্ক হয়নি')+'</td>'+
      '<td class="py-3 px-3 text-center font-bold text-slate-800">'+toBn(s.total_fetched || 0)+'</td>'+
      '<td class="py-3 px-3 text-center font-bold text-emerald-600">+'+toBn(s.new_added || 0)+'</td>'+
      '<td class="py-3 px-3 text-center text-slate-400">'+toBn(s.duplicates_count || 0)+'</td>'+
      '<td class="py-3 px-3 text-center">'+
        '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold '+(isLive?'bg-emerald-100 text-emerald-800':'bg-amber-100 text-amber-800')+'">'+
          (isLive ? '🟢 সক্রিয়' : 'অপেক্ষমান')+
        '</span>'+
      '</td>'+
      '<td class="py-3 px-3 text-right">'+
        '<button onclick="triggerForceSync(\\''+s.key+'\\')" class="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-extrabold text-[10px] transition shadow flex items-center gap-1 ml-auto">'+
          '<i class="fas fa-bolt"></i> ফোর্স সিঙ্ক'+
        '</button>'+
      '</td>'+
    '</tr>';
  }).join('');

  // সিঙ্ক সেন্টার টপ স্ট্যাটাস কার্ড আপডেট
  var sources = d.sources || [];
  var statSources = document.getElementById('syncStatSources');
  if(statSources) statSources.textContent = toBn(sources.length) + 'টি সোর্স';

  var statLastTime = document.getElementById('syncStatLastTime');
  if(statLastTime){
    var latest = sources.find(function(s){ return s.last_synced_at; });
    statLastTime.textContent = latest && latest.last_synced_at ? latest.last_synced_at : 'আজকের সিঙ্ক সক্রিয়';
  }

  var statTotal = document.getElementById('syncStatTotal');
  if(statTotal){
    var sumFetched = sources.reduce(function(acc, s){ return acc + (s.total_fetched || 0); }, 0);
    statTotal.textContent = toBn(sumFetched || 120) + '+';
  }
}

async function triggerForceSync(sourceKey){
  var logBox = document.getElementById('autoCollectLogs');
  var now = new Date().toLocaleTimeString('bn-BD');
  if(logBox){
    logBox.innerHTML += '<p class="text-amber-400">⚡ ['+now+'] "' + sourceKey + '" ফোর্স সিঙ্ক শুরু হচ্ছে...</p>';
    logBox.scrollTop = logBox.scrollHeight;
  }

  var res = await api('post', '/api/admin/force-sync/' + sourceKey);
  if(res && res.ok){
    toastMsg(res.message || 'সিঙ্ক সম্পন্ন হয়েছে ✓');
    if(logBox && res.diagnostics){
      var d = res.diagnostics;
      logBox.innerHTML += '<p class="text-emerald-400">✅ ['+new Date().toLocaleTimeString('bn-BD')+'] ' + res.message + '</p>';
      logBox.innerHTML += '<p class="text-slate-300">» স্ক্যানকৃত: '+toBn(d.total_scanned)+' | নতুন যুক্ত: +'+toBn(d.new_added)+' | ফিল্টার্ড: '+toBn(d.duplicates_prevented)+' ('+toBn(d.duration_ms)+'ms)</p>';
      logBox.scrollTop = logBox.scrollHeight;
    }
    loadSyncSources();
    loadSyncLogs();
  }
}

async function loadSyncLogs(){
  var d = await api('get', '/api/admin/sync-logs');
  if(!d) return;

  var tbody = document.getElementById('syncLogsTableBody');
  if(!tbody) return;

  tbody.innerHTML = (d.logs || []).map(function(l){
    var isSuccess = l.status === 'success';
    return '<tr class="hover:bg-slate-50 transition">'+
      '<td class="py-2 px-3 text-slate-400">'+esc(l.created_at)+'</td>'+
      '<td class="py-2 px-3 font-semibold text-slate-800">'+esc(l.source_name)+'</td>'+
      '<td class="py-2 px-3 text-center">'+
        '<span class="px-1.5 py-0.5 rounded text-[10px] font-bold '+(isSuccess?'bg-emerald-100 text-emerald-800':'bg-rose-100 text-rose-800')+'">'+
          (isSuccess ? '✓ সফল' : '✕ ত্রুটি')+
        '</span>'+
      '</td>'+
      '<td class="py-2 px-3 text-center font-bold text-emerald-600">+'+toBn(l.new_count||0)+'</td>'+
      '<td class="py-2 px-3 text-center text-slate-400">'+toBn(l.duration_ms||0)+'ms</td>'+
      '<td class="py-2 px-3 text-slate-500">'+esc(l.triggered_by||'এডমিন')+'</td>'+
    '</tr>';
  }).join('');
}

function clearSyncLogsConsole(){
  var logBox = document.getElementById('autoCollectLogs');
  if(logBox) logBox.innerHTML = '<p class="text-slate-500">» কনসোল পরিষ্কার করা হয়েছে।</p>';
}

// ============================================================
// ৫. সিকিউরিটি অডিট ট্রেইল
// ============================================================
var AUDIT_LOGS_CACHE = [];
async function loadAuditLogs(){
  var d = await api('get', '/api/admin/audit-logs');
  if(!d) return;
  AUDIT_LOGS_CACHE = d.logs || [];
  renderAuditRows(AUDIT_LOGS_CACHE);
}

function renderAuditRows(list){
  var tbody = document.getElementById('auditLogsTableBody');
  if(!tbody) return;
  if(!list.length){
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-slate-400">কোনো অডিট লগ রেকর্ড নেই</td></tr>';
    return;
  }
  tbody.innerHTML = list.map(function(a){
    return '<tr class="hover:bg-slate-50 transition">'+
      '<td class="py-2.5 px-3 text-slate-400">'+esc(a.created_at)+'</td>'+
      '<td class="py-2.5 px-3 font-mono font-bold text-amber-800"><span class="bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">'+esc(a.action)+'</span></td>'+
      '<td class="py-2.5 px-3 font-semibold text-slate-800">'+esc(a.admin_name||'এডমিন')+'</td>'+
      '<td class="py-2.5 px-3 font-mono text-slate-500">'+esc(a.target_type)+' #'+esc(a.target_id)+'</td>'+
      '<td class="py-2.5 px-3 text-slate-700">'+esc(a.details)+'</td>'+
    '</tr>';
  }).join('');
}

function filterAuditLogs(q){
  var query = (q || '').trim().toLowerCase();
  if(!query){ renderAuditRows(AUDIT_LOGS_CACHE); return; }
  var filtered = AUDIT_LOGS_CACHE.filter(function(a){
    return (a.action||'').toLowerCase().includes(query) ||
           (a.admin_name||'').toLowerCase().includes(query) ||
           (a.details||'').toLowerCase().includes(query);
  });
  renderAuditRows(filtered);
}

// ============================================================
// ৬. মেন্টর কন্ট্রোল হাব
// ============================================================
function switchMentorSubTab(sub){
  ['list', 'tickets', 'complaints', 'payouts'].forEach(function(s){
    var btn = document.getElementById('mSubBtn-' + s);
    var pane = document.getElementById('mSubTab-' + s);
    if(btn) {
      btn.className = (s === sub) 
        ? 'mentor-sub-btn px-3.5 py-2 rounded-xl font-bold bg-amber-500 text-slate-950 transition flex items-center gap-1.5 shadow'
        : 'mentor-sub-btn px-3.5 py-2 rounded-xl font-bold bg-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5';
    }
    if(pane) pane.classList.toggle('hidden', s !== sub);
  });
  if(sub === 'tickets') loadTeacherTickets('pending');
}

async function loadMentorOverview(){
  var d = await api('get', '/api/admin/mentor-overview');
  if(!d) return;

  // কাউন্টারস
  document.getElementById('mCountTeachers').textContent = toBn((d.mentors||[]).length);
  document.getElementById('mCountPendingTickets').textContent = toBn((d.unassigned_tickets||[]).length);
  document.getElementById('mCountComplaints').textContent = toBn((d.complaints||[]).length);
  document.getElementById('mCountPayouts').textContent = toBn((d.payouts||[]).length);

  // শিক্ষক ড্রপডাউন পপুলেট
  var pSel = document.getElementById('payoutTeacherSelect');
  if(pSel){
    pSel.innerHTML = '<option value="">-- শিক্ষক বেছে নিন --</option>' + (d.mentors||[]).map(function(m){
      return '<option value="'+m.id+'">'+esc(m.name)+' ('+esc(m.subject)+') • সমাধান: '+toBn(m.solved_count||0)+'</option>';
    }).join('');
  }

  // শিক্ষক কার্ড গ্রিড
  loadAdminTeachers();

  // কমপ্লেন বক্স
  var compBox = document.getElementById('admComplaintsList');
  if(compBox){
    if(!d.complaints || !d.complaints.length){
      compBox.innerHTML = '<div class="py-8 text-center text-slate-400 bg-slate-50 rounded-2xl">কোনো কমপ্লেন বা নেগেটিভ ফিডব্যাক নেই ✓</div>';
    } else {
      compBox.innerHTML = d.complaints.map(function(c){
        return '<div class="border border-rose-200 bg-rose-50/40 rounded-2xl p-4 space-y-2">'+
          '<div class="flex items-center justify-between">'+
            '<span class="font-bold text-slate-900">টিকেট #'+esc(c.ticket_code)+' • '+esc(c.subject)+'</span>'+
            '<span class="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-xs">⭐ রেটিং: '+toBn(c.rating)+'/৫</span>'+
          '</div>'+
          '<p class="text-xs text-slate-700"><b>শিক্ষার্থী:</b> '+esc(c.student_name)+' ('+esc(c.student_phone)+')</p>'+
          '<p class="text-xs text-slate-700"><b>শিক্ষক:</b> '+esc(c.teacher_name||c.answered_by_name||'অজ্ঞাত')+'</p>'+
          '<div class="bg-white p-2.5 rounded-xl border border-slate-200 text-xs text-slate-600">'+
            '<b>শিক্ষার্থীর ফিডব্যাক:</b> '+esc(c.user_feedback || 'কোনো লিখিত মন্তব্য নেই')+
          '</div>'+
        '</div>';
      }).join('');
    }
  }

  // পেআউট রেকর্ড
  var payBox = document.getElementById('admPayoutsList');
  if(payBox){
    if(!d.payouts || !d.payouts.length){
      payBox.innerHTML = '<p class="text-slate-400 py-6 text-center">কোনো পূর্ববর্তী পেআউট রেকর্ড নেই</p>';
    } else {
      payBox.innerHTML = d.payouts.map(function(p){
        return '<div class="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">'+
          '<div><p class="font-bold text-slate-900">'+esc(p.mentor_name)+'</p><p class="text-[10px] text-slate-400">'+esc(p.note)+' • '+esc(p.created_at)+'</p></div>'+
          '<div class="text-right font-bold text-emerald-600 text-sm">'+tk(p.amount)+'</div>'+
        '</div>';
      }).join('');
    }
  }
}

async function submitMentorPayout(e){
  e.preventDefault();
  var mentorId = document.getElementById('payoutTeacherSelect').value;
  var amt = document.getElementById('payoutAmount').value;
  var tickets = document.getElementById('payoutTicketsCount').value;
  var sessions = document.getElementById('payoutSessionsCount').value;
  var note = document.getElementById('payoutNote').value;

  var res = await api('post', '/api/admin/mentor-settle-payout', {
    mentor_id: mentorId,
    amount: amt,
    tickets_count: tickets,
    sessions_count: sessions,
    note: note
  });
  if(res && res.ok){
    toastMsg('পেআউট সফলভাবে সেটেল হয়েছে ✓');
    e.target.reset();
    loadMentorOverview();
  }
  return false;
}

// ============================================================
// ৭. অ্যাসিস্টেড আবেদন কিউ
// ============================================================
var ASSISTED_CACHE = [];
async function loadAssistedApps(status){
  document.querySelectorAll('.assisted-flt-btn').forEach(function(b){
    b.className = (b.getAttribute('data-flt') === status)
      ? 'px-3 py-1.5 rounded-xl font-bold bg-slate-900 text-white assisted-flt-btn'
      : 'px-3 py-1.5 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 assisted-flt-btn';
  });

  var url = '/api/admin/assisted-applications?status=' + encodeURIComponent(status);
  var d = await api('get', url);
  if(!d) return;

  ASSISTED_CACHE = d.requests || [];
  var box = document.getElementById('assistedAppsList');
  if(!box) return;

  if(!ASSISTED_CACHE.length){
    box.innerHTML = '<div class="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl">কোনো আবেদন পাওয়া যায়নি</div>';
    return;
  }

  box.innerHTML = ASSISTED_CACHE.map(function(r){
    var stColor = r.status === 'requested' ? 'bg-amber-100 text-amber-800' : (r.status === 'paid' ? 'bg-sky-100 text-sky-800' : (r.status === 'processing' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'));
    var stName = r.status === 'requested' ? '⌛ নতুন অনুরোধ' : (r.status === 'paid' ? '💳 ফি পরিশোধিত' : (r.status === 'processing' ? '🔄 প্রসেসিং চলছে' : '✓ সম্পন্ন'));

    return '<div class="border border-slate-200 rounded-2xl p-4 bg-white hover:border-sky-400 transition space-y-3">'+
      '<div class="flex items-start justify-between gap-2 flex-wrap">'+
        '<div>'+
          '<div class="flex items-center gap-2">'+
            '<span class="font-extrabold text-slate-900 text-sm">#আবেদন-'+r.id+' • '+esc(r.service_name||'ফরম ফিলাপ সহায়তা')+'</span>'+
            '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full '+stColor+'">'+stName+'</span>'+
          '</div>'+
          '<p class="text-xs text-slate-500 mt-0.5">শিক্ষার্থী: <b>'+esc(r.user_name)+'</b> ('+esc(r.user_phone)+') • কোড: '+esc(r.user_code)+'</p>'+
        '</div>'+
        '<div class="flex items-center gap-2">'+
          '<select onchange="updateAssistedStatus('+r.id+', this.value)" class="border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-semibold bg-white">'+
            '<option value="requested" '+(r.status==='requested'?'selected':'')+'>নতুন অনুরোধ</option>'+
            '<option value="paid" '+(r.status==='paid'?'selected':'')+'>ফি পরিশোধিত</option>'+
            '<option value="processing" '+(r.status==='processing'?'selected':'')+'>প্রসেসিং চলছে</option>'+
            '<option value="completed" '+(r.status==='completed'?'selected':'')+'>সম্পন্ন</option>'+
            '<option value="cancelled" '+(r.status==='cancelled'?'selected':'')+'>বাতিল</option>'+
          '</select>'+
        '</div>'+
      '</div>'+
      '<div class="p-3 bg-slate-50 rounded-xl text-xs space-y-1">'+
        '<p><b>সার্ভিস ফি:</b> '+tk(r.fee)+' • <b>আবেদনের সময়:</b> '+esc(r.created_at)+'</p>'+
        (r.admin_note ? '<p class="text-sky-800"><b>এডমিন নোট:</b> '+esc(r.admin_note)+'</p>' : '')+
      '</div>'+
    '</div>';
  }).join('');
}

async function updateAssistedStatus(id, newStatus){
  var note = prompt('এডমিন নোট লিখুন (যেমন: ফরম ফিলাপ সফলভাবে সম্পন্ন ও রোল পাঠানো হয়েছে):');
  var res = await api('put', '/api/admin/assisted-applications/' + id, { status: newStatus, admin_note: note || '' });
  if(res && res.ok){
    toastMsg('আবেদন স্ট্যাটাস আপডেট সম্পন্ন ✓');
    loadAssistedApps('');
  }
}

// ============================================================
// ৮. কন্টেন্ট ওয়ার্কফ্লো ও CRUD ইঞ্জিন (Auto Sync → Preview → Verify → Approve → Publish)
// ============================================================
var CRUD_CONFIG = {
  jobs: {
    title: '💼 চাকরি সার্কুলার', api: '/api/admin/jobs', key: 'jobs',
    fields: [
      ['title','চাকরির পদ ও সার্কুলার নাম *','text'],
      ['org','প্রতিষ্ঠান / সংস্থা *','text'],
      ['category','ক্যাটাগরি','select',['bcs','bank','govt','primary_teacher','private','ngo']],
      ['vacancy','পদ সংখ্যা','text'],
      ['deadline','আবেদনের শেষ তারিখ','text'],
      ['source','অফিসিয়াল সোর্স পোর্টাল (যেমন: bpsc.gov.bd)','text'],
      ['application_fee','আবেদন ফি','text'],
      ['official_url','অফিসিয়াল সার্কুলার PDF লিংক','text'],
      ['apply_url','অনলাইন আবেদন লিংক','text'],
      ['details','বিস্তারিত বিবরণ ও যোগ্যতা','textarea']
    ],
    row: function(j){ return '<b>'+esc(j.title)+'</b> <span class="text-xs text-slate-400">['+esc(j.org)+'] ডেডলাইন: '+esc(j.deadline||'—')+'</span>'; }
  },
  admissions: {
    title: '🎓 ভর্তি তথ্য ও পোর্টাল', api: '/api/admin/admissions', key: 'admissions',
    fields: [
      ['title','ভর্তি পরীক্ষার নাম *','text'],
      ['org','বিশ্ববিদ্যালয় / কলেজ / বোর্ড *','text'],
      ['level','শিক্ষাস্তর','select',['ssc','hsc','hons','degree','masters','medical','buet']],
      ['source','অফিসিয়াল সোর্স লিংক','text'],
      ['deadline','আবেদনের শেষ তারিখ','text'],
      ['fee','আবেদন ফি','text'],
      ['details','বিস্তারিত সার্কুলার','textarea']
    ],
    row: function(a){ return '<b>'+esc(a.title)+'</b> <span class="text-xs text-slate-400">['+esc(a.org)+'] শেষ: '+esc(a.deadline||'—')+'</span>'; }
  },
  notices: {
    title: '📢 নোটিস বোর্ড', api: '/api/admin/notices', key: 'notices',
    fields: [
      ['title','নোটিসের শিরোনাম *','text'],
      ['category','ক্যাটাগরি','select',['admission','job','scholarship','result','general']],
      ['source','সোর্স ও কর্তৃপক্ষ','text'],
      ['body','বিস্তারিত বিবরণ','textarea']
    ],
    row: function(n){ return '<b>'+esc(n.title)+'</b> <span class="text-xs text-slate-400">['+esc(n.category)+']</span>'; }
  },
  mcq: {
    title: '❓ MCQ ও কুইজ প্রশ্নব্যাংক', api: '/api/admin/mcq', key: 'questions',
    fields: [
      ['question','প্রশ্ন *','textarea'],
      ['opt_a','অপশন ক *','text'],
      ['opt_b','অপশন খ *','text'],
      ['opt_c','অপশন গ *','text'],
      ['opt_d','অপশন ঘ *','text'],
      ['answer','সঠিক উত্তর (a/b/c/d) *','text'],
      ['explanation','সঠিক উত্তরের ব্যাখ্যা','textarea'],
      ['category','ক্যাটাগরি','text'],
      ['level','শিক্ষাস্তর','text'],
      ['source','বোর্ড / পরীক্ষার নাম ও সাল','text']
    ],
    row: function(m){ return '<b>'+esc(m.question)+'</b> <span class="text-xs text-slate-400">উত্তর: '+esc(m.answer)+' • '+esc(m.source||'')+'</span>'; }
  },
  syllabus: {
    title: '📖 সিলেবাস হাব', api: '/api/admin/syllabus', key: 'syllabus',
    fields: [
      ['title','সিলেবাসের নাম *','text'],
      ['level','শিক্ষাস্তর (ssc, hsc, nu_degree, job) *','text'],
      ['subject','বিষয় *','text'],
      ['pdf_url','সিলেবাস PDF লিংক / ড্রাইভ','text'],
      ['source','সোর্স (NCTB / NU)','text'],
      ['content','সংক্ষিপ্ত সিলেবাস আউটলাইন','textarea']
    ],
    row: function(s){ return '<b>'+esc(s.title)+'</b> <span class="text-xs text-slate-400">['+esc(s.level)+' - '+esc(s.subject)+']</span>'; }
  },
  qpapers: {
    title: '📜 বিগত বছরের প্রশ্নপত্র (২০১৭-২৪)', api: '/api/admin/qpapers', key: 'qpapers',
    fields: [
      ['title','প্রশ্নপত্রের শিরোনাম *','text'],
      ['level','শিক্ষাস্তর (ssc, hsc, nu, bcs) *','text'],
      ['subject','বিষয় *','text'],
      ['year','সাল (যেমন: 2024, 2023) *','text'],
      ['board','শিক্ষা বোর্ড (Dhaka, Rajshahi, All)','text'],
      ['pdf_url','প্রশ্ন ও উত্তরের PDF লিংক','text'],
      ['source','অফিসিয়াল সোর্স','text']
    ],
    row: function(q){ return '<b>'+esc(q.title)+'</b> <span class="text-xs text-slate-400">['+esc(q.year)+' • '+esc(q.board||'All')+']</span>'; }
  },
  suggestions: {
    title: '💡 সাজেশন ও মডেল টেস্ট', api: '/api/admin/suggestions', key: 'suggestions',
    fields: [
      ['title','সাজেশনের নাম *','text'],
      ['level','শিক্ষাস্তর *','text'],
      ['subject','বিষয় *','text'],
      ['content','সাজেশন ও কমন উপযোগী প্রশ্নমালা','textarea']
    ],
    row: function(sg){ return '<b>'+esc(sg.title)+'</b> <span class="text-xs text-slate-400">['+esc(sg.level)+' • '+esc(sg.subject)+']</span>'; }
  },
  scholarships: {
    title: '🎓 স্কলারশিপ ও অনুদান', api: '/api/admin/scholarships', key: 'scholarships',
    fields: [
      ['title','স্কলারশিপের নাম *','text'],
      ['provider','প্রদানকারী প্রতিষ্ঠান *','text'],
      ['category','ক্যাটাগরি','select',['national','board','bank','international']],
      ['target_level','শিক্ষাস্তর','select',['all','ssc','hsc','nu','bsc','masters']],
      ['stipend_amount','বৃত্তির পরিমাণ / আর্থিক অনুদান *','text'],
      ['deadline','আবেদনের ডেডলাইন','text'],
      ['apply_link','সরাসরি আবেদন লিংক','text'],
      ['source','অফিসিয়াল গেজেট লিংক (shed.gov.bd)','text'],
      ['tips_guideline','টিপস ও গাইডলাইন','textarea']
    ],
    row: function(sc){ return '<b>'+esc(sc.title)+'</b> <span class="text-xs text-slate-400">['+esc(sc.provider)+'] বৃত্তি: '+esc(sc.stipend_amount)+'</span>'; }
  },
  announce: {
    title: '🔔 পুশ নোটিস ও ঘোষণা', api: '/api/admin/announcements', key: 'announcements',
    fields: [
      ['title','ঘোষণার শিরোনাম *','text'],
      ['message','বার্তার বিবরণ *','textarea'],
      ['target_role','টার্গেট ইউজার (all, premium, free)','text'],
      ['badge','হাইলাইট ব্যাজ (যেমন: জরুরি, নতুন)','text']
    ],
    row: function(an){ return '<b>'+esc(an.title)+'</b> <span class="text-xs text-slate-400">['+esc(an.target_role||'all')+']</span>'; }
  }
};
var CRUD = CRUD_CONFIG;

function toggleManualCrudForm(moduleKey){
  var formWrap = document.getElementById('manualCrudWrap-' + moduleKey);
  var btnText = document.getElementById('btnManualToggle-' + moduleKey);
  if(formWrap){
    var isHidden = formWrap.classList.contains('hidden');
    formWrap.classList.toggle('hidden', !isHidden);
    if(btnText) btnText.textContent = isHidden ? 'ফর্ম লুকান' : 'ম্যানুয়ালি যোগ করুন';
  }
}

function renderCrud(t){
  var cfg = CRUD[t];
  var box = document.getElementById('contentBox-' + t);
  if(!box || !cfg) return;

  var formInputs = cfg.fields.map(function(f){
    if(f[2] === 'select'){
      return '<label class="block text-xs font-semibold text-slate-700">'+f[1]+'<select name="'+f[0]+'" class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs bg-white">'+f[3].map(function(o){ return '<option value="'+o+'">'+o+'</option>'; }).join('')+'</select></label>';
    }
    if(f[2] === 'textarea'){
      return '<label class="block text-xs font-semibold text-slate-700">'+f[1]+'<textarea name="'+f[0]+'" rows="3" class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs"></textarea></label>';
    }
    return '<label class="block text-xs font-semibold text-slate-700">'+f[1]+'<input name="'+f[0]+'" class="w-full mt-1 border border-slate-300 rounded-xl px-3 py-2 text-xs"></label>';
  }).join('');

  box.innerHTML = 
    '<div id="manualCrudWrap-'+t+'" class="hidden mb-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5">'+
      '<h3 class="font-extrabold text-slate-900 text-sm mb-3">নতুন '+cfg.title+' যোগ করুন</h3>'+
      '<form id="form-'+t+'" class="space-y-3">'+formInputs+
        '<div class="flex gap-2 pt-2">'+
          '<button type="button" onclick="toggleManualCrudForm(\\''+t+'\\')" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs">বাতিল</button>'+
          '<button type="submit" class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2 rounded-xl text-xs transition shadow">সংরক্ষণ করুন</button>'+
        '</div>'+
      '</form>'+
    '</div>'+
    '<div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-3">'+
      '<div class="flex items-center justify-between pb-2 border-b border-slate-100">'+
        '<h3 class="font-extrabold text-slate-900 text-sm">তালিকা ও ভেরিফিকেশন স্ট্যাটাস</h3>'+
        '<span class="text-xs text-slate-400" id="crudCount-'+t+'">আইটেম লোড হচ্ছে...</span>'+
      '</div>'+
      '<div id="list-'+t+'" class="divide-y divide-slate-100 text-xs max-h-[34rem] overflow-y-auto"></div>'+
    '</div>';

  var formEl = document.getElementById('form-' + t);
  if(formEl){
    formEl.addEventListener('submit', async function(e){
      e.preventDefault();
      var data = Object.fromEntries(new FormData(e.target));
      var res = await api('post', cfg.api, data);
      if(res && res.ok){
        toastMsg('সফলভাবে যোগ করা হয়েছে ✓');
        e.target.reset();
        toggleManualCrudForm(t);
        loadCrudList(t);
      }
    });
  }

  loadCrudList(t);
}

var CRUD_ITEMS_CACHE = {};
var STAGING_FILTER_STATE = {};

function filterContentStaging(t, status) {
  STAGING_FILTER_STATE[t] = status;
  var btns = document.querySelectorAll('.content-flt-' + t);
  btns.forEach(function(b) {
    var st = b.getAttribute('data-status');
    if (st === status) {
      b.className = 'content-flt-' + t + ' px-2.5 py-1 rounded-lg font-bold bg-slate-900 text-white';
    } else {
      b.className = 'content-flt-' + t + ' px-2.5 py-1 rounded-lg font-bold bg-slate-100 text-slate-700 hover:bg-slate-200';
    }
  });
  renderFilteredCrudList(t);
}

function renderFilteredCrudList(t) {
  var cfg = CRUD[t];
  if (!cfg) return;
  var items = CRUD_ITEMS_CACHE[t] || [];
  var filter = STAGING_FILTER_STATE[t] || 'all';

  var filtered = items.filter(function(it) {
    var isLive = it.is_active === 1 || it.is_active === true || it.is_active == null;
    if (filter === 'published') return isLive;
    if (filter === 'pending') return !isLive;
    return true;
  });

  var cnt = document.getElementById('crudCount-' + t);
  if (cnt) cnt.textContent = 'মোট ' + toBn(filtered.length) + 'টি আইটেম' + (filter !== 'all' ? ' (ফিল্টার্ড)' : '');

  var listEl = document.getElementById('list-' + t);
  if (!listEl) return;

  if (!filtered.length) {
    listEl.innerHTML = '<p class="text-slate-400 py-6 text-center">এই ফিল্টারে কোনো কন্টেন্ট নেই</p>';
    return;
  }

  listEl.innerHTML = filtered.map(function(it) {
    var isLive = it.is_active === 1 || it.is_active === true || it.is_active == null;
    var srcUrl = it.source || it.link || it.apply_link || '';
    return '<div class="py-3 flex items-start justify-between gap-3 border-b border-slate-100 last:border-0">' +
      '<div class="min-w-0 flex-1">' +
        cfg.row(it) +
        '<div class="flex items-center gap-2 mt-1.5 flex-wrap">' +
          '<span class="text-[10px] px-2 py-0.5 rounded-full font-bold ' + (isLive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800') + '">' +
            (isLive ? '🟢 লাইভ ও অনুমোদিত' : '🟡 অপেক্ষমান যাচাই') +
          '</span>' +
          (srcUrl ? '<a href="' + esc(srcUrl) + '" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[10px] text-sky-600 hover:text-sky-800 hover:underline font-medium"><i class="fas fa-external-link-alt text-[9px]"></i>সোর্স যাচাই ↗</a>' : '') +
        '</div>' +
      '</div>' +
      '<div class="flex items-center gap-1.5 shrink-0">' +
        '<button onclick="toggleContentStatus(\\'' + t + '\\', ' + it.id + ', ' + (isLive ? 0 : 1) + ')" class="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors ' + (isLive ? 'bg-slate-100 text-slate-700 hover:bg-amber-100 hover:text-amber-800' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm') + '">' +
          (isLive ? 'হাইড' : '✓ পাবলিশ') +
        '</button>' +
        '<button onclick="deleteCrudItem(\\'' + t + '\\', ' + it.id + ')" class="text-[10px] font-bold px-2 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100">মুছুন</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

async function loadCrudList(t){
  var cfg = CRUD[t];
  if (!cfg) return;
  var d = await api('get', cfg.api);
  if(!d) return;

  var items = d[cfg.key] || [];
  CRUD_ITEMS_CACHE[t] = items;
  renderFilteredCrudList(t);
}

async function toggleContentStatus(t, id, nextActive){
  var actionName = nextActive ? 'publish' : 'reject';
  var res = await api('post', '/api/admin/content-action', {
    module: t,
    id: id,
    action: actionName
  });
  if(!res || !res.ok){
    res = await api('put', CRUD[t].api + '/' + id, { is_active: nextActive });
  }
  if(res && res.ok){
    toastMsg(nextActive ? 'অনুমোদিত ও লাইভ করা হয়েছে ✓' : 'কন্টেন্ট হাইড করা হয়েছে ✓');
    loadCrudList(t);
  }
}

async function deleteCrudItem(t, id){
  if(!confirm('নিশ্চিত এই কন্টেন্ট মুছে ফেলতে চান?')) return;
  var res = await api('post', '/api/admin/content-action', {
    module: t,
    id: id,
    action: 'delete'
  });
  if(!res || !res.ok){
    res = await api('delete', CRUD[t].api + '/' + id);
  }
  if(res && res.ok){
    toastMsg('সফলভাবে মুছে ফেলা হয়েছে ✓');
    loadCrudList(t);
  }
}

// ============================================================
// ৯. সাবস্ক্রিপশন প্ল্যান ও ফিচার টগল
// ============================================================
async function loadSubsTab(){
  var d = await api('get', '/api/subs/admin/plans');
  if(d && d.plans){
    document.getElementById('planEditor').innerHTML = d.plans.map(function(p){
      return '<div class="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2">'+
        '<p class="font-bold text-slate-900">'+esc(p.name_bn)+' ('+p.slug+')</p>'+
        '<p class="text-xs text-slate-500">মূল্য: '+tk(p.price)+' • মেয়াদ: '+toBn(p.duration_days)+' দিন</p>'+
      '</div>';
    }).join('');
  }
  var s = await api('get', '/api/subs/admin/subscribers');
  if(s && s.subscribers){
    document.getElementById('subsList').innerHTML = (s.subscribers||[]).map(function(x){
      return '<div class="py-2 flex items-center justify-between"><span><b>'+esc(x.name_bn)+'</b> ('+esc(x.phone)+')</span><span class="font-bold text-emerald-600">'+esc(x.plan_slug)+'</span></div>';
    }).join('') || '<p class="text-slate-400 py-3">কোনো সাবস্ক্রাইবার নেই</p>';
  }
}

document.getElementById('grantForm').addEventListener('submit', async function(e){
  e.preventDefault();
  var data = Object.fromEntries(new FormData(e.target));
  var d = await api('post', '/api/subs/admin/grant', { user_id: data.user_id, plan: data.plan, days: Number(data.days) });
  if(d && d.ok){
    toastMsg('প্ল্যান প্রদান সফল হয়েছে ✓');
    e.target.reset();
    loadSubsTab();
  }
});

async function loadFeatures(){
  var d = await api('get', '/api/subs/admin/features');
  if(!d) return;
  document.getElementById('featureList').innerHTML = (d.features||[]).map(function(f){
    return '<div class="py-3 flex items-center justify-between gap-3"><div><p class="font-bold">'+esc(f.name_bn)+'</p><p class="text-[10px] text-slate-400">'+esc(f.key)+'</p></div>'+
      '<button onclick="toggleFeature(\\''+f.key+'\\','+(f.is_enabled?0:1)+')" class="px-3 py-1 rounded-full text-[10px] font-bold '+(f.is_enabled?'bg-emerald-100 text-emerald-800':'bg-slate-200 text-slate-500')+'">'+(f.is_enabled?'✓ চালু':'✕ বন্ধ')+'</button></div>';
  }).join('');
}
async function toggleFeature(key, v){
  var d = await api('put', '/api/subs/admin/features/' + key, { is_enabled: v });
  if(d && d.ok){ toastMsg('আপডেট সম্পন্ন ✓'); loadFeatures(); }
}

async function loadRates(){
  var d = await api('get', '/api/admin/rates');
  if(!d) return;
  var f = document.getElementById('ratesForm');
  if(!f) return;
  var rates = d.rates || {};
  Object.keys(rates).forEach(function(k){
    var el = f.elements[k];
    if(!el) return;
    if(el.type === 'checkbox'){
      el.checked = rates[k] !== '0' && rates[k] !== 0;
    } else {
      el.value = rates[k] != null ? rates[k] : '';
    }
  });
  f.onsubmit = async function(e){
    e.preventDefault();
    var data = {};
    for(var i = 0; i < f.elements.length; i++){
      var el = f.elements[i];
      if(!el.name) continue;
      if(el.type === 'checkbox'){
        data[el.name] = el.checked ? '1' : '0';
      } else {
        data[el.name] = el.value.trim();
      }
    }
    var r = await api('put', '/api/admin/rates', data);
    if(r && r.ok){
      toastMsg('সকল কন্ট্রোল ও সেটিংস সফলভাবে সেভ হয়েছে ✓');
      loadRates();
    }
  };
}

// ============================================================
// ১০. শিক্ষক ও ডাউট সমাধান কিউ
// ============================================================
async function loadAdminTeachers(){
  var d = await api('get', '/api/teacher-support/mentors');
  if(!d) return;
  var grid = document.getElementById('admTeachersGrid');
  if(!grid) return;
  grid.innerHTML = (d.mentors||[]).map(function(t){
    var isOnline = t.is_online === 1 || t.is_online === true;
    return '<div class="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm space-y-2">'+
      '<div class="flex items-center gap-2.5">'+
        '<div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-sm">👨‍🏫</div>'+
        '<div><p class="font-bold text-slate-900 text-xs">'+esc(t.name)+'</p><p class="text-[10px] text-slate-400">'+esc(t.designation)+'</p></div>'+
      '</div>'+
      '<p class="text-[11px] text-slate-600">বিষয়: <b>'+esc(t.subject)+'</b> • স্তর: '+esc(t.education_level||'all')+'</p>'+
      '<div class="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">'+
        '<span>⭐ '+toBn(t.rating||4.9)+' • '+esc(t.response_time||'১৫ মিনিট')+'</span>'+
        '<span class="font-bold '+(isOnline?'text-emerald-600':'text-slate-400')+'">'+(isOnline?'🟢 সরাসরি অনলাইন':'অফলাইন')+'</span>'+
      '</div>'+
    '</div>';
  }).join('') || '<div class="col-span-full py-8 text-center text-slate-400">কোনো শিক্ষক পাওয়া যায়নি</div>';
}

async function loadTeacherTickets(status){
  var url = '/api/teacher-support/tickets' + (status ? '?status=' + status : '');
  var d = await api('get', url);
  if(!d) return;
  var box = document.getElementById('admTicketsList');
  if(!box) return;

  box.innerHTML = (d.tickets||[]).map(function(tk){
    return '<div class="border border-slate-200 rounded-2xl p-4 bg-white space-y-2 shadow-sm">'+
      '<div class="flex items-center justify-between">'+
        '<span class="font-bold text-slate-900 text-xs">টিকেট #'+esc(tk.ticket_code)+' • '+esc(tk.subject)+' ('+esc(tk.topic||'সাধারণ')+')</span>'+
        '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full '+(tk.status==='pending'?'bg-amber-100 text-amber-800':'bg-emerald-100 text-emerald-800')+'">'+(tk.status==='pending'?'অপেক্ষমান':'সমাধান')+
      '</span></div>'+
      '<p class="text-xs text-slate-700 bg-slate-50 p-2 rounded-xl"><b>প্রশ্ন:</b> '+esc(tk.question)+'</p>'+
      '<div class="flex items-center justify-between text-[11px] pt-1">'+
        '<span class="text-slate-400">শিক্ষার্থী: '+esc(tk.student_name)+'</span>'+
        '<button onclick="openTicketChat('+tk.id+', \\''+esc(tk.ticket_code)+'\\', \\''+esc(tk.student_name)+'\\')" class="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs">💬 লাইভ সমাধান চ্যাট</button>'+
      '</div>'+
    '</div>';
  }).join('') || '<div class="py-8 text-center text-slate-400">কোনো টিকেট পাওয়া যায়নি</div>';
}

function openNewTeacherModal(){
  document.getElementById('teacherForm').reset();
  document.getElementById('tf_id').value = '';
  document.getElementById('tf_modal_title').textContent = 'নতুন শিক্ষক / মেন্টর যোগ করুন';
  document.getElementById('admTeacherModal').classList.remove('hidden');
  document.getElementById('admTeacherModal').classList.add('flex');
}
function closeTeacherModal(){
  document.getElementById('admTeacherModal').classList.add('hidden');
  document.getElementById('admTeacherModal').classList.remove('flex');
}
async function saveTeacherForm(e){
  e.preventDefault();
  var data = Object.fromEntries(new FormData(e.target));
  data.is_online = document.getElementById('tf_online').checked ? 1 : 0;
  data.is_active = document.getElementById('tf_active').checked ? 1 : 0;

  var res = await api('post', '/api/teacher-support/mentors', data);
  if(res && res.ok){
    toastMsg('শিক্ষক প্রোফাইল সংরক্ষিত হয়েছে ✓');
    closeTeacherModal();
    loadAdminTeachers();
  }
  return false;
}

function openTicketChat(id, code, studentName){
  document.getElementById('chatActiveTicketId').value = id;
  document.getElementById('chatModalSub').textContent = 'টিকেট #' + code + ' • শিক্ষার্থী: ' + studentName;
  document.getElementById('chatMessagesBox').innerHTML = '<div class="text-center py-6 text-slate-400">মেসেজ লোড হচ্ছে...</div>';
  document.getElementById('admChatModal').classList.remove('hidden');
  document.getElementById('admChatModal').classList.add('flex');
  loadTicketMessages(id);
}
function closeTicketChat(){
  document.getElementById('admChatModal').classList.add('hidden');
  document.getElementById('admChatModal').classList.remove('flex');
}
async function loadTicketMessages(id){
  var d = await api('get', '/api/teacher-support/tickets/' + id + '/messages');
  if(!d) return;
  var box = document.getElementById('chatMessagesBox');
  box.innerHTML = (d.messages||[]).map(function(m){
    var isTeacher = m.sender_role === 'teacher' || m.sender_role === 'admin';
    return '<div class="flex '+(isTeacher?'justify-end':'justify-start')+'">'+
      '<div class="max-w-xs sm:max-w-sm rounded-2xl p-3 text-xs '+(isTeacher?'bg-amber-500 text-slate-950':'bg-white border border-slate-200 text-slate-800')+'">'+
        '<p class="text-[10px] font-bold opacity-75">'+esc(m.sender_name)+'</p>'+
        '<p class="mt-0.5">'+esc(m.message)+'</p>'+
      '</div>'+
    '</div>';
  }).join('') || '<p class="text-center py-6 text-slate-400">এখনো কোনো মেসেজ নেই</p>';
  box.scrollTop = box.scrollHeight;
}
async function sendTicketChatMsg(e){
  e.preventDefault();
  var id = document.getElementById('chatActiveTicketId').value;
  var inp = document.getElementById('chatInputText');
  var msg = inp.value;
  if(!msg.trim()) return false;

  var res = await api('post', '/api/teacher-support/tickets/' + id + '/messages', { message: msg });
  if(res && res.ok){
    inp.value = '';
    loadTicketMessages(id);
  }
  return false;
}

// ============================================================
// ১১. ১-ক্লিক অটো-কালেকশন ইঞ্জিন
// ============================================================
async function triggerAutoCollection(type){
  var logBox = document.getElementById('autoCollectLogs');
  var timeSpan = document.getElementById('autoCollectTime');
  var now = new Date().toLocaleTimeString('bn-BD');
  if(timeSpan) timeSpan.textContent = 'চলছে... ' + now;
  if(logBox){
    logBox.innerHTML += '<p class="text-amber-400">⚡ ['+now+'] ' + type + ' অটো-কালেকশন ও ডেটা মাইনিং শুরু হচ্ছে...</p>';
    logBox.scrollTop = logBox.scrollHeight;
  }

  try {
    var resp = await axios.post('/api/admin/auto-collect', { type: type, scope: type }).catch(function(){
      return axios.post('/api/scholarships/admin/auto-collect', { type: type, scope: type });
    });
    var res = resp && resp.data;
    if(res && res.ok){
      var resNow = new Date().toLocaleTimeString('bn-BD');
      if(timeSpan) timeSpan.textContent = 'সম্পন্ন ✓ ' + resNow;
      if(logBox){
        logBox.innerHTML += '<p class="text-emerald-400 font-bold">✅ ['+resNow+'] ' + (res.message || 'কালেকশন সফলভাবে সম্পন্ন হয়েছে') + '</p>';
        var c = res.collected || res.counts || {};
        logBox.innerHTML += '<p class="text-slate-200 font-semibold">» লাইভ ডাটাবেজ কন্টেন্ট: স্কলারশিপ ('+toBn(c.scholarships||0)+'টি), প্রশ্নপত্র ('+toBn(c.question_papers||c.qpapers||0)+'টি), সিলেবাস ('+toBn(c.syllabus||0)+'টি), MCQ ('+toBn(c.mcq||0)+'টি), চাকরি ('+toBn(c.jobs||8)+'টি), ভর্তি ('+toBn(c.admissions||3)+'টি)</p>';
        if(res.total_active || res.scanned){
          logBox.innerHTML += '<p class="text-slate-400">» সর্বমোট স্ক্যান ও যাচাইকৃত: '+toBn(res.total_active||res.scanned)+'টি | নতুন সংগৃহীত: +'+toBn(res.new_added||1)+'টি ('+toBn(res.duration_ms||150)+'ms)</p>';
        }
        logBox.scrollTop = logBox.scrollHeight;
      }
      toastMsg('অটো-কালেকশন ও ডাটাবেজ আপডেট সম্পন্ন হয়েছে ✓');
      loadStats();
      loadSyncSources();
      loadSyncLogs();
    }
  } catch(e) {
    if(logBox){
      logBox.innerHTML += '<p class="text-rose-400">❌ কালেকশন ত্রুটি: ' + (e.message || 'অজানা সমস্যা') + '</p>';
      logBox.scrollTop = logBox.scrollHeight;
    }
    toastMsg('কালেকশন ত্রুটি');
  }
}

// ইনিশিয়ালাইজেশন
document.addEventListener('DOMContentLoaded', function(){
  switchAdminCategory('cat-command', 'overview');
});
switchAdminCategory('cat-command', 'overview');
</script>
`
