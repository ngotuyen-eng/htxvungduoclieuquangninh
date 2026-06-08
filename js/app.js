/**
 * =====================================================
 * APP.JS - Logic Trang Khách Hàng
 * HTX Vùng Dược Liệu Quảng Ninh
 * =====================================================
 */
(function () {
  'use strict';

  /* ====================================================
     CONFIG — URL API quản lý đơn hàng
     Đổi thành URL Vercel production khi deploy
  ==================================================== */
  var CLINIC_API = 'https://htxvungduoclieu.vercel.app/api/orders/website';

  var state = {
    products: [], categories: [], shopInfo: {},
    cart: [], activeCategory: 'all', searchQuery: '', sortBy: 'default',
    currentProductId: null
  };

  /* ---- Helpers ---- */
  function fmt(n) { return Number(n).toLocaleString('vi-VN') + ' đ'; }
  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function el(id) { return document.getElementById(id); }
  function setText(id,v) { var e=el(id); if(e&&v) e.textContent=v; }
  function setHtml(id,v) { var e=el(id); if(e!==null) e.innerHTML=v; }
  function val(id) { var e=el(id); return e ? e.value.trim() : ''; }

  /* ====================================================
     TÌM KIẾM THÔNG MINH — bỏ dấu tiếng Việt
  ==================================================== */
  function normalizeVN(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // bỏ dấu tổ hợp
      .replace(/đ/g, 'd').replace(/Đ/g, 'd')
      .replace(/\s+/g, ' ').trim();
  }

  // Tìm mờ: từng từ của query phải xuất hiện trong tên sản phẩm
  function smartMatch(productName, query) {
    if (!query) return true;
    var normName  = normalizeVN(productName);
    var normQuery = normalizeVN(query);
    // Tìm chính xác trước
    if (normName.indexOf(normQuery) !== -1) return true;
    // Tìm từng từ
    var words = normQuery.split(/\s+/).filter(Boolean);
    return words.every(function(w) { return normName.indexOf(w) !== -1; });
  }

  /* ---- Toast ---- */
  function toast(msg,type,dur) {
    var c=el('toast-container'); if(!c) return;
    var t=document.createElement('div');
    t.className='toast toast-'+(type||'success');
    t.textContent=msg; c.appendChild(t);
    setTimeout(function(){t.classList.add('show');},10);
    setTimeout(function(){t.classList.remove('show');setTimeout(function(){t.remove();},400);},dur||3000);
  }

  /* ---- Load data ---- */
  function loadData() {
    DataManager.initializeData();
    state.products=DataManager.getProducts();
    state.categories=DataManager.getCategories();
    state.shopInfo=DataManager.getShopInfo();
    loadCart();
  }

  /* ---- Shop info ---- */
  function renderShopInfo() {
    var info=state.shopInfo;
    var name=info.name||'HTX Vùng Dược Liệu Quảng Ninh';
    var phone=info.phone||''; var address=info.address||'';
    var desc=info.description||'';
    var zalo=info.zaloLink||(phone?'https://zalo.me/'+phone.replace(/\s/g,''):'');
    var messenger=info.messengerLink||'';

    ['shop-name-display','hero-shop-name','footer-shop-name','contact-shop-name'].forEach(function(id){setText(id,name);});
    setText('hero-shop-desc',desc); setText('contact-desc',desc);
    var fd=el('footer-desc'); if(fd) fd.textContent=(desc.split(' - ')[0])||desc;

    if(phone){
      var fp=phone.replace(/(\d{4})(\d{3})(\d{3})/,'$1 $2 $3');
      ['header-phone-num','hero-phone','detail-phone','footer-phone'].forEach(function(id){setText(id,fp);});
      var hpl=el('header-phone-link'); if(hpl) hpl.href='tel:'+phone.replace(/\s/g,'');
      var hp=el('hero-phone'); if(hp) hp.href='tel:'+phone.replace(/\s/g,'');
    }
    if(address){ setText('hero-address',address); setText('detail-address',address);
      var fa=el('footer-address'); if(fa) fa.textContent=address.split(',').slice(-2).join(',').trim(); }

    var hz=el('hero-zalo-btn'); if(hz){hz.href=zalo||'#';hz.style.display=zalo?'':'none';}
    setText('stat-products',state.products.length); setText('stat-categories',state.categories.length);
    renderContactButtons(phone,zalo,messenger);
    var hp2=document.querySelector('.header-phone'); if(hp2) hp2.style.display=phone?'':'none';
  }

  function renderContactButtons(phone,zalo,messenger) {
    var c=el('contact-buttons'); if(!c) return; var html='';
    if(messenger) html+='<a href="'+esc(messenger)+'" target="_blank" class="contact-btn btn-messenger">📘 Nhắn Messenger</a>';
    if(zalo) html+='<a href="'+esc(zalo)+'" target="_blank" class="contact-btn btn-zalo">💬 Nhắn Zalo</a>';
    if(phone) html+='<a href="tel:'+phone.replace(/\s/g,'')+'" class="contact-btn btn-primary">📞 Gọi ngay: '+phone.replace(/(\d{4})(\d{3})(\d{3})/,'$1 $2 $3')+'</a>';
    if(!html) html='<p style="color:rgba(255,255,255,.65);font-size:.875rem;">Vào <a href="admin.html" style="color:#d4b876;">Admin → Cài đặt</a> để thêm liên hệ.</p>';
    c.innerHTML=html;
  }

  /* ---- Categories ---- */
  function renderCategories() {
    var bar=el('categories-bar'); if(!bar) return;
    bar.querySelectorAll('[data-cat]:not([data-cat="all"])').forEach(function(b){b.remove();});
    state.categories.forEach(function(cat){
      var count=state.products.filter(function(p){return p.category===cat.id;}).length;
      var btn=document.createElement('button'); btn.className='category-pill'; btn.dataset.cat=cat.id;
      btn.textContent=cat.name+' ('+count+')';
      btn.addEventListener('click',function(){setCategory(cat.id);}); bar.appendChild(btn);
    });
    var all=el('cat-all');
    if(all){all.textContent='🌿 Tất cả ('+state.products.length+')'; all.onclick=function(){setCategory('all');};}
  }

  function setCategory(id){
    state.activeCategory=id;
    document.querySelectorAll('.category-pill').forEach(function(p){p.classList.toggle('active',p.dataset.cat===id);});
    renderProducts();
  }

  /* ---- Filter & sort ---- */
  function getFiltered(){
    var list=state.products.slice();
    if(state.activeCategory!=='all') list=list.filter(function(p){return p.category===state.activeCategory;});
    if(state.searchQuery){
      list=list.filter(function(p){
        return smartMatch(p.name, state.searchQuery)
          || (p.description && smartMatch(p.description, state.searchQuery));
      });
    }
    switch(state.sortBy){
      case 'name-asc':list.sort(function(a,b){return a.name.localeCompare(b.name,'vi');});break;
      case 'name-desc':list.sort(function(a,b){return b.name.localeCompare(a.name,'vi');});break;
      case 'price-asc':list.sort(function(a,b){return a.price-b.price;});break;
      case 'price-desc':list.sort(function(a,b){return b.price-a.price;});break;
    } return list;
  }

  /* ---- Products grid ---- */
  function renderProducts(){
    var grid=el('products-grid'),empty=el('empty-state'),cnt=el('products-count'); if(!grid) return;
    var list=getFiltered(); var catMap={};
    state.categories.forEach(function(c){catMap[c.id]=c.name;});
    if(cnt) cnt.textContent=list.length+' sản phẩm';
    if(!list.length){grid.innerHTML=''; if(empty)empty.style.display='flex'; return;}
    if(empty) empty.style.display='none';
    grid.innerHTML=list.map(function(p,i){
      var img=p.image?'<img src="'+p.image+'" alt="'+esc(p.name)+'" class="product-image" loading="lazy"/>':'<div class="product-image-placeholder">🌿</div>';
      return '<div class="product-card" data-id="'+p.id+'" style="animation-delay:'+(i*0.025)+'s" onclick="openProduct(\''+p.id+'\')">'
        +'<div class="product-image-wrap">'+img+'</div>'
        +'<div class="product-body"><div class="product-cat-label">'+esc(catMap[p.category]||'')+'</div><div class="product-name">'+esc(p.name)+'</div></div>'
        +'<div class="product-footer"><div class="product-price-wrap"><span class="price">'+fmt(p.price)+'</span><span class="product-unit">/ '+esc(p.unit)+'</span></div>'
        +'<button class="btn-add-cart" onclick="event.stopPropagation();addToCart(\''+p.id+'\')" title="Thêm vào giỏ">+</button></div></div>';
    }).join('');
  }

  /* ---- Phát hiện đơn vị kg hay không ---- */
  function isKgUnit(unit) {
    return /\bkg\b/i.test(unit || '');
  }
  function getQtyStep(unit) { return isKgUnit(unit) ? 0.1 : 1; }
  function getQtyMin(unit)  { return isKgUnit(unit) ? 0.2 : 1; }
  function roundQty(v, unit) {
    if (isKgUnit(unit)) return Math.round(v * 10) / 10;
    return Math.round(v);
  }

  /* ---- Product modal ---- */
  window.openProduct = function (id) {
    var p = DataManager.getProductById(id); if (!p) return;
    state.currentProductId = id;
    var catMap = {}; state.categories.forEach(function (c) { catMap[c.id] = c.name; });

    setText('modal-category', catMap[p.category] || '');
    setText('modal-name', p.name);
    el('modal-price').textContent = fmt(p.price);
    setText('modal-unit', '/ ' + p.unit);

    // Mô tả
    var descEl = el('modal-desc'), descWrap = el('modal-desc-wrap');
    if (descEl) descEl.textContent = p.description || '';
    if (descWrap) descWrap.style.display = p.description ? 'block' : 'none';

    // Ảnh
    var img = el('modal-image'), ph = el('modal-image-placeholder');
    if (p.image) {
      img.src = p.image; img.alt = p.name;
      img.style.display = 'block'; ph.style.display = 'none';
    } else {
      img.style.display = 'none'; ph.style.display = 'flex';
    }

    // Số lượng — thập phân cho kg
    var step = getQtyStep(p.unit), minQ = getQtyMin(p.unit);
    var qe = el('modal-qty');
    if (qe) {
      qe.step  = step;
      qe.min   = minQ;
      qe.value = minQ;
    }
    var hint = el('modal-qty-hint'), label = el('modal-qty-label');
    if (hint) hint.textContent = isKgUnit(p.unit)
      ? 'Tối thiểu ' + minQ + ' kg, có thể nhập 0.3, 0.5, 1.2... kg'
      : 'Số lượng tối thiểu: 1';
    if (label) label.textContent = isKgUnit(p.unit) ? 'Số lượng (kg):' : 'Số lượng:';

    // Nút liên hệ
    var info = state.shopInfo;
    var zalo = info.zaloLink || (info.phone ? 'https://zalo.me/' + info.phone.replace(/\s/g, '') : '');
    var html = '';
    if (info.messengerLink) html += '<a href="' + esc(info.messengerLink) + '" target="_blank" class="modal-contact-btn btn-messenger">📘 Messenger</a>';
    if (zalo) html += '<a href="' + esc(zalo) + '" target="_blank" class="modal-contact-btn btn-zalo">💬 Zalo</a>';
    if (info.phone) html += '<a href="tel:' + info.phone.replace(/\s/g, '') + '" class="modal-contact-btn btn-primary">📞 Gọi</a>';
    setHtml('modal-contact-btns', html);

    openModal();
  };

  function openModal(){
    var m=el('product-modal'),bd=el('product-modal-backdrop');
    m.style.display='flex';bd.style.display='block';document.body.style.overflow='hidden';
    setTimeout(function(){m.classList.add('open');bd.classList.add('open');},10);
  }
  function closeModal(){
    var m=el('product-modal'),bd=el('product-modal-backdrop');
    m.classList.remove('open');bd.classList.remove('open');
    setTimeout(function(){m.style.display='none';bd.style.display='none';document.body.style.overflow='';},300);
    state.currentProductId=null;
  }

  /* ---- Cart ---- */
  function loadCart(){try{state.cart=JSON.parse(localStorage.getItem('htx_cart')||'[]');}catch(e){state.cart=[];}}
  function saveCart(){localStorage.setItem('htx_cart',JSON.stringify(state.cart));}

  window.addToCart = function (id) {
    var p = DataManager.getProductById(id); if (!p) return;
    var minQ = getQtyMin(p.unit);
    var ex = state.cart.find(function (c) { return c.id === id; });
    if (ex) {
      ex.qty = roundQty(ex.qty + minQ, p.unit);
    } else {
      state.cart.push({ id: p.id, name: p.name, price: p.price, unit: p.unit, qty: minQ });
    }
    saveCart(); renderCart(); toast('Đã thêm: ' + p.name, 'success');
  };
  window.removeFromCartGlobal = function (id) {
    state.cart = state.cart.filter(function (c) { return c.id !== id; });
    saveCart(); renderCart();
  };
  window.updateCartQtyGlobal = function (id, d) {
    var item = state.cart.find(function (c) { return c.id === id; }); if (!item) return;
    var step = getQtyStep(item.unit), minQ = getQtyMin(item.unit);
    var newQty = roundQty(item.qty + d * step, item.unit);
    if (newQty < minQ) { removeFromCartGlobal(id); return; }
    item.qty = newQty; saveCart(); renderCart();
  };

  /* ---- Build order text ---- */
  function buildOrderText(ci){
    var lines=['📋 ĐƠN HÀNG — HTX Vùng Dược Liệu Quảng Ninh','─────────────────'];
    if(ci){lines.push('👤 '+ci.name);lines.push('📞 '+ci.phone);lines.push('📍 '+ci.address);if(ci.note)lines.push('📝 '+ci.note);lines.push('─────────────────');}
    state.cart.forEach(function(item,i){lines.push((i+1)+'. '+item.name);lines.push('   '+fmt(item.price)+' / '+item.unit+' × '+item.qty+' = '+fmt(item.price*item.qty));});
    var total=state.cart.reduce(function(s,c){return s+c.price*c.qty;},0);
    lines.push('─────────────────'); lines.push('Tổng: '+fmt(total));
    lines.push('* Giá tham khảo, xác nhận khi liên hệ.');
    return lines.join('\n');
  }

  /* ====================================================
     ADDRESS — Populate province datalist for autocomplete
  ==================================================== */
  function initProvinceList(){
    var dl=el('province-list'); if(!dl||typeof VNAddress==='undefined') return;
    VNAddress.getProvinces().forEach(function(p){
      var opt=document.createElement('option'); opt.value=p; dl.appendChild(opt);
    });
  }

  /* ====================================================
     GET CUSTOMER INFO from text inputs
  ==================================================== */
  function getCustomerInfo(){
    var name=val('d-name'), phone=val('d-phone'),
        province=val('d-province'), district=val('d-district'),
        commune=val('d-commune'), detail=val('d-detail'), note=val('d-note');

    if(!name)     { toast('Vui lòng nhập họ và tên','error'); el('d-name').focus(); return null; }
    if(!phone)    { toast('Vui lòng nhập số điện thoại','error'); el('d-phone').focus(); return null; }
    if(!province) { toast('Vui lòng nhập tỉnh/thành phố','error'); el('d-province').focus(); return null; }
    if(!district) { toast('Vui lòng nhập quận/huyện','error'); el('d-district').focus(); return null; }
    if(!detail)   { toast('Vui lòng nhập địa chỉ chi tiết','error'); el('d-detail').focus(); return null; }

    var parts=[detail];
    if(commune) parts.push(commune);
    parts.push(district); parts.push(province);
    return {name:name, phone:phone, address:parts.join(', '), note:note};
  }

  /* ====================================================
     SUBMIT ORDER → clinic saas API
  ==================================================== */
  function submitOrderToClinic(ci){
    var btn=el('cart-order-website');
    if(btn){btn.disabled=true;btn.innerHTML='⏳ Đang gửi đơn...';}

    var payload={
      customer_name:    ci.name,
      customer_phone:   ci.phone,
      customer_address: ci.address,
      note:             ci.note || '',
      items: state.cart.map(function(item){return {
        name:     item.name+' ('+item.unit+')',
        price:    item.price,
        quantity: item.qty
      };})
    };

    fetch(CLINIC_API,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    })
    .then(function(res){return res.json().then(function(d){return{ok:res.ok,status:res.status,data:d};});})
    .then(function(r){
      if(r.ok && r.data.success){
        var num=r.data.data&&r.data.data.order_number?'#'+String(r.data.data.order_number).padStart(4,'0'):'';
        toast('✅ Đặt hàng thành công! Mã đơn '+num+' — Chúng tôi sẽ liên hệ sớm!','success',6000);
        state.cart=[]; saveCart(); renderCart(); closeCart();
        clearDeliveryForm();
      } else {
        throw new Error(r.data&&r.data.message?r.data.message:'Lỗi gửi đơn');
      }
    })
    .catch(function(err){
      console.error('Order error:',err);
      // Fallback: copy đơn gửi Zalo
      copyText(buildOrderText(ci),'');
      toast('⚠️ Chưa kết nối được hệ thống. Đã sao chép đơn — hãy gửi qua Zalo!','error',6000);
      var zalo=state.shopInfo.zaloLink||(state.shopInfo.phone?'https://zalo.me/'+state.shopInfo.phone.replace(/\s/g,''):'');
      if(zalo) setTimeout(function(){window.open(zalo,'_blank');},1500);
    })
    .finally(function(){
      if(btn){btn.disabled=false;btn.innerHTML='📤 Đặt hàng ngay';}
    });
  }

  function clearDeliveryForm(){
    ['d-name','d-phone','d-province','d-district','d-commune','d-detail','d-note'].forEach(function(id){
      var e=el(id); if(e) e.value='';
    });
  }

  /* ---- Render cart ---- */
  function renderCart(){
    var listEl=el('cart-list'),emptyEl=el('cart-empty'),footerEl=el('cart-footer'),
        delivForm=el('delivery-form'),badge=el('cart-badge'),webBtn=el('cart-order-website');
    var totalQty=state.cart.reduce(function(s,c){return s+c.qty;},0);
    var totalPrice=state.cart.reduce(function(s,c){return s+c.price*c.qty;},0);

    if(badge){
      badge.textContent=Math.round(totalQty*10)/10;
      badge.style.display=totalQty>0?'flex':'none';
    }
    updateFab(totalQty);

    if(!state.cart.length){
      if(listEl) listEl.innerHTML=''; if(emptyEl) emptyEl.style.display='flex';
      if(footerEl) footerEl.style.display='none'; if(delivForm) delivForm.style.display='none';
      return;
    }
    if(emptyEl) emptyEl.style.display='none';
    if(footerEl) footerEl.style.display='block';
    if(delivForm) delivForm.style.display='block';

    if(listEl){listEl.innerHTML=state.cart.map(function(item){
      var isKg = isKgUnit(item.unit);
      var qtyDisplay = isKg ? item.qty.toFixed(1) + ' kg' : item.qty;
      return '<li class="cart-item"><div class="cart-item-info">'
        +'<div class="cart-item-name">'+esc(item.name)+'</div>'
        +'<div class="cart-item-unit">/ '+esc(item.unit)+'</div>'
        +'<div class="cart-item-price">'+fmt(item.price)+'</div></div>'
        +'<div class="cart-item-controls">'
        +'<button class="qty-btn" onclick="updateCartQtyGlobal(\''+item.id+'\',-1)">−</button>'
        +'<span class="qty-display">'+qtyDisplay+'</span>'
        +'<button class="qty-btn" onclick="updateCartQtyGlobal(\''+item.id+'\',1)">+</button>'
        +'<button class="cart-remove-btn" onclick="removeFromCartGlobal(\''+item.id+'\')" title="Xóa">🗑</button>'
        +'</div></li>';
    }).join('');}

    var te=el('cart-total-price'); if(te) te.textContent=fmt(totalPrice);

    var info=state.shopInfo;
    var zalo=info.zaloLink||(info.phone?'https://zalo.me/'+info.phone.replace(/\s/g,''):'');
    var mb=el('cart-order-messenger'),zb=el('cart-order-zalo');
    if(mb) mb.style.display=info.messengerLink?'flex':'none';
    if(zb) zb.style.display=zalo?'flex':'none';
    if(webBtn) webBtn.style.display='flex';
  }

  /* ---- Cart panel ---- */
  function openCart(){
    el('cart-panel').classList.add('open');
    el('cart-backdrop').classList.add('open');
    document.body.style.overflow='hidden';
  }
  function closeCart(){
    el('cart-panel').classList.remove('open');
    el('cart-backdrop').classList.remove('open');
    document.body.style.overflow='';
  }

  /* ---- FAB cart badge sync ---- */
  function updateFab(totalQty) {
    var fab = el('fab-cart-btn'), badge = el('fab-badge');
    if (!fab) return;
    fab.style.display = totalQty > 0 ? 'flex' : 'none';
    if (badge) badge.textContent = totalQty;
  }

  function copyText(text,msg){
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){if(msg)toast(msg,'success');});}
    else{var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();if(msg)toast(msg,'success');}
  }

  window.resetFilters=function(){
    state.searchQuery='';state.activeCategory='all';state.sortBy='default';
    var si=el('search-input');if(si)si.value='';var ss=el('sort-select');if(ss)ss.value='default';
    var sc=el('search-clear');if(sc)sc.style.display='none';
    document.querySelectorAll('.category-pill').forEach(function(p){p.classList.toggle('active',p.dataset.cat==='all');});
    renderProducts();
  };

  /* ---- Events ---- */
  function initEvents(){
    window.addEventListener('scroll',function(){var h=el('site-header');if(h)h.classList.toggle('scrolled',window.scrollY>10);});

    // Inline search (mobile-friendly)
    var isi=el('inline-search-input'), isc=el('inline-search-clear');
    if(isi) isi.addEventListener('input',function(){
      state.searchQuery=this.value.trim();
      if(isc) isc.style.display=state.searchQuery?'block':'none';
      // Đồng bộ header search nếu có
      var hsi=el('search-input'); if(hsi) hsi.value=this.value;
      renderProducts();
    });
    if(isc) isc.addEventListener('click',function(){
      isi.value=''; state.searchQuery=''; isc.style.display='none';
      var hsi=el('search-input'); if(hsi) hsi.value='';
      renderProducts(); isi.focus();
    });

    // Header search (desktop)
    var si=el('search-input'),sc=el('search-clear');
    if(si) si.addEventListener('input',function(){
      state.searchQuery=this.value.trim();
      if(sc) sc.style.display=state.searchQuery?'block':'none';
      if(isi) isi.value=this.value;
      renderProducts();
    });
    if(sc) sc.addEventListener('click',function(){si.value='';state.searchQuery='';sc.style.display='none';if(isi)isi.value='';renderProducts();si.focus();});

    var ss=el('sort-select'); if(ss) ss.addEventListener('change',function(){state.sortBy=this.value;renderProducts();});

    var ct=el('cart-toggle'); if(ct) ct.addEventListener('click',openCart);
    var cc=el('cart-close'); if(cc) cc.addEventListener('click',closeCart);
    var cb=el('cart-backdrop'); if(cb) cb.addEventListener('click',closeCart);

    // FAB cart button
    var fab=el('fab-cart-btn'); if(fab) fab.addEventListener('click',openCart);

    var clr=el('cart-clear-btn'); if(clr) clr.addEventListener('click',function(){if(confirm('Xóa toàn bộ giỏ hàng?')){state.cart=[];saveCart();renderCart();}});

    // ĐẶT HÀNG WEBSITE → gửi API
    var owb=el('cart-order-website'); if(owb) owb.addEventListener('click',function(){
      var ci=getCustomerInfo(); if(!ci) return;
      var total=state.cart.reduce(function(s,c){return s+c.price*c.qty;},0);
      if(!confirm('📦 Xác nhận đặt hàng?\n\n👤 '+ci.name+'\n📞 '+ci.phone+'\n📍 '+ci.address+'\n💰 Tổng: '+fmt(total))) return;
      submitOrderToClinic(ci);
    });

    // Messenger
    var mb=el('cart-order-messenger'); if(mb) mb.addEventListener('click',function(){
      var ci=getCustomerInfo(); copyText(buildOrderText(ci),'Đã sao chép! Mở Messenger và dán nhé.');
      var lk=state.shopInfo.messengerLink; if(lk) setTimeout(function(){window.open(lk,'_blank');},600);
    });

    // Zalo
    var zb=el('cart-order-zalo'); if(zb) zb.addEventListener('click',function(){
      var ci=getCustomerInfo();
      var zalo=state.shopInfo.zaloLink||(state.shopInfo.phone?'https://zalo.me/'+state.shopInfo.phone.replace(/\s/g,''):'');
      copyText(buildOrderText(ci),'Đã sao chép! Mở Zalo và dán nhé.');
      if(zalo) setTimeout(function(){window.open(zalo,'_blank');},600);
    });

    // Sao chép
    var cpb=el('cart-order-copy'); if(cpb) cpb.addEventListener('click',function(){
      var ci=null; var n=val('d-name'),p=val('d-phone'),d=val('d-detail');
      if(n&&p&&d) ci=getCustomerInfo();
      copyText(buildOrderText(ci),'📋 Đã sao chép đơn hàng!');
    });

    // Modal
    var mc = el('modal-close'), mbd = el('product-modal-backdrop');
    if (mc)  mc.addEventListener('click', closeModal);
    if (mbd) mbd.addEventListener('click', closeModal);

    var qe = el('modal-qty'), qm = el('modal-qty-minus'), qp = el('modal-qty-plus');
    if (qm) qm.addEventListener('click', function () {
      if (!state.currentProductId) return;
      var p = DataManager.getProductById(state.currentProductId);
      var step = getQtyStep(p ? p.unit : ''), minQ = getQtyMin(p ? p.unit : '');
      var cur = parseFloat(qe.value) || minQ;
      qe.value = Math.max(minQ, roundQty(cur - step, p ? p.unit : ''));
    });
    if (qp) qp.addEventListener('click', function () {
      if (!state.currentProductId) return;
      var p = DataManager.getProductById(state.currentProductId);
      var step = getQtyStep(p ? p.unit : ''), minQ = getQtyMin(p ? p.unit : '');
      var cur = parseFloat(qe.value) || minQ;
      qe.value = Math.min(99, roundQty(cur + step, p ? p.unit : ''));
    });

    var mac = el('modal-add-cart');
    if (mac) mac.addEventListener('click', function () {
      if (!state.currentProductId) return;
      var p = DataManager.getProductById(state.currentProductId); if (!p) return;
      var minQ = getQtyMin(p.unit);
      var qty = roundQty(parseFloat(qe.value) || minQ, p.unit);
      if (qty < minQ) { toast('Số lượng tối thiểu ' + minQ + (isKgUnit(p.unit) ? ' kg' : ''), 'error'); return; }
      var ex = state.cart.find(function (c) { return c.id === p.id; });
      if (ex) ex.qty = roundQty(ex.qty + qty, p.unit);
      else state.cart.push({ id: p.id, name: p.name, price: p.price, unit: p.unit, qty: qty });
      saveCart(); renderCart();
      toast('Đã thêm ' + (isKgUnit(p.unit) ? qty.toFixed(1) + ' kg ' : qty + 'x ') + p.name, 'success');
      closeModal();
    });

    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeModal(); closeCart(); } });
  }

  /* ---- Init ---- */
  function init(){
    loadData(); renderShopInfo(); renderCategories();
    renderProducts(); renderCart(); initProvinceList(); initEvents();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
