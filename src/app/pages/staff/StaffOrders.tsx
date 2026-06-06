import { useState, useEffect } from "react";
import { ShoppingCart, MessageCircle, X, Phone, Mail, CreditCard, Banknote, MapPin, UploadCloud, CheckCircle, Image as ImageIcon, Clock } from "lucide-react";
import { uploadApi } from "../../api/uploadApi";
import { orderApi } from "../../api/orderApi";
import { TicketChat } from "../../components/TicketChat";
import { toast } from "sonner";
import { Client } from "@stomp/stompjs";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  PENDING:    { label: "Chờ duyệt",   cls: "bg-amber-50 text-amber-700 border-amber-200" },
  CONFIRMED:  { label: "Đã duyệt",    cls: "bg-blue-50 text-blue-700 border-blue-200" },
  PROCESSING: { label: "Đang xử lý", cls: "bg-purple-50 text-purple-700 border-purple-200" },
  SHIPPING:   { label: "Đang giao",   cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  DELIVERED:  { label: "Đã giao",     cls: "bg-green-50 text-green-700 border-green-200" },
  COMPLETED:  { label: "Hoàn tất",    cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELLED:  { label: "Đã hủy",      cls: "bg-red-50 text-red-700 border-red-200" },
  REFUNDED:   { label: "Đã hoàn tiền", cls: "bg-gray-50 text-gray-600 border-gray-200" },
};

const NEXT_STATUS: Record<string, string> = {
  CONFIRMED:  "PROCESSING",
  PROCESSING: "SHIPPING",
  SHIPPING:   "DELIVERED",
  DELIVERED:  "COMPLETED",
};

const NEXT_LABEL: Record<string, string> = {
  PROCESSING: "Bắt đầu xử lý",
  SHIPPING:   "Bàn giao giao hàng",
  DELIVERED:  "Xác nhận đã giao",
  COMPLETED:  "Hoàn tất đơn hàng",
};

const sortOrdersNewestFirst = (orders: any[]) =>
  [...orders].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeB !== timeA) return timeB - timeA;
    return (b.id || 0) - (a.id || 0);
  });

const paymentStatusLabel = (status: string) => ({
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  REFUNDED: "Đã hoàn tiền",
  CANCELLED: "Tiền cọc đã hủy",
}[status] || status);

const paymentStatusClass = (status: string) =>
  status === "PAID" ? "bg-emerald-100 text-emerald-700" :
  status === "REFUNDED" ? "bg-blue-100 text-blue-700" :
  status === "CANCELLED" ? "bg-red-100 text-red-700" :
  "bg-gray-100 text-gray-600";

export function StaffOrders() {
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [chatOrder, setChatOrder] = useState<any | null>(null);
  const [refundOrder, setRefundOrder] = useState<any | null>(null);
  const [proofsOrder, setProofsOrder] = useState<{ orderCode: string; images: string[] } | null>(null);
  const [statusModal, setStatusModal] = useState<{ order: any; nextStatus: string } | null>(null);
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchOrders = () => {
    orderApi.getStaffOrders().then((res: any) => {
      const raw = res?.data || res || [];
      setAllOrders(Array.isArray(raw) ? sortOrdersNewestFirst(raw) : []);
    }).catch(err => {
      console.error(err);
      toast.error("Lỗi khi tải danh sách đơn hàng.");
    });
  };

  useEffect(() => {
    fetchOrders();

    const token = localStorage.getItem("token");
    if (token) {
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
        client.subscribe("/topic/orders", () => {
          fetchOrders();
        });
      };

      client.activate();
      return () => {
        client.deactivate();
      };
    }
  }, []);

  const handleUpdateStatus = async () => {
    if (!statusModal) return;
    setUploading(true);
    try {
      const imageUrls: string[] = [];
      for (const file of proofFiles) {
        const res: any = await uploadApi.uploadFile(file);
        if (res?.data?.url) imageUrls.push(res.data.url);
        else if (res?.url) imageUrls.push(res.url);
      }
      await orderApi.updateStatus(statusModal.order.id, statusModal.nextStatus, imageUrls);
      toast.success("Cập nhật trạng thái thành công!");
      fetchOrders();
      setStatusModal(null);
      setProofFiles([]);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra khi cập nhật!");
    } finally {
      setUploading(false);
    }
  };

  const statusTabs = ["ALL", "CONFIRMED", "PROCESSING", "SHIPPING", "DELIVERED", "COMPLETED", "CANCELLED"];
  const filtered = filterStatus === "ALL" ? allOrders : allOrders.filter(o => o.status === filterStatus);
  const activeCount = allOrders.filter(o => ["CONFIRMED", "PROCESSING", "SHIPPING"].includes(o.status)).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-purple-600" />
            Đơn hàng của tôi
            <span className="text-sm font-normal text-gray-500">({allOrders.length} đơn)</span>
            {activeCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                {activeCount} đang xử lý
              </span>
            )}
          </h3>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {statusTabs.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === s
                  ? "bg-purple-600 text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === "ALL" ? "Tất cả" : (STATUS_LABEL[s]?.label || s)}
              {s !== "ALL" && (
                <span className="ml-1 opacity-70">({allOrders.filter(o => o.status === s).length})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {["Mã đơn / Loại", "Khách hàng", "Thanh toán", "Trạng thái / Hành động", "Ngày tạo", "Tiện ích"].map(h => (
                <th key={h} className="text-left py-3 px-4 font-semibold text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o: any) => {
              const st = STATUS_LABEL[o.status] || { label: o.status, cls: "bg-gray-50 text-gray-600 border-gray-200" };
              const nextStatus = NEXT_STATUS[o.status];
              return (
                <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-mono font-semibold text-purple-700">{o.orderCode}</div>
                    <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      o.type === "CUSTOM" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {o.type === "CUSTOM" ? "🎨 Custom" : "🛒 Shop"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-xs">
                    <div className="font-semibold text-gray-900">{o.customerName || "Customer"}</div>
                    <div className="flex items-center gap-1 mt-1"><Phone className="w-3 h-3" /> {o.customerPhone || "N/A"}</div>
                    <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {o.customerEmail || "N/A"}</div>
                    {o.customerBankAccount && (
                      <div className="flex items-center gap-1 mt-1 text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 max-w-max">
                        <CreditCard className="w-3 h-3" /> STK: {o.customerBankAccount}
                      </div>
                    )}
                    {o.shippingAddress && (
                      <div className="flex items-start gap-1 mt-1 text-gray-500">
                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2 max-w-[180px]" title={o.shippingAddress}>{o.shippingAddress}</span>
                      </div>
                    )}
                    {o.deliveryDeadline && (
                      <div className="flex items-center gap-1 mt-1 text-purple-700 font-semibold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 max-w-max text-[10px]">
                        <Clock className="w-3 h-3 flex-shrink-0" /> Hạn giao: {new Date(o.deliveryDeadline).toLocaleDateString("vi-VN")}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-gray-900">{(o.totalAmount || 0).toLocaleString("vi-VN")}₫</div>
                    <div className={`mt-1 inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${paymentStatusClass(o.paymentStatus)}`}>
                      {o.paymentMethod} • {paymentStatusLabel(o.paymentStatus)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-2 items-start">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${st.cls}`}>
                        {st.label}
                      </span>
                      {nextStatus && (
                        <button
                          onClick={() => setStatusModal({ order: o, nextStatus })}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {NEXT_LABEL[nextStatus]}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString("vi-VN") : "-"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      {/* Chat — always visible for assigned orders with a conversation */}
                      <button
                        onClick={() => setChatOrder(o)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          o.conversationId
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "bg-blue-50 text-blue-400 hover:bg-blue-100"
                        }`}
                        title="Chat với khách hàng"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>

                      {/* Proof images */}
                      {o.proofImagesJson && o.proofImagesJson !== "[]" && (
                        <button
                          onClick={() => {
                            try { setProofsOrder({ orderCode: o.orderCode, images: JSON.parse(o.proofImagesJson) }); } catch (e) {}
                          }}
                          className="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors"
                          title="Xem bằng chứng"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                      )}

                      {/* Refund */}
                      {o.status === "CANCELLED" && o.paymentStatus === "PAID" && (
                        <button
                          onClick={() => setRefundOrder(o)}
                          className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 flex items-center justify-center transition-colors"
                          title="Xử lý hoàn tiền"
                        >
                          <Banknote className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">Chưa có đơn hàng nào được phân công</div>
        )}
      </div>

      {/* ===== MODAL: Status Update with Proof Upload ===== */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !uploading && setStatusModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Cập nhật: <span className="text-purple-600">{STATUS_LABEL[statusModal.nextStatus]?.label || statusModal.nextStatus}</span>
              </h3>
              <button disabled={uploading} onClick={() => setStatusModal(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
              <span className="text-gray-500">Đơn: </span>
              <span className="font-semibold text-purple-700">{statusModal.order.orderCode}</span>
              <span className="text-gray-400 ml-2">→ {STATUS_LABEL[statusModal.nextStatus]?.label}</span>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">
                Tải lên hình ảnh bằng chứng (mã vận đơn, ảnh giao hàng...) nếu có.
              </p>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500"><span className="font-semibold">Nhấn để chọn ảnh</span></p>
                  <p className="text-xs text-gray-400">PNG, JPG, JPEG</p>
                </div>
                <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => {
                  if (e.target.files) setProofFiles(Array.from(e.target.files));
                }} />
              </label>
              {proofFiles.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {proofFiles.map((f, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                      <img src={URL.createObjectURL(f)} alt="proof" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 self-center">{proofFiles.length} ảnh đã chọn</p>
                </div>
              )}
              {proofFiles.length === 0 && (
                <p className="text-xs text-red-500 mt-2 text-center font-semibold bg-red-50 border border-red-100 rounded-lg p-2">
                  ⚠️ Vui lòng chụp hình/tải lên ít nhất 1 ảnh bằng chứng trước khi xác nhận.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button disabled={uploading} onClick={() => setStatusModal(null)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50">
                Hủy
              </button>
              <button
                disabled={uploading || proofFiles.length === 0}
                onClick={handleUpdateStatus}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <CheckCircle className="w-4 h-4" />}
                {uploading ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: Chat ===== */}
      {chatOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setChatOrder(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                Chat: {chatOrder.orderCode}
                <span className="text-xs text-gray-400 font-normal">({chatOrder.customerName})</span>
              </h3>
              <button onClick={() => setChatOrder(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-[400px]">
              <TicketChat
                ticketId={chatOrder.ticketId}
                orderId={chatOrder.id}
                conversationId={chatOrder.conversationId}
                customerId={chatOrder.userId}
                staffId={chatOrder.staffId}
              />
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: Refund ===== */}
      {refundOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setRefundOrder(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Banknote className="w-6 h-6 text-orange-500" /> Hoàn tiền đơn hàng
              </h3>
              <button onClick={() => setRefundOrder(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 mb-3">Vui lòng chuyển khoản <strong>{(refundOrder.totalAmount || 0).toLocaleString("vi-VN")}₫</strong> vào tài khoản của khách hàng.</p>
              <div className="bg-white rounded-lg border border-orange-200 p-3">
                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Thông tin ngân hàng KH:</div>
                <div className="font-mono font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-orange-600" />
                  {refundOrder.customerBankAccount || "Khách hàng chưa cung cấp số tài khoản!"}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRefundOrder(null)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50">Hủy</button>
              <button
                onClick={() => {
                  import("../../api/orderApi").then(m => m.orderApi.refundOrder(refundOrder.id))
                    .then(() => { toast.success("Đã xác nhận hoàn tiền!"); setRefundOrder(null); fetchOrders(); })
                    .catch(() => toast.error("Có lỗi xảy ra"));
                }}
                disabled={!refundOrder.customerBankAccount}
                className="flex-1 px-4 py-2 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 disabled:opacity-50"
              >
                Xác nhận đã hoàn tiền
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: Proof Images ===== */}
      {proofsOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setProofsOrder(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Bằng chứng: {proofsOrder.orderCode}</h3>
              <button onClick={() => setProofsOrder(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
              {proofsOrder.images.map((img, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-50 flex items-center justify-center">
                  <img src={img} alt="proof" className="max-w-full max-h-full object-contain" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
