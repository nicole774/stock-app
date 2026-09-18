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
import { IconPlus, IconPencil, IconMapPin, IconWarehouse } from "../components/icons.jsx";

const emptyForm = { name: "", code: "", address: "", isActive: true };

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const toast = useToast();
  const confirm = useConfirm();

  async function load() {
    setLoading(true);
    try {
      const { data } = await client.get("/warehouses");
      setWarehouses(data);
    } catch {
      toast.error("Impossible de charger les entrepôts.");
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

  function openEdit(warehouse) {
    setEditing(warehouse);
    setForm({
      name: warehouse.name,
      code: warehouse.code,
      address: warehouse.address || "",
      isActive: warehouse.isActive,
    });
    setOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) {
        await client.put(`/warehouses/${editing.id}`, form);
        toast.success("Entrepôt mis à jour.");
      } else {
        await client.post("/warehouses", form);
        toast.success("Entrepôt créé.");
      }
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    }
  }

  async function handleToggle(warehouse) {
    const next = !warehouse.isActive;
    const ok = await confirm({
      title: next ? "Réactiver l'entrepôt" : "Désactiver l'entrepôt",
      message: next
        ? `Réactiver « ${warehouse.name} » ?`
        : `Désactiver « ${warehouse.name} » ? Il ne pourra plus recevoir de mouvements.`,
      confirmLabel: next ? "Réactiver" : "Désactiver",
      danger: !next,
    });
    if (!ok) return;
    try {
      await client.put(`/warehouses/${warehouse.id}`, { isActive: next });
      toast.success(next ? "Entrepôt réactivé." : "Entrepôt désactivé.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Entrepôts"
        description="Sites physiques où le stock est réparti"
        action={
          <Button variant="accent" onClick={openCreate}>
            <IconPlus size={15} /> Nouvel entrepôt
          </Button>
        }
      />

      <DataTable
        loading={loading && !warehouses.length}
        emptyLabel="Aucun entrepôt. Créez votre premier site."
        rows={warehouses}
        columns={[
          {
            key: "code",
            label: "Code",
            render: (r) => (
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-info-light text-info">
                  <IconWarehouse size={16} />
                </span>
                <span className="mono text-xs text-ink-400">{r.code}</span>
              </span>
            ),
          },
          { key: "name", label: "Nom", render: (r) => <span className="font-medium">{r.name}</span> },
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
            key: "status",
            label: "Statut",
            render: (r) =>
              r.isActive ? <Badge tone="success">Actif</Badge> : <Badge tone="neutral">Inactif</Badge>,
          },
          {
            key: "actions",
            label: "",
            align: "right",
            render: (r) => (
              <div className="flex items-center justify-end gap-1">
                <IconButton label="Modifier" onClick={() => openEdit(r)}>
                  <IconPencil size={15} />
                </IconButton>
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => handleToggle(r)}
                  className={r.isActive ? "hover:text-danger" : "hover:text-teal"}
                >
                  {r.isActive ? "Désactiver" : "Réactiver"}
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Modifier l'entrepôt" : "Nouvel entrepôt"}
        size="sm"
      >
        <form onSubmit={handleSubmit}>
          <Field label="Nom" required>
            <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Code" required hint="Unique, ex : WH-04">
            <input required className={inputClass} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </Field>
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
