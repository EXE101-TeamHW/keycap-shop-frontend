// src/app/pages/Cart.tsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { products } from "../data/products";

interface CartItem {
  product: typeof products[0];
  quantity: number;
}

export function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { product: products[0], quantity: 1 },
    { product: products[1], quantity: 2 },
    { product: products[3], quantity: 1 },
  ]);

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, Math.min(item.product.stock, item.quantity + delta)) }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setCartItems((items) => items.filter((item) => item.product.id !== productId));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 mb-8 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Continue Shopping</span>
      </button>

      <h1 className="text-4xl font-bold mb-8 text-gray-900">
        Your Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-24 h-24 mx-auto mb-4 text-gray-300" />
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Your cart is empty!</h2>
          <p className="text-gray-600 mb-8">Add some awesome keycaps to get started</p>
          <button
            onClick={() => navigate("/")}
            className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.product.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
              >
                <div className="flex gap-5">
                  {/* Image */}
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-32 h-32 object-cover rounded-lg cursor-pointer"
                    onClick={() => navigate(`/product/${item.product.id}`)}
                  />

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3
                          className="font-semibold text-lg mb-1 cursor-pointer hover:text-gray-700 text-gray-900"
                          onClick={() => navigate(`/product/${item.product.id}`)}
                        >
                          {item.product.name}
                        </h3>
                        <div className="bg-gray-100 px-3 py-1 rounded-full inline-block text-xs font-semibold">
                          {item.product.theme}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-lg font-semibold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          ${item.product.price} each
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-24">
              <h2 className="font-bold text-xl mb-6 text-gray-900">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping:</span>
                  <span className="font-semibold">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax:</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between font-bold text-xl text-gray-900">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {shipping > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-700">
                  Add <span className="font-semibold">${(50 - subtotal).toFixed(2)}</span> more for free shipping!
                </div>
              )}

              <button className="w-full bg-gray-900 text-white py-3 rounded-lg mb-3 hover:bg-gray-800 transition-colors font-medium">
                Checkout
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Continue Shopping
              </button>

              {/* Promo Code */}
              <div className="mt-6">
                <label className="font-medium mb-2 block text-sm text-gray-700">Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-sm"
                  />
                  <button className="bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}