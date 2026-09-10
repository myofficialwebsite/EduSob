// সব রাউটের ইনলাইন <script> ব্লক সিনট্যাক্স-চেক করে — এই ধরনের বাগ ভবিষ্যতে ধরতে
import fs from 'node:fs'
import { execSync } from 'node:child_process'

const BASE = 'http://localhost:3000'
const TOKEN = process.argv[2]
const routes = ['/', '/login', '/signup', '/results', '/admission', '/scholarships', '/mcq', '/cv',
  '/shop', '/subscription', '/qpapers', '/teacher-support', '/news', '/jobs', '/notices',
  '/planner', '/cgpa', '/syllabus', '/board-challenge', '/dashboard', '/profile', '/wallet',
  '/assisted', '/admin', '/admin/shop', '/admin/cv-templates']

let totalBlocks = 0
let broken = 0

for (const r of routes) {
  let html = ''
  try {
    html = execSync(`curl -s -b "edusob_session=${TOKEN}" ${BASE}${r}`, { maxBuffer: 40 * 1024 * 1024 }).toString()
  } catch { console.log(`?? ${r} fetch failed`); continue }

  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g
  let m, i = 0, bad = 0
  while ((m = re.exec(html))) {
    i++; totalBlocks++
    try { new Function(m[1]) }
    catch (e) {
      bad++; broken++
      fs.writeFileSync(`/tmp/bad-${r.replace(/\W/g, '_')}-${i}.js`, m[1])
      console.log(`❌ ${r}  block#${i}  ${e.message}`)
    }
  }
  console.log(`${bad ? '❌' : '✅'} ${r.padEnd(22)} ${String(i).padStart(2)} blocks, ${bad} broken`)
}
console.log(`\nTOTAL: ${totalBlocks} inline script blocks, ${broken} broken`)
