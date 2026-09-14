import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_SECTIONS = [
  {
    label: "Aperçu",
    items: [{ to: "/", label: "Tableau de bord", end: true }],
  },
  {
    label: "Catalogue",
    items: [
      { to: "/products", label: "Produits" },
      { to: "/categories", label: "Catégories" },
    ],
  },
  {
    label: "Stock",
    items: [
      { to: "/warehouses", label: "Entrepôts" },
      { to: "/stock-movements", label: "Mouvements" },
    ],
  },
  {
    label: "Transactions",
    items: [
      { to: "/purchase-orders", label: "Commandes d'achat" },
      { to: "/sales-orders", label: "Commandes de vente" },
      { to: "/suppliers", label: "Fournisseurs" },
      { to: "/customers", label: "Clients" },
    ],
  },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex bg-paper">
      <aside className="w-64 shrink-0 bg-ink-900 text-white/90 flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <p className="mono text-amber text-xs">SF/01</p>
          <h1 className="text-lg font-semibold text-white">StockFlow</h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-5">
              <p className="px-6 mb-1 text-[11px] text-white/40">{section.label}</p>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-6 py-2 text-sm border-l-2 transition-colors ${
                      isActive
                        ? "border-amber bg-white/5 text-white"
                        : "border-transparent text-white/60 hover:text-white hover:bg-white/5"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-white/10">
          <p className="text-sm text-white">{user?.name}</p>
          <p className="text-xs text-white/40 mb-3">{user?.role}</p>
          <button
            onClick={handleLogout}
            className="text-xs text-white/60 hover:text-white underline underline-offset-2"
          >
            Se déconnecter
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
