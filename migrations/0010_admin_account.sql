-- এডমিন অ্যাকাউন্ট তৈরি / আপডেট
-- Phone: 01835414122
-- Pass: 52944820
-- Hash (PBKDF2 SHA-256): c5d1cabaacc84bbacd5f3a9044d492f65922b56e9cf1dd095480965b044545bf
-- Salt: edusob_admin_salt_2026

INSERT INTO users (user_code, name_bn, name_en, email, phone, password_hash, salt, religion, education_level, role)
VALUES ('EDU-2026-ADMIN', 'এডমিন', 'Admin', 'admin@edusob.com', '01835414122', 'c5d1cabaacc84bbacd5f3a9044d492f65922b56e9cf1dd095480965b044545bf', 'edusob_admin_salt_2026', 'islam', 'masters', 'admin')
ON CONFLICT(phone) DO UPDATE SET
  password_hash = excluded.password_hash,
  salt = excluded.salt,
  role = 'admin';
