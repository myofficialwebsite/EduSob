/**
 * ট্যাপ-টার্গেট অডিট (`node tap-audit.mjs`)
 *
 * মোবাইলে (৩৯০px) প্রতিটি ইন্টারঅ্যাক্টিভ লক্ষ্য ৪৪×৪৪px কি না — তা
 * ধরন অনুযায়ী গ্রুপ করে দেখায়, যাতে এক-একটি না ধরে ধরণ ঠিক করা যায়।
 *
 * ⚠️  তিনটি ফাঁদ, যার প্রতিটি আগে মিথ্যা ফলাফল দিয়েছিল:
 *
 *   ১) যে এলিমেন্টের কোনো ক্লিকযোগ্য পূর্বপুরুষ আছে (যেমন <i> একটি
 *      <button>-এর ভেতরে), তা গোনা যাবে না — আসল লক্ষ্য সেই পূর্বপুরুষ।
 *
 *   ২) <label> তখনই লক্ষ্য, যখন তার for= আছে বা ভেতরে কোনো নিয়ন্ত্রণ
 *      আছে। নিছক লেখার জন্য <label> ব্যবহার করলে (যেমন "প্রোফাইল ছবি")
 *      ক্লিক করলে কিছুই হয় না — সেগুলো গোনা মিথ্যা।
 *
 *   ৩) `display:inline` লিংক বাদ: WCAG ২.৫.৮-এর ইনলাইন অব্যাহতি। তবে
 *      খেয়াল রাখতে হবে — আগে ফুটারের লিংকগুলো inline হওয়ায় অদৃশ্য
 *      ছিল; min-height দিয়ে inline-flex করলে সেগুলো হিসেবে আসে।
 *
 * আর যা কখনো করবেন না: যা মাপা হয়নি, তা রিপোর্ট করা (a11y-sweep একসময়
 * ২৪px মেপে "<৪০px: ০" ছাপতো)।
 */
import { chromium } from 'playwright'
const R=['/','/login','/signup','/dashboard','/profile','/wallet','/subscription','/results','/mcq','/cgpa','/cv','/cv-maker','/shop','/teacher-support','/notices','/news','/jobs','/admission','/feeds','/assisted','/board-challenge','/tools','/help','/privacy','/terms','/about','/contact','/pricing']
const b=await chromium.launch(); const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage()
await p.goto('http://127.0.0.1:3000/login',{waitUntil:'load'})
await p.fill('#loginPhoneInput','01829486022'); await p.fill('#loginPassInput','Ab52944820@')
await Promise.all([p.waitForLoadState('load'),p.click('button[type=submit]')]); await p.waitForTimeout(1500)
const agg={}
for(const r of R){
  try{ await p.goto('http://127.0.0.1:3000'+r,{waitUntil:'load',timeout:15000}) }catch(e){ continue }
  await p.waitForTimeout(700)
  const rows=await p.evaluate(()=>{
    const out=[]; const clickable=(n)=>n.tagName==='BUTTON'||n.tagName==='A'||n.onclick||getComputedStyle(n).cursor==='pointer'
    document.querySelectorAll('a,button,label,input,select').forEach(el=>{
      const cs=getComputedStyle(el); if(cs.display==='none'||cs.visibility==='hidden') return
      const rc=el.getBoundingClientRect(); if(!rc.width||!rc.height) return
      const inline = cs.display==='inline'
      if(inline) return
      if(rc.height>=44 && rc.width>=44) return
      let a=el.parentElement,h=false
      while(a&&a!==document.body){ if(clickable(a)){h=true;break} a=a.parentElement }
      if(h) return
      /* <label> তখনই ট্যাপ-টার্গেট, যখন তার for= আছে বা ভেতরে
         কোনো নিয়ন্ত্রণ আছে। নিছক লেখার জন্য <label> ব্যবহার করলে
         (যেমন "প্রোফাইল ছবি (CV-র জন্য)") ক্লিক করলে কিছুই হয় না —
         তা লক্ষ্যই নয়, গোনা মিথ্যা ফলাফল দেয়। */
      if (el.tagName === 'LABEL') {
        const fid = el.getAttribute('for')
        const ctl = (fid && document.getElementById(fid)) || el.querySelector('input,select,textarea')
        if (!ctl) return
      }
      const cls=(el.className||'').toString().trim().replace(/\s+/g,'.').slice(0,46)
      out.push({k:(el.id?'#'+el.id+' ':'')+el.tagName.toLowerCase()+'.'+cls, h:Math.round(rc.height), w:Math.round(rc.width)})
    }); return out
  })
  for(const x of rows){ const key=x.k+'  ['+x.h+'px]'; agg[key]=(agg[key]||0)+1 }
}
const ents=Object.entries(agg).sort((a,b)=>b[1]-a[1])
console.log('মোট স্বতন্ত্র ধরণ: '+ents.length+'   মোট ঘটনা: '+ents.reduce((s,e)=>s+e[1],0)+'\n')
for(const [k,v] of ents.slice(0,22)) console.log('  '+String(v).padStart(3)+'×  '+k)
await b.close()
