/**
 * =====================================================
 * ADMIN.JS - Logic Trang Quản Trị
 * HTX Vùng Dược Liệu Quảng Ninh
 * =====================================================
 */

(function () {
  'use strict';

  var currentTab = 'products';
  var editingProductId = null;
  var editingCatId = null;
  var importedData = null;
  var adminSearchQuery = '';
  var adminCatFilter = 'all';

  // ===== FORMAT =====
  function formatPrice(num) {
    return Number(num).toLocaleString('vi-VN') + ' đ';
  }

  function escHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ===== TOAST =====
  function showToast(msg, type) {
    var container = document.getElementById('toast-container');
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'success');
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(function () { toast.classList.add('show'); }, 10);
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 400);
    }, 3500);
  }

  // ===== LOGIN =====
  function initLogin() {
    DataManager.initializeData();

    var loginBtn = document.getElementById('login-btn');
    var loginForm = document.getElementById('login-form');
    var loginError = document.getElementById('login-error');

    function attemptLogin() {
      var pw = document.getElementById('login-password').value;
      var info = DataManager.getShopInfo();
      if (pw === info.adminPassword) {
        sessionStorage.setItem('htx_admin_logged_in', '1');
        showAdminPanel();
      } else {
        loginError.style.display = 'block';
        setTimeout(function () { loginError.style.display = 'none'; }, 3000);
      }
    }

    loginBtn.addEventListener('click', attemptLogin);
    loginForm.addEventListener('submit', attemptLogin);
    document.getElementById('login-password').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') attemptLogin();
    });

    // Auto-login if session active
    if (sessionStorage.getItem('htx_admin_logged_in') === '1') {
      showAdminPanel();
    }
  }

  function showAdminPanel() {
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('admin-layout').style.display = 'flex';
    loadTab('products');
  }

  // ===== TAB NAVIGATION =====
  function loadTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.admin-tab').forEach(function (el) { el.style.display = 'none'; });
    document.querySelectorAll('.sidebar-item').forEach(function (el) {
      el.classList.toggle('active', el.dataset.tab === tab);
    });
    var tabEl = document.getElementById('tab-' + tab);
    if (tabEl) tabEl.style.display = 'block';

    switch (tab) {
      case 'products':   renderProductsTable(); break;
      case 'categories': renderCategoriesTable(); break;
      case 'settings':   loadSettings(); break;
      case 'orders':     initOrdersTab(); break;
      case 'backup': break;
    }
  }

  // ===== SẢN PHẨM =====
  function renderProductsTable() {
    var products = DataManager.getProducts();
    var categories = DataManager.getCategories();

    // Update filter dropdown
    var filterSelect = document.getElementById('admin-cat-filter');
    var currentFilter = filterSelect ? filterSelect.value : 'all';
    if (filterSelect) {
      filterSelect.innerHTML = '<option value="all">Tất cả danh mục</option>' +
        categories.map(function (c) {
          return '<option value="' + escHtml(c.id) + '"' + (currentFilter === c.id ? ' selected' : '') + '>' + escHtml(c.name) + '</option>';
        }).join('');
    }

    // Filter
    var list = products.filter(function (p) {
      var matchCat = adminCatFilter === 'all' || p.category === adminCatFilter;
      var matchSearch = !adminSearchQuery || p.name.toLowerCase().indexOf(adminSearchQuery.toLowerCase()) !== -1;
      return matchCat && matchSearch;
    });

    var sub = document.getElementById('products-sub');
    if (sub) sub.textContent = 'Tổng: ' + products.length + ' sản phẩm' + (list.length !== products.length ? ' (đang lọc: ' + list.length + ')' : '');

    var catMap = {};
    categories.forEach(function (c) { catMap[c.id] = c.name; });

    var tbody = document.getElementById('products-tbody');
    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">Không có sản phẩm nào</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(function (p) {
      var imgHtml = p.image
        ? '<img src="' + p.image + '" alt="' + escHtml(p.name) + '" class="table-product-img" />'
        : '<div class="table-product-img-placeholder">🌿</div>';
      return '<tr>' +
        '<td>' + imgHtml + '</td>' +
        '<td class="td-name"><span class="product-name-cell">' + escHtml(p.name) + '</span></td>' +
        '<td><span class="cat-badge">' + escHtml(catMap[p.category] || '—') + '</span></td>' +
        '<td><strong class="price">' + formatPrice(p.price) + '</strong></td>' +
        '<td>' + escHtml(p.unit) + '</td>' +
        '<td class="td-actions">' +
        '<button class="btn-icon btn-edit" onclick="editProduct(\'' + p.id + '\')" title="Sửa">✏️</button>' +
        '<button class="btn-icon btn-delete" onclick="deleteProduct(\'' + p.id + '\')" title="Xóa">🗑</button>' +
        '</td>' +
        '</tr>';
    }).join('');
  }

  // === FORM SẢN PHẨM ===
  function openProductForm(productId) {
    editingProductId = productId || null;
    var title = document.getElementById('product-form-title');
    var form = document.getElementById('product-form');

    // Populate categories
    var categories = DataManager.getCategories();
    var catSelect = document.getElementById('form-category');
    catSelect.innerHTML = categories.map(function (c) {
      return '<option value="' + escHtml(c.id) + '">' + escHtml(c.name) + '</option>';
    }).join('');

    if (productId) {
      title.textContent = 'Sửa sản phẩm';
      var p = DataManager.getProductById(productId);
      if (p) {
        document.getElementById('form-product-id').value = p.id;
        document.getElementById('form-name').value = p.name;
        document.getElementById('form-price').value = p.price;
        document.getElementById('form-unit').value = p.unit;
        document.getElementById('form-desc').value = p.description || '';
        document.getElementById('form-category').value = p.category;
        document.getElementById('form-image').value = p.image || '';
        setImagePreview(p.image);
      }
    } else {
      title.textContent = 'Thêm sản phẩm mới';
      form.reset();
      document.getElementById('form-product-id').value = '';
      document.getElementById('form-image').value = '';
      setImagePreview('');
    }

    showModal('product-form');
  }

  function setImagePreview(src) {
    var previewWrap = document.getElementById('image-preview-wrap');
    var placeholder = document.getElementById('image-upload-placeholder');
    var previewImg = document.getElementById('image-preview');
    if (src) {
      previewImg.src = src;
      previewWrap.style.display = 'block';
      placeholder.style.display = 'none';
    } else {
      previewWrap.style.display = 'none';
      placeholder.style.display = 'flex';
    }
  }

  window.editProduct = function (id) { openProductForm(id); };

  window.deleteProduct = function (id) {
    var p = DataManager.getProductById(id);
    if (!p) return;
    if (!confirm('Xóa sản phẩm "' + p.name + '"?\n\nThao tác này không thể hoàn tác!')) return;
    DataManager.deleteProduct(id);
    renderProductsTable();
    showToast('Đã xóa: ' + p.name, 'success');
  };

  function saveProduct() {
    var name = document.getElementById('form-name').value.trim();
    var price = parseFloat(document.getElementById('form-price').value);
    var unit = document.getElementById('form-unit').value.trim();
    var category = document.getElementById('form-category').value;
    var desc = document.getElementById('form-desc').value.trim();
    var image = document.getElementById('form-image').value;

    if (!name) { showToast('Vui lòng nhập tên sản phẩm!', 'error'); return; }
    if (isNaN(price) || price < 0) { showToast('Giá không hợp lệ!', 'error'); return; }
    if (!unit) { showToast('Vui lòng nhập đơn vị!', 'error'); return; }

    var data = { name: name, price: price, unit: unit, category: category, description: desc, image: image };

    if (editingProductId) {
      DataManager.updateProduct(editingProductId, data);
      showToast('Đã cập nhật: ' + name, 'success');
    } else {
      DataManager.addProduct(data);
      showToast('Đã thêm: ' + name, 'success');
    }

    closeModal('product-form');
    renderProductsTable();
  }

  // ===== DANH MỤC =====
  function renderCategoriesTable() {
    var categories = DataManager.getCategories();
    var products = DataManager.getProducts();
    var tbody = document.getElementById('categories-tbody');
    if (!tbody) return;

    if (categories.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty-cell">Chưa có danh mục nào</td></tr>';
      return;
    }

    tbody.innerHTML = categories.map(function (c) {
      var count = products.filter(function (p) { return p.category === c.id; }).length;
      return '<tr>' +
        '<td><strong>' + escHtml(c.name) + '</strong></td>' +
        '<td>' + escHtml(c.description || '—') + '</td>' +
        '<td><span class="count-badge">' + count + ' SP</span></td>' +
        '<td class="td-actions">' +
        '<button class="btn-icon btn-edit" onclick="editCategory(\'' + c.id + '\')" title="Sửa">✏️</button>' +
        '<button class="btn-icon btn-delete" onclick="deleteCategory(\'' + c.id + '\')" title="Xóa">🗑</button>' +
        '</td>' +
        '</tr>';
    }).join('');
  }

  function openCategoryForm(catId) {
    editingCatId = catId || null;
    var title = document.getElementById('cat-form-title');

    if (catId) {
      title.textContent = 'Sửa danh mục';
      var cat = DataManager.getCategories().find(function (c) { return c.id === catId; });
      if (cat) {
        document.getElementById('form-cat-id').value = cat.id;
        document.getElementById('form-cat-name').value = cat.name;
        document.getElementById('form-cat-desc').value = cat.description || '';
      }
    } else {
      title.textContent = 'Thêm danh mục mới';
      document.getElementById('cat-form').reset();
      document.getElementById('form-cat-id').value = '';
    }
    showModal('cat-form');
  }

  window.editCategory = function (id) { openCategoryForm(id); };

  window.deleteCategory = function (id) {
    var cat = DataManager.getCategories().find(function (c) { return c.id === id; });
    if (!cat) return;
    var products = DataManager.getProducts();
    var count = products.filter(function (p) { return p.category === id; }).length;
    var msg = 'Xóa danh mục "' + cat.name + '"?';
    if (count > 0) msg += '\n\nCó ' + count + ' sản phẩm trong danh mục này sẽ không còn danh mục!';
    if (!confirm(msg)) return;
    DataManager.deleteCategory(id);
    renderCategoriesTable();
    showToast('Đã xóa danh mục: ' + cat.name, 'success');
  };

  function saveCategory() {
    var name = document.getElementById('form-cat-name').value.trim();
    var desc = document.getElementById('form-cat-desc').value.trim();
    if (!name) { showToast('Vui lòng nhập tên danh mục!', 'error'); return; }

    if (editingCatId) {
      DataManager.updateCategory(editingCatId, { name: name, description: desc });
      showToast('Đã cập nhật: ' + name, 'success');
    } else {
      DataManager.addCategory({ name: name, description: desc });
      showToast('Đã thêm danh mục: ' + name, 'success');
    }
    closeModal('cat-form');
    renderCategoriesTable();
  }

  // ===== CÀI ĐẶT =====
  function loadSettings() {
    var info = DataManager.getShopInfo();
    document.getElementById('set-name').value = info.name || '';
    document.getElementById('set-phone').value = info.phone || '';
    document.getElementById('set-address').value = info.address || '';
    document.getElementById('set-desc').value = info.description || '';
    document.getElementById('set-facebook').value = info.facebookLink || '';
    document.getElementById('set-messenger').value = info.messengerLink || '';
    document.getElementById('set-zalo').value = info.zaloLink || '';
    document.getElementById('set-imgbb-key').value = info.imgbbApiKey || '';
    document.getElementById('set-password').value = '';
    document.getElementById('set-password-confirm').value = '';
  }

  function saveSettings() {
    var newPw = document.getElementById('set-password').value;
    var confirmPw = document.getElementById('set-password-confirm').value;
    if (newPw && newPw !== confirmPw) {
      showToast('Mật khẩu xác nhận không khớp!', 'error');
      return;
    }

    var info = DataManager.getShopInfo();
    var updated = {
      name: document.getElementById('set-name').value.trim() || info.name,
      phone: document.getElementById('set-phone').value.trim(),
      address: document.getElementById('set-address').value.trim(),
      description: document.getElementById('set-desc').value.trim(),
      facebookLink: document.getElementById('set-facebook').value.trim(),
      messengerLink: document.getElementById('set-messenger').value.trim(),
      zaloLink: document.getElementById('set-zalo').value.trim(),
      imgbbApiKey: document.getElementById('set-imgbb-key').value.trim(),
      adminPassword: newPw || info.adminPassword
    };

    DataManager.updateShopInfo(updated);
    showToast('Đã lưu thông tin shop!', 'success');
  }

  // ===== SAO LƯU =====
  function exportData() {
    var json = DataManager.exportData();
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = 'htx-duoclieu-backup-' + date + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Đã xuất dữ liệu thành công!', 'success');
  }

  function handleImportFile(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      try {
        var data = JSON.parse(ev.target.result);
        importedData = ev.target.result;
        var preview = document.getElementById('import-preview');
        var info = document.getElementById('import-info');
        info.innerHTML = '✅ File hợp lệ: <strong>' + (data.products ? data.products.length : 0) + ' sản phẩm</strong>, ' +
          '<strong>' + (data.categories ? data.categories.length : 0) + ' danh mục</strong>.' +
          (data.exportedAt ? '<br>Xuất lúc: ' + new Date(data.exportedAt).toLocaleString('vi-VN') : '');
        preview.style.display = 'block';
      } catch (err) {
        showToast('File không hợp lệ! Vui lòng chọn file JSON đúng định dạng.', 'error');
        importedData = null;
      }
    };
    reader.readAsText(file);
  }

  /* ====================================================
     XÁC NHẬN MẬT KHẨU — bảo vệ lệnh nguy hiểm
  ==================================================== */
  var _pwCallback = null;

  function requireAdminPassword(title, desc, callback) {
    _pwCallback = callback;
    var bd   = document.getElementById('pw-confirm-backdrop');
    var modal = document.getElementById('pw-confirm-modal');
    var inp  = document.getElementById('pw-confirm-input');
    var err  = document.getElementById('pw-confirm-error');
    document.getElementById('pw-confirm-title').textContent = title;
    document.getElementById('pw-confirm-desc').textContent  = desc;
    inp.value = ''; err.style.display = 'none';
    bd.style.display = 'block';
    modal.style.display = 'flex';
    setTimeout(function() {
      bd.classList.add('open'); modal.classList.add('open');
      inp.focus();
    }, 10);
  }

  function closePwConfirm() {
    var bd = document.getElementById('pw-confirm-backdrop');
    var modal = document.getElementById('pw-confirm-modal');
    bd.classList.remove('open'); modal.classList.remove('open');
    setTimeout(function() {
      bd.style.display = 'none'; modal.style.display = 'none';
    }, 260);
    _pwCallback = null;
  }

  function initPwConfirmEvents() {
    var form    = document.querySelector('#pw-confirm-modal form');
    var inp     = document.getElementById('pw-confirm-input');
    var err     = document.getElementById('pw-confirm-error');
    var cancel  = document.getElementById('pw-confirm-cancel');
    var closeBtn = document.getElementById('pw-confirm-close');
    var bd      = document.getElementById('pw-confirm-backdrop');

    [cancel, closeBtn, bd].forEach(function(el) {
      if (el) el.addEventListener('click', closePwConfirm);
    });

    if (form) form.addEventListener('submit', function(e) {
      e.preventDefault();
      var info = DataManager.getShopInfo();
      if (inp.value === info.adminPassword) {
        closePwConfirm();
        if (_pwCallback) _pwCallback();
      } else {
        err.style.display = 'block';
        inp.value = ''; inp.focus();
        inp.style.borderColor = '#e53e3e';
        setTimeout(function() { inp.style.borderColor = ''; }, 1500);
      }
    });
  }

  function confirmImport() {
    if (!importedData) return;
    requireAdminPassword(
      '📥 Xác nhận Nhập dữ liệu',
      'Thao tác này sẽ GHI ĐÈ toàn bộ sản phẩm, danh mục hiện tại. Không thể hoàn tác!',
      function() {
        var result = DataManager.importData(importedData);
        if (result.success) {
          showToast(result.message, 'success');
          document.getElementById('import-preview').style.display = 'none';
          document.getElementById('import-file').value = '';
          importedData = null;
        } else {
          showToast(result.message, 'error');
        }
      }
    );
  }

  /* ====================================================
     PUBLISH — Đăng dữ liệu lên website qua GitHub API
  ==================================================== */
  function publishToWebsite() {
    var tokenInput = document.getElementById('github-token');
    var token = tokenInput.value.trim() || localStorage.getItem('htx_gh_token') || '';
    if (!token) {
      showToast('Vui lòng dán GitHub Token vào ô bên trên!', 'error');
      tokenInput.focus();
      return;
    }
    // Lưu token để dùng lại
    localStorage.setItem('htx_gh_token', token);

    var btn = document.getElementById('btn-publish');
    var txt = document.getElementById('publish-btn-text');
    var status = document.getElementById('publish-status');
    btn.disabled = true;
    txt.textContent = '⏳ Đang đăng lên website...';
    status.textContent = 'Bước 1/3: Đang lấy thông tin file...';

    var OWNER = 'ngotuyen-eng';
    var REPO  = 'htxvungduoclieuquangninh';
    var PATH  = 'js/live-data.js';
    var API   = 'https://api.github.com/repos/' + OWNER + '/' + REPO + '/contents/' + PATH;

    // Tạo nội dung live-data.js
    var products   = DataManager.getProducts();
    var categories = DataManager.getCategories();
    var shopInfo   = DataManager.getShopInfo();
    var publishedAt = new Date().toISOString();

    var content = '/**\n'
      + ' * live-data.js — Dữ liệu đã đăng tải\n'
      + ' * Cập nhật: ' + new Date().toLocaleString('vi-VN') + '\n'
      + ' * KHÔNG chỉnh sửa thủ công\n'
      + ' */\n'
      + '(function () {\n'
      + '  var PUBLISHED_AT = "' + publishedAt + '";\n'
      + '  var stored = localStorage.getItem("htx_published_version");\n'
      + '  if (stored === PUBLISHED_AT) return; // Không cập nhật lại nếu đã là phiên bản mới nhất\n'
      + '  localStorage.setItem("htx_published_version", PUBLISHED_AT);\n'
      + '  localStorage.setItem("htx_duoclieu_products",   JSON.stringify(' + JSON.stringify(products)   + '));\n'
      + '  localStorage.setItem("htx_duoclieu_categories", JSON.stringify(' + JSON.stringify(categories) + '));\n'
      + '  localStorage.setItem("htx_duoclieu_shopinfo",   JSON.stringify(' + JSON.stringify(shopInfo)   + '));\n'
      + '  console.log("[HTX] Đã tải dữ liệu mới nhất:", PUBLISHED_AT);\n'
      + '})();\n';

    var b64content = btoa(unescape(encodeURIComponent(content)));

    // Lấy SHA file hiện tại
    fetch(API, {
      headers: {
        'Authorization': 'token ' + token,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    .then(function(r) { return r.json(); })
    .then(function(fileInfo) {
      status.textContent = 'Bước 2/3: Đang ghi dữ liệu lên GitHub...';
      var sha = fileInfo.sha || '';
      var body = {
        message: '🚀 Cập nhật dữ liệu sản phẩm - ' + new Date().toLocaleString('vi-VN'),
        content: b64content
      };
      if (sha) body.sha = sha;
      return fetch(API, {
        method: 'PUT',
        headers: {
          'Authorization': 'token ' + token,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
    })
    .then(function(r) { return r.json(); })
    .then(function(result) {
      if (result.content) {
        status.textContent = 'Bước 3/3: Vercel đang deploy... (~30 giây)';
        txt.textContent = '✅ Đăng thành công!';
        showToast('🚀 Đã đăng lên website! Vercel sẽ cập nhật trong ~30 giây.', 'success', 6000);
        setTimeout(function() {
          txt.textContent = '🚀 Đăng lên website ngay';
          status.textContent = 'Lần đăng cuối: ' + new Date().toLocaleString('vi-VN');
          btn.disabled = false;
        }, 5000);
      } else {
        throw new Error(result.message || 'Lỗi không xác định');
      }
    })
    .catch(function(err) {
      console.error('Publish error:', err);
      txt.textContent = '🚀 Đăng lên website ngay';
      status.textContent = '';
      btn.disabled = false;
      if (err.message && err.message.indexOf('Bad credentials') !== -1) {
        showToast('❌ Token không hợp lệ! Kiểm tra lại GitHub Token.', 'error', 5000);
      } else {
        showToast('❌ Lỗi: ' + (err.message || 'Không kết nối được GitHub'), 'error', 5000);
      }
    });
  }

  function resetData() {
    requireAdminPassword(
      '🚨 Xác nhận RESET dữ liệu',
      'Thao tác này sẽ XÓA TOÀN BỘ sản phẩm, danh mục bạn đã chỉnh sửa và khôi phục 114 sản phẩm mặc định ban đầu. Không thể hoàn tác!',
      function() {
        localStorage.removeItem('htx_duoclieu_products');
        localStorage.removeItem('htx_duoclieu_categories');
        DataManager.initializeData();
        showToast('Đã reset về dữ liệu mặc định!', 'success');
        renderProductsTable();
      }
    );
  }

  // ===== MODAL UTILITIES =====
  function showModal(name) {
    var backdrop = document.getElementById(name + '-backdrop');
    var modal = document.getElementById(name + '-modal');
    backdrop.style.display = 'block';
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      backdrop.classList.add('open');
      modal.classList.add('open');
    }, 10);
  }

  function closeModal(name) {
    var backdrop = document.getElementById(name + '-backdrop');
    var modal = document.getElementById(name + '-modal');
    backdrop.classList.remove('open');
    modal.classList.remove('open');
    setTimeout(function () {
      backdrop.style.display = 'none';
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }, 300);
  }

  // ===== SIDEBAR MOBILE =====
  /* ====================================================
     ĐƠN HÀNG — quản lý đơn khách đặt trên website
  ==================================================== */
  var _ordersData    = [];
  var _ordersFilter  = 'all';   // all | pending | processing | shipping | completed
  var _ordersSearch  = '';
  var _ordersTimer   = null;

  var ORDERS_API = 'https://htxvungduoclieuqn.vercel.app/api/orders/website';
  var ORDERS_KEY = 'sb_publishable_Ro-ASN8wi-vI-gYcgqKGBw_xXrEV_O7';

  var ORDER_STATUS_MAP = {
    pending:    { label: 'Chờ xử lý', cls: 'status-pending' },
    processing: { label: 'Đang chuẩn bị', cls: 'status-processing' },
    shipping:   { label: 'Đang giao', cls: 'status-shipping' },
    completed:  { label: 'Hoàn thành', cls: 'status-completed' },
    cancelled:  { label: 'Đã hủy', cls: 'status-cancelled' }
  };

  function initOrdersTab() {
    // Build tab HTML if not yet created
    var content = document.getElementById('admin-content');
    if (!document.getElementById('tab-orders')) {
      var sec = document.createElement('section');
      sec.className = 'admin-tab';
      sec.id = 'tab-orders';
      sec.innerHTML = [
        '<div class="content-header">',
        '  <div>',
        '    <h2 class="content-title">📦 Đơn hàng từ website</h2>',
        '    <p class="content-sub" id="orders-sub">Đang tải...</p>',
        '  </div>',
        '  <button class="btn-secondary" id="btn-orders-refresh">🔄 Tải lại</button>',
        '</div>',

        '<div class="orders-toolbar">',
        '  <div class="orders-filters" id="orders-filters">',
        '    <button class="filter-pill active" data-filter="all">Tất cả</button>',
        '    <button class="filter-pill" data-filter="pending">Chờ xử lý</button>',
        '    <button class="filter-pill" data-filter="processing">Đang chuẩn bị</button>',
        '    <button class="filter-pill" data-filter="shipping">Đang giao</button>',
        '    <button class="filter-pill" data-filter="completed">Hoàn thành</button>',
        '  </div>',
        '  <div class="orders-search-wrap">',
        '    <input class="form-control" id="orders-search" placeholder="🔍 Tìm theo tên, SĐT..." />',
        '  </div>',
        '</div>',

        '<div id="orders-list">',
        '  <div class="orders-loading">⏳ Đang tải dữ liệu...</div>',
        '</div>'
      ].join('');
      content.appendChild(sec);

      // Events
      document.getElementById('btn-orders-refresh').addEventListener('click', function() {
        fetchOrders();
      });
      document.getElementById('orders-search').addEventListener('input', function() {
        _ordersSearch = this.value.trim().toLowerCase();
        renderOrdersList();
      });
      document.getElementById('orders-filters').addEventListener('click', function(e) {
        var pill = e.target.closest('.filter-pill');
        if (!pill) return;
        _ordersFilter = pill.dataset.filter;
        document.querySelectorAll('#orders-filters .filter-pill').forEach(function(p) {
          p.classList.toggle('active', p.dataset.filter === _ordersFilter);
        });
        renderOrdersList();
      });
    }

    document.getElementById('tab-orders').style.display = 'block';
    fetchOrders();

    // Auto-refresh mỗi 60 giây
    clearInterval(_ordersTimer);
    _ordersTimer = setInterval(function() {
      if (currentTab === 'orders') fetchOrders(true);
    }, 60000);
  }

  function fetchOrders(silent) {
    if (!silent) {
      var list = document.getElementById('orders-list');
      if (list) list.innerHTML = '<div class="orders-loading">⏳ Đang tải dữ liệu...</div>';
    }
    fetch(ORDERS_API, {
      method: 'GET',
      headers: { 'x-api-key': ORDERS_KEY }
    })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (res.success) {
        _ordersData = res.data || [];
        renderOrdersList();
        updateOrdersBadge();
      } else {
        showOrdersError(res.message);
      }
    })
    .catch(function(err) {
      showOrdersError('Không kết nối được. Kiểm tra mạng.');
    });
  }

  function showOrdersError(msg) {
    var list = document.getElementById('orders-list');
    if (list) list.innerHTML = '<div class="orders-empty">⚠️ ' + escHtml(msg) + '</div>';
    var sub = document.getElementById('orders-sub');
    if (sub) sub.textContent = 'Không tải được dữ liệu';
  }

  function renderOrdersList() {
    var filtered = _ordersData.filter(function(o) {
      var matchStatus = _ordersFilter === 'all' || o.status === _ordersFilter;
      var name  = ((o.customers && o.customers.full_name) || '').toLowerCase();
      var phone = ((o.customers && o.customers.phone) || '').toLowerCase();
      var matchSearch = !_ordersSearch ||
        name.indexOf(_ordersSearch) >= 0 ||
        phone.indexOf(_ordersSearch) >= 0 ||
        String(o.order_number).indexOf(_ordersSearch) >= 0;
      return matchStatus && matchSearch;
    });

    var sub = document.getElementById('orders-sub');
    if (sub) sub.textContent = filtered.length + ' đơn' + (_ordersFilter !== 'all' ? ' — lọc: ' + ORDER_STATUS_MAP[_ordersFilter]?.label : '');

    var list = document.getElementById('orders-list');
    if (!list) return;
    if (!filtered.length) {
      list.innerHTML = '<div class="orders-empty">📢 Không có đơn nào.</div>';
      return;
    }

    list.innerHTML = filtered.map(function(o) {
      var cust    = o.customers || {};
      var items   = o.order_items || [];
      var st      = ORDER_STATUS_MAP[o.status] || { label: o.status, cls: 'status-pending' };
      var date    = o.created_at ? new Date(o.created_at).toLocaleString('vi-VN', {
        day:'2-digit', month:'2-digit', year:'numeric',
        hour:'2-digit', minute:'2-digit'
      }) : o.order_date || '';
      var total   = Number(o.total_amount || 0).toLocaleString('vi-VN') + 'đ';

      var itemsHtml = items.map(function(it) {
        var price = Number(it.unit_price || 0).toLocaleString('vi-VN');
        return '<li>' + escHtml(it.custom_name || '') + ' — <strong>' + price + 'đ</strong></li>';
      }).join('');

      return [
        '<div class="order-card" id="order-' + o.id + '">',
        '  <div class="order-card-header">',
        '    <div class="order-meta">',
        '      <span class="order-num">#' + String(o.order_number).padStart(4,'0') + '</span>',
        '      <span class="order-date">' + date + '</span>',
        '    </div>',
        '    <span class="order-status-badge ' + st.cls + '">' + st.label + '</span>',
        '  </div>',
        '  <div class="order-card-body">',
        '    <div class="order-customer">',
        '      <span>👤 <strong>' + escHtml(cust.full_name || 'N/A') + '</strong></span>',
        '      <span>📞 <a href="tel:' + escHtml(cust.phone||'') + '">' + escHtml(cust.phone || '') + '</a></span>',
        '    </div>',
        '    <details class="order-items-detail">',
        '      <summary>📋 ' + items.length + ' sản phẩm — <strong class="order-total">' + total + '</strong></summary>',
        '      <ul class="order-items-list">' + itemsHtml + '</ul>',
             (o.notes ? '<p class="order-note">📝 ' + escHtml(o.notes) + '</p>' : ''),
        '    </details>',
        '  </div>',
        '</div>'
      ].join('');
    }).join('');
  }

  function updateOrdersBadge() {
    var pending = _ordersData.filter(function(o) { return o.status === 'pending'; }).length;
    var badge   = document.getElementById('orders-badge');
    if (!badge) return;
    if (pending > 0) {
      badge.textContent = pending;
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }

  function initSidebar() {
    var toggle = document.getElementById('sidebar-toggle');
    var sidebar = document.getElementById('admin-sidebar');
    if (toggle && sidebar) {
      toggle.addEventListener('click', function () {
        sidebar.classList.toggle('open');
      });
    }
  }

  // ===== EVENTS =====
  function initEvents() {
    // Tab navigation
    document.querySelectorAll('.sidebar-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tab = this.dataset.tab;
        if (tab) loadTab(tab);
        // Close mobile sidebar
        document.getElementById('admin-sidebar').classList.remove('open');
      });
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', function () {
      sessionStorage.removeItem('htx_admin_logged_in');
      document.getElementById('admin-layout').style.display = 'none';
      document.getElementById('login-overlay').style.display = 'flex';
      document.getElementById('login-password').value = '';
    });

    // Add product
    document.getElementById('btn-add-product').addEventListener('click', function () {
      openProductForm(null);
    });

    // Save product form
    // Save product — ch\u1ec9 d\u00f9ng button click, kh\u00f4ng d\u00f9ng form submit (tr\u00e1nh l\u01b0u 2 l\u1ea7n)
    document.getElementById('product-form').addEventListener('submit', function(e) { e.preventDefault(); });
    document.getElementById('product-form-save').addEventListener('click', saveProduct);
    document.getElementById('product-form-close').addEventListener('click', function () { closeModal('product-form'); });
    document.getElementById('product-form-cancel').addEventListener('click', function () { closeModal('product-form'); });
    document.getElementById('product-form-backdrop').addEventListener('click', function () { closeModal('product-form'); });

    // Image upload — dùng ImgBB nếu có API key, ngược lại dùng base64
    var imageArea = document.getElementById('image-upload-area');
    var imageFile = document.getElementById('form-image-file');
    imageArea.addEventListener('click', function (e) {
      if (e.target.id !== 'image-remove-btn') imageFile.click();
    });
    imageFile.addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) { showToast('Ảnh tối đa 5MB!', 'error'); return; }

      var info = DataManager.getShopInfo();
      var apiKey = info.imgbbApiKey || '';

      if (apiKey) {
        // --- UPLOAD LÊN IMGBB ---
        showToast('⏳ Đang upload ảnh lên cloud...', 'info', 8000);
        var reader = new FileReader();
        reader.onload = function (ev) {
          // Lấy phần base64 (bỏ prefix data:image/...;base64,)
          var b64 = ev.target.result.split(',')[1];
          var formData = new FormData();
          formData.append('key', apiKey);
          formData.append('image', b64);
          fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: formData
          })
          .then(function(res) { return res.json(); })
          .then(function(data) {
            if (data.success) {
              var url = data.data.url;
              document.getElementById('form-image').value = url;
              setImagePreview(url);
              showToast('✅ Đã upload ảnh thành công! Ảnh sẽ hiện trên mọi thiết bị.', 'success');
            } else {
              showToast('❌ ImgBB lỗi: ' + (data.error && data.error.message || 'Không upload được'), 'error');
            }
          })
          .catch(function() {
            showToast('❌ Không kết nối được ImgBB. Kiểm tra lại API Key!', 'error');
          });
        };
        reader.readAsDataURL(file);
      } else {
        // --- FALLBACK: Lưu base64 local (chỉ hiện trên máy này) ---
        var reader2 = new FileReader();
        reader2.onload = function (ev) {
          document.getElementById('form-image').value = ev.target.result;
          setImagePreview(ev.target.result);
          showToast('⚠️ Ảnh chỉ lưu trên máy này! Vào Cài đặt → Điền ImgBB API Key để ảnh hiện trên điện thoại khách.', 'error', 6000);
        };
        reader2.readAsDataURL(file);
      }
    });
    document.getElementById('image-remove-btn').addEventListener('click', function (e) {
      e.stopPropagation();
      document.getElementById('form-image').value = '';
      document.getElementById('form-image-file').value = '';
      setImagePreview('');
    });

    // Add category
    document.getElementById('btn-add-category').addEventListener('click', function () {
      openCategoryForm(null);
    });

    // Save category form
    document.getElementById('cat-form').addEventListener('submit', saveCategory);
    document.getElementById('cat-form-save').addEventListener('click', saveCategory);
    document.getElementById('cat-form-close').addEventListener('click', function () { closeModal('cat-form'); });
    document.getElementById('cat-form-cancel').addEventListener('click', function () { closeModal('cat-form'); });
    document.getElementById('cat-form-backdrop').addEventListener('click', function () { closeModal('cat-form'); });

    // Settings
    document.getElementById('settings-form').addEventListener('submit', saveSettings);
    document.getElementById('btn-save-settings').addEventListener('click', saveSettings);

    // Backup
    document.getElementById('btn-export').addEventListener('click', exportData);
    document.getElementById('import-file').addEventListener('change', handleImportFile);
    document.getElementById('btn-import-confirm').addEventListener('click', confirmImport);
    document.getElementById('btn-reset').addEventListener('click', resetData);

    // Publish to website
    var publishBtn = document.getElementById('btn-publish');
    if (publishBtn) publishBtn.addEventListener('click', publishToWebsite);
    // Auto-load saved token
    var savedToken = localStorage.getItem('htx_gh_token');
    var tokenInput = document.getElementById('github-token');
    if (savedToken && tokenInput) {
      tokenInput.value = savedToken;
    }

    // Admin search & filter
    var adminSearch = document.getElementById('admin-search');
    if (adminSearch) {
      adminSearch.addEventListener('input', function () {
        adminSearchQuery = this.value.trim();
        renderProductsTable();
      });
    }
    var adminCatFilterEl = document.getElementById('admin-cat-filter');
    if (adminCatFilterEl) {
      adminCatFilterEl.addEventListener('change', function () {
        adminCatFilter = this.value;
        renderProductsTable();
      });
    }

    // Keyboard
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeModal('product-form');
        closeModal('cat-form');
      }
    });
  }

  // ===== INIT =====
  function init() {
    DataManager.initializeData();
    initLogin();
    initEvents();
    initSidebar();
    initPwConfirmEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
