export default function Table({ columns, rows, empty = 'No records yet.' }) {
  if (!rows?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 px-6 py-12 text-center text-sm text-ink-500">
        {empty}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-ink-50/80 text-ink-500">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-semibold">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id ?? idx} className="border-t border-ink-100 hover:bg-brand-50/30">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-ink-800">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
