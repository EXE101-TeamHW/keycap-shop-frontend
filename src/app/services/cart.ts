// src/app/services/cart.ts
import { Product } from "../data/products";

export interface CartItem {
  product: Product;
  quantity: number;
}

const CART_STORAGE_KEY = 'hwshop-cart';

export class CartService {
  // Lấy giỏ hàng từ localStorage
  static getCart(): CartItem[] {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing cart:', error);
        return [];
      }
    }
    return [];
  }

  // Lưu giỏ hàng vào localStorage
  static saveCart(cart: CartItem[]): void {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    // Trigger custom event để các component khác cập nhật
    window.dispatchEvent(new Event('cart-updated'));
  }

  // Thêm sản phẩm vào giỏ
  static addToCart(product: Product, quantity: number = 1): void {
    const cart = this.getCart();
    const existingItem = cart.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
      // Đảm bảo không vượt quá stock
      if (existingItem.quantity > product.stock) {
        existingItem.quantity = product.stock;
      }
    } else {
      cart.push({ product, quantity: Math.min(quantity, product.stock) });
    }

    this.saveCart(cart);
  }

  // Cập nhật số lượng sản phẩm
  static updateQuantity(productId: string, quantity: number): void {
    const cart = this.getCart();
    const item = cart.find(item => item.product.id === productId);

    if (item) {
      item.quantity = Math.max(1, Math.min(quantity, item.product.stock));
      this.saveCart(cart);
    }
  }

  // Xóa sản phẩm khỏi giỏ
  static removeFromCart(productId: string): void {
    const cart = this.getCart();
    const filteredCart = cart.filter(item => item.product.id !== productId);
    this.saveCart(filteredCart);
  }

  // Xóa toàn bộ giỏ hàng
  static clearCart(): void {
    localStorage.removeItem(CART_STORAGE_KEY);
    window.dispatchEvent(new Event('cart-updated'));
  }

  // Lấy tổng số lượng sản phẩm
  static getCartCount(): number {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Lấy tổng giá trị giỏ hàng
  static getCartTotal(): number {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }

  // Kiểm tra sản phẩm có trong giỏ không
  static isInCart(productId: string): boolean {
    const cart = this.getCart();
    return cart.some(item => item.product.id === productId);
  }

  // Lấy số lượng của một sản phẩm trong giỏ
  static getProductQuantity(productId: string): number {
    const cart = this.getCart();
    const item = cart.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  }
}