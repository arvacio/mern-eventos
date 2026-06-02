// controllers/authController.js — Lógica de Autenticación

// Los "controladores" contienen la lógica de negocio.
// Cuando llega una petición a una ruta, el controlador decide
// qué hacer: consultar la base de datos, validar datos, etc.
//
// Separamos la lógica aquí para mantener las rutas limpias.

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Función auxiliar: genera un token JWT

// jwt.sign(payload, secreto, opciones)
// - payload: datos que queremos guardar en el token (el ID del usuario)
// - secreto: la clave para firmar (viene del .env)
// - expiresIn: cuánto tiempo dura el token ('7d' = 7 días)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};


// POST /api/auth/register — Registrar nuevo usuario

const register = async (req, res) => {
  // Extraemos los datos que vienen en el cuerpo de la petición
  const { name, email, password } = req.body;

  try {
    // 1. Verificamos que no exista ya un usuario con ese email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // 2. Creamos el usuario (la contraseña se encripta automáticamente
    //    gracias al middleware 'pre save' que definimos en el modelo)
    const user = await User.create({ name, email, password });

    // 3. Respondemos con los datos del usuario y su token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id), // El token que usará para peticiones futuras
    });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

// POST /api/auth/login — Iniciar sesión

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Buscamos al usuario por email
    const user = await User.findOne({ email });

    // 2. Verificamos que exista Y que la contraseña sea correcta
    //    user.comparePassword es el método que definimos en el modelo
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    // 3. Si todo está bien, enviamos el token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

// GET /api/auth/profile — Obtener perfil del usuario

// Esta ruta está protegida: solo funciona si envías un token válido.
// req.user viene del middleware 'protect' que ejecutamos antes.
const getProfile = async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    createdAt: req.user.createdAt,
  });
};

module.exports = { register, login, getProfile };