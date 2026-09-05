-- ফেজ-১১: প্রিমিয়াম শিক্ষক সহায়তা (Teacher Support & Doubt Solving Portal)

-- ১. শিক্ষক ও মেন্টর প্রোফাইল টেবিল
CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  subject TEXT NOT NULL,
  education_level TEXT NOT NULL DEFAULT 'all', -- all | ssc | hsc | nu | masters | job
  avatar TEXT DEFAULT '',
  experience_years INTEGER NOT NULL DEFAULT 5,
  rating REAL NOT NULL DEFAULT 4.9,
  total_solved INTEGER NOT NULL DEFAULT 150,
  response_time TEXT NOT NULL DEFAULT '১৫-৩০ মিনিট',
  bio TEXT DEFAULT '',
  is_online INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ২. শিক্ষক সহায়তা টিকিট / ডাউট সলভ টেবিল
CREATE TABLE IF NOT EXISTS teacher_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_code TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  teacher_id INTEGER,
  subject TEXT NOT NULL,
  education_level TEXT NOT NULL DEFAULT 'general',
  topic TEXT NOT NULL,
  question TEXT NOT NULL,
  attachment_url TEXT DEFAULT '',
  urgency TEXT NOT NULL DEFAULT 'normal', -- normal | urgent
  status TEXT NOT NULL DEFAULT 'pending', -- pending | answering | answered | closed
  answer TEXT DEFAULT '',
  answer_attachments TEXT DEFAULT '[]',
  answered_by_name TEXT DEFAULT '',
  answered_at DATETIME,
  rating INTEGER DEFAULT 0,
  user_feedback TEXT DEFAULT '',
  is_public INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);
CREATE INDEX IF NOT EXISTS idx_tt_user ON teacher_tickets(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tt_subject ON teacher_tickets(subject, is_public);

-- ৩. শিক্ষক লাইভ কনসাল্টেশন সেশন বুকিং টেবিল
CREATE TABLE IF NOT EXISTS teacher_consultations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  teacher_id INTEGER NOT NULL,
  topic TEXT NOT NULL,
  preferred_date TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  meeting_link TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'requested', -- requested | approved | completed | cancelled
  note TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);
CREATE INDEX IF NOT EXISTS idx_tc_user ON teacher_consultations(user_id);

-- ৪. ফিচার টগল
INSERT OR IGNORE INTO feature_toggles (key, name_bn, is_enabled, note) VALUES
  ('teacher_support', 'শিক্ষক সহায়তা পোর্টাল', 1, 'প্রিমিয়াম ইউজারদের ১-অন-১ ডাউট সলভিং');

-- ৫. প্রিমিয়াম প্ল্যানে শিক্ষক সহায়তা ফিচার যুক্ত করা
UPDATE plans SET 
  features = '["স্ট্যান্ডার্ডের সবকিছু","👑 ১-অন-১ শিক্ষক সহায়তা ও ডাউট সলভ","১৫-৩০ মিনিটে বিশেষজ্ঞ শিক্ষকের সমাধান","লাইভ শিক্ষক কনসাল্টেশন বুকিং","সব CV টেমপ্লেট ফ্রি (৳৫০ সহ)","সম্পূর্ণ প্রশ্নপত্র ব্যাংক ও সাজেশন","AI সহকারী আনলিমিটেড"]'
WHERE slug = 'premium';

UPDATE plans SET 
  features = '["ফ্রি প্ল্যানের সবকিছু","আনলিমিটেড MCQ কুইজ","স্ট্যান্ডার্ড CV টেমপ্লেট (৳৩০) ফ্রি","প্রশ্নপত্র ব্যাংক (স্ট্যান্ডার্ড)","ভুল-ব্যাংক স্মার্ট রিভিশন","টিচার ডাউট ব্যাংক অ্যাক্সেস","অগ্রাধিকার সাপোর্ট"]'
WHERE slug = 'standard';

-- ৬. অভিজ্ঞ শিক্ষকবৃন্দের সিড ডেটা
INSERT OR IGNORE INTO teachers (id, name, designation, subject, education_level, avatar, experience_years, rating, total_solved, response_time, bio, is_online) VALUES
  (1, 'ড. রফিকুল ইসলাম', 'সহযোগী অধ্যাপক, ঢাকা বিশ্ববিদ্যালয়', 'পদার্থবিজ্ঞান ও উচ্চতর গণিত', 'hsc', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 12, 4.95, 420, '১৫-২০ মিনিট', 'বিগত ১২ বছর ধরে এইচএসসি ও বিশ্ববিদ্যালয় ভর্তি শিক্ষার্থীদের পদার্থবিজ্ঞান ও গণিতের কঠিন সমস্যা সমাধানে সহায়তা প্রদান করছেন।', 1),
  (2, 'মুহাম্মদ তানভীর আহমেদ', 'সিনিয়র লেকচারার ও গণিত অলিম্পিয়াড ট্রেইনার', 'গণিত ও ক্যালকুলাস', 'all', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 8, 4.92, 385, '১০-১৫ মিনিট', 'জ্যামিতি, বীজগণিত ও ক্যালকুলাসের জটিল উপপাদ্য সহজে চিত্রসহ বুঝিয়ে দেওয়ায় অভিজ্ঞ।', 1),
  (3, 'মোসাম্মৎ নাজমুন নাহার', 'বিসিএস শিক্ষা ক্যাডার (৩৮তম)', 'ইংরেজি ব্যাকরণ ও ফ্রি-হ্যান্ড রাইটিং', 'job', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', 7, 4.98, 510, '১৫-২৫ মিনিট', 'এইচএসসি ও বিসিএস/চাকরিপ্রার্থীদের ইংরেজি গ্রামার রুলস, ট্রান্সলেশন ও রাইটিং ডাউট ক্লিয়ারিং স্পেশালিস্ট।', 1),
  (4, 'মাহমুদুল হাসান', 'হিসাববিজ্ঞান বিভাগীয় প্রধান (জাতীয় বিশ্ববিদ্যালয় মেন্টর)', 'হিসাববিজ্ঞান ও ফিন্যান্স', 'nu', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 10, 4.89, 310, '২০-৩০ মিনিট', 'জাতীয় বিশ্ববিদ্যালয়ের অনার্স ১ম-৪র্থ বর্ষ ও ডিগ্রি শিক্ষার্থীদের হিসাববিজ্ঞান ও পরিসংখ্যান সহজ নিয়মে বোঝান।', 1),
  (5, 'ড. ফারহানা হক', 'সহকারী অধ্যাপক, প্রাণিবিজ্ঞান ও মেডিকেল মেন্টর', 'জীববিজ্ঞান ও রসায়ন', 'hsc', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80', 9, 4.96, 445, '১৫-২০ মিনিট', 'মেডিকেল এডমিশন ও এইচএসসি রসায়ন-জীববিজ্ঞানের বিক্রিয়া ও চিত্রভিত্তিক বিশ্লেষণ দেন।', 1),
  (6, 'প্রকৌশলী শফিউল আলম', 'আইসিটি ও কম্পিউটার সায়েন্স ফ্যাকাল্টি', 'ICT ও প্রোগ্রামিং', 'all', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80', 6, 4.90, 275, '১০-২০ মিনিট', 'এইচএসসি আইসিটি (সি প্রোগ্রামিং, এইচটিএমএল, লজিক গেট) ও বেসিক আইটি সমস্যার সহজ ব্যাখ্যা।', 1);

-- ৭. কিছু সলভকৃত ডাউটের সিড ডেটা (যাতে স্টুডেন্টরা সলভড লাইব্রেরিতে অসাধারণ কন্টেন্ট দেখতে পায়)
INSERT OR IGNORE INTO teacher_tickets (id, ticket_code, user_id, teacher_id, subject, education_level, topic, question, urgency, status, answer, answered_by_name, answered_at, rating, is_public) VALUES
  (1, 'TS-2026-001', 1, 2, 'গণিত', 'hsc', 'ক্যালকুলাস — লিমিটের মান নির্ণয়', 'lim(x→0) (sin 5x / sin 3x) এর মান কিভাবে সরাসরি এবং L''Hospital নিয়মে বের করব?', 'normal', 'answered', 'সমাধান:\n১. স্ট্যান্ডার্ড সূত্র পদ্ধতি:\nlim(x→0) [(sin 5x / 5x) * 5] / [(sin 3x / 3x) * 3]\nযেহেতু lim(θ→0) (sin θ / θ) = 1,\n= (1 * 5) / (1 * 3) = 5/3 (উত্তর)\n\n২. L''Hospital নিয়ম:\nলব ও হর উভয়ই 0/0 আকার। সুতরাং x এর সাপেক্ষে অন্তরীকরণ করি:\nlim(x→0) (5 cos 5x) / (3 cos 3x) = (5 * cos 0) / (3 * cos 0) = 5/3।', 'মুহাম্মদ তানভীর আহমেদ', datetime('now', '-2 hours'), 5, 1),
  (2, 'TS-2026-002', 1, 3, 'ইংরেজি', 'job', 'Right Form of Verbs — ''No sooner had''', '''No sooner had he left the room than it began to rain'' — এই বাক্যের গঠন ও ট্রান্সফরমেশন বুঝিয়ে দিন।', 'urgent', 'answered', 'ব্যাখ্যা ও সূত্র:\nগঠন: No sooner had + Subject + Verb এর Past Participle (V3) + ... + than + Subject + Past Indefinite (V2)।\n\nমনে রাখবেন:\n১. No sooner had এর সাথে সবসময় ''than'' বসে (then বা when কখনোই হবে না)।\n২. As soon as এ রূপান্তর: "As soon as he left the room, it began to rain."\n৩. Hardly had / Scarcely had দিয়ে করলে: "Hardly had he left the room when/before it began to rain."', 'মোসাম্মৎ নাজমুন নাহার', datetime('now', '-5 hours'), 5, 1),
  (3, 'TS-2026-003', 1, 1, 'পদার্থবিজ্ঞান', 'hsc', 'কাজ, ক্ষমতা ও শক্তি — কুয়া খালি করার অংক', '১০ মিটার গভীর ও ২ মিটার ব্যাসের একটি পানিপূর্ণ কুয়া খালি করতে ৩ অশ্বক্ষমতার একটি পাম্পের কত সময় লাগবে?', 'normal', 'answered', 'সমাধান:\n১. কুয়ার আয়তন V = π * r² * h = 3.1416 * (1)² * 10 = 31.416 m³\n২. পানির ভর m = V * ρ = 31.416 * 1000 = 31416 kg\n৩. ভারকেন্দ্রের সরণ h'' = h/2 = 10/2 = 5 m\n৪. মোট কাজ W = m * g * h'' = 31416 * 9.8 * 5 = 1539384 Joule\n৫. ক্ষমতা P = 3 HP = 3 * 746 = 2238 Watt\n৬. প্রয়োজনীয় সময় t = W / P = 1539384 / 2238 ≈ 687.84 সেকেন্ড ≈ 11.46 মিনিট (উত্তর)।', 'ড. রফিকুল ইসলাম', datetime('now', '-1 day'), 5, 1);
