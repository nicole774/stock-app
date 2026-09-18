import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { roleLabel, initials } from "../utils/format.js";
import {
  IconDashboard,
  IconPackage,
  IconTag,
  IconWarehouse,
  IconTransfer,
  IconCart,
  IconReceipt,
  IconTruck,
  IconUsers,
  IconClipboard,
  IconLogout,
  IconMenu,
  IconX,
} from "./icons.jsx";

function getNavSections(role) {
  const sections = [
    {
      label: "Aperçu",
      items: [{ to: "/dashboard", label: "Tableau de bord", end: true, icon: IconDashboard }],
    },
    {
      label: "Catalogue",
      items: [
        { to: "/products", label: "Produits", icon: IconPackage },
        { to: "/categories", label: "Catégories", icon: IconTag },
      ],
    },
    {
      label: "Stock",
      items: [
        { to: "/warehouses", label: "Entrepôts", icon: IconWarehouse },
        { to: "/stock-movements", label: "Mouvements", icon: IconTransfer },
      ],
    },
    {
      label: "Transactions",
      items: [
        { to: "/purchase-orders", label: "Achats", icon: IconCart },
        { to: "/sales-orders", label: "Ventes", icon: IconReceipt },
        { to: "/suppliers", label: "Fournisseurs", icon: IconTruck },
        { to: "/customers", label: "Clients", icon: IconUsers },
      ],
    },
  ];

  if (role === "ADMIN") {
    sections.push({
      label: "Administration",
      items: [{ to: "/users", label: "Utilisateurs", icon: IconClipboard }],
    });
  }

  return sections;
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-6 py-6">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber text-sm font-bold text-white shadow-sm">
        SF
      </span>
      <div>
        <p className="text-[15px] font-semibold leading-tight text-white">StockFlow</p>
        <p className="mono text-[10px] uppercase tracking-widest text-white/40">Gestion de stock</p>
      </div>
    </div>
  );
}

function NavList({ onNavigate }) {
  const { user } = useAuth();
  const sections = getNavSections(user?.role);

  return (
    <nav className="flex-1 overflow-y-auto py-2">
      {sections.map((section) => (
        <div key={section.label} className="mb-4">
          <p className="px-6 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/35">
            {section.label}
          </p>
          {section.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `mx-2 mb-0.5 flex items-center gap-3 rounded-lg px-4 py-2 text-[13px] transition-all ${
                  isActive
                    ? "bg-white/10 font-medium text-white shadow-sm"
                    : "text-white/55 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={16} className={isActive ? "text-amber" : "text-white/40"} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

function UserBlock() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="border-t border-white/10 px-4 py-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
          {initials(user?.name || "?")}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-white">{user?.name}</p>
          <p className="text-[11px] text-amber">{roleLabel(user?.role)}</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/5 hover:text-white"
      >
        <IconLogout size={14} />
        Se déconnecter
      </button>
    </div>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-paper">
      {/* Sidebar bureau */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-ink-900 lg:flex">
        <Brand />
        <NavList />
        <UserBlock />
      </aside>

      {/* Barre mobile */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-rule bg-ink-900 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber text-xs font-bold text-white">
            SF
          </span>
          <p className="font-semibold text-white">StockFlow</p>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Ouvrir le menu"
          className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
        >
          <IconMenu size={20} />
        </button>
      </header>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-ink-900 shadow-pop">
            <div className="flex items-center justify-between pr-3">
              <Brand />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Fermer le menu"
                className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
              >
                <IconX size={18} />
              </button>
            </div>
            <NavList onNavigate={() => setMobileOpen(false)} />
            <UserBlock />
          </aside>
        </div>
      )}

      <main className="min-w-0 lg:pl-60">
        <div className="mx-auto max-w-[1200px] p-4 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
