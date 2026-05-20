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
  createConversation(customerId: number, staffId?: number) {
    return axiosClient.post("/conversations", { customerId, staffId });
  },

  /** Lấy danh sách conversations của user */
  listConversations(userId: number) {
    return axiosClient.get(`/conversations?userId=${userId}`);
  },

  /** Lấy lịch sử tin nhắn */
  getMessages(conversationId: number, userId: number) {
    return axiosClient.get(
      `/conversations/${conversationId}/messages?userId=${userId}`
    );
  },

  /** Đánh dấu đã đọc */
  markRead(conversationId: number, userId: number) {
    return axiosClient.put(`/conversations/${conversationId}/read`, { userId });
  },

  /** Đóng conversation (chỉ staff) */
  closeConversation(conversationId: number, staffId: number) {
    return axiosClient.put(`/conversations/${conversationId}/close`, {
      staffId,
    });
  },

  /** Gửi tin nhắn qua REST (fallback khi WS chưa kết nối) */
  sendMessageREST(
    conversationId: number,
    senderId: number,
    content: string,
    messageType: "TEXT" | "IMAGE" = "TEXT"
  ) {
    return axiosClient.post("/conversations/messages", {
      conversationId,
      senderId,
      content,
      messageType,
    });
  },
};
