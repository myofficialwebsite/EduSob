-- রাউন্ড ৬: অনবোর্ডিং চেকলিস্ট + ওয়ালেট বোনাস
-- প্রতিটি ধাপের বোনাস ঠিক একবারই ক্রেডিট হবে — (user_id, step_key) UNIQUE.
-- ওয়ালেট বাড়ানোর আগে এই টেবিলে INSERT OR IGNORE; INSERT ব্যর্থ হলে (আগেই ক্লেইম করা)
-- কোনো ক্রেডিট হয় না — ফলে ডবল-ক্রেডিট সম্ভব নয়।

CREATE TABLE IF NOT EXISTS onboarding_rewards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  step_key TEXT NOT NULL,
  amount INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, step_key),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_rewards_user ON onboarding_rewards(user_id);
