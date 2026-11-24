import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { assetUrl, formatDay, money, useApi } from "../api";
import { useAuth } from "../auth";
import { ErrorNote, Loading, Modal, useToast } from "../ui";
import { ProofCard, ProofEmpty } from "./shared";

export default function ProofGallery() {
  const { data, loading, error } = useApi("/api/proofs?limit=100", { poll: 30000 });
  const { isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);
  const proofs = data?.proofs || [];

  const addProof = () => {
    if (!isAdmin) {
      toast("Only admin can add the proof", "error");
      return;
    }
    navigate("/delivery-proof/manage");
  };

  return (
    <div className="page">
      <div className="pageHead row">
        <div>
          <span className="eyebrow">Transparency</span>
          <h1>Delivery proof</h1>
          <p>Photos from the field showing donations reaching the people who need them.</p>
        </div>
        <button className="btn primary" onClick={addProof}>
          <Plus size={17} /> Add delivery proof
        </button>
      </div>
      <ErrorNote message={error} />
      {loading && !data ? (
        <Loading />
      ) : proofs.length === 0 ? (
        <ProofEmpty />
      ) : (
        <div className="proofGrid">
          {proofs.map((p) => (
            <ProofCard key={p.id} proof={p} onOpen={setOpen} />
          ))}
        </div>
      )}
      <p className="pageNote">
        Made a donation? <Link to="/donate">Donate again</Link> and watch for the email when your photo is added.
      </p>
      {open && (
        <Modal title={`${money(open.amount)} · ${open.cause}`} onClose={() => setOpen(null)} wide>
          <img className="lightbox" src={assetUrl(open.image)} alt={`Delivery to ${open.beneficiary}`} />
          <p>
            Received by <b>{open.beneficiary}</b> on {formatDay(open.deliveredDate)}. Donor: {open.donor}.
          </p>
          {open.description && <p className="muted">{open.description}</p>}
        </Modal>
      )}
    </div>
  );
}
