export default function StatCard({ label, value, sub, tone = "default" }) {
  const toneClasses = {
    default: "text-ink-900",
    warning: "text-danger",
    good: "text-teal",
  };

  return (
    <div className="bg-white border border-rule p-5">
      <p className="text-xs text-ink-500 mb-2">{label}</p>
      <p className={`mono text-3xl font-semibold ${toneClasses[tone]}`}>{value}</p>
      {sub && <p className="text-xs text-ink-500 mt-1">{sub}</p>}
    </div>
  );
}
