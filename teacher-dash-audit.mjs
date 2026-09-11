/** শিক্ষক ড্যাশবোর্ড লাইভ পরীক্ষা: শিক্ষক তৈরি → লগইন → ইনবক্স → চ্যাট → নতুন বার্তায় বিজ্ঞপ্তি */
import { chromium } from 'playwright'
const B='http://127.0.0.1:3000'
const b=await chromium.launch()

// ── অ্যাডমিন দিয়ে একজন শিক্ষক তৈরি ──
const ac=await b.newContext(); const ap=await ac.newPage()
await ap.goto(B+'/login',{waitUntil:'load'})
await ap.fill('#loginPhoneInput','01829486022'); await ap.fill('#loginPassInput','Ab52944820@')
await Promise.all([ap.waitForLoadState('load'),ap.click('button[type=submit]')]); await ap.waitForTimeout(1300)
const PHONE='019'+Date.now().toString().slice(-8)
const cr=await ap.evaluate(async(ph)=>{
  const r=await fetch('/api/teacher-support/admin/teacher-create',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({name:'রহিম শিক্ষক',designation:'সহকারী অধ্যাপক',subject:'গণিত',education_level:'hsc',phone:ph,password:'Test@1234'})})
  return {s:r.status,j:await r.json()}
},PHONE)
const tid=cr.j.teacher_id||cr.j.id
console.log(`\n===== শিক্ষক ড্যাশবোর্ড পরীক্ষা =====\n`)
console.log(`  ১) শিক্ষক তৈরি: HTTP ${cr.s} ${cr.j.ok?'✅':'❌'} (আইডি ${tid}, ফোন ${PHONE})`)

// শিক্ষকের কাছে একটি প্রশ্ন পাঠানো (ছাত্র হিসেবে)
const ask=await ap.evaluate(async(tid)=>{
  const r=await fetch('/api/teacher-support/ask',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({teacher_id:tid,subject:'গণিত',topic:'দ্বিঘাত সমীকরণ',question:'দ্বিঘাত সমীকরণের সূত্রটি কী?',urgency:'normal'})})
  return {s:r.status,j:await r.json().catch(()=>({}))}
},tid)
console.log(`  ২) ছাত্র প্রশ্ন পাঠালো: HTTP ${ask.s} ${ask.j.ok?'✅':'❌ '+JSON.stringify(ask.j).slice(0,50)}`)
const ticketId = ask.j.ticket_id || ask.j.id || (ask.j.ticket&&ask.j.ticket.id)
console.log(`     টিকেট: ${ticketId}`)

// ── শিক্ষক হিসেবে লগইন ──
const tc=await b.newContext(); const tp=await tc.newPage()
const errs=[]
tp.on('pageerror',e=>errs.push(String(e.message).slice(0,90)))
tp.on('console',m=>{if(m.type()==='error'&&!/favicon|NotSameOrigin/i.test(m.text()))errs.push(m.text().slice(0,90))})
await tp.goto(B+'/login',{waitUntil:'load'})
await tp.fill('#loginPhoneInput',PHONE); await tp.fill('#loginPassInput','Test@1234')
await Promise.all([tp.waitForLoadState('load'),tp.click('button[type=submit]')]); await tp.waitForTimeout(1600)
console.log(`  ৩) শিক্ষক লগইন: ${tp.url().includes('login')?'❌ ব্যর্থ':'✅ সফল'} → ${new URL(tp.url()).pathname}`)

// ── /teacher পেজ ──
await tp.goto(B+'/teacher',{waitUntil:'load'}); await tp.waitForTimeout(3000)
const st=await tp.evaluate(()=>({
  gate: !document.getElementById('tchGate').classList.contains('hidden'),
  gateMsg: (document.getElementById('tchGateMsg').textContent||'').trim(),
  main: !document.getElementById('tchMain').classList.contains('hidden'),
  sub: (document.getElementById('tchSub').textContent||'').trim(),
  chats: document.querySelectorAll('#tchList button').length,
  unread: (document.getElementById('tchUnreadAll').textContent||'').trim(),
  soundFn: typeof window.tchChime, pollFn: typeof window.tchLoad
}))
console.log(`\n  ৪) /teacher পেজ:`)
console.log(`     মূল অংশ দৃশ্যমান: ${st.main?'✅':'❌'}   গেট (অননুমোদিত): ${st.gate?'❌ দেখাচ্ছে':'✅ লুকানো'}`)
console.log(`     শিরোনাম: "${st.sub}"`)
console.log(`     চ্যাট: ${st.chats}টি · অপঠিত ব্যাজ: ${st.unread}`)
console.log(`     tchChime(): ${st.soundFn==='function'?'✅':'❌'} · tchLoad(): ${st.pollFn==='function'?'✅':'❌'}`)

// ── চ্যাট খোলা + উত্তর ──
if (st.chats>0){
  await tp.evaluate(()=>document.querySelector('#tchList button').click())
  await tp.waitForTimeout(2200)
  const th=await tp.evaluate(()=>({
    title:(document.getElementById('tchChatTitle').textContent||'').trim(),
    msgs:document.querySelectorAll('#tchMsgs > div').length
  }))
  console.log(`\n  ৫) চ্যাট খোলা: "${th.title}" · বার্তা ${th.msgs}টি`)
  await tp.fill('#tchInput','সূত্র: x = (-b ± √(b²-4ac)) / 2a')
  await tp.click('#tchForm button[type=submit]')
  await tp.waitForTimeout(2500)
  const after=await tp.evaluate(()=>document.querySelectorAll('#tchMsgs > div').length)
  console.log(`     উত্তর পাঠানোর পর বার্তা: ${after}টি ${after>th.msgs?'✅':'❌'}`)
  // উত্তর সার্ভারে গেলো?
  const chk=await ap.evaluate(async(id)=>{
    const r=await fetch('/api/teacher-support/tickets/'+id+'/messages'); const d=await r.json()
    const m=(d.messages||[]).filter(x=>x.sender_type==='teacher')
    return m.length? m[m.length-1].message : '(কোনো শিক্ষক-বার্তা নেই)'
  },ticketId)
  console.log(`     সার্ভারে সংরক্ষিত: "${String(chk).slice(0,52)}"`)
}

// ── শব্দ/নোটিফিকেশন টগল ──
const tg=await tp.evaluate(()=>{
  const before=document.getElementById('tchSoundBtn').getAttribute('aria-pressed')
  tchToggleSound(); const mid=document.getElementById('tchSoundBtn').getAttribute('aria-pressed')
  tchToggleSound(); const after=document.getElementById('tchSoundBtn').getAttribute('aria-pressed')
  return {before,mid,after, ls:localStorage.getItem('tch_sound')}
})
console.log(`\n  ৬) শব্দ টগল: ${tg.before} → ${tg.mid} → ${tg.after} ${tg.before!==tg.mid&&tg.before===tg.after?'✅':'❌'}  (localStorage: ${tg.ls})`)

console.log(`\n  কনসোল-এরর: ${errs.length}`)
for(const e of [...new Set(errs)].slice(0,4)) console.log('    '+e)
// পরিষ্কার
await ap.evaluate(async(id)=>{ if(id) await fetch('/api/teacher-support/admin/teacher/'+id,{method:'DELETE'}) },tid)
console.log(`\n  পরীক্ষা-শিক্ষক মোছা ✅`)
await b.close()
