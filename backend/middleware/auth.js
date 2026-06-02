// ============================================================
// middleware/auth.js — Verificación de Token JWT
// ============================================================
// Un "middleware" es una función que se ejecuta EN MEDIO de
// una petición HTTP: después de que llega la petición, pero
// antes de que el controlador la procese.
//
// Este middleware protege rutas: si el usuario no envía un
// token válido, la petición es rechazada con error 401.
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Los tokens se envían en el encabezado "Authorization"
  // con el formato: "Bearer eyJhbGciOiJIUzI1NiIs..."
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Separamos "Bearer" del token real
      // "Bearer TOKEN" → split(' ') → ["Bearer", "TOKEN"] → [1] = "TOKEN"
      token = req.headers.authorization.split(' ')[1];

      // jwt.verify() decodifica el token usando la clave secreta
      // Si el token es inválido o expiró, lanza un error
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscamos al usuario en la base de datos usando el ID del token
      // .select('-password') significa "trae todos los campos EXCEPTO password"
      req.user = await User.findById(decoded.id).select('-password');

      // next() le dice a Express "todo bien, continúa con el controlador"
      next();
    } catch (error) {
      console.error('Error de token:', error.message);
      res.status(401).json({ message: 'Token inválido o expirado' });
    }
  }

  // Si no hay token en los encabezados, rechazamos la petición
  if (!token) {
    res.status(401).json({ message: 'No autorizado, token requerido' });
  }
};

module.exports = { protect };