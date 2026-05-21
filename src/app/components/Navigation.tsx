// src/app/components/Navigation.tsx
import { Link, useNavigate } from "react-router";
import { ShoppingCart, User, Search, Menu, Heart, X, Wrench } from "lucide-react";
import { useState, useEffect } from "react";
import { productApi, THEME_DISPLAY } from "../api/productApi";
import { authApi } from "../api/authApi";
import { cartApi } from "../api/cartApi";
import { Product } from "../types";
import { motion } from "motion/react";

const categories = [
  { name: "New Arrivals", theme: "COLORFUL" },
  { name: "Best Sellers", theme: "RGB" },
  { name: "Minimal", theme: "MINIMAL" },
  { name: "Retro", theme: "RETRO" },
  { name: "Pastel", theme: "PASTEL" },
  { name: "Dark Mode", theme: "DARK" },
];

const mockCartItems: any[] = [];

export function Navigation() {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [cartCount, setCartCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<any>(null);

  const fetchCart = () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      cartApi.getCart().then((res: any) => {
        const cartData = res.data || res;
        const count = cartData?.items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0;
        setCartCount(count);
      }).catch(() => {});
    }
  };

  const fetchFavorites = () => {
    try {
      const stored = localStorage.getItem("favorites");
      if (stored) {
        setFavoritesCount(JSON.parse(stored).length);
      } else {
        setFavoritesCount(0);
      }
    } catch {
      setFavoritesCount(0);
    }
  };

  useEffect(() => {
    productApi.getAll().then(res => setProducts(res.data || [])).catch(() => { });
    fetchCart();
    fetchFavorites();

    const handleCartUpdate = () => fetchCart();
    const handleFavUpdate = () => fetchFavorites();
    window.addEventListener("cart-updated", handleCartUpdate);
    window.addEventListener("favorites-updated", handleFavUpdate);

    const userId = localStorage.getItem("userId");
    if (userId) {
      authApi.me(userId).then((res: any) => {
        if (res?.data) setUser(res.data);
      }).catch(() => {
        authApi.logout();
      });
    }

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
      window.removeEventListener("favorites-updated", handleFavUpdate);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false); // scrolling down
      } else {
        setIsVisible(true); // scrolling up
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleLogout = () => {
    authApi.logout();
    setUser(null);
    navigate("/");
  };


  const searchResults = searchQuery
    ? products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (THEME_DISPLAY[p.theme] || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.layout.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.profile.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5)
    : [];

  return (
    <nav className={`bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}>
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="relative text-2xl font-black tracking-tight text-slate-900">
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
            <button
              onClick={() => navigate("/custom")}
              className="ml-3 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              Custom Service
            </button>
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
            <button
              onClick={() => navigate("/favorites")}
              className="relative hidden lg:flex items-center justify-center w-10 h-10 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
            >
              <Heart className="w-5 h-5" />
              {favoritesCount >= 0 && (
                <motion.span
                  key={favoritesCount}
                  initial={{ scale: 1.2, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
                >
                  {favoritesCount}
                </motion.span>
              )}
            </button>

            {/* User Dropdown */}
            <div className="relative" onMouseLeave={() => setIsUserMenuOpen(false)}>
              <button
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onClick={() => !user && navigate("/login")}
                className="hidden lg:flex items-center justify-center w-10 h-10 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all overflow-hidden"
              >
                {user ? (
                  user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                  )
                ) : (
                  <User className="w-5 h-5" />
                )}
              </button>

              {user && isUserMenuOpen && (
                <div className="absolute top-full right-0 pt-2 w-48 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                    <div className="p-3 border-b border-gray-100">
                      <p className="font-semibold text-sm text-gray-900 truncate">{user.fullName || user.email}</p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                    <div className="p-2 space-y-1">
                      {user.role === 'ADMIN' && (
                        <button
                          onClick={() => navigate("/admin")}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-2"
                        >
                          <span>🛡️</span> Admin Panel
                        </button>
                      )}
                      {user.role === 'STAFF' && (
                        <button
                          onClick={() => navigate("/staff")}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-2"
                        >
                          <span>🎨</span> Staff Dashboard
                        </button>
                      )}
                      <button
                        onClick={() => navigate("/profile")}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-2"
                      >
                        <span>👤</span> Hồ sơ cá nhân
                      </button>
                      <button
                        onClick={() => navigate("/custom")}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <span>⌨️</span> Custom Service
                      </button>
                      <button
                        onClick={() => navigate("/orders")}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-2"
                      >
                        <span>📦</span> Đơn hàng của tôi
                      </button>
                      <button
                        onClick={() => navigate("/my-tickets")}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-2"
                      >
                        <span>🎨</span> Ticket Custom
                      </button>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cart with Hover Preview */}
            <div
              className="relative"
              onMouseEnter={() => setIsCartHovered(true)}
              onMouseLeave={() => setIsCartHovered(false)}
            >
              <button
                onClick={() => navigate("/cart")}
                className="relative flex items-center justify-center w-10 h-10 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount >= 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 1.2, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="absolute -top-1 -right-1 bg-slate-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>

              {/* Cart Preview Dropdown */}
              {isCartHovered && cartCount > 0 && (
                <div className="absolute top-full right-0 pt-2 w-96 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-gray-200">
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
                        className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-semibold hover:bg-slate-800 transition-all"
                      >
                        View Cart & Checkout
                      </button>
                    </div>
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
            <button
              onClick={() => { navigate("/custom"); setIsMobileMenuOpen(false); }}
              className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              Custom Service
            </button>
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
