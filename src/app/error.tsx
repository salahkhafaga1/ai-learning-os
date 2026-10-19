"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

export default function ErrorPage({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const { t } = useT();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-danger/30 bg-surface p-10 text-center">
      <TriangleAlert aria-hidden="true" className="size-8 text-danger" />
      <h1 className="text-lg font-semibold text-ink">
        {t("error.boundary.title")}
      </h1>
      <p className="max-w-md text-sm text-muted">{t("error.boundary.body")}</p>
      <Button onClick={() => retry()}>{t("common.retry")}</Button>
    </div>
  );
}
