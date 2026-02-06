// src/app/pages/Checkout.tsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, CreditCard, Truck, MapPin, Phone, Mail, AlertCircle } from "lucide-react";
import { VNPayService, paymentMethods } from "../services/vnpay";
import { AuthService } from "../data/users";

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export function Checkout() {
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  
  // Mock cart items
  const [cartItems] = useState<CheckoutItem[]>([
    {
      id: '1',
      name: 'Neon Dreams',
      price: 89.99,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=150&h=150&fit=crop'
    },
    {
      id: '2',
      name: 'Cyber Punk',
      price: 129.99,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=150&h=150&fit=crop'
    }
  ]);

  const [selectedPayment, setSelectedPayment] = useState('vnpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Shipping information
  const [shippingInfo, setShippingInfo] = useState({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    note: ''
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePayment = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setError('');
    setIsProcessing(true);

    try {
      if (selectedPayment === 'vnpay') {
        const orderId = VNPayService.generateOrderId();
        const orderInfo = `Thanh toan don hang ${orderId} - HWSHOP`;

        const paymentResult = VNPayService.createPaymentUrl({
          amount: total,
          orderInfo,
          orderId,
          returnUrl: `${window.location.origin}/payment/return`
        });

        if (paymentResult.success && paymentResult.paymentUrl) {
          // Lưu thông tin đơn hàng vào localStorage
          const orderData = {
            orderId,
            items: cartItems,
            shippingInfo,
            subtotal,
            shipping,
            tax,
            total,
            paymentMethod: selectedPayment,
            status: 'pending',
            createdAt: new Date().toISOString()
          };
          
          localStorage.setItem(`order_${orderId}`, JSON.stringify(orderData));
          
          // Chuyển hướng đến VNPay
          window.location.href = paymentResult.paymentUrl;
        } else {
          setError(paymentResult.message || 'Không thể tạo liên kết thanh toán');
        }
      } else if (selectedPayment === 'cod') {
        // Xử lý thanh toán khi nhận hàng
        const orderId = VNPayService.generateOrderId();
        const orderData = {
          orderId,
          items: cartItems,
          shippingInfo,
          subtotal,
          shipping,
          tax,
          total,
          paymentMethod: selectedPayment,
          status: 'confirmed',
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem(`order_${orderId}`, JSON.stringify(orderData));
        navigate(`/order-success/${orderId}`);
      }
    } catch (err) {
      setError('Có lỗi xảy ra trong quá trình thanh toán');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập để tiếp tục</h2>
          <button
            onClick={() => navigate('/login')}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/cart')}
        className="flex items-center gap-2 mb-8 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Quay lại giỏ hàng</span>
      </button>

      <h1 className="text-4xl font-bold mb-8 text-gray-900">Thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Forms */}
        <div className="space-y-8">
          {/* Shipping Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Truck className="w-6 h-6 text-gray-700" />
              <h2 className="text-xl font-bold text-gray-900">Thông tin giao hàng</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ tên *
                </label>
                <input
                  type="text"
                  value={shippingInfo.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={shippingInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={shippingInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ *
                </label>
                <input
                  type="text"
                  value={shippingInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Số nhà, tên đường"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thành phố *
                </label>
                <select
                  value={shippingInfo.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quận/Huyện *
                </label>
                <select
                  value={shippingInfo.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="Quận 1">Quận 1</option>
                  <option value="Quận 2">Quận 2</option>
                  <option value="Quận 3">Quận 3</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú đơn hàng
                </label>
                <textarea
                  value={shippingInfo.note}
                  onChange={(e) => handleInputChange('note', e.target.value)}
                  placeholder="Ghi chú thêm cho đơn hàng (tùy chọn)"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-gray-700" />
              <h2 className="text-xl font-bold text-gray-900">Phương thức thanh toán</h2>
            </div>

            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPayment === method.id
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!method.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => method.enabled && setSelectedPayment(method.id)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={selectedPayment === method.id}
                      onChange={() => method.enabled && setSelectedPayment(method.id)}
                      disabled={!method.enabled}
                      className="w-4 h-4"
                    />
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-900">{method.name}</div>
                      <div className="text-sm text-gray-600">{method.description}</div>
                      {!method.enabled && (
                        <div className="text-xs text-red-500 mt-1">Tạm thời không khả dụng</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Đơn hàng của bạn</h2>

            {/* Items */}
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <div className="text-sm text-gray-600">Số lượng: {item.quantity}</div>
                    <div className="font-semibold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="space-y-3 mb-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính:</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển:</span>
                <span className="font-semibold">{shipping === 0 ? 'Miễn phí' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Thuế:</span>
                <span className="font-semibold">${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between font-bold text-xl text-gray-900">
                  <span>Tổng cộng:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing || !shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.email || !shippingInfo.address}
              className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Đang xử lý...' : 
               selectedPayment === 'vnpay' ? 'Thanh toán với VNPay' : 
               'Đặt hàng'}
            </button>

            <div className="mt-4 text-center text-sm text-gray-500">
              Bằng cách đặt hàng, bạn đồng ý với{' '}
              <a href="#" className="text-gray-900 hover:underline">Điều khoản dịch vụ</a>
              {' '}và{' '}
              <a href="#" className="text-gray-900 hover:underline">Chính sách bảo mật</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}