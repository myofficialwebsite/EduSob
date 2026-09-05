// এডুসব — প্রোফাইল পেজ: ফর্ম + কপি প্যানেল + ছবি/স্বাক্ষর অটো-রিসাইজ
import { pageShell } from './layout'
import type { SessionUser } from '../lib/auth'

export function profilePage(user: SessionUser): string {
  return pageShell('আমার প্রোফাইল', 'bg-slate-950 text-white min-h-screen', `
<header class="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
  <nav class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
    <a href="/" class="flex items-center gap-2 font-bold text-xl"><span class="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">📚</span> এডুসব</a>
    <div class="flex items-center gap-2 text-sm">
      <a href="/dashboard" class="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 transition"><i class="fas fa-table-columns mr-1"></i> ড্যাশবোর্ড</a>
    </div>
  </nav>
</header>

<main class="max-w-6xl mx-auto px-4 py-8">
  <header class="mb-6">
    <h1 class="text-2xl font-bold">🪪 আমার প্রোফাইল</h1>
    <p class="text-slate-400 text-sm mt-1">একবার পূরণ করুন — সব আবেদনে কপি প্যানেল থেকে এক-ক্লিক কপি + ছবি/স্বাক্ষর রেডি সাইজে</p>
  </header>

  <div class="grid lg:grid-cols-3 gap-6">
    <!-- বাম: ফর্ম -->
    <form id="profileForm" class="lg:col-span-2 space-y-5">
      <section class="bg-slate-900 border border-white/10 rounded-2xl p-5">
        <h2 class="font-bold mb-4 text-emerald-400"><i class="fas fa-user mr-2"></i>ব্যক্তিগত তথ্য</h2>
        <div class="grid sm:grid-cols-2 gap-3 text-sm">
          <div><label class="text-xs text-slate-400">নাম (বাংলা)</label><input name="name_bn" value="${user.name_bn}" class="inp"></div>
          <div><label class="text-xs text-slate-400">Name (English)</label><input name="name_en" value="${user.name_en ?? ''}" class="inp"></div>
          <div><label class="text-xs text-slate-400">বর্তমান শিক্ষাস্তর <span class="text-emerald-400">(পরিবর্তনযোগ্য)</span></label>
            <select name="education_level" class="inp">${[['ssc', 'SSC / সমমান'], ['hsc', 'HSC / সমমান'], ['nu', 'অনার্স / ডিগ্রি (NU)'], ['masters', 'মাস্টার্স'], ['other', 'অন্যান্য']].map(([v, l]) => `<option value="${v}"${(user as any).education_level === v ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
          <div><label class="text-xs text-slate-400">পিতার নাম (বাংলা)</label><input name="father_bn" class="inp"></div>
          <div><label class="text-xs text-slate-400">Father's Name (English)</label><input name="father_en" class="inp"></div>
          <div><label class="text-xs text-slate-400">মাতার নাম (বাংলা)</label><input name="mother_bn" class="inp"></div>
          <div><label class="text-xs text-slate-400">Mother's Name (English)</label><input name="mother_en" class="inp"></div>
          <div><label class="text-xs text-slate-400">জন্ম তারিখ</label><input name="dob" type="date" class="inp"></div>
          <div><label class="text-xs text-slate-400">NID নম্বর</label><input name="nid" class="inp"></div>
          <div><label class="text-xs text-slate-400">জন্ম নিবন্ধন নম্বর</label><input name="birth_reg" class="inp"></div>
          <div><label class="text-xs text-slate-400">রক্তের গ্রুপ</label>
            <select name="blood_group" class="inp"><option value="">—</option>${['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => `<option>${b}</option>`).join('')}</select></div>
          <div><label class="text-xs text-slate-400">লিঙ্গ</label>
            <select name="gender" class="inp"><option value="">—</option><option value="male">পুরুষ</option><option value="female">নারী</option><option value="other">অন্যান্য</option></select></div>
          <div><label class="text-xs text-slate-400">ইমেইল</label><input name="email" type="email" value="${user.email ?? ''}" class="inp"></div>
        </div>
      </section>

      <section class="bg-slate-900 border border-white/10 rounded-2xl p-5">
        <h2 class="font-bold mb-4 text-emerald-400"><i class="fas fa-location-dot mr-2"></i>ঠিকানা</h2>
        <div class="grid sm:grid-cols-2 gap-3 text-sm">
          <div><label class="text-xs text-slate-400">গ্রাম/মহল্লা</label><input name="village" class="inp"></div>
          <div><label class="text-xs text-slate-400">ডাকঘর</label><input name="post_office" class="inp"></div>
          <div><label class="text-xs text-slate-400">উপজেলা</label><input name="upazila" class="inp"></div>
          <div><label class="text-xs text-slate-400">জেলা</label><input name="district" class="inp"></div>
        </div>
      </section>

      <section class="bg-slate-900 border border-white/10 rounded-2xl p-5">
        <h2 class="font-bold mb-4 text-emerald-400"><i class="fas fa-graduation-cap mr-2"></i>শিক্ষাগত তথ্য</h2>
        <div class="grid sm:grid-cols-2 gap-3 text-sm">
          <div class="sm:col-span-2 grid grid-cols-2 gap-3">
            <div><label class="text-xs text-slate-400">স্কুলের নাম</label><input name="school_name" class="inp"></div>
            <div><label class="text-xs text-slate-400">কলেজের নাম</label><input name="college_name" class="inp"></div>
          </div>
          <fieldset class="border border-white/10 rounded-xl p-3">
            <legend class="text-xs text-emerald-300 px-2">SSC</legend>
            <div class="grid grid-cols-2 gap-2">
              <input name="ssc_board" placeholder="বোর্ড" class="inp">
              <input name="ssc_year" placeholder="সন" class="inp">
              <input name="ssc_roll" placeholder="রোল" class="inp">
              <input name="ssc_reg" placeholder="রেজিস্ট্রেশন" class="inp">
              <input name="ssc_gpa" placeholder="GPA" class="inp col-span-2">
            </div>
          </fieldset>
          <fieldset class="border border-white/10 rounded-xl p-3">
            <legend class="text-xs text-emerald-300 px-2">HSC</legend>
            <div class="grid grid-cols-2 gap-2">
              <input name="hsc_board" placeholder="বোর্ড" class="inp">
              <input name="hsc_year" placeholder="সন" class="inp">
              <input name="hsc_roll" placeholder="রোল" class="inp">
              <input name="hsc_reg" placeholder="রেজিস্ট্রেশন" class="inp">
              <input name="hsc_gpa" placeholder="GPA" class="inp col-span-2">
            </div>
          </fieldset>
          <fieldset class="border border-white/10 rounded-xl p-3 sm:col-span-2">
            <legend class="text-xs text-emerald-300 px-2">জাতীয় বিশ্ববিদ্যালয় (প্রযোজ্য হলে)</legend>
            <div class="grid sm:grid-cols-3 gap-2">
              <input name="nu_reg" placeholder="NU রেজিস্ট্রেশন" class="inp">
              <input name="nu_college" placeholder="কলেজ" class="inp">
              <input name="nu_subject" placeholder="বিষয়" class="inp">
            </div>
          </fieldset>
        </div>
      </section>

      <section class="bg-slate-900 border border-white/10 rounded-2xl p-5">
        <h2 class="font-bold mb-1 text-emerald-400"><i class="fas fa-image mr-2"></i>ছবি ও স্বাক্ষর</h2>
        <p class="text-xs text-slate-400 mb-4">একবার আপলোড করুন — নিচের রিসাইজ টুল দিয়ে যেকোনো আবেদনের সাইজে নামিয়ে নিন</p>
        <div class="grid sm:grid-cols-2 gap-4">
          <div class="text-center">
            <div id="photoPreview" class="w-32 h-32 mx-auto bg-slate-800 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center text-slate-500 overflow-hidden"><i class="fas fa-user text-3xl"></i></div>
            <label class="inline-block mt-3 text-xs bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 px-4 py-2 rounded-xl cursor-pointer transition">
              <i class="fas fa-upload mr-1"></i> ছবি আপলোড <input type="file" id="photoInput" accept="image/*" class="hidden">
            </label>
          </div>
          <div class="text-center">
            <div id="signPreview" class="w-48 h-16 mx-auto mt-8 bg-slate-800 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center text-slate-500 overflow-hidden"><i class="fas fa-signature text-2xl"></i></div>
            <label class="inline-block mt-3 text-xs bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 px-4 py-2 rounded-xl cursor-pointer transition">
              <i class="fas fa-upload mr-1"></i> স্বাক্ষর আপলোড <input type="file" id="signInput" accept="image/*" class="hidden">
            </label>
          </div>
        </div>
      </section>

      <button type="submit" id="saveBtn" class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 font-bold py-3.5 rounded-xl shadow-lg hover:opacity-90 transition">
        <i class="fas fa-floppy-disk mr-2"></i>প্রোফাইল সেভ করুন
      </button>
      <p id="saveMsg" class="hidden text-center text-sm rounded-xl px-4 py-2"></p>
    </form>

    <!-- ডান: কপি প্যানেল + রিসাইজ টুল -->
    <aside class="space-y-5">
      <section class="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 sticky top-20">
        <h2 class="font-bold mb-1 text-emerald-400"><i class="fas fa-copy mr-2"></i>কপি প্যানেল</h2>
        <p class="text-xs text-slate-400 mb-4">যেকোনো আবেদন ফর্মে এক-ক্লিক কপি-পেস্ট</p>
        <div id="copyPanel" class="space-y-2 text-sm max-h-72 overflow-y-auto pr-1">
          <p class="text-slate-500 text-center py-4 text-xs">প্রোফাইল পূরণ করে সেভ করলে এখানে কপি বাটন আসবে</p>
        </div>

        <hr class="border-white/10 my-4">
        <h2 class="font-bold mb-1 text-emerald-400"><i class="fas fa-crop-simple mr-2"></i>ছবি/স্বাক্ষর রিসাইজ</h2>
        <p class="text-xs text-slate-400 mb-3">আবেদনের নির্ধারিত সাইজে ডাউনলোড</p>
        <div class="space-y-2 text-xs">
          <div class="grid grid-cols-2 gap-2">
            <button onclick="resizeAndDownload('photo',300,300)" class="rsz">ছবি ৩০০×৩০০<br><span class="opacity-60">(টেলিটক আবেদন)</span></button>
            <button onclick="resizeAndDownload('photo',200,200)" class="rsz">ছবি ২০০×২০০</button>
            <button onclick="resizeAndDownload('sign',300,80)" class="rsz">স্বাক্ষর ৩০০×৮০<br><span class="opacity-60">(টেলিটক আবেদন)</span></button>
            <button onclick="resizeAndDownload('sign',250,60)" class="rsz">স্বাক্ষর ২৫০×৬০</button>
          </div>
          <div class="flex gap-2 items-center bg-white/5 rounded-xl p-2">
            <input id="cw" type="number" placeholder="প্রস্থ" class="inp !mt-0 w-full text-center">
            <span class="text-slate-500">×</span>
            <input id="ch" type="number" placeholder="উচ্চতা" class="inp !mt-0 w-full text-center">
            <select id="ctype" class="inp !mt-0"><option value="photo">ছবি</option><option value="sign">সাইন</option></select>
            <button type="button" onclick="customResize()" class="bg-emerald-500 px-3 py-2 rounded-lg font-bold whitespace-nowrap">যান</button>
          </div>
        </div>
      </section>
    </aside>
  </div>
</main>

<style>
.inp{width:100%;margin-top:.25rem;background:#1e293b;border:1px solid rgba(255,255,255,.12);border-radius:.75rem;padding:.6rem .8rem;color:#fff;font-size:.85rem;outline:none}
.inp:focus{border-color:#34d399}
.rsz{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:.75rem;padding:.6rem;transition:all .2s;line-height:1.3}
.rsz:hover{background:rgba(52,211,153,.15);border-color:rgba(52,211,153,.4)}
</style>

<script>
let photoData = null, signData = null;

// ---------- ইমেজ লোড + কমপ্রেস (ক্লায়েন্ট-সাইড) ----------
function loadImage(file, maxDim, cb){
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (Math.max(w, h) > maxDim) { const sc = maxDim / Math.max(w, h); w = Math.round(w*sc); h = Math.round(h*sc); }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      cb(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

document.getElementById('photoInput').addEventListener('change', e => {
  if (!e.target.files[0]) return;
  loadImage(e.target.files[0], 600, data => {
    photoData = data;
    document.getElementById('photoPreview').innerHTML = '<img src="'+data+'" class="w-full h-full object-cover">';
  });
});
document.getElementById('signInput').addEventListener('change', e => {
  if (!e.target.files[0]) return;
  loadImage(e.target.files[0], 600, data => {
    signData = data;
    document.getElementById('signPreview').innerHTML = '<img src="'+data+'" class="w-full h-full object-contain bg-white">';
  });
});

// ---------- রিসাইজ + ডাউনলোড ----------
function resizeAndDownload(type, w, h){
  const src = type === 'photo' ? photoData : signData;
  if (!src) { alert(type === 'photo' ? 'আগে ছবি আপলোড করুন' : 'আগে স্বাক্ষর আপলোড করুন'); return; }
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
    // cover-fit ক্রপ
    const sc = Math.max(w / img.width, h / img.height);
    const sw = w / sc, sh = h / sc;
    const sx = (img.width - sw) / 2, sy = (img.height - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/jpeg', 0.9);
    a.download = 'edusob_' + type + '_' + w + 'x' + h + '.jpg';
    a.click();
  };
  img.src = src;
}
function customResize(){
  const w = +document.getElementById('cw').value, h = +document.getElementById('ch').value;
  if (!w || !h || w < 10 || h < 10 || w > 2000 || h > 2000) { alert('সঠিক সাইজ দিন (১০–২০০০ px)'); return; }
  resizeAndDownload(document.getElementById('ctype').value, w, h);
}

// ---------- প্রোফাইল লোড ----------
const COPY_LABELS = {
  name_bn:'নাম (বাংলা)', name_en:'Name (English)', father_bn:'পিতার নাম', father_en:"Father's Name",
  mother_bn:'মাতার নাম', mother_en:"Mother's Name", dob:'জন্ম তারিখ', nid:'NID', birth_reg:'জন্ম নিবন্ধন',
  blood_group:'রক্তের গ্রুপ', village:'গ্রাম', post_office:'ডাকঘর', upazila:'উপজেলা', district:'জেলা',
  school_name:'স্কুল', college_name:'কলেজ',
  ssc_board:'SSC বোর্ড', ssc_roll:'SSC রোল', ssc_reg:'SSC রেজি.', ssc_year:'SSC সন', ssc_gpa:'SSC GPA',
  hsc_board:'HSC বোর্ড', hsc_roll:'HSC রোল', hsc_reg:'HSC রেজি.', hsc_year:'HSC সন', hsc_gpa:'HSC GPA',
  nu_reg:'NU রেজি.', nu_college:'NU কলেজ', nu_subject:'NU বিষয়'
};

function renderCopyPanel(data){
  const items = Object.entries(COPY_LABELS).filter(([k]) => data[k]);
  const panel = document.getElementById('copyPanel');
  if (!items.length) { panel.innerHTML = '<p class="text-slate-500 text-center py-4 text-xs">প্রোফাইল পূরণ করে সেভ করলে এখানে কপি বাটন আসবে</p>'; return; }
  panel.innerHTML = items.map(([k, label]) => \`
    <div class="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
      <div class="flex-1 min-w-0"><p class="text-[10px] text-slate-400">\${label}</p><p class="truncate text-xs font-semibold">\${data[k]}</p></div>
      <button type="button" onclick="copyVal(this, '\${k}')" data-val="\${String(data[k]).replace(/"/g,'&quot;')}" class="text-xs bg-emerald-500/20 hover:bg-emerald-500/50 text-emerald-300 px-2.5 py-1.5 rounded-lg transition"><i class="fas fa-copy"></i></button>
    </div>\`).join('');
}
async function copyVal(btn){
  await navigator.clipboard.writeText(btn.dataset.val);
  btn.innerHTML = '<i class="fas fa-check"></i>';
  setTimeout(() => btn.innerHTML = '<i class="fas fa-copy"></i>', 1200);
}

async function loadProfile(){
  try {
    const r = await axios.get('/api/profile');
    const p = r.data.profile || {};
    const f = document.getElementById('profileForm');
    for (const [k, v] of Object.entries(p)) {
      if (f[k] !== undefined && v != null && k !== 'photo_data' && k !== 'sign_data') f[k].value = v;
    }
    if (p.photo_data) { photoData = p.photo_data; document.getElementById('photoPreview').innerHTML = '<img src="'+p.photo_data+'" class="w-full h-full object-cover">'; }
    if (p.sign_data) { signData = p.sign_data; document.getElementById('signPreview').innerHTML = '<img src="'+p.sign_data+'" class="w-full h-full object-contain bg-white">'; }
    renderCopyPanel({ ...p, name_bn: f.name_bn.value, name_en: f.name_en.value });
  } catch(e){ console.error(e); }
}
loadProfile();

// ---------- সেভ ----------
document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('saveBtn'), msg = document.getElementById('saveMsg');
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>সেভ হচ্ছে...';
  const data = Object.fromEntries(new FormData(e.target));
  if (photoData) data.photo_data = photoData;
  if (signData) data.sign_data = signData;
  try {
    await axios.put('/api/profile', data);
    msg.textContent = '✅ প্রোফাইল সেভ হয়েছে!';
    msg.className = 'text-center text-sm rounded-xl px-4 py-2 bg-emerald-500/20 text-emerald-300';
    renderCopyPanel(data);
  } catch(ex) {
    msg.textContent = '❌ ' + (ex.response?.data?.error || 'সমস্যা হয়েছে');
    msg.className = 'text-center text-sm rounded-xl px-4 py-2 bg-rose-500/20 text-rose-300';
  }
  msg.classList.remove('hidden');
  btn.disabled = false; btn.innerHTML = '<i class="fas fa-floppy-disk mr-2"></i>প্রোফাইল সেভ করুন';
  setTimeout(() => msg.classList.add('hidden'), 4000);
});
</script>
`)
}
