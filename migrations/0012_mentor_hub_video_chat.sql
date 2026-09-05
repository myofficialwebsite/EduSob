-- ফেজ-১২: শিক্ষক মেন্টর অ্যাকাউন্ট, দ্বিমুখী লাইভ মেসেজ ও ভিডিও কল রুম

-- শিক্ষক ও শিক্ষার্থী দ্বিমুখী লাইভ চ্যাট মেসেজ টেবিল
CREATE TABLE IF NOT EXISTS teacher_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  sender_type TEXT NOT NULL DEFAULT 'teacher', -- 'student' | 'teacher' | 'admin'
  sender_id INTEGER NOT NULL,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  attachment_url TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tm_ticket ON teacher_messages(ticket_id);

-- লাইভ ভিডিও ও অডিও কল রুম সেশন টেবিল
CREATE TABLE IF NOT EXISTS teacher_video_rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_code TEXT UNIQUE NOT NULL,
  ticket_id INTEGER,
  consultation_id INTEGER,
  teacher_id INTEGER,
  teacher_name TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  user_name TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'ended'
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ended_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tvr_room ON teacher_video_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_tvr_ticket ON teacher_video_rooms(ticket_id, status);
CREATE INDEX IF NOT EXISTS idx_tvr_user ON teacher_video_rooms(user_id, status);
