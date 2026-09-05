-- এডুসব ফেজ-৪: CV মেকার — ১০ টেমপ্লেট + এডমিন কাস্টমাইজার + ইউজার CV ডেটা

-- CV টেমপ্লেট (এডমিন কাস্টমাইজেবল: কালার, ফন্ট, সেকশন-অর্ডার, ফিল্ড-লেআউট, দাম)
CREATE TABLE IF NOT EXISTS cv_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name_bn TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,           -- টাকা; 0 = ফ্রি
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  config TEXT NOT NULL,                       -- JSON: {primary, accent, font, layout, headerStyle, contactPos, sectionOrder[], watermark}
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ইউজার CV (ডেটা এক জায়গায়, যেকোনো টেমপ্লেটে রেন্ডার)
CREATE TABLE IF NOT EXISTS user_cvs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL DEFAULT 'আমার সিভি',
  template_slug TEXT NOT NULL DEFAULT 'sorol-bangla',
  lang TEXT NOT NULL DEFAULT 'bn',            -- bn | en
  with_photo INTEGER NOT NULL DEFAULT 1,
  data TEXT NOT NULL,                         -- JSON: {name, designation, phone, email, address, objective, education[], experience[], skills[], languages[], references[], extra}
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_user_cvs_user ON user_cvs(user_id);

-- ১০ টেমপ্লেট সিড (MASTER_PLAN অনুযায়ী নাম ও দাম; এডমিন পরে বদলাতে পারবে)
INSERT OR IGNORE INTO cv_templates (slug, name_bn, price, sort_order, config) VALUES
('sorol-bangla', 'সরল বাংলা', 0, 1,
 '{"primary":"#0f766e","accent":"#0d9488","font":"Hind Siliguri","layout":"single","headerStyle":"simple","contactPos":"below","sectionOrder":["objective","education","skills","languages","experience","references"],"watermark":true}'),
('executive-navy', 'Executive Navy', 30, 2,
 '{"primary":"#1e3a8a","accent":"#3b82f6","font":"Hind Siliguri","layout":"single","headerStyle":"band","contactPos":"beside","sectionOrder":["objective","experience","education","skills","languages","references"],"watermark":false}'),
('modern-teal', 'Modern Teal', 30, 3,
 '{"primary":"#0f766e","accent":"#14b8a6","font":"Hind Siliguri","layout":"sidebar-left","headerStyle":"band","contactPos":"sidebar","sectionOrder":["objective","education","experience","skills","languages","references"],"watermark":false}'),
('elegant-serif', 'Elegant Serif', 30, 4,
 '{"primary":"#374151","accent":"#6b7280","font":"Georgia, Tiro Bangla","layout":"single","headerStyle":"center","contactPos":"below","sectionOrder":["objective","education","experience","skills","languages","references"],"watermark":false}'),
('crimson-bold', 'Crimson Bold', 30, 5,
 '{"primary":"#991b1b","accent":"#dc2626","font":"Hind Siliguri","layout":"single","headerStyle":"band","contactPos":"beside","sectionOrder":["objective","experience","skills","education","languages","references"],"watermark":false}'),
('minimal-mono', 'Minimal Mono', 30, 6,
 '{"primary":"#111827","accent":"#4b5563","font":"Hind Siliguri","layout":"single","headerStyle":"simple","contactPos":"below","sectionOrder":["objective","experience","education","skills","languages","references"],"watermark":false}'),
('royal-purple', 'Royal Purple', 50, 7,
 '{"primary":"#5b21b6","accent":"#8b5cf6","font":"Hind Siliguri","layout":"sidebar-left","headerStyle":"band","contactPos":"sidebar","sectionOrder":["objective","experience","education","skills","languages","references"],"watermark":false}'),
('golden-classic', 'Golden Classic', 50, 8,
 '{"primary":"#92400e","accent":"#d97706","font":"Georgia, Tiro Bangla","layout":"single","headerStyle":"center","contactPos":"below","sectionOrder":["objective","education","experience","skills","languages","references"],"watermark":false}'),
('two-column-slate', 'Two-Column Slate', 50, 9,
 '{"primary":"#334155","accent":"#64748b","font":"Hind Siliguri","layout":"sidebar-right","headerStyle":"band","contactPos":"sidebar","sectionOrder":["objective","experience","education","skills","languages","references"],"watermark":false}'),
('creative-gradient', 'Creative Gradient', 50, 10,
 '{"primary":"#be185d","accent":"#7c3aed","font":"Hind Siliguri","layout":"sidebar-left","headerStyle":"gradient","contactPos":"sidebar","sectionOrder":["objective","skills","experience","education","languages","references"],"watermark":false}');
