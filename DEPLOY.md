# 🚀 ডিপ্লয় রানবুক — এডুসব

**তারিখ:** ১০/০৯/২০২৬
**কমিট:** `6d98a50` — *fix(security,perf,ux): অডিট-ভিত্তিক P0 ফিক্স + পারফরম্যান্স ও ডিজাইন সিস্টেম*

---

## ১. বর্তমান অবস্থা

| কাজ | অবস্থা |
|---|---|
| সব পরিবর্তন কমিট | ✅ **হয়েছে** (`6d98a50`) |
| GitHub-এ পুশ | ❌ **হয়নি** — আমার কাছে ক্রেডেনশিয়াল নেই |
| ক্লাউডফ্লেয়ারে ডিপ্লয় | ❌ **হয়নি** — API টোকেন নেই + wrangler-এর Node ২২ দরকার (এখানে ২০) |
| প্রোডাকশন বিল্ড টেস্ট | ✅ **পাস** (`npm run build` → `dist` ২.৫ MB, সব অ্যাসেট ঠিকঠাক) |
| নতুন D1 মাইগ্রেশন | ✅ **লাগবে না** — `feed_cache` টেবিল `0002` থেকেই আছে |

> **ভালো খবর:** আপনার ক্লাউডফ্লেয়ার Pages **গিট-কানেক্টেড** (শেষ কমিটেই GitHub Actions ওয়ার্কফ্লো মুছে "Cloudflare git-connected deploy handles it" লেখা হয়েছে)।
> মানে **main-এ পুশ করলেই অটো-ডিপ্লয় শুরু হবে।** আলাদা করে কিছু চালাতে হবে না।

---

## ২. পুশ করার ৩টি উপায়

### উপায় ১ — এই ওয়ার্কস্পেস থেকে (সবচেয়ে সহজ)

আপনার GitHub পার্সোনাল অ্যাক্সেস টোকেন (PAT, scope: `repo`) দিয়ে:

```bash
cd /home/user/EduSob
git push https://<YOUR_USERNAME>:<YOUR_PAT>@github.com/myofficialwebsite/EduSob.git main
```

⚠️ টোকেনটি আমাকে দেবেন না — নিজের টার্মিনালে চালাবেন, অথবা নিচের উপায় ২/৩ ব্যবহার করুন।

### উপায় ২ — প্যাচ ফাইল (আমার কাছ থেকে নিয়ে নিজের মেশিনে)

`/home/user/edusob-audit-fixes.patch` (৬৭৫ KB, বাইনারি অ্যাসেটসহ) ডাউনলোড করে:

```bash
cd /path/to/EduSob
git am edusob-audit-fixes.patch     # অথবা: git apply --binary edusob-audit-fixes.patch
git push origin main
```

### উপায় ৩ — এই ওয়ার্কস্পেসেই পুশ (আমি করতে পারি না, আপনি পারবেন)

```bash
cd /home/user/EduSob
git push origin main    # username/password বা PAT চাইবে
```

---

## ৩. পুশের পর কী ঘটবে

1. GitHub-এ কমিট যাবে → **Cloudflare Pages অটো-বিল্ড শুরু করবে**
2. বিল্ড কমান্ড: `npm run build` (= `build:css` + `vite build`)
3. `dist/` → Pages-এ ডিপ্লয়
4. লাইভ: **https://edusob.pages.dev**

**বিল্ড ফেইল করলে** (Node ভার্সন জনিত): ক্লাউডফ্লেয়ার ড্যাশবোর্ড → Settings → Environment variables → `NODE_VERSION = 22` যোগ করুন।

---

## ৪. ডিপ্লয়ের পর যাচাই (৫ মিনিট)

```bash
# ১. সাইট উঠেছে?
curl -sI https://edusob.pages.dev | head -3

# ২. সেলফ-হোস্টেড ফন্ট লোড হচ্ছে?
curl -sI https://edusob.pages.dev/static/fonts/hind-siliguri-400-bengali.woff2 | head -1

# ৩. FontAwesome সাবসেট?
curl -sI https://edusob.pages.dev/static/icons-fa/fa-solid-900.woff2 | head -1

# ৪. WebP হিরো?
curl -sI https://edusob.pages.dev/static/img/hero-students.webp | head -1
```

ব্রাউজারে চেক করুন:

| যাচাই | প্রত্যাশিত |
|---|---|
| DevTools → Network → 3rd-party | **googleapis / gstatic / jsdelivr → কিছুই নেই** |
| `/dashboard` | সিরিফ নাম + ধর্ম-থিম (☪🟠 / ॐ🟡 / ☸🌹 / ✝🔵) |
| `/dashboard` → Console | কোনো error নেই; Network-এ ভাঙা `<img>` নেই |
| `/admin` | উপরে **"অ্যাডমিন ওভারভিউ"** H1 + **আজকের কাজ** চিপস + ট্রেন্ড |
| `/qpapers`, `/syllabus` | কপি/ডাউনলোড বাটন কাজ করছে (আগে পুরো ভাঙা ছিল) |
| `/results` | ১–২ সেকেন্ডেই লোড; ব্যাজগুলো দ্রুত আসে |
| মোবাইল (৩৯০px) | কোনো পেজেই ডানে স্ক্রল নেই |

**ফোনটিক্যাশ:** D1 ক্যাশ ৫ মিনিট TTL — প্রথমবার `/results` একটু ধীর হতে পারে, এরপর দ্রুত।

---

## ৫. ⚠️ আমি করতে পারিনি — আপনাকেই করতে হবে

### 🔴 অবিলম্বে (সিকিউরিটি)

1. **এডমিন পাসওয়ার্ড বদল**
   `Ab52944820@` গিট হিস্ট্রিতে পাবলিক (`migrations/0010_admin_account.sql` + `src/lib/db.ts` + `src/routes/api.ts`)।
   আমার ফিক্সের ফলে এখন রিসেট **টিকবে** (আগে টিকতো না)।
   → লগইন → `/admin` → Users → Reset Password

2. **হার্ডকোডেড এডমিন ইমেইল বদল**
   `src/routes/api.ts`-এ `ab5353069@gmail.com` — লগইনে যেকোনো অ্যাডমিন অ্যাকাউন্টে ম্যাপ করে।

3. **গিট হিস্টরি পরিষ্কার** (পাসওয়ার্ড + রিয়েল ইউজারের পাসওয়ার্ড-হ্যাশ মুছতে)
   ```bash
   pip install git-filter-repo      # অথবা: brew install git-filter-repo
   git filter-repo --path data/ --path cookies.txt --invert-paths --force
   git push --force origin main
   ```
   ⚠️ এটি হিস্ট্রি রিরাইট করে — **আগে ব্যাকআপ নিন**। সব ক্লোন আবার করতে হবে।

4. **D1 রিমোট ব্যাকআপ**
   ```bash
   npx wrangler d1 export edusob-production --remote --output backup-$(date +%F).sql
   ```

### 🟠 পরবর্তী (আমি করব, আপনি বললে)

- লগইন রেট-লিমিট (৫ বার / ১৫ মিনিট)
- `GET /api/tools/mcq/quiz`-এ অথ-গার্ড — প্রশ্নব্যাংক এখন লগইন ছাড়াই স্ক্র্যাপ করা যায়
- CSRF টোকেন
- কনভার্সন: প্রশ্নপত্র লকে আপসেল CTA, অনবোর্ডিং চেকলিস্ট
- ধর্ম-থিম ডিপেনিং: সেহরি/ইফতার, পূজা ক্যালেন্ডার, বুদ্ধ পূর্ণিমা

---

## ৬. রিগ্রেশন টুলস (কমিট করা হয়েছে)

```bash
# সব রাউটের ইনলাইন <script> সিনট্যাক্স চেক — /qpapers-এর মতো ক্র্যাশ আগেই ধরবে
node scan-inline-js.mjs <SESSION_TOKEN>

# ২৬ রাউট × ২ ভিউপোর্ট: overflow, console error, page weight, H1
npm i -D playwright-core && npx playwright install chromium
node audit-sweep.mjs <SESSION_TOKEN>

# অ্যাসেট রি-জেনারেট (ফন্ট/আইকন/ইমেজ বদলালে)
node scripts/optimize-fonts.mjs      # প্রয়োজন: pyftsubset (pip install fonttools brotli)
node scripts/optimize-icons.mjs      # প্রয়োজন: npm i @fortawesome/fontawesome-free
python3 scripts/optimize-images.py   # প্রয়োজন: pip install pillow
```

---

## ৭. রোলব্যাক

```bash
git revert 6d98a50      # অথবা: git reset --hard a120e60 && git push --force
```

⚠️ `git reset --hard` হিস্ট্রি মুছে দেয় — সতর্কতার সাথে ব্যবহার করুন।
