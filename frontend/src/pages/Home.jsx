import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  IconPackage,
  IconWarehouse,
  IconTransfer,
  IconChart,
  IconCart,
  IconReceipt,
  IconUsers,
  IconArrowRight,
  IconCheckCircle,
} from "../components/icons.jsx";

const AUDIENCES = [
  {
    icon: IconChart,
    title: "Propriétaire / Direction",
    text: "Vue d'ensemble en temps réel : valeur du stock, ventes, achats et alertes de rupture pour décider vite.",
  },
  {
    icon: IconWarehouse,
    title: "Responsable d'entrepôt",
    text: "Suivi précis des quantités par entrepôt, transferts tracés et ajustements justifiés.",
  },
  {
    icon: IconPackage,
    title: "Agent de stock / magasinier",
    text: "Réception, sortie et mouvements de produits enregistrés en quelques clics, sans erreur de saisie.",
  },
  {
    icon: IconUsers,
    title: "Équipe commerciale",
    text: "Commandes clients et fournisseurs centralisées, avec mise à jour automatique des stocks disponibles.",
  },
];

const FEATURES = [
  { icon: IconWarehouse, text: "Stock en temps réel, multi-entrepôts" },
  { icon: IconTransfer, text: "Mouvements et transferts entièrement tracés" },
  { icon: IconCart, text: "Commandes d'achat vers vos fournisseurs" },
  { icon: IconReceipt, text: "Commandes de vente vers vos clients" },
  { icon: IconPackage, text: "Alertes automatiques de stock bas" },
  { icon: IconChart, text: "Tableau de bord et indicateurs clés" },
];

export default function Home() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      {/* En-tête */}
      <header className="border-b border-rule bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-sm font-bold text-amber">
              SF
            </span>
            <p className="text-[15px] font-semibold">StockFlow</p>
          </div>
          <Link
            to="/login"
            className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink-700"
          >
            Se connecter
          </Link>
        </div>
      </header>

      {/* Bandeau principal */}
      <section className="relative overflow-hidden bg-ink-900">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #C1802E 0, transparent 45%), radial-gradient(circle at 85% 70%, #2F6F62 0, transparent 45%)",
          }}
        />
        <div className="relative mx-auto max-w-[1200px] px-6 py-20 text-center">
          <p className="mono mb-4 text-[11px] uppercase tracking-widest text-white/40">
            Gestion de stock, achats et ventes
          </p>
          <h1 className="mx-auto max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Votre stock, <span className="text-amber">sous contrôle</span>, du magasinier à la direction.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
            StockFlow centralise vos produits, entrepôts, mouvements, achats et ventes dans une
            seule application, pensée pour toute l'équipe.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-amber px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-dark"
            >
              Accéder à mon espace
              <IconArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Pour qui */}
      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <h2 className="text-center text-xl font-semibold text-ink-900">Pensé pour toute votre équipe</h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-sm text-ink-400">
          Que vous dirigiez l'entreprise ou que vous soyez sur le terrain, StockFlow s'adapte à votre rôle.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-xl border border-rule bg-white p-5 shadow-card transition-shadow hover:shadow-pop"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-light text-amber-dark">
                <Icon size={18} />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-ink-900">{title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1200px] px-6">
          <h2 className="text-center text-xl font-semibold text-ink-900">Tout ce qu'il faut, au même endroit</h2>
          <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 rounded-lg border border-rule px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-light text-teal">
                  <Icon size={15} />
                </span>
                <span className="text-sm text-ink-700">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Appel à l'action final */}
      <section className="mx-auto max-w-[1200px] px-6 py-16 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-light text-teal">
          <IconCheckCircle size={22} />
        </span>
        <h2 className="mt-4 text-xl font-semibold text-ink-900">Prêt à reprendre le contrôle de votre stock ?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-400">
          Connectez-vous avec votre compte pour accéder à votre tableau de bord.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-ink-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink-700"
        >
          Se connecter
          <IconArrowRight size={15} />
        </Link>
      </section>

      <footer className="border-t border-rule bg-white py-6">
        <p className="mono text-center text-[11px] uppercase tracking-widest text-ink-300">
          SF/01 — Application de gestion
        </p>
      </footer>
    </div>
  );
}
