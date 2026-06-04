// src/app/api/aiApi.ts
import axiosClient from './axiosClient';
import { AiChatRequest, AiChatResponse } from '../types';

export const aiApi = {
  /** Gửi tin nhắn đến AI chatbot */
  chat(request: AiChatRequest): Promise<{ data: AiChatResponse }> {
    return axiosClient.post('/ai/chat', request);
  }
};
