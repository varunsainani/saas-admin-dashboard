"use client";

import { ArrowDownRight, ArrowUpRight, Calendar, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { CustomersChart } from "@/components/charts/customers-chart";
import { cn } from "@/lib/utils";
import { useAppFormat } from "@/i18n/use-app-format";
import { kpis, planDistribution, auditLog, currentUser, NOW } from "@/lib/data";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tb = useTranslations("billing");
  const ta = useTranslations("activity");
  const tt = useTranslations("team");
  const fmt = useAppFormat();

  const totalCustomers = planDistribution.reduce((s, p) => s + p.customers, 0);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={t("title")}
        description={t("welcome", { firstName: currentUser.name.split(" ")[0] })}
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
        {kpis.map((k) => {
          const down = k.delta < 0;
          const Arrow = down ? ArrowDownRight : ArrowUpRight;
          const value =
            k.format === "currency"
              ? fmt.currency(k.value)
              : k.format === "number"
                ? fmt.number(k.value)
                : fmt.percent(k.value);
          return (
            <Card key={k.key} className="p-5">
              <p className="text-sm text-muted-foreground">{t(k.key)}</p>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-2xl font-semibold tracking-tight">{value}</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-xs font-medium",
                    k.positive ? "text-success" : "text-danger",
                  )}
                >
                  <Arrow className="h-3.5 w-3.5" />
                  {fmt.percent(k.delta, true)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t("vsLastMonth")}</p>
            </Card>
          );
        })}
      </div>

      {/* Revenue + plan mix */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>{t("revenueTitle")}</CardTitle>
              <p className="text-sm text-muted-foreground">{t("revenueSubtitle")}</p>
            </div>
            <span className="text-sm font-medium text-success">{fmt.percent(12.5, true)}</span>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("plansTitle")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("plansTotal", { count: fmt.number(totalCustomers) })}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {planDistribution.map((p) => {
              const pct = Math.round((p.customers / totalCustomers) * 100);
              return (
                <div key={p.nameKey}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{tb(p.nameKey)}</span>
                    <span className="text-muted-foreground">
                      {fmt.number(p.customers)}
                      <span className="ml-1.5 text-xs">{fmt.percent(pct)}</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: p.color }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* New customers + activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("newCustomersTitle")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("newCustomersSubtitle")}</p>
          </CardHeader>
          <CardContent>
            <CustomersChart />
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
            {auditLog.slice(0, 6).map((e) => (
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
