"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import { createSeedState } from "@/data/seed";
import type { AppState } from "@/domain/types";
import {
  createLocalStorageRepository,
  isStorageAvailable,
} from "@/lib/storage/local-storage";
import { createMemoryRepository } from "@/lib/storage/memory";
import type { LearningRepository, LoadWarningCode } from "@/lib/storage/types";
import type { Action } from "./actions";
import { reducer } from "./reducer";

interface AppStateContextValue {
  state: AppState;
  hydration: "loading" | "ready";
  loadWarning?: LoadWarningCode;
  writeFailed: boolean;
  storageKind: "local" | "memory" | null;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);
const AppDispatchContext = createContext<Dispatch<Action> | null>(null);
const ResetContext = createContext<(() => void) | null>(null);

function resolveTheme(theme: AppState["settings"]["theme"]): "dark" | "light" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    createSeedState(),
  );
  const [hydration, setHydration] = useState<"loading" | "ready">("loading");
  const [loadWarning, setLoadWarning] = useState<LoadWarningCode | undefined>(
    undefined,
  );
  const [writeFailed, setWriteFailed] = useState(false);
  const [storageKind, setStorageKind] = useState<"local" | "memory" | null>(
    null,
  );
  const repoRef = useRef<LearningRepository | null>(null);

  useEffect(() => {
    let repo: LearningRepository;
    let fallbackWarning: LoadWarningCode | undefined;

    if (isStorageAvailable()) {
      repo = createLocalStorageRepository(window.localStorage);
    } else {
      repo = createMemoryRepository();
      fallbackWarning = "storage_unavailable";
    }

    repoRef.current = repo;
    const result = repo.load();
    dispatch({ type: "data/load", state: result.state });
    const publish = setTimeout(() => {
      setLoadWarning(result.warning ?? fallbackWarning);
      setStorageKind(repo.kind);
      setHydration("ready");
    }, 0);
    return () => clearTimeout(publish);
  }, []);

  useEffect(() => {
    if (hydration !== "ready") {
      return;
    }
    const repo = repoRef.current;
    if (!repo) {
      return;
    }
    const timer = setTimeout(() => {
      const result = repo.save(state);
      setWriteFailed(!result.ok);
    }, 250);
    return () => clearTimeout(timer);
  }, [state, hydration]);

  useEffect(() => {
    if (hydration !== "ready") {
      return;
    }
    const root = document.documentElement;
    const apply = () => {
      root.dataset.theme = resolveTheme(state.settings.theme);
    };
    apply();
    if (state.settings.theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }
  }, [state.settings.theme, hydration]);

  const reset = useCallback(() => {
    repoRef.current?.reset();
    dispatch({ type: "data/reset" });
  }, []);

  const contextValue = useMemo<AppStateContextValue>(
    () => ({ state, hydration, loadWarning, writeFailed, storageKind }),
    [state, hydration, loadWarning, writeFailed, storageKind],
  );

  return (
    <AppStateContext.Provider value={contextValue}>
      <AppDispatchContext.Provider value={dispatch}>
        <ResetContext.Provider value={reset}>
          {children}
        </ResetContext.Provider>
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const value = useContext(AppStateContext);
  if (!value) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return value;
}

export function useAppDispatch(): Dispatch<Action> {
  const value = useContext(AppDispatchContext);
  if (!value) {
    throw new Error("useAppDispatch must be used within AppStateProvider");
  }
  return value;
}

export function useResetProgress(): () => void {
  const value = useContext(ResetContext);
  if (!value) {
    throw new Error("useResetProgress must be used within AppStateProvider");
  }
  return value;
}
