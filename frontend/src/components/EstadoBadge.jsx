export default function EstadoBadge({ estado }) {
  const map = {
    confirmada: 'bg-green-100 text-green-700',
    completada: 'bg-blue-100 text-blue-700',
    cancelada:  'bg-red-100 text-red-700',
    pendiente:  'bg-yellow-100 text-yellow-700',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[estado] || 'bg-stone-100 text-stone-600'}`}>
      {estado}
    </span>
  )
}
