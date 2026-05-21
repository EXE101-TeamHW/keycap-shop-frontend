import { useState, useEffect } from "react";
import { Ticket, Users, CheckCircle, Clock } from "lucide-react";
import { ticketApi } from "../../api/ticketApi";
import { adminApi } from "../../api/adminApi";
import { toast } from "sonner";

export function AdminTicketManagement() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [staffs, setStaffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    Promise.all([
      ticketApi.getAll(),
      adminApi.getUsers()
    ])
      .then(([ticketRes, userRes]: any[]) => {
        setTickets(ticketRes.data || []);
        const allUsers = userRes.data || [];
        setStaffs(allUsers.filter((u: any) => u.role === "STAFF"));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (ticketId: string, staffId: string) => {
    if (!staffId) return; // ignore empty selection
    try {
      const adminIdRaw = localStorage.getItem("userId");
      const adminId = adminIdRaw ? parseInt(adminIdRaw, 10) : 0;
      const parsedStaffId = parseInt(staffId, 10);
      
      console.log("Assigning ticket", ticketId, "to staff", parsedStaffId, "by admin", adminId);
      
      await ticketApi.assignStaff(ticketId, { 
        staffId: parsedStaffId, 
        adminId: adminId 
      });
      toast.success("Đã phân công staff thành công!");
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi phân công");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-purple-600" />
            Phân công Ticket Custom
          </h3>
          <p className="text-sm text-gray-500 mt-1">Quản lý và giao việc cho nhân viên thiết kế</p>
        </div>
      </div>
      
      <div className="p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Mã Ticket</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Tên Design</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Deadline</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Trạng thái</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Người phụ trách (Staff)</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 font-mono font-semibold text-purple-700">{ticket.ticketCode}</td>
                <td className="py-4 px-4 font-medium text-gray-900">{ticket.requestDesignName}</td>
                <td className="py-4 px-4 text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {ticket.deadline || "N/A"}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    ticket.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                    ticket.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <select
                      value={ticket.assignedStaffId || ""}
                      onChange={(e) => handleAssign(ticket.id, e.target.value)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 bg-white focus:ring-2 focus:ring-purple-500 w-48"
                    >
                      <option value="">-- Chưa phân công --</option>
                      {staffs.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.fullName || s.email} (ID: {s.id})
                        </option>
                      ))}
                    </select>
                    {ticket.assignedStaffId && (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tickets.length === 0 && (
          <div className="text-center py-12 text-gray-400">Không có ticket nào.</div>
        )}
      </div>
    </div>
  );
}
