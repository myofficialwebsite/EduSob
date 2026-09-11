/**
 * এরর-স্টেট অডিট (`node errorstate-audit.mjs`).
 *
 * API ব্যর্থ হলে **ফেচ-নির্ভর অংশ** নীরবে ফাঁকা হয়, নাকি এরর-বার্তা/রিট্রাই
 * দেখায়? নীরব ব্যর্থতা সবচেয়ে খারাপ — ব্যবহারকারী বুঝতেই পারেন না কিছু
 * ভুল হয়েছে, শুধু ফাঁকা পেজ দেখেন।
 *
 * পদ্ধতি: একই রুট দুইবার লোড (স্বাভাবিক vs /api/** → HTTP ৫০০), তারপর
 * পাঠ্যের পার্থক্য বের করা। হারানো লাইন থাকলে কোনো এরর-বার্তা আসলো কি
 * দেখা হয়। বেশিরভার পেজ সার্ভার-রেন্ডার্ড, তাই শুধু "ফাঁকা কি না" দেখলে
 * ভুল ধরা পড়ে — পার্থক্য দেখতেই হবে।
 */
import { chromium } from 'playwright'
const B='http://127.0.0.1:3000'
const b=await chromium.launch(); const c=await b.newContext({viewport:{width:390,height:844}}); const p=await c.newPage()
await p.goto(B+'/login',{waitUntil:'load'})
await p.fill('#loginPhoneInput','01829486022'); await p.fill('#loginPassInput','Ab52944820@')
await Promise.all([p.waitForLoadState('load'),p.click('button[type=submit]')]); await p.waitForTimeout(1200)

const routes=['/dashboard','/results','/mcq','/cgpa','/cv','/shop','/teacher-support','/notices','/jobs','/scholarships']
console.log('\n===== API ব্যর্থ — নীরব ফাঁকা, নাকি এরর-বার্তা? =====\n')
for(const r of routes){
  // ১) স্বাভাবিক
  await p.goto(B+r,{waitUntil:'load',timeout:30000}).catch(()=>{})
  await p.waitForTimeout(2500)
  const good=await p.evaluate(()=>document.body.innerText||'')
  // ২) API ব্যর্থ
  await p.route('**/api/**', rt=>rt.fulfill({status:500,contentType:'application/json',body:'{"ok":false,"error":"পরীক্ষা"}'}))
  await p.goto(B+r,{waitUntil:'load',timeout:30000}).catch(()=>{})
  await p.waitForTimeout(2500)
  const bad=await p.evaluate(()=>document.body.innerText||'')
  await p.unroute('**/api/**')

  const g=new Set(good.split('\n').map(s=>s.trim()).filter(s=>s.length>2))
  const bd=new Set(bad.split('\n').map(s=>s.trim()).filter(s=>s.length>2))
  const lost=[...g].filter(x=>!bd.has(x))
  const added=[...bd].filter(x=>!g.has(x))
  const errish=added.filter(x=>/ত্রুটি|এরর|সমস্যা|ব্যর্থ|আবার চেষ্টা|রিট্রাই|লোড|error/i.test(x))
  const verdict = lost.length===0 ? '✅ কিছুই হারায়নি'
    : errish.length ? `✅ এরর-বার্তা: "${errish[0].slice(0,42)}"`
    : `❌ ${lost.length}টি লাইন নীরবে উধাও`
  console.log(`  ${r.padEnd(18)} ${verdict}`)
  if(lost.length && !errish.length) for(const l of lost.slice(0,3)) console.log(`       └ হারিয়েছে: "${l.slice(0,56)}"`)
}
await b.close()
