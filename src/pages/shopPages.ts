// এডুসব ফেজ-৫ — শপ, ওয়ালেট (টপ-আপ), অ্যাসিস্টেড আবেদন পেজ
import { pageShell, DARK_PORTAL_CSS } from './layout'

function shopHeader(active: string, loggedIn: boolean): string {
  const link = (href: string, label: string, key: string) =>
    `<a href="${href}" class="${active === key ? 'text-amber-600 font-bold' : 'text-slate-600 hover:text-slate-900'} transition">${label}</a>`
  return `
<header class="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm shop-header">
  <nav class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
    <a href="/" class="flex items-center gap-2 font-bold text-xl shrink-0 text-slate-800">
      <span class="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">🛒</span> এডুসব শপ
    </a>
    <div class="hidden md:flex items-center gap-5 text-sm">
      ${link('/shop', 'শপ', 'shop')}
      ${link('/wallet', 'ওয়ালেট', 'wallet')}
      ${link('/assisted', 'অ্যাসিস্টেড আবেদন', 'assisted')}
      ${link('/', 'হোম', 'home')}
    </div>
    <div class="flex items-center gap-2 text-sm shrink-0">
      ${loggedIn
        ? `<a href="/dashboard" class="bg-amber-500 hover:bg-amber-400 text-white px-4 py-2 rounded-xl font-semibold transition">ড্যাশবোর্ড</a>`
        : `<a href="/login" class="px-3 py-2 text-slate-600 hover:text-slate-900 transition">লগইন</a>
           <a href="/signup" class="bg-amber-500 hover:bg-amber-400 text-white px-4 py-2 rounded-xl font-semibold transition">ফ্রি সাইন-আপ</a>`}
    </div>
  </nav>
  <div class="md:hidden flex gap-4 px-4 pb-2 text-xs overflow-x-auto">
    ${link('/shop', 'শপ', 'shop')} ${link('/wallet', 'ওয়ালেট', 'wallet')} ${link('/assisted', 'অ্যাসিস্টেড', 'assisted')} ${link('/', 'হোম', 'home')}
  </div>
</header>`
}

const shopHelpersJs = `
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function toBn(n){var d={'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};return String(n).replace(/[0-9]/g,function(x){return d[x]})}
function tk(n){return '৳'+toBn(Number(n).toLocaleString('en-US'))}
function toastMsg(m,ok){var t=document.createElement('div');t.className='fixed top-4 left-1/2 -translate-x-1/2 z-[70] px-5 py-3 rounded-xl text-white font-semibold shadow-2xl '+(ok?'bg-emerald-600':'bg-red-600');t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove()},3500)}
`

// ============ শপ পেজ (গেস্ট ব্রাউজ + কার্ট + চেকআউট) ============
export function shopPage(loggedIn: boolean): string {
  const content = `
${shopHeader('shop', loggedIn)}
<main class="max-w-6xl mx-auto px-4 py-8">
  <section id="shop-hero" class="mb-6">
    <h1 class="text-2xl md:text-3xl font-bold text-slate-800">🛍️ এডুসব শপ</h1>
    <p class="text-slate-500 text-sm mt-1">বই, স্টেশনারি, ইলেকট্রনিক্স — ক্যাশ অন ডেলিভারি অথবা ওয়ালেটে পেমেন্ট</p>
  </section>

  <nav id="cat-tabs" class="flex gap-2 overflow-x-auto pb-2 mb-5 text-sm"></nav>

  <section id="product-grid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"></section>
  <p id="shop-empty" class="hidden text-center text-slate-400 py-16">এই ক্যাটাগরিতে কোনো প্রোডাক্ট নেই</p>
</main>

<!-- কার্ট ফ্লোটিং বাটন -->
<button id="cart-btn" onclick="openCart()" class="hidden fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-full shadow-2xl font-semibold text-sm flex items-center gap-2 hover:scale-105 transition">
  <i class="fas fa-shopping-basket"></i> কার্ট <span id="cart-count" class="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full"></span>
</button>

<!-- কার্ট/চেকআউট ড্রয়ার -->
<div id="cart-modal" class="hidden fixed inset-0 z-[60] bg-black/50" onclick="if(event.target===this)closeCart()">
  <aside class="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
    <header class="px-5 py-4 border-b flex items-center justify-between">
      <p class="font-bold text-lg">🧺 আপনার কার্ট</p>
      <button onclick="closeCart()" class="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
    </header>
    <div id="cart-items" class="flex-1 overflow-y-auto px-5 py-4 space-y-3"></div>
    <footer class="border-t px-5 py-4 space-y-3">
      <div class="flex justify-between text-sm"><span>সাবটোটাল</span><b id="cart-subtotal"></b></div>
      <div id="cod-charge-row" class="flex justify-between text-sm text-slate-500"><span>ডেলিভারি চার্জ (COD)</span><span id="cod-charge"></span></div>
      <div class="flex justify-between font-bold text-lg"><span>মোট</span><span id="cart-total" class="text-amber-600"></span></div>
      <button onclick="showCheckout()" class="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition">চেকআউট করুন →</button>
    </footer>
  </aside>
</div>

<!-- চেকআউট মডাল -->
<div id="checkout-modal" class="hidden fixed inset-0 z-[65] bg-black/60 flex items-center justify-center p-4 overflow-y-auto" onclick="if(event.target===this)closeCheckout()">
  <form id="checkout-form" onsubmit="return submitOrder(event)" class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 my-8">
    <div class="flex items-center justify-between">
      <h2 class="font-bold text-lg">📦 ডেলিভারি তথ্য</h2>
      <button type="button" onclick="closeCheckout()" class="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
    </div>
    <div>
      <label class="text-sm font-semibold text-slate-600">নাম *</label>
      <input id="co-name" required maxlength="100" class="w-full mt-1 border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none" placeholder="আপনার পুরো নাম">
    </div>
    <div>
      <label class="text-sm font-semibold text-slate-600">মোবাইল নম্বর *</label>
      <input id="co-phone" required maxlength="11" class="w-full mt-1 border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none" placeholder="01XXXXXXXXX">
    </div>
    <div>
      <label class="text-sm font-semibold text-slate-600">সম্পূর্ণ ঠিকানা *</label>
      <textarea id="co-address" required maxlength="500" rows="2" class="w-full mt-1 border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none" placeholder="বাসা/হোল্ডিং, রোড, থানা, জেলা"></textarea>
    </div>
    <div>
      <label class="text-sm font-semibold text-slate-600">নোট (ঐচ্ছিক)</label>
      <input id="co-note" maxlength="300" class="w-full mt-1 border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-400 outline-none" placeholder="বিশেষ নির্দেশনা থাকলে">
    </div>
    <div>
      <label class="text-sm font-semibold text-slate-600">পেমেন্ট মাধ্যম</label>
      <div class="grid grid-cols-2 gap-2 mt-1">
        <label class="border rounded-xl px-3 py-2.5 flex items-center gap-2 cursor-pointer has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50">
          <input type="radio" name="paymethod" value="cod" checked onchange="updateTotals()"> <span class="text-sm font-semibold">🚚 ক্যাশ অন ডেলিভারি</span>
        </label>
        <label id="wallet-option" class="border rounded-xl px-3 py-2.5 flex items-center gap-2 cursor-pointer has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50">
          <input type="radio" name="paymethod" value="wallet" onchange="updateTotals()"> <span class="text-sm font-semibold">💰 ওয়ালেট <span id="wallet-bal" class="text-xs text-slate-400"></span></span>
        </label>
      </div>
      <p id="wallet-login-hint" class="hidden text-xs text-red-500 mt-1">ওয়ালেট পেমেন্টের জন্য <a href="/login" class="underline">লগইন</a> করুন</p>
    </div>
    <div class="flex justify-between font-bold text-lg border-t pt-3"><span>মোট</span><span id="co-total" class="text-amber-600"></span></div>
    <button id="co-submit" class="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition">অর্ডার নিশ্চিত করুন ✓</button>
  </form>
</div>

<!-- সফল অর্ডার -->
<div id="success-modal" class="hidden fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4">
  <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center space-y-3">
    <p class="text-5xl">🎉</p>
    <h2 class="font-bold text-xl">অর্ডার সফল!</h2>
    <p class="text-slate-600 text-sm">অর্ডার নম্বর: <b id="success-oid" class="text-amber-600"></b></p>
    <p id="success-msg" class="text-slate-500 text-sm"></p>
    <button onclick="document.getElementById('success-modal').classList.add('hidden')" class="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-semibold">ঠিক আছে</button>
  </div>
</div>

<script>
${shopHelpersJs}
var PRODUCTS=[],CART=JSON.parse(localStorage.getItem('edusob_cart')||'[]'),COD_CHARGE=0,LOGGED_IN=${loggedIn ? 'true' : 'false'},WALLET_BAL=0,CURCAT='';
var CATS=[['','সব'],['books','📚 বই'],['stationery','✏️ স্টেশনারি'],['electronics','🔌 ইলেকট্রনিক্স'],['package','🎁 প্যাকেজ'],['other','অন্যান্য']];

function saveCart(){localStorage.setItem('edusob_cart',JSON.stringify(CART));renderCartBtn()}
function cartQty(){return CART.reduce(function(a,c){return a+c.qty},0)}
function renderCartBtn(){
  var b=document.getElementById('cart-btn'),n=cartQty();
  if(n>0){b.classList.remove('hidden');document.getElementById('cart-count').textContent=toBn(n)}else b.classList.add('hidden')
}
function renderTabs(){
  document.getElementById('cat-tabs').innerHTML=CATS.map(function(c){
    return '<button onclick="setCat(\\''+c[0]+'\\')" class="shrink-0 px-4 py-2 rounded-full border '+(CURCAT===c[0]?'bg-amber-500 text-white border-amber-500 font-bold':'bg-white text-slate-600 hover:border-amber-400')+'">'+c[1]+'</button>'
  }).join('')
}
function setCat(c){CURCAT=c;renderTabs();renderProducts()}
function renderProducts(){
  var list=CURCAT?PRODUCTS.filter(function(p){return p.category===CURCAT}):PRODUCTS;
  document.getElementById('shop-empty').classList.toggle('hidden',list.length>0);
  document.getElementById('product-grid').innerHTML=list.map(function(p){
    var out=p.stock<=0;
    var offer=p.offer_price?'<span class="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full rotate-[-4deg]">অফার!</span>':'';
    var price=p.offer_price?'<span class="line-through text-slate-400 text-xs mr-1">'+tk(p.price)+'</span><span class="text-red-600 font-bold">'+tk(p.offer_price)+'</span>':'<span class="font-bold text-slate-800">'+tk(p.price)+'</span>';
    var img=(p.image_url||'').indexOf('http')===0?'<img src="'+esc(p.image_url)+'" class="h-24 object-contain mx-auto" alt="'+esc(p.name_bn)+'">':'<span class="text-6xl">'+esc(p.image_url||'📦')+'</span>';
    return '<article class="relative bg-white rounded-2xl border border-slate-200 p-4 flex flex-col card-hover">'+offer+
      '<div class="h-24 flex items-center justify-center mb-3">'+img+'</div>'+
      '<h3 class="text-sm font-semibold text-slate-800 leading-snug flex-1">'+esc(p.name_bn)+'</h3>'+
      (p.description?'<p class="text-xs text-slate-400 mt-1 line-clamp-2">'+esc(p.description)+'</p>':'')+
      '<div class="mt-2 text-sm">'+price+'</div>'+
      '<p class="text-[11px] '+(out?'text-red-500':'text-slate-400')+' mt-0.5">'+(out?'স্টক শেষ':'স্টকে '+toBn(p.stock)+'টি')+'</p>'+
      '<button '+(out?'disabled':'')+' onclick="addCart('+p.id+')" class="mt-3 w-full '+(out?'bg-slate-200 text-slate-400 cursor-not-allowed':'bg-amber-500 hover:bg-amber-400 text-white')+' text-sm font-bold py-2 rounded-xl transition">'+(out?'অনুপলব্ধ':'🛒 কার্টে যোগ')+'</button></article>'
  }).join('')
}
function addCart(id){
  var p=PRODUCTS.find(function(x){return x.id===id});if(!p)return;
  var it=CART.find(function(x){return x.product_id===id});
  var have=it?it.qty:0;
  if(have+1>p.stock){toastMsg('স্টকের বেশি নেওয়া যাবে না',false);return}
  if(it)it.qty++;else CART.push({product_id:id,qty:1});
  saveCart();toastMsg('"'+p.name_bn+'" কার্টে যোগ হলো',true)
}
function chQty(id,d){
  var it=CART.find(function(x){return x.product_id===id});if(!it)return;
  var p=PRODUCTS.find(function(x){return x.id===id});
  it.qty+=d;
  if(it.qty<=0)CART=CART.filter(function(x){return x.product_id!==id});
  if(p&&it.qty>p.stock)it.qty=p.stock;
  saveCart();renderCart()
}
function cartLines(){
  return CART.map(function(c){
    var p=PRODUCTS.find(function(x){return x.id===c.product_id});
    if(!p)return null;
    return {p:p,qty:c.qty,unit:p.offer_price||p.price}
  }).filter(Boolean)
}
function renderCart(){
  var lines=cartLines(),sub=lines.reduce(function(a,l){return a+l.unit*l.qty},0);
  document.getElementById('cart-items').innerHTML=lines.length?lines.map(function(l){
    return '<div class="flex items-center gap-3 bg-slate-50 rounded-xl p-3">'+
      '<span class="text-2xl">'+((l.p.image_url||'').indexOf('http')===0?'📦':esc(l.p.image_url||'📦'))+'</span>'+
      '<div class="flex-1 min-w-0"><p class="text-sm font-semibold truncate">'+esc(l.p.name_bn)+'</p><p class="text-xs text-slate-500">'+tk(l.unit)+' × '+toBn(l.qty)+'</p></div>'+
      '<div class="flex items-center gap-1.5"><button onclick="chQty('+l.p.id+',-1)" class="w-7 h-7 bg-white border rounded-lg font-bold">−</button><b class="w-5 text-center text-sm">'+toBn(l.qty)+'</b><button onclick="chQty('+l.p.id+',1)" class="w-7 h-7 bg-white border rounded-lg font-bold">+</button></div></div>'
  }).join(''):'<p class="text-center text-slate-400 py-10">কার্ট খালি 🧺</p>';
  document.getElementById('cart-subtotal').textContent=tk(sub);
  document.getElementById('cod-charge').textContent=COD_CHARGE?tk(COD_CHARGE):'ফ্রি';
  document.getElementById('cart-total').textContent=tk(sub+COD_CHARGE);
  return sub
}
function openCart(){renderCart();document.getElementById('cart-modal').classList.remove('hidden')}
function closeCart(){document.getElementById('cart-modal').classList.add('hidden')}
function showCheckout(){
  if(!cartLines().length){toastMsg('কার্ট খালি',false);return}
  closeCart();
  document.getElementById('checkout-modal').classList.remove('hidden');
  if(!LOGGED_IN){
    document.querySelector('#wallet-option input').disabled=true;
    document.getElementById('wallet-login-hint').classList.remove('hidden');
  }
  updateTotals()
}
function closeCheckout(){document.getElementById('checkout-modal').classList.add('hidden')}
function payMethod(){var r=document.querySelector('input[name=paymethod]:checked');return r?r.value:'cod'}
function updateTotals(){
  var sub=cartLines().reduce(function(a,l){return a+l.unit*l.qty},0);
  var total=sub+(payMethod()==='cod'?COD_CHARGE:0);
  document.getElementById('co-total').textContent=tk(total)
}
function submitOrder(e){
  e.preventDefault();
  var btn=document.getElementById('co-submit');btn.disabled=true;btn.textContent='অর্ডার হচ্ছে...';
  axios.post('/api/shop/orders',{
    customer_name:document.getElementById('co-name').value.trim(),
    customer_phone:document.getElementById('co-phone').value.trim(),
    address:document.getElementById('co-address').value.trim(),
    note:document.getElementById('co-note').value.trim(),
    payment_method:payMethod(),
    items:CART
  }).then(function(r){
    var d=r.data;
    CART=[];saveCart();closeCheckout();
    document.getElementById('success-oid').textContent='#'+toBn(d.order_id);
    document.getElementById('success-msg').textContent=d.status==='confirmed'?'ওয়ালেট থেকে '+tk(d.total)+' কেটে অর্ডার কনফার্ম হয়েছে ✓':'মোট '+tk(d.total)+' — ডেলিভারির সময় পরিশোধ করবেন। শীঘ্রই যোগাযোগ করা হবে।';
    document.getElementById('success-modal').classList.remove('hidden');
    loadProducts()
  }).catch(function(err){
    toastMsg((err.response&&err.response.data&&err.response.data.error)||'অর্ডার ব্যর্থ',false)
  }).finally(function(){btn.disabled=false;btn.textContent='অর্ডার নিশ্চিত করুন ✓'});
  return false
}
function loadProducts(){
  axios.get('/api/shop/products').then(function(r){
    if (r.data && r.data.shop_enabled === false) {
      var hero = document.getElementById('shop-hero');
      if (hero) hero.innerHTML = '<div class="bg-amber-50 border border-amber-300 rounded-3xl p-8 text-center max-w-xl mx-auto space-y-4 my-8 shadow-sm"><div class="text-5xl">🛍️</div><h2 class="text-xl font-extrabold text-amber-900">এডুসব শপ বর্তমানে সাময়িকভাবে বন্ধ আছে</h2><p class="text-sm text-slate-600 leading-relaxed">আমাদের টিম সার্ভিস আপগ্রেড করছে। খুব শীঘ্রই নতুন বই ও প্রোডাক্টসহ শপ পুনরায় উন্মুক্ত করা হবে।</p><div class="pt-2"><a href="/dashboard" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow">← ড্যাশবোর্ডে ফিরে যান</a></div></div>';
      var tabs = document.getElementById('cat-tabs'); if (tabs) tabs.classList.add('hidden');
      var grid = document.getElementById('product-grid'); if (grid) grid.classList.add('hidden');
      var cartBtn = document.getElementById('cart-btn'); if (cartBtn) cartBtn.classList.add('hidden');
      return;
    }
    PRODUCTS=r.data.products||[];renderProducts();renderCartBtn()
  })
}
axios.get('/api/shop/settings').then(function(r){COD_CHARGE=Number(r.data.settings.cod_charge)||0});
if(LOGGED_IN)axios.get('/api/wallet').then(function(r){WALLET_BAL=r.data.balance||0;document.getElementById('wallet-bal').textContent='(ব্যালেন্স '+tk(WALLET_BAL)+')'}).catch(function(){});
renderTabs();loadProducts();
</script>`
  return pageShell('শপ', 'bg-slate-50 min-h-screen text-slate-900', content, DARK_PORTAL_CSS)
}

// ============ ওয়ালেট পেজ (ব্যালেন্স + টপ-আপ + লেনদেন) ============
export function walletPage(loggedIn: boolean): string {
  const content = `
${shopHeader('wallet', loggedIn)}
<main class="max-w-3xl mx-auto px-4 py-8 space-y-6">
  <div id="pay-banner" class="hidden rounded-2xl px-5 py-4 text-sm font-bold"></div>
  <section id="wallet-balance-card" class="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-6 shadow-xl">
    <p class="text-emerald-100 text-sm">আপনার ওয়ালেট ব্যালেন্স</p>
    <p id="w-balance" class="text-4xl font-bold mt-1">—</p>
    <p class="text-emerald-100 text-xs mt-2">💡 বিকাশ/নগদে টাকা পাঠিয়ে নিচের ফর্মে জমা দিন — এডমিন অ্যাপ্রুভ করলেই ব্যালেন্স যোগ হবে</p>
  </section>

  <section id="auto-topup-section" class="hidden bg-gradient-to-br from-pink-600 to-rose-600 text-white rounded-2xl p-6 shadow-xl">
    <h2 class="font-bold text-lg mb-1">⚡ বিকাশ অটো টপ-আপ</h2>
    <p class="text-pink-100 text-xs mb-4">বিকাশে পেমেন্ট সম্পন্ন হলেই সাথে সাথে ব্যালেন্স যোগ হবে — কোনো অপেক্ষা নেই</p>
    <div class="flex gap-3">
      <input id="auto-amount" type="number" min="10" max="50000" placeholder="পরিমাণ (৳)" class="flex-1 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none">
      <button id="auto-pay-btn" onclick="startAutoTopup()" class="bg-white text-pink-600 font-extrabold px-6 py-3 rounded-xl hover:bg-pink-50 transition">বিকাশে পে করুন</button>
    </div>
  </section>

  <section id="topup-section" class="bg-white rounded-2xl border border-slate-200 p-6">
    <h2 class="font-bold text-lg mb-1">💳 টাকা যোগ করুন (ম্যানুয়াল টপ-আপ)</h2>
    <div id="pay-numbers" class="grid grid-cols-2 gap-3 my-4">
      <div class="bg-pink-50 border border-pink-200 rounded-xl p-3 text-center">
        <p class="text-xs text-pink-500 font-semibold">বিকাশ (পার্সোনাল)</p>
        <p id="bkash-num" class="font-bold text-slate-800 mt-0.5">শীঘ্রই যুক্ত হবে</p>
      </div>
      <div class="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
        <p class="text-xs text-orange-500 font-semibold">নগদ (পার্সোনাল)</p>
        <p id="nagad-num" class="font-bold text-slate-800 mt-0.5">শীঘ্রই যুক্ত হবে</p>
      </div>
    </div>
    <form id="topup-form" onsubmit="return submitTopup(event)" class="space-y-3">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-sm font-semibold text-slate-600">মাধ্যম *</label>
          <select id="tp-method" class="w-full mt-1 border rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-400">
            <option value="bkash">বিকাশ</option><option value="nagad">নগদ</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-semibold text-slate-600">পরিমাণ (টাকা) *</label>
          <input id="tp-amount" type="number" min="10" max="50000" required class="w-full mt-1 border rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-400" placeholder="৫০০">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-sm font-semibold text-slate-600">যে নম্বর থেকে পাঠিয়েছেন *</label>
          <input id="tp-sender" required maxlength="11" class="w-full mt-1 border rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-400" placeholder="01XXXXXXXXX">
        </div>
        <div>
          <label class="text-sm font-semibold text-slate-600">ট্রানজেকশন আইডি (TrxID) *</label>
          <input id="tp-trx" required maxlength="40" class="w-full mt-1 border rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-400" placeholder="9AB7XXXX">
        </div>
      </div>
      <div>
        <label class="text-sm font-semibold text-slate-600">স্ক্রিনশট (ঐচ্ছিক)</label>
        <input id="tp-ss" type="file" accept="image/*" class="w-full mt-1 text-sm text-slate-500 file:mr-3 file:px-4 file:py-2 file:rounded-xl file:border-0 file:bg-emerald-100 file:text-emerald-700 file:font-semibold">
      </div>
      <button id="tp-submit" class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition">জমা দিন ✓</button>
    </form>
  </section>

  <section id="topup-history" class="bg-white rounded-2xl border border-slate-200 p-6">
    <h2 class="font-bold text-lg mb-3">📨 আমার টপ-আপ রিকোয়েস্ট</h2>
    <div id="tp-list" class="space-y-2 text-sm"></div>
  </section>

  <section id="tx-history" class="bg-white rounded-2xl border border-slate-200 p-6">
    <h2 class="font-bold text-lg mb-3">📊 লেনদেন ইতিহাস</h2>
    <div id="tx-list" class="space-y-2 text-sm"></div>
  </section>

  <section id="order-history" class="bg-white rounded-2xl border border-slate-200 p-6">
    <h2 class="font-bold text-lg mb-3">📦 আমার অর্ডার</h2>
    <div id="order-list" class="space-y-2 text-sm"></div>
  </section>
</main>

<script>
${shopHelpersJs}
var SS_DATA=null;
var ST_BN={pending:'⏳ পেন্ডিং',approved:'✅ অ্যাপ্রুভড',rejected:'❌ বাতিল',confirmed:'✅ কনফার্মড',shipped:'🚚 পাঠানো হয়েছে',delivered:'📬 ডেলিভারড',cancelled:'❌ বাতিল'};
var TX_BN={manual_topup:'💳 টপ-আপ',gateway_topup:'⚡ অটো টপ-আপ',purchase:'🛒 কেনাকাটা',refund:'↩️ রিফান্ড',referral:'🎁 রেফারেল'};

document.getElementById('tp-ss').addEventListener('change',function(e){
  var f=e.target.files[0];if(!f)return;
  var img=new Image(),rd=new FileReader();
  rd.onload=function(){img.onload=function(){
    var cv=document.createElement('canvas'),mx=800,sc=Math.min(1,mx/Math.max(img.width,img.height));
    cv.width=img.width*sc;cv.height=img.height*sc;
    cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
    SS_DATA=cv.toDataURL('image/jpeg',0.6);
  };img.src=rd.result};
  rd.readAsDataURL(f);
});

function submitTopup(e){
  e.preventDefault();
  var btn=document.getElementById('tp-submit');btn.disabled=true;btn.textContent='জমা হচ্ছে...';
  axios.post('/api/shop/payments',{
    method:document.getElementById('tp-method').value,
    amount:Number(document.getElementById('tp-amount').value),
    sender_number:document.getElementById('tp-sender').value.trim(),
    trx_id:document.getElementById('tp-trx').value.trim(),
    screenshot_data:SS_DATA
  }).then(function(){
    toastMsg('টপ-আপ রিকোয়েস্ট জমা হয়েছে — এডমিন যাচাই করে অ্যাপ্রুভ করবেন',true);
    document.getElementById('topup-form').reset();SS_DATA=null;loadAll()
  }).catch(function(err){
    toastMsg((err.response&&err.response.data&&err.response.data.error)||'ব্যর্থ হয়েছে',false)
  }).finally(function(){btn.disabled=false;btn.textContent='জমা দিন ✓'});
  return false
}

function loadAll(){
  axios.get('/api/wallet').then(function(r){
    document.getElementById('w-balance').textContent=tk(r.data.balance||0);
    var tx=r.data.transactions||[];
    document.getElementById('tx-list').innerHTML=tx.length?tx.map(function(t){
      return '<div class="flex justify-between items-center bg-slate-50 rounded-xl px-4 py-2.5"><span>'+(TX_BN[t.type]||t.type)+(t.note?' <span class="text-slate-400 text-xs">— '+esc(t.note)+'</span>':'')+'</span><b class="'+(t.amount>=0?'text-emerald-600':'text-red-500')+'">'+(t.amount>=0?'+':'')+tk(Math.abs(t.amount))+'</b></div>'
    }).join(''):'<p class="text-slate-400 text-center py-4">কোনো লেনদেন নেই</p>'
  });
  axios.get('/api/shop/payments/mine').then(function(r){
    var ps=r.data.payments||[];
    document.getElementById('tp-list').innerHTML=ps.length?ps.map(function(p){
      return '<div class="flex justify-between items-center bg-slate-50 rounded-xl px-4 py-2.5"><span>'+(p.method==='bkash'?'বিকাশ':'নগদ')+' — '+tk(p.amount)+' <span class="text-slate-400 text-xs">TrxID: '+esc(p.trx_id)+'</span>'+(p.admin_note?'<span class="block text-xs text-red-400">'+esc(p.admin_note)+'</span>':'')+'</span><span class="text-xs font-semibold shrink-0">'+(ST_BN[p.status]||p.status)+'</span></div>'
    }).join(''):'<p class="text-slate-400 text-center py-4">কোনো রিকোয়েস্ট নেই</p>'
  });
  axios.get('/api/shop/orders/mine').then(function(r){
    var os=r.data.orders||[];
    document.getElementById('order-list').innerHTML=os.length?os.map(function(o){
      var items=(o.items||[]).map(function(i){return esc(i.product_name)+' ×'+toBn(i.qty)}).join(', ');
      return '<div class="bg-slate-50 rounded-xl px-4 py-2.5"><div class="flex justify-between"><b>অর্ডার #'+toBn(o.id)+'</b><span class="text-xs font-semibold">'+(ST_BN[o.status]||o.status)+'</span></div><p class="text-xs text-slate-500 mt-0.5">'+items+'</p><p class="text-xs mt-0.5">'+(o.payment_method==='wallet'?'💰 ওয়ালেট':'🚚 COD')+' — মোট <b>'+tk(o.total)+'</b></p></div>'
    }).join(''):'<p class="text-slate-400 text-center py-4">কোনো অর্ডার নেই</p>'
  });
}
axios.get('/api/shop/settings').then(function(r){
  var s=r.data.settings||{};
  if(s.bkash_number)document.getElementById('bkash-num').textContent=toBn(s.bkash_number);
  if(s.nagad_number)document.getElementById('nagad-num').textContent=toBn(s.nagad_number);
});

// অটো টপ-আপ (বিকাশ টোকেনাইজড)
axios.get('/api/payments/config').then(function(r){
  if(r.data&&r.data.bkash_auto)document.getElementById('auto-topup-section').classList.remove('hidden');
}).catch(function(){});

function startAutoTopup(){
  var amt=Number(document.getElementById('auto-amount').value);
  if(!amt||amt<10){toastMsg('সর্বনিম্ন ৳১০ দিন',false);return}
  var btn=document.getElementById('auto-pay-btn');btn.disabled=true;btn.textContent='প্রস্তুত হচ্ছে...';
  axios.post('/api/payments/bkash/create',{amount:amt}).then(function(r){
    if(r.data&&r.data.redirect_url){window.location.href=r.data.redirect_url}
  }).catch(function(err){
    toastMsg((err.response&&err.response.data&&err.response.data.error)||'ব্যর্থ হয়েছে',false);
    btn.disabled=false;btn.textContent='বিকাশে পে করুন';
  });
}

// পেমেন্ট কলব্যাক ব্যানার
(function(){
  var q=new URLSearchParams(window.location.search);
  var pay=q.get('pay');
  if(!pay)return;
  var b=document.getElementById('pay-banner');
  b.classList.remove('hidden');
  if(pay==='success'){
    b.className='rounded-2xl px-5 py-4 text-sm font-bold bg-emerald-100 text-emerald-800 border border-emerald-300';
    b.textContent='✅ অভিনন্দন! ৳'+toBn(q.get('amount')||'')+' সফলভাবে আপনার ওয়ালেটে যোগ হয়েছে।';
  }else{
    b.className='rounded-2xl px-5 py-4 text-sm font-bold bg-red-100 text-red-700 border border-red-300';
    b.textContent='❌ পেমেন্ট সম্পন্ন হয়নি ('+(q.get('reason')||'বাতিল')+')। আবার চেষ্টা করুন বা ম্যানুয়াল টপ-আপ দিন।';
  }
  window.history.replaceState({},'', '/wallet');
})();
loadAll();
</script>`
  return pageShell('ওয়ালেট', 'bg-slate-50 min-h-screen text-slate-900', content, DARK_PORTAL_CSS)
}

// ============ অ্যাসিস্টেড আবেদন পেজ ============
export function assistedPage(loggedIn: boolean): string {
  const content = `
${shopHeader('assisted', loggedIn)}
<main class="max-w-3xl mx-auto px-4 py-8 space-y-6">
  <section id="assisted-hero" class="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl p-6 shadow-xl">
    <h1 class="text-2xl font-bold">🤝 নিজে করবেন নাকি এডমিনকে দিয়ে?</h1>
    <p class="text-indigo-100 text-sm mt-2">ভর্তি আবেদন, চাকরির আবেদন, ফর্ম ফিলাপ — ঝামেলা ছাড়াই এডমিন টিম আপনার হয়ে করে দেবে। রিকোয়েস্ট দিন → এডমিন ফি জানাবে → ওয়ালেট থেকে পরিশোধ → কাজ সম্পন্ন ✓</p>
  </section>

  <section id="assisted-form-section" class="bg-white rounded-2xl border border-slate-200 p-6">
    <h2 class="font-bold text-lg mb-3">📝 নতুন রিকোয়েস্ট</h2>
    <form id="assisted-form" onsubmit="return submitAssisted(event)" class="space-y-3">
      <div>
        <label class="text-sm font-semibold text-slate-600">সেবার ধরন *</label>
        <select id="as-type" class="w-full mt-1 border rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="admission">🎓 ভর্তি আবেদন</option>
          <option value="job_application">💼 চাকরির আবেদন</option>
          <option value="form_fillup">📋 ফর্ম ফিলাপ</option>
          <option value="other">অন্যান্য</option>
        </select>
      </div>
      <div>
        <label class="text-sm font-semibold text-slate-600">বিস্তারিত * <span class="text-slate-400 font-normal">(কোন আবেদন, ওয়েবসাইট লিংক, ডেডলাইন, আপনার তথ্য)</span></label>
        <textarea id="as-details" required rows="4" maxlength="2000" class="w-full mt-1 border rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-400" placeholder="যেমন: ঢাকা বিশ্ববিদ্যালয় ক-ইউনিট ভর্তি আবেদন করতে চাই। ডেডলাইন ১৫ তারিখ। আমার SSC রোল..."></textarea>
      </div>
      <button id="as-submit" class="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition">রিকোয়েস্ট পাঠান →</button>
    </form>
  </section>

  <section id="assisted-list-section" class="bg-white rounded-2xl border border-slate-200 p-6">
    <h2 class="font-bold text-lg mb-3">📂 আমার রিকোয়েস্ট</h2>
    <div id="as-list" class="space-y-2 text-sm"></div>
  </section>
</main>

<script>
${shopHelpersJs}
var AS_TYPE={admission:'🎓 ভর্তি আবেদন',job_application:'💼 চাকরির আবেদন',form_fillup:'📋 ফর্ম ফিলাপ',other:'অন্যান্য'};
var AS_ST={requested:'⏳ অপেক্ষমাণ',quoted:'💬 ফি নির্ধারিত',paid:'💰 পরিশোধিত',processing:'⚙️ কাজ চলছে',done:'✅ সম্পন্ন',cancelled:'❌ বাতিল'};

function submitAssisted(e){
  e.preventDefault();
  var btn=document.getElementById('as-submit');btn.disabled=true;btn.textContent='পাঠানো হচ্ছে...';
  axios.post('/api/shop/assisted',{
    service_type:document.getElementById('as-type').value,
    details:document.getElementById('as-details').value.trim()
  }).then(function(){
    toastMsg('রিকোয়েস্ট জমা হয়েছে — এডমিন ফি জানাবেন',true);
    document.getElementById('assisted-form').reset();loadAs()
  }).catch(function(err){
    toastMsg((err.response&&err.response.data&&err.response.data.error)||'ব্যর্থ হয়েছে',false)
  }).finally(function(){btn.disabled=false;btn.textContent='রিকোয়েস্ট পাঠান →'});
  return false
}
function payAssisted(id){
  if(!confirm('ওয়ালেট থেকে ফি পরিশোধ করবেন?'))return;
  axios.post('/api/shop/assisted/'+id+'/pay').then(function(){
    toastMsg('ফি পরিশোধ হয়েছে — কাজ শুরু হবে',true);loadAs()
  }).catch(function(err){
    toastMsg((err.response&&err.response.data&&err.response.data.error)||'ব্যর্থ',false)
  })
}
function loadAs(){
  axios.get('/api/shop/assisted/mine').then(function(r){
    var rs=r.data.requests||[];
    document.getElementById('as-list').innerHTML=rs.length?rs.map(function(a){
      var pay=a.status==='quoted'&&a.fee?'<button onclick="payAssisted('+a.id+')" class="mt-2 bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg">💰 ওয়ালেট থেকে '+tk(a.fee)+' পরিশোধ</button>':'';
      return '<div class="bg-slate-50 rounded-xl px-4 py-3"><div class="flex justify-between"><b>'+(AS_TYPE[a.service_type]||a.service_type)+' #'+toBn(a.id)+'</b><span class="text-xs font-semibold">'+(AS_ST[a.status]||a.status)+'</span></div><p class="text-xs text-slate-500 mt-1">'+esc(a.details).slice(0,200)+'</p>'+(a.fee?'<p class="text-xs mt-1">ফি: <b>'+tk(a.fee)+'</b></p>':'')+(a.admin_note?'<p class="text-xs text-indigo-500 mt-1">💬 এডমিন: '+esc(a.admin_note)+'</p>':'')+pay+'</div>'
    }).join(''):'<p class="text-slate-400 text-center py-4">কোনো রিকোয়েস্ট নেই</p>'
  })
}
loadAs();
</script>`
  return pageShell('অ্যাসিস্টেড আবেদন', 'bg-slate-50 min-h-screen text-slate-900', content, DARK_PORTAL_CSS)
}

// ============ এডমিন শপ প্যানেল ============
export function shopAdminPage(isAdmin: boolean): string {
  if (!isAdmin) {
    return pageShell('অননুমোদিত', 'bg-slate-50 min-h-screen flex items-center justify-center', `
<main class="text-center space-y-3">
  <p class="text-5xl">🔒</p>
  <h1 class="text-xl font-bold text-slate-700">এডমিন অনুমতি প্রয়োজন</h1>
  <p class="text-slate-500 text-sm">এই পেজটি শুধু এডমিনদের জন্য</p>
  <a href="/" class="inline-block bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">হোমে ফিরুন</a>
</main>`)
  }
  const content = `
<header class="sticky top-0 z-40 bg-slate-900 text-white shadow">
  <nav class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
    <a href="/" class="font-bold text-lg">🛠️ এডুসব এডমিন — শপ</a>
    <div class="flex gap-3 text-sm">
      <a href="/admin" class="text-slate-300 hover:text-white">মূল প্যানেল</a>
      <a href="/admin/cv-templates" class="text-slate-300 hover:text-white">CV টেমপ্লেট</a>
      <a href="/dashboard" class="bg-amber-500 px-3 py-1.5 rounded-lg font-semibold">ড্যাশবোর্ড</a>
    </div>
  </nav>
</header>
<main class="max-w-6xl mx-auto px-4 py-6">
  <nav id="admin-tabs" class="flex gap-2 overflow-x-auto pb-3 mb-5 text-sm"></nav>
  <section id="tab-content"></section>
</main>

<script>
${shopHelpersJs}
var TAB='products';
var TABS=[['products','📦 প্রোডাক্ট'],['orders','🧾 অর্ডার'],['payments','💳 পেমেন্ট রিভিউ'],['assisted','🤝 অ্যাসিস্টেড'],['settings','⚙️ সেটিংস']];
var ST_BN={pending:'⏳ পেন্ডিং',confirmed:'✅ কনফার্মড',shipped:'🚚 শিপড',delivered:'📬 ডেলিভারড',cancelled:'❌ বাতিল'};
var AS_ST={requested:'⏳ অপেক্ষমাণ',quoted:'💬 ফি নির্ধারিত',paid:'💰 পরিশোধিত',processing:'⚙️ চলছে',done:'✅ সম্পন্ন',cancelled:'❌ বাতিল'};
var CATS=[['books','বই'],['stationery','স্টেশনারি'],['electronics','ইলেকট্রনিক্স'],['package','প্যাকেজ'],['other','অন্যান্য']];

function renderTabs(){
  document.getElementById('admin-tabs').innerHTML=TABS.map(function(t){
    return '<button onclick="setTab(\\''+t[0]+'\\')" class="shrink-0 px-4 py-2 rounded-full border '+(TAB===t[0]?'bg-slate-900 text-white border-slate-900 font-bold':'bg-white text-slate-600')+'">'+t[1]+'</button>'
  }).join('')
}
function setTab(t){TAB=t;renderTabs();load()}
function apiErr(err){toastMsg((err.response&&err.response.data&&err.response.data.error)||'ব্যর্থ',false)}

// ---- প্রোডাক্ট ----
function prodForm(p){
  p=p||{};
  var cats=CATS.map(function(c){return '<option value="'+c[0]+'"'+(p.category===c[0]?' selected':'')+'>'+c[1]+'</option>'}).join('');
  return '<form onsubmit="return saveProd(event,'+(p.id||0)+')" class="bg-white border rounded-2xl p-5 grid md:grid-cols-2 gap-3 mb-5">'+
    '<input id="pf-name" required maxlength="150" placeholder="প্রোডাক্টের নাম *" value="'+esc(p.name_bn||'')+'" class="border rounded-xl px-3 py-2.5 md:col-span-2">'+
    '<input id="pf-desc" maxlength="500" placeholder="বর্ণনা" value="'+esc(p.description||'')+'" class="border rounded-xl px-3 py-2.5 md:col-span-2">'+
    '<select id="pf-cat" class="border rounded-xl px-3 py-2.5">'+cats+'</select>'+
    '<input id="pf-img" maxlength="300" placeholder="ইমোজি বা ছবির URL" value="'+esc(p.image_url||'📦')+'" class="border rounded-xl px-3 py-2.5">'+
    '<input id="pf-price" required type="number" min="1" placeholder="দাম (টাকা) *" value="'+(p.price||'')+'" class="border rounded-xl px-3 py-2.5">'+
    '<input id="pf-offer" type="number" min="1" placeholder="অফার দাম (ঐচ্ছিক)" value="'+(p.offer_price||'')+'" class="border rounded-xl px-3 py-2.5">'+
    '<input id="pf-stock" required type="number" min="0" placeholder="স্টক *" value="'+(p.stock!=null?p.stock:'')+'" class="border rounded-xl px-3 py-2.5">'+
    '<div class="flex items-center gap-4 text-sm">'+
      '<label class="flex items-center gap-1.5"><input id="pf-active" type="checkbox"'+(p.is_active!==0?' checked':'')+'> সক্রিয়</label>'+
      '<label class="flex items-center gap-1.5"><input id="pf-sb" type="checkbox"'+(p.is_signboard?' checked':'')+'> 🪧 সাইনবোর্ড পপ-আপ (সর্বোচ্চ ৫)</label>'+
    '</div>'+
    '<div class="md:col-span-2 flex gap-2">'+
      '<button class="bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl">'+(p.id?'আপডেট ✓':'যোগ করুন +')+'</button>'+
      (p.id?'<button type="button" onclick="load()" class="bg-slate-200 px-5 py-2.5 rounded-xl font-semibold">বাতিল</button>':'')+
    '</div></form>'
}
function saveProd(e,id){
  e.preventDefault();
  var body={
    name_bn:document.getElementById('pf-name').value.trim(),
    description:document.getElementById('pf-desc').value.trim(),
    category:document.getElementById('pf-cat').value,
    image_url:document.getElementById('pf-img').value.trim(),
    price:Number(document.getElementById('pf-price').value),
    offer_price:document.getElementById('pf-offer').value?Number(document.getElementById('pf-offer').value):null,
    stock:Number(document.getElementById('pf-stock').value),
    is_active:document.getElementById('pf-active').checked,
    is_signboard:document.getElementById('pf-sb').checked
  };
  var req=id?axios.put('/api/shop/admin/products/'+id,body):axios.post('/api/shop/admin/products',body);
  req.then(function(){toastMsg(id?'আপডেট হয়েছে':'যোগ হয়েছে',true);load()}).catch(apiErr);
  return false
}
function editProd(id){
  axios.get('/api/shop/admin/products').then(function(r){
    var p=(r.data.products||[]).find(function(x){return x.id===id});
    if(p)document.getElementById('prod-form-slot').innerHTML=prodForm(p);
    window.scrollTo({top:0,behavior:'smooth'})
  })
}
function delProd(id){
  if(!confirm('প্রোডাক্টটি মুছে ফেলবেন?'))return;
  axios.delete('/api/shop/admin/products/'+id).then(function(){toastMsg('মুছে ফেলা হয়েছে',true);load()}).catch(apiErr)
}
function renderProducts(list){
  return '<div id="prod-form-slot">'+prodForm(null)+'</div>'+
    '<div class="space-y-2">'+list.map(function(p){
      return '<div class="bg-white border rounded-xl px-4 py-3 flex items-center gap-3 text-sm">'+
        '<span class="text-2xl">'+((p.image_url||'').indexOf('http')===0?'🖼️':esc(p.image_url||'📦'))+'</span>'+
        '<div class="flex-1 min-w-0"><b>'+esc(p.name_bn)+'</b>'+(p.is_signboard?' <span class="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded">🪧 সাইনবোর্ড</span>':'')+(p.is_active?'':' <span class="bg-slate-200 text-slate-500 text-[10px] px-1.5 py-0.5 rounded">নিষ্ক্রিয়</span>')+
        '<p class="text-xs text-slate-400">'+tk(p.offer_price||p.price)+(p.offer_price?' <s>'+tk(p.price)+'</s>':'')+' • স্টক '+toBn(p.stock)+'</p></div>'+
        '<button onclick="editProd('+p.id+')" class="text-blue-600 px-2">✏️</button>'+
        '<button onclick="delProd('+p.id+')" class="text-red-500 px-2">🗑️</button></div>'
    }).join('')+'</div>'
}

// ---- অর্ডার ----
function setOrderStatus(id,st){
  axios.put('/api/shop/admin/orders/'+id,{status:st}).then(function(){toastMsg('স্ট্যাটাস আপডেট',true);load()}).catch(apiErr)
}
function renderOrders(list){
  if(!list.length)return '<p class="text-center text-slate-400 py-10">কোনো অর্ডার নেই</p>';
  return '<div class="space-y-3">'+list.map(function(o){
    var items=(o.items||[]).map(function(i){return esc(i.product_name)+' ×'+toBn(i.qty)+' ('+tk(i.unit_price)+')'}).join('<br>');
    var opts=['pending','confirmed','shipped','delivered','cancelled'].map(function(s){return '<option value="'+s+'"'+(o.status===s?' selected':'')+'>'+ST_BN[s]+'</option>'}).join('');
    return '<div class="bg-white border rounded-xl p-4 text-sm">'+
      '<div class="flex flex-wrap items-center justify-between gap-2"><b>অর্ডার #'+toBn(o.id)+'</b>'+
      '<select onchange="setOrderStatus('+o.id+',this.value)" class="border rounded-lg px-2 py-1 text-xs">'+opts+'</select></div>'+
      '<p class="mt-1">'+esc(o.customer_name)+' — <a href="tel:'+esc(o.customer_phone)+'" class="text-blue-600">'+toBn(o.customer_phone)+'</a>'+(o.user_id?'':' <span class="text-[10px] bg-slate-100 px-1.5 rounded">গেস্ট</span>')+'</p>'+
      '<p class="text-xs text-slate-500">'+esc(o.address)+'</p>'+
      (o.note?'<p class="text-xs text-amber-600">নোট: '+esc(o.note)+'</p>':'')+
      '<p class="text-xs mt-1.5 text-slate-500">'+items+'</p>'+
      '<p class="mt-1">'+(o.payment_method==='wallet'?'💰 ওয়ালেট (পরিশোধিত)':'🚚 COD')+' — মোট <b>'+tk(o.total)+'</b></p></div>'
  }).join('')+'</div>'
}

// ---- পেমেন্ট রিভিউ ----
var PAY_ST='pending';
function setPaySt(s){PAY_ST=s;load()}
function approvePay(id){
  if(!confirm('অ্যাপ্রুভ করলে ইউজারের ওয়ালেটে টাকা যোগ হবে। নিশ্চিত?'))return;
  axios.post('/api/shop/admin/payments/'+id+'/approve').then(function(){toastMsg('অ্যাপ্রুভড — ওয়ালেটে জমা হয়েছে',true);load()}).catch(apiErr)
}
function rejectPay(id){
  var note=prompt('বাতিলের কারণ (ইউজার দেখবে):','TrxID মেলেনি');
  if(note===null)return;
  axios.post('/api/shop/admin/payments/'+id+'/reject',{admin_note:note}).then(function(){toastMsg('বাতিল করা হয়েছে',true);load()}).catch(apiErr)
}
function renderPayments(list){
  var tabs=['pending','approved','rejected'].map(function(s){
    return '<button onclick="setPaySt(\\''+s+'\\')" class="px-3 py-1.5 rounded-lg text-xs font-semibold '+(PAY_ST===s?'bg-slate-900 text-white':'bg-white border')+'">'+({pending:'পেন্ডিং',approved:'অ্যাপ্রুভড',rejected:'বাতিল'})[s]+'</button>'
  }).join(' ');
  var body=list.length?list.map(function(p){
    var ss=p.screenshot_data?'<img src="'+p.screenshot_data+'" class="mt-2 max-h-48 rounded-lg border cursor-pointer" onclick="window.open(this.src)" alt="স্ক্রিনশট">':'<p class="text-xs text-slate-400 mt-1">স্ক্রিনশট নেই</p>';
    var acts=p.status==='pending'?'<div class="flex gap-2 mt-2"><button onclick="approvePay('+p.id+')" class="bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg">✓ অ্যাপ্রুভ</button><button onclick="rejectPay('+p.id+')" class="bg-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg">✗ বাতিল</button></div>':'';
    return '<div class="bg-white border rounded-xl p-4 text-sm"><div class="flex justify-between"><b>'+(p.method==='bkash'?'বিকাশ':'নগদ')+' — '+tk(p.amount)+'</b><span class="text-xs">'+esc(p.created_at||'')+'</span></div>'+
      '<p class="text-xs mt-1">ইউজার: '+esc(p.user_name)+' ('+toBn(p.user_phone)+') • প্রেরক: '+toBn(p.sender_number)+' • TrxID: <b>'+esc(p.trx_id)+'</b></p>'+ss+acts+'</div>'
  }).join(''):'<p class="text-center text-slate-400 py-10">কিছু নেই</p>';
  return '<div class="flex gap-2 mb-3">'+tabs+'</div><div class="space-y-3">'+body+'</div>'
}

// ---- অ্যাসিস্টেড ----
function updateAs(id){
  var fee=document.getElementById('af-fee-'+id).value,st=document.getElementById('af-st-'+id).value,note=document.getElementById('af-note-'+id).value;
  axios.put('/api/shop/admin/assisted/'+id,{fee:fee?Number(fee):undefined,status:st,admin_note:note}).then(function(){toastMsg('আপডেট হয়েছে',true);load()}).catch(apiErr)
}
function renderAssisted(list){
  if(!list.length)return '<p class="text-center text-slate-400 py-10">কোনো রিকোয়েস্ট নেই</p>';
  var TYPES={admission:'🎓 ভর্তি',job_application:'💼 চাকরি',form_fillup:'📋 ফর্ম',other:'অন্যান্য'};
  return '<div class="space-y-3">'+list.map(function(a){
    var opts=['requested','quoted','paid','processing','done','cancelled'].map(function(s){return '<option value="'+s+'"'+(a.status===s?' selected':'')+'>'+AS_ST[s]+'</option>'}).join('');
    return '<div class="bg-white border rounded-xl p-4 text-sm"><div class="flex justify-between"><b>'+(TYPES[a.service_type]||a.service_type)+' #'+toBn(a.id)+'</b><span class="text-xs font-semibold">'+(AS_ST[a.status]||a.status)+'</span></div>'+
      '<p class="text-xs mt-1">ইউজার: '+esc(a.user_name)+' ('+toBn(a.user_phone)+')</p>'+
      '<p class="text-xs text-slate-500 mt-1 whitespace-pre-wrap">'+esc(a.details)+'</p>'+
      '<div class="grid md:grid-cols-4 gap-2 mt-3">'+
      '<input id="af-fee-'+a.id+'" type="number" min="0" placeholder="ফি (টাকা)" value="'+(a.fee||'')+'" class="border rounded-lg px-2 py-1.5 text-xs">'+
      '<select id="af-st-'+a.id+'" class="border rounded-lg px-2 py-1.5 text-xs">'+opts+'</select>'+
      '<input id="af-note-'+a.id+'" maxlength="500" placeholder="নোট (ইউজার দেখবে)" value="'+esc(a.admin_note||'')+'" class="border rounded-lg px-2 py-1.5 text-xs">'+
      '<button onclick="updateAs('+a.id+')" class="bg-slate-900 text-white text-xs font-bold rounded-lg py-1.5">সেভ ✓</button></div></div>'
  }).join('')+'</div>'
}

// ---- সেটিংস ----
function saveSettings(e){
  e.preventDefault();
  axios.put('/api/shop/admin/settings',{
    bkash_number:document.getElementById('st-bkash').value.trim(),
    nagad_number:document.getElementById('st-nagad').value.trim(),
    whatsapp_number:document.getElementById('st-wa').value.trim(),
    cod_charge:document.getElementById('st-cod').value.trim()||'0'
  }).then(function(){toastMsg('সেটিংস সেভ হয়েছে',true)}).catch(apiErr);
  return false
}
function renderSettings(s){
  return '<form onsubmit="return saveSettings(event)" class="bg-white border rounded-2xl p-5 max-w-lg space-y-3 text-sm">'+
    '<div><label class="font-semibold text-slate-600">বিকাশ নম্বর (পার্সোনাল)</label><input id="st-bkash" maxlength="11" value="'+esc(s.bkash_number||'')+'" placeholder="01XXXXXXXXX" class="w-full mt-1 border rounded-xl px-3 py-2.5"></div>'+
    '<div><label class="font-semibold text-slate-600">নগদ নম্বর (পার্সোনাল)</label><input id="st-nagad" maxlength="11" value="'+esc(s.nagad_number||'')+'" placeholder="01XXXXXXXXX" class="w-full mt-1 border rounded-xl px-3 py-2.5"></div>'+
    '<div><label class="font-semibold text-slate-600">হোয়াটসঅ্যাপ নম্বর</label><input id="st-wa" maxlength="11" value="'+esc(s.whatsapp_number||'')+'" placeholder="01XXXXXXXXX" class="w-full mt-1 border rounded-xl px-3 py-2.5"></div>'+
    '<div><label class="font-semibold text-slate-600">COD ডেলিভারি চার্জ (টাকা)</label><input id="st-cod" type="number" min="0" value="'+esc(s.cod_charge||'0')+'" class="w-full mt-1 border rounded-xl px-3 py-2.5"></div>'+
    '<button class="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl">সেভ করুন ✓</button></form>'
}

function load(){
  var el=document.getElementById('tab-content');
  el.innerHTML='<p class="text-center text-slate-400 py-10">লোড হচ্ছে...</p>';
  if(TAB==='products')axios.get('/api/shop/admin/products').then(function(r){el.innerHTML=renderProducts(r.data.products||[])}).catch(apiErr);
  else if(TAB==='orders')axios.get('/api/shop/admin/orders').then(function(r){el.innerHTML=renderOrders(r.data.orders||[])}).catch(apiErr);
  else if(TAB==='payments')axios.get('/api/shop/admin/payments?status='+PAY_ST).then(function(r){el.innerHTML=renderPayments(r.data.payments||[])}).catch(apiErr);
  else if(TAB==='assisted')axios.get('/api/shop/admin/assisted').then(function(r){el.innerHTML=renderAssisted(r.data.requests||[])}).catch(apiErr);
  else if(TAB==='settings')axios.get('/api/shop/admin/settings').then(function(r){el.innerHTML=renderSettings(r.data.settings||{})}).catch(apiErr);
}
renderTabs();load();
</script>`
  return pageShell('এডমিন — শপ', 'bg-slate-100 min-h-screen text-slate-900', content, DARK_PORTAL_CSS)
}
