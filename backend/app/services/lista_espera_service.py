from sqlalchemy.orm import Session
from app.models.lista_espera import ListaEspera, EstadoEspera
from app.schemas.lista_espera import ListaEsperaCreate, ListaEsperaUpdate

def get_lista_espera(db: Session, solo_activos: bool = True):
    query = db.query(ListaEspera)
    if solo_activos:
        query = query.filter(ListaEspera.estado.in_([EstadoEspera.esperando, EstadoEspera.notificado]))
    return query.order_by(ListaEspera.fecha_ingreso.asc()).all()

def agregar_a_espera(db: Session, data: ListaEsperaCreate):
    entrada = ListaEspera(**data.model_dump())
    db.add(entrada)
    db.commit()
    db.refresh(entrada)
    return entrada

def actualizar_estado(db: Session, entrada_id: int, data: ListaEsperaUpdate):
    entrada = db.query(ListaEspera).filter(ListaEspera.id == entrada_id).first()
    if not entrada:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(entrada, field, value)
    db.commit()
    db.refresh(entrada)
    return entrada

def eliminar_de_espera(db: Session, entrada_id: int):
    entrada = db.query(ListaEspera).filter(ListaEspera.id == entrada_id).first()
    if entrada:
        db.delete(entrada)
        db.commit()
    return entrada
