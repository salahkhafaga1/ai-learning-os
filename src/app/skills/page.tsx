import type { Metadata } from "next";
import { SkillsView } from "@/components/skills/skills-view";
import { PageHeader } from "@/components/ui/page-header";
import { ar } from "@/lib/i18n/ar";

export const metadata: Metadata = { title: ar["nav.skills"] };

export default function SkillsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={ar["skills.title"]} subtitle={ar["skills.subtitle"]} />
      <SkillsView />
    </div>
  );
}
