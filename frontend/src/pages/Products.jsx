import { useEffect, useState } from "react";
import client from "../api/client";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import Button, { IconButton } from "../components/Button.jsx";
import Badge from "../components/Badge.jsx";
import Field, { inputClass } from "../components/Field.jsx";
import { useToast } from "../components/Toast.jsx";
import { useConfirm } from "../components/ConfirmDialog.jsx";
import { formatMoney, formatNumber } from "../utils/format.js";
import { IconSearch, IconPlus, IconPencil, IconTrash, IconAlert, IconFilter } from "../components/icons.jsx";

const emptyForm = {
  sku: "",
  name: "",
  description: "",
  unit: "pcs",
  costPrice: "",
  sellingPrice: "",
  minStockLevel: 0,
  categoryId: "",
  supplierId: "",
  isActive: true,
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // produit en cours d'édition
  const [form, setForm] = useState(emptyForm);
  const toast = useToast();
  const confirm = useConfirm();

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await client.get("/products", {
        params: { search: search || undefined, categoryId: categoryFilter || undefined },
      });
      setProducts(data);
    } catch {
      setError("Impossible de charger les produits.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    client.get("/categories").then((r) => setCategories(r.data)).catch(() => {});
    client.get("/suppliers").then((r) => setSuppliers(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [search, categoryFilter]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(product) {
    setEditing(product);
    setForm({
      sku: product.sku,
      name: product.name,
      description: product.description || "",
      unit: product.unit || "pcs",
      costPrice: String(product.costPrice),
      sellingPrice: String(product.sellingPrice),
      minStockLevel: product.minStockLevel ?? 0,
      categoryId: product.categoryId || "",
      supplierId: product.supplierId || "",
      isActive: product.isActive,
    });
    setOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      costPrice: Number(form.costPrice),
      sellingPrice: Number(form.sellingPrice),
      minStockLevel: Number(form.minStockLevel),
      categoryId: form.categoryId || null,
      supplierId: form.supplierId || null,
    };
    try {
      if (editing) {
        await client.put(`/products/${editing.id}`, payload);
        toast.success("Produit mis à jour.");
      } else {
        await client.post("/products", payload);
        toast.success("Produit créé.");
      }
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    }
  }

  async function handleToggle(product) {
    const next = !product.isActive;
    const ok = await confirm({
      title: next ? "Réactiver le produit" : "Désactiver le produit",
      message: next
        ? `Réactiver « ${product.name} » dans le catalogue ?`
        : `Désactiver « ${product.name} » ? Il disparaîtra des alertes et du tableau de bord.`,
      confirmLabel: next ? "Réactiver" : "Désactiver",
      danger: !next,
    });
    if (!ok) return;
    try {
      await client.put(`/products/${product.id}`, { isActive: next });
      toast.success(next ? "Produit réactivé." : "Produit désactivé.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Produits"
        description="Catalogue et niveaux de stock par entrepôt"
        action={
          <Button variant="accent" onClick={openCreate}>
            <IconPlus size={15} /> Nouveau produit
          </Button>
        }
      />

      {/* Recherche + filtre */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative max-w-sm flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300">
            <IconSearch size={15} />
          </span>
          <input
            placeholder="Rechercher par nom ou SKU..."
            className={`${inputClass} pl-9`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative sm:w-56">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300">
            <IconFilter size={14} />
          </span>
          <select
            className={`${inputClass} pl-9`}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Toutes catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-danger/30 bg-danger-light px-3 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      <DataTable
        loading={loading && !products.length}
        emptyLabel={search || categoryFilter ? "Aucun produit ne correspond à la recherche." : "Aucun produit. Créez votre premier produit."}
        rows={products}
        columns={[
          { key: "sku", label: "SKU", render: (r) => <span className="mono text-xs text-ink-400">{r.sku}</span> },
          {
            key: "name",
            label: "Produit",
            render: (r) => (
              <div>
                <p className={`font-medium ${r.isActive ? "text-ink-900" : "text-ink-300 line-through"}`}>{r.name}</p>
                {r.description && <p className="max-w-[260px] truncate text-xs text-ink-400">{r.description}</p>}
              </div>
            ),
          },
          { key: "category", label: "Catégorie", render: (r) => r.category?.name || "—" },
          {
            key: "totalStock",
            label: "Stock",
            render: (r) => {
              const low = r.totalStock <= r.minStockLevel;
              return (
                <span className="inline-flex items-center gap-1.5">
                  {low && <IconAlert size={13} className="text-danger" />}
                  <span className={`mono text-sm font-medium ${low ? "text-danger" : "text-ink-900"}`}>
                    {formatNumber(r.totalStock)}
                  </span>
                  <span className="text-[11px] text-ink-300">{r.unit}</span>
                </span>
              );
            },
          },
          {
            key: "costPrice",
            label: "Achat",
            align: "right",
            render: (r) => <span className="mono text-xs text-ink-400">{formatMoney(r.costPrice)}</span>,
          },
          {
            key: "sellingPrice",
            label: "Vente",
            align: "right",
            render: (r) => <span className="mono text-sm">{formatMoney(r.sellingPrice)}</span>,
          },
          {
            key: "status",
            label: "État",
            render: (r) =>
              r.isActive ? <Badge tone="success">Actif</Badge> : <Badge tone="neutral">Inactif</Badge>,
          },
          {
            key: "actions",
            label: "",
            align: "right",
            render: (r) => (
              <div className="flex justify-end gap-0.5">
                <IconButton label="Modifier" onClick={() => openEdit(r)}>
                  <IconPencil size={15} />
                </IconButton>
                <IconButton
                  label={r.isActive ? "Désactiver" : "Réactiver"}
                  onClick={() => handleToggle(r)}
                  className={r.isActive ? "hover:text-danger" : "hover:text-teal"}
                >
                  <IconTrash size={15} />
                </IconButton>
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Modifier le produit" : "Nouveau produit"}
        description={editing ? editing.sku : "Ajoutez une référence à votre catalogue"}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Field label="SKU" required hint="Référence unique">
              <input required className={inputClass} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </Field>
            <Field label="Unité" hint="pcs, kg, carton...">
              <input className={inputClass} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </Field>
          </div>
          <Field label="Nom" required>
            <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Description">
            <textarea rows={2} className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Field label="Prix d'achat" required>
              <input type="number" step="0.01" min="0" required className={inputClass} value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
            </Field>
            <Field label="Prix de vente" required>
              <input type="number" step="0.01" min="0" required className={inputClass} value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Field label="Seuil d'alerte stock bas">
              <input type="number" min="0" className={inputClass} value={form.minStockLevel} onChange={(e) => setForm({ ...form, minStockLevel: e.target.value })} />
            </Field>
            <Field label="Catégorie">
              <select className={inputClass} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Fournisseur">
            <select className={inputClass} value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
              <option value="">—</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" variant="primary">
              {editing ? "Enregistrer les modifications" : "Créer le produit"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
