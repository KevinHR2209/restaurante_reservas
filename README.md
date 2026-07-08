# 🍽️ Restaurante Reservas

Sistema fullstack de gestión de reservas para restaurante. Permite administrar mesas, mozos, platos y reservas de clientes con confirmación por correo electrónico y cancelación segura por token.

> Inspirado en la arquitectura de [Barbería Krono](https://github.com/KevinHR2209/barberia_krono), adaptado al dominio gastronómico.

---

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Backend | Python 3.11 + FastAPI + SQLAlchemy 2.0 |
| Base de datos | PostgreSQL 15 |
| Frontend | React 18 + Vite + Tailwind CSS |
| Infraestructura | Docker + Docker Compose |
| Email | SMTP Gmail (smtplib) |

---

## ✨ Funcionalidades

### Panel de Administración
- **Dashboard** con estadísticas en tiempo real (reservas activas, mesas, mozos, clientes)
- **Reservas** — listado completo con filtros por estado y cambio de estado directo
- **Nueva Reserva** — formulario con selector de disponibilidad por bloques de 30 min
- **Clientes** — CRUD completo de clientes
- **Mesas** — gestión de mesas con número, capacidad y zona (Interior, Terraza, VIP…)
- **Mozos** — gestión de mozos con fotos de perfil y estado activo/inactivo
- **Platos** — catálogo de platos agrupado por categoría con precio en CLP
- **Horarios** — configuración de días y horas de atención por mozo

### Portal Público (sin login)
- **Flujo de reserva en 4 pasos** — datos personales → mozo y fecha → selección de hora → confirmación
- **Confirmación por email** con resumen de la reserva y enlace de cancelación
- **Cancelación segura por token** — enlace único en el correo, sin necesidad de login

---

## 📐 Modelos de Datos

```
Cliente      — nombre, apellido, email, teléfono
Mozo         — nombre, apellido, email, teléfono, activo
HorarioMozo  — mozo_id, dia_semana (0–6), hora_inicio, hora_fin
Mesa         — numero, capacidad, zona, activa
Plato        — nombre, descripcion, categoria, precio, activo
Reserva      — cliente_id, mozo_id, mesa_id, fecha, hora_inicio, hora_fin,
               num_personas, estado, notas, cancel_token
```

**Estados de Reserva:** `confirmada` → `completada` | `cancelada`

---

## ⚙️ Instalación y Ejecución

### Requisitos previos
- Docker Desktop instalado
- Puerto 5173, 8000 y 5433 disponibles

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/KevinHR2209/restaurante_reservas.git
cd restaurante_reservas

# 2. Copiar y configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Gmail

# 3. Levantar toda la infraestructura
docker compose up --build
```

### URLs por defecto

| Servicio | URL |
|----------|-----|
| 🌐 Frontend (admin) | http://localhost:5173 |
| 📋 Reserva pública | http://localhost:5173/reservar |
| ⚡ Backend API | http://localhost:8000 |
| 📖 Swagger UI | http://localhost:8000/docs |
| 🗄️ Base de datos | localhost:5433 |

---

## 🗂️ Estructura del Proyecto

```
restaurante_reservas/
├── backend/
│   ├── app/
│   │   ├── models/              # Modelos SQLAlchemy (ORM)
│   │   │   ├── cliente.py
│   │   │   ├── mozo.py
│   │   │   ├── horario_mozo.py
│   │   │   ├── mesa.py
│   │   │   ├── plato.py
│   │   │   └── reserva.py
│   │   ├── schemas/             # Validación Pydantic
│   │   │   ├── cliente.py
│   │   │   ├── mozo.py
│   │   │   ├── mesa.py
│   │   │   ├── plato.py
│   │   │   ├── horario.py
│   │   │   └── reserva.py
│   │   ├── routers/             # Endpoints REST
│   │   │   ├── clientes.py
│   │   │   ├── mozos.py
│   │   │   ├── mesas.py
│   │   │   ├── platos.py
│   │   │   ├── horarios.py
│   │   │   └── reservas.py      # Incluye disponibilidad y cancelación
│   │   ├── services/            # Lógica de negocio
│   │   │   ├── reserva_service.py
│   │   │   └── email_service.py
│   │   ├── database.py          # Conexión PostgreSQL
│   │   ├── main.py              # App FastAPI + CORS + routers
│   │   └── seed.py              # Datos iniciales (mozos, mesas, platos)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx       # Sidebar de navegación
│   │   │   ├── EstadoBadge.jsx  # Badge de estado de reserva
│   │   │   └── Modal.jsx        # Modal reutilizable
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ReservasPage.jsx
│   │   │   ├── NuevaReservaPage.jsx
│   │   │   ├── ClientesPage.jsx
│   │   │   ├── MesasPage.jsx
│   │   │   ├── MozosPage.jsx
│   │   │   ├── PlatosPage.jsx
│   │   │   ├── HorarioPage.jsx
│   │   │   ├── ReservaPublicaPage.jsx  # Flujo público de 4 pasos
│   │   │   └── CancelarReservaPage.jsx
│   │   ├── services/
│   │   │   └── api.js           # Axios — llamadas al backend
│   │   ├── App.jsx              # Rutas React Router
│   │   ├── main.jsx
│   │   └── index.css            # Tailwind + utilidades
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── init.sql
└── .env.example
```

---

## 🔌 API Endpoints Principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/reservas/` | Listar todas las reservas |
| POST | `/api/reservas/` | Crear nueva reserva |
| GET | `/api/reservas/disponibilidad/{mozo_id}/{fecha}` | Bloques disponibles |
| PATCH | `/api/reservas/{id}/estado` | Cambiar estado |
| GET | `/api/reservas/cancelar/{token}` | Cancelar por token |
| GET | `/api/mesas/` | Listar mesas |
| GET | `/api/mozos/` | Listar mozos |
| GET | `/api/platos/` | Listar platos |
| GET | `/api/clientes/` | Listar clientes |

> Documentación interactiva completa en [`/docs`](http://localhost:8000/docs)

---

## 📧 Configuración de Email

El sistema envía correos HTML con los detalles de la reserva y un enlace único de cancelación.

En `.env`:
```env
GMAIL_USER=tu_correo@gmail.com
GMAIL_PASS=tu_app_password_de_gmail
FRONTEND_URL=http://localhost:5173
```

> Genera un **App Password** en tu cuenta Google en: Seguridad → Verificación en dos pasos → Contraseñas de aplicación

---

## 👨‍💻 Autor

**Kevin Henríquez** — [@KevinHR2209](https://github.com/KevinHR2209)

---

## 📄 Licencia

MIT
