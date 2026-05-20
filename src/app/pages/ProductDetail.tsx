// src/app/pages/ProductDetail.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router";
import {
  ShoppingCart, Heart, Share2, ArrowLeft, Package, Truck, Shield,
  CheckCircle, Loader2, Tag, Layout, Key, Star, MessageSquare, Send,
} from "lucide-react";
import { productApi, THEME_DISPLAY, LAYOUT_DISPLAY, PROFILE_DISPLAY } from "../api/productApi";
import { cartApi } from "../api/cartApi";
import { reviewApi } from "../api/reviewApi";
import { Product } from "../types";

export function ProductDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(searchParams.get("review") === "1");
  const [hoverRating, setHoverRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (id) {
      productApi.getById(id)
        .then((res) => {
          setProduct(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
      // Load reviews
      reviewApi.list(id).then((res: any) => {
        setReviews(Array.isArray(res?.data || res) ? (res?.data || res) : []);
      }).catch(() => {});
    }
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    if (!userId) { navigate("/login"); return; }
    if (!id) return;
    setSubmittingReview(true);
    try {
      await reviewApi.create(id, { userId: parseInt(userId), rating: reviewRating, comment: reviewComment });
      setReviewComment(""); setReviewRating(5); setShowReviewForm(false);
      // Reload reviews
      const res: any = await reviewApi.list(id);
      setReviews(Array.isArray(res?.data || res) ? (res?.data || res) : []);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Không thể gửi đánh giá. Vui lòng thử lại.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s: number, r: any) => s + (r.rating || 0), 0) / reviews.length)
    : 0;

  const handleAddToCart = async () => {
    if (!product) return;
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    setAddingToCart(true);
    try {
      await cartApi.addItem({ productId: Number(product.id), quantity, options: "" });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    } catch (err) {
      alert("Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Không tìm thấy sản phẩm!</h1>
        <Link
          to="/"
          className="bg-gray-900 text-white px-8 py-3 rounded-lg inline-block hover:bg-gray-800 transition-colors"
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
        className="flex items-center gap-2 mb-8 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Quay lại cửa hàng</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div>
          <div className="bg-gray-100 rounded-2xl overflow-hidden mb-4 relative">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-[500px] object-cover"
              />
            ) : (
              <div className="w-full h-[500px] flex items-center justify-center">
                <Package className="w-24 h-24 text-gray-300" />
              </div>
            )}
            {!inStock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-white text-gray-900 font-bold px-6 py-3 rounded-full text-lg">Hết hàng</span>
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? "border-purple-500 scale-105 shadow-lg shadow-purple-200"
                      : "border-gray-200 hover:border-gray-400"
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
            <span className="bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> {themeLabel}
            </span>
            <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5" /> {layoutLabel}
            </span>
            <span className="bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" /> {profileLabel}
            </span>
          </div>

          <h1 className="text-4xl font-bold mb-4 text-gray-900">{product.name}</h1>

          {/* Rating placeholder */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 stroke-gray-300" />
              ))}
            </div>
            <span className="text-gray-500 text-sm">Chưa có đánh giá</span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              {(product.price).toLocaleString('vi-VN')}đ
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-lg mb-6 text-gray-600 leading-relaxed">{product.description}</p>
          )}

          {/* Stock Info */}
          <div className={`border rounded-xl p-4 mb-6 ${
            inStock
              ? product.stockQuantity < 10
                ? "bg-amber-50 border-amber-200"
                : "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}>
            <div className={`flex items-center gap-2 font-semibold ${
              inStock
                ? product.stockQuantity < 10 ? "text-amber-700" : "text-green-700"
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
              <label className="font-semibold mb-3 block text-gray-900">Số lượng</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-bold text-xl"
                >
                  -
                </button>
                <span className="text-2xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  className="w-12 h-12 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-bold text-xl"
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
              disabled={!inStock || addingToCart}
              className={`flex-1 px-8 py-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                addedToCart
                  ? "bg-green-500 text-white shadow-green-200"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-purple-200"
              }`}
            >
              {addingToCart ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Đang thêm...</>
              ) : addedToCart ? (
                <><CheckCircle className="w-5 h-5" /> Đã thêm vào giỏ!</>
              ) : (
                <><ShoppingCart className="w-5 h-5" /> Thêm vào giỏ</>
              )}
            </button>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all ${
                isFavorite ? "bg-red-50 border-red-500 text-red-500" : "border-gray-300 text-gray-600 hover:border-gray-400"
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
          {localStorage.getItem("token") && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors text-sm"
            >
              <Star className="w-4 h-4" />
              {showReviewForm ? "Đóng" : "Viết đánh giá"}
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Đánh giá của bạn</h3>
            {/* Star Selector */}
            <div className="flex items-center gap-1 mb-4">
              <span className="text-sm text-gray-600 mr-2">Chất lượng:</span>
              {[1,2,3,4,5].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setReviewRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star className={`w-8 h-8 cursor-pointer transition-colors ${
                    s <= (hoverRating || reviewRating)
                      ? "fill-amber-400 stroke-amber-400"
                      : "stroke-gray-300"
                  }`} />
                </button>
              ))}
              <span className="ml-2 font-bold text-gray-700">
                {["","Rất tệ","Tệ","Bình thường","Tốt","Xuất sắc"][hoverRating || reviewRating]}
              </span>
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              rows={3}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none mb-4 bg-white"
            />
            <button
              type="submit"
              disabled={submittingReview}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-60"
            >
              {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </form>
        )}

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