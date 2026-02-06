// src/app/services/vnpay.ts
export interface VNPayConfig {
  vnp_TmnCode: string;
  vnp_HashSecret: string;
  vnp_Url: string;
  vnp_ReturnUrl: string;
}

export interface PaymentRequest {
  amount: number;
  orderInfo: string;
  orderId: string;
  returnUrl?: string;
  ipAddr?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  message?: string;
}

// Mock VNPay configuration
const vnpayConfig: VNPayConfig = {
  vnp_TmnCode: 'HWSHOP01', // Mã website của merchant
  vnp_HashSecret: 'HWSHOPSECRETKEY123456789', // Chuỗi bí mật
  vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', // URL sandbox
  vnp_ReturnUrl: `${window.location.origin}/payment/return`
};

export class VNPayService {
  private static config = vnpayConfig;

  // Tạo URL thanh toán VNPay
  static createPaymentUrl(request: PaymentRequest): PaymentResponse {
    try {
      const vnp_Params: Record<string, string> = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: this.config.vnp_TmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: request.orderId,
        vnp_OrderInfo: request.orderInfo,
        vnp_OrderType: 'other',
        vnp_Amount: (request.amount * 100).toString(), // VNPay yêu cầu số tiền * 100
        vnp_ReturnUrl: request.returnUrl || this.config.vnp_ReturnUrl,
        vnp_IpAddr: request.ipAddr || '127.0.0.1',
        vnp_CreateDate: this.formatDate(new Date()),
        vnp_ExpireDate: this.formatDate(new Date(Date.now() + 15 * 60 * 1000)) // 15 phút
      };

      // Sắp xếp tham số theo thứ tự alphabet
      const sortedParams = Object.keys(vnp_Params)
        .sort()
        .reduce((result: Record<string, string>, key) => {
          result[key] = vnp_Params[key];
          return result;
        }, {});

      // Tạo query string
      const queryString = Object.entries(sortedParams)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

      // Tạo secure hash (trong thực tế cần dùng crypto để hash với secret key)
      const secureHash = this.createSecureHash(queryString);
      
      const paymentUrl = `${this.config.vnp_Url}?${queryString}&vnp_SecureHash=${secureHash}`;

      return {
        success: true,
        paymentUrl
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi tạo URL thanh toán'
      };
    }
  }

  // Xác thực phản hồi từ VNPay
  static verifyPaymentResponse(params: Record<string, string>): {
    success: boolean;
    transactionStatus: 'success' | 'failed' | 'pending';
    message: string;
    orderId?: string;
    amount?: number;
  } {
    const vnp_ResponseCode = params.vnp_ResponseCode;
    const vnp_TxnRef = params.vnp_TxnRef;
    const vnp_Amount = params.vnp_Amount;

    // Kiểm tra mã phản hồi
    if (vnp_ResponseCode === '00') {
      return {
        success: true,
        transactionStatus: 'success',
        message: 'Thanh toán thành công',
        orderId: vnp_TxnRef,
        amount: vnp_Amount ? parseInt(vnp_Amount) / 100 : 0
      };
    } else {
      const errorMessages: Record<string, string> = {
        '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
        '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
        '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
        '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
        '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
        '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
        '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
        '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
        '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
        '75': 'Ngân hàng thanh toán đang bảo trì.',
        '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.'
      };

      return {
        success: false,
        transactionStatus: 'failed',
        message: errorMessages[vnp_ResponseCode] || 'Giao dịch không thành công',
        orderId: vnp_TxnRef
      };
    }
  }

  // Format ngày theo yêu cầu của VNPay (yyyyMMddHHmmss)
  private static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  // Tạo secure hash (mock - trong thực tế cần dùng HMAC SHA512)
  private static createSecureHash(queryString: string): string {
    // Đây là mock hash, trong thực tế cần dùng crypto library
    return btoa(queryString + this.config.vnp_HashSecret).substring(0, 32);
  }

  // Mock: Tạo order ID duy nhất
  static generateOrderId(): string {
    return `HW${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
}

// Mock payment methods
export const paymentMethods = [
  {
    id: 'vnpay',
    name: 'VNPay',
    description: 'Thanh toán qua VNPay (ATM, Visa, MasterCard)',
    icon: '💳',
    enabled: true
  },
  {
    id: 'momo',
    name: 'MoMo',
    description: 'Ví điện tử MoMo',
    icon: '📱',
    enabled: false
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    description: 'Ví điện tử ZaloPay',
    icon: '💰',
    enabled: false
  },
  {
    id: 'cod',
    name: 'Thanh toán khi nhận hàng',
    description: 'Thanh toán bằng tiền mặt khi nhận hàng',
    icon: '💵',
    enabled: true
  }
];