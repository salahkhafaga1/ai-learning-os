import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import type { StudySession } from "@/domain/types";
import { useT } from "@/lib/i18n";
import { useAppDispatch } from "@/lib/state/provider";
import { SessionForm } from "./session-form";

export function SessionCard({ session }: { session: StudySession }) {
  const { t } = useT();
  const dispatch = useAppDispatch();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const details = [
    { label: t("log.form.learned"), value: session.learned },
    { label: t("log.form.implemented"), value: session.implemented },
    { label: t("log.form.questions"), value: session.questions },
  ].filter((entry) => entry.value.trim() !== "");

  return (
    <>
      <Card className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-ink">
                {session.topic}
              </span>
              <Badge tone="neutral">{t(`activity.${session.activity}`)}</Badge>
              <span className="text-xs text-muted">
                {t("common.minutes", { minutes: session.minutes })}
              </span>
            </div>
            {details.length > 0 ? (
              <dl className="flex flex-col gap-1.5">
                {details.map((entry) => (
                  <div key={entry.label} className="flex flex-col gap-0.5">
                    <dt className="text-[11px] font-medium text-muted">
                      {entry.label}
                    </dt>
                    <dd className="text-xs leading-6 text-ink-2">
                      {entry.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <IconButton
              icon={Pencil}
              label={t("common.edit")}
              size="sm"
              onClick={() => setEditOpen(true)}
            />
            <IconButton
              icon={Trash2}
              label={t("common.delete")}
              size="sm"
              onClick={() => setDeleteOpen(true)}
            />
          </div>
        </div>
      </Card>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={t("log.edit.title")}
      >
        <SessionForm
          defaultDate={session.date}
          initial={session}
          submitLabel={t("common.save")}
          onCancel={() => setEditOpen(false)}
          onSubmit={(values) => {
            dispatch({
              type: "session/update",
              session: { ...session, ...values },
            });
            setEditOpen(false);
          }}
        />
      </Dialog>

      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={t("log.delete.confirm")}
        actions={
          <>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                dispatch({ type: "session/delete", id: session.id });
                setDeleteOpen(false);
              }}
            >
              {t("common.delete")}
            </Button>
          </>
        }
      >
        <p>
          {session.topic} · {t("common.minutes", { minutes: session.minutes })}
        </p>
      </Dialog>
    </>
  );
}
