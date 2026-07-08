from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class MesaBase(BaseModel):
    numero: int
    capacidad: int
    zona: Optional[str] = None


class MesaCreate(MesaBase):
    pass


class MesaUpdate(BaseModel):
    capacidad: Optional[int] = None
    zona: Optional[str] = None
    activa: Optional[bool] = None


class MesaOut(MesaBase):
    id: UUID
    activa: bool
    created_at: datetime

    class Config:
        from_attributes = True
