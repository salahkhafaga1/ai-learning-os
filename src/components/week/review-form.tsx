import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Label, Textarea } from "@/components/ui/field";
import { SavedHint, useSavedFlash } from "@/components/ui/saved-flash";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { WeekReview } from "@/domain/types";
import { useT } from "@/lib/i18n";
import { useAppDispatch } from "@/lib/state/provider";

type Rating = Exclude<WeekReview["rating"], null>;

const RATING_OPTIONS = ["1", "2", "3", "4", "5"].map((value) => ({
  value,
  label: value,
}));

function formatUpdatedAt(iso: string): string {
  return `\u2066${iso.slice(0, 16).replace("T", " ")}\u2069`;
}

export interface ReviewFormProps {
  weekNumber: number;
  initialReview?: WeekReview;
}

export function ReviewForm({ weekNumber, initialReview }: ReviewFormProps) {
  const { t } = useT();
  const dispatch = useAppDispatch();
  const [whatWentWell, setWhatWentWell] = useState(
    initialReview?.whatWentWell ?? "",
  );
  const [whatWasHard, setWhatWasHard] = useState(
    initialReview?.whatWasHard ?? "",
  );
  const [adjustments, setAdjustments] = useState(
    initialReview?.adjustments ?? "",
  );
  const [rating, setRating] = useState<WeekReview["rating"]>(
    initialReview?.rating ?? null,
  );
  const [saved, flash] = useSavedFlash();

  const save = () => {
    dispatch({
      type: "week/saveReview",
      weekNumber,
      review: {
        whatWentWell,
        whatWasHard,
        adjustments,
        rating,
        updatedAt: new Date().toISOString(),
      },
    });
    flash();
  };

  return (
    <Card>
      <CardHeader title={t("week.review.title")} />
      <div className="flex flex-col gap-4 p-5">
        <div>
          <Label htmlFor={`review-well-${weekNumber}`}>
            {t("week.review.whatWentWell")}
          </Label>
          <Textarea
            id={`review-well-${weekNumber}`}
            value={whatWentWell}
            rows={3}
            onChange={(event) => setWhatWentWell(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`review-hard-${weekNumber}`}>
            {t("week.review.whatWasHard")}
          </Label>
          <Textarea
            id={`review-hard-${weekNumber}`}
            value={whatWasHard}
            rows={3}
            onChange={(event) => setWhatWasHard(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`review-adjust-${weekNumber}`}>
            {t("week.review.adjustments")}
          </Label>
          <Textarea
            id={`review-adjust-${weekNumber}`}
            value={adjustments}
            rows={3}
            onChange={(event) => setAdjustments(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-ink-2">
            {t("week.review.rating")}
          </span>
          <SegmentedControl
            options={RATING_OPTIONS}
            value={rating === null ? "" : String(rating)}
            onChange={(value) => setRating(Number(value) as Rating)}
            label={t("week.review.rating")}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={save}>{t("week.review.save")}</Button>
          <SavedHint visible={saved} />
          {initialReview ? (
            <span className="text-xs text-muted">
              {t("common.updatedAt", {
                date: formatUpdatedAt(initialReview.updatedAt),
              })}
            </span>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
