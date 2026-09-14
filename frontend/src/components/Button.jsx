export default function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-ink-900 text-white hover:bg-ink-700",
    accent: "bg-amber text-white hover:bg-amber-dark",
    ghost: "bg-transparent text-ink-900 border border-rule hover:bg-paper",
    danger: "bg-danger text-white hover:opacity-90",
  };

  return (
    <button
      className={`px-4 py-2 text-sm font-medium transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
