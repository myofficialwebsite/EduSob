-- এডুসব (EduSob) — ফেজ ১: ইউজার, সেশন, প্রোফাইল, সেভড রোল, ওয়ালেট, সেটিংস

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_code TEXT UNIQUE NOT NULL,            -- EDU-2026-00001
  name_bn TEXT NOT NULL,
  name_en TEXT,
  email TEXT UNIQUE,
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  religion TEXT NOT NULL DEFAULT 'other',    -- islam | sanatan | buddhist | christian | other
  education_level TEXT,                      -- ssc | hsc | nu | masters | other
  role TEXT NOT NULL DEFAULT 'user',         -- user | admin
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,               -- unix ms
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id INTEGER PRIMARY KEY,
  father_bn TEXT, father_en TEXT,
  mother_bn TEXT, mother_en TEXT,
  nid TEXT, birth_reg TEXT,
  dob TEXT, gender TEXT, blood_group TEXT,
  village TEXT, post_office TEXT, upazila TEXT, district TEXT,
  school_name TEXT, college_name TEXT,
  ssc_board TEXT, ssc_roll TEXT, ssc_reg TEXT, ssc_year TEXT, ssc_gpa TEXT,
  hsc_board TEXT, hsc_roll TEXT, hsc_reg TEXT, hsc_year TEXT, hsc_gpa TEXT,
  nu_reg TEXT, nu_college TEXT, nu_subject TEXT,
  photo_data TEXT,                            -- base64 data URL (compressed client-side)
  sign_data TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS saved_rolls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  exam_type TEXT NOT NULL,                    -- ssc | hsc | jsc | nu_honours | nu_degree | nu_masters
  board TEXT,
  roll TEXT,
  reg TEXT,
  exam_year TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS wallets (
  user_id INTEGER PRIMARY KEY,
  balance INTEGER NOT NULL DEFAULT 0,         -- পয়সায় নয়, পূর্ণ টাকায়
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,                    -- + জমা / - খরচ
  type TEXT NOT NULL,                         -- manual_topup | purchase | refund | referral
  note TEXT,
  status TEXT NOT NULL DEFAULT 'approved',    -- pending | approved | rejected
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_rolls_user ON saved_rolls(user_id);
CREATE INDEX IF NOT EXISTS idx_wtx_user ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- ডিফল্ট সেটিংস (এডমিন প্যানেল থেকে পরে বদলানো যাবে)
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('site_name', 'এডুসব'),
  ('site_name_en', 'EduSob'),
  ('tagline', 'শিক্ষার সব, এক ঠিকানায়!'),
  ('whatsapp_number', ''),
  ('bkash_number', ''),
  ('nagad_number', '');
