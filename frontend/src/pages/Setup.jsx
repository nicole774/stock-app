import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";
import { inputClass } from "../components/Field.jsx";
import { IconWarehouse, IconTransfer, IconPackage } from "../components/icons.jsx";

export default function Setup() {
  const [checking, setChecking] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    client
      .get("/auth/status")
      .then(({ data }) => {
        if (data.hasUsers) navigate("/login", { replace: true });
      })
      .finally(() => setChecking(false));
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await client.post("/auth/register", { name, email, password });
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de créer le compte.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) return null;

  return (
    <div className="flex min-h-screen bg-ink-900">
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
            Bienvenue,
            <br />
            <span className="text-amber">configurons votre espace.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/50">
            Ce compte administrateur vous permettra ensuite de créer les accès de votre équipe
            (gestionnaires, opérateurs) depuis la page Utilisateurs.
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

      <div className="flex w-full items-center justify-center bg-paper p-6 lg:w-[520px]">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 font-bold text-amber">
              SF
            </span>
          </div>

          <h1 className="text-xl font-semibold text-ink-900">Créer le compte administrateur</h1>
          <p className="mt-1 text-sm text-ink-400">
            Première connexion : ce compte aura tous les droits sur l'application.
          </p>

          <form onSubmit={handleSubmit} className="mt-6">
            {error && (
              <p className="mb-4 rounded-lg border border-danger/30 bg-danger-light px-3 py-2.5 text-sm text-danger animate-slide-down">
                {error}
              </p>
            )}

            <label className="mb-4 block">
              <span className="mb-1.5 block text-xs font-medium text-ink-500">Nom complet</span>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </label>

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
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-ink-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink-700 disabled:opacity-50"
            >
              {loading ? "Création..." : "Créer mon compte et démarrer"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
