// এডুসব — অনবোর্ডিং চেকলিস্ট + ওয়ালেট বোনাস (রাউন্ড ৬)
//
// নিয়ম:
//  * প্রতিটি ধাপের "সম্পন্ন" কিনা তা সার্ভারই ঠিক করে — ক্লায়েন্টের কথায় কখনোই টাকা দেওয়া হয় না।
//  * বোনাস ওয়ালেটে যোগ করার আগে onboarding_rewards-এ (user_id, step_key) INSERT OR IGNORE।
//    INSERT-এ changes === 0 মানে আগেই ক্লেইম করা হয়েছে → ক্রেডিট নেই (ডবল-ক্রেডিট ইম্পসিবল)।
//  * বোনাসের পরিমাণ শুধু এখানে — UI সার্ভারের কাছ থেকে পেয়ে রেন্ডার করে, নিজে কিছু বানায় না।

export type OnboardingStepDef = {
  key: string
  label: string
  hint: string
  icon: string
  bonus: number
  href: string
  cta: string
}

// ধাপগুলো এমনভাবে বাছাই করা হয়েছে যাতে প্রতিটি বাস্তবে যাচাই করা যায়
// (প্রোফাইল কলাম / saved_rolls / mcq_attempts — সব বাস্তব টেবিল)।
export const ONBOARDING_STEPS: OnboardingStepDef[] = [
  {
    key: 'profile_basic', label: 'প্রোফাইলের মূল তথ্য', icon: 'fa-id-card', bonus: 20, href: '/profile', cta: 'পূরণ করুন',
    hint: 'পিতা-মাতার নাম, জন্ম তারিখ, উপজেলা ও জেলা',
  },
  {
    key: 'profile_photo', label: 'ছবি ও স্বাক্ষর আপলোড', icon: 'fa-image', bonus: 15, href: '/profile', cta: 'আপলোড',
    hint: 'ভর্তি ফর্মে সরাসরি ব্যবহার করুন',
  },
  {
    key: 'education', label: 'শিক্ষা তথ্য যোগ', icon: 'fa-graduation-cap', bonus: 15, href: '/profile', cta: 'যোগ করুন',
    hint: 'SSC বা HSC রোল/বোর্ড, অথবা NU রেজিস্ট্রেশন',
  },
  {
    key: 'first_result', label: 'প্রথম রেজাল্ট সংরক্ষণ', icon: 'fa-bookmark', bonus: 10, href: '/results', cta: 'রেজাল্ট দেখুন',
    hint: 'রোল ও রেজি. সেভ করলে পরের বার ১-ক্লিকে',
  },
  {
    key: 'first_mcq', label: 'প্রথম MCQ টেস্ট', icon: 'fa-list-check', bonus: 10, href: '/mcq', cta: 'টেস্ট দিন',
    hint: 'যেকোনো একটি বিষয়ভিত্তিক টেস্ট শেষ করুন',
  },
]

export const ONBOARDING_TOTAL = ONBOARDING_STEPS.reduce((s, x) => s + x.bonus, 0)

export type OnboardingStepState = OnboardingStepDef & { done: boolean; claimed: boolean; claimed_amount: number }
export type OnboardingState = {
  steps: OnboardingStepState[]
  total: number
  done_count: number
  claimed_count: number
  earned: number
  pending: number
  bonus_total: number
  all_done: boolean
}

const has = (v: any) => v !== null && v !== undefined && String(v).trim() !== ''

// ---------- ধাপ-ভিত্তিক যাচাই (বাস্তব ডেটা ছাড়া কিছুই "সম্পন্ন" হয় না) ----------
function stepDone(key: string, p: any, savedRolls: number, mcqAttempts: number): boolean {
  switch (key) {
    case 'profile_basic':
      return !!(has(p?.father_bn) && has(p?.mother_bn) && has(p?.dob) && has(p?.upazila) && has(p?.district))
    case 'profile_photo':
      return !!(has(p?.photo_data) && has(p?.sign_data))
    case 'education':
      return !!((has(p?.ssc_board) && has(p?.ssc_roll)) || (has(p?.hsc_board) && has(p?.hsc_roll)) || has(p?.nu_reg))
    case 'first_result':
      return savedRolls >= 1
    case 'first_mcq':
      return mcqAttempts >= 1
    default:
      return false
  }
}

// ---------- টেবিল সেলফ-হিলিং ----------
// পঞ্চম রাউন্ডে দেখা গেছে: ensureD1Schema()-এর এক বড় db.exec()-এর ভেতরে কোনো
// স্টেটমেন্ট ফেল করলে তার পরের সব স্টেটমেন্ট স্কিপ হয় — তাই প্রোডাকশনে টেবিলই
// তৈরি হয়নি। এখানে CREATE TABLE আলাদা try/catch-এ, তাই মূল ব্লক ব্যর্থ হলেও
// অনবোর্ডিং টেবিল নিজেই তৈরি হয়ে যায়।
let obTableChecked = false

export async function ensureOnboardingTable(db: any): Promise<void> {
  if (obTableChecked || !db || typeof db.exec !== 'function') return
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS onboarding_rewards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        step_key TEXT NOT NULL,
        amount INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, step_key),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
      CREATE INDEX IF NOT EXISTS idx_onboarding_rewards_user ON onboarding_rewards(user_id);
    `)
    obTableChecked = true
  } catch {
    // ব্যর্থ হলে পরের রিকোয়েস্টে আবার চেষ্টা করবে
  }
}

async function one(db: any, sql: string, bind: any[] = []): Promise<any> {
  try {
    return await db.prepare(sql).bind(...bind).first()
  } catch {
    return null
  }
}

async function all(db: any, sql: string, bind: any[] = []): Promise<any[]> {
  try {
    const r: any = await db.prepare(sql).bind(...bind).all()
    return (r && r.results) || []
  } catch {
    return []
  }
}

export async function getOnboardingState(db: any, userId: number): Promise<OnboardingState> {
  const [p, savedRow, mcqRow, rewards] = await Promise.all([
    one(db, 'SELECT * FROM profiles WHERE user_id = ?', [userId]),
    one(db, 'SELECT COUNT(*) c FROM saved_rolls WHERE user_id = ?', [userId]),
    one(db, 'SELECT COUNT(*) c FROM mcq_attempts WHERE user_id = ?', [userId]),
    all(db, 'SELECT step_key, amount FROM onboarding_rewards WHERE user_id = ?', [userId]),
  ])

  const claimedMap: Record<string, number> = {}
  for (const r of rewards) claimedMap[String(r.step_key)] = Number(r.amount) || 0

  const savedRolls = Number(savedRow?.c ?? 0)
  const mcqAttempts = Number(mcqRow?.c ?? 0)

  const steps: OnboardingStepState[] = ONBOARDING_STEPS.map((s) => {
    const done = stepDone(s.key, p, savedRolls, mcqAttempts)
    const claimed = Object.prototype.hasOwnProperty.call(claimedMap, s.key)
    return { ...s, done, claimed, claimed_amount: claimed ? claimedMap[s.key] : 0 }
  })

  const done_count = steps.filter((s) => s.done).length
  const claimed_count = steps.filter((s) => s.claimed).length
  const earned = steps.reduce((n, s) => n + (s.claimed ? s.claimed_amount : 0), 0)
  const pending = steps.reduce((n, s) => n + (s.done && !s.claimed ? s.bonus : 0), 0)

  return {
    steps, total: steps.length, done_count, claimed_count, earned, pending,
    bonus_total: ONBOARDING_TOTAL, all_done: done_count === steps.length,
  }
}

// ---------- ক্লেইম (idempotent) ----------
export async function claimOnboardingSteps(
  db: any,
  userId: number,
  keys?: string[],
): Promise<{ granted: Array<{ key: string; amount: number }>; skipped: string[]; balance: number; state: OnboardingState }> {
  const state = await getOnboardingState(db, userId)
  const targets = state.steps.filter(
    (s) => s.done && !s.claimed && (!keys || keys.length === 0 || keys.indexOf(s.key) !== -1),
  )

  const granted: Array<{ key: string; amount: number }> = []
  const skipped: string[] = []

  for (const s of targets) {
    let changes = 1
    try {
      const res: any = await db
        .prepare('INSERT OR IGNORE INTO onboarding_rewards (user_id, step_key, amount) VALUES (?, ?, ?)')
        .bind(userId, s.key, s.bonus)
        .run()
      const c = res && res.meta && typeof res.meta.changes === 'number' ? res.meta.changes : 1
      changes = c
    } catch {
      changes = 0 // টেবিল নেই / অন্য কোনো ত্রুটি → ক্রেডিট করব না
    }
    if (changes === 0) { skipped.push(s.key); continue }

    try {
      await db.prepare('INSERT OR IGNORE INTO wallets (user_id, balance) VALUES (?, 0)').bind(userId).run()
      await db
        .prepare('UPDATE wallets SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?')
        .bind(s.bonus, userId)
        .run()
      await db
        .prepare("INSERT INTO wallet_transactions (user_id, amount, type, note, status) VALUES (?, ?, 'onboarding', ?, 'approved')")
        .bind(userId, s.bonus, s.label + ' — অনবোর্ডিং বোনাস 🎁')
        .run()
      granted.push({ key: s.key, amount: s.bonus })
    } catch {
      skipped.push(s.key) // ওয়ালেট আপডেট ব্যর্থ → রিওয়ার্ড রো রয়ে গেলেও টাকা দিচ্ছি না
    }
  }

  let balance = 0
  try {
    const w = await one(db, 'SELECT balance FROM wallets WHERE user_id = ?', [userId])
    balance = Number(w?.balance ?? 0)
  } catch { /* ignore */ }

  const next = granted.length || skipped.length ? await getOnboardingState(db, userId) : state
  return { granted, skipped, balance, state: next }
}
