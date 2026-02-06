// src/app/pages/PaymentReturn.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react";
import { VNPayService } from "../services/vnpay";

export function PaymentReturn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    transactionStatus: 'success' | 'failed' | 'pending';
    message: string;
    orderId?: string;
    amount?: number;
  } | null>(null);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    // Lấy tất cả query parameters từ VNPay
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    // Xác thực phản hồi từ VNPay
    const result = VNPayService.verifyPaymentResponse(params);
    setPaymentResult(result);

    // Lấy thông tin đơn hàng từ localStorage
    if (result.orderId) {
      const stored = localStorage.getItem(`order_${result.orderId}`);
      if (stored) {
        const order = JSON.parse(stored);
        // Cập nhật trạng thái đơn hàng
        order.status = result.transactionStatus === 'success' ? 'paid' : 'failed';
        order.paymentResult = result;
        localStorage.setItem(`order_${result.orderId}`, JSON.stringify(order));
        setOrderData(order);
      }
    }
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (paymentResult?.transactionStatus) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Clock className="w-16 h-16 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (paymentResult?.transactionStatus) {
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getStatusTitle = () => {
    switch (paymentResult?.transactionStatus) {
      case 'success':
        return 'Thanh toán thành công!';
      case 'failed':
        return 'Thanh toán thất bại!';
      default:
        return 'Đang xử lý thanh toán...';
    }
  };

  if (!paymentResult) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
        {/* Status Icon */}
        <div className="mb-6">
          {getStatusIcon()}
        </div>

        {/* Status Title */}
        <h1 className={`text-3xl font-bold mb-4 ${getStatusColor()}`}>
          {getStatusTitle()}
        </h1>

        {/* Status Message */}
        <p className="text-gray-600 mb-8 text-lg">
          {paymentResult.message}
        </p>

        {/* Order Details */}
        {orderData && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Chi tiết đơn hàng</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-semibold ml-2">{paymentResult.orderId}</span>
              </div>
              <div>
                <span className="text-gray-600">Tổng tiền:</span>
                <span className="font-semibold ml-2">${orderData.total.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600">Phương thức:</span>
                <span className="font-semibold ml-2">VNPay</span>
              </div>
              <div>
                <span className="text-gray-600">Trạng thái:</span>
                <span className={`font-semibold ml-2 ${getStatusColor()}`}>
                  {paymentResult.transactionStatus === 'success' ? 'Đã thanh toán' : 
                   paymentResult.transactionStatus === 'failed' ? 'Thất bại' : 'Đang xử lý'}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Sản phẩm đã mua:</h3>
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
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Thông tin giao hàng:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Người nhận:</strong> {orderData.shippingInfo.fullName}</div>
                <div><strong>Điện thoại:</strong> {orderData.shippingInfo.phone}</div>
                <div><strong>Địa chỉ:</strong> {orderData.shippingInfo.address}, {orderData.shippingInfo.ward}, {orderData.shippingInfo.district}, {orderData.shippingInfo.city}</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {paymentResult.transactionStatus === 'success' ? (
            <>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Tiếp tục mua sắm
              </button>
              <button
                onClick={() => navigate('/orders')}
                className="bg-white border border-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
              >
                Xem đơn hàng
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/cart')}
                className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Quay lại giỏ hàng
              </button>
              <button
                onClick={() => navigate('/checkout')}
                className="bg-white border border-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Thử lại thanh toán
              </button>
            </>
          )}
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