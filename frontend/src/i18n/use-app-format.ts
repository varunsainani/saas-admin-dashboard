"use client";

import { useFormatter } from "next-intl";

// Locale-aware formatting bound to the active locale. Currency stays USD; the
// locale controls symbol placement, grouping, and decimal separators.
export function useAppFormat() {
  const f = useFormatter();
  return {
    currency: (dollars: number) =>
      f.number(dollars, { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
    compactCurrency: (dollars: number) =>
      f.number(dollars, {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 1,
      }),
    number: (n: number) => f.number(n),
    percent: (n: number, sign = false) =>
      f.number(n / 100, {
        style: "percent",
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
        signDisplay: sign ? "exceptZero" : "auto",
      }),
    relativeTime: (iso: string, now: number) => f.relativeTime(new Date(iso), now),
    monthShort: (monthIndex: number) =>
      f.dateTime(new Date(Date.UTC(2025, monthIndex, 1)), { month: "short", timeZone: "UTC" }),
    date: (iso: string) =>
      f.dateTime(new Date(iso), { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }),
  };
}
