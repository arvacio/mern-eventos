const Event = require('../models/Event');
const mongoose = require('mongoose');

// POST /api/events — Crear evento
const createEvent = async (req, res) => {
  const { name, date, location, description } = req.body;

  if (!name || !date || !location) {
    return res.status(400).json({ message: 'Los campos nombre, fecha y ubicación son obligatorios' });
  }

  try {
    const event = await Event.create({
      name,
      date,
      location,
      description,
      user: req.user._id,
      image: req.file ? req.file.filename : null,
    });

    res.status(201).json(event);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Error al crear evento', error: error.message });
  }
};

// GET /api/events — Obtener eventos con búsqueda, filtros, ordenamiento y paginación
//
// Query params:
//   q         — texto libre (busca en nombre, ubicación y descripción)
//   startDate — fecha mínima (YYYY-MM-DD)
//   endDate   — fecha máxima (YYYY-MM-DD)
//   sortBy    — campo: date | name | location | createdAt  (default: date)
//   sortOrder — asc | desc  (default: asc)
//   page      — número de página  (default: 1)
//   limit     — resultados por página, máx 50  (default: 6)
const getEvents = async (req, res) => {
  try {
    const {
      q = '',
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'asc',
      page = 1,
      limit = 6,
    } = req.query;

    const filter = { user: req.user._id };

    // Búsqueda de texto en nombre, ubicación y descripción
    if (q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [{ name: regex }, { location: regex }, { description: regex }];
    }

    // Filtro por rango de fechas
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    // Validar y sanitizar parámetros de ordenamiento
    const allowedSortFields = ['date', 'name', 'location', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'date';
    const sortDir = sortOrder === 'desc' ? -1 : 1;

    // Validar y sanitizar paginación
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 6));
    const skip = (pageNum - 1) * limitNum;

    const [events, total] = await Promise.all([
      Event.find(filter).sort({ [sortField]: sortDir }).skip(skip).limit(limitNum),
      Event.countDocuments(filter),
    ]);

    res.json({
      events,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      limit: limitNum,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener eventos', error: error.message });
  }
};

// GET /api/events/:id — Obtener un evento por ID
const getEventById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'ID de evento no válido' });
  }

  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes permiso para ver este evento' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener evento', error: error.message });
  }
};

// PUT /api/events/:id — Actualizar evento
const updateEvent = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'ID de evento no válido' });
  }

  const { name, date, location, description } = req.body;

  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes permiso para editar este evento' });
    }

    event.name = name || event.name;
    event.date = date || event.date;
    event.location = location || event.location;
    event.description = description !== undefined ? description : event.description;

    if (req.file) {
      event.image = req.file.filename;
    }

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Error al actualizar evento', error: error.message });
  }
};

// DELETE /api/events/:id — Eliminar evento
const deleteEvent = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'ID de evento no válido' });
  }

  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este evento' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Evento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar evento', error: error.message });
  }
};

module.exports = { createEvent, getEvents, getEventById, updateEvent, deleteEvent };
