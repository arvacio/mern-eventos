// models/Event.js — estructura del evento en la BD

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del evento es obligatorio'],
      trim: true,
      maxlength: [100, 'El nombre no puede tener más de 100 caracteres'],
    },
    date: {
      type: Date,
      required: [true, 'La fecha del evento es obligatoria'],
    },
    location: {
      type: String,
      required: [true, 'La ubicación del evento es obligatoria'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'La descripción no puede tener más de 500 caracteres'],
    },
    // nombre del archivo subido con Multer
    image: {
      type: String,
      default: null,
    },
    // referencia al usuario dueño del evento
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
