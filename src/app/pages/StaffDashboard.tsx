import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { ticketApi } from "../api/ticketApi";
import { uploadApi } from "../api/uploadApi";
import { CheckCircle, Clock, X, Eye, Upload, MessageSquare, Image as ImageIcon } from "lucide-react";

interface Ticket {
  id: string;
  ticketCode: string;
  requestDesignName: string;
  deadline: string;
  status: "PENDING" | "IN_REVIEW" | "DESIGNING" | "AWAITING_APPROVAL" | "APPROVED" | "IN_PRODUCTION" | "COMPLETED";
  revisionCount: number;
}

interface Mockup {
  id: string;
  version: number;
  fileUrl: string;
  status: "DRAFT" | "SENT" | "APPROVED" | "REJECTED";
}

export function StaffDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"tickets">("tickets");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [uploadNote, setUploadNote] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTickets = () => {
    ticketApi.getAll().then((res: any) => {
      if (res && res.data) setTickets(res.data);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "STAFF" && role !== "ADMIN") {
      navigate("/");
    }
  }, [navigate]);

  const updateTicketStatus = (ticketId: string, newStatus: Ticket["status"]) => {
    ticketApi.updateStatus(ticketId, newStatus).then(() => {
      fetchTickets();
    }).catch(console.error);
  };

  const handleUploadMockup = async () => {
    if (!selectedTicket || !fileInputRef.current?.files?.[0]) return;
    
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Vui lòng đăng nhập lại!");
      return;
    }

    try {
      // 1. Upload ảnh lên Cloudinary qua Backend
      const file = fileInputRef.current.files[0];
      const uploadRes: any = await uploadApi.uploadFile(file);
      
      const fileUrl = uploadRes?.data?.url || uploadRes?.url;
      if (!fileUrl) throw new Error("Upload failed, no URL returned");

      // 2. Gửi thông tin Mockup vào Ticket
      await ticketApi.createMockup(selectedTicket.id, {
        createdBy: parseInt(userId),
        fileUrl: fileUrl,
        description: uploadNote,
        fileType: "IMAGE"
      });

      setSelectedTicket(null);
      setUploadNote("");
      fetchTickets();
      alert("Tải lên Mockup thành công!");
    } catch (err) {
      console.error(err);
      alert("Tải ảnh thất bại! Hãy chắc chắn bạn đã điền key Cloudinary trong file application.properties của Backend.");
    }
  };



  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">Staff & Designer Portal</h1>
        <p className="text-gray-600">Quản lý Ticket Custom và thiết kế Mockup</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Tổng Tickets</span>
            <CheckCircle className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{tickets.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Đang thiết kế (DESIGNING)</span>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {tickets.filter(t => t.status === "DESIGNING").length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Chờ duyệt (AWAITING)</span>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {tickets.filter(t => t.status === "AWAITING_APPROVAL").length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex gap-8 px-6">
            <button
              onClick={() => setActiveTab("tickets")}
              className={`py-4 font-semibold border-b-2 transition-colors ${activeTab === "tickets"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              Danh sách Tickets
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "tickets" && (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Mã Ticket</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Tên Design</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Deadline</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Lần sửa (Revise)</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Trạng thái</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-gray-900">{ticket.ticketCode}</td>
                        <td className="py-4 px-4 font-semibold text-purple-700">{ticket.requestDesignName}</td>
                        <td className="py-4 px-4 text-gray-600">{ticket.deadline}</td>
                        <td className="py-4 px-4 text-gray-600">{ticket.revisionCount}/3</td>
                        <td className="py-4 px-4">
                          <select
                            value={ticket.status}
                            onChange={(e) => updateTicketStatus(ticket.id, e.target.value as Ticket["status"])}
                            className="px-3 py-1 rounded-lg text-xs font-semibold border bg-gray-50"
                          >
                            <option value="IN_REVIEW">IN_REVIEW</option>
                            <option value="DESIGNING">DESIGNING</option>
                            <option value="AWAITING_APPROVAL">AWAITING_APPROVAL</option>
                            <option value="IN_PRODUCTION">IN_PRODUCTION</option>
                            <option value="COMPLETED">COMPLETED</option>
                          </select>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="text-gray-600 hover:text-purple-600 transition-colors mr-3"
                            title="Xem & Upload Mockup"
                          >
                            <Upload className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mockup Upload Modal */}
          {selectedTicket && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
              <div className="bg-white rounded-xl max-w-2xl w-full">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">Chi tiết & Upload Mockup</h3>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-bold">Mã Ticket</label>
                      <div className="font-semibold text-gray-900">{selectedTicket.ticketCode}</div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-bold">Design</label>
                      <div className="font-semibold text-gray-900">{selectedTicket.requestDesignName}</div>
                    </div>
                  </div>

                  <div>
                    <label className="font-medium mb-2 block text-gray-700">Tải lên Mockup mới</label>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer bg-gray-50"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input type="file" className="hidden" ref={fileInputRef} accept="image/png, image/jpeg, application/pdf" />
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-1">Nhấp để chọn file ảnh (PNG, JPG) hoặc PDF</p>
                      <p className="text-xs text-gray-400">Dung lượng tối đa 50MB</p>
                    </div>
                  </div>

                  <div>
                    <label className="font-medium mb-2 block text-gray-700">Ghi chú cho khách hàng</label>
                    <textarea
                      value={uploadNote}
                      onChange={(e) => setUploadNote(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all resize-none"
                      rows={3}
                      placeholder="Giải thích về thiết kế, phối màu, profile..."
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleUploadMockup}
                      className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                    >
                      Tải lên và Gửi cho khách
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}