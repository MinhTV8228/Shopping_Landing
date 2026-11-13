/**
/*
 * Product catalogue for the Nõn Sợi bath linen shop.
 * Used by the product detail pages (js/detail-page.js).
 * Exposed as window.Nõn Sợi_PRODUCTS so it never clashes with other scripts.
 */
(function () {
  const LIST = [
    {
      "id": "rob-1",
      "isNew": true,
      "isBestSeller": true,
      "name": "Áo choàng tắm",
      "price": 990000,
      "oldPrice": 1290000,
      "category": "robe",
      "categoryLabel": "Áo choàng tắm",
      "categoryPage": "bath-robes.html",
      "detailPage": "bath-robe-detail.html",
      "image": "images/bath_robe/bathrobe_1.jpg",
      "images": [
        "images/bath_robe/bathrobe_1.jpg",
        "images/bath_robe/bathrobe_2.jpg",
        "images/bath_robe/bathrobe_3.jpg",
        "images/bath_robe/bathrobe_4.jpg",
        "images/bath_robe/bathrobe_5.jpg",
        "images/bath_robe/bathrobe_6.jpg"
      ],
      "care": "Giặt máy ở 30°C, không dùng chất tẩy mạnh, phơi nơi thoáng mát.",
    },
    {
      "id": "btw-1",
      "isNew": true,
      "isSale": true,
      "name": "Khăn tắm 70x140",
      "price": 320000,
      "oldPrice": 400000,
      "description": "Khăn tắm kích thước 70x140cm, thấm hút vượt trội và bền màu sau nhiều lần giặt.",
      "category": "bath",
      "categoryLabel": "Khăn tắm",
      "categoryPage": "bath-towels.html",
      "detailPage": "bath-towel-detail.html",
      "image": "images/bath_towel/bathtowel_1.webp",
      "images": [
        "images/bath_towel/bathtowel_1.webp",
        "images/bath_towel/bathtowel_2.webp",
        "images/bath_towel/bathtowel_3.jpg",
        "images/bath_towel/bathtowel_4.jpg",
        "images/bath_towel/bathtowel_6.webp",
        "images/bath_towel/bathtowel_6.webp"
      ],
      "sizes": ["70x140cm", "90x150cm"],
      "material": "Sợi bamboo hoặc microfiber (tùy phiên bản)",
      "sizeInfo": "70x140cm và 90x150cm",
      "care": "Giặt máy ở 30°C cùng màu, hạn chế sấy nóng để giữ độ mềm.",
    },
    {
      "id": "ftw-1",
      "isNew": true,
      "name": "Khăn mặt 34x76",
      "price": 95000,
      "oldPrice": 125000,
      "description": "Khăn mặt 34x76cm, mềm mịn và thấm hút tốt cho da mặt.",
      "category": "face",
      "categoryLabel": "Khăn mặt",
      "categoryPage": "face-towels.html",
      "detailPage": "face-towel-detail.html",
      "image": "images/face_towel/facetowel_1.jpg",
      "images": [
        "images/face_towel/facetowel_1.jpg",
        "images/face_towel/facetowel_2.jpg",
        "images/face_towel/facetowel_3.webp",
        "images/face_towel/facetowel_4.webp",
        "images/face_towel/facetowel_5.jpg",
        "images/face_towel/facetowel_6.jpg"
      ],
      "sizes": ["34x76cm", "40x80cm"],
      "material": "sợi bamboo hoặc microfiber (tùy phiên bản)",
      "sizeInfo": "34x76cm và 40x80cm",
      "care": "Giặt máy ở 30°C, phơi khô hoàn toàn trước khi dùng lại.",
    },
    {
      "id": "htw-1",
      "isNew": true,
      "name": "Khăn tay 30x30",
      "price": 45000,
      "oldPrice": 59000,
      "description": "Khăn tay 30x30cm, nhỏ gọn và thấm hút tốt.",
      "category": "hand",
      "categoryLabel": "Khăn tay",
      "categoryPage": "hand-towels.html",
      "detailPage": "hand-towel-detail.html",
      "image": "images/hand_towel/facetowel_1.avif",
      "images": [
        "images/hand_towel/facetowel_1.avif",
        "images/hand_towel/handtowel_2.jpg",
        "images/hand_towel/handtowel_3.jpg",
        "images/hand_towel/handtowel_4.jpg",
        "images/hand_towel/handtowel_5.webp",
        "images/hand_towel/handtowel_6.jpg"
      ],
      "sizes": ["30x30cm", "40x40cm"],
      "material": "Sợi bamboo hoặc microfiber (tùy phiên bản)",
      "sizeInfo": "30x30cm và 40x40cm",
      "care": "Giặt máy ở 30°C, có thể ủi ở nhiệt độ thấp.",
    }
  ];

  const ROBE_DETAILS = {
    description: "Áo choàng tắm unisex, dệt trơn từ 50% xơ chuối và 50% cotton; cổ kimono, tay lỡ, đai buộc và hai túi trước.",
    material: "50% xơ chuối, 50% cotton",
    weave: "Dệt trơn, bề mặt phẳng (plain weave)",
    style: "Áo unisex, cổ kimono, tay lỡ, đai buộc và hai túi trước",
    sizes: ["S", "M", "L", "XL", "XXL"],
    sizeInfo: "S, M, L, XL, XXL",
    materialSource: "Xơ từ thân chuối sau thu hoạch tại Việt Nam, phối cùng cotton",
    developer: "Nõn Sợi",
    manufacturer: "Nõn Sợi, Việt Nam",
    developmentYear: 2026
  };

  const TEXTILE_DETAILS = {
    material: "50% xơ chuối, 50% cotton",
    materialSource: "Xơ từ thân chuối sau thu hoạch tại Việt Nam, phối cùng cotton",
    developer: "Nõn Sợi",
    manufacturer: "Nõn Sợi, Việt Nam",
    developmentYear: 2026,
    care: "Giặt máy ở 30°C, không dùng chất tẩy mạnh, phơi nơi thoáng mát."
  };

  const PRODUCTS = LIST.map(function (product) {
    return Object.assign(
      {},
      product,
      TEXTILE_DETAILS,
      product.category === 'robe' ? ROBE_DETAILS : {}
    );
  });

  window.NONSOI_PRODUCTS = PRODUCTS;

  window.getNonsoiProducts = function (category) {
  if (!category) return PRODUCTS.slice();
  return PRODUCTS.filter(function (p) {
    return p.category === category;
  });
};

window.findNonsoiProduct = function (id) {
  return PRODUCTS.find(function (p) { return p.id === id; }) || null;
};
})();
