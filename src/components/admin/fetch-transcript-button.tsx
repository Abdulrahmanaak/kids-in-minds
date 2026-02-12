"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScrollText, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  videoId: string;
};

export function FetchTranscriptButton({ videoId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/transcript/${videoId}`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
        router.refresh();
      } else {
        setError(data.error ?? "فشل جلب النص التفريغي");
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
        تم جلب النص
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
        title={error || "جلب النص التفريغي"}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <ScrollText className="h-4 w-4 me-1" />
            جلب النص التفريغي
          </>
        )}
      </Button>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
