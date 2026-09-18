import { IconSpinner } from "./icons.jsx";

const VARIANTS = {
  primary:
    "bg-ink-900 text-white hover:bg-ink-700 active:bg-ink-900 shadow-sm",
  accent:
    "bg-amber text-white hover:bg-amber-dark active:bg-amber shadow-sm",
  ghost:
    "bg-white text-ink-700 border border-rule hover:bg-paper hover:border-ink-300 shadow-sm",
  danger:
    "bg-danger text-white hover:bg-danger/90 shadow-sm",
  subtle:
    "bg-transparent text-ink-500 hover:text-ink-900 hover:bg-ink-900/5",
};

const SIZES = {
  sm: "px-2.5 py-1.5 text-xs gap-1.5 rounded-md",
  md: "px-3.5 py-2 text-sm gap-2 rounded-lg",
  lg: "px-5 py-2.5 text-sm gap-2 rounded-lg",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-150
        active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/60 focus-visible:ring-offset-1
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && <IconSpinner size={15} />}
      {children}
    </button>
  );
}

export function IconButton({ children, label, className = "", ...props }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-400
        transition-colors hover:bg-ink-900/5 hover:text-ink-900
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
