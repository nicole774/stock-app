export default function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-xs text-ink-500 mb-1">{label}</span>
      {children}
    </label>
  );
}
