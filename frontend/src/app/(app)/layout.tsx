"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
