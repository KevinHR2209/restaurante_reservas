import { useState, useEffect } from 'react'
import {
  getListaEspera,
  agregarEspera,
  actualizarEstadoEspera,
  eliminarEspera,
} from '../services/api'

const badges = {
  esperando:  'bg-yellow-100 text-yellow-700 border border-yellow-300',
  notificado: 'bg-blue-100 text-blue-700 border border-blue-300',
  asignado:   'bg-green-100 text-green-700 border border-green-300',
  cancelado:  'bg-stone-100 text-stone-500 border border-stone-200',
}

const emptyForm = { nombre_cliente: '', telefono: '', cantidad_personas: 1, notas: '' }

export default function ListaEsperaPage() {
  const [lista, setLista]   = useState([])
  const [form, setForm]     = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)

  const fetchLista = async () => {
    try {
      const { data } = await getListaEspera()
      setLista(data)
    } catch (e) {
      setError('Error al cargar la lista de espera')
    }
  }

  useEffect(() => { fetchLista() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await agregarEspera({ ...form, cantidad_personas: Number(form.cantidad_personas) })
      setForm(emptyForm)
      await fetchLista()
    } catch (e) {
      setError('Error al agregar cliente')
    } finally {
      setLoading(false)
    }
  }

  const cambiarEstado = async (id, estado) => {
    await actualizarEstadoEspera(id, { estado })
    fetchLista()
  }

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este cliente de la lista de espera?')) return
    await eliminarEspera(id)
    fetchLista()
  }

  const esperando  = lista.filter(e => e.estado === 'esperando').length
  const notificado = lista.filter(e => e.estado === 'notificado').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Lista de Espera</h1>
          <p className="text-sm text-stone-500 mt-0.5">Gestiona los clientes que esperan una mesa disponible</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 text-center">
            <p className="text-xl font-bold text-yellow-700">{esperando}</p>
            <p className="text-xs text-yellow-600">Esperando</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-center">
            <p className="text-xl font-bold text-blue-700">{notificado}</p>
            <p className="text-xs text-blue-600">Notificados</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
        <h2 className="font-semibold text-stone-700 mb-4">➕ Agregar cliente a la espera</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Nombre del cliente *</label>
            <input
              required
              placeholder="Ej: Juan Pérez"
              value={form.nombre_cliente}
              onChange={e => setForm({ ...form, nombre_cliente: e.target.value })}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Teléfono</label>
            <input
              placeholder="Ej: +56 9 1234 5678"
              value={form.telefono}
              onChange={e => setForm({ ...form, telefono: e.target.value })}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Cantidad de personas *</label>
            <input
              type="number" min="1" max="20" required
              value={form.cantidad_personas}
              onChange={e => setForm({ ...form, cantidad_personas: e.target.value })}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Notas</label>
            <input
              placeholder="Ej: mesa exterior, silla de bebé…"
              value={form.notas}
              onChange={e => setForm({ ...form, notas: e.target.value })}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'Agregando…' : '+ Agregar a la espera'}
        </button>
      </form>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100 text-stone-500 text-xs uppercase tracking-wide">
              <th className="px-5 py-3 text-left font-semibold">#</th>
              <th className="px-5 py-3 text-left font-semibold">Cliente</th>
              <th className="px-5 py-3 text-left font-semibold">Teléfono</th>
              <th className="px-5 py-3 text-left font-semibold">Personas</th>
              <th className="px-5 py-3 text-left font-semibold">Ingreso</th>
              <th className="px-5 py-3 text-left font-semibold">Notas</th>
              <th className="px-5 py-3 text-left font-semibold">Estado</th>
              <th className="px-5 py-3 text-left font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {lista.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-10 text-stone-400">
                  <span className="text-3xl block mb-2">🪑</span>
                  Sin clientes en espera
                </td>
              </tr>
            )}
            {lista.map((entrada, i) => (
              <tr key={entrada.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-5 py-3 font-mono text-stone-400 text-xs">{i + 1}</td>
                <td className="px-5 py-3 font-semibold text-stone-800">{entrada.nombre_cliente}</td>
                <td className="px-5 py-3 text-stone-500">{entrada.telefono || '—'}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1">
                    <span>👤</span>
                    <span className="font-medium">{entrada.cantidad_personas}</span>
                  </span>
                </td>
                <td className="px-5 py-3 text-stone-500">
                  {new Date(entrada.fecha_ingreso).toLocaleTimeString('es-CL', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-5 py-3 text-stone-400 text-xs max-w-[140px] truncate">
                  {entrada.notas || '—'}
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badges[entrada.estado]}`}>
                    {entrada.estado}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {entrada.estado === 'esperando' && (
                      <button
                        onClick={() => cambiarEstado(entrada.id, 'notificado')}
                        className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1 rounded-lg transition-colors"
                      >
                        📢 Notificar
                      </button>
                    )}
                    {entrada.estado === 'notificado' && (
                      <button
                        onClick={() => cambiarEstado(entrada.id, 'asignado')}
                        className="text-xs bg-green-500 hover:bg-green-600 text-white px-2.5 py-1 rounded-lg transition-colors"
                      >
                        ✅ Asignar
                      </button>
                    )}
                    {(entrada.estado === 'esperando' || entrada.estado === 'notificado') && (
                      <button
                        onClick={() => cambiarEstado(entrada.id, 'cancelado')}
                        className="text-xs bg-stone-200 hover:bg-stone-300 text-stone-600 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      onClick={() => eliminar(entrada.id)}
                      className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
