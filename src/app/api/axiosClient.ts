import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for attaching token, handling errors, etc.
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Adjust token key if needed
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    // Assuming backend returns { success, message, data }
    if (response.data && response.data.data !== undefined) {
      return response.data; // Return the ApiResponse
    }
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default axiosClient;
