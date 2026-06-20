"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Users, CreditCard, ShieldCheck, Settings, Download } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAppFormat } from "@/i18n/use-app-format";
import { getAudit } from "@/lib/api";
import { normalizeAudit } from "@/lib/mappers";
import { useLive } from "@/lib/use-live";
import { auditLog, NOW, type AuditCategory, type AuditEvent } from "@/lib/data";

const meta: Record<AuditCategory, { icon: LucideIcon; color: string }> = {
  user: { icon: Users, color: "#6366f1" },
  billing: { icon: CreditCard, color: "#10b981" },
  security: { icon: ShieldCheck, color: "#f59e0b" },
  settings: { icon: Settings, color: "#94a3b8" },
};

const FILTERS: { key: "ALL" | AuditCategory }[] = [
  { key: "ALL" },
  { key: "user" },
  { key: "billing" },
  { key: "security" },
  { key: "settings" },
];

const categoryKey = (c: AuditCategory) =>
  `category${c.charAt(0).toUpperCase() + c.slice(1)}` as const;

export default function ActivityPage() {
  const t = useTranslations("activity");
  const tt = useTranslations("team");
  const tb = useTranslations("billing");
  const fmt = useAppFormat();

  const [filter, setFilter] = useState<"ALL" | AuditCategory>("ALL");
  const { data: all } = useLive<AuditEvent[]>(
    async () => (await getAudit(50)).map(normalizeAudit),
    auditLog,
  );
  const rows = all.filter((e) => filter === "ALL" || e.category === filter);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button variant="outline">
            <Download className="h-4 w-4" />
            {t("exportLog")}
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-1 rounded-lg bg-muted p-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-md px-3 py-1 text-sm font-medium transition-colors",
              filter === f.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.key === "ALL" ? t("filterAll") : t(categoryKey(f.key))}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card">
        {rows.map((e) => {
          const m = meta[e.category];
          const Icon = m.icon;
          const params: Record<string, string> = {};
          if (e.name != null) params.name = e.name;
          if (e.roleEnum != null) params.role = tt(`role${e.roleEnum}`);
          if (e.planKey != null) params.plan = tb(e.planKey);
          if (e.monthIndex != null) params.month = fmt.monthShort(e.monthIndex);
          return (
            <div
              key={e.id}
              className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-0"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${m.color}1a`, color: m.color }}
              >
                <Icon className="h-[18px] w-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug">
                  <span className="font-medium">{e.actor}</span>{" "}
                  <span className="text-muted-foreground">{t(e.descKey, params)}</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t(categoryKey(e.category))}</p>
              </div>
              <div className="hidden items-center gap-3 sm:flex">
                <Avatar name={e.actor} color={e.actorColor} className="h-7 w-7 text-[10px]" />
                <span className="w-28 text-right text-xs text-muted-foreground">
                  {fmt.relativeTime(e.time, NOW)}
                </span>
              </div>
            </div>
          );
        })}
        {rows.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            {t("empty")}
          </p>
        )}
      </div>
    </div>
  );
}
