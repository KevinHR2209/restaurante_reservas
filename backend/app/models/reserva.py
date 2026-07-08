import uuid
from sqlalchemy import Column, String, Integer, Date, Time, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Reserva(Base):
    __tablename__ = "reservas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cliente_id = Column(UUID(as_uuid=True), ForeignKey("clientes.id", ondelete="CASCADE"), nullable=False)
    mozo_id = Column(UUID(as_uuid=True), ForeignKey("mozos.id", ondelete="CASCADE"), nullable=False)
    mesa_id = Column(UUID(as_uuid=True), ForeignKey("mesas.id", ondelete="SET NULL"), nullable=True)
    fecha = Column(Date, nullable=False)
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False)
    num_personas = Column(Integer, nullable=False, default=1)
    estado = Column(String(20), nullable=False, default="confirmada")  # confirmada | completada | cancelada
    notas = Column(Text, nullable=True)
    cancel_token = Column(String(64), nullable=True, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    cliente = relationship("Cliente")
    mozo = relationship("Mozo", back_populates="reservas")
    mesa = relationship("Mesa")
