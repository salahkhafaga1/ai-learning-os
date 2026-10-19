"use client";

import { useEffect, useState } from "react";
import { todayISO } from "@/domain/dates";

/**
 * Returns today's ISO date once mounted on the client, or null during the
 * server render / first paint. `new Date()` must never evaluate while
 * prerendering (Next 16 cacheComponents flags unstable values), so the value
 * is published from a deferred effect instead of during render.
 */
export function useTodayISO(): string | null {
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setToday(todayISO());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return today;
}
