import { useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CheckCircle2, FolderKanban, ListTodo, Sparkles } from 'lucide-react'
import { dashboardApi } from '../api/client'
import ChartCard from '../components/ChartCard'
import EmptyState from '../components/EmptyState'
import LoadingBlock from '../components/LoadingBlock'
import StatCard from '../components/StatCard'
import { formatDateTime } from '../utils/formatDate'

const PIE_COLORS = ['#1f7c62', '#2d9a7a', '#c4a574', '#547474', '#82d3b8']

export default function Dashboard() {
  const { setPageMeta } = useOutletContext()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setPageMeta({
      title: 'Dashboard',
      subtitle: 'Live portfolio metrics from your projects, tasks, insights, and reports',
    })
  }, [setPageMeta])

  useEffect(() => {
    dashboardApi
      .get()
      .then(({ data }) => {
        setStats(data)
        setError('')
      })
      .catch((err) => {
        setStats(null)
        setError(err.response?.data?.detail || 'Could not reach the API. Is the backend running?')
      })
      .finally(() => setLoading(false))
  }, [])

  const projectChart = useMemo(
    () => Object.entries(stats?.projects_by_status || {}).map(([name, value]) => ({ name, value })),
    [stats]
  )
  const taskChart = useMemo(
    () => Object.entries(stats?.tasks_by_status || {}).map(([name, value]) => ({ name, value })),
    [stats]
  )
  const hasInsightTrend = (stats?.insights_over_time || []).some((d) => d.count > 0)

  if (loading) {
    return (
      <div className="page-stack">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <LoadingBlock key={i} label="Loading metric" rows={2} />
          ))}
        </div>
        <LoadingBlock label="Loading charts" rows={5} />
      </div>
    )
  }

  if (!stats) {
    return (
      <EmptyState
        title="Dashboard unavailable"
        description={error || 'Start the API and run python seed.py, then refresh.'}
        action={
          <Link to="/login" className="text-sm font-semibold text-brand-700">
            Return to login
          </Link>
        }
      />
    )
  }

  return (
    <div className="page-stack">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total projects" value={stats.total_projects} icon={FolderKanban} hint="All statuses" />
        <StatCard label="AI insights" value={stats.total_insights} icon={Sparkles} hint="Generated & saved" />
        <StatCard label="Active tasks" value={stats.active_tasks} icon={ListTodo} hint="Pending + in progress" />
        <StatCard label="Reports" value={stats.completed_reports} icon={CheckCircle2} hint="Saved business reports" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Task progress" subtitle="Live distribution by status">
          {taskChart.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3ebeb" />
                <XAxis dataKey="name" tick={{ fill: '#547474', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#547474', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#1f7c62" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmpty message="Create tasks to populate this chart." />
          )}
        </ChartCard>

        <ChartCard title="Project status" subtitle="Portfolio mix from the database">
          {projectChart.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={projectChart} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {projectChart.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmpty message="Create a project to see status mix." />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard title="Insights over time" subtitle="AI analyses saved by day">
          {hasInsightTrend ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.insights_over_time}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3ebeb" />
                <XAxis dataKey="date" tick={{ fill: '#547474', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#547474', fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2d9a7a" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmpty message="Generate an insight to start the trend line." />
          )}
        </ChartCard>

        <div className="surface-card p-5">
          <h3 className="section-title">Recent activity</h3>
          <p className="mt-1 text-sm text-ink-500">Latest insights, reports, and tasks</p>
          <div className="mt-4 space-y-3">
            {(stats.recent_activity || []).length === 0 && (
              <p className="text-sm text-ink-500">No activity yet — generate an insight or create a task.</p>
            )}
            {(stats.recent_activity || []).map((item, idx) => (
              <div key={`${item.type}-${idx}`} className="rounded-xl border border-ink-100 bg-ink-50/50 px-3 py-3 transition hover:border-brand-200">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{item.type}</p>
                <p className="mt-1 text-sm font-medium text-ink-800">{item.title}</p>
                <p className="mt-1 text-xs text-ink-500">{formatDateTime(item.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ChartEmpty({ message }) {
  return (
    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-ink-200 bg-ink-50/40 px-4 text-center text-sm text-ink-500">
      {message}
    </div>
  )
}
