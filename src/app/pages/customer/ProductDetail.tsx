// src/app/pages/ProductDetail.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router";
import {
  ShoppingCart, Heart, Share2, ArrowLeft, Package, Truck, Shield,
  CheckCircle, Loader2, Tag, Layout, Key, Star, MessageSquare, Send,
} from "lucide-react";
import { productApi, THEME_DISPLAY, LAYOUT_DISPLAY, PROFILE_DISPLAY } from "../../api/productApi";
import { cartApi } from "../../api/cartApi";
import { reviewApi } from "../../api/reviewApi";
import { Product } from "../../types";
import { toast } from "sonner";

export function ProductDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [cartStatus, setCartStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    if (id) {
      productApi.getById(id)
        .then((res: any) => {
          setProduct(res.data);
          setLoading(false);
          
          try {
            const stored = localStorage.getItem("favorites");
            if (stored) {
              const ids = JSON.parse(stored);
              if (Array.isArray(ids) && ids.includes(Number(res.data.id))) {
                setIsFavorite(true);
              }
            }
          } catch {}
        })
        .catch(() => setLoading(false));
      // Load reviews
      reviewApi.listByProduct(Number(id)).then((res: any) => {
        setReviews(Array.isArray(res?.data || res) ? (res?.data || res) : []);
      }).catch(() => {});
    }
  }, [id]);

  const handleFavoriteToggle = () => {
    if (!product) return;
    try {
      let favorites: number[] = [];
      const stored = localStorage.getItem("favorites");
      if (stored) {
        favorites = JSON.parse(stored);
      }
      if (isFavorite) {
        favorites = favorites.filter(fid => fid !== Number(product.id));
        toast.info("Đã bỏ yêu thích");
      } else {
        if (!favorites.includes(Number(product.id))) {
          favorites.push(Number(product.id));
        }
        toast.success("Đã thêm vào yêu thích");
      }
      localStorage.setItem("favorites", JSON.stringify(favorites));
      setIsFavorite(!isFavorite);
      window.dispatchEvent(new Event("favorites-updated"));
    } catch {
      toast.error("Không thể lưu yêu thích");
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s: number, r: any) => s + (r.rating || 0), 0) / reviews.length)
    : 0;

  const handleAddToCart = async () => {
    if (!product) return;
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    setCartStatus("loading");
    try {
      await cartApi.addItem({ productId: Number(product.id), quantity, options: "" });
      setCartStatus("success");
      toast.success("Đã thêm vào giỏ hàng!");
      window.dispatchEvent(new Event("cart-updated"));
      setTimeout(() => setCartStatus("idle"), 1000);
    } catch (err) {
      setCartStatus("error");
      toast.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
      setTimeout(() => setCartStatus("idle"), 1000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Không tìm thấy sản phẩm!</h1>
        <Link
          to="/"
          className="bg-slate-900 text-white px-8 py-3 rounded-lg inline-block hover:bg-slate-800 transition-colors"
        >
          Trở về
        </Link>
      </div>
    );
  }

  const themeLabel = THEME_DISPLAY[product.theme] || String(product.theme);
  const layoutLabel = LAYOUT_DISPLAY[product.layoutType] || product.layout || String(product.layoutType);
  const profileLabel = PROFILE_DISPLAY[product.keyProfile] || product.profile || String(product.keyProfile);
  const inStock = product.stockQuantity > 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 mb-8 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Quay lại cửa hàng</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div>
          <div className="bg-slate-50 rounded-2xl overflow-hidden mb-4 relative border border-slate-200">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-[500px] object-cover"
              />
            ) : (
              <div className="w-full h-[500px] flex items-center justify-center">
                <Package className="w-24 h-24 text-slate-300" />
              </div>
            )}
            {!inStock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                <span className="bg-white text-slate-900 font-bold px-6 py-3 rounded-full text-lg">Hết hàng</span>
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? "border-slate-900"
                      : "border-transparent hover:border-slate-300"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {/* Theme badge */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <span className="bg-slate-100 text-slate-700 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> {themeLabel}
            </span>
            <span className="bg-slate-100 text-slate-700 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5" /> {layoutLabel}
            </span>
            <span className="bg-slate-100 text-slate-700 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" /> {profileLabel}
            </span>
          </div>

          <h1 className="text-4xl font-bold mb-4 text-slate-900 tracking-tight">{product.name}</h1>

          {/* Rating placeholder */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 stroke-slate-300" />
              ))}
            </div>
            <span className="text-slate-500 text-sm">Chưa có đánh giá</span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-4xl font-bold text-slate-900">
              {(product.price).toLocaleString('vi-VN')}đ
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-lg mb-6 text-slate-600 leading-relaxed">{product.description}</p>
          )}

          {/* Stock Info */}
          <div className={`border rounded-xl p-4 mb-6 ${
            inStock
              ? product.stockQuantity < 10
                ? "bg-amber-50 border-amber-200"
                : "bg-slate-50 border-slate-200"
              : "bg-red-50 border-red-200"
          }`}>
            <div className={`flex items-center gap-2 font-medium ${
              inStock
                ? product.stockQuantity < 10 ? "text-amber-700" : "text-slate-700"
                : "text-red-700"
            }`}>
              <Package className="w-5 h-5" />
              {inStock
                ? product.stockQuantity < 10
                  ? `Chỉ còn ${product.stockQuantity} sản phẩm trong kho!`
                  : `Còn ${product.stockQuantity} sản phẩm trong kho`
                : "Hết hàng"
              }
            </div>
          </div>

          {/* Quantity Selector */}
          {inStock && (
            <div className="mb-6">
              <label className="font-semibold mb-3 block text-slate-900">Số lượng</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors font-bold text-xl border border-slate-200"
                >
                  -
                </button>
                <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  className="w-12 h-12 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors font-bold text-xl border border-slate-200"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={!inStock || cartStatus === "loading"}
              className={`flex-1 px-8 py-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                cartStatus === "success"
                  ? "bg-emerald-600 text-white"
                  : cartStatus === "error"
                  ? "bg-red-600 text-white"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {cartStatus === "loading" ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Đang thêm...</>
              ) : cartStatus === "success" ? (
                <><CheckCircle className="w-5 h-5" /> Đã thêm!</>
              ) : cartStatus === "error" ? (
                <>Thất bại!</>
              ) : (
                <><ShoppingCart className="w-5 h-5" /> Thêm vào giỏ hàng</>
              )}
            </button>
            <button
              onClick={handleFavoriteToggle}
              className={`w-14 h-14 rounded-xl border flex items-center justify-center transition-all ${
                isFavorite ? "bg-red-50 border-red-200 text-red-500" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Heart className={`w-6 h-6 ${isFavorite ? "fill-red-500" : ""}`} />
            </button>

            <button className="w-14 h-14 rounded-xl border-2 border-gray-300 text-gray-600 hover:border-gray-400 transition-colors flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <Truck className="w-6 h-6 text-purple-600" />
              <div>
                <div className="font-semibold text-gray-900">Giao hàng miễn phí</div>
                <div className="text-sm text-gray-600">Cho đơn hàng từ 1.250.000đ</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-purple-600" />
              <div>
                <div className="font-semibold text-gray-900">Bảo hành 1 năm</div>
                <div className="text-sm text-gray-600">Đảm bảo chất lượng</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-purple-600" />
              <div>
                <div className="font-semibold text-gray-900">Sản phẩm chính hãng</div>
                <div className="text-sm text-gray-600">100% keycap set thật</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-purple-600" />
              Đánh giá sản phẩm
            </h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-5 h-5 ${
                      s <= Math.round(avgRating) ? "fill-amber-400 stroke-amber-400" : "stroke-gray-300"
                    }`} />
                  ))}
                </div>
                <span className="font-bold text-gray-900">{avgRating.toFixed(1)}</span>
                <span className="text-gray-500 text-sm">({reviews.length} đánh giá)</span>
              </div>
            )}
          </div>
        </div>

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <Star className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="text-gray-500">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r: any) => (
              <div key={r.id} className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-900">Khách hàng #{r.userId}</div>
                    <div className="flex mt-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-4 h-4 ${
                          s <= r.rating ? "fill-amber-400 stroke-amber-400" : "stroke-gray-200"
                        }`} />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString("vi-VN") : ""}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
