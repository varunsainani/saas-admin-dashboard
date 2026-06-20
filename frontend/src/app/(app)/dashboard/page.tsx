"use client";

import { Calendar, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { CustomersChart } from "@/components/charts/customers-chart";
import { cn } from "@/lib/utils";
import { useAppFormat } from "@/i18n/use-app-format";
import { useLive } from "@/lib/use-live";
import { getMe, getOverview, getAudit, type ApiRole } from "@/lib/api";
import { demoOverview, normalizeAudit } from "@/lib/mappers";
import { auditLog, currentUser, NOW, type AuditEvent } from "@/lib/data";

const ROLE_COLOR: Record<ApiRole, string> = {
  ADMIN: "#6366f1",
  MANAGER: "#10b981",
  USER: "#94a3b8",
};

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tb = useTranslations("billing");
  const ta = useTranslations("activity");
  const tt = useTranslations("team");
  const fmt = useAppFormat();

  const { data: overview } = useLive(getOverview, demoOverview());
  const { data: events } = useLive<AuditEvent[]>(
    async () => (await getAudit(8)).map(normalizeAudit),
    auditLog.slice(0, 8),
  );
  const { data: me } = useLive<{ name: string }>(
    async () => ({ name: (await getMe()).name }),
    { name: currentUser.name },
  );

  const m = overview.members;
  const sub = overview.subscription;
  const seatsUsed = sub?.seatsUsed ?? m.total;
  const seats = sub?.seats ?? m.total;
  const newThisMonth = overview.series.at(-1)?.newMembers ?? 0;

  const cards = [
    {
      key: "kpiTotalMembers",
      value: fmt.number(m.total),
      sub: t("subNewThisMonth", { count: newThisMonth }),
      accent: newThisMonth > 0,
    },
    {
      key: "kpiActiveMembers",
      value: fmt.number(m.active),
      sub: t("subOfTotalActive", { count: m.active, total: m.total }),
    },
    { key: "kpiPendingInvites", value: fmt.number(m.invited), sub: t("subAwaiting") },
    { key: "kpiSeatsUsed", value: fmt.number(seatsUsed), sub: t("subOfSeats", { total: seats }) },
  ];

  const roleRows = (Object.keys(ROLE_COLOR) as ApiRole[]).map((role) => ({
    role,
    count: overview.roles[role],
    color: ROLE_COLOR[role],
  }));
  const totalRoles = roleRows.reduce((s, r) => s + r.count, 0) || 1;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={t("title")}
        description={t("welcome", { firstName: me.name.split(" ")[0] })}
        actions={
          <>
            <Button variant="outline" size="md" className="hidden sm:inline-flex">
              <Calendar className="h-4 w-4" />
              {t("last12Months")}
            </Button>
            <Button variant="primary" size="md">
              <Download className="h-4 w-4" />
              {t("export")}
            </Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.key} className="p-5">
            <p className="text-sm text-muted-foreground">{t(c.key)}</p>
            <div className="mt-2 text-2xl font-semibold tracking-tight">{c.value}</div>
            <p className={cn(c.accent ? "text-success" : "text-muted-foreground", "mt-1 text-xs")}>
              {c.sub}
            </p>
          </Card>
        ))}
      </div>

      {/* Team growth + role mix */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("teamGrowthTitle")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("teamGrowthSubtitle")}</p>
          </CardHeader>
          <CardContent>
            <RevenueChart data={overview.series} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("rolesTitle")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("rolesTotal", { count: fmt.number(m.total) })}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {roleRows.map((r) => {
              const pct = Math.round((r.count / totalRoles) * 100);
              return (
                <div key={r.role}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{tt(`role${r.role}`)}</span>
                    <span className="text-muted-foreground">
                      {fmt.number(r.count)}
                      <span className="ml-1.5 text-xs">{fmt.percent(pct)}</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: r.color }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* New members + activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("newMembersTitle")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("newMembersSubtitle")}</p>
          </CardHeader>
          <CardContent>
            <CustomersChart data={overview.series} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{t("recentActivity")}</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
              {t("viewAll")}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.slice(0, 6).map((e) => (
              <div key={e.id} className="flex items-start gap-3">
                <Avatar name={e.actor} color={e.actorColor} className="h-7 w-7 text-[10px]" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{e.actor}</span>{" "}
                    <span className="text-muted-foreground">
                      {ta(e.descKey, {
                        name: e.name ?? "",
                        role: e.roleEnum ? tt(`role${e.roleEnum}`) : "",
                        plan: e.planKey ? tb(e.planKey) : "",
                        month: e.monthIndex != null ? fmt.monthShort(e.monthIndex) : "",
                      })}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {fmt.relativeTime(e.time, NOW)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
