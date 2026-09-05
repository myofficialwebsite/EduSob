// এডুসব — আধুনিক প্রফেশনাল CV মেকার (১, ২, ৩ পেজ সাপোর্ট + মনোগ্রাম, সাইডবার, এক্সিকিউটিভ ও ATS টেমপ্লেট)
import { pageShell, siteHeader } from './layout'

const cvHelpersJs = `
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function toBn(n){var d={'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};return String(n).replace(/[0-9]/g,function(x){return d[x]})}
function getInitials(name){
  if(!name) return 'CV';
  var parts = name.trim().split(/\\s+/);
  if(parts.length===1) return parts[0].slice(0,2).toUpperCase();
  return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
}
`

// ========= আধুনিক ও অ্যাডভান্সড CV রেন্ডারার (A4 Multi-Page, 1/2/3 Page Flow, Monogram, Dark Sidebar, ATS) =========
const cvRendererJs = `
var SEC_LABEL = {
  bn: {
    objective: 'ক্যারিয়ার লক্ষ্য ও বিবরণী',
    summary: 'প্রফেশনাল সারাংশ',
    experience: 'কাজের অভিজ্ঞতা',
    education: 'শিক্ষাগত যোগ্যতা',
    projects: 'প্রজেক্ট ও পোর্টফোলিও',
    skills: 'দক্ষতা ও কারিগরি জ্ঞান',
    tools: 'টুলস ও সফটওয়্যার',
    languages: 'ভাষাগত দক্ষতা',
    certifications: 'প্রশিক্ষণ ও সার্টিফিকেট',
    awards: 'অর্জন ও সম্মাননা',
    references: 'রেফারেন্স',
    personal: 'ব্যক্তিগত পরিচিতি',
    declaration: 'ঘোষণা ও স্বাক্ষর'
  },
  en: {
    objective: 'Career Objective',
    summary: 'Professional Summary',
    experience: 'Work Experience',
    education: 'Education',
    projects: 'Key Projects',
    skills: 'Core Competencies & Skills',
    tools: 'Tools & Technologies',
    languages: 'Languages',
    certifications: 'Certifications & Training',
    awards: 'Honors & Awards',
    references: 'References',
    personal: 'Personal Information',
    declaration: 'Declaration & Signature'
  }
};

function getDensityStyles(density, pageMode, scale) {
  scale = scale || 1;
  var padding = density==='compact' ? '12mm 14mm' : (density==='spacious' ? '18mm 20mm' : '15mm 16mm');
  var baseFont = density==='compact' ? 10 : (density==='spacious' ? 11.5 : 10.5);
  var lineH = density==='compact' ? 1.35 : (density==='spacious' ? 1.55 : 1.45);
  var secGap = density==='compact' ? '8px' : (density==='spacious' ? '16px' : '12px');
  
  if (pageMode === '1') {
    padding = '10mm 12mm';
    baseFont = 9.5;
    lineH = 1.3;
    secGap = '6px';
  } else if (pageMode === '3') {
    padding = '16mm 18mm';
    baseFont = 11;
    lineH = 1.55;
    secGap = '16px';
  }

  return {
    padding: padding,
    fontSize: (baseFont * scale) + 'px',
    lineHeight: lineH,
    secGap: secGap,
    scale: scale
  };
}

function secTitle(cfg, key, lang, isSidebar) {
  var text = (SEC_LABEL[lang] && SEC_LABEL[lang][key]) ? SEC_LABEL[lang][key] : key;
  var color = isSidebar ? (cfg.sidebarTextColor || cfg.primary) : cfg.primary;
  var borderCol = cfg.accent || '#3b82f6';
  
  if (isSidebar && cfg.layout === 'sidebar-dark') {
    return '<div style="margin:12px 0 6px;font-size:11.5px;font-weight:700;color:#fff;border-bottom:1.5px solid '+borderCol+';padding-bottom:3px;letter-spacing:.5px;text-transform:uppercase;">'+esc(text)+'</div>';
  }
  
  if (cfg.headerStyle === 'clean-border' || cfg.badge === 'ATS Clean') {
    return '<div style="margin:12px 0 6px;font-size:12.5px;font-weight:700;color:'+color+';border-bottom:1.5px solid #cbd5e1;padding-bottom:2px;letter-spacing:.3px;text-transform:uppercase;display:flex;align-items:center;justify-content:space-between"><span>'+esc(text)+'</span><span style="height:2px;width:30px;background:'+borderCol+'"></span></div>';
  }

  return '<div style="margin:12px 0 6px;font-size:12.5px;font-weight:700;color:'+color+';border-bottom:2px solid '+borderCol+';padding-bottom:3px;letter-spacing:.4px;text-transform:uppercase;">'+esc(text)+'</div>';
}

function eduSectionHtml(cfg, edu, lang) {
  if (!edu || !edu.length) return '';
  
  // Tabular format for BD Standard, or modern list for Tech/Modern
  if (cfg.badge === 'BD Standard' || cfg.layout === 'single') {
    var th = 'style="border:1px solid #cbd5e1;padding:5px 8px;font-size:10.5px;background:'+cfg.primary+'10;color:'+cfg.primary+';text-align:left;font-weight:700;"';
    var td = 'style="border:1px solid #cbd5e1;padding:5px 8px;font-size:10.5px;color:#334155;"';
    var L = lang==='en' ? ['Degree/Exam','Institute / University','Board / Faculty','Year','Result / CGPA'] : ['ডিগ্রি / পরীক্ষা','প্রতিষ্ঠান / বিশ্ববিদ্যালয়','বোর্ড / বিভাগ','পাসের সন','ফলাফল'];
    var rows = edu.map(function(e){
      return '<tr style="page-break-inside:avoid;"><td '+td+'><b>'+esc(e.exam||'-')+'</b></td><td '+td+'>'+esc(e.institute||'-')+'</td><td '+td+'>'+esc(e.board||'-')+'</td><td '+td+'>'+esc(e.year||'-')+'</td><td '+td+'><b>'+esc(e.result||'-')+'</b></td></tr>';
    }).join('');
    return '<table style="width:100%;border-collapse:collapse;margin:4px 0 8px;page-break-inside:avoid;"><thead><tr>'+L.map(function(h){return '<th '+th+'>'+h+'</th>'}).join('')+'</tr></thead><tbody>'+rows+'</tbody></table>';
  }

  // Modern Timeline/Card format
  return '<div style="display:flex;flex-direction:column;gap:8px;margin-top:4px;">' + edu.map(function(e){
    return '<div style="page-break-inside:avoid;border-left:2px solid '+cfg.accent+'44;padding-left:10px;margin-left:2px;">'
      + '<div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;">'
      + '<span style="font-weight:700;font-size:11.5px;color:'+cfg.primary+';">'+esc(e.exam||'')+(e.result?' &nbsp;<span style="font-size:10px;background:'+cfg.accent+'20;color:'+cfg.primary+';padding:1px 6px;border-radius:4px;">'+esc(e.result)+'</span>':'')+'</span>'
      + (e.year ? '<span style="font-size:10px;font-weight:600;color:#64748b;">'+esc(e.year)+'</span>' : '')
      + '</div>'
      + '<div style="font-size:10.5px;font-weight:600;color:#334155;margin-top:1px;">'+esc(e.institute||'')+(e.board?' ('+esc(e.board)+')':'')+'</div>'
      + '</div>';
  }).join('') + '</div>';
}

function expSectionHtml(cfg, exp, lang) {
  if (!exp || !exp.length) return '';
  return '<div style="display:flex;flex-direction:column;gap:10px;margin-top:4px;">' + exp.map(function(e){
    var bullets = '';
    if (e.detail) {
      var lines = e.detail.split('\\n').map(function(l){return l.trim()}).filter(Boolean);
      if (lines.length > 1) {
        bullets = '<ul style="margin:3px 0 0 16px;padding:0;font-size:10.5px;color:#475569;line-height:1.45;">' + lines.map(function(l){return '<li style="margin-bottom:2px;">'+esc(l.replace(/^[•\\-\\*]\\s*/,''))+'</li>'}).join('') + '</ul>';
      } else {
        bullets = '<div style="font-size:10.5px;color:#475569;margin-top:3px;line-height:1.45;text-align:justify;">'+esc(e.detail)+'</div>';
      }
    }
    return '<div style="page-break-inside:avoid;border-left:2.5px solid '+cfg.primary+';padding-left:10px;margin-left:2px;">'
      + '<div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;">'
      + '<span style="font-weight:700;font-size:12px;color:#0f172a;">'+esc(e.title||'')+(e.org?' <span style="font-weight:500;color:#334155;">— '+esc(e.org)+'</span>':'')+'</span>'
      + (e.period ? '<span style="font-size:10px;font-weight:700;color:'+cfg.primary+';background:'+cfg.primary+'12;padding:1px 7px;border-radius:10px;">'+esc(e.period)+'</span>' : '')
      + '</div>'
      + (e.location ? '<div style="font-size:10px;color:#64748b;">📍 '+esc(e.location)+'</div>' : '')
      + bullets
      + '</div>';
  }).join('') + '</div>';
}

function projectSectionHtml(cfg, projects, lang) {
  if (!projects || !projects.length) return '';
  return '<div style="display:flex;flex-direction:column;gap:8px;margin-top:4px;">' + projects.map(function(p){
    return '<div style="page-break-inside:avoid;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:7px 10px;">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;">'
      + '<span style="font-weight:700;font-size:11.5px;color:'+cfg.primary+';">🚀 '+esc(p.name||p.title||'')+'</span>'
      + (p.year || p.period ? '<span style="font-size:9.5px;color:#64748b;">'+esc(p.year||p.period)+'</span>' : '')
      + '</div>'
      + (p.tech ? '<div style="font-size:10px;color:#0284c7;font-weight:600;margin:1px 0;">🛠️ '+esc(p.tech)+'</div>' : '')
      + (p.description ? '<div style="font-size:10px;color:#475569;margin-top:2px;line-height:1.4;">'+esc(p.description)+'</div>' : '')
      + (p.link ? '<div style="font-size:9.5px;margin-top:2px;"><a href="'+esc(p.link)+'" target="_blank" style="color:'+cfg.primary+';text-decoration:underline;">🔗 '+esc(p.link)+'</a></div>' : '')
      + '</div>';
  }).join('') + '</div>';
}

function skillsHtml(cfg, skills, lang, isSidebar) {
  if (!skills || !skills.length) return '';
  var style = cfg.skillStyle || 'pills';
  var isDark = isSidebar && cfg.layout === 'sidebar-dark';

  if (style === 'bars') {
    return '<div style="display:flex;flex-direction:column;gap:5px;margin-top:4px;">' + skills.map(function(s){
      var name = typeof s === 'string' ? s : s.name;
      var level = (typeof s === 'object' && s.level) ? parseInt(s.level) : 85;
      return '<div style="page-break-inside:avoid;">'
        + '<div style="display:flex;justify-content:space-between;font-size:10px;font-weight:600;color:'+(isDark?'#e2e8f0':'#334155')+';margin-bottom:2px;"><span>'+esc(name)+'</span><span>'+level+'%</span></div>'
        + '<div style="height:5px;background:'+(isDark?'#334155':'#e2e8f0')+';border-radius:3px;overflow:hidden;">'
        + '<div style="width:'+level+'%;height:100%;background:'+(isDark?'#38bdf8':cfg.primary)+';border-radius:3px;"></div>'
        + '</div></div>';
    }).join('') + '</div>';
  }

  if (style === 'dots') {
    return '<div style="display:flex;flex-direction:column;gap:4px;margin-top:4px;">' + skills.map(function(s){
      var name = typeof s === 'string' ? s : s.name;
      var dots = (typeof s === 'object' && s.rating) ? parseInt(s.rating) : 4;
      var dotIcons = '';
      for (var i=1; i<=5; i++) {
        dotIcons += '<span style="display:inline-block;width:7px;height:7px;border-radius:50%;margin-left:2px;background:'+(i<=dots?(isDark?'#38bdf8':cfg.primary):(isDark?'#475569':'#cbd5e1'))+';"></span>';
      }
      return '<div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;color:'+(isDark?'#e2e8f0':'#334155')+';page-break-inside:avoid;"><span>'+esc(name)+'</span><span>'+dotIcons+'</span></div>';
    }).join('') + '</div>';
  }

  if (style === 'clean-list') {
    return '<div style="font-size:10.5px;color:#334155;line-height:1.6;margin-top:2px;">' + skills.map(function(s){
      var name = typeof s === 'string' ? s : s.name;
      return '• <b>'+esc(name)+'</b>';
    }).join('&nbsp;&nbsp; ') + '</div>';
  }

  // Default Pills
  return '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">' + skills.map(function(s){
    var name = typeof s === 'string' ? s : s.name;
    var bg = isDark ? '#1e293b' : cfg.accent + '15';
    var col = isDark ? '#38bdf8' : cfg.primary;
    var border = isDark ? '#334155' : cfg.accent + '44';
    return '<span style="background:'+bg+';color:'+col+';border:1px solid '+border+';padding:2px 7px;border-radius:6px;font-size:9.5px;font-weight:600;white-space:nowrap;page-break-inside:avoid;">'+esc(name)+'</span>';
  }).join('') + '</div>';
}

function languagesHtml(cfg, langs, lang, isSidebar) {
  if (!langs || !langs.length) return '';
  var isDark = isSidebar && cfg.layout === 'sidebar-dark';
  return '<div style="display:flex;flex-direction:column;gap:3px;margin-top:4px;">' + langs.map(function(l){
    var name = typeof l === 'string' ? l : l.name;
    var prof = (typeof l === 'object' && l.prof) ? ' <span style="font-size:9px;color:'+(isDark?'#94a3b8':'#64748b')+';">('+esc(l.prof)+')</span>' : '';
    return '<div style="font-size:10px;color:'+(isDark?'#f1f5f9':'#334155')+';display:flex;align-items:center;gap:4px;page-break-inside:avoid;"><span style="color:'+(isDark?'#38bdf8':cfg.primary)+';">🌐</span> <b>'+esc(name)+'</b>'+prof+'</div>';
  }).join('') + '</div>';
}

function referencesHtml(cfg, refs, lang) {
  if (!refs || !refs.length) return '';
  return '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-top:4px;">' + refs.map(function(r){
    return '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:8px 10px;font-size:10px;page-break-inside:avoid;">'
      + '<div style="font-weight:700;font-size:11px;color:'+cfg.primary+';">👤 '+esc(r.name||'')+'</div>'
      + (r.designation ? '<div style="font-weight:600;color:#334155;margin-top:1px;">'+esc(r.designation)+'</div>' : '')
      + (r.org ? '<div style="color:#64748b;">'+esc(r.org)+'</div>' : '')
      + (r.phone ? '<div style="color:#475569;margin-top:2px;">📞 '+esc(r.phone)+'</div>' : '')
      + (r.email ? '<div style="color:#475569;">✉️ '+esc(r.email)+'</div>' : '')
      + '</div>';
  }).join('') + '</div>';
}

function personalInfoHtml(cfg, d, lang, isSidebar) {
  var L = lang==='en' ? {
    f: "Father's Name", m: "Mother's Name", dob: 'Date of Birth',
    bg: 'Blood Group', rel: 'Religion', ms: 'Marital Status',
    nat: 'Nationality', nid: 'NID / Birth Reg', addr: 'Permanent Address',
    pres: 'Present Address'
  } : {
    f: 'পিতার নাম', m: 'মাতার নাম', dob: 'জন্মতারিখ',
    bg: 'রক্তের গ্রুপ', rel: 'ধর্ম', ms: 'বৈবাহিক অবস্থা',
    nat: 'জাতীয়তা', nid: 'এনআইডি / জন্ম সনদ', addr: 'স্থায়ী ঠিকানা',
    pres: 'বর্তমান ঠিকানা'
  };

  var rows = [];
  if (d.father) rows.push([L.f, d.father]);
  if (d.mother) rows.push([L.m, d.mother]);
  if (d.dob) rows.push([L.dob, d.dob]);
  if (d.blood_group) rows.push([L.bg, d.blood_group]);
  if (d.religion) rows.push([L.rel, d.religion]);
  if (d.marital_status) rows.push([L.ms, d.marital_status]);
  if (d.nationality) rows.push([L.nat, d.nationality || (lang==='en'?'Bangladeshi':'বাংলাদেশি')]);
  if (d.nid) rows.push([L.nid, d.nid]);
  if (d.present_address) rows.push([L.pres, d.present_address]);
  if (d.address) rows.push([L.addr, d.address]);

  if (!rows.length) return '';
  var isDark = isSidebar && cfg.layout === 'sidebar-dark';

  if (isSidebar) {
    return '<div style="display:flex;flex-direction:column;gap:4px;margin-top:4px;">' + rows.map(function(r){
      return '<div style="font-size:9.5px;line-height:1.3;color:'+(isDark?'#cbd5e1':'#334155')+';page-break-inside:avoid;"><span style="color:'+(isDark?'#94a3b8':'#64748b')+';font-weight:600;">'+esc(r[0])+':</span> '+esc(r[1])+'</div>';
    }).join('') + '</div>';
  }

  // BD Standard 2-column list
  return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;margin-top:4px;">' + rows.map(function(r){
    return '<div style="font-size:10.5px;display:flex;gap:4px;page-break-inside:avoid;"><span style="min-width:90px;font-weight:600;color:#475569;">'+esc(r[0])+'</span><span>: '+esc(r[1])+'</span></div>';
  }).join('') + '</div>';
}

function declarationHtml(cfg, d, lang) {
  var text = lang==='en' 
    ? 'I hereby declare that all the information provided above is true, complete, and correct to the best of my knowledge.'
    : 'আমি প্রত্যয়ন করছি যে, উপরে প্রদত্ত সকল তথ্য আমার জ্ঞান ও বিশ্বাসমতে সত্য, নির্ভুল ও সম্পূর্ণ।';
  var dateStr = new Date().toLocaleDateString(lang==='en'?'en-GB':'bn-BD');
  return '<div style="margin-top:16px;padding-top:10px;border-top:1px dashed #cbd5e1;page-break-inside:avoid;">'
    + '<div style="font-size:9.5px;color:#64748b;text-align:justify;line-height:1.4;">'+text+'</div>'
    + '<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:24px;">'
    + '<div style="font-size:10px;color:#475569;">'+(lang==='en'?'Date: ':'তারিখ: ')+dateStr+'</div>'
    + '<div style="text-align:center;border-top:1px solid #334155;padding-top:3px;min-width:140px;font-size:10.5px;font-weight:700;color:#0f172a;">'+esc(d.name||'স্বাক্ষর')+'</div>'
    + '</div></div>';
}

function renderSection(key, cfg, d, lang, isSidebar) {
  if (key==='objective' || key==='summary') {
    if (!d.objective && !d.summary) return '';
    var text = d.summary || d.objective;
    var isDark = isSidebar && cfg.layout === 'sidebar-dark';
    return secTitle(cfg, key, lang, isSidebar) + '<div style="font-size:10.5px;color:'+(isDark?'#cbd5e1':'#334155')+';line-height:1.5;text-align:justify;margin-top:2px;">'+esc(text)+'</div>';
  }
  if (key==='education') return (d.education&&d.education.length) ? secTitle(cfg,'education',lang,isSidebar)+eduSectionHtml(cfg,d.education,lang) : '';
  if (key==='experience') return (d.experience&&d.experience.length) ? secTitle(cfg,'experience',lang,isSidebar)+expSectionHtml(cfg,d.experience,lang) : '';
  if (key==='projects') return (d.projects&&d.projects.length) ? secTitle(cfg,'projects',lang,isSidebar)+projectSectionHtml(cfg,d.projects,lang) : '';
  if (key==='skills' || key==='tools') return (d.skills&&d.skills.length) ? secTitle(cfg,'skills',lang,isSidebar)+skillsHtml(cfg,d.skills,lang,isSidebar) : '';
  if (key==='languages') return (d.languages&&d.languages.length) ? secTitle(cfg,'languages',lang,isSidebar)+languagesHtml(cfg,d.languages,lang,isSidebar) : '';
  if (key==='references') return (d.references&&d.references.length) ? secTitle(cfg,'references',lang,isSidebar)+referencesHtml(cfg,d.references,lang) : '';
  if (key==='personal') return personalInfoHtml(cfg,d,lang,isSidebar) ? secTitle(cfg,'personal',lang,isSidebar)+personalInfoHtml(cfg,d,lang,isSidebar) : '';
  if (key==='declaration') return declarationHtml(cfg,d,lang);
  return '';
}

function photoBox(d, withPhoto, shape, size) {
  if (!withPhoto) return '';
  size = size || '90px';
  var radius = shape==='circle' ? '50%' : (shape==='rounded' ? '12px' : '4px');
  if (d.photo) {
    return '<img src="'+d.photo+'" style="width:'+size+';height:'+size+';object-fit:cover;border-radius:'+radius+';border:2px solid #ffffffaa;box-shadow:0 2px 8px rgba(0,0,0,0.15);" alt="ছবি">';
  }
  return '<div style="width:'+size+';height:'+size+';border:1.5px dashed #94a3b8;border-radius:'+radius+';display:flex;align-items:center;justify-content:center;font-size:9px;color:#94a3b8;text-align:center;background:#f8fafc;">ছবি আপলোড<br>করুন</div>';
}

function contactItems(d, isDark) {
  var col = isDark ? '#cbd5e1' : '#475569';
  var iconCol = isDark ? '#38bdf8' : '#0284c7';
  var items = [];
  if (d.phone) items.push('<span><span style="color:'+iconCol+';">📞</span> '+esc(d.phone)+'</span>');
  if (d.email) items.push('<span><span style="color:'+iconCol+';">✉️</span> '+esc(d.email)+'</span>');
  if (d.address) items.push('<span><span style="color:'+iconCol+';">📍</span> '+esc(d.address)+'</span>');
  if (d.linkedin) items.push('<span><span style="color:'+iconCol+';">💼</span> '+esc(d.linkedin)+'</span>');
  if (d.github) items.push('<span><span style="color:'+iconCol+';">🐙</span> '+esc(d.github)+'</span>');
  if (d.website) items.push('<span><span style="color:'+iconCol+';">🌐</span> '+esc(d.website)+'</span>');
  return items;
}

// =================== মূল সিভি রেন্ডার ফাংশন ===================
function renderCV(cfg, d, withPhoto, lang, isFree, options) {
  lang = lang || 'bn';
  options = options || {};
  var pageMode = options.pageMode || 'auto'; // '1', '2', '3', 'auto'
  var density = options.density || 'normal'; // 'compact', 'normal', 'spacious'
  var scale = options.scale || 1;
  var photoShape = options.photoShape || 'rounded';

  var st = getDensityStyles(density, pageMode, scale);
  var name = esc(d.name || (lang==='en'?'Your Name':'আপনার নাম'));
  var initials = getInitials(d.name || (lang==='en'?'Your Name':'আপনার নাম'));
  var desig = d.designation ? '<div style="font-size:12.5px;font-weight:600;opacity:.9;margin-top:2px;letter-spacing:.3px;">'+esc(d.designation)+'</div>' : '';

  var header = '';
  var contacts = contactItems(d, false);
  var contactLine = contacts.join(' &nbsp;•&nbsp; ');

  // 1. Monogram Header
  if (cfg.headerStyle === 'monogram') {
    var monoBg = cfg.primary;
    var monoCol = '#ffffff';
    header = '<div style="display:flex;align-items:center;justify-content:space-between;gap:14px;border-bottom:2.5px solid '+cfg.primary+';padding-bottom:12px;margin-bottom:'+st.secGap+';">'
      + '<div style="display:flex;align-items:center;gap:14px;">'
      + '<div style="width:48px;height:48px;background:'+monoBg+';color:'+monoCol+';font-weight:800;font-size:20px;display:flex;align-items:center;justify-content:center;border-radius:6px;letter-spacing:1px;font-family:serif;box-shadow:0 2px 4px rgba(0,0,0,0.1);">'+initials+'</div>'
      + '<div><div style="font-size:22px;font-weight:800;color:'+cfg.primary+';letter-spacing:.3px;">'+name+'</div>'+desig+'</div>'
      + '</div>'
      + '<div style="display:flex;align-items:center;gap:12px;">'
      + '<div style="font-size:10px;text-align:right;color:#475569;line-height:1.6;">'
      + (d.phone?'<div>📞 '+esc(d.phone)+'</div>':'')
      + (d.email?'<div>✉️ '+esc(d.email)+'</div>':'')
      + (d.address?'<div>📍 '+esc(d.address)+'</div>':'')
      + '</div>'
      + photoBox(d, withPhoto, photoShape, '68px')
      + '</div></div>';
  }
  // 2. Full Top Band Header (Solid or Gradient)
  else if (cfg.headerStyle === 'band' || cfg.headerStyle === 'gradient') {
    var bg = cfg.headerStyle==='gradient' 
      ? 'linear-gradient(135deg,'+cfg.primary+','+cfg.accent+')' 
      : cfg.primary;
    header = '<div style="background:'+bg+';color:#fff;padding:16px 20px;margin:-'+st.padding.split(' ')[0]+' -'+st.padding.split(' ')[1]+' '+st.secGap+';display:flex;align-items:center;justify-content:space-between;gap:16px;">'
      + '<div><div style="font-size:23px;font-weight:800;letter-spacing:.4px;">'+name+'</div>'+desig
      + '<div style="font-size:10px;margin-top:6px;opacity:.92;display:flex;flex-wrap:wrap;gap:8px;">'+contactLine+'</div>'
      + '</div>'
      + photoBox(d, withPhoto, photoShape, '76px')
      + '</div>';
  }
  // 3. Modern Left Header
  else if (cfg.headerStyle === 'modern-left') {
    header = '<div style="display:flex;align-items:center;justify-content:space-between;gap:14px;border-bottom:2px solid '+cfg.accent+'66;padding-bottom:10px;margin-bottom:'+st.secGap+';">'
      + '<div><div style="font-size:22px;font-weight:800;color:'+cfg.primary+';">'+name+'</div>'+desig
      + '<div style="font-size:10px;color:#475569;margin-top:4px;display:flex;flex-wrap:wrap;gap:8px;">'+contactLine+'</div></div>'
      + photoBox(d, withPhoto, photoShape, '72px')
      + '</div>';
  }
  // 4. Center Academic Header
  else if (cfg.headerStyle === 'center') {
    header = '<div style="text-align:center;border-bottom:2px double '+cfg.primary+';padding-bottom:10px;margin-bottom:'+st.secGap+';">'
      + (withPhoto ? '<div style="display:flex;justify-content:center;margin-bottom:6px;">'+photoBox(d, withPhoto, photoShape, '76px')+'</div>' : '')
      + '<div style="font-size:23px;font-weight:800;color:'+cfg.primary+';letter-spacing:.5px;">'+name+'</div>'+desig
      + '<div style="font-size:10.5px;color:#475569;margin-top:4px;display:flex;justify-content:center;flex-wrap:wrap;gap:10px;">'+contactLine+'</div>'
      + '</div>';
  }
  // 5. Clean Border / ATS Header
  else {
    header = '<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #cbd5e1;padding-bottom:10px;margin-bottom:'+st.secGap+';">'
      + '<div><div style="font-size:22px;font-weight:800;color:'+cfg.primary+';">'+name+'</div>'+desig
      + '<div style="font-size:10px;color:#475569;margin-top:4px;display:flex;flex-wrap:wrap;gap:8px;">'+contactLine+'</div></div>'
      + photoBox(d, withPhoto, photoShape, '70px')
      + '</div>';
  }

  var order = cfg.sectionOrder || ['objective','experience','education','projects','skills','languages','references','personal','declaration'];
  var body = '';

  // Layout 1: Left Dark / Tinted Sidebar
  if (cfg.layout === 'sidebar-left' || cfg.layout === 'sidebar-dark') {
    var isDark = cfg.layout === 'sidebar-dark';
    var sideBg = isDark ? '#0f172a' : (cfg.primary + '0f');
    var sideKeys = ['skills', 'languages', 'personal'];
    var mainKeys = order.filter(function(k){return sideKeys.indexOf(k)<0});

    var sideContent = '<div style="width:34%;background:'+sideBg+';padding:14px;border-radius:6px;display:flex;flex-direction:column;gap:10px;">'
      + (cfg.contactPos==='sidebar' ? '<div style="display:flex;flex-direction:column;gap:4px;font-size:9.5px;line-height:1.4;color:'+(isDark?'#cbd5e1':'#334155')+';padding-bottom:8px;border-bottom:1px solid '+(isDark?'#334155':'#e2e8f0')+';">'
        + (d.phone?'<div>📞 '+esc(d.phone)+'</div>':'')
        + (d.email?'<div>✉️ '+esc(d.email)+'</div>':'')
        + (d.address?'<div>📍 '+esc(d.address)+'</div>':'')
        + (d.linkedin?'<div>💼 '+esc(d.linkedin)+'</div>':'')
        + (d.github?'<div>🐙 '+esc(d.github)+'</div>':'')
        + '</div>' : '')
      + sideKeys.map(function(k){return renderSection(k, cfg, d, lang, true)}).join('')
      + '</div>';

    var mainContent = '<div style="flex:1;padding-left:16px;display:flex;flex-direction:column;gap:'+st.secGap+';">'
      + mainKeys.map(function(k){return renderSection(k, cfg, d, lang, false)}).join('')
      + '</div>';

    body = '<div style="display:flex;gap:12px;align-items:stretch;">' + sideContent + mainContent + '</div>';
  }
  // Layout 2: Right Sidebar
  else if (cfg.layout === 'sidebar-right') {
    var sideKeys2 = ['skills', 'languages', 'personal'];
    var mainKeys2 = order.filter(function(k){return sideKeys2.indexOf(k)<0});

    var sideContent2 = '<div style="width:34%;background:'+cfg.primary+'0e;padding:14px;border-radius:6px;display:flex;flex-direction:column;gap:10px;">'
      + sideKeys2.map(function(k){return renderSection(k, cfg, d, lang, true)}).join('')
      + '</div>';

    var mainContent2 = '<div style="flex:1;padding-right:16px;display:flex;flex-direction:column;gap:'+st.secGap+';">'
      + mainKeys2.map(function(k){return renderSection(k, cfg, d, lang, false)}).join('')
      + '</div>';

    body = '<div style="display:flex;gap:12px;align-items:stretch;">' + mainContent2 + sideContent2 + '</div>';
  }
  // Layout 3: Two Column Equal
  else if (cfg.layout === 'two-column-equal') {
    var col1Keys = ['objective', 'experience', 'projects'];
    var col2Keys = ['education', 'skills', 'languages', 'personal', 'references'];
    body = '<div style="display:grid;grid-template-columns:1.1fr 0.9fr;gap:16px;">'
      + '<div style="display:flex;flex-direction:column;gap:'+st.secGap+';">' + col1Keys.map(function(k){return renderSection(k, cfg, d, lang, false)}).join('') + '</div>'
      + '<div style="display:flex;flex-direction:column;gap:'+st.secGap+';">' + col2Keys.map(function(k){return renderSection(k, cfg, d, lang, false)}).join('') + '</div>'
      + '</div>'
      + (order.indexOf('declaration')>=0 ? renderSection('declaration', cfg, d, lang, false) : '');
  }
  // Layout 4: Clean Single Column (ATS & BD Standard)
  else {
    body = '<div style="display:flex;flex-direction:column;gap:'+st.secGap+';">'
      + order.map(function(k){return renderSection(k, cfg, d, lang, false)}).join('')
      + '</div>';
  }

  var wm = (cfg.watermark && isFree) ? '<div style="position:absolute;bottom:8px;right:12px;font-size:9px;color:#94a3b8;letter-spacing:.3px;">তৈরি: এডুসব CV মেকার — edusob.com</div>' : '';

  return '<div class="cv-page-sheet" style="position:relative;background:#ffffff;color:#1e293b;font-family:\\''+(cfg.font||'Hind Siliguri')+'\\',sans-serif;font-size:'+st.fontSize+';line-height:'+st.lineHeight+';padding:'+st.padding+';min-height:297mm;box-sizing:border-box;">'
    + header + body + wm + '</div>';
}
`

export { cvHelpersJs, cvRendererJs }

// ============ CV মেকার পেজ ============
export function cvMakerPage(loggedIn: boolean): string {
  const content = `
${siteHeader({ activeKey: 'cv', loggedIn, theme: 'dark' })}

<main class="max-w-7xl mx-auto px-4 py-6">
  <!-- ১. ভিজ্যুয়াল হায়ারার্কি ও ৩-ধাপের অ্যাকশন নির্দেশিকা -->
  <header class="mb-5 pb-4 border-b border-white/10">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-black flex items-center gap-2.5">
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">প্রফেশনাল CV ও বায়োডাটা মেকার</span>
          <span class="text-xs px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-semibold">১, ২ ও ৩ পেজ</span>
        </h1>
        <p class="text-slate-300 text-xs md:text-sm mt-1">মনোগ্রাম, সাইডবার, এক্সিকিউটিভ ও ATS টেমপ্লেট — সহজে তথ্য পূরণ করে ১-ক্লিকে A4 প্রিন্ট বা PDF ডাউনলোড করুন</p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button onclick="fillSampleData('bn')" class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-white/15 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"><i class="fas fa-magic text-emerald-400"></i>বাংলা ডেমো</button>
        <button onclick="fillSampleData('en')" class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-white/15 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"><i class="fas fa-wand-magic-sparkles text-cyan-400"></i>English Demo</button>
      </div>
    </div>

    <!-- ৩-ধাপের স্পষ্ট গাইডলাইন রিবন -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
      <div class="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/30">
        <span class="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">১</span>
        <div>
          <p class="text-xs font-bold text-white">টেমপ্লেট ও পেজ বাছুন</p>
          <p class="text-[11px] text-slate-300">২৪টি ফরম্যাট, ১/২/৩ পেজ</p>
        </div>
      </div>
      <div class="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-cyan-500/30">
        <span class="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-xs">২</span>
        <div>
          <p class="text-xs font-bold text-white">তথ্য পূরণ বা ডেমো দিন</p>
          <p class="text-[11px] text-slate-300">ক্লিক করলেই লাইভ আপডেট</p>
        </div>
      </div>
      <div class="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-purple-500/30">
        <span class="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center shrink-0 text-xs">৩</span>
        <div>
          <p class="text-xs font-bold text-white">প্রিভিউ দেখে PDF নিন</p>
          <p class="text-[11px] text-slate-300">A4 সাইজ রেডি ডাউনলোড</p>
        </div>
      </div>
    </div>
  </header>

  ${!loggedIn ? `
  <section class="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-8 text-center max-w-2xl mx-auto my-12">
    <div class="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 text-emerald-400">🔒</div>
    <h2 class="text-2xl font-bold">CV সংরক্ষণ ও প্রিন্ট করতে ফ্রি অ্যাকাউন্ট প্রয়োজন</h2>
    <p class="text-slate-300 mt-2 text-sm leading-relaxed">অ্যাকাউন্ট খুললে প্রোফাইলের সকল রেজাল্ট ও তথ্য অটো-ফিল হবে এবং একাধিক CV সুরক্ষিতভাবে সেভ থাকবে।</p>
    <div class="mt-6 flex gap-3 justify-center">
      <a href="/signup" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-2.5 rounded-xl font-bold transition">ফ্রি সাইন-আপ করুন</a>
      <a href="/login" class="border border-white/20 hover:bg-white/10 px-6 py-2.5 rounded-xl text-slate-200 transition">লগইন</a>
    </div>
  </section>
  ` : `
  <!-- কন্ট্রোল বার ও টেমপ্লেট সিলেক্টর -->
  <section class="bg-slate-900 border border-white/10 rounded-2xl p-4 mb-6 shadow-xl space-y-4">
    <!-- ক্যাটাগরি ও পেজ মোড বার -->
    <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
      <!-- ক্যাটাগরি ফিল্টার -->
      <div class="flex flex-wrap items-center gap-1.5 text-xs" id="cat-filters">
        <span class="text-slate-400 font-semibold mr-1">ফিল্টার:</span>
        <button onclick="filterTpl('all')" class="cat-btn active px-3 py-1 bg-emerald-500 text-slate-950 rounded-lg font-bold">সব (All)</button>
        <button onclick="filterTpl('Monogram')" class="cat-btn px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium">মনোগ্রাম (Monogram)</button>
        <button onclick="filterTpl('Sidebar')" class="cat-btn px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium">সাইডবার (Sidebar)</button>
        <button onclick="filterTpl('Executive')" class="cat-btn px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium">এক্সিকিউটিভ (Executive)</button>
        <button onclick="filterTpl('ATS Clean')" class="cat-btn px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium">ATS ক্লিন</button>
        <button onclick="filterTpl('BD Standard')" class="cat-btn px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium">বিডি স্ট্যান্ডার্ড বায়োডাটা</button>
      </div>

      <!-- পেজ ও লেআউট কন্ট্রোল -->
      <div class="flex flex-wrap items-center gap-3 text-xs">
        <div class="flex items-center gap-1.5 bg-slate-800 border border-white/10 px-2.5 py-1 rounded-xl">
          <span class="text-slate-400">📄 পেজ মোড:</span>
          <select id="cv-page-mode" onchange="refresh()" class="bg-transparent text-emerald-400 font-bold focus:outline-none cursor-pointer">
            <option value="auto">স্বাভাবিক (Auto)</option>
            <option value="1">১ পেজ ফিট (Compact 1-Page)</option>
            <option value="2">২ পেজ স্ট্যান্ডার্ড (2-Page Standard)</option>
            <option value="3">৩ পেজ বিস্তারিত (3-Page Detailed)</option>
          </select>
        </div>

        <div class="flex items-center gap-1.5 bg-slate-800 border border-white/10 px-2.5 py-1 rounded-xl">
          <span class="text-slate-400">🌐 ভাষা:</span>
          <select id="cv-lang" onchange="refresh()" class="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer">
            <option value="bn">বাংলা</option>
            <option value="en">English</option>
          </select>
        </div>

        <label class="flex items-center gap-1.5 cursor-pointer bg-slate-800 border border-white/10 px-2.5 py-1 rounded-xl">
          <input type="checkbox" id="with-photo" checked onchange="refresh()" class="accent-emerald-500">
          <span class="text-slate-300 font-medium">ছবিসহ</span>
        </label>
      </div>
    </div>

    <!-- টেমপ্লেট কার্ড স্ক্রলার -->
    <div id="tpl-list" class="flex gap-3 overflow-x-auto pb-2 scrollbar-thin"></div>

    <!-- কালার প্যালেট সুইচার -->
    <div class="flex items-center justify-between text-xs pt-1 flex-wrap gap-2">
      <div class="flex items-center gap-2">
        <span class="text-slate-400">🎨 থিম কালার:</span>
        <div class="flex items-center gap-1.5" id="color-palettes">
          <button onclick="setThemeColor('#4a443c','#a89f91')" title="Trusted Taupe" class="w-5 h-5 rounded-full border border-white/30" style="background:#4a443c"></button>
          <button onclick="setThemeColor('#0f2444','#2563eb')" title="Loyal Navy" class="w-5 h-5 rounded-full border border-white/30" style="background:#0f2444"></button>
          <button onclick="setThemeColor('#0f766e','#14b8a6')" title="Team Teal" class="w-5 h-5 rounded-full border border-white/30" style="background:#0f766e"></button>
          <button onclick="setThemeColor('#065f46','#10b981')" title="Creative Emerald" class="w-5 h-5 rounded-full border border-white/30" style="background:#065f46"></button>
          <button onclick="setThemeColor('#991b1b','#ef4444')" title="Ambitious Red" class="w-5 h-5 rounded-full border border-white/30" style="background:#991b1b"></button>
          <button onclick="setThemeColor('#581c87','#a855f7')" title="Royal Purple" class="w-5 h-5 rounded-full border border-white/30" style="background:#581c87"></button>
          <button onclick="setThemeColor('#854d0e','#f59e0b')" title="Creative Marigold" class="w-5 h-5 rounded-full border border-white/30" style="background:#854d0e"></button>
          <button onclick="setThemeColor('#18181b','#52525b')" title="Assertive Asphalt" class="w-5 h-5 rounded-full border border-white/30" style="background:#18181b"></button>
        </div>
      </div>
      <div class="flex items-center gap-3 text-slate-400">
        <label class="flex items-center gap-1 cursor-pointer">
          <span>ফটো ফ্রেম:</span>
          <select id="photo-shape" onchange="refresh()" class="bg-slate-800 border border-white/10 text-slate-300 rounded px-1.5 py-0.5 text-xs">
            <option value="rounded">রাউন্ডেড</option>
            <option value="circle">বৃত্তাকার (Circle)</option>
            <option value="square">বর্গাকার</option>
          </select>
        </label>
        <label class="flex items-center gap-1 cursor-pointer">
          <span>ফন্ট স্কেল:</span>
          <select id="font-scale" onchange="refresh()" class="bg-slate-800 border border-white/10 text-slate-300 rounded px-1.5 py-0.5 text-xs">
            <option value="1">স্বাভাবিক (100%)</option>
            <option value="0.92">কমপ্যাক্ট (92%)</option>
            <option value="1.08">বড় (108%)</option>
          </select>
        </label>
      </div>
    </div>
  </section>

  <!-- মূল এডিটর ও প্রিভিউ গ্রিড -->
  <div class="grid lg:grid-cols-12 gap-6">
    <!-- বাম পাশ: ফর্ম ইনপুট -->
    <section class="lg:col-span-5 bg-slate-900 border border-white/10 rounded-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto scrollbar-thin">
      <div class="flex items-center justify-between pb-2 border-b border-white/10">
        <h2 class="font-bold text-sm text-slate-200 flex items-center gap-2"><i class="fas fa-edit text-emerald-400"></i>CV তথ্য এডিটর</h2>
        <button onclick="prefill()" class="text-xs bg-teal-600 hover:bg-teal-500 text-white font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1"><i class="fas fa-sparkles text-amber-300"></i>প্রোফাইল থেকে আনো</button>
      </div>

      <!-- ছবি আপলোড ও বেসিক তথ্য -->
      <div class="space-y-3">
        <div class="flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-white/5">
          <div id="photo-preview-wrap" class="w-14 h-14 bg-slate-700 rounded-xl overflow-hidden flex items-center justify-center text-slate-400 text-xs border border-white/10 shrink-0">
            <span id="photo-ph">ছবি নেই</span>
          </div>
          <div class="flex-1 space-y-1">
            <label class="block text-xs font-semibold text-slate-300">প্রোফাইল ছবি (CV-র জন্য)</label>
            <div class="flex items-center gap-2">
              <label class="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1">
                <i class="fas fa-upload text-[10px]"></i> আপলোড
                <input type="file" id="photo-file" accept="image/*" class="hidden" onchange="handlePhotoUpload(this)">
              </label>
              <button onclick="clearPhoto()" class="text-xs text-red-400 hover:text-red-300 px-2 py-1">মুছে ফেলুন</button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2.5">
          <input id="f-name" placeholder="পূর্ণ নাম *" class="cv-in col-span-2 font-semibold text-emerald-300">
          <input id="f-desig" placeholder="পদ / প্রফেশনাল পরিচয় (যেমন: সফটওয়্যার ইঞ্জিনিয়ার / অনার্স শিক্ষার্থী)" class="cv-in col-span-2">
          <input id="f-phone" placeholder="মোবাইল নম্বর *" class="cv-in">
          <input id="f-email" placeholder="ইমেইল অ্যাড্রেস *" class="cv-in">
          <input id="f-address" placeholder="বর্তমান / স্থায়ী ঠিকানা" class="cv-in col-span-2">
          <input id="f-linkedin" placeholder="LinkedIn প্রোফাইল / ইউজারনেম" class="cv-in">
          <input id="f-github" placeholder="GitHub / পোর্টফোলিও লিংক" class="cv-in">
        </div>
      </div>

      <!-- ক্যারিয়ার অবজেক্টিভ ও প্রিসেট -->
      <div class="space-y-1.5 pt-2 border-t border-white/5">
        <div class="flex items-center justify-between">
          <label class="text-xs font-bold text-emerald-400 flex items-center gap-1"><i class="fas fa-bullseye"></i>ক্যারিয়ার অবজেক্টিভ / সারাংশ</label>
          <select onchange="applyPreset(this.value)" class="bg-slate-800 border border-white/10 text-emerald-400 rounded-lg px-2 py-0.5 text-[11px] cursor-pointer">
            <option value="">+ তৈরি প্রিসেট বসান</option>
            <option value="fresher">ফ্রেশ গ্র্যাজুয়েট (Bangla)</option>
            <option value="fresher_en">Fresh Graduate (English)</option>
            <option value="tech">সফটওয়্যার / আইটি প্রফেশনাল</option>
            <option value="tech_en">Software Developer (English)</option>
            <option value="bank">ব্যাংকিং ও করপোরেট জব</option>
            <option value="teacher">শিক্ষকতা / লেকচারার</option>
            <option value="bcs">বিসিএস / সরকারি চাকরি প্রস্তুতি</option>
          </select>
        </div>
        <textarea id="f-objective" rows="3" placeholder="আপনার ক্যারিয়ার লক্ষ্য ও অভিজ্ঞতার সংক্ষিপ্ত বিবরণী লিখুন..." class="cv-in w-full text-xs"></textarea>
      </div>

      <!-- শিক্ষাগত যোগ্যতা -->
      <div class="space-y-2 pt-2 border-t border-white/5">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-emerald-400 flex items-center gap-1"><i class="fas fa-graduation-cap"></i>শিক্ষাগত যোগ্যতা (Education)</h3>
          <button onclick="addEdu()" class="text-xs bg-slate-800 hover:bg-slate-700 border border-white/10 text-emerald-300 px-2.5 py-1 rounded-lg transition">+ যোগ করুন</button>
        </div>
        <div id="edu-rows" class="space-y-2"></div>
      </div>

      <!-- কাজের অভিজ্ঞতা -->
      <div class="space-y-2 pt-2 border-t border-white/5">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-emerald-400 flex items-center gap-1"><i class="fas fa-briefcase"></i>কাজের অভিজ্ঞতা (Work Experience)</h3>
          <button onclick="addExp()" class="text-xs bg-slate-800 hover:bg-slate-700 border border-white/10 text-emerald-300 px-2.5 py-1 rounded-lg transition">+ যোগ করুন</button>
        </div>
        <div id="exp-rows" class="space-y-2"></div>
      </div>

      <!-- প্রজেক্ট ও পোর্টফোলিও -->
      <div class="space-y-2 pt-2 border-t border-white/5">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-emerald-400 flex items-center gap-1"><i class="fas fa-laptop-code"></i>প্রজেক্ট / গুরুত্বপূর্ণ কাজ (ঐচ্ছিক)</h3>
          <button onclick="addProject()" class="text-xs bg-slate-800 hover:bg-slate-700 border border-white/10 text-emerald-300 px-2.5 py-1 rounded-lg transition">+ যোগ করুন</button>
        </div>
        <div id="project-rows" class="space-y-2"></div>
      </div>

      <!-- দক্ষতা ও ভাষা -->
      <div class="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
        <div>
          <h3 class="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1"><i class="fas fa-tools"></i>দক্ষতা (Skills - কমা দিয়ে)</h3>
          <input id="f-skills" placeholder="JavaScript, Python, MS Word, ..." class="cv-in w-full text-xs">
        </div>
        <div>
          <h3 class="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1"><i class="fas fa-language"></i>ভাষা (Languages)</h3>
          <input id="f-langs" placeholder="বাংলা (Native), English (Fluent)" class="cv-in w-full text-xs">
        </div>
      </div>

      <!-- ব্যক্তিগত তথ্য / বায়োডাটা -->
      <div class="space-y-2 pt-2 border-t border-white/5">
        <h3 class="text-xs font-bold text-emerald-400 flex items-center gap-1"><i class="fas fa-id-card"></i>ব্যক্তিগত তথ্য ও বায়োডাটা (Personal Bio-data)</h3>
        <div class="grid grid-cols-2 gap-2">
          <input id="f-father" placeholder="পিতার নাম" class="cv-in text-xs">
          <input id="f-mother" placeholder="মাতার নাম" class="cv-in text-xs">
          <input id="f-dob" placeholder="জন্মতারিখ (যেমন: 15-08-2001)" class="cv-in text-xs">
          <input id="f-blood" placeholder="রক্তের গ্রুপ (যেমন: B+)" class="cv-in text-xs">
          <input id="f-religion" placeholder="ধর্ম (যেমন: ইসলাম / হিন্দু)" class="cv-in text-xs">
          <input id="f-marital" placeholder="বৈবাহিক অবস্থা (অবিবাহিত / বিবাহিত)" class="cv-in text-xs">
          <input id="f-nid" placeholder="NID / জন্ম নিবন্ধন নম্বর" class="cv-in text-xs col-span-2">
        </div>
      </div>

      <!-- রেফারেন্স -->
      <div class="space-y-2 pt-2 border-t border-white/5">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-emerald-400 flex items-center gap-1"><i class="fas fa-user-check"></i>রেফারেন্স (References)</h3>
          <button onclick="addRef()" class="text-xs bg-slate-800 hover:bg-slate-700 border border-white/10 text-emerald-300 px-2.5 py-1 rounded-lg transition">+ যোগ করুন</button>
        </div>
        <div id="ref-rows" class="space-y-2"></div>
      </div>

      <!-- সেভ ও লোড বার -->
      <div class="pt-3 border-t border-white/10 space-y-2">
        <div class="flex gap-2">
          <input id="cv-title" placeholder="CV-র নাম (যেমন: জব অ্যাপ্লিকেশন ২০২৩)" class="cv-in flex-1 text-xs">
          <button onclick="saveCV()" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5"><i class="fas fa-save"></i>সেভ করুন</button>
        </div>
        <div id="save-msg" class="text-xs"></div>
        <div id="my-cvs"></div>
      </div>
    </section>

    <!-- ডান পাশ: লাইভ A4 মাল্টি-পেজ প্রিভিউ -->
    <section class="lg:col-span-7">
      <div class="bg-slate-900 border border-white/10 rounded-2xl p-3 sm:p-4 sticky top-20 shadow-2xl">
        <div class="flex items-center justify-between mb-3 pb-3 border-b border-white/10 flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h2 class="font-bold text-sm text-slate-200">লাইভ A4 প্রিভিউ</h2>
            <span id="page-count-badge" class="text-[10px] bg-slate-800 text-emerald-300 px-2.5 py-0.5 rounded-full border border-white/10 font-bold">A4 ফরম্যাট</span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="togglePreviewFit()" id="fitToggleBtn" class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-white/15 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition flex items-center gap-1">
              <i class="fas fa-expand text-[10px] text-teal-400"></i> <span id="fitLabel">স্ক্রিন ফিট</span>
            </button>
            <button onclick="printCV()" class="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-4 py-1.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5">
              <i class="fas fa-print"></i>প্রিন্ট / PDF ডাউনলোড
            </button>
          </div>
        </div>

        <!-- A4 স্ক্রল ভিউয়ার: অতিরিক্ত ভারী ফাঁকা স্পেস হ্রাস করা হলো -->
        <div class="bg-slate-950/70 rounded-xl p-1.5 sm:p-3 overflow-y-auto overflow-x-auto max-h-[78vh] flex justify-center border border-white/5 shadow-inner w-full" id="preview-container">
          <div id="cv-preview" class="w-full max-w-[210mm] bg-white rounded shadow-2xl transition-all duration-200 origin-top"></div>
        </div>

        <div class="flex items-center justify-between text-[11px] text-slate-300 mt-3 pt-2 border-t border-white/5">
          <span>💡 <b>টিপ:</b> প্রিন্ট ডায়ালগে পেপারের সাইজ <b>A4</b> ও মার্জিন <b>None/Default</b> নির্বাচন করুন।</span>
          <span class="text-emerald-400 font-semibold"><i class="fas fa-check-circle mr-1"></i>ATS ও প্রিন্ট রেডি</span>
        </div>
      </div>
    </section>
  </div>

  <style>
    .cv-in {
      background: #0b1329;
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 0.6rem;
      padding: 0.5rem 0.75rem;
      font-size: 0.8rem;
      color: #f8fafc;
      transition: all 0.2s;
    }
    .cv-in::placeholder {
      color: #94a3b8;
    }
    .cv-in:focus {
      outline: none;
      border-color: #10b981;
      box-shadow: 0 0 0 2px rgba(16,185,129,0.25);
    }
    .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
    .scrollbar-thin::-webkit-scrollbar-track { background: #0f172a; }
    .scrollbar-thin::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
  </style>

  <script>
  ${cvHelpersJs}
  ${cvRendererJs}

  var templates = [];
  var curTpl = null;
  var curCvId = 0;
  var customPrimary = null;
  var customAccent = null;
  window._photo = '';

  function togglePreviewFit(){
    var prev = document.getElementById('cv-preview');
    var label = document.getElementById('fitLabel');
    if(!prev) return;
    if(prev.classList.contains('fit-scaled')){
      prev.classList.remove('fit-scaled');
      prev.style.transform = '';
      if(label) label.textContent = 'স্ক্রিন ফিট';
    } else {
      prev.classList.add('fit-scaled');
      var container = document.getElementById('preview-container');
      var cw = container ? container.clientWidth : 794;
      var scale = Math.min(1, Math.max(0.45, (cw - 24) / 794));
      prev.style.transform = 'scale(' + scale + ')';
      if(label) label.textContent = '১০০% ভিউ';
    }
  }

  var PRESETS = {
    fresher: 'স্নাতক সম্পন্নকারী হিসেবে একটি প্রগতিশীল প্রতিষ্ঠানে নিষ্ঠা, সততা ও একাগ্রতার সাথে দায়িত্ব পালন করে নিজের অর্জিত প্রাতিষ্ঠানিক জ্ঞানকে বাস্তব ক্ষেত্রে প্রয়োগ করতে চাই এবং প্রতিষ্ঠানের লক্ষ্য অর্জনে কার্যকর অবদান রাখতে আগ্রহী।',
    fresher_en: 'Motivated and detail-oriented recent graduate seeking an entry-level position to apply academic knowledge, strong communication skills, and work ethic towards organizational growth while developing a successful career.',
    tech: 'দক্ষ ও নিবেদিতপ্রাণ সফটওয়্যার ডেভেলপার; আধুনিক ওয়েব টেকনোলজি, ডেটাবেজ ম্যানেজমেন্ট ও টিম কোলাবোরেশনে অভিজ্ঞ। উদ্ভাবনী ও চ্যালেঞ্জিং প্রজেক্টে কাজ করে ব্যবহারকারী-বান্ধব ডিজিটাল সমাধান তৈরিতে প্রত্যয়ী।',
    tech_en: 'Passionate and result-oriented software developer with hands-on experience in building scalable web applications, RESTful APIs, and problem solving. Seeking to contribute technical expertise to high-impact engineering teams.',
    bank: 'ব্যবসায় প্রশাসন ও ফাইন্যান্স বিষয়ে জ্ঞানসম্পন্ন পেশাদার। ব্যাংকিং অপারেশন, ফাইন্যান্সিয়াল অ্যানালাইসিস এবং কাস্টমার রিলেশনশিপে দক্ষতা প্রয়োগ করে সুনামধন্য প্রতিষ্ঠানে দীর্ঘমেয়াদে ভূমিকা রাখতে চাই।',
    teacher: 'শিক্ষার্থীদের মেধা বিকাশ, সৃজনশীল চিন্তাভাবনা ও নৈতিক শিক্ষায় উৎসাহিত করতে আগ্রহী নিবেদিতপ্রাণ শিক্ষক/শিক্ষিকা। আধুনিক পাঠদান পদ্ধতি ও আন্তরিক পরিবেশ সৃষ্টির মাধ্যমে প্রতিষ্ঠানের সুনাম বৃদ্ধিতে প্রতিশ্রুতিবদ্ধ।',
    bcs: 'বিসিএস ও অন্যান্য সরকারি নিয়োগ পরীক্ষার জন্য নিয়মানুবর্তিতা ও অধ্যবসায়ের সাথে প্রস্তুত একজন দায়িত্বশীল প্রার্থী। দেশের সেবা ও প্রশাসনিক কর্মকাণ্ডে সততার সাথে ভূমিকা পালনে দৃঢ়প্রতিজ্ঞ।'
  };

  function inVal(id){ return (document.getElementById(id)||{}).value||'' }
  
  function rowsData(wrap, keys){
    return Array.prototype.map.call(document.querySelectorAll('#'+wrap+' .row'), function(r){
      var o={};
      keys.forEach(function(k){ o[k] = (r.querySelector('[data-k="'+k+'"]')||{}).value||'' });
      return o;
    }).filter(function(o){ return Object.keys(o).some(function(k){return o[k]}) });
  }

  function collect(){
    return {
      name: inVal('f-name'),
      designation: inVal('f-desig'),
      phone: inVal('f-phone'),
      email: inVal('f-email'),
      address: inVal('f-address'),
      linkedin: inVal('f-linkedin'),
      github: inVal('f-github'),
      objective: inVal('f-objective'),
      summary: inVal('f-objective'),
      father: inVal('f-father'),
      mother: inVal('f-mother'),
      dob: inVal('f-dob'),
      blood_group: inVal('f-blood'),
      religion: inVal('f-religion'),
      marital_status: inVal('f-marital'),
      nid: inVal('f-nid'),
      photo: window._photo || '',
      education: rowsData('edu-rows', ['exam','institute','board','year','result']),
      experience: rowsData('exp-rows', ['title','org','location','period','detail']),
      projects: rowsData('project-rows', ['name','tech','year','description','link']),
      skills: inVal('f-skills').split(',').map(function(s){return s.trim()}).filter(Boolean),
      languages: inVal('f-langs').split(',').map(function(s){return s.trim()}).filter(Boolean),
      references: rowsData('ref-rows', ['name','designation','org','phone','email'])
    };
  }

  function refresh(){
    if(!curTpl) return;
    var withPhoto = document.getElementById('with-photo').checked;
    var lang = document.getElementById('cv-lang').value;
    var pageMode = document.getElementById('cv-page-mode').value;
    var photoShape = document.getElementById('photo-shape').value;
    var fontScale = parseFloat(document.getElementById('font-scale').value) || 1;

    var activeCfg = Object.assign({}, curTpl.config);
    if(customPrimary) activeCfg.primary = customPrimary;
    if(customAccent) activeCfg.accent = customAccent;

    var options = {
      pageMode: pageMode,
      density: pageMode==='1' ? 'compact' : (pageMode==='3' ? 'spacious' : 'normal'),
      scale: fontScale,
      photoShape: photoShape
    };

    var html = renderCV(activeCfg, collect(), withPhoto, lang, curTpl.price===0, options);
    document.getElementById('cv-preview').innerHTML = html;
  }

  document.addEventListener('input', function(e){
    if(e.target.closest('section')) refresh();
  });

  window.setThemeColor = function(primary, accent){
    customPrimary = primary;
    customAccent = accent;
    refresh();
  };

  window.applyPreset = function(k){
    if(k && PRESETS[k]) {
      document.getElementById('f-objective').value = PRESETS[k];
      refresh();
    }
  };

  window.handlePhotoUpload = function(input){
    if(input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function(e){
        window._photo = e.target.result;
        updatePhotoPreview();
        refresh();
      };
      reader.readAsDataURL(input.files[0]);
    }
  };

  window.clearPhoto = function(){
    window._photo = '';
    document.getElementById('photo-file').value = '';
    updatePhotoPreview();
    refresh();
  };

  function updatePhotoPreview(){
    var el = document.getElementById('photo-preview-wrap');
    if(window._photo) {
      el.innerHTML = '<img src="'+window._photo+'" class="w-full h-full object-cover rounded-lg" alt="ছবি">';
    } else {
      el.innerHTML = '<span class="text-[10px] text-slate-400">ছবি নেই</span>';
    }
  }

  // ডাইনামিক রো জেনারেটর
  function rowHtml(wrap, fields){
    var inputs = fields.map(function(f){
      return '<input data-k="'+f[0]+'" placeholder="'+f[1]+'" class="cv-in text-xs" style="flex:'+(f[2]||1)+'">'
    }).join('');
    return '<div class="row flex gap-1.5 items-center bg-slate-800/40 p-1.5 rounded-lg border border-white/5">'+inputs+'<button onclick="this.closest(\\'.row\\').remove();refresh()" class="text-red-400 hover:text-red-300 px-1.5 shrink-0" title="মুছুন"><i class="fas fa-times"></i></button></div>';
  }

  window.addEdu = function(v){
    var d = document.createElement('div');
    d.innerHTML = rowHtml('edu-rows', [
      ['exam','ডিগ্রি/পরীক্ষা *', 1.2],
      ['institute','প্রতিষ্ঠান *', 1.6],
      ['board','বোর্ড/বিশ্ববিদ্যালয়', 1.1],
      ['year','সন', 0.6],
      ['result','ফলাফল', 0.8]
    ]);
    var row = d.firstChild;
    document.getElementById('edu-rows').appendChild(row);
    if(v) Object.keys(v).forEach(function(k){ var el=row.querySelector('[data-k="'+k+'"]'); if(el) el.value=v[k]||'' });
  };

  window.addExp = function(v){
    var d = document.createElement('div');
    d.innerHTML = '<div class="row bg-slate-800/40 p-2 rounded-lg border border-white/5 space-y-1.5">'
      + '<div class="flex gap-1.5 items-center">'
      + '<input data-k="title" placeholder="পদবি (যেমন: অ্যাসিস্ট্যান্ট ম্যানেজার) *" class="cv-in text-xs flex-[1.3]">'
      + '<input data-k="org" placeholder="প্রতিষ্ঠান / কোম্পানি *" class="cv-in text-xs flex-[1.3]">'
      + '<button onclick="this.closest(\\'.row\\').remove();refresh()" class="text-red-400 hover:text-red-300 px-1.5 shrink-0"><i class="fas fa-times"></i></button>'
      + '</div>'
      + '<div class="flex gap-1.5">'
      + '<input data-k="location" placeholder="স্থান (যেমন: ঢাকা)" class="cv-in text-xs flex-1">'
      + '<input data-k="period" placeholder="সময়কাল (যেমন: জানু ২০২১ — বর্তমান)" class="cv-in text-xs flex-1">'
      + '</div>'
      + '<textarea data-k="detail" rows="2" placeholder="দায়িত্ব ও অর্জনসমূহ (প্রতিটি লাইনে বুলেট পয়েন্ট আকারে লিখতে পারেন)" class="cv-in text-xs w-full"></textarea>'
      + '</div>';
    var row = d.firstChild;
    document.getElementById('exp-rows').appendChild(row);
    if(v) Object.keys(v).forEach(function(k){ var el=row.querySelector('[data-k="'+k+'"]'); if(el) el.value=v[k]||'' });
  };

  window.addProject = function(v){
    var d = document.createElement('div');
    d.innerHTML = '<div class="row bg-slate-800/40 p-2 rounded-lg border border-white/5 space-y-1.5">'
      + '<div class="flex gap-1.5 items-center">'
      + '<input data-k="name" placeholder="প্রজেক্টের নাম *" class="cv-in text-xs flex-[1.5]">'
      + '<input data-k="tech" placeholder="ব্যবহৃত টুলস / টেকনোলজি" class="cv-in text-xs flex-1">'
      + '<button onclick="this.closest(\\'.row\\').remove();refresh()" class="text-red-400 hover:text-red-300 px-1.5 shrink-0"><i class="fas fa-times"></i></button>'
      + '</div>'
      + '<div class="flex gap-1.5">'
      + '<input data-k="year" placeholder="সাল / সময়" class="cv-in text-xs flex-1">'
      + '<input data-k="link" placeholder="প্রজেক্ট লিংক (ঐচ্ছিক)" class="cv-in text-xs flex-1">'
      + '</div>'
      + '<textarea data-k="description" rows="1" placeholder="প্রজেক্টের সংক্ষিপ্ত বিবরণ" class="cv-in text-xs w-full"></textarea>'
      + '</div>';
    var row = d.firstChild;
    document.getElementById('project-rows').appendChild(row);
    if(v) Object.keys(v).forEach(function(k){ var el=row.querySelector('[data-k="'+k+'"]'); if(el) el.value=v[k]||'' });
  };

  window.addRef = function(v){
    var d = document.createElement('div');
    d.innerHTML = rowHtml('ref-rows', [
      ['name','নাম *', 1.2],
      ['designation','পদবি', 1.1],
      ['org','প্রতিষ্ঠান', 1.1],
      ['phone','ফোন / মোবাইল', 1]
    ]);
    var row = d.firstChild;
    document.getElementById('ref-rows').appendChild(row);
    if(v) Object.keys(v).forEach(function(k){ var el=row.querySelector('[data-k="'+k+'"]'); if(el) el.value=v[k]||'' });
  };

  window.pickTpl = function(slug){
    curTpl = templates.find(function(t){return t.slug===slug});
    if(!curTpl) curTpl = templates[0];
    customPrimary = null;
    customAccent = null;
    document.querySelectorAll('.tpl-card').forEach(function(el){
      var isCur = el.dataset.slug === slug;
      el.classList.toggle('ring-2', isCur);
      el.classList.toggle('ring-emerald-400', isCur);
      el.classList.toggle('border-emerald-500', isCur);
    });
    refresh();
  };

  window.filterTpl = function(cat){
    document.querySelectorAll('.cat-btn').forEach(function(b){ b.classList.remove('bg-emerald-500','text-slate-950','active'); b.classList.add('bg-slate-800','text-slate-300') });
    event.target.classList.add('bg-emerald-500','text-slate-950','active');
    event.target.classList.remove('bg-slate-800','text-slate-300');

    document.querySelectorAll('.tpl-card').forEach(function(card){
      if(cat === 'all') {
        card.style.display = 'block';
      } else {
        var badge = card.dataset.badge || '';
        card.style.display = badge.toLowerCase().indexOf(cat.toLowerCase()) >= 0 ? 'block' : 'none';
      }
    });
  };

  function loadTemplates(){
    fetch('/api/cv/templates').then(r=>r.json()).then(function(d){
      if(!d.ok) return;
      templates = d.templates;
      document.getElementById('tpl-list').innerHTML = templates.map(function(t){
        var cfg = t.config;
        var badge = cfg.badge || (cfg.layout==='sidebar-left'?'Sidebar':(cfg.headerStyle==='monogram'?'Monogram':'Clean'));
        return '<button data-slug="'+t.slug+'" data-badge="'+esc(badge)+'" onclick="pickTpl(\\''+t.slug+'\\')" class="tpl-card shrink-0 w-36 bg-slate-900 border border-white/10 rounded-xl p-2.5 text-left hover:border-emerald-500/50 transition cursor-pointer">'
          +'<div class="h-16 rounded-lg mb-2 flex items-center justify-center font-bold text-white text-xs relative overflow-hidden shadow" style="background:linear-gradient(135deg,'+cfg.primary+','+cfg.accent+')">'
          +(cfg.headerStyle==='monogram'?'<span class="w-7 h-7 rounded bg-white/20 flex items-center justify-center text-sm font-serif">CV</span>':'<span class="opacity-90">'+esc(badge)+'</span>')
          +'</div>'
          +'<div class="text-[11px] font-bold text-slate-200 truncate">'+esc(t.name_bn)+'</div>'
          +'<div class="flex items-center justify-between mt-1"><span class="text-[10px] text-slate-400">'+esc(badge)+'</span><span class="text-[10px] '+(t.price===0?'text-emerald-400 font-bold':'text-amber-400')+'">'+(t.price===0?'ফ্রি':'৳'+toBn(t.price))+'</span></div></button>';
      }).join('');
      pickTpl(templates[0].slug);
    });
  }

  window.prefill = function(){
    fetch('/api/cv/prefill').then(r=>r.json()).then(function(d){
      if(!d.ok) return;
      var p = d.prefill;
      var map = {'f-name':p.name,'f-phone':p.phone,'f-email':p.email,'f-address':p.address,'f-father':p.father,'f-mother':p.mother,'f-dob':p.dob};
      Object.keys(map).forEach(function(id){ if(map[id]) document.getElementById(id).value = map[id] });
      window._photo = p.photo || '';
      updatePhotoPreview();
      if(p.education && p.education.length){
        document.getElementById('edu-rows').innerHTML = '';
        p.education.forEach(function(e){ addEdu(e) });
      }
      refresh();
      showMsg('✅ প্রোফাইল থেকে তথ্য সফলভাবে আনা হয়েছে','text-emerald-400');
    });
  };

  // ১-ক্লিকে নমুনা ডেমো ডেটা লোড
  window.fillSampleData = function(lang){
    if(lang === 'en') {
      document.getElementById('cv-lang').value = 'en';
      document.getElementById('f-name').value = 'Lowell Granger';
      document.getElementById('f-desig').value = 'Senior Full-Stack Software Engineer';
      document.getElementById('f-phone').value = '+880 1712 345678';
      document.getElementById('f-email').value = 'lowell.granger@example.com';
      document.getElementById('f-address').value = 'Dhanmondi, Dhaka-1209, Bangladesh';
      document.getElementById('f-linkedin').value = 'linkedin.com/in/lowell-granger';
      document.getElementById('f-github').value = 'github.com/lowell-dev';
      document.getElementById('f-objective').value = PRESETS.tech_en;
      document.getElementById('f-skills').value = 'TypeScript, React, Node.js, Next.js, Python, PostgreSQL, Docker, AWS, Tailwind CSS, Git';
      document.getElementById('f-langs').value = 'English (Fluent), Bengali (Native), Hindi (Conversational)';
      document.getElementById('f-father').value = 'Robert Granger';
      document.getElementById('f-mother').value = 'Sarah Granger';
      document.getElementById('f-dob').value = '14-04-1998';
      document.getElementById('f-blood').value = 'A+';
      document.getElementById('f-religion').value = 'Islam';
      document.getElementById('f-marital').value = 'Single';
      document.getElementById('f-nid').value = '19982691234567890';

      document.getElementById('edu-rows').innerHTML = '';
      addEdu({ exam: 'B.Sc. in Computer Science & Engineering', institute: 'University of Dhaka', board: 'Faculty of Engineering', year: '2021', result: 'CGPA 3.86/4.00' });
      addEdu({ exam: 'Higher Secondary Certificate (HSC)', institute: 'Notre Dame College, Dhaka', board: 'Dhaka Board', year: '2016', result: 'GPA 5.00/5.00' });

      document.getElementById('exp-rows').innerHTML = '';
      addExp({ title: 'Senior Software Engineer', org: 'TechMatrix Solutions', location: 'Dhaka', period: '2022 — Present', detail: '• Architected and developed high-throughput cloud microservices serving 200k+ active users.\\n• Mentored junior engineers and implemented automated CI/CD deployment pipelines.' });
      addExp({ title: 'Software Developer', org: 'Innovate Byte', location: 'Dhaka', period: '2021 — 2022', detail: '• Built scalable REST APIs and modern responsive web dashboards using React and TypeScript.' });

      document.getElementById('project-rows').innerHTML = '';
      addProject({ name: 'EduSob E-Learning Platform', tech: 'TypeScript, Hono, React, SQLite', year: '2023', description: 'Comprehensive student portal with question banks, study planners, and CV builder.', link: 'https://edusob.com' });

      document.getElementById('ref-rows').innerHTML = '';
      addRef({ name: 'Dr. Rafiqul Islam', designation: 'Professor & Head of Dept.', org: 'University of Dhaka', phone: '+880 1819 000000' });
    } else {
      document.getElementById('cv-lang').value = 'bn';
      document.getElementById('f-name').value = 'মোঃ আরিফুল ইসলাম';
      document.getElementById('f-desig').value = 'সফটওয়্যার ইঞ্জিনিয়ার ও অনার্স শিক্ষার্থী';
      document.getElementById('f-phone').value = '০১৭১২-৩৪৫৬৭৮';
      document.getElementById('f-email').value = 'ariful.islam@example.com';
      document.getElementById('f-address').value = 'হাউজ ১২, রোড ৫, ধানমন্ডি, ঢাকা';
      document.getElementById('f-linkedin').value = 'linkedin.com/in/ariful-bd';
      document.getElementById('f-github').value = 'github.com/ariful-dev';
      document.getElementById('f-objective').value = PRESETS.tech;
      document.getElementById('f-skills').value = 'JavaScript, TypeScript, React, Node.js, Python, MS Office, ফটোশপ, ডেটাবেজ ম্যানেজমেন্ট';
      document.getElementById('f-langs').value = 'বাংলা (মাতৃভাষা), ইংরেজি (সাবলীল)';
      document.getElementById('f-father').value = 'মোঃ আব্দুল করিম';
      document.getElementById('f-mother').value = 'মোসাঃ রাবেয়া বেগম';
      document.getElementById('f-dob').value = '১৫-০৫-২০০১';
      document.getElementById('f-blood').value = 'B+ (পজিটিভ)';
      document.getElementById('f-religion').value = 'ইসলাম';
      document.getElementById('f-marital').value = 'অবিবাহিত';
      document.getElementById('f-nid').value = '২০০১২৬৯১২৩৪৫৬৭৮৯০';

      document.getElementById('edu-rows').innerHTML = '';
      addEdu({ exam: 'বি.এসসি (অনার্স), সিএসই', institute: 'ঢাকা বিশ্ববিদ্যালয়', board: 'ইঞ্জিনিয়ারিং অনুষদ', year: '২০২৩', result: 'CGPA 3.82' });
      addEdu({ exam: 'এইচএসসি (বিজ্ঞান)', institute: 'ঢাকা কলেজ', board: 'ঢাকা বোর্ড', year: '২০১৮', result: 'GPA 5.00' });
      addEdu({ exam: 'এসএসসি (বিজ্ঞান)', institute: 'ময়মনসিংহ জিলা স্কুল', board: 'ঢাকা বোর্ড', year: '২০১৬', result: 'GPA 5.00' });

      document.getElementById('exp-rows').innerHTML = '';
      addExp({ title: 'জুনিয়র সফটওয়্যার ডেভেলপার', org: 'ডিজিটাল সল্যুশনস বিডি', location: 'ঢাকা', period: '২০২৩ — বর্তমান', detail: '• ওয়েব অ্যাপ্লিকেশন ডেভেলপমেন্ট এবং ক্লায়েন্ট সাইড ইউজার ইন্টারফেস ডিজাইন।\\n• ব্যাকএন্ড এপিআই ইন্টিগ্রেশন এবং ডেটাবেজ অপ্টিমাইজেশন।' });

      document.getElementById('project-rows').innerHTML = '';
      addProject({ name: 'এডুসব স্টুডেন্ট পোর্টাল', tech: 'TypeScript, React, Tailwind CSS', year: '২০২৪', description: 'শিক্ষার্থীদের পরীক্ষা প্রস্তুতি, রেজাল্ট ট্র্যাকিং ও সিভি জেনারেটর।' });

      document.getElementById('ref-rows').innerHTML = '';
      addRef({ name: 'ড. মাহবুবুর রহমান', designation: 'অধ্যাপক', org: 'ঢাকা বিশ্ববিদ্যালয়', phone: '০১৮১২-৩৪৫৬৭৮' });
    }
    refresh();
    showMsg('✨ নমুনা তথ্য সফলভাবে লোড হয়েছে','text-emerald-400');
  };

  function showMsg(t, cls){
    var el = document.getElementById('save-msg');
    el.textContent = t;
    el.className = 'text-xs ' + cls;
    setTimeout(function(){ el.textContent = '' }, 4000);
  }

  window.saveCV = function(){
    var payload = {
      id: curCvId || undefined,
      title: inVal('cv-title') || (inVal('f-name') ? inVal('f-name') + '-এর CV' : 'আমার সিভি'),
      template_slug: curTpl.slug,
      lang: document.getElementById('cv-lang').value,
      with_photo: document.getElementById('with-photo').checked ? 1 : 0,
      data: collect()
    };
    fetch('/api/cv/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r=>r.json()).then(function(d){
      if(d.ok){
        curCvId = d.id;
        showMsg('✅ CV সফলভাবে সংরক্ষিত হয়েছে','text-emerald-400');
        loadMine();
      } else {
        showMsg('❌ ' + (d.error || 'সংরক্ষণে সমস্যা হয়েছে'), 'text-red-400');
      }
    });
  };

  window.loadCV = function(id){
    fetch('/api/cv/mine/' + id).then(r=>r.json()).then(function(d){
      if(!d.ok) return;
      var c = d.cv, v = c.data;
      curCvId = c.id;
      document.getElementById('cv-title').value = c.title || '';
      document.getElementById('cv-lang').value = c.lang || 'bn';
      document.getElementById('with-photo').checked = !!c.with_photo;

      var map = {
        'f-name': v.name, 'f-desig': v.designation, 'f-phone': v.phone,
        'f-email': v.email, 'f-address': v.address, 'f-linkedin': v.linkedin,
        'f-github': v.github, 'f-objective': v.objective || v.summary,
        'f-father': v.father, 'f-mother': v.mother, 'f-dob': v.dob,
        'f-blood': v.blood_group, 'f-religion': v.religion,
        'f-marital': v.marital_status, 'f-nid': v.nid
      };
      Object.keys(map).forEach(function(id2){
        document.getElementById(id2).value = map[id2] || '';
      });

      document.getElementById('f-skills').value = (v.skills || []).map(function(s){return typeof s==='string'?s:s.name}).join(', ');
      document.getElementById('f-langs').value = (v.languages || []).map(function(l){return typeof l==='string'?l:l.name}).join(', ');
      window._photo = v.photo || '';
      updatePhotoPreview();

      document.getElementById('edu-rows').innerHTML = '';
      (v.education || []).forEach(function(e){ addEdu(e) });

      document.getElementById('exp-rows').innerHTML = '';
      (v.experience || []).forEach(function(e){ addExp(e) });

      document.getElementById('project-rows').innerHTML = '';
      (v.projects || []).forEach(function(p){ addProject(p) });

      document.getElementById('ref-rows').innerHTML = '';
      (v.references || []).forEach(function(r){ addRef(r) });

      if(templates.length) pickTpl(c.template_slug);
      showMsg('✅ "' + c.title + '" লোড হয়েছে', 'text-emerald-400');
    });
  };

  window.delCV = function(id){
    if(!confirm('আপনি কি নিশ্চিতভাবে এই CV টি ডিলিট করতে চান?')) return;
    fetch('/api/cv/mine/' + id, { method: 'DELETE' }).then(function(){
      if(curCvId === id) curCvId = 0;
      loadMine();
      showMsg('🗑️ CV ডিলিট করা হয়েছে', 'text-amber-400');
    });
  };

  function loadMine(){
    fetch('/api/cv/mine').then(r=>r.json()).then(function(d){
      if(!d.ok) return;
      var el = document.getElementById('my-cvs');
      if(!d.cvs.length){ el.innerHTML = ''; return; }
      el.innerHTML = '<h3 class="text-xs font-bold text-emerald-400 mb-1.5 mt-3 flex items-center gap-1"><i class="fas fa-folder"></i>সংরক্ষিত CV ('+toBn(d.cvs.length)+'/৫)</h3>'
        + d.cvs.map(function(c){
          return '<div class="flex items-center justify-between bg-slate-800/80 border border-white/5 rounded-xl px-3 py-2 text-xs mb-1.5 hover:border-white/10 transition">'
            +'<span class="truncate font-medium text-slate-200">'+esc(c.title)+' <span class="text-[10px] text-slate-500 font-normal">('+esc(c.template_slug)+')</span></span>'
            +'<span class="shrink-0 flex gap-2"><button onclick="loadCV('+c.id+')" class="text-emerald-400 hover:text-emerald-300 font-semibold">খুলুন</button>'
            +'<button onclick="delCV('+c.id+')" class="text-red-400 hover:text-red-300">ডিলিট</button></span></div>';
        }).join('');
    });
  }

  // প্রিন্ট ও PDF ডাউনলোড হ্যান্ডলার
  window.printCV = function(){
    if(!curTpl) return;
    var withPhoto = document.getElementById('with-photo').checked;
    var lang = document.getElementById('cv-lang').value;
    var pageMode = document.getElementById('cv-page-mode').value;
    var photoShape = document.getElementById('photo-shape').value;
    var fontScale = parseFloat(document.getElementById('font-scale').value) || 1;

    var activeCfg = Object.assign({}, curTpl.config);
    if(customPrimary) activeCfg.primary = customPrimary;
    if(customAccent) activeCfg.accent = customAccent;

    var options = {
      pageMode: pageMode,
      density: pageMode==='1' ? 'compact' : (pageMode==='3' ? 'spacious' : 'normal'),
      scale: fontScale,
      photoShape: photoShape
    };

    var html = renderCV(activeCfg, collect(), withPhoto, lang, curTpl.price===0, options);
    var w = window.open('', '_blank');
    w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>CV - ' + esc(inVal('f-name') || 'EduSob') + '</title>'
      + '<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Tiro+Bangla&display=swap" rel="stylesheet">'
      + '<style>'
      + '@page { size: A4 portrait; margin: 0; }'
      + 'html, body { margin: 0; padding: 0; background: #ffffff; }'
      + '.cv-page-sheet { width: 100% !important; min-height: 297mm !important; box-sizing: border-box !important; }'
      + '@media print {'
      + '  body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }'
      + '  .cv-page-sheet { page-break-after: auto; }'
      + '  table, tr, td, th, .page-avoid-break { break-inside: avoid; page-break-inside: avoid; }'
      + '}'
      + '</style>'
      + '</head><body>'
      + html
      + '<script>'
      + 'window.onload = function(){ setTimeout(function(){ window.print(); }, 500); };'
      + '<\\/script>'
      + '</body></html>');
    w.document.close();
  };

  // স্টার্টআপ
  loadTemplates();
  loadMine();
  addEdu();
  </script>
  `}
</main>`

  return pageShell('প্রফেশনাল CV ও বায়োডাটা মেকার — এডুসব', 'bg-slate-950 text-white min-h-screen', content)
}

// ============ এডমিন CV টেমপ্লেট কাস্টমাইজার ============
export function cvAdminPage(isAdmin: boolean): string {
  const content = `
<header class="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-white/10">
  <nav class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
    <a href="/" class="flex items-center gap-2 font-bold text-xl">
      <span class="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-slate-950 font-black">⚙️</span> এডুসব <span class="text-xs bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30">CV এডমিন</span>
    </a>
    <div class="flex gap-3 text-sm items-center">
      <a href="/admin" class="text-slate-300 hover:text-white transition">মূল এডমিন প্যানেল</a>
      <a href="/cv" class="text-emerald-400 hover:text-emerald-300 font-semibold transition">CV মেকার</a>
      <a href="/dashboard" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl font-bold transition">ড্যাশবোর্ড</a>
    </div>
  </nav>
</header>

<main class="max-w-7xl mx-auto px-4 py-8">
  ${!isAdmin ? `
  <section class="bg-slate-900 border border-red-500/30 rounded-2xl p-10 text-center max-w-lg mx-auto">
    <div class="text-5xl mb-3">⛔</div>
    <h1 class="text-xl font-bold">এডমিন অনুমতি প্রয়োজন</h1>
    <p class="text-slate-400 mt-2 text-sm">এই পেজ শুধুমাত্র সিস্টেম এডমিনদের জন্য।</p>
    <a href="/dashboard" class="inline-block mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-2.5 rounded-xl font-bold transition">ড্যাশবোর্ডে ফিরুন</a>
  </section>
  ` : `
  <header class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <h1 class="text-3xl font-black">🎨 CV টেমপ্লেট কাস্টমাইজার</h1>
      <p class="text-slate-400 mt-1 text-sm">টেমপ্লেটের কালার প্যালেট, ফন্ট, লেআউট, সেকশন-অর্ডার, ব্যাজ ও প্রাইসিং কাস্টমাইজ করুন</p>
    </div>
    <a href="/cv" target="_blank" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2"><i class="fas fa-external-link-alt text-emerald-400"></i>ইউজার CV মেকার দেখুন</a>
  </header>

  <div class="grid lg:grid-cols-12 gap-6">
    <section class="lg:col-span-6 space-y-4 max-h-[85vh] overflow-y-auto pr-2 scrollbar-thin">
      <div id="admin-tpl-list" class="space-y-3"></div>
    </section>

    <section class="lg:col-span-6">
      <div class="bg-slate-900 border border-white/10 rounded-2xl p-4 sticky top-20 shadow-2xl">
        <h2 class="font-bold text-sm text-slate-200 mb-3 flex items-center justify-between">
          <span>লাইভ প্রিভিউ (নমুনা ডেটা)</span>
          <span id="admin-sel-label" class="text-xs text-emerald-400 font-normal"></span>
        </h2>
        <div class="bg-slate-950/80 rounded-xl p-2 sm:p-3 max-h-[75vh] overflow-y-auto overflow-x-auto flex justify-center border border-white/5 w-full">
          <div id="admin-preview" class="w-full max-w-[210mm] bg-white rounded shadow-2xl"></div>
        </div>
      </div>
    </section>
  </div>

  <style>
    .adm-in {
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 0.5rem;
      padding: 0.35rem 0.6rem;
      font-size: 0.75rem;
      color: #f1f5f9;
    }
    .adm-in:focus {
      outline: none;
      border-color: #10b981;
    }
  </style>

  <script>
  ${cvHelpersJs}
  ${cvRendererJs}

  var SAMPLE = {
    name: 'মোঃ আরিফুল ইসলাম',
    designation: 'সিনিয়র সফটওয়্যার ইঞ্জিনিয়ার',
    phone: '০১৭১২-৩৪৫৬৭৮',
    email: 'arif@example.com',
    address: 'ধানমন্ডি, ঢাকা-১২০৯',
    linkedin: 'linkedin.com/in/arif-dev',
    github: 'github.com/arif-dev',
    father: 'মোঃ আব্দুল করিম',
    mother: 'মোসাঃ রাবেয়া বেগম',
    dob: '১৫-০৫-২০০১',
    blood_group: 'B+',
    religion: 'ইসলাম',
    marital_status: 'অবিবাহিত',
    objective: 'একটি স্বনামধন্য প্রতিষ্ঠানে নিষ্ঠা ও দক্ষতার সাথে কাজ করে আধুনিক প্রযুক্তির সাহায্যে ব্যবহারকারী-বান্ধব সফটওয়্যার সমাধান তৈরি করতে চাই।',
    education: [
      { exam: 'বি.এসসি (সিএসই)', institute: 'ঢাকা বিশ্ববিদ্যালয়', board: 'ইঞ্জিনিয়ারিং অনুষদ', year: '২০২১', result: 'CGPA 3.85' },
      { exam: 'এইচএসসি (বিজ্ঞান)', institute: 'ঢাকা কলেজ', board: 'ঢাকা', year: '২০১৬', result: 'GPA 5.00' }
    ],
    experience: [
      { title: 'সিনিয়র ওয়েব ডেভেলপার', org: 'টেক সল্যুশনস বিডি', location: 'ঢাকা', period: '২০২১ — বর্তমান', detail: '• ফুল-স্ট্যাক ওয়েব অ্যাপ্লিকেশন ডিজাইন ও ক্লাউড ডেপ্লয়মেন্ট।\\n• আধুনিক ইউজার ইন্টারফেস এবং রেসপন্সিভ সিস্টেম আর্কিটেকচার তৈরি।' }
    ],
    projects: [
      { name: 'এডুসব পোর্টাল', tech: 'TypeScript, React, SQLite', year: '২০২৩', description: 'শিক্ষার্থীদের জন্য লাইভ স্টুডেন্ট ইউটিলিটি ও পরীক্ষা পোর্টাল।' }
    ],
    skills: ['TypeScript', 'React.js', 'Node.js', 'PostgreSQL', 'Docker', 'Git', 'Tailwind CSS'],
    languages: ['বাংলা (Native)', 'English (Fluent)'],
    references: [
      { name: 'ড. মাহবুবুর রহমান', designation: 'অধ্যাপক', org: 'ঢাকা বিশ্ববিদ্যালয়', phone: '০১৮১২-৩৪৫৬৭৮' }
    ]
  };

  var tpls = [], selSlug = '';
  var SECTIONS = ['objective','experience','education','projects','skills','languages','references','personal','declaration'];
  var SEC_BN = { objective:'লক্ষ্য', experience:'অভিজ্ঞতা', education:'শিক্ষা', projects:'প্রজেক্ট', skills:'দক্ষতা', languages:'ভাষা', references:'রেফারেন্স', personal:'বায়োডাটা', declaration:'ঘোষণা' };

  function tplCard(t){
    var cfg = t.config;
    var orderChips = (cfg.sectionOrder || SECTIONS).map(function(k, i){
      return '<span class="inline-flex items-center gap-1 bg-slate-800 border border-white/10 rounded px-1.5 py-0.5 text-[10px]">'+(SEC_BN[k]||k)
        +'<button onclick="moveSec(\\''+t.slug+'\\','+i+',-1)" class="text-slate-400 hover:text-white cursor-pointer">◀</button>'
        +'<button onclick="moveSec(\\''+t.slug+'\\','+i+',1)" class="text-slate-400 hover:text-white cursor-pointer">▶</button></span>';
    }).join(' ');

    return '<article class="bg-slate-900 border '+(selSlug===t.slug?'border-emerald-500/80 ring-1 ring-emerald-500/50':'border-white/10')+' rounded-2xl p-4 transition" id="card-'+t.slug+'">'
      +'<div class="flex items-center justify-between gap-2 mb-3">'
      +'<button onclick="selTpl(\\''+t.slug+'\\')" class="flex items-center gap-2 font-bold text-sm text-left cursor-pointer">'
      +'<span class="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-white text-xs shadow" style="background:linear-gradient(135deg,'+cfg.primary+','+cfg.accent+')">'+(cfg.headerStyle==='monogram'?'M':'CV')+'</span>'
      +'<span>'+esc(t.name_bn)+'</span>'
      +'</button>'
      +'<label class="flex items-center gap-1.5 text-[11px] cursor-pointer shrink-0"><input type="checkbox" '+(t.is_active?'checked':'')+' onchange="setField(\\''+t.slug+'\\',\\'is_active\\',this.checked?1:0)" class="accent-emerald-500">সক্রিয়</label>'
      +'</div>'
      +'<div class="grid grid-cols-2 gap-2 text-[11px]">'
      +'<label class="flex items-center gap-1.5">মূল কালার: <input type="color" value="'+cfg.primary+'" onchange="setCfg(\\''+t.slug+'\\',\\'primary\\',this.value)" class="w-8 h-6 rounded cursor-pointer bg-transparent"></label>'
      +'<label class="flex items-center gap-1.5">সহ-কালার: <input type="color" value="'+cfg.accent+'" onchange="setCfg(\\''+t.slug+'\\',\\'accent\\',this.value)" class="w-8 h-6 rounded cursor-pointer bg-transparent"></label>'
      +'<label class="flex items-center gap-1">দাম ৳<input type="number" min="0" value="'+t.price+'" onchange="setField(\\''+t.slug+'\\',\\'price\\',parseInt(this.value)||0)" class="adm-in w-16"></label>'
      +'<select onchange="setCfg(\\''+t.slug+'\\',\\'badge\\',this.value)" class="adm-in">'
      +['Monogram','Sidebar Dark','Teal Modern','Executive Band','ATS Clean','BD Standard','Timeline','Tech Stack','Creative'].map(function(b){return '<option '+(cfg.badge===b?'selected':'')+'>'+b+'</option>'}).join('')+'</select>'
      +'<select onchange="setCfg(\\''+t.slug+'\\',\\'layout\\',this.value)" class="adm-in">'
      +[['single','এক-কলাম (Single)'],['sidebar-left','সাইডবার বামে'],['sidebar-dark','সাইডবার ডার্ক'],['sidebar-right','সাইডবার ডানে'],['two-column-equal','দ্বি-কলাম']].map(function(o){return '<option value="'+o[0]+'" '+(cfg.layout===o[0]?'selected':'')+'>'+o[1]+'</option>'}).join('')+'</select>'
      +'<select onchange="setCfg(\\''+t.slug+'\\',\\'headerStyle\\',this.value)" class="adm-in">'
      +[['monogram','মনোগ্রাম (Monogram Badge)'],['band','টপ ব্যান্ড (Band)'],['gradient','গ্রেডিয়েন্ট (Gradient)'],['center','সেন্টার হেডার'],['clean-border','ক্লিন বর্ডার (ATS)'],['modern-left','মডার্ন লেফট']].map(function(o){return '<option value="'+o[0]+'" '+(cfg.headerStyle===o[0]?'selected':'')+'>'+o[1]+'</option>'}).join('')+'</select>'
      +'<select onchange="setCfg(\\''+t.slug+'\\',\\'skillStyle\\',this.value)" class="adm-in">'
      +[['pills','স্কিল: পিল/ব্যাজ (Pills)'],['bars','স্কিল: প্রগ্রেস বার (Bars)'],['dots','স্কিল: রেটিং ডট (Dots)'],['clean-list','স্কিল: ক্লিন লিস্ট']].map(function(o){return '<option value="'+o[0]+'" '+(cfg.skillStyle===o[0]?'selected':'')+'>'+o[1]+'</option>'}).join('')+'</select>'
      +'<select onchange="setCfg(\\''+t.slug+'\\',\\'contactPos\\',this.value)" class="adm-in">'
      +[['below','যোগাযোগ: নামের নিচে'],['beside','যোগাযোগ: ডানে'],['sidebar','যোগাযোগ: সাইডবারে']].map(function(o){return '<option value="'+o[0]+'" '+(cfg.contactPos===o[0]?'selected':'')+'>'+o[1]+'</option>'}).join('')+'</select>'
      +'</div>'
      +'<div class="mt-2"><div class="text-[10px] text-slate-400 mb-1">সেকশন ক্রম (◀▶ বাটনে পরিবর্তন করুন):</div><div class="flex flex-wrap gap-1">'+orderChips+'</div></div>'
      +'<div class="mt-3 flex items-center justify-between">'
      +'<span id="msg-'+t.slug+'" class="text-[11px]"></span>'
      +'<button onclick="saveTpl(\\''+t.slug+'\\')" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"><i class="fas fa-save mr-1"></i>সেভ করুন</button></div>'
      +'</article>';
  }

  function renderList(){ document.getElementById('admin-tpl-list').innerHTML = tpls.map(tplCard).join('') }
  function find(slug){ return tpls.find(function(t){return t.slug===slug}) }
  
  window.selTpl = function(slug){
    selSlug = slug;
    renderList();
    preview();
  };

  function preview(){
    var t = find(selSlug);
    if(!t) return;
    document.getElementById('admin-sel-label').textContent = t.name_bn + ' (' + t.slug + ')';
    document.getElementById('admin-preview').innerHTML = renderCV(t.config, SAMPLE, true, 'bn', t.price===0, { pageMode: 'auto' });
  }

  window.setCfg = function(slug, k, v){
    var t = find(slug);
    t.config[k] = v;
    if(slug !== selSlug){ selSlug = slug; renderList(); }
    preview();
  };

  window.setField = function(slug, k, v){
    var t = find(slug);
    t[k] = v;
    if(slug === selSlug) preview();
  };

  window.moveSec = function(slug, i, dir){
    var t = find(slug), arr = t.config.sectionOrder || SECTIONS.slice();
    var j = i + dir;
    if(j < 0 || j >= arr.length) return;
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    t.config.sectionOrder = arr;
    selSlug = slug;
    renderList();
    preview();
  };

  window.saveTpl = function(slug){
    var t = find(slug);
    fetch('/api/cv/admin/templates/' + slug, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config: t.config, price: t.price, is_active: t.is_active, name_bn: t.name_bn })
    }).then(r=>r.json()).then(function(d){
      var el = document.getElementById('msg-' + slug);
      el.textContent = d.ok ? '✅ সেভ হয়েছে' : '❌ ' + (d.error || 'সমস্যা');
      el.className = 'text-[11px] ' + (d.ok ? 'text-emerald-400 font-bold' : 'text-red-400');
      setTimeout(function(){ el.textContent = '' }, 3000);
    });
  };

  fetch('/api/cv/admin/templates').then(r=>r.json()).then(function(d){
    if(!d.ok) return;
    tpls = d.templates;
    selSlug = tpls[0].slug;
    renderList();
    preview();
  });
  </script>
  `}
</main>`

  return pageShell('CV টেমপ্লেট কাস্টমাইজার — এডুসব এডমিন', 'bg-slate-950 text-white min-h-screen', content)
}
