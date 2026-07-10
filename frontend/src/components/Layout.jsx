import { Outlet, NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',      icon: '🏠' },
  { to: '/reservas',     label: 'Reservas',        icon: '📅' },
  { to: '/lista-espera', label: 'Lista de Espera', icon: '⏳' },
  { to: '/clientes',     label: 'Clientes',        icon: '👥' },
  { to: '/mozos',        label: 'Mozos',           icon: '🧑‍🍳' },
  { to: '/mesas',        label: 'Mesas',           icon: '🪑' },
  { to: '/platos',       label: 'Platos',          icon: '🍽️' },
  { to: '/horarios',     label: 'Horarios',        icon: '⏰' },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 flex flex-col shadow-sm">
        <div className="px-6 py-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍽️</span>
            <div>
              <h1 className="font-black text-stone-800 text-lg leading-tight">Restaurante</h1>
              <p className="text-xs text-stone-400 font-medium">Panel de Gestión</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-800'
                }`
              }
            >
              <span className="text-lg">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-stone-100">
          <a
            href="/reservar"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-primary-600 hover:text-primary-800 font-medium transition-colors"
          >
            <span>🔗</span> Ver reserva pública
          </a>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
