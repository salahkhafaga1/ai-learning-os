"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import type { LangPref } from "@/domain/types";
import { useAppState } from "@/lib/state/provider";
import { ar, type Dict } from "./ar";
import { en } from "./en";

export type { Dict };

const dictionaries: Record<LangPref, Dict> = { ar, en };

interface I18nContextValue {
  t: (key: keyof Dict, params?: Record<string, string | number>) => string;
  lang: LangPref;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const { state } = useAppState();
  const lang = state.settings.language;

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const value = useMemo<I18nContextValue>(() => {
    const dict = dictionaries[lang];
    return {
      lang,
      t: (key, params) => interpolate(dict[key], params),
    };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT(): I18nContextValue {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useT must be used within I18nProvider");
  }
  return value;
}
