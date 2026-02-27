// src/app/pages/ProductDetail.tsx
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ShoppingCart,
  Heart,
  Share2,
  ArrowLeft,
  Star,
  Package,
  Truck,
  Shield,
  Home,
  ChevronRight,
  Keyboard,
  Layers,
  Check,
} from "lucide-react";
import { products } from "../data/products";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { ProductCard } from "../components/ProductCard";

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSelectedImage(0);
    setQuantity(1);
    setAddedToCart(false);
  }, [id]);

  // Related products: prioritize same theme, then fill with others
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const sameTheme = products.filter(
      (p) => p.id !== product.id && p.theme === product.theme
    );
    const others = products.filter(
      (p) => p.id !== product.id && p.theme !== product.theme
    );
    return [...sameTheme, ...others].slice(0, 4);
  }, [product]);

  const handleAddToCart = () => {
    // TODO: integrate with global cart state/context
    console.log(`Added ${quantity}x "${product?.name}" to cart`);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          Product not found!
        </h1>
        <p className="text-gray-500 mb-8">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/"
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl inline-block hover:shadow-lg hover:shadow-purple-500/30 transition-all font-semibold"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const starRating = Math.floor(product.popularity / 20);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link
          to="/"
          className="flex items-center gap-1 hover:text-purple-600 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          to={`/?theme=${product.theme}`}
          className="hover:text-purple-600 transition-colors"
        >
          {product.theme}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden mb-4 shadow-sm">
            <ImageWithFallback
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-[500px] object-cover transition-all duration-500"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`rounded-xl overflow-hidden border-2 transition-all duration-300 ${selectedImage === index
                  ? "border-purple-500 scale-105 shadow-lg shadow-purple-500/20"
                  : "border-gray-200 hover:border-purple-300"
                  }`}
              >
                <ImageWithFallback
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-28 object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          {/* Theme badge */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-1.5 rounded-full inline-block text-sm font-semibold mb-4">
            {product.theme}
          </div>

          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < starRating
                    ? "fill-yellow-400 stroke-yellow-400"
                    : "stroke-gray-300"
                    }`}
                />
              ))}
            </div>
            <span className="text-gray-600 text-sm">
              {starRating}/5 · Popularity score: {product.popularity}
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              ${product.price}
            </span>
          </div>

          {/* Description */}
          <p className="text-lg mb-6 text-gray-600 leading-relaxed">
            {product.description}
          </p>

          {/* Specifications */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <Keyboard className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Layout
                </div>
                <div className="font-semibold text-gray-900">
                  {product.layout}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <Layers className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Profile
                </div>
                <div className="font-semibold text-gray-900">
                  {product.profile}
                </div>
              </div>
            </div>
          </div>

          {/* Stock Info */}
          <div
            className={`border rounded-xl p-4 mb-6 ${product.stock > 10
              ? "bg-green-50 border-green-200"
              : product.stock > 0
                ? "bg-amber-50 border-amber-200"
                : "bg-red-50 border-red-200"
              }`}
          >
            <div
              className={`flex items-center gap-2 ${product.stock > 10
                ? "text-green-700"
                : product.stock > 0
                  ? "text-amber-700"
                  : "text-red-700"
                }`}
            >
              <Package className="w-5 h-5" />
              <span className="font-semibold">
                {product.stock > 10
                  ? "In Stock"
                  : product.stock > 0
                    ? `Only ${product.stock} left!`
                    : "Out of Stock"}
              </span>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="font-semibold mb-3 block text-gray-900">
              Quantity
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-lg"
              >
                −
              </button>
              <span className="text-2xl font-semibold w-12 text-center">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity(Math.min(product.stock, quantity + 1))
                }
                className="w-12 h-12 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-lg"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-1 px-8 py-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all duration-300 ${addedToCart
                ? "bg-green-600 text-white shadow-lg shadow-green-500/30"
                : product.stock === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30"
                }`}
            >
              {addedToCart ? (
                <>
                  <Check className="w-5 h-5" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart — ${(product.price * quantity).toFixed(2)}
                </>
              )}
            </button>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${isFavorite
                ? "bg-pink-50 border-pink-500 text-pink-500 shadow-lg shadow-pink-500/20"
                : "border-gray-300 text-gray-600 hover:border-purple-400 hover:text-purple-600"
                }`}
            >
              <Heart
                className={`w-6 h-6 ${isFavorite ? "fill-pink-500" : ""}`}
              />
            </button>
            <button className="w-14 h-14 rounded-xl border-2 border-gray-300 text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-all duration-300 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <Truck className="w-6 h-6 text-purple-600" />
              <div>
                <div className="font-semibold text-gray-900">Free Shipping</div>
                <div className="text-sm text-gray-500">On orders over $50</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-purple-600" />
              <div>
                <div className="font-semibold text-gray-900">1 Year Warranty</div>
                <div className="text-sm text-gray-500">Quality guaranteed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-20">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">
          You Might Also Like
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {relatedProducts.map((relatedProduct, index) => (
            <ProductCard
              key={relatedProduct.id}
              product={relatedProduct}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}