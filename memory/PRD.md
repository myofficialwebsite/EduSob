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
- NOT pushed to GitHub (needs user's credentials/PAT). Patch file ready to apply.

## Backlog
- P0: Sync/replace with user's actual GitHub repo content once made public or shared
- P1: Real payment gateway (bKash/Stripe) for enrollments
- P1: Admin dashboard to view enrollments
- P2: User auth + student dashboard, course progress
- P2: WhatsApp/SMS notification on enrollment

## Notes
- No auth/credentials needed; nothing in test_credentials.md
- Coupon: EDUSOB2026 (15% off)
