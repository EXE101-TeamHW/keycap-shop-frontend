import axiosClient from './axiosClient';

export const authApi = {
  login: (data: { email: string; password: string }) => axiosClient.post('/auth/login', data),
  register: (data: { email: string; password: string; fullName?: string }) =>
    axiosClient.post('/auth/register', { ...data, fullName: data.fullName }),
  // Backend: GET /api/auth/me (dùng JWT)
  me: () => axiosClient.get(`/auth/me`),
  verifyEmail: (data: { email: string; code: string }) => axiosClient.post('/auth/verify', data),
  resendVerification: (data: { email: string }) => axiosClient.post('/auth/resend', data),
  logout: () => { localStorage.removeItem('token'); localStorage.removeItem('userId'); localStorage.removeItem('userRole'); },
  oauth2Google: () => { window.location.href = 'http://localhost:8080/oauth2/authorization/google'; },
};


