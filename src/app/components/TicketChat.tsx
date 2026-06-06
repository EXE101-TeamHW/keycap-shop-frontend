// src/app/components/TicketChat.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import {
  Send,
  Loader2,
  MessageCircle,
  Image as ImageIcon,
  X,
  ChevronDown,
} from "lucide-react";
import { chatApi, type MessageResponse, type ConversationResponse } from "../api/chatApi";
import { uploadApi } from "../api/uploadApi";

interface TicketChatProps {
  /** Ticket ID (dùng để tìm/tạo conversation) */
  ticketId?: number | null;
  orderId?: number | null;
  conversationId?: number | null;
  /** Customer userId */
  customerId: number;
  /** Staff userId (assigned) */
  staffId?: number | null;
  /** Compact mode (nhỏ gọn hơn) */
  compact?: boolean;
}

export function TicketChat({ ticketId, orderId, conversationId, customerId, staffId, compact }: TicketChatProps) {
  const currentUserId = Number(localStorage.getItem("userId"));
  const currentRole = localStorage.getItem("userRole");
  const token = localStorage.getItem("token");

  const [conversation, setConversation] = useState<ConversationResponse | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<Client | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ──────────── Find / Create conversation ────────────
  const initConversation = useCallback(async () => {
    try {
      if (!customerId) return;
      // Lấy danh sách conversations của current user
      const listRes: any = await chatApi.listConversations(currentUserId);
      const convos: ConversationResponse[] = listRes?.data || listRes || [];
      const targetOrderId = orderId || undefined;
      const targetTicketId = ticketId || undefined;

      console.log("=== CHAT DEBUG: initConversation ===", {
        currentUserId,
        currentRole,
        customerId,
        staffId,
        targetTicketId,
        targetOrderId,
        conversationId,
        convos
      });

      // Tìm conversation đã tồn tại
      let found = conversationId
        ? convos.find((c) => c.id === conversationId)
        : undefined;

      if (!found && targetTicketId) {
        found = convos.find(
          (c) =>
            c.ticketId != null &&
            Number(c.ticketId) === Number(targetTicketId) &&
            c.status === "OPEN"
        );
        console.log("Search by targetTicketId result:", found);
      }

      if (!found && targetOrderId) {
        found = convos.find(
          (c) =>
            c.orderId != null &&
            Number(c.orderId) === Number(targetOrderId) &&
            c.status === "OPEN"
        );
        console.log("Search by targetOrderId result:", found);
      }

      // Chỉ sử dụng fallback tìm kiếm theo customer & staff nếu cả ticketId và orderId đều không có
      if (!found && !targetTicketId && !targetOrderId) {
        found = convos.find(
          (c) =>
            c.customerId === customerId &&
            (staffId ? Number(c.staffId) === Number(staffId) || c.staffId == null : true) &&
            c.status === "OPEN"
        );
        console.log("Search by fallback result:", found);
      }

      if (!found && (currentRole === "CUSTOMER" || (currentRole === "STAFF" && (targetOrderId || targetTicketId)))) {
        // Tạo mới
        console.log("Creating new conversation with request:", { customerId, staffId, targetOrderId, targetTicketId });
        const createRes: any = await chatApi.createConversation(
          customerId,
          staffId || undefined,
          targetOrderId || undefined,
          targetTicketId || undefined
        );
        found = createRes?.data || createRes;
        console.log("Successfully created new conversation:", found);
      }

      if (found) {
        console.log("Setting active conversation:", found);
        setConversation(found);
        // Load messages
        const msgRes: any = await chatApi.getMessages(found.id, currentUserId);
        const msgs = msgRes?.data || msgRes || [];
        console.log("Loaded message history:", msgs);
        setMessages(msgs);
        // Mark as read
        chatApi.markRead(found.id, currentUserId).catch(() => {});
      } else {
        console.log("Warning: No active conversation resolved.");
      }
    } catch (err) {
      console.error("Chat init failed:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, currentRole, customerId, staffId, orderId, ticketId, conversationId]);

  useEffect(() => {
    initConversation();
  }, [initConversation]);

  // ──────────── WebSocket STOMP ────────────
  useEffect(() => {
    if (!conversation || !token) return;

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
      debug: () => {}, // silence
    });

    client.onConnect = () => {
      client.subscribe(`/topic/chat/${conversation.id}`, (frame) => {
        try {
          const msg: MessageResponse = JSON.parse(frame.body);
          setMessages((prev) => {
            // De-duplicate
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          // Auto mark read if it's from the other person
          if (msg.senderId !== currentUserId) {
            chatApi.markRead(conversation.id, currentUserId).catch(() => {});
          }
        } catch {}
      });
    };

    client.onStompError = () => {};
    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
      stompClientRef.current = null;
    };
  }, [conversation, token, currentUserId]);

  // ──────────── Auto scroll ────────────
  const scrollMessagesToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior,
    });
  }, []);

  useEffect(() => {
    if (!showScrollBtn) {
      window.requestAnimationFrame(() => scrollMessagesToBottom("auto"));
    }
  }, [messages, showScrollBtn, scrollMessagesToBottom]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setShowScrollBtn(!atBottom);
  };

  const scrollToBottom = () => {
    scrollMessagesToBottom("smooth");
    setShowScrollBtn(false);
  };

  // ──────────── Send message ────────────
  const sendMessage = async (content: string, type: "TEXT" | "IMAGE" = "TEXT") => {
    if (!conversation || !content.trim()) return;
    setSending(true);
    try {
      const client = stompClientRef.current;
      if (client?.connected) {
        client.publish({
          destination: "/app/chat",
          body: JSON.stringify({
            conversationId: conversation.id,
            senderId: currentUserId,
            content: content.trim(),
            messageType: type,
          }),
        });
      } else {
        // Fallback: REST
        await chatApi.sendMessageREST(
          conversation.id,
          currentUserId,
          content.trim(),
          type
        );
        // Reload messages
        const msgRes: any = await chatApi.getMessages(conversation.id, currentUserId);
        setMessages(msgRes?.data || msgRes || []);
      }
      if (type === "TEXT") setInput("");
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // ──────────── Image upload ────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res: any = await uploadApi.uploadFile(file);
      const fileUrl = res?.data?.url || res?.url || res?.data;
      if (fileUrl && typeof fileUrl === "string") {
        await sendMessage(fileUrl, "IMAGE");
      } else {
        alert("Upload ảnh thất bại - không nhận được URL.");
      }
    } catch {
      alert("Upload ảnh thất bại.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ──────────── Helpers ────────────
  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  // Group messages by date
  const groupedMessages: { date: string; msgs: MessageResponse[] }[] = [];
  messages.forEach((msg) => {
    const date = formatDate(msg.createdAt);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === date) {
      last.msgs.push(msg);
    } else {
      groupedMessages.push({ date, msgs: [msg] });
    }
  });

  // ──────────── Render ────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-gray-900" />
        <span className="ml-2 text-sm text-gray-500">Đang tải chat...</span>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="text-center py-6 text-gray-400 text-sm">
        Không thể khởi tạo cuộc trò chuyện.
      </div>
    );
  }

  const maxH = compact ? "max-h-[350px]" : "max-h-[450px]";

  return (
    <div className="flex flex-col bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-950 rounded-full flex items-center justify-center shadow-sm">
          <MessageCircle className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 text-sm truncate">
            {currentRole === "CUSTOMER"
              ? conversation.staffName
                ? `Chat với ${conversation.staffName}`
                : "Chat với Designer"
              : `Chat với ${conversation.customerName || "Khách hàng"}`}
          </div>
          <div className="text-xs text-gray-400">
            {conversation.status === "OPEN" ? (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                Đang hoạt động
              </span>
            ) : (
              "Đã đóng"
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto px-4 py-3 space-y-1 ${maxH} relative`}
        style={{ minHeight: 200 }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-gray-400">
            <MessageCircle className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">Chưa có tin nhắn nào</p>
            <p className="text-xs mt-1">Hãy gửi tin nhắn đầu tiên!</p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date divider */}
              <div className="flex items-center justify-center my-3">
                <span className="bg-gray-200 text-gray-500 text-[10px] font-semibold px-3 py-1 rounded-full">
                  {group.date}
                </span>
              </div>
              {group.msgs.map((msg, idx) => {
                const isMe = msg.senderId === currentUserId;
                const isImage = msg.messageType === "IMAGE";
                // Check if same sender as previous
                const prev = idx > 0 ? group.msgs[idx - 1] : null;
                const sameSender = prev && prev.senderId === msg.senderId;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"} ${
                      sameSender ? "mt-0.5" : "mt-3"
                    }`}
                  >
                    <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                      {/* Sender name (only for first in a cluster) */}
                      {!sameSender && !isMe && (
                        <span className="text-[10px] text-gray-400 font-semibold mb-0.5 ml-1">
                          {msg.senderName}
                        </span>
                      )}
                      <div
                        className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                          isMe
                            ? "bg-gray-950 text-white rounded-br-md"
                            : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                        }`}
                      >
                        {isImage ? (
                          <img
                            src={msg.content}
                            alt="Ảnh"
                            className="max-w-full max-h-48 rounded-lg cursor-pointer"
                            onClick={() => window.open(msg.content, "_blank")}
                          />
                        ) : (
                          <span className="whitespace-pre-wrap break-words">{msg.content}</span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] mt-0.5 ${
                          isMe ? "text-gray-400 mr-1 text-right" : "text-gray-300 ml-1"
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                        {isMe && msg.isRead && " ✓"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button
            onClick={scrollToBottom}
            className="sticky bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all z-10"
          >
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* Input Area */}
      {conversation.status === "OPEN" ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white border-t border-gray-100 px-3 py-2.5 flex items-end gap-2"
        >
          {/* Image upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-9 h-9 flex-shrink-0 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
            title="Gửi ảnh"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            ) : (
              <ImageIcon className="w-4 h-4 text-gray-500" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />

          {/* Text input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all pr-10"
              disabled={sending}
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="w-9 h-9 flex-shrink-0 bg-gray-950 hover:bg-black text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      ) : (
        <div className="bg-gray-100 border-t border-gray-200 px-4 py-3 text-center text-sm text-gray-500">
          Cuộc trò chuyện đã đóng
        </div>
      )}
    </div>
  );
}
