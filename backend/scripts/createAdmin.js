// scripts/createAdmin.js — Crea el usuario administrador en la base de datos
// Uso: npm run create-admin  (desde la carpeta backend/)

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const ADMIN = {
  name: 'Administrador',
  email: 'admin@eventos.com',
  password: 'Admin2025!',
  role: 'admin',
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB...');

    const existing = await User.findOne({ email: ADMIN.email });
    if (existing) {
      console.log('⚠️  El usuario admin ya existe:', ADMIN.email);
      process.exit(0);
    }

    await User.create(ADMIN);

    console.log('');
    console.log('✅ Usuario administrador creado exitosamente');
    console.log('──────────────────────────────────────────');
    console.log('  Email:      ' + ADMIN.email);
    console.log('  Contraseña: ' + ADMIN.password);
    console.log('  Rol:        admin');
    console.log('──────────────────────────────────────────');
    console.log('⚠️  Cambia la contraseña después del primer login.');
    console.log('');
  } catch (err) {
    console.error('❌ Error al crear admin:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
