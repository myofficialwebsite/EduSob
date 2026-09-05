-- এডুসব ফেজ-৩: স্টুডেন্ট টুলস — MCQ, ভুল-ব্যাংক, প্ল্যানার, নোট, সিলেবাস

-- MCQ প্রশ্নব্যাংক
CREATE TABLE IF NOT EXISTS mcq_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT NOT NULL DEFAULT 'ssc',          -- ssc | hsc | nu | job
  subject TEXT NOT NULL,                      -- বাংলা | ইংরেজি | গণিত | বিজ্ঞান | ICT | সাধারণ জ্ঞান
  chapter TEXT DEFAULT '',
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct TEXT NOT NULL,                      -- a | b | c | d
  explanation TEXT DEFAULT '',
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_mcq_level_subject ON mcq_questions(level, subject, is_active);

-- MCQ পরীক্ষার ফলাফল
CREATE TABLE IF NOT EXISTS mcq_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  level TEXT NOT NULL,
  subject TEXT NOT NULL,
  total INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  score_pct INTEGER NOT NULL,
  taken_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON mcq_attempts(user_id, taken_at);

-- ভুল প্রশ্ন ব্যাংক (স্মার্ট রিভিশন ১→৩→৭ দিন)
CREATE TABLE IF NOT EXISTS wrong_bank (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  wrong_count INTEGER DEFAULT 1,
  stage INTEGER DEFAULT 0,                    -- 0=১দিন, 1=৩দিন, 2=৭দিন, 3=মাস্টার্ড
  next_review TEXT NOT NULL,                  -- YYYY-MM-DD
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, question_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (question_id) REFERENCES mcq_questions(id)
);
CREATE INDEX IF NOT EXISTS idx_wrong_user_review ON wrong_bank(user_id, next_review);

-- স্টাডি প্ল্যানার
CREATE TABLE IF NOT EXISTS planner_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  subject TEXT DEFAULT '',
  due_date TEXT DEFAULT '',                   -- YYYY-MM-DD
  status TEXT DEFAULT 'pending',              -- pending | done
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_planner_user ON planner_tasks(user_id, status, due_date);

-- অধ্যায়ভিত্তিক নোট
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  subject TEXT DEFAULT '',
  chapter TEXT DEFAULT '',
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id, updated_at);

-- সিলেবাস (শিক্ষাস্তর অনুযায়ী অফিসিয়াল উৎস)
CREATE TABLE IF NOT EXISTS syllabus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT NOT NULL,                        -- ssc | hsc | nu | masters
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  link TEXT NOT NULL,
  source TEXT DEFAULT '',
  is_active INTEGER DEFAULT 1
);

-- ========== সিলেবাস সিড (অফিসিয়াল ফ্রি উৎস) ==========
INSERT OR IGNORE INTO syllabus (id, level, title, description, link, source) VALUES
  (1, 'ssc', 'SSC সিলেবাস ও মানবণ্টন (NCTB)', 'জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ডের অফিসিয়াল সিলেবাস', 'https://nctb.gov.bd/', 'NCTB'),
  (2, 'ssc', 'NCTB পাঠ্যপুস্তক ডাউনলোড (৯ম-১০ম)', 'সব বিষয়ের PDF বই ফ্রি ডাউনলোড', 'https://nctb.gov.bd/site/page/9d5c33e7-4dd1-4c62-9c8b-2cf9d0a0ffdb', 'NCTB'),
  (3, 'ssc', 'ঢাকা বোর্ড নোটিস ও সিলেবাস', 'পরীক্ষার রুটিন, মানবণ্টন, পুনঃনিরীক্ষণ', 'https://dhakaeducationboard.gov.bd/', 'ঢাকা শিক্ষা বোর্ড'),
  (4, 'hsc', 'HSC সিলেবাস ও মানবণ্টন (NCTB)', 'একাদশ-দ্বাদশ শ্রেণির অফিসিয়াল সিলেবাস', 'https://nctb.gov.bd/', 'NCTB'),
  (5, 'hsc', 'NCTB পাঠ্যপুস্তক (একাদশ-দ্বাদশ)', 'সব বিষয়ের PDF বই ফ্রি', 'https://nctb.gov.bd/site/page/9d5c33e7-4dd1-4c62-9c8b-2cf9d0a0ffdb', 'NCTB'),
  (6, 'hsc', 'HSC পরীক্ষার রুটিন ও নোটিস', 'সব বোর্ডের রুটিন এক জায়গায়', 'https://dhakaeducationboard.gov.bd/', 'শিক্ষা বোর্ড'),
  (7, 'nu', 'NU অনার্স সিলেবাস (সব বিষয়)', 'জাতীয় বিশ্ববিদ্যালয়ের অনার্স কোর্সের অফিসিয়াল সিলেবাস', 'https://www.nu.ac.bd/curriculum-syllabus.php', 'জাতীয় বিশ্ববিদ্যালয়'),
  (8, 'nu', 'NU ডিগ্রি পাস সিলেবাস', 'ডিগ্রি (পাস) কোর্সের সিলেবাস ও রেগুলেশন', 'https://www.nu.ac.bd/curriculum-syllabus.php', 'জাতীয় বিশ্ববিদ্যালয়'),
  (9, 'nu', 'NU একাডেমিক ক্যালেন্ডার ও নোটিস', 'পরীক্ষার সময়সূচি, ফরম-ফিলাপ নোটিস', 'https://www.nu.ac.bd/recent-news-notice.php', 'জাতীয় বিশ্ববিদ্যালয়'),
  (10, 'masters', 'NU মাস্টার্স সিলেবাস', 'মাস্টার্স ফাইনাল/প্রিলি কোর্সের সিলেবাস', 'https://www.nu.ac.bd/curriculum-syllabus.php', 'জাতীয় বিশ্ববিদ্যালয়');

-- ========== MCQ প্রশ্নব্যাংক সিড (৪৮টি — SSC/HSC/NU/Job) ==========
INSERT OR IGNORE INTO mcq_questions (id, level, subject, chapter, question, option_a, option_b, option_c, option_d, correct, explanation) VALUES
-- SSC বাংলা (৬)
(1,'ssc','বাংলা','ব্যাকরণ','"পদ্মা" শব্দটি কোন শ্রেণির?','তৎসম','তদ্ভব','দেশি','বিদেশি','a','পদ্মা সংস্কৃত থেকে সরাসরি আগত তৎসম শব্দ।'),
(2,'ssc','বাংলা','ব্যাকরণ','বাংলা ভাষায় মৌলিক স্বরধ্বনি কয়টি?','৫টি','৬টি','৭টি','১১টি','c','বাংলায় মৌলিক স্বরধ্বনি ৭টি: অ, আ, ই, উ, এ, অ্যা, ও।'),
(3,'ssc','বাংলা','ব্যাকরণ','"চাঁদমুখ" কোন সমাস?','উপমিত কর্মধারয়','উপমান কর্মধারয়','রূপক কর্মধারয়','দ্বন্দ্ব','a','চাঁদের ন্যায় মুখ = উপমিত কর্মধারয় সমাস।'),
(4,'ssc','বাংলা','সাহিত্য','"সোনার তরী" কবিতাটি কার লেখা?','কাজী নজরুল ইসলাম','রবীন্দ্রনাথ ঠাকুর','জসীমউদ্‌দীন','সুকান্ত ভট্টাচার্য','b','সোনার তরী রবীন্দ্রনাথ ঠাকুরের বিখ্যাত কবিতা।'),
(5,'ssc','বাংলা','ব্যাকরণ','"হাতি" শব্দের সমার্থক শব্দ কোনটি?','করী','কেশরী','ভুজঙ্গ','মৃগেন্দ্র','a','করী, হস্তী, গজ, দ্বিপ — হাতির সমার্থক।'),
(6,'ssc','বাংলা','ব্যাকরণ','অনুসর্গ কী?','বিভক্তি','অব্যয়','ধাতু','প্রত্যয়','b','অনুসর্গ হলো এক প্রকার অব্যয় যা শব্দের পরে বসে।'),
-- SSC গণিত (৬)
(7,'ssc','গণিত','বীজগণিত','x + 1/x = 3 হলে x² + 1/x² = কত?','৭','৯','১১','৫','a','(x+1/x)² = x²+1/x²+2 → 9-2 = 7।'),
(8,'ssc','গণিত','জ্যামিতি','ত্রিভুজের তিন কোণের সমষ্টি কত?','৯০°','১৮০°','২৭০°','৩৬০°','b','ত্রিভুজের অন্তঃকোণ তিনটির সমষ্টি সর্বদা ১৮০°।'),
(9,'ssc','গণিত','পাটিগণিত','১২ ও ১৮ এর ল.সা.গু কত?','৬','২৪','৩৬','৭২','c','১২=২²×৩, ১৮=২×৩² → ল.সা.গু = ২²×৩² = ৩৬।'),
(10,'ssc','গণিত','বীজগণিত','(a+b)² = কত?','a²+b²','a²+2ab+b²','a²-2ab+b²','a²+ab+b²','b','(a+b)² = a² + 2ab + b² — মৌলিক সূত্র।'),
(11,'ssc','গণিত','জ্যামিতি','বৃত্তের ব্যাস ১০ সেমি হলে ব্যাসার্ধ কত?','২০ সেমি','১০ সেমি','৫ সেমি','২.৫ সেমি','c','ব্যাসার্ধ = ব্যাস ÷ ২ = ৫ সেমি।'),
(12,'ssc','গণিত','পাটিগণিত','৫% হার সুদে ২০০০ টাকার ১ বছরের সুদ কত?','৫০ টাকা','১০০ টাকা','১৫০ টাকা','২০০ টাকা','b','সুদ = ২০০০ × ৫% = ১০০ টাকা।'),
-- SSC বিজ্ঞান (৬)
(13,'ssc','বিজ্ঞান','পদার্থ','পানির স্ফুটনাঙ্ক কত?','৯০°C','৯৫°C','১০০°C','১২০°C','c','স্বাভাবিক চাপে পানি ১০০°C তাপমাত্রায় ফোটে।'),
(14,'ssc','বিজ্ঞান','রসায়ন','পানির সংকেত কোনটি?','CO₂','H₂O','O₂','NaCl','b','পানি = ২টি হাইড্রোজেন + ১টি অক্সিজেন পরমাণু।'),
(15,'ssc','বিজ্ঞান','জীববিজ্ঞান','সালোকসংশ্লেষণে কোন গ্যাস নির্গত হয়?','কার্বন ডাই-অক্সাইড','নাইট্রোজেন','অক্সিজেন','হাইড্রোজেন','c','উদ্ভিদ CO₂ গ্রহণ করে O₂ ত্যাগ করে।'),
(16,'ssc','বিজ্ঞান','পদার্থ','আলোর গতিবেগ প্রতি সেকেন্ডে কত?','৩ লক্ষ কিমি','৩০ লক্ষ কিমি','৩ হাজার কিমি','৩০ হাজার কিমি','a','শূন্য মাধ্যমে আলোর বেগ ≈ ৩×১০⁸ মি/সে = ৩ লক্ষ কিমি/সে।'),
(17,'ssc','বিজ্ঞান','জীববিজ্ঞান','মানবদেহের বৃহত্তম অঙ্গ কোনটি?','যকৃত','ত্বক','ফুসফুস','হৃৎপিণ্ড','b','ত্বক মানবদেহের সবচেয়ে বড় অঙ্গ।'),
(18,'ssc','বিজ্ঞান','রসায়ন','লবণের রাসায়নিক নাম কী?','সোডিয়াম ক্লোরাইড','পটাশিয়াম ক্লোরাইড','ক্যালসিয়াম কার্বনেট','সোডিয়াম কার্বনেট','a','খাবার লবণ = NaCl = সোডিয়াম ক্লোরাইড।'),
-- SSC ইংরেজি (৬)
(19,'ssc','ইংরেজি','Grammar','Which one is a noun?','Run','Beauty','Quickly','Happy','b','Beauty একটি abstract noun।'),
(20,'ssc','ইংরেজি','Grammar','"He ___ to school every day." — সঠিক verb?','go','goes','going','gone','b','Third person singular-এ verb-এর সাথে s/es যোগ হয়।'),
(21,'ssc','ইংরেজি','Grammar','Synonym of "Happy"?','Sad','Glad','Angry','Tired','b','Glad = আনন্দিত = Happy-এর সমার্থক।'),
(22,'ssc','ইংরেজি','Grammar','Plural of "Child"?','Childs','Childes','Children','Childrens','c','Child-এর plural = Children (irregular)।'),
(23,'ssc','ইংরেজি','Grammar','"I have been living here ___ 2010."','for','since','from','by','b','নির্দিষ্ট সময়বিন্দুর জন্য since ব্যবহৃত হয়।'),
(24,'ssc','ইংরেজি','Grammar','Antonym of "Brave"?','Bold','Coward','Strong','Smart','b','Brave (সাহসী) ↔ Coward (ভীরু)।'),
-- HSC ICT (৬)
(25,'hsc','ICT','সংখ্যা পদ্ধতি','বাইনারি (১০১১)₂ = দশমিকে কত?','৯','১০','১১','১২','c','১×৮+০×৪+১×২+১×১ = ১১।'),
(26,'hsc','ICT','ডেটাবেজ','SQL-এর পূর্ণরূপ কী?','Structured Query Language','Simple Query Language','Standard Query Language','System Query Language','a','SQL = Structured Query Language।'),
(27,'hsc','ICT','নেটওয়ার্ক','WWW-এর জনক কে?','বিল গেটস','টিম বার্নার্স-লি','স্টিভ জবস','মার্ক জাকারবার্গ','b','১৯৮৯ সালে টিম বার্নার্স-লি WWW উদ্ভাবন করেন।'),
(28,'hsc','ICT','প্রোগ্রামিং','C ভাষায় প্রোগ্রাম শুরু হয় কোন ফাংশন দিয়ে?','start()','begin()','main()','init()','c','প্রতিটি C প্রোগ্রামের এন্ট্রি পয়েন্ট main()।'),
(29,'hsc','ICT','সংখ্যা পদ্ধতি','হেক্সাডেসিমেলে মোট প্রতীক কয়টি?','৮','১০','১৬','২','c','হেক্সাডেসিমেল: 0-9 এবং A-F = ১৬টি প্রতীক।'),
(30,'hsc','ICT','লজিক গেট','কোন গেটকে সর্বজনীন গেট বলা হয়?','AND','OR','NOT','NAND','d','NAND ও NOR — সর্বজনীন গেট, এদের দিয়ে সব গেট বানানো যায়।'),
-- HSC পদার্থবিজ্ঞান (৪)
(31,'hsc','পদার্থবিজ্ঞান','ভেক্টর','ভেক্টর রাশির উদাহরণ কোনটি?','দ্রুতি','ভর','বেগ','তাপমাত্রা','c','বেগের মান ও দিক দুটোই আছে — তাই ভেক্টর।'),
(32,'hsc','পদার্থবিজ্ঞান','গতি','নিউটনের দ্বিতীয় সূত্র কোনটি?','F = ma','E = mc²','V = IR','P = VI','a','বল = ভর × ত্বরণ — নিউটনের ২য় সূত্র।'),
(33,'hsc','পদার্থবিজ্ঞান','তাপ','পরম শূন্য তাপমাত্রা কত?','০°C','-১০০°C','-২৭৩.১৫°C','-৩৭৩°C','c','পরম শূন্য = ০ কেলভিন = -২৭৩.১৫°C।'),
(34,'hsc','পদার্থবিজ্ঞান','তড়িৎ','ওহমের সূত্র কোনটি?','V = IR','F = ma','P = mv','W = Fs','a','V (ভোল্টেজ) = I (কারেন্ট) × R (রোধ)।'),
-- HSC রসায়ন (৪)
(35,'hsc','রসায়ন','পরমাণু','কার্বনের পারমাণবিক সংখ্যা কত?','৪','৬','৮','১২','b','কার্বনের প্রোটন সংখ্যা = ৬।'),
(36,'hsc','রসায়ন','অম্ল-ক্ষার','pH ৭-এর কম হলে দ্রবণটি কী?','ক্ষারীয়','নিরপেক্ষ','অম্লীয়','লবণাক্ত','c','pH < ৭ = অম্লীয়, pH > ৭ = ক্ষারীয়।'),
(37,'hsc','রসায়ন','জৈব','মিথেনের সংকেত কোনটি?','CH₄','C₂H₆','C₂H₄','CO₂','a','মিথেন = CH₄, সরলতম হাইড্রোকার্বন।'),
(38,'hsc','রসায়ন','পরমাণু','ইলেকট্রনের আধান কী?','ধনাত্মক','ঋণাত্মক','নিরপেক্ষ','পরিবর্তনশীল','b','ইলেকট্রন ঋণাত্মক আধানবিশিষ্ট কণা।'),
-- NU/Job সাধারণ জ্ঞান (১০)
(39,'job','সাধারণ জ্ঞান','বাংলাদেশ','বাংলাদেশের স্বাধীনতা দিবস কবে?','১৬ ডিসেম্বর','২৬ মার্চ','২১ ফেব্রুয়ারি','৭ মার্চ','b','২৬ মার্চ ১৯৭১ — স্বাধীনতা ঘোষণার দিন।'),
(40,'job','সাধারণ জ্ঞান','বাংলাদেশ','জাতীয় সংসদ ভবনের স্থপতি কে?','লুই কান','এফ আর খান','মাজহারুল ইসলাম','নভেরা আহমেদ','a','মার্কিন স্থপতি লুই আই কান জাতীয় সংসদ ভবনের নকশা করেন।'),
(41,'job','সাধারণ জ্ঞান','বাংলাদেশ','বাংলাদেশের বৃহত্তম জেলা কোনটি?','ঢাকা','চট্টগ্রাম','রাঙামাটি','সিলেট','c','আয়তনে রাঙামাটি বাংলাদেশের বৃহত্তম জেলা।'),
(42,'job','সাধারণ জ্ঞান','আন্তর্জাতিক','জাতিসংঘের সদর দপ্তর কোথায়?','জেনেভা','প্যারিস','নিউইয়র্ক','লন্ডন','c','জাতিসংঘ সদর দপ্তর — নিউইয়র্ক, যুক্তরাষ্ট্র।'),
(43,'job','সাধারণ জ্ঞান','বাংলাদেশ','"ছয় দফা" কে ঘোষণা করেন?','মাওলানা ভাসানী','শেখ মুজিবুর রহমান','হোসেন শহীদ সোহরাওয়ার্দী','এ কে ফজলুল হক','b','১৯৬৬ সালে বঙ্গবন্ধু শেখ মুজিবুর রহমান ছয় দফা ঘোষণা করেন।'),
(44,'job','সাধারণ জ্ঞান','আন্তর্জাতিক','বিশ্বের দীর্ঘতম নদী কোনটি?','আমাজন','নীলনদ','মিসিসিপি','ইয়াংসিকিয়াং','b','নীলনদ (~৬৬৫০ কিমি) — সাধারণভাবে দীর্ঘতম ধরা হয়।'),
(45,'job','সাধারণ জ্ঞান','বাংলা সাহিত্য','জাতীয় কবি কে?','রবীন্দ্রনাথ ঠাকুর','কাজী নজরুল ইসলাম','জসীমউদ্‌দীন','শামসুর রাহমান','b','কাজী নজরুল ইসলাম বাংলাদেশের জাতীয় কবি।'),
(46,'job','সাধারণ জ্ঞান','বাংলাদেশ','মুক্তিযুদ্ধে সেক্টর কয়টি ছিল?','৯টি','১০টি','১১টি','১২টি','c','১৯৭১ সালে মুক্তিযুদ্ধ ১১টি সেক্টরে পরিচালিত হয়।'),
(47,'job','সাধারণ জ্ঞান','কম্পিউটার','কম্পিউটারের জনক কে?','চার্লস ব্যাবেজ','অ্যালান টুরিং','জন ভন নিউম্যান','বিল গেটস','a','চার্লস ব্যাবেজকে কম্পিউটারের জনক বলা হয়।'),
(48,'job','সাধারণ জ্ঞান','বাংলাদেশ','সুন্দরবন কোন দুই দেশে অবস্থিত?','বাংলাদেশ-মিয়ানমার','বাংলাদেশ-ভারত','ভারত-নেপাল','বাংলাদেশ-ভুটান','b','সুন্দরবনের ৬৬% বাংলাদেশে, ৩৪% ভারতে।');
