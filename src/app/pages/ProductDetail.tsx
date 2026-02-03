// src/app/pages/ProductDetail.tsx
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ShoppingCart, Heart, Share2, ArrowLeft, Star, Package, Truck, Shield } from "lucide-react";
import { products } from "../data/products";

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Product not found!</h1>
        <Link
          to="/"
          className="bg-gray-900 text-white px-8 py-3 rounded-lg inline-block hover:bg-gray-800 transition-colors"
        >
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 mb-8 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back to Shop</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div>
          <div className="bg-gray-100 rounded-xl overflow-hidden mb-4">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-[500px] object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === index
                    ? "border-gray-900 scale-105"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <img
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="bg-gray-100 px-4 py-1.5 rounded-full inline-block text-sm font-semibold mb-4">
            {product.theme}
          </div>
          
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.popularity / 20)
                      ? "fill-yellow-400 stroke-yellow-400"
                      : "stroke-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-600">({product.popularity} reviews)</span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-4xl font-bold text-gray-900">${product.price}</span>
          </div>

          {/* Description */}
          <p className="text-lg mb-6 text-gray-600 leading-relaxed">{product.description}</p>

          {/* Stock Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-green-700">
              <Package className="w-5 h-5" />
              <span className="font-semibold">
                {product.stock > 10 ? "In Stock" : `Only ${product.stock} left!`}
              </span>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="font-semibold mb-3 block text-gray-900">Quantity</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                -
              </button>
              <span className="text-2xl font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-12 h-12 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => navigate("/cart")}
              className="flex-1 bg-gray-900 text-white px-8 py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors font-medium"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center transition-all ${
                isFavorite ? "bg-red-50 border-red-500 text-red-500" : "border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              <Heart className={`w-6 h-6 ${isFavorite ? "fill-red-500" : ""}`} />
            </button>
            <button className="w-14 h-14 rounded-lg border-2 border-gray-300 text-gray-600 hover:border-gray-400 transition-colors flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
              <Truck className="w-6 h-6 text-gray-700" />
              <div>
                <div className="font-semibold text-gray-900">Free Shipping</div>
                <div className="text-sm text-gray-600">On orders over $50</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-gray-700" />
              <div>
                <div className="font-semibold text-gray-900">1 Year Warranty</div>
                <div className="text-sm text-gray-600">Quality guaranteed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">
          You Might Also Like
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {products
            .filter((p) => p.id !== product.id)
            .slice(0, 4)
            .map((relatedProduct) => (
              <div
                key={relatedProduct.id}
                onClick={() => navigate(`/product/${relatedProduct.id}`)}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <img
                  src={relatedProduct.image}
                  alt={relatedProduct.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold mb-2 text-gray-900">{relatedProduct.name}</h3>
                  <p className="text-xl font-bold text-gray-900">${relatedProduct.price}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}