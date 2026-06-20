"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { AuthAside } from "@/components/auth-aside";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { register } from "@/lib/api";

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const [form, setForm] = useState({ name: "", organizationName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorFallback"));
      setLoading(false);
    }
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
          <p className="mt-1 text-sm text-muted-foreground">
            {t("subtitle")}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">{t("name")}</span>
              <Input required value={form.name} onChange={set("name")} placeholder="Alex Morgan" />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">{t("workspace")}</span>
              <Input
                required
                value={form.organizationName}
                onChange={set("organizationName")}
                placeholder="Northwind"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">{t("email")}</span>
              <Input
                type="email"
                required
                value={form.email}
                onChange={set("email")}
                placeholder="you@company.com"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">{t("password")}</span>
              <Input
                type="password"
                required
                value={form.password}
                onChange={set("password")}
                placeholder={t("passwordPlaceholder")}
              />
            </label>

            {error && (
              <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? t("submitLoading") : t("submit")}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("signinPrompt")}{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              {t("signinLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
