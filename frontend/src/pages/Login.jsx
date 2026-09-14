import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("admin@stock.app");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen flex items-center justify-center bg-ink-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="mono text-amber text-xs mb-1">SF/01</p>
          <h1 className="text-2xl font-semibold text-white">StockFlow</h1>
          <p className="text-sm text-white/50 mt-1">Gestion de stock multi-entrepôts</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 border border-rule">
          {error && (
            <p className="mb-4 text-sm text-danger border border-danger/30 bg-danger/5 px-3 py-2">
              {error}
            </p>
          )}

          <label className="block mb-4">
            <span className="block text-xs text-ink-500 mb-1">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink-900"
            />
          </label>

          <label className="block mb-6">
            <span className="block text-xs text-ink-500 mb-1">Mot de passe</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink-900"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink-900 text-white py-2 text-sm font-medium hover:bg-ink-700 disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          <p className="text-xs text-ink-500 mt-4">
            Compte de démo : admin@stock.app / admin123
          </p>
        </form>
      </div>
    </div>
  );
}
