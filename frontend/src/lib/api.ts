// Client for the Vantage API. Stores the access token in localStorage and
// attaches it as a Bearer token. A demo flag lets the public demo open the
// dashboard without a running backend.

// Same-origin by default: requests go to "/api/..." and are proxied to the
// backend by a Next.js rewrite, so the app lives behind a single URL. Set
// NEXT_PUBLIC_API_URL only to bypass the proxy and call the backend directly.
const BASE = process.env.NEXT_PUBLIC_API_URL || "";
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

// Read the locale chosen via the language toggle. When unset (first visit), we
// omit the header so the backend falls back to the browser's Accept-Language,
// matching the UI's own auto-detection.
function getLocaleCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function api<T = unknown>(
  path: string,
  opts: { method?: string; body?: unknown } = {},
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const locale = getLocaleCookie();
  if (locale) headers["X-Locale"] = locale;

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

// ---------------------------------------------------------------------------
// Live workspace data. A real session (access token) means we fetch from the
// backend; the public demo without a token falls back to sample data in the UI.
// ---------------------------------------------------------------------------

export type ApiRole = "ADMIN" | "MANAGER" | "USER";
export type ApiStatus = "ACTIVE" | "INVITED" | "SUSPENDED";

export interface ApiUser {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: ApiRole;
  status: ApiStatus;
  emailVerified: boolean;
  title: string | null;
  avatarColor: string | null;
  lastActiveAt: string | null;
  createdAt: string;
}

export interface SeriesPoint {
  monthIndex: number;
  newMembers: number;
  totalMembers: number;
}

export interface OverviewResponse {
  members: { total: number; active: number; invited: number; suspended: number };
  roles: { ADMIN: number; MANAGER: number; USER: number };
  subscription: {
    plan: string;
    status: string;
    seatsUsed: number;
    seats: number;
    currentPeriodEnd: string;
  } | null;
  series: SeriesPoint[];
}

export interface ApiAuditEvent {
  id: string;
  action: string;
  target: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: { id: string; name: string; avatarColor: string | null } | null;
}

export interface ApiSubscription {
  id: string;
  planId: string;
  plan: {
    id: string;
    name: string;
    priceMonthly: number;
    seats: number;
    features: string[];
    popular: boolean;
  };
  status: string;
  seatsUsed: number;
  currentPeriodEnd: string;
}

// True when a real backend session exists (vs. the client-only demo flag).
export function hasSession() {
  return !!getToken();
}

export async function getMe() {
  const data = await api<{ user: ApiUser }>("/api/auth/me");
  return data.user;
}

export async function getUsers() {
  const data = await api<{ users: ApiUser[] }>("/api/users");
  return data.users;
}

export async function inviteUser(payload: {
  name: string;
  email: string;
  role: ApiRole;
  title?: string;
}) {
  const data = await api<{ user: ApiUser }>("/api/users", { method: "POST", body: payload });
  return data.user;
}

export async function updateUser(
  id: string,
  patch: { role?: ApiRole; status?: ApiStatus; title?: string },
) {
  const data = await api<{ user: ApiUser }>(`/api/users/${id}`, { method: "PATCH", body: patch });
  return data.user;
}

export async function deleteUser(id: string) {
  return api<{ ok: boolean }>(`/api/users/${id}`, { method: "DELETE" });
}

export async function getOverview() {
  return api<OverviewResponse>("/api/analytics/overview");
}

export async function getAudit(limit = 50) {
  const data = await api<{ events: ApiAuditEvent[] }>(`/api/audit?limit=${limit}`);
  return data.events;
}

export async function getSubscription() {
  const data = await api<{ subscription: ApiSubscription | null }>("/api/subscription");
  return data.subscription;
}
