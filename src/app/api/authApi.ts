import axiosClient from './axiosClient';
import { clearAllAiChatStorage } from '../utils/aiChatStorage';

export const authApi = {
  login: (data: { email: string; password: string }) => axiosClient.post('/auth/login', data),
  register: (data: {
    email: string;
    password: string;
    fullName?: string;
    phone?: string;
  }) => axiosClient.post('/auth/register', data),
  // Backend: GET /api/auth/me (dùng JWT)
  me: () => axiosClient.get(`/auth/me`),
  verifyEmail: (data: { email: string; code: string }) => axiosClient.post('/auth/verify', data),
  resendVerification: (data: { email: string }) => axiosClient.post('/auth/resend', data),
  forgotPassword: (email: string) => axiosClient.post('/auth/forgot-password', { email }),
  resetPassword: (data: { email: string; code: string; newPassword: string }) => axiosClient.post('/auth/reset-password', data),
  logout: () => {
    clearAllAiChatStorage();
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    window.dispatchEvent(new Event('auth-logout'));
  },
  oauth2Google: () => {
    const url = "http://localhost:8080/oauth2/authorization/google";
    if (window.top && window.top !== window.self) {
      window.top.location.href = url;
      return;
    }
    window.location.href = url;
  },
};


