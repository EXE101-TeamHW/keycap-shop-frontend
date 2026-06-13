import axios from 'axios';
import { clearAllAiChatStorage } from '../utils/aiChatStorage';
import { API_BASE_URL } from './backendConfig';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    // Backend returns { code, message, data } → unwrap to return { data: ... }
    if (response.data && response.data.data !== undefined) {
      return response.data;
    }
    return response.data;
  },
  (error) => {
    // 401 = token expired / invalid → logout
    if (error.response?.status === 401) {
      clearAllAiChatStorage();
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      window.dispatchEvent(new Event('auth-logout'));
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;

