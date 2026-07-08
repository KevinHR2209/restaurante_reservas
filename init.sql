-- Script de inicialización de la base de datos
-- Se ejecuta automáticamente al crear el contenedor PostgreSQL

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- El esquema de tablas lo crea SQLAlchemy automáticamente al iniciar el backend
