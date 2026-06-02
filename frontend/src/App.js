// App.js — Enrutador Principal

// Aquí definimos TODAS las rutas de la aplicación.
// React Router lee la URL del navegador y decide qué componente mostrar.
//
// Estructura de rutas:
// /             → redirige al login
// /login        → página de login (pública)
// /register     → página de registro (pública)
// /dashboard    → panel principal (protegida)
// /events/new   → crear evento (protegida)
// /events/edit/:id → editar evento (protegida)

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Importamos todas las páginas
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EventForm from './pages/EventForm';

// Importamos estilos globales
import './styles/index.css';

function App() {
  return (
    // BrowserRouter habilita el enrutamiento en toda la app
    <BrowserRouter>
      {/* AuthProvider envuelve todo para que cualquier componente
          pueda acceder al estado de autenticación */}
      <AuthProvider>
        <Routes>
          {/* Ruta raíz: redirige al login automáticamente */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rutas públicas: accesibles sin autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas protegidas: solo con sesión activa */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/events/new"
            element={
              <ProtectedRoute>
                <EventForm />
              </ProtectedRoute>
            }
          />

          {/* :id es un parámetro dinámico que EventForm lee con useParams() */}
          <Route
            path="/events/edit/:id"
            element={
              <ProtectedRoute>
                <EventForm />
              </ProtectedRoute>
            }
          />

          {/* Cualquier URL desconocida redirige al login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;