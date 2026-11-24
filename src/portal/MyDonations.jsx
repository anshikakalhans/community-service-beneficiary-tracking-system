import { useState } from "react";
import { Link } from "react-router-dom";
import { Receipt, Search } from "lucide-react";
import { formatDay, money, useApi } from "../api";
import { useAuth } from "../auth";
import { Empty, ErrorNote, Loading } from "../ui";

const emailLabel = { sent: "Email sent", failed: "Email failed", pending: "Pending" };

export default function MyDonations() {
  const { isAdmin } = useAuth();
  const { data, loading, error } = useApi("/api/donations/mine", { poll: 20000 });
  const [q, setQ] = useState("");

  const all = data?.donations || [];
  const rows = all.filter((d) => `${d.donor} ${d.cause} ${d.email}`.toLowerCase().includes(q.toLowerCase()));
  const total = rows.reduce((a, d) => a + d.amount, 0);

  return (
    <>
      <div className="portalHead">
        <div>
          <h1>{isAdmin ? "All donations" : "My donations"}</h1>
          <p>{isAdmin ? "Every donation received, with the donor's real details (visible to admins only)." : "Donations made with your account or email."}</p>
        </div>
      </div>
      <ErrorNote message={error} />
      {loading && !data ? (
        <Loading />
      ) : (
        <div className="card tableCard">
          <div className="toolbar">
            <div className="search">
              <Search size={17} />
              <input placeholder="Search by name, cause or email" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <span className="summaryPill">
              {rows.length} donations · <b>{money(total)}</b>
            </span>
          </div>
          {rows.length === 0 ? (
            <Empty icon={Receipt} title="No donations found" text={all.length ? "Try a different search." : "Your donations will be listed here."}>
              {!all.length && (
                <Link className="btn accent sm" to="/donate">
                  Make a donation
                </Link>
              )}
            </Empty>
          ) : (
            <div className="tableScroll">
              <table>
                <thead>
                  <tr>
                    {isAdmin && <th>Donor</th>}
                    <th>Cause</th>
                    <th>Amount</th>
                    <th>Date</th>
                    {isAdmin && <th>Thank-you email</th>}
                    <th>Delivery proof</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((d) => (
                    <tr key={d.id}>
                      {isAdmin && (
                        <td>
                          <b>{d.donor}</b>
                          {d.anonymous && <span className="badge gray">Anonymous</span>}
                          <small className="sub">{d.email}</small>
                        </td>
                      )}
                      <td>{d.cause}</td>
                      <td>
                        <b>{money(d.amount)}</b>
                      </td>
                      <td>{formatDay(d.createdAt.slice(0, 10))}</td>
                      {isAdmin && (
                        <td>
                          <span className={`badge ${d.emailStatus === "sent" ? "green" : d.emailStatus === "failed" ? "red" : "gray"}`}>
                            {emailLabel[d.emailStatus] || d.emailStatus}
                          </span>
                        </td>
                      )}
                      <td>
                        {d.hasProof ? (
                          <Link className="badge green" to="/delivery-proof">
                            Delivered
                          </Link>
                        ) : (
                          <span className="badge gray">Awaiting photo</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}
