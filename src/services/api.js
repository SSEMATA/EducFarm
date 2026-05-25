import axios from 'axios';

// Use environment variable for API URL, fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://web-production-69d231.up.railway.app';

const api = axios.create({ 
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
