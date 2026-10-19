"use client";

import { SearchX } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Label, Select } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { allPhases } from "@/data/phases";
import { resources } from "@/data/resources";
import type {
  ResourceKind,
  ResourceStatus,
  ResourceUserState,
} from "@/domain/types";
import { useT } from "@/lib/i18n";
import { useAppState } from "@/lib/state/provider";
import { ResourceCard } from "./resource-card";

const KINDS = [
  "official_docs",
  "course",
  "tutorial",
  "article",
  "book",
  "video",
  "repo",
  "tool",
] as const satisfies readonly ResourceKind[];

const STATUSES = [
  "not_started",
  "in_progress",
  "completed",
] as const satisfies readonly ResourceStatus[];

const DEFAULT_USER_STATE: ResourceUserState = {
  status: "not_started",
  notes: "",
  updatedAt: "",
};

export function ResourcesView() {
  const { state, hydration } = useAppState();
  const { t } = useT();
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [kindFilter, setKindFilter] = useState<ResourceKind | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ResourceStatus | "all">(
    "all",
  );

  if (hydration !== "ready") {
    return (
      <div aria-busy="true" className="flex flex-col gap-4">
        <Skeleton className="h-24" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const query = search.trim().toLowerCase();
  const filtered = resources.filter((resource) => {
    if (phaseFilter !== "all" && !resource.phaseIds.includes(phaseFilter)) {
      return false;
    }
    if (kindFilter !== "all" && resource.kind !== kindFilter) {
      return false;
    }
    const userState = state.resourceStatus[resource.id] ?? DEFAULT_USER_STATE;
    if (statusFilter !== "all" && userState.status !== statusFilter) {
      return false;
    }
    if (query === "") {
      return true;
    }
    return [resource.title, resource.description].some((field) =>
      field.toLowerCase().includes(query),
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-edge bg-surface p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1">
            <Label htmlFor="resources-search">{t("common.search")}</Label>
            <Input
              id="resources-search"
              value={search}
              placeholder={t("resources.search")}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="w-full lg:w-52">
            <Label htmlFor="resources-phase">
              {t("resources.filter.phase")}
            </Label>
            <Select
              id="resources-phase"
              value={phaseFilter}
              onChange={(event) => setPhaseFilter(event.target.value)}
            >
              <option value="all">{t("common.all")}</option>
              {allPhases.map((phase) => (
                <option key={phase.id} value={phase.id}>
                  {phase.title}
                </option>
              ))}
            </Select>
          </div>
          <div className="w-full lg:w-44">
            <Label htmlFor="resources-kind">{t("resources.filter.kind")}</Label>
            <Select
              id="resources-kind"
              value={kindFilter}
              onChange={(event) =>
                setKindFilter(event.target.value as ResourceKind | "all")
              }
            >
              <option value="all">{t("common.all")}</option>
              {KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {t(`resourceKind.${kind}`)}
                </option>
              ))}
            </Select>
          </div>
          <div className="w-full lg:w-44">
            <Label htmlFor="resources-status">
              {t("resources.status")}
            </Label>
            <Select
              id="resources-status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as ResourceStatus | "all")
              }
            >
              <option value="all">{t("common.all")}</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(`resourceStatus.${status}`)}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <p className="text-xs text-muted">
          {t("common.progress", {
            done: filtered.length,
            total: resources.length,
          })}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={SearchX} title={t("resources.empty")} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              userState={
                state.resourceStatus[resource.id] ?? DEFAULT_USER_STATE
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
