import { Menu, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from './Button'

export default function Topbar({ title, subtitle, onMenu }) {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('insightflow_user') || 'null')

  const logout = () => {
    localStorage.removeItem('insightflow_token')
    localStorage.removeItem('insightflow_user')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 border-b border-ink-100/80 bg-[#f7faf9]/90 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="shrink-0 rounded-xl border border-ink-200 bg-white p-2 text-ink-700 lg:hidden"
            onClick={onMenu}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="truncate font-display text-xl font-semibold text-ink-950 sm:text-2xl">{title}</h1>
            {subtitle && <p className="truncate text-sm text-ink-500">{subtitle}</p>}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-ink-900">{user?.full_name || 'Demo User'}</p>
            <p className="text-xs text-ink-500">{user?.email || 'demo@insightflow.ai'}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={logout}>
            <LogOut size={14} />
            <span className="hidden sm:inline">Log out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
