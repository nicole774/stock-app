import { createContext, useCallback, useContext, useRef, useState } from "react";
import { IconCheckCircle, IconInfo, IconX, IconXCircle } from "./icons.jsx";

const ToastContext = createContext(null);

const KINDS = {
  success: { icon: IconCheckCircle, bar: "bg-teal", text: "text-teal" },
  error: { icon: IconXCircle, bar: "bg-danger", text: "text-danger" },
  info: { icon: IconInfo, bar: "bg-info", text: "text-info" },
};

function ToastItem({ toast, onDismiss }) {
  const kind = KINDS[toast.kind] || KINDS.info;
  const Icon = kind.icon;
  return (
    <div className="pointer-events-auto flex w-80 items-stretch overflow-hidden rounded-xl border border-rule bg-white shadow-pop animate-slide-in-right">
      <div className={`w-1 shrink-0 ${kind.bar}`} />
      <div className="flex flex-1 items-start gap-2.5 px-3.5 py-3">
        <span className={`mt-0.5 ${kind.text}`}>
          <Icon size={16} />
        </span>
        <p className="flex-1 text-sm leading-snug text-ink-700">{toast.message}</p>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Fermer"
          className="rounded p-0.5 text-ink-300 transition-colors hover:text-ink-900"
        >
          <IconX size={13} />
        </button>
      </div>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (kind, message) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev.slice(-3), { id, kind, message }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const api = {
    success: (msg) => push("success", msg),
    error: (msg) => push("error", msg),
    info: (msg) => push("info", msg),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
