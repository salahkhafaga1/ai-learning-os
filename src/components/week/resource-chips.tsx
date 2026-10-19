import { ExternalLink } from "@/components/ui/external-link";
import { resourceById } from "@/data/resources";
import type { Resource } from "@/domain/types";

export function ResourceChips({ resourceIds }: { resourceIds: string[] }) {
  const resources = resourceIds
    .map((id) => resourceById[id])
    .filter((resource): resource is Resource => Boolean(resource));

  if (resources.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {resources.map((resource) => (
        <ExternalLink key={resource.id} href={resource.url} className="text-xs">
          {resource.title}
        </ExternalLink>
      ))}
    </div>
  );
}
