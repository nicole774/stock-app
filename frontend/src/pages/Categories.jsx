import { useEffect, useState } from "react";
import client from "../api/client";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import Button from "../components/Button.jsx";
import Field from "../components/Field.jsx";

const inputClass = "w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink-900";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  async function load() {
    const { data } = await client.get("/categories");
    setCategories(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    await client.post("/categories", form);
    setForm({ name: "", description: "" });
    setOpen(false);
    load();
  }

  async function handleDelete(id) {
    if (!confirm("Supprimer cette catégorie ?")) return;
    await client.delete(`/categories/${id}`);
    load();
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Catégories"
        description="Classification des produits du catalogue"
        action={<Button variant="accent" onClick={() => setOpen(true)}>Nouvelle catégorie</Button>}
      />

      <DataTable
        columns={[
          { key: "name", label: "Nom" },
          { key: "description", label: "Description" },
          {
            key: "actions",
            label: "",
            render: (r) => (
              <button onClick={() => handleDelete(r.id)} className="text-xs text-danger hover:underline">
                Supprimer
              </button>
            ),
          },
        ]}
        rows={categories}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Nouvelle catégorie">
        <form onSubmit={handleSubmit}>
          <Field label="Nom">
            <input
              required
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Description">
            <textarea
              className={inputClass}
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <Button type="submit" variant="primary" className="w-full">
            Enregistrer
          </Button>
        </form>
      </Modal>
    </div>
  );
}
