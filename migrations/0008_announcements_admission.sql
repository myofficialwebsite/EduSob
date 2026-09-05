-- ফেজ-৮: অ্যানাউন্সমেন্ট কার্ড + পিন + নোটিস বডি + ভর্তি হাব

-- অ্যানাউন্সমেন্ট (রুটিন/প্রশ্নপত্র/রেজাল্ট ঘোষণা) — এডমিন অ্যাপ্রুভড কার্ড
CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL DEFAULT 'routine',    -- routine | question | result | admission | general
  title TEXT NOT NULL,
  body TEXT DEFAULT '',                    -- বিস্তারিত (সাইটেই দেখাবে)
  link TEXT DEFAULT '',                    -- অফিসিয়াল সোর্স/ডাউনলোড লিংক
  image_data TEXT,                         -- রুটিনের ছবি (base64, ঐচ্ছিক)
  level TEXT DEFAULT 'all',                -- all | ssc | hsc | nu | job
  status TEXT NOT NULL DEFAULT 'approved', -- pending | approved | rejected
  pinned_priority INTEGER DEFAULT 0,       -- এডমিন-লেভেল অগ্রাধিকার
  expires_at TEXT,                         -- YYYY-MM-DD এর পরে আর দেখাবে না (ঐচ্ছিক)
  source TEXT DEFAULT 'admin',             -- admin | auto
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ann_status ON announcements(status, level);

-- ইউজার পিন (রুটিন/ঘোষণা ড্যাশবোর্ডে পিন করে রাখা)
CREATE TABLE IF NOT EXISTS user_pins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  announcement_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, announcement_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (announcement_id) REFERENCES announcements(id)
);

-- নোটিসে পূর্ণ বডি (সাইটেই ডিরেক্ট শো)
ALTER TABLE notices ADD COLUMN body TEXT DEFAULT '';

-- ভর্তি হাব
CREATE TABLE IF NOT EXISTS admissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,                     -- যেমন: একাদশ শ্রেণি ভর্তি ২০২৬
  level TEXT NOT NULL DEFAULT 'hsc',       -- hsc | nu | university | other
  org TEXT DEFAULT '',                     -- প্রতিষ্ঠান/কর্তৃপক্ষ
  apply_link TEXT DEFAULT '',              -- অফিসিয়াল আবেদন লিংক
  fee TEXT DEFAULT '',                     -- আবেদন ফি (টেক্সট, যেমন "৳১৫০")
  start_date TEXT, deadline TEXT,          -- YYYY-MM-DD
  steps TEXT DEFAULT '[]',                 -- JSON array — ধাপে ধাপে গাইড
  required_info TEXT DEFAULT '[]',         -- JSON array — কোন কোন তথ্য লাগবে (profile field keys)
  description TEXT DEFAULT '',
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_adm_level ON admissions(level, is_active);

-- সিড: ভর্তি
INSERT OR IGNORE INTO admissions (id, title, level, org, apply_link, fee, deadline, steps, required_info, description) VALUES
  (1, 'একাদশ শ্রেণি ভর্তি (XI Class Admission)', 'hsc', 'শিক্ষা বোর্ড (সমন্বিত)', 'https://xiclassadmission.gov.bd/', '৳২২৮ (আবেদন)', '',
   '["xiclassadmission.gov.bd সাইটে যান","\"Apply Now\" এ ক্লিক করুন","SSC রোল, বোর্ড, পাসের বছর ও রেজিস্ট্রেশন নম্বর দিন","মোবাইল নম্বর ভেরিফাই করুন","পছন্দের কলেজ তালিকা দিন (৫-১০টি)","আবেদন ফি পরিশোধ করুন (বিকাশ/নগদ/রকেট)","কনফার্মেশন SMS সংরক্ষণ করুন"]',
   '["ssc_roll","ssc_board","ssc_year","ssc_reg","phone"]',
   'SSC পাসের পর একাদশ শ্রেণিতে (কলেজ) ভর্তির সমন্বিত অনলাইন আবেদন।'),
  (2, 'জাতীয় বিশ্ববিদ্যালয় অনার্স ১ম বর্ষ ভর্তি', 'nu', 'জাতীয় বিশ্ববিদ্যালয়', 'http://app1.nu.edu.bd/', '৳২৫০ (প্রাথমিক আবেদন)', '',
   '["app1.nu.edu.bd সাইটে যান","Honours ট্যাবে \"Apply Now\" ক্লিক করুন","SSC ও HSC এর রোল, বোর্ড, পাসের বছর দিন","ছবি আপলোড করুন (120×150px)","কলেজ ও বিষয় পছন্দক্রম দিন","আবেদন ফর্ম প্রিন্ট করুন","ফি সহ ফর্ম নির্ধারিত কলেজে জমা দিন"]',
   '["ssc_roll","ssc_board","ssc_year","hsc_roll","hsc_board","hsc_year","photo_data","phone"]',
   'HSC পাসের পর NU অধিভুক্ত কলেজে অনার্স ভর্তির আবেদন।'),
  (3, 'NU ডিগ্রি (পাস) ভর্তি', 'nu', 'জাতীয় বিশ্ববিদ্যালয়', 'http://app1.nu.edu.bd/', '৳২৫০', '',
   '["app1.nu.edu.bd সাইটে যান","Degree Pass ট্যাবে আবেদন করুন","SSC ও HSC তথ্য দিন","কলেজ পছন্দ দিন","ফর্ম প্রিন্ট করে কলেজে জমা দিন"]',
   '["ssc_roll","ssc_board","ssc_year","hsc_roll","hsc_board","hsc_year","phone"]',
   'ডিগ্রি (পাস) কোর্সে ভর্তির অনলাইন আবেদন।');

-- সিড: একটি নমুনা অ্যানাউন্সমেন্ট
INSERT OR IGNORE INTO announcements (id, type, title, body, link, level, status) VALUES
  (1, 'general', '🎉 এডুসবে স্বাগতম — নতুন ফিচার চালু!', 'রেজাল্ট এখন সরাসরি সাইটেই দেখুন! সাথে ভর্তি হাব, প্রশ্নপত্র ব্যাংক ও সাবস্ক্রিপশন। আপনার দরকারি ঘোষণা পিন 📌 করে ড্যাশবোর্ডে রাখুন।', '/results', 'all', 'approved');
