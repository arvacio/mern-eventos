// routes/eventRoutes.js — rutas de eventos con subida de imágenes

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const { createEvent, getEvents, getEventById, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

// guardar imágenes en la carpeta uploads/ con nombre único
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = 'evento-' + Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// solo aceptar archivos de imagen
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // máximo 5MB
});

// todas las rutas requieren token válido
router.get('/', protect, getEvents);
router.post('/', protect, upload.single('image'), createEvent);
router.get('/:id', protect, getEventById);
router.put('/:id', protect, upload.single('image'), updateEvent);
router.delete('/:id', protect, deleteEvent);

module.exports = router;
