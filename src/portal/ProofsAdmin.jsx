import { useRef, useState } from "react";
import { ImagePlus, Lock, Trash2, Upload } from "lucide-react";
import { api, assetUrl, formatDay, money, refreshData, todayISO, useApi } from "../api";
import { useAuth } from "../auth";
import { Empty, ErrorNote, Field, Loading, Modal, useToast } from "../ui";

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read this image."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("This image could not be opened."));
      image.onload = () => {
        const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Could not process this image."));
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

const label = (d) => `${money(d.amount)} · ${d.cause} · ${d.donor} · ${formatDay(d.createdAt.slice(0, 10))}${d.hasProof ? " · photo added" : ""}`;

export default function ProofsAdmin() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const donations = useApi("/api/donations/mine", { enabled: isAdmin });
  const proofs = useApi("/api/proofs?limit=100");
  const fileRef = useRef(null);

  const [form, setForm] = useState({ donationId: "", beneficiary: "", deliveredDate: todayISO(), description: "" });
  const [photo, setPhoto] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState(null);

  const list = proofs.data?.proofs || [];
  const options = donations.data?.donations || [];

  const blocked = () => {
    if (isAdmin) return false;
    toast("Only admin can add the proof", "error");
    return true;
  };

  const pick = async (e) => {
    const file = e.target.files?.[0];
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image file.");
    try {
      setPhoto(await compressImage(file));
      setPhotoName(file.name);
    } catch (err) {
      setError(err.message);
    }
  };

  const reset = () => {
    setForm({ donationId: "", beneficiary: "", deliveredDate: todayISO(), description: "" });
    setPhoto("");
    setPhotoName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    if (blocked()) return;
    setError("");
    if (!form.donationId) return setError("Please select the donation this photo belongs to.");
    if (!photo) return setError("Please choose a delivery photo.");
    setBusy(true);
    try {
      const res = await api("/api/proofs", { method: "POST", body: { ...form, image: photo } });
      toast(res.donorNotified ? "Proof added and the donor has been emailed." : "Proof added. The donor email could not be sent.");
      reset();
      refreshData();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    try {
      await api(`/api/proofs/${removing.id}`, { method: "DELETE" });
      toast("Proof deleted.");
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
          <h1>Delivery proof</h1>
          <p>Upload a photo when a donation reaches the people it was meant for. The donor is emailed automatically.</p>
        </div>
      </div>

      {!isAdmin && (
        <div className="note info">
          <Lock size={18} />
          <span>Only admin can add the proof. You can still see everything that has been delivered below.</span>
        </div>
      )}

      {isAdmin && (
        <form className="card form proofForm" onSubmit={submit}>
          <h3>Add delivery proof</h3>
          <Field label="Donation *">
            <select value={form.donationId} onChange={(e) => setForm({ ...form, donationId: e.target.value })} required>
              <option value="">{donations.loading ? "Loading donations..." : "Select a donation"}</option>
              {options.map((d) => (
                <option key={d.id} value={d.id}>
                  {label(d)}
                </option>
              ))}
            </select>
          </Field>
          <div className="twoCols">
            <Field label="Received by (beneficiary or organisation) *">
              <input value={form.beneficiary} onChange={(e) => setForm({ ...form, beneficiary: e.target.value })} required />
            </Field>
            <Field label="Delivery date *">
              <input type="date" max={todayISO()} value={form.deliveredDate} onChange={(e) => setForm({ ...form, deliveredDate: e.target.value })} required />
            </Field>
          </div>
          <Field label="What was delivered (optional)">
            <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="field">
            <span>Delivery photo *</span>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={pick} />
            {photo ? (
              <div className="photoPreview">
                <img src={photo} alt="Selected delivery" />
                <div>
                  <b>{photoName}</b>
                  <button type="button" className="btn ghost sm" onClick={reset}>
                    Remove photo
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className="dropzone" onClick={() => fileRef.current?.click()}>
                <ImagePlus size={28} />
                <b>Choose a photo</b>
                <small>JPG, PNG or WebP. It is resized automatically.</small>
              </button>
            )}
          </div>
          <ErrorNote message={error} />
          <button className="btn primary" disabled={busy}>
            <Upload size={16} /> {busy ? "Uploading..." : "Add proof"}
          </button>
        </form>
      )}

      <div className="card tableCard">
        <div className="cardHead pad">
          <h3>Uploaded proofs ({list.length})</h3>
        </div>
        {proofs.loading && !proofs.data ? (
          <Loading />
        ) : list.length === 0 ? (
          <Empty icon={ImagePlus} title="No proofs uploaded yet" />
        ) : (
          <div className="proofList">
            {list.map((p) => (
              <div className="proofRow" key={p.id}>
                <img src={assetUrl(p.image)} alt="" loading="lazy" />
                <div className="proofRowInfo">
                  <b>
                    {money(p.amount)} · {p.cause}
                  </b>
                  <small>
                    Received by {p.beneficiary} on {formatDay(p.deliveredDate)} · Donor: {p.donor}
                  </small>
                </div>
                {isAdmin && (
                  <button className="iconBtn danger" onClick={() => setRemoving(p)} aria-label="Delete proof">
                    <Trash2 size={17} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <ErrorNote message={proofs.error} />
      {removing && (
        <Modal title="Delete this proof?" onClose={() => setRemoving(null)}>
          <p>The photo for <b>{removing.beneficiary}</b> will be removed from the public gallery.</p>
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
