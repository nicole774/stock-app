import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import Button, { IconButton } from "../components/Button.jsx";
import Field, { inputClass } from "../components/Field.jsx";
import Badge from "../components/Badge.jsx";
import { useToast } from "../components/Toast.jsx";
import { useConfirm } from "../components/ConfirmDialog.jsx";
import { initials, roleLabel, formatDate } from "../utils/format.js";
import { IconPlus, IconPencil, IconMail, IconBan, IconCheckCircle } from "../components/icons.jsx";

const ROLES = ["ADMIN", "MANAGER", "EMPLOYEE"];
const ROLE_TONE = { ADMIN: "accent", MANAGER: "info", EMPLOYEE: "neutral" };

const emptyForm = { name: "", email: "", password: "", role: "EMPLOYEE" };

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const toast = useToast();
  const confirm = useConfirm();

  async function load() {
    setLoading(true);
    try {
      const { data } = await client.get("/users");
      setUsers(data);
    } catch {
      toast.error("Impossible de charger les utilisateurs.");
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

  function openEdit(u) {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role });
    setOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editing) {
        const payload = { name: form.name, role: form.role };
        if (form.password) payload.password = form.password;
        await client.put(`/users/${editing.id}`, payload);
        toast.success("Compte mis à jour.");
      } else {
        await client.post("/users", form);
        toast.success("Compte créé.");
      }
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    }
  }

  async function handleToggleActive(u) {
    const ok = await confirm({
      title: u.isActive ? "Désactiver le compte" : "Réactiver le compte",
      message: u.isActive
        ? `« ${u.name} » ne pourra plus se connecter. Continuer ?`
        : `« ${u.name} » pourra de nouveau se connecter. Continuer ?`,
      confirmLabel: u.isActive ? "Désactiver" : "Réactiver",
      danger: u.isActive,
    });
    if (!ok) return;
    try {
      await client.put(`/users/${u.id}`, { isActive: !u.isActive });
      toast.success(u.isActive ? "Compte désactivé." : "Compte réactivé.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action impossible.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Utilisateurs"
        description="Comptes ayant accès à l'application"
        action={
          <Button variant="accent" onClick={openCreate}>
            <IconPlus size={15} /> Nouveau compte
          </Button>
        }
      />

      <DataTable
        loading={loading && !users.length}
        emptyLabel="Aucun utilisateur."
        rows={users}
        columns={[
          {
            key: "name",
            label: "Utilisateur",
            render: (r) => (
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[11px] font-semibold text-white">
                  {initials(r.name)}
                </span>
                <span>
                  <span className="block font-medium">
                    {r.name} {r.id === me?.id && <span className="text-ink-300">(vous)</span>}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-ink-400">
                    <IconMail size={12} /> {r.email}
                  </span>
                </span>
              </span>
            ),
          },
          {
            key: "role",
            label: "Rôle",
            render: (r) => <Badge tone={ROLE_TONE[r.role]}>{roleLabel(r.role)}</Badge>,
          },
          {
            key: "isActive",
            label: "Statut",
            render: (r) => (
              <Badge tone={r.isActive ? "success" : "neutral"}>{r.isActive ? "Actif" : "Désactivé"}</Badge>
            ),
          },
          {
            key: "createdAt",
            label: "Créé le",
            render: (r) => <span className="text-xs text-ink-400">{formatDate(r.createdAt)}</span>,
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
                {r.id !== me?.id && (
                  <IconButton
                    label={r.isActive ? "Désactiver" : "Réactiver"}
                    onClick={() => handleToggleActive(r)}
                    className={r.isActive ? "hover:text-danger" : "hover:text-teal"}
                  >
                    {r.isActive ? <IconBan size={15} /> : <IconCheckCircle size={15} />}
                  </IconButton>
                )}
              </div>
            ),
          },
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Modifier le compte" : "Nouveau compte"}>
        <form onSubmit={handleSubmit}>
          <Field label="Nom complet" required>
            <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Email" required>
            <input
              type="email"
              required
              disabled={!!editing}
              className={inputClass}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Field label="Rôle" required>
              <select
                required
                disabled={editing?.id === me?.id}
                className={inputClass}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {roleLabel(r)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={editing ? "Nouveau mot de passe" : "Mot de passe"} hint={editing ? "Laisser vide pour ne pas changer" : undefined} required={!editing}>
              <input
                type="password"
                required={!editing}
                minLength={6}
                className={inputClass}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" variant="primary">Enregistrer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
