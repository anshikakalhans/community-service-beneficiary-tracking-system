import { Link } from "react-router-dom";
import { ArrowRight, Camera, Heart } from "lucide-react";
import { assetUrl, formatDay, money } from "../api";
import { Avatar, CauseIcon, Empty, ProgressBar, causeIconFor, timeAgo } from "../ui";

export function CauseCard({ cause, large = false }) {
  const pct = cause.goal ? Math.min(100, Math.round((cause.raised / cause.goal) * 100)) : 0;
  return (
    <article className={`causeCard ${large ? "large" : ""}`}>
      <span className={`causeIcon ${cause.key}`}>
        <CauseIcon name={cause.icon} size={24} />
      </span>
      <h3>{cause.name}</h3>
      <em>{cause.tagline}</em>
      <p>{cause.description}</p>
      <ProgressBar value={cause.raised} goal={cause.goal} />
      <div className="causeMeta">
        <span>
          <b>{money(cause.raised)}</b> raised
        </span>
        <span>{pct}% of {money(cause.goal)}</span>
      </div>
      {large && (
        <small className="causeDonors">
          {cause.donations} {cause.donations === 1 ? "donation" : "donations"} so far
        </small>
      )}
      <Link className="btn outline block" to={`/donate?cause=${cause.key}`}>
        Support this cause <ArrowRight size={16} />
      </Link>
    </article>
  );
}

export function LiveFeed({ donations, limit = 6, loading }) {
  const rows = (donations || []).slice(0, limit);
  return (
    <div className="card feed">
      <div className="cardHead">
        <div>
          <h3>Live donations</h3>
          <p>Every contribution appears here as it happens.</p>
        </div>
        <span className="liveBadge">
          <i /> LIVE
        </span>
      </div>
      {loading ? (
        <div className="feedRows">
          {[1, 2, 3].map((n) => (
            <div className="skeletonRow" key={n} />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Empty icon={Heart} title="No donations yet" text="Be the first to make a difference today.">
          <Link to="/donate" className="btn accent sm">
            Donate now
          </Link>
        </Empty>
      ) : (
        <div className="feedRows">
          {rows.map((d) => (
            <div className="feedRow" key={d.id}>
              <Avatar name={d.donor} anonymous={d.anonymous} />
              <div className="feedInfo">
                <b>{d.donor}</b>
                <small>donated to {d.cause}</small>
              </div>
              <div className="feedAmount">
                <b>{money(d.amount)}</b>
                <small>{timeAgo(d.createdAt)}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProofCard({ proof, onOpen }) {
  return (
    <article className="proofCard">
      <button className="proofImage" onClick={() => onOpen?.(proof)} aria-label="View photo">
        <img src={assetUrl(proof.image)} alt={`Delivery to ${proof.beneficiary}`} loading="lazy" />
        <span className="tag">
          <CauseIcon name={causeIconFor(proof.cause)} size={14} /> {proof.cause}
        </span>
      </button>
      <div className="proofBody">
        <b>{money(proof.amount)} delivered</b>
        <p>
          Received by <strong>{proof.beneficiary}</strong>
        </p>
        {proof.description && <p className="muted">{proof.description}</p>}
        <div className="proofMeta">
          <span>Donor: {proof.donor}</span>
          <span>{formatDay(proof.deliveredDate)}</span>
        </div>
      </div>
    </article>
  );
}

export function ProofEmpty() {
  return (
    <Empty
      icon={Camera}
      title="No delivery photos yet"
      text="As soon as donations reach the people in need, the photos will appear here."
    />
  );
}
