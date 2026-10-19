import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { ar } from "@/lib/i18n/ar";

export const metadata: Metadata = { title: ar["dashboard.title"] };

export default function HomePage() {
  return <DashboardView />;
}
