"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Sun, Moon, Check } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { getMe, type ApiUser } from "@/lib/api";
import { useLive } from "@/lib/use-live";
import { currentUser } from "@/lib/data";

const DEMO_ME = {
  name: currentUser.name,
  email: currentUser.email,
  role: currentUser.role,
  avatarColor: currentUser.avatarColor,
  title: null as string | null,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

const NOTIFICATIONS = [
  { key: "product" },
  { key: "digest" },
  { key: "security" },
  { key: "marketing" },
];

export default function SettingsPage() {
  const t = useTranslations("settings");
  const tt = useTranslations("team");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: me } = useLive<ApiUser | typeof DEMO_ME>(getMe, DEMO_ME);

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    product: true,
    digest: true,
    security: true,
    marketing: false,
  });

  const themes = [
    { key: "light", icon: Sun },
    { key: "dark", icon: Moon },
  ];

  return (
    <div className="max-w-3xl space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={t("title")}
        description={t("description")}
      />

      {/* Profile */}
      <Card key={me.email}>
        <CardHeader>
          <CardTitle>{t("profileTitle")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("profileDesc")}</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar name={me.name} color={me.avatarColor ?? "#6366f1"} className="h-14 w-14 text-base" />
            <Button variant="outline" size="sm">
              {t("changeAvatar")}
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("fieldName")}>
              <Input defaultValue={me.name} />
            </Field>
            <Field label={t("fieldEmail")}>
              <Input defaultValue={me.email} type="email" />
            </Field>
            <Field label={t("fieldTitle")}>
              <Input defaultValue={me.title ?? tt(currentUser.titleKey)} />
            </Field>
            <Field label={t("fieldRole")}>
              <Input defaultValue={tt(`role${me.role}`)} disabled />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button>{t("save")}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>{t("appearanceTitle")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("appearanceDesc")}</p>
        </CardHeader>
        <CardContent>
          <div className="grid max-w-sm grid-cols-2 gap-3">
            {themes.map((th) => {
              const selected = mounted && theme === th.key;
              const Icon = th.icon;
              return (
                <button
                  key={th.key}
                  onClick={() => setTheme(th.key)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors",
                    selected
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:bg-muted",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t(`theme${th.key === "light" ? "Light" : "Dark"}`)}
                  {selected && <Check className="ml-auto h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>{t("notificationsTitle")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("notificationsDesc")}</p>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {NOTIFICATIONS.map((n) => {
            const Cap = n.key.charAt(0).toUpperCase() + n.key.slice(1);
            return (
              <div key={n.key} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{t(`notif${Cap}Label`)}</p>
                  <p className="text-sm text-muted-foreground">{t(`notif${Cap}Desc`)}</p>
                </div>
                <Switch
                  checked={!!toggles[n.key]}
                  onChange={(v) => setToggles((s) => ({ ...s, [n.key]: v }))}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
