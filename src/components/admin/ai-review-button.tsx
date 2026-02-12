"use client";

import { useState } from "react";
import { Bot, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  youtubeVideoId: string;
};

export function AiReviewButton({ youtubeVideoId }: Props) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/ai-review/${youtubeVideoId}`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
      } else {
        setError(data.error ?? "فشل التقييم");
      }
    } catch {
      setError("خطأ في الاتصال");
    }
    setLoading(false);
  }

  if (done) {
    return (
      <Button size="sm" variant="outline" disabled className="text-green-600">
        <Check className="h-4 w-4 me-1" />
        تم
      </Button>
    );
  }

  return (
    <div>
      <Button
        size="sm"
        variant="outline"
        onClick={handleClick}
        disabled={loading}
        title={error || "تقييم بالذكاء الاصطناعي"}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Bot className="h-4 w-4 me-1" />
            AI
          </>
        )}
      </Button>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
