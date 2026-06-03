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
// Admin ve TODOS los eventos de todos los usuarios (con nombre del dueño).
// Usuario regular solo ve los suyos.
//
// Query params:
//   q         — texto libre (nombre, ubicación, descripción)
//   startDate — fecha mínima (YYYY-MM-DD)
//   endDate   — fecha máxima (YYYY-MM-DD)
//   sortBy    — date | name | location | createdAt  (default: date)
//   sortOrder — asc | desc  (default: asc)
//   page      — número de página  (default: 1)
//   limit     — resultados por página, máx 50  (default: 6)
const getEvents = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';

    const {
      q = '',
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'asc',
      page = 1,
      limit = 6,
    } = req.query;

    // Admin ve todos; usuario regular solo los suyos
    const filter = isAdmin ? {} : { user: req.user._id };

    if (q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [{ name: regex }, { location: regex }, { description: regex }];
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const allowedSortFields = ['date', 'name', 'location', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'date';
    const sortDir = sortOrder === 'desc' ? -1 : 1;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 6));
    const skip = (pageNum - 1) * limitNum;

    // Admin recibe nombre y email del dueño en cada evento
    const eventsQuery = Event.find(filter)
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(limitNum);

    if (isAdmin) eventsQuery.populate('user', 'name email');

    const [events, total] = await Promise.all([
      eventsQuery,
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
    const event = await Event.findById(req.params.id).populate('user', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = event.user._id.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
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

    const isAdmin = req.user.role === 'admin';
    const isOwner = event.user.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
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

    const isAdmin = req.user.role === 'admin';
    const isOwner = event.user.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este evento' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Evento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar evento', error: error.message });
  }
};

module.exports = { createEvent, getEvents, getEventById, updateEvent, deleteEvent };
