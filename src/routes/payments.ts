// এডুসব — বিকাশ টোকেনাইজড চেকআউট (অটো ওয়ালেট টপ-আপ)
// মার্চেন্ট ক্রেডেনশিয়াল env-এ বসালেই লাইভ: BKASH_BASE_URL, BKASH_APP_KEY, BKASH_APP_SECRET, BKASH_USERNAME, BKASH_PASSWORD, PUBLIC_BASE_URL
// ক্রেডেনশিয়াল না থাকলে API সুন্দরভাবে জানিয়ে দেয় এবং ম্যানুয়াল TRX ফ্লো অক্ষত থাকে।
import { Hono } from 'hono'
import { Bindings, getCookie, getSessionUser, SessionUser } from '../lib/auth'

type Env = { Bindings: Bindings; Variables: { user: SessionUser | null } }
const payments = new Hono<Env>()

payments.use('*', async (c, next) => {
  const token = getCookie(c.req.header('Cookie'), 'edusob_session')
  c.set('user', await getSessionUser(c.env.DB, token))
  await next()
})
const requireAuth = async (c: any, next: any) => {
  if (!c.get('user')) return c.json({ ok: false, error: 'লগইন প্রয়োজন' }, 401)
  await next()
}

const envGet = (c: any, key: string): string | undefined =>
  (c.env as any)?.[key] || (typeof process !== 'undefined' ? process.env?.[key] : undefined)

const bkashConfig = (c: any) => {
  const cfg = {
    baseUrl: envGet(c, 'BKASH_BASE_URL') || 'https://checkout.sandbox.bka.sh/v1.2.0-beta',
    appKey: envGet(c, 'BKASH_APP_KEY'),
    appSecret: envGet(c, 'BKASH_APP_SECRET'),
    username: envGet(c, 'BKASH_USERNAME'),
    password: envGet(c, 'BKASH_PASSWORD'),
  }
  const configured = !!(cfg.appKey && cfg.appSecret && cfg.username && cfg.password)
  return { ...cfg, configured }
}

// গ্রান্ট টোকেন ইন-মেমরি ক্যাশ (৩৬০০ সেকেন্ড মেয়াদ)
let tokenCache: { token: string; exp: number } | undefined

async function grantToken(cfg: ReturnType<typeof bkashConfig>): Promise<string> {
  if (tokenCache && tokenCache.exp > Date.now() + 60_000) return tokenCache.token
  const res = await fetch(cfg.baseUrl + '/checkout/token/grant', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      username: cfg.username!,
      password: cfg.password!,
    },
    body: JSON.stringify({ app_key: cfg.appKey, app_secret: cfg.appSecret }),
  })
  const data: any = await res.json()
  if (!res.ok || !data.id_token) throw new Error('bKash token grant failed: ' + JSON.stringify(data))
  tokenCache = { token: data.id_token, exp: Date.now() + Number(data.expires_in || 3600) * 1000 }
  return data.id_token
}

async function bkashApi(c: any, path: string, init: RequestInit = {}) {
  const cfg = bkashConfig(c)
  const token = await grantToken(cfg)
  const headers = new Headers(init.headers as any)
  headers.set('content-type', 'application/json')
  headers.set('accept', 'application/json')
  headers.set('authorization', token)
  headers.set('x-app-key', cfg.appKey!)
  const res = await fetch(cfg.baseUrl + path, { ...init, headers })
  const data: any = await res.json()
  return { ok: res.ok, data }
}

const baseUrl = (c: any) =>
  envGet(c, 'PUBLIC_BASE_URL') || new URL(c.req.url).origin

const autoPayEnabled = async (c: any): Promise<boolean> => {
  try {
    const v = await c.env.DB.prepare("SELECT value FROM settings WHERE key = 'bkash_auto_enabled'").first('value')
    return String(v ?? '0') === '1'
  } catch { return false }
}

payments.get('/config', async (c) => {
  const cfg = bkashConfig(c)
  const enabled = await autoPayEnabled(c)
  return c.json({ ok: true, bkash_auto: cfg.configured && enabled })
})

payments.post('/bkash/create', requireAuth, async (c) => {
  const user = c.get('user')!
  const cfg = bkashConfig(c)
  if (!cfg.configured) {
    return c.json({ ok: false, configured: false, error: 'অটো পেমেন্ট এখনো চালু হয়নি — নিচের ম্যানুয়াল টপ-আপ ফর্ম ব্যবহার করুন' }, 503)
  }
  if (!(await autoPayEnabled(c))) {
    return c.json({ ok: false, configured: true, error: 'অটো পেমেন্ট বর্তমানে বন্ধ আছে — ম্যানুয়াল টপ-আপ ব্যবহার করুন' }, 503)
  }

  const body = await c.req.json<any>().catch(() => null)
  const amount = Math.trunc(Number(body?.amount))
  if (!amount || amount < 10 || amount > 50000) {
    return c.json({ ok: false, error: 'সঠিক পরিমাণ দিন (৳১০ – ৳৫০,০০০)' }, 400)
  }

  const invoice = `EDUSOB-TU-${user.id}-${Date.now()}`
  await c.env.DB.prepare(
    "INSERT INTO gateway_payments (invoice, user_id, provider, amount, status) VALUES (?, ?, 'bkash', ?, 'created')"
  ).bind(invoice, user.id, amount).run()

  try {
    const { data } = await bkashApi(c, '/tokenized/checkout/create', {
      method: 'POST',
      body: JSON.stringify({
        mode: '0011',
        payerReference: String(user.phone || user.id),
        callbackURL: baseUrl(c) + '/api/payments/bkash/callback',
        amount: String(amount),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: invoice,
      }),
    })
    if (!data.paymentID || !data.bkashURL) throw new Error(JSON.stringify(data))

    await c.env.DB.prepare(
      "UPDATE gateway_payments SET payment_id = ?, status = 'redirected', updated_at = CURRENT_TIMESTAMP WHERE invoice = ?"
    ).bind(data.paymentID, invoice).run()

    return c.json({ ok: true, redirect_url: data.bkashURL, invoice })
  } catch (e: any) {
    await c.env.DB.prepare(
      "UPDATE gateway_payments SET status = 'failed', raw = ?, updated_at = CURRENT_TIMESTAMP WHERE invoice = ?"
    ).bind(String(e?.message || e), invoice).run()
    return c.json({ ok: false, error: 'বিকাশ পেমেন্ট শুরু করা যায়নি — কিছুক্ষণ পর আবার চেষ্টা করুন বা ম্যানুয়াল টপ-আপ দিন' }, 502)
  }
})

payments.get('/bkash/callback', async (c) => {
  const q = c.req.query()
  const fail = (reason: string) => c.redirect(baseUrl(c) + '/wallet?pay=failed&reason=' + encodeURIComponent(reason))
  if (q.status !== 'success' || !q.paymentID) return fail(q.status || 'cancelled')

  const payment: any = await c.env.DB.prepare(
    'SELECT * FROM gateway_payments WHERE payment_id = ?'
  ).bind(q.paymentID).first()
  if (!payment) return fail('unknown_payment')

  if (payment.status === 'paid') {
    return c.redirect(baseUrl(c) + '/wallet?pay=success&amount=' + payment.amount)
  }

  try {
    const { data } = await bkashApi(c, '/tokenized/checkout/execute/' + encodeURIComponent(q.paymentID), { method: 'POST' })
    if (data.statusCode !== '0000' || data.transactionStatus !== 'Completed') {
      await c.env.DB.prepare(
        "UPDATE gateway_payments SET status = 'failed', raw = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      ).bind(JSON.stringify(data), payment.id).run()
      return fail('execute_failed')
    }

    const paidAmount = Math.trunc(Number(data.amount))
    if (paidAmount !== payment.amount) {
      await c.env.DB.prepare(
        "UPDATE gateway_payments SET status = 'failed', raw = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      ).bind(JSON.stringify({ expected: payment.amount, got: data }), payment.id).run()
      return fail('amount_mismatch')
    }

    // আইডেমপোটেন্ট ক্রেডিট — একই কলব্যাক দুইবার এলেও একবারই টাকা যোগ হবে
    const upd = await c.env.DB.prepare(
      "UPDATE gateway_payments SET status = 'paid', trx_id = ?, raw = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status != 'paid'"
    ).bind(data.trxID || null, JSON.stringify(data), payment.id).run()

    if ((upd.meta?.changes ?? 0) > 0) {
      await c.env.DB.batch([
        c.env.DB.prepare('INSERT INTO wallets (user_id, balance) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET balance = balance + excluded.balance').bind(payment.user_id, payment.amount),
        c.env.DB.prepare("INSERT INTO wallet_transactions (user_id, amount, type, note, status) VALUES (?, ?, 'gateway_topup', ?, 'approved')").bind(payment.user_id, payment.amount, `বিকাশ অটো টপ-আপ${data.trxID ? ' (TrxID: ' + data.trxID + ')' : ''}`),
      ])
    }

    return c.redirect(baseUrl(c) + '/wallet?pay=success&amount=' + payment.amount)
  } catch (e: any) {
    console.error('bKash callback error:', e)
    return fail('server_error')
  }
})

payments.get('/status/:invoice', requireAuth, async (c) => {
  const user = c.get('user')!
  const row: any = await c.env.DB.prepare(
    'SELECT invoice, amount, status, trx_id, created_at FROM gateway_payments WHERE invoice = ? AND user_id = ?'
  ).bind(c.req.param('invoice'), user.id).first()
  if (!row) return c.json({ ok: false, error: 'পেমেন্ট পাওয়া যায়নি' }, 404)
  return c.json({ ok: true, payment: row })
})

export default payments
