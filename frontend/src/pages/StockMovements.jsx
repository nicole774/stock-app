import { useEffect, useState } from "react";
import client from "../api/client";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import Button from "../components/Button.jsx";
import Badge from "../components/Badge.jsx";
import Field, { inputClass } from "../components/Field.jsx";
import { useToast } from "../components/Toast.jsx";
import { formatNumber, formatDateTime } from "../utils/format.js";
import {
  IconPlus,
  IconArrowUp,
  IconArrowDown,
  IconArrowRight,
  IconFilter,
} from "../components/icons.jsx";

const TYPES = [
  { value: "IN", label: "Entrée (réception)" },
  { value: "OUT", label: "Sortie" },
  { value: "TRANSFER", label: "Transfert entre entrepôts" },
  { value: "ADJUSTMENT", label: "Ajustement d'inventaire" },
];

const emptyForm = {
  type: "IN",
  productId: "",
  fromWarehouseId: "",
  toWarehouseId: "",
  quantity: "",
  reason: "",
  adjustSign: "+",
};

function TypeBadge({ type }) {
  if (type === "IN") return <Badge tone="success" icon={<IconArrowUp size={11} />}>Entrée</Badge>;
  if (type === "OUT") return <Badge tone="danger" icon={<IconArrowDown size={11} />}>Sortie</Badge>;
  if (type === "TRANSFER") return <Badge tone="info" icon={<IconArrowRight size={11} />}>Transfert</Badge>;
  return <Badge tone="warning">Ajustement</Badge>;
}

export default function StockMovements() {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [filters, setFilters] = useState({ type: "", productId: "", warehouseId: "" });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  async function load() {
    setLoading(true);
    try {
      const { data } = await client.get("/stock/movements", {
        params: {
          type: filters.type || undefined,
          productId: filters.productId || undefined,
          warehouseId: filters.warehouseId || undefined,
        },
      });
      setMovements(data);
    } catch {
      toast.error("Impossible de charger les mouvements.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filters]);

  useEffect(() => {
    client.get("/products").then((r) => setProducts(r.data)).catch(() => {});
    client.get("/warehouses").then((r) => setWarehouses(r.data)).catch(() => {});
  }, []);

  const needsFrom = ["OUT", "TRANSFER"].includes(form.type);
  const needsTo = ["IN", "TRANSFER"].includes(form.type);
  const isAdjustment = form.type === "ADJUSTMENT";

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const signedQuantity = isAdjustment && form.adjustSign === "-" ? -Number(form.quantity) : Number(form.quantity);
      await client.post("/stock/movements", {
        type: form.type,
        productId: form.productId,
        quantity: signedQuantity,
        fromWarehouseId: form.fromWarehouseId || null,
        toWarehouseId: form.toWarehouseId || null,
        reason: form.reason || undefined,
      });
      toast.success("Mouvement enregistré.");
      setForm(emptyForm);
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Mouvements de stock"
        description="Historique des entrées, sorties, transferts et ajustements"
        action={
          <Button variant="accent" onClick={() => setOpen(true)}>
            <IconPlus size={15} /> Nouveau mouvement
          </Button>
        }
      />

      {/* Filtres */}
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <select
          className={inputClass}
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">Tous les types</option>
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select
          className={inputClass}
          value={filters.productId}
          onChange={(e) => setFilters({ ...filters, productId: e.target.value })}
        >
          <option value="">Tous les produits</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          className={inputClass}
          value={filters.warehouseId}
          onChange={(e) => setFilters({ ...filters, warehouseId: e.target.value })}
        >
          <option value="">Tous les entrepôts</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      <DataTable
        loading={loading}
        emptyLabel="Aucun mouvement pour ces filtres."
        rows={movements}
        columns={[
          { key: "type", label: "Type", render: (r) => <TypeBadge type={r.type} /> },
          {
            key: "product",
            label: "Produit",
            render: (r) => (
              <div>
                <p className="font-medium">{r.product?.name}</p>
                <p className="mono text-[11px] text-ink-300">{r.product?.sku}</p>
              </div>
            ),
          },
          {
            key: "quantity",
            label: "Qté",
            render: (r) => (
              <span className={`mono text-sm font-medium ${
                r.type === "IN" ? "text-teal" : r.type === "OUT" ? "text-danger" : "text-ink-900"
              }`}>
                {r.type === "IN" ? "+" : r.type === "OUT" ? "−" : ""}
                {formatNumber(r.quantity)}
              </span>
            ),
          },
          { key: "from", label: "De", render: (r) => r.fromWarehouse?.name || "—" },
          { key: "to", label: "Vers", render: (r) => r.toWarehouse?.name || "—" },
          {
            key: "reason",
            label: "Motif",
            render: (r) => <span className="max-w-[180px] truncate text-xs text-ink-400">{r.reason || "—"}</span>,
          },
          { key: "user", label: "Par", render: (r) => <span className="text-xs text-ink-400">{r.user?.name || "—"}</span> },
          { key: "date", label: "Date", render: (r) => <span className="text-xs text-ink-400">{formatDateTime(r.createdAt)}</span> },
        ]}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nouveau mouvement de stock"
        description="Toute opération est tracée et met à jour les quantités"
      >
        <form onSubmit={handleSubmit}>
          <Field label="Type de mouvement">
            <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Produit" required>
            <select required className={inputClass} value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
              <option value="">Sélectionner...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            {needsFrom && (
              <Field label="Entrepôt source" required>
                <select
                  required
                  className={inputClass}
                  value={form.fromWarehouseId}
                  onChange={(e) => setForm({ ...form, fromWarehouseId: e.target.value })}
                >
                  <option value="">Sélectionner...</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </Field>
            )}
            {needsTo && (
              <Field label="Entrepôt destination" required>
                <select
                  required
                  className={inputClass}
                  value={form.toWarehouseId}
                  onChange={(e) => setForm({ ...form, toWarehouseId: e.target.value })}
                >
                  <option value="">Sélectionner...</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </Field>
            )}
            {isAdjustment && (
              <Field label="Entrepôt concerné" required>
                <select
                  required
                  className={inputClass}
                  value={form.toWarehouseId}
                  onChange={(e) => setForm({ ...form, toWarehouseId: e.target.value })}
                >
                  <option value="">Sélectionner...</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </Field>
            )}
          </div>

          {isAdjustment ? (
            <Field label="Sens de l'ajustement">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "+", label: "Ajouter (+)", active: "bg-teal-light border-teal text-teal" },
                  { value: "-", label: "Retirer (−)", active: "bg-danger-light border-danger text-danger" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, adjustSign: opt.value })}
                    className={`rounded-lg border px-3 py-2 text-sm transition-all ${
                      form.adjustSign === opt.value
                        ? `${opt.active} font-medium`
                        : "border-rule bg-white text-ink-400 hover:border-ink-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>
          ) : null}

          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Field label="Quantité" required>
              <input
                type="number"
                min={isAdjustment ? undefined : 1}
                required
                className={inputClass}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </Field>
            <Field label="Motif (optionnel)">
              <input className={inputClass} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            </Field>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Enregistrer le mouvement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
