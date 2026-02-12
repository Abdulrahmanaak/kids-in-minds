import type { AxisKey } from "@/lib/rating/constants";

export type EvidenceItem = {
  axisKey: AxisKey;
  startMs: number | null;
  endMs: number | null;
  note: string;
};

export type RatingDisplayData = {
  ageRating: string;
  confidence: string;
  scores: Record<AxisKey, number>;
  evidencePreview: EvidenceItem[];
  scansCount: number;
  status: "SCANNED" | "UNSCANNED";
};
