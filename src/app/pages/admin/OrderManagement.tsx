import { useState, useEffect } from "react";
import { ShoppingCart, Eye } from "lucide-react";
import { adminApi } from "../../api/adminApi";

export function OrderManagement() {
  const [allOrders, setAllOrders] = useState<any[]>([]);

  const fetchOrders = () => {
    adminApi.getAllOrders().then((res: any) => {
      const raw = res?.data || res || [];
      setAllOrders(Array.isArray(raw) ? raw : []);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchOrders();
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
              {["Mã đơn", "User ID", "Loại", "Tổng tiền", "Thanh toán", "Trạng thái", "Ngày tạo", "Hành động"].map(h => (
                <th key={h} className="text-left py-3 px-4 font-semibold text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allOrders.map((o: any) => (
              <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-mono font-semibold text-purple-700">{o.orderCode}</td>
                <td className="py-3 px-4 text-gray-600">#{o.userId}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    o.type === "CUSTOM" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"
                  }`}>{o.type}</span>
                </td>
                <td className="py-3 px-4 font-semibold text-gray-900">{(o.totalAmount || 0).toLocaleString("vi-VN")}₫</td>
                <td className="py-3 px-4 text-gray-600 text-xs">{o.paymentMethod}</td>
                <td className="py-3 px-4">
                  <select
                    value={o.status}
                    onChange={(e) => adminApi.updateOrderStatus(o.id, e.target.value).then(fetchOrders)}
                    className="px-2 py-1 rounded-lg text-xs font-semibold border border-gray-200 bg-white focus:ring-2 focus:ring-purple-500"
                  >
                    {["PENDING","CONFIRMED","PROCESSING","SHIPPING","DELIVERED","COMPLETED","CANCELLED"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs">
                  {o.createdAt ? new Date(o.createdAt).toLocaleDateString("vi-VN") : "-"}
                </td>
                <td className="py-3 px-4">
                  <button className="text-gray-400 hover:text-purple-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {allOrders.length === 0 && (
          <div className="text-center py-12 text-gray-400">Chưa có đơn hàng nào</div>
        )}
      </div>
    </div>
  );
}
