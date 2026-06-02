// ============================================================
// routes/eventRoutes.js — Rutas de Eventos
// ============================================================
// Aquí también configuramos Multer para la subida de imágenes.
// Multer es un middleware que procesa archivos enviados en
// formularios con enctype="multipart/form-data".
// ============================================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path'); // Módulo nativo de Node para manejar rutas de archivos

const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');

const { protect } = require('../middleware/auth');

// ============================================================
// Configuración de Multer (almacenamiento en disco)
// ============================================================
const storage = multer.diskStorage({
  // destination: define EN QUÉ CARPETA se guardan los archivos
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // La carpeta 'uploads' que creamos al inicio
  },

  // filename: define CON QUÉ NOMBRE se guarda el archivo
  filename: function (req, file, cb) {
    // Construimos un nombre único para evitar que archivos con el
    // mismo nombre se sobreescriban:
    // "evento-" + timestamp actual + extensión original del archivo
    // Ejemplo: "evento-1717000000000.jpg"
    const uniqueName = 'evento-' + Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// Filtro: solo aceptamos imágenes (jpg, jpeg, png, gif, webp)
const fileFilter = (req, file, cb) => {
  // file.mimetype es el tipo de archivo, ej: "image/jpeg"
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);  // Aceptar el archivo
  } else {
    cb(new Error('Solo se permiten imágenes'), false); // Rechazar
  }
};

// Creamos la instancia de multer con nuestra configuración
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de 5MB (5 * 1024 * 1024 bytes)
  },
});

// ============================================================
// Definición de rutas
// ============================================================

// Todas las rutas de eventos requieren autenticación (protect)

// GET  /api/events → obtener todos los eventos del usuario
router.get('/', protect, getEvents);

// POST /api/events → crear nuevo evento (con imagen opcional)
// upload.single('image') procesa UN archivo con el nombre de campo 'image'
router.post('/', protect, upload.single('image'), createEvent);

// GET  /api/events/:id → obtener un evento específico
router.get('/:id', protect, getEventById);

// PUT  /api/events/:id → actualizar un evento (con imagen opcional)
router.put('/:id', protect, upload.single('image'), updateEvent);

// DELETE /api/events/:id → eliminar un evento
router.delete('/:id', protect, deleteEvent);

module.exports = router;