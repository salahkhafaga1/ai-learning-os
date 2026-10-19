"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/field";
import { useT } from "@/lib/i18n";

export interface ResetDialogProps {
  onClose: () => void;
  onConfirm: () => void;
}

export function ResetDialog({ onClose, onConfirm }: ResetDialogProps) {
  const { t } = useT();
  const [word, setWord] = useState("");

  const expected = t("settings.reset.word");
  const matches =
    word.trim().toLowerCase() === expected.trim().toLowerCase();

  return (
    <Dialog
      open
      onClose={onClose}
      title={t("settings.reset.title")}
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button variant="danger" disabled={!matches} onClick={onConfirm}>
            {t("settings.reset.confirm")}
          </Button>
        </>
      }
    >
      <p className="text-xs leading-6 text-ink-2">{t("settings.reset.body")}</p>
      <div className="mt-3">
        <Label htmlFor="settings-reset-word">
          {t("settings.reset.typePrompt", { word: expected })}
        </Label>
        <Input
          id="settings-reset-word"
          dir="auto"
          autoComplete="off"
          value={word}
          onChange={(event) => setWord(event.target.value)}
        />
      </div>
    </Dialog>
  );
}
