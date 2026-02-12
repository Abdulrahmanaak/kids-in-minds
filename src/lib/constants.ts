export const APP_NAME = "أطفالنا أمانة";
export const APP_NAME_EN = "Atfaluna Amanah";

export const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
export const YOUTUBE_DAILY_QUOTA = 10_000;
export const YOUTUBE_IMPORT_QUOTA_BUDGET = 8_000;
export const YOUTUBE_USER_QUOTA_BUDGET = 2_000;

export const ITEMS_PER_PAGE = 20;
export const MAX_IMPORT_VIDEOS_PER_CHANNEL = 100;

export const AGE_RATING_ORDER = ["G", "PG", "PG12", "PG15", "R15", "R18"] as const;

export const AGE_RATING_LABELS: Record<string, { ar: string; en: string; color: string }> = {
  G: { ar: "عام", en: "General", color: "safe" },
  PG: { ar: "إرشاد عائلي", en: "Parental Guidance", color: "safe" },
  PG12: { ar: "+١٢", en: "12+", color: "warning" },
  PG15: { ar: "+١٥", en: "15+", color: "warning" },
  R15: { ar: "مقيد +١٥", en: "Restricted 15+", color: "danger" },
  R18: { ar: "للبالغين", en: "Adults Only", color: "danger" },
};

export const CONFIDENCE_LABELS: Record<string, { ar: string; en: string }> = {
  HIGH: { ar: "ثقة عالية", en: "High Confidence" },
  MEDIUM: { ar: "ثقة متوسطة", en: "Medium Confidence" },
  LOW: { ar: "ثقة منخفضة", en: "Low Confidence" },
};
