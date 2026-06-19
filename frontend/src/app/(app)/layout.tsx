"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { isAuthed } from "@/lib/api";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthed()) router.replace("/login");
    else setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

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
