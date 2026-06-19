"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { monthlySeries } from "@/lib/data";

type ChartTooltip = {
  active?: boolean;
  label?: string | number;
  payload?: Array<{ value?: number | string }>;
};

function CustomersTooltip({ active, payload, label }: ChartTooltip) {
  if (!active || !payload || payload.length === 0) return null;
  const value = Number(payload[0]?.value ?? 0);
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      <p className="text-muted-foreground">
        New customers <span className="font-semibold text-foreground">{value}</span>
      </p>
    </div>
  );
}

export function CustomersChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={monthlySeries} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          dy={8}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        <YAxis
          width={32}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        <Tooltip content={<CustomersTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.5 }} />
        <Bar dataKey="customers" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={26} />
      </BarChart>
    </ResponsiveContainer>
  );
}
