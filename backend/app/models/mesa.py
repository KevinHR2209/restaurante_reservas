import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base


class Mesa(Base):
    __tablename__ = "mesas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    numero = Column(Integer, nullable=False, unique=True)
    capacidad = Column(Integer, nullable=False)
    zona = Column(String(50), nullable=True)  # interior, terraza, barra, etc.
    activa = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
