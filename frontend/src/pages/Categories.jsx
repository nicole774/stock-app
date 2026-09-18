import { useEffect, useState } from "react";
import client from "../api/client";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import Button, { IconButton } from "../components/Button.jsx";
import Field, { inputClass } from "../components/Field.jsx";
import { useToast } from "../components/Toast.jsx";
import { useConfirm } from "../components/ConfirmDialog.jsx";
import { IconPlus, IconPencil, IconTrash, IconTag } from "../components/icons.jsx";

const emptyForm = { name: "", description: "" };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const toast = useToast();
  const confirm = useConfirm();

  async function load() {
    setLoading(true);
    try {
      const { data } = await client.get("/categories");
      setCategories(data);
    } catch {
      toast.error("Impossible de charger les catégories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(category) {
    setEditing(category);
    setForm({ name: category.name, description: category.description || "" });
    setOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) {
        await client.put(`/categories/${editing.id}`, form);
        toast.success("Catégorie mise à jour.");
      } else {
        await client.post("/categories", form);
        toast.success("Catégorie créée.");
      }
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    }
  }

  async function handleDelete(category) {
    const ok = await confirm({
      title: "Supprimer la catégorie",
      message: `Supprimer « ${category.name} » ? Cette action est irréversible.`,
      confirmLabel: "Supprimer",
      danger: true,
    });
    if (!ok) return;
    try {
      await client.delete(`/categories/${category.id}`);
      toast.success("Catégorie supprimée.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Suppression impossible (des produits y sont peut-être rattachés).");
    }
  }

  return (
    <div>
      <PageHeader
        title="Catégories"
        description="Classification des produits du catalogue"
        action={
          <Button variant="accent" onClick={openCreate}>
            <IconPlus size={15} /> Nouvelle catégorie
          </Button>
        }
      />

      <DataTable
        loading={loading && !categories.length}
        emptyLabel="Aucune catégorie pour le moment."
        rows={categories}
        columns={[
          {
            key: "name",
            label: "Nom",
            render: (r) => (
              <span className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-light text-amber-dark">
                  <IconTag size={14} />
                </span>
                <span className="font-medium">{r.name}</span>
              </span>
            ),
          },
          { key: "description", label: "Description", render: (r) => r.description || "—" },
          {
            key: "createdAt",
            label: "Créée le",
            render: (r) => (
              <span className="text-xs text-ink-400">
                {new Date(r.createdAt).toLocaleDateString("fr-FR")}
              </span>
            ),
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
                <IconButton label="Supprimer" onClick={() => handleDelete(r)} className="hover:text-danger">
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
        title={editing ? "Modifier la catégorie" : "Nouvelle catégorie"}
        size="sm"
      >
        <form onSubmit={handleSubmit}>
          <Field label="Nom" required>
            <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Description">
            <textarea rows={3} className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" variant="primary">Enregistrer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
