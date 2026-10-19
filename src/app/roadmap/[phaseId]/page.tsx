import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PhaseView } from "@/components/roadmap/phase-view";
import { Skeleton } from "@/components/ui/skeleton";
import { allPhases } from "@/data/phases";
import { ar } from "@/lib/i18n/ar";

export const metadata: Metadata = { title: ar["phase.pageTitle"] };

export function generateStaticParams() {
  return allPhases.map((phase) => ({ phaseId: phase.id }));
}

async function PhaseContent({ params }: PageProps<"/roadmap/[phaseId]">) {
  const { phaseId } = await params;
  const phase = allPhases.find((candidate) => candidate.id === phaseId);

  if (!phase) {
    notFound();
  }

  return <PhaseView phaseId={phaseId} />;
}

export default function PhasePage(props: PageProps<"/roadmap/[phaseId]">) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
      }
    >
      <PhaseContent {...props} />
    </Suspense>
  );
}
