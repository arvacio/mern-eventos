// config/db.js — Conexión a MongoDB

// Este archivo se encarga de conectar tu servidor a la base de datos.
// mongoose es la librería que nos permite hablar con MongoDB
// usando JavaScript en lugar de consultas de base de datos.

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Intentamos conectar usando la URL que está en el archivo .env
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Si la conexión fue exitosa, mostramos un mensaje en consola
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    // Si algo salió mal, mostramos el error y detenemos el programa
    console.error(`❌ Error al conectar a MongoDB: ${error.message}`);
    process.exit(1); // "salida con error"
  }
};

// Exportamos la función para usarla en server.js
module.exports = connectDB;