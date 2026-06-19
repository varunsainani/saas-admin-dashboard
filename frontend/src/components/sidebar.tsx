"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Activity, CreditCard, Settings, LogOut } from "lucide-react";
import { Logo } from "./logo";
import { Avatar } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { currentUser, organization } from "@/lib/data";
import { clearAuth } from "@/lib/api";

const groups = [
  {
    section: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/users", label: "Users", icon: Users },
      { href: "/activity", label: "Activity", icon: Activity },
    ],
  },
  {
    section: "Account",
    items: [
      { href: "/billing", label: "Billing & Plans", icon: CreditCard },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearAuth();
    router.replace("/login");
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-subtle">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>

      <div className="px-3 pb-2">
        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
            {organization.name[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-tight">{organization.name}</p>
            <p className="text-xs text-muted-foreground">{organization.plan} plan</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.section}>
            <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.section}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-1 border-t border-border p-3">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-1.5">
          <Avatar name={currentUser.name} color={currentUser.avatarColor} className="h-8 w-8" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-tight">{currentUser.name}</p>
            <p className="truncate text-xs text-muted-foreground">{currentUser.title}</p>
          </div>
        </div>
        <button
          onClick={logout}
          aria-label="Log out"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
