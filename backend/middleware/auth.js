// middleware/auth.js — verifica que el token JWT sea válido

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      // extraemos el token del header "Bearer TOKEN"
      token = req.headers.authorization.split(' ')[1];

      // verificamos que el token sea válido
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // buscamos el usuario en la BD (sin contraseña)
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error('Error de token:', error.message);
      res.status(401).json({ message: 'Token inválido o expirado' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No autorizado, token requerido' });
  }
};

module.exports = { protect };
