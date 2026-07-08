import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getReservas, updateEstadoReserva } from '../services/api.js'
import EstadoBadge from '../components/EstadoBadge.jsx'

const ESTADOS = ['confirmada', 'completada', 'cancelada']

export default function ReservasPage() {
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todas')

  const cargar = () => {
    getReservas()
      .then(r => setReservas(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const cambiarEstado = async (id, estado) => {
    try {
      await updateEstadoReserva(id, estado)
      cargar()
    } catch (e) {
      alert('Error al cambiar estado: ' + (e.response?.data?.detail || e.message))
    }
  }

  const reservasFiltradas = filtro === 'todas'
    ? reservas
    : reservas.filter(r => r.estado === filtro)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-stone-800">Reservas</h1>
          <p className="text-stone-500 mt-1">{reservas.length} reservas en total</p>
        </div>
        <Link to="/reservas/nueva" className="btn-primary">+ Nueva reserva</Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {['todas', ...ESTADOS].map(e => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              filtro === e ? 'bg-primary-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {e.charAt(0).toUpperCase() + e.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-stone-400">Cargando reservas…</p>
      ) : reservasFiltradas.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-stone-400">No hay reservas con este filtro.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-stone-500">
                <th className="text-left py-2 pr-4 font-semibold">Cliente</th>
                <th className="text-left py-2 pr-4 font-semibold">Mozo</th>
                <th className="text-left py-2 pr-4 font-semibold">Mesa</th>
                <th className="text-left py-2 pr-4 font-semibold">Fecha</th>
                <th className="text-left py-2 pr-4 font-semibold">Hora</th>
                <th className="text-left py-2 pr-4 font-semibold">Personas</th>
                <th className="text-left py-2 pr-4 font-semibold">Estado</th>
                <th className="text-left py-2 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservasFiltradas.map(r => (
                <tr key={r.id} className="border-b border-stone-50 hover:bg-stone-50">
                  <td className="py-2 pr-4 font-medium">{r.cliente?.nombre} {r.cliente?.apellido}</td>
                  <td className="py-2 pr-4">{r.mozo?.nombre}</td>
                  <td className="py-2 pr-4">Mesa {r.mesa?.numero}</td>
                  <td className="py-2 pr-4">{r.fecha}</td>
                  <td className="py-2 pr-4">{r.hora_inicio?.slice(0,5)} – {r.hora_fin?.slice(0,5)}</td>
                  <td className="py-2 pr-4">{r.num_personas}</td>
                  <td className="py-2 pr-4"><EstadoBadge estado={r.estado} /></td>
                  <td className="py-2">
                    <select
                      value={r.estado}
                      onChange={e => cambiarEstado(r.id, e.target.value)}
                      className="text-xs border border-stone-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
