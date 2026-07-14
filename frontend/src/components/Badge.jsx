import { STATUS_COLORS } from '../utils/constants'

export default function Badge({ children, tone }) {
  const color = STATUS_COLORS[tone || children] || 'bg-ink-100 text-ink-700'
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${color}`}>
      {children}
    </span>
  )
}
