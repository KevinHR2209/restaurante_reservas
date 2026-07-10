from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from app.models.lista_espera import EstadoEspera, JornadaEspera

class ListaEsperaBase(BaseModel):
    nombre_cliente: str
    telefono: Optional[str] = None
    cantidad_personas: int
    notas: Optional[str] = None
    fecha_reserva: Optional[date] = None
    jornada: Optional[JornadaEspera] = None

class ListaEsperaCreate(ListaEsperaBase):
    pass

class ListaEsperaUpdate(BaseModel):
    estado: Optional[EstadoEspera] = None
    notas: Optional[str] = None

class ListaEsperaOut(ListaEsperaBase):
    id: int
    estado: EstadoEspera
    fecha_ingreso: datetime

    class Config:
        from_attributes = True
