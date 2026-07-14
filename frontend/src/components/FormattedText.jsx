/** Renders AI / markdown-ish plain text with readable bullets and paragraphs. */
export default function FormattedText({ text = '', className = '' }) {
  if (!text) return null

  const blocks = String(text)
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)

  return (
    <div className={`space-y-3 text-sm leading-relaxed text-ink-700 ${className}`}>
      {blocks.map((block, idx) => {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean)
        const isList = lines.every((l) => /^([•\-\*]|\d+\.)\s+/.test(l))

        if (isList) {
          return (
            <ul key={idx} className="space-y-1.5 pl-1">
              {lines.map((line, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                  <span>{line.replace(/^([•\-\*]|\d+\.)\s+/, '')}</span>
                </li>
              ))}
            </ul>
          )
        }

        return (
          <p key={idx}>
            {lines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line.replace(/^([•\-\*]|\d+\.)\s+/, '')}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}
