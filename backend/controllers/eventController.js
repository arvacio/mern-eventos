
// controllers/eventController.js — Lógica CRUD de Eventos

// CRUD = Create, Read, Update, Delete

const Event = require('../models/Event');

// POST /api/events — Crear un nuevo evento

const createEvent = async (req, res) => {
  // Extraemos los datos del cuerpo de la petición
  const { name, date, location, description } = req.body;

  try {
    // Creamos el evento en la base de datos
    // req.user._id viene del middleware 'protect': es el usuario autenticado
    // req.file es el archivo subido por Multer (si se subió alguno)
    const event = await Event.create({
      name,
      date,
      location,
      description,
      user: req.user._id,                          // Quién creó este evento
      image: req.file ? req.file.filename : null,  // Nombre del archivo subido
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear evento', error: error.message });
  }
};

// GET /api/events — Obtener TODOS los eventos del usuario

const getEvents = async (req, res) => {
  try {
    // .find({ user: req.user._id }) — solo los eventos DE ESTE usuario
    // .sort({ date: 1 }) — ordenados por fecha de más antiguo a más reciente
    //   (usa -1 para orden inverso: más reciente primero)
    const events = await Event.find({ user: req.user._id }).sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener eventos', error: error.message });
  }
};

// GET /api/events/:id — Obtener UN evento por su ID

// El :id en la URL es un "parámetro de ruta"
// Si la URL es /api/events/abc123, entonces req.params.id = "abc123"
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    // Verificamos que el evento exista
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    // Verificamos que el evento pertenezca al usuario autenticado
    // .toString() convierte el ObjectId a string para poder compararlo
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes permiso para ver este evento' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener evento', error: error.message });
  }
};

// PUT /api/events/:id — Actualizar un evento

const updateEvent = async (req, res) => {
  const { name, date, location, description } = req.body;

  try {
    // Primero buscamos el evento
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    // Verificamos que sea el dueño del evento
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes permiso para editar este evento' });
    }

    // Actualizamos los campos (si vienen en la petición, los actualizamos;
    // si no vienen, mantenemos el valor anterior con "|| event.campo")
    event.name = name || event.name;
    event.date = date || event.date;
    event.location = location || event.location;
    event.description = description || event.description;

    // Si se subió una nueva imagen, actualizamos ese campo también
    if (req.file) {
      event.image = req.file.filename;
    }

    // Guardamos los cambios en la base de datos
    const updatedEvent = await event.save();

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar evento', error: error.message });
  }
};

// DELETE /api/events/:id — Eliminar un evento

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    // Verificamos que sea el dueño
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este evento' });
    }

    // findByIdAndDelete busca por ID y lo elimina en una sola operación
    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Evento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar evento', error: error.message });
  }
};

module.exports = { createEvent, getEvents, getEventById, updateEvent, deleteEvent };