-- এডুসব ফেজ-২: নোটিস, চাকরি, ফিড ক্যাশ

-- কলেজ/বোর্ড/NU নোটিস (অটো-ফেচ + এডমিন ম্যানুয়াল)
CREATE TABLE IF NOT EXISTS notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL DEFAULT 'general', -- nu | board | dshe | ntrca | college | general
  title TEXT NOT NULL,
  link TEXT,
  source TEXT DEFAULT 'manual',             -- manual | auto | seed
  published_at TEXT,                        -- YYYY-MM-DD
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notices_cat ON notices(category, is_active);

-- চাকরির সার্কুলার (শিক্ষাস্তর ম্যাচিংসহ)
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  org TEXT,                                 -- প্রতিষ্ঠান
  category TEXT DEFAULT 'govt',             -- govt | private | bank | ngo
  education_level TEXT DEFAULT 'any',       -- any | ssc | hsc | nu | masters
  deadline TEXT,                            -- YYYY-MM-DD
  apply_link TEXT,
  description TEXT,
  source TEXT DEFAULT 'manual',
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active, deadline);

-- এক্সটার্নাল ফিড ক্যাশ (নিউজ RSS / নামাজ / আয়াত — রেট লিমিট বাঁচাতে)
CREATE TABLE IF NOT EXISTS feed_cache (
  cache_key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL              -- unix ms
);

-- ---------- সিড: চাকরি (অফিসিয়াল পোর্টাল লিংকসহ; এডমিন প্যানেলে পরে CRUD) ----------
INSERT OR IGNORE INTO jobs (id, title, org, category, education_level, deadline, apply_link, description, source) VALUES
  (1, 'BPSC নন-ক্যাডার বিভিন্ন পদ — আবেদন চলছে', 'বাংলাদেশ সরকারি কর্ম কমিশন (BPSC)', 'govt', 'nu', '2026-09-25', 'http://bpsc.teletalk.com.bd', 'স্নাতক পাস প্রার্থীদের জন্য নন-ক্যাডার বিভিন্ন পদে নিয়োগ। টেলিটক পোর্টালে সার্কুলার দেখে আবেদন করুন।', 'seed'),
  (2, 'প্রাথমিক বিদ্যালয় সহকারী শিক্ষক নিয়োগ', 'প্রাথমিক শিক্ষা অধিদপ্তর (DPE)', 'govt', 'nu', '2026-09-30', 'http://dpe.teletalk.com.bd', 'স্নাতক (সম্মান/পাস) প্রার্থীরা আবেদন করতে পারবেন। জেলাভিত্তিক শূন্যপদ।', 'seed'),
  (3, '১৯তম শিক্ষক নিবন্ধন (NTRCA) পরীক্ষা', 'NTRCA', 'govt', 'nu', '2026-10-10', 'http://ntrca.teletalk.com.bd', 'স্কুল ও কলেজ পর্যায়ে শিক্ষক নিবন্ধন পরীক্ষার আবেদন।', 'seed'),
  (4, 'বাংলাদেশ ব্যাংক অফিসার (জেনারেল)', 'বাংলাদেশ ব্যাংক', 'bank', 'nu', '2026-09-18', 'https://erecruitment.bb.org.bd', 'স্নাতক ডিগ্রিধারীরা আবেদন করতে পারবেন। অনলাইন আবেদন erecruitment পোর্টালে।', 'seed'),
  (5, 'পরিবার পরিকল্পনা অধিদপ্তর — বিভিন্ন পদ (SSC/HSC)', 'পরিবার পরিকল্পনা অধিদপ্তর', 'govt', 'ssc', '2026-09-20', 'http://dgfp.teletalk.com.bd', 'এসএসসি/এইচএসসি পাস প্রার্থীদের জন্য আয়া, পিয়ন, অফিস সহায়কসহ বিভিন্ন পদ।', 'seed'),
  (6, 'বাংলাদেশ রেলওয়ে — পয়েন্টসম্যান/গেটকিপার', 'বাংলাদেশ রেলওয়ে', 'govt', 'ssc', '2026-10-05', 'http://br.teletalk.com.bd', 'এসএসসি পাস প্রার্থীরা আবেদন করতে পারবেন।', 'seed'),
  (7, 'সরকারি ব্যাংক সমন্বিত সিনিয়র অফিসার', 'ব্যাংকার্স সিলেকশন কমিটি (BSCS)', 'bank', 'nu', '2026-10-15', 'https://erecruitment.bb.org.bd', 'সমন্বিত ৮ ব্যাংকের সিনিয়র অফিসার পদে নিয়োগ। স্নাতক আবশ্যক।', 'seed'),
  (8, 'বেসরকারি কোম্পানিতে অফিস এক্সিকিউটিভ (HSC+)', 'বিভিন্ন প্রতিষ্ঠান — বিডিজবস', 'private', 'hsc', '2026-09-22', 'https://www.bdjobs.com', 'এইচএসসি বা তদূর্ধ্ব। বিডিজবসে বিস্তারিত দেখে আবেদন করুন।', 'seed');

-- ---------- সিড: নোটিস (অফিসিয়াল নোটিস বোর্ড লিংক) ----------
INSERT OR IGNORE INTO notices (id, category, title, link, source, published_at) VALUES
  (1, 'nu', 'জাতীয় বিশ্ববিদ্যালয়ের সর্বশেষ নোটিস বোর্ড — সব বিজ্ঞপ্তি এক জায়গায়', 'https://www.nu.ac.bd/recent-news-notice.php', 'seed', '2026-08-28'),
  (2, 'nu', 'NU পরীক্ষার ফরম পূরণ / রুটিন / ফলাফল সংক্রান্ত বিজ্ঞপ্তি', 'https://www.nu.ac.bd/notices.php', 'seed', '2026-08-27'),
  (3, 'board', 'ঢাকা শিক্ষা বোর্ড — সাম্প্রতিক বিজ্ঞপ্তি', 'https://dhakaeducationboard.gov.bd', 'seed', '2026-08-26'),
  (4, 'board', 'আন্তঃশিক্ষা বোর্ড সমন্বয় কমিটির নোটিস', 'http://www.educationboard.gov.bd', 'seed', '2026-08-25'),
  (5, 'dshe', 'মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর (DSHE) — নোটিস বোর্ড', 'https://dshe.gov.bd/site/view/notices', 'seed', '2026-08-28'),
  (6, 'dshe', 'শিক্ষা মন্ত্রণালয়ের সাম্প্রতিক আদেশ/পরিপত্র', 'https://moedu.gov.bd/site/view/notices', 'seed', '2026-08-24'),
  (7, 'ntrca', 'NTRCA নোটিস বোর্ড — নিবন্ধন ও নিয়োগ বিজ্ঞপ্তি', 'http://www.ntrca.gov.bd/site/view/notices', 'seed', '2026-08-27'),
  (8, 'general', 'ইউজিসি (UGC) — বিশ্ববিদ্যালয় সংক্রান্ত বিজ্ঞপ্তি', 'https://www.ugc.gov.bd/site/view/notices', 'seed', '2026-08-23');
