import { useEffect, useState } from "react";
import client from "../api/client";
import StatCard from "../components/StatCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    client.get("/dashboard/stats").then((res) => setStats(res.data));
  }, []);

  if (!stats) {
    return <div className="p-8 text-sm text-ink-500">Chargement du tableau de bord...</div>;
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de votre stock et de vos entrepôts"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Produits actifs" value={stats.productCount} />
        <StatCard label="Entrepôts" value={stats.warehouseCount} />
        <StatCard label="Unités en stock" value={stats.totalStockUnits} />
        <StatCard
          label="Valeur du stock"
          value={`${stats.totalStockValue.toLocaleString("fr-FR")} F`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            Alertes de stock bas
            {stats.lowStockCount > 0 && (
              <span className="mono text-xs bg-danger/10 text-danger px-2 py-0.5">
                {stats.lowStockCount}
              </span>
            )}
          </h2>
          <DataTable
            emptyLabel="Aucune alerte — tous les stocks sont au-dessus du seuil."
            columns={[
              { key: "sku", label: "SKU", render: (r) => <span className="mono text-xs">{r.sku}</span> },
              { key: "name", label: "Produit" },
              { key: "totalStock", label: "Stock" },
              { key: "minStockLevel", label: "Seuil" },
            ]}
            rows={stats.lowStockProducts}
          />
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-3">Derniers mouvements</h2>
          <DataTable
            columns={[
              {
                key: "type",
                label: "Type",
                render: (r) => <span className="mono text-xs">{r.type}</span>,
              },
              { key: "product", label: "Produit", render: (r) => r.product?.name },
              { key: "quantity", label: "Qté" },
              {
                key: "date",
                label: "Date",
                render: (r) => new Date(r.createdAt).toLocaleDateString("fr-FR"),
              },
            ]}
            rows={stats.recentMovements}
          />
        </div>
      </div>
    </div>
  );
}
