import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, CircleAlert, HeartPulse, PawPrint, TreePine, X } from "lucide-react";

export function Logo({ className = "" }) {
  return (
    <Link to="/" className={`logo ${className}`} aria-label="Tripti Foundation home">
      <img src="/tripti-logo.jpg" alt="Tripti Foundation" />
    </Link>
  );
}

export const causeIcons = { book: BookOpen, heart: HeartPulse, tree: TreePine, paw: PawPrint };

export function CauseIcon({ name, size = 22 }) {
  const Icon = causeIcons[name] || BookOpen;
  return <Icon size={size} />;
}

export const causeIconFor = (cause) =>
  ({ "Education for All": "book", "Healthcare Support": "heart", "Tree Plantation": "tree", "Animal Welfare": "paw" })[cause] || "book";

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const nextId = useRef(1);

  const toast = useCallback((message, type = "success") => {
    const id = nextId.current++;
    setItems((list) => [...list, { id, message, type }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 4500);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toasts" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === "error" ? <CircleAlert size={18} /> : <CheckCircle2 size={18} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

export function Modal({ title, children, onClose, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? "wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modalHead">
          <h3>{title}</h3>
          <button className="iconBtn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="modalBody">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function Empty({ icon: Icon, title, text, children }) {
  return (
    <div className="empty">
      {Icon && <Icon size={34} />}
      <b>{title}</b>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}

export function Loading({ label = "Loading..." }) {
  return (
    <div className="loading">
      <i />
      <span>{label}</span>
    </div>
  );
}

export function ErrorNote({ message }) {
  if (!message) return null;
  return (
    <div className="note error">
      <CircleAlert size={18} />
      <span>{message}</span>
    </div>
  );
}

export function ProgressBar({ value, goal }) {
  const pct = goal ? Math.min(100, Math.round((value / goal) * 100)) : 0;
  return (
    <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <i style={{ width: `${pct}%` }} />
    </div>
  );
}

export const initials = (name) => (name || "?").trim().charAt(0).toUpperCase();

export function Avatar({ name, anonymous }) {
  return <span className="avatar">{anonymous ? "♡" : initials(name)}</span>;
}

export const timeAgo = (iso) => {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
