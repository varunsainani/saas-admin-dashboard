import { Check, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { plans, currentPlanId } from "@/lib/data";
import { cn, formatCurrency } from "@/lib/utils";

export default function BillingPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Billing & Plans"
        description="Manage your subscription and see what each plan includes."
      />

      {/* Current plan summary */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Pro plan</h2>
              <Badge tone="primary">Current</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              $79 per month · renews Jul 1, 2026
            </p>
            <div className="mt-4 max-w-xs">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Seats used</span>
                <span>12 of 25</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: "48%" }} />
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline">Manage billing</Button>
            <Button>Change plan</Button>
          </div>
        </div>
      </Card>

      {/* Plans grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const current = plan.id === currentPlanId;
          return (
            <Card
              key={plan.id}
              className={cn("flex flex-col p-5", plan.popular && "ring-2 ring-primary")}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{plan.name}</h3>
                {plan.popular && (
                  <Badge tone="primary">
                    <Sparkles className="h-3 w-3" />
                    Popular
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>

              <div className="mt-4 flex items-baseline gap-1">
                {plan.priceMonthly < 0 ? (
                  <span className="text-3xl font-semibold tracking-tight">Custom</span>
                ) : (
                  <>
                    <span className="text-3xl font-semibold tracking-tight">
                      {formatCurrency(plan.priceMonthly)}
                    </span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{plan.seats}</p>

              <Button
                variant={current ? "secondary" : plan.popular ? "primary" : "outline"}
                disabled={current}
                className="mt-5 w-full"
              >
                {current
                  ? "Current plan"
                  : plan.priceMonthly < 0
                    ? "Contact sales"
                    : "Choose plan"}
              </Button>

              <div className="mt-5 space-y-2.5 border-t border-border pt-5">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span className="text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
