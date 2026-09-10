# 🚀 ডিপ্লয় স্ট্যাটাস — ১০ সেপ্টেম্বর ২০২৬

**লাইভ URL:** https://edusob.pages.dev
**সর্বশেষ ডিপ্লয়:** `49ebad96` (production, branch `main`)
**GitHub `main`:** `11b2aad`
**D1 ব্যাকআপ:** `data/edusob-production-2026-09-10.sql` (৩৯৬ KB — গিট-ইগনোর করা, রিপোতে নেই)

---

## ১. কী কী পুশ ও ডিপ্লয় হলো

| কমিট | কী |
|---|---|
| `6d98a50` | অডিট-ভিত্তিক P0 ফিক্স: XSS, সেশন-ডিলিট বাগ, `'\n'` ক্র্যাশ, /results স্পিড, ডিজাইন সিস্টেম v2, মোবাইল ওভারফ্লো |
| `920b107` | `DEPLOY.md` রানবুক |
| `be49246` | ডেটাবেস/কুকিজ গিট-ট্র্যাকিং বন্ধ, অ্যাডমিন পাসওয়ার্ড-রিসেট বাগ ফিক্স, রিপোর্ট থেকে ক্রেডেনশিয়াল রিড্যাক্ট |
| `a121eb6` | সিকিউরিটি হেডার (`_headers`), স্ট্যাটিক ক্যাশিং, ডিপ্লয়-ওয়ার্কফ্লো টেমপ্লেট |
| `11b2aad` | SSR পেইজে সিকিউরিটি হেডার (ওয়ার্কার মিডলওয়্যার) |

> ⚠️ **পুশ ঠিকঠাক হয়েছে, কিন্তু Cloudflare স্বয়ংক্রিয়ভাবে বিল্ড করেনি।**
> কারণ: Pages-এর git-connected GitHub App ট্রিগার বন্ধ — `main`-এ পুশ যাচ্ছে (GitHub-এ `11b2aad` আছে),
> কিন্তু ২০২৬-০৯-০৯-এর পর আর একটাও `github:push` ডিপ্লয় তৈরি হয়নি।
> তাই আমি `wrangler pages deploy` দিয়ে **সরাসরি ডিপ্লয়** করেছি — প্রোডাকশন এখন সর্বশেষ কোডেই আছে।

---

## ২. প্রোডাকশনে যা যাচাই করা হয়েছে ✅

**রাউটসমূহ (সব HTTP 200)** — `/`, `/dashboard`, `/admin`, `/results`, `/qpapers`, `/syllabus`, `/wallet`, `/profile`, `/news`, `/jobs`, `/notices`, `/cv`, `/scholarships`

**ফিচার**

- `/qpapers` ও `/syllabus` — আগে `'\n'` ক্র্যাশে ৫০০ দিত, এখন ২০০ ✅
- `/api/admin/stats` → `stats.trends` (today/yesterday/delta) লাইভ ✅
- `/api/link-status/batch` → ক্যাশ কাজ করছে: ১ম কল `cached=0 checked=5`, ২য় কল `cached=5 checked=0` ✅
- D1 সংযুক্ত ও সাড়া দিচ্ছে (admin লগইন → `role: admin`) ✅

**কর্মদক্ষতা (প্রোডাকশন, ৫টি URL)**

| অবস্থা | সময় |
|---|---|
| কোল্ড (৫টি রিয়াল প্রোব) | ৩.৯৯ সে. |
| ওয়ার্ম (ক্যাশ থেকে) | **০.৩১–০.৬০ সে.** |

**নিরাপত্তা হেডার (লাইভ, সব SSR পেইজে)**

```
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
x-frame-options: SAMEORIGIN
permissions-policy: camera=(), microphone=(self), geolocation=(), interest-cohort=()
```

**কোনো CDN নির্ভরতা নেই** — `fonts.googleapis.com: 0`, `jsdelivr: 0`। ফন্ট ও আইকন সব সেলফ-হোস্টেড।

---

## ৩. পুশের আগে যা ঠিক করতে হয়েছিল (রিপো **পাবলিক**)

1. **`data/*.sqlite` ও `cookies.txt` গিটে ট্র্যাকড ছিল** — অর্থাৎ যে কেউ রিপো ক্লোন করলে লাইভ ইউজার-ডেটাবেস পেত।
   এখন `.gitignore`-এ আছে এবং ইনডেক্স থেকে সরানো হয়েছে (ফাইল ডিস্কে আছে, লোকাল ডেভ কাজ করবে)।
2. **অ্যাডমিন পাসওয়ার্ড-রিসেট বাগ** — `initDatabase()`-এর `else` শাখা প্রতিবার বুটে `WHERE role='admin'` দিয়ে সব অ্যাডমিনের পাসওয়ার্ড ওভাররাইট করতো। এখন শুধু নতুন ডেটাবেসে সিড হয়, বিদ্যমান অ্যাডমিনের পাসওয়ার্ড আর ছোঁয় না।
3. **`AUDIT_REPORT.md`-এ প্লেইন-টেক্সট পাসওয়ার্ড** — আমি নিজে লিখেছিলাম, রিড্যাক্ট করা হয়েছে।

---

## ৪. 🔴 আপনাকেই করতে হবে (আমি করতে পারি না)

1. **টোকেন দুটি রিভোক করুন** — কাজ শেষ।
   - GitHub → https://github.com/settings/tokens
   - Cloudflare → https://dash.cloudflare.com/profile/api-tokens
2. **অ্যাডমিন পাসওয়ার্ড বদলুন** (`Ab52944820@`) — এটি গিট হিস্ট্রিতে পাবলিক আছে।
3. **গিট হিস্ট্রি পরিষ্কার করুন** (না হলে `data/` হিস্ট্রিতে থাকবেই):
   ```bash
   git filter-repo --path data/ --path cookies.txt --invert-paths --force
   git push --force
   ```
4. **স্বয়ংক্রিয় ডিপ্লয় চালু করুন** — দুটির যেকোনো একটি:
   - **(ক) সহজ:** Cloudflare Dashboard → Workers & Pages → `edusob` → git সংযোগ আবার লিঙ্ক করুন।
   - **(খ) নির্ভরযোগ্য:** `docs/deploy-workflow.example.yml`-কে `.github/workflows/deploy.yml`-এ কপি করুন,
     আর GitHub → Settings → Secrets-এ `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` যোগ করুন।
     ⚠️ `.github/workflows/**` পুশ করতে PAT-এ **`workflow` স্কোপ** লাগবে — তাই ফাইলটি আপাতত `docs/`-এ টেমপ্লেট হিসেবে রাখা হয়েছে।

---

## ৫. পরের ধাপ (রোডম্যাপ)

- **H1** `/wallet` ও `/admin/shop` — H1 হেডিং নেই
- **H1** `src/pages/adminPages.ts`-এ ৩৯টি `innerHTML` সিঙ্ক আনস্যানিটাইজড
- **H2** অ্যাডমিন ট্যাব লেজি-লোড (এখন ১,১২৮ DOM নোড একসাথে)
- **H2** লক করা প্রশ্নপত্রে কনটেক্সচুয়াল আপসেল CTA
- **H2** অনবোর্ডিং চেকলিস্ট + প্রোফাইল সম্পন্নে ওয়ালেট বোনাস
- **H3** ⌘K কমান্ড প্যালেট, লগইন রেট-লিমিট, `GET /api/tools/mcq/quiz`-এ অথ গার্ড, CSRF

---

## ৬. লোকাল প্রিভিউ

**http://localhost:3000** — `npx tsx server.ts` (চালু আছে)

| রোল | ফোন | পাসওয়ার্ড |
|---|---|---|
| অ্যাডমিন | `01829486022` | `Ab52944820@` |
| টেস্ট ইউজার | `01911000001` / `01911000002` / `01911000003` | `test1234` |
