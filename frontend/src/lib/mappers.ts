// Translate raw backend records into the shape the i18n UI expects. Enum-like
// values (roles, plans, audit actions) map to translation keys; free text
// (names, emails) is rendered as-is.

import { teamMembers, plans, currentPlanId, NOW, type AuditEvent, type Role } from "./data";
import type { ApiAuditEvent, OverviewResponse, SeriesPoint } from "./api";

const PLAN_KEY: Record<string, string> = {
  Free: "planFree",
  Starter: "planStarter",
  Pro: "planPro",
  Enterprise: "planEnterprise",
};

export function planNameToKey(name?: string | null): string | undefined {
  return name ? PLAN_KEY[name] : undefined;
}

type AuditCategory = AuditEvent["category"];

function categoryFor(action: string): AuditCategory {
  const prefix = action.split(".")[0];
  if (prefix === "user") return "user";
  if (prefix === "billing") return "billing";
  if (prefix === "auth" || prefix === "security") return "security";
  return "settings";
}

// Map a backend audit event onto the descKey + params the activity UI renders.
export function normalizeAudit(e: ApiAuditEvent): AuditEvent {
  const meta = (e.metadata || {}) as { role?: Role; status?: string };
  const base = {
    id: e.id,
    actor: e.actor?.name || "System",
    actorColor: e.actor?.avatarColor || "#6366f1",
    time: e.createdAt,
    category: categoryFor(e.action),
  };
  switch (e.action) {
    case "user.invited":
      return { ...base, descKey: "descInvitedAs", name: e.target ?? undefined, roleEnum: meta.role };
    case "user.updated":
      if (meta.status === "SUSPENDED")
        return { ...base, descKey: "descSuspendedUser", name: e.target ?? undefined };
      if (meta.role)
        return { ...base, descKey: "descChangedRole", name: e.target ?? undefined, roleEnum: meta.role };
      return { ...base, descKey: "descGeneric" };
    case "user.removed":
      return { ...base, descKey: "descRemovedUser", name: e.target ?? undefined };
    case "billing.updated":
      return { ...base, descKey: "descUpdatedPayment" };
    case "billing.upgraded":
      return {
        ...base,
        descKey: "descUpgradedPlan",
        planKey: planNameToKey((e.target ?? "").replace(/ plan$/i, "")) ?? "planPro",
      };
    case "auth.login":
      return { ...base, descKey: "descSignedInDevice" };
    case "auth.register":
      return { ...base, descKey: "descCreatedWorkspace" };
    case "security.2fa_enabled":
      return { ...base, descKey: "descEnabled2fa" };
    case "settings.exported":
      return { ...base, descKey: "descExportedLog" };
    default:
      return { ...base, descKey: "descGeneric" };
  }
}

// Cumulative + per-month member counts over the trailing 12 months. Mirrors the
// backend so the demo (no session) and live dashboards look identical.
function buildSeries(dates: string[], monthsBack = 12): SeriesPoint[] {
  const now = new Date(NOW);
  const buckets: { year: number; month: number; newMembers: number }[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ year: d.getFullYear(), month: d.getMonth(), newMembers: 0 });
  }
  const windowStart = new Date(buckets[0].year, buckets[0].month, 1);
  let baseline = 0;
  for (const raw of dates) {
    const d = new Date(raw);
    if (d < windowStart) {
      baseline++;
      continue;
    }
    const b = buckets.find((x) => x.year === d.getFullYear() && x.month === d.getMonth());
    if (b) b.newMembers++;
  }
  let cumulative = baseline;
  return buckets.map((b) => {
    cumulative += b.newMembers;
    return { monthIndex: b.month, newMembers: b.newMembers, totalMembers: cumulative };
  });
}

// Overview built from the bundled sample team, for the public demo with no session.
export function demoOverview(): OverviewResponse {
  const count = (pred: (m: (typeof teamMembers)[number]) => boolean) =>
    teamMembers.filter(pred).length;
  const plan = plans.find((p) => p.id === currentPlanId)!;
  const seats = plan.seats.key === "seatsUpTo" ? plan.seats.count : 9999;
  return {
    members: {
      total: teamMembers.length,
      active: count((m) => m.status === "ACTIVE"),
      invited: count((m) => m.status === "INVITED"),
      suspended: count((m) => m.status === "SUSPENDED"),
    },
    roles: {
      ADMIN: count((m) => m.role === "ADMIN"),
      MANAGER: count((m) => m.role === "MANAGER"),
      USER: count((m) => m.role === "USER"),
    },
    subscription: {
      plan: "Pro",
      status: "ACTIVE",
      seatsUsed: teamMembers.length,
      seats,
      currentPeriodEnd: "2026-07-01",
    },
    series: buildSeries(teamMembers.map((m) => m.createdAt)),
  };
}
