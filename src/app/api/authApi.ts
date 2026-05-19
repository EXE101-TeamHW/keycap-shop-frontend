import axiosClient from './axiosClient';

export const authApi = {
  login: (data: any) => axiosClient.post('/auth/login', data),
  register: (data: any) => axiosClient.post('/auth/register', data),
  me: (userId: string | number) => axiosClient.get(`/auth/me?userId=${userId}`),
  oauth2Google: (code: string) => axiosClient.get(`/oauth2/callback/google?code=${code}`),
};
