import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import client from "../api/client";
import StatCard from "../components/StatCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import {
  formatMoney,
  formatNumber,
  formatDateTime,
} from "../utils/format.js";
import {
  IconCoins,
  IconPackage,
  IconReceipt,
  IconAlert,
  IconArrowUp,
  IconArrowDown,
  IconArrowRight,
  IconRefresh,
} from "../components/icons.jsx";

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid #E4E1DA",
  boxShadow: "0 8px 30px rgba(20,24,28,0.12)",
  fontSize: 12,
  padding: "8px 12px",
};

function pad(n) {
  return String(n).padStart(2, "0");
}

function buildDailySeries(raw) {
  const byKey = {};
  for (const row of raw) {
    byKey[`${row.day}|${row.type}`] = Number(row.quantity);
  }
  const series = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    series.push({
      label: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`,
      Entrees: byKey[`${key}|IN`] || 0,
      Sorties: byKey[`${key}|OUT`] || 0,
    });
  }
  return series;
}

function MovementTypeBadge({ type }) {
  if (type === "IN") return <Badge tone="success" icon={<IconArrowUp size={11} />}>Entrée</Badge>;
  if (type === "OUT") return <Badge tone="danger" icon={<IconArrowDown size={11} />}>Sortie</Badge>;
  if (type === "TRANSFER") return <Badge tone="info" icon={<IconArrowRight size={11} />}>Transfert</Badge>;
  return <Badge tone="warning">Ajustement</Badge>;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await client.get("/dashboard/stats");
      setStats(data);
    } catch {
      setError("Impossible de charger les statistiques. Vérifiez que l'API est démarrée.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (error) {
    return (
      <div>
        <PageHeader title="Tableau de bord" />
        <div className="flex flex-col items-start gap-3 rounded-xl border border-danger/30 bg-danger-light p-5">
          <p className="text-sm text-danger">{error}</p>
          <Button variant="ghost" size="sm" onClick={load}>
            <IconRefresh size={14} /> Réessayer
          </Button>
        </div>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div>
        <PageHeader title="Tableau de bord" description="Chargement des indicateurs..." />
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-ink-900/[0.05]" />
          ))}
        </div>
      </div>
    );
  }

  const dailySeries = buildDailySeries(stats.movementsPerDay || []);
  const warehouseData = (stats.stockByWarehouse || []).map((w) => ({
    name: w.name,
    units: w.units,
  }));
  const maxWarehouseUnits = Math.max(1, ...warehouseData.map((w) => w.units));

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de votre stock et de vos entrepôts"
      />

      {/* Cartes d'indicateurs */}
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="Valeur du stock"
          value={formatMoney(stats.totalStockValue)}
          sub={`${formatNumber(stats.productCount)} références actives`}
          tone="accent"
          icon={<IconCoins size={16} />}
        />
        <StatCard
          label="Unités en stock"
          value={formatNumber(stats.totalStockUnits)}
          sub={`${stats.warehouseCount} entrepôts actifs`}
          tone="info"
          icon={<IconPackage size={16} />}
        />
        <StatCard
          label="Chiffre d'affaires vendu"
          value={formatMoney(stats.salesRevenue)}
          sub={`${stats.salesCount} ventes enregistrées`}
          tone="good"
          icon={<IconReceipt size={16} />}
        />
        <StatCard
          label="Alertes stock bas"
          value={formatNumber(stats.lowStockCount)}
          sub={stats.pendingPurchaseOrders > 0 ? `${stats.pendingPurchaseOrders} achats en attente` : "Aucun achat en attente"}
          tone={stats.lowStockCount > 0 ? "warning" : "good"}
          icon={<IconAlert size={16} />}
        />
      </div>

      {/* Graphiques */}
      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-rule bg-white p-5 shadow-card xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-ink-900">Mouvements des 14 derniers jours</h2>
              <p className="text-xs text-ink-400">Entrées et sorties par jour</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-ink-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-teal" /> Entrées
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-danger" /> Sorties
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySeries} margin={{ top: 4, right: 4, bottom: 0, left: -18 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E1DA" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#8A94A0" }} tickLine={false} axisLine={{ stroke: "#E4E1DA" }} interval={1} />
                <YAxis tick={{ fontSize: 10, fill: "#8A94A0" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "rgba(20,24,28,0.04)" }}
                  formatter={(value, name) => [formatNumber(value), name === "Entrees" ? "Entrées" : "Sorties"]}
                  labelFormatter={(label) => `Jour ${label}`}
                />
                <Bar dataKey="Entrees" fill="#2F6F62" radius={[3, 3, 0, 0]} maxBarSize={14} />
                <Bar dataKey="Sorties" fill="#B3452D" radius={[3, 3, 0, 0]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-rule bg-white p-5 shadow-card">
          <h2 className="text-sm font-semibold text-ink-900">Stock par entrepôt</h2>
          <p className="mb-4 text-xs text-ink-400">Répartition des unités</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehouseData} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }}>
                <XAxis type="number" hide domain={[0, maxWarehouseUnits]} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 11, fill: "#3A4650" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "rgba(20,24,28,0.04)" }}
                  formatter={(value) => [formatNumber(value), "Unités"]}
                />
                <Bar dataKey="units" fill="#C1802E" radius={[0, 5, 5, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tableaux */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-sm font-semibold text-ink-900">Alertes de stock bas</h2>
            {stats.lowStockCount > 0 && (
              <Badge tone="danger">{stats.lowStockCount}</Badge>
            )}
          </div>
          <DataTable
            loading={loading}
            emptyLabel="Aucune alerte — tous les stocks sont au-dessus du seuil."
            columns={[
              { key: "sku", label: "SKU", render: (r) => <span className="mono text-xs text-ink-400">{r.sku}</span> },
              { key: "name", label: "Produit", className: "font-medium" },
              {
                key: "totalStock",
                label: "Stock / seuil",
                render: (r) => (
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-ink-900/[0.07]">
                      <div
                        className="h-full rounded-full bg-danger"
                        style={{ width: `${Math.min(100, (r.totalStock / Math.max(1, r.minStockLevel)) * 100)}%` }}
                      />
                    </div>
                    <span className="mono text-xs text-danger">
                      {r.totalStock}/{r.minStockLevel}
                    </span>
                  </div>
                ),
              },
            ]}
            rows={stats.lowStockProducts}
          />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink-900">Derniers mouvements</h2>
          <DataTable
            columns={[
              { key: "type", label: "Type", render: (r) => <MovementTypeBadge type={r.type} /> },
              { key: "product", label: "Produit", render: (r) => r.product?.name, className: "font-medium" },
              { key: "quantity", label: "Qté", render: (r) => <span className="mono text-xs">{formatNumber(r.quantity)}</span> },
              { key: "date", label: "Date", render: (r) => <span className="text-xs text-ink-400">{formatDateTime(r.createdAt)}</span> },
            ]}
            rows={stats.recentMovements}
          />
        </div>
      </div>
    </div>
  );
}
