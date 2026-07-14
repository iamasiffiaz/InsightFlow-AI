import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Sparkles } from 'lucide-react'
import { authApi } from '../api/client'
import Button from '../components/Button'
import Input from '../components/Input'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: 'demo@insightflow.ai', password: 'demo1234' })
  const [loading, setLoading] = useState(false)

  const persist = (data) => {
    localStorage.setItem('insightflow_token', data.access_token)
    localStorage.setItem('insightflow_user', JSON.stringify(data.user))
    navigate('/app')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      persist(data)
      toast.success('Welcome back')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const mockLogin = async () => {
    setLoading(true)
    try {
      const { data } = await authApi.mockLogin()
      persist(data)
      toast.success('Demo session started')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Run backend seed.py first')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh px-4">
      <div className="w-full max-w-md rounded-3xl border border-ink-100 bg-white/90 p-8 shadow-soft animate-fade-up">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white">
            <Sparkles size={16} />
          </div>
          <span className="font-display text-xl font-semibold">InsightFlow AI</span>
        </div>
        <h1 className="font-display text-3xl font-semibold text-ink-950">Welcome back</h1>
        <p className="mt-2 text-sm text-ink-600">JWT-ready auth with demo login for portfolio walkthroughs.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
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
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <Button className="w-full" loading={loading} type="submit">
            Log in
          </Button>
        </form>

        <Button className="mt-3 w-full" variant="secondary" loading={loading} onClick={mockLogin}>
          One-click demo login
        </Button>

        <p className="mt-6 text-center text-sm text-ink-600">
          New here?{' '}
          <Link to="/register" className="font-semibold text-brand-700">
            Create an account
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-ink-400">
          <Link to="/">← Back to landing</Link>
        </p>
      </div>
    </div>
  )
}
