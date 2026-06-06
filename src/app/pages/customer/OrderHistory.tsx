// src/app/pages/OrderHistory.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Package, ShoppingBag, Clock, CheckCircle, XCircle, Truck,
  ChevronDown, ChevronUp, Loader2, AlertCircle, ArrowLeft,
  Icon, MessageCircle, AlertTriangle
} from "lucide-react";
import { motion } from "motion/react";
import axiosClient from "../../api/axiosClient";
import type { ReviewResponse } from "../../api/reviewApi";
import { chatApi, type ConversationResponse } from "../../api/chatApi";
import { mapProduct } from "../../api/productApi";
import { TicketChat } from "../../components/TicketChat";
import { Client } from "@stomp/stompjs";
import { toast } from "sonner";

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
  userId?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  staffId?: number | null;
  staffName?: string | null;
  proofImagesJson?: string;
  ticketStatus?: string;
  deliveryDeadline?: string;
  conversationId?: number | null;
  ticketId?: number | null;
}

const sortOrdersNewestFirst = <T extends { createdAt?: string; id?: number }>(orders: T[]) =>
  [...orders].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeB !== timeA) return timeB - timeA;
    return (b.id || 0) - (a.id || 0);
  });

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  PENDING: { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-700", icon: Clock },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  PROCESSING: { label: "Đang xử lý", color: "bg-purple-100 text-purple-700", icon: Package },
  SHIPPING: { label: "Đang giao", color: "bg-indigo-100 text-indigo-700", icon: Truck },
  DELIVERED: { label: "Đã giao", color: "bg-green-100 text-green-700", icon: CheckCircle },
  COMPLETED: { label: "Hoàn thành", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-700", icon: XCircle },
  REFUNDED: { label: "Đã hoàn tiền", color: "bg-gray-100 text-gray-600", icon: XCircle },
};

const PAYMENT_LABEL: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
  VNPAY: "VNPay",
  MOMO: "MoMo",
  PAYOS: "PayOS",
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  REFUNDED: "Đã hoàn tiền",
  CANCELLED: "Tiền cọc đã hủy",
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

function OrderCard({ 
  order, 
  reviewedKeys, 
  reviewMap,
  onReviewUpsert,
  onReviewDelete,
  unreadCount,
  onChatOpened,
}: { 
  order: Order; 
  reviewedKeys: Set<string>; 
  reviewMap: Record<string, ReviewResponse>;
  onReviewUpsert: (review: ReviewResponse) => void;
  onReviewDelete: (orderId: number, productId: number) => void;
  unreadCount: number;
  onChatOpened: (conversationId?: number | null) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const navigate = useNavigate();

  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = cfg.icon;
  const canCancel = order.type === "CUSTOM"
    ? ["PENDING", "IN_REVIEW"].includes(order.ticketStatus || "") && order.status === "PENDING"
    : order.status === "PENDING";

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingItem, setReviewingItem] = useState<OrderItem | null>(null);
  const [reviewingReview, setReviewingReview] = useState<ReviewResponse | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState(false);

  const [showChat, setShowChat] = useState(false);

  let proofImages: string[] = [];
  try {
    if (order.proofImagesJson) {
      proofImages = JSON.parse(order.proofImagesJson);
    }
  } catch (e) {}

  const handleOpenReview = (item: OrderItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const reviewKey = `${order.id}-${item.productId}`;
    const existingReview = reviewMap[reviewKey];
    setReviewingItem(item);
    setReviewingReview(existingReview ?? null);
    setRating(existingReview?.rating ?? 5);
    setComment(existingReview?.comment ?? "");
    setShowReviewModal(true);
  };

  const handleCancel = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancelOrder = async () => {
    setCancelling(true);
    try {
      await axiosClient.put(`/orders/${order.id}/cancel`);
      toast.success("Đã hủy đơn hàng thành công!");
      setShowCancelConfirm(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể hủy đơn hàng.");
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewingItem) return;
    setSubmittingReview(true);
    try {
      const { reviewApi } = await import("../../api/reviewApi");
      const payload = { rating, comment };
      if (reviewingReview) {
        const res = await reviewApi.update(reviewingItem.productId, reviewingReview.id, payload);
        const saved = res?.data || res;
        if (saved) {
          onReviewUpsert(saved);
        }
        toast.success("Đã cập nhật đánh giá!");
      } else {
        const res = await reviewApi.create(reviewingItem.productId, order.id, payload);
        const saved = res?.data || res;
        if (saved) {
          onReviewUpsert(saved);
        }
        toast.success("Cảm ơn bạn đã đánh giá sản phẩm!");
      }
      setShowReviewModal(false);
      setReviewingReview(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể gửi đánh giá lúc này.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!reviewingItem || !reviewingReview) return;
    const confirmed = window.confirm("Bạn chắc chắn muốn xóa đánh giá này?");
    if (!confirmed) return;
    setDeletingReview(true);
    try {
      const { reviewApi } = await import("../../api/reviewApi");
      await reviewApi.remove(reviewingItem.productId, reviewingReview.id);
      onReviewDelete(order.id, reviewingItem.productId);
      toast.success("Đã xóa đánh giá.");
      setShowReviewModal(false);
      setReviewingReview(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể xóa đánh giá lúc này.");
    } finally {
      setDeletingReview(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {showCancelConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 p-4 backdrop-blur-sm"
          onClick={() => !cancelling && setShowCancelConfirm(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-red-50 via-white to-purple-50 px-6 pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-inner">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-red-600">Xác nhận hủy đơn</p>
                  <h3 className="mt-1 text-xl font-bold text-gray-950">
                    Hủy đơn {order.orderCode}?
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Sau khi hủy, đơn sẽ không tiếp tục xử lý. Nếu bạn đã thanh toán, yêu cầu hoàn tiền sẽ được gửi cho quản trị viên.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => setShowCancelConfirm(false)}
                  className="rounded-full p-2 text-gray-400 transition hover:bg-white hover:text-gray-700 disabled:opacity-50"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase text-gray-400">Mã đơn</div>
                    <div className="mt-1 font-mono text-sm font-bold text-purple-700">{order.orderCode}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold uppercase text-gray-400">Tổng tiền</div>
                    <div className="mt-1 text-lg font-black text-gray-950">{order.totalAmount.toLocaleString("vi-VN")}đ</div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-700">{order.type === "CUSTOM" ? "Custom" : "Shop"}</span>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">{PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}</span>
                  <span className={`rounded-full px-3 py-1 ${
                    order.paymentStatus === "CANCELLED"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {PAYMENT_STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-white px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setShowCancelConfirm(false)}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Giữ đơn hàng
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={confirmCancelOrder}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                {cancelling ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="grid items-center gap-4 p-5 md:grid-cols-[minmax(260px,1.8fr)_minmax(150px,1fr)_minmax(95px,0.7fr)_minmax(110px,0.75fr)_minmax(150px,1fr)_40px]">
        <div className="flex min-w-0 items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-gray-900" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-bold text-gray-900">{order.orderCode}</div>
            <div className="text-xs text-gray-400">
              {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                day: "2-digit", month: "2-digit", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </div>
          </div>
        </div>

        <div className="contents">
          <span className={`inline-flex w-max items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
            order.status === "CANCELLED" && order.paymentStatus === "PAID"
              ? "bg-amber-100 text-amber-700"
              : order.status === "CANCELLED" && order.paymentStatus === "REFUNDED"
              ? "bg-green-100 text-green-700"
              : order.status === "CANCELLED" && order.paymentStatus === "CANCELLED"
              ? "bg-red-100 text-red-700"
              : cfg.color
          }`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {order.status === "CANCELLED" && order.paymentStatus === "PAID"
              ? "Đã hủy (Chờ hoàn tiền)"
              : order.status === "CANCELLED" && order.paymentStatus === "REFUNDED"
              ? "Đã hủy (Đã hoàn tiền)"
              : order.status === "CANCELLED" && order.paymentStatus === "CANCELLED"
              ? "Tiền cọc đã hủy"
              : cfg.label}
          </span>
          <span className={`inline-flex w-max items-center px-2.5 py-1 rounded-full text-xs font-semibold ${order.type === "CUSTOM" ? "bg-pink-50 text-pink-700" : "bg-blue-50 text-blue-700"
            }`}>
            {order.type === "CUSTOM" ? "Custom" : "Shop"}
          </span>
          <div className="text-left md:justify-self-end md:text-right">
            <div className="font-bold text-gray-900">
              {order.totalAmount.toLocaleString("vi-VN")}₫
            </div>
            <div className="text-xs text-gray-400">{PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}</div>
          </div>
          {order.staffId ? (
            <button
              onClick={() => {
                const nextShowChat = !showChat;
                setShowChat(nextShowChat);
                if (nextShowChat) {
                  onChatOpened(order.conversationId);
                }
              }}
              className="relative flex w-max min-w-[74px] items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-900 shadow-sm transition-colors hover:border-gray-900 hover:bg-gray-950 hover:text-white md:justify-self-end"
            >
              <MessageCircle className="w-3.5 h-3.5" /> Chat
              {!showChat && unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-gray-950 text-white text-[10px] font-bold leading-5 text-center shadow-sm ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          ) : (
            <span className="inline-flex max-w-[150px] items-center justify-center text-center text-[10px] text-gray-400 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200 select-none font-medium md:justify-self-end">
              Chờ duyệt & gán staff để chat
            </span>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors md:justify-self-end"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {showChat && order.staffId && (
        <div className="border-t border-gray-100 p-5 bg-gray-50/50">
          <TicketChat
            ticketId={order.ticketId}
            orderId={order.id}
            conversationId={order.conversationId}
            customerId={order.userId || Number(localStorage.getItem("userId"))}
            staffId={order.staffId}
            compact
          />
        </div>
      )}

      {/* Items list */}
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
                <div className="text-right flex flex-col items-end gap-2">
                  <div>
                    <div className="font-bold text-gray-900">{item.subtotal.toLocaleString("vi-VN")}₫</div>
                    <div className="text-xs text-gray-400">{item.unitPrice.toLocaleString("vi-VN")}₫/sp</div>
                  </div>
                  {["DELIVERED", "COMPLETED"].includes(order.status) && (
                    (() => {
                      const reviewKey = `${order.id}-${item.productId}`;
                      const existingReview = reviewMap[reviewKey];
                      const hasReview = reviewedKeys.has(reviewKey) || Boolean(existingReview);
                      if (hasReview) {
                        return (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[11px] font-semibold rounded-full border border-emerald-200">
                              Đã đánh giá
                            </span>
                            <button
                              onClick={(e) => handleOpenReview(item, e)}
                              className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg hover:bg-purple-100 transition-colors"
                            >
                              Sửa đánh giá
                            </button>
                          </div>
                        );
                      }
                      return (
                        <button
                          onClick={(e) => handleOpenReview(item, e)}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-lg hover:bg-yellow-200 transition-colors"
                        >
                          Đánh giá
                        </button>
                      );
                    })()
                  )}
                </div>
              </div>
            ))}

            {/* Shipping address & Deadline */}
            {order.shippingAddress && (
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 space-y-1">
                <div>
                  <span className="font-semibold text-gray-800">Địa chỉ giao: </span>
                  {order.shippingAddress}
                </div>
                {order.deliveryDeadline && (
                  <div>
                    <span className="font-semibold text-gray-800">Hạn giao hàng dự kiến: </span>
                    <span className="text-purple-600 font-semibold">
                      {new Date(order.deliveryDeadline).toLocaleDateString("vi-VN", {
                        day: "2-digit", month: "2-digit", year: "numeric"
                      })}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Proof images */}
            {proofImages.length > 0 && (
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <h4 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Hình ảnh bằng chứng giao hàng
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {proofImages.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noreferrer" className="block aspect-square rounded-lg overflow-hidden border border-purple-200 hover:border-purple-400 transition-colors">
                      <img src={img} alt="Proof" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {/* Refund notice for cancelled paid orders */}
            {order.status === "CANCELLED" && (order.paymentStatus === "PAID" || order.paymentStatus === "REFUNDED") && (
              <div className={`p-4 rounded-xl border text-sm flex flex-col gap-1.5 ${
                order.paymentStatus === "PAID"
                  ? "bg-amber-50 border-amber-200 text-amber-800"
                  : "bg-green-50 border-green-200 text-green-800"
              }`}>
                <div className="font-semibold flex items-center gap-1.5">
                  {order.paymentStatus === "PAID" ? (
                    <>
                      <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                      Yêu cầu hoàn tiền đang được xử lý
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Đã hoàn tiền thành công
                    </>
                  )}
                </div>
                <p className="text-xs opacity-90">
                  {order.paymentStatus === "PAID"
                    ? "Hệ thống đã ghi nhận yêu cầu hoàn tiền cho đơn hàng này. Quản trị viên sẽ tiến hành xác minh và hoàn trả số tiền đã thanh toán vào tài khoản ngân hàng của bạn."
                    : "Quản trị viên đã hoàn tất thủ tục hoàn tiền cho đơn hàng này. Vui lòng kiểm tra tài khoản ngân hàng của bạn."}
                </p>
              </div>
            )}

            {/* Actions */}
            {canCancel && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors text-sm font-semibold disabled:opacity-50"
                >
                  {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Hủy đơn
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && reviewingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-black/60 via-black/45 to-black/60 backdrop-blur-[2px]"
          onClick={() => setShowReviewModal(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_-25px_rgba(0,0,0,0.45)] ring-1 ring-black/5"
            onClick={e => e.stopPropagation()}
          >
            <div className="border-b border-gray-100 bg-gradient-to-r from-purple-50 via-white to-amber-50 px-6 pt-6 pb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-500">Đánh giá</p>
              <h3 className="mt-1 text-2xl font-bold text-gray-900">
                {reviewingReview ? "Cập nhật đánh giá" : "Đánh giá sản phẩm"}
              </h3>
              <p className="mt-2 text-sm text-gray-600">Chia sẻ cảm nhận để giúp mọi người chọn sản phẩm tốt hơn.</p>
            </div>

            <div className="p-6 pt-5">
              <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                <img src={reviewingItem.productImage} className="h-12 w-12 rounded-xl object-cover" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Sản phẩm</p>
                  <div className="font-semibold text-gray-900 line-clamp-1">{reviewingItem.productName}</div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Chất lượng (Số sao)</label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`h-11 w-11 rounded-full border text-2xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                        star <= rating
                          ? "border-amber-200 bg-amber-50 shadow-sm"
                          : "border-gray-200 bg-white text-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      {star <= rating ? "⭐" : "☆"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Nhận xét của bạn</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="w-full min-h-[110px] resize-none rounded-2xl border border-gray-200 bg-gray-50/70 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-transparent focus:ring-2 focus:ring-purple-500"
                  placeholder="Sản phẩm dùng có tốt không? Màu sắc ra sao?..."
                />
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
                {reviewingReview ? (
                  <button
                    onClick={handleDeleteReview}
                    disabled={submittingReview || deletingReview}
                    className="flex-1 rounded-2xl border border-red-200 bg-red-50 py-3 font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {deletingReview ? "Đang xóa..." : "Xóa đánh giá"}
                  </button>
                ) : null}
                <button
                  onClick={() => setShowReviewModal(false)}
                  disabled={submittingReview || deletingReview}
                  className="flex-1 rounded-2xl border border-gray-200 bg-white py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview || deletingReview}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 font-semibold text-white shadow-lg shadow-purple-200/60 transition hover:from-purple-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {reviewingReview ? "Cập nhật" : "Gửi đánh giá"}
                </button>
              </div>
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
  const [reviewedKeys, setReviewedKeys] = useState<Set<string>>(new Set());
  const [reviewMap, setReviewMap] = useState<Record<string, ReviewResponse>>({});
  const [unreadByConversationId, setUnreadByConversationId] = useState<Record<number, number>>({});

  const handleReviewUpsert = (review: ReviewResponse) => {
    if (!review?.orderId || !review?.productId) return;
    const key = `${review.orderId}-${review.productId}`;
    setReviewedKeys(prev => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    setReviewMap(prev => ({ ...prev, [key]: review }));
  };

  const handleReviewDelete = (orderId: number, productId: number) => {
    const key = `${orderId}-${productId}`;
    setReviewedKeys(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setReviewMap(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const fetchOrders = () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    axiosClient.get(`/orders`)
      .then((res: any) => {
        const raw = res?.data || res || [];
        const normalizedOrders = Array.isArray(raw) ? raw.map((o: any) => ({
          ...o,
          items: Array.isArray(o.items) ? o.items.map(normalizeItem) : [],
        })) : [];
        setOrders(sortOrdersNewestFirst(normalizedOrders));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const fetchUnreadCounts = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    chatApi.listConversations()
      .then((res: any) => {
        const conversations: ConversationResponse[] = res?.data || res || [];
        const unreadMap: Record<number, number> = {};
        conversations.forEach((conversation) => {
          if (conversation.status !== "OPEN") return;
          unreadMap[conversation.id] = conversation.unreadCount || 0;
        });
        setUnreadByConversationId(unreadMap);
      })
      .catch(() => {});
  };

  const clearUnreadForConversation = (conversationId?: number | null) => {
    if (conversationId) {
      setUnreadByConversationId((prev) => ({ ...prev, [conversationId]: 0 }));
    }
    window.setTimeout(fetchUnreadCounts, 700);
  };

  useEffect(() => {
    fetchOrders();
    fetchUnreadCounts();
    const unreadTimer = window.setInterval(fetchUnreadCounts, 15000);

    const token = localStorage.getItem("token");
    if (token) {
      import("../../api/reviewApi").then(m => m.reviewApi.listAll())
        .then((res: any) => {
          const raw = res?.data || res || [];
          const keys = new Set<string>();
          const map: Record<string, ReviewResponse> = {};
          const currentUserId = Number(localStorage.getItem("userId"));
          raw.forEach((r: any) => {
            if (r.userId === currentUserId && r.orderId && r.productId) {
              const key = `${r.orderId}-${r.productId}`;
              keys.add(key);
              map[key] = r;
            }
          });
          setReviewedKeys(keys);
          setReviewMap(map);
        })
        .catch(console.error);

      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${wsProtocol}//${window.location.host}/ws`;
      const client = new Client({
        brokerURL: wsUrl,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        debug: () => {},
      });

      client.onConnect = () => {
        client.subscribe("/topic/orders", (frame) => {
          try {
            const updatedOrder = JSON.parse(frame.body);
            const currentUserId = Number(localStorage.getItem("userId"));
            if (updatedOrder && updatedOrder.userId === currentUserId) {
              fetchOrders();
              fetchUnreadCounts();
            }
          } catch {
            fetchOrders();
            fetchUnreadCounts();
          }
        });
      };

      client.activate();
      return () => {
        window.clearInterval(unreadTimer);
        client.deactivate();
      };
    }

    return () => {
      window.clearInterval(unreadTimer);
    };
  }, [navigate]);

  const tabs = [
    { key: "ALL", label: "Tất cả" },
    { key: "CUSTOM", label: "Đơn custom" },
    { key: "PENDING", label: "Chờ xác nhận" },
    { key: "SHIPPING", label: "Đang giao" },
    { key: "DELIVERED", label: "Đã giao" },
    { key: "COMPLETED", label: "Hoàn thành" },
    { key: "CANCELLED", label: "Đã hủy" },
  ];

  const tabCount = (key: string) => {
    if (key === "CUSTOM") return orders.filter(o => o.type === "CUSTOM").length;
    return orders.filter(o => o.status === key).length;
  };

  const filtered = filter === "ALL"
    ? orders
    : filter === "CUSTOM"
      ? orders.filter(o => o.type === "CUSTOM")
      : orders.filter(o => o.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto px-6 py-8"
    >
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
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${filter === tab.key
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-200"
                : "bg-white border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600"
              }`}
          >
            {tab.label}
            {tab.key !== "ALL" && (
              <span className="ml-1.5 text-xs opacity-70">
                ({tabCount(tab.key)})
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
          <div className="hidden rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 text-[11px] font-black uppercase tracking-wide text-gray-500 shadow-sm md:grid md:grid-cols-[minmax(260px,1.8fr)_minmax(150px,1fr)_minmax(95px,0.7fr)_minmax(110px,0.75fr)_minmax(150px,1fr)_40px] md:items-center md:gap-4">
            <div>Mã đơn hàng</div>
            <div>Trạng thái đơn</div>
            <div>Vai trò</div>
            <div className="text-right">Tổng Tiền</div>
            <div className="text-right">Chat</div>
            <div className="text-right">Mở</div>
          </div>
          {filtered.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              reviewedKeys={reviewedKeys}
              reviewMap={reviewMap}
              onReviewUpsert={handleReviewUpsert}
              onReviewDelete={handleReviewDelete}
              unreadCount={order.conversationId ? unreadByConversationId[order.conversationId] || 0 : 0}
              onChatOpened={clearUnreadForConversation}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
