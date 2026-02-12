import { AgeRatingBadge } from "./age-rating-badge";
import { ConfidenceBadge } from "./confidence-badge";

type Props = {
  ageRating: string;
  confidence: string;
  scansCount: number;
};

export function RatingSummary({ ageRating, confidence, scansCount }: Props) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <AgeRatingBadge rating={ageRating} size="lg" />
      <ConfidenceBadge confidence={confidence} />
      <span className="text-sm text-muted-foreground">
        ({scansCount} {scansCount === 1 ? "تقييم" : "تقييمات"})
      </span>
    </div>
  );
}
