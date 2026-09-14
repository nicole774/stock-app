export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink-900/40 pt-16">
      <div className="bg-white w-full max-w-lg border border-rule shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-rule">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="text-ink-500 hover:text-ink-900 text-sm">
            Fermer
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
