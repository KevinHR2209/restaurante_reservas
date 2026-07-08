import { useEffect, useState } from 'react'
import { getMozos, getDisponibilidad, createReserva, createCliente, getClientes } from '../services/api.js'

const PASOS = ['Datos personales', 'Elige mozo y fecha', 'Selecciona hora', 'Confirmar']

export default function ReservaPublicaPage() {
  const [paso, setPaso] = useState(0)
  const [mozos, setMozos] = useState([])
  const [bloques, setBloques] = useState([])
  const [cliente, setCliente] = useState({ nombre: '', apellido: '', email: '', telefono: '' })
  const [clienteId, setClienteId] = useState(null)
  const [form, setForm] = useState({ mozo_id: '', fecha: '', hora_inicio: '', num_personas: 2, notas: '' })
  const [mozoInfo, setMozoInfo] = useState(null)
  const [bloqueInfo, setBloqueInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getMozos().then(r => setMozos(r.data.filter(m => m.activo))).catch(console.error)
  }, [])

  useEffect(() => {
    if (form.mozo_id && form.fecha) {
      getDisponibilidad(form.mozo_id, form.fecha)
        .then(r => setBloques(r.data.atiende ? r.data.bloques : []))
        .catch(() => setBloques([]))
    }
  }, [form.mozo_id, form.fecha])

  const buscarOCrearCliente = async () => {
    try {
      const { data: lista } = await getClientes()
      const existente = lista.find(c => c.email.toLowerCase() === cliente.email.toLowerCase())
      if (existente) return existente.id
      const { data: nuevo } = await createCliente(cliente)
      return nuevo.id
    } catch (e) { throw new Error('Error al registrar cliente') }
  }

  const confirmar = async () => {
    setLoading(true)
    setError('')
    try {
      const cid = await buscarOCrearCliente()
      await createReserva({ ...form, cliente_id: cid })
      setExito(true)
    } catch (e) {
      setError(e.response?.data?.detail || e.message || 'Error al crear la reserva')
    } finally { setLoading(false) }
  }

  if (exito) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-black text-stone-800 mb-2">¡Reserva confirmada!</h1>
        <p className="text-stone-500 mb-2">Recibirás un correo de confirmación con los detalles.</p>
        <p className="text-stone-500 text-sm mb-6">También puedes cancelar desde el correo si lo necesitas.</p>
        <button onClick={() => { setExito(false); setPaso(0); setForm({mozo_id:'',fecha:'',hora_inicio:'',num_personas:2,notas:''}) }} className="btn-primary">
          Hacer otra reserva
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-8 py-6 text-white">
          <h1 className="text-2xl font-black">🍽️ Hacer una Reserva</h1>
          <p className="text-orange-100 text-sm mt-1">Paso {paso + 1} de {PASOS.length}: {PASOS[paso]}</p>
          <div className="flex gap-1 mt-3">
            {PASOS.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${ i <= paso ? 'bg-white' : 'bg-white/30'}`} />
            ))}
          </div>
        </div>

        <div className="p-8 space-y-5">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

          {/* Paso 0: Datos personales */}
          {paso === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Nombre</label><input className="input" value={cliente.nombre} onChange={e=>setCliente(p=>({...p,nombre:e.target.value}))} /></div>
                <div><label className="label">Apellido</label><input className="input" value={cliente.apellido} onChange={e=>setCliente(p=>({...p,apellido:e.target.value}))} /></div>
              </div>
              <div><label className="label">Email</label><input type="email" className="input" value={cliente.email} onChange={e=>setCliente(p=>({...p,email:e.target.value}))} /></div>
              <div><label className="label">Teléfono</label><input className="input" value={cliente.telefono} onChange={e=>setCliente(p=>({...p,telefono:e.target.value}))} /></div>
              <button disabled={!cliente.nombre||!cliente.email} onClick={() => setPaso(1)} className="btn-primary w-full disabled:opacity-50">Continuar →</button>
            </div>
          )}

          {/* Paso 1: Mozo y fecha */}
          {paso === 1 && (
            <div className="space-y-4">
              <div>
                <label className="label">Mozo preferido</label>
                <div className="grid grid-cols-1 gap-2">
                  {mozos.map(m => (
                    <button key={m.id} type="button" onClick={() => { setForm(p=>({...p,mozo_id:m.id})); setMozoInfo(m) }}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        form.mozo_id === m.id ? 'border-primary-500 bg-primary-50' : 'border-stone-200 hover:border-stone-300'
                      }`}>
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-black text-orange-600">{m.nombre[0]}{m.apellido[0]}</div>
                      <div><p className="font-semibold text-stone-800">{m.nombre} {m.apellido}</p></div>
                    </button>
                  ))}
                </div>
              </div>
              <div><label className="label">Fecha</label><input type="date" className="input" value={form.fecha} onChange={e=>setForm(p=>({...p,fecha:e.target.value}))} /></div>
              <div><label className="label">Número de personas</label><input type="number" min={1} max={20} className="input" value={form.num_personas} onChange={e=>setForm(p=>({...p,num_personas:+e.target.value}))} /></div>
              <div className="flex gap-3">
                <button onClick={() => setPaso(0)} className="btn-secondary flex-1">← Atrás</button>
                <button disabled={!form.mozo_id || !form.fecha} onClick={() => setPaso(2)} className="btn-primary flex-1 disabled:opacity-50">Continuar →</button>
              </div>
            </div>
          )}

          {/* Paso 2: Hora */}
          {paso === 2 && (
            <div className="space-y-4">
              {bloques.length === 0 ? (
                <p className="text-stone-500 text-sm text-center py-4">El mozo no tiene horario para esta fecha.</p>
              ) : (
                <div>
                  <label className="label">Horario disponible</label>
                  <div className="grid grid-cols-4 gap-2">
                    {bloques.map(b => (
                      <button key={b.hora} type="button" disabled={b.ocupado}
                        onClick={() => { setForm(p=>({...p,hora_inicio:b.hora})); setBloqueInfo(b) }}
                        className={`py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                          b.ocupado ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                            : form.hora_inicio === b.hora ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-primary-400'
                        }`}>
                        {b.hora}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div><label className="label">Notas (opcional)</label><textarea className="input resize-none" rows={2} value={form.notas} onChange={e=>setForm(p=>({...p,notas:e.target.value}))} placeholder="Alergias, ocasión especial…" /></div>
              <div className="flex gap-3">
                <button onClick={() => setPaso(1)} className="btn-secondary flex-1">← Atrás</button>
                <button disabled={!form.hora_inicio} onClick={() => setPaso(3)} className="btn-primary flex-1 disabled:opacity-50">Continuar →</button>
              </div>
            </div>
          )}

          {/* Paso 3: Confirmar */}
          {paso === 3 && (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 space-y-2 text-sm">
                <p>👤 <strong>{cliente.nombre} {cliente.apellido}</strong> ({cliente.email})</p>
                <p>🧑‍🍳 Mozo: <strong>{mozoInfo?.nombre} {mozoInfo?.apellido}</strong></p>
                <p>📅 Fecha: <strong>{form.fecha}</strong></p>
                <p>⏰ Hora: <strong>{form.hora_inicio}</strong></p>
                <p>👥 Personas: <strong>{form.num_personas}</strong></p>
                {form.notas && <p>📝 Notas: {form.notas}</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setPaso(2)} className="btn-secondary flex-1">← Atrás</button>
                <button onClick={confirmar} disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Confirmando…' : '✅ Confirmar reserva'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
