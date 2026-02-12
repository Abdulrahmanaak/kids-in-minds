"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText } from "lucide-react";
import { AXIS_LABELS, AXIS_COLORS, type AxisKey } from "@/lib/rating/constants";
import type { TranscriptSegment } from "@/lib/ai-review/transcript";
import type { EvidenceItem } from "@/types/rating";

type Props = {
  segments: TranscriptSegment[];
  evidence: EvidenceItem[];
  language: string | null;
};

const TOLERANCE_MS = 3000;

function formatTimestamp(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

type SegmentMatch = {
  segment: TranscriptSegment;
  matchedEvidence: EvidenceItem[];
  matchedAxes: AxisKey[];
};

export function TranscriptViewer({ segments, evidence, language }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [enabledAxes, setEnabledAxes] = useState<Set<AxisKey>>(() => {
    const axes = new Set<AxisKey>();
    for (const e of evidence) {
      axes.add(e.axisKey);
    }
    return axes;
  });

  // Precompute matches for each segment
  const segmentMatches = useMemo<SegmentMatch[]>(() => {
    return segments.map((seg) => {
      const segStart = seg.offset - TOLERANCE_MS;
      const segEnd = seg.offset + seg.duration + TOLERANCE_MS;

      const matched = evidence.filter((e) => {
        if (e.startMs == null) return false;
        return e.startMs >= segStart && e.startMs <= segEnd;
      });

      const axes = [...new Set(matched.map((e) => e.axisKey))];
      return { segment: seg, matchedEvidence: matched, matchedAxes: axes };
    });
  }, [segments, evidence]);

  // All axes that have at least one evidence match
  const activeAxes = useMemo(() => {
    const axes = new Set<AxisKey>();
    for (const m of segmentMatches) {
      for (const a of m.matchedAxes) axes.add(a);
    }
    return axes;
  }, [segmentMatches]);

  function toggleAxis(axis: AxisKey) {
    setEnabledAxes((prev) => {
      const next = new Set(prev);
      if (next.has(axis)) next.delete(axis);
      else next.add(axis);
      return next;
    });
  }

  const selectedMatch = selectedIndex !== null ? segmentMatches[selectedIndex] : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ScrollText className="h-4 w-4" />
          النص التفريغي
          {language && (
            <Badge variant="outline" className="text-xs font-normal">
              {language === "ar" ? "عربي" : language}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground font-normal">
            ({segments.length} مقطع)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Axis filter toggles */}
        {activeAxes.size > 0 && (
          <div className="flex flex-wrap gap-2">
            {[...activeAxes].map((axis) => {
              const colors = AXIS_COLORS[axis];
              const enabled = enabledAxes.has(axis);
              return (
                <button
                  key={axis}
                  onClick={() => toggleAxis(axis)}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs border transition-opacity ${
                    enabled
                      ? `${colors.bg} ${colors.text} ${colors.border}`
                      : "bg-muted text-muted-foreground border-muted opacity-50"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${enabled ? colors.bg : "bg-muted-foreground"}`} style={enabled ? {} : { opacity: 0.4 }} />
                  {AXIS_LABELS[axis].ar}
                </button>
              );
            })}
          </div>
        )}

        {/* Transcript segments */}
        <div className="max-h-[500px] overflow-y-auto space-y-1 rounded-md border p-3">
          {segmentMatches.map((match, idx) => {
            const visibleAxes = match.matchedAxes.filter((a) => enabledAxes.has(a));
            const isHighlighted = visibleAxes.length > 0;
            const primaryAxis = visibleAxes[0];
            const colors = primaryAxis ? AXIS_COLORS[primaryAxis] : null;
            const isSelected = selectedIndex === idx;

            return (
              <div
                key={idx}
                className={`flex gap-2 rounded px-2 py-1 transition-colors ${
                  isHighlighted
                    ? `${colors!.bg} ${colors!.border} border cursor-pointer hover:opacity-80 ${
                        isSelected ? "ring-2 ring-primary" : ""
                      }`
                    : ""
                }`}
                onClick={isHighlighted ? () => setSelectedIndex(isSelected ? null : idx) : undefined}
              >
                <span
                  className="text-xs text-muted-foreground font-mono shrink-0 pt-0.5 w-12 text-start"
                  dir="ltr"
                >
                  {formatTimestamp(match.segment.offset)}
                </span>
                <span className="text-sm leading-relaxed">
                  {match.segment.text}
                  {isHighlighted && (
                    <span className="inline-flex gap-0.5 ms-1">
                      {visibleAxes.map((a) => (
                        <span
                          key={a}
                          className={`inline-block h-1.5 w-1.5 rounded-full ${AXIS_COLORS[a].text.replace("text-", "bg-")}`}
                        />
                      ))}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Detail panel for selected segment */}
        {selectedMatch && selectedMatch.matchedEvidence.length > 0 && (
          <div className="rounded-md border bg-muted/50 p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              الملاحظات عند{" "}
              <span dir="ltr" className="font-mono">
                {formatTimestamp(selectedMatch.segment.offset)}
              </span>
            </p>
            {selectedMatch.matchedEvidence
              .filter((e) => enabledAxes.has(e.axisKey))
              .map((e, i) => {
                const colors = AXIS_COLORS[e.axisKey];
                return (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-xs ${colors.bg} ${colors.text} ${colors.border}`}
                    >
                      {AXIS_LABELS[e.axisKey].ar}
                    </Badge>
                    <span className="text-muted-foreground">{e.note}</span>
                  </div>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
