/**
 * শিক্ষক CRUD লাইভ পরীক্ষা (`node teacher-crud-audit.mjs`) —
 * তৈরি → তালিকা → সম্পাদনা (ছবিসহ) → ইউজার-অ্যাকাউন্ট → UI → মুছুন।
 *
 * পরীক্ষা-শিক্ষক সবসময় শেষে মুছে ফেলা হয়, তাই বারবার চালানো নিরাপদ।
 */
import { chromium } from 'playwright'
const B='http://127.0.0.1:3000'
const b=await chromium.launch(); const c=await b.newContext({viewport:{width:1280,height:900}}); const p=await c.newPage()
const errs=[]
p.on('pageerror',e=>errs.push(String(e.message).slice(0,100)))
p.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errs.push(m.text().slice(0,100))})

await p.goto(B+'/login',{waitUntil:'load'})
await p.fill('#loginPhoneInput','01829486022'); await p.fill('#loginPassInput','Ab52944820@')
await Promise.all([p.waitForLoadState('load'),p.click('button[type=submit]')]); await p.waitForTimeout(1500)

const api=async(m,u,d)=>p.evaluate(async({m,u,d})=>{
  const r=await fetch(u,{method:m,headers:{'Content-Type':'application/json'},body:d?JSON.stringify(d):undefined})
  return {s:r.status, j:await r.json().catch(()=>({}))}
},{m,u,d})

const PHONE='019'+Date.now().toString().slice(-8)
console.log('\n===== শিক্ষক CRUD লাইভ পরীক্ষা =====\n')

// ১) তৈরি
let r=await api('POST','/api/teacher-support/admin/teacher-create',{
  name:'পরীক্ষামূলক শিক্ষক', designation:'প্রভাষক', subject:'গণিত',
  education_level:'hsc', phone:PHONE, password:'Test@1234',
  avatar:'https://edusob.pages.dev/static/img/logo.png'
})
console.log(`  ১) তৈরি          HTTP ${r.s} ${r.j.ok?'✅':'❌ '+JSON.stringify(r.j).slice(0,60)}`)
const id = r.j.teacher_id || r.j.id || (r.j.teacher && r.j.teacher.id)
console.log(`     শিক্ষক আইডি: ${id}`)
if(!id){ console.log('  ❌ আইডি পাওয়া যায়নি — আর এগোনো যাচ্ছে না'); await b.close(); process.exit(0) }

// ২) তালিকায় এলো? + avatar
r=await api('GET','/api/teacher-support/mentors')
const found=(r.j.mentors||[]).find(x=>String(x.id)===String(id))
console.log(`  ২) তালিকায়       ${found?'✅':'❌'}  avatar=${found?JSON.stringify(found.avatar):'—'}`)

// ৩) সম্পাদনা (নাম + avatar বদল)
r=await api('PUT','/api/teacher-support/admin/teacher/'+id,{
  name:'পরীক্ষামূলক শিক্ষক (সম্পাদিত)', subject:'উচ্চতর গণিত', avatar:''
})
console.log(`  ৩) সম্পাদনা      HTTP ${r.s} ${r.j.ok?'✅':'❌'}`)
r=await api('GET','/api/teacher-support/mentors')
const f2=(r.j.mentors||[]).find(x=>String(x.id)===String(id))
console.log(`     নাম এখন: "${f2?f2.name:'—'}"  বিষয়: "${f2?f2.subject:'—'}"  avatar: ${f2?JSON.stringify(f2.avatar):'—'}`)

// ৪) ইউজার-অ্যাকাউন্ট role='teacher'?
r=await api('GET','/api/admin/users?limit=200')
const u=(r.j.users||r.j.data||[]).find(x=>x.phone===PHONE)
console.log(`  ৪) লগইন-অ্যাকাউন্ট ${u?'✅ তৈরি হয়েছে':'❌ নেই'}  role=${u?u.role:'—'}`)

// ৫) UI-তে বোতাম ও হেল্পার
await p.goto(B+'/admin',{waitUntil:'load'}); await p.waitForTimeout(2500)
await p.evaluate(()=>{ if(typeof switchAdminCategory==='function') switchAdminCategory('cat-mentors') })
await p.waitForTimeout(800)
await p.evaluate(()=>{ if(typeof switchAdminTab==='function') switchAdminTab('mentors','tpl-tab-mentorcontrol') }).catch(()=>{})
await p.evaluate(()=>{ if(typeof loadAdminTeachers==='function') return loadAdminTeachers() })
await p.waitForTimeout(2200)
const ui=await p.evaluate(()=>{
  const g=document.getElementById('admTeachersGrid')
  return {
    helpers: [typeof window.teacherAvatar, typeof window.openEditTeacherModal, typeof window.deleteTeacher],
    editBtns: document.querySelectorAll('button[onclick*="openEditTeacherModal"]').length,
    delBtns:  document.querySelectorAll('button[onclick*="deleteTeacher"]').length,
    imgs: g? g.querySelectorAll('img').length : 0,
    initials: g? [...g.querySelectorAll('div')].filter(d=>/rounded-xl bg-amber-100/.test(d.className||'')).length : 0
  }
})
console.log(`\n  ৫) UI:`)
console.log(`     teacherAvatar/openEdit/delete : ${ui.helpers.map(h=>h==='function'?'✅':'❌').join(' ')}`)
console.log(`     সম্পাদনা বোতাম ${ui.editBtns} · মুছুন বোতাম ${ui.delBtns}`)
console.log(`     ছবি (img) ${ui.imgs} · আদ্যক্ষর-ফলব্যাক ${ui.initials}`)

// ৬) মুছুন
r=await api('DELETE','/api/teacher-support/admin/teacher/'+id)
console.log(`\n  ৬) মুছুন         HTTP ${r.s} ${r.j.ok?'✅':'❌ '+JSON.stringify(r.j).slice(0,60)}`)
r=await api('GET','/api/teacher-support/mentors')
const gone=!(r.j.mentors||[]).find(x=>String(x.id)===String(id))
console.log(`     তালিকা থেকে সরেছে: ${gone?'✅':'❌'}  (অবশিষ্ট ${r.j.mentors?r.j.mentors.length:'?'} জন)`)

console.log(`\n  কনসোল-এরর: ${errs.length}`)
for(const e of [...new Set(errs)].slice(0,4)) console.log('    '+e)
await b.close()
