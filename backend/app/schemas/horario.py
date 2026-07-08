from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import time


class HorarioMozoBase(BaseModel):
    mozo_id: UUID
    dia_semana: int  # 0=lunes ... 6=domingo
    hora_inicio: time
    hora_fin: time


class HorarioMozoCreate(HorarioMozoBase):
    pass


class HorarioMozoOut(HorarioMozoBase):
    id: UUID
    activo: bool

    class Config:
        from_attributes = True
