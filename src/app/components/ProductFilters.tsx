// src/app/components/ProductFilters.tsx
import { SlidersHorizontal } from "lucide-react";

interface ProductFiltersProps {
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
  priceRange: string;
  setPriceRange: (range: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export function ProductFilters({
  selectedTheme,
  setSelectedTheme,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy
}: ProductFiltersProps) {
  const themes = ["All", "Colorful", "RGB", "Minimal", "Retro", "Pastel", "Dark"];
  const priceRanges = ["All", "$0-$50", "$50-$100", "$100-$150", "$150+"];
  const sortOptions = ["Popularity", "Price: Low to High", "Price: High to Low", "Name"];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
      <div className="flex items-center gap-2 mb-6">
        <SlidersHorizontal className="w-5 h-5 text-gray-700" />
        <h3 className="font-semibold text-lg text-gray-900">Filters</h3>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Theme Filter */}
        <div>
          <label className="font-medium mb-3 block text-gray-700">Theme</label>
          <div className="flex flex-wrap gap-2">
            {themes.map((theme) => (
              <button
                key={theme}
                onClick={() => setSelectedTheme(theme)}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  selectedTheme === theme
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        {/* Price Filter */}
        <div>
          <label className="font-medium mb-3 block text-gray-700">Price Range</label>
          <div className="flex flex-wrap gap-2">
            {priceRanges.map((range) => (
              <button
                key={range}
                onClick={() => setPriceRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  priceRange === range
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Filter */}
        <div>
          <label className="font-medium mb-3 block text-gray-700">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 bg-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-700"
          >
            {sortOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}