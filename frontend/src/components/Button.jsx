export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-55 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-brand-700 text-white hover:bg-brand-800 shadow-soft',
    secondary: 'bg-white text-ink-800 border border-ink-200 hover:bg-ink-50',
    ghost: 'bg-transparent text-ink-700 hover:bg-ink-100',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Please wait…' : children}
    </button>
  )
}
