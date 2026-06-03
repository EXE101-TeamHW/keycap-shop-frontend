import { useState, useEffect } from "react";
import { DollarSign, Package, Users, TrendingUp, ShoppingCart, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { reportApi } from "../../api/reportApi";

type TxFilter = "ALL" | "SUCCESS" | "FAILED" | "REFUNDED" | "ACTIVE";

export function AdminDashboard() {
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<{ revenue: any[]; staffPerf: any[]; trends: any[] }>({ revenue: [], staffPerf: [], trends: [] });
  const [reportsLoaded, setReportsLoaded] = useState(false);
  const [filterTxStatus, setFilterTxStatus] = useState<TxFilter>("ALL");

  useEffect(() => {
    adminApi.getAllOrders().then((res: any) => {
      setAllOrders(Array.isArray(res?.data || res) ? (res?.data || res) : []);
    }).catch(console.error);
    
    adminApi.getUsers().then((res: any) => {
      if (res?.data) setUsers(res.data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (reportsLoaded) return;
    const today = new Date().toISOString().split("T")[0];
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
    Promise.all([
      reportApi.revenue(monthAgo, today, "DAY"),
      reportApi.staffPerformance(),
      reportApi.trends(),
    ]).then(([rev, perf, trends]: any[]) => {
      setReports({
        revenue: Array.isArray(rev?.data || rev) ? (rev?.data || rev) : [],
        staffPerf: Array.isArray(perf?.data || perf) ? (perf?.data || perf) : [],
        trends: Array.isArray(trends?.data || trends) ? (trends?.data || trends) : [],
      });
      setReportsLoaded(true);
    }).catch(console.error);
  }, [reportsLoaded]);

  // Metric calculations
  const completedOrders = allOrders.filter((o: any) => o.status === "COMPLETED" || o.status === "DELIVERED");
  const cancelledOrders = allOrders.filter((o: any) => o.status === "CANCELLED");
  const processingOrders = allOrders.filter((o: any) => ["CONFIRMED", "PROCESSING", "SHIPPING"].includes(o.status));
  const pendingOrders = allOrders.filter((o: any) => o.status === "PENDING");
  
  // Doanh thu chỉ tính đơn hàng thành công (COMPLETED hoặc DELIVERED)
  const totalRevenue = completedOrders.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);
  const totalOrders = allOrders.length;
  const totalCustomers = users.filter((u: any) => u.role === "CUSTOMER").length;
  
  const avgOrderValue = completedOrders.length > 0
    ? (totalRevenue / completedOrders.length)
    : 0;

  const totalFinished = completedOrders.length + cancelledOrders.length;
  const successRate = totalFinished > 0 ? (completedOrders.length / totalFinished) * 100 : 0;

  // Filter Transaction History
  const filteredTx = allOrders.filter((o: any) => {
    if (filterTxStatus === "ALL") return true;
    if (filterTxStatus === "SUCCESS") return o.status === "COMPLETED" || o.status === "DELIVERED";
    if (filterTxStatus === "FAILED") return o.status === "CANCELLED" && o.paymentStatus !== "REFUNDED";
    if (filterTxStatus === "REFUNDED") return o.paymentStatus === "REFUNDED";
    if (filterTxStatus === "ACTIVE") return ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPING"].includes(o.status);
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tổng quan</h1>
        <p className="text-gray-600">Thống kê doanh thu và hiệu suất</p>
      </div>

      {/* Grid 1: Core Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Doanh thu (Thành công)", value: totalRevenue.toLocaleString("vi-VN") + "₫", icon: DollarSign, color: "text-green-500", desc: "Chỉ tính đơn hoàn thành" },
          { label: "Tổng đơn hàng", value: totalOrders, icon: Package, color: "text-blue-500", desc: "Tất cả các trạng thái" },
          { label: "Khách hàng", value: totalCustomers, icon: Users, color: "text-purple-500", desc: "Tài khoản khách hàng" },
          { label: "Giá trị TB/Đơn thành công", value: avgOrderValue.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "₫", icon: TrendingUp, color: "text-orange-500", desc: "Doanh thu / Đơn hoàn thành" },
        ].map(({ label, value, icon: Icon, color, desc }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{label}</span>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
            </div>
            <div className="mt-4 text-xs text-gray-400 font-medium">
              {desc}
            </div>
          </div>
        ))}
      </div>

      {/* Grid 2: Order Outcomes & Ratios */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Đơn thành công", value: completedOrders.length + " đơn", icon: CheckCircle, color: "text-emerald-500", desc: "Đã giao / Hoàn tất" },
          { label: "Đơn đã hủy", value: cancelledOrders.length + " đơn", icon: XCircle, color: "text-red-500", desc: "Giao dịch thất bại" },
          { label: "Đơn đang xử lý", value: (processingOrders.length + pendingOrders.length) + " đơn", icon: Clock, color: "text-purple-500", desc: "Chờ duyệt, xử lý, giao hàng" },
          { label: "Tỷ lệ hoàn thành", value: successRate.toFixed(1) + "%", icon: TrendingUp, color: "text-teal-500", desc: "Đơn thành công / Đơn kết thúc" },
        ].map(({ label, value, icon: Icon, color, desc }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{label}</span>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
            </div>
            <div className="mt-4 text-xs text-gray-400 font-medium">
              {desc}
            </div>
          </div>
        ))}
      </div>

      {/* Grid 3: Trends and Layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-pink-500" /> Xu hướng Layout/Style
            </h3>
            {reports.trends.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Chưa có dữ liệu xu hướng</p>
            ) : (
              <div className="space-y-3">
                {reports.trends.slice(0, 4).map((t: any, i: number) => (
                  <div key={i} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{t.category || t.theme || t.layout}</div>
                      <div className="text-xs text-gray-500">Danh mục yêu cầu</div>
                    </div>
                    <div className="text-2xl font-black text-purple-700">{t.count || t.orderCount} <span className="text-xs font-normal text-gray-500">đơn</span></div>
                  </div>
                ))}
              </div>
            )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" /> Hiệu suất Staff
          </h3>
          {reports.staffPerf.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Chưa có dữ liệu hiệu suất</p>
          ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                      <tr className="border-b border-gray-200 text-gray-500">
                        <th className="text-left py-3 px-4 font-semibold">Nhân viên</th>
                        <th className="text-left py-3 px-4 font-semibold">Thiết kế hoàn tất</th>
                      </tr>
                  </thead>
                  <tbody>
                      {reports.staffPerf.map((s: any, i: number) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-semibold text-gray-900">{s.staffName || s.email || `Staff #${s.staffId}`}</td>
                          <td className="py-3 px-4 text-gray-700 font-bold">{s.completedTickets ?? s.completed ?? "0"} ticket</td>
                      </tr>
                      ))}
                  </tbody>
                </table>
              </div>
          )}
        </div>
      </div>

      {/* Grid 4: TRANSACTION HISTORY TABLE (Separate Section) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Lịch sử giao dịch đơn hàng
            </h3>
            <p className="text-xs text-gray-500 mt-1">Danh sách đầy đủ các giao dịch thành công, thất bại và hoàn tiền</p>
          </div>
          {/* Filters */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {(["ALL", "SUCCESS", "FAILED", "REFUNDED", "ACTIVE"] as TxFilter[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTxStatus(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  filterTxStatus === tab
                    ? "bg-purple-600 text-white shadow"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab === "ALL" ? "Tất cả" :
                 tab === "SUCCESS" ? "Thành công" :
                 tab === "FAILED" ? "Thất bại" :
                 tab === "REFUNDED" ? "Hoàn tiền" : "Đang xử lý"}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 font-medium">
                <th className="text-left py-3 px-4">Mã đơn</th>
                <th className="text-left py-3 px-4">Khách hàng</th>
                <th className="text-left py-3 px-4">Loại đơn</th>
                <th className="text-left py-3 px-4">Tổng tiền</th>
                <th className="text-left py-3 px-4">Trạng thái đơn</th>
                <th className="text-left py-3 px-4">Thanh toán</th>
                <th className="text-left py-3 px-4">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {filteredTx.map((o: any) => {
                const isSuccess = o.status === "COMPLETED" || o.status === "DELIVERED";
                const isFailed = o.status === "CANCELLED";
                const isRefunded = o.paymentStatus === "REFUNDED";
                
                return (
                  <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-700">{o.orderCode}</td>
                    <td className="py-3.5 px-4 text-gray-900 font-medium">{o.customerName || "Khách hàng"}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        o.type === "CUSTOM" ? "bg-pink-50 text-pink-700 border border-pink-100" : "bg-blue-50 text-blue-700 border border-blue-100"
                      }`}>
                        {o.type === "CUSTOM" ? "🎨 Custom" : "🛒 Shop"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-950">{(o.totalAmount || 0).toLocaleString("vi-VN")}₫</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        isSuccess ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        isFailed ? "bg-red-50 text-red-700 border-red-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${
                        isRefunded ? "bg-blue-50 text-blue-700 border border-blue-100" :
                        o.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        "bg-gray-50 text-gray-500 border border-gray-100"
                      }`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 text-xs">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString("vi-VN") : "-"}
                    </td>
                  </tr>
                );
              })}
              {filteredTx.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">Không tìm thấy giao dịch nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
