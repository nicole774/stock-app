import { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import Button from "../components/Button.jsx";
import Badge from "../components/Badge.jsx";
import Field, { inputClass } from "../components/Field.jsx";
import { useToast } from "../components/Toast.jsx";
import { useConfirm } from "../components/ConfirmDialog.jsx";
import { formatMoney, formatNumber, formatDate, statusLabel } from "../utils/format.js";
import { IconPlus, IconTrash, IconCheckCircle, IconBan } from "../components/icons.jsx";

function StatusBadge({ status }) {
  const map = {
    PENDING: { tone: "warning", label: statusLabel(status) },
    CONFIRMED: { tone: "info", label: statusLabel(status) },
    RECEIVED: { tone: "success", label: statusLabel(status) },
    CANCELLED: { tone: "neutral", label: statusLabel(status) },
  };
  const { tone, label } = map[status] || { tone: "neutral", label: status };
  return <Badge tone={tone}>{label}</Badge>;
}

const emptyItem = { productId: "", quantity: 1, unitCost: 0 };

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [supplierId, setSupplierId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [items, setItems] = useState([emptyItem]);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  async function load() {
    setLoading(true);
    try {
      const { data } = await client.get("/purchase-orders");
      setOrders(data);
    } catch {
      toast.error("Impossible de charger les commandes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    client.get("/suppliers").then((r) => setSuppliers(r.data)).catch(() => {});
    client.get("/warehouses").then((r) => setWarehouses(r.data)).catch(() => {});
    client.get("/products").then((r) => setProducts(r.data)).catch(() => {});
  }, []);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + Number(i.quantity || 0) * Number(i.unitCost || 0), 0),
    [items]
  );

  function updateItem(index, patch) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  // Pré-remplit le coût d'achat au choix du produit
  function handleProductChange(index, productId) {
    const product = products.find((p) => p.id === productId);
    updateItem(index, {
      productId,
      unitCost: product ? Number(product.costPrice) : 0,
    });
  }

  function addItem() {
    setItems((prev) => [...prev, { ...emptyItem }]);
  }

  function removeItem(index) {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await client.post("/purchase-orders", {
        supplierId,
        warehouseId,
        items: items.map((i) => ({ ...i, quantity: Number(i.quantity), unitCost: Number(i.unitCost) })),
      });
      toast.success("Commande d'achat créée.");
      setOpen(false);
      setItems([emptyItem]);
      setSupplierId("");
      setWarehouseId("");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la création.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReceive(order) {
    const ok = await confirm({
      title: "Réceptionner la commande",
      message: `Confirmer la réception de ${order.reference} ? Le stock de « ${order.warehouse?.name} » sera incrémenté.`,
      confirmLabel: "Réceptionner",
    });
    if (!ok) return;
    try {
      await client.patch(`/purchase-orders/${order.id}/receive`);
      toast.success(`Commande ${order.reference} réceptionnée — stock mis à jour.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la réception.");
    }
  }

  async function handleCancel(order) {
    const ok = await confirm({
      title: "Annuler la commande",
      message: `Annuler ${order.reference} ? Cette action est définitive.`,
      confirmLabel: "Annuler la commande",
      danger: true,
    });
    if (!ok) return;
    try {
      await client.patch(`/purchase-orders/${order.id}/status`, { status: "CANCELLED" });
      toast.success("Commande annulée.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Commandes d'achat"
        description="Approvisionnement auprès des fournisseurs"
        action={
          <Button variant="accent" onClick={() => setOpen(true)}>
            <IconPlus size={15} /> Nouvelle commande
          </Button>
        }
      />

      <DataTable
        loading={loading && !orders.length}
        emptyLabel="Aucune commande d'achat."
        rows={orders}
        onRowClick={(row) => setDetail(row)}
        columns={[
          { key: "reference", label: "Référence", render: (r) => <span className="mono text-xs text-ink-400">{r.reference}</span> },
          { key: "supplier", label: "Fournisseur", render: (r) => r.supplier?.name },
          { key: "warehouse", label: "Entrepôt", render: (r) => r.warehouse?.name },
          { key: "items", label: "Articles", render: (r) => <span className="text-xs text-ink-400">{r.items?.length}</span> },
          {
            key: "totalAmount",
            label: "Montant",
            align: "right",
            render: (r) => <span className="mono text-sm font-medium">{formatMoney(r.totalAmount)}</span>,
          },
          { key: "status", label: "Statut", render: (r) => <StatusBadge status={r.status} /> },
          { key: "date", label: "Date", render: (r) => <span className="text-xs text-ink-400">{formatDate(r.createdAt)}</span> },
          {
            key: "actions",
            label: "",
            align: "right",
            render: (r) => (
              <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                {r.status !== "RECEIVED" && r.status !== "CANCELLED" && (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => handleReceive(r)}>
                      <IconCheckCircle size={13} className="text-teal" /> Réceptionner
                    </Button>
                    <Button size="sm" variant="subtle" onClick={() => handleCancel(r)}>
                      <IconBan size={13} /> Annuler
                    </Button>
                  </>
                )}
              </div>
            ),
          },
        ]}
      />

      {/* Modal création */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nouvelle commande d'achat"
        description="Le stock ne sera incrémenté qu'à la réception"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Field label="Fournisseur" required>
              <select required className={inputClass} value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                <option value="">Sélectionner...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Entrepôt de réception" required>
              <select required className={inputClass} value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
                <option value="">Sélectionner...</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mb-1 mt-1 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-400">Articles</p>
            <button type="button" onClick={addItem} className="text-xs font-medium text-amber-dark hover:underline">
              + Ajouter un article
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 items-center gap-2">
                <select
                  className={`${inputClass} col-span-6`}
                  required
                  value={item.productId}
                  onChange={(e) => handleProductChange(i, e.target.value)}
                >
                  <option value="">Produit...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input
                  type="number" min="1" required placeholder="Qté"
                  className={`${inputClass} col-span-2`}
                  value={item.quantity}
                  onChange={(e) => updateItem(i, { quantity: e.target.value })}
                />
                <input
                  type="number" step="0.01" min="0" required placeholder="Coût unit."
                  className={`${inputClass} col-span-3`}
                  value={item.unitCost}
                  onChange={(e) => updateItem(i, { unitCost: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  disabled={items.length === 1}
                  aria-label="Retirer l'article"
                  className="col-span-1 flex justify-center rounded-lg p-1.5 text-ink-300 transition-colors hover:text-danger disabled:opacity-30"
                >
                  <IconTrash size={15} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-paper px-4 py-3">
            <span className="text-xs text-ink-400">Total de la commande</span>
            <span className="mono text-base font-semibold text-ink-900">{formatMoney(total)}</span>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" variant="primary" loading={submitting}>Créer la commande</Button>
          </div>
        </form>
      </Modal>

      {/* Modal détail */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `Commande ${detail.reference}` : ""}
        description={detail ? `Créée le ${formatDate(detail.createdAt)} par ${detail.user?.name || "—"}` : ""}
      >
        {detail && (
          <div>
            <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-ink-400">Fournisseur</p>
                <p className="font-medium">{detail.supplier?.name}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400">Entrepôt</p>
                <p className="font-medium">{detail.warehouse?.name}</p>
              </div>
              <div>
                <p className="text-xs text-ink-400">Statut</p>
                <StatusBadge status={detail.status} />
              </div>
              <div>
                <p className="text-xs text-ink-400">Total</p>
                <p className="mono font-semibold">{formatMoney(detail.totalAmount)}</p>
              </div>
            </div>

            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-400">Articles</p>
            <div className="divide-y divide-rule rounded-lg border border-rule">
              {detail.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-3 py-2.5 text-sm">
                  <div>
                    <p className="font-medium">{item.product?.name}</p>
                    <p className="mono text-[11px] text-ink-300">{item.product?.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="mono text-xs text-ink-400">
                      {formatNumber(item.quantity)} × {formatMoney(item.unitCost)}
                    </p>
                    <p className="mono text-sm font-medium">
                      {formatMoney(Number(item.quantity) * Number(item.unitCost))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
