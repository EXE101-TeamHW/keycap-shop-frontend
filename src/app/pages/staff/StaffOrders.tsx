import { useState } from "react";
import { Eye, Search, Filter } from "lucide-react";
import { DashboardSidebar } from "../../components/ui/DashboardSidebar";

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

export function StaffOrders() {
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
    {
      id: "ORD-004",
      customerName: "Sarah Wilson",
      email: "sarah@example.com",
      type: "Product",
      details: "Cherry Blossom Keycap Set",
      status: "Pending",
      date: "2026-02-05",
      amount: "$119.99"
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterType, setFilterType] = useState<string>("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "In Progress": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Completed": return "bg-green-100 text-green-700 border-green-200";
      case "Cancelled": return "bg-red-100 text-red-700 border-red-200";
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || order.status === filterStatus;
    const matchesType = filterType === "All" || order.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "Pending").length,
    inProgress: orders.filter(o => o.status === "In Progress").length,
    completed: orders.filter(o => o.status === "Completed").length,
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar role="staff" />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Quản lý đơn hàng</h1>
            <p className="text-gray-600">Theo dõi và xử lý tất cả đơn hàng của khách hàng</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="text-sm text-gray-600 mb-2">Tổng đơn hàng</div>
              <div className="text-3xl font-black text-gray-900">{orderStats.total}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="text-sm text-gray-600 mb-2">Chờ xử lý</div>
              <div className="text-3xl font-black text-yellow-600">{orderStats.pending}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="text-sm text-gray-600 mb-2">Đang xử lý</div>
              <div className="text-3xl font-black text-blue-600">{orderStats.inProgress}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="text-sm text-gray-600 mb-2">Hoàn thành</div>
              <div className="text-3xl font-black text-green-600">{orderStats.completed}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm theo mã đơn, tên, email..."
                    className="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="All">Tất cả loại</option>
                <option value="Product">Sản phẩm</option>
                <option value="Custom">Đơn tùy chỉnh</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="All">Tất cả trạng thái</option>
                <option value="Pending">Chờ xử lý</option>
                <option value="In Progress">Đang xử lý</option>
                <option value="Completed">Hoàn thành</option>
                <option value="Cancelled">Đã hủy</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Mã đơn</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Khách hàng</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Loại</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Chi tiết</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Trạng thái</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Ngày đặt</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Giá trị</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-900">{order.id}</td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          order.type === "Custom" 
                            ? "bg-purple-100 text-purple-700" 
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {order.type === "Custom" ? "Tùy chỉnh" : "Sản phẩm"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 max-w-xs truncate">{order.details}</td>
                      <td className="py-4 px-6">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as Order["status"])}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusColor(order.status)} cursor-pointer`}
                        >
                          <option value="Pending">Chờ xử lý</option>
                          <option value="In Progress">Đang xử lý</option>
                          <option value="Completed">Hoàn thành</option>
                          <option value="Cancelled">Đã hủy</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{order.date}</td>
                      <td className="py-4 px-6 font-bold text-gray-900">{order.amount}</td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg font-semibold mb-2">Không tìm thấy đơn hàng</div>
                  <div className="text-gray-500 text-sm">Thử điều chỉnh bộ lọc của bạn</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-black text-gray-900">Chi tiết đơn hàng</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Eye className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 font-medium">Mã đơn hàng</label>
                  <div className="font-bold text-gray-900 text-lg">{selectedOrder.id}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-medium">Loại đơn hàng</label>
                  <div className="font-bold text-gray-900 text-lg">{selectedOrder.type}</div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 font-medium">Tên khách hàng</label>
                <div className="font-bold text-gray-900 text-lg">{selectedOrder.customerName}</div>
              </div>

              <div>
                <label className="text-sm text-gray-600 font-medium">Email</label>
                <div className="font-semibold text-gray-900">{selectedOrder.email}</div>
              </div>

              <div>
                <label className="text-sm text-gray-600 font-medium">Chi tiết đơn hàng</label>
                <div className="font-semibold text-gray-900">{selectedOrder.details}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 font-medium">Trạng thái</label>
                  <div>
                    <span className={`inline-block px-4 py-2 rounded-lg text-sm font-bold ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-medium">Giá trị</label>
                  <div className="font-black text-gray-900 text-2xl">{selectedOrder.amount}</div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 font-medium">Ngày đặt hàng</label>
                <div className="font-semibold text-gray-900">{selectedOrder.date}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
