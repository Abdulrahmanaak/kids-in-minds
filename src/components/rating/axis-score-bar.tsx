import { cn } from "@/lib/utils";

type Props = {
  label: string;
  score: number;
  className?: string;
};

export function AxisScoreBar({ label, score, className }: Props) {
  const percentage = (score / 10) * 100;

  const barColor =
    score <= 2
      ? "bg-safe"
      : score <= 4
        ? "bg-safe/70"
        : score <= 6
          ? "bg-warning"
          : score <= 8
            ? "bg-danger/70"
            : "bg-danger";

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-mono font-medium">{score}/10</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
