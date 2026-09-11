import { chromium } from 'playwright'
const b=await chromium.launch(); const c=await b.newContext(); const p=await c.newPage()
const cdp=await c.newCDPSession(p)
await p.goto('http://127.0.0.1:3000/',{waitUntil:'load'}); await p.waitForTimeout(2500)
await p.evaluate(()=>document.fonts.ready)

await p.evaluate(()=>{
  const wrap=document.createElement('div'); wrap.id='probe'
  const fams=[['Hind Siliguri',"'Hind Siliguri',sans-serif"],['Noto Serif Bengali',"'Noto Serif Bengali',serif"],['ডিফল্ট (কোনো ফন্ট নয়)','inherit']]
  fams.forEach(([n,ff],i)=>{
    const d=document.createElement('span'); d.id='probe'+i
    d.style.cssText=`font-family:${ff};font-size:64px;white-space:pre;display:inline-block`
    d.textContent='ক্ত'           // যুক্তবর্ণ
    document.body.appendChild(d)
  })
})
const doc = await cdp.send('DOM.getDocument',{depth:-1})
console.log('\n fontsize 64px — ক্ত (যুক্তবর্ণ) কীভাবে রেন্ডার হচ্ছে\n')
for (const [i,name] of [[0,'Hind Siliguri'],[1,'Noto Serif Bengali'],[2,'ডিফল্ট']]) {
  const {nodeId} = await cdp.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'#probe'+i})
  const f = await cdp.send('CSS.getPlatformFontsForNode',{nodeId}).catch(()=>({fonts:[]}))
  const used = (f.fonts||[]).map(x=>`${x.familyName} (${x.glyphCount} গ্লিফ)`).join(', ')||'—'
  const w = await p.evaluate((sel)=>document.querySelector(sel).getBoundingClientRect().width, '#probe'+i)
  console.log(`  ${name.padEnd(22)} প্রস্থ ${w.toFixed(1).padStart(6)}px   → ${used}`)
}
// তুলনা: ক এবং ত আলাদা
const w2 = await p.evaluate(()=>{
  const mk=(fam,txt)=>{ const s=document.createElement('span')
    s.style.cssText=`font-family:${fam};font-size:64px;white-space:pre;position:absolute;visibility:hidden`
    s.textContent=txt; document.body.appendChild(s); const w=s.getBoundingClientRect().width; s.remove(); return w}
  return { hs_k:mk("'Hind Siliguri',sans-serif",'ক'), hs_t:mk("'Hind Siliguri',sans-serif",'ত'),
           nb_k:mk("'Noto Serif Bengali',serif",'ক'), nb_t:mk("'Noto Serif Bengali',serif",'ত') }
})
console.log(`\n  হিসাব: Hind Siliguri ক+ত = ${(w2.hs_k+w2.hs_t).toFixed(1)}px`)
console.log(`         Noto Serif   ক+ত = ${(w2.nb_k+w2.nb_t).toFixed(1)}px`)
await b.close()
