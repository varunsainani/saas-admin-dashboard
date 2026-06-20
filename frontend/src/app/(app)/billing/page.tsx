"use client";

import { Check, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { plans } from "@/lib/data";
import { getSubscription, type ApiSubscription } from "@/lib/api";
import { planNameToKey } from "@/lib/mappers";
import { useLive } from "@/lib/use-live";
import { cn } from "@/lib/utils";
import { useAppFormat } from "@/i18n/use-app-format";

const DEMO_SUB: ApiSubscription = {
  id: "demo",
  planId: "pro",
  plan: { id: "pro", name: "Pro", priceMonthly: 7900, seats: 25, features: [], popular: true },
  status: "ACTIVE",
  seatsUsed: 12,
  currentPeriodEnd: "2026-07-01",
};

export default function BillingPage() {
  const t = useTranslations("billing");
  const fmt = useAppFormat();
  const { data: sub } = useLive(getSubscription, DEMO_SUB);
  const s = sub ?? DEMO_SUB;
  const currentPlanKey = planNameToKey(s.plan.name) ?? "planPro";
  const seatsPct = Math.round((s.seatsUsed / s.plan.seats) * 100);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader title={t("title")} description={t("description")} />

      {/* Current plan summary */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">
                {t("currentPlanHeading", { plan: t(currentPlanKey) })}
              </h2>
              <Badge tone="primary">{t("currentBadge")}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("priceRenews", {
                price: fmt.currency(s.plan.priceMonthly / 100),
                date: fmt.date(s.currentPeriodEnd),
              })}
            </p>
            <div className="mt-4 max-w-xs">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{t("seatsUsed")}</span>
                <span>{t("seatsCount", { used: s.seatsUsed, total: s.plan.seats })}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${seatsPct}%` }} />
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline">{t("manageBilling")}</Button>
            <Button>{t("changePlan")}</Button>
          </div>
        </div>
      </Card>

      {/* Plans grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = plan.nameKey === currentPlanKey;
          return (
            <Card
              key={plan.id}
              className={cn("flex flex-col p-5", plan.popular && "ring-2 ring-primary")}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{t(plan.nameKey)}</h3>
                {plan.popular && (
                  <Badge tone="primary">
                    <Sparkles className="h-3 w-3" />
                    {t("popular")}
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{t(plan.taglineKey)}</p>

              <div className="mt-4 flex items-baseline gap-1">
                {plan.priceMonthly < 0 ? (
                  <span className="text-3xl font-semibold tracking-tight">{t("custom")}</span>
                ) : (
                  <>
                    <span className="text-3xl font-semibold tracking-tight">
                      {fmt.currency(plan.priceMonthly / 100)}
                    </span>
                    <span className="text-sm text-muted-foreground">{t("perMonth")}</span>
                  </>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {plan.seats.key === "seatsUpTo"
                  ? t("seatsUpTo", { count: plan.seats.count })
                  : t("seatsUnlimited")}
              </p>

              <Button
                variant={isCurrent ? "secondary" : plan.popular ? "primary" : "outline"}
                disabled={isCurrent}
                className="mt-5 w-full"
              >
                {isCurrent
                  ? t("ctaCurrent")
                  : plan.priceMonthly < 0
                    ? t("ctaContact")
                    : t("ctaChoose")}
              </Button>

              <div className="mt-5 space-y-2.5 border-t border-border pt-5">
                {plan.features.map((f) => {
                  const params: Record<string, string | number> = {};
                  if (f.count != null) params.count = f.count;
                  if (f.days != null) params.days = f.days;
                  if (f.percent != null) params.percent = fmt.percent(f.percent);
                  return (
                    <div key={f.key} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span className="text-muted-foreground">{t(f.key, params)}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
