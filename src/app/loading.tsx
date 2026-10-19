import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-4">
      <Skeleton className="h-8 w-56" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["s1", "s2", "s3", "s4"].map((key) => (
          <Skeleton key={key} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
