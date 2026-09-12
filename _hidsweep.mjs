import { chromium } from 'playwright'
const BASE='http://127.0.0.1:3000'
const li=await fetch(`${BASE}/api/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({identifier:'01829486022',password:'Ab52944820@'})}).then(r=>r.json())
const ROUTES=['/','/results','/cv','/jobs','/teachers','/shop','/wallet','/news','/admission','/subscription','/profile','/dashboard','/admin','/admin/shop','/teacher-support','/about','/contact','/pricing','/login','/signup']
const b=await chromium.launch()
let bad=0, tot=0
for (const w of [390, 768]){
  const ctx=await b.newContext({viewport:{width:w,height:844}})
  await ctx.addCookies([{name:'edusob_session',value:li.token,url:BASE}])
  const p=await ctx.newPage()
  for (const r of ROUTES){
    try{ await p.goto(BASE+r,{waitUntil:'load',timeout:15000}) }catch{ continue }
    await p.waitForTimeout(700)
    const v=await p.evaluate(()=>{
      const out=[]
      const RESP=/^(sm|md|lg|xl|2xl):(flex|inline-flex|block|inline|grid|inline-block|inline-grid|table|table-cell|contents)$/
      for(const e of document.querySelectorAll('.hidden')){
        // রেসপন্সিভ display ক্লাস (md:flex ইত্যাদি) থাকলে ব্রেকপয়েন্টে দেখা স্বাভাবিক
        if([...e.classList].some(c=>RESP.test(c))) continue
        const cs=getComputedStyle(e)
        if(cs.display!=='none' && e.offsetParent!==null)
          out.push(`${e.tagName}.${String(e.className).split(' ').slice(0,3).join('.')} → ${cs.display} ${Math.round(e.getBoundingClientRect().width)}px`)
      }
      return {n:document.querySelectorAll('.hidden').length, out:out.slice(0,3)}
    })
    tot+=v.n
    if(v.out.length){ bad+=v.out.length
      console.log(`  ❌ ${String(w)}px ${r} (${v.n} hidden): ${v.out.join(' | ')}`) }
  }
  await ctx.close()
}
console.log(`\nমোট .hidden উপাদান পরীক্ষা: ${tot} · ভুল করে দেখানো: ${bad}`)
await b.close()
