export const inputClass =
  "w-full rounded-lg border border-rule bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300 " +
  "transition-colors focus:outline-none focus:border-ink-500 focus:ring-2 focus:ring-ink-900/10 disabled:bg-paper disabled:text-ink-300";

export default function Field({ label, hint, required, error, children, className = "" }) {
  return (
    <label className={`block mb-4 ${className}`}>
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-ink-500">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </span>
        {hint && <span className="text-[11px] text-ink-300">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}
