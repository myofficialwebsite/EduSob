-- এডুসব ফেজ-৬: রেফারেল সিস্টেম + এডমিন সেটিংস

-- রেফারেল ট্র্যাকিং: কে কাকে এনেছে
ALTER TABLE users ADD COLUMN referred_by INTEGER;

CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);

-- রেফারেল/বোনাস রেট (এডমিন প্যানেল থেকে বদলানো যাবে)
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('signup_bonus', '20'),
  ('referral_bonus', '20');
