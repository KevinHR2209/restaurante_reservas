import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getReservas, getMesas, getMozos, getClientes } from '../services/api.js'

export default function Dashboard() {
  const [stats, setStats] = useState({ reservas: 0, mesas: 0, mozos: 0, clientes: 0 })
  const [reservasHoy, setReservasHoy] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0]
    Promise.all([getReservas(), getMesas(), getMozos(), getClientes()])
      .then(([r, m, mo, c]) => {
        const reservas = r.data
        setStats({
          reservas: reservas.filter(x => x.estado !== 'cancelada').length,
          mesas:    m.data.length,
          mozos:    mo.data.filter(x => x.activo).length,
          clientes: c.data.length,
        })
        setReservasHoy(reservas.filter(x => x.fecha === hoy && x.estado !== 'cancelada'))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Reservas activas', value: stats.reservas, icon: '📅', color: 'bg-orange-50 text-orange-600', to: '/reservas' },
    { label: 'Mesas',            value: stats.mesas,    icon: '🪑', color: 'bg-amber-50 text-amber-600',  to: '/mesas' },
    { label: 'Mozos activos',    value: stats.mozos,    icon: '🧑‍🍳', color: 'bg-green-50 text-green-600',  to: '/mozos' },
    { label: 'Clientes',         value: stats.clientes, icon: '👥', color: 'bg-blue-50 text-blue-600',    to: '/clientes' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-stone-800">Dashboard</h1>
        <p className="text-stone-500 mt-1">Resumen del sistema de reservas</p>
      </div>

      {loading ? (
        <p className="text-stone-400">Cargando estadísticas…</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ label, value, icon, color, to }) => (
            <Link key={label} to={to} className="card hover:shadow-md transition-shadow">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl text-2xl ${color} mb-3`}>{icon}</div>
              <p className="text-3xl font-black text-stone-800">{value}</p>
              <p className="text-sm text-stone-500 mt-1">{label}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-stone-800">Reservas de hoy</h2>
          <Link to="/reservas/nueva" className="btn-primary text-sm">+ Nueva reserva</Link>
        </div>
        {reservasHoy.length === 0 ? (
          <p className="text-stone-400 text-sm py-4 text-center">No hay reservas activas para hoy.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-stone-500">
                  <th className="text-left py-2 pr-4 font-semibold">Cliente</th>
                  <th className="text-left py-2 pr-4 font-semibold">Mozo</th>
                  <th className="text-left py-2 pr-4 font-semibold">Mesa</th>
                  <th className="text-left py-2 pr-4 font-semibold">Hora</th>
                  <th className="text-left py-2 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {reservasHoy.map(r => (
                  <tr key={r.id} className="border-b border-stone-50 hover:bg-stone-50">
                    <td className="py-2 pr-4">{r.cliente?.nombre} {r.cliente?.apellido}</td>
                    <td className="py-2 pr-4">{r.mozo?.nombre} {r.mozo?.apellido}</td>
                    <td className="py-2 pr-4">Mesa {r.mesa?.numero}</td>
                    <td className="py-2 pr-4">{r.hora_inicio?.slice(0,5)}</td>
                    <td className="py-2">
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full capitalize">{r.estado}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
