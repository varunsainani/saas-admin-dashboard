import { ArrowDownRight, ArrowUpRight, Calendar, Download } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { CustomersChart } from "@/components/charts/customers-chart";
import { cn, formatNumber, relativeTime } from "@/lib/utils";
import { kpis, planDistribution, auditLog, currentUser, NOW } from "@/lib/data";

export default function DashboardPage() {
  const totalCustomers = planDistribution.reduce((s, p) => s + p.customers, 0);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${currentUser.name.split(" ")[0]}. Here is how your workspace is doing.`}
        actions={
          <>
            <Button variant="outline" size="md" className="hidden sm:inline-flex">
              <Calendar className="h-4 w-4" />
              Last 12 months
            </Button>
            <Button variant="primary" size="md">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const down = k.delta.startsWith("-");
          const Arrow = down ? ArrowDownRight : ArrowUpRight;
          return (
            <Card key={k.label} className="p-5">
              <p className="text-sm text-muted-foreground">{k.label}</p>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-2xl font-semibold tracking-tight">{k.value}</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-xs font-medium",
                    k.positive ? "text-success" : "text-danger",
                  )}
                >
                  <Arrow className="h-3.5 w-3.5" />
                  {k.delta}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">vs. last month</p>
            </Card>
          );
        })}
      </div>

      {/* Revenue + plan mix */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Revenue</CardTitle>
              <p className="text-sm text-muted-foreground">Monthly recurring revenue</p>
            </div>
            <span className="text-sm font-medium text-success">+12.5%</span>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customers by plan</CardTitle>
            <p className="text-sm text-muted-foreground">{formatNumber(totalCustomers)} total</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {planDistribution.map((p) => {
              const pct = Math.round((p.customers / totalCustomers) * 100);
              return (
                <div key={p.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground">
                      {formatNumber(p.customers)}
                      <span className="ml-1.5 text-xs">{pct}%</span>
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
            <CardTitle>New customers</CardTitle>
            <p className="text-sm text-muted-foreground">Acquired per month</p>
          </CardHeader>
          <CardContent>
            <CustomersChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent activity</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
              View all
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {auditLog.slice(0, 6).map((e) => (
              <div key={e.id} className="flex items-start gap-3">
                <Avatar name={e.actor} color={e.actorColor} className="h-7 w-7 text-[10px]" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{e.actor}</span>{" "}
                    <span className="text-muted-foreground">{e.description}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {relativeTime(e.time, NOW)}
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
