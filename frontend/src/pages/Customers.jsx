import { useEffect, useState } from "react";
import client from "../api/client";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import Button from "../components/Button.jsx";
import Field from "../components/Field.jsx";

const inputClass = "w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink-900";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });

  async function load() {
    const { data } = await client.get("/customers");
    setCustomers(data);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    await client.post("/customers", form);
    setForm({ name: "", email: "", phone: "", address: "" });
    setOpen(false);
    load();
  }

  async function handleDelete(id) {
    if (!confirm("Supprimer ce client ?")) return;
    await client.delete(`/customers/${id}`);
    load();
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Clients"
        description="Destinataires de vos commandes de vente"
        action={<Button variant="accent" onClick={() => setOpen(true)}>Nouveau client</Button>}
      />

      <DataTable
        columns={[
          { key: "name", label: "Nom" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Téléphone" },
          {
            key: "actions", label: "",
            render: (r) => (
              <button onClick={() => handleDelete(r.id)} className="text-xs text-danger hover:underline">
                Supprimer
              </button>
            ),
          },
        ]}
        rows={customers}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau client">
        <form onSubmit={handleSubmit}>
          <Field label="Nom"><input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Email"><input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Téléphone"><input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Adresse"><input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          <Button type="submit" variant="primary" className="w-full">Enregistrer</Button>
        </form>
      </Modal>
    </div>
  );
}
