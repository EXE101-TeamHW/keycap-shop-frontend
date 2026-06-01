import { useState, useEffect } from "react";
import { ShoppingCart, MessageCircle, X, Phone, Mail, CreditCard, Banknote, MapPin } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { TicketChat } from "../../components/TicketChat";
import { toast } from "sonner";

export function OrderManagement() {
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [staffs, setStaffs] = useState<any[]>([]);
  const [chatOrder, setChatOrder] = useState<any | null>(null);
  const [refundOrder, setRefundOrder] = useState<any | null>(null);

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
      const staffsOnly = raw.filter((u: any) => u.role === "STAFF");
      setStaffs(staffsOnly);
    }).catch(console.error);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-purple-600" />
            Tất cả đơn hàng ({allOrders.length})
        </h3>
      </div>
      <div className="p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {["Mã đơn", "Khách hàng", "Thanh toán", "Staff", "Trạng thái", "Ngày tạo", "Hành động"].map(h => (
                <th key={h} className="text-left py-3 px-4 font-semibold text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allOrders.map((o: any) => (
              <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-mono font-semibold text-purple-700">{o.orderCode}</td>
                <td className="py-3 px-4 text-gray-600 text-xs">
                  <div className="font-semibold text-gray-900">{o.customerName || "Customer"}</div>
                  <div className="flex items-center gap-1 mt-1"><Phone className="w-3 h-3"/> {o.customerPhone || "N/A"}</div>
                  <div className="flex items-center gap-1"><Mail className="w-3 h-3"/> {o.customerEmail || "N/A"}</div>
                  {o.shippingAddress && (
                    <div className="flex items-start gap-1 mt-1 text-gray-500">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2 max-w-[200px]" title={o.shippingAddress}>{o.shippingAddress}</span>
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="font-bold text-gray-900">{(o.totalAmount || 0).toLocaleString("vi-VN")}₫</div>
                  <div className={`mt-1 inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    o.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 
                    o.paymentStatus === 'REFUNDED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {o.paymentMethod} • {o.paymentStatus}
                  </div>
                </td>
                <td className="py-3 px-4">
                  {o.staffId ? (
                    <span className="text-sm font-semibold text-purple-600">{o.staffName}</span>
                  ) : (
                    <select
                      className="px-2 py-1 rounded-lg text-xs font-semibold border border-gray-200 bg-white"
                      onChange={(e) => {
                        if (e.target.value) {
                          import("../../api/orderApi").then(m => m.orderApi.assignStaff(o.id, e.target.value))
                            .then(() => {
                              toast.success("Phân công nhân viên thành công!");
                              fetchOrders();
                            }).catch(() => toast.error("Có lỗi xảy ra"));
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>Chọn nhân viên</option>
                      {staffs.map(s => <option key={s.id} value={s.id}>{s.fullName || s.email}</option>)}
                    </select>
                  )}
                </td>
                <td className="py-3 px-4">
                  <select
                    value={o.status}
                    onChange={(e) => import("../../api/orderApi").then(m => m.orderApi.updateStatus(o.id, e.target.value))
                      .then(() => {
                        toast.success("Cập nhật trạng thái đơn hàng thành công!");
                        fetchOrders();
                      }).catch(() => toast.error("Có lỗi xảy ra"))}
                    className={`px-2 py-1 rounded-lg text-xs font-bold border focus:outline-none ${
                      o.status === "COMPLETED" || o.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      o.status === "CANCELLED" ? "bg-red-50 text-red-700 border-red-200" :
                      "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {["PENDING","CONFIRMED","PROCESSING","SHIPPING","DELIVERED","CANCELLED"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs">
                  {o.createdAt ? new Date(o.createdAt).toLocaleDateString("vi-VN") : "-"}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setChatOrder(o)}
                      className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                      title="Chat với khách hàng"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
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
            ))}
          </tbody>
        </table>
        {allOrders.length === 0 && (
          <div className="text-center py-12 text-gray-400">Chưa có đơn hàng nào</div>
        )}
      </div>

      {chatOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setChatOrder(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Chat đơn hàng: {chatOrder.orderCode}</h3>
              <button onClick={() => setChatOrder(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-[400px]">
              <TicketChat 
                ticketId={chatOrder.id} 
                customerId={chatOrder.userId} 
                staffId={chatOrder.staffId} 
              />
            </div>
          </div>
        </div>
      )}

      {refundOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setRefundOrder(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Banknote className="w-6 h-6 text-orange-500" /> Hoàn tiền đơn hàng
              </h3>
              <button onClick={() => setRefundOrder(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 mb-3">Vui lòng chuyển khoản số tiền <strong>{(refundOrder.totalAmount || 0).toLocaleString("vi-VN")}₫</strong> vào tài khoản dưới đây của khách hàng, sau đó nhấn "Xác nhận đã hoàn tiền".</p>
              
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
                    .then(() => {
                      toast.success("Đã xác nhận hoàn tiền!");
                      setRefundOrder(null);
                      fetchOrders();
                    }).catch(() => toast.error("Có lỗi xảy ra"));
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
    </div>
  );
}
