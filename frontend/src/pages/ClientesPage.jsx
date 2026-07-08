import { useEffect, useState } from 'react'
import { getClientes, createCliente, deleteCliente } from '../services/api.js'
import Modal from '../components/Modal.jsx'

const VACÍO = { nombre: '', apellido: '', email: '', telefono: '' }

export default function ClientesPage() {
  const [clientes, setClientes] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(VACÍO)
  const [loading, setLoading] = useState(true)

  const cargar = () => getClientes().then(r => setClientes(r.data)).catch(console.error).finally(() => setLoading(false))
  useEffect(() => { cargar() }, [])

  const guardar = async (e) => {
    e.preventDefault()
    try {
      await createCliente(form)
      setModal(false)
      setForm(VACÍO)
      cargar()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al guardar')
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este cliente?')) return
    try { await deleteCliente(id); cargar() }
    catch (e) { alert(e.response?.data?.detail || 'Error al eliminar') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-stone-800">Clientes</h1>
          <p className="text-stone-500 mt-1">{clientes.length} clientes registrados</p>
        </div>
        <button onClick={() => { setForm(VACÍO); setModal(true) }} className="btn-primary">+ Nuevo cliente</button>
      </div>

      {loading ? <p className="text-stone-400">Cargando…</p> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-stone-500">
                {['Nombre', 'Email', 'Teléfono', 'Acciones'].map(h => <th key={h} className="text-left py-2 pr-4 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {clientes.map(c => (
                <tr key={c.id} className="border-b border-stone-50 hover:bg-stone-50">
                  <td className="py-2 pr-4 font-medium">{c.nombre} {c.apellido}</td>
                  <td className="py-2 pr-4">{c.email}</td>
                  <td className="py-2 pr-4">{c.telefono || '—'}</td>
                  <td className="py-2">
                    <button onClick={() => eliminar(c.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title="Nuevo Cliente" onClose={() => setModal(false)}>
          <form onSubmit={guardar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Nombre</label><input className="input" required value={form.nombre} onChange={e => setForm(p=>({...p,nombre:e.target.value}))} /></div>
              <div><label className="label">Apellido</label><input className="input" required value={form.apellido} onChange={e => setForm(p=>({...p,apellido:e.target.value}))} /></div>
            </div>
            <div><label className="label">Email</label><input type="email" className="input" required value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} /></div>
            <div><label className="label">Teléfono</label><input className="input" value={form.telefono} onChange={e => setForm(p=>({...p,telefono:e.target.value}))} /></div>
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
