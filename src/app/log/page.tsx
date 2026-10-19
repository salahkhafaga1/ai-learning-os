import type { Metadata } from "next";
import { LogView } from "@/components/log/log-view";
import { PageHeader } from "@/components/ui/page-header";
import { ar } from "@/lib/i18n/ar";

export const metadata: Metadata = { title: ar["nav.log"] };

export default function LogPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={ar["log.title"]} subtitle={ar["log.subtitle"]} />
      <LogView />
    </div>
  );
}
