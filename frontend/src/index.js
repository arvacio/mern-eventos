// ============================================================
// index.js — Punto de Entrada de React
// ============================================================
// Este es el primer archivo que ejecuta React.
// Su única misión: montar el componente App dentro del
// elemento <div id="root"> que está en public/index.html
// ============================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Buscamos el div con id="root" en el HTML
const root = ReactDOM.createRoot(document.getElementById('root'));

// Montamos nuestra aplicación dentro de ese div
root.render(
  <React.StrictMode>
    {/* StrictMode ayuda a detectar problemas durante el desarrollo */}
    <App />
  </React.StrictMode>
);