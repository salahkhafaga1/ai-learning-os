"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useAppState } from "@/lib/state/provider";
import { AppearanceSection } from "./appearance-section";
import { DataSection } from "./data-section";
import { ScheduleSection } from "./schedule-section";

export function SettingsView() {
  const { hydration } = useAppState();

  if (hydration !== "ready") {
    return (
      <div aria-busy="true" className="flex flex-col gap-4">
        <Skeleton className="h-44" />
        <Skeleton className="h-36" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ScheduleSection />
      <AppearanceSection />
      <DataSection />
    </div>
  );
}
