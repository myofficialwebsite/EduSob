import { chromium } from 'playwright'
const BASE='http://127.0.0.1:3000'
const li=await fetch(`${BASE}/api/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({identifier:'01829486022',password:'Ab52944820@'})}).then(r=>r.json())
const b=await chromium.launch()
const ctx=await b.newContext({viewport:{width:390,height:844}})
await ctx.addCookies([{name:'edusob_session',value:li.token,url:BASE}])
const p=await ctx.newPage()
await p.goto(BASE+'/cv',{waitUntil:'load'}); await p.waitForTimeout(3000)
console.log(await p.evaluate(()=>{
  const names=[...document.querySelectorAll('.tpl-card .line-clamp-2')]
  const clipped=names.filter(n=>n.scrollWidth>n.clientWidth+2)
  return `নাম ${names.length}টি · কাটা ${clipped.length}টি\n`+clipped.slice(0,5).map(n=>`  ${n.clientWidth}→${n.scrollWidth}px 「${n.textContent.trim()}」`).join('\n')
}))
await b.close()
