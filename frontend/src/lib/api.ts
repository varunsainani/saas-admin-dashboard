// Client for the Vantage API. Stores the access token in localStorage and
// attaches it as a Bearer token. A demo flag lets the public demo open the
// dashboard without a running backend.

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const TOKEN_KEY = "vantage_token";
const REFRESH_KEY = "vantage_refresh";
const DEMO_KEY = "vantage_demo";
const VERIFY_KEY = "vantage_verify";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setSession(accessToken: string, refreshToken?: string) {
  window.localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) window.localStorage.setItem(REFRESH_KEY, refreshToken);
  window.localStorage.removeItem(DEMO_KEY);
}

export function setDemo() {
  window.localStorage.setItem(DEMO_KEY, "1");
}

export function clearAuth() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(DEMO_KEY);
  window.localStorage.removeItem(VERIFY_KEY);
}

export function getVerifyPending() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(VERIFY_KEY);
}

export function clearVerifyPending() {
  if (typeof window !== "undefined") window.localStorage.removeItem(VERIFY_KEY);
}

export function isAuthed() {
  if (typeof window === "undefined") return false;
  return (
    !!window.localStorage.getItem(TOKEN_KEY) ||
    window.localStorage.getItem(DEMO_KEY) === "1"
  );
}

async function api<T = unknown>(
  path: string,
  opts: { method?: string; body?: unknown } = {},
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed (${res.status})`);
  }
  return data as T;
}

interface SessionResponse {
  user: { id: string; name: string; email: string; role: string };
  accessToken: string;
  refreshToken: string;
  verifyToken?: string;
}

export async function login(email: string, password: string) {
  const data = await api<SessionResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
  setSession(data.accessToken, data.refreshToken);
  return data;
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}) {
  const data = await api<SessionResponse>("/api/auth/register", {
    method: "POST",
    body: payload,
  });
  setSession(data.accessToken, data.refreshToken);
  if (data.verifyToken && typeof window !== "undefined") {
    window.localStorage.setItem(VERIFY_KEY, data.verifyToken);
  }
  return data;
}

export async function verifyEmail(token: string) {
  return api<{ ok: boolean }>("/api/auth/verify-email", {
    method: "POST",
    body: { token },
  });
}

export async function resendVerification() {
  const data = await api<{ ok: boolean; sent?: boolean; token?: string }>(
    "/api/auth/resend-verification",
    { method: "POST" },
  );
  if (data.token && typeof window !== "undefined") {
    window.localStorage.setItem(VERIFY_KEY, data.token);
  }
  return data;
}
