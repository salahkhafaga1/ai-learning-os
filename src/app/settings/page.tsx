import type { Metadata } from "next";
import { SettingsView } from "@/components/settings/settings-view";
import { PageHeader } from "@/components/ui/page-header";
import { ar } from "@/lib/i18n/ar";

export const metadata: Metadata = { title: ar["nav.settings"] };

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={ar["settings.title"]} />
      <SettingsView />
    </div>
  );
}
