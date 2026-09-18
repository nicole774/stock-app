import { IconInbox, IconSpinner } from "./icons.jsx";

// Table générique : columns = [{ key, label, render?, align?, className? }]
export default function DataTable({
  columns,
  rows,
  loading = false,
  emptyLabel = "Aucune donnée.",
  onRowClick,
  skeletonRows = 5,
}) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-rule bg-white shadow-card">
        <div className="flex items-center gap-2 px-4 py-3 text-xs text-ink-400">
          <IconSpinner size={14} /> Chargement...
        </div>
        <div className="divide-y divide-rule border-t border-rule">
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <div key={i} className="flex gap-6 px-4 py-3.5">
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="h-4 animate-pulse rounded bg-ink-900/[0.06]"
                  style={{ width: `${25 + ((i * 7 + col.key.length * 13) % 45)}%` }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!rows?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-rule bg-white/60 py-16 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-900/5 text-ink-300">
          <IconInbox size={20} />
        </span>
        <p className="text-sm text-ink-400">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-rule bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-rule bg-paper/70 text-left text-[11px] uppercase tracking-wider text-ink-400">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-semibold ${col.align === "right" ? "text-right" : ""} ${col.className || ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-rule/70 last:border-0 transition-colors hover:bg-amber/[0.04]
                  ${onRowClick ? "cursor-pointer" : ""}`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3.5 align-middle ${col.align === "right" ? "text-right" : ""} ${col.className || ""}`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
