import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  CheckCircle,
  Clock,
  DollarSign,
  Layers,
  Package,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Users,
  XCircle,
  ImageIcon,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { adminApi } from "../../api/adminApi";
import { reportApi } from "../../api/reportApi";

type TxFilter = "ALL" | "SUCCESS" | "ACTIVE" | "CANCELLED" | "REFUNDED";
type GroupBy = "DAY" | "WEEK" | "MONTH";
type Preset = "7D" | "30D" | "90D" | "THIS_MONTH" | "CUSTOM";

const statusLabel: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPING: "Đang giao",
  SHIPPED: "Đã gửi",
  DELIVERED: "Đã giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
};

const statusColors: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#2563eb",
  PROCESSING: "#7c3aed",
  SHIPPING: "#0f766e",
  SHIPPED: "#0891b2",
  DELIVERED: "#14b8a6",
  COMPLETED: "#059669",
  CANCELLED: "#dc2626",
  REFUNDED: "#64748b",
};

const presetLabels: Record<Preset, string> = {
  "7D": "7 ngày",
  "30D": "30 ngày",
  "90D": "90 ngày",
  THIS_MONTH: "Tháng này",
  CUSTOM: "Tùy chọn",
};

const formatDateInput = (date: Date) => {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().split("T")[0];
};

const dateDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDateInput(date);
};

const startOfThisMonth = () => {
  const date = new Date();
  date.setDate(1);
  return formatDateInput(date);
};

const today = () => formatDateInput(new Date());

const formatCurrency = (value: number) =>
  value.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "đ";

const getPayload = (res: any) => (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);

const isSuccessfulOrder = (order: any) => order.status === "COMPLETED" || order.status === "DELIVERED";
const isActiveOrder = (order: any) => ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPING", "SHIPPED"].includes(order.status);

export function AdminDashboard() {
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [staffPerf, setStaffPerf] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [txFilter, setTxFilter] = useState<TxFilter>("ALL");
  const [preset, setPreset] = useState<Preset>("30D");
  const [groupBy, setGroupBy] = useState<GroupBy>("DAY");
  const [fromDate, setFromDate] = useState(dateDaysAgo(30));
  const [toDate, setToDate] = useState(today());
  const [proofsOrder, setProofsOrder] = useState<{ orderCode: string; images: string[] } | null>(null);

  const loadBaseData = async () => {
    setLoading(true);
    try {
      const [ordersRes, usersRes] = await Promise.all([
        adminApi.getAllOrders(),
        adminApi.getUsers(),
      ]);
      setAllOrders(getPayload(ordersRes));
      setUsers(getPayload(usersRes));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    setReportsLoading(true);
    try {
      const [revenueRes, staffRes, trendRes] = await Promise.all([
        reportApi.revenue(fromDate, toDate, groupBy),
        reportApi.staffPerformance(),
        reportApi.trends(),
      ]);
      setRevenue(getPayload(revenueRes));
      setStaffPerf(getPayload(staffRes));
      setTrends(getPayload(trendRes));
    } catch (error) {
      console.error(error);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    loadBaseData();
  }, []);

  useEffect(() => {
    loadReports();
  }, [fromDate, toDate, groupBy]);

  const applyPreset = (nextPreset: Preset) => {
    setPreset(nextPreset);
    const end = today();
    if (nextPreset === "7D") {
      setFromDate(dateDaysAgo(7));
      setToDate(end);
    } else if (nextPreset === "30D") {
      setFromDate(dateDaysAgo(30));
      setToDate(end);
    } else if (nextPreset === "90D") {
      setFromDate(dateDaysAgo(90));
      setToDate(end);
    } else if (nextPreset === "THIS_MONTH") {
      setFromDate(startOfThisMonth());
      setToDate(end);
    }
  };

  const filteredOrders = useMemo(() => {
    const fromTime = new Date(`${fromDate}T00:00:00`).getTime();
    const toTime = new Date(`${toDate}T23:59:59`).getTime();
    return allOrders.filter((order) => {
      if (!order.createdAt) return false;
      const createdTime = new Date(order.createdAt).getTime();
      return createdTime >= fromTime && createdTime <= toTime;
    });
  }, [allOrders, fromDate, toDate]);

  const successfulOrders = filteredOrders.filter(isSuccessfulOrder);
  const cancelledOrders = filteredOrders.filter((order) => order.status === "CANCELLED");
  const activeOrders = filteredOrders.filter(isActiveOrder);
  const totalRevenue = successfulOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const averageOrderValue = successfulOrders.length ? totalRevenue / successfulOrders.length : 0;
  const customerCount = users.filter((user) => user.role === "CUSTOMER").length;
  const finishedOrders = successfulOrders.length + cancelledOrders.length;
  const successRate = finishedOrders ? (successfulOrders.length / finishedOrders) * 100 : 0;

  const metricCards = [
    {
      label: "Doanh thu",
      value: formatCurrency(totalRevenue),
      helper: "Đơn đã giao hoặc hoàn thành",
      icon: DollarSign,
      iconClass: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Đơn hàng",
      value: filteredOrders.length.toLocaleString("vi-VN"),
      helper: "Trong khoảng thời gian lọc",
      icon: ShoppingCart,
      iconClass: "text-blue-600 bg-blue-50",
    },
    {
      label: "Đang xử lý",
      value: activeOrders.length.toLocaleString("vi-VN"),
      helper: "Chờ duyệt, xử lý, vận chuyển",
      icon: Clock,
      iconClass: "text-amber-600 bg-amber-50",
    },
    {
      label: "Khách hàng",
      value: customerCount.toLocaleString("vi-VN"),
      helper: "Tổng tài khoản customer",
      icon: Users,
      iconClass: "text-violet-600 bg-violet-50",
    },
  ];

  const revenueChartData = revenue.map((item) => ({
    period: item.period,
    revenue: Number(item.totalAmount || 0),
  }));

  const statusChartData = Object.entries(
    filteredOrders.reduce((acc: Record<string, number>, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({
    name: statusLabel[status] || status,
    value: count,
    color: statusColors[status] || "#94a3b8",
  }));

  const typeChartData = [
    { name: "Shop", value: filteredOrders.filter((order) => order.type === "SHOP").length, color: "#2563eb" },
    { name: "Custom", value: filteredOrders.filter((order) => order.type === "CUSTOM").length, color: "#db2777" },
  ].filter((item) => item.value > 0);

  const staffChartData = staffPerf.slice(0, 8).map((item) => ({
    name: item.staffEmail || `Staff #${item.staffId}`,
    tickets: Number(item.totalTickets || 0),
  }));

  const trendChartData = trends.slice(0, 8).map((item) => ({
    name: item.key,
    total: Number(item.total || 0),
  }));

  const filteredTransactions = filteredOrders
    .filter((order) => {
      if (txFilter === "ALL") return true;
      if (txFilter === "SUCCESS") return isSuccessfulOrder(order);
      if (txFilter === "ACTIVE") return isActiveOrder(order);
      if (txFilter === "CANCELLED") return order.status === "CANCELLED";
      if (txFilter === "REFUNDED") return order.paymentStatus === "REFUNDED";
      return true;
    })
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 12);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Activity className="h-4 w-4" />
            Admin analytics
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Tổng quan vận hành</h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi doanh thu, đơn hàng, hiệu suất staff và xu hướng custom.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex gap-1 overflow-x-auto">
              {(Object.keys(presetLabels) as Preset[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => applyPreset(item)}
                  className={`rounded-md px-3 py-2 text-xs font-bold transition ${
                    preset === item
                      ? "bg-slate-950 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {presetLabels[item]}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor="from-date">Từ ngày</label>
              <input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(event) => {
                  setPreset("CUSTOM");
                  setFromDate(event.target.value);
                }}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900"
              />
              <span className="text-slate-400">-</span>
              <label className="sr-only" htmlFor="to-date">Đến ngày</label>
              <input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(event) => {
                  setPreset("CUSTOM");
                  setToDate(event.target.value);
                }}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900"
              />
              <select
                value={groupBy}
                onChange={(event) => setGroupBy(event.target.value as GroupBy)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="DAY">Theo ngày</option>
                <option value="WEEK">Theo tuần</option>
                <option value="MONTH">Theo tháng</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  loadBaseData();
                  loadReports();
                }}
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-slate-600 transition hover:bg-slate-50"
                title="Tải lại dữ liệu"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(({ label, value, helper, icon: Icon, iconClass }) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{loading ? "..." : value}</p>
              </div>
              <div className={`rounded-lg p-2 ${iconClass}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-xs font-medium text-slate-500">{helper}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Doanh thu theo thời gian</h2>
              <p className="text-xs font-medium text-slate-500">Chỉ tính đơn đã giao hoặc hoàn thành</p>
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="h-80">
            {reportsLoading ? (
              <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">Đang tải biểu đồ...</div>
            ) : revenueChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">Chưa có doanh thu trong khoảng này</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 12, right: 18, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(value) => `${Number(value) / 1000}k`} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), "Doanh thu"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={3} fill="url(#revenueFill)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Tình trạng đơn</h2>
              <p className="text-xs font-medium text-slate-500">Phân bổ theo trạng thái</p>
            </div>
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div className="h-64">
            {statusChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">Không có đơn hàng</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusChartData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={3}>
                    {statusChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={32} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-md bg-emerald-50 p-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                <CheckCircle className="h-4 w-4" />
                Thành công
              </div>
              <p className="mt-1 text-xl font-black text-emerald-900">{successfulOrders.length}</p>
            </div>
            <div className="rounded-md bg-red-50 p-3">
              <div className="flex items-center gap-2 text-xs font-bold text-red-700">
                <XCircle className="h-4 w-4" />
                Đã hủy
              </div>
              <p className="mt-1 text-xl font-black text-red-900">{cancelledOrders.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Loại đơn</h2>
              <p className="text-xs font-medium text-slate-500">Shop và custom trong kỳ</p>
            </div>
            <Layers className="h-5 w-5 text-pink-600" />
          </div>
          <div className="h-60">
            {typeChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">Không có dữ liệu</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeChartData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={82}>
                    {typeChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={30} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>Giá trị TB/đơn thành công</span>
              <span className="font-black text-slate-950">{formatCurrency(averageOrderValue)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-slate-600">
              <span>Tỷ lệ hoàn thành</span>
              <span className="font-black text-slate-950">{successRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Hiệu suất staff</h2>
              <p className="text-xs font-medium text-slate-500">Tổng số ticket được phân công</p>
            </div>
            <Users className="h-5 w-5 text-violet-600" />
          </div>
          <div className="h-72">
            {staffChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">Chưa có dữ liệu staff</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={staffChartData} layout="vertical" margin={{ top: 4, right: 24, left: 24, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12, fill: "#334155" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="tickets" name="Ticket" fill="#7c3aed" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Xu hướng layout</h2>
              <p className="text-xs font-medium text-slate-500">Layout custom được yêu cầu nhiều</p>
            </div>
            <TrendingUp className="h-5 w-5 text-cyan-600" />
          </div>
          <div className="h-72">
            {trendChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">Chưa có dữ liệu layout</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendChartData} margin={{ top: 8, right: 16, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="total" name="Yêu cầu" fill="#0891b2" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Giao dịch gần đây</h2>
              <p className="text-xs font-medium text-slate-500">Đã lọc theo thời gian và trạng thái</p>
            </div>
            <div className="flex gap-1 overflow-x-auto">
              {(["ALL", "SUCCESS", "ACTIVE", "CANCELLED", "REFUNDED"] as TxFilter[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTxFilter(item)}
                  className={`rounded-md px-3 py-2 text-xs font-bold transition ${
                    txFilter === item
                      ? "bg-slate-950 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {item === "ALL"
                    ? "Tất cả"
                    : item === "SUCCESS"
                      ? "Thành công"
                      : item === "ACTIVE"
                        ? "Đang xử lý"
                        : item === "CANCELLED"
                          ? "Đã hủy"
                          : "Hoàn tiền"}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-3">Mã đơn</th>
                  <th className="px-3 py-3">Khách hàng</th>
                  <th className="px-3 py-3">Loại</th>
                  <th className="px-3 py-3">Tổng tiền</th>
                  <th className="px-3 py-3">Trạng thái</th>
                  <th className="px-3 py-3">Ngày tạo</th>
                  <th className="px-3 py-3 text-center">Bằng chứng</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-3 font-mono text-xs font-black text-slate-950">{order.orderCode}</td>
                    <td className="px-3 py-3 font-semibold text-slate-800">{order.customerName || "Khách hàng"}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-md px-2 py-1 text-xs font-bold ${
                        order.type === "CUSTOM" ? "bg-pink-50 text-pink-700" : "bg-blue-50 text-blue-700"
                      }`}>
                        {order.type === "CUSTOM" ? "Custom" : "Shop"}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-black text-slate-950">{formatCurrency(Number(order.totalAmount || 0))}</td>
                    <td className="px-3 py-3">
                      <span
                        className="rounded-md px-2 py-1 text-xs font-bold"
                        style={{
                          color: statusColors[order.status] || "#475569",
                          backgroundColor: `${statusColors[order.status] || "#64748b"}14`,
                        }}
                      >
                        {statusLabel[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs font-semibold text-slate-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "-"}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {order.proofImagesJson && order.proofImagesJson !== "[]" ? (
                        <button
                          onClick={() => {
                            try {
                              setProofsOrder({
                                orderCode: order.orderCode,
                                images: JSON.parse(order.proofImagesJson),
                              });
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 transition shadow-sm"
                          title="Xem bằng chứng/mockup hoàn thành"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                          Xem mockup
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic">Chưa cập nhật</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-sm font-semibold text-slate-400">
                      Không có giao dịch phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-500 shadow-sm">
        <CalendarDays className="h-4 w-4 text-slate-400" />
        Khoảng thời gian hiện tại: {new Date(fromDate).toLocaleDateString("vi-VN")} đến {new Date(toDate).toLocaleDateString("vi-VN")}.
      </div>

      {/* ===== MODAL: Proof Images / Mockup ===== */}
      {proofsOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setProofsOrder(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 transform transition-all duration-300 scale-100" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Bằng chứng hoàn thành đơn hàng</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Mã đơn hàng: <span className="font-mono text-slate-800 font-black">{proofsOrder.orderCode}</span></p>
              </div>
              <button onClick={() => setProofsOrder(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
              {proofsOrder.images.map((img, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-slate-150 aspect-video bg-slate-50 flex items-center justify-center relative group shadow-sm">
                  <img src={img} alt={`Mockup bằng chứng ${i + 1}`} className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105" />
                  <a
                    href={img}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute bottom-2 right-2 px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg text-[10px] font-bold backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Xem ảnh gốc
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
