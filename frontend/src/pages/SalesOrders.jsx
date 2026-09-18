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
import { IconPlus, IconTrash, IconBan, IconAlert } from "../components/icons.jsx";

function StatusBadge({ status }) {
  const map = {
    PENDING: { tone: "warning", label: statusLabel(status) },
    CONFIRMED: { tone: "success", label: statusLabel(status) },
    CANCELLED: { tone: "neutral", label: statusLabel(status) },
  };
  const { tone, label } = map[status] || { tone: "neutral", label: status };
  return <Badge tone={tone}>{label}</Badge>;
}

const emptyItem = { productId: "", quantity: 1, unitPrice: 0 };

export default function SalesOrders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [customerId, setCustomerId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [items, setItems] = useState([emptyItem]);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  async function load() {
    setLoading(true);
    try {
      const { data } = await client.get("/sales-orders");
      setOrders(data);
    } catch {
      toast.error("Impossible de charger les ventes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    client.get("/customers").then((r) => setCustomers(r.data)).catch(() => {});
    client.get("/warehouses").then((r) => setWarehouses(r.data)).catch(() => {});
    client.get("/products").then((r) => setProducts(r.data)).catch(() => {});
  }, []);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + Number(i.quantity || 0) * Number(i.unitPrice || 0), 0),
    [items]
  );

  // Stock disponible dans l'entrepôt choisi pour chaque produit
  function availableFor(productId) {
    if (!warehouseId) return null;
    const product = products.find((p) => p.id === productId);
    return product?.stockItems?.find((s) => s.warehouseId === warehouseId)?.quantity ?? 0;
  }

  function updateItem(index, patch) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function handleProductChange(index, productId) {
    const product = products.find((p) => p.id === productId);
    updateItem(index, {
      productId,
      unitPrice: product ? Number(product.sellingPrice) : 0,
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
      await client.post("/sales-orders", {
        customerId,
        warehouseId,
        items: items.map((i) => ({ ...i, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) })),
      });
      toast.success("Vente enregistrée — stock déduit.");
      setOpen(false);
      setItems([emptyItem]);
      setCustomerId("");
      setWarehouseId("");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur — vérifiez le stock disponible.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(order) {
    const ok = await confirm({
      title: "Annuler la vente",
      message: `Annuler ${order.reference} ? Les quantités seront réintégrées dans « ${order.warehouse?.name} ».`,
      confirmLabel: "Annuler la vente",
      danger: true,
    });
    if (!ok) return;
    try {
      await client.patch(`/sales-orders/${order.id}/status`, { status: "CANCELLED" });
      toast.success("Vente annulée — stock réintégré.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Commandes de vente"
        description="Sorties de stock vers vos clients — déduction immédiate"
        action={
          <Button variant="accent" onClick={() => setOpen(true)}>
            <IconPlus size={15} /> Nouvelle vente
          </Button>
        }
      />

      <DataTable
        loading={loading && !orders.length}
        emptyLabel="Aucune vente enregistrée."
        rows={orders}
        onRowClick={(row) => setDetail(row)}
        columns={[
          { key: "reference", label: "Référence", render: (r) => <span className="mono text-xs text-ink-400">{r.reference}</span> },
          { key: "customer", label: "Client", render: (r) => r.customer?.name },
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
              <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                {r.status === "CONFIRMED" && (
                  <Button size="sm" variant="subtle" onClick={() => handleCancel(r)}>
                    <IconBan size={13} /> Annuler
                  </Button>
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
        title="Nouvelle commande de vente"
        description="Le stock est déduit immédiatement à la création"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Field label="Client" required>
              <select required className={inputClass} value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Sélectionner...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Entrepôt source" required>
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
            {items.map((item, i) => {
              const available = availableFor(item.productId);
              const insufficient = available != null && Number(item.quantity) > available;
              return (
                <div key={i} className="rounded-lg border border-rule p-2">
                  <div className="grid grid-cols-12 items-center gap-2">
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
                      className={`${inputClass} col-span-2 ${insufficient ? "border-danger" : ""}`}
                      value={item.quantity}
                      onChange={(e) => updateItem(i, { quantity: e.target.value })}
                    />
                    <input
                      type="number" step="0.01" min="0" required placeholder="Prix unit."
                      className={`${inputClass} col-span-3`}
                      value={item.unitPrice}
                      onChange={(e) => updateItem(i, { unitPrice: e.target.value })}
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
                  {available != null && item.productId && (
                    <p className={`mt-1 flex items-center gap-1 pl-1 text-[11px] ${insufficient ? "text-danger" : "text-ink-400"}`}>
                      {insufficient && <IconAlert size={11} />}
                      Disponible : {formatNumber(available)} unité(s) dans cet entrepôt
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-paper px-4 py-3">
            <span className="text-xs text-ink-400">Total de la vente</span>
            <span className="mono text-base font-semibold text-ink-900">{formatMoney(total)}</span>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" variant="primary" loading={submitting}>Créer la vente</Button>
          </div>
        </form>
      </Modal>

      {/* Modal détail */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `Vente ${detail.reference}` : ""}
        description={detail ? `Créée le ${formatDate(detail.createdAt)} par ${detail.user?.name || "—"}` : ""}
      >
        {detail && (
          <div>
            <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-ink-400">Client</p>
                <p className="font-medium">{detail.customer?.name}</p>
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
                      {formatNumber(item.quantity)} × {formatMoney(item.unitPrice)}
                    </p>
                    <p className="mono text-sm font-medium">
                      {formatMoney(Number(item.quantity) * Number(item.unitPrice))}
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
