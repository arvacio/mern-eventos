// server.js — Servidor Principal

// Punto de entrada del backend. Aquí:
//   1. Cargamos las variables de entorno (.env)
//   2. Configuramos los middlewares globales
//   3. Conectamos las rutas
//   4. Arrancamos el servidor

// dotenv.config() DEBE ser la primera línea: carga las variables
// del archivo .env para que process.env.XXXX funcione en todo el proyecto

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');

// Importamos las rutas que definimos
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');

// Conectamos a MongoDB (la función es async, se ejecuta en paralelo)
connectDB();

// Creamos la aplicación de Express
const app = express();

// MIDDLEWARES GLOBALES

// Los middlewares se aplican a TODAS las peticiones que lleguen.

// helmet: agrega encabezados HTTP de seguridad automáticamente
app.use(helmet({
  // Desactivamos esta opción para poder servir imágenes sin problemas
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// cors: permite que el frontend (que corre en otro puerto)
// pueda hacer peticiones a este backend.
// En desarrollo, origin: '*' acepta peticiones de cualquier origen.
// En producción deberías cambiar '*' por la URL real de tu frontend.
app.use(cors({ origin: '*' }));

// express.json(): permite que Express lea el cuerpo de las peticiones
// cuando el Content-Type es "application/json"
app.use(express.json());

// express.urlencoded(): permite leer formularios HTML tradicionales
app.use(express.urlencoded({ extended: true }));

// Servimos la carpeta 'uploads' como archivos estáticos.
// Si guardaste una imagen como "evento-123.jpg",
// podrás acceder a ella en: http://localhost:5000/uploads/evento-123.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// RUTAS

// Conectamos cada grupo de rutas con su prefijo de URL.
// Todas las rutas de auth empezarán con /api/auth
// Todas las rutas de eventos empezarán con /api/events
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// Ruta de prueba: visita http://localhost:5000 para verificar que el servidor funciona
app.get('/', (req, res) => {
  res.json({ message: '🚀 API de MERN Eventos funcionando correctamente' });
});

// MANEJO GLOBAL DE ERRORES

// Este middleware especial captura cualquier error que no fue
// manejado en los controladores. Se reconoce porque tiene
// 4 parámetros: (err, req, res, next)
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.stack);
  res.status(500).json({
    message: err.message || 'Error interno del servidor',
  });
});

// INICIAR EL SERVIDOR

// Leemos el puerto del .env, o usamos 5000 por defecto
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});