-- ফেজ-১৩: স্কলারশিপ অটো-যোগ্যতা ইঞ্জিন + মডেল টেস্ট ও বিগত বছরের প্রশ্ন অটো-কালেকশন
CREATE TABLE IF NOT EXISTS scholarships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'national',       -- national | board | bank | international
  target_level TEXT NOT NULL DEFAULT 'all',        -- all | ssc | hsc | nu | masters | bsc
  min_gpa REAL NOT NULL DEFAULT 0.0,
  max_family_income INTEGER NOT NULL DEFAULT 0,    -- ০ মানে আয়ের কোনো সর্বোচ্চ সীমা নেই (যেমন মেধা বৃত্তি)
  quota TEXT DEFAULT 'সকলের জন্য উন্মুক্ত',
  eligible_districts TEXT DEFAULT 'সকল জেলা',
  stipend_amount TEXT DEFAULT '',
  deadline TEXT DEFAULT '',
  apply_link TEXT DEFAULT '',
  required_docs TEXT DEFAULT '[]',                 -- JSON array of document strings
  steps_roadmap TEXT DEFAULT '[]',                 -- JSON array of step-by-step roadmap
  tips_guideline TEXT DEFAULT '',
  downloads INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scholarships_cat ON scholarships(category, is_active);
CREATE INDEX IF NOT EXISTS idx_scholarships_lvl ON scholarships(target_level, is_active);

-- প্রশ্নপত্র ও সিলেবাসে নতুন ভার্সন ও এক্সট্রা ফিল্ড ব্যাকওয়ার্ড কম্প্যাটিবিলিটি নিশ্চিত করা
ALTER TABLE question_papers ADD COLUMN exam_type TEXT DEFAULT 'board';
ALTER TABLE question_papers ADD COLUMN version TEXT DEFAULT 'new_syllabus';
ALTER TABLE question_papers ADD COLUMN total_marks TEXT DEFAULT '100';
ALTER TABLE question_papers ADD COLUMN time_allowed TEXT DEFAULT '৩ ঘণ্টা';
ALTER TABLE question_papers ADD COLUMN answer_key TEXT DEFAULT '';
ALTER TABLE question_papers ADD COLUMN explanations TEXT DEFAULT '';
