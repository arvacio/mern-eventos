// ============================================================
// pages/Dashboard.js — Panel Principal
// ============================================================
// Esta es la página principal después del login.
// Muestra todos los eventos del usuario y permite:
// - Ver la lista de eventos
// - Navegar a crear un nuevo evento
// - Editar o eliminar cada evento
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import '../styles/Dashboard.css';

const Dashboard = () => {
  // Lista de eventos obtenidos del backend
  const [events, setEvents] = useState([]);

  // Estado de carga mientras esperamos la respuesta
  const [loading, setLoading] = useState(true);

  // Estado de error si algo sale mal
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // ============================================================
  // useEffect: carga los eventos al abrir la página
  // ============================================================
  useEffect(() => {
    fetchEvents();
  }, []); // [] = solo se ejecuta una vez al montar el componente

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // GET /api/events — el interceptor de Axios agrega el token automáticamente
      const { data } = await api.get('/events');
      setEvents(data);
    } catch (err) {
      setError('Error al cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // handleDelete — elimina un evento con confirmación
  // ============================================================
  const handleDelete = async (id) => {
    // window.confirm muestra un diálogo de confirmación nativo del navegador
    if (!window.confirm('¿Estás seguro de eliminar este evento?')) return;

    try {
      await api.delete(`/events/${id}`);
      // Actualizamos la lista filtrando el evento eliminado
      // (más rápido que volver a pedir toda la lista al backend)
      setEvents(events.filter((event) => event._id !== id));
    } catch (err) {
      setError('Error al eliminar el evento');
    }
  };

  // ============================================================
  // Función auxiliar: formatea la fecha para mostrarla
  // ============================================================
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-MX', options);
  };

  return (
    <div className="page">
      <Navbar />

      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Mis Eventos</h1>
          {/* Botón para ir a la página de crear evento */}
          <Link to="/events/new" className="btn-primary">
            + Nuevo Evento
          </Link>
        </div>

        {/* Mientras carga, mostramos un mensaje */}
        {loading && <p className="loading-text">Cargando eventos...</p>}

        {/* Si hay error, lo mostramos */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Si no hay eventos, mostramos un mensaje amigable */}
        {!loading && events.length === 0 && (
          <div className="empty-state">
            <p>🗓️ No tienes eventos aún.</p>
            <Link to="/events/new" className="btn-primary">
              Crear mi primer evento
            </Link>
          </div>
        )}

        {/* Lista de eventos */}
        <div className="events-grid">
          {events.map((event) => (
            <div key={event._id} className="event-card">

              {/* Si el evento tiene imagen, la mostramos */}
              {event.image && (
                <img
                  src={`http://localhost:5000/uploads/${event.image}`}
                  alt={event.name}
                  className="event-image"
                />
              )}

              <div className="event-body">
                <h3 className="event-name">{event.name}</h3>
                <p className="event-date">📅 {formatDate(event.date)}</p>
                <p className="event-location">📍 {event.location}</p>

                {event.description && (
                  <p className="event-description">{event.description}</p>
                )}
              </div>

              <div className="event-actions">
                {/* Botón editar: navega a la página de edición con el ID */}
                <button
                  className="btn-secondary"
                  onClick={() => navigate(`/events/edit/${event._id}`)}
                >
                  Editar
                </button>

                {/* Botón eliminar */}
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(event._id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;