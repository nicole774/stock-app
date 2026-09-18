import { useEffect, useState } from "react";
import client from "../api/client";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import Button, { IconButton } from "../components/Button.jsx";
import Field, { inputClass } from "../components/Field.jsx";
import { useToast } from "../components/Toast.jsx";
import { useConfirm } from "../components/ConfirmDialog.jsx";
import { initials } from "../utils/format.js";
import { IconPlus, IconPencil, IconTrash, IconMail, IconPhone, IconMapPin, IconSearch } from "../components/icons.jsx";

const emptyForm = { name: "", email: "", phone: "", address: "" };

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const toast = useToast();
  const confirm = useConfirm();

  async function load() {
    setLoading(true);
    try {
      const { data } = await client.get("/suppliers", { params: { search: search || undefined } });
      setSuppliers(data);
    } catch {
      toast.error("Impossible de charger les fournisseurs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(supplier) {
    setEditing(supplier);
    setForm({
      name: supplier.name,
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
    });
    setOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) {
        await client.put(`/suppliers/${editing.id}`, form);
        toast.success("Fournisseur mis à jour.");
      } else {
        await client.post("/suppliers", form);
        toast.success("Fournisseur créé.");
      }
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    }
  }

  async function handleDelete(supplier) {
    const ok = await confirm({
      title: "Supprimer le fournisseur",
      message: `Supprimer « ${supplier.name} » ? Cette action est irréversible.`,
      confirmLabel: "Supprimer",
      danger: true,
    });
    if (!ok) return;
    try {
      await client.delete(`/suppliers/${supplier.id}`);
      toast.success("Fournisseur supprimé.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Suppression impossible.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Fournisseurs"
        description="Partenaires pour vos commandes d'achat"
        action={
          <Button variant="accent" onClick={openCreate}>
            <IconPlus size={15} /> Nouveau fournisseur
          </Button>
        }
      />

      <div className="relative mb-4 max-w-sm">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300">
          <IconSearch size={15} />
        </span>
        <input
          placeholder="Rechercher un fournisseur..."
          className={`${inputClass} pl-9`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        loading={loading && !suppliers.length}
        emptyLabel={search ? "Aucun fournisseur ne correspond à la recherche." : "Aucun fournisseur pour le moment."}
        rows={suppliers}
        columns={[
          {
            key: "name",
            label: "Fournisseur",
            render: (r) => (
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[11px] font-semibold text-white">
                  {initials(r.name)}
                </span>
                <span className="font-medium">{r.name}</span>
              </span>
            ),
          },
          {
            key: "email",
            label: "Email",
            render: (r) =>
              r.email ? (
                <span className="flex items-center gap-1.5 text-xs text-ink-500">
                  <IconMail size={13} className="text-ink-300" /> {r.email}
                </span>
              ) : (
                "—"
              ),
          },
          {
            key: "phone",
            label: "Téléphone",
            render: (r) =>
              r.phone ? (
                <span className="mono flex items-center gap-1.5 text-xs text-ink-500">
                  <IconPhone size={13} className="text-ink-300" /> {r.phone}
                </span>
              ) : (
                "—"
              ),
          },
          {
            key: "address",
            label: "Adresse",
            render: (r) =>
              r.address ? (
                <span className="flex items-center gap-1.5 text-xs text-ink-500">
                  <IconMapPin size={13} className="text-ink-300" /> {r.address}
                </span>
              ) : (
                "—"
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
        title={editing ? "Modifier le fournisseur" : "Nouveau fournisseur"}
      >
        <form onSubmit={handleSubmit}>
          <Field label="Nom" required>
            <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Field label="Email">
              <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Téléphone">
              <input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
          </div>
          <Field label="Adresse">
            <input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
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
