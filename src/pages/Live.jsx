import { useApi, money } from "../api";
import { ErrorNote, Loading, ProgressBar, CauseIcon } from "../ui";
import { LiveFeed } from "./shared";

export default function Live() {
  const summary = useApi("/api/summary", { poll: 10000 });
  const feed = useApi("/api/donations?limit=30", { poll: 8000 });
  const totals = summary.data?.totals;

  return (
    <div className="page">
      <div className="pageHead">
        <span className="eyebrow">Live activity</span>
        <h1>Every donation, as it happens</h1>
        <p>This page refreshes automatically. Anonymous donors are never shown by name.</p>
      </div>
      <ErrorNote message={summary.error || feed.error} />
      <div className="liveTop">
        <div className="bigTotal">
          <small>Total raised</small>
          <b>{money(totals?.raised)}</b>
          <span>
            from {totals?.donations ?? 0} donations by {totals?.donors ?? 0} donors
          </span>
        </div>
        <div className="card causeBars">
          <h3>Progress by cause</h3>
          {summary.loading && !summary.data ? (
            <Loading />
          ) : (
            (summary.data?.causes || []).map((c) => (
              <div className="barRow" key={c.key}>
                <div className="barLabel">
                  <span>
                    <CauseIcon name={c.icon} size={16} /> {c.name}
                  </span>
                  <b>{money(c.raised)}</b>
                </div>
                <ProgressBar value={c.raised} goal={c.goal} />
              </div>
            ))
          )}
        </div>
      </div>
      <LiveFeed donations={feed.data?.donations} loading={feed.loading && !feed.data} limit={30} />
    </div>
  );
}
