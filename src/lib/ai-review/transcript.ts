import { YoutubeTranscript } from "youtube-transcript";

export type TranscriptSegment = {
  text: string;
  offset: number;
  duration: number;
};

export type TranscriptResult = {
  segments: TranscriptSegment[];
  fullText: string;
  language: string | null;
};

export async function fetchTranscript(youtubeVideoId: string): Promise<TranscriptResult> {
  // Try Arabic first
  try {
    const segments = await YoutubeTranscript.fetchTranscript(youtubeVideoId, {
      lang: "ar",
    });
    const mapped = segments.map((s) => ({
      text: s.text,
      offset: Math.round(s.offset),
      duration: Math.round(s.duration),
    }));
    return {
      segments: mapped,
      fullText: mapped.map((s) => s.text).join(" "),
      language: "ar",
    };
  } catch {
    // Fallback: any available language
  }

  try {
    const segments = await YoutubeTranscript.fetchTranscript(youtubeVideoId);
    const mapped = segments.map((s) => ({
      text: s.text,
      offset: Math.round(s.offset),
      duration: Math.round(s.duration),
    }));
    return {
      segments: mapped,
      fullText: mapped.map((s) => s.text).join(" "),
      language: null,
    };
  } catch {
    return { segments: [], fullText: "", language: null };
  }
}
