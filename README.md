# Registro de Eventos — Aplicación MERN

Aplicación web para crear, editar y eliminar eventos. Incluye autenticación de usuarios y panel de administración.

---

## Tecnologías

| Parte | Tecnología |
|-------|-----------|
| Frontend | React 19, React Router, Axios |
| Backend | Node.js, Express |
| Base de datos | MongoDB (Mongoose) |
| Autenticación | JWT + bcrypt |
| Subida de imágenes | Multer |
| Servidor | Oracle Cloud Infrastructure (OCI) |

---

## Servidor en Producción

| Recurso | Dirección |
|---------|-----------|
| Aplicación web (frontend) | `http://150.136.162.117` |
| API (backend) | `http://150.136.162.117:5000` |
| Imágenes subidas | `http://150.136.162.117:5000/uploads/` |

---

## Endpoints de la API

### Autenticación

| Método | Endpoint | Descripción | Requiere token |
|--------|----------|-------------|----------------|
| POST | `/api/auth/register` | Crear cuenta | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/auth/profile` | Ver perfil | Sí |

### Eventos

| Método | Endpoint | Descripción | Requiere token |
|--------|----------|-------------|----------------|
| GET | `/api/events` | Listar eventos | Sí |
| POST | `/api/events` | Crear evento | Sí |
| GET | `/api/events/:id` | Ver un evento | Sí |
| PUT | `/api/events/:id` | Editar evento | Sí |
| DELETE | `/api/events/:id` | Eliminar evento | Sí |

---

## Verificación con curl

### Registrar usuario
```bash
curl -X POST http://150.136.162.117:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan","email":"juan@email.com","password":"123456"}'
```

### Iniciar sesión
```bash
curl -X POST http://150.136.162.117:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@email.com","password":"123456"}'
```

### Obtener eventos (requiere token)
```bash
curl http://150.136.162.117:5000/api/events \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Crear evento (requiere token)
```bash
curl -X POST http://150.136.162.117:5000/api/events \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -F "name=Concierto de Rock" \
  -F "date=2025-12-01" \
  -F "location=Auditorio Municipal" \
  -F "description=Gran evento musical"
```

### Eliminar evento (requiere token)
```bash
curl -X DELETE http://150.136.162.117:5000/api/events/ID_DEL_EVENTO \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Verificar que el servidor responde
```bash
curl http://150.136.162.117:5000
```
Respuesta esperada:
```json
{ "message": "🚀 API de MERN Eventos funcionando correctamente" }
```

---

## Estructura del Proyecto

```
mern-eventos/
├── backend/
│   ├── config/         # conexión a MongoDB
│   ├── controllers/    # lógica de negocio
│   ├── middleware/     # verificación de token JWT
│   ├── models/         # esquemas de MongoDB
│   ├── routes/         # definición de endpoints
│   ├── scripts/        # script para crear admin
│   ├── uploads/        # imágenes subidas
│   └── server.js       # punto de entrada
└── frontend/
    └── src/
        ├── api/        # configuración de Axios
        ├── components/ # componentes reutilizables
        ├── context/    # estado global de autenticación
        ├── pages/      # pantallas de la app
        └── styles/     # archivos CSS
```

---

## Variables de Entorno (backend/.env)

```
MONGO_URI=tu_url_de_mongodb
JWT_SECRET=tu_clave_secreta
PORT=5000
```

---

## Usuario Administrador

```
Email:      admin@eventos.com
Contraseña: Admin2025!
```

Para crear el admin en la base de datos:
```bash
cd backend
npm run create-admin
```

---

## Roles

| Rol | Permisos |
|-----|---------|
| `user` | Ver, crear, editar y eliminar sus propios eventos |
| `admin` | Ver, editar y eliminar todos los eventos de todos los usuarios |

---

## Comandos del Servidor (PM2)

```bash
pm2 list               # ver procesos activos
pm2 restart backend    # reiniciar el backend
pm2 restart frontend   # reiniciar el frontend
pm2 logs backend       # ver logs en tiempo real
```
