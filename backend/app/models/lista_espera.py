from sqlalchemy import Column, Integer, String, DateTime, Enum, Date
from sqlalchemy.sql import func
from app.database import Base
import enum

class EstadoEspera(str, enum.Enum):
    esperando = "esperando"
    notificado = "notificado"
    asignado = "asignado"
    cancelado = "cancelado"

class JornadaEspera(str, enum.Enum):
    manana = "manana"
    tarde = "tarde"
    noche = "noche"

class ListaEspera(Base):
    __tablename__ = "lista_espera"

    id = Column(Integer, primary_key=True, index=True)
    nombre_cliente = Column(String(100), nullable=False)
    telefono = Column(String(20), nullable=True)
    cantidad_personas = Column(Integer, nullable=False)
    estado = Column(Enum(EstadoEspera), default=EstadoEspera.esperando)
    fecha_ingreso = Column(DateTime(timezone=True), server_default=func.now())
    notas = Column(String(255), nullable=True)
    fecha_reserva = Column(Date, nullable=True)
    jornada = Column(Enum(JornadaEspera), nullable=True)
