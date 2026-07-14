export default function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white/90 p-5 shadow-soft animate-fade-up">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-500">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-950">{value}</p>
          {hint && <p className="mt-2 text-xs text-ink-500">{hint}</p>}
        </div>
        {Icon && (
          <div className="rounded-xl bg-brand-50 p-2.5 text-brand-700">
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  )
}
