import { useEffect, useState } from 'react'
import { getMesas, createMesa, updateMesa, deleteMesa } from '../services/api.js'
import Modal from '../components/Modal.jsx'

const VACÍO = { numero: '', capacidad: 4, zona: '', activa: true }

export default function MesasPage() {
  const [mesas, setMesas] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(VACÍO)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)

  const cargar = () => getMesas().then(r => setMesas(r.data)).catch(console.error).finally(() => setLoading(false))
  useEffect(() => { cargar() }, [])

  const abrir = (mesa = null) => {
    setEditId(mesa?.id || null)
    setForm(mesa ? { numero: mesa.numero, capacidad: mesa.capacidad, zona: mesa.zona || '', activa: mesa.activa } : VACÍO)
    setModal(true)
  }

  const guardar = async (e) => {
    e.preventDefault()
    try {
      editId ? await updateMesa(editId, form) : await createMesa(form)
      setModal(false)
      cargar()
    } catch (err) { alert(err.response?.data?.detail || 'Error') }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta mesa?')) return
    try { await deleteMesa(id); cargar() }
    catch (e) { alert(e.response?.data?.detail || 'Error al eliminar') }
  }

  const ZONAS = ['Interior', 'Terraza', 'Barra', 'VIP', 'Jardín']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-stone-800">Mesas</h1>
          <p className="text-stone-500 mt-1">{mesas.length} mesas configuradas</p>
        </div>
        <button onClick={() => abrir()} className="btn-primary">+ Nueva mesa</button>
      </div>

      {loading ? <p className="text-stone-400">Cargando…</p> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mesas.map(m => (
            <div key={m.id} className="card flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-stone-800">Mesa {m.numero}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ m.activa ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>{m.activa ? 'Activa' : 'Inactiva'}</span>
              </div>
              <div className="text-sm text-stone-500 space-y-1">
                <p>👥 Capacidad: <strong>{m.capacidad}</strong></p>
                {m.zona && <p>📍 Zona: <strong>{m.zona}</strong></p>}
              </div>
              <div className="flex gap-2 mt-auto">
                <button onClick={() => abrir(m)} className="flex-1 text-xs btn-secondary">Editar</button>
                <button onClick={() => eliminar(m.id)} className="flex-1 text-xs btn-danger">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={editId ? 'Editar Mesa' : 'Nueva Mesa'} onClose={() => setModal(false)}>
          <form onSubmit={guardar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Número</label><input type="number" className="input" required value={form.numero} onChange={e => setForm(p=>({...p,numero:+e.target.value}))} /></div>
              <div><label className="label">Capacidad</label><input type="number" min={1} className="input" required value={form.capacidad} onChange={e => setForm(p=>({...p,capacidad:+e.target.value}))} /></div>
            </div>
            <div>
              <label className="label">Zona</label>
              <select className="input" value={form.zona} onChange={e => setForm(p=>({...p,zona:e.target.value}))}>
                <option value="">Sin zona</option>
                {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="activa" checked={form.activa} onChange={e => setForm(p=>({...p,activa:e.target.checked}))} className="w-4 h-4 accent-primary-600" />
              <label htmlFor="activa" className="text-sm font-medium text-stone-700">Mesa activa</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1">Guardar</button>
              <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancelar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
