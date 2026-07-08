from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.models.mozo import Mozo
from app.schemas.mozo import MozoCreate, MozoUpdate, MozoOut

router = APIRouter()


@router.get("/", response_model=List[MozoOut])
def listar_mozos(db: Session = Depends(get_db)):
    return db.query(Mozo).order_by(Mozo.nombre).all()


@router.get("/{mozo_id}", response_model=MozoOut)
def obtener_mozo(mozo_id: UUID, db: Session = Depends(get_db)):
    mozo = db.query(Mozo).filter(Mozo.id == mozo_id).first()
    if not mozo:
        raise HTTPException(status_code=404, detail="Mozo no encontrado")
    return mozo


@router.post("/", response_model=MozoOut, status_code=201)
def crear_mozo(data: MozoCreate, db: Session = Depends(get_db)):
    existente = db.query(Mozo).filter(Mozo.email == data.email).first()
    if existente:
        raise HTTPException(status_code=409, detail="Ya existe un mozo con ese email")
    mozo = Mozo(**data.model_dump())
    db.add(mozo)
    db.commit()
    db.refresh(mozo)
    return mozo


@router.patch("/{mozo_id}", response_model=MozoOut)
def actualizar_mozo(mozo_id: UUID, data: MozoUpdate, db: Session = Depends(get_db)):
    mozo = db.query(Mozo).filter(Mozo.id == mozo_id).first()
    if not mozo:
        raise HTTPException(status_code=404, detail="Mozo no encontrado")
    for campo, valor in data.model_dump(exclude_unset=True).items():
        setattr(mozo, campo, valor)
    db.commit()
    db.refresh(mozo)
    return mozo


@router.delete("/{mozo_id}", status_code=204)
def eliminar_mozo(mozo_id: UUID, db: Session = Depends(get_db)):
    mozo = db.query(Mozo).filter(Mozo.id == mozo_id).first()
    if not mozo:
        raise HTTPException(status_code=404, detail="Mozo no encontrado")
    db.delete(mozo)
    db.commit()
