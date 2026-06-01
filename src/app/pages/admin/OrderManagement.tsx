import { useState, useEffect } from "react";
import { ShoppingCart, MessageCircle, X, Phone, Mail, CreditCard, Banknote, MapPin, UploadCloud, CheckCircle, Ban, Image as ImageIcon } from "lucide-react";
import { uploadApi } from "../../api/uploadApi";
import { adminApi } from "../../api/adminApi";
import { TicketChat } from "../../components/TicketChat";
import { toast } from "sonner";

export function OrderManagement() {
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [staffs, setStaffs] = useState<any[]>([]);
  const [chatOrder, setChatOrder] = useState<any | null>(null);
  const [refundOrder, setRefundOrder] = useState<any | null>(null);
  const [proofsOrder, setProofsOrder] = useState<{orderCode: string, images: string[]} | null>(null);
  const [statusModal, setStatusModal] = useState<{order: any, nextStatus: string} | null>(null);
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const getNextStatus = (current: string) => {
    switch (current) {
      case "PENDING": return "CONFIRMED";
      case "CONFIRMED": return "PROCESSING";
      case "PROCESSING": return "SHIPPING";
      case "SHIPPING": return "DELIVERED";
      case "DELIVERED": return "COMPLETED";
      default: return null;
    }
  };

  const getStatusActionLabel = (nextStatus: string) => {
    switch (nextStatus) {
      case "CONFIRMED": return "Xác nhận đơn";
      case "PROCESSING": return "Đang xử lý";
      case "SHIPPING": return "Giao hàng";
      case "DELIVERED": return "Đã giao";
      case "COMPLETED": return "Hoàn tất";
      default: return "";
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusModal) return;
    setUploading(true);
    try {
      const imageUrls = [];
      for (const file of proofFiles) {
        const res: any = await uploadApi.uploadFile(file);
        if (res?.data?.url) imageUrls.push(res.data.url);
        else if (res?.url) imageUrls.push(res.url);
      }
      const m = await import("../../api/orderApi");
      await m.orderApi.updateStatus(statusModal.order.id, statusModal.nextStatus, imageUrls);
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
                  <div className="flex flex-col gap-2 items-start">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                      o.status === "COMPLETED" || o.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      o.status === "CANCELLED" ? "bg-red-50 text-red-700 border-red-200" :
                      "bg-blue-50 text-blue-700 border-blue-200"
                    }`}>
                      {o.status}
                    </span>
                    {getNextStatus(o.status) && (
                      <button
                        onClick={() => setStatusModal({ order: o, nextStatus: getNextStatus(o.status)! })}
                        className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                      >
                        <CheckCircle className="w-3 h-3" />
                        {getStatusActionLabel(getNextStatus(o.status)!)}
                      </button>
                    )}
                    {(o.status === "PENDING" || o.status === "CONFIRMED") && (
                      <button
                        onClick={() => {
                          if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
                            import("../../api/orderApi").then(m => m.orderApi.cancelOrder(o.id))
                              .then(() => { toast.success("Đã hủy đơn hàng!"); fetchOrders(); })
                              .catch(() => toast.error("Có lỗi xảy ra"));
                          }
                        }}
                        className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
                      >
                        <Ban className="w-3 h-3" /> Hủy đơn
                      </button>
                    )}
                  </div>
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
                    {o.proofImagesJson && o.proofImagesJson !== "[]" && (
                      <button
                        onClick={() => {
                          try { setProofsOrder({ orderCode: o.orderCode, images: JSON.parse(o.proofImagesJson) }) }
                          catch(e) {}
                        }}
                        className="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors"
                        title="Xem bằng chứng"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                    )}
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

      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !uploading && setStatusModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Chuyển sang: <span className="text-purple-600">{getStatusActionLabel(statusModal.nextStatus)}</span>
              </h3>
              <button disabled={uploading} onClick={() => setStatusModal(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">
                Bạn có thể tải lên hình ảnh bằng chứng (mã vận đơn, ảnh giao hàng thành công...) nếu có.
              </p>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500"><span className="font-semibold">Nhấn để tải ảnh lên</span></p>
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
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button disabled={uploading} onClick={() => setStatusModal(null)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50">Hủy</button>
              <button 
                disabled={uploading}
                onClick={handleUpdateStatus}
                className="flex-1 px-4 py-2 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {proofsOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setProofsOrder(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Bằng chứng: {proofsOrder.orderCode}</h3>
              <button onClick={() => setProofsOrder(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"><X className="w-5 h-5"/></button>
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
