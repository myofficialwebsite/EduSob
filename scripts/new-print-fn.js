function printMarksheet(){
  // স্বয়ংসম্পূর্ণ A4 প্রিন্ট ভিউ — কোনো বাহ্যিক CDN ছাড়া (অফলাইনেও কাজ করে)
  const d = window.__lastResult;
  if (!d) return;
  const st = d.student || {};
  const subs = d.subjects || [];
  const res = d.result || {};
  const passed = String(res.status || '').toLowerCase().includes('pass');
  const gpa = res.gpa || res.detail || '';
  const esc2 = function(s){ const div = document.createElement('div'); div.textContent = String(s == null ? '' : s); return div.innerHTML; };
  const infoRows = [
    ['নাম', st.name], ['পিতার নাম', st.father], ['মাতার নাম', st.mother],
    ['রোল', st.roll], ['রেজিস্ট্রেশন', st.regno], ['বোর্ড', BOARD_BN[String(st.board||'').toLowerCase()] || st.board],
    ['পরীক্ষা', String(st.exam||'').toUpperCase() + ' ' + (st.year||'')], ['গ্রুপ', st.group], ['প্রতিষ্ঠান', st.institute]
  ].filter(function(r){ return r[1]; });
  const infoHtml = '<table class="tbl">' + infoRows.map(function(r){ return '<tr><td class="lbl">' + r[0] + '</td><td class="val">' + esc2(r[1]) + '</td></tr>'; }).join('') + '</table>';
  const subHtml = subs.length
    ? '<table class="tbl"><tr><th>কোড</th><th>বিষয়</th><th class="r">গ্রেড</th></tr>' + subs.map(function(s){
        const g = s.grade || s.letter_grade || s.gp || '';
        return '<tr><td>' + esc2(s.code || s.sub_code || '') + '</td><td>' + esc2(s.name || s.sub_name || s.subject || '') + '</td><td class="r b">' + esc2(g) + '</td></tr>';
      }).join('') + '</table>'
    : '<p class="muted">বিষয়ভিত্তিক গ্রেড পাওয়া যায়নি</p>';
  const w = window.open('', '_blank');
  if (!w) { alert('পপ-আপ ব্লক হয়েছে — প্রিন্টের জন্য পপ-আপ অনুমতি দিন।'); return; }
  w.document.write('<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><title>এডুসব — রেজাল্ট মার্কশিট</title>'
    + '<style>'
    + '@page { size: A4; margin: 13mm; }'
    + 'body { font-family: "Hind Siliguri", "Noto Sans Bengali", SolaimanLipi, "Segoe UI", sans-serif; color:#111827; margin:0; padding:8px 2px; }'
    + '.brand { display:flex; align-items:center; gap:8px; border-bottom: 2.5px solid #f97316; padding-bottom: 10px; }'
    + '.brand .ic { font-size: 22px; } .brand b { font-size: 17px; } .brand small { color:#6b7280; display:block; font-size: 11px; }'
    + '.banner { margin: 14px 0; padding: 12px 16px; border-radius: 10px; display:flex; justify-content:space-between; align-items:center; border: 1px solid ' + (passed ? '#fdba74' : '#fda4af') + '; background:' + (passed ? '#fff7ed' : '#fff1f2') + '; }'
    + '.banner .nm { font-size: 16px; font-weight: 700; } .banner .exm { font-size: 11px; color:#6b7280; }'
    + '.banner .gpa { font-size: 20px; font-weight: 800; color:' + (passed ? '#ea580c' : '#e11d48') + '; }'
    + '.banner .st { font-size: 11px; font-weight: 700; color:' + (passed ? '#16a34a' : '#e11d48') + '; }'
    + '.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 6px; }'
    + 'h4 { font-size: 11px; color:#6b7280; margin: 8px 0 6px; text-transform: uppercase; letter-spacing: .5px; }'
    + '.tbl { width: 100%; border-collapse: collapse; font-size: 12.5px; }'
    + '.tbl td, .tbl th { border-bottom: 1px solid #e5e7eb; padding: 5.5px 6px; text-align: left; }'
    + '.tbl th { color:#6b7280; font-size: 10.5px; border-bottom: 1.5px solid #f97316; }'
    + '.lbl { color:#6b7280; width: 42%; font-size: 11.5px !important; } .val { font-weight: 600; }'
    + '.r { text-align: right !important; } .b { font-weight: 800; } .muted { color:#9ca3af; font-size: 12px; }'
    + '.foot { margin-top: 18px; padding-top: 8px; border-top: 1px dashed #d1d5db; font-size: 10.5px; color: #9ca3af; display:flex; justify-content: space-between; }'
    + '@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }'
    + '</style></head><body>'
    + '<div class="brand"><span class="ic">🎓</span><span><b>এডুসব (EduSob)</b><small>শিক্ষার সব, এক ঠিকানায় — রেজাল্ট মার্কশিট (প্রাথমিক অনুলিপি)</small></span></div>'
    + '<div class="banner"><div><div class="nm">' + esc2(st.name || 'রেজাল্ট') + '</div><div class="exm">' + esc2(String(st.exam||'').toUpperCase()) + ' ' + esc2(st.year||'') + ' · ' + esc2(BOARD_BN[String(st.board||'').toLowerCase()] || st.board || '') + ' বোর্ড</div></div>'
    + '<div style="text-align:right"><div class="gpa">' + esc2(gpa ? 'GPA ' + gpa : (res.status || '')) + '</div><div class="st">' + (passed ? '✔ উত্তীর্ণ' : esc2(res.status || '')) + '</div></div></div>'
    + '<div class="cols"><div><h4>📇 শিক্ষার্থীর তথ্য</h4>' + infoHtml + '</div><div><h4>📊 বিষয়ভিত্তিক গ্রেড</h4>' + subHtml + '</div></div>'
    + '<div class="foot"><span>সূত্র: এডুসব এগ্রিগেটর — চূড়ান্ত ফলাফলের জন্য অফিসিয়াল বোর্ড/প্রতিষ্ঠানের মার্কশিট প্রযোজ্য।</span><span>' + new Date().toLocaleDateString('bn-BD') + '</span></div>'
    + '</body></html>');
  w.document.close();
  setTimeout(function(){ try { w.print(); } catch(e){} }, 500);
}