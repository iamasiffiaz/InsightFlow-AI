export const PROJECT_STATUSES = ['Planning', 'Active', 'Paused', 'Completed']
export const TASK_PRIORITIES = ['Low', 'Medium', 'High']
export const TASK_STATUSES = ['Pending', 'In Progress', 'Completed']

export const BUSINESS_TYPES = [
  'SaaS',
  'Marketplace',
  'E-commerce',
  'EdTech',
  'FinTech',
  'Agency',
  'Services',
  'Other',
]

export const NAV_ITEMS = [
  { to: '/app', label: 'Dashboard', end: true },
  { to: '/app/projects', label: 'Projects' },
  { to: '/app/insights', label: 'AI Insights' },
  { to: '/app/reports', label: 'Reports' },
  { to: '/app/tasks', label: 'Tasks' },
  { to: '/app/recommendations', label: 'Recommendations' },
  { to: '/app/settings', label: 'Settings' },
]

export const STATUS_COLORS = {
  Planning: 'bg-sand-100 text-ink-700',
  Active: 'bg-brand-100 text-brand-800',
  Paused: 'bg-amber-100 text-amber-800',
  Completed: 'bg-ink-100 text-ink-700',
  Pending: 'bg-sand-100 text-ink-700',
  'In Progress': 'bg-sky-100 text-sky-800',
  Low: 'bg-ink-100 text-ink-600',
  Medium: 'bg-amber-100 text-amber-800',
  High: 'bg-rose-100 text-rose-800',
  New: 'bg-brand-100 text-brand-800',
}
