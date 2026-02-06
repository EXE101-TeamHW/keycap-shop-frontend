// src/app/utils/initCart.ts
import { CartService } from "../services/cart";
import { products } from "../data/products";

// Hàm khởi tạo giỏ hàng mẫu (chỉ dùng cho demo)
export function initDemoCart() {
  // Kiểm tra xem đã có giỏ hàng chưa
  const existingCart = CartService.getCart();
  
  // Nếu chưa có giỏ hàng, thêm một số sản phẩm mẫu
  if (existingCart.length === 0) {
    CartService.addToCart(products[0], 1); // Neon Dreams
    CartService.addToCart(products[1], 2); // Cyber Punk
    CartService.addToCart(products[3], 1); // Retro Wave
  }
}

// Gọi hàm này khi app khởi động (chỉ cho demo)
// Trong production, giỏ hàng sẽ được quản lý bởi user actions
if (typeof window !== 'undefined') {
  // Chỉ init cart nếu chưa có flag
  const hasInitCart = localStorage.getItem('cart-initialized');
  if (!hasInitCart) {
    initDemoCart();
    localStorage.setItem('cart-initialized', 'true');
  }
}