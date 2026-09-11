import { chromium } from 'playwright'
const B='https://edusob.pages.dev'
const li=await fetch(`${B}/api/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({identifier:'01829486022',password:'EdDrgja06e9@'})}).then(r=>r.json())
const R=['/','/results','/admission','/scholarships','/teacher-support','/mcq','/qpapers','/board-challenge','/notices','/subscription']
console.log('রুট              CLS    LCP')
for(const route of R){
  const b=await chromium.launch()
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,
    userAgent:'Mozilla/5.0 (Linux; Android 11; moto g power) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36',
    extraHTTPHeaders:{cookie:`edusob_session=${li.token}`}})
  const p=await ctx.newPage()
  const cdp=await ctx.newCDPSession(p)
  await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions',
    {offline:false,latency:150,downloadThroughput:1.6*1024*1024/8,uploadThroughput:750*1024/8})
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4})
  await p.addInitScript(()=>{ window.__sh=[]; window.__lcp=0
    new PerformanceObserver(l=>{for(const e of l.getEntries()) if(!e.hadRecentInput) window.__sh.push(e.value)
    }).observe({type:'layout-shift',buffered:true})
    new PerformanceObserver(l=>{const es=l.getEntries(); window.__lcp=Math.round(es[es.length-1].startTime)
    }).observe({type:'largest-contentful-paint',buffered:true}) })
  await p.goto(B+route,{waitUntil:'load',timeout:60000}); await p.waitForTimeout(1500)
  const r=await p.evaluate(()=>({cls:+window.__sh.reduce((a,b)=>a+b,0).toFixed(4),lcp:window.__lcp}))
  console.log(`${route.padEnd(17)} ${String(r.cls).padEnd(6)} ${r.lcp}ms ${r.cls>0.1?'❌':'✅'}`)
  await b.close()
}
