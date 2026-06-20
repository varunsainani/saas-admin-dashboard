"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AuthAside } from "@/components/auth-aside";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login, setDemo, isAuthed } from "@/lib/api";

const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL;
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD;

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    if (isAuthed()) router.replace("/dashboard");
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorFallback"));
      setLoading(false);
    }
  }

  async function enterDemo() {
    setDemoLoading(true);
    // Try a real login with the seeded demo account; if the backend is asleep
    // or unreachable, fall back to a client-side demo session.
    try {
      if (DEMO_EMAIL && DEMO_PASSWORD) await login(DEMO_EMAIL, DEMO_PASSWORD);
      else setDemo();
    } catch {
      setDemo();
    }
    router.replace("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      <AuthAside />
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">{t("heading")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

          <Button onClick={enterDemo} disabled={demoLoading || loading} className="mt-6 w-full">
            {demoLoading ? t("demoLoading") : t("demoCta")}
            {!demoLoading && <ArrowRight className="h-4 w-4" />}
          </Button>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("divider")}
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">{t("email")}</span>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">{t("password")}</span>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>

            {error && (
              <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
            )}

            <Button type="submit" variant="outline" disabled={loading || demoLoading} className="w-full">
              {loading ? t("submitLoading") : t("submit")}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("signupPrompt")}{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              {t("signupLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
