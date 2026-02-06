// src/app/pages/OrderSuccess.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { CheckCircle, Package, Truck, ArrowRight } from "lucide-react";

export function OrderSuccess() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      const stored = localStorage.getItem(`order_${orderId}`);
      if (stored) {
        setOrderData(JSON.parse(stored));
      }
    }
  }, [orderId]);

  if (!orderData) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center py-16">
          <p className="text-gray-600">Không tìm thấy thông tin đơn hàng</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        </div>

        {/* Success Title */}
        <h1 className="text-3xl font-bold mb-4 text-green-600">
          Đặt hàng thành công!
        </h1>

        <p className="text-gray-600 mb-8 text-lg">
          Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng.
        </p>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Chi tiết đơn hàng</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-gray-600">Mã đơn hàng:</span>
              <span className="font-semibold ml-2">{orderId}</span>
            </div>
            <div>
              <span className="text-gray-600">Tổng tiền:</span>
              <span className="font-semibold ml-2">${orderData.total.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-600">Phương thức:</span>
              <span className="font-semibold ml-2">Thanh toán khi nhận hàng</span>
            </div>
            <div>
              <span className="text-gray-600">Trạng thái:</span>
              <span className="font-semibold ml-2 text-green-600">Đã xác nhận</span>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-gray-900">Sản phẩm đã đặt:</h3>
            {orderData.items.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">Số lượng: {item.quantity}</div>
                  </div>
                </div>
                <div className="font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Shipping Info */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Thông tin giao hàng:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div><strong>Người nhận:</strong> {orderData.shippingInfo.fullName}</div>
              <div><strong>Điện thoại:</strong> {orderData.shippingInfo.phone}</div>
              <div><strong>Địa chỉ:</strong> {orderData.shippingInfo.address}, {orderData.shippingInfo.ward}, {orderData.shippingInfo.district}, {orderData.shippingInfo.city}</div>
              {orderData.shippingInfo.note && (
                <div><strong>Ghi chú:</strong> {orderData.shippingInfo.note}</div>
              )}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Các bước tiếp theo:
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <span className="font-semibold">1.</span>
              <span>Chúng tôi sẽ gọi điện xác nhận đơn hàng trong vòng 2 giờ</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">2.</span>
              <span>Đơn hàng sẽ được chuẩn bị và đóng gói trong 1-2 ngày làm việc</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">3.</span>
              <span>Giao hàng trong 3-5 ngày làm việc (tùy khu vực)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">4.</span>
              <span>Thanh toán khi nhận hàng: ${orderData.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Tiếp tục mua sắm
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="bg-white border border-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2 justify-center"
          >
            Theo dõi đơn hàng
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Support Info */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
          <p>
            Nếu bạn có thắc mắc về đơn hàng, vui lòng liên hệ{' '}
            <a href="mailto:support@hwshop.com" className="text-gray-900 hover:underline">
              support@hwshop.com
            </a>
            {' '}hoặc hotline{' '}
            <a href="tel:+84123456789" className="text-gray-900 hover:underline">
              +84 123 456 789
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}