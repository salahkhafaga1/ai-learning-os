"use client";

import { SidebarNav } from "./sidebar-nav";
import { useT } from "@/lib/i18n";

export interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const { t } = useT();

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label={t("aria.closeMenu")}
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("aria.mainNav")}
        className="absolute inset-y-0 start-0 w-72 max-w-[85vw] overflow-y-auto bg-app shadow-xl"
      >
        <SidebarNav className="h-full w-full border-e-0" onNavigate={onClose} />
      </div>
    </div>
  );
}
