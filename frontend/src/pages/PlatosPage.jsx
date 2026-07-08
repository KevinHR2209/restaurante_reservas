import { useEffect, useState } from 'react'
import { getPlatos, createPlato, updatePlato, deletePlato } from '../services/api.js'
import Modal from '../components/Modal.jsx'

const VACÍO = { nombre: '', descripcion: '', categoria: '', precio: '', activo: true }
const CATEGORÍAS = ['Entradas', 'Sopas', 'Platos de fondo', 'Pastas', 'Carnes', 'Pescados', 'Postres', 'Bebidas']

export default function PlatosPage() {
  const [platos, setPlatos] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(VACÍO)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)

  const cargar = () => getPlatos().then(r => setPlatos(r.data)).catch(console.error).finally(() => setLoading(false))
  useEffect(() => { cargar() }, [])

  const abrir = (plato = null) => {
    setEditId(plato?.id || null)
    setForm(plato ? { nombre: plato.nombre, descripcion: plato.descripcion || '', categoria: plato.categoria || '', precio: plato.precio, activo: plato.activo } : VACÍO)
    setModal(true)
  }

  const guardar = async (e) => {
    e.preventDefault()
    try {
      editId ? await updatePlato(editId, form) : await createPlato(form)
      setModal(false)
      cargar()
    } catch (err) { alert(err.response?.data?.detail || 'Error') }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este plato?')) return
    try { await deletePlato(id); cargar() }
    catch (e) { alert(e.response?.data?.detail || 'Error') }
  }

  const agrupadoPorCat = platos.reduce((acc, p) => {
    const cat = p.categoria || 'Sin categoría'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-stone-800">Platos</h1>
          <p className="text-stone-500 mt-1">{platos.length} platos en el menú</p>
        </div>
        <button onClick={() => abrir()} className="btn-primary">+ Nuevo plato</button>
      </div>

      {loading ? <p className="text-stone-400">Cargando…</p> : (
        <div className="space-y-6">
          {Object.entries(agrupadoPorCat).map(([cat, lista]) => (
            <div key={cat}>
              <h2 className="text-base font-bold text-stone-600 mb-3 border-b border-stone-200 pb-1">{cat}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {lista.map(p => (
                  <div key={p.id} className="card flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-stone-800">{p.nombre}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ p.activo ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-400'}`}>{p.activo ? 'Disponible' : 'Agotado'}</span>
                    </div>
                    {p.descripcion && <p className="text-xs text-stone-500">{p.descripcion}</p>}
                    <p className="text-primary-700 font-black text-lg">${p.precio?.toLocaleString('es-CL')}</p>
                    <div className="flex gap-2 mt-auto">
                      <button onClick={() => abrir(p)} className="flex-1 text-xs btn-secondary">Editar</button>
                      <button onClick={() => eliminar(p.id)} className="flex-1 text-xs btn-danger">Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={editId ? 'Editar Plato' : 'Nuevo Plato'} onClose={() => setModal(false)}>
          <form onSubmit={guardar} className="space-y-4">
            <div><label className="label">Nombre</label><input className="input" required value={form.nombre} onChange={e => setForm(p=>({...p,nombre:e.target.value}))} /></div>
            <div><label className="label">Descripción</label><textarea className="input resize-none" rows={2} value={form.descripcion} onChange={e => setForm(p=>({...p,descripcion:e.target.value}))} /></div>
            <div>
              <label className="label">Categoría</label>
              <select className="input" value={form.categoria} onChange={e => setForm(p=>({...p,categoria:e.target.value}))}>
                <option value="">Sin categoría</option>
                {CATEGORÍAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="label">Precio (CLP)</label><input type="number" min={0} className="input" required value={form.precio} onChange={e => setForm(p=>({...p,precio:+e.target.value}))} /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="activo" checked={form.activo} onChange={e => setForm(p=>({...p,activo:e.target.checked}))} className="w-4 h-4 accent-primary-600" />
              <label htmlFor="activo" className="text-sm font-medium text-stone-700">Disponible en menú</label>
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
