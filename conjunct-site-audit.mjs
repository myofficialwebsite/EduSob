/**
 * সাইট-ব্যাপী যুক্তবর্ণ অডিট (`node conjunct-site-audit.mjs [--prod]`)
 *
 * সব রুটে গিয়ে দুটো বিষয় যাচাই করে:
 *   ১) হিন্দ সিলিগুরি ওয়েবফন্ট সত্যিই লোড হয়েছে কি
 *   ২) প্রস্থ(ক্ত) < প্রস্থ(কত) — মানে যুক্তবর্ণ গঠিত হয়েছে
 *
 * কেন `page.setContent()` ব্যবহার করা যাবে না, তা conjunct-test.mjs-এর
 * মন্তব্যে বিস্তারিত লেখা আছে: ক্রস-origin হলে ওয়েবফন্ট CORS-এ ব্লক
 * হয় এবং সবকিছু "ভাঙা" দেখায় — সম্পূর্ণ মিথ্যা রিপোর্ট।
 */
import { chromium } from 'playwright'
const B=process.argv.includes('--prod')?'https://edusob.pages.dev':'http://127.0.0.1:3000'
const R=['/','/dashboard','/profile','/results','/mcq','/cgpa','/cv','/shop','/teacher-support',
 '/notices','/jobs','/news','/scholarships','/admission','/planner','/syllabus','/qpapers',
 '/wallet','/subscription','/subscription?plan=premium','/privacy','/terms','/refund','/teachers']
const b=await chromium.launch(); const c=await b.newContext({viewport:{width:1280,height:900}}); const p=await c.newPage()
await p.goto(B+'/login',{waitUntil:'load'})
await p.fill('#loginPhoneInput','01829486022'); await p.fill('#loginPassInput','Ab52944820@')
await Promise.all([p.waitForLoadState('load'),p.click('button[type=submit]')]); await p.waitForTimeout(1800)
console.log('\nরুট                     হিন্দ সিলিগুরি  ক্ত/কত        রায়')
console.log('─'.repeat(64))
let bad=0
for(const r of R){
  await p.goto(B+r,{waitUntil:'load'}); await p.waitForTimeout(900)
  const st=await p.evaluate(()=>{
    const mk=t=>{const s=document.createElement('span')
      s.style.cssText="position:absolute;left:-9999px;white-space:pre;font-family:'Hind Siliguri',sans-serif;font-size:64px"
      s.textContent=t; document.body.appendChild(s)
      const w=s.getBoundingClientRect().width; s.remove(); return Math.round(w)}
    return {c:mk('ক্ত'), p:mk('কত'),
      hind:[...document.fonts].some(f=>f.status==='loaded'&&f.family.includes('Hind Siliguri'))}
  })
  const ok = st.hind && st.c < st.p
  if(!ok) bad++
  console.log(`  ${r.padEnd(22)} ${st.hind?'✅':'❌'}          ${String(st.c).padStart(3)}/${String(st.p).padEnd(4)}    ${ok?'✅':'❌'}`)
}
console.log('─'.repeat(64))
console.log(bad? `  ❌ ${bad}/${R.length} পাতায় সমস্যা` : `  ✅ ${R.length}/${R.length} পাতায় যুক্তবর্ণ ঠিক`)
await b.close()
