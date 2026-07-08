from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.models.horario_mozo import HorarioMozo
from app.schemas.horario import HorarioMozoCreate, HorarioMozoOut

router = APIRouter()


@router.get("/", response_model=List[HorarioMozoOut])
def listar_horarios(db: Session = Depends(get_db)):
    return db.query(HorarioMozo).all()


@router.get("/mozo/{mozo_id}", response_model=List[HorarioMozoOut])
def horarios_por_mozo(mozo_id: UUID, db: Session = Depends(get_db)):
    return db.query(HorarioMozo).filter(HorarioMozo.mozo_id == mozo_id).all()


@router.post("/", response_model=HorarioMozoOut, status_code=201)
def crear_horario(data: HorarioMozoCreate, db: Session = Depends(get_db)):
    horario = HorarioMozo(**data.model_dump())
    db.add(horario)
    db.commit()
    db.refresh(horario)
    return horario


@router.delete("/{horario_id}", status_code=204)
def eliminar_horario(horario_id: UUID, db: Session = Depends(get_db)):
    horario = db.query(HorarioMozo).filter(HorarioMozo.id == horario_id).first()
    if not horario:
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    db.delete(horario)
    db.commit()
