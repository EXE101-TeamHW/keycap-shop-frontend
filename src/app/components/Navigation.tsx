// src/app/components/Navigation.tsx
import { Link, useLocation, useNavigate } from "react-router";
import { ShoppingCart, User, Search, Menu, Heart, X, Wrench } from "lucide-react";
import { useState, useEffect } from "react";
import { mapProduct, productApi, THEME_DISPLAY } from "../api/productApi";
import { authApi } from "../api/authApi";
import { cartApi } from "../api/cartApi";
import { Product } from "../types";
import { motion } from "motion/react";
import { toast } from "sonner";
import { stripProductDescriptionHtml } from "../utils/productDescription";

const menuItems = [
  { name: "Sản phẩm", path: "/san-pham" },
  { name: "Tin tức", path: "/tin-tuc" },
  { name: "Chính sách", path: "/chinh-sach" },
  { name: "Đánh giá", path: "/danh-gia" },
];

interface NavCartItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

const getCartProductImage = (item: any, product: Product | null) => {
  if (item.productImage || item.image || item.imageUrl) {
    return item.productImage || item.image || item.imageUrl;
  }
  if (Array.isArray(item.images) && item.images.length > 0) {
    return item.images[0];
  }
  if (item.product) {
    if (item.product.image || item.product.imageUrl || item.product.productImage) {
      return item.product.image || item.product.imageUrl || item.product.productImage;
    }
    if (Array.isArray(item.product.images) && item.product.images.length > 0) {
      return item.product.images[0];
    }
  }
  return product?.image || "";
};

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<NavCartItem[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<any>(null);
  const isActivePath = (path: string) => (
    path === "/" ? location.pathname === "/" : location.pathname === path || location.pathname.startsWith(`${path}/`)
  );

  const fetchCart = () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      cartApi.getCart().then((res: any) => {
        const cartData = res.data || res;
        const raw = Array.isArray(cartData) ? cartData : (cartData?.items || []);
        const items = Array.isArray(raw) ? raw.map((item: any) => {
          const product = item.product ? mapProduct(item.product) : null;
          return {
            id: item.id,
            productId: item.productId || product?.id,
            productName: item.productName || product?.name || "Sản phẩm",
            productImage: getCartProductImage(item, product),
            price: item.unitPrice || item.price || product?.price || 0,
            quantity: item.quantity || 1,
          };
        }) : [];
        const count = items.reduce((sum: number, item: NavCartItem) => sum + item.quantity, 0);
        const total = items.reduce((sum: number, item: NavCartItem) => sum + item.price * item.quantity, 0);
        setCartItems(items);
        setCartCount(count);
        setCartTotal(total);
      }).catch(() => {});
    } else {
      setCartItems([]);
      setCartCount(0);
      setCartTotal(0);
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
      authApi.me().then((res: any) => {
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
      setIsScrolled(currentScrollY > 12);
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
    toast.success("Đăng xuất thành công!");
    navigate("/");
  };


  const searchResults = searchQuery
    ? products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (THEME_DISPLAY[p.theme] || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.layout.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.profile.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stripProductDescriptionHtml(p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5)
    : [];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: isVisible ? 1 : 0.96, y: isVisible ? 0 : -96 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-300 ${
        isScrolled
          ? "border-slate-200 bg-white shadow-md shadow-slate-900/5"
          : "border-gray-200 bg-white shadow-sm"
      }`}
    >
      {/* Decorative background animations wrapped to prevent horizontal overflow while allowing dropdowns to show */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-purple-50/45 to-transparent"
          initial={{ x: "-80%", opacity: 0 }}
          animate={{ x: ["-80%", "80%", "-80%"], opacity: [0, 1, 0.7, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-full opacity-35 mix-blend-multiply"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 35%, rgba(14,165,233,0.12), transparent 26%), radial-gradient(circle at 48% 20%, rgba(168,85,247,0.10), transparent 28%), radial-gradient(circle at 78% 42%, rgba(236,72,153,0.10), transparent 24%), linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.55) 45%, transparent 65%)",
            backgroundSize: "360px 120px, 420px 120px, 380px 120px, 220px 100%",
          }}
          animate={{
            backgroundPositionX: ["0px, 0px, 0px, -260px", "180px, -220px, 260px, 1200px"],
            opacity: [0.42, 0.78, 0.55, 0.78, 0.42],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-1/3 rounded-full bg-gradient-to-r from-transparent via-pink-500 to-purple-600"
          animate={{ x: ["-120%", "320%"] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      {/* Top Bar */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-2.5">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 24 }}
              className="relative"
            >
              <div className="relative text-xl font-black tracking-tight text-slate-900">
                HWSHOP
                <motion.span
                  className="absolute -right-3 top-1 h-2 w-2 rounded-full bg-pink-500 shadow-lg shadow-pink-500/40"
                  animate={{ scale: [1, 1.65, 1], opacity: [1, 0.72, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          </Link>

          {/* Menu Items - Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <motion.button
                key={item.name}
                onClick={() => navigate(item.path)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative overflow-hidden px-3.5 py-1.5 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${
                  isActivePath(item.path)
                    ? "text-purple-700"
                    : "text-slate-700 hover:text-purple-600 hover:bg-purple-50"
                }`}
              >
                {isActivePath(item.path) && (
                  <motion.span
                    layoutId="desktop-nav-active"
                    className="absolute inset-0 rounded-lg bg-purple-50 ring-1 ring-purple-100"
                    transition={{ type: "spring", stiffness: 520, damping: 36 }}
                  />
                )}
                <span className="relative">{item.name}</span>
                <span className="absolute bottom-1 left-3 right-3 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-transform duration-300 group-hover:scale-x-100" />
              </motion.button>
            ))}
            <motion.button
              onClick={() => navigate("/custom")}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`ml-3 group relative overflow-hidden rounded-xl px-3.5 py-2 text-sm font-black text-white shadow-lg ring-1 transition-all flex items-center gap-2 ${
                isActivePath("/custom")
                  ? "bg-gradient-to-r from-slate-950 to-slate-800 shadow-slate-900/25 ring-slate-300"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-500/25 ring-white/50 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl hover:shadow-pink-500/30"
              }`}
            >
              <span className="absolute inset-0 bg-white/15 opacity-0 transition-opacity hover:opacity-100" />
              <span className="absolute inset-y-0 -left-12 w-10 rotate-12 bg-white/35 blur-md transition-transform duration-700 group-hover:translate-x-52" />
              <Wrench className="relative w-4 h-4" />
              <span className="relative">Custom Service</span>
              <span className="relative rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide">Hot</span>
            </motion.button>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/san-pham?search=${encodeURIComponent(searchQuery.trim())}`);
                    setIsSearchOpen(false);
                  }
                }}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full px-4 py-2 pl-10 pr-10 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <Search className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
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
              <div className="absolute top-full mt-2 w-full z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
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
                        <div className="font-bold text-gray-900">{product.price?.toLocaleString("vi-VN")}đ</div>
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        navigate(`/san-pham?search=${encodeURIComponent(searchQuery.trim())}`);
                        setIsSearchOpen(false);
                      }}
                      className="w-full text-center py-2 mt-2 text-sm font-semibold text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      Xem tất cả kết quả
                    </button>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    Không tìm thấy sản phẩm "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!localStorage.getItem("userId")) {
                  alert("Vui lòng đăng nhập để xem danh sách yêu thích");
                  navigate("/login");
                } else {
                  navigate("/favorites");
                }
              }}
              className="relative hidden lg:flex items-center justify-center w-9 h-9 text-slate-700 hover:-translate-y-0.5 hover:text-slate-900 hover:bg-slate-100 hover:shadow-md rounded-full transition-all"
            >
              <Heart className="h-[18px] w-[18px]" />
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
                onClick={() => user ? setIsUserMenuOpen(!isUserMenuOpen) : navigate("/login")}
                className="hidden lg:flex items-center justify-center w-9 h-9 text-slate-700 hover:-translate-y-0.5 hover:text-slate-900 hover:bg-slate-100 hover:shadow-md rounded-full transition-all overflow-hidden"
              >
                {user ? (
                  user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center ring-1 ring-slate-200 shadow-sm"
                      title={user.fullName || user.email}
                    >
                      <User className="w-4 h-4" strokeWidth={2.4} />
                    </div>
                  )
                ) : (
                  <User className="w-5 h-5" />
                )}
              </button>

              {user && isUserMenuOpen && (
                <div className="absolute top-full right-0 pt-2 w-48 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
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
                        className="w-full text-left px-3 py-2.5 text-sm font-black text-white rounded-xl transition-all bg-gradient-to-r from-purple-600 to-pink-600 shadow-md shadow-purple-500/20 flex items-center justify-between"
                      >
                        <span>⌨️ Custom Service</span>
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] uppercase">Hot</span>
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
              onMouseEnter={() => {
                setIsCartHovered(true);
                fetchCart();
              }}
              onMouseLeave={() => setIsCartHovered(false)}
            >
              <button
                data-cart-target
                onClick={() => navigate("/cart")}
                className="relative flex items-center justify-center w-9 h-9 text-slate-700 hover:-translate-y-0.5 hover:text-slate-900 hover:bg-slate-100 hover:shadow-md rounded-full transition-all"
              >
                <ShoppingCart className="h-[18px] w-[18px]" />
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
                <div className="absolute top-full right-0 pt-2 w-96 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Shopping Cart</h3>
                        <span className="text-sm text-gray-600">{cartCount} items</span>
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto p-4 space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-100"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center flex-shrink-0">
                              <ShoppingCart className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-900 truncate">
                              {item.productName}
                            </div>
                            <div className="text-xs text-gray-500">Số lượng: {item.quantity}</div>
                            <div className="text-sm font-bold text-gray-900">
                              {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <div className="flex justify-between mb-3">
                        <span className="font-semibold text-gray-900">Subtotal:</span>
                        <span className="font-bold text-gray-900">{cartTotal.toLocaleString("vi-VN")}đ</span>
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
              className="lg:hidden flex items-center justify-center w-9 h-9 text-gray-700 hover:bg-gray-100 rounded-full transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="lg:hidden border-t border-gray-200 bg-white p-4"
        >
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => { navigate(item.path); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 font-bold uppercase tracking-wider rounded-lg transition-colors ${
                  isActivePath(item.path)
                    ? "bg-purple-50 text-purple-700 ring-1 ring-purple-100"
                    : "text-slate-700 hover:text-purple-600 hover:bg-purple-50"
                }`}
              >
                {item.name}
              </button>
            ))}
            <button
              onClick={() => { navigate("/custom"); setIsMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 text-white rounded-xl transition-all flex items-center justify-between shadow-lg ${
                isActivePath("/custom")
                  ? "bg-gradient-to-r from-slate-950 to-slate-800 shadow-slate-900/20"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-500/20"
              }`}
            >
              <span className="flex items-center gap-2 font-black">
                <Wrench className="w-4 h-4" />
                Custom Service
              </span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide">Hot</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Search Overlay */}
      {isSearchOpen && searchQuery && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsSearchOpen(false)}
        />
      )}
    </motion.nav>
  );
}
