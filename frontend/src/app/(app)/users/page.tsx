"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAppFormat } from "@/i18n/use-app-format";
import { teamMembers, NOW, type Role, type UserStatus } from "@/lib/data";

const roleDot: Record<Role, string> = { ADMIN: "#6366f1", MANAGER: "#10b981", USER: "#94a3b8" };
const statusTone: Record<UserStatus, BadgeTone> = {
  ACTIVE: "success",
  INVITED: "warning",
  SUSPENDED: "danger",
};

const FILTERS: { key: "ALL" | Role; labelKey: string }[] = [
  { key: "ALL", labelKey: "filterAll" },
  { key: "ADMIN", labelKey: "filterAdmins" },
  { key: "MANAGER", labelKey: "filterManagers" },
  { key: "USER", labelKey: "filterMembers" },
];

export default function UsersPage() {
  const t = useTranslations("users");
  const tt = useTranslations("team");
  const fmt = useAppFormat();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"ALL" | Role>("ALL");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teamMembers.filter((u) => {
      if (role !== "ALL" && u.role !== role) return false;
      if (!q) return true;
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });
  }, [query, role]);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button size="md">
            <Plus className="h-4 w-4" />
            {t("invite")}
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search")}
              className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setRole(f.key)}
                className={cn(
                  "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                  role === f.key
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(f.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">{t("colUser")}</th>
                <th className="px-5 py-3 font-medium">{t("colRole")}</th>
                <th className="px-5 py-3 font-medium">{t("colStatus")}</th>
                <th className="px-5 py-3 font-medium">{t("colLastActive")}</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-border last:border-0 transition-colors hover:bg-muted/40"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} color={u.avatarColor} className="h-9 w-9" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{u.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: roleDot[u.role] }}
                      />
                      {tt(`role${u.role}`)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={statusTone[u.status]}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {tt(`status${u.status}`)}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {u.status === "INVITED" ? t("pending") : fmt.relativeTime(u.lastActive, NOW)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      aria-label={t("actions")}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    {t("empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
