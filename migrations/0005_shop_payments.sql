-- এডুসব ফেজ-৫: ই-কমার্স শপ + ম্যানুয়াল পেমেন্ট + অ্যাসিস্টেড আবেদন + পপ-আপ সাইনবোর্ড

-- প্রোডাক্ট (এডমিন ফুল CRUD)
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_bn TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other',     -- books | stationery | electronics | package | other
  price INTEGER NOT NULL,                     -- টাকা
  offer_price INTEGER,                        -- অফার দাম (NULL = অফার নেই)
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,                             -- ছবির URL অথবা emoji
  is_active INTEGER NOT NULL DEFAULT 1,
  is_signboard INTEGER NOT NULL DEFAULT 0,    -- পপ-আপ সাইনবোর্ড টগল (সর্বোচ্চ ৫টি শো হবে)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- অর্ডার (COD / ওয়ালেট)
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,                            -- NULL = গেস্ট অর্ডার
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cod', -- cod | wallet
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',     -- pending | confirmed | shipped | delivered | cancelled
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,                 -- স্ন্যাপশট
  unit_price INTEGER NOT NULL,
  qty INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ম্যানুয়াল পেমেন্ট রিকোয়েস্ট (বিকাশ/নগদ → এডমিন অ্যাপ্রুভ → ওয়ালেট ক্রেডিট)
CREATE TABLE IF NOT EXISTS payment_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  method TEXT NOT NULL,                       -- bkash | nagad
  sender_number TEXT NOT NULL,
  trx_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  screenshot_data TEXT,                       -- base64 (compressed client-side)
  status TEXT NOT NULL DEFAULT 'pending',     -- pending | approved | rejected
  admin_note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_payreq_user ON payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payreq_status ON payment_requests(status);

-- এডমিন-অ্যাসিস্টেড আবেদন সার্ভিস
CREATE TABLE IF NOT EXISTS assisted_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  service_type TEXT NOT NULL,                 -- admission | job_application | form_fillup | other
  details TEXT NOT NULL,                      -- ইউজারের বিবরণ (কোন আবেদন, লিংক, ডেডলাইন)
  fee INTEGER,                                -- এডমিন সেট করবে
  status TEXT NOT NULL DEFAULT 'requested',   -- requested | quoted | paid | processing | done | cancelled
  admin_note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_assisted_user ON assisted_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_assisted_status ON assisted_requests(status);

-- পেমেন্ট নম্বর সেটিংস (এডমিন প্যানেল থেকে বদলাবে; মালিক পরে আসল নম্বর দেবেন)
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('bkash_number', ''),
  ('nagad_number', ''),
  ('whatsapp_number', ''),
  ('cod_charge', '0');

-- নমুনা প্রোডাক্ট সিড (এডমিন এডিট/ডিলিট করতে পারবে)
INSERT OR IGNORE INTO products (id, name_bn, description, category, price, offer_price, stock, image_url, is_signboard) VALUES
  (1, 'এইচএসসি টেস্ট পেপার ২০২৬ (সকল বিষয়)', 'সর্বশেষ বোর্ড প্রশ্ন + মডেল টেস্ট সংকলন', 'books', 450, 380, 25, '📚', 1),
  (2, 'এসএসসি সাজেশন প্যাক ২০২৬', 'গুরুত্বপূর্ণ প্রশ্ন + অধ্যায়ভিত্তিক সাজেশন PDF + প্রিন্ট', 'books', 250, 199, 40, '📖', 1),
  (3, 'জব সলিউশন (সাম্প্রতিক সংস্করণ)', 'বিগত সালের সরকারি চাকরির প্রশ্ন সমাধান', 'books', 550, NULL, 15, '💼', 0),
  (4, 'সায়েন্টিফিক ক্যালকুলেটর FX-991', 'পরীক্ষা-অনুমোদিত ক্যালকুলেটর', 'electronics', 1450, 1350, 10, '🧮', 1),
  (5, 'জ্যামিতি বক্স (প্রিমিয়াম)', 'কম্পাস, স্কেল, চাঁদা — সম্পূর্ণ সেট', 'stationery', 180, NULL, 50, '📐', 0),
  (6, 'খাতা বান্ডেল (১২টি, ২০০ পৃষ্ঠা)', 'উন্নত মানের কাগজ, মার্জিনসহ', 'stationery', 720, 650, 30, '📝', 0);
