import secrets
from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.reserva import Reserva
from app.models.mozo import Mozo
from app.models.cliente import Cliente
from app.models.mesa import Mesa
from app.models.horario_mozo import HorarioMozo
from app.schemas.reserva import ReservaCreate
from app.services.email_service import enviar_confirmacion

# Duración estándar de una reserva en minutos
DURACION_RESERVA_MIN = 90


def crear_reserva(db: Session, data: ReservaCreate) -> Reserva:
    mozo = db.query(Mozo).filter(Mozo.id == data.mozo_id, Mozo.activo == True).first()
    if not mozo:
        raise HTTPException(status_code=404, detail="Mozo no encontrado o inactivo")

    cliente = db.query(Cliente).filter(Cliente.id == data.cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # Verificar que el mozo atiende ese día de la semana
    dia_semana = data.fecha.weekday()
    horario = db.query(HorarioMozo).filter(
        HorarioMozo.mozo_id == data.mozo_id,
        HorarioMozo.dia_semana == dia_semana,
        HorarioMozo.activo == True,
    ).first()
    if not horario:
        raise HTTPException(status_code=400, detail="El mozo no trabaja ese día")

    # Calcular hora de fin de la reserva
    hora_inicio = data.hora_inicio
    hora_fin = (datetime.combine(data.fecha, hora_inicio) + timedelta(minutes=DURACION_RESERVA_MIN)).time()

    # Verificar conflicto de horario con el mozo
    conflicto = db.query(Reserva).filter(
        Reserva.mozo_id == data.mozo_id,
        Reserva.fecha == data.fecha,
        Reserva.estado != "cancelada",
        Reserva.hora_inicio < hora_fin,
        Reserva.hora_fin > hora_inicio,
    ).first()
    if conflicto:
        raise HTTPException(status_code=409, detail="El mozo ya tiene una reserva en ese horario")

    # Verificar disponibilidad de la mesa si se especificó
    if data.mesa_id:
        mesa = db.query(Mesa).filter(Mesa.id == data.mesa_id, Mesa.activa == True).first()
        if not mesa:
            raise HTTPException(status_code=404, detail="Mesa no encontrada o inactiva")
        if mesa.capacidad < data.num_personas:
            raise HTTPException(status_code=400, detail=f"La mesa {mesa.numero} solo tiene capacidad para {mesa.capacidad} personas")
        conflicto_mesa = db.query(Reserva).filter(
            Reserva.mesa_id == data.mesa_id,
            Reserva.fecha == data.fecha,
            Reserva.estado != "cancelada",
            Reserva.hora_inicio < hora_fin,
            Reserva.hora_fin > hora_inicio,
        ).first()
        if conflicto_mesa:
            raise HTTPException(status_code=409, detail="La mesa ya está reservada en ese horario")

    cancel_token = secrets.token_urlsafe(32)

    reserva = Reserva(
        cliente_id=data.cliente_id,
        mozo_id=data.mozo_id,
        mesa_id=data.mesa_id,
        fecha=data.fecha,
        hora_inicio=hora_inicio,
        hora_fin=hora_fin,
        num_personas=data.num_personas,
        notas=data.notas,
        cancel_token=cancel_token,
    )
    db.add(reserva)
    db.commit()
    db.refresh(reserva)

    # Enviar correo de confirmación
    try:
        if cliente.email:
            mesa_num = None
            if data.mesa_id:
                m = db.query(Mesa).filter(Mesa.id == data.mesa_id).first()
                mesa_num = m.numero if m else None
            enviar_confirmacion(cliente.email, {
                "cliente_nombre": cliente.nombre,
                "mozo": f"{mozo.nombre} {mozo.apellido}",
                "fecha": str(data.fecha),
                "hora": str(hora_inicio)[:5],
                "num_personas": data.num_personas,
                "mesa": mesa_num,
                "duracion": DURACION_RESERVA_MIN,
                "cancel_token": cancel_token,
            })
    except Exception as e:
        print(f"[EMAIL] Error al preparar envío: {e}")

    return reserva
