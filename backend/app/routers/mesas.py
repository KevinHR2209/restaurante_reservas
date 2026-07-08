from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.models.mesa import Mesa
from app.schemas.mesa import MesaCreate, MesaUpdate, MesaOut

router = APIRouter()


@router.get("/", response_model=List[MesaOut])
def listar_mesas(db: Session = Depends(get_db)):
    return db.query(Mesa).order_by(Mesa.numero).all()


@router.get("/{mesa_id}", response_model=MesaOut)
def obtener_mesa(mesa_id: UUID, db: Session = Depends(get_db)):
    mesa = db.query(Mesa).filter(Mesa.id == mesa_id).first()
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    return mesa


@router.post("/", response_model=MesaOut, status_code=201)
def crear_mesa(data: MesaCreate, db: Session = Depends(get_db)):
    existente = db.query(Mesa).filter(Mesa.numero == data.numero).first()
    if existente:
        raise HTTPException(status_code=409, detail=f"Ya existe la mesa Nº {data.numero}")
    mesa = Mesa(**data.model_dump())
    db.add(mesa)
    db.commit()
    db.refresh(mesa)
    return mesa


@router.patch("/{mesa_id}", response_model=MesaOut)
def actualizar_mesa(mesa_id: UUID, data: MesaUpdate, db: Session = Depends(get_db)):
    mesa = db.query(Mesa).filter(Mesa.id == mesa_id).first()
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    for campo, valor in data.model_dump(exclude_unset=True).items():
        setattr(mesa, campo, valor)
    db.commit()
    db.refresh(mesa)
    return mesa


@router.delete("/{mesa_id}", status_code=204)
def eliminar_mesa(mesa_id: UUID, db: Session = Depends(get_db)):
    mesa = db.query(Mesa).filter(Mesa.id == mesa_id).first()
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    db.delete(mesa)
    db.commit()
