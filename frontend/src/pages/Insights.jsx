import { useEffect, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Sparkles } from 'lucide-react'
import { insightsApi, projectsApi, tasksApi } from '../api/client'
import Badge from '../components/Badge'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import FormattedText from '../components/FormattedText'
import LoadingBlock from '../components/LoadingBlock'
import Select from '../components/Select'
import Textarea from '../components/Textarea'
import { formatDateTime } from '../utils/formatDate'

export default function Insights() {
  const { setPageMeta } = useOutletContext()
  const [searchParams] = useSearchParams()
  const [projects, setProjects] = useState([])
  const [insights, setInsights] = useState([])
  const [inputText, setInputText] = useState('')
  const [projectId, setProjectId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    setPageMeta({
      title: 'AI Insights',
      subtitle: 'Paste notes, feedback, or strategy text and generate actionable analysis',
    })
  }, [setPageMeta])

  const load = async () => {
    setLoading(true)
    try {
      const [p, i] = await Promise.all([projectsApi.list(), insightsApi.list()])
      setProjects(p.data)
      setInsights(i.data)
      const fromQuery = searchParams.get('project')
      if (fromQuery && p.data.some((proj) => String(proj.id) === fromQuery)) {
        setProjectId(fromQuery)
      } else if (p.data[0] && !projectId) {
        setProjectId(String(p.data[0].id))
      }
    } catch {
      toast.error('Failed to load insights')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const projectName = (id) => projects.find((p) => p.id === id)?.name || 'General'

  const generate = async (e) => {
    e.preventDefault()
    const trimmed = inputText.trim()
    if (trimmed.length < 10) {
      setError('Please enter at least 10 characters of business context.')
      return
    }
    setError('')
    setGenerating(true)
    try {
      const { data } = await insightsApi.generate({
        input_text: trimmed,
        project_id: projectId ? Number(projectId) : null,
      })
      setInsights((prev) => [data, ...prev])
      setInputText('')
      toast.success('Insight generated')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Insight generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const createTasksFromActions = async (insight) => {
    const lines = insight.next_actions
      .split('\n')
      .map((l) => l.replace(/^•\s*/, '').trim())
      .filter(Boolean)
      .slice(0, 3)

    if (!lines.length) {
      toast.error('No next actions to convert')
      return
    }

    try {
      for (const line of lines) {
        await tasksApi.create({
          title: line.slice(0, 120),
          description: `Created from insight #${insight.id}`,
          project_id: insight.project_id || (projectId ? Number(projectId) : null),
          priority: insight.priority_level === 'High' ? 'High' : 'Medium',
          status: 'Pending',
          source: 'ai',
        })
      }
      toast.success('Tasks created from next actions')
    } catch {
      toast.error('Could not create tasks')
    }
  }

  const removeInsight = async (id) => {
    if (!confirm('Delete this insight?')) return
    try {
      await insightsApi.remove(id)
      setInsights((prev) => prev.filter((i) => i.id !== id))
      toast.success('Insight deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div className="page-stack">
      <form onSubmit={generate} className="surface-card p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
          <div>
            <Textarea
              label="Business notes / feedback / data"
              rows={7}
              placeholder="Paste customer interviews, sales notes, strategy thoughts, or metrics commentary…"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value)
                if (error) setError('')
              }}
              required
            />
            {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
          </div>
          <div className="space-y-4">
            <Select
              label="Linked project"
              options={[
                { value: '', label: 'General / none' },
                ...projects.map((p) => ({ value: String(p.id), label: p.name })),
              ]}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            />
            <Button className="w-full" type="submit" loading={generating}>
              Generate AI insight
            </Button>
            <p className="text-xs leading-relaxed text-ink-500">
              Uses an OpenAI-compatible API when configured; otherwise returns context-aware mock analysis grounded in your notes.
            </p>
          </div>
        </div>
      </form>

      {loading ? (
        <LoadingBlock label="Loading insights…" rows={4} />
      ) : insights.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No insights yet"
          description="Paste business notes above and generate your first analysis. Mock AI works without an API key."
        />
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => (
            <article key={insight.id} className="surface-card p-5 sm:p-6 animate-fade-up">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{insight.priority_level}</Badge>
                  <span className="text-xs font-semibold text-ink-500">{projectName(insight.project_id)}</span>
                  <span className="text-xs text-ink-400">{formatDateTime(insight.created_at)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => createTasksFromActions(insight)}>
                    Create tasks
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => removeInsight(insight.id)}>
                    Delete
                  </Button>
                </div>
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-ink-950">Summary</h3>
              <FormattedText className="mt-2" text={insight.summary} />
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Block title="Key insights" text={insight.key_insights} />
                <Block title="Opportunities" text={insight.opportunities} />
                <Block title="Risks" text={insight.risks} />
                <Block title="Suggested next actions" text={insight.next_actions} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function Block({ title, text }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-4">
      <h4 className="text-sm font-semibold text-ink-900">{title}</h4>
      <FormattedText className="mt-2" text={text} />
    </div>
  )
}
