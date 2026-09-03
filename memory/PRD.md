# EduSob — Landing Page PRD

## Original Problem Statement
"Build a landing page: githab a jukta website ti cheqe kre all logic kre dao" — User wanted their GitHub repo (github.com/myofficialwebsite/EduSob) checked and all logic fixed A-to-Z. The repo is private/inaccessible (404, account has no public repos), so a complete new EduSob education-platform landing page was built from scratch with full working logic, per user's direction: "whatever looks professional in your judgment, do that, A to Z."

## User Personas
- Bengali-speaking students (HSC, university) and career transitioners in Bangladesh & diaspora
- Bilingual UI (বাংলা / English toggle)

## Architecture
- Frontend: React 19 + Tailwind + Framer Motion + Lenis smooth scroll + Sonner toasts (`/app/frontend/src/components/landing/`)
- Backend: FastAPI + Motor (MongoDB), routes under `/api`
- DB: MongoDB via MONGO_URL / DB_NAME envs; courses seeded idempotently on startup

## Core Requirements (static)
- Award-worthy dark editorial landing page (obsidian #0b0d12, terracotta #f97316; Syne + Hind Siliguri + Plus Jakarta Sans)
- Kinetic hero with masked line-by-line reveal, 3D tilt code card, parallax glow
- Course catalog with category filter + search + detail modal
- Enrollment form: BD phone validation, coupon (EDUSOB2026 = 15% off), price preview
- Newsletter subscription
- Language toggle (bn/en) for chrome/nav/hero

## Implemented (2026-09-03)
- Full backend: GET /api/courses (category + q filter), GET /api/courses/{id}, POST /api/enroll (phone regex, coupon validation, discounted price calc), POST /api/newsletter (upsert); course seeding
- Frontend sections: Nav (glass, mobile drawer, lang toggle), Hero, editorial Marquee, numbered Manifesto chapters (01–04 bento), Courses, animated Stats counters, Mentors, Testimonials, searchable FAQ accordion, EnrollForm, editorial Footer with giant EDUSOB wordmark
- Verified: curl on all endpoints (enroll ৳4,999→৳4,249 with coupon; bad phone/coupon rejected), e2e screenshot test of enroll flow with success toast

## GitHub Repo Audit (2026-09-03, repo made public by user)
- Repo: github.com/myofficialwebsite/EduSob — Hono + TypeScript + node:sqlite (D1 compat layer), Cloudflare Pages deploy; cloned to /app/edusob
- Audit: tsc --noEmit clean; production build (vite) passes; 20/20 pages 200; auth (signup/login/session), wallet bonus, shop COD + wallet orders, MCQ quiz/scoring, CV, scholarships, admin panel — all smoke-tested working
- Bugs found & fixed (commit in /app/edusob, patch: /app/edusob-fixes.patch):
  1. scholarships.ts:36 `target_level="all"` — double-quoted string literal crashes node:sqlite (DQS disabled) → 500 on /api/scholarships. Fixed to single quotes.
  2. admin.ts:92 `status = "answered"` — same DQS bug in admin stats count. Fixed.
  3. teacherSupport.ts:530 — ORDER BY CASE with "urgent"/"pending" double quotes. Fixed.
  4. server.ts — hardcoded port 3000 → PORT env with 3000 fallback.
- Verified money logic: wallet topup (+1000) → wallet order (-650) → balance 370 correct; server-side price calc + stock + insufficient-balance guard OK
- Fixes PUSHED to GitHub main (commit 96d5743) on 2026-09-03. Patch also at /app/edusob-fixes.patch.

## Round 7 (2026-09-03) — PRODUCTION LIVE
- Via Cloudflare API (user-provided token): set 6 env vars on Pages project edusob (GEMINI_API_KEY, VAPID_×4, PUBLIC_BASE_URL), retried deployment → success.
- Live verified on https://edusob.pages.dev: Gemini AI answers in Bengali (source: ai), push vapid-key endpoint active, dark landing deployed.
- CF account ID: 6cd806a3439dfb6fd67f5b504fbd3360. bKash/Nagad deferred by user (toggle + code ready). — PWA + push commit (pushed)
- PWA: manifest.webmanifest, sw.js (root scope routes /sw.js, /manifest.webmanifest), orange graduation-cap icons (192/512/maskable), install-prompt + push-enable banner in layout (hidden when permission denied).
- Web Push: migration 0016 push_subscriptions, routes /api/push (vapid-key, subscribe, unsubscribe, broadcast, stats). Pure WebCrypto VAPID+aes128gcm sender (Workers-compatible, no deps). Auto-broadcast fires when admin posts announcement. Verified with local mock push server: sent=1, valid vapid JWT + encrypted body; dead subs auto-deleted; Hono executionCtx getter-throw bug fixed.
- bKash: admin panel toggle 'bkash_auto_enabled' (ratesForm whitelist) gates auto top-up — off by default; turns on when creds added + toggle on.
- VAPID keys in /app/edusob/.env (gitignored). PRODUCTION PENDING: user must add VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY/VAPID_X/VAPID_Y + GEMINI_API_KEY to Cloudflare Pages env vars (user doesn't know how — offered token-based setup).
- NOT tested: real browser push e2e (headless sandbox denies notification permission); PWA install prompt visual (same reason). Code paths verified logically + mock server. — brand unify commit (pushed)
- Global CSS override in layout.ts HEAD_COMMON: emerald accent → terracotta orange, teal gradient stops → amber, smooth scrolling. Verified via dashboard + wallet screenshots. — commit afba18b (pushed)
- Full-portal dark theme: DARK_PORTAL_CSS override in layout.ts applied to shop/wallet/assisted/admin pages (rest were already dark). Shop header fixed via .shop-header class (JS string escape bug found: `\/` in template literal — used plain class selector instead).
- Gemini LIVE locally: user-provided AI Studio key validated; model switched gemini-2.5-flash (deprecated for new users) → gemini-3.5-flash; raised maxOutputTokens 400→1200 (thinking tokens were truncating answers). Verified: Bengali study answers working. Key stored in /app/edusob/.env (gitignored, NOT pushed). PENDING MANUAL: user must add GEMINI_API_KEY in Cloudflare Pages → Settings → Environment variables for production AI answers (Workers AI is the no-key fallback meanwhile).
- bKash/Nagad merchant onboarding cannot be done by agent (requires user's KYC/business docs) — integration code ready and waiting for creds. — commit bdf2b83, +payments commit (pushed)
- UI Redesign: landing.ts fully rewritten to premium dark editorial theme (obsidian #0b0d12, terracotta #f97316, Syne display font, editorial marquee, giant footer wordmark). ALL ids/JS (slider, filters, FAQ, captcha, contact) preserved and re-verified via screenshots. Live on edusob.pages.dev (Cloudflare auto-deploys from main).
- AI: Workers AI binding already in wrangler.jsonc (keyless); GEMINI_API_KEY now read from c.env for extra quality. User needs own Gemini key only if they want Gemini instead of Workers AI.
- Payments: new /api/payments route — bKash tokenized checkout (grant token cache, create mode 0011, execute callback, amount match, idempotent wallet credit via gateway_payments table, migration 0015). Wallet page got "বিকাশ অটো টপ-আপ" button (shows only when creds configured) + success/fail banners. Manual TRX flow untouched. BLOCKED on real use: needs bKash merchant creds (BKASH_APP_KEY/SECRET/USERNAME/PASSWORD) — user must obtain from bKash merchant onboarding. Nagad needs merchant package from Nagad.
- Dashboard redesign NOT done yet (landing only). (2026-09-03) — commits cd0bfb1, f706cdc, f4e4dd9 (all pushed to main)
- Auto Collector tested: all 6 sync sources run, curated content library upserts with per-item dedup (no live scraping — by design). Fixed admin force-sync diagnostics showing fabricated "35% new" numbers; now uses real insert counts (verified: re-sync shows new=0, dup=all).
- Cross-checked all 105 API paths called from frontend pages against 167 defined routes: found teacher-support ticket chat was 404 (pages call /tickets/:id/messages plural; backend had /ticket/:id singular). Added alias routes; chat verified working end-to-end.
- AI chat (guide + Gemini + Workers AI fallback) already existed; fixed GEMINI_API_KEY to read from Cloudflare c.env bindings (process.env fallback). Live Gemini answers need user's key in env (user will create at aistudio.google.com/apikey).
- Full POST flow coverage verified: profile update, planner, notes, saved-rolls, teacher ticket + chat, CV save (22 templates), subscription subscribe→my-plan→premium content access, wallet topup→order deduction, guest COD order, referral bonus.
- Cloudflare deploy: user's CF account is GitHub-connected — pushes to main auto-deploy. All fixes are live on main.

## Backlog
- P0: Sync/replace with user's actual GitHub repo content once made public or shared
- P1: Real payment gateway (bKash/Stripe) for enrollments
- P1: Admin dashboard to view enrollments
- P2: User auth + student dashboard, course progress
- P2: WhatsApp/SMS notification on enrollment

## Notes
- No auth/credentials needed; nothing in test_credentials.md
- Coupon: EDUSOB2026 (15% off)
