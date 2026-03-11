export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  theme: string;
  popularity: number;
  description: string;
  stock: number;
  images: string[];
  layout: string;
  profile: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Neon Dreams",
    price: 899000,
    image: "https://images.unsplash.com/photo-1721492631645-d8c12f883bb9?w=500",
    theme: "Colorful",
    popularity: 95,
    description:
      "• Dòng sản phẩm: Colorful\n• Phân khúc: Tầm trung (899.000₫) — phù hợp cho người mới bắt đầu muốn thử phong cách nổi bật\n• Layout: 65% — nhỏ gọn, giữ lại phím mũi tên và một số phím chức năng thiết yếu, tiết kiệm diện tích bàn làm việc\n• Profile: Cherry — thấp, thoải mái khi gõ lâu\n• Chất liệu: PBT dye-sub chống bóng, legends sắc nét dưới đèn RGB\n• Thiết kế: Gradient neon tím – xanh bắt mắt, lý tưởng cho streamer và game thủ thích setup cá tính",
    stock: 12,
    layout: "65%",
    profile: "Cherry",
    images: [
      "https://images.unsplash.com/photo-1721492631645-d8c12f883bb9?w=800",
      "https://images.unsplash.com/photo-1645802106095-765b7e86f5bb?w=800",
      "https://images.unsplash.com/photo-1615869442289-f35f5173db8d?w=800",
    ],
  },
  {
    id: "2",
    name: "Cyber Punk",
    price: 1299000,
    image: "https://images.unsplash.com/photo-1645802106095-765b7e86f5bb?w=500",
    theme: "RGB",
    popularity: 88,
    description:
      "• Dòng sản phẩm: RGB cao cấp\n• Phân khúc: Trên trung bình (1.299.000₫) — chỉ sau Carbon Fiber trong bộ sưu tập\n• Layout: TKL (Tenkeyless) — bỏ cụm numpad, giữ đầy đủ F-row và navigation, cân bằng giữa tiện ích và không gian\n• Profile: OEM — hơi nghiêng, quen thuộc với đa số người dùng\n• Chất liệu: ABS doubleshot xuyên sáng đều, tương thích hoàn hảo với mọi bàn phím RGB\n• Thiết kế: Phong cách cyberpunk tương lai với tông tím – cam neon, dành cho game thủ và dân chơi setup đêm",
    stock: 8,
    layout: "TKL",
    profile: "OEM",
    images: [
      "https://images.unsplash.com/photo-1645802106095-765b7e86f5bb?w=800",
      "https://images.unsplash.com/photo-1721492631645-d8c12f883bb9?w=800",
      "https://images.unsplash.com/photo-1702834000621-76c4a9d15868?w=800",
    ],
  },
  {
    id: "3",
    name: "Minimalist White",
    price: 699000,
    image: "https://images.unsplash.com/photo-1615869442289-f35f5173db8d?w=500",
    theme: "Minimal",
    popularity: 92,
    description:
      "• Dòng sản phẩm: Minimal\n• Phân khúc: Giá rẻ nhất (699.000₫) — rẻ nhất trong toàn bộ bộ sưu tập, phù hợp ngân sách hạn chế\n• Layout: 60% — siêu nhỏ gọn, chỉ giữ lại các phím chính, tối ưu cho bàn phím compact và desk setup tối giản\n• Profile: DSA — phẳng đều, dễ hoán đổi vị trí keycap\n• Chất liệu: PBT bề mặt hơi nhám chống trượt, legends xám nhạt tinh tế\n• Thiết kế: Tone trắng thuần phối được với mọi deskmat, lý tưởng cho không gian làm việc chuyên nghiệp",
    stock: 15,
    layout: "60%",
    profile: "DSA",
    images: [
      "https://images.unsplash.com/photo-1615869442289-f35f5173db8d?w=800",
      "https://images.unsplash.com/photo-1721492631645-d8c12f883bb9?w=800",
      "https://images.unsplash.com/photo-1645802106095-765b7e86f5bb?w=800",
    ],
  },
  {
    id: "4",
    name: "Retro Wave",
    price: 999000,
    image: "https://images.unsplash.com/photo-1702834000621-76c4a9d15868?w=500",
    theme: "Retro",
    popularity: 85,
    description:
      "• Dòng sản phẩm: Retro\n• Phân khúc: Trung bình (999.000₫) — nhỉnh hơn Neon Dreams và Sunset Gradient một chút\n• Layout: 75% — giữ lại F-row và phím điều hướng trong thiết kế nhỏ gọn, cân bằng nhất giữa chức năng và kích thước\n• Profile: SA — cao, bề mặt cầu lõm đặc trưng, tạo cảm giác gõ thock rất sướng\n• Chất liệu: ABS dày, âm thanh trầm ấm\n• Thiết kế: Gradient hồng – tím lấy cảm hứng thập niên 80, phong cách synthwave hoài cổ dành cho dân sưu tầm",
    stock: 20,
    layout: "75%",
    profile: "SA",
    images: [
      "https://images.unsplash.com/photo-1702834000621-76c4a9d15868?w=800",
      "https://images.unsplash.com/photo-1615869442289-f35f5173db8d?w=800",
      "https://images.unsplash.com/photo-1645802106095-765b7e86f5bb?w=800",
    ],
  },
  {
    id: "5",
    name: "Ocean Blues",
    price: 799000,
    image: "https://images.unsplash.com/photo-1721492631645-d8c12f883bb9?w=500",
    theme: "Colorful",
    popularity: 78,
    description:
      "• Dòng sản phẩm: Colorful\n• Phân khúc: Giá rẻ (799.000₫) — chỉ nhỉnh hơn Minimalist White\n• Layout: Full-size (104 phím) — đầy đủ cụm numpad, phù hợp cho dân văn phòng, kế toán hoặc ai cần nhập số liệu nhiều\n• Profile: Cherry — thấp, thoải mái gõ cả ngày không mỏi\n• Chất liệu: PBT dye-sub bền màu, legends sắc nét qua thời gian\n• Thiết kế: Tone xanh đại dương sâu kết hợp hoạ tiết sóng biển, mang lại cảm giác thư giãn và tập trung",
    stock: 10,
    layout: "FULL",
    profile: "Cherry",
    images: [
      "https://images.unsplash.com/photo-1721492631645-d8c12f883bb9?w=800",
      "https://images.unsplash.com/photo-1702834000621-76c4a9d15868?w=800",
      "https://images.unsplash.com/photo-1615869442289-f35f5173db8d?w=800",
    ],
  },
  {
    id: "6",
    name: "Cherry Blossom",
    price: 1199000,
    image: "https://images.unsplash.com/photo-1645802106095-765b7e86f5bb?w=500",
    theme: "Pastel",
    popularity: 90,
    description:
      "• Dòng sản phẩm: Pastel\n• Phân khúc: Cao cấp (1.199.000₫) — đắt hơn hầu hết sản phẩm, chỉ rẻ hơn Cyber Punk và Carbon Fiber\n• Layout: 65% — nhỏ gọn có phím mũi tên, tiện cho cả làm việc lẫn gaming\n• Profile: MT3 — cao với độ cong spherical đặc biệt, ôm đầu ngón tay, trải nghiệm gõ thock độc đáo\n• Chất liệu: PBT dày, legends pastel hồng bền màu\n• Thiết kế: Lấy cảm hứng từ hoa anh đào Nhật Bản, tone hồng – trắng dịu dàng, rất được ưa chuộng trong cộng đồng keycap",
    stock: 5,
    layout: "65%",
    profile: "MT3",
    images: [
      "https://images.unsplash.com/photo-1645802106095-765b7e86f5bb?w=800",
      "https://images.unsplash.com/photo-1721492631645-d8c12f883bb9?w=800",
      "https://images.unsplash.com/photo-1702834000621-76c4a9d15868?w=800",
    ],
  },
  {
    id: "7",
    name: "Carbon Fiber",
    price: 1499000,
    image: "https://images.unsplash.com/photo-1615869442289-f35f5173db8d?w=500",
    theme: "Dark",
    popularity: 87,
    description:
      "• Dòng sản phẩm: Dark — Premium\n• Phân khúc: Đắt nhất (1.499.000₫) — cao nhất trong toàn bộ bộ sưu tập tiêu chuẩn\n• Layout: TKL — bỏ numpad, tập trung vào gaming và workflow hiệu quả\n• Profile: XDA — phẳng đều, thấp vừa phải, dễ làm quen và hoán đổi keycap linh hoạt\n• Chất liệu: Bề mặt giả sợi carbon chống trượt, lớp matte finish cao cấp, legends tối giản\n• Thiết kế: Tổng thể stealth và sang trọng, dành cho người dùng đề cao chất lượng và sẵn sàng đầu tư cho bộ keycap đẳng cấp nhất",
    stock: 7,
    layout: "TKL",
    profile: "XDA",
    images: [
      "https://images.unsplash.com/photo-1615869442289-f35f5173db8d?w=800",
      "https://images.unsplash.com/photo-1645802106095-765b7e86f5bb?w=800",
      "https://images.unsplash.com/photo-1721492631645-d8c12f883bb9?w=800",
    ],
  },
  {
    id: "8",
    name: "Sunset Gradient",
    price: 949000,
    image: "https://images.unsplash.com/photo-1702834000621-76c4a9d15868?w=500",
    theme: "Colorful",
    popularity: 82,
    description:
      "• Dòng sản phẩm: Colorful\n• Phân khúc: Tầm trung (949.000₫) — rẻ hơn Retro Wave một chút, cùng tầm Neon Dreams\n• Layout: 60% — compact, lý tưởng cho người thích bàn phím nhỏ gọn và mang theo di động\n• Profile: OEM — hơi nghiêng, phổ biến và dễ tương thích với đa số bàn phím cơ\n• Chất liệu: Legends xuyên sáng (shine-through), kết hợp gradient cam – tím\n• Thiết kế: Hiệu ứng ánh sáng ấm áp buổi chiều tà, phù hợp cả gaming lẫn làm việc, đặc biệt đẹp khi bật RGB tone warm",
    stock: 18,
    layout: "60%",
    profile: "OEM",
    images: [
      "https://images.unsplash.com/photo-1702834000621-76c4a9d15868?w=800",
      "https://images.unsplash.com/photo-1615869442289-f35f5173db8d?w=800",
      "https://images.unsplash.com/photo-1645802106095-765b7e86f5bb?w=800",
    ],
  },
];

export const limitedEditions = [
  {
    id: "le1",
    title: "GALAXY EDITION",
    subtitle: "Limited to 500 units worldwide",
    image:
      "https://images.unsplash.com/photo-1721492631645-d8c12f883bb9?w=1200",
    price: 1999000,
  },
  {
    id: "le2",
    title: "VAPORWAVE AESTHETIC",
    subtitle: "Exclusive collaboration drop",
    image:
      "https://images.unsplash.com/photo-1645802106095-765b7e86f5bb?w=1200",
    price: 1799000,
  },
  {
    id: "le3",
    title: "ARCTIC FROST",
    subtitle: "Winter collection 2026",
    image:
      "https://images.unsplash.com/photo-1615869442289-f35f5173db8d?w=1200",
    price: 1599000,
  },
];
