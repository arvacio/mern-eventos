// api/axios.js — Configuración central de Axios

// En lugar de escribir la URL completa en cada petición,
// creamos una instancia de Axios con la URL base del backend.
//
// También agregamos "interceptores": funciones que se ejecutan
// automáticamente ANTES de cada petición o DESPUÉS de cada
// respuesta, sin que tengamos que repetir código.

import axios from 'axios';

// Creamos una instancia personalizada de Axios
const api = axios.create({
  // baseURL: todas las peticiones empezarán con esta URL
  // En lugar de escribir 'http://localhost:5000/api/events',
  // solo escribiremos '/events'
  baseURL: 'http://localhost:5000/api',
});


// INTERCEPTOR DE PETICIÓN (Request Interceptor)

// Se ejecuta ANTES de enviar cada petición al backend.
// Su misión: agregar el token JWT al encabezado Authorization
// automáticamente, sin tener que hacerlo en cada llamada.
api.interceptors.request.use(
  (config) => {
    // Buscamos el token guardado en localStorage
    const token = localStorage.getItem('token');

    // Si existe el token, lo agregamos al encabezado
    // El formato que espera el backend es: "Bearer TOKEN"
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Devolvemos la config modificada
  },
  (error) => Promise.reject(error)
);


// INTERCEPTOR DE RESPUESTA (Response Interceptor)

// Se ejecuta DESPUÉS de recibir cada respuesta del backend.
// Su misión: si el backend devuelve un error 401 (no autorizado),
// significa que el token expiró → limpiamos todo y mandamos al login.
api.interceptors.response.use(
  (response) => response, // Si todo está bien, devolvemos la respuesta normal

  (error) => {
    // Si el error es 401 (token inválido o expirado)
    if (error.response?.status === 401) {
      // Limpiamos el token del localStorage
      localStorage.removeItem('token');
      // Redirigimos al login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;