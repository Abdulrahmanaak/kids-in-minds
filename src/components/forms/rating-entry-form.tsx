"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AgeRatingBadge } from "@/components/rating/age-rating-badge";
import { AXIS_KEYS, AXIS_LABELS, SCORE_LABELS, type AxisKey } from "@/lib/rating/constants";
import { computeAgeRating, type AxisScores } from "@/lib/rating/engine";

type EvidenceEntry = {
  axisKey: AxisKey;
  startMs: number | null;
  endMs: number | null;
  note: string;
};

type Props = {
  videoId: string;
  videoTitle: string;
  initialScores?: Record<AxisKey, number>;
  initialEvidence?: EvidenceEntry[];
};

export function RatingEntryForm({
  videoId,
  videoTitle,
  initialScores,
  initialEvidence,
}: Props) {
  const router = useRouter();
  const [scores, setScores] = useState<Record<AxisKey, number>>(
    initialScores ??
      (Object.fromEntries(AXIS_KEYS.map((k) => [k, 0])) as Record<AxisKey, number>)
  );
  const [evidence, setEvidence] = useState<EvidenceEntry[]>(initialEvidence ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const ageRating = computeAgeRating(scores as AxisScores);

  function updateScore(key: AxisKey, value: number) {
    setScores((prev) => ({ ...prev, [key]: value }));
  }

  function addEvidence() {
    setEvidence((prev) => [
      ...prev,
      { axisKey: AXIS_KEYS[0], startMs: null, endMs: null, note: "" },
    ]);
  }

  function removeEvidence(index: number) {
    setEvidence((prev) => prev.filter((_, i) => i !== index));
  }

  function updateEvidence(index: number, field: keyof EvidenceEntry, value: unknown) {
    setEvidence((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const validEvidence = evidence.filter((e) => e.note.trim());

    const res = await fetch(`/api/ratings/${videoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scores, evidence: validEvidence }),
    });

    const data = await res.json();
    if (!data.success) {
      setError(data.error ?? "حدث خطأ");
      setSaving(false);
      return;
    }

    router.push(`/video/${videoId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">تقييم: {videoTitle}</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">التصنيف المحسوب:</span>
          <AgeRatingBadge rating={ageRating} size="lg" />
        </div>
      </div>

      {/* Axis sliders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">درجات المحاور</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {AXIS_KEYS.map((key) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <Label>{AXIS_LABELS[key].ar}</Label>
                <span className="font-mono font-medium">
                  {scores[key]} - {SCORE_LABELS[scores[key]]?.ar ?? ""}
                </span>
              </div>
              <Slider
                value={[scores[key]]}
                onValueChange={([v]) => updateScore(key, v)}
                min={0}
                max={10}
                step={1}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Evidence */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">الأدلة (اختياري)</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addEvidence}>
            إضافة دليل
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {evidence.length === 0 && (
            <p className="text-sm text-muted-foreground">
              لم تتم إضافة أدلة بعد.
            </p>
          )}
          {evidence.map((item, i) => (
            <div key={i} className="space-y-3 p-3 border rounded-md">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label className="text-xs">المحور</Label>
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={item.axisKey}
                    onChange={(e) =>
                      updateEvidence(i, "axisKey", e.target.value)
                    }
                  >
                    {AXIS_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {AXIS_LABELS[k].ar}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">من (ثانية)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={item.startMs !== null ? item.startMs / 1000 : ""}
                    onChange={(e) =>
                      updateEvidence(
                        i,
                        "startMs",
                        e.target.value ? Number(e.target.value) * 1000 : null
                      )
                    }
                    className="w-24"
                    dir="ltr"
                  />
                </div>
                <div>
                  <Label className="text-xs">إلى (ثانية)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={item.endMs !== null ? item.endMs / 1000 : ""}
                    onChange={(e) =>
                      updateEvidence(
                        i,
                        "endMs",
                        e.target.value ? Number(e.target.value) * 1000 : null
                      )
                    }
                    className="w-24"
                    dir="ltr"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">ملاحظة</Label>
                <Textarea
                  value={item.note}
                  onChange={(e) => updateEvidence(i, "note", e.target.value)}
                  rows={2}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => removeEvidence(i)}
              >
                حذف
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? "جارٍ الحفظ..." : "حفظ التقييم"}
      </Button>
    </form>
  );
}
