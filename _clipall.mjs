import { chromium } from 'playwright'
const BASE='http://127.0.0.1:3000'
const li=await fetch(`${BASE}/api/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({identifier:'01829486022',password:'Ab52944820@'})}).then(r=>r.json())
const ROUTES=['/','/results','/cv','/jobs','/teachers','/shop','/wallet','/news','/admission','/subscription','/profile','/dashboard','/admin','/about','/contact','/pricing']
const b=await chromium.launch()
let total=0
for (const w of [390, 768]){
  const ctx=await b.newContext({viewport:{width:w,height:844}})
  await ctx.addCookies([{name:'edusob_session',value:li.token,url:BASE}])
  const p=await ctx.newPage()
  for(const r of ROUTES){
    try{ await p.goto(BASE+r,{waitUntil:'load',timeout:15000}) }catch{ continue }
    await p.waitForTimeout(800)
    const v=await p.evaluate(()=>{
      const out=[]
      for(const el of document.querySelectorAll('*')){
        const cs=getComputedStyle(el)
        if(!['hidden','clip'].includes(cs.overflowX)) continue
        if(el.scrollWidth<=el.clientWidth+2) continue
        if(el.children.length>2) continue
        const t=(el.textContent||'').trim(); if(!t) continue
        out.push(`${el.clientWidth}→${el.scrollWidth} 「${t.slice(0,26)}」 .${String(el.className).split(' ').slice(0,2).join('.').slice(0,26)}`)
      }
      return [...new Set(out)]
    })
    if(v.length){ total+=v.length; console.log(`${w}px ${r} (${v.length}):`); v.slice(0,5).forEach(x=>console.log('   '+x)) }
  }
  await ctx.close()
}
console.log(`\nমোট ক্লিপড-টেক্সট: ${total}`)
await b.close()
