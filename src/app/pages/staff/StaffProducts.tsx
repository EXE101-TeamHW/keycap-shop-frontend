import { useState, useRef } from "react";
import { Plus, Edit, Trash2, X, Upload, Image as ImageIcon } from "lucide-react";
import { DashboardSidebar } from "../../components/ui/DashboardSidebar";
import { DashboardHeader } from "../../components/ui/DashboardHeader";
import { DashboardFooter } from "../../components/ui/DashboardFooter";

interface Product {
  id: string;
  name: string;
  price: number;
  theme: string;
  layout: string;
  profile: string;
  stock: number;
  description: string;
  images: string[]; // Array of image URLs (max 4)
}

interface NewProduct {
  name: string;
  price: string;
  theme: string;
  layout: string;
  profile: string;
  stock: string;
  description: string;
  images: File[];
  imagePreviews: string[];
}

export function StaffProducts() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Neon Dreams",
      price: 89.99,
      theme: "Colorful",
      layout: "65%",
      profile: "Cherry",
      stock: 12,
      description: "Vibrant gradient keycaps with a dreamy neon aesthetic",
      images: [
        "https://images.unsplash.com/photo-1721492631645-d8c12f883bb9?w=500",
        "https://images.unsplash.com/photo-1645802106095-765b7e86f5bb?w=500",
      ]
    },
    {
      id: "2",
      name: "Cyber Punk",
      price: 129.99,
      theme: "RGB",
      layout: "TKL",
      profile: "OEM",
      stock: 8,
      description: "RGB backlit compatible keycaps with futuristic theme",
      images: [
        "https://images.unsplash.com/photo-1645802106095-765b7e86f5bb?w=500",
      ]
    },
  ]);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    price: "",
    theme: "",
    layout: "",
    profile: "",
    stock: "",
    description: "",
    images: [],
    imagePreviews: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Limit to 4 images
    if (newProduct.images.length + files.length > 4) {
      alert("Bạn chỉ có thể upload tối đa 4 ảnh!");
      return;
    }

    // Create previews
    const newPreviews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === files.length) {
          setNewProduct(prev => ({
            ...prev,
            images: [...prev.images, ...files],
            imagePreviews: [...prev.imagePreviews, ...newPreviews]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index)
    }));
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    if (newProduct.images.length === 0) {
      alert("Vui lòng upload ít nhất 1 ảnh sản phẩm!");
      return;
    }

    // In real app, you would upload images to server here
    // For now, we'll use the preview URLs
    const product: Product = {
      id: String(products.length + 1),
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      theme: newProduct.theme || "Colorful",
      layout: newProduct.layout || "65%",
      profile: newProduct.profile || "Cherry",
      stock: parseInt(newProduct.stock),
      description: newProduct.description,
      images: newProduct.imagePreviews // In real app: uploaded URLs from server
    };

    setProducts([...products, product]);
    setShowAddProduct(false);
    resetForm();
  };

  const resetForm = () => {
    setNewProduct({
      name: "",
      price: "",
      theme: "",
      layout: "",
      profile: "",
      stock: "",
      description: "",
      images: [],
      imagePreviews: []
    });
  };

  const deleteProduct = (productId: string) => {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar role="staff" />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader role="staff" userName="Staff Member" />
        
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Quản lý sản phẩm</h1>
            <p className="text-gray-600">Thêm, sửa và quản lý tất cả sản phẩm của cửa hàng</p>
          </div>

          {/* Add Product Button */}
          <div className="mb-6">
            <button 
              onClick={() => setShowAddProduct(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              <Plus className="w-5 h-5" />
              Đăng sản phẩm mới
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                {/* Main Image */}
                <div className="relative h-48 bg-gray-100">
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                      +{product.images.length - 1} ảnh
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-1">{product.name}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-2 my-3 flex-wrap">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                      {product.theme}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                      {product.layout}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                      {product.profile}
                    </span>
                  </div>

                  {/* Price & Stock */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                      ${product.price}
                    </span>
                    <span className={`text-sm font-semibold ${product.stock < 10 ? "text-red-600" : "text-green-600"}`}>
                      Stock: {product.stock}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <Edit className="w-4 h-4" />
                      Sửa
                    </button>
                    <button 
                      onClick={() => deleteProduct(product.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-20">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có sản phẩm nào</h3>
              <p className="text-gray-600 mb-6">Bắt đầu bằng cách đăng sản phẩm đầu tiên của bạn!</p>
            </div>
          )}
        </div>
      </div>
      
      <DashboardFooter role="staff" />
    </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-2xl font-black text-gray-900">Đăng sản phẩm mới</h3>
              <button
                onClick={() => {
                  setShowAddProduct(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Image Upload Section */}
              <div>
                <label className="font-semibold mb-3 block text-gray-900">
                  Hình ảnh sản phẩm * <span className="text-sm font-normal text-gray-500">(Tối đa 4 ảnh)</span>
                </label>
                
                <div className="grid grid-cols-4 gap-4">
                  {/* Image Previews */}
                  {newProduct.imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-purple-600 text-white px-2 py-1 rounded-lg text-xs font-bold">
                          Ảnh chính
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Upload Button */}
                  {newProduct.imagePreviews.length < 4 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-purple-500 hover:bg-purple-50 transition-all group"
                    >
                      <Upload className="w-8 h-8 text-gray-400 group-hover:text-purple-600 mb-2" />
                      <span className="text-sm font-semibold text-gray-600 group-hover:text-purple-600">Upload</span>
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Ảnh đầu tiên sẽ là ảnh chính hiển thị. Định dạng: JPG, PNG. Kích thước tối đa: 5MB/ảnh.
                </p>
              </div>

              {/* Product Name */}
              <div>
                <label className="font-semibold mb-2 block text-gray-900">Tên sản phẩm *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="VD: Galaxy Dreams Keycap Set"
                />
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold mb-2 block text-gray-900">Giá bán ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="99.99"
                  />
                </div>
                <div>
                  <label className="font-semibold mb-2 block text-gray-900">Số lượng *</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="20"
                  />
                </div>
              </div>

              {/* Theme, Layout, Profile */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold mb-2 block text-gray-900">Theme</label>
                  <select
                    value={newProduct.theme}
                    onChange={(e) => setNewProduct({ ...newProduct, theme: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="">Chọn theme</option>
                    <option value="Colorful">Colorful</option>
                    <option value="RGB">RGB</option>
                    <option value="Minimal">Minimal</option>
                    <option value="Retro">Retro</option>
                    <option value="Pastel">Pastel</option>
                    <option value="Dark">Dark</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold mb-2 block text-gray-900">Layout</label>
                  <select
                    value={newProduct.layout}
                    onChange={(e) => setNewProduct({ ...newProduct, layout: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="">Chọn layout</option>
                    <option value="60%">60%</option>
                    <option value="65%">65%</option>
                    <option value="75%">75%</option>
                    <option value="TKL">TKL</option>
                    <option value="FULL">FULL</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold mb-2 block text-gray-900">Profile</label>
                  <select
                    value={newProduct.profile}
                    onChange={(e) => setNewProduct({ ...newProduct, profile: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="">Chọn profile</option>
                    <option value="Cherry">Cherry</option>
                    <option value="OEM">OEM</option>
                    <option value="SA">SA</option>
                    <option value="DSA">DSA</option>
                    <option value="XDA">XDA</option>
                    <option value="MT3">MT3</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-semibold mb-2 block text-gray-900">Mô tả sản phẩm</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  placeholder="Mô tả chi tiết về sản phẩm, chất liệu, đặc điểm nổi bật..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddProduct}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
                >
                  Đăng sản phẩm
                </button>
                <button
                  onClick={() => {
                    setShowAddProduct(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
