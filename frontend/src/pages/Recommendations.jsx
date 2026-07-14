import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Lightbulb } from 'lucide-react'
import { projectsApi, recommendationsApi, tasksApi } from '../api/client'
import Badge from '../components/Badge'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import LoadingBlock from '../components/LoadingBlock'
import { formatDate } from '../utils/formatDate'

export default function Recommendations() {
  const { setPageMeta } = useOutletContext()
  const [items, setItems] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    setPageMeta({
      title: 'AI Recommendations',
      subtitle: 'Suggestions based on projects, tasks, reports, and goals',
    })
  }, [setPageMeta])

  const load = async () => {
    setLoading(true)
    try {
      const [r, p] = await Promise.all([recommendationsApi.list(), projectsApi.list()])
      setItems(r.data)
      setProjects(p.data)
    } catch {
      toast.error('Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const refresh = async () => {
    setGenerating(true)
    try {
      const { data } = await recommendationsApi.generate()
      setItems(data)
      toast.success('Recommendations refreshed')
    } catch {
      toast.error('Could not generate recommendations')
    } finally {
      setGenerating(false)
    }
  }

  const convertToTask = async (rec) => {
    try {
      await tasksApi.create({
        title: rec.title,
        description: rec.description,
        project_id: rec.related_project_id,
        priority: rec.priority,
        status: 'Pending',
        source: 'ai',
      })
      toast.success('Recommendation converted to task')
    } catch {
      toast.error('Could not create task')
    }
  }

  const projectName = (id) => projects.find((p) => p.id === id)?.name || 'Workspace-wide'

  return (
    <div className="page-stack">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-ink-600">
          Recommendations synthesize live portfolio signal into prioritized next moves for startups and operators.
        </p>
        <Button loading={generating} onClick={refresh}>
          Refresh AI recommendations
        </Button>
      </div>

      {loading ? (
        <LoadingBlock label="Loading recommendations…" rows={4} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No recommendations yet"
          description="Generate suggestions from your current projects, tasks, and reports."
          action={
            <Button onClick={refresh} loading={generating}>
              Generate now
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((rec) => (
            <article key={rec.id} className="surface-card p-5 animate-fade-up">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{rec.priority}</Badge>
                <Badge tone="New">{rec.category}</Badge>
                <span className="text-xs text-ink-400">{formatDate(rec.created_at)}</span>
              </div>
              <h3 className="mt-3 font-display text-xl font-semibold text-ink-950">{rec.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{rec.description}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                Related:{' '}
                {rec.related_project_id ? (
                  <Link className="text-brand-700 hover:underline" to={`/app/projects/${rec.related_project_id}`}>
                    {projectName(rec.related_project_id)}
                  </Link>
                ) : (
                  'Workspace-wide'
                )}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => convertToTask(rec)}>
                  Convert to task
                </Button>
                {rec.related_project_id && (
                  <Link to={`/app/projects/${rec.related_project_id}`}>
                    <Button size="sm" variant="ghost">
                      Open project
                    </Button>
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
