import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, BrainCircuit, FolderKanban, ShieldCheck, Sparkles, Workflow } from 'lucide-react'
import Button from '../components/Button'

const features = [
  {
    icon: BrainCircuit,
    title: 'AI Insight Generator',
    text: 'Paste notes, feedback, or sales data and get summaries, opportunities, risks, and next actions.',
  },
  {
    icon: FolderKanban,
    title: 'Project Command Center',
    text: 'Organize initiatives by status and goal so decisions stay tied to real business work.',
  },
  {
    icon: Workflow,
    title: 'Tasks from Recommendations',
    text: 'Turn AI suggestions into owned tasks with priority, due dates, and project context.',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    text: 'Generate executive reports and track insights, completion, and priority mix over time.',
  },
]

const useCases = [
  {
    title: 'Startups',
    text: 'Validate ideas faster, turn customer interviews into prioritized next actions, and keep founders aligned on one north-star metric.',
  },
  {
    title: 'Small businesses',
    text: 'Centralize projects, tasks, and weekly AI digests so operators spend less time in spreadsheets and more time executing.',
  },
  {
    title: 'Agencies & consultants',
    text: 'Produce client-ready business reports from discovery notes in minutes, then convert recommendations into delivery tasks.',
  },
]

const plans = [
  {
    name: 'Starter',
    price: '$29',
    detail: 'For solo founders validating one product.',
    perks: ['3 projects', 'AI insights', 'Task board', 'Email support'],
  },
  {
    name: 'Growth',
    price: '$79',
    detail: 'For small teams shipping multiple bets.',
    perks: ['Unlimited projects', 'AI reports', 'Recommendations', 'Priority support'],
    featured: true,
  },
  {
    name: 'Scale',
    price: '$149',
    detail: 'For operators who need portfolio clarity.',
    perks: ['Team workspaces', 'Custom AI provider', 'Advanced analytics', 'Onboarding'],
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-mesh text-ink-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white">
            <Sparkles size={16} />
          </div>
          <span className="font-display text-xl font-semibold">InsightFlow AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden text-sm font-semibold text-ink-700 sm:inline">
            Log in
          </Link>
          <Link to="/register">
            <Button size="sm">Start free</Button>
          </Link>
        </div>
      </header>

      <section className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-24 lg:pt-12">
        <div className="animate-fade-up">
          <p className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink-950 sm:text-6xl lg:text-7xl">
            InsightFlow AI
          </p>
          <h1 className="mt-5 max-w-xl text-xl font-medium leading-relaxed text-ink-700 sm:text-2xl">
            Turn raw business notes into decisions, reports, and next actions — from one SaaS dashboard.
          </h1>
          <p className="mt-4 max-w-lg text-base text-ink-600">
            Built for startups and small teams who need AI-assisted clarity without enterprise bloat.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register">
              <Button size="lg">
                Launch dashboard <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary">
                View demo login
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative animate-float rounded-[2rem] border border-white/60 bg-ink-950 p-6 text-sand-50 shadow-soft sm:p-8">
          <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-brand-400/30 blur-2xl" />
          <div className="absolute -bottom-8 -right-4 h-28 w-28 rounded-full bg-sand-200/40 blur-2xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">Live product preview</p>
          <p className="mt-3 font-display text-3xl font-semibold">Decision velocity, visualized</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ['Seeded insights', '5+'],
              ['Demo projects', '5'],
              ['Tracked tasks', '10'],
              ['Sample reports', '3'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-ink-300">{label}</p>
                <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-brand-400/30 bg-brand-700/30 p-4 text-sm leading-relaxed text-brand-50">
            “We stopped debating notes and started shipping the next three actions every Monday.”
          </div>
        </div>
      </section>

      <section className="border-y border-ink-100/80 bg-white/50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Why InsightFlow</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold text-ink-950 sm:text-4xl">
            Business value without the spreadsheet theater
          </h2>
          <p className="mt-4 max-w-3xl text-ink-600">
            InsightFlow AI helps startups and growing businesses turn raw business information into actionable
            insights. It reduces manual analysis, organizes project decisions, creates AI-powered reports, suggests
            next steps, and helps teams move faster with a centralized SaaS dashboard.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10">
          <h2 className="font-display text-3xl font-semibold text-ink-950">Product features</h2>
          <p className="mt-2 max-w-2xl text-ink-600">Everything a founder needs to analyze, decide, and execute.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-ink-100 bg-white/80 p-6 shadow-soft animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="mb-4 inline-flex rounded-xl bg-brand-50 p-2.5 text-brand-700">
                <feature.icon size={18} />
              </div>
              <h3 className="font-display text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink-950 py-16 text-sand-50">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl font-semibold">Built for real operating rhythms</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {useCases.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="font-display text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-ink-300">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold text-ink-950">Simple pricing</h2>
            <p className="mt-2 text-ink-600">Portfolio-ready plans — wire real billing later.</p>
          </div>
          <ShieldCheck className="hidden text-brand-700 sm:block" />
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 shadow-soft ${
                plan.featured
                  ? 'border-brand-600 bg-brand-700 text-white'
                  : 'border-ink-100 bg-white text-ink-900'
              }`}
            >
              <p className="text-sm font-semibold uppercase tracking-wide opacity-80">{plan.name}</p>
              <p className="mt-3 font-display text-4xl font-semibold">
                {plan.price}
                <span className="text-base font-medium opacity-70">/mo</span>
              </p>
              <p className={`mt-2 text-sm ${plan.featured ? 'text-brand-50' : 'text-ink-600'}`}>{plan.detail}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {plan.perks.map((perk) => (
                  <li key={perk}>• {perk}</li>
                ))}
              </ul>
              <Link to="/register" className="mt-6 block">
                <Button
                  className="w-full"
                  variant={plan.featured ? 'secondary' : 'primary'}
                >
                  Choose {plan.name}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="overflow-hidden rounded-[2rem] border border-brand-100 bg-brand-700 px-8 py-12 text-white shadow-soft sm:px-12">
          <h2 className="max-w-xl font-display text-3xl font-semibold sm:text-4xl">
            Ready to turn notes into next moves?
          </h2>
          <p className="mt-3 max-w-xl text-brand-50">
            Open the InsightFlow dashboard, load demo data, and walk the full AI SaaS workflow.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register">
              <Button variant="secondary" size="lg">
                Create account
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                className="border border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                Demo login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink-100 px-6 py-8 text-center text-sm text-ink-500">
        InsightFlow AI · Portfolio SaaS MVP for AI product development case studies
      </footer>
    </div>
  )
}
