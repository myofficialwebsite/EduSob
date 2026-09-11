/**
 * ধর্মীয় ওয়াটারমার্ক যাচাই (স্কেল-নিরপেক্ষ)।
 *
 * আসল গ্লিফ (সিস্টেম ফন্ট থেকে) ও আমার নিষ্কাশিত SVG-পাথ — দুটোই
 * ক্যানভাসে রেন্ডার করে **অনুপাত (w/h)** ও **কালি-আচ্ছাদন** তুলনা করা হয়।
 * পাথগুলো ৯৬-ইউনিট বাক্সে ফিট করা (আকার মেলার কথা নয়), তাই এই দুটি
 * স্কেল-নিরপেক্ষ মাপই আকৃতি মেলার প্রমাণ।
 *
 * চালানোর শর্ত: `ॐ` (U+0950) সিস্টেমের কোনো ফন্টে নেই, তাই
 * Noto Sans Devanagari ইনস্টল করতে হবে:
 *   python3 -c "from fontTools.ttLib import TTFont; \
 *       f=TTFont('/tmp/nsd.woff2'); f.flavor=None; f.save('/tmp/nsd.ttf')"
 *   cp /tmp/nsd.ttf ~/.fonts/ && fc-cache -f
 * ইনস্টল না থাকলে sanatan সারি ফলব্যাক-ফন্টে মাপা হবে ও ভুল দেখাবে।
 */
/**
 * নিখুঁত যাচাই (স্কেল-নিরপেক্ষ): আসল গ্লিফ বনাম নিষ্কাশিত SVG-পাথ।
 * পাথটি ৯৬-ইউনিট বাক্সে ফিট করা, তাই আকার মিলবে না — কিন্তু
 * **অনুপাত (w/h)** ও **আচ্ছাদন (কালি/বাউন্ডিং-এলাকা)** মিলতেই হবে।
 */
import { chromium } from 'playwright'
import { readFileSync } from 'fs'
const wm=JSON.parse(readFileSync('/tmp/wm.json','utf8'))
const FAM={islam:'"DejaVu Sans Mono"',buddhist:'"DejaVu Sans Mono"',christian:'"DejaVu Sans Mono"',sanatan:'"Noto Sans Devanagari"'}
const b=await chromium.launch(); const p=await (await b.newContext()).newPage()
await p.setContent('<html><body style="margin:0;background:#fff"></body></html>',{waitUntil:'load'})
await p.evaluate(()=>document.fonts.ready)

console.log('\n===== গ্লিফ বনাম আমার SVG-পাথ (স্কেল-নিরপেক্ষ) =====\n')
console.log('  প্রতীক       গ্লিফ অনুপাত/আচ্ছাদন   পাথ অনুপাত/আচ্ছাদন    পার্থক্য')
console.log('  '+'─'.repeat(70))
let allOk=true
for(const [k,v] of Object.entries(wm)){
  const ch=String.fromCodePoint(parseInt(v.cp.slice(2),16))
  const r=await p.evaluate(async({ch,fam,d})=>{
    const meas=async(drawFn)=>{
      const cv=document.createElement('canvas'); cv.width=cv.height=260
      const x=cv.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,260,260)
      await drawFn(x)
      const im=x.getImageData(0,0,260,260).data
      let n=0,mnX=999,mnY=999,mxX=-1,mxY=-1
      for(let y=0;y<260;y++)for(let xx=0;xx<260;xx++){if(im[(y*260+xx)*4]<128){n++;if(xx<mnX)mnX=xx;if(y<mnY)mnY=y;if(xx>mxX)mxX=xx;if(y>mxY)mxY=y}}
      if(!n) return null
      const w=mxX-mnX+1,h=mxY-mnY+1
      return {w,h,n,ar:w/h,cov:n/(w*h)}
    }
    // ১) আসল গ্লিফ
    const g=await meas(async(x)=>{x.fillStyle='#000';x.font='200px '+fam;x.textBaseline='alphabetic';x.fillText(ch,30,220)})
    // ২) আমার পাথ
    const s=await meas(async(x)=>{
      const img=new Image()
      const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="260" height="260">'
        +'<path d="'+d.replace(/"/g,'&quot;')+'" fill="#000"/></svg>'
      await new Promise(r2=>{img.onload=r2;img.onerror=r2;img.src='data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(svg)))})
      x.drawImage(img,0,0,260,260)
    })
    return {g,s}
  },{ch,fam:FAM[k],d:v.d})
  if(!r.g||!r.s){console.log(`  ${k}: ❌ রেন্ডার ব্যর্থ`);allOk=false;continue}
  const dAR=Math.abs(r.g.ar-r.s.ar)/r.g.ar*100
  const dCov=Math.abs(r.g.cov-r.s.cov)/r.g.cov*100
  const ok=dAR<3 && dCov<6
  if(!ok) allOk=false
  console.log(`  ${k.padEnd(10)} ${ch}   ${r.g.ar.toFixed(3)} / ${r.g.cov.toFixed(3)}        ${r.s.ar.toFixed(3)} / ${r.s.cov.toFixed(3)}       অনুপাত ${dAR.toFixed(1)}% · আচ্ছাদন ${dCov.toFixed(1)}%  ${ok?'✅':'❌'}`)
}
console.log('\n  '+(allOk?'✅ সব পাথ আসল গ্লিফের সাথে মিলছে':'❌ কোনোটিতে পার্থক্য আছে')+'\n')
await b.close()
