import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(cents: number, opts?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    ...opts,
  }).format(cents / 100);
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export function compactNumber(n: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function formatDate(d: string | Date, opts?: Intl.DateTimeFormatOptions) {
  return new Date(d).toLocaleDateString(
    "en-US",
    opts ?? { month: "short", day: "numeric", year: "numeric" },
  );
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Relative time from a reference "now" (passed in so server and client agree).
export function relativeTime(d: string | Date, now: number) {
  const date = new Date(d).getTime();
  const diff = Math.round((date - now) / 1000);
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (abs < 60) return rtf.format(Math.round(diff), "second");
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 2592000) return rtf.format(Math.round(diff / 86400), "day");
  return rtf.format(Math.round(diff / 2592000), "month");
}
