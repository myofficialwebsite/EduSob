// Node.js SQLite D1Database Compatibility Layer
import { randomHex } from './auth'

export interface D1Result<T = any> {
  results: T[]
  success: boolean
  meta: {
    last_row_id?: number
    changes?: number
    duration?: number
    served_by?: string
  }
}

export interface D1PreparedStatement {
  bind(...params: any[]): D1PreparedStatement
  first<T = any>(colName?: string): Promise<T | null>
  all<T = any>(): Promise<D1Result<T>>
  run(): Promise<D1Result<any>>
  raw<T = any[]>(): Promise<T[]>
}

export interface D1Database {
  prepare(sql: string): D1PreparedStatement
  batch(statements: D1PreparedStatement[]): Promise<D1Result<any>[]>
  exec(sql: string): Promise<{ count: number; duration: number }>
}

let sqliteDbInstance: any | null = null
let d1Instance: D1Database | null = null

function createPreparedStatement(db: any, sql: string, boundParams: any[] = []): D1PreparedStatement {
  return {
    bind(...params: any[]) {
      return createPreparedStatement(db, sql, params)
    },
    async first<T = any>(colName?: string): Promise<T | null> {
      try {
        const stmt = db.prepare(sql)
        const row = stmt.get(...boundParams) as Record<string, any> | undefined
        if (!row) return null
        const plain = { ...row }
        if (colName) {
          return (plain[colName] ?? null) as T
        }
        return plain as T
      } catch (err) {
        console.error('D1 first() query error:', sql, boundParams, err)
        throw err
      }
    },
    async all<T = any>(): Promise<D1Result<T>> {
      try {
        const stmt = db.prepare(sql)
        const rows = stmt.all(...boundParams) as Record<string, any>[]
        return {
          results: rows.map(r => ({ ...r })) as T[],
          success: true,
          meta: { changes: 0 }
        }
      } catch (err) {
        console.error('D1 all() query error:', sql, boundParams, err)
        throw err
      }
    },
    async run(): Promise<D1Result<any>> {
      try {
        const stmt = db.prepare(sql)
        const res = stmt.run(...boundParams)
        return {
          results: [],
          success: true,
          meta: {
            last_row_id: Number(res.lastInsertRowid),
            changes: res.changes
          }
        }
      } catch (err) {
        console.error('D1 run() query error:', sql, boundParams, err)
        throw err
      }
    },
    async raw<T = any[]>(): Promise<T[]> {
      const stmt = db.prepare(sql)
      const rows = stmt.all(...boundParams) as Record<string, any>[]
      return rows.map(r => Object.values(r)) as T[]
    }
  }
}

export async function initDatabase(): Promise<D1Database> {
  if (d1Instance) return d1Instance

  // Dynamic imports for local dev environment (avoiding Cloudflare Pages bundling errors)
  let fs: any, path: any, crypto: any, DatabaseSync: any
  try {
    fs = await import('node:' + 'fs')
    path = await import('node:' + 'path')
    crypto = await import('node:' + 'crypto')
    const sqlite = await import('node:' + 'sqlite')
    DatabaseSync = sqlite.DatabaseSync
  } catch (e) {
    throw new Error('DatabaseSync is not available. Ensure you are running in a Node.js environment or provide env.DB')
  }

  const dataDir = path.resolve(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  const dbPath = path.join(dataDir, 'edusob.sqlite')
  const db = new DatabaseSync(dbPath)
  sqliteDbInstance = db

  // Enable WAL mode for better concurrency and foreign keys
  try {
    db.exec('PRAGMA journal_mode = WAL;')
    db.exec('PRAGMA foreign_keys = ON;')
  } catch (e) {
    console.warn('PRAGMA setup note:', e)
  }

  // Create migrations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Run all migrations in order
  const migrationsDir = path.resolve(process.cwd(), 'migrations')
  if (fs.existsSync(migrationsDir)) {
    const files = fs.readdirSync(migrationsDir)
      .filter((f: string) => f.endsWith('.sql'))
      .sort()

    for (const file of files) {
      const checkStmt = db.prepare('SELECT id FROM _migrations WHERE name = ?')
      const executed = checkStmt.get(file)
      if (!executed) {
        console.log(`[Database] Applying migration: ${file}`)
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8')
        try {
          db.exec(sql)
          const insertStmt = db.prepare('INSERT INTO _migrations (name) VALUES (?)')
          insertStmt.run(file)
        } catch (err) {
          console.error(`[Database] Migration failed on ${file}:`, err)
        }
      }
    }
  }

  // Safe column check for teachers & question_papers table
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS scholarships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        provider TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'general',
        target_level TEXT NOT NULL DEFAULT 'all',
        min_gpa REAL NOT NULL DEFAULT 3.5,
        max_family_income INTEGER NOT NULL DEFAULT 300000,
        quota TEXT DEFAULT 'all',
        eligible_districts TEXT DEFAULT 'all',
        stipend_amount TEXT NOT NULL DEFAULT '৳১০,০০০ - ৳৫০,০০০/বছর',
        deadline TEXT NOT NULL,
        apply_link TEXT NOT NULL DEFAULT 'https://shed.gov.bd',
        required_docs TEXT DEFAULT '[]',
        steps_roadmap TEXT DEFAULT '[]',
        tips_guideline TEXT DEFAULT '',
        downloads INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_scholarships_level ON scholarships(target_level, is_active);
      CREATE INDEX IF NOT EXISTS idx_scholarships_deadline ON scholarships(deadline);
    `)

    const pragmaTeachers = db.prepare("PRAGMA table_info(teachers)").all() as any[]
    const existingCols = new Set(pragmaTeachers.map((c: any) => c.name))
    if (!existingCols.has('qualifications')) db.exec("ALTER TABLE teachers ADD COLUMN qualifications TEXT DEFAULT ''")
    if (!existingCols.has('phone')) db.exec("ALTER TABLE teachers ADD COLUMN phone TEXT DEFAULT ''")
    if (!existingCols.has('user_id')) db.exec("ALTER TABLE teachers ADD COLUMN user_id INTEGER")

    const pragmaSch = db.prepare("PRAGMA table_info(scholarships)").all() as any[]
    const existingSchCols = new Set(pragmaSch.map((c: any) => c.name))
    if (!existingSchCols.has('source')) db.exec("ALTER TABLE scholarships ADD COLUMN source TEXT DEFAULT ''")

    const pragmaQp = db.prepare("PRAGMA table_info(question_papers)").all() as any[]
    const existingQpCols = new Set(pragmaQp.map((c: any) => c.name))
    if (!existingQpCols.has('source')) db.exec("ALTER TABLE question_papers ADD COLUMN source TEXT DEFAULT ''")
    if (!existingQpCols.has('content')) db.exec("ALTER TABLE question_papers ADD COLUMN content TEXT DEFAULT ''")
    if (!existingQpCols.has('exam_type')) db.exec("ALTER TABLE question_papers ADD COLUMN exam_type TEXT DEFAULT 'board'")
    if (!existingQpCols.has('version')) db.exec("ALTER TABLE question_papers ADD COLUMN version TEXT DEFAULT 'new_syllabus'")
    if (!existingQpCols.has('total_marks')) db.exec("ALTER TABLE question_papers ADD COLUMN total_marks TEXT DEFAULT '100'")
    if (!existingQpCols.has('time_allowed')) db.exec("ALTER TABLE question_papers ADD COLUMN time_allowed TEXT DEFAULT '৩ ঘণ্টা'")
    if (!existingQpCols.has('answer_key')) db.exec("ALTER TABLE question_papers ADD COLUMN answer_key TEXT DEFAULT ''")
    if (!existingQpCols.has('explanations')) db.exec("ALTER TABLE question_papers ADD COLUMN explanations TEXT DEFAULT ''")

    const pragmaAdm = db.prepare("PRAGMA table_info(admissions)").all() as any[]
    const existingAdmCols = new Set(pragmaAdm.map((c: any) => c.name))
    if (!existingAdmCols.has('source')) db.exec("ALTER TABLE admissions ADD COLUMN source TEXT DEFAULT ''")

    const pragmaSyl = db.prepare("PRAGMA table_info(syllabus)").all() as any[]
    const existingSylCols = new Set(pragmaSyl.map((c: any) => c.name))
    if (!existingSylCols.has('content')) db.exec("ALTER TABLE syllabus ADD COLUMN content TEXT DEFAULT ''")
    if (!existingSylCols.has('chapters')) db.exec("ALTER TABLE syllabus ADD COLUMN chapters TEXT DEFAULT '[]'")
    if (!existingSylCols.has('marks_distribution')) db.exec("ALTER TABLE syllabus ADD COLUMN marks_distribution TEXT DEFAULT ''")
    if (!existingSylCols.has('subject')) db.exec("ALTER TABLE syllabus ADD COLUMN subject TEXT DEFAULT ''")

    // ফেজ-১৫: এডমিন সেন্ট্রাল কমান্ড সেন্টার — সিঙ্ক সোর্স, সিঙ্ক লগ, অডিট ট্রেইল ও মেন্টর পেআউট
    db.exec(`
      CREATE TABLE IF NOT EXISTS sync_sources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        source_url TEXT NOT NULL,
        scope TEXT NOT NULL DEFAULT 'all',
        category TEXT NOT NULL DEFAULT 'education',
        last_synced_at DATETIME,
        status TEXT NOT NULL DEFAULT 'active',
        total_fetched INTEGER NOT NULL DEFAULT 0,
        new_added INTEGER NOT NULL DEFAULT 0,
        duplicates_count INTEGER NOT NULL DEFAULT 0,
        last_error TEXT DEFAULT '',
        auto_sync_interval TEXT NOT NULL DEFAULT 'daily',
        is_enabled INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sync_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_key TEXT NOT NULL,
        source_name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'success',
        items_count INTEGER NOT NULL DEFAULT 0,
        new_count INTEGER NOT NULL DEFAULT 0,
        duplicates_count INTEGER NOT NULL DEFAULT 0,
        duration_ms INTEGER NOT NULL DEFAULT 120,
        error_message TEXT DEFAULT '',
        triggered_by TEXT NOT NULL DEFAULT 'system',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER NOT NULL,
        admin_name TEXT NOT NULL,
        action TEXT NOT NULL,
        target_type TEXT NOT NULL,
        target_id TEXT,
        details TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS mentor_payouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mentor_id INTEGER NOT NULL,
        amount INTEGER NOT NULL DEFAULT 0,
        tickets_count INTEGER NOT NULL DEFAULT 0,
        sessions_count INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'settled',
        note TEXT DEFAULT '',
        settled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Seed default sync sources
    const defaultSources = [
      { key: 'board_results_notices', name: 'শিক্ষা বোর্ড ও ফলাফল পোর্টাল', url: 'https://dhakaeducationboard.gov.bd/', scope: 'notices', cat: 'education', fetched: 142, added: 38, dup: 104 },
      { key: 'nu_portal', name: 'জাতীয় বিশ্ববিদ্যালয় পোর্টাল ও ফর্ম ফিলাপ', url: 'https://nu.ac.bd/', scope: 'syllabus', cat: 'university', fetched: 85, added: 24, dup: 61 },
      { key: 'bpsc_govt_jobs', name: 'বিপিএসসি ও সরকারি চাকরি সার্কুলার', url: 'https://bpsc.gov.bd/', scope: 'jobs', cat: 'jobs', fetched: 210, added: 65, dup: 145 },
      { key: 'shed_scholarships', name: 'শিক্ষা মন্ত্রণালয় ও PMEAT উপবৃত্তি সেল', url: 'https://shed.gov.bd/', scope: 'scholarships', cat: 'scholarships', fetched: 64, added: 18, dup: 46 },
      { key: 'nctb_curriculum', name: 'NCTB কারিকুলাম ও প্রশ্নব্যাংক রিপোজিটরি', url: 'https://nctb.gov.bd/', scope: 'qpapers', cat: 'education', fetched: 320, added: 92, dup: 228 },
      { key: 'daily_education_news', name: 'বাংলাদেশ শিক্ষা সংবাদ ও ব্রেকিং নোটিস', url: 'https://dainikshiksha.com/', scope: 'announce', cat: 'news', fetched: 480, added: 140, dup: 340 }
    ]
    for (const s of defaultSources) {
      const exists = db.prepare('SELECT id FROM sync_sources WHERE key = ?').get(s.key)
      if (!exists) {
        db.prepare(`
          INSERT INTO sync_sources (key, name, source_url, scope, category, last_synced_at, status, total_fetched, new_added, duplicates_count, auto_sync_interval, is_enabled)
          VALUES (?, ?, ?, ?, ?, datetime('now', '-2 hours'), 'active', ?, ?, ?, 'daily', 1)
        `).run(s.key, s.name, s.url, s.scope, s.cat, s.fetched, s.added, s.dup)
      }
    }

    // Seed initial sync logs if empty
    const logCnt = db.prepare('SELECT COUNT(*) c FROM sync_logs').get() as any
    if (!logCnt || logCnt.c === 0) {
      db.prepare(`
        INSERT INTO sync_logs (source_key, source_name, status, items_count, new_count, duplicates_count, duration_ms, error_message, triggered_by, created_at)
        VALUES 
        ('bpsc_govt_jobs', 'বিপিএসসি ও সরকারি চাকরি সার্কুলার', 'success', 25, 4, 21, 320, '', 'admin (ম্যানুয়াল)', datetime('now', '-30 minutes')),
        ('board_results_notices', 'শিক্ষা বোর্ড ও ফলাফল পোর্টাল', 'success', 18, 2, 16, 210, '', 'auto_cron (স্বয়ংক্রিয়)', datetime('now', '-2 hours')),
        ('shed_scholarships', 'শিক্ষা মন্ত্রণালয় ও PMEAT উপবৃত্তি সেল', 'success', 8, 1, 7, 180, '', 'auto_cron (স্বয়ংক্রিয়)', datetime('now', '-5 hours')),
        ('nctb_curriculum', 'NCTB কারিকুলাম ও প্রশ্নব্যাংক রিপোজিটরি', 'success', 42, 6, 36, 450, '', 'admin (১-ক্লিক মাস্টার)', datetime('now', '-1 day'))
      `).run()
    }
  } catch (e) {
    console.warn('[Database] Column upgrade note:', e)
  }

  // Seed default admin user (phone: 01835414122)
  try {
    const salt = 'edusob_admin_salt_2026'
    const hash = crypto.pbkdf2Sync('52944820', salt, 100000, 32, 'sha256').toString('hex')

    const existing = db.prepare("SELECT id FROM users WHERE phone = '01835414122'").get() as any
    if (!existing) {
      db.prepare(`
        INSERT INTO users (user_code, name_bn, name_en, email, phone, password_hash, salt, religion, education_level, role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run('EDU-2026-ADMIN', 'এডমিন', 'Admin', 'admin@edusob.com', '01835414122', hash, salt, 'islam', 'masters', 'admin')

      const userRow = db.prepare("SELECT id FROM users WHERE phone = '01835414122'").get() as any
      if (userRow?.id) {
        db.prepare('INSERT OR IGNORE INTO wallets (user_id, balance) VALUES (?, ?)').run(userRow.id, 10000)
        db.prepare('INSERT OR IGNORE INTO profiles (user_id) VALUES (?)').run(userRow.id)
      }
    } else {
      db.prepare(`
        UPDATE users SET password_hash = ?, salt = ?, role = 'admin' WHERE phone = '01835414122'
      `).run(hash, salt)
    }
  } catch (e) {
    console.warn('[Database] Seed admin notice:', e)
  }

  // Seed / Upgrade modern CV Templates
  try {
    const templatesList = [
      { slug: 'monogram-taupe', name_bn: 'Monogram Trusted Taupe', price: 0, sort_order: 1, config: { primary: '#4a443c', accent: '#a89f91', font: 'Hind Siliguri', layout: 'sidebar-left', headerStyle: 'monogram', contactPos: 'sidebar', sectionOrder: ['objective','experience','education','projects','skills','languages','references'], watermark: false, badge: 'Monogram', skillStyle: 'bars' } },
      { slug: 'spotlight-navy', name_bn: 'Spotlight Loyal Navy', price: 0, sort_order: 2, config: { primary: '#0f2444', accent: '#2563eb', font: 'Hind Siliguri', layout: 'sidebar-dark', headerStyle: 'modern-left', contactPos: 'sidebar', sectionOrder: ['objective','experience','education','projects','skills','languages','references'], watermark: false, badge: 'Sidebar Dark', skillStyle: 'dots' } },
      { slug: 'aspen-minimal', name_bn: 'Aspen Clean ATS', price: 0, sort_order: 3, config: { primary: '#1e293b', accent: '#475569', font: 'Hind Siliguri', layout: 'single', headerStyle: 'clean-border', contactPos: 'below', sectionOrder: ['objective','education','experience','skills','projects','languages','references'], watermark: false, badge: 'ATS Clean', skillStyle: 'pills' } },
      { slug: 'modern-teal', name_bn: 'Team Teal Pro', price: 0, sort_order: 4, config: { primary: '#0f766e', accent: '#14b8a6', font: 'Hind Siliguri', layout: 'sidebar-left', headerStyle: 'band', contactPos: 'sidebar', sectionOrder: ['objective','education','experience','projects','skills','languages','references'], watermark: false, badge: 'Teal Modern', skillStyle: 'bars' } },
      { slug: 'executive-blue', name_bn: 'Executive Balanced Blue', price: 0, sort_order: 5, config: { primary: '#1e3a8a', accent: '#3b82f6', font: 'Hind Siliguri', layout: 'single', headerStyle: 'band', contactPos: 'beside', sectionOrder: ['objective','experience','education','skills','projects','languages','references'], watermark: false, badge: 'Executive Band', skillStyle: 'pills' } },
      { slug: 'zinnia-emerald', name_bn: 'Zinnia Creative Emerald', price: 0, sort_order: 6, config: { primary: '#065f46', accent: '#10b981', font: 'Hind Siliguri', layout: 'timeline', headerStyle: 'center', contactPos: 'below', sectionOrder: ['objective','experience','education','projects','skills','languages','references'], watermark: false, badge: 'Timeline', skillStyle: 'dots' } },
      { slug: 'unique-crimson', name_bn: 'Unique Ambitious Red', price: 30, sort_order: 7, config: { primary: '#991b1b', accent: '#ef4444', font: 'Hind Siliguri', layout: 'sidebar-left', headerStyle: 'monogram', contactPos: 'sidebar', sectionOrder: ['objective','experience','education','skills','languages','references'], watermark: false, badge: 'Monogram Pro', skillStyle: 'bars' } },
      { slug: 'monogram-asphalt', name_bn: 'Monogram Assertive Asphalt', price: 30, sort_order: 8, config: { primary: '#18181b', accent: '#52525b', font: 'Hind Siliguri', layout: 'single', headerStyle: 'monogram', contactPos: 'below', sectionOrder: ['objective','experience','education','projects','skills','languages','references'], watermark: false, badge: 'Monogram', skillStyle: 'pills' } },
      { slug: 'upgrade-marigold', name_bn: 'Upgrade Creative Marigold', price: 30, sort_order: 9, config: { primary: '#854d0e', accent: '#f59e0b', font: 'Hind Siliguri', layout: 'sidebar-right', headerStyle: 'band', contactPos: 'sidebar', sectionOrder: ['objective','experience','education','projects','skills','languages','references'], watermark: false, badge: 'Creative', skillStyle: 'bars' } },
      { slug: 'bd-standard', name_bn: 'বাংলাদেশ স্ট্যান্ডার্ড বায়োডাটা (১-৩ পেজ)', price: 0, sort_order: 10, config: { primary: '#0f172a', accent: '#334155', font: 'Georgia, Tiro Bangla', layout: 'single', headerStyle: 'center', contactPos: 'below', sectionOrder: ['objective','personal','education','experience','skills','languages','references','declaration'], watermark: false, badge: 'BD Standard', skillStyle: 'clean-list' } },
      { slug: 'tech-developer', name_bn: 'Developer & Tech Portfolio', price: 30, sort_order: 11, config: { primary: '#0369a1', accent: '#06b6d4', font: 'Hind Siliguri', layout: 'sidebar-left', headerStyle: 'modern-left', contactPos: 'sidebar', sectionOrder: ['objective','projects','skills','experience','education','languages','references'], watermark: false, badge: 'Tech Stack', skillStyle: 'pills' } },
      { slug: 'academic-research', name_bn: 'Academic & Lecturer CV', price: 30, sort_order: 12, config: { primary: '#312e81', accent: '#6366f1', font: 'Georgia, Tiro Bangla', layout: 'single', headerStyle: 'center', contactPos: 'below', sectionOrder: ['objective','education','experience','projects','skills','languages','personal','references'], watermark: false, badge: 'Academic', skillStyle: 'clean-list' } },
      { slug: 'royal-purple', name_bn: 'Royal Purple Monogram', price: 50, sort_order: 13, config: { primary: '#581c87', accent: '#a855f7', font: 'Hind Siliguri', layout: 'sidebar-left', headerStyle: 'monogram', contactPos: 'sidebar', sectionOrder: ['objective','experience','education','skills','languages','references'], watermark: false, badge: 'Royal', skillStyle: 'dots' } },
      { slug: 'compact-ats', name_bn: 'Compact 1-Page High-Density', price: 0, sort_order: 14, config: { primary: '#1e293b', accent: '#0284c7', font: 'Hind Siliguri', layout: 'two-column-equal', headerStyle: 'clean-border', contactPos: 'below', sectionOrder: ['objective','experience','education','skills','projects','languages','references'], watermark: false, badge: '1-Page Fit', skillStyle: 'pills' } }
    ]

    for (const t of templatesList) {
      const exists = db.prepare('SELECT id FROM cv_templates WHERE slug = ?').get(t.slug)
      if (!exists) {
        db.prepare(`
          INSERT INTO cv_templates (slug, name_bn, price, sort_order, config, is_active)
          VALUES (?, ?, ?, ?, ?, 1)
        `).run(t.slug, t.name_bn, t.price, t.sort_order, JSON.stringify(t.config))
      }
    }
  } catch (e) {
    console.warn('[Database] Seed templates notice:', e)
  }

  // Seed / Upgrade Announcements & Important Notices
  try {
    const annCount = db.prepare('SELECT COUNT(*) as c FROM announcements').get() as any
    if (!annCount || annCount.c === 0) {
      const defaultAnnouncements = [
        {
          type: 'routine',
          title: '২০২৬ শিক্ষাবর্ষের এসএসসি ও এইচএসসি পরীক্ষার চূড়ান্ত সময়সূচি ও প্রস্তুতি নির্দেশিকা',
          body: 'সকল সাধারণ শিক্ষা বোর্ড, মাদ্রাসা ও কারিগরি শিক্ষা বোর্ডের জন্য ২০২৬ সালের এসএসসি ও এইচএসসি পরীক্ষার খসড়া ও চূড়ান্ত পরীক্ষার গাইডলাইন প্রকাশিত হয়েছে। প্রবেশপত্র সংগ্রহ ও কেন্দ্রতালিকা সংক্রান্ত জরুরি নির্দেশনাসমূহ সংগ্রহ করুন।',
          link: '/qpapers',
          level: 'all',
          pinned_priority: 10,
          source: 'শিক্ষা মন্ত্রণালয় ও বোর্ড সমন্বয় কমিটি'
        },
        {
          type: 'admission',
          title: 'একাদশ শ্রেণি ও ঢাকা বিশ্ববিদ্যালয়সহ সমন্বিত ভর্তি ২০২৬-২৭ আপডেট',
          body: 'অনলাইনে কলেজ ও বিশ্ববিদ্যালয় ভর্তির যোগ্যতা যাচাই, কোটা সংক্রান্ত সুবিধা ও ১-ক্লিক আবেদন ফরম পূরণের পূর্ণাঙ্গ সুবিধা এখন এডুসব পোর্টালে উন্মুক্ত।',
          link: '/admission',
          level: 'hsc',
          pinned_priority: 8,
          source: 'জাতীয় ভর্তি সেল'
        },
        {
          type: 'result',
          title: 'বোর্ড পরীক্ষা ও ন্যাশনাল ইউনিভার্সিটি রেজাল্ট অ্যানালাইসিস টুল লাইভ',
          body: 'আপনার রোল ও রেজিস্ট্রেশন দিয়ে সরাসরি মার্কশিটসহ গ্রেডশিট ডাউনলোড করুন। রেজাল্ট প্রকাশিত হওয়া মাত্র পুশ অ্যালার্ট পাবেন।',
          link: '/results',
          level: 'all',
          pinned_priority: 6,
          source: 'এডুসব এক্সাম উইং'
        },
        {
          type: 'general',
          title: 'এডুসব শিক্ষক সহায়তা ও ১-অন-১ লাইভ ডাউট সলভিং এখন সক্রিয়',
          body: 'পড়াশোনা বা যেকোনো জটিল অধ্যায়ে আটকে গেলে সরাসরি শীর্ষ শিক্ষকদের সাথে লাইভ চ্যাট ও ভিডিও কল সেশনে যুক্ত হয়ে সমাধান নিন।',
          link: '/teacher-support',
          level: 'all',
          pinned_priority: 5,
          source: 'এডুসব মেন্টরশিপ টিম'
        }
      ]

      for (const a of defaultAnnouncements) {
        db.prepare(`
          INSERT INTO announcements (type, title, body, link, level, status, pinned_priority, source)
          VALUES (?, ?, ?, ?, ?, 'approved', ?, ?)
        `).run(a.type, a.title, a.body, a.link, a.level, a.pinned_priority, a.source)
      }
    }
  } catch (e) {
    console.warn('[Database] Seed announcements notice:', e)
  }

  // Ensure all Feature Toggles and Settings keys are seeded
  try {
    const features = [
      ['shop', 'এডুসব শপ', 1, 'শপ পেজ ও স্টাডি মেটেরিয়াল অর্ডার (/shop)'],
      ['shop_signboard', 'শপ সাইনবোর্ড পপআপ', 1, 'ল্যান্ডিং পেজের বিশেষ অফার সাইনবোর্ড'],
      ['ai_assistant', 'AI সহকারী', 1, 'ফ্লোটিং এআই চ্যাট ও স্টাডি গাইড'],
      ['cv_maker', 'CV মেকার', 1, 'সিভি তৈরি ও প্রফেশনাল ডাউনলোড (/cv)'],
      ['mcq', 'MCQ প্র্যাকটিস', 1, 'মডেল টেস্ট ও কুইজ এক্সাম (/mcq)'],
      ['qpapers', 'প্রশ্নপত্র ও সাজেশন ব্যাংক', 1, 'বিগত বছরের বোর্ড প্রশ্ন ও সাজেশন (/qpapers)'],
      ['syllabus', 'সিলেবাস ও কারিকুলাম', 1, 'সকল ক্লাসের সিলেবাস ও বুকমার্ক (/syllabus)'],
      ['scholarships', 'স্কলারশিপ ও উপবৃত্তি হাব', 1, 'স্কলারশিপ ফিল্টার ও এআই পথ (/scholarships)'],
      ['teacher_support', 'শিক্ষক ও ১-অন-১ মেন্টর সহায়তা', 1, 'লাইভ ভিডিও কল ও প্রশ্ন ডাউট সলভিং (/teacher-support)'],
      ['planner', 'স্টাডি প্ল্যানার ও নোটস', 1, 'দৈনিক স্টাডি রুটিন ও পার্সোনাল নোট (/planner)'],
      ['cgpa', 'CGPA ও গ্রেড ক্যালকুলেটর', 1, 'পয়েন্ট ও টার্গেট ক্যালকুলেটর (/cgpa)'],
      ['admission', 'ভর্তি হাব ও নোটিস', 1, 'স্কুল, কলেজ ও ভার্সিটি ভর্তি হাব (/admission)'],
      ['news', 'নিউজ পোর্টাল', 1, 'শিক্ষা সংবাদ ও ব্রেকিং নিউজ (/news)'],
      ['jobs', 'চাকরির খবর', 1, 'সরকারি ও বেসরকারি সার্কুলার (/jobs)'],
      ['subscription', 'সাবস্ক্রিপশন প্ল্যান', 1, 'প্রিমিয়াম মেম্বারশিপ প্যাকেজ (/subscription)'],
      ['referral', 'রেফারেল প্রোগ্রাম', 1, 'রেফার ও ওয়ালেট বোনাস সিস্টেম']
    ]
    for (const [k, name, en, note] of features) {
      db.prepare('INSERT OR IGNORE INTO feature_toggles (key, name_bn, is_enabled, note) VALUES (?, ?, ?, ?)').run(k, name, en, note)
    }

    const defaultSettings = [
      ['signup_bonus', '১০'],
      ['referral_bonus', '১০'],
      ['cod_charge', '৫০'],
      ['bkash_number', '01835414122'],
      ['nagad_number', '01835414122'],
      ['rocket_number', '01835414122'],
      ['whatsapp_number', '01835414122'],
      ['whatsapp_group', 'https://chat.whatsapp.com/edusob-study-hub'],
      ['facebook_url', 'https://facebook.com/groups/edusob.community'],
      ['youtube_url', 'https://youtube.com/@edusob_official'],
      ['telegram_url', 'https://t.me/edusob_channel'],
      ['support_phone', '01835414122'],
      ['support_email', 'support@edusob.com'],
      ['notice_marquee', 'এডুসব ডিজিটাল শিক্ষা প্ল্যাটফর্মে স্বাগতম — সকল পরীক্ষার রেজাল্ট, প্রশ্নব্যাংক ও স্কলারশিপ তথ্য এক ঠিকানায়!'],
      ['card_social_hub', '1'],
      ['card_announce', '1'],
      ['card_stats', '1'],
      ['card_quick_actions', '1'],
      ['card_quick_copy', '1'],
      ['card_study_goals', '1'],
      ['card_teacher_support', '1'],
      ['card_referral', '1'],
      ['card_religion', '1'],
      ['card_news', '1'],
      ['card_jobs', '1'],
      ['card_saved_rolls', '1'],
      ['card_community_fb', '1'],
      ['card_community_yt', '1'],
      ['card_community_wa', '1'],
      ['card_community_tg', '1'],
      ['card_community_help', '1']
    ]
    for (const [k, v] of defaultSettings) {
      db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)').run(k, v)
    }
  } catch (e) {
    console.warn('[Database] Seed feature_toggles & settings notice:', e)
  }

  d1Instance = {
    prepare(sql: string) {
      return createPreparedStatement(db, sql)
    },
    async batch(statements: D1PreparedStatement[]): Promise<D1Result<any>[]> {
      const results: D1Result<any>[] = []
      db.exec('BEGIN TRANSACTION;')
      try {
        for (const stmt of statements) {
          const res = await stmt.run()
          results.push(res)
        }
        db.exec('COMMIT;')
        return results
      } catch (err) {
        db.exec('ROLLBACK;')
        console.error('[Database] Batch transaction rolled back:', err)
        throw err
      }
    },
    async exec(sql: string): Promise<{ count: number; duration: number }> {
      const start = Date.now()
      db.exec(sql)
      return { count: 1, duration: Date.now() - start }
    }
  }

  return d1Instance
}

export async function getD1Db(): Promise<D1Database> {
  if (!d1Instance) {
    return await initDatabase()
  }
  return d1Instance
}

let schemaEnsured = false

export async function ensureD1Schema(db: any): Promise<void> {
  if (schemaEnsured || !db) return

  try {
    if (typeof db.exec === 'function') {
      await db.exec(`
        CREATE TABLE IF NOT EXISTS teachers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          designation TEXT NOT NULL,
          subject TEXT NOT NULL,
          education_level TEXT NOT NULL DEFAULT 'all',
          avatar TEXT DEFAULT '',
          experience_years INTEGER NOT NULL DEFAULT 5,
          rating REAL NOT NULL DEFAULT 4.9,
          total_solved INTEGER NOT NULL DEFAULT 150,
          response_time TEXT NOT NULL DEFAULT '১৫-৩০ মিনিট',
          bio TEXT DEFAULT '',
          qualifications TEXT DEFAULT '',
          phone TEXT DEFAULT '',
          user_id INTEGER,
          is_online INTEGER NOT NULL DEFAULT 1,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

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
          urgency TEXT NOT NULL DEFAULT 'normal',
          status TEXT NOT NULL DEFAULT 'pending',
          answer TEXT DEFAULT '',
          answer_attachments TEXT DEFAULT '[]',
          answered_by_name TEXT DEFAULT '',
          answered_at DATETIME,
          rating INTEGER DEFAULT 0,
          user_feedback TEXT DEFAULT '',
          is_public INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_tt_user ON teacher_tickets(user_id, status);
        CREATE INDEX IF NOT EXISTS idx_tt_subject ON teacher_tickets(subject, is_public);

        CREATE TABLE IF NOT EXISTS teacher_consultations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          teacher_id INTEGER NOT NULL,
          topic TEXT NOT NULL,
          preferred_date TEXT NOT NULL,
          preferred_time TEXT NOT NULL,
          meeting_link TEXT DEFAULT '',
          status TEXT NOT NULL DEFAULT 'requested',
          note TEXT DEFAULT '',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_tc_user ON teacher_consultations(user_id);

        CREATE TABLE IF NOT EXISTS teacher_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ticket_id INTEGER NOT NULL,
          sender_type TEXT NOT NULL DEFAULT 'teacher',
          sender_id INTEGER NOT NULL,
          sender_name TEXT NOT NULL,
          message TEXT NOT NULL,
          attachment_url TEXT DEFAULT '',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_tm_ticket ON teacher_messages(ticket_id);

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
          status TEXT NOT NULL DEFAULT 'active',
          started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          ended_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS scholarships (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          provider TEXT NOT NULL,
          category TEXT NOT NULL DEFAULT 'national',
          target_level TEXT NOT NULL DEFAULT 'all',
          min_gpa REAL NOT NULL DEFAULT 0.0,
          max_family_income INTEGER NOT NULL DEFAULT 0,
          quota TEXT DEFAULT 'সকলের জন্য উন্মুক্ত',
          eligible_districts TEXT DEFAULT 'সকল জেলা',
          stipend_amount TEXT DEFAULT '',
          deadline TEXT DEFAULT '',
          apply_link TEXT DEFAULT '',
          required_docs TEXT DEFAULT '[]',
          steps_roadmap TEXT DEFAULT '[]',
          tips_guideline TEXT DEFAULT '',
          downloads INTEGER NOT NULL DEFAULT 0,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sync_sources (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          source_url TEXT NOT NULL,
          scope TEXT NOT NULL DEFAULT 'all',
          category TEXT NOT NULL DEFAULT 'education',
          last_synced_at DATETIME,
          status TEXT NOT NULL DEFAULT 'active',
          total_fetched INTEGER NOT NULL DEFAULT 0,
          new_added INTEGER NOT NULL DEFAULT 0,
          duplicates_count INTEGER NOT NULL DEFAULT 0,
          last_error TEXT DEFAULT '',
          auto_sync_interval TEXT NOT NULL DEFAULT 'daily',
          is_enabled INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sync_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          source_key TEXT NOT NULL,
          source_name TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'success',
          items_count INTEGER NOT NULL DEFAULT 0,
          new_count INTEGER NOT NULL DEFAULT 0,
          duplicates_count INTEGER NOT NULL DEFAULT 0,
          duration_ms INTEGER NOT NULL DEFAULT 120,
          error_message TEXT DEFAULT '',
          triggered_by TEXT NOT NULL DEFAULT 'system',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS admin_audit_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          admin_id INTEGER NOT NULL,
          admin_name TEXT NOT NULL,
          action TEXT NOT NULL,
          target_type TEXT NOT NULL,
          target_id TEXT,
          details TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS mentor_payouts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          mentor_id INTEGER NOT NULL,
          amount INTEGER NOT NULL DEFAULT 0,
          tickets_count INTEGER NOT NULL DEFAULT 0,
          sessions_count INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'settled',
          note TEXT DEFAULT '',
          settled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS announcements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL DEFAULT 'general',
          title TEXT NOT NULL,
          body TEXT NOT NULL,
          link TEXT DEFAULT '',
          image_url TEXT DEFAULT '',
          level TEXT NOT NULL DEFAULT 'all',
          status TEXT NOT NULL DEFAULT 'approved',
          pinned_priority INTEGER NOT NULL DEFAULT 0,
          source TEXT DEFAULT '',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS admissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          target_level TEXT NOT NULL DEFAULT 'hsc',
          title TEXT NOT NULL,
          institute TEXT NOT NULL,
          min_gpa REAL NOT NULL DEFAULT 0.0,
          deadline TEXT NOT NULL,
          apply_link TEXT NOT NULL DEFAULT '',
          guide_content TEXT DEFAULT '',
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS suggestions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          exam_type TEXT NOT NULL,
          title TEXT NOT NULL,
          subject TEXT NOT NULL,
          description TEXT DEFAULT '',
          file_url TEXT DEFAULT '',
          is_premium INTEGER DEFAULT 0,
          downloads INTEGER DEFAULT 0,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `)
    }

    // Check & seed teachers
    try {
      const tCheck: any = await db.prepare('SELECT COUNT(*) as c FROM teachers').first()
      if (!tCheck || Number(tCheck.c || 0) === 0) {
        await db.prepare(`
          INSERT OR IGNORE INTO teachers (id, name, designation, subject, education_level, avatar, experience_years, rating, total_solved, response_time, bio, is_online) VALUES
          (1, 'ড. রফিকুল ইসলাম', 'সহযোগী অধ্যাপক, ঢাকা বিশ্ববিদ্যালয়', 'পদার্থবিজ্ঞান ও উচ্চতর গণিত', 'hsc', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 12, 4.95, 420, '১৫-২০ মিনিট', 'বিগত ১২ বছর ধরে এইচএসসি ও বিশ্ববিদ্যালয় ভর্তি শিক্ষার্থীদের পদার্থবিজ্ঞান ও গণিতের কঠিন সমস্যা সমাধানে সহায়তা প্রদান করছেন।', 1),
          (2, 'মুহাম্মদ তানভীর আহমেদ', 'সিনিয়র লেকচারার ও গণিত অলিম্পিয়াড ট্রেইনার', 'গণিত ও ক্যালকুলাস', 'all', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 8, 4.92, 385, '১০-১৫ মিনিট', 'জ্যামিতি, বীজগণিত ও ক্যালকুলাসের জটিল উপপাদ্য সহজে চিত্রসহ বুঝিয়ে দেওয়ায় অভিজ্ঞ।', 1),
          (3, 'মোসাম্মৎ নাজমুন নাহার', 'বিসিএস শিক্ষা ক্যাডার (৩৮তম)', 'ইংরেজি ব্যাকরণ ও ফ্রি-হ্যান্ড রাইটিং', 'job', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', 7, 4.98, 510, '১৫-২৫ মিনিট', 'এইচএসসি ও বিসিএস/চাকরিপ্রার্থীদের ইংরেজি গ্রামার রুলস, ট্রান্সলেশন ও রাইটিং ডাউট ক্লিয়ারিং স্পেশালিস্ট।', 1),
          (4, 'মাহমুদুল হাসান', 'হিসাববিজ্ঞান বিভাগীয় প্রধান (জাতীয় বিশ্ববিদ্যালয় মেন্টর)', 'হিসাববিজ্ঞান ও ফিন্যান্স', 'nu', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 10, 4.89, 310, '২০-৩০ মিনিট', 'জাতীয় বিশ্ববিদ্যালয়ের অনার্স ১ম-৪র্থ বর্ষ ও ডিগ্রি শিক্ষার্থীদের হিসাববিজ্ঞান ও পরিসংখ্যান সহজ নিয়মে বোঝান।', 1),
          (5, 'ড. ফারহানা হক', 'সহকারী অধ্যাপক, প্রাণিবিজ্ঞান ও মেডিকেল মেন্টর', 'জীববিজ্ঞান ও রসায়ন', 'hsc', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80', 9, 4.96, 445, '১৫-২০ মিনিট', 'মেডিকেল এডমিশন ও এইচএসসি রসায়ন-জীববিজ্ঞানের বিক্রিয়া ও চিত্রভিত্তিক বিশ্লেষণ দেন।', 1),
          (6, 'প্রকৌশলী শফিউল আলম', 'আইসিটি ও কম্পিউটার সায়েন্স ফ্যাকাল্টি', 'ICT ও প্রোগ্রামিং', 'all', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80', 6, 4.90, 275, '১০-২০ মিনিট', 'এইচএসসি আইসিটি (সি প্রোগ্রামিং, এইচটিএমএল, লজিক গেট) ও বেসিক আইটি সমস্যার সহজ ব্যাখ্যা।', 1)
        `).run()
      }
    } catch (e) {}

    // Check & seed sample tickets
    try {
      const ticketCheck: any = await db.prepare('SELECT COUNT(*) as c FROM teacher_tickets').first()
      if (!ticketCheck || Number(ticketCheck.c || 0) === 0) {
        await db.prepare(`
          INSERT OR IGNORE INTO teacher_tickets (id, ticket_code, user_id, teacher_id, subject, education_level, topic, question, urgency, status, answer, answered_by_name, answered_at, rating, is_public) VALUES
          (1, 'TS-2026-001', 1, 2, 'গণিত', 'hsc', 'ক্যালকুলাস — লিমিটের মান নির্ণয়', 'lim(x→0) (sin 5x / sin 3x) এর মান কিভাবে সরাসরি এবং L''Hospital নিয়মে বের করব?', 'normal', 'answered', 'সমাধান: lim(θ→0) (sin θ / θ) = 1 সূত্র অনুযায়ী ৫/৩।', 'মুহাম্মদ তানভীর আহমেদ', datetime('now', '-2 hours'), 5, 1)
        `).run()
      }
    } catch (e) {}

    // Check & seed sync_sources
    try {
      const sCheck: any = await db.prepare('SELECT COUNT(*) as c FROM sync_sources').first()
      if (!sCheck || Number(sCheck.c || 0) === 0) {
        await db.prepare(`
          INSERT OR IGNORE INTO sync_sources (key, name, source_url, scope, category, last_synced_at, status, total_fetched, new_added, duplicates_count, auto_sync_interval, is_enabled) VALUES
          ('board_results_notices', 'শিক্ষা বোর্ড ও ফলাফল পোর্টাল', 'https://dhakaeducationboard.gov.bd/', 'notices', 'education', datetime('now', '-2 hours'), 'active', 142, 38, 104, 'daily', 1),
          ('nu_portal', 'জাতীয় বিশ্ববিদ্যালয় পোর্টাল ও ফর্ম ফিলাপ', 'https://nu.ac.bd/', 'syllabus', 'university', datetime('now', '-3 hours'), 'active', 85, 24, 61, 'daily', 1),
          ('bpsc_govt_jobs', 'বিপিএসসি ও সরকারি চাকরি সার্কুলার', 'https://bpsc.gov.bd/', 'jobs', 'jobs', datetime('now', '-1 hours'), 'active', 210, 65, 145, 'daily', 1),
          ('shed_scholarships', 'শিক্ষা মন্ত্রণালয় ও PMEAT উপবৃত্তি সেল', 'https://shed.gov.bd/', 'scholarships', 'scholarships', datetime('now', '-5 hours'), 'active', 64, 18, 46, 'daily', 1),
          ('nctb_curriculum', 'NCTB কারিকুলাম ও প্রশ্নব্যাংক রিপোজিটরি', 'https://nctb.gov.bd/', 'qpapers', 'education', datetime('now', '-1 day'), 'active', 320, 92, 228, 'daily', 1),
          ('daily_education_news', 'বাংলাদেশ শিক্ষা সংবাদ ও ব্রেকিং নোটিস', 'https://dainikshiksha.com/', 'announce', 'news', datetime('now', '-30 minutes'), 'active', 480, 140, 340, 'daily', 1)
        `).run()
      }
    } catch (e) {}

    schemaEnsured = true
  } catch (err) {
    console.warn('[ensureD1Schema warning]:', err)
  }
}

