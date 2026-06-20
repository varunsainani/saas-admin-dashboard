// Demo data for the Vantage admin console. User-facing labels are stored as
// translation KEYS (resolved with next-intl in components); numbers, dates, and
// months are raw values formatted per the active locale. Proper nouns (names,
// emails, company) stay as data. Timestamps derive from a fixed reference so
// server and client render identically.

export type Role = "ADMIN" | "MANAGER" | "USER";
export type UserStatus = "ACTIVE" | "INVITED" | "SUSPENDED";

export const NOW = new Date("2026-06-20T16:30:00Z").getTime();
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const iso = (msAgo: number) => new Date(NOW - msAgo).toISOString();

export const organization = {
  name: "Northwind",
  planKey: "planPro",
};

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  titleKey: string;
  avatarColor: string;
  lastActive: string;
  createdAt: string;
}

export const teamMembers: TeamMember[] = [
  { id: "u_01", name: "Alex Morgan", email: "alex@northwind.io", role: "ADMIN", status: "ACTIVE", titleKey: "title_founder_ceo", avatarColor: "#6366f1", lastActive: iso(4 * MIN), createdAt: "2025-01-08" },
  { id: "u_02", name: "Maya Chen", email: "maya@northwind.io", role: "MANAGER", status: "ACTIVE", titleKey: "title_head_of_product", avatarColor: "#10b981", lastActive: iso(38 * MIN), createdAt: "2025-01-22" },
  { id: "u_03", name: "Daniel Okafor", email: "daniel@northwind.io", role: "MANAGER", status: "ACTIVE", titleKey: "title_engineering_lead", avatarColor: "#f43f5e", lastActive: iso(2 * HOUR), createdAt: "2025-02-14" },
  { id: "u_04", name: "Priya Nair", email: "priya@northwind.io", role: "USER", status: "ACTIVE", titleKey: "title_senior_designer", avatarColor: "#f59e0b", lastActive: iso(5 * HOUR), createdAt: "2025-03-03" },
  { id: "u_05", name: "Lucas Almeida", email: "lucas@northwind.io", role: "USER", status: "ACTIVE", titleKey: "title_backend_engineer", avatarColor: "#0ea5e9", lastActive: iso(1 * DAY), createdAt: "2025-03-19" },
  { id: "u_06", name: "Sofia Rossi", email: "sofia@northwind.io", role: "MANAGER", status: "ACTIVE", titleKey: "title_customer_success", avatarColor: "#8b5cf6", lastActive: iso(3 * HOUR), createdAt: "2025-04-01" },
  { id: "u_07", name: "Noah Williams", email: "noah@northwind.io", role: "USER", status: "ACTIVE", titleKey: "title_account_executive", avatarColor: "#14b8a6", lastActive: iso(6 * HOUR), createdAt: "2025-04-27" },
  { id: "u_08", name: "Emma Thompson", email: "emma@northwind.io", role: "USER", status: "INVITED", titleKey: "title_marketing_manager", avatarColor: "#ec4899", lastActive: iso(2 * DAY), createdAt: "2026-06-18" },
  { id: "u_09", name: "Yuki Tanaka", email: "yuki@northwind.io", role: "USER", status: "ACTIVE", titleKey: "title_data_analyst", avatarColor: "#3b82f6", lastActive: iso(9 * HOUR), createdAt: "2025-06-10" },
  { id: "u_10", name: "Omar Haddad", email: "omar@northwind.io", role: "USER", status: "ACTIVE", titleKey: "title_support_engineer", avatarColor: "#f97316", lastActive: iso(11 * HOUR), createdAt: "2025-07-22" },
  { id: "u_11", name: "Grace Lee", email: "grace@northwind.io", role: "MANAGER", status: "ACTIVE", titleKey: "title_finance_lead", avatarColor: "#06b6d4", lastActive: iso(1 * DAY - 2 * HOUR), createdAt: "2025-08-30" },
  { id: "u_12", name: "Tom Becker", email: "tom@northwind.io", role: "USER", status: "SUSPENDED", titleKey: "title_qa_engineer", avatarColor: "#84cc16", lastActive: iso(14 * DAY), createdAt: "2025-09-15" },
];

export const currentUser = teamMembers[0];

export type KpiFormat = "currency" | "number" | "percent";
export interface Kpi {
  key: string;
  value: number;
  format: KpiFormat;
  delta: number;
  positive: boolean;
}

export const kpis: Kpi[] = [
  { key: "kpiMrr", value: 48200, format: "currency", delta: 12.5, positive: true },
  { key: "kpiActiveUsers", value: 2847, format: "number", delta: 8.2, positive: true },
  { key: "kpiNewSignups", value: 184, format: "number", delta: 3.1, positive: true },
  { key: "kpiChurnRate", value: 1.8, format: "percent", delta: -0.4, positive: true },
];

export interface PlanFeature {
  key: string;
  count?: number;
  days?: number;
  percent?: number;
}

export interface Plan {
  id: string;
  nameKey: string;
  taglineKey: string;
  priceMonthly: number; // cents, -1 means "Custom"
  popular?: boolean;
  seats: { key: "seatsUpTo"; count: number } | { key: "seatsUnlimited" };
  features: PlanFeature[];
}

export const plans: Plan[] = [
  {
    id: "free",
    nameKey: "planFree",
    taglineKey: "taglineFree",
    priceMonthly: 0,
    seats: { key: "seatsUpTo", count: 3 },
    features: [
      { key: "featTeamMembers", count: 3 },
      { key: "featAnalyticsBasic" },
      { key: "featLogDays", days: 7 },
      { key: "featSupportCommunity" },
    ],
  },
  {
    id: "starter",
    nameKey: "planStarter",
    taglineKey: "taglineStarter",
    priceMonthly: 2900,
    seats: { key: "seatsUpTo", count: 10 },
    features: [
      { key: "featTeamMembers", count: 10 },
      { key: "featAnalyticsFull" },
      { key: "featLogDays", days: 30 },
      { key: "featRbac" },
      { key: "featSupportEmail" },
    ],
  },
  {
    id: "pro",
    nameKey: "planPro",
    taglineKey: "taglinePro",
    priceMonthly: 7900,
    popular: true,
    seats: { key: "seatsUpTo", count: 25 },
    features: [
      { key: "featTeamMembers", count: 25 },
      { key: "featAnalyticsAdvanced" },
      { key: "featLogYear" },
      { key: "featRbac" },
      { key: "featAuditExport" },
      { key: "featSupportPriority" },
    ],
  },
  {
    id: "enterprise",
    nameKey: "planEnterprise",
    taglineKey: "taglineEnterprise",
    priceMonthly: -1,
    seats: { key: "seatsUnlimited" },
    features: [
      { key: "featUnlimitedMembers" },
      { key: "featAnalyticsCustom" },
      { key: "featUnlimitedRetention" },
      { key: "featSso" },
      { key: "featAuditExport" },
      { key: "featDedicatedManager" },
      { key: "featUptime", percent: 99.9 },
    ],
  },
];

export const currentPlanId = "pro";

export interface PlanShare {
  nameKey: string;
  customers: number;
  color: string;
}

export const planDistribution: PlanShare[] = [
  { nameKey: "planPro", customers: 612, color: "#6366f1" },
  { nameKey: "planStarter", customers: 824, color: "#10b981" },
  { nameKey: "planFree", customers: 1238, color: "#94a3b8" },
  { nameKey: "planEnterprise", customers: 64, color: "#f59e0b" },
];

export interface MonthPoint {
  monthIndex: number; // 0-11
  revenue: number;
  customers: number;
}

export const monthlySeries: MonthPoint[] = [
  { monthIndex: 6, revenue: 28400, customers: 92 },
  { monthIndex: 7, revenue: 30100, customers: 110 },
  { monthIndex: 8, revenue: 31800, customers: 105 },
  { monthIndex: 9, revenue: 33000, customers: 121 },
  { monthIndex: 10, revenue: 35600, customers: 134 },
  { monthIndex: 11, revenue: 37200, customers: 128 },
  { monthIndex: 0, revenue: 39000, customers: 142 },
  { monthIndex: 1, revenue: 40500, customers: 150 },
  { monthIndex: 2, revenue: 42100, customers: 139 },
  { monthIndex: 3, revenue: 44000, customers: 161 },
  { monthIndex: 4, revenue: 46300, customers: 173 },
  { monthIndex: 5, revenue: 48200, customers: 184 },
];

export type AuditCategory = "user" | "billing" | "security" | "settings";

export interface AuditEvent {
  id: string;
  actor: string;
  actorColor: string;
  category: AuditCategory;
  time: string;
  descKey: string;
  name?: string;
  roleEnum?: Role;
  planKey?: string;
  monthIndex?: number;
}

export const auditLog: AuditEvent[] = [
  { id: "a_01", actor: "Alex Morgan", actorColor: "#6366f1", category: "user", time: iso(22 * MIN), descKey: "descInvitedAs", name: "Emma Thompson", roleEnum: "USER" },
  { id: "a_02", actor: "Daniel Okafor", actorColor: "#f43f5e", category: "user", time: iso(1 * HOUR + 40 * MIN), descKey: "descChangedRole", name: "Lucas Almeida", roleEnum: "USER" },
  { id: "a_03", actor: "Grace Lee", actorColor: "#06b6d4", category: "billing", time: iso(3 * HOUR), descKey: "descUpdatedPayment" },
  { id: "a_04", actor: "Maya Chen", actorColor: "#10b981", category: "security", time: iso(5 * HOUR), descKey: "descSignedInDevice" },
  { id: "a_05", actor: "Alex Morgan", actorColor: "#6366f1", category: "billing", time: iso(8 * HOUR), descKey: "descUpgradedPlan", planKey: "planPro" },
  { id: "a_06", actor: "Sofia Rossi", actorColor: "#8b5cf6", category: "settings", time: iso(1 * DAY), descKey: "descExportedLog" },
  { id: "a_07", actor: "Alex Morgan", actorColor: "#6366f1", category: "user", time: iso(1 * DAY + 4 * HOUR), descKey: "descSuspendedUser", name: "Tom Becker" },
  { id: "a_08", actor: "Daniel Okafor", actorColor: "#f43f5e", category: "security", time: iso(2 * DAY), descKey: "descEnabled2fa" },
  { id: "a_09", actor: "Priya Nair", actorColor: "#f59e0b", category: "settings", time: iso(2 * DAY + 6 * HOUR), descKey: "descUpdatedBranding" },
  { id: "a_10", actor: "Grace Lee", actorColor: "#06b6d4", category: "billing", time: iso(3 * DAY), descKey: "descDownloadedInvoice", monthIndex: 4 },
  { id: "a_11", actor: "Maya Chen", actorColor: "#10b981", category: "user", time: iso(4 * DAY), descKey: "descChangedRole", name: "Noah Williams", roleEnum: "USER" },
  { id: "a_12", actor: "Omar Haddad", actorColor: "#f97316", category: "security", time: iso(5 * DAY), descKey: "descResetPassword" },
];
