import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMozos, getClientes, getDisponibilidad, createReserva, createCliente } from '../services/api.js'

export default function NuevaReservaPage() {
  const navigate = useNavigate()
  const [mozos, setMozos] = useState([])
  const [clientes, setClientes] = useState([])
  const [bloques, setBloques] = useState([])
  const [form, setForm] = useState({
    cliente_id: '', mozo_id: '', fecha: '', hora_inicio: '',
    num_personas: 2, notas: ''
  })
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', apellido: '', email: '', telefono: '' })
  const [modoNuevo, setModoNuevo] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([getMozos(), getClientes()])
      .then(([m, c]) => {
        setMozos(m.data.filter(x => x.activo))
        setClientes(c.data)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (form.mozo_id && form.fecha) {
      getDisponibilidad(form.mozo_id, form.fecha)
        .then(r => setBloques(r.data.atiende ? r.data.bloques : []))
        .catch(() => setBloques([]))
    } else {
      setBloques([])
    }
  }, [form.mozo_id, form.fecha])

  const crearClienteNuevo = async () => {
    try {
      const r = await createCliente(nuevoCliente)
      setClientes(prev => [...prev, r.data])
      setForm(prev => ({ ...prev, cliente_id: r.data.id }))
      setModoNuevo(false)
    } catch (e) {
      setError('Error al crear cliente: ' + (e.response?.data?.detail || e.message))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createReserva(form)
      navigate('/reservas')
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al crear la reserva')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-black text-stone-800">Nueva Reserva</h1>
        <p className="text-stone-500 mt-1">Completa los campos para crear una reserva</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="card space-y-5">
        {/* Cliente */}
        <div>
          <label className="label">Cliente</label>
          <div className="flex gap-2">
            <select
              className="input flex-1"
              value={form.cliente_id}
              onChange={e => setForm(p => ({ ...p, cliente_id: e.target.value }))}
              required
            >
              <option value="">Seleccionar cliente…</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} {c.apellido} — {c.email}</option>
              ))}
            </select>
            <button type="button" onClick={() => setModoNuevo(!modoNuevo)} className="btn-secondary text-sm">
              {modoNuevo ? 'Cancelar' : '+ Nuevo'}
            </button>
          </div>
        </div>

        {modoNuevo && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-orange-800">Crear nuevo cliente</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Nombre</label><input className="input" value={nuevoCliente.nombre} onChange={e => setNuevoCliente(p => ({...p, nombre: e.target.value}))} /></div>
              <div><label className="label">Apellido</label><input className="input" value={nuevoCliente.apellido} onChange={e => setNuevoCliente(p => ({...p, apellido: e.target.value}))} /></div>
              <div><label className="label">Email</label><input className="input" type="email" value={nuevoCliente.email} onChange={e => setNuevoCliente(p => ({...p, email: e.target.value}))} /></div>
              <div><label className="label">Teléfono</label><input className="input" value={nuevoCliente.telefono} onChange={e => setNuevoCliente(p => ({...p, telefono: e.target.value}))} /></div>
            </div>
            <button type="button" onClick={crearClienteNuevo} className="btn-primary text-sm">Crear y seleccionar</button>
          </div>
        )}

        {/* Mozo */}
        <div>
          <label className="label">Mozo asignado</label>
          <select className="input" value={form.mozo_id} onChange={e => setForm(p => ({...p, mozo_id: e.target.value}))} required>
            <option value="">Seleccionar mozo…</option>
            {mozos.map(m => <option key={m.id} value={m.id}>{m.nombre} {m.apellido}</option>)}
          </select>
        </div>

        {/* Fecha */}
        <div>
          <label className="label">Fecha</label>
          <input type="date" className="input" value={form.fecha} onChange={e => setForm(p => ({...p, fecha: e.target.value}))} required />
        </div>

        {/* Horario disponible */}
        {bloques.length > 0 && (
          <div>
            <label className="label">Hora de inicio</label>
            <div className="grid grid-cols-4 gap-2">
              {bloques.map(b => (
                <button
                  type="button"
                  key={b.hora}
                  disabled={b.ocupado}
                  onClick={() => setForm(p => ({...p, hora_inicio: b.hora}))}
                  className={`py-2 rounded-lg text-sm font-semibold border transition-all ${
                    b.ocupado
                      ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                      : form.hora_inicio === b.hora
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-primary-400'
                  }`}
                >
                  {b.hora}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Personas */}
        <div>
          <label className="label">Número de personas</label>
          <input type="number" min={1} max={20} className="input" value={form.num_personas} onChange={e => setForm(p => ({...p, num_personas: +e.target.value}))} required />
        </div>

        {/* Notas */}
        <div>
          <label className="label">Notas (opcional)</label>
          <textarea className="input resize-none" rows={3} value={form.notas} onChange={e => setForm(p => ({...p, notas: e.target.value}))} placeholder="Alergias, preferencias, ocasión especial…" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Creando…' : 'Crear reserva'}
          </button>
          <button type="button" onClick={() => navigate('/reservas')} className="btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>
  )
}
