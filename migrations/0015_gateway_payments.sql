-- গেটওয়ে (বিকাশ টোকেনাইজড) অটো টপ-আপ ট্র্যাকিং টেবিল
CREATE TABLE IF NOT EXISTS gateway_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL,
  provider TEXT NOT NULL DEFAULT 'bkash',
  amount INTEGER NOT NULL,
  payment_id TEXT,
  trx_id TEXT,
  status TEXT NOT NULL DEFAULT 'created',   -- created | redirected | paid | failed | cancelled
  raw TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_gpay_user ON gateway_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_gpay_pid ON gateway_payments(payment_id);
