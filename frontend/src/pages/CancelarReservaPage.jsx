import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api.js'

export default function CancelarReservaPage() {
  const { token } = useParams()
  const [estado, setEstado] = useState('cargando') // cargando | ok | error | ya_cancelada
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    api.get(`/api/reservas/cancelar/${token}`)
      .then(() => setEstado('ok'))
      .catch(err => {
        const detail = err.response?.data?.detail || ''
        if (detail.includes('ya cancelada') || err.response?.status === 200) {
          setEstado('ya_cancelada')
        } else {
          setEstado('error')
          setMensaje(detail || 'Token inválido o reserva no encontrada.')
        }
      })
  }, [token])

  const config = {
    cargando:    { icon: '⏳', title: 'Procesando…',         msg: 'Por favor espera.',                        color: 'text-stone-600' },
    ok:          { icon: '✅', title: '¡Reserva cancelada!', msg: 'Tu reserva ha sido cancelada exitosamente.', color: 'text-green-600' },
    ya_cancelada:{ icon: 'ℹ️', title: 'Ya cancelada',        msg: 'Esta reserva ya había sido cancelada antes.', color: 'text-blue-600' },
    error:       { icon: '❌', title: 'Error',               msg: mensaje,                                      color: 'text-red-600' },
  }[estado]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center space-y-4">
        <span className="text-6xl">{config.icon}</span>
        <h1 className={`text-2xl font-black ${config.color}`}>{config.title}</h1>
        <p className="text-stone-500">{config.msg}</p>
        <a href="/reservar" className="btn-primary inline-block mt-4">Hacer nueva reserva</a>
      </div>
    </div>
  )
}
