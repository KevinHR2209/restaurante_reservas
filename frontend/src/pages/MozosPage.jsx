import { useEffect, useState } from 'react'
import { getMozos, createMozo, updateMozo, deleteMozo } from '../services/api.js'
import Modal from '../components/Modal.jsx'

const VACÍO = { nombre: '', apellido: '', email: '', telefono: '', activo: true }

export default function MozosPage() {
  const [mozos, setMozos] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(VACÍO)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)

  const cargar = () => getMozos().then(r => setMozos(r.data)).catch(console.error).finally(() => setLoading(false))
  useEffect(() => { cargar() }, [])

  const abrir = (mozo = null) => {
    setEditId(mozo?.id || null)
    setForm(mozo ? { nombre: mozo.nombre, apellido: mozo.apellido, email: mozo.email, telefono: mozo.telefono || '', activo: mozo.activo } : VACÍO)
    setModal(true)
  }

  const guardar = async (e) => {
    e.preventDefault()
    try {
      editId ? await updateMozo(editId, form) : await createMozo(form)
      setModal(false)
      cargar()
    } catch (err) { alert(err.response?.data?.detail || 'Error') }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este mozo?')) return
    try { await deleteMozo(id); cargar() }
    catch (e) { alert(e.response?.data?.detail || 'Error al eliminar') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-stone-800">Mozos</h1>
          <p className="text-stone-500 mt-1">{mozos.length} mozos registrados</p>
        </div>
        <button onClick={() => abrir()} className="btn-primary">+ Nuevo mozo</button>
      </div>

      {loading ? <p className="text-stone-400">Cargando…</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mozos.map(m => (
            <div key={m.id} className="card flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-xl font-black text-orange-600">
                  {m.nombre[0]}{m.apellido[0]}
                </div>
                <div>
                  <p className="font-bold text-stone-800">{m.nombre} {m.apellido}</p>
                  <p className="text-xs text-stone-500">{m.email}</p>
                </div>
              </div>
              <div className="text-sm text-stone-500">
                {m.telefono && <p>📞 {m.telefono}</p>}
                <span className={`inline-flex items-center mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${ m.activo ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>{m.activo ? 'Activo' : 'Inactivo'}</span>
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
        <Modal title={editId ? 'Editar Mozo' : 'Nuevo Mozo'} onClose={() => setModal(false)}>
          <form onSubmit={guardar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Nombre</label><input className="input" required value={form.nombre} onChange={e => setForm(p=>({...p,nombre:e.target.value}))} /></div>
              <div><label className="label">Apellido</label><input className="input" required value={form.apellido} onChange={e => setForm(p=>({...p,apellido:e.target.value}))} /></div>
            </div>
            <div><label className="label">Email</label><input type="email" className="input" required value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} /></div>
            <div><label className="label">Teléfono</label><input className="input" value={form.telefono} onChange={e => setForm(p=>({...p,telefono:e.target.value}))} /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="activo" checked={form.activo} onChange={e => setForm(p=>({...p,activo:e.target.checked}))} className="w-4 h-4 accent-primary-600" />
              <label htmlFor="activo" className="text-sm font-medium text-stone-700">Mozo activo</label>
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
