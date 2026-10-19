import type { Metadata } from "next";
import { RoadmapView } from "@/components/roadmap/roadmap-view";
import { ar } from "@/lib/i18n/ar";

export const metadata: Metadata = { title: ar["nav.roadmap"] };

export default function RoadmapPage() {
  return <RoadmapView />;
}
