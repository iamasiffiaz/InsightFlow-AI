import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  Sparkles,
  FileText,
  CheckSquare,
  Lightbulb,
  Settings,
  Waves,
} from 'lucide-react'
import { NAV_ITEMS } from '../utils/constants'

const ICONS = {
  Dashboard: LayoutDashboard,
  Projects: FolderKanban,
  'AI Insights': Sparkles,
  Reports: FileText,
  Tasks: CheckSquare,
  Recommendations: Lightbulb,
  Settings: Settings,
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-ink-950/40 lg:hidden"
          aria-label="Close sidebar"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-ink-100 bg-[#f4f8f6] px-4 py-6 transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-white">
            <Waves size={20} />
          </div>
          <div>
            <p className="font-display text-lg font-semibold leading-tight text-ink-950">InsightFlow</p>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-brand-700">AI</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.label]
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-brand-700 text-white shadow-soft'
                      : 'text-ink-600 hover:bg-white hover:text-ink-900'
                  }`
                }
              >
                {Icon && <Icon size={18} />}
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-4 rounded-2xl border border-brand-100 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Portfolio MVP</p>
          <p className="mt-1 text-sm text-ink-600">AI SaaS dashboard for founders and operators.</p>
        </div>
      </aside>
    </>
  )
}
