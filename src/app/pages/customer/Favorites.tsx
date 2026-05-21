// src/app/pages/customer/Favorites.tsx
import { useState, useEffect } from "react";
import { ProductCard } from "../../components/ProductCard";
import { productApi } from "../../api/productApi";
import { Heart } from "lucide-react";
import { motion } from "motion/react";
import { Product } from "../../types";

export function Favorites() {
  const [products, setProducts] = useState<Product[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem("favorites");
      if (stored) {
        setFavoriteIds(new Set(JSON.parse(stored)));
      } else {
        setFavoriteIds(new Set());
      }
    } catch {
      setFavoriteIds(new Set());
    }
  };

  useEffect(() => {
    loadFavorites();
    productApi.getAll()
      .then((res) => {
        setProducts(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    const handleUpdate = () => loadFavorites();
    window.addEventListener("favorites-updated", handleUpdate);
    return () => window.removeEventListener("favorites-updated", handleUpdate);
  }, []);

  const favoriteProducts = products.filter((p) => p.id && favoriteIds.has(Number(p.id)));

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          <h1 className="text-3xl font-black text-slate-900">Sản phẩm yêu thích</h1>
        </div>

        {favoriteProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <Heart className="w-16 h-16 mx-auto mb-4 text-slate-200" />
            <p className="text-xl font-bold text-slate-900 mb-2">Chưa có sản phẩm yêu thích</p>
            <p className="text-slate-500">Hãy thả tim các sản phẩm bạn thích để lưu vào đây nhé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {favoriteProducts.map((product, index) => (
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
    </div>
  );
}
