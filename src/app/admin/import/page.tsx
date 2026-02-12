"use client";

import { useState, useEffect } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BulkAiReviewCard } from "@/components/admin/bulk-ai-review-button";

type Channel = {
  id: string;
  youtubeChannelId: string;
  name: string;
  nameAr: string | null;
  lastImportedAt: string | null;
  _count?: { videos: number };
};

type ImportResult = {
  channelName: string;
  importedCount: number;
  error?: string;
};

export default function AdminImportPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [importing, setImporting] = useState<string | null>(null);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [newChannelId, setNewChannelId] = useState("");
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelNameAr, setNewChannelNameAr] = useState("");
  const [newChannelTag, setNewChannelTag] = useState("");
  const [addingChannel, setAddingChannel] = useState(false);

  useEffect(() => {
    fetchChannels();
  }, []);

  async function fetchChannels() {
    const res = await fetch("/api/channels");
    const data = await res.json();
    if (data.success) setChannels(data.data);
  }

  async function handleImport(channelId: string) {
    setImporting(channelId);
    const res = await fetch("/api/youtube/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelId }),
    });
    const data = await res.json();
    if (data.success) {
      setResults((prev) => [...prev, data.data]);
    } else {
      setResults((prev) => [
        ...prev,
        { channelName: channelId, importedCount: 0, error: data.error },
      ]);
    }
    setImporting(null);
    fetchChannels();
  }

  async function handleImportAll() {
    for (const channel of channels) {
      await handleImport(channel.youtubeChannelId);
    }
  }

  async function handleAddChannel(e: React.FormEvent) {
    e.preventDefault();
    setAddingChannel(true);
    await fetch("/api/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        youtubeChannelId: newChannelId,
        name: newChannelName,
        nameAr: newChannelNameAr || undefined,
        teamTag: newChannelTag || undefined,
      }),
    });
    setNewChannelId("");
    setNewChannelName("");
    setNewChannelNameAr("");
    setNewChannelTag("");
    setAddingChannel(false);
    fetchChannels();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">استيراد الفيديوهات</h1>

      {/* Add channel form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">إضافة قناة جديدة</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddChannel} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="text-xs">معرف القناة</Label>
              <Input
                value={newChannelId}
                onChange={(e) => setNewChannelId(e.target.value)}
                placeholder="UCxxxxxx"
                required
                dir="ltr"
              />
            </div>
            <div>
              <Label className="text-xs">الاسم (إنجليزي)</Label>
              <Input
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="Channel Name"
                required
                dir="ltr"
              />
            </div>
            <div>
              <Label className="text-xs">الاسم (عربي)</Label>
              <Input
                value={newChannelNameAr}
                onChange={(e) => setNewChannelNameAr(e.target.value)}
                placeholder="اسم القناة"
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label className="text-xs">التصنيف</Label>
                <Input
                  value={newChannelTag}
                  onChange={(e) => setNewChannelTag(e.target.value)}
                  placeholder="tag"
                  dir="ltr"
                />
              </div>
              <Button type="submit" disabled={addingChannel}>
                إضافة
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Channels list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">القنوات المتابعة</CardTitle>
          <Button onClick={handleImportAll} disabled={!!importing}>
            <Download className="h-4 w-4 me-1" />
            استيراد الكل
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div>
                  <p className="font-medium">
                    {channel.nameAr ?? channel.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {channel._count?.videos ?? 0} فيديو
                    {channel.lastImportedAt &&
                      ` · آخر استيراد: ${new Date(channel.lastImportedAt).toLocaleDateString("ar-SA")}`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleImport(channel.youtubeChannelId)}
                  disabled={importing === channel.youtubeChannelId}
                >
                  {importing === channel.youtubeChannelId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "استيراد"
                  )}
                </Button>
              </div>
            ))}
            {channels.length === 0 && (
              <p className="text-muted-foreground">لا توجد قنوات. أضف قناة أعلاه.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Review */}
      <BulkAiReviewCard />

      {/* Import results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">نتائج الاستيراد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result, i) => (
                <div key={i} className="text-sm">
                  <span className="font-medium">{result.channelName}:</span>{" "}
                  {result.error ? (
                    <span className="text-destructive">{result.error}</span>
                  ) : (
                    <span className="text-safe">
                      تم استيراد {result.importedCount} فيديو
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
