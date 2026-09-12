/**
 * স্ক্রিপ্ট অডিট (`node script-audit.mjs`)
 *
 * প্রতিটি রুটের প্রতিটি <script>-এর জন্য দুটি চেক:
 *   ১) সিনট্যাক্স — `node --check` দিয়ে ব্লকটি আলাদা করে যাচাই
 *   ২) রানটাইম  — পেজ লোডের সময় কোনো pageerror আছে কি
 *
 * কেন দরকার: একটি অবন্ধ `.catch(function(e){ ...` (মিসিং `});`) পুরো
 * <script> ব্লকটিকে SyntaxError-এ ফেলে দিয়েছিল — ফলে /wallet-এর
 * ব্যালেন্স, লেনদেন, অর্ডার, পেমেন্ট কিছুই লোড হতো না, "আবার চেষ্টা
 * করুন" বোতামও মৃত ছিল। অথচ responsive/ a11y / form / funnel / admin
 * সব অডিট পাস করছিল — কারণ কেউই JS-এর সিনট্যাক্স যাচাই করত না।
 *
 * বাংলায় কাজ করার সময় দুটি বিষয় মনে রাখুন:
 *   • `document.body.textContent` <script>-এর সোর্সও ধরে — তাই
 *     "এই লেখা পেজে আছে কি" যাচাই করতে body.textContent ব্যবহার
 *     করবেন না (মিথ্যা পজিটিভ)।
 *   • TS টেমপ্লেট-লিটারেলের (ব্যাকটিক) ভেতরে ব্যাকটিকযুক্ত মন্তব্য
 *     লিখলে টেমপ্লেটটি ভেঙে যায় — মন্তব্যে ` ব্যবহার করবেন না।
 */
import { chromium } from 'playwright'
import { writeFileSync } from 'fs'
import { execSync } from 'child_process'
const ROUTES=['/','/login','/signup','/dashboard','/profile','/wallet','/subscription','/results','/mcq','/cgpa','/cv','/cv-maker','/shop','/teacher-support','/notices','/news','/jobs','/admission','/feeds','/assisted','/board-challenge','/tools','/help','/privacy','/terms','/about','/contact','/pricing','/admin']
const b=await chromium.launch(); const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage()
await p.goto('http://127.0.0.1:3000/login',{waitUntil:'load'})
await p.fill('#loginPhoneInput','01829486022'); await p.fill('#loginPassInput','Ab52944820@')
await Promise.all([p.waitForLoadState('load'),p.click('button[type=submit]')]); await p.waitForTimeout(1500)
let bad=0, tot=0
for(const r of ROUTES){
  try{ await p.goto('http://127.0.0.1:3000'+r,{waitUntil:'load',timeout:20000}) }catch(e){ console.log(r+' → লোড ব্যর্থ'); continue }
  await p.waitForTimeout(900)
  const ss=await p.evaluate(()=>[...document.querySelectorAll('script')]
    .map((s,i)=>({i,len:(s.textContent||'').length,txt:s.textContent||''})).filter(s=>!s.src&&s.len>0))
  for(const s of ss){
    tot++
    const f='/tmp/as.js'; writeFileSync(f,s.txt)
    try{ execSync('node --check '+f,{stdio:'pipe'}) }
    catch(e){
      bad++
      const m=String(e.stderr||'').split('\n').filter(l=>/SyntaxError|^\s*\^/.test(l)).slice(0,2).join(' | ')
      console.log(`❌ ${r} script#${s.i} (${s.len} অক্ষর) → ${m.slice(0,95)}`)
    }
  }
}
console.log(`\nমোট ইনলাইন স্ক্রিপ্ট: ${tot} · ত্রুটিপূর্ণ: ${bad}`)
await b.close()
