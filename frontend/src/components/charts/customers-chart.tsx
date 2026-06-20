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
import { useTranslations } from "next-intl";
import { monthlySeries } from "@/lib/data";
import { useAppFormat } from "@/i18n/use-app-format";

type ChartTooltip = {
  active?: boolean;
  label?: string | number;
  payload?: Array<{ value?: number | string }>;
};

function CustomersTooltip({ active, payload, label }: ChartTooltip) {
  const t = useTranslations("charts");
  const fmt = useAppFormat();
  if (!active || !payload || payload.length === 0) return null;
  const value = Number(payload[0]?.value ?? 0);
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-popover-foreground">{fmt.monthShort(Number(label))}</p>
      <p className="text-muted-foreground">
        {t("newCustomers")}{" "}
        <span className="font-semibold text-foreground">{fmt.number(value)}</span>
      </p>
    </div>
  );
}

export function CustomersChart() {
  const fmt = useAppFormat();
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={monthlySeries} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis
          dataKey="monthIndex"
          tickLine={false}
          axisLine={false}
          dy={8}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          tickFormatter={(i: number) => fmt.monthShort(i)}
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
