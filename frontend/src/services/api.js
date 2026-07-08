import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Mesas ──────────────────────────────────────────────────────────────────
export const getMesas         = ()         => api.get('/api/mesas/')
export const createMesa       = (data)     => api.post('/api/mesas/', data)
export const updateMesa       = (id, data) => api.put(`/api/mesas/${id}`, data)
export const deleteMesa       = (id)       => api.delete(`/api/mesas/${id}`)

// ── Mozos ──────────────────────────────────────────────────────────────────
export const getMozos         = ()         => api.get('/api/mozos/')
export const createMozo       = (data)     => api.post('/api/mozos/', data)
export const updateMozo       = (id, data) => api.put(`/api/mozos/${id}`, data)
export const deleteMozo       = (id)       => api.delete(`/api/mozos/${id}`)

// ── Horarios ───────────────────────────────────────────────────────────────
export const getHorarios      = ()         => api.get('/api/horarios/')
export const createHorario    = (data)     => api.post('/api/horarios/', data)
export const deleteHorario    = (id)       => api.delete(`/api/horarios/${id}`)

// ── Platos ─────────────────────────────────────────────────────────────────
export const getPlatos        = ()         => api.get('/api/platos/')
export const createPlato      = (data)     => api.post('/api/platos/', data)
export const updatePlato      = (id, data) => api.put(`/api/platos/${id}`, data)
export const deletePlato      = (id)       => api.delete(`/api/platos/${id}`)

// ── Clientes ───────────────────────────────────────────────────────────────
export const getClientes      = ()         => api.get('/api/clientes/')
export const createCliente    = (data)     => api.post('/api/clientes/', data)
export const deleteCliente    = (id)       => api.delete(`/api/clientes/${id}`)

// ── Reservas ───────────────────────────────────────────────────────────────
export const getReservas      = ()              => api.get('/api/reservas/')
export const getReserva       = (id)            => api.get(`/api/reservas/${id}`)
export const createReserva    = (data)          => api.post('/api/reservas/', data)
export const updateEstadoReserva = (id, estado) => api.patch(`/api/reservas/${id}/estado`, { estado })
export const getDisponibilidad   = (mozo_id, fecha) => api.get(`/api/reservas/disponibilidad/${mozo_id}/${fecha}`)

export default api
