// src/app/pages/MyTickets.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ClipboardList, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp,
  Loader2, ArrowLeft, Image as ImageIcon, MessageSquare, ThumbsUp, RotateCcw,
  Eye, Package, MessageCircle,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { TicketChat } from "../../components/TicketChat";

type TicketStatus =
  | "PENDING" | "IN_REVIEW" | "DESIGNING" | "AWAITING_APPROVAL"
  | "APPROVED" | "WAITING_PAYMENT" | "PAID" | "IN_PRODUCTION"
  | "QUALITY_CHECK" | "READY_SHIP" | "SHIPPED" | "DELIVERED"
  | "COMPLETED" | "CANCELLED" | "REJECTED";

interface Mockup {
  id: number;
  version: number;
  fileUrl: string;
  fileType: string;
  description: string;
  status: "DRAFT" | "SENT" | "APPROVED" | "REJECTED";
  createdAt: string;
}

interface Ticket {
  id: number;
  ticketCode: string;
  requestDesignName: string;
  status: TicketStatus;
  deadline: string;
  revisionCount: number;
  maxRevisions: number;
  assignedStaffId?: number;
  customerId?: number;
}

const STATUS_STEPS: TicketStatus[] = [
  "PENDING", "IN_REVIEW", "DESIGNING", "AWAITING_APPROVAL",
  "APPROVED", "IN_PRODUCTION", "SHIPPED", "COMPLETED",
];

const STATUS_LABEL: Record<TicketStatus, string> = {
  PENDING: "Chờ duyệt",
  IN_REVIEW: "Đang xem xét",
  DESIGNING: "Đang thiết kế",
  AWAITING_APPROVAL: "Chờ bạn duyệt ✋",
  APPROVED: "Đã duyệt",
  WAITING_PAYMENT: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  IN_PRODUCTION: "Đang sản xuất",
  QUALITY_CHECK: "Kiểm tra QC",
  READY_SHIP: "Sẵn sàng giao",
  SHIPPED: "Đang giao hàng",
  DELIVERED: "Đã giao",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  REJECTED: "Bị từ chối",
};

const STATUS_COLOR: Partial<Record<TicketStatus, string>> = {
  PENDING: "bg-amber-100 text-amber-700",
  IN_REVIEW: "bg-blue-100 text-blue-700",
  DESIGNING: "bg-purple-100 text-purple-700",
  AWAITING_APPROVAL: "bg-orange-100 text-orange-700 animate-pulse",
  APPROVED: "bg-green-100 text-green-700",
  IN_PRODUCTION: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-cyan-100 text-cyan-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  REJECTED: "bg-red-100 text-red-700",
};

function MockupCard({
  mockup, ticketId, revisionCount, maxRevisions, onFeedback
}: {
  mockup: Mockup;
  ticketId: number;
  revisionCount: number;
  maxRevisions: number;
  onFeedback: () => void;
}) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const canRevise = revisionCount < maxRevisions;

  const sendFeedback = async (type: "APPROVED" | "REVISION" | "COMMENT") => {
    setSubmitting(true);
    try {
      await axiosClient.post(`/tickets/${ticketId}/feedback`, {
        mockupId: mockup.id,
        type,
        comment: comment || (type === "APPROVED" ? "Tôi đồng ý với thiết kế này." : ""),
        annotations: [],
      });
      onFeedback();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gửi phản hồi thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Mockup image */}
      <div
        className="relative bg-gray-100 cursor-zoom-in"
        onClick={() => setLightbox(true)}
      >
        <img
          src={mockup.fileUrl}
          alt={`Mockup v${mockup.version}`}
          className="w-full max-h-80 object-contain"
          onError={(e) => { (e.target as any).src = ""; }}
        />
        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <Eye className="w-3 h-3" /> Phiên bản {mockup.version}
        </div>
        {mockup.status === "APPROVED" && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            ✓ Đã duyệt
          </div>
        )}
      </div>

      {/* Description */}
      {mockup.description && (
        <div className="px-4 py-3 text-sm text-gray-600 bg-gray-50 border-t border-gray-100">
          <span className="font-semibold text-gray-800">Ghi chú của Designer: </span>
          {mockup.description}
        </div>
      )}

      {/* Feedback actions — only for SENT mockups not yet responded */}
      {mockup.status === "SENT" && (
        <div className="p-4 border-t border-gray-100 space-y-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Nhận xét của bạn về thiết kế này... (không bắt buộc)"
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => sendFeedback("APPROVED")}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold text-sm hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-200 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
              Duyệt thiết kế
            </button>
            <button
              onClick={() => sendFeedback("REVISION")}
              disabled={submitting || !canRevise}
              title={!canRevise ? `Đã hết lượt revise (${maxRevisions} lần)` : ""}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-orange-300 text-orange-600 rounded-xl font-semibold text-sm hover:bg-orange-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              Yêu cầu sửa {canRevise ? `(còn ${maxRevisions - revisionCount} lần)` : "(hết lượt)"}
            </button>
          </div>
          <button
            onClick={() => sendFeedback("COMMENT")}
            disabled={submitting || !comment.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            <MessageSquare className="w-4 h-4" />
            Gửi nhận xét
          </button>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <img src={mockup.fileUrl} alt="" className="max-w-full max-h-full object-contain rounded-xl" />
          <button className="absolute top-4 right-4 text-white text-3xl font-bold">×</button>
        </div>
      )}
    </div>
  );
}

function TicketCard({ ticket, onRefresh }: { ticket: Ticket; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [mockups, setMockups] = useState<Mockup[]>([]);
  const [loadingMockups, setLoadingMockups] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const cfg = STATUS_COLOR[ticket.status] || "bg-gray-100 text-gray-700";
  const needsAction = ticket.status === "AWAITING_APPROVAL";

  const loadMockups = async () => {
    if (mockups.length > 0) return;
    setLoadingMockups(true);
    try {
      const res: any = await axiosClient.get(`/tickets/${ticket.id}/mockups`);
      setMockups(Array.isArray(res?.data || res) ? (res?.data || res) : []);
    } catch { /* ignore */ }
    setLoadingMockups(false);
  };

  const toggle = () => {
    if (!expanded) loadMockups();
    setExpanded(!expanded);
  };

  const progressStep = STATUS_STEPS.indexOf(ticket.status as any);

  return (
    <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all ${
      needsAction ? "border-orange-300 shadow-orange-100" : "border-gray-200"
    }`}>
      {/* Header */}
      <div className="p-5">
        {needsAction && (
          <div className="flex items-center gap-2 text-orange-600 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 text-sm font-semibold mb-4">
            <AlertIcon /> Thiết kế đang chờ bạn duyệt! Hãy xem và phản hồi bên dưới.
          </div>
        )}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              needsAction ? "bg-orange-100" : "bg-purple-50"
            }`}>
              <ClipboardList className={`w-5 h-5 ${needsAction ? "text-orange-600" : "text-purple-600"}`} />
            </div>
            <div>
              <div className="font-bold text-gray-900">{ticket.ticketCode}</div>
              <div className="text-sm text-gray-600 font-medium">{ticket.requestDesignName}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Deadline: {ticket.deadline ? new Date(ticket.deadline).toLocaleDateString("vi-VN") : "Chưa xác định"}
                {" · "}Revise: {ticket.revisionCount}/{ticket.maxRevisions}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${cfg}`}>
              {STATUS_LABEL[ticket.status] || ticket.status}
            </span>
            <button
              onClick={toggle}
              className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {progressStep >= 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-1">
              {STATUS_STEPS.map((s, i) => (
                <div
                  key={s}
                  title={STATUS_LABEL[s]}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    i <= progressStep
                      ? "bg-gradient-to-r from-purple-500 to-pink-500"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>Khởi tạo</span>
              <span>Thiết kế</span>
              <span>Sản xuất</span>
              <span>Hoàn tất</span>
            </div>
          </div>
        )}
      </div>

      {/* Mockups */}
      {expanded && (
        <div className="border-t border-gray-100 p-5">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-purple-600" />
            Mockup thiết kế ({mockups.length})
          </h4>
          {loadingMockups ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto" />
            </div>
          ) : mockups.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-200" />
              <p className="text-gray-500 text-sm">Designer chưa upload mockup</p>
              <p className="text-xs text-gray-400 mt-1">Bạn sẽ nhận thông báo khi có mockup mới</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mockups.map((m) => (
                <MockupCard
                  key={m.id}
                  mockup={m}
                  ticketId={ticket.id}
                  revisionCount={ticket.revisionCount}
                  maxRevisions={ticket.maxRevisions}
                  onFeedback={onRefresh}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chat Section */}
      {expanded && (
        <div className="border-t border-gray-100 p-5">
          <button
            onClick={() => setShowChat(!showChat)}
            className="flex items-center gap-2 mb-3 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            {showChat ? "Ẩn chat" : "💬 Chat với Designer"}
          </button>
          {showChat && (
            <TicketChat
              ticketId={ticket.id}
              customerId={Number(localStorage.getItem("userId"))}
              staffId={ticket.assignedStaffId}
              compact
            />
          )}
          {!ticket.assignedStaffId && !showChat && (
            <p className="text-xs text-gray-400">Chưa có designer được phân công. Chat sẽ khả dụng sau khi có staff xử lý ticket.</p>
          )}
        </div>
      )}
    </div>
  );
}

function AlertIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
}

export function MyTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axiosClient.get(`/tickets`)
      .then((res: any) => {
        const raw = res?.data || res || [];
        setTickets(Array.isArray(raw) ? raw : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    fetchTickets();
  }, [navigate]);

  const needsAction = tickets.filter(t => t.status === "AWAITING_APPROVAL");
  const others = tickets.filter(t => t.status !== "AWAITING_APPROVAL");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-4 text-gray-500 hover:text-gray-800 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Trang chủ
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Ticket Custom của tôi</h1>
        <p className="text-gray-500 mt-1">{tickets.length} ticket</p>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-200" />
          <p className="text-gray-500 font-medium text-lg">Bạn chưa có ticket nào</p>
          <p className="text-gray-400 text-sm mb-6">Gửi request custom để bắt đầu!</p>
          <button
            onClick={() => navigate("/custom")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
          >
            Gửi Request Custom
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Action required first */}
          {needsAction.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 text-orange-600 font-semibold">
                <AlertIcon /> Cần hành động ({needsAction.length})
              </div>
              {needsAction.map(t => (
                <TicketCard key={t.id} ticket={t} onRefresh={fetchTickets} />
              ))}
            </div>
          )}

          {/* Others */}
          {others.length > 0 && (
            <div>
              {needsAction.length > 0 && (
                <div className="text-gray-500 font-semibold text-sm mb-3 mt-6">Các ticket khác</div>
              )}
              {others.map(t => (
                <div key={t.id} className="mb-4">
                  <TicketCard ticket={t} onRefresh={fetchTickets} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
