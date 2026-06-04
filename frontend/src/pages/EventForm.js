// pages/EventForm.js — formulario para crear o editar un evento

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import '../styles/EventForm.css';

const EventForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    description: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // liberar la URL de objeto al salir o cambiar imagen
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // si estamos editando, cargar los datos del evento
  useEffect(() => {
    if (isEditing) {
      const fetchEvent = async () => {
        try {
          const { data } = await api.get(`/events/${id}`);
          setFormData({
            name: data.name,
            date: data.date.split('T')[0],
            location: data.location,
            description: data.description || '',
          });
          if (data.image) setCurrentImage(data.image);
        } catch (err) {
          const status = err.response?.status;
          if (status === 403) {
            toast.error('No tienes permiso para ver este evento.');
          } else if (status === 404) {
            toast.error('El evento no fue encontrado.');
          } else {
            toast.error('Error al cargar el evento.');
          }
          navigate('/dashboard');
        }
      };
      fetchEvent();
    }
  }, [id, isEditing, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // usamos FormData para poder enviar la imagen junto con el texto
      const data = new FormData();
      data.append('name', formData.name);
      data.append('date', formData.date);
      data.append('location', formData.location);
      data.append('description', formData.description);
      if (imageFile) data.append('image', imageFile);

      if (isEditing) {
        await api.put(`/events/${id}`, data);
        toast.success('Evento actualizado correctamente');
      } else {
        await api.post('/events', data);
        toast.success('Evento creado correctamente');
      }

      navigate('/dashboard');
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;
      if (status === 400) {
        toast.error(message || 'Datos inválidos. Revisa los campos del formulario.');
      } else if (status === 403) {
        toast.error('No tienes permiso para realizar esta acción.');
      } else if (status === 404) {
        toast.error('El evento no fue encontrado.');
      } else {
        toast.error(message || 'Error al guardar el evento.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Navbar />

      <div className="form-container">
        <h2>{isEditing ? 'Editar Evento' : 'Nuevo Evento'}</h2>

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

            {/* imagen guardada en modo edición */}
            {currentImage && !previewUrl && (
              <div className="image-preview">
                <p>Imagen actual:</p>
                <img
                  src={`http://150.136.162.117:5000/uploads/${currentImage}`}
                  alt="Imagen actual"
                />
              </div>
            )}

            <input type="file" accept="image/*" onChange={handleImageChange} />

            {/* vista previa de la imagen recién seleccionada */}
            {previewUrl && (
              <div className="image-preview">
                <p>Vista previa:</p>
                <img src={previewUrl} alt="Vista previa" />
              </div>
            )}
          </div>

          <div className="form-buttons">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/dashboard')}
            >
              Cancelar
            </button>

            <button type="submit" className="btn-primary btn-loading" disabled={loading}>
              {loading && <Spinner size="sm" />}
              {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
