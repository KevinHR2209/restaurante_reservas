import uuid
from sqlalchemy import Column, Integer, Time, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class HorarioMozo(Base):
    __tablename__ = "horarios_mozo"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mozo_id = Column(UUID(as_uuid=True), ForeignKey("mozos.id", ondelete="CASCADE"), nullable=False)
    dia_semana = Column(Integer, nullable=False)  # 0=lunes ... 6=domingo
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    mozo = relationship("Mozo", back_populates="horarios")
