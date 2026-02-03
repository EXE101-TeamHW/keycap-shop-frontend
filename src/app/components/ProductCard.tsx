// src/app/components/ProductCard.tsx
import { useNavigate } from "react-router";
import { Star, ShoppingCart, Heart, Eye } from "lucide-react";
import { Product } from "../data/products";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-purple-300 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-100"
      style={{
        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden h-72 bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Main Image */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
        />

        {/* Gradient Overlay on Hover */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

        {/* Stock Badge */}
        {product.stock < 10 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
            Only {product.stock} left!
          </div>
        )}

        {/* Theme Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-gray-900 shadow-lg">
          {product.theme}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            isHovered ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
          } ${
            isFavorite
              ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/50'
              : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-pink-500 hover:text-white shadow-lg'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Action Buttons - Appear on Hover */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 flex gap-2 transition-all duration-500 ${
          isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <button
            onClick={() => navigate(`/product/${product.id}`)}
            className="flex-1 bg-white text-gray-900 px-4 py-3 rounded-xl font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-xl"
          >
            <Eye className="w-4 h-4" />
            Quick View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Add to cart logic
            }}
            className="bg-purple-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-purple-500/50"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Product Name */}
        <h3 
          className="font-bold text-lg mb-2 text-gray-900 cursor-pointer hover:text-purple-600 transition-colors line-clamp-1"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.popularity / 20)
                    ? "fill-yellow-400 stroke-yellow-400"
                    : "stroke-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="ml-1 text-sm text-gray-600">({product.popularity})</span>
        </div>

        {/* Price and Stock */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              ${product.price}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {product.stock} in stock
            </div>
          </div>

          {/* Add to Cart Badge */}
          <div className={`transform transition-all duration-300 ${
            isHovered ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          }`}>
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className={`absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl" />
      </div>
    </div>
  );
}
