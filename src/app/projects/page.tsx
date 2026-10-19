import type { Metadata } from "next";
import { ProjectsView } from "@/components/projects/projects-view";
import { PageHeader } from "@/components/ui/page-header";
import { ar } from "@/lib/i18n/ar";

export const metadata: Metadata = { title: ar["nav.projects"] };

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={ar["projects.title"]} />
      <ProjectsView />
    </div>
  );
}
