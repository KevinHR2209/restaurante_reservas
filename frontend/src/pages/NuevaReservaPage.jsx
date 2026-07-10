import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMozos, getClientes, getDisponibilidad, createReserva, createCliente, agregarEspera } from '../services/api.js'

const emptyEspera = { nombre_cliente: '', telefono: '', cantidad_personas: 2, notas: '' }

function parseApiError(e) {
  const detail = e?.response?.data?.detail
  if (!detail) return String(e?.message || 'Error desconocido')
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map(d => {
      const campo = Array.isArray(d.loc) ? d.loc.slice(1).join(' > ') : ''
      return campo ? `${campo}: ${d.msg}` : d.msg
    }).join(' | ')
  }
  return JSON.stringify(detail)
}

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

  const [modalEspera, setModalEspera] = useState(false)
  const [horaEspera, setHoraEspera] = useState(null)
  const [formEspera, setFormEspera] = useState(emptyEspera)
  const [loadingEspera, setLoadingEspera] = useState(false)
  const [exitoEspera, setExitoEspera] = useState(false)

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
      setError(parseApiError(e))
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
      setError(parseApiError(e))
    } finally {
      setLoading(false)
    }
  }

  const abrirEspera = (hora = null) => {
    setHoraEspera(hora)
    setFormEspera({ ...emptyEspera, cantidad_personas: form.num_personas })
    setExitoEspera(false)
    setModalEspera(true)
  }

  const confirmarEspera = async () => {
    setLoadingEspera(true)
    try {
      const nota = horaEspera
        ? `Hora deseada: ${horaEspera} — ${form.fecha}`
        : form.fecha ? `Fecha deseada: ${form.fecha} (hora flexible)` : 'Sin fecha'
      await agregarEspera({
        ...formEspera,
        cantidad_personas: Number(formEspera.cantidad_personas),
        notas: nota + (formEspera.notas ? ' | ' + formEspera.notas : ''),
      })
      setExitoEspera(true)
    } catch (e) {
      setError(parseApiError(e))
      setModalEspera(false)
    } finally {
      setLoadingEspera(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-black text-stone-800">Nueva Reserva</h1>
        <p className="text-stone-500 mt-1">Completa los campos para crear una reserva</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {String(error)}
        </div>
      )}

      {/* Modal lista de espera */}
      {modalEspera && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8">
            {exitoEspera ? (
              <div className="text-center">
                <div className="text-5xl mb-3">⏳</div>
                <h2 className="text-xl font-black text-stone-800 mb-2">¡Agregado a lista de espera!</h2>
                <p className="text-stone-500 text-sm mb-6">
                  {horaEspera
                    ? <>Anotado para las <strong>{horaEspera}</strong> del <strong>{form.fecha}</strong>.</>
                    : <>Anotado para <strong>{form.fecha || 'fecha sin especificar'}</strong>.</>
                  }
                </p>
                <div className="flex gap-3">
                  <button onClick={() => { setModalEspera(false); navigate('/lista-espera') }} className="btn-secondary flex-1">Ver lista</button>
                  <button onClick={() => setModalEspera(false)} className="btn-primary flex-1">Cerrar</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-black text-stone-800">Agregar a lista de espera</h2>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {horaEspera
                        ? <>⏰ <span className="font-semibold text-orange-600">{horaEspera}</span> — {form.fecha || 'sin fecha'}</>
                        : <>📅 {form.fecha || 'sin fecha'} — hora flexible</>
                      }
                    </p>
                  </div>
                  <button onClick={() => setModalEspera(false)} className="text-stone-400 hover:text-stone-600 text-2xl leading-none">×</button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="label">Nombre del cliente *</label>
                    <input required className="input" placeholder="Juan Pérez" value={formEspera.nombre_cliente} onChange={e => setFormEspera(p => ({ ...p, nombre_cliente: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Teléfono</label>
                    <input className="input" placeholder="+56 9 1234 5678" value={formEspera.telefono} onChange={e => setFormEspera(p => ({ ...p, telefono: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Personas</label>
                    <input type="number" min={1} max={20} className="input" value={formEspera.cantidad_personas} onChange={e => setFormEspera(p => ({ ...p, cantidad_personas: +e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Notas adicionales</label>
                    <input className="input" placeholder="Mesa exterior, ocasión especial…" value={formEspera.notas} onChange={e => setFormEspera(p => ({ ...p, notas: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setModalEspera(false)} className="btn-secondary flex-1">Cancelar</button>
                  <button
                    onClick={confirmarEspera}
                    disabled={loadingEspera || !formEspera.nombre_cliente.trim()}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {loadingEspera ? 'Guardando…' : '⏳ Agregar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        {/* Cliente */}
        <div>
          <label className="label">Cliente</label>
          <div className="flex gap-2">
            <select className="input flex-1" value={form.cliente_id} onChange={e => setForm(p => ({ ...p, cliente_id: e.target.value }))} required>
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

        {/* Horario */}
        {bloques.length > 0 && (
          <div>
            <label className="label">Hora de inicio</label>
            <p className="text-xs text-stone-400 mb-2">Los horarios en gris ya tienen una reserva, pero igual puedes seleccionarlos o agregarlos a lista de espera.</p>
            <div className="grid grid-cols-4 gap-2">
              {bloques.map(b => (
                <div key={b.hora} className="flex flex-col gap-1">
                  {/* Botón hora */}
                  <button
                    type="button"
                    onClick={() => setForm(p => ({...p, hora_inicio: b.hora}))}
                    className={`w-full py-2 rounded-lg text-sm font-semibold border transition-all ${
                      form.hora_inicio === b.hora
                        ? 'bg-primary-600 text-white border-primary-600'
                        : b.ocupado
                          ? 'bg-stone-100 text-stone-500 border-stone-300 hover:border-orange-400 hover:bg-orange-50'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-primary-400'
                    }`}
                  >
                    {b.hora}
                    {b.ocupado && <span className="block text-[9px] leading-none mt-0.5 text-stone-400">ocupado</span>}
                  </button>
                  {/* Botón espera — solo visible si está ocupado */}
                  {b.ocupado && (
                    <button
                      type="button"
                      onClick={() => abrirEspera(b.hora)}
                      className="w-full py-1 rounded-lg text-[10px] font-semibold border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all"
                    >
                      ⏳ espera
                    </button>
                  )}
                </div>
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
          <button type="button" onClick={() => abrirEspera(form.hora_inicio || null)} className="btn-secondary">
            ⏳ Lista de espera
          </button>
          <button type="button" onClick={() => navigate('/reservas')} className="btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>
  )
}
