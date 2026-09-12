-- এডমিন অ্যাকাউন্ট তৈরি (শুধু প্রথমবার)
-- Phone: 01829486022
--
-- ⚠️ সিকিউরিটি (audit): আগে এখানে পাসওয়ার্ডের প্লেইনটেক্সট কপি ও
-- `ON CONFLICT DO UPDATE SET password_hash = excluded.password_hash` ছিল —
-- অর্থাৎ মাইগ্রেশন চললেই এডমিন পাসওয়ার্ড হার্ডকোডেড মানে ফিরে যেত, আর
-- রিপোটি পাবলিক হওয়ায় সেই পাসওয়ার্ড সবার জন্য পড়া যেত।
-- এখন: কোনো প্লেইনটেক্সট নেই, আর পাসওয়ার্ড কখনোই রিসেট করা হয় না।
--
-- নিচের হ্যাশটি PBKDF2-SHA256 (100000 ইটারেশন, 32 বাইট, salt: edusob_admin_salt_2026)।
-- এটি কেবল বুটস্ট্র্যাপ ডিফল্ট — প্রোডাকশনে ডিপ্লয়ের পরপরই এডমিন পাসওয়ার্ড
-- বদলে ফেলতে হবে। প্লেইনটেক্সট কখনোই রিপোজিটরিতে রাখা হয় না।

INSERT INTO users (user_code, name_bn, name_en, email, phone, password_hash, salt, religion, education_level, role)
VALUES ('EDU-2026-ADMIN', 'এডমিন', 'Admin', 'ab5353069@gmail.com', '01829486022', '1832ba446f677ffe11a2b017c895fed84e85bcf0cb05df1f9c2dbc8f7e85c075', 'edusob_admin_salt_2026', 'islam', 'masters', 'admin')
ON CONFLICT(phone) DO UPDATE SET
  role = 'admin';  -- FIX(audit): password_hash/salt আর কখনোই ওভাররাইট করা হয় না

UPDATE users SET phone = '01829486022' WHERE phone = '01835414122';
DELETE FROM sessions;
