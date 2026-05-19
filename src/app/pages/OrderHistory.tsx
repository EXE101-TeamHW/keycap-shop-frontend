// src/app/pages/OrderHistory.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Package, ShoppingBag, Clock, CheckCircle, XCircle, Truck,
  ChevronDown, ChevronUp, Loader2, AlertCircle, ArrowLeft,
} from "lucide-react";
import axiosClient from "../api/axiosClient";
import { mapProduct } from "../api/productApi";

type OrderStatus =
  | "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPING"
  | "DELIVERED" | "COMPLETED" | "CANCELLED" | "REFUNDED";

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Order {
  id: number;
  orderCode: string;
  type: "SHOP" | "CUSTOM";
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  PENDING:    { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-700",   icon: Clock },
  CONFIRMED:  { label: "Đã xác nhận",  color: "bg-blue-100 text-blue-700",     icon: CheckCircle },
  PROCESSING: { label: "Đang xử lý",   color: "bg-purple-100 text-purple-700", icon: Package },
  SHIPPING:   { label: "Đang giao",    color: "bg-indigo-100 text-indigo-700", icon: Truck },
  DELIVERED:  { label: "Đã giao",      color: "bg-green-100 text-green-700",   icon: CheckCircle },
  COMPLETED:  { label: "Hoàn thành",   color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  CANCELLED:  { label: "Đã hủy",       color: "bg-red-100 text-red-700",       icon: XCircle },
  REFUNDED:   { label: "Đã hoàn tiền", color: "bg-gray-100 text-gray-600",     icon: XCircle },
};

const PAYMENT_LABEL: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
  VNPAY: "VNPay",
  MOMO: "MoMo",
};

function normalizeItem(raw: any): OrderItem {
  const product = raw.product ? mapProduct(raw.product) : null;
  return {
    id: raw.id,
    productId: raw.productId ?? product?.id,
    productName: raw.productName ?? product?.name ?? "Sản phẩm",
    productImage: raw.productImage ?? product?.image ?? "",
    quantity: raw.quantity,
    unitPrice: raw.unitPrice ?? raw.price ?? 0,
    subtotal: raw.subtotal ?? (raw.unitPrice ?? 0) * raw.quantity,
  };
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();

  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  const canCancel = ["PENDING", "CONFIRMED"].includes(order.status);

  const handleCancel = async () => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    setCancelling(true);
    try {
      await axiosClient.put(`/orders/${order.id}/cancel`);
      window.location.reload();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Không thể hủy đơn. Vui lòng thử lại.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="font-bold text-gray-900">{order.orderCode}</div>
            <div className="text-xs text-gray-400">
              {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                day: "2-digit", month: "2-digit", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Status badge */}
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${cfg.color}`}>
            <Icon className="w-3.5 h-3.5" />
            {cfg.label}
          </span>

          {/* Type badge */}
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            order.type === "CUSTOM" ? "bg-pink-50 text-pink-700" : "bg-blue-50 text-blue-700"
          }`}>
            {order.type === "CUSTOM" ? "Custom" : "Shop"}
          </span>

          {/* Total */}
          <div className="text-right">
            <div className="font-bold text-gray-900">
              {order.totalAmount.toLocaleString("vi-VN")}₫
            </div>
            <div className="text-xs text-gray-400">{PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}</div>
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Items list (expandable) */}
      {expanded && (
        <div className="border-t border-gray-100">
          <div className="p-5 space-y-4">
            {(order.items || []).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 cursor-pointer group"
                onClick={() => item.productId && navigate(`/product/${item.productId}`)}
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                  {item.productImage ? (
                    <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                    {item.productName}
                  </div>
                  <div className="text-sm text-gray-500">x{item.quantity}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    {item.subtotal.toLocaleString("vi-VN")}₫
                  </div>
                  <div className="text-xs text-gray-400">
                    {item.unitPrice.toLocaleString("vi-VN")}₫/sp
                  </div>
                </div>
              </div>
            ))}

            {/* Shipping address */}
            {order.shippingAddress && (
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                <span className="font-semibold text-gray-800">Địa chỉ giao: </span>
                {order.shippingAddress}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              {canCancel && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors text-sm font-semibold disabled:opacity-50"
                >
                  {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Hủy đơn
                </button>
              )}
              {order.status === "DELIVERED" && (
                <button
                  onClick={() => navigate(`/product/${order.items?.[0]?.productId}?review=1`)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-semibold"
                >
                  ⭐ Đánh giá sản phẩm
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) { navigate("/login"); return; }
    axiosClient.get(`/orders?userId=${userId}`)
      .then((res: any) => {
        const raw = res?.data || res || [];
        setOrders(Array.isArray(raw) ? raw.map((o: any) => ({
          ...o,
          items: Array.isArray(o.items) ? o.items.map(normalizeItem) : [],
        })) : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [navigate]);

  const tabs = [
    { key: "ALL",       label: "Tất cả" },
    { key: "PENDING",   label: "Chờ xác nhận" },
    { key: "SHIPPING",  label: "Đang giao" },
    { key: "DELIVERED", label: "Đã giao" },
    { key: "COMPLETED", label: "Hoàn thành" },
    { key: "CANCELLED", label: "Đã hủy" },
  ];

  const filtered = filter === "ALL" ? orders : orders.filter(o => o.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-4 text-gray-500 hover:text-gray-800 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Tiếp tục mua sắm
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Đơn hàng của tôi</h1>
        <p className="text-gray-500 mt-1">{orders.length} đơn hàng</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              filter === tab.key
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-200"
                : "bg-white border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600"
            }`}
          >
            {tab.label}
            {tab.key !== "ALL" && (
              <span className="ml-1.5 text-xs opacity-70">
                ({orders.filter(o => o.status === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Order list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-200" />
          <p className="text-gray-500 font-medium text-lg">Không có đơn hàng nào</p>
          <p className="text-gray-400 text-sm mb-6">Bạn chưa có đơn hàng trong mục này</p>
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
          >
            Mua sắm ngay
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
