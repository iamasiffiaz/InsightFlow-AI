export default function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-ink-100 bg-white/90 p-5 shadow-soft ${className}`}>
      <div className="mb-4">
        <h3 className="font-display text-lg font-semibold text-ink-950">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
      </div>
      <div className="h-64 w-full">{children}</div>
    </div>
  )
}
