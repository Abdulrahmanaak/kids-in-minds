export const AXIS_KEYS = [
  "profanity",
  "music",
  "mixedGender",
  "sexualInnuendo",
  "drugs",
  "violence",
  "mockingReligion",
  "gambling",
  "sensitiveIdeas",
] as const;

export type AxisKey = (typeof AXIS_KEYS)[number];

export const AXIS_LABELS: Record<AxisKey, { ar: string; en: string }> = {
  profanity: { ar: "ألفاظ نابية / إهانات", en: "Profanity / Insults" },
  music: { ar: "موسيقى", en: "Music" },
  mixedGender: { ar: "اختلاط / عدم احتشام", en: "Mixed-gender / Immodesty" },
  sexualInnuendo: { ar: "إيحاءات جنسية", en: "Sexual Innuendo" },
  drugs: { ar: "مخدرات / تدخين", en: "Drugs / Smoking" },
  violence: { ar: "عنف", en: "Violence" },
  mockingReligion: { ar: "استهزاء بالدين", en: "Mocking Religion" },
  gambling: { ar: "قمار", en: "Gambling" },
  sensitiveIdeas: { ar: "أفكار حساسة", en: "Sensitive Ideas" },
};

export const SCORE_LABELS: Record<number, { ar: string; en: string }> = {
  0: { ar: "لا يوجد", en: "None" },
  1: { ar: "نادر جداً", en: "Very Rare" },
  2: { ar: "نادر", en: "Rare" },
  3: { ar: "محدود", en: "Limited" },
  4: { ar: "محدود+", en: "Limited+" },
  5: { ar: "متوسط", en: "Moderate" },
  6: { ar: "متوسط+", en: "Moderate+" },
  7: { ar: "عالي", en: "High" },
  8: { ar: "عالي+", en: "High+" },
  9: { ar: "شديد", en: "Severe" },
  10: { ar: "مهيمن", en: "Dominant" },
};
