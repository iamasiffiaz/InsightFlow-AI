import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FolderKanban } from 'lucide-react'
import { projectsApi, settingsApi } from '../api/client'
import Badge from '../components/Badge'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import Input from '../components/Input'
import LoadingBlock from '../components/LoadingBlock'
import Modal from '../components/Modal'
import Select from '../components/Select'
import Textarea from '../components/Textarea'
import { BUSINESS_TYPES, PROJECT_STATUSES } from '../utils/constants'
import { formatDate } from '../utils/formatDate'

const emptyForm = {
  name: '',
  business_type: 'SaaS',
  description: '',
  goal: '',
  status: 'Planning',
}

export default function Projects() {
  const { setPageMeta } = useOutletContext()
  const [projects, setProjects] = useState([])
  const [defaultType, setDefaultType] = useState('SaaS')
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setPageMeta({ title: 'Projects', subtitle: 'Create and manage business initiatives' })
  }, [setPageMeta])

  const load = async () => {
    setLoading(true)
    try {
      const [{ data }, settings] = await Promise.all([
        projectsApi.list(),
        settingsApi.get().catch(() => null),
      ])
      setProjects(data)
      if (settings?.data?.default_project_type) {
        setDefaultType(settings.data.default_project_type)
      }
    } catch {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm, business_type: defaultType })
    setFormError('')
    setOpen(true)
  }

  const openEdit = (project) => {
    setEditing(project)
    setForm({
      name: project.name,
      business_type: project.business_type,
      description: project.description,
      goal: project.goal,
      status: project.status,
    })
    setFormError('')
    setOpen(true)
  }

  const validate = () => {
    if (!form.name.trim() || form.name.trim().length < 2) {
      return 'Project name must be at least 2 characters.'
    }
    if (!form.description.trim() || form.description.trim().length < 10) {
      return 'Description must be at least 10 characters.'
    }
    if (!form.goal.trim() || form.goal.trim().length < 5) {
      return 'Goal must be at least 5 characters.'
    }
    return ''
  }

  const onSave = async (e) => {
    e.preventDefault()
    const message = validate()
    if (message) {
      setFormError(message)
      return
    }
    setSaving(true)
    const payload = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      goal: form.goal.trim(),
    }
    try {
      if (editing) {
        await projectsApi.update(editing.id, payload)
        toast.success('Project updated')
      } else {
        await projectsApi.create(payload)
        toast.success('Project created')
      }
      setOpen(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not save project')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (id) => {
    if (!confirm('Delete this project and related tasks, insights, and reports?')) return
    try {
      await projectsApi.remove(id)
      toast.success('Project deleted')
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed')
    }
  }

  return (
    <div className="page-stack">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-600">{projects.length} projects in your workspace</p>
        <Button onClick={openCreate}>New project</Button>
      </div>

      {loading ? (
        <LoadingBlock label="Loading projects…" rows={4} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first business project to start generating insights and reports."
          action={<Button onClick={openCreate}>Create project</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} className="surface-card flex flex-col p-5 animate-fade-up">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    to={`/app/projects/${project.id}`}
                    className="font-display text-xl font-semibold text-ink-950 hover:text-brand-700"
                  >
                    {project.name}
                  </Link>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-500">
                    {project.business_type}
                  </p>
                </div>
                <Badge>{project.status}</Badge>
              </div>
              <p className="mt-3 line-clamp-3 flex-1 text-sm text-ink-600">{project.description}</p>
              <p className="mt-3 line-clamp-2 text-xs text-ink-500">Goal: {project.goal}</p>
              <p className="mt-1 text-xs text-ink-400">Created {formatDate(project.created_at)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/app/projects/${project.id}`}>
                  <Button size="sm" variant="secondary">
                    View
                  </Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={() => openEdit(project)}>
                  Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => onDelete(project.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit project' : 'Create project'} wide>
        <form className="space-y-4" onSubmit={onSave}>
          <Input
            label="Project name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            minLength={2}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Business type"
              options={BUSINESS_TYPES}
              value={form.business_type}
              onChange={(e) => setForm({ ...form, business_type: e.target.value })}
            />
            <Select
              label="Status"
              options={PROJECT_STATUSES}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            />
          </div>
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <Textarea
            label="Goal"
            rows={3}
            value={form.goal}
            onChange={(e) => setForm({ ...form, goal: e.target.value })}
            required
          />
          {formError && <p className="text-sm text-rose-600">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
