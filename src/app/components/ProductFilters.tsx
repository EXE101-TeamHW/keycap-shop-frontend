import { useState } from "react";
import { SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProductFiltersProps {
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
  selectedLayout: string;
  setSelectedLayout: (layout: string) => void;
  selectedProfile: string;
  setSelectedProfile: (profile: string) => void;
  priceRange: string;
  setPriceRange: (range: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export function ProductFilters({
  selectedTheme,
  setSelectedTheme,
  selectedLayout,
  setSelectedLayout,
  selectedProfile,
  setSelectedProfile,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy
}: ProductFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const themes = ["Tất cả", "Colorful", "RGB", "Minimal", "Retro", "Pastel", "Dark"];
  const layouts = ["Tất cả", "60%", "65%", "75%", "TKL", "FULL", "ISO", "ANSI", "Custom"];
  const profiles = ["Tất cả", "Cherry", "OEM", "SA", "DSA", "XDA", "MT3"];
  const priceRanges = ["Tất cả", "0đ - 1.250.000đ", "1.250.000đ - 2.500.000đ", "2.500.000đ - 3.750.000đ", "Trên 3.750.000đ"];
  const sortOptions = ["Phổ biến nhất", "Giá: Thấp đến Cao", "Giá: Cao đến Thấp", "Tên A-Z"];

  // Count active filters
  const activeFiltersCount = [
    selectedTheme !== "Tất cả",
    selectedLayout !== "Tất cả",
    selectedProfile !== "Tất cả",
    priceRange !== "Tất cả",
    sortBy !== "Phổ biến nhất"
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8 overflow-hidden">
      {/* Header / Toggle Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 bg-white hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <SlidersHorizontal className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
            Bộ lọc & Sắp xếp
            {activeFiltersCount > 0 && (
              <span className="bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <span className="text-sm font-medium hidden sm:block">
            {isExpanded ? "Thu gọn" : "Mở rộng"}
          </span>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 pt-0 border-t border-gray-100">
              <div className="grid grid-cols-1 gap-8 mt-6">
                {/* Theme Filter */}
                <div>
                  <label className="font-semibold mb-3 block text-gray-900">Chủ đề (Theme)</label>
                  <div className="flex flex-wrap gap-2">
                    {themes.map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setSelectedTheme(theme)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                          selectedTheme === theme
                            ? "bg-slate-900 text-white shadow-md"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layout Filter */}
                <div>
                  <label className="font-semibold mb-3 block text-gray-900">Kích thước (Layout)</label>
                  <div className="flex flex-wrap gap-2">
                    {layouts.map((layout) => (
                      <button
                        key={layout}
                        onClick={() => setSelectedLayout(layout)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                          selectedLayout === layout
                            ? "bg-slate-900 text-white shadow-md"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {layout}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Profile Filter */}
                <div>
                  <label className="font-semibold mb-3 block text-gray-900">Loại phím (Profile)</label>
                  <div className="flex flex-wrap gap-2">
                    {profiles.map((profile) => (
                      <button
                        key={profile}
                        onClick={() => setSelectedProfile(profile)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                          selectedProfile === profile
                            ? "bg-slate-900 text-white shadow-md"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {profile}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price and Sort Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
                  {/* Price Filter */}
                  <div>
                    <label className="font-semibold mb-3 block text-gray-900">Khoảng giá</label>
                    <div className="flex flex-wrap gap-2">
                      {priceRanges.map((range) => (
                        <button
                          key={range}
                          onClick={() => setPriceRange(range)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                            priceRange === range
                              ? "bg-slate-900 text-white shadow-md"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <label className="font-semibold mb-3 block text-gray-900">Sắp xếp theo</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 bg-white rounded-xl font-medium focus:outline-none focus:ring-0 focus:border-purple-500 transition-all text-slate-700 cursor-pointer"
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}