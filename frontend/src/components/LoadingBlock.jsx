export default function LoadingBlock({ label = 'Loading…', rows = 3 }) {
  return (
    <div className="space-y-3 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft animate-fade-in" aria-busy="true">
      <p className="text-sm font-medium text-ink-500">{label}</p>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 animate-pulse rounded-xl bg-ink-100/80" style={{ width: `${92 - i * 8}%` }} />
      ))}
    </div>
  )
}
