// এডুসব — সাইন-আপ ও লগইন পেজ
import { pageShell } from './layout'

export function signupPage(): string {
  return pageShell('সাইন-আপ', 'min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white', `
<main class="min-h-screen flex items-center justify-center px-4 py-10">
  <section id="signup-card" class="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
    <header class="text-center mb-6">
      <a href="/" class="inline-flex items-center gap-2 text-2xl font-bold"><span class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">📚</span> এডুসব</a>
      <p class="text-emerald-200 text-sm mt-2">ফ্রি অ্যাকাউন্ট খুলুন — শিক্ষার সব, এক ঠিকানায়!</p>
    </header>
    <form id="signupForm" class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div class="col-span-2 sm:col-span-1">
          <label class="text-xs text-emerald-200">নাম (বাংলা) *</label>
          <input name="name_bn" required class="w-full mt-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400" placeholder="যেমন: রাকিব হাসান">
        </div>
        <div class="col-span-2 sm:col-span-1">
          <label class="text-xs text-emerald-200">Name (English)</label>
          <input name="name_en" class="w-full mt-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400" placeholder="Rakib Hasan">
        </div>
      </div>
      <div>
        <label class="text-xs text-emerald-200">মোবাইল নম্বর *</label>
        <input name="phone" required pattern="01[3-9][0-9]{8}" class="w-full mt-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400" placeholder="01XXXXXXXXX">
      </div>
      <div>
        <label class="text-xs text-emerald-200">পাসওয়ার্ড * (কমপক্ষে ৬ অক্ষর)</label>
        <input name="password" type="password" required minlength="6" class="w-full mt-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400" placeholder="••••••">
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs text-emerald-200">ধর্ম * <span class="opacity-60">(আপনার ড্যাশবোর্ড থিম)</span></label>
          <select name="religion" class="w-full mt-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-400 [&>option]:text-slate-900">
            <option value="islam">ইসলাম</option>
            <option value="sanatan">সনাতন</option>
            <option value="buddhist">বৌদ্ধ</option>
            <option value="christian">খ্রিস্টান</option>
            <option value="other">অন্যান্য</option>
          </select>
        </div>
        <div>
          <label class="text-xs text-emerald-200">শিক্ষাস্তর</label>
          <select name="education_level" class="w-full mt-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-400 [&>option]:text-slate-900">
            <option value="">নির্বাচন করুন</option>
            <option value="ssc">SSC / সমমান</option>
            <option value="hsc">HSC / সমমান</option>
            <option value="nu">অনার্স / ডিগ্রি (NU)</option>
            <option value="masters">মাস্টার্স</option>
            <option value="other">অন্যান্য</option>
          </select>
        </div>
      </div>
      <div>
        <label class="text-xs text-emerald-200">রেফারেল কোড <span class="opacity-60">(ঐচ্ছিক — বন্ধুর ইউজার আইডি দিলে দুজনেই বোনাস! 🎁)</span></label>
        <input name="referral_code" id="refCodeInput" class="w-full mt-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 uppercase" placeholder="EDU-2026-00001">
      </div>
      <p id="signupError" class="hidden text-rose-300 text-sm bg-rose-500/20 rounded-xl px-4 py-2"></p>
      <button type="submit" id="signupBtn" class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-3 rounded-xl shadow-lg transition">
        <i class="fas fa-user-plus mr-2"></i>ফ্রি অ্যাকাউন্ট খুলুন
      </button>
    </form>
    <p class="text-center text-sm text-emerald-200 mt-5">ইতিমধ্যে অ্যাকাউন্ট আছে? <a href="/login" class="text-white font-semibold underline">লগইন করুন</a></p>
  </section>
</main>
<script>
// ?ref=EDU-XXXX-XXXXX লিংক থেকে রেফারেল কোড অটো-ফিল
(function(){
  var ref = new URLSearchParams(location.search).get('ref');
  if (ref) document.getElementById('refCodeInput').value = ref.toUpperCase();
})();
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('signupBtn'), err = document.getElementById('signupError');
  err.classList.add('hidden');
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>অ্যাকাউন্ট তৈরি হচ্ছে...';
  const data = Object.fromEntries(new FormData(e.target));
  try {
    const res = await axios.post('/api/auth/signup', data);
    if (res.data.ok) { window.location.href = res.data.redirect; return; }
  } catch (ex) {
    err.textContent = ex.response?.data?.error || 'সমস্যা হয়েছে, আবার চেষ্টা করুন';
    err.classList.remove('hidden');
  }
  btn.disabled = false; btn.innerHTML = '<i class="fas fa-user-plus mr-2"></i>ফ্রি অ্যাকাউন্ট খুলুন';
});
</script>
`)
}

export function loginPage(): string {
  return pageShell('লগইন', 'min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white', `
<main class="min-h-screen flex items-center justify-center px-4 py-10">
  <section id="login-card" class="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
    <header class="text-center mb-6">
      <a href="/" class="inline-flex items-center gap-2 text-2xl font-bold"><span class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">📚</span> এডুসব</a>
      <p class="text-emerald-200 text-sm mt-2">আবার স্বাগতম! লগইন করুন</p>
    </header>
    <form id="loginForm" class="space-y-4">
      <div>
        <label class="text-xs text-emerald-200">মোবাইল নম্বর</label>
        <input name="phone" required class="w-full mt-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400" placeholder="01XXXXXXXXX">
      </div>
      <div>
        <label class="text-xs text-emerald-200">পাসওয়ার্ড</label>
        <input name="password" type="password" required class="w-full mt-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400" placeholder="••••••">
      </div>
      <p id="loginError" class="hidden text-rose-300 text-sm bg-rose-500/20 rounded-xl px-4 py-2"></p>
      <button type="submit" id="loginBtn" class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-3 rounded-xl shadow-lg transition">
        <i class="fas fa-right-to-bracket mr-2"></i>লগইন
      </button>
    </form>
    <p class="text-center text-sm text-emerald-200 mt-5">অ্যাকাউন্ট নেই? <a href="/signup" class="text-white font-semibold underline">ফ্রি সাইন-আপ করুন</a></p>
  </section>
</main>
<script>
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('loginBtn'), err = document.getElementById('loginError');
  err.classList.add('hidden');
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>লগইন হচ্ছে...';
  const data = Object.fromEntries(new FormData(e.target));
  try {
    const res = await axios.post('/api/auth/login', data);
    if (res.data.ok) { window.location.href = res.data.redirect; return; }
  } catch (ex) {
    err.textContent = ex.response?.data?.error || 'সমস্যা হয়েছে, আবার চেষ্টা করুন';
    err.classList.remove('hidden');
  }
  btn.disabled = false; btn.innerHTML = '<i class="fas fa-right-to-bracket mr-2"></i>লগইন';
});
</script>
`)
}
