"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Flag, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CATEGORIES = [
  { value: "INACCURATE", label: "التقييم غير دقيق" },
  { value: "MISSING_EVIDENCE", label: "أدلة ناقصة" },
  { value: "WRONG_AGE_RATING", label: "التصنيف العمري خاطئ" },
  { value: "OTHER", label: "أخرى" },
];

export default function ReportPage() {
  const params = useParams();
  const videoId = params.videoId as string;
  const [category, setCategory] = useState("INACCURATE");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, category, message }),
    });

    const data = await res.json();
    if (!data.success) {
      setError(data.error ?? "حدث خطأ");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <CheckCircle className="h-16 w-16 text-safe mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">تم إرسال البلاغ بنجاح!</h1>
        <p className="text-muted-foreground">شكراً لمساعدتك. سنراجع بلاغك قريباً.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            الإبلاغ عن تقييم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>نوع المشكلة</Label>
              <div className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <label
                    key={cat.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat.value}
                      checked={category === cat.value}
                      onChange={(e) => setCategory(e.target.value)}
                      className="accent-primary"
                    />
                    <span className="text-sm">{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">وصف المشكلة</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اشرح المشكلة بالتفصيل..."
                rows={4}
                required
                minLength={10}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جارٍ الإرسال..." : "إرسال البلاغ"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
