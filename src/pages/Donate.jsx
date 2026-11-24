import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Camera, CheckCircle2, Heart, Mail, ShieldCheck } from "lucide-react";
import { api, money, refreshData, useApi } from "../api";
import { useAuth } from "../auth";
import { CauseIcon, ErrorNote, Field, Loading, useToast } from "../ui";

const PRESETS = [500, 1000, 2500, 5000];

export default function Donate() {
  const { user } = useAuth();
  const toast = useToast();
  const [params] = useSearchParams();
  const { data, loading, error: loadError } = useApi("/api/summary");
  const causes = data?.causes || [];

  const [cause, setCause] = useState("");
  const [form, setForm] = useState({ amount: "", name: user?.name || "", email: user?.email || "", message: "", anonymous: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  useEffect(() => {
    if (!causes.length || cause) return;
    const wanted = causes.find((c) => c.key === params.get("cause"));
    setCause((wanted || causes[0]).name);
  }, [causes, cause, params]);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: f.name || user.name, email: f.email || user.email }));
  }, [user]);

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const amount = Number(form.amount);
    if (!amount || amount < 1) return setError("Please enter a valid donation amount.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError("Please enter a valid email address to receive your thank-you email.");
    setBusy(true);
    try {
      const res = await api("/api/donations", {
        method: "POST",
        body: { cause, amount, email: form.email, name: form.name, message: form.message, anonymous: form.anonymous },
      });
      refreshData();
      setDone({ donation: res.donation, email: res.email });
      toast("Donation recorded. Thank you!");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const again = () => {
    setDone(null);
    setForm((f) => ({ ...f, amount: "", message: "" }));
  };

  if (done) {
    return (
      <div className="page narrow">
        <div className="card thanks">
          <span className="thanksIcon">
            <CheckCircle2 size={42} />
          </span>
          <h1>Thank you{form.anonymous ? "" : form.name ? `, ${form.name.split(" ")[0]}` : ""}!</h1>
          <p>
            Your donation of <b>{money(done.donation.amount)}</b> to <b>{done.donation.cause}</b> has been recorded.
          </p>
          <div className={`note ${done.email.sent ? "ok" : "warn"}`}>
            <Mail size={18} />
            <span>
              {done.email.sent
                ? `A thank-you email is on its way to ${done.email.to}.`
                : `We could not send the thank-you email to ${done.email.to} right now, but your donation is safely recorded.`}
            </span>
          </div>
          <p className="muted">When your donation is delivered, we will add a photo to the Delivery Proof page.</p>
          <div className="actions center">
            <button className="btn accent" onClick={again}>
              <Heart size={16} /> Donate again
            </button>
            <Link className="btn outline" to="/live">
              See live activity
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="pageHead">
        <span className="eyebrow">Donate</span>
        <h1>Make a donation</h1>
        <p>No account needed. It takes less than a minute.</p>
      </div>
      <ErrorNote message={loadError} />
      <div className="donateGrid">
        <form className="card form" onSubmit={submit}>
          <h3>1. Choose a cause</h3>
          {loading && !data ? (
            <Loading />
          ) : (
            <div className="causePicker">
              {causes.map((c) => (
                <button type="button" key={c.key} className={cause === c.name ? "picked" : ""} onClick={() => setCause(c.name)}>
                  <CauseIcon name={c.icon} size={20} />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          )}

          <h3>2. Choose an amount</h3>
          <div className="presets">
            {PRESETS.map((p) => (
              <button type="button" key={p} className={Number(form.amount) === p ? "picked" : ""} onClick={() => set("amount", String(p))}>
                {money(p)}
              </button>
            ))}
          </div>
          <Field label="Or enter your own amount (₹)">
            <input type="number" min="1" inputMode="numeric" value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="Enter amount" />
          </Field>

          <h3>3. Your details</h3>
          <div className="twoCols">
            <Field label="Your name">
              <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Full name" maxLength={80} />
            </Field>
            <Field label="Email for your thank-you">
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
            </Field>
          </div>
          <label className="check">
            <input type="checkbox" checked={form.anonymous} onChange={(e) => set("anonymous", e.target.checked)} />
            <div>
              <b>Donate anonymously</b>
              <small>Your name will not be shown on the public pages.</small>
            </div>
          </label>
          <Field label="Message (optional)">
            <textarea rows="3" value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Write a few kind words..." maxLength={1000} />
          </Field>

          <ErrorNote message={error} />
          <button className="btn accent lg block" disabled={busy || !cause}>
            {busy ? "Saving your donation..." : <>Donate {form.amount ? money(form.amount) : "now"} <ArrowRight size={18} /></>}
          </button>
        </form>

        <aside className="card sideInfo">
          <h3>Every rupee is tracked</h3>
          <div className="infoPoint">
            <ShieldCheck size={22} />
            <div>
              <b>Public and transparent</b>
              <p>Your donation appears in the live feed (never your name, if you choose anonymous).</p>
            </div>
          </div>
          <div className="infoPoint">
            <Camera size={22} />
            <div>
              <b>Photo proof</b>
              <p>When your donation is delivered we upload a photo and email you.</p>
            </div>
          </div>
          <div className="infoPoint">
            <Mail size={22} />
            <div>
              <b>Instant thank-you</b>
              <p>You receive a thank-you email right after donating.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
