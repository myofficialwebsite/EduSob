// প্রোডাকশন D1 বনাম লোকাল স্কিমা — কলাম-লেভেল ড্রিফ্ট খোঁজে
// (টেবিল থাকলেও কলাম কম থাকলে SELECT/WHERE ব্যর্থ হয় -> ৫০০)
import { execFileSync } from 'node:child_process'
import sqlite3 from 'better-sqlite3'

const NODE = '/tmp/node-v22.14.0-linux-x64/bin/node'
const WRANGLER = process.env.HOME + '/.npm/_npx'
const ACC = process.env.CLOUDFLARE_ACCOUNT_ID
const TOK = process.env.CLOUDFLARE_API_TOKEN

function d1(sql) {
  const out = execFileSync(
    process.env.PATH.startsWith('/tmp/node') ? 'npx' : 'npx',
    ['wrangler@4', 'd1', 'execute', 'edusob-production', '--remote', '--json', '--command', sql],
    { encoding: 'utf8', env: { ...process.env, CLOUDFLARE_API_TOKEN: TOK, CLOUDFLARE_ACCOUNT_ID: ACC, PATH: '/tmp/node-v22.14.0-linux-x64/bin:' + process.env.PATH } },
  )
  const i = out.indexOf('[')
  const j = out.indexOf('{')
  const parsed = JSON.parse(out.slice(i >= 0 && i < j ? i : j))
  const arr = Array.isArray(parsed) ? parsed : [parsed]
  if (arr[0] && arr[0].error) throw new Error(JSON.stringify(arr[0].error))
  return arr.flatMap((r) => r.results || [])
}

const prodTables = d1("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
  .map((r) => r.name)
  .filter((n) => !['_cf_KV', 'd1_migrations', 'sqlite_sequence'].includes(n))

const local = new sqlite3(process.env.LOCAL_DB || 'data/edusob.sqlite', { readonly: true })
const localTables = local
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
  .all()
  .map((r) => r.name)

const shared = prodTables.filter((t) => localTables.includes(t))
let issues = 0
console.log(`comparing ${shared.length} shared tables\n`)

for (const t of shared) {
  const pc = d1(`PRAGMA table_info(${t});`).map((r) => r.name)
  const lc = local.prepare(`PRAGMA table_info(${t})`).all().map((r) => r.name)
  const missing = lc.filter((c) => !pc.includes(c))
  const extra = pc.filter((c) => !lc.includes(c))
  if (missing.length) {
    issues++
    console.log(`❌ ${t}: production missing column(s): ${missing.join(', ')}`)
  }
  if (extra.length) console.log(`   ${t}: prod-only column(s): ${extra.join(', ')}`)
}
console.log(`\n${issues === 0 ? '✅ no column drift' : `${issues} table(s) with missing columns`}`)
