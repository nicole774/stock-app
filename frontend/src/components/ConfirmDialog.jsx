import { createContext, useContext, useRef, useState } from "react";
import Modal from "./Modal.jsx";
import Button from "./Button.jsx";
import { IconAlert, IconHelp } from "./icons.jsx";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null); // { options, resolve }
  const resolverRef = useRef(null);

  function confirm(options = {}) {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState({ options });
    });
  }

  function settle(answer) {
    resolverRef.current?.(answer);
    setState(null);
  }

  const opts = state?.options || {};
  const Icon = opts.danger ? IconAlert : IconHelp;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={!!state}
        onClose={() => settle(false)}
        size="sm"
        title={opts.title || "Confirmer l'action"}
      >
        <div className="mb-5 flex items-start gap-3.5">
          <span
            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              opts.danger ? "bg-danger-light text-danger" : "bg-amber-light text-amber-dark"
            }`}
          >
            <Icon size={19} />
          </span>
          <p className="pt-1.5 text-sm leading-relaxed text-ink-500">{opts.message || "Êtes-vous sûr ?"}</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => settle(false)}>
            Annuler
          </Button>
          <Button variant={opts.danger ? "danger" : "primary"} onClick={() => settle(true)}>
            {opts.confirmLabel || "Confirmer"}
          </Button>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}
