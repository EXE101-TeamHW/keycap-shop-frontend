// src/app/api/chatApi.ts
import axiosClient from "./axiosClient";

export interface ConversationResponse {
  id: number;
  customerId: number;
  customerName: string;
  staffId: number | null;
  staffName: string | null;
  status: "OPEN" | "CLOSED";
  unreadCount: number;
  createdAt: string;
}

export interface MessageResponse {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  content: string;
  messageType: "TEXT" | "IMAGE";
  isRead: boolean;
  createdAt: string;
}

export const chatApi = {
  /** Tạo conversation mới */
  createConversation(customerId?: number, staffId?: number) {
    return axiosClient.post("/conversations", { staffId });
  },

  /** Lấy danh sách conversations của user */
  listConversations(userId?: number) {
    return axiosClient.get(`/conversations`);
  },

  /** Lấy lịch sử tin nhắn */
  getMessages(conversationId: number, userId?: number) {
    return axiosClient.get(`/conversations/${conversationId}/messages`);
  },

  /** Đánh dấu đã đọc */
  markRead(conversationId: number, userId?: number) {
    return axiosClient.put(`/conversations/${conversationId}/read`, {});
  },

  /** Đóng conversation (chỉ staff) */
  closeConversation(conversationId: number, staffId?: number) {
    return axiosClient.put(`/conversations/${conversationId}/close`, {});
  },

  /** Gửi tin nhắn qua REST (fallback khi WS chưa kết nối) */
  sendMessageREST(
    conversationId: number,
    senderId: number, // Bỏ cũng được, BE tự lấy qua token
    content: string,
    messageType: "TEXT" | "IMAGE" = "TEXT"
  ) {
    return axiosClient.post("/conversations/messages", {
      conversationId,
      content,
      messageType,
    });
  },
};
