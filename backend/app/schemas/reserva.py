from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import date, time, datetime
from app.schemas.cliente import ClienteOut
from app.schemas.mozo import MozoOut
from app.schemas.mesa import MesaOut


class ReservaBase(BaseModel):
    cliente_id: UUID
    mozo_id: UUID
    mesa_id: Optional[UUID] = None
    fecha: date
    hora_inicio: time
    num_personas: int = 1
    notas: Optional[str] = None


class ReservaCreate(ReservaBase):
    pass


class ReservaUpdateEstado(BaseModel):
    estado: str  # confirmada | completada | cancelada


class ReservaOut(BaseModel):
    id: UUID
    fecha: date
    hora_inicio: time
    hora_fin: time
    num_personas: int
    estado: str
    notas: Optional[str]
    created_at: datetime
    cliente: ClienteOut
    mozo: MozoOut
    mesa: Optional[MesaOut]

    class Config:
        from_attributes = True
