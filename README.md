# 🍽️ Restaurante Reservas

Sistema de gestión de reservas para restaurante. Permite administrar mesas, mozos, platos y reservas de clientes con notificaciones por correo y cancelación por token.

## 🚀 Tecnologías

- **Backend:** Python 3.11 + FastAPI + SQLAlchemy + PostgreSQL
- **Frontend:** React + Vite + Tailwind CSS
- **Infraestructura:** Docker + Docker Compose

## 📦 Características

- Gestión de mesas con capacidad y zona
- Gestión de mozos con horarios por día de la semana
- Catálogo de platos con categoría y precio
- Reservas con validación de disponibilidad y conflictos
- Notificación por correo al confirmar reserva
- Cancelación de reserva mediante enlace seguro por token
- Panel de disponibilidad por mozo y fecha

## ⚙️ Instalación rápida

```bash
# 1. Clonar el repositorio
git clone https://github.com/KevinHR2209/restaurante_reservas.git
cd restaurante_reservas

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Levantar con Docker Compose
docker compose up --build
```

## 🌐 URLs por defecto

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Docs Swagger | http://localhost:8000/docs |
| Base de datos | localhost:5433 |

## 🗂️ Estructura del proyecto

```
restaurante_reservas/
├── backend/
│   ├── app/
│   │   ├── models/        # Modelos SQLAlchemy
│   │   ├── schemas/       # Schemas Pydantic
│   │   ├── routers/       # Endpoints FastAPI
│   │   ├── services/      # Lógica de negocio
│   │   ├── database.py    # Conexión PostgreSQL
│   │   ├── main.py        # Aplicación principal
│   │   └── seed.py        # Datos iniciales
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas principales
│   │   └── api/           # Llamadas al backend
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── init.sql
```

## 📝 Variables de entorno

Ver `.env.example` para la lista completa de variables requeridas.

## 📄 Licencia

MIT
