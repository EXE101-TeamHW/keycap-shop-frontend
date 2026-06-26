import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Loader2,
  ReceiptText,
} from "lucide-react";
import { paymentApi } from "../../api/paymentApi";

interface PaymentTransaction {
  id: number;
  orderId: number;
  orderCode: string;
  amount: number;
  paymentMethod: string;
  status: string;
  type: "PAYMENT" | "REFUND";
  direction: "OUTGOING" | "INCOMING";
  actorRole: string;
  destination: string;
  externalReference?: string;
  createdAt: string;
}

const PAGE_SIZE = 10;

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));

const methodLabel: Record<string, string> = {
  PAYOS: "PayOS",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
  COD: "Thanh toán khi nhận hàng",
  VNPAY: "VNPay",
  MOMO: "MoMo",
};

const roleLabel: Record<string, string> = {
  CUSTOMER: "Khách hàng",
  ADMIN: "Quản trị viên",
  STAFF: "Nhân viên",
};

export function PaymentTransactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PAYMENT" | "REFUND">("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    paymentApi.getMyTransactions()
      .then((res: any) => {
        const data = res?.data || res || [];
        setTransactions(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => filter === "ALL" ? transactions : transactions.filter((item) => item.type === filter),
    [filter, transactions]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <button
        type="button"
        onClick={() => navigate("/orders")}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại đơn hàng
      </button>

      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-purple-600">
            <ReceiptText className="h-4 w-4" />
            Tài chính cá nhân
          </div>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Lịch sử giao dịch</h1>
          <p className="mt-1 text-sm text-slate-500">
            Các giao dịch chuyển khoản được ghi nhận chính xác từ PayOS.
          </p>
        </div>
        <div className="flex gap-2">
          {(["ALL", "PAYMENT", "REFUND"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`h-10 rounded-md px-4 text-sm font-bold transition ${
                filter === value
                  ? "bg-slate-950 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {value === "ALL" ? "Tất cả" : value === "PAYMENT" ? "Đã chuyển" : "Hoàn tiền"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-black uppercase text-slate-500">
                <th className="px-5 py-4">Ngày / giờ giao dịch</th>
                <th className="px-5 py-4">Loại giao dịch</th>
                <th className="px-5 py-4">Số tiền</th>
                <th className="px-5 py-4">Chuyển đến / nhận từ</th>
                <th className="px-5 py-4">Phương thức</th>
                <th className="px-5 py-4">Vai trò thực hiện</th>
                <th className="px-5 py-4">Mã đơn / tham chiếu</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((transaction) => {
                const outgoing = transaction.direction === "OUTGOING";
                const DirectionIcon = outgoing ? ArrowUpRight : ArrowDownLeft;
                return (
                  <tr key={transaction.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-700">
                      {formatDateTime(transaction.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold ${
                        outgoing ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                      }`}>
                        <DirectionIcon className="h-3.5 w-3.5" />
                        {outgoing ? "Chuyển tiền" : "Nhận hoàn tiền"}
                      </span>
                    </td>
                    <td className={`whitespace-nowrap px-5 py-4 text-base font-black ${outgoing ? "text-red-600" : "text-emerald-600"}`}>
                      {outgoing ? "-" : "+"}{Number(transaction.amount || 0).toLocaleString("vi-VN")}đ
                    </td>
                    <td className="max-w-60 px-5 py-4 font-semibold text-slate-700">{transaction.destination}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 font-semibold text-slate-700">
                        <CreditCard className="h-4 w-4 text-slate-400" />
                        {methodLabel[transaction.paymentMethod] || transaction.paymentMethod}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-md bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700">
                        {roleLabel[transaction.actorRole] || transaction.actorRole}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => navigate(`/orders`)}
                        className="font-mono text-xs font-black text-purple-700 hover:underline"
                      >
                        {transaction.orderCode}
                      </button>
                      <p className="mt-1 max-w-44 truncate font-mono text-[10px] text-slate-400" title={transaction.externalReference}>
                        {transaction.externalReference || "-"}
                      </p>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <ReceiptText className="mx-auto h-12 w-12 text-slate-200" />
                    <p className="mt-3 font-bold text-slate-500">Chưa có giao dịch chuyển khoản được ghi nhận.</p>
                    <p className="mt-1 text-xs text-slate-400">Giao dịch mới sẽ xuất hiện sau khi PayOS xác nhận thanh toán.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-sm font-semibold text-slate-500">
              Hiển thị {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} trong {filtered.length} giao dịch
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                title="Trang trước"
                disabled={page === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-24 text-center text-sm font-bold text-slate-700">Trang {page} / {totalPages}</span>
              <button
                type="button"
                title="Trang sau"
                disabled={page === totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
