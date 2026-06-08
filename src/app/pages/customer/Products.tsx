// src/app/pages/Home.tsx
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router";
import Marquee from "react-fast-marquee";
import { ProductFilters } from "../../components/ProductFilters";
import { ProductCard } from "../../components/ProductCard";
import { productApi, THEME_DISPLAY } from "../../api/productApi";
import { Sparkles, TrendingUp, Package } from "lucide-react";
import type { ProductTheme } from "../../types";
import { motion } from "motion/react";
import { stripProductDescriptionHtml } from "../../utils/productDescription";

// Reverse map: display string → enum (for filter)
const THEME_FROM_DISPLAY: Record<string, ProductTheme> = Object.fromEntries(
  Object.entries(THEME_DISPLAY).map(([k, v]) => [v, k as ProductTheme])
);

export function Products() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [selectedTheme, setSelectedTheme] = useState("Tất cả");
  const [selectedLayout, setSelectedLayout] = useState("Tất cả");
  const [selectedProfile, setSelectedProfile] = useState("Tất cả");
  const [priceRange, setPriceRange] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("Phổ biến nhất");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi.getAll()
      .then((res) => {
        setProducts(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    // Only show ACTIVE products to customers
    let filtered = products.filter((p) => !p.status || p.status === "ACTIVE");

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => 
        (p.name || "").toLowerCase().includes(q) ||
        (THEME_DISPLAY[p.theme as ProductTheme] || "").toLowerCase().includes(q) ||
        (p.layout || "").toLowerCase().includes(q) ||
        (p.profile || "").toLowerCase().includes(q) ||
        stripProductDescriptionHtml(p.description || "").toLowerCase().includes(q)
      );
    }

    // Filter by theme
    if (selectedTheme !== "Tất cả") {
      const enumVal = THEME_FROM_DISPLAY[selectedTheme] || selectedTheme;
      filtered = filtered.filter((p) => p.theme === enumVal);
    }

    // Filter by layout
    if (selectedLayout !== "Tất cả") {
      filtered = filtered.filter((p) => p.layout === selectedLayout);
    }

    // Filter by profile
    if (selectedProfile !== "Tất cả") {
      filtered = filtered.filter((p) => p.profile === selectedProfile);
    }

    // Filter by price
    if (priceRange !== "Tất cả") {
      if (priceRange === "Trên 3.750.000đ") {
        filtered = filtered.filter((p) => p.price >= 3750000);
      } else {
        const parts = priceRange.replace(/đ|\./g, "").split("-");
        const min = parseInt(parts[0].trim());
        const max = parseInt(parts[1].trim());
        filtered = filtered.filter((p) => {
          return p.price >= min && p.price <= max;
        });
      }
    }

    // Sort
    switch (sortBy) {
      case "Giá: Thấp đến Cao":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "Giá: Cao đến Thấp":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "Tên A-Z":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // Phổ biến nhất
        filtered.sort((a, b) => (b.stockQuantity ?? 0) - (a.stockQuantity ?? 0));
    }

    return filtered;
  }, [products, selectedTheme, selectedLayout, selectedProfile, priceRange, sortBy]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-slate-50"
    >
      <div className="bg-slate-900 text-white py-20 px-6 text-center border-b-2 border-slate-900">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
          {searchQuery ? (
            <>Kết quả <span className="text-pink-500">Tìm kiếm</span></>
          ) : (
            <>Tất cả <span className="text-pink-500">Keycap</span></>
          )}
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto">
          {searchQuery 
            ? `Đang hiển thị kết quả cho "${searchQuery}"` 
            : "Khám phá bộ sưu tập keycap chất lượng cao dành riêng cho bàn phím cơ của bạn"}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">

        <ProductFilters
          selectedTheme={selectedTheme}
          setSelectedTheme={setSelectedTheme}
          selectedLayout={selectedLayout}
          setSelectedLayout={setSelectedLayout}
          selectedProfile={selectedProfile}
          setSelectedProfile={setSelectedProfile}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Hiển thị <span className="font-bold text-gray-900">{filteredAndSortedProducts.length}</span> sản phẩm
          </p>
          {(selectedTheme !== "Tất cả" || priceRange !== "Tất cả" || selectedLayout !== "Tất cả" || selectedProfile !== "Tất cả") && (
            <button
              onClick={() => {
                setSelectedTheme("Tất cả");
                setSelectedLayout("Tất cả");
                setSelectedProfile("Tất cả");
                setPriceRange("Tất cả");
              }}
              className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="text-6xl mb-4">😔</div>
            <p className="text-3xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm!</p>
            <p className="text-gray-600 mb-6">Thử điều chỉnh lại bộ lọc của bạn</p>
            <button
              onClick={() => {
                setSelectedTheme("Tất cả");
                setSelectedLayout("Tất cả");
                setSelectedProfile("Tất cả");
                setPriceRange("Tất cả");
              }}
              className="bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.1, 1.5) }}
              >
                <ProductCard product={product} index={index} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </motion.div>
  );
}
