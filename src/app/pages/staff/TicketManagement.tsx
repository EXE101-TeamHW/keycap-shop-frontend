import { useState, useEffect, useRef } from "react";
import { ticketApi } from "../../api/ticketApi";
import { uploadApi } from "../../api/uploadApi";
import { X, Upload, MessageCircle, Image, Download, Phone, Mail, Info, XCircle, Loader2 } from "lucide-react";
import { TicketChat } from "../../components/TicketChat";
import { Client } from "@stomp/stompjs";
import axiosClient from "../../api/axiosClient";
import { chatApi, type ConversationResponse } from "../../api/chatApi";
import { toast } from "sonner";

interface Ticket {
  id: string;
  ticketCode: string;
  requestDesignName: string;
  deadline: string;
  status: "PENDING" | "IN_REVIEW" | "DESIGNING" | "AWAITING_APPROVAL" | "APPROVED" | "IN_PRODUCTION" | "COMPLETED" | "CANCELLED" | "REJECTED";
  revisionCount: number;
  customerId?: number;
  assignedStaffId?: number;
  referenceImagesJson?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
  customerBankAccount?: string;
  layout?: string;
  theme?: string;
  orderId?: number;
  orderStatus?: string;
  orderPaymentStatus?: string;
}

const TICKET_STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  PENDING:           { label: "Chờ duyệt", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  IN_REVIEW:         { label: "Đang review", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  DESIGNING:         { label: "Đang thiết kế", cls: "bg-purple-50 text-purple-700 border-purple-200" },
  AWAITING_APPROVAL: { label: "Chờ KH duyệt", cls: "bg-orange-50 text-orange-700 border-orange-200" },
  APPROVED:          { label: "KH đã duyệt ✓", cls: "bg-green-50 text-green-700 border-green-200" },
  IN_PRODUCTION:     { label: "Đang sản xuất", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  COMPLETED:         { label: "Hoàn tất ✓", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELLED:         { label: "Đã hủy ✗", cls: "bg-red-50 text-red-700 border-red-200" },
  REJECTED:          { label: "Đã từ chối", cls: "bg-red-50 text-red-700 border-red-200" },
};

export function TicketManagement() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [uploadNote, setUploadNote] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedMockupFile, setSelectedMockupFile] = useState<File | null>(null);
  const [mockupPreviewUrl, setMockupPreviewUrl] = useState("");
  const [uploadingMockup, setUploadingMockup] = useState(false);
  const [chatTicket, setChatTicket] = useState<Ticket | null>(null);
  const [viewingImages, setViewingImages] = useState<string[] | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [unreadByParticipant, setUnreadByParticipant] = useState<Record<string, number>>({});

  const conversationKey = (customerId?: number, staffId?: number) => (
    customerId && staffId ? `${customerId}:${staffId}` : ""
  );

  const handleCancelTicket = async (orderId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy yêu cầu thiết kế này? Đơn hàng và ticket sẽ bị hủy, tiền cọc sẽ chuyển sang danh sách hoàn tiền.")) return;
    setCancelling(true);
    try {
      await axiosClient.put(`/orders/${orderId}/cancel`);
      toast.success("Đã hủy và yêu cầu hoàn tiền thành công!");
      setSelectedTicket(null);
      fetchTickets();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể hủy lúc này.");
    } finally {
      setCancelling(false);
    }
  };

  const fetchTickets = () => {
    ticketApi.getAll().then((res: any) => {
      if (res && res.data) setTickets(res.data);
    }).catch(console.error);
  };

  const fetchUnreadCounts = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    chatApi.listConversations()
      .then((res: any) => {
        const conversations: ConversationResponse[] = res?.data || res || [];
        const unreadMap: Record<string, number> = {};
        conversations.forEach((conversation) => {
          const key = conversationKey(conversation.customerId, conversation.staffId || undefined);
          if (!key || conversation.status !== "OPEN") return;
          unreadMap[key] = (unreadMap[key] || 0) + (conversation.unreadCount || 0);
        });
        setUnreadByParticipant(unreadMap);
      })
      .catch(() => {});
  };

  const handleMockupFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (mockupPreviewUrl) URL.revokeObjectURL(mockupPreviewUrl);
    setSelectedMockupFile(file);
    setMockupPreviewUrl(file && file.type.startsWith("image/") ? URL.createObjectURL(file) : "");
  };

  const clearMockupFile = () => {
    if (mockupPreviewUrl) URL.revokeObjectURL(mockupPreviewUrl);
    setSelectedMockupFile(null);
    setMockupPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openChat = (ticket: Ticket) => {
    const key = conversationKey(ticket.customerId, Number(localStorage.getItem("userId")));
    if (key) {
      setUnreadByParticipant((prev) => ({ ...prev, [key]: 0 }));
    }
    setChatTicket(ticket);
    window.setTimeout(fetchUnreadCounts, 700);
  };

  const unreadForTicket = (ticket: Ticket) => {
    const key = conversationKey(ticket.customerId, ticket.assignedStaffId);
    return key ? unreadByParticipant[key] || 0 : 0;
  };

  useEffect(() => {
    fetchTickets();
    fetchUnreadCounts();
    const unreadTimer = window.setInterval(fetchUnreadCounts, 15000);

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
        client.subscribe("/topic/tickets", (frame) => {
          try {
            const updatedTicket = JSON.parse(frame.body);
            const currentUserId = Number(localStorage.getItem("userId"));
            if (updatedTicket && (updatedTicket.assignedStaffId === currentUserId || !updatedTicket.assignedStaffId)) {
              fetchTickets();
              fetchUnreadCounts();
            }
          } catch {
            fetchTickets();
            fetchUnreadCounts();
          }
        });
      };

      client.activate();
      return () => {
        window.clearInterval(unreadTimer);
        client.deactivate();
      };
    }

    return () => {
      window.clearInterval(unreadTimer);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (mockupPreviewUrl) URL.revokeObjectURL(mockupPreviewUrl);
    };
  }, [mockupPreviewUrl]);

  const updateTicketStatus = (ticketId: string, newStatus: Ticket["status"]) => {
    ticketApi.updateStatus(ticketId, newStatus).then(() => {
      fetchTickets();
    }).catch(console.error);
  };

  const handleUploadMockup = async () => {
    if (!selectedTicket) return;
    if (!selectedMockupFile) {
      toast.error("Vui lòng chọn file mockup trước khi tải lên.");
      return;
    }
    
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("Vui lòng đăng nhập lại!");
      return;
    }

    setUploadingMockup(true);
    try {
      const file = selectedMockupFile;
      const uploadRes: any = await uploadApi.uploadFile(file);
      
      const fileUrl = uploadRes?.data?.url || uploadRes?.url;
      if (!fileUrl) throw new Error("Upload failed, no URL returned");

      await ticketApi.createMockup(selectedTicket.id, {
        createdBy: parseInt(userId),
        fileUrl: fileUrl,
        description: uploadNote,
        fileType: file.type.includes("pdf") ? "PDF" : "IMAGE"
      });

      setSelectedTicket(null);
      setUploadNote("");
      clearMockupFile();
      fetchTickets();
      toast.success("Tải lên Mockup thành công!");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Tải ảnh thất bại. Vui lòng kiểm tra cấu hình Cloudinary hoặc thử lại.");
    } finally {
      setUploadingMockup(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Danh sách Tickets</h3>
      </div>

      <div className="p-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Mã Ticket</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Khách hàng</th>
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
                <td className="py-4 px-4 font-mono font-medium text-gray-900">{ticket.ticketCode}</td>
                <td className="py-3 px-4 text-gray-600 text-xs">
                  <div className="font-semibold text-gray-900">{ticket.customerName || "Customer"}</div>
                  <div className="flex items-center gap-1 mt-1"><Phone className="w-3 h-3 text-gray-400" /> {ticket.customerPhone || "N/A"}</div>
                  <div className="flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" /> {ticket.customerEmail || "N/A"}</div>
                  {ticket.customerBankAccount && (
                    <div className="flex items-center gap-1 mt-1 text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 max-w-max">
                      STK: {ticket.customerBankAccount}
                    </div>
                  )}
                </td>
                <td className="py-4 px-4 font-semibold text-purple-700">
                  {ticket.requestDesignName}
                  {ticket.referenceImagesJson && (
                    <button
                      onClick={() => {
                        try {
                          const images = JSON.parse(ticket.referenceImagesJson!);
                          setViewingImages(Array.isArray(images) ? images : [images]);
                        } catch {
                          setViewingImages([ticket.referenceImagesJson!]);
                        }
                      }}
                      className="mt-2 text-[10px] flex items-center gap-1 text-pink-600 hover:text-pink-700 font-semibold"
                    >
                      <Image className="w-3 h-3" /> Xem File Material
                    </button>
                  )}
                </td>
                <td className="py-4 px-4 text-gray-600">{ticket.deadline ? new Date(ticket.deadline).toLocaleDateString("vi-VN") : "Chưa có"}</td>
                <td className="py-4 px-4 text-gray-600">{ticket.revisionCount}/3</td>
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-1.5 items-start">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${
                      TICKET_STATUS_LABEL[ticket.status]?.cls || "bg-gray-50 text-gray-600 border-gray-200"
                    }`}>
                      {TICKET_STATUS_LABEL[ticket.status]?.label || ticket.status}
                    </span>
                    
                    {/* Action buttons based on status */}
                    {ticket.status === "IN_REVIEW" && (
                      <button
                        onClick={() => updateTicketStatus(ticket.id, "DESIGNING")}
                        className="px-2.5 py-1 bg-purple-600 text-white rounded text-[11px] font-bold hover:bg-purple-700 transition"
                      >
                        Bắt đầu thiết kế
                      </button>
                    )}
                    {ticket.status === "DESIGNING" && (
                      <span className="text-[10px] text-gray-400 font-medium">
                        Upload mockup (📤) để gửi duyệt
                      </span>
                    )}
                    {ticket.status === "AWAITING_APPROVAL" && (
                      <span className="text-[10px] text-amber-600 font-medium font-semibold">
                        Đang chờ khách duyệt...
                      </span>
                    )}
                    {ticket.status === "APPROVED" && (
                      <button
                        onClick={() => updateTicketStatus(ticket.id, "IN_PRODUCTION")}
                        className="px-2.5 py-1 bg-indigo-600 text-white rounded text-[11px] font-bold hover:bg-indigo-700 transition"
                      >
                        Bắt đầu sản xuất
                      </button>
                    )}
                    {ticket.status === "IN_PRODUCTION" && (
                      <button
                        onClick={() => updateTicketStatus(ticket.id, "COMPLETED")}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold hover:bg-emerald-700 transition"
                      >
                        Hoàn thành thiết kế
                      </button>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="text-purple-600 hover:text-purple-700 transition-colors mr-3 flex items-center gap-1 border border-purple-200 px-2 py-1 rounded bg-purple-50 text-xs font-semibold"
                    title="Xem chi tiết & Mockup"
                  >
                    <Info className="w-3.5 h-3.5" /> Chi tiết
                  </button>
                  {ticket.assignedStaffId && (
                    <button
                      onClick={() => openChat(ticket)}
                      className="relative text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 border border-blue-200 px-2 py-1 rounded bg-blue-50 text-xs font-semibold mt-1"
                      title="Chat với khách hàng"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Chat
                      {unreadForTicket(ticket) > 0 && (
                        <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-5 text-center shadow-sm ring-2 ring-white">
                          {unreadForTicket(ticket) > 9 ? "9+" : unreadForTicket(ticket)}
                        </span>
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tickets.length === 0 && (
          <div className="text-center py-12 text-gray-400">Không có ticket nào.</div>
        )}
      </div>

      {/* Mockup Upload Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] md:max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h3 className="text-2xl font-bold text-gray-900">Chi tiết & Upload Mockup</h3>
              <button onClick={() => { setSelectedTicket(null); clearMockupFile(); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold">Mã Ticket</label>
                  <div className="font-semibold text-gray-900">{selectedTicket.ticketCode}</div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-bold">Design</label>
                  <div className="font-semibold text-gray-900">{selectedTicket.requestDesignName}</div>
                </div>
                {selectedTicket.layout && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-bold">Layout</label>
                    <div className="font-semibold text-gray-900">{selectedTicket.layout}</div>
                  </div>
                )}
                {selectedTicket.theme && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-bold">Theme</label>
                    <div className="font-semibold text-gray-900">{selectedTicket.theme}</div>
                  </div>
                )}
                {selectedTicket.customerBankAccount && (
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 uppercase font-bold">STK Hoàn Tiền</label>
                    <div className="font-mono font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-100 max-w-max mt-1">
                      {selectedTicket.customerBankAccount}
                    </div>
                  </div>
                )}
                {selectedTicket.notes && (
                  <div className="col-span-2 border-t border-gray-200 pt-3 mt-1">
                    <label className="text-xs text-gray-500 uppercase font-bold">Thông tin chi tiết yêu cầu & Địa chỉ</label>
                    <div className="text-xs text-gray-700 bg-white p-3 rounded-lg border border-gray-200 whitespace-pre-line mt-1 max-h-48 overflow-y-auto font-mono leading-relaxed">
                      {selectedTicket.notes}
                    </div>
                  </div>
                )}
              </div>

              {["IN_REVIEW", "DESIGNING"].includes(selectedTicket.status) ? (
                <>
                  <div>
                    <label className="font-medium mb-2 block text-gray-700">Tải lên Mockup mới *</label>
                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer bg-gray-50">
                      <input type="file" className="hidden" ref={fileInputRef} accept="image/png,image/jpeg,application/pdf" onChange={handleMockupFileChange} />
                      {selectedMockupFile ? (
                        <div className="space-y-3">
                          {mockupPreviewUrl ? (
                            <img src={mockupPreviewUrl} alt={selectedMockupFile.name} className="mx-auto h-48 w-full max-w-sm rounded-xl object-cover border border-gray-200 shadow-sm" />
                          ) : (
                            <div className="mx-auto h-40 w-full max-w-sm rounded-xl border border-gray-200 bg-white flex items-center justify-center">
                              <FileText className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                          <div className="text-sm font-semibold text-gray-700 truncate">{selectedMockupFile.name}</div>
                          <p className="text-xs text-purple-600">Nhấp để đổi file khác</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 mb-1">Nhấp để chọn file ảnh (PNG, JPG) hoặc PDF</p>
                          <p className="text-xs text-gray-400">Dung lượng tối đa 50MB</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="font-medium mb-2 block text-gray-700">Ghi chú cho khách hàng</label>
                    <textarea
                      value={uploadNote} onChange={(e) => setUploadNote(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all resize-none"
                      rows={3} placeholder="Giải thích về thiết kế, phối màu, profile..."
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleUploadMockup} disabled={uploadingMockup || !selectedMockupFile} className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {uploadingMockup && <Loader2 className="w-4 h-4 animate-spin" />}
                      {uploadingMockup ? "Đang tải lên..." : "Tải lên và Gửi cho khách"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 text-center font-medium">
                  ℹ️ Trạng thái hiện tại ({TICKET_STATUS_LABEL[selectedTicket.status]?.label || selectedTicket.status}) không hỗ trợ tải lên Mockup mới.
                </div>
              )}

              {/* Staff Cancel / Refund Action */}
              {selectedTicket.orderId && selectedTicket.status !== "CANCELLED" && selectedTicket.status !== "COMPLETED" && selectedTicket.orderStatus !== "CANCELLED" && (
                <div className="border-t border-red-100 pt-5 mt-4">
                  <label className="font-semibold block text-red-800 text-xs mb-2 uppercase">Khu vực khẩn cấp (Staff/Admin)</label>
                  <button
                    onClick={() => handleCancelTicket(selectedTicket.orderId!)}
                    disabled={cancelling}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-3 rounded-lg font-bold transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Hủy & Hoàn tiền cọc
                  </button>
                  <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
                    * Hành động này sẽ hủy bỏ Ticket Custom này và đơn hàng cọc tương ứng. Số tiền cọc khách đã thanh toán sẽ tự động được đưa vào danh sách chờ hoàn trả của Admin.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {chatTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl max-w-xl w-full max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                  Chat - {chatTicket.ticketCode}
                </h3>
                <p className="text-sm text-gray-500">{chatTicket.requestDesignName}</p>
              </div>
              <button onClick={() => setChatTicket(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <TicketChat
                ticketId={Number(chatTicket.id)}
                orderId={chatTicket.orderId}
                customerId={chatTicket.customerId || 0}
                staffId={chatTicket.assignedStaffId}
              />
            </div>
          </div>
        </div>
      )}

      {/* View Material Modal */}
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
