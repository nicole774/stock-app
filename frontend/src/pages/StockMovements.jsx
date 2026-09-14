import { useEffect, useState } from "react";
import client from "../api/client";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import Button from "../components/Button.jsx";
import Field from "../components/Field.jsx";

const inputClass = "w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink-900";

const TYPES = [
  { value: "IN", label: "Entrée (réception)" },
  { value: "OUT", label: "Sortie" },
  { value: "TRANSFER", label: "Transfert entre entrepôts" },
  { value: "ADJUSTMENT", label: "Ajustement d'inventaire" },
];

const emptyForm = { type: "IN", productId: "", fromWarehouseId: "", toWarehouseId: "", quantity: "", reason: "" };

export default function StockMovements() {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  async function load() {
    const { data } = await client.get("/stock/movements");
    setMovements(data);
  }

  useEffect(() => {
    load();
    client.get("/products").then((r) => setProducts(r.data));
    client.get("/warehouses").then((r) => setWarehouses(r.data));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await client.post("/stock/movements", {
        ...form,
        quantity: Number(form.quantity),
        fromWarehouseId: form.fromWarehouseId || null,
        toWarehouseId: form.toWarehouseId || null,
      });
      setForm(emptyForm);
      setOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    }
  }

  const needsFrom = ["OUT", "TRANSFER"].includes(form.type);
  const needsTo = ["IN", "TRANSFER"].includes(form.type);

  return (
    <div className="p-8">
      <PageHeader
        title="Mouvements de stock"
        description="Historique des entrées, sorties, transferts et ajustements"
        action={<Button variant="accent" onClick={() => setOpen(true)}>Nouveau mouvement</Button>}
      />

      <DataTable
        columns={[
          { key: "type", label: "Type", render: (r) => <span className="mono text-xs">{r.type}</span> },
          { key: "product", label: "Produit", render: (r) => r.product?.name },
          { key: "quantity", label: "Qté" },
          { key: "from", label: "De", render: (r) => r.fromWarehouse?.name || "—" },
          { key: "to", label: "Vers", render: (r) => r.toWarehouse?.name || "—" },
          { key: "reason", label: "Motif", render: (r) => r.reason || "—" },
          { key: "date", label: "Date", render: (r) => new Date(r.createdAt).toLocaleString("fr-FR") },
        ]}
        rows={movements}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau mouvement de stock">
        <form onSubmit={handleSubmit}>
          {error && <p className="mb-4 text-sm text-danger border border-danger/30 bg-danger/5 px-3 py-2">{error}</p>}

          <Field label="Type de mouvement">
            <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>

          <Field label="Produit">
            <select required className={inputClass} value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
              <option value="">Sélectionner...</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            {needsFrom && (
              <Field label="Entrepôt source">
                <select required className={inputClass} value={form.fromWarehouseId} onChange={(e) => setForm({ ...form, fromWarehouseId: e.target.value })}>
                  <option value="">Sélectionner...</option>
                  {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </Field>
            )}
            {needsTo && (
              <Field label="Entrepôt destination">
                <select required className={inputClass} value={form.toWarehouseId} onChange={(e) => setForm({ ...form, toWarehouseId: e.target.value })}>
                  <option value="">Sélectionner...</option>
                  {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </Field>
            )}
            {form.type === "ADJUSTMENT" && (
              <Field label="Entrepôt concerné">
                <select required className={inputClass} value={form.toWarehouseId} onChange={(e) => setForm({ ...form, toWarehouseId: e.target.value })}>
                  <option value="">Sélectionner...</option>
                  {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </Field>
            )}
          </div>

          <Field label="Quantité">
            <input type="number" required className={inputClass} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          </Field>

          <Field label="Motif (optionnel)">
            <input className={inputClass} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </Field>

          <Button type="submit" variant="primary" className="w-full">Enregistrer le mouvement</Button>
        </form>
      </Modal>
    </div>
  );
}
