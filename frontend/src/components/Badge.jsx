// Pilules de statut / étiquettes colorées.
const TONES = {
  neutral: "bg-ink-900/5 text-ink-500 ring-ink-900/10",
  success: "bg-teal-light text-teal ring-teal/20",
  warning: "bg-amber-light text-amber-dark ring-amber/25",
  danger: "bg-danger-light text-danger ring-danger/25",
  info: "bg-info-light text-info ring-info/20",
  accent: "bg-amber text-white ring-amber",
};

export default function Badge({ tone = "neutral", icon, children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${TONES[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
