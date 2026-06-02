// components/Navbar.js — Navbar con Toggle de Modo Oscuro

// Cambios respecto a la versión anterior:
// - Agregamos un botón 🌙 / ☀️ para cambiar el tema
// - Guardamos la preferencia en localStorage para que
//   se recuerde aunque el usuario cierre el navegador
// - Al cargar la app, leemos localStorage y aplicamos el tema


import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estado del tema: true = oscuro, false = claro
  // Inicializamos leyendo lo que guardamos en localStorage
  // Si no hay nada guardado, usamos el modo claro por defecto
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  
  // useEffect: aplica el tema cada vez que darkMode cambia
  
  useEffect(() => {
    if (darkMode) {
      // Agregamos la clase "dark" al body
      document.body.classList.add('dark');
      // Guardamos la preferencia para la próxima visita
      localStorage.setItem('theme', 'dark');
    } else {
      // Quitamos la clase "dark" del body
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]); // Se ejecuta cada vez que darkMode cambia

  
  // useEffect: al montar la Navbar, aplica el tema guardado
  
  // Esto es importante para que al recargar la página,
  // el tema se aplique ANTES de que el usuario vea nada
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark');
    }
  }, []); // Solo se ejecuta una vez al montar

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev); // Invierte el estado actual
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">🗓️ Registro de Eventos</Link>
      </div>

      <div className="navbar-user">
        {user && (
          <span className="navbar-username">Hola, {user.name}</span>
        )}

        {/* Botón de modo oscuro/claro */}
        <button
          className="btn-theme"
          onClick={toggleDarkMode}
          title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {/* Mostramos el ícono según el modo actual */}
          {darkMode ? '☀️' : '🌙'}
        </button>

        {user && (
          <button className="btn-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;