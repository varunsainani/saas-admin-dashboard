"use client";

import { Check, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { plans, currentPlanId } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useAppFormat } from "@/i18n/use-app-format";

export default function BillingPage() {
  const t = useTranslations("billing");
  const fmt = useAppFormat();
  const current = plans.find((p) => p.id === currentPlanId)!;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader title={t("title")} description={t("description")} />

      {/* Current plan summary */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">
                {t("currentPlanHeading", { plan: t(current.nameKey) })}
              </h2>
              <Badge tone="primary">{t("currentBadge")}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("priceRenews", {
                price: fmt.currency(current.priceMonthly / 100),
                date: fmt.date("2026-07-01"),
              })}
            </p>
            <div className="mt-4 max-w-xs">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{t("seatsUsed")}</span>
                <span>{t("seatsCount", { used: 12, total: 25 })}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: "48%" }} />
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
          const isCurrent = plan.id === currentPlanId;
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
