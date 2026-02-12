import type { AgeRating, Confidence } from "@/generated/prisma/client";
import { AXIS_KEYS, type AxisKey } from "./constants";

export type AxisScores = Record<AxisKey, number>;

export function validateScores(scores: Record<string, number>): scores is AxisScores {
  return AXIS_KEYS.every(
    (key) => key in scores && typeof scores[key] === "number" && scores[key] >= 0 && scores[key] <= 10
  );
}

export function computeAgeRating(scores: AxisScores): AgeRating {
  const maxScore = Math.max(...AXIS_KEYS.map((k) => scores[k]));

  // R18: any axis = 10 OR sexualInnuendo >= 9 OR mockingReligion >= 9
  if (maxScore === 10 || scores.sexualInnuendo >= 9 || scores.mockingReligion >= 9) {
    return "R18";
  }

  // R15: any axis = 9
  if (maxScore === 9) {
    return "R15";
  }

  // PG15: any axis 7-8
  if (maxScore >= 7) {
    return "PG15";
  }

  // PG12: any axis 5-6
  if (maxScore >= 5) {
    return "PG12";
  }

  // PG: max axis 3-4
  if (maxScore >= 3) {
    return "PG";
  }

  // G: all axes <= 2
  return "G";
}

export function computeConfidence(scansCount: number, clientType?: string): Confidence {
  if (clientType === "ADMIN_MANUAL") return "HIGH";
  if (clientType === "AI_GEMINI") return "MEDIUM";
  if (scansCount >= 3) return "HIGH";
  if (scansCount >= 1) return "MEDIUM";
  return "LOW";
}

export function passesFilter(
  scores: AxisScores,
  maxAgeRating: AgeRating,
  excludedAxes?: Partial<Record<AxisKey, number>>
): boolean {
  const ageRatingOrder: AgeRating[] = ["G", "PG", "PG12", "PG15", "R15", "R18"];
  const videoRating = computeAgeRating(scores);
  const videoIndex = ageRatingOrder.indexOf(videoRating);
  const maxIndex = ageRatingOrder.indexOf(maxAgeRating);

  if (videoIndex > maxIndex) return false;

  if (excludedAxes) {
    for (const [axis, maxScore] of Object.entries(excludedAxes)) {
      if (scores[axis as AxisKey] > (maxScore ?? 0)) return false;
    }
  }

  return true;
}

export function getDefaultScores(): AxisScores {
  return Object.fromEntries(AXIS_KEYS.map((k) => [k, 0])) as AxisScores;
}
