// Demo data for the Vantage admin console. Timestamps are derived from a fixed
// reference so server and client render identically (no hydration mismatch).

export type Role = "ADMIN" | "MANAGER" | "USER";
export type UserStatus = "ACTIVE" | "INVITED" | "SUSPENDED";

export const NOW = new Date("2026-06-20T16:30:00Z").getTime();
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const iso = (msAgo: number) => new Date(NOW - msAgo).toISOString();

export const organization = {
  name: "Northwind",
  plan: "Pro",
};

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  title: string;
  avatarColor: string;
  lastActive: string;
  createdAt: string;
}

export const teamMembers: TeamMember[] = [
  { id: "u_01", name: "Alex Morgan", email: "alex@northwind.io", role: "ADMIN", status: "ACTIVE", title: "Founder & CEO", avatarColor: "#6366f1", lastActive: iso(4 * MIN), createdAt: "2025-01-08" },
  { id: "u_02", name: "Maya Chen", email: "maya@northwind.io", role: "MANAGER", status: "ACTIVE", title: "Head of Product", avatarColor: "#10b981", lastActive: iso(38 * MIN), createdAt: "2025-01-22" },
  { id: "u_03", name: "Daniel Okafor", email: "daniel@northwind.io", role: "MANAGER", status: "ACTIVE", title: "Engineering Lead", avatarColor: "#f43f5e", lastActive: iso(2 * HOUR), createdAt: "2025-02-14" },
  { id: "u_04", name: "Priya Nair", email: "priya@northwind.io", role: "USER", status: "ACTIVE", title: "Senior Designer", avatarColor: "#f59e0b", lastActive: iso(5 * HOUR), createdAt: "2025-03-03" },
  { id: "u_05", name: "Lucas Almeida", email: "lucas@northwind.io", role: "USER", status: "ACTIVE", title: "Backend Engineer", avatarColor: "#0ea5e9", lastActive: iso(1 * DAY), createdAt: "2025-03-19" },
  { id: "u_06", name: "Sofia Rossi", email: "sofia@northwind.io", role: "MANAGER", status: "ACTIVE", title: "Customer Success", avatarColor: "#8b5cf6", lastActive: iso(3 * HOUR), createdAt: "2025-04-01" },
  { id: "u_07", name: "Noah Williams", email: "noah@northwind.io", role: "USER", status: "ACTIVE", title: "Account Executive", avatarColor: "#14b8a6", lastActive: iso(6 * HOUR), createdAt: "2025-04-27" },
  { id: "u_08", name: "Emma Thompson", email: "emma@northwind.io", role: "USER", status: "INVITED", title: "Marketing Manager", avatarColor: "#ec4899", lastActive: iso(2 * DAY), createdAt: "2026-06-18" },
  { id: "u_09", name: "Yuki Tanaka", email: "yuki@northwind.io", role: "USER", status: "ACTIVE", title: "Data Analyst", avatarColor: "#3b82f6", lastActive: iso(9 * HOUR), createdAt: "2025-06-10" },
  { id: "u_10", name: "Omar Haddad", email: "omar@northwind.io", role: "USER", status: "ACTIVE", title: "Support Engineer", avatarColor: "#f97316", lastActive: iso(11 * HOUR), createdAt: "2025-07-22" },
  { id: "u_11", name: "Grace Lee", email: "grace@northwind.io", role: "MANAGER", status: "ACTIVE", title: "Finance Lead", avatarColor: "#06b6d4", lastActive: iso(1 * DAY - 2 * HOUR), createdAt: "2025-08-30" },
  { id: "u_12", name: "Tom Becker", email: "tom@northwind.io", role: "USER", status: "SUSPENDED", title: "QA Engineer", avatarColor: "#84cc16", lastActive: iso(14 * DAY), createdAt: "2025-09-15" },
];

export const currentUser = teamMembers[0];

export interface Plan {
  id: string;
  name: string;
  priceMonthly: number; // cents, -1 means "Custom"
  tagline: string;
  seats: string;
  features: string[];
  popular?: boolean;
}

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    tagline: "For trying things out",
    seats: "Up to 3 seats",
    features: ["3 team members", "Basic analytics", "7-day activity log", "Community support"],
  },
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 2900,
    tagline: "For small teams",
    seats: "Up to 10 seats",
    features: ["10 team members", "Full analytics", "30-day activity log", "Role-based access", "Email support"],
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 7900,
    tagline: "For growing companies",
    seats: "Up to 25 seats",
    popular: true,
    features: ["25 team members", "Advanced analytics", "1-year activity log", "Role-based access", "Audit trail export", "Priority support"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: -1,
    tagline: "For organizations at scale",
    seats: "Unlimited seats",
    features: ["Unlimited members", "Custom analytics", "Unlimited retention", "SSO & SAML", "Audit trail export", "Dedicated manager", "99.9% uptime SLA"],
  },
];

export const currentPlanId = "pro";

export interface Kpi {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
}

export const kpis: Kpi[] = [
  { label: "Monthly recurring revenue", value: "$48,200", delta: "+12.5%", positive: true },
  { label: "Active users", value: "2,847", delta: "+8.2%", positive: true },
  { label: "New signups", value: "184", delta: "+3.1%", positive: true },
  { label: "Churn rate", value: "1.8%", delta: "-0.4%", positive: true },
];

export interface MonthPoint {
  month: string;
  revenue: number;
  customers: number;
}

export const monthlySeries: MonthPoint[] = [
  { month: "Jul", revenue: 28400, customers: 92 },
  { month: "Aug", revenue: 30100, customers: 110 },
  { month: "Sep", revenue: 31800, customers: 105 },
  { month: "Oct", revenue: 33000, customers: 121 },
  { month: "Nov", revenue: 35600, customers: 134 },
  { month: "Dec", revenue: 37200, customers: 128 },
  { month: "Jan", revenue: 39000, customers: 142 },
  { month: "Feb", revenue: 40500, customers: 150 },
  { month: "Mar", revenue: 42100, customers: 139 },
  { month: "Apr", revenue: 44000, customers: 161 },
  { month: "May", revenue: 46300, customers: 173 },
  { month: "Jun", revenue: 48200, customers: 184 },
];

export interface PlanShare {
  name: string;
  customers: number;
  color: string;
}

export const planDistribution: PlanShare[] = [
  { name: "Pro", customers: 612, color: "#6366f1" },
  { name: "Starter", customers: 824, color: "#10b981" },
  { name: "Free", customers: 1238, color: "#94a3b8" },
  { name: "Enterprise", customers: 64, color: "#f59e0b" },
];

export type AuditCategory = "user" | "billing" | "security" | "settings";

export interface AuditEvent {
  id: string;
  actor: string;
  actorColor: string;
  description: string;
  category: AuditCategory;
  time: string;
}

export const auditLog: AuditEvent[] = [
  { id: "a_01", actor: "Alex Morgan", actorColor: "#6366f1", description: "invited Emma Thompson as User", category: "user", time: iso(22 * MIN) },
  { id: "a_02", actor: "Daniel Okafor", actorColor: "#f43f5e", description: "changed Lucas Almeida's role to User", category: "user", time: iso(1 * HOUR + 40 * MIN) },
  { id: "a_03", actor: "Grace Lee", actorColor: "#06b6d4", description: "updated billing payment method", category: "billing", time: iso(3 * HOUR) },
  { id: "a_04", actor: "Maya Chen", actorColor: "#10b981", description: "signed in from a new device", category: "security", time: iso(5 * HOUR) },
  { id: "a_05", actor: "Alex Morgan", actorColor: "#6366f1", description: "upgraded the workspace to the Pro plan", category: "billing", time: iso(8 * HOUR) },
  { id: "a_06", actor: "Sofia Rossi", actorColor: "#8b5cf6", description: "exported the activity log", category: "settings", time: iso(1 * DAY) },
  { id: "a_07", actor: "Alex Morgan", actorColor: "#6366f1", description: "suspended Tom Becker", category: "user", time: iso(1 * DAY + 4 * HOUR) },
  { id: "a_08", actor: "Daniel Okafor", actorColor: "#f43f5e", description: "enabled two-factor authentication", category: "security", time: iso(2 * DAY) },
  { id: "a_09", actor: "Priya Nair", actorColor: "#f59e0b", description: "updated workspace branding", category: "settings", time: iso(2 * DAY + 6 * HOUR) },
  { id: "a_10", actor: "Grace Lee", actorColor: "#06b6d4", description: "downloaded the May invoice", category: "billing", time: iso(3 * DAY) },
  { id: "a_11", actor: "Maya Chen", actorColor: "#10b981", description: "changed Noah Williams's role to User", category: "user", time: iso(4 * DAY) },
  { id: "a_12", actor: "Omar Haddad", actorColor: "#f97316", description: "reset their password", category: "security", time: iso(5 * DAY) },
];
