import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { CheckCircle, XCircle, Loader2, ArrowLeft, Home } from "lucide-react";
import axiosClient from "../api/axiosClient";

export function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Collect all query parameters from VNPAY
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    if (Object.keys(params).length === 0) {
      setStatus("error");
      setMessage("Không tìm thấy thông tin thanh toán");
      return;
    }

    // Call backend to verify IPN/return
    axiosClient.get("/payment/vnpay_return", { params })
      .then((res) => {
        setStatus("success");
        setMessage(res.data?.message || "Thanh toán thành công!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err?.response?.data?.message || "Giao dịch thất bại hoặc chữ ký không hợp lệ");
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-gray-100">
        {status === "loading" && (
          <div className="py-12">
            <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Đang xử lý...</h2>
            <p className="text-gray-500">Vui lòng chờ trong khi chúng tôi xác nhận giao dịch của bạn.</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-8 animate-fade-in-up">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{message}</h2>
            <p className="text-gray-500 mb-8">
              Cảm ơn bạn đã mua sắm tại HWShop. Đơn hàng của bạn đã được thanh toán và đang được chuẩn bị giao.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/orders")}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-purple-200 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Xem đơn hàng của tôi
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Về trang chủ
              </button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="py-8 animate-fade-in-up">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Giao dịch không thành công</h2>
            <p className="text-gray-500 mb-8">{message}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/cart")}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại giỏ hàng
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Về trang chủ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
