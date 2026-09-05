-- ফেজ-৭: সাবস্ক্রিপশন প্ল্যান + প্রশ্নপত্র ব্যাংক + ফিচার টগল

-- সাবস্ক্রিপশন প্ল্যান (এডমিন সম্পাদনাযোগ্য: দাম + মেয়াদ)
CREATE TABLE IF NOT EXISTS plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,              -- free | standard | premium
  name_bn TEXT NOT NULL,
  description TEXT DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0,       -- টাকা (প্রতি মেয়াদ)
  duration_days INTEGER NOT NULL DEFAULT 30,
  features TEXT DEFAULT '[]',             -- JSON array of feature bullet strings
  badge TEXT DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ইউজার সাবস্ক্রিপশন
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  plan_slug TEXT NOT NULL,
  price_paid INTEGER NOT NULL DEFAULT 0,
  starts_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',  -- active | expired | cancelled
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_subs_user ON subscriptions(user_id, status);

-- প্রশ্নপত্র ব্যাংক (পুরনো প্রশ্ন কালেকশন — ডাউনলোডযোগ্য)
CREATE TABLE IF NOT EXISTS question_papers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'ssc',      -- ssc | hsc | nu | job
  subject TEXT DEFAULT '',
  board TEXT DEFAULT '',
  year TEXT DEFAULT '',
  link TEXT NOT NULL,                     -- ডাউনলোড/ভিউ লিংক (PDF/ড্রাইভ)
  description TEXT DEFAULT '',
  access TEXT NOT NULL DEFAULT 'free',    -- free | standard | premium
  downloads INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_qp_level ON question_papers(level, is_active);

-- ফিচার টগল (এডমিন অন/অফ)
CREATE TABLE IF NOT EXISTS feature_toggles (
  key TEXT PRIMARY KEY,
  name_bn TEXT NOT NULL,
  is_enabled INTEGER NOT NULL DEFAULT 1,
  note TEXT DEFAULT ''
);

-- সিড: ৩টি প্ল্যান
INSERT OR IGNORE INTO plans (slug, name_bn, description, price, duration_days, features, badge, sort_order) VALUES
  ('free', 'ফ্রি', 'সবার জন্য — মৌলিক সব ফিচার', 0, 36500,
   '["রেজাল্ট হাব + সেভড রোল","প্রোফাইল + ছবি রিসাইজ","MCQ প্র্যাকটিস (দৈনিক ৩ কুইজ)","ফ্রি CV টেমপ্লেট (১টি)","নিউজ/চাকরি/নোটিস","স্টাডি প্ল্যানার + CGPA"]', '', 1),
  ('standard', 'স্ট্যান্ডার্ড', 'সিরিয়াস শিক্ষার্থীদের জন্য', 50, 30,
   '["ফ্রি প্ল্যানের সবকিছু","আনলিমিটেড MCQ কুইজ","স্ট্যান্ডার্ড CV টেমপ্লেট (৳৩০) ফ্রি","প্রশ্নপত্র ব্যাংক (স্ট্যান্ডার্ড)","ভুল-ব্যাংক স্মার্ট রিভিশন","অগ্রাধিকার সাপোর্ট"]', 'জনপ্রিয়', 2),
  ('premium', 'প্রিমিয়াম', 'সর্বোচ্চ সুবিধা — সব আনলকড', 100, 30,
   '["স্ট্যান্ডার্ডের সবকিছু","সব CV টেমপ্লেট ফ্রি (৳৫০ সহ)","CV কাস্টমাইজ (রঙ/ফন্ট নিজের মতো)","সম্পূর্ণ প্রশ্নপত্র ব্যাংক","AI সহকারী আনলিমিটেড","অ্যাসিস্টেড আবেদনে ১০% ছাড়"]', 'সেরা ভ্যালু', 3);

-- সিড: ফিচার টগল
INSERT OR IGNORE INTO feature_toggles (key, name_bn, is_enabled, note) VALUES
  ('shop', 'এডুসব শপ', 1, 'শপ পেজ + সাইনবোর্ড পপআপ'),
  ('shop_signboard', 'শপ সাইনবোর্ড পপআপ', 1, 'ল্যান্ডিং পেজের অফার পপআপ'),
  ('ai_assistant', 'AI সহকারী', 1, 'ফ্লোটিং AI চ্যাট'),
  ('cv_maker', 'CV মেকার', 1, '/cv পেজ'),
  ('mcq', 'MCQ প্র্যাকটিস', 1, '/mcq পেজ'),
  ('qpapers', 'প্রশ্নপত্র ব্যাংক', 1, '/qpapers পেজ'),
  ('news', 'নিউজ পোর্টাল', 1, '/news পেজ'),
  ('jobs', 'চাকরির খবর', 1, '/jobs পেজ'),
  ('subscription', 'সাবস্ক্রিপশন', 1, '/subscription পেজ'),
  ('referral', 'রেফারেল প্রোগ্রাম', 1, 'রেফার বোনাস');

-- সিড: কিছু প্রশ্নপত্র (অফিসিয়াল/ওপেন সোর্স)
INSERT OR IGNORE INTO question_papers (id, title, level, subject, board, year, link, description, access) VALUES
  (1, 'SSC বাংলা ১ম পত্র — ঢাকা বোর্ড ২০২৩', 'ssc', 'বাংলা', 'ঢাকা', '2023', 'https://dhakaeducationboard.gov.bd/', 'বোর্ড প্রশ্ন — অফিসিয়াল সাইট থেকে', 'free'),
  (2, 'SSC গণিত — সকল বোর্ড ২০২৩ সংকলন', 'ssc', 'গণিত', 'সকল', '2023', 'https://dhakaeducationboard.gov.bd/', 'সকল বোর্ডের গণিত প্রশ্ন একসাথে', 'standard'),
  (3, 'HSC পদার্থবিজ্ঞান ১ম পত্র — ২০২৩ সংকলন', 'hsc', 'পদার্থবিজ্ঞান', 'সকল', '2023', 'https://dhakaeducationboard.gov.bd/', 'সৃজনশীল + MCQ', 'standard'),
  (4, 'HSC ICT — বিগত ৫ বছরের প্রশ্ন', 'hsc', 'ICT', 'সকল', '2019-2023', 'https://dhakaeducationboard.gov.bd/', '৫ বছরের বোর্ড প্রশ্ন সংকলন', 'premium'),
  (5, 'NU অনার্স ১ম বর্ষ — ব্যবস্থাপনা প্রশ্ন ২০২২', 'nu', 'ব্যবস্থাপনা', 'NU', '2022', 'https://www.nu.ac.bd/', 'জাতীয় বিশ্ববিদ্যালয় প্রশ্ন', 'free'),
  (6, 'প্রাইমারি শিক্ষক নিয়োগ — বিগত প্রশ্ন সংকলন', 'job', 'সাধারণ', 'DPE', '2018-2023', 'https://dpe.gov.bd/', 'নিয়োগ পরীক্ষার প্রশ্নব্যাংক', 'standard');
