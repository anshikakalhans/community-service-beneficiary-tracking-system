import { useState } from "react";
import { Plus, Search, Trash2, Users, HandHeart, Clock } from "lucide-react";
import { api, formatDay, refreshData, useApi } from "../api";
import { useAuth } from "../auth";
import { Empty, ErrorNote, Field, Loading, Modal, useToast } from "../ui";

const ASSISTANCE_TYPES = ["Educational Support", "Food Support", "Medical Assistance", "Learning Materials", "Essential Supplies", "Other"];

const CONFIGS = {
  beneficiaries: {
    title: "Beneficiaries",
    subtitle: "People and families supported by the foundation.",
    path: "/api/beneficiaries",
    addLabel: "Add beneficiary",
    icon: Users,
    columns: [
      { key: "name", label: "Name", bold: true },
      { key: "age", label: "Age" },
      { key: "contact", label: "Contact" },
      { key: "address", label: "Address" },
      { key: "support", label: "Support needed" },
    ],
    fields: [
      { name: "name", label: "Full name", required: true },
      { name: "age", label: "Age", type: "number" },
      { name: "contact", label: "Contact number", required: true },
      { name: "address", label: "Address" },
      { name: "support", label: "Support provided or needed" },
    ],
  },
  assistance: {
    title: "Assistance",
    subtitle: "Help that has already been given to beneficiaries.",
    path: "/api/assistance",
    addLabel: "Add assistance",
    icon: HandHeart,
    suggest: true,
    columns: [
      { key: "beneficiary", label: "Beneficiary", bold: true },
      { key: "type", label: "Type" },
      { key: "date", label: "Date", date: true },
      { key: "description", label: "Details" },
    ],
    fields: [
      { name: "beneficiary", label: "Beneficiary name", required: true, suggest: true },
      { name: "type", label: "Assistance type", type: "select", options: ASSISTANCE_TYPES, required: true },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "description", label: "Details", type: "textarea" },
    ],
  },
  pending: {
    title: "Pending support",
    subtitle: "Support that is still needed and waiting to be fulfilled.",
    path: "/api/pending-support",
    addLabel: "Add pending support",
    icon: Clock,
    suggest: true,
    columns: [
      { key: "beneficiary", label: "Beneficiary", bold: true },
      { key: "requiredSupport", label: "Required support" },
      { key: "priority", label: "Priority", priority: true },
      { key: "description", label: "Details" },
    ],
    fields: [
      { name: "beneficiary", label: "Beneficiary name", required: true, suggest: true },
      { name: "requiredSupport", label: "Required support", required: true },
      { name: "priority", label: "Priority", type: "select", options: ["High", "Medium", "Low"] },
      { name: "description", label: "Details", type: "textarea" },
    ],
  },
};

const priorityTone = { High: "red", Medium: "gold", Low: "green" };

function RecordForm({ config, onClose, onSaved }) {
  const toast = useToast();
  const names = useApi("/api/beneficiaries", { enabled: Boolean(config.suggest) });
  const [form, setForm] = useState(() => Object.fromEntries(config.fields.map((f) => [f.name, f.type === "select" && f.required ? f.options[0] : ""])));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api(config.path, { method: "POST", body: form });
      toast(`${config.title.replace(/s$/, "")} saved.`);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={config.addLabel} onClose={onClose}>
      <form className="form" onSubmit={submit}>
        {config.fields.map((f) => (
          <Field key={f.name} label={f.label + (f.required ? " *" : "")}>
            {f.type === "select" ? (
              <select value={form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}>
                {!f.required && <option value="">Not set</option>}
                {f.options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : f.type === "textarea" ? (
              <textarea rows="3" value={form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
            ) : (
              <input
                type={f.type || "text"}
                min={f.type === "number" ? 0 : undefined}
                list={f.suggest ? "beneficiary-names" : undefined}
                value={form[f.name]}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                required={f.required}
              />
            )}
          </Field>
        ))}
        {config.suggest && (
          <datalist id="beneficiary-names">
            {(names.data?.records || []).map((b) => (
              <option key={b.id} value={b.name} />
            ))}
          </datalist>
        )}
        <ErrorNote message={error} />
        <div className="modalActions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" disabled={busy}>
            {busy ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function RecordsPage({ config }) {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useApi(config.path, { poll: 30000 });
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(null);

  const records = data?.records || [];
  const rows = records.filter((r) => config.columns.some((c) => String(r[c.key] ?? "").toLowerCase().includes(q.toLowerCase())));
  const Icon = config.icon;

  const add = () => {
    if (!isAdmin) {
      toast("Only admin can add or change this information", "error");
      return;
    }
    setAdding(true);
  };

  const remove = async () => {
    try {
      await api(`${config.path}/${removing.id}`, { method: "DELETE" });
      toast("Record deleted.");
      refreshData();
    } catch (err) {
      toast(err.message, "error");
    }
    setRemoving(null);
  };

  return (
    <>
      <div className="portalHead">
        <div>
          <h1>{config.title}</h1>
          <p>{config.subtitle}</p>
        </div>
        <button className="btn primary" onClick={add}>
          <Plus size={17} /> {config.addLabel}
        </button>
      </div>
      <ErrorNote message={error} />
      {loading && !data ? (
        <Loading />
      ) : (
        <div className="card tableCard">
          <div className="toolbar">
            <div className="search">
              <Search size={17} />
              <input placeholder={`Search ${config.title.toLowerCase()}`} value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <span className="summaryPill">
              <b>{rows.length}</b> {rows.length === 1 ? "record" : "records"}
            </span>
          </div>
          {rows.length === 0 ? (
            <Empty icon={Icon} title={records.length ? "Nothing matches your search" : `No ${config.title.toLowerCase()} yet`} text={!records.length && isAdmin ? `Use "${config.addLabel}" to add the first one.` : ""} />
          ) : (
            <div className="tableScroll">
              <table>
                <thead>
                  <tr>
                    {config.columns.map((c) => (
                      <th key={c.key}>{c.label}</th>
                    ))}
                    {isAdmin && <th />}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      {config.columns.map((c) => (
                        <td key={c.key}>
                          {c.priority && r[c.key] ? (
                            <span className={`badge ${priorityTone[r[c.key]] || "gray"}`}>{r[c.key]}</span>
                          ) : c.date ? (
                            formatDay(r[c.key])
                          ) : c.bold ? (
                            <b>{r[c.key]}</b>
                          ) : (
                            r[c.key] || "-"
                          )}
                        </td>
                      ))}
                      {isAdmin && (
                        <td className="actionsCell">
                          <button className="iconBtn danger" onClick={() => setRemoving(r)} aria-label="Delete">
                            <Trash2 size={17} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {adding && <RecordForm config={config} onClose={() => setAdding(false)} onSaved={() => { refreshData(); reload(); }} />}
      {removing && (
        <Modal title="Delete this record?" onClose={() => setRemoving(null)}>
          <p>This will permanently remove <b>{removing.name || removing.beneficiary}</b> from the list.</p>
          <div className="modalActions">
            <button className="btn ghost" onClick={() => setRemoving(null)}>
              Cancel
            </button>
            <button className="btn accent" onClick={remove}>
              Delete
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

export const Beneficiaries = () => <RecordsPage config={CONFIGS.beneficiaries} />;
export const Assistance = () => <RecordsPage config={CONFIGS.assistance} />;
export const PendingSupport = () => <RecordsPage config={CONFIGS.pending} />;
