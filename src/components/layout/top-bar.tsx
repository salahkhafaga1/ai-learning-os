"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { IconButton } from "@/components/ui/icon-button";
import { Skeleton } from "@/components/ui/skeleton";
import { roadmap } from "@/data/roadmap";
import { currentWeekNumber, todayISO } from "@/domain/dates";
import { overallTaskProgress } from "@/domain/progress";
import { useT } from "@/lib/i18n";
import { useAppState } from "@/lib/state/provider";

export function TopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { state, hydration } = useAppState();
  const { t } = useT();

  // Gated on hydration: `new Date()` must never evaluate during prerender
  // (Next 16 cacheComponents flags unstable values in client components).
  const summary =
    hydration === "ready"
      ? {
          current: currentWeekNumber(
            todayISO(),
            roadmap.weeks,
            state.settings,
            state.weekDateOverrides,
          ),
          percent: overallTaskProgress(roadmap, state.taskStatus).percent,
        }
      : null;

  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-edge bg-app/90 px-4 py-3 backdrop-blur lg:px-8">
      <IconButton
        className="lg:hidden"
        label={t("aria.openMenu")}
        icon={Menu}
        onClick={onOpenMenu}
      />
      <Link href="/" className="text-sm font-bold text-ink lg:hidden">
        {t("app.name")}
      </Link>
      <div className="ms-auto flex items-center gap-2">
        {summary ? (
          <>
            <Link
              href={`/week/${summary.current}`}
              className="rounded-full border border-edge bg-surface-2 px-3 py-1 text-xs text-ink-2 transition-colors hover:border-accent/60 hover:text-ink"
            >
              {t("common.week", { n: summary.current })}
            </Link>
            <span
              title={t("dashboard.overall")}
              className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
            >
              {t("common.percent", { value: summary.percent })}
            </span>
          </>
        ) : (
          <>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </>
        )}
      </div>
    </header>
  );
}
