"use client";

import { useState } from "react";
import { Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReviewResult = {
  youtubeVideoId: string;
  ageRating: string;
  summary: string;
  hadAudio: boolean;
};

export function BulkAiReviewCard() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ReviewResult[]>([]);
  const [error, setError] = useState("");

  async function handleBulkReview() {
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const res = await fetch("/api/ai-review/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 20 }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.data.results);
      } else {
        setError(data.error);
      }
    } catch {
      setError("خطأ في الاتصال");
    }
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">تقييم بالذكاء الاصطناعي</CardTitle>
        <Button onClick={handleBulkReview} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin me-1" />
          ) : (
            <Bot className="h-4 w-4 me-1" />
          )}
          تقييم غير المقيّمة
        </Button>
      </CardHeader>
      <CardContent>
        {loading && (
          <p className="text-sm text-muted-foreground">
            جاري التقييم... قد يستغرق بعض الوقت.
          </p>
        )}
        {results.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <p className="text-sm font-medium">
              تم تقييم {results.length} فيديو:
            </p>
            {results.map((r) => (
              <div
                key={r.youtubeVideoId}
                className="text-sm flex items-center gap-2"
              >
                <span className="font-mono text-xs">{r.youtubeVideoId}</span>
                <span className="font-medium">{r.ageRating}</span>
                {!r.hadAudio && (
                  <span className="text-xs text-muted-foreground">
                    (بدون صوت)
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && results.length === 0 && !error && (
          <p className="text-sm text-muted-foreground">
            اضغط الزر لتقييم الفيديوهات غير المقيّمة باستخدام Gemini AI (حتى
            ٢٠ فيديو).
          </p>
        )}
      </CardContent>
    </Card>
  );
}
