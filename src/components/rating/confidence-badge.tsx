import { Badge } from "@/components/ui/badge";
import { CONFIDENCE_LABELS } from "@/lib/constants";

type Props = {
  confidence: string;
  className?: string;
};

export function ConfidenceBadge({ confidence, className }: Props) {
  const label = CONFIDENCE_LABELS[confidence];
  if (!label) return null;

  const variants: Record<string, "default" | "secondary" | "outline"> = {
    HIGH: "default",
    MEDIUM: "secondary",
    LOW: "outline",
  };

  return (
    <Badge variant={variants[confidence] ?? "outline"} className={className}>
      {label.ar}
    </Badge>
  );
}
