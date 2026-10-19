"use client";

import { useCallback, useEffect, useState } from "react";
import { useT } from "@/lib/i18n";

export function useSavedFlash(): [boolean, () => void] {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!visible) {
      return;
    }
    const timer = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(timer);
  }, [visible]);
  const flash = useCallback(() => setVisible(true), []);
  return [visible, flash];
}

export function SavedHint({ visible }: { visible: boolean }) {
  const { t } = useT();
  if (!visible) {
    return null;
  }
  return (
    <span role="status" className="text-[11px] font-medium text-success">
      {t("common.saved")}
    </span>
  );
}
