// ============================================================
// pages/EventForm.js — Formulario de Crear / Editar Evento
// ============================================================
// Este componente sirve para DOS propósitos:
// - Crear un nuevo evento (cuando no hay :id en la URL)
// - Editar un evento existente (cuando hay :id en la URL)
//
// useParams lee los parámetros de la URL.
// Si la URL es /events/edit/abc123, entonces params.id = "abc123"
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import '../styles/EventForm.css';

const EventForm = () => {
  const { id } = useParams(); // Si existe, estamos en modo edición
  const isEditing = Boolean(id); // true si hay ID, false si no
  const navigate = useNavigate();

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    description: '',
  });

  // El archivo de imagen se maneja separado (no es texto)
  const [imageFile, setImageFile] = useState(null);

  // Para mostrar la imagen actual cuando estamos editando
  const [currentImage, setCurrentImage] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ============================================================
  // Si estamos editando, cargamos los datos del evento al iniciar
  // ============================================================
  useEffect(() => {
    if (isEditing) {
      const fetchEvent = async () => {
        try {
          const { data } = await api.get(`/events/${id}`);

          // Llenamos el formulario con los datos existentes
          setFormData({
            name: data.name,
            // La fecha viene como "2024-06-01T00:00:00.000Z"
            // Necesitamos solo "2024-06-01" para el input type="date"
            date: data.date.split('T')[0],
            location: data.location,
            description: data.description || '',
          });

          // Guardamos la imagen actual para mostrarla
          if (data.image) setCurrentImage(data.image);
        } catch (err) {
          setError('Error al cargar el evento');
        }
      };
      fetchEvent();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handleImageChange se ejecuta cuando el usuario selecciona un archivo
  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]); // files[0] = primer archivo seleccionado
  };

  // ============================================================
  // handleSubmit — envía el formulario
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // FormData es necesario para enviar archivos junto con texto
      // No podemos usar JSON cuando hay imágenes: usamos multipart/form-data
      const data = new FormData();
      data.append('name', formData.name);
      data.append('date', formData.date);
      data.append('location', formData.location);
      data.append('description', formData.description);

      // Solo agregamos la imagen si el usuario seleccionó una
      if (imageFile) {
        data.append('image', imageFile); // 'image' debe coincidir con upload.single('image') en el backend
      }

      if (isEditing) {
        // PUT para actualizar
        await api.put(`/events/${id}`, data);
      } else {
        // POST para crear
        await api.post('/events', data);
      }

      // Si todo salió bien, regresamos al dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Navbar />

      <div className="form-container">
        <h2>{isEditing ? 'Editar Evento' : 'Nuevo Evento'}</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label>Nombre del evento *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej. Conferencia de tecnología"
              required
            />
          </div>

          <div className="form-group">
            <label>Fecha *</label>
            {/* type="date" muestra un selector de fecha nativo del navegador */}
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Ubicación *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Ej. Auditorio Municipal, Torreón"
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción (opcional)</label>
            {/* textarea para textos largos */}
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe el evento..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Imagen (opcional)</label>

            {/* Si hay imagen actual, la mostramos como vista previa */}
            {currentImage && (
              <div className="image-preview">
                <p>Imagen actual:</p>
                <img
                  src={`http://localhost:5000/uploads/${currentImage}`}
                  alt="Imagen actual"
                />
              </div>
            )}

            <input
              type="file"
              accept="image/*"   // Solo acepta imágenes
              onChange={handleImageChange}
            />
          </div>

          <div className="form-buttons">
            {/* Botón cancelar: regresa sin guardar */}
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/dashboard')}
            >
              Cancelar
            </button>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;