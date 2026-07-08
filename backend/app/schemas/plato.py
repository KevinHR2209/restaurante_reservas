from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from decimal import Decimal
from datetime import datetime


class PlatoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    categoria: str
    precio: Decimal


class PlatoCreate(PlatoBase):
    pass


class PlatoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    precio: Optional[Decimal] = None
    activo: Optional[bool] = None


class PlatoOut(PlatoBase):
    id: UUID
    activo: bool
    created_at: datetime

    class Config:
        from_attributes = True
