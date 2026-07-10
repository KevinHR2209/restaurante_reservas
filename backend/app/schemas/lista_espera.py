from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.lista_espera import EstadoEspera

class ListaEsperaBase(BaseModel):
    nombre_cliente: str
    telefono: Optional[str] = None
    cantidad_personas: int
    notas: Optional[str] = None

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
