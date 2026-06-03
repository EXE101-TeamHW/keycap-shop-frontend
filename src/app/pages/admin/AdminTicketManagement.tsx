import { useState, useEffect } from "react";
import { Ticket, Users, CheckCircle, Clock, Image, X, Download } from "lucide-react";
import { ticketApi } from "../../api/ticketApi";
import { adminApi } from "../../api/adminApi";
import { toast } from "sonner";
import { Client } from "@stomp/stompjs";

export function AdminTicketManagement() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [staffs, setStaffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingImages, setViewingImages] = useState<string[] | null>(null);

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

    const token = localStorage.getItem("token");
    if (token) {
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${wsProtocol}//${window.location.host}/ws`;
      const client = new Client({
        brokerURL: wsUrl,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        debug: () => {},
      });

      client.onConnect = () => {
        client.subscribe("/topic/tickets", () => {
          fetchData();
        });
      };

      client.activate();
      return () => {
        client.deactivate();
      };
    }
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
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Khách hàng</th>
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
                <td className="py-3 px-4 text-gray-600 text-xs">
                  <div className="font-semibold text-gray-900">{ticket.customerName || "Customer"}</div>
                  <div>{ticket.customerPhone || ""}</div>
                  <div>{ticket.customerEmail || ""}</div>
                </td>
                <td className="py-4 px-4 font-medium text-gray-900">{ticket.requestDesignName}</td>
                <td className="py-4 px-4 text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {ticket.deadline ? new Date(ticket.deadline).toLocaleDateString("vi-VN") : "N/A"}
                  </div>
                  {ticket.referenceImagesJson && (
                    <button
                      onClick={() => {
                        try {
                          const images = JSON.parse(ticket.referenceImagesJson);
                          setViewingImages(Array.isArray(images) ? images : [images]);
                        } catch {
                          setViewingImages([ticket.referenceImagesJson]);
                        }
                      }}
                      className="mt-2 text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 font-semibold"
                    >
                      <Image className="w-3 h-3" /> Xem File Material
                    </button>
                  )}
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

      {viewingImages && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setViewingImages(null)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Image className="w-5 h-5 text-purple-600" />
                File Material từ Khách hàng
              </h3>
              <button onClick={() => setViewingImages(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-4">
              {viewingImages.map((img, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square">
                  <img src={img} alt="Material" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a href={img} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-full text-gray-900 hover:scale-110 transition-transform">
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              ))}
              {viewingImages.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Không có file nào được đính kèm.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
