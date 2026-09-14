import { useEffect, useState } from "react";
import client from "../api/client";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import Button from "../components/Button.jsx";
import Field from "../components/Field.jsx";

const inputClass = "w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink-900";

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [items, setItems] = useState([{ productId: "", quantity: 1, unitCost: 0 }]);
  const [error, setError] = useState("");

  async function load() {
    const { data } = await client.get("/purchase-orders");
    setOrders(data);
  }

  useEffect(() => {
    load();
    client.get("/suppliers").then((r) => setSuppliers(r.data));
    client.get("/warehouses").then((r) => setWarehouses(r.data));
    client.get("/products").then((r) => setProducts(r.data));
  }, []);

  function updateItem(index, patch) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { productId: "", quantity: 1, unitCost: 0 }]);
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await client.post("/purchase-orders", {
        supplierId,
        warehouseId,
        items: items.map((i) => ({ ...i, quantity: Number(i.quantity), unitCost: Number(i.unitCost) })),
      });
      setOpen(false);
      setItems([{ productId: "", quantity: 1, unitCost: 0 }]);
      setSupplierId("");
      setWarehouseId("");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création.");
    }
  }

  async function handleReceive(id) {
    if (!confirm("Confirmer la réception ? Le stock de l'entrepôt sera mis à jour.")) return;
    await client.patch(`/purchase-orders/${id}/receive`);
    load();
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Commandes d'achat"
        description="Approvisionnement auprès des fournisseurs"
        action={<Button variant="accent" onClick={() => setOpen(true)}>Nouvelle commande</Button>}
      />

      <DataTable
        columns={[
          { key: "reference", label: "Référence", render: (r) => <span className="mono text-xs">{r.reference}</span> },
          { key: "supplier", label: "Fournisseur", render: (r) => r.supplier?.name },
          { key: "warehouse", label: "Entrepôt", render: (r) => r.warehouse?.name },
          { key: "totalAmount", label: "Montant", render: (r) => `${Number(r.totalAmount).toLocaleString("fr-FR")} F` },
          {
            key: "status", label: "Statut",
            render: (r) => (
              <span className={`text-xs ${r.status === "RECEIVED" ? "text-teal" : "text-ink-500"}`}>{r.status}</span>
            ),
          },
          {
            key: "actions", label: "",
            render: (r) => r.status !== "RECEIVED" && (
              <button onClick={() => handleReceive(r.id)} className="text-xs text-amber hover:underline">
                Marquer reçue
              </button>
            ),
          },
        ]}
        rows={orders}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Nouvelle commande d'achat">
        <form onSubmit={handleSubmit}>
          {error && <p className="mb-4 text-sm text-danger border border-danger/30 bg-danger/5 px-3 py-2">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Fournisseur">
              <select required className={inputClass} value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                <option value="">Sélectionner...</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Entrepôt de réception">
              <select required className={inputClass} value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
                <option value="">Sélectionner...</option>
                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </Field>
          </div>

          <p className="text-xs text-ink-500 mb-2 mt-2">Articles</p>
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center">
              <select
                className={`${inputClass} col-span-6`}
                required
                value={item.productId}
                onChange={(e) => updateItem(i, { productId: e.target.value })}
              >
                <option value="">Produit...</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input
                type="number" min="1" required placeholder="Qté"
                className={`${inputClass} col-span-2`}
                value={item.quantity}
                onChange={(e) => updateItem(i, { quantity: e.target.value })}
              />
              <input
                type="number" step="0.01" required placeholder="Coût unit."
                className={`${inputClass} col-span-3`}
                value={item.unitCost}
                onChange={(e) => updateItem(i, { unitCost: e.target.value })}
              />
              <button type="button" onClick={() => removeItem(i)} className="col-span-1 text-danger text-xs">✕</button>
            </div>
          ))}
          <button type="button" onClick={addItem} className="text-xs text-amber mb-4 hover:underline">
            + Ajouter un article
          </button>

          <Button type="submit" variant="primary" className="w-full">Créer la commande</Button>
        </form>
      </Modal>
    </div>
  );
}
