// ============================================================
// context/AuthContext.js — Estado Global de Autenticación
// ============================================================
// React Context nos permite compartir datos entre componentes
// sin tener que pasar props manualmente en cada nivel.
//
// Imagínalo como una "mochila" global: el token, el usuario y
// las funciones de login/logout están disponibles en CUALQUIER
// componente de la app sin necesidad de pasarlos uno a uno.
// ============================================================

import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

// 1. Creamos el contexto (es como crear la "mochila")
const AuthContext = createContext();

// ============================================================
// AuthProvider — el componente que "envuelve" toda la app
// ============================================================
// Todos los componentes dentro de <AuthProvider> tendrán acceso
// al estado de autenticación.
export const AuthProvider = ({ children }) => {
  // Estado del usuario autenticado (null = no hay sesión)
  const [user, setUser] = useState(null);
  // Estado de carga: mientras verificamos el token al inicio
  const [loading, setLoading] = useState(true);

  // ============================================================
  // useEffect: se ejecuta UNA SOLA VEZ al cargar la app
  // ============================================================
  // Verifica si hay un token guardado en localStorage.
  // Esto permite que la sesión persista aunque cierres el navegador.
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          // Verificamos que el token siga siendo válido
          // preguntándole al backend por el perfil del usuario
          const { data } = await api.get('/auth/profile');
          setUser(data); // Guardamos los datos del usuario
        } catch (error) {
          // Si el token expiró o es inválido, lo eliminamos
          localStorage.removeItem('token');
        }
      }

      setLoading(false); // Ya terminamos de verificar
    };

    checkToken();
  }, []); // El [] significa "ejecutar solo una vez al montar"

  // ============================================================
  // Función login
  // ============================================================
  const login = async (email, password) => {
    // Enviamos las credenciales al backend
    const { data } = await api.post('/auth/login', { email, password });

    // Guardamos el token en localStorage (persiste al cerrar el navegador)
    localStorage.setItem('token', data.token);

    // Guardamos los datos del usuario en el estado
    setUser(data);

    return data;
  };

  // ============================================================
  // Función register
  // ============================================================
  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });

    localStorage.setItem('token', data.token);
    setUser(data);

    return data;
  };

  // ============================================================
  // Función logout
  // ============================================================
  const logout = () => {
    // Eliminamos el token del localStorage
    localStorage.removeItem('token');
    // Limpiamos el usuario del estado
    setUser(null);
  };

  // Lo que el contexto comparte con todos los componentes
  const value = {
    user,       // Datos del usuario (null si no está autenticado)
    loading,    // true mientras verificamos el token al inicio
    login,      // Función para iniciar sesión
    register,   // Función para registrarse
    logout,     // Función para cerrar sesión
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Mientras verificamos el token, no mostramos nada */}
      {/* Esto evita el "parpadeo" entre login y dashboard */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

// ============================================================
// Hook personalizado: useAuth
// ============================================================
// En lugar de importar AuthContext y useContext en cada componente,
// creamos este hook que hace ambas cosas de una sola vez.
// Uso: const { user, login, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);