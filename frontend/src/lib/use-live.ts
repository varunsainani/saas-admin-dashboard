"use client";

import { useEffect, useState } from "react";
import { hasSession } from "./api";

// Fetches live workspace data when a real session exists; otherwise (the public
// demo, or if the backend is unreachable) it returns the provided sample data.
// Read-only pages use this; pages that mutate manage their own state.
export function useLive<T>(fetcher: () => Promise<T>, demo: T) {
  const [data, setData] = useState<T>(demo);
  const [loading, setLoading] = useState<boolean>(hasSession());

  useEffect(() => {
    let active = true;
    if (!hasSession()) {
      setData(demo);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetcher()
      .then((d) => active && setData(d))
      .catch(() => active && setData(demo))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // Run once on mount; fetcher/demo are stable per page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading };
}
