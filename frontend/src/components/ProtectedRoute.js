// components/ProtectedRoute.js — Rutas Protegidas

// Este componente "protege" páginas que solo deben ser
// accesibles cuando el usuario está autenticado.
//
// Cómo funciona:
// - Si hay sesión activa → muestra la página solicitada
// - Si NO hay sesión → redirige automáticamente al /login


import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  // Obtenemos el usuario del contexto global
  const { user } = useAuth();

  // Si no hay usuario autenticado, redirigimos al login
  // <Navigate> es el componente de React Router para redirigir
  // replace={true} evita que el login quede en el historial del navegador
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si hay usuario, mostramos el contenido protegido
  return children;
};

export default ProtectedRoute;