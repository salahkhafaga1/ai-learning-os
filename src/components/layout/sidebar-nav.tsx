"use client";

import {
  FolderKanban,
  LayoutDashboard,
  Library,
  Map,
  NotebookPen,
  Settings,
  Target,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/components/ui/cn";
import { useT, type Dict } from "@/lib/i18n";

interface NavItem {
  href: string;
  labelKey: keyof Dict;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/roadmap", labelKey: "nav.roadmap", icon: Map },
  { href: "/log", labelKey: "nav.log", icon: NotebookPen },
  { href: "/skills", labelKey: "nav.skills", icon: Target },
  { href: "/projects", labelKey: "nav.projects", icon: FolderKanban },
  { href: "/resources", labelKey: "nav.resources", icon: Library },
  { href: "/settings", labelKey: "nav.settings", icon: Settings },
];

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) {
    return false;
  }
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItems({
  pathname,
  onNavigate,
}: {
  pathname: string | null;
  onNavigate?: () => void;
}) {
  const { t } = useT();

  return (
    <>
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-accent/10 font-medium text-accent"
                : "text-ink-2 hover:bg-surface-2 hover:text-ink",
            )}
          >
            <item.icon aria-hidden="true" className="size-4 shrink-0" />
            {t(item.labelKey)}
          </Link>
        );
      })}
    </>
  );
}

function NavItemsWithPathname({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return <NavItems pathname={pathname} onNavigate={onNavigate} />;
}

export interface SidebarNavProps {
  className?: string;
  onNavigate?: () => void;
}

export function SidebarNav({ className, onNavigate }: SidebarNavProps) {
  const { t } = useT();

  return (
    <nav
      aria-label={t("aria.mainNav")}
      className={cn(
        "flex w-64 flex-col gap-1 overflow-y-auto border-e border-edge bg-surface p-3",
        className,
      )}
    >
      <Link
        href="/"
        onClick={onNavigate}
        className="mb-3 rounded-xl px-3 py-2 transition-colors hover:bg-surface-2"
      >
        <span className="block text-sm font-bold text-ink">{t("app.name")}</span>
        <span className="block text-[11px] text-muted">{t("app.tagline")}</span>
      </Link>
      <Suspense fallback={<NavItems pathname={null} onNavigate={onNavigate} />}>
        <NavItemsWithPathname onNavigate={onNavigate} />
      </Suspense>
    </nav>
  );
}
