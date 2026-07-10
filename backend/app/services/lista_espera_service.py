from sqlalchemy.orm import Session
from app.models.lista_espera import ListaEspera, EstadoEspera, JornadaEspera
from app.schemas.lista_espera import ListaEsperaCreate, ListaEsperaUpdate
from datetime import date, time
from typing import Optional

# Rangos de cada jornada
JORNADA_RANGOS = {
    JornadaEspera.manana: (time(0, 0), time(13, 59)),
    JornadaEspera.tarde:  (time(14, 0), time(18, 59)),
    JornadaEspera.noche:  (time(19, 0), time(23, 59)),
}

def hora_a_jornada(hora: time) -> Optional[JornadaEspera]:
    for jornada, (inicio, fin) in JORNADA_RANGOS.items():
        if inicio <= hora <= fin:
            return jornada
    return None

def get_lista_espera(db: Session, solo_activos: bool = True):
    q = db.query(ListaEspera)
    if solo_activos:
        q = q.filter(ListaEspera.estado.in_([EstadoEspera.esperando, EstadoEspera.notificado]))
    return q.order_by(ListaEspera.fecha_ingreso).all()

def agregar_a_espera(db: Session, data: ListaEsperaCreate) -> ListaEspera:
    entrada = ListaEspera(**data.model_dump())
    db.add(entrada)
    db.commit()
    db.refresh(entrada)
    return entrada

def actualizar_estado(db: Session, entrada_id: int, data: ListaEsperaUpdate) -> Optional[ListaEspera]:
    entrada = db.query(ListaEspera).filter(ListaEspera.id == entrada_id).first()
    if not entrada:
        return None
    for campo, valor in data.model_dump(exclude_unset=True).items():
        setattr(entrada, campo, valor)
    db.commit()
    db.refresh(entrada)
    return entrada

def eliminar_de_espera(db: Session, entrada_id: int) -> bool:
    entrada = db.query(ListaEspera).filter(ListaEspera.id == entrada_id).first()
    if not entrada:
        return False
    db.delete(entrada)
    db.commit()
    return True

def notificar_espera_por_cancelacion(db: Session, fecha: date, hora_cancelada: time):
    """Marca como notificados los clientes en espera para la fecha+jornada de la reserva cancelada."""
    jornada = hora_a_jornada(hora_cancelada)
    if not jornada:
        return
    en_espera = db.query(ListaEspera).filter(
        ListaEspera.fecha_reserva == fecha,
        ListaEspera.jornada == jornada,
        ListaEspera.estado == EstadoEspera.esperando,
    ).all()
    for entrada in en_espera:
        entrada.estado = EstadoEspera.notificado
    db.commit()
