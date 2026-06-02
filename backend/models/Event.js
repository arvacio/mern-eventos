// ============================================================
// models/Event.js — Modelo de Evento
// ============================================================
// Este es el recurso principal de tu aplicación: los eventos
// que los usuarios pueden crear, ver, editar y eliminar.
// ============================================================

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    // Nombre del evento (ej. "Concierto de rock", "Reunión de trabajo")
    name: {
      type: String,
      required: [true, 'El nombre del evento es obligatorio'],
      trim: true,
      maxlength: [100, 'El nombre no puede tener más de 100 caracteres'],
    },

    // Fecha y hora del evento
    date: {
      type: Date,
      required: [true, 'La fecha del evento es obligatoria'],
    },

    // Lugar donde se realiza el evento
    location: {
      type: String,
      required: [true, 'La ubicación del evento es obligatoria'],
      trim: true,
    },

    // Descripción opcional del evento
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'La descripción no puede tener más de 500 caracteres'],
    },

    // Imagen del evento (guardamos el nombre del archivo subido con Multer)
    image: {
      type: String,
      default: null, // Si no suben imagen, queda en null
    },

    // ============================================================
    // RELACIÓN CON EL USUARIO
    // ============================================================
    // Aquí está la clave: cada evento "pertenece" a un usuario.
    // mongoose.Schema.Types.ObjectId es el tipo de ID que usa MongoDB.
    // ref: 'User' le dice a mongoose que este ID apunta a un User.
    // Así podemos saber quién creó cada evento.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Event', eventSchema);