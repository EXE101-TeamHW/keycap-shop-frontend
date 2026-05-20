import { useState, useEffect } from "react";
import { ticketApi } from "../../api/ticketApi";
import { CheckCircle, Clock } from "lucide-react";

export function StaffDashboard() {
  const [tickets, setTickets] = useState<any[]>([]);

  const fetchTickets = () => {
    ticketApi.getAll().then((res: any) => {
      if (res && res.data) setTickets(res.data);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Tổng quan (Staff)</h1>
        <p className="text-gray-600">Thống kê khối lượng công việc hiện tại</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Tổng Tickets</span>
            <CheckCircle className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{tickets.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Đang thiết kế (DESIGNING)</span>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {tickets.filter((t: any) => t.status === "DESIGNING").length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Chờ duyệt (AWAITING)</span>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {tickets.filter((t: any) => t.status === "AWAITING_APPROVAL").length}
          </div>
        </div>
      </div>
    </div>
  );
}
