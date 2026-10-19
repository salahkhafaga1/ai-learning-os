import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { SavedHint, useSavedFlash } from "@/components/ui/saved-flash";
import type { ActivityType, StudySession } from "@/domain/types";
import { useT } from "@/lib/i18n";

const ACTIVITY_TYPES = [
  "reading",
  "coding",
  "debugging",
  "project",
  "review",
] as const satisfies readonly ActivityType[];

export interface SessionFormValues {
  date: string;
  topic: string;
  minutes: number;
  activity: ActivityType;
  learned: string;
  implemented: string;
  questions: string;
}

export interface SessionFormProps {
  defaultDate: string;
  initial?: StudySession;
  submitLabel?: string;
  onCancel?: () => void;
  onSubmit: (values: SessionFormValues) => void;
}

export function SessionForm({
  defaultDate,
  initial,
  submitLabel,
  onCancel,
  onSubmit,
}: SessionFormProps) {
  const { t } = useT();
  const id = useId();
  const adding = initial === undefined;

  const [date, setDate] = useState(initial?.date ?? defaultDate);
  const [topic, setTopic] = useState(initial?.topic ?? "");
  const [minutesText, setMinutesText] = useState(
    initial ? String(initial.minutes) : "",
  );
  const [activity, setActivity] = useState<ActivityType>(
    initial?.activity ?? "reading",
  );
  const [learned, setLearned] = useState(initial?.learned ?? "");
  const [implemented, setImplemented] = useState(initial?.implemented ?? "");
  const [questions, setQuestions] = useState(initial?.questions ?? "");
  const [errors, setErrors] = useState<{
    date?: string;
    topic?: string;
    minutes?: string;
  }>({});
  const [saved, flash] = useSavedFlash();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: typeof errors = {};
    if (date.trim() === "") {
      nextErrors.date = t("log.form.required");
    }
    if (topic.trim() === "") {
      nextErrors.topic = t("log.form.required");
    }
    const minutes = Number(minutesText);
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440) {
      nextErrors.minutes = t("log.form.minutesError");
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit({
      date,
      topic: topic.trim(),
      minutes,
      activity,
      learned: learned.trim(),
      implemented: implemented.trim(),
      questions: questions.trim(),
    });

    if (adding) {
      setTopic("");
      setMinutesText("");
      setLearned("");
      setImplemented("");
      setQuestions("");
      flash();
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${id}-topic`}>{t("log.form.topic")}</Label>
          <Input
            id={`${id}-topic`}
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
          />
          {errors.topic ? (
            <p className="mt-1 text-xs text-danger">{errors.topic}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor={`${id}-date`}>{t("log.form.date")}</Label>
          <Input
            id={`${id}-date`}
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
          {errors.date ? (
            <p className="mt-1 text-xs text-danger">{errors.date}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor={`${id}-minutes`}>{t("log.form.minutes")}</Label>
          <Input
            id={`${id}-minutes`}
            type="number"
            min={1}
            max={1440}
            inputMode="numeric"
            value={minutesText}
            onChange={(event) => setMinutesText(event.target.value)}
          />
          {errors.minutes ? (
            <p className="mt-1 text-xs text-danger">{errors.minutes}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor={`${id}-activity`}>{t("log.form.activity")}</Label>
          <Select
            id={`${id}-activity`}
            value={activity}
            onChange={(event) =>
              setActivity(event.target.value as ActivityType)
            }
          >
            {ACTIVITY_TYPES.map((value) => (
              <option key={value} value={value}>
                {t(`activity.${value}`)}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor={`${id}-learned`}>{t("log.form.learned")}</Label>
        <Textarea
          id={`${id}-learned`}
          rows={2}
          value={learned}
          onChange={(event) => setLearned(event.target.value)}
        />
      </div>
      <div>
        <Label htmlFor={`${id}-implemented`}>{t("log.form.implemented")}</Label>
        <Textarea
          id={`${id}-implemented`}
          rows={2}
          value={implemented}
          onChange={(event) => setImplemented(event.target.value)}
        />
      </div>
      <div>
        <Label htmlFor={`${id}-questions`}>{t("log.form.questions")}</Label>
        <Textarea
          id={`${id}-questions`}
          rows={2}
          value={questions}
          onChange={(event) => setQuestions(event.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit">{submitLabel ?? t("log.form.submit")}</Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        ) : null}
        {adding ? (
          <SavedHint visible={saved} label={t("log.form.success")} />
        ) : null}
      </div>
    </form>
  );
}
