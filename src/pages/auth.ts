// এডুসব — সাইন-আপ ও লগইন পেজ
import { pageShell } from './layout'

export function signupPage(): string {
  return pageShell('সাইন-আপ', 'min-h-screen bg-gradient-to-br from-orange-950 via-slate-900 to-orange-900 text-white', `
<main class="min-h-screen flex items-center justify-center px-4 py-10">
  <section id="signup-card" class="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
    <header class="text-center mb-6">
      <a href="/" class="inline-flex items-center gap-2 text-2xl font-bold"><span class="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">📚</span> এডুসব</a>
      <h1 class="text-orange-200 text-lg font-bold mt-2">ফ্রি অ্যাকাউন্ট খুলুন — শিক্ষার সব, এক ঠিকানায়!</h1>
    </header>
    <form id="signupForm" class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div class="col-span-2 sm:col-span-1">
          <label class="text-xs text-orange-200">নাম (বাংলা) *</label>
          <input name="name_bn" required autocomplete="name" class="w-full mt-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-orange-400" placeholder="যেমন: রাকিব হাসান">
        </div>
        <div class="col-span-2 sm:col-span-1">
          <label class="text-xs text-orange-200">Name (English)</label>
          <input name="name_en" autocomplete="name" class="w-full mt-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-orange-400" placeholder="Rakib Hasan">
        </div>
      </div>
      <div>
        <label class="text-xs text-orange-200">মোবাইল নম্বর *</label>
        <input name="phone" type="tel" inputmode="numeric" required pattern="01[3-9][0-9]{8}" autocomplete="tel" class="w-full mt-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-orange-400" placeholder="01XXXXXXXXX">
      </div>
      <div>
        <label class="text-xs text-orange-200">পাসওয়ার্ড * (কমপক্ষে ৬ অক্ষর)</label>
        <input name="password" type="password" required minlength="6" autocomplete="new-password" class="w-full mt-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-orange-400" placeholder="••••••">
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs text-orange-200">ধর্ম * <span class="opacity-60">(আপনার ড্যাশবোর্ড থিম)</span></label>
          <select name="religion" aria-label="ধর্ম" class="w-full mt-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-400 [&>option]:text-slate-900">
            <option value="islam">ইসলাম</option>
            <option value="sanatan">সনাতন</option>
            <option value="buddhist">বৌদ্ধ</option>
            <option value="christian">খ্রিস্টান</option>
            <option value="other">অন্যান্য</option>
          </select>
        </div>
        <div>
          <label class="text-xs text-orange-200">শিক্ষাস্তর</label>
          <select name="education_level" aria-label="শিক্ষাস্তর" class="w-full mt-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-orange-400 [&>option]:text-slate-900">
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
        <label class="text-xs text-orange-200">রেফারেল কোড <span class="opacity-60">(ঐচ্ছিক — বন্ধুর ইউজার আইডি দিলে দুজনেই বোনাস! 🎁)</span></label>
        <input name="referral_code" id="refCodeInput" class="w-full mt-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-orange-400 uppercase" placeholder="EDU-2026-00001">
      </div>
      <p id="signupError" class="hidden text-rose-300 text-sm bg-rose-500/20 rounded-xl px-4 py-2"></p>
      <button type="submit" id="signupBtn" class="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg transition">
        <i class="fas fa-user-plus mr-2"></i>ফ্রি অ্যাকাউন্ট খুলুন
      </button>
    </form>
    <p class="text-center text-sm text-orange-200 mt-5">ইতিমধ্যে অ্যাকাউন্ট আছে? <a href="/login" class="text-white font-semibold underline">লগইন করুন</a></p>
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
`, '', true, { description: 'এডুসবে ফ্রি অ্যাকাউন্ট খুলুন — রেজাল্ট, প্রশ্নব্যাংক, CV মেকার ও স্কলারশিপ এক ঠিকানায়।', path: '/signup', noindex: true })
}

export function loginPage(): string {
  return pageShell('লগইন', 'min-h-screen bg-gradient-to-br from-orange-950 via-slate-900 to-orange-900 text-white', `
<main class="min-h-screen flex items-center justify-center px-4 py-10">
  <section id="login-card" class="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
    <header class="text-center mb-6">
      <a href="/" class="inline-flex items-center gap-2 text-2xl font-bold"><span class="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">📚</span> এডুসব</a>
      <h1 class="text-orange-200 text-lg font-bold mt-2">আবার স্বাগতম! লগইন করুন</h1>
    </header>
    <form id="loginForm" class="space-y-4">
      <div>
        <label class="text-xs text-orange-200">মোবাইল নম্বর / ইমেইল / ইউজার আইডি</label>
        <input name="phone" id="loginPhoneInput" required autocomplete="username" class="w-full mt-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-orange-400 text-sm" placeholder="01XXXXXXXXX অথবা admin@edusob.com">
      </div>
      <div>
        <div class="flex items-center justify-between">
          <label class="text-xs text-orange-200">পাসওয়ার্ড</label>
        </div>
        <div class="relative mt-1">
          <input name="password" id="loginPassInput" type="password" required autocomplete="current-password" class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 pr-10 text-white placeholder-white/40 focus:outline-none focus:border-orange-400 text-sm" placeholder="••••••••">
          <button type="button" id="togglePassBtn" onclick="togglePassVisibility()" class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-orange-200/70 hover:text-white transition cursor-pointer" title="পাসওয়ার্ড দেখুন">
            <i id="togglePassIcon" class="fas fa-eye text-xs"></i>
          </button>
        </div>
      </div>
      <p id="loginError" class="hidden text-rose-300 text-sm bg-rose-500/20 rounded-xl px-4 py-2"></p>
      <button type="submit" id="loginBtn" class="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg transition cursor-pointer">
        <i class="fas fa-right-to-bracket mr-2"></i>লগইন করুন
      </button>
    </form>

    <p class="text-center text-sm text-orange-200 mt-5">অ্যাকাউন্ট নেই? <a href="/signup" class="text-white font-semibold underline">ফ্রি সাইন-আপ করুন</a></p>
  </section>
</main>
<script>
function togglePassVisibility() {
  const inp = document.getElementById('loginPassInput');
  const icon = document.getElementById('togglePassIcon');
  if (inp.type === 'password') {
    inp.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    inp.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('loginBtn'), err = document.getElementById('loginError');
  err.classList.add('hidden');
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>লগইন হচ্ছে...';
  const data = Object.fromEntries(new FormData(e.target));
  if (data.phone) data.phone = String(data.phone).trim();
  if (data.password) data.password = String(data.password).trim();
  try {
    const res = await axios.post('/api/auth/login', data);
    if (res.data.ok) {
      window.location.href = res.data.redirect;
      return;
    }
  } catch (ex) {
    err.textContent = ex.response?.data?.error || 'সমস্যা হয়েছে, আবার চেষ্টা করুন';
    err.classList.remove('hidden');
  }
  btn.disabled = false; btn.innerHTML = '<i class="fas fa-right-to-bracket mr-2"></i>লগইন করুন';
});
</script>
`, '', true, { description: 'এডুসব অ্যাকাউন্টে লগইন করুন।', path: '/login', noindex: true })
}
