import { Badge } from "@/components/ui/badge";
import { AGE_RATING_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Props = {
  rating: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function AgeRatingBadge({ rating, size = "md", className }: Props) {
  const label = AGE_RATING_LABELS[rating];
  if (!label) return null;

  const colorClasses: Record<string, string> = {
    safe: "bg-safe text-safe-foreground hover:bg-safe/90",
    warning: "bg-warning text-warning-foreground hover:bg-warning/90",
    danger: "bg-danger text-danger-foreground hover:bg-danger/90",
  };

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <Badge
      className={cn(
        colorClasses[label.color],
        sizeClasses[size],
        "font-bold border-0",
        className
      )}
    >
      {label.ar}
    </Badge>
  );
}
