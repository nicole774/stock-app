import { useEffect, useState } from "react";
import client from "../api/client";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import Button from "../components/Button.jsx";
import Field from "../components/Field.jsx";

const inputClass = "w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink-900";

const emptyForm = {
  sku: "", name: "", description: "", unit: "pcs",
  costPrice: "", sellingPrice: "", minStockLevel: 0,
  categoryId: "", supplierId: "",
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function load() {
    const { data } = await client.get("/products", { params: { search } });
    setProducts(data);
  }

  useEffect(() => {
    client.get("/categories").then((r) => setCategories(r.data));
    client.get("/suppliers").then((r) => setSuppliers(r.data));
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [search]);

  async function handleSubmit(e) {
    e.preventDefault();
    await client.post("/products", {
      ...form,
      costPrice: Number(form.costPrice),
      sellingPrice: Number(form.sellingPrice),
      minStockLevel: Number(form.minStockLevel),
      categoryId: form.categoryId || null,
      supplierId: form.supplierId || null,
    });
    setForm(emptyForm);
    setOpen(false);
    load();
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Produits"
        description="Catalogue et niveaux de stock par entrepôt"
        action={<Button variant="accent" onClick={() => setOpen(true)}>Nouveau produit</Button>}
      />

      <input
        placeholder="Rechercher par nom ou SKU..."
        className={`${inputClass} max-w-sm mb-4`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <DataTable
        columns={[
          { key: "sku", label: "SKU", render: (r) => <span className="mono text-xs">{r.sku}</span> },
          { key: "name", label: "Nom" },
          { key: "category", label: "Catégorie", render: (r) => r.category?.name || "—" },
          {
            key: "totalStock", label: "Stock total",
            render: (r) => (
              <span className={r.totalStock <= r.minStockLevel ? "text-danger font-medium" : ""}>
                {r.totalStock}
              </span>
            ),
          },
          {
            key: "sellingPrice", label: "Prix de vente",
            render: (r) => <span className="mono text-xs">{Number(r.sellingPrice).toLocaleString("fr-FR")} F</span>,
          },
        ]}
        rows={products}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau produit">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="SKU"><input required className={inputClass} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></Field>
            <Field label="Unité"><input className={inputClass} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></Field>
          </div>
          <Field label="Nom"><input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Description"><textarea rows={2} className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prix d'achat"><input type="number" step="0.01" required className={inputClass} value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} /></Field>
            <Field label="Prix de vente"><input type="number" step="0.01" required className={inputClass} value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} /></Field>
          </div>
          <Field label="Seuil d'alerte stock bas"><input type="number" className={inputClass} value={form.minStockLevel} onChange={(e) => setForm({ ...form, minStockLevel: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Catégorie">
              <select className={inputClass} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">—</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Fournisseur">
              <select className={inputClass} value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                <option value="">—</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
          </div>
          <Button type="submit" variant="primary" className="w-full mt-2">Enregistrer</Button>
        </form>
      </Modal>
    </div>
  );
}
