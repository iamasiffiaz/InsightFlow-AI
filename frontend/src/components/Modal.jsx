import { X } from 'lucide-react'

export default function Modal({ open, title, onClose, children, wide = false }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close modal backdrop"
        className="absolute inset-0 bg-ink-950/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className={`relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-ink-100 bg-white p-5 shadow-soft animate-fade-up sm:rounded-2xl sm:p-6 ${
          wide ? 'max-w-3xl' : 'max-w-lg'
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="font-display text-xl font-semibold text-ink-950">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-50 hover:text-ink-800"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
