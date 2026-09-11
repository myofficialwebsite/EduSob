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

/* সব পেজ-রুট (src/index.tsx-এর app.get() থেকে নেওয়া)।
   /api/*, /sw.js, /manifest.webmanifest বাদ — সেগুলো পেজ নয়। */
const routes=['/','/login','/signup','/dashboard','/profile','/wallet','/subscription',
  '/results','/mcq','/cgpa','/cv','/cv-maker','/shop','/teacher-support','/teacher','/teachers',
  '/notices','/jobs','/news','/scholarships','/scholarship','/admission','/admissions',
  '/planner','/syllabus','/qpapers','/board-challenge','/assisted',
  '/privacy','/terms','/refund','/admin','/admin/shop','/admin/cv-templates']
console.log('\n===== API ব্যর্থ — নীরব ফাঁকা, নাকি এরর-বার্তা? =====\n')
for(const r of routes){
  // ১) স্বাভাবিক
  await p.goto(B+r,{waitUntil:'load',timeout:30000}).catch(()=>{})
  await p.waitForTimeout(2500)
  const good=await p.evaluate(()=>document.body.innerText||'')
  const goodLen=good.length
  // ২) API ব্যর্থ
  await p.route('**/api/**', rt=>rt.fulfill({status:500,contentType:'application/json',body:'{"ok":false,"error":"পরীক্ষা"}'}))
  await p.goto(B+r,{waitUntil:'load',timeout:30000}).catch(()=>{})
  await p.waitForTimeout(2500)
  const bad=await p.evaluate(()=>document.body.innerText||'')
  const badLen=bad.length
  await p.unroute('**/api/**')

  const g=new Set(good.split('\n').map(s=>s.trim()).filter(s=>s.length>2))
  const bd=new Set(bad.split('\n').map(s=>s.trim()).filter(s=>s.length>2))
  const lost=[...g].filter(x=>!bd.has(x))
  const added=[...bd].filter(x=>!g.has(x))
  const errish=added.filter(x=>/ত্রুটি|এরর|সমস্যা|ব্যর্থ|আবার চেষ্টা|রিট্রাই|লোড|যায়নি|যায়নি|পাওয়া যায়নি|যাচাই|error/i.test(x))
  /* তৃতীয় যাচাই (মূল): API ব্যর্থ হওয়ার **পরেও** "লোড হচ্ছে" টেক্সট
     টিকে থাকলে ব্যবহারকারী চিরকাল স্পিনারের দিকে তাকিয়ে থাকেন —
     কোনো এরর-বার্তা আসে না, কোনো কনটেন্টও আসে না। এটাই সবচেয়ে খারাপ
     অবস্থা, কিন্তু `lost.length===0` হওয়ায় আগের সংস্করণ একে "✅" দেখাত। */
  /* "লোড হচ্ছে…" = চলমান (আটকে গেছে) · "লোড করা যায়নি" = শেষ (সঠিক এরর)।
     তাই কেবল **চলমান** রূপটিই ধরা হবে, তাও অবশ্যই "…" সহ — নইলে
     "দ্রুত লোডিং ব্যাকআপ রেজাল্ট পোর্টাল"-এর মতো স্থির মার্কেটিং-কপি
     মিথ্যা পজিটিভ দেয় (এটিই প্রথম সংস্করণের ভুল)। */
  const stuck=[...bd].filter(x=>/লোড হচ্ছে\.\.\.|লোড হচ্ছে…|লোডিং\.\.\.|আসছে\.\.\./.test(x))
  /* "কতগুলো লাইন হারালো" একটি খারাপ মাপ: ফলব্যাক-কনটেন্টে বদলে গেলেও
     হারানো হিসেবে গোনা হয়, অথচ ব্যবহারকারীর কাছে পেজটি ঠিকই দেখায়
     (যেমন ল্যান্ডিং টিকার — API ব্যর্থ হলে ৮টি স্থির ঘোষণা দেখায়)।
     তাই মূল মাপ হলো **মোট কনটেন্টের কত শতাংশ হারালো**: ৫০%-এর বেশি
     হারালেই পেজটি ভাঙা মনে হবে; এর নিচে ফলব্যাক বা আংশিক ক্ষতি। */
  const shrink = goodLen ? Math.max(0,(goodLen-badLen))/goodLen*100 : 0

  /* ক্রমটা জরুরি:
       ১) আটকে-থাকা লোডিং        → ❌ (কোনো বার্তাই নেই, সবচেয়ে খারাপ)
       ২) এরর-বার্তা দেখাচ্ছে    → ✅ (সৎ: "লোড করা যায়নি" জানানো হয়েছে,
                                    যদিও কনটেন্টের বড় অংশ অনুপস্থিত — যেমন
                                    /teacher-support ৬৯% কমলেও বার্তা আছে)
       ৩) ৫০%-এর বেশি কনটেন্ট গেল → ❌ (বার্তা ছাড়া বড় ফাঁক = ভাঙা পেজ)
       ৪) বাকি                   → ✅ */
  const verdict = stuck.length ? `❌ আটকে গেছে: "${stuck[0].slice(0,40)}"`
    : errish.length ? `✅ এরর-বার্তা: "${errish[0].slice(0,40)}"`
    : shrink > 50 ? `❌ কনটেন্টের ${shrink.toFixed(0)}% উধাও`
    : lost.length===0 ? '✅ কিছুই হারায়নি'
    : `✅ আংশিক ক্ষতি (${shrink.toFixed(0)}%) — ফলব্যাক আছে`
  console.log(`  ${r.padEnd(18)} ${verdict}`)
  if(lost.length && !errish.length) for(const l of lost.slice(0,3)) console.log(`       └ হারিয়েছে: "${l.slice(0,56)}"`)
}
let bad=0
console.log('\n  (❌ = ঠিক করতে হবে · ✅ = ব্যবহারকারী বার্তা পাচ্ছেন)\n')
await b.close()
