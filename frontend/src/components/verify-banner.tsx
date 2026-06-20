"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MailWarning } from "lucide-react";
import { Button } from "./ui/button";
import {
  getVerifyPending,
  clearVerifyPending,
  verifyEmail,
  resendVerification,
} from "@/lib/api";

// Shown to a freshly registered (unverified) user. Hidden once verified.
export function VerifyBanner() {
  const t = useTranslations("banner");
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setToken(getVerifyPending());
  }, []);

  if (!token) return null;

  async function verifyNow() {
    setBusy(true);
    setMsg("");
    try {
      await verifyEmail(token!);
      clearVerifyPending();
      setToken(null);
    } catch {
      setMsg(t("verifyFailed"));
      setBusy(false);
    }
  }

  async function resend() {
    setBusy(true);
    setMsg("");
    try {
      const r = await resendVerification();
      if (r.token) setToken(r.token);
      setMsg(r.sent ? t("emailSent") : t("linkRefreshed"));
    } catch {
      setMsg(t("resendFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-warning/30 bg-warning/10 px-4 py-2.5 sm:px-6">
      <MailWarning className="h-4 w-4 shrink-0 text-warning" />
      <span className="text-sm">{t("message")}</span>
      <div className="ml-auto flex items-center gap-2">
        {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
        <Button size="sm" variant="outline" onClick={resend} disabled={busy}>
          {t("resend")}
        </Button>
        <Button size="sm" onClick={verifyNow} disabled={busy}>
          {t("verifyNow")}
        </Button>
      </div>
    </div>
  );
}
