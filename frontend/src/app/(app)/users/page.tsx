"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAppFormat } from "@/i18n/use-app-format";
import { teamMembers, NOW, type Role, type UserStatus } from "@/lib/data";
import {
  hasSession,
  getUsers,
  inviteUser,
  updateUser,
  deleteUser,
  type ApiUser,
  type ApiRole,
} from "@/lib/api";

const NOW_ISO = new Date(NOW).toISOString();

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

const ROLE_OPTIONS: ApiRole[] = ["ADMIN", "MANAGER", "USER"];

// Map the static team data to the live ApiUser shape so the demo (no session)
// renders identically to the wired-up version. Computed once at module scope.
const DEMO_USERS: ApiUser[] = teamMembers.map((m) => ({
  id: m.id,
  organizationId: "",
  name: m.name,
  email: m.email,
  role: m.role,
  status: m.status,
  emailVerified: true,
  title: null,
  avatarColor: m.avatarColor,
  lastActiveAt: m.lastActive,
  createdAt: m.createdAt,
}));

export default function UsersPage() {
  const t = useTranslations("users");
  const tt = useTranslations("team");
  const fmt = useAppFormat();

  const live = hasSession();

  const [users, setUsers] = useState<ApiUser[]>(DEMO_USERS);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"ALL" | Role>("ALL");

  // Invite modal state.
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<ApiRole>("USER");
  const [inviteTitle, setInviteTitle] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteErr, setInviteErr] = useState(false);

  // Which row's action menu is open (only one at a time).
  const [menuId, setMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (live) getUsers().then(setUsers).catch(() => {});
  }, [live]);

  // Close the open row menu on any outside click.
  useEffect(() => {
    if (!menuId) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuId(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuId]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (role !== "ALL" && u.role !== role) return false;
      if (!q) return true;
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });
  }, [users, query, role]);

  function resetInvite() {
    setInviteName("");
    setInviteEmail("");
    setInviteRole("USER");
    setInviteTitle("");
    setInviteErr(false);
  }

  function closeInvite() {
    setInviteOpen(false);
    setInviting(false);
    resetInvite();
  }

  async function submitInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteErr(false);
    try {
      const created = await inviteUser({ name: inviteName, email: inviteEmail, role: inviteRole });
      setUsers((u) => [created, ...u]);
      closeInvite();
    } catch {
      setInviteErr(true);
      setInviting(false);
    }
  }

  async function changeRole(u: ApiUser, nextRole: ApiRole) {
    setMenuId(null);
    try {
      const updated = await updateUser(u.id, { role: nextRole });
      setUsers((list) => list.map((x) => (x.id === u.id ? updated : x)));
    } catch {
      /* keep UI as-is on failure */
    }
  }

  async function toggleStatus(u: ApiUser) {
    setMenuId(null);
    const status = u.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    try {
      const updated = await updateUser(u.id, { status });
      setUsers((list) => list.map((x) => (x.id === u.id ? updated : x)));
    } catch {
      /* keep UI as-is on failure */
    }
  }

  async function removeUser(u: ApiUser) {
    setMenuId(null);
    if (!window.confirm(t("removeConfirm", { name: u.name }))) return;
    try {
      await deleteUser(u.id);
      setUsers((list) => list.filter((x) => x.id !== u.id));
    } catch {
      /* keep UI as-is on failure */
    }
  }

  const makeRoleLabel: Record<ApiRole, string> = {
    ADMIN: t("makeAdmin"),
    MANAGER: t("makeManager"),
    USER: t("makeMember"),
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button size="md" disabled={!live} onClick={() => setInviteOpen(true)}>
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
                      <Avatar name={u.name} color={u.avatarColor ?? "#6366f1"} className="h-9 w-9" />
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
                    {u.status === "INVITED"
                      ? t("pending")
                      : fmt.relativeTime(u.lastActiveAt ?? NOW_ISO, NOW)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="relative inline-block text-left">
                      <button
                        aria-label={t("actions")}
                        onClick={() => setMenuId((id) => (id === u.id ? null : u.id))}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {live && menuId === u.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-popover py-1 text-sm shadow-lg"
                        >
                          {ROLE_OPTIONS.filter((r) => r !== u.role).map((r) => (
                            <button
                              key={r}
                              onClick={() => changeRole(u, r)}
                              className="block w-full px-3 py-1.5 text-left text-foreground hover:bg-muted"
                            >
                              {makeRoleLabel[r]}
                            </button>
                          ))}
                          <button
                            onClick={() => toggleStatus(u)}
                            className="block w-full px-3 py-1.5 text-left text-foreground hover:bg-muted"
                          >
                            {u.status === "SUSPENDED" ? t("activate") : t("suspend")}
                          </button>
                          <div className="my-1 border-t border-border" />
                          <button
                            onClick={() => removeUser(u)}
                            className="block w-full px-3 py-1.5 text-left text-danger hover:bg-muted"
                          >
                            {t("remove")}
                          </button>
                        </div>
                      )}
                    </div>
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

      {/* Invite modal */}
      {live && inviteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeInvite();
          }}
        >
          <form
            onSubmit={submitInvite}
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold tracking-tight">{t("inviteTitle")}</h2>

            <div className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="invite-name">
                  {t("inviteName")}
                </label>
                <Input
                  id="invite-name"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="invite-email">
                  {t("inviteEmail")}
                </label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="invite-role">
                  {t("inviteRole")}
                </label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as ApiRole)}
                  className="flex h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground shadow-sm transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {tt(`role${r}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="invite-title">
                  {t("inviteTitle")}
                </label>
                <Input
                  id="invite-title"
                  value={inviteTitle}
                  onChange={(e) => setInviteTitle(e.target.value)}
                />
              </div>

              {inviteErr && <p className="text-sm text-danger">{t("inviteError")}</p>}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeInvite} disabled={inviting}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={inviting}>
                {inviting ? t("inviteSending") : t("inviteSend")}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
