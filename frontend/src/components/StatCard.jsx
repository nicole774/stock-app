export default function StatCard({ label, value, sub, tone = "default", icon }) {
  const tones = {
    default: { text: "text-ink-900", chip: "bg-ink-900/[0.06] text-ink-500" },
    warning: { text: "text-danger", chip: "bg-danger-light text-danger" },
    good: { text: "text-teal", chip: "bg-teal-light text-teal" },
    accent: { text: "text-amber-dark", chip: "bg-amber-light text-amber-dark" },
    info: { text: "text-info", chip: "bg-info-light text-info" },
  };
  const t = tones[tone] || tones.default;

  return (
    <div className="group rounded-xl border border-rule bg-white p-5 shadow-card transition-shadow hover:shadow-pop/50">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
        {icon && (
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${t.chip}`}>
            {icon}
          </span>
        )}
      </div>
      <p className={`mono text-2xl font-semibold leading-none sm:text-[26px] ${t.text}`}>{value}</p>
      {sub && <p className="mt-2 text-xs text-ink-400">{sub}</p>}
    </div>
  );
}
