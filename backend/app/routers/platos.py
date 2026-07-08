from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app.models.plato import Plato
from app.schemas.plato import PlatoCreate, PlatoUpdate, PlatoOut

router = APIRouter()


@router.get("/", response_model=List[PlatoOut])
def listar_platos(categoria: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Plato)
    if categoria:
        query = query.filter(Plato.categoria == categoria)
    return query.order_by(Plato.categoria, Plato.nombre).all()


@router.get("/{plato_id}", response_model=PlatoOut)
def obtener_plato(plato_id: UUID, db: Session = Depends(get_db)):
    plato = db.query(Plato).filter(Plato.id == plato_id).first()
    if not plato:
        raise HTTPException(status_code=404, detail="Plato no encontrado")
    return plato


@router.post("/", response_model=PlatoOut, status_code=201)
def crear_plato(data: PlatoCreate, db: Session = Depends(get_db)):
    plato = Plato(**data.model_dump())
    db.add(plato)
    db.commit()
    db.refresh(plato)
    return plato


@router.patch("/{plato_id}", response_model=PlatoOut)
def actualizar_plato(plato_id: UUID, data: PlatoUpdate, db: Session = Depends(get_db)):
    plato = db.query(Plato).filter(Plato.id == plato_id).first()
    if not plato:
        raise HTTPException(status_code=404, detail="Plato no encontrado")
    for campo, valor in data.model_dump(exclude_unset=True).items():
        setattr(plato, campo, valor)
    db.commit()
    db.refresh(plato)
    return plato


@router.delete("/{plato_id}", status_code=204)
def eliminar_plato(plato_id: UUID, db: Session = Depends(get_db)):
    plato = db.query(Plato).filter(Plato.id == plato_id).first()
    if not plato:
        raise HTTPException(status_code=404, detail="Plato no encontrado")
    db.delete(plato)
    db.commit()
