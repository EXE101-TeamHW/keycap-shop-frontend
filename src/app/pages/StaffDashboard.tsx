import { useState } from "react";
import { Package, CheckCircle, Clock, X, Eye, Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { Product } from "../data/products";

interface Order {
  id: string;
  customerName: string;
  email: string;
  type: "Product" | "Custom";
  details: string;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  date: string;
  amount: string;
}

interface NewProduct {
  name: string;
  price: string;
  theme: string;
  layout: string;
  profile: string;
  stock: string;
  description: string;
  imageUrl: string;
}

export function StaffDashboard() {
  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-001",
      customerName: "John Doe",
      email: "john@example.com",
      type: "Custom",
      details: "Custom 65% keyboard - Cyberpunk theme",
      status: "Pending",
      date: "2026-02-04",
      amount: "$350.00"
    },
    {
      id: "ORD-002",
      customerName: "Jane Smith",
      email: "jane@example.com",
      type: "Product",
      details: "Neon Dreams Keycap Set x2",
      status: "In Progress",
      date: "2026-02-03",
      amount: "$179.98"
    },
    {
      id: "ORD-003",
      customerName: "Mike Johnson",
      email: "mike@example.com",
      type: "Custom",
      details: "Custom TKL keyboard - Minimalist White",
      status: "Completed",
      date: "2026-02-01",
      amount: "$425.00"
    },
  ]);

  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Neon Dreams",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1721492631645-d8c12f883bb9?w=500",
      theme: "Colorful",
      layout: "65%",
      profile: "Cherry",
      popularity: 95,
      description: "Vibrant gradient keycaps with a dreamy neon aesthetic",
      stock: 12,
      images: []
    },
    {
      id: "2",
      name: "Cyber Punk",
      price: 129.99,
      image: "https://images.unsplash.com/photo-1645802106095-765b7e86f5bb?w=500",
      theme: "RGB",
      layout: "TKL",
      profile: "OEM",
      popularity: 88,
      description: "RGB backlit compatible keycaps with futuristic theme",
      stock: 8,
      images: []
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    price: "",
    theme: "",
    layout: "",
    profile: "",
    stock: "",
    description: "",
    imageUrl: ""
  });

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const deleteProduct = (productId: string) => {
    setProducts(products.filter(product => product.id !== productId));
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      alert("Please fill in all required fields");
      return;
    }

    const product: Product = {
      id: String(products.length + 1),
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      image: newProduct.imageUrl || "https://images.unsplash.com/photo-1721492631645-d8c12f883bb9?w=500",
      theme: newProduct.theme || "Colorful",
      layout: newProduct.layout || "65%",
      profile: newProduct.profile || "Cherry",
      popularity: 0,
      description: newProduct.description,
      stock: parseInt(newProduct.stock),
      images: []
    };

    setProducts([...products, product]);
    setShowAddProduct(false);
    setNewProduct({
      name: "",
      price: "",
      theme: "",
      layout: "",
      profile: "",
      stock: "",
      description: "",
      imageUrl: ""
    });
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "In Progress": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Completed": return "bg-green-100 text-green-700 border-green-200";
      case "Cancelled": return "bg-red-100 text-red-700 border-red-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">Staff Dashboard</h1>
        <p className="text-gray-600">Quản lý đơn hàng và đăng sản phẩm mới</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Tổng đơn hàng</span>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{orders.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Chờ xử lý</span>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {orders.filter(o => o.status === "Pending").length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Đang xử lý</span>
            <Package className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {orders.filter(o => o.status === "In Progress").length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Sản phẩm</span>
            <Package className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{products.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex gap-8 px-6">
            <button
              onClick={() => setActiveTab("orders")}
              className={`py-4 font-semibold border-b-2 transition-colors ${
                activeTab === "orders"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Quản lý đơn hàng
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`py-4 font-semibold border-b-2 transition-colors ${
                activeTab === "products"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Đăng sản phẩm mới
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "orders" ? (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Mã đơn</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Khách hàng</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Loại</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Chi tiết</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Trạng thái</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Giá trị</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-gray-900">{order.id}</td>
                        <td className="py-4 px-4">
                          <div className="text-gray-900 font-medium">{order.customerName}</div>
                          <div className="text-sm text-gray-500">{order.email}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.type === "Custom" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                          }`}>
                            {order.type}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-600 text-sm">{order.details}</td>
                        <td className="py-4 px-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as Order["status"])}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(order.status)}`}
                          >
                            <option value="Pending">Chờ xử lý</option>
                            <option value="In Progress">Đang xử lý</option>
                            <option value="Completed">Hoàn thành</option>
                            <option value="Cancelled">Đã hủy</option>
                          </select>
                        </td>
                        <td className="py-4 px-4 font-semibold text-gray-900">{order.amount}</td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Danh sách sản phẩm</h3>
                <button 
                  onClick={() => setShowAddProduct(true)}
                  className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Đăng sản phẩm mới
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                    <div className="flex gap-4 p-4">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{product.name}</h4>
                            <p className="text-sm text-gray-600">{product.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-1 text-gray-600 hover:text-gray-900 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteProduct(product.id)}
                              className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="px-2 py-1 bg-white rounded text-xs font-semibold">{product.theme}</span>
                          <span className="px-2 py-1 bg-white rounded text-xs font-semibold">{product.layout}</span>
                          <span className="px-2 py-1 bg-white rounded text-xs font-semibold">{product.profile}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-lg font-bold text-gray-900">${product.price}</span>
                          <span className={`text-sm font-semibold ${product.stock < 10 ? "text-red-600" : "text-green-600"}`}>
                            Tồn kho: {product.stock}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-2xl font-bold text-gray-900">Đăng sản phẩm mới</h3>
              <button
                onClick={() => setShowAddProduct(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="font-medium mb-2 block text-gray-700">Tên sản phẩm *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="VD: Galaxy Dreams"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-medium mb-2 block text-gray-700">Giá bán ($) *</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="99.99"
                  />
                </div>
                <div>
                  <label className="font-medium mb-2 block text-gray-700">Số lượng *</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="font-medium mb-2 block text-gray-700">Theme</label>
                  <select
                    value={newProduct.theme}
                    onChange={(e) => setNewProduct({ ...newProduct, theme: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
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
                  <label className="font-medium mb-2 block text-gray-700">Layout</label>
                  <select
                    value={newProduct.layout}
                    onChange={(e) => setNewProduct({ ...newProduct, layout: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  >
                    <option value="">Chọn layout</option>
                    <option value="60%">60%</option>
                    <option value="65%">65%</option>
                    <option value="75%">75%</option>
                    <option value="TKL">TKL</option>
                    <option value="FULL">FULL</option>
                    <option value="ISO">ISO</option>
                    <option value="ANSI">ANSI</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium mb-2 block text-gray-700">Profile</label>
                  <select
                    value={newProduct.profile}
                    onChange={(e) => setNewProduct({ ...newProduct, profile: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
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

              <div>
                <label className="font-medium mb-2 block text-gray-700">Mô tả</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
                  placeholder="Mô tả chi tiết về sản phẩm..."
                />
              </div>

              <div>
                <label className="font-medium mb-2 block text-gray-700">URL hình ảnh</label>
                <div className="relative">
                  <input
                    type="text"
                    value={newProduct.imageUrl}
                    onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                    className="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="https://example.com/image.jpg"
                  />
                  <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddProduct}
                  className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Đăng sản phẩm
                </button>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-600">Mã đơn hàng</label>
                <div className="font-semibold text-gray-900">{selectedOrder.id}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Tên khách hàng</label>
                <div className="font-semibold text-gray-900">{selectedOrder.customerName}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <div className="font-semibold text-gray-900">{selectedOrder.email}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Loại đơn hàng</label>
                <div className="font-semibold text-gray-900">{selectedOrder.type}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Chi tiết</label>
                <div className="font-semibold text-gray-900">{selectedOrder.details}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Trạng thái</label>
                <div className="font-semibold text-gray-900">{selectedOrder.status}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Giá trị</label>
                <div className="font-semibold text-gray-900">{selectedOrder.amount}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Ngày đặt</label>
                <div className="font-semibold text-gray-900">{selectedOrder.date}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}