import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ListTodo } from 'lucide-react'
import { projectsApi, tasksApi } from '../api/client'
import Badge from '../components/Badge'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import Input from '../components/Input'
import LoadingBlock from '../components/LoadingBlock'
import Modal from '../components/Modal'
import Select from '../components/Select'
import Table from '../components/Table'
import Textarea from '../components/Textarea'
import { TASK_PRIORITIES, TASK_STATUSES } from '../utils/constants'
import { formatDate } from '../utils/formatDate'

const emptyForm = {
  title: '',
  description: '',
  project_id: '',
  priority: 'Medium',
  status: 'Pending',
  due_date: '',
}

export default function Tasks() {
  const { setPageMeta } = useOutletContext()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [filters, setFilters] = useState({ project_id: '', status: '' })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setPageMeta({ title: 'Tasks', subtitle: 'Manual tasks and AI-suggested next actions' })
  }, [setPageMeta])

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.project_id) params.project_id = filters.project_id
      if (filters.status) params.status = filters.status
      const [t, p] = await Promise.all([tasksApi.list(params), projectsApi.list()])
      setTasks(t.data)
      setProjects(p.data)
    } catch {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [filters.project_id, filters.status])

  const projectName = useMemo(() => {
    const map = Object.fromEntries(projects.map((p) => [p.id, p.name]))
    return (id) => map[id] || '—'
  }, [projects])

  const openCreate = () => {
    setEditing(null)
    setForm({
      ...emptyForm,
      project_id: filters.project_id || (projects[0] ? String(projects[0].id) : ''),
    })
    setOpen(true)
  }

  const openEdit = (task) => {
    setEditing(task)
    setForm({
      title: task.title,
      description: task.description || '',
      project_id: task.project_id ? String(task.project_id) : '',
      priority: task.priority,
      status: task.status,
      due_date: task.due_date || '',
    })
    setOpen(true)
  }

  const onSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || form.title.trim().length < 3) {
      toast.error('Task title must be at least 3 characters')
      return
    }
    setSaving(true)
    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      project_id: form.project_id ? Number(form.project_id) : null,
      due_date: form.due_date || null,
    }
    try {
      if (editing) {
        await tasksApi.update(editing.id, payload)
        toast.success('Task updated')
      } else {
        await tasksApi.create({ ...payload, source: 'manual' })
        toast.success('Task created')
      }
      setOpen(false)
      load()
    } catch {
      toast.error('Could not save task')
    } finally {
      setSaving(false)
    }
  }

  const cycleStatus = async (task) => {
    const order = ['Pending', 'In Progress', 'Completed']
    const next = order[(order.indexOf(task.status) + 1) % order.length]
    try {
      await tasksApi.update(task.id, { status: next })
      load()
    } catch {
      toast.error('Status update failed')
    }
  }

  const onDelete = async (id) => {
    if (!confirm('Delete this task?')) return
    try {
      await tasksApi.remove(id)
      toast.success('Task deleted')
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  const columns = [
    { key: 'title', label: 'Task', render: (row) => <span className="font-medium text-ink-900">{row.title}</span> },
    { key: 'project', label: 'Project', render: (row) => projectName(row.project_id) },
    { key: 'priority', label: 'Priority', render: (row) => <Badge>{row.priority}</Badge> },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <button type="button" onClick={() => cycleStatus(row)} title="Click to change status">
          <Badge>{row.status}</Badge>
        </button>
      ),
    },
    { key: 'due_date', label: 'Due', render: (row) => formatDate(row.due_date) },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(row.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="page-stack">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <div className="w-48">
            <Select
              label="Filter project"
              options={[{ value: '', label: 'All projects' }, ...projects.map((p) => ({ value: String(p.id), label: p.name }))]}
              value={filters.project_id}
              onChange={(e) => setFilters({ ...filters, project_id: e.target.value })}
            />
          </div>
          <div className="w-48">
            <Select
              label="Filter status"
              options={[{ value: '', label: 'All statuses' }, ...TASK_STATUSES]}
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            />
          </div>
        </div>
        <Button onClick={openCreate}>New task</Button>
      </div>

      <p className="text-xs text-ink-500">Tip: click a status badge to cycle Pending → In Progress → Completed.</p>

      {loading ? (
        <LoadingBlock label="Loading tasks…" rows={5} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No tasks match these filters"
          description="Create a task manually or generate suggestions from a project detail page."
          action={<Button onClick={openCreate}>New task</Button>}
        />
      ) : (
        <Table columns={columns} rows={tasks} empty="No tasks match these filters." />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit task' : 'Create task'} wide>
        <form className="space-y-4" onSubmit={onSave}>
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Project"
              options={[{ value: '', label: 'Unassigned' }, ...projects.map((p) => ({ value: String(p.id), label: p.name }))]}
              value={form.project_id}
              onChange={(e) => setForm({ ...form, project_id: e.target.value })}
            />
            <Input
              label="Due date"
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
            <Select
              label="Priority"
              options={TASK_PRIORITIES}
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            />
            <Select
              label="Status"
              options={TASK_STATUSES}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
