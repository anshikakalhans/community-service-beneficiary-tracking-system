import { useState } from "react";
import { LogOut, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { ErrorNote, Field, useToast } from "../ui";

export default function Profile() {
  const { user, setUser, signOut, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [details, setDetails] = useState({ name: user.name, email: user.email });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [detailsError, setDetailsError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [busy, setBusy] = useState("");

  const saveDetails = async (e) => {
    e.preventDefault();
    setDetailsError("");
    setBusy("details");
    try {
      const data = await api("/api/auth/me", { method: "PUT", body: details });
      setUser(data.user);
      toast("Profile updated.");
    } catch (err) {
      setDetailsError(err.message);
    } finally {
      setBusy("");
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setBusy("password");
    try {
      await api("/api/auth/password", { method: "PUT", body: passwords });
      setPasswords({ currentPassword: "", newPassword: "" });
      toast("Password changed.");
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setBusy("");
    }
  };

  return (
    <>
      <div className="portalHead">
        <div>
          <h1>Profile</h1>
          <p>Manage your account details.</p>
        </div>
      </div>

      <div className="profileGrid">
        <div className="card profileCard">
          <span className="avatar big">{user.name.charAt(0).toUpperCase()}</span>
          <h3>{user.name}</h3>
          <p className="muted">{user.email}</p>
          <span className={`badge ${isAdmin ? "indigo" : "gray"}`}>
            {isAdmin && <ShieldCheck size={14} />} {isAdmin ? "NGO Admin" : "Donor"}
          </span>
          <button
            className="btn outline block"
            onClick={() => {
              signOut();
              navigate("/");
            }}
          >
            <LogOut size={16} /> Log out
          </button>
        </div>

        <div className="stack">
          <form className="card form" onSubmit={saveDetails}>
            <h3>Account details</h3>
            <div className="twoCols">
              <Field label="Name">
                <input value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} required />
              </Field>
              <Field label="Email">
                <input type="email" value={details.email} onChange={(e) => setDetails({ ...details, email: e.target.value })} required />
              </Field>
            </div>
            <ErrorNote message={detailsError} />
            <button className="btn primary" disabled={busy === "details"}>
              {busy === "details" ? "Saving..." : "Save changes"}
            </button>
          </form>

          <form className="card form" onSubmit={savePassword}>
            <h3>Change password</h3>
            <div className="twoCols">
              <Field label="Current password">
                <input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} autoComplete="current-password" required />
              </Field>
              <Field label="New password" hint="At least 6 characters.">
                <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} autoComplete="new-password" required />
              </Field>
            </div>
            <ErrorNote message={passwordError} />
            <button className="btn primary" disabled={busy === "password"}>
              {busy === "password" ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
