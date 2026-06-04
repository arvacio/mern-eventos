// pages/Dashboard.js — panel principal con lista de eventos

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

// mensajes de error según el código HTTP
const ERROR_MESSAGES = {
  400: 'Solicitud inválida. Verifica los filtros ingresados.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'El recurso no fue encontrado.',
};

const getErrorMessage = (err, fallback) => {
  const status = err.response?.status;
  return err.response?.data?.message || ERROR_MESSAGES[status] || fallback;
};

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // estados para búsqueda y filtros
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');

  // paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();

  // esperar 400ms antes de buscar (evita peticiones por cada tecla)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, startDate, endDate, sortBy, sortOrder, page]);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const params = { page, limit: 6, sortBy, sortOrder };
      if (debouncedSearch.trim()) params.q = debouncedSearch.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const { data } = await api.get('/events', { params });
      setEvents(data.events);
      setTotalPages(data.pages);
      setTotalEvents(data.total);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Error al cargar los eventos'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este evento?')) return;

    try {
      await api.delete(`/events/${id}`);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      setTotalEvents((prev) => prev - 1);
      toast.success('Evento eliminado correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Error al eliminar el evento'));
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-MX', options);
  };

  // actualizar filtro y volver a la página 1
  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setSortOrder('asc');
    setPage(1);
  };

  const hasActiveFilters = search || startDate || endDate || sortBy !== 'date' || sortOrder !== 'asc';

  return (
    <div className="page">
      <Navbar />

      <div className="dashboard-container">
        {isAdmin && (
          <div className="admin-banner">
            👑 Modo Administrador — estás viendo todos los eventos de todos los usuarios
          </div>
        )}

        <div className="dashboard-header">
          <h1>{isAdmin ? 'Todos los Eventos' : 'Mis Eventos'}</h1>
          <Link to="/events/new" className="btn-primary">
            + Nuevo Evento
          </Link>
        </div>

        {/* barra de búsqueda, filtros y ordenamiento */}
        <div className="dashboard-controls">
          <div className="controls-row">
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nombre, lugar o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="sort-controls">
              <select
                value={sortBy}
                onChange={handleFilterChange(setSortBy)}
                className="sort-select"
              >
                <option value="date">Por fecha</option>
                <option value="name">Por nombre</option>
                <option value="location">Por ubicación</option>
                <option value="createdAt">Por creación</option>
              </select>
              <button
                className="btn-sort-order"
                onClick={() => { setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc')); setPage(1); }}
                title={sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
              >
                {sortOrder === 'asc' ? '↑ ASC' : '↓ DESC'}
              </button>
            </div>
          </div>

          <div className="controls-row controls-row--filters">
            <div className="filter-group">
              <label>Desde</label>
              <input type="date" value={startDate} onChange={handleFilterChange(setStartDate)} />
            </div>
            <div className="filter-group">
              <label>Hasta</label>
              <input type="date" value={endDate} onChange={handleFilterChange(setEndDate)} />
            </div>
            {hasActiveFilters && (
              <button className="btn-clear-filters" onClick={handleClearFilters}>
                ✕ Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="spinner-wrapper">
            <Spinner />
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="empty-state">
            {hasActiveFilters ? (
              <p>No se encontraron eventos con los filtros aplicados.</p>
            ) : (
              <>
                <p>🗓️ No tienes eventos aún.</p>
                <Link to="/events/new" className="btn-primary">
                  Crear mi primer evento
                </Link>
              </>
            )}
          </div>
        )}

        {!loading && totalEvents > 0 && (
          <p className="results-count">
            {totalEvents} evento{totalEvents !== 1 ? 's' : ''} encontrado{totalEvents !== 1 ? 's' : ''}
          </p>
        )}

        <div className="events-grid">
          {events.map((event) => (
            <div key={event._id} className="event-card">
              {event.image && (
                <img
                  src={`http://150.136.162.117:5000/uploads/${event.image}`}
                  alt={event.name}
                  className="event-image"
                />
              )}
              <div className="event-body">
                {/* solo el admin ve el dueño del evento */}
                {isAdmin && event.user && (
                  <p className="event-owner">
                    👤 {event.user.name} — {event.user.email}
                  </p>
                )}
                <h3 className="event-name">{event.name}</h3>
                <p className="event-date">📅 {formatDate(event.date)}</p>
                <p className="event-location">📍 {event.location}</p>
                {event.description && (
                  <p className="event-description">{event.description}</p>
                )}
              </div>
              <div className="event-actions">
                <button className="btn-secondary" onClick={() => navigate(`/events/edit/${event._id}`)}>
                  Editar
                </button>
                <button className="btn-danger" onClick={() => handleDelete(event._id)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* paginación */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn-page" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              ← Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`btn-page${p === page ? ' btn-page--active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button className="btn-page" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
