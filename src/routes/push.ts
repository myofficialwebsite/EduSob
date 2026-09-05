// এডুসব — ওয়েব পুশ নোটিফিকেশন (VAPID + aes128gcm, খাঁটি WebCrypto — Workers ও Node উভয়ে চলে)
import { Hono } from 'hono'
import { Bindings, getCookie, getSessionUser, SessionUser } from '../lib/auth'

type Env = { Bindings: Bindings; Variables: { user: SessionUser | null } }
const push = new Hono<Env>()

push.use('*', async (c, next) => {
  const token = getCookie(c.req.header('Cookie'), 'edusob_session')
  c.set('user', await getSessionUser(c.env.DB, token))
  await next()
})

const te = new TextEncoder()

const b64uEnc = (buf: ArrayBuffer | Uint8Array): string => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
const b64uDec = (s: string): Uint8Array => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4))
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}
const concatBuf = (...parts: Uint8Array[]): Uint8Array => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0))
  let o = 0
  for (const p of parts) { out.set(p, o); o += p.length }
  return out
}

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: string, len: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', ikm as any, 'HKDF', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: salt as any, info: te.encode(info) as any }, key, len * 8)
  return new Uint8Array(bits)
}

// RFC 8291 — aes128gcm পেলোড এনক্রিপশন
async function encryptPayload(p256dhB64: string, authB64: string, payload: string): Promise<Uint8Array> {
  const uaPub = b64uDec(p256dhB64)
  const authSecret = b64uDec(authB64)

  const eph = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])
  const uaKey = await crypto.subtle.importKey('raw', uaPub as any, { name: 'ECDH', namedCurve: 'P-256' }, false, [])
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, eph.privateKey, 256))
  const asPub = new Uint8Array(await crypto.subtle.exportKey('raw', eph.publicKey))

  const authHmac = await crypto.subtle.importKey('raw', authSecret as any, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const prkKey = new Uint8Array(await crypto.subtle.sign('HMAC', authHmac, shared as any))
  const info1 = concatBuf(te.encode('WebPush: info'), new Uint8Array([0]), uaPub, asPub, new Uint8Array([1]))
  const prkHmac = await crypto.subtle.importKey('raw', prkKey as any, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const ikm = new Uint8Array(await crypto.subtle.sign('HMAC', prkHmac, info1 as any))

  const salt = crypto.getRandomValues(new Uint8Array(16))
  const cek = await hkdf(salt, ikm, 'Content-Encoding: aes128gcm\0', 16)
  const nonce = await hkdf(salt, ikm, 'Content-Encoding: nonce\0', 12)

  const record = concatBuf(te.encode(payload), new Uint8Array([2])) // শেষ রেকর্ড ডেলিমিটার
  const aesKey = await crypto.subtle.importKey('raw', cek as any, 'AES-GCM', false, ['encrypt'])
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce as any }, aesKey, record as any))

  return concatBuf(salt, new Uint8Array([0, 0, 16, 0]), new Uint8Array([asPub.length]), asPub, cipher)
}

async function vapidAuth(endpoint: string, pubB64u: string, jwk: any, contact: string): Promise<string> {
  const aud = new URL(endpoint).origin
  const exp = Math.floor(Date.now() / 1000) + 12 * 3600
  const head = b64uEnc(te.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })))
  const body = b64uEnc(te.encode(JSON.stringify({ aud, exp, sub: contact })))
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, te.encode(head + '.' + body) as any)
  return `vapid t=${head}.${body}.${b64uEnc(sig)}, k=${pubB64u}`
}

type GetEnv = (k: string) => string | undefined

// সব সাবস্ক্রাইবারকে নোটিফিকেশন পাঠানো (ব্যর্থ/মৃত সাবস্ক্রিপশন স্বয়ংক্রিয় মুছে যায়)
export async function broadcastPush(DB: any, getEnv: GetEnv, title: string, body: string, url: string): Promise<{ sent: number; removed: number; reason?: string }> {
  const pub = getEnv('VAPID_PUBLIC_KEY')
  const priv = getEnv('VAPID_PRIVATE_KEY')
  const x = getEnv('VAPID_X')
  const y = getEnv('VAPID_Y')
  if (!pub || !priv || !x || !y) return { sent: 0, removed: 0, reason: 'vapid_not_configured' }

  const jwk = { kty: 'EC', crv: 'P-256', d: priv, x, y }
  const { results } = await DB.prepare('SELECT * FROM push_subscriptions').all()
  let sent = 0, removed = 0

  await Promise.all((results || []).map(async (s: any) => {
    try {
      const payload = JSON.stringify({ title, body, url })
      const encBody = await encryptPayload(s.p256dh, s.auth, payload)
      const auth = await vapidAuth(s.endpoint, pub, jwk, 'mailto:support@edusob.com')
      const res = await fetch(s.endpoint, {
        method: 'POST',
        headers: { Authorization: auth, 'Content-Encoding': 'aes128gcm', TTL: '86400' },
        body: encBody as any,
      })
      if (res.status === 200 || res.status === 201) sent++
      else if (res.status === 404 || res.status === 410) {
        await DB.prepare('DELETE FROM push_subscriptions WHERE id = ?').bind(s.id).run()
        removed++
      }
    } catch (e) {
      console.error('[push] send error:', e)
    }
  }))

  return { sent, removed }
}

const requireAdmin = async (c: any, next: any) => {
  const u = c.get('user')
  if (!u || u.role !== 'admin') return c.json({ ok: false, error: 'অ্যাডমিন অ্যাক্সেস প্রয়োজন' }, 403)
  await next()
}

const envGetter = (c: any): GetEnv => (k) => (c.env as any)?.[k] || (typeof process !== 'undefined' ? process.env?.[k] : undefined)

push.get('/vapid-key', (c) => {
  const key = envGetter(c)('VAPID_PUBLIC_KEY')
  if (!key) return c.json({ ok: false, error: 'push_not_configured' }, 503)
  return c.json({ ok: true, key })
})

push.post('/subscribe', async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  const ep = b?.endpoint
  const p256dh = b?.keys?.p256dh
  const auth = b?.keys?.auth
  if (!ep || !p256dh || !auth) return c.json({ ok: false, error: 'ভুল সাবস্ক্রিপশন' }, 400)
  const user = c.get('user')
  await c.env.DB.prepare(
    'INSERT INTO push_subscriptions (endpoint, p256dh, auth, user_id, user_agent) VALUES (?, ?, ?, ?, ?) ON CONFLICT(endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth, user_id = excluded.user_id'
  ).bind(String(ep), String(p256dh), String(auth), user?.id ?? null, (c.req.header('user-agent') || '').slice(0, 200)).run()
  return c.json({ ok: true })
})

push.post('/unsubscribe', async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (b?.endpoint) await c.env.DB.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').bind(String(b.endpoint)).run()
  return c.json({ ok: true })
})

push.post('/broadcast', requireAdmin, async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b?.title) return c.json({ ok: false, error: 'শিরোনাম দিন' }, 400)
  const r = await broadcastPush(c.env.DB, envGetter(c), String(b.title).slice(0, 120), String(b.body || '').slice(0, 300), String(b.url || '/'))
  return c.json({ ok: true, ...r })
})

push.get('/stats', requireAdmin, async (c) => {
  const row: any = await c.env.DB.prepare('SELECT COUNT(*) n FROM push_subscriptions').first()
  return c.json({ ok: true, subscribers: Number(row?.n || 0) })
})

export default push
