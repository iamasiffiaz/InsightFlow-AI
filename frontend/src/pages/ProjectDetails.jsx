import { useEffect, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { insightsApi, projectsApi, reportsApi, tasksApi } from '../api/client'
import Badge from '../components/Badge'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import FormattedText from '../components/FormattedText'
import LoadingBlock from '../components/LoadingBlock'
import Modal from '../components/Modal'
import { formatDate } from '../utils/formatDate'

export default function ProjectDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setPageMeta } = useOutletContext()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [insights, setInsights] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [suggestedOnce, setSuggestedOnce] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [projectRes, tasksRes, insightsRes, reportsRes] = await Promise.all([
          projectsApi.get(id),
          tasksApi.list({ project_id: id }),
          insightsApi.list({ project_id: id }),
          reportsApi.list({ project_id: id }),
        ])
        setProject(projectRes.data)
        setTasks(tasksRes.data)
        setInsights(insightsRes.data)
        setReports(reportsRes.data)
        setPageMeta({
          title: projectRes.data.name,
          subtitle: `${projectRes.data.business_type} · ${projectRes.data.status}`,
        })
      } catch {
        toast.error('Project not found')
        navigate('/app/projects')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate, setPageMeta])

  useEffect(() => {
    if (searchParams.get('report') && reports[0]) {
      setSelectedReport(reports[0])
    }
  }, [searchParams, reports])

  const generateReport = async () => {
    setBusy(true)
    try {
      const { data } = await reportsApi.generate({ project_id: Number(id) })
      setReports((prev) => [data, ...prev])
      setSelectedReport(data)
      toast.success('Business report generated')
    } catch {
      toast.error('Report generation failed')
    } finally {
      setBusy(false)
    }
  }

  const suggestTasks = async () => {
    if (suggestedOnce && !confirm('Add another batch of AI task suggestions?')) return
    setBusy(true)
    try {
      const { data } = await tasksApi.suggest(id)
      for (const suggestion of data.suggestions || []) {
        await tasksApi.create({
          title: suggestion.title,
          description: suggestion.description || '',
          priority: suggestion.priority || 'Medium',
          project_id: Number(id),
          status: 'Pending',
          source: 'ai',
        })
      }
      const { data: refreshed } = await tasksApi.list({ project_id: id })
      setTasks(refreshed)
      setSuggestedOnce(true)
      toast.success('AI task suggestions added')
    } catch {
      toast.error('Could not suggest tasks')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <LoadingBlock label="Loading project…" rows={6} />
  if (!project) {
    return <EmptyState title="Project not found" description="It may have been deleted." />
  }

  return (
    <div className="page-stack">
      <div className="surface-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{project.status}</Badge>
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">{project.business_type}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-700">{project.description}</p>
            <p className="mt-3 text-sm font-medium text-ink-900">Goal: {project.goal}</p>
            <p className="mt-2 text-xs text-ink-500">Created {formatDate(project.created_at)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={`/app/insights?project=${id}`}>
              <Button variant="secondary">Generate insight</Button>
            </Link>
            <Button loading={busy} onClick={generateReport}>
              Generate report
            </Button>
            <Button variant="secondary" loading={busy} onClick={suggestTasks}>
              Suggest tasks
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Section title="Tasks" count={tasks.length} link="/app/tasks">
          {tasks.slice(0, 6).map((task) => (
            <Item key={task.id} title={task.title} meta={<Badge>{task.status}</Badge>} />
          ))}
          {!tasks.length && <p className="text-sm text-ink-500">No tasks linked yet.</p>}
        </Section>
        <Section title="Insights" count={insights.length} link={`/app/insights?project=${id}`}>
          {insights.slice(0, 4).map((insight) => (
            <Item key={insight.id} title={insight.summary} meta={<Badge>{insight.priority_level}</Badge>} />
          ))}
          {!insights.length && <p className="text-sm text-ink-500">No insights for this project.</p>}
        </Section>
        <Section title="Reports" count={reports.length} link="/app/reports">
          {reports.slice(0, 4).map((report) => (
            <button
              key={report.id}
              type="button"
              className="w-full rounded-xl border border-ink-100 bg-ink-50/40 px-3 py-3 text-left transition hover:border-brand-200"
              onClick={() => setSelectedReport(report)}
            >
              <p className="line-clamp-2 text-sm font-medium text-ink-800">{report.title}</p>
              <p className="mt-2 text-xs text-ink-500">{formatDate(report.created_at)}</p>
            </button>
          ))}
          {!reports.length && <p className="text-sm text-ink-500">No reports generated yet.</p>}
        </Section>
      </div>

      <Modal open={!!selectedReport} onClose={() => setSelectedReport(null)} title={selectedReport?.title || 'Report'} wide>
        {selectedReport && (
          <div className="space-y-5">
            {[
              ['Executive summary', selectedReport.executive_summary],
              ['Market opportunity', selectedReport.market_opportunity],
              ['Product recommendations', selectedReport.product_recommendations],
              ['Growth suggestions', selectedReport.growth_suggestions],
              ['Operational improvements', selectedReport.operational_improvements],
              ['Next steps', selectedReport.next_steps],
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

function Section({ title, count, children, link }) {
  return (
    <div className="surface-card p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink-500">{count}</span>
          {link && (
            <Link to={link} className="text-xs font-semibold text-brand-700 hover:underline">
              View all
            </Link>
          )}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Item({ title, meta }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-ink-50/40 px-3 py-3">
      <p className="line-clamp-3 text-sm text-ink-800">{title}</p>
      <div className="mt-2">{meta}</div>
    </div>
  )
}
