// App.js — rutas de la aplicación

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EventForm from './pages/EventForm';

import './styles/index.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* contenedor de toasts — aparecen en la esquina superior derecha */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '8px',
              fontSize: '14px',
            },
            error: {
              duration: 5000,
            },
          }}
        />

        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* rutas protegidas */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          }/>
          <Route path="/events/new" element={
            <ProtectedRoute><EventForm /></ProtectedRoute>
          }/>
          <Route path="/events/edit/:id" element={
            <ProtectedRoute><EventForm /></ProtectedRoute>
          }/>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
