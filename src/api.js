import { useCallback, useEffect, useRef, useState } from "react";

const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "tripti_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const assetUrl = (path) => (/^(https?:|data:)/.test(path || "") ? path : BASE + (path || ""));

export async function api(path, { method = "GET", body } = {}) {
  const token = getToken();
  let response;
  try {
    response = await fetch(BASE + path, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw Object.assign(new Error("Cannot reach the server. Please check your connection and try again."), { status: 0 });
  }

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      clearToken();
      window.dispatchEvent(new Event("tripti-logout"));
    }
    throw Object.assign(new Error(data.error || "Something went wrong. Please try again."), { status: response.status });
  }
  return data;
}

export function useApi(path, { poll = 0, enabled = true } = {}) {
  const [state, setState] = useState({ data: null, error: "", loading: enabled });
  const alive = useRef(true);

  const load = useCallback(async () => {
    if (!enabled) return;
    try {
      const data = await api(path);
      if (alive.current) setState({ data, error: "", loading: false });
    } catch (error) {
      if (alive.current) setState((s) => ({ ...s, error: error.message, loading: false }));
    }
  }, [path, enabled]);

  useEffect(() => {
    alive.current = true;
    setState((s) => ({ ...s, loading: enabled }));
    load();
    let timer;
    if (poll && enabled) {
      timer = setInterval(() => {
        if (!document.hidden) load();
      }, poll);
    }
    window.addEventListener("tripti-refresh", load);
    return () => {
      alive.current = false;
      clearInterval(timer);
      window.removeEventListener("tripti-refresh", load);
    };
  }, [load, poll, enabled]);

  return { ...state, reload: load };
}

export const refreshData = () => window.dispatchEvent(new Event("tripti-refresh"));

export const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export const formatDay = (iso) => {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
