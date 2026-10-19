import type { Metadata } from "next";
import { ResourcesView } from "@/components/resources/resources-view";
import { PageHeader } from "@/components/ui/page-header";
import { ar } from "@/lib/i18n/ar";

export const metadata: Metadata = { title: ar["nav.resources"] };

export default function ResourcesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={ar["resources.title"]}
        subtitle={ar["resources.subtitle"]}
      />
      <ResourcesView />
    </div>
  );
}
