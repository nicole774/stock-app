import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { IconEye, IconEyeOff, IconPackage, IconWarehouse, IconTransfer } from "../components/icons.jsx";

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@stock.app", password: "admin123" },
  { role: "Manager", email: "manager@stock.app", password: "staff123" },
  { role: "Employé", email: "employee@stock.app", password: "staff123" },
];

const inputClass =
  "w-full rounded-lg border border-rule bg-white px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 " +
  "transition-colors focus:outline-none focus:border-ink-500 focus:ring-2 focus:ring-ink-900/10";

export default function Login() {
  const [email, setEmail] = useState("admin@stock.app");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-ink-900">
      {/* Panneau marque */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 20%, #C1802E 0, transparent 45%), radial-gradient(circle at 80% 75%, #2F6F62 0, transparent 45%)",
          }}
        />
        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber font-bold text-white">
            SF
          </span>
          <p className="text-lg font-semibold text-white">StockFlow</p>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight text-white">
            Votre stock,
            <br />
            <span className="text-amber">sous contrôle.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/50">
            Suivi multi-entrepôts, traçabilité complète des mouvements, achats et ventes
            avec mise à jour automatique des quantités.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              { icon: IconWarehouse, text: "Stock en temps réel par entrepôt" },
              { icon: IconTransfer, text: "Transferts et ajustements tracés" },
              { icon: IconPackage, text: "Alertes automatiques de stock bas" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-white/70">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-amber">
                  <Icon size={15} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="mono relative text-[11px] uppercase tracking-widest text-white/30">
          SF/01 — Application de gestion
        </p>
      </div>

      {/* Formulaire */}
      <div className="flex w-full items-center justify-center bg-paper p-6 lg:w-[520px]">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 font-bold text-amber">
              SF
            </span>
          </div>

          <h1 className="text-xl font-semibold text-ink-900">Connexion</h1>
          <p className="mt-1 text-sm text-ink-400">Accédez à votre espace de gestion.</p>

          <form onSubmit={handleSubmit} className="mt-6">
            {error && (
              <p className="mb-4 rounded-lg border border-danger/30 bg-danger-light px-3 py-2.5 text-sm text-danger animate-slide-down">
                {error}
              </p>
            )}

            <label className="mb-4 block">
              <span className="mb-1.5 block text-xs font-medium text-ink-500">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="mb-6 block">
              <span className="mb-1.5 block text-xs font-medium text-ink-500">Mot de passe</span>
              <span className="relative block">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-300 hover:text-ink-700"
                >
                  {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-ink-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink-700 disabled:opacity-50"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-8 border-t border-rule pt-5">
            <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-ink-300">
              Comptes de démonstration
            </p>
            <div className="flex flex-wrap gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword(acc.password);
                    setError("");
                  }}
                  className="rounded-full border border-rule bg-white px-3 py-1 text-xs text-ink-500 transition-all hover:border-amber hover:text-amber-dark"
                >
                  {acc.role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
