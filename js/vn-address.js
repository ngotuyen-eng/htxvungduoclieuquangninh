/**
 * vn-address.js
 * Dữ liệu địa giới hành chính Việt Nam TRƯỚC SÁP NHẬP (63 tỉnh/TP)
 * Đầy đủ cho Quảng Ninh - trọng tâm hoạt động HTX
 */

var VNAddress = (function () {

  /* =====================================================
     TỈNH / THÀNH PHỐ (63 tỉnh trước sáp nhập 2025)
  ===================================================== */
  var PROVINCES = [
    'An Giang','Bà Rịa - Vũng Tàu','Bắc Giang','Bắc Kạn','Bạc Liêu',
    'Bắc Ninh','Bến Tre','Bình Định','Bình Dương','Bình Phước',
    'Bình Thuận','Cà Mau','Cần Thơ','Cao Bằng','Đà Nẵng',
    'Đắk Lắk','Đắk Nông','Điện Biên','Đồng Nai','Đồng Tháp',
    'Gia Lai','Hà Giang','Hà Nam','Hà Nội','Hà Tĩnh',
    'Hải Dương','Hải Phòng','Hậu Giang','Hòa Bình','Hưng Yên',
    'Khánh Hòa','Kiên Giang','Kon Tum','Lai Châu','Lâm Đồng',
    'Lạng Sơn','Lào Cai','Long An','Nam Định','Nghệ An',
    'Ninh Bình','Ninh Thuận','Phú Thọ','Phú Yên','Quảng Bình',
    'Quảng Nam','Quảng Ngãi','Quảng Ninh','Quảng Trị','Sóc Trăng',
    'Sơn La','Tây Ninh','Thái Bình','Thái Nguyên','Thanh Hóa',
    'Thừa Thiên Huế','Tiền Giang','TP Hồ Chí Minh','Trà Vinh','Tuyên Quang',
    'Vĩnh Long','Vĩnh Phúc','Yên Bái'
  ];

  /* =====================================================
     HUYỆN / QUẬN / THỊ XÃ / TP TRỰC THUỘC TỈNH
  ===================================================== */
  var DISTRICTS = {
    'Quảng Ninh': [
      'TP Hạ Long','TP Móng Cái','TP Cẩm Phả','TP Uông Bí',
      'TX Quảng Yên','TX Đông Triều',
      'H. Bình Liêu','H. Tiên Yên','H. Đầm Hà','H. Hải Hà',
      'H. Ba Chẽ','H. Vân Đồn','H. Cô Tô'
    ],
    'Hà Nội': [
      'Q. Ba Đình','Q. Bắc Từ Liêm','Q. Cầu Giấy','Q. Đống Đa',
      'Q. Hà Đông','Q. Hai Bà Trưng','Q. Hoàn Kiếm','Q. Hoàng Mai',
      'Q. Long Biên','Q. Nam Từ Liêm','Q. Tây Hồ','Q. Thanh Xuân',
      'Q. Thanh Trì','H. Ba Vì','H. Chương Mỹ','H. Đan Phượng',
      'H. Đông Anh','H. Gia Lâm','H. Hoài Đức','H. Mê Linh',
      'H. Mỹ Đức','H. Phú Xuyên','H. Phúc Thọ','H. Quốc Oai',
      'H. Sóc Sơn','H. Thạch Thất','H. Thanh Oai','H. Thường Tín',
      'H. Ứng Hòa','TX Sơn Tây'
    ],
    'Hải Phòng': [
      'Q. Dương Kinh','Q. Đồ Sơn','Q. Hải An','Q. Hồng Bàng',
      'Q. Kiến An','Q. Lê Chân','Q. Ngô Quyền','Q. Thanh Khê',
      'H. An Dương','H. An Lão','H. Bạch Long Vĩ','H. Cát Hải',
      'H. Kiến Thụy','H. Tiên Lãng','H. Vĩnh Bảo','H. Thủy Nguyên'
    ],
    'TP Hồ Chí Minh': [
      'Q. 1','Q. 3','Q. 4','Q. 5','Q. 6','Q. 7','Q. 8',
      'Q. 10','Q. 11','Q. 12','Q. Bình Tân','Q. Bình Thạnh',
      'Q. Gò Vấp','Q. Phú Nhuận','Q. Tân Bình','Q. Tân Phú',
      'TP Thủ Đức','H. Bình Chánh','H. Cần Giờ','H. Củ Chi',
      'H. Hóc Môn','H. Nhà Bè'
    ],
    'Đà Nẵng': [
      'Q. Cẩm Lệ','Q. Hải Châu','Q. Liên Chiểu','Q. Ngũ Hành Sơn',
      'Q. Sơn Trà','Q. Thanh Khê','H. Hòa Vang','H. Hoàng Sa'
    ],
    'Thanh Hóa': [
      'TP Thanh Hóa','TX Bỉm Sơn','TX Nghi Sơn','TX Sầm Sơn',
      'H. Bá Thước','H. Cẩm Thủy','H. Đông Sơn','H. Hà Trung',
      'H. Hậu Lộc','H. Lang Chánh','H. Mường Lát','H. Nga Sơn',
      'H. Ngọc Lặc','H. Như Thanh','H. Như Xuân','H. Nông Cống',
      'H. Quan Hóa','H. Quan Sơn','H. Quảng Xương','H. Thạch Thành',
      'H. Thiệu Hóa','H. Thọ Xuân','H. Thường Xuân','H. Tĩnh Gia',
      'H. Triệu Sơn','H. Vĩnh Lộc','H. Yên Định'
    ],
    'Nghệ An': [
      'TP Vinh','TX Cửa Lò','TX Hoàng Mai','TX Thái Hòa',
      'H. Anh Sơn','H. Con Cuông','H. Diễn Châu','H. Đô Lương',
      'H. Hưng Nguyên','H. Kỳ Sơn','H. Nam Đàn','H. Nghi Lộc',
      'H. Nghĩa Đàn','H. Quế Phong','H. Quỳ Châu','H. Quỳ Hợp',
      'H. Quỳnh Lưu','H. Tân Kỳ','H. Thanh Chương','H. Tương Dương',
      'H. Yên Thành'
    ],
    'Thái Nguyên': [
      'TP Thái Nguyên','TP Sông Công','TX Phổ Yên',
      'H. Định Hóa','H. Đại Từ','H. Đồng Hỷ','H. Phú Bình',
      'H. Phú Lương','H. Võ Nhai'
    ],
    'Bắc Giang': [
      'TP Bắc Giang',
      'H. Hiệp Hòa','H. Lạng Giang','H. Lục Nam','H. Lục Ngạn',
      'H. Sơn Động','H. Tân Yên','H. Việt Yên','H. Yên Dũng','H. Yên Thế'
    ],
    'Lào Cai': [
      'TP Lào Cai',
      'H. Bắc Hà','H. Bảo Thắng','H. Bảo Yên','H. Bát Xát',
      'H. Mường Khương','H. Sa Pa','H. Si Ma Cai','H. Văn Bàn'
    ],
    'Hà Tĩnh': [
      'TP Hà Tĩnh','TX Hồng Lĩnh','TX Kỳ Anh',
      'H. Cẩm Xuyên','H. Can Lộc','H. Đức Thọ','H. Hương Khê',
      'H. Hương Sơn','H. Kỳ Anh','H. Lộc Hà','H. Nghi Xuân',
      'H. Thạch Hà','H. Vũ Quang'
    ],
    'Bình Định': [
      'TP Quy Nhơn','TX An Nhơn','TX Hoài Nhơn',
      'H. An Lão','H. Hoài Ân','H. Phù Cát','H. Phù Mỹ',
      'H. Tây Sơn','H. Tuy Phước','H. Vân Canh','H. Vĩnh Thạnh'
    ],
    'Lâm Đồng': [
      'TP Đà Lạt','TP Bảo Lộc',
      'H. Bảo Lâm','H. Cát Tiên','H. Đạ Huoai','H. Đạ Tẻh',
      'H. Di Linh','H. Đơn Dương','H. Đức Trọng','H. Lạc Dương','H. Lâm Hà'
    ],
    'Khánh Hòa': [
      'TP Nha Trang','TP Cam Ranh','TX Ninh Hòa',
      'H. Cam Lâm','H. Diên Khánh','H. Khánh Sơn','H. Khánh Vĩnh','H. Trường Sa','H. Vạn Ninh'
    ],
    'Đồng Nai': [
      'TP Biên Hòa','TX Long Khánh',
      'H. Cẩm Mỹ','H. Định Quán','H. Long Thành','H. Nhơn Trạch',
      'H. Tân Phú','H. Thống Nhất','H. Trảng Bom','H. Vĩnh Cửu','H. Xuân Lộc'
    ],
    'Bình Dương': [
      'TP Thủ Dầu Một','TX Bến Cát','TX Dĩ An','TX Tân Uyên','TX Thuận An',
      'H. Bàu Bàng','H. Bắc Tân Uyên','H. Dầu Tiếng','H. Phú Giáo'
    ],
    'An Giang': [
      'TP Long Xuyên','TP Châu Đốc','TX Tân Châu',
      'H. An Phú','H. Châu Phú','H. Châu Thành','H. Chợ Mới',
      'H. Phú Tân','H. Thoại Sơn','H. Tịnh Biên','H. Tri Tôn'
    ],
    'Kiên Giang': [
      'TP Rạch Giá','TP Hà Tiên','TX Kiên Lương',
      'H. An Biên','H. An Minh','H. Châu Thành','H. Giang Thành',
      'H. Giồng Riềng','H. Gò Quao','H. Hòn Đất','H. Phú Quốc',
      'H. Tân Hiệp','H. U Minh Thượng','H. Vĩnh Thuận'
    ],
    'Cần Thơ': [
      'Q. Bình Thủy','Q. Cái Răng','Q. Ninh Kiều','Q. Ô Môn','Q. Thốt Nốt',
      'H. Cờ Đỏ','H. Phong Điền','H. Thới Lai','H. Vĩnh Thạnh'
    ],
    'Hải Dương': [
      'TP Hải Dương','TX Kinh Môn',
      'H. Bình Giang','H. Cẩm Giàng','H. Gia Lộc','H. Kim Thành',
      'H. Nam Sách','H. Ninh Giang','H. Thanh Hà','H. Thanh Miện','H. Tứ Kỳ'
    ],
    'Quảng Nam': [
      'TP Tam Kỳ','TP Hội An','TX Điện Bàn',
      'H. Bắc Trà My','H. Duy Xuyên','H. Đại Lộc','H. Đông Giang',
      'H. Hiệp Đức','H. Nam Giang','H. Nam Trà My','H. Nông Sơn',
      'H. Núi Thành','H. Phú Ninh','H. Phước Sơn','H. Quế Sơn',
      'H. Tây Giang','H. Thăng Bình','H. Tiên Phước'
    ],
    'Thừa Thiên Huế': [
      'TP Huế','TX Hương Thủy','TX Hương Trà',
      'H. A Lưới','H. Nam Đông','H. Phong Điền','H. Phú Lộc','H. Phú Vang','H. Quảng Điền'
    ],
    'Đắk Lắk': [
      'TP Buôn Ma Thuột','TX Buôn Hồ',
      'H. Buôn Đôn','H. Cư Kuin','H. Cư M\'gar','H. Ea H\'leo',
      'H. Ea Kar','H. Ea Súp','H. Krông Ana','H. Krông Bông',
      'H. Krông Búk','H. Krông Năng','H. Krông Pắc','H. Lắk','H. M\'Đrắk'
    ]
  };

  /* =====================================================
     XÃ / PHƯỜNG / THỊ TRẤN — ĐẦY ĐỦ QUẢNG NINH (trước sáp nhập)
  ===================================================== */
  var COMMUNES = {
    // ---- TX ĐÔNG TRIỀU ----
    'TX Đông Triều': [
      'P. Mạo Khê','P. Đông Triều','P. Tràng An','P. Đức Chính','P. Kim Sơn',
      'X. An Sinh','X. Bình Khê','X. Hoàng Quế','X. Hồng Phong',
      'X. Hồng Thái Đông','X. Hồng Thái Tây','X. Nguyễn Huệ',
      'X. Tân Việt','X. Tràng Lương','X. Việt Dân','X. Xuân Sơn',
      'X. Yên Đức','X. Yên Thọ'
    ],
    // ---- TP HẠ LONG ----
    'TP Hạ Long': [
      'P. Bãi Cháy','P. Cao Thắng','P. Cao Xanh','P. Đại Yên',
      'P. Giếng Đáy','P. Hà Khẩu','P. Hà Khánh','P. Hà Lầm',
      'P. Hà Phong','P. Hà Trung','P. Hà Tu','P. Hồng Gai',
      'P. Hồng Hà','P. Hồng Hải','P. Hùng Thắng','P. Tuần Châu',
      'P. Trần Hưng Đạo','P. Việt Hưng','P. Yết Kiêu',
      'X. Dân Chủ','X. Đồng Lâm','X. Đồng Tiến','X. Hoà Bình','X. Sơn Dương','X. Thống Nhất'
    ],
    // ---- TP CẨM PHẢ ----
    'TP Cẩm Phả': [
      'P. Cẩm Bình','P. Cẩm Đông','P. Cẩm Phú','P. Cẩm Sơn',
      'P. Cẩm Tây','P. Cẩm Thạch','P. Cẩm Thành','P. Cẩm Thịnh',
      'P. Cẩm Thủy','P. Cẩm Trung','P. Mông Dương','P. Quang Hanh',
      'X. Cẩm Hải','X. Cộng Hòa','X. Dương Huy'
    ],
    // ---- TP UÔNG BÍ ----
    'TP Uông Bí': [
      'P. Bắc Sơn','P. Điền Công','P. Phương Đông','P. Phương Nam',
      'P. Quang Trung','P. Thanh Sơn','P. Trưng Vương','P. Vàng Danh',
      'P. Yên Thanh','X. Thượng Yên Công'
    ],
    // ---- TX QUẢNG YÊN ----
    'TX Quảng Yên': [
      'P. Đông Mai','P. Giếng Đáy','P. Hà An','P. Minh Thành',
      'P. Nam Hoà','P. Phong Hải','P. Quảng Yên','P. Tân An',
      'P. Yên Giang','P. Yên Hải','P. Yên Thanh',
      'X. Cẩm La','X. Coong Kiều','X. Hoàng Tân','X. Liên Hòa',
      'X. Liên Vị','X. Sông Khoai','X. Tiền Phong'
    ],
    // ---- TP MÓNG CÁI ----
    'TP Móng Cái': [
      'P. Bình Ngọc','P. Hải Đông','P. Hải Hòa','P. Hải Xuân',
      'P. Hải Yên','P. Ka Long','P. Ninh Dương','P. Trà Cổ',
      'X. Bắc Sơn','X. Hải Sơn','X. Hải Tiến','X. Móng Cái',
      'X. Quảng Nghĩa','X. Thắng Lợi','X. Vạn Ninh','X. Vĩnh Trung','X. Vĩnh Thực'
    ],
    // ---- H. BÌNH LIÊU ----
    'H. Bình Liêu': [
      'TT. Bình Liêu',
      'X. Đồng Tâm','X. Đồng Văn','X. Hoành Mô','X. Húc Động',
      'X. Lục Hồn','X. Tình Húc','X. Vô Ngại'
    ],
    // ---- H. TIÊN YÊN ----
    'H. Tiên Yên': [
      'TT. Tiên Yên',
      'X. Đại Dực','X. Đại Thành','X. Điền Xá','X. Đồng Rui',
      'X. Hà Lâu','X. Hải Lạng','X. Phong Dụ','X. Yên Than'
    ],
    // ---- H. ĐẦM HÀ ----
    'H. Đầm Hà': [
      'TT. Đầm Hà',
      'X. Dực Yên','X. Đầm Hà','X. Quảng An','X. Quảng Lâm',
      'X. Quảng Lợi','X. Quảng Tân','X. Tân Bình'
    ],
    // ---- H. HẢI HÀ ----
    'H. Hải Hà': [
      'TT. Quảng Hà',
      'X. Cái Chiên','X. Đường Hoa','X. Phú Hải','X. Quảng Chính',
      'X. Quảng Điền','X. Quảng Long','X. Quảng Minh','X. Quảng Phong',
      'X. Quảng Sơn','X. Quảng Thắng','X. Quảng Thịnh','X. Tiến Tới'
    ],
    // ---- H. BA CHẼ ----
    'H. Ba Chẽ': [
      'TT. Ba Chẽ',
      'X. Đạp Thanh','X. Lương Mông','X. Minh Cầm','X. Nam Sơn',
      'X. Thanh Lâm','X. Thanh Sơn','X. Đồn Đạc'
    ],
    // ---- H. VÂN ĐỒN ----
    'H. Vân Đồn': [
      'TT. Cái Rồng',
      'X. Bản Sen','X. Đài Xuyên','X. Đoàn Kết','X. Hạ Long',
      'X. Minh Châu','X. Ngọc Vừng','X. Quan Lạn','X. Thắng Lợi',
      'X. Vạn Yên','X. Bình Dân'
    ],
    // ---- H. CÔ TÔ ----
    'H. Cô Tô': [
      'TT. Cô Tô',
      'X. Đồng Tiến','X. Thanh Lân'
    ]
  };

  /* =====================================================
     PUBLIC API
  ===================================================== */
  return {
    getProvinces: function () { return PROVINCES.slice(); },

    getDistricts: function (province) {
      return (DISTRICTS[province] || []).slice();
    },

    getCommunes: function (district) {
      return (COMMUNES[district] || []).slice();
    },

    hasCommunes: function (district) {
      return !!(COMMUNES[district] && COMMUNES[district].length);
    }
  };
})();
