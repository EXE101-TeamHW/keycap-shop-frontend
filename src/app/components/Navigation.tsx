// src/app/components/Navigation.tsx
import { Link, useNavigate } from "react-router";
import { ShoppingCart, User, Search, Menu, Heart, X } from "lucide-react";
import { useState } from "react";
import { products } from "../data/products";

const categories = [
  { name: "New Arrivals", theme: "Colorful" },
  { name: "Best Sellers", theme: "RGB" },
  { name: "Minimal", theme: "Minimal" },
  { name: "Retro", theme: "Retro" },
  { name: "Pastel", theme: "Pastel" },
  { name: "Dark Mode", theme: "Dark" },
];

const mockCartItems = [
  { product: products[0], quantity: 1 },
  { product: products[1], quantity: 2 },
  { product: products[3], quantity: 1 },
];

export function Navigation() {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartCount = mockCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = mockCartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const searchResults = searchQuery
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.theme.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                HWSHOP
              </div>
            </div>
          </Link>

          {/* Categories - Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {categories.map((cat) => (
              <button
                key={cat.name}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search for keycaps..."
                className="w-full px-4 py-2.5 pl-11 pr-11 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Dropdown */}
            {isSearchOpen && searchQuery && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {searchResults.length > 0 ? (
                  <div className="p-2">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          navigate(`/product/${product.id}`);
                          setSearchQuery("");
                          setIsSearchOpen(false);
                        }}
                        className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.theme}</div>
                        </div>
                        <div className="font-bold text-gray-900">${product.price}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button className="hidden lg:flex items-center justify-center w-10 h-10 text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-all">
              <Heart className="w-5 h-5" />
            </button>

            <button
              onClick={() => navigate("/login")}
              className="hidden lg:flex items-center justify-center w-10 h-10 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all"
            >
              <User className="w-5 h-5" />
            </button>

            {/* Cart with Hover Preview */}
            <div
              className="relative"
              onMouseEnter={() => setIsCartHovered(true)}
              onMouseLeave={() => setIsCartHovered(false)}
            >
              <button
                onClick={() => navigate("/cart")}
                className="relative flex items-center justify-center w-10 h-10 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold animate-in zoom-in duration-200">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Cart Preview Dropdown */}
              {isCartHovered && cartCount > 0 && (
                <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Shopping Cart</h3>
                      <span className="text-sm text-gray-600">{cartCount} items</span>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto p-4 space-y-3">
                    {mockCartItems.map((item) => (
                      <div key={item.product.id} className="flex gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-gray-900 truncate">
                            {item.product.name}
                          </div>
                          <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                          <div className="text-sm font-bold text-gray-900">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-between mb-3">
                      <span className="font-semibold text-gray-900">Subtotal:</span>
                      <span className="font-bold text-gray-900">${cartTotal.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => {
                        navigate("/cart");
                        setIsCartHovered(false);
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
                    >
                      View Cart & Checkout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 text-gray-700 hover:bg-gray-100 rounded-full transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white p-4 animate-in slide-in-from-top duration-200">
          <div className="space-y-2">
            {categories.map((cat) => (
              <button
                key={cat.name}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {isSearchOpen && searchQuery && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsSearchOpen(false)}
        />
      )}
    </nav>
  );
}
