from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.lista_espera import ListaEsperaCreate, ListaEsperaOut, ListaEsperaUpdate
from app.services import lista_espera_service
from typing import List

router = APIRouter(prefix="/lista-espera", tags=["Lista de Espera"])

@router.get("/", response_model=List[ListaEsperaOut])
def listar(solo_activos: bool = True, db: Session = Depends(get_db)):
    return lista_espera_service.get_lista_espera(db, solo_activos)

@router.post("/", response_model=ListaEsperaOut, status_code=201)
def agregar(data: ListaEsperaCreate, db: Session = Depends(get_db)):
    return lista_espera_service.agregar_a_espera(db, data)

@router.patch("/{entrada_id}", response_model=ListaEsperaOut)
def actualizar(entrada_id: int, data: ListaEsperaUpdate, db: Session = Depends(get_db)):
    resultado = lista_espera_service.actualizar_estado(db, entrada_id, data)
    if not resultado:
        raise HTTPException(status_code=404, detail="Entrada no encontrada")
    return resultado

@router.delete("/{entrada_id}", status_code=204)
def eliminar(entrada_id: int, db: Session = Depends(get_db)):
    resultado = lista_espera_service.eliminar_de_espera(db, entrada_id)
    if not resultado:
        raise HTTPException(status_code=404, detail="Entrada no encontrada")
