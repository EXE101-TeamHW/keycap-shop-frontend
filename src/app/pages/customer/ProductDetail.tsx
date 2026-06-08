// src/app/pages/ProductDetail.tsx
import { useState, useEffect, useRef } from "react";
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
import { sanitizeProductDescriptionHtml } from "../../utils/productDescription";

interface FlyingCartItem {
  image: string;
  x: number;
  y: number;
  size: number;
  targetX: number;
  targetY: number;
  active: boolean;
}

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
  const [flyingItem, setFlyingItem] = useState<FlyingCartItem | null>(null);
  const productPreviewRef = useRef<HTMLDivElement | null>(null);

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
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("Vui lòng đăng nhập để lưu sản phẩm yêu thích");
      navigate("/login");
      return;
    }
    
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

  const playAddToCartAnimation = () => {
    if (!product) return false;
    const source = productPreviewRef.current;
    const target = document.querySelector<HTMLElement>("[data-cart-target]");
    const image = product.images?.[selectedImage] || product.image;
    if (!source || !target || !image) return false;

    const sourceRect = source.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const size = Math.min(96, Math.max(64, sourceRect.width * 0.22));
    const x = sourceRect.left + sourceRect.width / 2 - size / 2;
    const y = sourceRect.top + sourceRect.height / 2 - size / 2;
    const targetX = targetRect.left + targetRect.width / 2 - size / 2;
    const targetY = targetRect.top + targetRect.height / 2 - size / 2;

    setFlyingItem({ image, x, y, size, targetX, targetY, active: false });
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setFlyingItem((item) => item ? { ...item, active: true } : item);
      });
    });
    window.setTimeout(() => setFlyingItem(null), 760);
    return true;
  };

  const handleAddToCart = async () => {
    if (!product) return;
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    setCartStatus("loading");
    try {
      await cartApi.addItem({ productId: Number(product.id), quantity, options: "" });
      setCartStatus("success");
      toast.success("Đã thêm vào giỏ hàng!");
      const animated = playAddToCartAnimation();
      window.setTimeout(() => {
        window.dispatchEvent(new Event("cart-updated"));
      }, animated ? 620 : 0);
      setTimeout(() => setCartStatus("idle"), 1000);
    } catch (err: any) {
      setCartStatus("error");
      console.error("Cart error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
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
    <div className="min-h-screen bg-[#f6f8fb]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      {flyingItem && (
        <div
          className="pointer-events-none fixed z-[9999] overflow-hidden rounded-xl border border-white/70 bg-white shadow-2xl transition-[transform,opacity] duration-700 ease-in-out"
          style={{
            left: flyingItem.x,
            top: flyingItem.y,
            width: flyingItem.size,
            height: flyingItem.size,
            opacity: flyingItem.active ? 0.12 : 1,
            transform: flyingItem.active
              ? `translate(${flyingItem.targetX - flyingItem.x}px, ${flyingItem.targetY - flyingItem.y}px) scale(0.28) rotate(12deg)`
              : "translate(0, 0) scale(1) rotate(0deg)",
          }}
        >
          <img src={flyingItem.image} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="mb-6 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 hover:shadow-md"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="font-medium">Quay lại cửa hàng</span>
      </button>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(400px,0.92fr)] xl:gap-8">
        {/* Image Gallery */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <div ref={productPreviewRef} className="relative overflow-hidden rounded-lg border border-white bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.10)]">
            <div className="absolute left-0 top-0 h-1 w-full bg-[linear-gradient(90deg,#10b981,#22c55e,#ec4899)]" />
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="h-[340px] w-full rounded-md object-cover sm:h-[430px] lg:h-[520px]"
              />
            ) : (
              <div className="flex h-[340px] w-full items-center justify-center rounded-md bg-slate-50 sm:h-[430px] lg:h-[520px]">
                <Package className="h-20 w-20 text-slate-300" />
              </div>
            )}
            {!inStock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                <span className="bg-white text-slate-900 font-bold px-6 py-3 rounded-full text-lg">Hết hàng</span>
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              {product.images.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`overflow-hidden rounded-lg border bg-white p-1 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    selectedImage === index
                      ? "border-slate-950 ring-2 ring-slate-950/10"
                      : "border-white hover:border-slate-300"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className="h-16 w-full rounded-md object-cover sm:h-20"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="rounded-lg border border-white bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-6 lg:p-7">
          {/* Theme badge */}
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <Tag className="h-3.5 w-3.5" /> {themeLabel}
            </span>
            <span className="flex items-center gap-1.5 rounded-lg border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700">
              <Layout className="h-3.5 w-3.5" /> {layoutLabel}
            </span>
            <span className="flex items-center gap-1.5 rounded-lg border border-fuchsia-100 bg-fuchsia-50 px-3 py-1.5 text-xs font-bold text-fuchsia-700">
              <Key className="h-3.5 w-3.5" /> {profileLabel}
            </span>
          </div>

          <h1 className="mb-3 text-3xl font-black leading-tight tracking-normal text-slate-950 lg:text-5xl">{product.name}</h1>

          {/* Rating */}
          <div className="mb-5 flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(avgRating)
                      ? "fill-amber-400 stroke-amber-400"
                      : "stroke-slate-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-slate-500">
              {reviews.length > 0
                ? `${avgRating.toFixed(1)} / 5.0 (${reviews.length} đánh giá)`
                : "Chưa có đánh giá"}
            </span>
          </div>

          {/* Price */}
          <div className="mb-5 border-y border-slate-100 py-5">
            <span className="text-4xl font-black tracking-normal text-slate-950 lg:text-5xl">
              {(product.price).toLocaleString('vi-VN')}đ
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <div
              className="mb-5 text-base leading-8 text-slate-600 [&_strong]:font-bold [&_strong]:text-slate-950"
              dangerouslySetInnerHTML={{ __html: sanitizeProductDescriptionHtml(product.description) }}
            />
          )}

          {/* Stock Info */}
          <div className={`mb-5 rounded-lg border p-4 shadow-sm ${
            inStock
              ? product.stockQuantity < 10
                ? "bg-amber-50 border-amber-200"
                : "bg-emerald-50 border-emerald-100"
              : "bg-red-50 border-red-200"
          }`}>
            <div className={`flex items-center gap-2.5 font-bold ${
              inStock
                ? product.stockQuantity < 10 ? "text-amber-700" : "text-emerald-700"
                : "text-red-700"
            }`}>
              <Package className="h-5 w-5" />
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
            <div className="mb-5">
              <label className="font-semibold mb-3 block text-slate-900">Số lượng</label>
              <div className="inline-flex items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-12 w-12 border-r border-slate-200 bg-white text-lg font-bold transition-colors hover:bg-slate-100"
                >
                  -
                </button>
                <span className="w-16 text-center text-lg font-bold text-slate-950">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  className="h-12 w-12 border-l border-slate-200 bg-white text-lg font-bold transition-colors hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mb-6 grid grid-cols-[1fr_auto_auto] gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!inStock || cartStatus === "loading"}
              className={`flex min-h-14 items-center justify-center gap-2 rounded-lg px-6 py-4 text-sm font-bold shadow-lg transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${
                cartStatus === "success"
                  ? "bg-emerald-600 text-white"
                  : cartStatus === "error"
                  ? "bg-red-600 text-white"
                  : "bg-slate-950 text-white shadow-slate-950/20 hover:bg-slate-800"
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
              className={`flex h-14 w-14 items-center justify-center rounded-lg border transition-all hover:-translate-y-0.5 hover:shadow-md ${
                isFavorite ? "bg-red-50 border-red-200 text-red-500" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500" : ""}`} />
            </button>

            <button className="flex h-14 w-14 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md">
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
              <Truck className="h-5 w-5 flex-shrink-0 text-emerald-600" />
              <div>
                <div className="font-semibold text-gray-900">Giao hàng an toàn</div>
                <div className="text-sm text-gray-600">Cho tất cả các đơn hàng</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
              <Shield className="h-5 w-5 flex-shrink-0 text-sky-600" />
              <div>
                <div className="font-semibold text-gray-900">Bảo hành 1 năm</div>
                <div className="text-sm text-gray-600">Đảm bảo chất lượng</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-fuchsia-600" />
              <div>
                <div className="font-semibold text-gray-900">Sản phẩm chính hãng</div>
                <div className="text-sm text-gray-600">100% keycap set thật</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-8 rounded-lg border border-white bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-black text-slate-950">
              <MessageSquare className="h-6 w-6 text-emerald-600" />
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
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
            <Star className="mx-auto mb-3 h-12 w-12 text-slate-200" />
            <p className="text-gray-500">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r: any) => (
              <div key={r.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-900">{r.userName || `Khách hàng #${r.userId}`}</div>
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
    </div>
  );
}
