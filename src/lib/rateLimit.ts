// এডুসব — টেকসই রেট-লিমিটিং (D1-ভিত্তিক, isolate-নিরপেক্ষ)
//
// সমস্যা: আগের ইন-মেমোরি কাউন্টার প্রতিটি Worker isolate-এর নিজস্ব ছিল।
// প্রোডাকশনে একাধিক isolate চালু থাকায় "১০ মিনিটে ৮ বার" সীমা আসলে ১৬-২৪ বার
// হয়ে যেত (sec-test-এ ধরা পড়েছিল: লোকালে ঠিক ৯, প্রোডাকশনে ১০-১১)।
//
// সমাধান: হিসাব D1-এ। সব isolate একই টেবিল দেখে, তাই সীমা সর্বত্র সমান।
// D1 কল ব্যর্থ হলে ইন-মেমোরি ফলব্যাক — সীমা কিছুটা শিথিল হলেও গার্ড থাকে।

const RL_WINDOW_MS = 10 * 60 * 1000
const RL_MAX_ATTEMPTS = 8

// ---------- টেবিল সেলফ-হিলিং ----------
let rlTableChecked = false
export async function ensureRateLimitTable(db: any): Promise<void> {
  if (rlTableChecked || !db || typeof db.exec !== 'function') return
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        bucket_key TEXT PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 0,
        window_start INTEGER NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);
    `)
    rlTableChecked = true
  } catch {
    // পরের রিকোয়েস্টে আবার চেষ্টা করবে
  }
}

// ---------- ইন-মেমোরি ফলব্যাক (শুধু D1 ব্যর্থ হলে) ----------
const mem = new Map<string, { n: number; first: number }>()
function memBlocked(key: string, now: number): boolean {
  const rec = mem.get(key)
  if (!rec) return false
  if (now - rec.first >= RL_WINDOW_MS) { mem.delete(key); return false }
  return rec.n >= RL_MAX_ATTEMPTS
}
function memFail(key: string, now: number): void {
  if (mem.size > 5000) for (const [k, v] of mem) if (now - v.first >= RL_WINDOW_MS) mem.delete(k)
  const rec = mem.get(key)
  if (!rec || now - rec.first >= RL_WINDOW_MS) mem.set(key, { n: 1, first: now })
  else rec.n++
}

export type RateLimitVerdict = { blocked: boolean; remaining: number; source: 'd1' | 'memory' }

export async function checkRateLimit(db: any, key: string): Promise<RateLimitVerdict> {
  const now = Date.now()
  if (db) {
    try {
      const row: any = await db.prepare('SELECT count, window_start FROM rate_limits WHERE bucket_key = ?').bind(key).first()
      if (row) {
        const start = Number(row.window_start)
        if (Number.isFinite(start) && now - start >= RL_WINDOW_MS) {
          await db.prepare('DELETE FROM rate_limits WHERE bucket_key = ?').bind(key).run().catch(() => {})
          return { blocked: false, remaining: RL_MAX_ATTEMPTS, source: 'd1' }
        }
        const n = Number(row.count) || 0
        return { blocked: n >= RL_MAX_ATTEMPTS, remaining: Math.max(0, RL_MAX_ATTEMPTS - n), source: 'd1' }
      }
      return { blocked: false, remaining: RL_MAX_ATTEMPTS, source: 'd1' }
    } catch {
      // D1 সমস্যা → ফলব্যাক
    }
  }
  return { blocked: memBlocked(key, now), remaining: 0, source: 'memory' }
}

export async function recordRateLimitFail(db: any, key: string): Promise<void> {
  const now = Date.now()
  if (db) {
    try {
      await db
        .prepare(
          `INSERT INTO rate_limits (bucket_key, count, window_start)
           VALUES (?, 1, ?)
           ON CONFLICT(bucket_key) DO UPDATE SET
             count = CASE WHEN ? - window_start >= ? THEN 1 ELSE count + 1 END,
             window_start = CASE WHEN ? - window_start >= ? THEN ? ELSE window_start END,
             updated_at = CURRENT_TIMESTAMP`,
        )
        .bind(key, now, now, RL_WINDOW_MS, now, RL_WINDOW_MS, now)
        .run()
      return
    } catch {
      // ফলব্যাকে যাই
    }
  }
  memFail(key, now)
}

export async function resetRateLimit(db: any, key: string): Promise<void> {
  mem.delete(key)
  if (!db) return
  try {
    await db.prepare('DELETE FROM rate_limits WHERE bucket_key = ?').bind(key).run()
  } catch {
    /* ignore */
  }
}

// পুরনো উইন্ডোর সারি মুছে ফেলা (মেমোরি/ডিস্ক স্ফীতি আটকাতে) — বেস্ট-এফোর্ট
export async function pruneRateLimits(db: any): Promise<void> {
  if (!db) return
  try {
    await db.prepare('DELETE FROM rate_limits WHERE ? - window_start >= ?').bind(Date.now(), RL_WINDOW_MS).run()
  } catch {
    /* ignore */
  }
}

export const RATE_LIMIT_MAX = RL_MAX_ATTEMPTS
export const RATE_LIMIT_WINDOW_MS = RL_WINDOW_MS
