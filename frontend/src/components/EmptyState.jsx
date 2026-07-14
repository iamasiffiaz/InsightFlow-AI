export default function EmptyState({ title, description, action, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-200 bg-white/70 px-6 py-14 text-center animate-fade-up">
      {Icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          <Icon size={22} />
        </div>
      )}
      <p className="font-display text-xl font-semibold text-ink-950">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
