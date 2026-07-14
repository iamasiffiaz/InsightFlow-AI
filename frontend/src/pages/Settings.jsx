import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import toast from 'react-hot-toast'
import { settingsApi } from '../api/client'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import { BUSINESS_TYPES } from '../utils/constants'

export default function Settings() {
  const { setPageMeta } = useOutletContext()
  const [form, setForm] = useState({
    business_name: '',
    industry: '',
    default_project_type: 'SaaS',
    ai_provider: 'OpenAI Compatible',
    api_key_placeholder: '',
    theme: 'light',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setPageMeta({ title: 'Settings', subtitle: 'Business profile and AI provider preferences' })
  }, [setPageMeta])

  useEffect(() => {
    settingsApi
      .get()
      .then(({ data }) => {
        setForm({
          business_name: data.business_name,
          industry: data.industry,
          default_project_type: data.default_project_type,
          ai_provider: data.ai_provider,
          api_key_placeholder: data.api_key_placeholder || '',
          theme: data.theme,
        })
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  const onSave = async (e) => {
    e.preventDefault()
    if (!form.business_name.trim()) {
      toast.error('Business name is required')
      return
    }
    if (!form.industry.trim()) {
      toast.error('Industry is required')
      return
    }
    setSaving(true)
    try {
      const { data } = await settingsApi.update({
        ...form,
        business_name: form.business_name.trim(),
        industry: form.industry.trim(),
      })
      setForm({
        business_name: data.business_name,
        industry: data.industry,
        default_project_type: data.default_project_type,
        ai_provider: data.ai_provider,
        api_key_placeholder: data.api_key_placeholder || '',
        theme: data.theme,
      })
      toast.success('Settings saved')
    } catch {
      toast.error('Could not save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="rounded-2xl border border-ink-100 bg-white p-8 text-ink-500">Loading settings…</div>
  }

  return (
    <form onSubmit={onSave} className="max-w-2xl space-y-5 rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
      <Input
        label="Business name"
        value={form.business_name}
        onChange={(e) => setForm({ ...form, business_name: e.target.value })}
      />
      <Input
        label="Industry"
        value={form.industry}
        onChange={(e) => setForm({ ...form, industry: e.target.value })}
      />
      <Select
        label="Default project type"
        options={BUSINESS_TYPES}
        value={form.default_project_type}
        onChange={(e) => setForm({ ...form, default_project_type: e.target.value })}
      />
      <Select
        label="AI provider"
        options={['OpenAI Compatible', 'OpenAI', 'Azure OpenAI', 'Local / Ollama']}
        value={form.ai_provider}
        onChange={(e) => setForm({ ...form, ai_provider: e.target.value })}
      />
      <Input
        label="API key placeholder"
        type="password"
        placeholder="Stored as workspace placeholder (use backend env for real keys)"
        value={form.api_key_placeholder}
        onChange={(e) => setForm({ ...form, api_key_placeholder: e.target.value })}
      />
      <Select
        label="Theme"
        options={[
          { value: 'light', label: 'Light' },
          { value: 'system', label: 'System' },
          { value: 'dark', label: 'Dark (placeholder)' },
        ]}
        value={form.theme}
        onChange={(e) => setForm({ ...form, theme: e.target.value })}
      />
      <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-900">
        Real LLM credentials belong in backend environment variables (`OPENAI_API_KEY`). This field is a UI placeholder
        for portfolio demos and future per-tenant key management.
      </div>
      <Button type="submit" loading={saving}>
        Save settings
      </Button>
    </form>
  )
}
