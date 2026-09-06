-- এডমিন অ্যাকাউন্ট তৈরি / আপডেট
-- Phone: 01835414122
-- Pass: Ab52944820@
-- Hash (PBKDF2 SHA-256): 1832ba446f677ffe11a2b017c895fed84e85bcf0cb05df1f9c2dbc8f7e85c075
-- Salt: edusob_admin_salt_2026

INSERT INTO users (user_code, name_bn, name_en, email, phone, password_hash, salt, religion, education_level, role)
VALUES ('EDU-2026-ADMIN', 'এডমিন', 'Admin', 'ab5353069@gmail.com', '01835414122', '1832ba446f677ffe11a2b017c895fed84e85bcf0cb05df1f9c2dbc8f7e85c075', 'edusob_admin_salt_2026', 'islam', 'masters', 'admin')
ON CONFLICT(phone) DO UPDATE SET
  email = 'ab5353069@gmail.com',
  password_hash = excluded.password_hash,
  salt = excluded.salt,
  role = 'admin';
