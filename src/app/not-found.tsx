import { SearchX } from "lucide-react";
import Link from "next/link";
import { ar } from "@/lib/i18n/ar";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-edge bg-surface p-10 text-center">
      <SearchX aria-hidden="true" className="size-8 text-muted" />
      <h1 className="text-lg font-semibold text-ink">{ar["notFound.title"]}</h1>
      <p className="max-w-md text-sm text-muted">{ar["notFound.body"]}</p>
      <Link
        href="/"
        className="inline-flex h-10 items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-app transition-colors hover:bg-accent-hover"
      >
        {ar["notFound.cta"]}
      </Link>
    </div>
  );
}
