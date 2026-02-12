import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AXIS_LABELS, type AxisKey } from "@/lib/rating/constants";
import type { EvidenceItem } from "@/types/rating";

function formatTimestamp(ms: number | null): string {
  if (ms === null) return "--:--";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

type Props = {
  evidence: EvidenceItem[];
};

export function EvidenceList({ evidence }: Props) {
  if (evidence.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">الأدلة</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {evidence.map((item, i) => (
            <li key={i} className="text-sm border-b last:border-0 pb-3 last:pb-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-primary">
                  {AXIS_LABELS[item.axisKey as AxisKey]?.ar ?? item.axisKey}
                </span>
                {(item.startMs !== null || item.endMs !== null) && (
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatTimestamp(item.startMs)} - {formatTimestamp(item.endMs)}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground">{item.note}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
