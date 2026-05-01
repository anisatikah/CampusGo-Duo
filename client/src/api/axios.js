// client/src/api/axios.js
import axios from 'axios';

// Vite dev server proxies /api -> http://localhost:5000
const api = axios.create({ baseURL: '/api' });

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dpc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Boot 401s back to login
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('dpc_token');
      localStorage.removeItem('dpc_user');
      // Light redirect; AuthContext will catch on next render too.
      if (!location.pathname.startsWith('/login')) {
        location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

export default api;
