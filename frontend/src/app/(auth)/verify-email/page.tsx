"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { verifyEmail, clearVerifyPending } from "@/lib/api";

function VerifyInner() {
  const params = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setError("This verification link is missing its token.");
      return;
    }
    verifyEmail(token)
      .then(() => {
        clearVerifyPending();
        setState("ok");
      })
      .catch((e) => {
        setState("error");
        setError(e instanceof Error ? e.message : "Verification failed.");
      });
  }, [token]);

  return (
    <div className="w-full max-w-sm text-center">
      <div className="mb-8 flex justify-center">
        <Logo />
      </div>

      {state === "loading" && (
        <>
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Verifying your email…</p>
        </>
      )}

      {state === "ok" && (
        <>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-7 w-7 text-success" />
          </div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight">Email verified</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your email address is confirmed.</p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Go to dashboard
          </Link>
        </>
      )}

      {state === "error" && (
        <>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
            <XCircle className="h-7 w-7 text-danger" />
          </div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight">Verification failed</h1>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex h-9 w-full items-center justify-center rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            Back to dashboard
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <VerifyInner />
      </Suspense>
    </div>
  );
}
