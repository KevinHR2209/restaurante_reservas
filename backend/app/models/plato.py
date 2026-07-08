import uuid
from sqlalchemy import Column, String, Integer, Numeric, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base


class Plato(Base):
    __tablename__ = "platos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(Text, nullable=True)
    categoria = Column(String(80), nullable=False)  # entrada, fondo, postre, bebestible
    precio = Column(Numeric(10, 2), nullable=False)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
