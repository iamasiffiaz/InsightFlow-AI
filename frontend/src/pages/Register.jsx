import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Sparkles } from 'lucide-react'
import { authApi } from '../api/client'
import Button from '../components/Button'
import Input from '../components/Input'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (form.full_name.trim().length < 2) {
      setError('Full name must be at least 2 characters.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { data } = await authApi.register({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      localStorage.setItem('insightflow_token', data.access_token)
      localStorage.setItem('insightflow_user', JSON.stringify(data.user))
      toast.success('Account created')
      navigate('/app')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-ink-100 bg-white/90 p-8 shadow-soft animate-fade-up">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white">
            <Sparkles size={16} />
          </div>
          <span className="font-display text-xl font-semibold">InsightFlow AI</span>
        </div>
        <h1 className="font-display text-3xl font-semibold text-ink-950">Create your workspace</h1>
        <p className="mt-2 text-sm text-ink-600">JWT auth issues a token on register — ready to extend for production.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Input
            label="Full name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
            minLength={2}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <Input
            label="Confirm password"
            type="password"
            minLength={6}
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            required
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <Button className="w-full" loading={loading} type="submit">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-700">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
