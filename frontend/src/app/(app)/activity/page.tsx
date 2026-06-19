"use client";

import { useState } from "react";
import { Users, CreditCard, ShieldCheck, Settings, Download } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { cn, relativeTime } from "@/lib/utils";
import { auditLog, NOW, type AuditCategory } from "@/lib/data";

const meta: Record<AuditCategory, { label: string; icon: LucideIcon; color: string }> = {
  user: { label: "User", icon: Users, color: "#6366f1" },
  billing: { label: "Billing", icon: CreditCard, color: "#10b981" },
  security: { label: "Security", icon: ShieldCheck, color: "#f59e0b" },
  settings: { label: "Settings", icon: Settings, color: "#94a3b8" },
};

const FILTERS: { key: "ALL" | AuditCategory; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "user", label: "User" },
  { key: "billing", label: "Billing" },
  { key: "security", label: "Security" },
  { key: "settings", label: "Settings" },
];

export default function ActivityPage() {
  const [filter, setFilter] = useState<"ALL" | AuditCategory>("ALL");
  const rows = auditLog.filter((e) => filter === "ALL" || e.category === filter);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Activity"
        description="A complete audit trail of everything happening in your workspace."
        actions={
          <Button variant="outline">
            <Download className="h-4 w-4" />
            Export log
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
            {f.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card">
        {rows.map((e) => {
          const m = meta[e.category];
          const Icon = m.icon;
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
                  <span className="text-muted-foreground">{e.description}</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{m.label}</p>
              </div>
              <div className="hidden items-center gap-3 sm:flex">
                <Avatar name={e.actor} color={e.actorColor} className="h-7 w-7 text-[10px]" />
                <span className="w-28 text-right text-xs text-muted-foreground">
                  {relativeTime(e.time, NOW)}
                </span>
              </div>
            </div>
          );
        })}
        {rows.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            No events in this category.
          </p>
        )}
      </div>
    </div>
  );
}
