"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

type ScanEntry = {
  id: string;
  clientType: string;
  createdAt: string;
  qualityMetrics: Record<string, unknown> | null;
  evidenceCount: number;
};

type Props = {
  scanRuns: ScanEntry[];
};

const CLIENT_LABELS: Record<string, string> = {
  AI_GEMINI: "ذكاء اصطناعي (Gemini)",
  ADMIN_MANUAL: "يدوي (مشرف)",
  WEB_TAB_CAPTURE: "التقاط من المتصفح",
  EXTENSION: "إضافة المتصفح",
};

export function ScanHistory({ scanRuns }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (scanRuns.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          سجل المسح ({scanRuns.length.toLocaleString("ar-SA")})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {scanRuns.map((sr) => (
          <div key={sr.id} className="border rounded-lg">
            <Button
              variant="ghost"
              className="w-full justify-between px-4 py-3 h-auto"
              onClick={() => setExpanded(expanded === sr.id ? null : sr.id)}
            >
              <div className="flex items-center gap-3">
                <Badge variant="secondary">
                  {CLIENT_LABELS[sr.clientType] ?? sr.clientType}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(sr.createdAt).toLocaleDateString("ar-SA")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {sr.evidenceCount} دليل
                </span>
              </div>
              {expanded === sr.id ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            {expanded === sr.id && sr.qualityMetrics && (
              <div className="px-4 pb-3 text-sm">
                <div className="rounded-md bg-muted p-3 space-y-1">
                  {Object.entries(sr.qualityMetrics).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground font-mono text-xs">{key}</span>
                      <span className="font-mono text-xs">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
