-- রাউন্ড ৯: টেকসই রেট-লিমিটিং (D1-ভিত্তিক)
-- আগের ইন-মেমোরি কাউন্টারটি isolate-ভিত্তিক ছিল — প্রোডাকশনে একাধিক isolate
-- চালু থাকলে ৮-এর বদলে ১৬-২৪ বার চেষ্টা করা যেত। এই টেবিল সব isolate-এর
-- জন্য একটিই হিসাব রাখে, তাই সীমা সব জায়গায় সমান থাকে।

CREATE TABLE IF NOT EXISTS rate_limits (
  bucket_key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  window_start INTEGER NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);
