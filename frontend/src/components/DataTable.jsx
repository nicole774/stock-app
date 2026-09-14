// Table générique : columns = [{ key, label, render? }]
export default function DataTable({ columns, rows, emptyLabel = "Aucune donnée." }) {
  if (!rows?.length) {
    return (
      <div className="border border-dashed border-rule py-14 text-center text-sm text-ink-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="border border-rule bg-white overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-rule text-left text-ink-500">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-medium">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i} className="border-b border-rule last:border-0 hover:bg-paper/60">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 align-middle">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
