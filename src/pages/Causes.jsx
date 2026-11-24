import { useApi } from "../api";
import { ErrorNote, Loading } from "../ui";
import { CauseCard } from "./shared";

export default function Causes() {
  const { data, loading, error } = useApi("/api/summary", { poll: 30000 });
  return (
    <div className="page">
      <div className="pageHead">
        <span className="eyebrow">Make a difference</span>
        <h1>Causes that need your support</h1>
        <p>Choose a cause close to your heart. The progress bars show the real amount raised so far.</p>
      </div>
      <ErrorNote message={error} />
      {loading && !data ? (
        <Loading />
      ) : (
        <div className="causeGrid two">
          {(data?.causes || []).map((c) => (
            <CauseCard key={c.key} cause={c} large />
          ))}
        </div>
      )}
    </div>
  );
}
