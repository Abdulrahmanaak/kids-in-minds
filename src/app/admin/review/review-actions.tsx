"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  itemId: string;
};

export function ReviewActions({ itemId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAction(action: string) {
    setLoading(true);
    await fetch("/api/review", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, action }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2 pt-2">
      <Button
        size="sm"
        onClick={() => handleAction("APPROVED")}
        disabled={loading}
      >
        قبول
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleAction("REJECTED")}
        disabled={loading}
      >
        رفض
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleAction("DISMISSED")}
        disabled={loading}
      >
        تجاهل
      </Button>
    </div>
  );
}
