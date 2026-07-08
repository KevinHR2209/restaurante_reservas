import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ReservasPage from './pages/ReservasPage.jsx'
import NuevaReservaPage from './pages/NuevaReservaPage.jsx'
import ClientesPage from './pages/ClientesPage.jsx'
import MesasPage from './pages/MesasPage.jsx'
import MozosPage from './pages/MozosPage.jsx'
import PlatosPage from './pages/PlatosPage.jsx'
import HorarioPage from './pages/HorarioPage.jsx'
import ReservaPublicaPage from './pages/ReservaPublicaPage.jsx'
import CancelarReservaPage from './pages/CancelarReservaPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/reservar" element={<ReservaPublicaPage />} />
        <Route path="/cancelar/:token" element={<CancelarReservaPage />} />

        {/* Panel de administración */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="reservas" element={<ReservasPage />} />
          <Route path="reservas/nueva" element={<NuevaReservaPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="mesas" element={<MesasPage />} />
          <Route path="mozos" element={<MozosPage />} />
          <Route path="platos" element={<PlatosPage />} />
          <Route path="horarios" element={<HorarioPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
