import os
import requests
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session, joinedload
from typing import List
from uuid import UUID
from datetime import date, datetime
from pydantic import BaseModel

from app.database import get_db, SessionLocal
from app.models.reserva import Reserva
from app.models.horario_mozo import HorarioMozo
from app.models.lista_espera import ListaEspera, EstadoEspera
from app.schemas.reserva import ReservaCreate, ReservaUpdateEstado, ReservaOut
from app.services.reserva_service import crear_reserva
from app.services.lista_espera_service import notificar_espera_por_cancelacion, hora_a_jornada

router = APIRouter()

# --- MIDDLEWARE KRONO: Envío Asíncrono ---
def notificar_krono_restaurante(reserva_id: str):
    db = SessionLocal()
    try:
        reserva = db.query(Reserva).options(joinedload(Reserva.cliente), joinedload(Reserva.mozo), joinedload(Reserva.mesa)).filter(Reserva.id == reserva_id).first()
        if not reserva: return

        # Buscar en la lista de espera nativa del restaurante
        jornada = hora_a_jornada(reserva.hora_inicio)
        en_espera = db.query(ListaEspera).filter(
            ListaEspera.fecha_reserva == reserva.fecha,
            ListaEspera.jornada == jornada,
            ListaEspera.estado == EstadoEspera.esperando
        ).all()

        if not en_espera:
            print("[KRONO] No hay clientes en espera para este bloque. Subasta abortada.", flush=True)
            return

        waitlist = []
        for e in en_espera:
            tel = e.telefono if e.telefono and str(e.telefono).startswith("+569") else "+56900000000"
            waitlist.append({
                "patient_id": str(e.id),
                "display_name": e.nombre_cliente,
                "phone": tel,
                "email": "contacto@restaurante.cl", # La lista no pide email nativamente
                "metrics": {
                    "tamano_grupo": e.cantidad_personas,
                    "fidelidad": 0.9 # Dato simulado o calculado
                }
            })

        payload = {
            "event_type": "appointment_cancelled",
            "source_system_id": "RESTAURANT-VALPO-01",
            "return_url": "http://host.docker.internal:8000/api/reservas/krono-webhook",
            "cancellation": {
                "appointment_id": str(reserva.id),
                "cancelled_at": datetime.utcnow().isoformat() + "Z",
                "slot": {
                    "date": str(reserva.fecha),
                    "start_time": str(reserva.hora_inicio)[:5],
                    "end_time": str(reserva.hora_fin)[:5],
                    "doctor_name": f"{reserva.mozo.nombre} {reserva.mozo.apellido}",
                    "specialty": "Mesa de Restaurante",
                    "location": reserva.mesa.zona if reserva.mesa else "Interior"
                },
                "cancelled_patient": {
                    "patient_id": str(reserva.cliente_id),
                    "display_name": f"{reserva.cliente.nombre} {reserva.cliente.apellido}"
                }
            },
            "waitlist": waitlist
        }

        resp = requests.post("http://host.docker.internal:3000/api/v1/webhook/cancellation", json=payload, timeout=5)
        resp.raise_for_status()
        print(f"[KRONO] Subasta de restaurante iniciada: {resp.json().get('transaction_id')}", flush=True)
    except Exception as e:
        print(f"[KRONO] Error de integración: {e}", flush=True)
    finally:
        db.close()

# --- ENDPOINT DE RETORNO KRONO ---
class KronoReturnPayload(BaseModel):
    status: str
    appointment_id: str
    winner: dict | None = None
    message: str | None = None

@router.post("/krono-webhook")
def recibir_resultado_krono(payload: KronoReturnPayload, db: Session = Depends(get_db)):
    print(f"[KRONO] Resultado recibido: {payload.status} para reserva {payload.appointment_id}", flush=True)

    if payload.status == "reasignada":
        # 1. Recuperamos la reserva original (la que fue cancelada)
        reserva_original = db.query(Reserva).filter(Reserva.id == UUID(payload.appointment_id)).first()

        if reserva_original:
            # 2. Lógica de negocio: Aquí el restaurante procesa al ganador
            # Por ejemplo, podrías crear una nueva reserva con los datos del ganador
            # o marcar la reserva original como "reasignada"
            reserva_original.estado = "confirmada" # O el estado que prefieras para indicar éxito
            db.commit()
            print(f"[KRONO] Reserva {payload.appointment_id} actualizada exitosamente tras reasignación.", flush=True)
            return {"received": True, "action": "updated"}

    return {"received": True, "action": "ignored"}


# --- RUTAS ORIGINALES ---
@router.get("/", response_model=List[ReservaOut])
def listar_reservas(db: Session = Depends(get_db)):
    return db.query(Reserva).options(joinedload(Reserva.cliente), joinedload(Reserva.mozo), joinedload(Reserva.mesa)).order_by(Reserva.fecha, Reserva.hora_inicio).all()

@router.get("/mozo/{mozo_id}", response_model=List[ReservaOut])
def reservas_por_mozo(mozo_id: UUID, db: Session = Depends(get_db)):
    return db.query(Reserva).options(joinedload(Reserva.cliente), joinedload(Reserva.mozo), joinedload(Reserva.mesa)).filter(Reserva.mozo_id == mozo_id, Reserva.estado != "cancelada").order_by(Reserva.fecha, Reserva.hora_inicio).all()

@router.get("/disponibilidad/{mozo_id}/{fecha}")
def disponibilidad_mozo(mozo_id: UUID, fecha: date, db: Session = Depends(get_db)):
    dia_semana = fecha.weekday()
    horario = db.query(HorarioMozo).filter(HorarioMozo.mozo_id == mozo_id, HorarioMozo.dia_semana == dia_semana, HorarioMozo.activo == True).first()
    if not horario: return {"atiende": False, "bloques": []}

    reservas_del_dia = db.query(Reserva).filter(Reserva.mozo_id == mozo_id, Reserva.fecha == fecha, Reserva.estado != "cancelada").all()
    from datetime import datetime as dt, timedelta
    bloques = []
    cursor = dt.combine(fecha, horario.hora_inicio)
    fin_jornada = dt.combine(fecha, horario.hora_fin)

    while cursor + timedelta(minutes=30) <= fin_jornada:
        hora_bloque = cursor.time()
        fin_bloque = (cursor + timedelta(minutes=30)).time()
        ocupado = any(r.hora_inicio <= hora_bloque < r.hora_fin or r.hora_inicio < fin_bloque <= r.hora_fin for r in reservas_del_dia)
        reserva_info = None
        if ocupado:
            reserva = next((r for r in reservas_del_dia if r.hora_inicio <= hora_bloque < r.hora_fin), None)
            if reserva: reserva_info = {"cliente": f"{reserva.cliente.nombre} {reserva.cliente.apellido}" if reserva.cliente else "", "hora_inicio": str(reserva.hora_inicio)[:5], "hora_fin": str(reserva.hora_fin)[:5], "personas": reserva.num_personas}
        bloques.append({"hora": str(hora_bloque)[:5], "ocupado": ocupado, "reserva": reserva_info})
        cursor += timedelta(minutes=30)

    return {"atiende": True, "bloques": bloques}

@router.post("/", response_model=ReservaOut, status_code=201)
def nueva_reserva(data: ReservaCreate, db: Session = Depends(get_db)):
    return crear_reserva(db, data)

@router.patch("/{reserva_id}/estado", response_model=ReservaOut)
def cambiar_estado_reserva(reserva_id: UUID, data: ReservaUpdateEstado, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    reserva = db.query(Reserva).options(joinedload(Reserva.cliente), joinedload(Reserva.mozo), joinedload(Reserva.mesa)).filter(Reserva.id == reserva_id).first()
    if not reserva: raise HTTPException(status_code=404, detail="Reserva no encontrada")

    estados_validos = ["confirmada", "completada", "cancelada"]
    if data.estado not in estados_validos: raise HTTPException(status_code=400, detail=f"Estado inválido. Debe ser uno de: {estados_validos}")

    reserva.estado = data.estado
    db.commit()
    db.refresh(reserva)

    if data.estado == "cancelada":
        notificar_espera_por_cancelacion(db, reserva.fecha, reserva.hora_inicio)
        background_tasks.add_task(notificar_krono_restaurante, str(reserva.id))

    return reserva

@router.get("/cancelar/{token}", response_class=HTMLResponse)
def cancelar_por_token(token: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    reserva = db.query(Reserva).options(joinedload(Reserva.cliente), joinedload(Reserva.mozo), joinedload(Reserva.mesa)).filter(Reserva.cancel_token == token).first()
    if not reserva: return HTMLResponse(_html_error("Token inválido", "Este enlace de cancelación no es válido o ya fue usado."), status_code=404)
    if reserva.estado == "cancelada": return HTMLResponse(_html_info("Ya cancelada", "Esta reserva ya estaba cancelada anteriormente."), status_code=200)
    if reserva.estado == "completada": return HTMLResponse(_html_error("No cancelable", "Esta reserva ya fue completada y no se puede cancelar."), status_code=400)

    fecha = reserva.fecha
    hora_inicio = reserva.hora_inicio
    reserva.estado = "cancelada"
    reserva.cancel_token = None
    db.commit()

    notificar_espera_por_cancelacion(db, fecha, hora_inicio)

    # Detonamos el middleware en background
    background_tasks.add_task(notificar_krono_restaurante, str(reserva.id))

    nombre = reserva.cliente.nombre if reserva.cliente else "Cliente"
    personas = reserva.num_personas
    return HTMLResponse(_html_ok(nombre, str(fecha), str(hora_inicio)[:5], personas), status_code=200)

@router.get("/{reserva_id}", response_model=ReservaOut)
def obtener_reserva(reserva_id: UUID, db: Session = Depends(get_db)):
    reserva = db.query(Reserva).options(joinedload(Reserva.cliente), joinedload(Reserva.mozo), joinedload(Reserva.mesa)).filter(Reserva.id == reserva_id).first()
    if not reserva: raise HTTPException(status_code=404, detail="Reserva no encontrada")
    return reserva

def _base_html(titulo: str, icono: str, color: str, mensaje: str, detalle: str = "") -> str:
    return f"""<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{titulo}</title></head><body style="font-family:sans-serif;padding:20px;text-align:center;"><h1>{icono} {titulo}</h1><p>{mensaje}</p>{detalle}</body></html>"""

def _html_ok(nombre: str, fecha: str, hora: str, personas: int) -> str:
    return _base_html("Reserva cancelada", "✅", "#22c55e", "Tu reserva ha sido cancelada exitosamente.", f"<p>{nombre} - {fecha} {hora} - {personas} px</p>")

def _html_error(titulo: str, mensaje: str) -> str: return _base_html(titulo, "❌", "#ef4444", mensaje)
def _html_info(titulo: str, mensaje: str) -> str: return _base_html(titulo, "ℹ️", "#3b82f6", mensaje)