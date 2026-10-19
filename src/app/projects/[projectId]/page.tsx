import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectDetailView } from "@/components/projects/project-detail-view";
import { Skeleton } from "@/components/ui/skeleton";
import { ar } from "@/lib/i18n/ar";

export const metadata: Metadata = { title: ar["projects.title"] };

async function ProjectContent({ params }: PageProps<"/projects/[projectId]">) {
  const { projectId } = await params;

  return <ProjectDetailView projectId={projectId} />;
}

export default function ProjectDetailPage(
  props: PageProps<"/projects/[projectId]">,
) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40" />
        </div>
      }
    >
      <ProjectContent {...props} />
    </Suspense>
  );
}
