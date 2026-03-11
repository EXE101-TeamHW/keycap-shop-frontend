// src/app/pages/Orders.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Wrench,
  Image as ImageIcon,
} from "lucide-react";
import { AuthService } from "../data/users";
import { formatCurrency } from "../utils/formatCurrency";
import { customRequestStorage } from "../services/customRequestStorage";
import { CustomRequest } from "../types/customRequest";

export function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // Lấy tất cả đơn hàng từ localStorage
    const allOrders = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("order_")) {
        const orderData = localStorage.getItem(key);
        if (orderData) {
          allOrders.push(JSON.parse(orderData));
        }
      }
    }

    // Sắp xếp theo ngày tạo mới nhất
    allOrders.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    setOrders(allOrders);

    // Lấy yêu cầu custom của customer hiện tại
    const loadCustomRequests = () => {
      const allRequests = customRequestStorage.getAllRequests();
      const myRequests = allRequests.filter(
        (r) => r.email.toLowerCase() === currentUser.email.toLowerCase(),
      );
      setCustomRequests(myRequests);
    };
    loadCustomRequests();

    const handleUpdate = () => loadCustomRequests();
    window.addEventListener("custom-request-updated", handleUpdate);
    return () =>
      window.removeEventListener("custom-request-updated", handleUpdate);
  }, [currentUser, navigate]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Đã thanh toán";
      case "confirmed":
        return "Đã xác nhận";
      case "failed":
        return "Thất bại";
      case "pending":
        return "Đang xử lý";
      default:
        return "Không xác định";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "confirmed":
        return "text-green-600 bg-green-50";
      case "failed":
        return "text-red-600 bg-red-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getCustomStatusColor = (status: CustomRequest["status"]) => {
    switch (status) {
      case "Pending":
        return "text-yellow-600 bg-yellow-50";
      case "In Progress":
        return "text-blue-600 bg-blue-50";
      case "Awaiting Approval":
        return "text-purple-600 bg-purple-50";
      case "Approved":
        return "text-green-600 bg-green-50";
      case "Completed":
        return "text-green-700 bg-green-100";
      case "Cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getCustomStatusText = (status: CustomRequest["status"]) => {
    switch (status) {
      case "Pending":
        return "Chờ xử lý";
      case "In Progress":
        return "Đang thực hiện";
      case "Awaiting Approval":
        return "Chờ duyệt";
      case "Approved":
        return "Đã duyệt";
      case "Completed":
        return "Hoàn thành";
      case "Cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getCustomStatusIcon = (status: CustomRequest["status"]) => {
    switch (status) {
      case "Completed":
      case "Approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "Cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "Pending":
      case "Awaiting Approval":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "In Progress":
        return <Wrench className="w-5 h-5 text-blue-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">
        Đơn hàng của tôi
      </h1>

      {/* Custom Requests Section */}
      {customRequests.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-purple-600" />
            Yêu cầu Custom Keycap
          </h2>
          <div className="space-y-4">
            {customRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Custom #{req.id.substring(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Gửi ngày{" "}
                      {new Date(req.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getCustomStatusColor(req.status)}`}
                  >
                    {getCustomStatusIcon(req.status)}
                    {getCustomStatusText(req.status)}
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500">Layout</div>
                    <div className="font-semibold text-gray-900">
                      {req.layout}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Profile</div>
                    <div className="font-semibold text-gray-900">
                      {req.profile}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Theme</div>
                    <div className="font-semibold text-gray-900">
                      {req.theme}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Ảnh tham khảo</div>
                    <div className="font-semibold text-gray-900 flex items-center gap-1">
                      <ImageIcon className="w-4 h-4" />
                      {req.images.length} ảnh
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-line line-clamp-3">
                  {req.description}
                </div>

                {/* Result images indicator */}
                {req.resultImages && req.resultImages.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-purple-600">
                    <ImageIcon className="w-4 h-4" />
                    <span>
                      Staff đã gửi {req.resultImages.length} ảnh kết quả
                    </span>
                  </div>
                )}

                {/* Staff notes indicator */}
                {req.staffNotes && req.staffNotes.length > 0 && (
                  <div className="mt-2 text-sm text-blue-600">
                    📋 Có {req.staffNotes.length} ghi chú từ staff
                  </div>
                )}

                {/* Timeline */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Cập nhật: {new Date(req.updatedAt).toLocaleString("vi-VN")}
                  </span>
                  {req.revisionCount > 0 && (
                    <span>Đã chỉnh sửa: {req.revisionCount} lần</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Orders Section */}
      {orders.length === 0 && customRequests.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-24 h-24 mx-auto mb-4 text-gray-300" />
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Chưa có đơn hàng nào
          </h2>
          <p className="text-gray-600 mb-8">
            Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Bắt đầu mua sắm
          </button>
        </div>
      ) : orders.length > 0 ? (
        <>
          {customRequests.length > 0 && (
            <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6" />
              Đơn hàng sản phẩm
            </h2>
          )}
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Đơn hàng #{order.orderId}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Đặt ngày{" "}
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      {getStatusText(order.status)}
                    </div>
                    <button
                      onClick={() => navigate(`/order/${order.orderId}`)}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Chi tiết</span>
                    </button>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-200 gap-4">
                  <div className="text-sm text-gray-600">
                    <span>Phương thức: </span>
                    <span className="font-medium">
                      {order.paymentMethod === "vnpay"
                        ? "VNPay"
                        : "Thanh toán khi nhận hàng"}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Tổng cộng</div>
                    <div className="text-xl font-bold text-gray-900">
                      {formatCurrency(order.total)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {order.status === "failed" && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate("/checkout")}
                      className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                      Đặt lại đơn hàng
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
