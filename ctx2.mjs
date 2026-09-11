import { chromium } from 'playwright'
const b=await chromium.launch(); const c=await b.newContext(); const p=await c.newPage()
await p.goto('http://127.0.0.1:3000/',{waitUntil:'load'}); await p.waitForTimeout(2500)
await p.evaluate(()=>document.fonts.ready)
const r = await p.evaluate(()=>{
  const out=[]
  for (const sel of ['h1','h2','h3','p']) {
    for (const el of [...document.querySelectorAll(sel)].slice(0,2)) {
      if (!/[ঀ-৿]/.test(el.textContent||'')) continue
      const cs=getComputedStyle(el)
      const mk=(txt)=>{ const s=document.createElement('span')
        s.style.fontFamily=cs.fontFamily; s.style.fontSize=cs.fontSize; s.style.fontWeight=cs.fontWeight
        s.style.letterSpacing=cs.letterSpacing; s.style.whiteSpace='pre'
        s.style.position='absolute'; s.style.visibility='hidden'
        s.textContent=txt; document.body.appendChild(s)
        const w=s.getBoundingClientRect().width; s.remove(); return w }
      const k=mk('ক'), t=mk('ত'), kt=mk('ক্ত'), kt2=mk('ক'+'্'+'ত')
      out.push({ sel, fam:cs.fontFamily.split(',')[0].replace(/["']/g,''), size:cs.fontSize,
        k:+k.toFixed(1), t:+t.toFixed(1), kt:+kt.toFixed(1), ktv:+kt2.toFixed(1) })
    }
  }
  return out
})
console.log('\n sel  ব্যবহৃত ফন্ট              সাইজ   ক      ত      ক্ত     ক্+ত   যুক্তবর্ণ?')
console.log(' '+'─'.repeat(82))
for(const x of r){
  const sum=+(x.k+x.t).toFixed(1)
  const ok = x.kt < sum - 2
  const tofu = x.k===x.t && x.t===x.kt   // সব একই প্রস্থ → সম্ভবত গ্লিফ নেই
  console.log(` ${x.sel.padEnd(4)} ${x.fam.padEnd(24)} ${x.size.padEnd(6)} ${String(x.k).padStart(5)} ${String(x.t).padStart(6)} ${String(x.kt).padStart(6)} ${String(x.ktv).padStart(6)}   ${tofu?'❌ গ্লিফ-সমস্যা':(ok?'✅ আছে':'❌ ভেঙেছে')}`)
}
console.log()
await b.close()
