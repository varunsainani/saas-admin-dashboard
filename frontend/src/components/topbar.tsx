"use client";

import { usePathname } from "next/navigation";
import { Menu, Search, Bell } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const TITLES: { prefix: string; label: string }[] = [
  { prefix: "/dashboard", label: "Dashboard" },
  { prefix: "/users", label: "Users" },
  { prefix: "/activity", label: "Activity" },
  { prefix: "/billing", label: "Billing & Plans" },
  { prefix: "/settings", label: "Settings" },
];

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const title = TITLES.find((t) => pathname.startsWith(t.prefix))?.label ?? "Vantage";

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open menu"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="text-base font-semibold tracking-tight sm:text-lg">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search…"
            className="h-9 w-56 rounded-md border border-input bg-card pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
