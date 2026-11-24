import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../auth";
import { ErrorNote, Field } from "../ui";

function PasswordInput({ value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="inputIcon">
      <LockKeyhole size={18} />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
      />
      <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export default function Auth({ signup = false }) {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const target = location.state?.from || "/dashboard";
  if (user) return <Navigate to={target} replace />;

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (signup && form.password !== form.confirm) return setError("Passwords do not match.");
    setBusy(true);
    try {
      const data = await api(signup ? "/api/auth/signup" : "/api/auth/login", {
        method: "POST",
        body: signup ? { name: form.name, email: form.email, password: form.password } : { email: form.email, password: form.password },
      });
      signIn(data);
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="authWrap">
      <div className="authSide">
        <div className="authLogo">
          <img src="/tripti-logo.jpg" alt="Tripti Foundation" />
        </div>
        <h2>Together, we can create a better tomorrow.</h2>
        <p>Log in to follow your donations, see who we have helped and view delivery proof.</p>
        <span>Education • Empowerment • Service</span>
      </div>
      <form className="authCard" onSubmit={submit}>
        <h1>{signup ? "Create your account" : "Welcome back"}</h1>
        <p className="muted">{signup ? "Join as a donor in a few seconds." : "Log in to continue."}</p>

        {signup && (
          <Field label="Full name">
            <div className="inputIcon">
              <UserRound size={18} />
              <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" autoComplete="name" required />
            </div>
          </Field>
        )}
        <Field label="Email">
          <div className="inputIcon">
            <Mail size={18} />
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" autoComplete="email" required />
          </div>
        </Field>
        <Field label="Password" hint={signup ? "At least 6 characters." : ""}>
          <PasswordInput
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="Password"
            autoComplete={signup ? "new-password" : "current-password"}
          />
        </Field>
        {signup && (
          <Field label="Confirm password">
            <PasswordInput value={form.confirm} onChange={(e) => set("confirm", e.target.value)} placeholder="Repeat password" autoComplete="new-password" />
          </Field>
        )}

        <ErrorNote message={error} />
        <button className="btn primary lg block" disabled={busy}>
          {busy ? "Please wait..." : signup ? "Create account" : "Log in"}
        </button>
        <p className="switch">
          {signup ? (
            <>
              Already have an account? <Link to="/login">Log in</Link>
            </>
          ) : (
            <>
              New here? <Link to="/signup">Create an account</Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
