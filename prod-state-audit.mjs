/**
 * প্রোডাকশন অবস্থা-যাচাই (লাইভ সাইটে)।
 *
 * দুটো জিনিস যাচাই করে:
 *   ১) কোনো **দৃশ্যমান** "লোড হচ্ছে…" টেক্সট আটকে আছে কি
 *      (API ঠিক থাকা সত্ত্বেও placeholder না-সরলে ব্যবহারকারী স্পিনার দেখেন)
 *   ২) ড্যাশবোর্ডের ধর্মীয় ওয়াটারমার্ক SVG হিসেবে রেন্ডার হচ্ছে কি
 *
 * দৃশ্যতা-ফিল্টার জরুরি: লুকানো ট্যাবের placeholder-গুলো স্বাভাবিক
 * (ট্যাব না খোলায় অপেক্ষা করছে), আর <script>/<template>-এর টেক্সট-
 * কনটেন্ট মিথ্যা পজিটিভ দেয় — প্রথম সংস্করণে এই দুটোই ধরা পড়েছিল।
 *
 * চালান: node prod-state-audit.mjs
 */
import { chromium } from 'playwright'
const B='https://edusob.pages.dev'
const b=await chromium.launch(); const c=await b.newContext({viewport:{width:1280,height:900}}); const p=await c.newPage()
await p.goto(B+'/login',{waitUntil:'load'})
await p.fill('#loginPhoneInput','01829486022'); await p.fill('#loginPassInput','EdDrgja06e9@')
await Promise.all([p.waitForLoadState('load'),p.click('button[type=submit]')]); await p.waitForTimeout(2500)
console.log('  লগইন:', p.url().includes('login')?'❌ ব্যর্থ':'✅ সফল')
for(const r of ['/dashboard','/results','/shop','/teacher-support','/scholarships']){
  await p.goto(B+r,{waitUntil:'load'}); await p.waitForTimeout(2200)
  const st=await p.evaluate(()=>{
    const svg=document.querySelector('.ds-hero__watermark svg')
    /* শুধু **দৃশ্যমান** লোডিং-টেক্সট গুনতে হবে: লুকানো ট্যাবের
       placeholder-গুলো স্বাভাবিক (ব্যবহারকারী ট্যাব না খোলায় অপেক্ষা করছে),
       আর <script> ট্যাগের টেক্সট-কনটেন্ট মিথ্যা পজিটিভ দেয়। */
    const stuck=[...document.querySelectorAll('body *')].filter(e=>{
      if(e.tagName==='SCRIPT'||e.tagName==='TEMPLATE') return false
      if(e.children.length!==0) return false
      if(!/লোড হচ্ছে\.\.\.|লোড হচ্ছে…/.test(e.textContent||'')) return false
      let n=e
      while(n&&n!==document.body){const cs=getComputedStyle(n)
        if(cs.display==='none'||cs.visibility==='hidden') return false
        n=n.parentElement}
      return true
    }).length
    return {svg:svg?Math.round(svg.getBoundingClientRect().width):0, stuck}
  })
  const extra = r==='/dashboard' ? ` · ওয়াটারমার্ক ${st.svg?st.svg+'px SVG ✅':'❌'}` : ''
  console.log(`  ${r.padEnd(18)} আটকে-থাকা লোডিং: ${st.stuck===0?'না ✅':'হ্যাঁ ❌ ('+st.stuck+')'}${extra}`)
}
await b.close()
