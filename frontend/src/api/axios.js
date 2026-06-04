// api/axios.js — configuración central de Axios

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://150.136.162.117:5000/api',
});

// agrega el token JWT a cada petición automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// si el token expiró (401), limpiar sesión y redirigir al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
