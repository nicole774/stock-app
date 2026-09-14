import { useEffect, useState } from "react";
import client from "../api/client";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import Button from "../components/Button.jsx";
import Field from "../components/Field.jsx";

const inputClass = "w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink-900";

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", address: "" });

  async function load() {
    const { data } = await client.get("/warehouses");
    setWarehouses(data);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    await client.post("/warehouses", form);
    setForm({ name: "", code: "", address: "" });
    setOpen(false);
    load();
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Entrepôts"
        description="Sites physiques où le stock est réparti"
        action={<Button variant="accent" onClick={() => setOpen(true)}>Nouvel entrepôt</Button>}
      />

      <DataTable
        columns={[
          { key: "code", label: "Code", render: (r) => <span className="mono text-xs">{r.code}</span> },
          { key: "name", label: "Nom" },
          { key: "address", label: "Adresse" },
          {
            key: "status", label: "Statut",
            render: (r) => (
              <span className={`text-xs ${r.isActive ? "text-teal" : "text-ink-500"}`}>
                {r.isActive ? "Actif" : "Inactif"}
              </span>
            ),
          },
        ]}
        rows={warehouses}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Nouvel entrepôt">
        <form onSubmit={handleSubmit}>
          <Field label="Nom"><input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Code (unique)"><input required className={inputClass} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Field>
          <Field label="Adresse"><input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          <Button type="submit" variant="primary" className="w-full">Enregistrer</Button>
        </form>
      </Modal>
    </div>
  );
}
