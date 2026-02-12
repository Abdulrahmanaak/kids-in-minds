import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AxisScoreBar } from "./axis-score-bar";
import { AXIS_KEYS, AXIS_LABELS, type AxisKey } from "@/lib/rating/constants";

type Props = {
  scores: Record<AxisKey, number>;
};

export function AxisScoresPanel({ scores }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">تفاصيل التقييم</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {AXIS_KEYS.map((key) => (
          <AxisScoreBar
            key={key}
            label={AXIS_LABELS[key].ar}
            score={scores[key] ?? 0}
          />
        ))}
      </CardContent>
    </Card>
  );
}
