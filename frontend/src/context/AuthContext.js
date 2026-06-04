// context/AuthContext.js — estado global de autenticación

import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // al abrir la app, verificar si hay sesión guardada
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await api.get('/auth/profile');
          setUser(data);
        } catch (error) {
          // token inválido o expirado
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkToken();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = { user, loading, login, register, logout };

  return (
    <AuthContext.Provider value={value}>
      {/* no mostrar nada hasta verificar el token */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

// hook para usar el contexto fácilmente en cualquier componente
export const useAuth = () => useContext(AuthContext);
