import { Link } from "react-router-dom";
import { Clock, HandCoins, HandHeart, Users } from "lucide-react";
import { formatDay, money, useApi } from "../api";
import { useAuth } from "../auth";
import { Avatar, Empty, ErrorNote, Loading } from "../ui";

const COLORS = ["#2f3a8f", "#e23a2f", "#f2a93b", "#2b8fc7", "#27a07a", "#8a8fae"];

function Donut({ rows, total }) {
  let acc = 0;
  const stops = rows
    .filter((r) => r.value > 0)
    .map((r) => {
      const start = (acc / total) * 100;
      acc += r.value;
      return `${r.color} ${start}% ${(acc / total) * 100}%`;
    });
  const background = total ? `conic-gradient(${stops.join(", ")})` : "#eceefa";
  return (
    <div className="donut" style={{ background }}>
      <div>
        <b>{total}</b>
        <small>records</small>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const { data, loading, error } = useApi("/api/dashboard", { poll: 20000 });

  if (loading && !data) return <Loading />;
  const d = data;

  const rows = Object.entries(d?.byType || {}).map(([label, value], i) => ({ label, value, color: COLORS[i % COLORS.length] }));
  const max = Math.max(1, ...rows.map((r) => r.value));
  const total = rows.reduce((a, r) => a + r.value, 0);

  const stats = [
    ["Beneficiaries", d?.beneficiaries ?? 0, "People registered", Users, "indigo"],
    ["Assistance given", d?.assistance ?? 0, "Support records", HandHeart, "red"],
    ["Pending support", d?.pending ?? 0, "Waiting to be fulfilled", Clock, "gold"],
    ["Total donations", money(d?.raised), `${d?.donations ?? 0} donations received`, HandCoins, "sky"],
  ];

  return (
    <>
      <div className="portalHead">
        <div>
          <h1>Hello, {user.name.split(" ")[0]}</h1>
          <p>Here is how the foundation is doing today.</p>
        </div>
      </div>
      <ErrorNote message={error} />
      {!isAdmin && (
        <div className="note info">
          <span>
            You are logged in as a donor, so you can view records (contact details and addresses are hidden for privacy).
            Only NGO admins can add or change information.
          </span>
        </div>
      )}

      <div className="statGrid">
        {stats.map(([label, value, hint, Icon, tone]) => (
          <div className="card stat" key={label}>
            <span className={`statIcon ${tone}`}>
              <Icon size={22} />
            </span>
            <small>{label}</small>
            <b>{value}</b>
            <em>{hint}</em>
          </div>
        ))}
      </div>

      <div className="twoGrid">
        <div className="card">
          <div className="cardHead">
            <h3>Assistance overview</h3>
          </div>
          <div className="bars">
            {rows.map((r) => (
              <div key={r.label} className="bar">
                <span className="barValue">{r.value}</span>
                <i style={{ height: `${8 + (r.value / max) * 130}px`, background: r.color }} />
                <small>{r.label.replace(" Support", "").replace(" Assistance", "").replace(" Materials", "").replace(" Supplies", "")}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="cardHead">
            <h3>Assistance by type</h3>
          </div>
          <div className="donutWrap">
            <Donut rows={rows} total={total} />
            <ul className="legend">
              {rows.map((r) => (
                <li key={r.label}>
                  <i style={{ background: r.color }} />
                  <span>{r.label}</span>
                  <b>{r.value}</b>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="twoGrid">
        <div className="card">
          <div className="cardHead">
            <h3>Recent assistance</h3>
            <Link to="/assistance" className="textLink">
              View all
            </Link>
          </div>
          {d?.recentAssistance.length ? (
            <div className="feedRows">
              {d.recentAssistance.map((r) => (
                <div className="feedRow" key={r.id}>
                  <Avatar name={r.beneficiary} />
                  <div className="feedInfo">
                    <b>{r.beneficiary}</b>
                    <small>{r.type}</small>
                  </div>
                  <div className="feedAmount">
                    <small>{formatDay(r.date)}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty icon={HandHeart} title="No assistance records yet" />
          )}
        </div>
        <div className="card">
          <div className="cardHead">
            <h3>Recent beneficiaries</h3>
            <Link to="/beneficiaries" className="textLink">
              View all
            </Link>
          </div>
          {d?.recentBeneficiaries.length ? (
            <div className="feedRows">
              {d.recentBeneficiaries.map((r) => (
                <div className="feedRow" key={r.id}>
                  <Avatar name={r.name} />
                  <div className="feedInfo">
                    <b>{r.name}</b>
                    <small>{r.support || "Support not specified"}</small>
                  </div>
                  <div className="feedAmount">
                    <small>{r.contact}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty icon={Users} title="No beneficiaries yet" />
          )}
        </div>
      </div>
    </>
  );
}
