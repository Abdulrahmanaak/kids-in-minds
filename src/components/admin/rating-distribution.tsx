import { AGE_RATING_ORDER, AGE_RATING_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Props = {
  distribution: Record<string, number>;
  total: number;
};

const ratingBarColors: Record<string, string> = {
  G: "bg-safe",
  PG: "bg-safe/80",
  PG12: "bg-warning",
  PG15: "bg-warning/80",
  R15: "bg-danger/80",
  R18: "bg-danger",
};

export function RatingDistribution({ distribution, total }: Props) {
  return (
    <div className="space-y-3">
      {AGE_RATING_ORDER.map((rating) => {
        const count = distribution[rating] ?? 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;
        const label = AGE_RATING_LABELS[rating];

        return (
          <div key={rating} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className={cn("font-medium", label.color === "danger" && "text-danger")}>
                {label.ar}
              </span>
              <span className="font-mono text-muted-foreground">
                {count.toLocaleString("ar-SA")}
                {total > 0 && (
                  <span className="text-xs ms-1">({percentage.toFixed(1)}%)</span>
                )}
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", ratingBarColors[rating])}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
