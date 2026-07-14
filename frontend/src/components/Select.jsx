export default function Select({ label, options = [], className = '', ...props }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm font-medium text-ink-700">{label}</span>}
      <select
        className={`w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${className}`}
        {...props}
      >
        {options.map((opt) => {
          const value = typeof opt === 'string' ? opt : opt.value
          const labelText = typeof opt === 'string' ? opt : opt.label
          return (
            <option key={value} value={value}>
              {labelText}
            </option>
          )
        })}
      </select>
    </label>
  )
}
