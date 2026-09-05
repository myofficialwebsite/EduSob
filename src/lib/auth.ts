// এডুসব — Auth helpers (Web Crypto, Cloudflare / Node SQLite compatible)
import type { D1Database } from './db'

export type Bindings = { DB: D1Database }

export type SessionUser = {
  id: number
  user_code: string
  name_bn: string
  name_en: string | null
  email: string | null
  phone: string
  religion: string
  education_level: string | null
  role: string
}

const enc = new TextEncoder()

function bufToHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

export function randomHex(bytes = 16): string {
  const a = new Uint8Array(bytes)
  crypto.getRandomValues(a)
  return bufToHex(a.buffer)
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  )
  return bufToHex(bits)
}

export async function verifyPassword(password: string, salt: string, expected: string): Promise<boolean> {
  const h = await hashPassword(password, salt)
  return h === expected
}

const SESSION_DAYS = 30

export async function createSession(db: D1Database, userId: number): Promise<string> {
  const token = randomHex(32)
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  await db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(token, userId, expires).run()
  return token
}

export async function getSessionUser(db: D1Database, token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null
  const row = await db.prepare(`
    SELECT u.id, u.user_code, u.name_bn, u.name_en, u.email, u.phone, u.religion, u.education_level, u.role, u.status, s.expires_at
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token = ?
  `).bind(token).first<any>()
  if (!row) return null
  if (row.status === 'suspended') {
    await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run()
    return null
  }
  if (row.expires_at < Date.now()) {
    await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run()
    return null
  }
  delete row.expires_at
  return row as SessionUser
}

export async function destroySession(db: D1Database, token: string): Promise<void> {
  await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run()
}

// EDU-YYYY-NNNNN ইউনিক ইউজার কোড
export async function nextUserCode(db: D1Database): Promise<string> {
  const year = new Date().getFullYear()
  const row = await db.prepare('SELECT COUNT(*) AS c FROM users').first<{ c: number }>()
  const n = (row?.c ?? 0) + 1
  return `EDU-${year}-${String(n).padStart(5, '0')}`
}

export function getCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined
  const m = cookieHeader.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'))
  return m ? decodeURIComponent(m[1]) : undefined
}

export function sessionCookie(token: string): string {
  return `edusob_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 24 * 60 * 60}`
}

export function clearSessionCookie(): string {
  return 'edusob_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
}
