/**
 * =====================================================
 * DATA MANAGER - Module Quản Lý Dữ Liệu
 * Website Bán Dược Liệu Đông Y
 * =====================================================
 * Sử dụng localStorage để lưu trữ dữ liệu.
 * Cung cấp các hàm CRUD cho sản phẩm, danh mục và thông tin cửa hàng.
 * Hỗ trợ xuất/nhập dữ liệu dạng JSON.
 * =====================================================
 */

const DataManager = (function () {
  // ===== KEYS localStorage =====
  const STORAGE_KEYS = {
    products: 'htx_duoclieu_products',
    categories: 'htx_duoclieu_categories',
    shopInfo: 'htx_duoclieu_shopInfo',
  };

  // ===== Tạo ID duy nhất =====
  function generateId() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
  }

  // ===== Đọc / Ghi localStorage =====
  function _read(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Lỗi đọc localStorage:', e);
      return null;
    }
  }

  function _write(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Lỗi ghi localStorage:', e);
    }
  }

  // =====================================================
  //  DỮ LIỆU MẶC ĐỊNH
  // =====================================================

  // ----- Danh mục mặc định -----
  function getDefaultCategories() {
    return [
      { id: 'cat-duoclieu-tho', name: 'Dược liệu thô', description: 'Các loại dược liệu thô, nguyên liệu đông y', createdAt: Date.now() },
      { id: 'cat-cao-hoan', name: 'Cao hoàn', description: 'Viên hoàn, cao bổ dưỡng', createdAt: Date.now() },
      { id: 'cat-tra-duoclieu', name: 'Trà dược liệu', description: 'Các loại trà thảo dược tốt cho sức khoẻ', createdAt: Date.now() },
      { id: 'cat-thang-thuoc', name: 'Thang thuốc', description: 'Các bài thuốc đông y theo thang', createdAt: Date.now() },
      { id: 'cat-siro-chepham', name: 'Siro & Chế phẩm', description: 'Siro, bột hoàn và các chế phẩm đông y', createdAt: Date.now() },
    ];
  }

  // ----- Thông tin cửa hàng mặc định -----
  function getDefaultShopInfo() {
    return {
      name: 'HTX Vùng Dược Liệu Quảng Ninh',
      phone: '0852563386',
      address: '31 Triều Hải, Trại Thông, Bình Khê, Đông Triều, Quảng Ninh',
      facebookLink: '',
      zaloLink: 'https://zalo.me/0852563386',
      messengerLink: '',
      description: 'Chuyên cung cấp dược liệu đông y chất lượng cao - Cam kết sản phẩm sạch, nguồn gốc rõ ràng',
      adminPassword: 'admin123',
    };
  }

  // ----- 114 sản phẩm mặc định -----
  function getDefaultProducts() {
    const now = Date.now();

    const rawData = [
      { name: 'A giao', price: 200000, unit: '1 hộp 250g', category: 'cat-duoclieu-tho' },
      { name: 'Ba kích bóc lõi tươi', price: 300000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Ba kích bóc lõi khô', price: 1015000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Ba kích tươi', price: 250000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Bạch biển đâu', price: 200000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Bách bộ khô', price: 250000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Bạch chỉ', price: 203000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Bách hợp (100g)', price: 128000, unit: '1 lạng (100g)', category: 'cat-duoclieu-tho' },
      { name: 'Bách hợp (1kg)', price: 1280000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Bạch phục linh thái miếng sấy', price: 695000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Bạch thược', price: 685000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Bạch truật thái sao cám gạo', price: 695000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Bán hạ chế', price: 396000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Cam thảo', price: 400000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Can khương', price: 380000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Cát cánh', price: 160000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Cát căn', price: 145000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Cao hoàn bổ khí huyết', price: 350000, unit: '1 lọ viên hoàn 300g', category: 'cat-cao-hoan' },
      { name: 'Cao hoàn bổ xương khớp', price: 350000, unit: '1 lọ viên hoàn 300g', category: 'cat-cao-hoan' },
      { name: 'Câu đằng', price: 170000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Cây thất diệp nhất chi hoa', price: 1300000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Chỉ xác', price: 160000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Cúc nụ', price: 128000, unit: '1 lạng (100g)', category: 'cat-duoclieu-tho' },
      { name: 'Dâm dương hoắc', price: 814000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Đại hồi', price: 483000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Đan bì', price: 738000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Đan sâm thái sấy giòn', price: 695000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Đào nhân', price: 655000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Đẳng sâm sao gừng', price: 1445000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Địa liền', price: 540000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Đinh hương', price: 740000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Đỗ trọng bắc giá', price: 695000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Đương quy', price: 1075000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Giao đằng', price: 195000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Gừng sẻ tươi', price: 35000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Hạ khô thảo', price: 220000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Hà thủ ô đỏ tươi', price: 250000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Hải kim sa', price: 252000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Hậu phác', price: 120000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Hoa tiêu', price: 450000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Hoài sơn bột', price: 428000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Hoài sơn miếng sấy', price: 381000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Hoàng cầm', price: 485000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Hoàng đằng khô', price: 185000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Hoàng kỳ bắc thái lát', price: 940000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Hoàng kỳ nam khô nguyên rễ', price: 375000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Hoàng kỳ nam thái lát sao mật', price: 535000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Hoàng tinh cửu sái', price: 485000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Hoàng tinh tươi', price: 145000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Huyết giác', price: 378000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Hương phụ', price: 172000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Ích mẫu', price: 90000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Ké đầu ngựa', price: 231000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Kê huyết đằng khô', price: 203000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Khiếm thực', price: 577000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Kim anh tử', price: 420000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Kim ngân chỉ hoa', price: 960000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Kỷ tử', price: 802000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Lục vị địa hoàng hoàn', price: 450000, unit: '1 lọ viên hoàn 500g', category: 'cat-cao-hoan' },
      { name: 'Mạch môn sao cát', price: 642000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Mang tiêu', price: 246000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Mía dò', price: 130000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Mộc hương', price: 342000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Ngọc trúc', price: 117000, unit: '1 lạng (100g)', category: 'cat-duoclieu-tho' },
      { name: 'Ngũ vị tử', price: 514000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Ngưu tất', price: 481000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Nhài vàng', price: 588000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Nụ nhài trắng sấy lạnh', price: 1000000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Nhục quế', price: 267000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Nhục thung dung bắc tươi', price: 680000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Nụ hồng', price: 901000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Phòng kỷ', price: 165000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Phòng phong xịn', price: 2940000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Phúc bồn tử giá', price: 1015000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Phục thần', price: 750000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Quế chi', price: 160000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Sa nhân', price: 95000, unit: '1 lạng (100g)', category: 'cat-duoclieu-tho' },
      { name: 'Sài hồ', price: 481000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Siro nấu cô đặc', price: 150000, unit: '1 lít', category: 'cat-siro-chepham' },
      { name: 'Sơn thù du', price: 680000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Sơn tra', price: 160000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Tang thầm - dâu tằm sấy lạnh dẻo', price: 650000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Táo tàu táo đen', price: 262000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Thạch xương bồ', price: 273000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Thái miếng (loại đun nước uống)', price: 802000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Thăng ma', price: 495000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Thập toàn đại bổ', price: 85000, unit: '1 thang', category: 'cat-thang-thuoc' },
      { name: 'Thiên ma', price: 455000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Thiên niên kiện giá', price: 385000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Thổ phục linh', price: 262000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Thủ ô cửu sái nghiên bộ hoàn ra viên', price: 963000, unit: '1 kg', category: 'cat-siro-chepham' },
      { name: 'Thủ ô cửu sái nghiền bột (hòa nước uống)', price: 856000, unit: '1 kg', category: 'cat-siro-chepham' },
      { name: 'Thục địa cửu chưng cửu sái', price: 640000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Thuốc an thai', price: 250000, unit: '1 thang', category: 'cat-thang-thuoc' },
      { name: 'Thuốc bắc hầm', price: 35000, unit: '1 gói', category: 'cat-thang-thuoc' },
      { name: 'Thương truật', price: 642000, unit: '1 gói', category: 'cat-duoclieu-tho' },
      { name: 'Trà an thần, ngủ ngon', price: 30000, unit: '1 gói', category: 'cat-tra-duoclieu' },
      { name: 'Trà ăn ngon ngủ tốt', price: 35000, unit: '1 gói', category: 'cat-tra-duoclieu' },
      { name: 'Trà bổ khí dưỡng khí', price: 30000, unit: '1 gói', category: 'cat-tra-duoclieu' },
      { name: 'Trà dưỡng tỳ vị (5 vị)', price: 35000, unit: '1 gói', category: 'cat-tra-duoclieu' },
      { name: 'Trà dưỡng tỳ vị lợi thấp (3 vị)', price: 30000, unit: '1 gói', category: 'cat-tra-duoclieu' },
      { name: 'Trạch tả', price: 246000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Trần bì', price: 160000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Tri mẫu giá', price: 250000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Trinh nữ hoàng cung', price: 150000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Trinh nữ tử', price: 273000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Tứ quân tử thang giá', price: 33000, unit: '1 thang', category: 'cat-thang-thuoc' },
      { name: 'Tứ vật thang', price: 33000, unit: '1 thang', category: 'cat-thang-thuoc' },
      { name: 'Uất kim', price: 189000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Viễn chí', price: 252000, unit: '1 lạng (100g)', category: 'cat-duoclieu-tho' },
      { name: 'Xáo tam phân', price: 960000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Xuyên khung', price: 353000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Xương gà', price: 682000, unit: '1 kg', category: 'cat-duoclieu-tho' },
      { name: 'Ý dĩ nếp', price: 246000, unit: '1 kg', category: 'cat-duoclieu-tho' },
    ];

    return rawData.map(function (item, index) {
      return {
        id: 'prod-' + (index + 1).toString().padStart(3, '0'),
        name: item.name,
        price: item.price,
        unit: item.unit,
        category: item.category,
        description: '',
        image: '',
        featured: false,
        createdAt: now + index,
      };
    });
  }

  // =====================================================
  //  KHỞI TẠO DỮ LIỆU
  // =====================================================

  /**
   * Khởi tạo dữ liệu mặc định nếu localStorage trống.
   * Chỉ seed dữ liệu khi chưa có dữ liệu nào trong localStorage.
   */
  function initializeData() {
    // Kiểm tra nếu chưa có dữ liệu
    if (!_read(STORAGE_KEYS.categories)) {
      _write(STORAGE_KEYS.categories, getDefaultCategories());
    }
    if (!_read(STORAGE_KEYS.products)) {
      _write(STORAGE_KEYS.products, getDefaultProducts());
    }
    // Luôn đảm bảo thông tin shop có đủ fields
    var shopInfo = _read(STORAGE_KEYS.shopInfo);
    if (!shopInfo) {
      _write(STORAGE_KEYS.shopInfo, getDefaultShopInfo());
    } else {
      // Migration: cập nhật các field còn trống
      var defaults = getDefaultShopInfo();
      var updated = false;
      ['phone','address','zaloLink','description'].forEach(function(key) {
        if (!shopInfo[key] && defaults[key]) {
          shopInfo[key] = defaults[key];
          updated = true;
        }
      });
      if (updated) _write(STORAGE_KEYS.shopInfo, shopInfo);
    }
  }

  // =====================================================
  //  QUẢN LÝ SẢN PHẨM (Products)
  // =====================================================

  /** Lấy danh sách tất cả sản phẩm */
  function getProducts() {
    return _read(STORAGE_KEYS.products) || [];
  }

  /** Lấy sản phẩm theo ID */
  function getProductById(id) {
    var products = getProducts();
    return products.find(function (p) { return p.id === id; }) || null;
  }

  /** Thêm sản phẩm mới */
  function addProduct(productData) {
    var products = getProducts();
    var newProduct = {
      id: generateId(),
      name: productData.name || 'Sản phẩm mới',
      price: Number(productData.price) || 0,
      unit: productData.unit || '',
      category: productData.category || 'cat-duoclieu-tho',
      description: productData.description || '',
      image: productData.image || '',
      featured: productData.featured || false,
      createdAt: Date.now(),
    };
    products.push(newProduct);
    _write(STORAGE_KEYS.products, products);
    return newProduct;
  }

  /** Cập nhật sản phẩm theo ID */
  function updateProduct(id, updatedData) {
    var products = getProducts();
    var index = products.findIndex(function (p) { return p.id === id; });
    if (index === -1) return null;

    // Đảm bảo price luôn là số
    if (updatedData.price !== undefined) {
      updatedData.price = Number(updatedData.price);
    }

    products[index] = Object.assign({}, products[index], updatedData, { id: id });
    _write(STORAGE_KEYS.products, products);
    return products[index];
  }

  /** Xóa sản phẩm theo ID */
  function deleteProduct(id) {
    var products = getProducts();
    var filtered = products.filter(function (p) { return p.id !== id; });
    if (filtered.length === products.length) return false;
    _write(STORAGE_KEYS.products, filtered);
    return true;
  }

  // =====================================================
  //  QUẢN LÝ DANH MỤC (Categories)
  // =====================================================

  /** Lấy danh sách tất cả danh mục */
  function getCategories() {
    return _read(STORAGE_KEYS.categories) || [];
  }

  /** Thêm danh mục mới */
  function addCategory(categoryData) {
    var categories = getCategories();
    var newCategory = {
      id: generateId(),
      name: categoryData.name || 'Danh mục mới',
      description: categoryData.description || '',
      createdAt: Date.now(),
    };
    categories.push(newCategory);
    _write(STORAGE_KEYS.categories, categories);
    return newCategory;
  }

  /** Cập nhật danh mục theo ID */
  function updateCategory(id, updatedData) {
    var categories = getCategories();
    var index = categories.findIndex(function (c) { return c.id === id; });
    if (index === -1) return null;

    categories[index] = Object.assign({}, categories[index], updatedData, { id: id });
    _write(STORAGE_KEYS.categories, categories);
    return categories[index];
  }

  /** Xóa danh mục theo ID */
  function deleteCategory(id) {
    var categories = getCategories();
    var filtered = categories.filter(function (c) { return c.id !== id; });
    if (filtered.length === categories.length) return false;
    _write(STORAGE_KEYS.categories, filtered);
    return true;
  }

  // =====================================================
  //  QUẢN LÝ THÔNG TIN CỬA HÀNG (Shop Info)
  // =====================================================

  /** Lấy thông tin cửa hàng */
  function getShopInfo() {
    return _read(STORAGE_KEYS.shopInfo) || getDefaultShopInfo();
  }

  /** Cập nhật thông tin cửa hàng */
  function updateShopInfo(info) {
    var current = getShopInfo();
    var updated = Object.assign({}, current, info);
    _write(STORAGE_KEYS.shopInfo, updated);
    return updated;
  }

  // =====================================================
  //  XUẤT / NHẬP DỮ LIỆU (Export / Import)
  // =====================================================

  /** Xuất toàn bộ dữ liệu ra chuỗi JSON */
  function exportData() {
    var data = {
      products: getProducts(),
      categories: getCategories(),
      shopInfo: getShopInfo(),
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    return JSON.stringify(data, null, 2);
  }

  /** Nhập dữ liệu từ chuỗi JSON, ghi đè dữ liệu hiện tại */
  function importData(jsonStr) {
    try {
      var data = JSON.parse(jsonStr);

      if (!data.products || !data.categories || !data.shopInfo) {
        throw new Error('Dữ liệu không hợp lệ. Cần có products, categories và shopInfo.');
      }

      // Đảm bảo price là số cho tất cả sản phẩm
      data.products = data.products.map(function (p) {
        p.price = Number(p.price) || 0;
        return p;
      });

      _write(STORAGE_KEYS.products, data.products);
      _write(STORAGE_KEYS.categories, data.categories);
      _write(STORAGE_KEYS.shopInfo, data.shopInfo);

      return { success: true, message: 'Nhập dữ liệu thành công!' };
    } catch (e) {
      return { success: false, message: 'Lỗi nhập dữ liệu: ' + e.message };
    }
  }

  // =====================================================
  //  PUBLIC API
  // =====================================================
  return {
    // Khởi tạo
    initializeData: initializeData,

    // Sản phẩm
    getProducts: getProducts,
    getProductById: getProductById,
    addProduct: addProduct,
    updateProduct: updateProduct,
    deleteProduct: deleteProduct,

    // Danh mục
    getCategories: getCategories,
    addCategory: addCategory,
    updateCategory: updateCategory,
    deleteCategory: deleteCategory,

    // Thông tin cửa hàng
    getShopInfo: getShopInfo,
    updateShopInfo: updateShopInfo,

    // Xuất / Nhập
    exportData: exportData,
    importData: importData,
  };
})();

// Gắn DataManager vào window để sử dụng toàn cục
window.DataManager = DataManager;
