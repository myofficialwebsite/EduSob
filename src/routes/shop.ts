// এডুসব ফেজ-৫ — শপ API: প্রোডাক্ট, অর্ডার (COD/ওয়ালেট), ম্যানুয়াল পেমেন্ট, অ্যাসিস্টেড আবেদন, এডমিন
import { Hono } from 'hono'
import { Bindings, getCookie, getSessionUser, SessionUser } from '../lib/auth'

type Env = { Bindings: Bindings; Variables: { user: SessionUser | null } }
const shop = new Hono<Env>()

// সেশন লোডার
shop.use('*', async (c, next) => {
  const token = getCookie(c.req.header('Cookie'), 'edusob_session')
  c.set('user', await getSessionUser(c.env.DB, token))
  await next()
})
const requireAuth = async (c: any, next: any) => {
  if (!c.get('user')) return c.json({ ok: false, error: 'লগইন প্রয়োজন' }, 401)
  await next()
}
const requireAdmin = async (c: any, next: any) => {
  const u = c.get('user')
  if (!u) return c.json({ ok: false, error: 'লগইন প্রয়োজন' }, 401)
  if (u.role !== 'admin') return c.json({ ok: false, error: 'এডমিন অনুমতি প্রয়োজন' }, 403)
  await next()
}

const CATEGORIES = ['books', 'stationery', 'electronics', 'package', 'other']

export async function isShopEnabled(DB: any): Promise<boolean> {
  const row: any = await DB.prepare("SELECT value FROM settings WHERE key='shop_enabled'").first()
  return row ? row.value !== '0' : true
}

// ================= পাবলিক =================

// প্রোডাক্ট তালিকা (গেস্ট ব্রাউজ)
shop.get('/products', async (c) => {
  const enabled = await isShopEnabled(c.env.DB)
  const cat = c.req.query('category')
  let sql = 'SELECT id, name_bn, description, category, price, offer_price, stock, image_url FROM products WHERE is_active=1'
  const binds: any[] = []
  if (cat && CATEGORIES.includes(cat)) { sql += ' AND category=?'; binds.push(cat) }
  sql += ' ORDER BY (offer_price IS NOT NULL) DESC, id DESC'
  const rows = await c.env.DB.prepare(sql).bind(...binds).all()
  return c.json({ ok: true, shop_enabled: enabled, products: enabled ? rows.results : [] })
})

// সাইনবোর্ড পপ-আপ প্রোডাক্ট (সর্বোচ্চ ৫টি)
shop.get('/signboard', async (c) => {
  const enabled = await isShopEnabled(c.env.DB)
  if (!enabled) return c.json({ ok: true, products: [] })
  const rows = await c.env.DB.prepare(
    'SELECT id, name_bn, price, offer_price, image_url FROM products WHERE is_active=1 AND is_signboard=1 AND stock>0 ORDER BY updated_at DESC LIMIT 5'
  ).all()
  return c.json({ ok: true, products: rows.results })
})

// পাবলিক সেটিংস (পেমেন্ট নম্বর + ডেলিভারি চার্জ)
shop.get('/settings', async (c) => {
  const enabled = await isShopEnabled(c.env.DB)
  const rows = await c.env.DB.prepare(
    "SELECT key, value FROM settings WHERE key IN ('bkash_number','nagad_number','whatsapp_number','cod_charge','shop_enabled')"
  ).all()
  const s: Record<string, string> = { shop_enabled: enabled ? '1' : '0' }
  for (const r of rows.results as any[]) s[r.key] = r.value
  return c.json({ ok: true, settings: s, shop_enabled: enabled })
})

// অর্ডার তৈরি (গেস্ট: COD; লগইন: COD/ওয়ালেট)
shop.post('/orders', async (c) => {
  const enabled = await isShopEnabled(c.env.DB)
  if (!enabled) return c.json({ ok: false, error: 'এডুসব শপ সেবা বর্তমানে সাময়িকভাবে স্থগিত বা বন্ধ রয়েছে।' }, 403)
  const user = c.get('user')
  const body = await c.req.json<any>().catch(() => null)
  if (!body) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)

  const name = String(body.customer_name || '').trim().slice(0, 100)
  const phone = String(body.customer_phone || '').trim().slice(0, 20)
  const address = String(body.address || '').trim().slice(0, 500)
  const note = String(body.note || '').trim().slice(0, 300) || null
  const method = body.payment_method === 'wallet' ? 'wallet' : 'cod'
  const items = Array.isArray(body.items) ? body.items.slice(0, 20) : []

  if (!name || !phone || !address) return c.json({ ok: false, error: 'নাম, মোবাইল ও ঠিকানা আবশ্যক' }, 400)
  if (!/^01[3-9]\d{8}$/.test(phone)) return c.json({ ok: false, error: 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)' }, 400)
  if (!items.length) return c.json({ ok: false, error: 'কার্ট খালি' }, 400)
  if (method === 'wallet' && !user) return c.json({ ok: false, error: 'ওয়ালেট পেমেন্টের জন্য লগইন প্রয়োজন' }, 401)

  // প্রোডাক্ট যাচাই + দাম সার্ভার-সাইডে হিসাব
  const ids = items.map((i: any) => Number(i.product_id)).filter((n: number) => n > 0)
  if (!ids.length || ids.length !== items.length) return c.json({ ok: false, error: 'ভুল প্রোডাক্ট' }, 400)
  const ph = ids.map(() => '?').join(',')
  const prows = await c.env.DB.prepare(`SELECT id, name_bn, price, offer_price, stock FROM products WHERE is_active=1 AND id IN (${ph})`).bind(...ids).all()
  const pmap = new Map((prows.results as any[]).map(p => [p.id, p]))

  let subtotal = 0
  const lines: { pid: number; name: string; unit: number; qty: number }[] = []
  for (const it of items) {
    const p = pmap.get(Number(it.product_id))
    if (!p) return c.json({ ok: false, error: 'একটি প্রোডাক্ট পাওয়া যায়নি বা স্টকে নেই' }, 400)
    const qty = Math.min(Math.max(Math.floor(Number(it.qty) || 1), 1), 20)
    if (p.stock < qty) return c.json({ ok: false, error: `"${p.name_bn}" — পর্যাপ্ত স্টক নেই (আছে ${p.stock}টি)` }, 400)
    const unit = p.offer_price ?? p.price
    subtotal += unit * qty
    lines.push({ pid: p.id, name: p.name_bn, unit, qty })
  }

  const codRow: any = await c.env.DB.prepare("SELECT value FROM settings WHERE key='cod_charge'").first()
  const codCharge = method === 'cod' ? (Number(codRow?.value) || 0) : 0
  const total = subtotal + codCharge

  // ওয়ালেট পেমেন্ট: ব্যালেন্স চেক
  if (method === 'wallet') {
    const w: any = await c.env.DB.prepare('SELECT balance FROM wallets WHERE user_id=?').bind(user!.id).first()
    const bal = Number(w?.balance) || 0
    if (bal < total) return c.json({ ok: false, error: `ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই (আছে ৳${bal}, দরকার ৳${total})` }, 400)
  }

  // অর্ডার ইনসার্ট
  const ores = await c.env.DB.prepare(
    'INSERT INTO orders (user_id, customer_name, customer_phone, address, payment_method, total, note) VALUES (?,?,?,?,?,?,?)'
  ).bind(user?.id ?? null, name, phone, address, method, total, note).run()
  const orderId = ores.meta.last_row_id

  // আইটেম + স্টক + (ওয়ালেট হলে) ব্যালেন্স কাটা — এক ব্যাচে
  const batch: any[] = []
  for (const l of lines) {
    batch.push(c.env.DB.prepare('INSERT INTO order_items (order_id, product_id, product_name, unit_price, qty) VALUES (?,?,?,?,?)').bind(orderId, l.pid, l.name, l.unit, l.qty))
    batch.push(c.env.DB.prepare('UPDATE products SET stock=stock-? WHERE id=?').bind(l.qty, l.pid))
  }
  if (method === 'wallet') {
    batch.push(c.env.DB.prepare('UPDATE wallets SET balance=balance-? WHERE user_id=?').bind(total, user!.id))
    batch.push(c.env.DB.prepare("INSERT INTO wallet_transactions (user_id, amount, type, note) VALUES (?,?,'purchase',?)").bind(user!.id, -total, `অর্ডার #${orderId} — শপ কেনাকাটা`))
    batch.push(c.env.DB.prepare("UPDATE orders SET status='confirmed' WHERE id=?").bind(orderId))
  }
  await c.env.DB.batch(batch)

  return c.json({ ok: true, order_id: orderId, total, cod_charge: codCharge, status: method === 'wallet' ? 'confirmed' : 'pending' })
})

// আমার অর্ডার
shop.get('/orders/mine', requireAuth, async (c) => {
  const user = c.get('user')!
  const orders = await c.env.DB.prepare('SELECT id, payment_method, total, status, created_at FROM orders WHERE user_id=? ORDER BY id DESC LIMIT 30').bind(user.id).all()
  const list = orders.results as any[]
  if (list.length) {
    const oids = list.map(o => o.id)
    const ph = oids.map(() => '?').join(',')
    const items = await c.env.DB.prepare(`SELECT order_id, product_name, unit_price, qty FROM order_items WHERE order_id IN (${ph})`).bind(...oids).all()
    for (const o of list) o.items = (items.results as any[]).filter(i => i.order_id === o.id)
  }
  return c.json({ ok: true, orders: list })
})

// ================= ম্যানুয়াল পেমেন্ট (টপ-আপ) =================

shop.post('/payments', requireAuth, async (c) => {
  const user = c.get('user')!
  const body = await c.req.json<any>().catch(() => null)
  if (!body) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)
  const method = body.method === 'nagad' ? 'nagad' : body.method === 'bkash' ? 'bkash' : null
  if (!method) return c.json({ ok: false, error: 'পেমেন্ট মাধ্যম (বিকাশ/নগদ) বাছুন' }, 400)
  const sender = String(body.sender_number || '').trim().slice(0, 20)
  const trx = String(body.trx_id || '').trim().slice(0, 40)
  const amount = Math.floor(Number(body.amount) || 0)
  const ss = typeof body.screenshot_data === 'string' && body.screenshot_data.startsWith('data:image') ? body.screenshot_data.slice(0, 300000) : null
  if (!/^01[3-9]\d{8}$/.test(sender)) return c.json({ ok: false, error: 'সঠিক প্রেরক নম্বর দিন' }, 400)
  if (!trx) return c.json({ ok: false, error: 'ট্রানজেকশন আইডি দিন' }, 400)
  if (amount < 10 || amount > 50000) return c.json({ ok: false, error: 'পরিমাণ ১০–৫০,০০০ টাকার মধ্যে হতে হবে' }, 400)

  // একই trx_id দিয়ে ডুপ্লিকেট ঠেকানো
  const dup = await c.env.DB.prepare("SELECT id FROM payment_requests WHERE trx_id=? AND status!='rejected'").bind(trx).first()
  if (dup) return c.json({ ok: false, error: 'এই ট্রানজেকশন আইডি ইতিমধ্যে জমা হয়েছে' }, 400)

  const r = await c.env.DB.prepare(
    'INSERT INTO payment_requests (user_id, method, sender_number, trx_id, amount, screenshot_data) VALUES (?,?,?,?,?,?)'
  ).bind(user.id, method, sender, trx, amount, ss).run()
  return c.json({ ok: true, id: r.meta.last_row_id })
})

shop.get('/payments/mine', requireAuth, async (c) => {
  const user = c.get('user')!
  const rows = await c.env.DB.prepare(
    'SELECT id, method, sender_number, trx_id, amount, status, admin_note, created_at, reviewed_at FROM payment_requests WHERE user_id=? ORDER BY id DESC LIMIT 30'
  ).bind(user.id).all()
  return c.json({ ok: true, payments: rows.results })
})

// ================= অ্যাসিস্টেড আবেদন =================

shop.post('/assisted', requireAuth, async (c) => {
  const user = c.get('user')!
  const body = await c.req.json<any>().catch(() => null)
  if (!body) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)
  const types = ['admission', 'job_application', 'form_fillup', 'other']
  const st = types.includes(body.service_type) ? body.service_type : 'other'
  const details = String(body.details || '').trim().slice(0, 2000)
  if (details.length < 10) return c.json({ ok: false, error: 'বিস্তারিত লিখুন (কোন আবেদন, লিংক, ডেডলাইন ইত্যাদি)' }, 400)
  const r = await c.env.DB.prepare('INSERT INTO assisted_requests (user_id, service_type, details) VALUES (?,?,?)').bind(user.id, st, details).run()
  const reqId = r.meta.last_row_id
  return c.json({ ok: true, id: reqId, request_id: reqId })
})

shop.get('/assisted/mine', requireAuth, async (c) => {
  const user = c.get('user')!
  const rows = await c.env.DB.prepare(
    'SELECT id, service_type, details, fee, status, admin_note, created_at, updated_at FROM assisted_requests WHERE user_id=? ORDER BY id DESC LIMIT 30'
  ).bind(user.id).all()
  return c.json({ ok: true, requests: rows.results })
})

// অ্যাসিস্টেড ফি ওয়ালেট থেকে পরিশোধ
shop.post('/assisted/:id/pay', requireAuth, async (c) => {
  const user = c.get('user')!
  const id = Number(c.req.param('id'))
  const req: any = await c.env.DB.prepare("SELECT id, fee, status FROM assisted_requests WHERE id=? AND user_id=?").bind(id, user.id).first()
  if (!req) return c.json({ ok: false, error: 'পাওয়া যায়নি' }, 404)
  if (req.status !== 'quoted' || !req.fee) return c.json({ ok: false, error: 'এডমিন ফি নির্ধারণের পর পরিশোধ করা যাবে' }, 400)
  const w: any = await c.env.DB.prepare('SELECT balance FROM wallets WHERE user_id=?').bind(user.id).first()
  const bal = Number(w?.balance) || 0
  if (bal < req.fee) return c.json({ ok: false, error: `ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই (আছে ৳${bal}, দরকার ৳${req.fee})` }, 400)
  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE wallets SET balance=balance-? WHERE user_id=?').bind(req.fee, user.id),
    c.env.DB.prepare("INSERT INTO wallet_transactions (user_id, amount, type, note) VALUES (?,?,'purchase',?)").bind(user.id, -req.fee, `অ্যাসিস্টেড আবেদন #${id} ফি`),
    c.env.DB.prepare("UPDATE assisted_requests SET status='paid', updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(id)
  ])
  return c.json({ ok: true })
})

// ================= এডমিন =================

// --- প্রোডাক্ট CRUD ---
shop.get('/admin/products', requireAdmin, async (c) => {
  const rows = await c.env.DB.prepare('SELECT * FROM products ORDER BY id DESC').all()
  return c.json({ ok: true, products: rows.results })
})

shop.post('/admin/products', requireAdmin, async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)
  const name = String(b.name_bn || '').trim().slice(0, 150)
  const price = Math.floor(Number(b.price) || 0)
  if (!name || price <= 0) return c.json({ ok: false, error: 'নাম ও দাম আবশ্যক' }, 400)
  const cat = CATEGORIES.includes(b.category) ? b.category : 'other'
  const offer = b.offer_price ? Math.floor(Number(b.offer_price)) : null
  if (offer !== null && (offer <= 0 || offer >= price)) return c.json({ ok: false, error: 'অফার দাম মূল দামের চেয়ে কম হতে হবে' }, 400)
  const isSb = b.is_signboard ? 1 : 0
  if (isSb) {
    const cnt: any = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM products WHERE is_signboard=1').first()
    if ((cnt?.n || 0) >= 5) return c.json({ ok: false, error: 'সাইনবোর্ডে সর্বোচ্চ ৫টি প্রোডাক্ট রাখা যাবে' }, 400)
  }
  const r = await c.env.DB.prepare(
    'INSERT INTO products (name_bn, description, category, price, offer_price, stock, image_url, is_active, is_signboard) VALUES (?,?,?,?,?,?,?,?,?)'
  ).bind(name, String(b.description || '').slice(0, 500), cat, price, offer, Math.max(Math.floor(Number(b.stock) || 0), 0), String(b.image_url || '📦').slice(0, 300), b.is_active === false ? 0 : 1, isSb).run()
  return c.json({ ok: true, id: r.meta.last_row_id })
})

shop.put('/admin/products/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'))
  const p: any = await c.env.DB.prepare('SELECT * FROM products WHERE id=?').bind(id).first()
  if (!p) return c.json({ ok: false, error: 'পাওয়া যায়নি' }, 404)
  const b = await c.req.json<any>().catch(() => null)
  if (!b) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)
  const name = b.name_bn !== undefined ? String(b.name_bn).trim().slice(0, 150) : p.name_bn
  const price = b.price !== undefined ? Math.floor(Number(b.price) || 0) : p.price
  if (!name || price <= 0) return c.json({ ok: false, error: 'নাম ও দাম আবশ্যক' }, 400)
  const offer = b.offer_price !== undefined ? (b.offer_price ? Math.floor(Number(b.offer_price)) : null) : p.offer_price
  if (offer !== null && (offer <= 0 || offer >= price)) return c.json({ ok: false, error: 'অফার দাম মূল দামের চেয়ে কম হতে হবে' }, 400)
  const isSb = b.is_signboard !== undefined ? (b.is_signboard ? 1 : 0) : p.is_signboard
  if (isSb && !p.is_signboard) {
    const cnt: any = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM products WHERE is_signboard=1 AND id!=?').bind(id).first()
    if ((cnt?.n || 0) >= 5) return c.json({ ok: false, error: 'সাইনবোর্ডে সর্বোচ্চ ৫টি প্রোডাক্ট রাখা যাবে' }, 400)
  }
  await c.env.DB.prepare(
    'UPDATE products SET name_bn=?, description=?, category=?, price=?, offer_price=?, stock=?, image_url=?, is_active=?, is_signboard=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
  ).bind(
    name,
    b.description !== undefined ? String(b.description).slice(0, 500) : p.description,
    b.category !== undefined && CATEGORIES.includes(b.category) ? b.category : p.category,
    price, offer,
    b.stock !== undefined ? Math.max(Math.floor(Number(b.stock) || 0), 0) : p.stock,
    b.image_url !== undefined ? String(b.image_url).slice(0, 300) : p.image_url,
    b.is_active !== undefined ? (b.is_active ? 1 : 0) : p.is_active,
    isSb, id
  ).run()
  return c.json({ ok: true })
})

shop.delete('/admin/products/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'))
  await c.env.DB.prepare('DELETE FROM products WHERE id=?').bind(id).run()
  return c.json({ ok: true })
})

// --- অর্ডার ম্যানেজমেন্ট ---
shop.get('/admin/orders', requireAdmin, async (c) => {
  const st = c.req.query('status')
  let sql = 'SELECT * FROM orders'
  const binds: any[] = []
  if (st) { sql += ' WHERE status=?'; binds.push(st) }
  sql += ' ORDER BY id DESC LIMIT 100'
  const orders = await c.env.DB.prepare(sql).bind(...binds).all()
  const list = orders.results as any[]
  if (list.length) {
    const oids = list.map(o => o.id)
    const ph = oids.map(() => '?').join(',')
    const items = await c.env.DB.prepare(`SELECT order_id, product_name, unit_price, qty FROM order_items WHERE order_id IN (${ph})`).bind(...oids).all()
    for (const o of list) o.items = (items.results as any[]).filter(i => i.order_id === o.id)
  }
  return c.json({ ok: true, orders: list })
})

shop.put('/admin/orders/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'))
  const b = await c.req.json<any>().catch(() => null)
  const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
  if (!b || !statuses.includes(b.status)) return c.json({ ok: false, error: 'ভুল স্ট্যাটাস' }, 400)
  const o: any = await c.env.DB.prepare('SELECT * FROM orders WHERE id=?').bind(id).first()
  if (!o) return c.json({ ok: false, error: 'পাওয়া যায়নি' }, 404)
  const batch: any[] = [
    c.env.DB.prepare('UPDATE orders SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(b.status, id)
  ]
  // ওয়ালেট অর্ডার বাতিল হলে রিফান্ড + স্টক ফেরত
  if (b.status === 'cancelled' && o.status !== 'cancelled') {
    const items = await c.env.DB.prepare('SELECT product_id, qty FROM order_items WHERE order_id=?').bind(id).all()
    for (const it of items.results as any[]) {
      batch.push(c.env.DB.prepare('UPDATE products SET stock=stock+? WHERE id=?').bind(it.qty, it.product_id))
    }
    if (o.payment_method === 'wallet' && o.user_id) {
      batch.push(c.env.DB.prepare('UPDATE wallets SET balance=balance+? WHERE user_id=?').bind(o.total, o.user_id))
      batch.push(c.env.DB.prepare("INSERT INTO wallet_transactions (user_id, amount, type, note) VALUES (?,?,'refund',?)").bind(o.user_id, o.total, `অর্ডার #${id} বাতিল — রিফান্ড`))
    }
  }
  await c.env.DB.batch(batch)
  return c.json({ ok: true })
})

// --- পেমেন্ট রিভিউ ---
shop.get('/admin/payments', requireAdmin, async (c) => {
  const st = c.req.query('status') || 'pending'
  const rows = await c.env.DB.prepare(
    'SELECT pr.*, u.name_bn AS user_name, u.phone AS user_phone FROM payment_requests pr JOIN users u ON u.id=pr.user_id WHERE pr.status=? ORDER BY pr.id DESC LIMIT 50'
  ).bind(st).all()
  return c.json({ ok: true, payments: rows.results })
})

shop.post('/admin/payments/:id/approve', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'))
  const pr: any = await c.env.DB.prepare("SELECT * FROM payment_requests WHERE id=? AND status='pending'").bind(id).first()
  if (!pr) return c.json({ ok: false, error: 'পেন্ডিং রিকোয়েস্ট পাওয়া যায়নি' }, 404)
  await c.env.DB.batch([
    c.env.DB.prepare("UPDATE payment_requests SET status='approved', reviewed_at=CURRENT_TIMESTAMP WHERE id=?").bind(id),
    c.env.DB.prepare('INSERT INTO wallets (user_id, balance) VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET balance=balance+excluded.balance').bind(pr.user_id, pr.amount),
    c.env.DB.prepare("INSERT INTO wallet_transactions (user_id, amount, type, note) VALUES (?,?,'manual_topup',?)").bind(pr.user_id, pr.amount, `${pr.method === 'bkash' ? 'বিকাশ' : 'নগদ'} টপ-আপ (TrxID: ${pr.trx_id})`)
  ])
  return c.json({ ok: true })
})

shop.post('/admin/payments/:id/reject', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'))
  const b = await c.req.json<any>().catch(() => ({}))
  const note = String(b?.admin_note || '').slice(0, 300) || null
  const r = await c.env.DB.prepare("UPDATE payment_requests SET status='rejected', admin_note=?, reviewed_at=CURRENT_TIMESTAMP WHERE id=? AND status='pending'").bind(note, id).run()
  if (!r.meta.changes) return c.json({ ok: false, error: 'পেন্ডিং রিকোয়েস্ট পাওয়া যায়নি' }, 404)
  return c.json({ ok: true })
})

// --- অ্যাসিস্টেড কিউ ---
shop.get('/admin/assisted', requireAdmin, async (c) => {
  const rows = await c.env.DB.prepare(
    'SELECT ar.*, u.name_bn AS user_name, u.phone AS user_phone FROM assisted_requests ar JOIN users u ON u.id=ar.user_id ORDER BY ar.id DESC LIMIT 100'
  ).all()
  return c.json({ ok: true, requests: rows.results })
})

shop.put('/admin/assisted/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'))
  const b = await c.req.json<any>().catch(() => null)
  if (!b) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)
  const req: any = await c.env.DB.prepare('SELECT * FROM assisted_requests WHERE id=?').bind(id).first()
  if (!req) return c.json({ ok: false, error: 'পাওয়া যায়নি' }, 404)
  const statuses = ['requested', 'quoted', 'paid', 'processing', 'done', 'cancelled']
  const status = statuses.includes(b.status) ? b.status : req.status
  const fee = b.fee !== undefined ? Math.max(Math.floor(Number(b.fee) || 0), 0) : req.fee
  const note = b.admin_note !== undefined ? String(b.admin_note).slice(0, 500) : req.admin_note
  await c.env.DB.prepare('UPDATE assisted_requests SET status=?, fee=?, admin_note=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(status, fee, note, id).run()
  return c.json({ ok: true })
})

// --- সেটিংস ---
shop.get('/admin/settings', requireAdmin, async (c) => {
  const rows = await c.env.DB.prepare(
    "SELECT key, value FROM settings WHERE key IN ('bkash_number','nagad_number','whatsapp_number','cod_charge','shop_enabled')"
  ).all()
  const s: Record<string, string> = { shop_enabled: '1' }
  for (const r of rows.results as any[]) s[r.key] = r.value
  return c.json({ ok: true, settings: s })
})

shop.put('/admin/settings', requireAdmin, async (c) => {
  const b = await c.req.json<any>().catch(() => null)
  if (!b) return c.json({ ok: false, error: 'ভুল অনুরোধ' }, 400)
  const allowed = ['bkash_number', 'nagad_number', 'whatsapp_number', 'cod_charge', 'shop_enabled']
  const batch: any[] = []
  for (const k of allowed) {
    if (b[k] !== undefined) {
      batch.push(c.env.DB.prepare('INSERT INTO settings (key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(k, String(b[k]).slice(0, 50)))
    }
  }
  if (batch.length) await c.env.DB.batch(batch)
  return c.json({ ok: true })
})

export default shop
