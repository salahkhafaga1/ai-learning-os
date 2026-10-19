"use client";

import { useState, type ReactNode } from "react";
import { useT } from "@/lib/i18n";
import { useAppState } from "@/lib/state/provider";
import { MobileNav } from "./mobile-nav";
import { SidebarNav } from "./sidebar-nav";
import { TopBar } from "./top-bar";

export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { loadWarning, writeFailed } = useAppState();
  const { t } = useT();

  const warningMessage = writeFailed
    ? t("warning.write_failed")
    : loadWarning
      ? t(`warning.${loadWarning}`)
      : null;

  return (
    <div className="flex min-h-dvh">
      <SidebarNav className="sticky top-0 hidden h-dvh shrink-0 lg:flex" />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onOpenMenu={() => setDrawerOpen(true)} />
        {warningMessage ? (
          <div
            role="status"
            className="border-b border-warning/30 bg-warning/10 px-4 py-2 text-xs text-warning lg:px-8"
          >
            {warningMessage}
          </div>
        ) : null}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
      <MobileNav open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
