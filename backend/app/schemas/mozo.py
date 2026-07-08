from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime


class MozoBase(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    telefono: Optional[str] = None
    foto_url: Optional[str] = None


class MozoCreate(MozoBase):
    pass


class MozoUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    telefono: Optional[str] = None
    foto_url: Optional[str] = None
    activo: Optional[bool] = None


class MozoOut(MozoBase):
    id: UUID
    activo: bool
    created_at: datetime

    class Config:
        from_attributes = True
