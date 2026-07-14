import { useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import toast from 'react-hot-toast'
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
import { FileText } from 'lucide-react'
import { dashboardApi, projectsApi, recommendationsApi, reportsApi } from '../api/client'
import Badge from '../components/Badge'
import Button from '../components/Button'
import ChartCard from '../components/ChartCard'
import EmptyState from '../components/EmptyState'
import FormattedText from '../components/FormattedText'
import LoadingBlock from '../components/LoadingBlock'
import Modal from '../components/Modal'
import Select from '../components/Select'
import Table from '../components/Table'
import { formatDate } from '../utils/formatDate'

const COLORS = ['#1f7c62', '#2d9a7a', '#c4a574', '#547474', '#82d3b8']

export default function Reports() {
  const { setPageMeta } = useOutletContext()
  const [reports, setReports] = useState([])
  const [projects, setProjects] = useState([])
  const [recs, setRecs] = useState([])
  const [stats, setStats] = useState(null)
  const [projectId, setProjectId] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    setPageMeta({
      title: 'Reports & Analytics',
      subtitle: 'AI business reports plus live operational charts',
    })
  }, [setPageMeta])

  const load = async () => {
    setLoading(true)
    try {
      const [r, p, d, rec] = await Promise.all([
        reportsApi.list(),
        projectsApi.list(),
        dashboardApi.get(),
        recommendationsApi.list(),
      ])
      setReports(r.data)
      setProjects(p.data)
      setStats(d.data)
      setRecs(rec.data.slice(0, 4))
      if (p.data[0]) setProjectId(String(p.data[0].id))
    } catch {
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const generate = async () => {
    if (!projects.length) return toast.error('Create a project first')
    if (!projectId) return toast.error('Select a project')
    setGenerating(true)
    try {
      const { data } = await reportsApi.generate({ project_id: Number(projectId) })
      setReports((prev) => [data, ...prev])
      setSelected(data)
      const { data: dash } = await dashboardApi.get()
      setStats(dash)
      toast.success('Report generated')
    } catch {
      toast.error('Report generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const removeReport = async (id) => {
    if (!confirm('Delete this report?')) return
    try {
      await reportsApi.remove(id)
      setReports((prev) => prev.filter((r) => r.id !== id))
      toast.success('Report deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  const projectChart = useMemo(
    () => Object.entries(stats?.projects_by_status || {}).map(([name, value]) => ({ name, value })),
    [stats]
  )
  const taskChart = useMemo(
    () => Object.entries(stats?.tasks_by_status || {}).map(([name, value]) => ({ name, value })),
    [stats]
  )
  const priorityChart = useMemo(
    () => Object.entries(stats?.tasks_by_priority || {}).map(([name, value]) => ({ name, value })),
    [stats]
  )

  const columns = [
    { key: 'title', label: 'Report', render: (row) => <span className="font-medium text-ink-900">{row.title}</span> },
    {
      key: 'project',
      label: 'Project',
      render: (row) => projects.find((p) => p.id === row.project_id)?.name || `#${row.project_id}`,
    },
    { key: 'created_at', label: 'Created', render: (row) => formatDate(row.created_at) },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setSelected(row)}>
            Open
          </Button>
          <Button size="sm" variant="ghost" onClick={() => removeReport(row.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="page-stack">
      <div className="surface-card p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <Select
              label="Generate report for project"
              options={
                projects.length
                  ? projects.map((p) => ({ value: String(p.id), label: p.name }))
                  : [{ value: '', label: 'No projects yet' }]
              }
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={!projects.length}
            />
          </div>
          <Button loading={generating} onClick={generate} disabled={!projects.length}>
            Generate AI report
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingBlock label="Loading analytics…" rows={6} />
      ) : (
        <>
          <div className="grid gap-5 xl:grid-cols-2">
            <ChartPanel title="Project status" subtitle="Portfolio distribution" empty={!projectChart.length}>
              <PieChart>
                <Pie data={projectChart} dataKey="value" nameKey="name" outerRadius={90}>
                  {projectChart.map((entry, i) => (
                    <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ChartPanel>
            <ChartPanel title="Task completion" subtitle="By status" empty={!taskChart.length}>
              <BarChart data={taskChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3ebeb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#1f7c62" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartPanel>
            <ChartPanel
              title="Insights over time"
              subtitle="AI analyses saved"
              empty={!(stats?.insights_over_time || []).some((d) => d.count > 0)}
            >
              <LineChart data={stats?.insights_over_time || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3ebeb" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2d9a7a" strokeWidth={3} />
              </LineChart>
            </ChartPanel>
            <ChartPanel title="Priority breakdown" subtitle="Task priority mix" empty={!priorityChart.length}>
              <BarChart data={priorityChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3ebeb" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#c4a574" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartPanel>
          </div>

          <div>
            <h3 className="mb-3 section-title">Recent reports</h3>
            <Table columns={columns} rows={reports} empty="No reports yet. Generate one above." />
          </div>

          <div className="surface-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="section-title">Business recommendations</h3>
                <p className="mt-1 text-sm text-ink-600">Live suggestions from your portfolio state.</p>
              </div>
              <Link to="/app/recommendations">
                <Button size="sm" variant="secondary">
                  View all
                </Button>
              </Link>
            </div>
            {recs.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No recommendations yet"
                description="Refresh AI recommendations to populate this section."
              />
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {recs.map((rec) => (
                  <div key={rec.id} className="rounded-xl border border-ink-100 bg-ink-50/50 p-4">
                    <div className="flex gap-2">
                      <Badge>{rec.priority}</Badge>
                      <Badge tone="New">{rec.category}</Badge>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-ink-900">{rec.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-ink-600">{rec.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title || 'Report'} wide>
        {selected && (
          <div className="space-y-5">
            {[
              ['Executive summary', selected.executive_summary],
              ['Market opportunity', selected.market_opportunity],
              ['Product recommendations', selected.product_recommendations],
              ['Growth suggestions', selected.growth_suggestions],
              ['Operational improvements', selected.operational_improvements],
              ['Next steps', selected.next_steps],
            ].map(([title, text]) => (
              <div key={title}>
                <h4 className="mb-1 text-sm font-semibold text-ink-900">{title}</h4>
                <FormattedText text={text} />
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}

function ChartPanel({ title, subtitle, children, empty }) {
  return (
    <ChartCard title={title} subtitle={subtitle}>
      {empty ? (
        <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-ink-200 bg-ink-50/40 px-4 text-center text-sm text-ink-500">
          Not enough data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}
