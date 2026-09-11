import { chromium } from 'playwright'
const b=await chromium.launch(); const c=await b.newContext({viewport:{width:1280,height:900}}); const p=await c.newPage()
const cdp=await c.newCDPSession(p)
await p.goto('http://127.0.0.1:3000/',{waitUntil:'load'}); await p.waitForTimeout(2500)
await p.evaluate(()=>document.fonts.ready)

// আসল পেজের কয়েকটি বাংলা এলিমেন্ট বেছে নেওয়া
const targets = await p.evaluate(()=>{
  const out=[]
  for (const sel of ['h1','h2','h3','p']) {
    for (const el of [...document.querySelectorAll(sel)].slice(0,2)) {
      if (!/[ঀ-৿]/.test(el.textContent||'')) continue
      el.setAttribute('data-ct', out.length)
      out.push({i:out.length, sel, text:(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,26)})
    }
  }
  return out
})

console.log('\n===== আসল পেজে যুক্তবর্ণ + ব্যবহৃত ফন্ট =====\n')
for (const t of targets.slice(0,6)) {
  const r = await p.evaluate(({i})=>{
    const el=document.querySelector(`[data-ct="${i}"]`); if(!el) return null
    const cs=getComputedStyle(el)
    // ওই এলিমেন্টের আসল স্টাইলে একটি পরীক্ষা-স্প্যান
    const mk=(txt)=>{ const s=document.createElement('span')
      s.style.cssText=`font:${cs.font};letter-spacing:${cs.letterSpacing};font-feature-settings:${cs.fontFeatureSettings};font-variant-ligatures:${cs.fontVariantLigatures};white-space:pre;position:absolute;visibility:hidden`
      s.textContent=txt; document.body.appendChild(s)
      const w=s.getBoundingClientRect().width; s.remove(); return w }
    return { conj:mk('ক্ত'), plain:mk('কত'), fam:cs.fontFamily.split(',')[0].replace(/['"]/g,''),
             ls:cs.letterSpacing, ffs:cs.fontFeatureSettings||'(ফাঁকা)' }
  },{i:t.i})
  if(!r) continue
  const doc = await cdp.send('DOM.getDocument')
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: `[data-ct="${t.i}"]` })
  const fonts = nodeId
    ? await cdp.send('CSS.getPlatformFontsForNode', { nodeId }).catch(() => ({ fonts: [] }))
    : { fonts: [] }
  const used=[...(fonts.fonts||[])].map(f=>`${f.familyName}(${f.glyphCount})`).join(', ')||'—'
  const ok = r.conj < r.plain-1
  console.log(`  ${t.sel.padEnd(3)} "${t.text}"`)
  print(r, used, ok)
}
function print(r,used,ok){
  console.log(`      ফন্ট: ${used}`)
  console.log(`      ক্ত=${r.conj.toFixed(1)}px  কত=${r.plain.toFixed(1)}px  →  ${ok?'✅ যুক্তবর্ণ টিকে আছে':'❌ ভেঙেছে'}   (letter-spacing ${r.ls}, feature ${r.ffs})`)
}
await b.close()
