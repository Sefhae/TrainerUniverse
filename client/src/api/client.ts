import axios from 'axios';

export const TOKEN_KEY = 'fitconnect_token';

const api = axios.create({
  baseURL: '/api',
});

// Attach the JWT to every request when the trainer is signed in.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
