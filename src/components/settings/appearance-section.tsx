"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { LangPref, ThemePref } from "@/domain/types";
import { useT } from "@/lib/i18n";
import { useAppDispatch, useAppState } from "@/lib/state/provider";

const THEMES = ["dark", "light", "system"] as const satisfies readonly ThemePref[];
const LANGUAGES = ["ar", "en"] as const satisfies readonly LangPref[];

export function AppearanceSection() {
  const { t } = useT();
  const { state } = useAppState();
  const dispatch = useAppDispatch();

  return (
    <Card>
      <CardHeader title={t("settings.appearance")} />
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-2">
            {t("settings.theme")}
          </span>
          <SegmentedControl
            options={THEMES.map((theme) => ({
              value: theme,
              label: t(`settings.theme.${theme}`),
            }))}
            value={state.settings.theme}
            onChange={(theme) =>
              dispatch({ type: "settings/patch", patch: { theme } })
            }
            label={t("settings.theme")}
            className="flex-wrap"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-2">
            {t("settings.language")}
          </span>
          <SegmentedControl
            options={LANGUAGES.map((language) => ({
              value: language,
              label: t(`settings.language.${language}`),
            }))}
            value={state.settings.language}
            onChange={(language) =>
              dispatch({ type: "settings/patch", patch: { language } })
            }
            label={t("settings.language")}
            className="flex-wrap"
          />
        </div>
      </div>
    </Card>
  );
}
