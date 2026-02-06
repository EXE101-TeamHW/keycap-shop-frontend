// src/app/pages/Orders.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Package, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { AuthService } from "../data/users";

export function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Lấy tất cả đơn hàng từ localStorage
    const allOrders = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('order_')) {
        const orderData = localStorage.getItem(key);
        if (orderData) {
          allOrders.push(JSON.parse(orderData));
        }
      }
    }

    // Sắp xếp theo ngày tạo mới nhất
    allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setOrders(allOrders);
  }, [currentUser, navigate]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Đã thanh toán';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'failed':
        return 'Thất bại';
      case 'pending':
        return 'Đang xử lý';
      default:
        return 'Không xác định';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'confirmed':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">Đơn hàng của tôi</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-24 h-24 mx-auto mb-4 text-gray-300" />
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Chưa có đơn hàng nào</h2>
          <p className="text-gray-600 mb-8">Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!</p>
          <button
            onClick={() => navigate("/")}
            className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Bắt đầu mua sắm
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.orderId} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Đơn hàng #{order.orderId}</h3>
                  <p className="text-sm text-gray-600">
                    Đặt ngày {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
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
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
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
                    {order.paymentMethod === 'vnpay' ? 'VNPay' : 'Thanh toán khi nhận hàng'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Tổng cộng</div>
                  <div className="text-xl font-bold text-gray-900">${order.total.toFixed(2)}</div>
                </div>
              </div>

              {/* Actions */}
              {order.status === 'failed' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => navigate('/checkout')}
                    className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    Đặt lại đơn hàng
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}