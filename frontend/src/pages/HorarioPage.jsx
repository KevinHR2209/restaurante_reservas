import { useEffect, useState } from 'react'
import { getMozos, getHorarios, createHorario, deleteHorario } from '../services/api.js'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function HorarioPage() {
  const [mozos, setMozos] = useState([])
  const [horarios, setHorarios] = useState([])
  const [mozoSel, setMozoSel] = useState('')
  const [form, setForm] = useState({ mozo_id: '', dia_semana: 0, hora_inicio: '09:00', hora_fin: '22:00' })
  const [loading, setLoading] = useState(true)

  const cargar = () => {
    Promise.all([getMozos(), getHorarios()])
      .then(([m, h]) => {
        setMozos(m.data)
        setHorarios(h.data)
        if (m.data.length && !mozoSel) setMozoSel(m.data[0].id)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const horariosMozo = horarios.filter(h => h.mozo_id === mozoSel)

  const agregar = async (e) => {
    e.preventDefault()
    try {
      await createHorario({ ...form, mozo_id: mozoSel })
      cargar()
    } catch (err) { alert(err.response?.data?.detail || 'Error') }
  }

  const eliminar = async (id) => {
    try { await deleteHorario(id); cargar() }
    catch (e) { alert(e.response?.data?.detail || 'Error') }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-stone-800">Horarios</h1>
        <p className="text-stone-500 mt-1">Configura los días y horas de atención por mozo</p>
      </div>

      {/* Selector de mozo */}
      <div className="card">
        <label className="label">Seleccionar Mozo</label>
        <select className="input max-w-xs" value={mozoSel} onChange={e => setMozoSel(e.target.value)}>
          {mozos.map(m => <option key={m.id} value={m.id}>{m.nombre} {m.apellido}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Horarios actuales */}
        <div className="card">
          <h2 className="font-bold text-stone-800 mb-4">Días configurados</h2>
          {loading ? <p className="text-stone-400 text-sm">Cargando…</p> : horariosMozo.length === 0 ? (
            <p className="text-stone-400 text-sm">Sin horarios configurados.</p>
          ) : (
            <div className="space-y-2">
              {horariosMozo.sort((a,b) => a.dia_semana - b.dia_semana).map(h => (
                <div key={h.id} className="flex items-center justify-between bg-stone-50 rounded-xl px-4 py-2">
                  <div>
                    <span className="font-semibold text-stone-700">{DIAS[h.dia_semana]}</span>
                    <span className="text-stone-500 text-sm ml-2">{h.hora_inicio.slice(0,5)} – {h.hora_fin.slice(0,5)}</span>
                  </div>
                  <button onClick={() => eliminar(h.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Eliminar</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agregar horario */}
        <div className="card">
          <h2 className="font-bold text-stone-800 mb-4">Agregar día</h2>
          <form onSubmit={agregar} className="space-y-4">
            <div>
              <label className="label">Día de la semana</label>
              <select className="input" value={form.dia_semana} onChange={e => setForm(p=>({...p,dia_semana:+e.target.value}))}>
                {DIAS.map((d,i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Hora inicio</label><input type="time" className="input" value={form.hora_inicio} onChange={e => setForm(p=>({...p,hora_inicio:e.target.value}))} /></div>
              <div><label className="label">Hora fin</label><input type="time" className="input" value={form.hora_fin} onChange={e => setForm(p=>({...p,hora_fin:e.target.value}))} /></div>
            </div>
            <button type="submit" className="btn-primary w-full">Agregar horario</button>
          </form>
        </div>
      </div>
    </div>
  )
}
