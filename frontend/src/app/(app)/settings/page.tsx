"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Check } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { currentUser } from "@/lib/data";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

const NOTIFICATIONS = [
  { key: "product", label: "Product updates", desc: "News about features and improvements." },
  { key: "digest", label: "Weekly digest", desc: "A summary of your workspace every Monday." },
  { key: "security", label: "Security alerts", desc: "Sign-ins and security-related events." },
  { key: "marketing", label: "Marketing emails", desc: "Tips, offers, and product announcements." },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    product: true,
    digest: true,
    security: true,
    marketing: false,
  });

  const themes = [
    { key: "light", label: "Light", icon: Sun },
    { key: "dark", label: "Dark", icon: Moon },
  ];

  return (
    <div className="max-w-3xl space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Settings"
        description="Manage your account, appearance, and notification preferences."
      />

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <p className="text-sm text-muted-foreground">Your personal information.</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar name={currentUser.name} color={currentUser.avatarColor} className="h-14 w-14 text-base" />
            <Button variant="outline" size="sm">
              Change avatar
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input defaultValue={currentUser.name} />
            </Field>
            <Field label="Email">
              <Input defaultValue={currentUser.email} type="email" />
            </Field>
            <Field label="Job title">
              <Input defaultValue={currentUser.title} />
            </Field>
            <Field label="Role">
              <Input defaultValue="Admin" disabled />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button>Save changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <p className="text-sm text-muted-foreground">Customize how Vantage looks for you.</p>
        </CardHeader>
        <CardContent>
          <div className="grid max-w-sm grid-cols-2 gap-3">
            {themes.map((t) => {
              const selected = mounted && theme === t.key;
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setTheme(t.key)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors",
                    selected
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:bg-muted",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
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
          <CardTitle>Notifications</CardTitle>
          <p className="text-sm text-muted-foreground">Choose what you want to hear about.</p>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {NOTIFICATIONS.map((n) => (
            <div key={n.key} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium">{n.label}</p>
                <p className="text-sm text-muted-foreground">{n.desc}</p>
              </div>
              <Switch
                checked={!!toggles[n.key]}
                onChange={(v) => setToggles((s) => ({ ...s, [n.key]: v }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
