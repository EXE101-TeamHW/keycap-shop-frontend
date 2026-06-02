import { useState, useEffect } from "react";
import { ShoppingCart, X, Phone, Mail, CreditCard, Banknote, MapPin, UserCheck, Ban, Image as ImageIcon, MessageCircle } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { TicketChat } from "../../components/TicketChat";
import { toast } from "sonner";

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

export function OrderManagement() {
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [staffs, setStaffs] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Modals
  const [assignModal, setAssignModal] = useState<any | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [assigning, setAssigning] = useState(false);

  const [chatOrder, setChatOrder] = useState<any | null>(null);
  const [refundOrder, setRefundOrder] = useState<any | null>(null);
  const [proofsOrder, setProofsOrder] = useState<{ orderCode: string; images: string[] } | null>(null);

  const fetchOrders = () => {
    adminApi.getAllOrders().then((res: any) => {
      const raw = res?.data || res || [];
      setAllOrders(Array.isArray(raw) ? raw : []);
    }).catch(err => {
      console.error(err);
      toast.error("Lỗi khi tải danh sách đơn hàng.");
    });
  };

  useEffect(() => {
    fetchOrders();
    adminApi.getUsers().then((res: any) => {
      const raw = res?.data || res || [];
      setStaffs(raw.filter((u: any) => u.role === "STAFF"));
    }).catch(console.error);
  }, []);

  const handleConfirmAssign = async () => {
    if (!assignModal || !selectedStaffId) {
      toast.error("Vui lòng chọn nhân viên!");
      return;
    }
    setAssigning(true);
    try {
      await adminApi.confirmAndAssign(assignModal.id, selectedStaffId);
      toast.success("Đã duyệt và phân công nhân viên thành công!");
      setAssignModal(null);
      setSelectedStaffId("");
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setAssigning(false);
    }
  };

  const handleCancel = async (order: any) => {
    if (!window.confirm(`Hủy đơn ${order.orderCode}?`)) return;
    try {
      await adminApi.cancelOrder(order.id);
      toast.success("Đã hủy đơn hàng!");
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  const statusTabs = ["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPING", "DELIVERED", "COMPLETED", "CANCELLED"];
  const filtered = filterStatus === "ALL" ? allOrders : allOrders.filter(o => o.status === filterStatus);
  const pendingCount = allOrders.filter(o => o.status === "PENDING").length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-purple-600" />
            Quản lý đơn hàng
            <span className="text-sm font-normal text-gray-500">({allOrders.length} đơn)</span>
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full animate-pulse">
                {pendingCount} chờ duyệt
              </span>
            )}
          </h3>
        </div>
        {/* Filter tabs */}
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
              {["Mã đơn / Loại", "Khách hàng", "Thanh toán", "Nhân viên", "Trạng thái", "Ngày tạo", "Hành động"].map(h => (
                <th key={h} className="text-left py-3 px-4 font-semibold text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o: any) => {
              const st = STATUS_LABEL[o.status] || { label: o.status, cls: "bg-gray-50 text-gray-600 border-gray-200" };
              return (
                <tr key={o.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${o.status === "PENDING" ? "bg-amber-50/30" : ""}`}>
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
                    {o.shippingAddress && (
                      <div className="flex items-start gap-1 mt-1 text-gray-500">
                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2 max-w-[180px]" title={o.shippingAddress}>{o.shippingAddress}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-gray-900">{(o.totalAmount || 0).toLocaleString("vi-VN")}₫</div>
                    <div className={`mt-1 inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      o.paymentStatus === "PAID" ? "bg-emerald-100 text-emerald-700" :
                      o.paymentStatus === "REFUNDED" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {o.paymentMethod} • {o.paymentStatus}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {o.staffId ? (
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-purple-700">
                        <UserCheck className="w-4 h-4" />
                        {o.staffName}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Chưa phân công</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${st.cls}`}>
                      {st.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString("vi-VN") : "-"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* PENDING: Approve + Assign */}
                      {o.status === "PENDING" && (
                        <button
                          onClick={() => { setAssignModal(o); setSelectedStaffId(""); }}
                          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                          title="Duyệt và phân công nhân viên"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Duyệt & Phân công
                        </button>
                      )}

                      {/* Cancel (PENDING or CONFIRMED only) */}
                      {(o.status === "PENDING" || o.status === "CONFIRMED") && (
                        <button
                          onClick={() => handleCancel(o)}
                          className="flex items-center gap-1 text-xs font-semibold px-2 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                          title="Hủy đơn hàng"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Hủy
                        </button>
                      )}

                      {/* Chat — available once conversation exists */}
                      {o.conversationId && (
                        <button
                          onClick={() => setChatOrder(o)}
                          className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                          title="Xem chat đơn hàng"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      )}

                      {/* View proof images */}
                      {o.proofImagesJson && o.proofImagesJson !== "[]" && (
                        <button
                          onClick={() => {
                            try { setProofsOrder({ orderCode: o.orderCode, images: JSON.parse(o.proofImagesJson) }); } catch (e) {}
                          }}
                          className="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors"
                          title="Xem bằng chứng giao hàng"
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
          <div className="text-center py-12 text-gray-400">Chưa có đơn hàng nào</div>
        )}
      </div>

      {/* ===== MODAL: Approve + Assign ===== */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !assigning && setAssignModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-600" />
                Duyệt & Phân công
              </h3>
              <button disabled={assigning} onClick={() => setAssignModal(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <div className="text-sm text-gray-500 mb-1">Đơn hàng</div>
              <div className="font-mono font-bold text-purple-700">{assignModal.orderCode}</div>
              <div className="text-sm text-gray-700 mt-1">{assignModal.customerName} • {(assignModal.totalAmount || 0).toLocaleString("vi-VN")}₫</div>
              <div className={`mt-2 inline-block px-2 py-0.5 rounded text-xs font-bold ${
                assignModal.type === "CUSTOM" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"
              }`}>
                {assignModal.type === "CUSTOM" ? "🎨 Custom" : "🛒 Shop"}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn nhân viên phụ trách</label>
              <select
                value={selectedStaffId}
                onChange={e => setSelectedStaffId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="" disabled>-- Chọn nhân viên --</option>
                {staffs.map(s => (
                  <option key={s.id} value={s.id}>{s.fullName || s.email}</option>
                ))}
              </select>
              {staffs.length === 0 && (
                <p className="text-xs text-red-500 mt-2">⚠️ Chưa có nhân viên nào trong hệ thống.</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5 text-xs text-blue-700">
              ✅ Sau khi xác nhận: đơn chuyển sang <strong>Đã duyệt</strong>, nhân viên được giao việc và kênh chat với khách hàng sẽ được tạo tự động.
            </div>

            <div className="flex gap-3">
              <button disabled={assigning} onClick={() => setAssignModal(null)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50">
                Hủy
              </button>
              <button
                disabled={assigning || !selectedStaffId}
                onClick={handleConfirmAssign}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {assigning ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <UserCheck className="w-4 h-4" />}
                {assigning ? "Đang xử lý..." : "Xác nhận"}
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
                Chat đơn hàng: {chatOrder.orderCode}
                <span className="text-xs text-gray-400 font-normal">({chatOrder.customerName})</span>
              </h3>
              <button onClick={() => setChatOrder(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-[400px]">
              <TicketChat
                ticketId={chatOrder.conversationId}
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
              <p className="text-sm text-gray-600 mb-3">Vui lòng chuyển khoản <strong>{(refundOrder.totalAmount || 0).toLocaleString("vi-VN")}₫</strong> vào tài khoản của khách hàng, sau đó nhấn "Xác nhận đã hoàn tiền".</p>
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
