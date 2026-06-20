"use client";

import {
  Area,
  AreaChart,
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

function RevenueTooltip({ active, payload, label }: ChartTooltip) {
  const t = useTranslations("charts");
  const fmt = useAppFormat();
  if (!active || !payload || payload.length === 0) return null;
  const value = Number(payload[0]?.value ?? 0);
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-popover-foreground">{fmt.monthShort(Number(label))}</p>
      <p className="text-muted-foreground">
        {t("mrr")} <span className="font-semibold text-foreground">{fmt.currency(value)}</span>
      </p>
    </div>
  );
}

export function RevenueChart() {
  const fmt = useAppFormat();
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={monthlySeries} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
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
          width={48}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          tickFormatter={(v: number) => fmt.compactCurrency(v)}
        />
        <Tooltip content={<RevenueTooltip />} cursor={{ stroke: "var(--border)" }} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--primary)"
          strokeWidth={2}
          fill="url(#revGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
