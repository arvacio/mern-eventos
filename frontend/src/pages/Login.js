// ============================================================
// pages/Login.js — Página de Inicio de Sesión
// ============================================================
// useState maneja los datos del formulario y los errores.
// useAuth nos da la función login del contexto global.
// useNavigate nos permite redirigir después del login exitoso.
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Login = () => {
  // Estado del formulario: guardamos lo que el usuario escribe
  const [formData, setFormData] = useState({ email: '', password: '' });

  // Estado para mostrar errores al usuario
  const [error, setError] = useState('');

  // Estado de carga: mientras esperamos respuesta del backend
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // ============================================================
  // handleChange — actualiza el estado cuando el usuario escribe
  // ============================================================
  // e.target.name es el atributo "name" del input (email o password)
  // e.target.value es lo que el usuario escribió
  // Los "..." son spread operator: copia los campos anteriores
  // y solo actualiza el campo que cambió
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ============================================================
  // handleSubmit — se ejecuta al enviar el formulario
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    setError('');        // Limpiamos errores anteriores
    setLoading(true);    // Activamos el estado de carga

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard'); // Si el login fue exitoso, vamos al dashboard
    } catch (err) {
      // err.response?.data?.message viene del backend
      // Si no hay ese mensaje, mostramos uno genérico
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false); // Siempre desactivamos el estado de carga
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Iniciar Sesión</h2>
        <p className="auth-subtitle">Bienvenido de nuevo</p>

        {/* Mostramos el error si existe */}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"           // Este "name" lo usa handleChange
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Tu contraseña"
              required
            />
          </div>

          {/* disabled={loading} evita enviar el formulario dos veces */}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="auth-link">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;