"use client";

import { ArrowDownToLine, RotateCcw, Upload } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Label, Textarea } from "@/components/ui/field";
import { SavedHint, useSavedFlash } from "@/components/ui/saved-flash";
import type { AppState } from "@/domain/types";
import { useT } from "@/lib/i18n";
import {
  buildExport,
  parseImport,
  type ImportSummary,
  type ParseImportResult,
} from "@/lib/storage/export-import";
import {
  useAppDispatch,
  useAppState,
  useResetProgress,
} from "@/lib/state/provider";
import { ImportDialog } from "./import-dialog";
import { ResetDialog } from "./reset-dialog";

type ParseErrorCode = Extract<ParseImportResult, { ok: false }>["code"];

interface PendingImport {
  state: AppState;
  summary: ImportSummary;
}

export function DataSection() {
  const { t } = useT();
  const { state, storageKind } = useAppState();
  const dispatch = useAppDispatch();
  const reset = useResetProgress();
  const [pasteText, setPasteText] = useState("");
  const [errorCode, setErrorCode] = useState<ParseErrorCode | null>(null);
  const [pending, setPending] = useState<PendingImport | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [saved, flash] = useSavedFlash();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const isMemory = storageKind === "memory";

  const handleExport = () => {
    const { json, fileName } = buildExport(state);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    void file.text().then((content) => {
      setPasteText(content);
      setErrorCode(null);
    });
  };

  const handleReview = () => {
    const result = parseImport(pasteText);
    if (!result.ok) {
      setPending(null);
      setErrorCode(result.code);
      return;
    }
    setErrorCode(null);
    setPending({ state: result.state, summary: result.summary });
  };

  const handleConfirmImport = () => {
    if (!pending) {
      return;
    }
    dispatch({ type: "data/import", state: pending.state });
    setPending(null);
    setPasteText("");
    flash();
  };

  return (
    <Card>
      <CardHeader title={t("settings.data")} />
      <div className="flex flex-col gap-5 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-ink-2">
            {t("settings.storage.label")}
          </span>
          <Badge tone={isMemory ? "warning" : "success"}>
            {t(isMemory ? "settings.storage.memory" : "settings.storage.local")}
          </Badge>
        </div>

        <div className="rounded-xl border border-edge bg-surface-2 p-3">
          <h3 className="text-xs font-semibold text-ink">
            {t("settings.method.title")}
          </h3>
          <p className="mt-1 text-xs leading-6 text-muted">
            {t("settings.method.body")}
          </p>
        </div>

        <div>
          <Button variant="secondary" onClick={handleExport}>
            <ArrowDownToLine aria-hidden="true" className="size-4" />
            {t("settings.export")}
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="settings-import-paste">
            {t("settings.import.paste")}
          </Label>
          <Textarea
            id="settings-import-paste"
            dir="ltr"
            rows={4}
            value={pasteText}
            onChange={(event) => setPasteText(event.target.value)}
            className="font-mono"
          />
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFile}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => fileRef.current?.click()}
            >
              <Upload aria-hidden="true" className="size-4" />
              {t("settings.import")}
            </Button>
            <Button
              onClick={handleReview}
              disabled={pasteText.trim() === ""}
            >
              {t("settings.import.review")}
            </Button>
            <SavedHint visible={saved} label={t("settings.import.success")} />
          </div>
          {errorCode ? (
            <p role="alert" className="text-xs text-danger">
              {t(`settings.import.error.${errorCode}`)}
            </p>
          ) : null}
        </div>

        <div className="border-t border-edge pt-4">
          <Button variant="danger" onClick={() => setResetOpen(true)}>
            <RotateCcw aria-hidden="true" className="size-4" />
            {t("settings.reset.title")}
          </Button>
        </div>
      </div>

      {pending ? (
        <ImportDialog
          summary={pending.summary}
          onCancel={() => setPending(null)}
          onConfirm={handleConfirmImport}
        />
      ) : null}

      {resetOpen ? (
        <ResetDialog
          onClose={() => setResetOpen(false)}
          onConfirm={() => {
            reset();
            setResetOpen(false);
          }}
        />
      ) : null}
    </Card>
  );
}
