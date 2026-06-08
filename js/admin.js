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
      case 'products': renderProductsTable(); break;
      case 'categories': renderCategoriesTable(); break;
      case 'settings': loadSettings(); break;
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

  function confirmImport() {
    if (!importedData) return;
    if (!confirm('XÁC NHẬN nhập dữ liệu?\n\nToàn bộ dữ liệu hiện tại sẽ bị GHI ĐÈ!')) return;
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

  function resetData() {
    if (!confirm('RESET DỮ LIỆU?\n\nToàn bộ thay đổi của bạn sẽ mất!\nHệ thống sẽ khôi phục 114 sản phẩm mặc định ban đầu.')) return;
    if (!confirm('Bạn có CHẮC CHẮN không? Thao tác này không thể hoàn tác!')) return;
    localStorage.removeItem('htx_duoclieu_products');
    localStorage.removeItem('htx_duoclieu_categories');
    // Keep shop info
    DataManager.initializeData();
    showToast('Đã reset về dữ liệu mặc định!', 'success');
    renderProductsTable();
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
    document.getElementById('product-form').addEventListener('submit', saveProduct);
    document.getElementById('product-form-save').addEventListener('click', saveProduct);
    document.getElementById('product-form-close').addEventListener('click', function () { closeModal('product-form'); });
    document.getElementById('product-form-cancel').addEventListener('click', function () { closeModal('product-form'); });
    document.getElementById('product-form-backdrop').addEventListener('click', function () { closeModal('product-form'); });

    // Image upload
    var imageArea = document.getElementById('image-upload-area');
    var imageFile = document.getElementById('form-image-file');
    imageArea.addEventListener('click', function (e) {
      if (e.target.id !== 'image-remove-btn') imageFile.click();
    });
    imageFile.addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) { showToast('Ảnh tối đa 2MB!', 'error'); return; }
      var reader = new FileReader();
      reader.onload = function (ev) {
        document.getElementById('form-image').value = ev.target.result;
        setImagePreview(ev.target.result);
      };
      reader.readAsDataURL(file);
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
