import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { allWeeks } from "@/data/phases";
import { ar } from "@/lib/i18n/ar";

export const metadata: Metadata = { title: ar["week.pageTitle"] };

export function generateStaticParams() {
  return allWeeks.map((week) => ({ number: String(week.number) }));
}

async function WeekContent({ params }: PageProps<"/week/[number]">) {
  const { number } = await params;
  const weekNumber = Number(number);
  const week = Number.isInteger(weekNumber)
    ? allWeeks.find((candidate) => candidate.number === weekNumber)
    : undefined;

  if (!week) {
    notFound();
  }

  const weekLabel = ar["common.week"].replace("{n}", String(week.number));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={weekLabel} subtitle={week.title} />
    </div>
  );
}

export default function WeekPage(props: PageProps<"/week/[number]">) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
      }
    >
      <WeekContent {...props} />
    </Suspense>
  );
}
