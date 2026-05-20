import { useState, useEffect } from "react";
import { DollarSign, Package, Users, TrendingUp, ShoppingCart, FileText, Settings } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { reportApi } from "../../api/reportApi";

export function AdminDashboard() {
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<{ revenue: any[]; staffPerf: any[]; trends: any[] }>({ revenue: [], staffPerf: [], trends: [] });
  const [reportsLoaded, setReportsLoaded] = useState(false);

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

  const totalRevenue = allOrders.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);
  const totalOrders = allOrders.length;
  const totalCustomers = users.filter((u: any) => u.role === "CUSTOMER").length;
  const completedOrders = allOrders.filter((o: any) => o.status === "COMPLETED" || o.status === "DELIVERED");
  const avgOrderValue = completedOrders.length > 0
    ? (completedOrders.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0) / completedOrders.length)
    : 0;

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tổng quan</h1>
        <p className="text-gray-600">Thống kê doanh thu và hiệu suất</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Doanh thu (30 ngày)", value: totalRevenue.toLocaleString("vi-VN") + "₫", icon: DollarSign, color: "text-green-500" },
          { label: "Tổng đơn hàng", value: totalOrders, icon: Package, color: "text-blue-500" },
          { label: "Khách hàng", value: totalCustomers, icon: Users, color: "text-purple-500" },
          { label: "Giá trị TB/đơn", value: avgOrderValue.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "₫", icon: TrendingUp, color: "text-orange-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">{label}</span>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-3xl font-bold text-gray-900">{value}</div>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+8.3% from last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Đơn hàng gần nhất</h3>
          <div className="space-y-3">
            {allOrders.slice(0, 5).map((o: any) => (
              <div key={o.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{o.orderCode}</div>
                    <div className="text-xs text-gray-500">User #{o.userId} · {o.type}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900 text-sm">{(o.totalAmount || 0).toLocaleString("vi-VN")}₫</div>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{o.status}</span>
                </div>
              </div>
            ))}
            {allOrders.length === 0 && <p className="text-gray-400 text-center py-4">Chưa có đơn hàng nào</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-pink-500" /> Xu hướng Layout/Style
            </h3>
            {reports.trends.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Chưa có dữ liệu xu hướng</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {reports.trends.map((t: any, i: number) => (
                  <div key={i} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                    <div className="font-bold text-gray-900">{t.category || t.theme || t.layout}</div>
                    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mt-1">{t.count || t.orderCount}</div>
                    <div className="text-xs text-gray-500 mt-1">đơn hàng</div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" /> Hiệu suất Staff
        </h3>
        {reports.staffPerf.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Chưa có dữ liệu hiệu suất</p>
        ) : (
            <table className="w-full text-sm">
            <thead>
                <tr className="border-b border-gray-200">
                {["Staff", "Ticket hoàn thành", "Avg thời gian", "Revision rate"].map(h => (
                    <th key={h} className="text-left py-2 px-4 font-semibold text-gray-700">{h}</th>
                ))}
                </tr>
            </thead>
            <tbody>
                {reports.staffPerf.map((s: any, i: number) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-4 font-semibold text-gray-900">{s.staffName || s.email || `Staff #${s.staffId}`}</td>
                    <td className="py-2 px-4">{s.completedTickets ?? s.completed ?? "-"}</td>
                    <td className="py-2 px-4 text-gray-600">{s.avgCompletionDays ? `${s.avgCompletionDays} ngày` : "-"}</td>
                    <td className="py-2 px-4">{s.revisionRate ? `${s.revisionRate}%` : "-"}</td>
                </tr>
                ))}
            </tbody>
            </table>
        )}
      </div>
    </div>
  );
}
