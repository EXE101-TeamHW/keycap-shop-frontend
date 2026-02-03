// src/app/pages/Home.tsx
import { useState, useMemo } from "react";
import { BannerCarousel } from "../components/BannerCarousel";
import { ProductFilters } from "../components/ProductFilters";
import { ProductCard } from "../components/ProductCard";
import { products } from "../data/products";
import { Sparkles, TrendingUp, Package } from "lucide-react";

export function Home() {
  const [selectedTheme, setSelectedTheme] = useState("All");
  const [priceRange, setPriceRange] = useState("All");
  const [sortBy, setSortBy] = useState("Popularity");

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by theme
    if (selectedTheme !== "All") {
      filtered = filtered.filter((p) => p.theme === selectedTheme);
    }

    // Filter by price
    if (priceRange !== "All") {
      const [min, max] = priceRange.replace("$", "").split("-").map(s => {
        if (s.includes("+")) return [parseInt(s), Infinity];
        return parseInt(s);
      }).flat();
      
      if (priceRange === "$150+") {
        filtered = filtered.filter((p) => p.price >= 150);
      } else {
        filtered = filtered.filter((p) => p.price >= min && p.price <= max);
      }
    }

    // Sort
    switch (sortBy) {
      case "Popularity":
        filtered.sort((a, b) => b.popularity - a.popularity);
        break;
      case "Price: Low to High":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "Price: High to Low":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "Name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [selectedTheme, priceRange, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <BannerCarousel />

      {/* Featured Stats Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Sparkles, label: "Premium Quality", value: "100% Authentic", color: "from-purple-500 to-pink-500" },
            { icon: TrendingUp, label: "Best Sellers", value: "1000+ Happy Customers", color: "from-blue-500 to-cyan-500" },
            { icon: Package, label: "Fast Shipping", value: "2-3 Days Delivery", color: "from-orange-500 to-red-500" },
          ].map((stat, index) => (
            <div 
              key={stat.label}
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-black text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Section Title */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-5xl font-black mb-4">
            <span className="gradient-text">Shop All Keycaps</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our curated collection of premium mechanical keyboard keycaps
          </p>
        </div>

        <ProductFilters
          selectedTheme={selectedTheme}
          setSelectedTheme={setSelectedTheme}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Showing <span className="font-bold text-gray-900">{filteredAndSortedProducts.length}</span> products
          </p>
          {(selectedTheme !== "All" || priceRange !== "All") && (
            <button
              onClick={() => {
                setSelectedTheme("All");
                setPriceRange("All");
              }}
              className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
            >
              Clear all filters
            </button>
          )}
        </div>

        {filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="text-6xl mb-4">😔</div>
            <p className="text-3xl font-bold text-gray-900 mb-2">No products found!</p>
            <p className="text-gray-600 mb-6">Try adjusting your filters</p>
            <button
              onClick={() => {
                setSelectedTheme("All");
                setPriceRange("All");
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Newsletter Section */}
      <footer className="mt-20 bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Brand */}
            <div className="text-2xl font-black tracking-wide text-white">
              Keycap<span className="text-purple-400">Shop</span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium">
              <a
                href="#"
                className="hover:text-white transition-colors duration-200"
              >
                About
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors duration-200"
              >
                Contact
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors duration-200"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors duration-200"
              >
                Privacy Policy
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="my-8 h-px w-full bg-gray-800" />

          {/* Copyright */}
          <div className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} KeycapShop. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
