import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewProgressBar } from "@/components/admin/review-progress-bar";
import { RatingDistribution } from "@/components/admin/rating-distribution";
import { ChannelReviewTable } from "@/components/admin/channel-review-table";
import { ReviewLog } from "@/components/admin/review-log";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { Button } from "@/components/ui/button";
import { Bot, Clock, Volume2, FileDown } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AiReviewPage() {
  const [
    totalVideos,
    reviewedCount,
    distributionRaw,
    channelsWithCounts,
    scanRuns,
  ] = await Promise.all([
    prisma.video.count(),
    prisma.ratingAggregate.count(),
    prisma.ratingAggregate.groupBy({
      by: ["ageRating"],
      _count: { _all: true },
    }),
    prisma.channel.findMany({
      select: {
        id: true,
        name: true,
        nameAr: true,
        _count: { select: { videos: true } },
        videos: {
          where: { ratingAggregate: { isNot: null } },
          select: { id: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.scanRun.findMany({
      where: { clientType: "AI_GEMINI" },
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        video: {
          include: { channel: true, ratingAggregate: true },
        },
        evidence: true,
      },
    }),
  ]);

  const pending = totalVideos - reviewedCount;

  // Count how many reviewed videos had audio
  const audioCount = scanRuns.filter((s) => {
    const qm = s.qualityMetrics as Record<string, unknown> | null;
    return qm?.hadAudio === true;
  }).length;

  // Build distribution map
  const distribution: Record<string, number> = {};
  for (const row of distributionRaw) {
    distribution[row.ageRating] = row._count._all;
  }

  // Build channel rows
  const channelRows = channelsWithCounts.map((ch) => ({
    id: ch.id,
    name: ch.name,
    nameAr: ch.nameAr,
    totalVideos: ch._count.videos,
    reviewedVideos: ch.videos.length,
  }));

  // Build review log entries
  const logEntries = scanRuns.map((sr) => {
    const qm = sr.qualityMetrics as Record<string, unknown> | null;
    return {
      id: sr.id,
      videoId: sr.video.id,
      videoTitle: sr.video.title,
      videoYoutubeId: sr.video.youtubeVideoId,
      channelName: sr.video.channel?.nameAr ?? sr.video.channel?.name ?? "-",
      ageRating: sr.video.ratingAggregate?.ageRating ?? "G",
      hadAudio: qm?.hadAudio === true,
      createdAt: sr.createdAt.toISOString(),
    };
  });

  const stats = [
    { label: "تم مراجعتها", value: reviewedCount, icon: Bot },
    { label: "بانتظار المراجعة", value: pending, icon: Clock },
    { label: "بصوت", value: `${audioCount}/${reviewedCount}`, icon: Volume2 },
  ];

  return (
    <div className="space-y-6">
      <AdminBreadcrumb items={[
        { label: "لوحة التحكم", href: "/admin" },
        { label: "تقدم المراجعة" },
      ]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">تقدم مراجعة الذكاء الاصطناعي</h1>
        <Button variant="outline" asChild>
          <a href="/api/admin/export">
            <FileDown className="h-4 w-4 me-2" />
            تصدير CSV
          </a>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ReviewProgressBar reviewed={reviewedCount} total={totalVideos} />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {typeof stat.value === "number"
                  ? stat.value.toLocaleString("ar-SA")
                  : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="distribution" dir="rtl">
        <TabsList>
          <TabsTrigger value="distribution">التوزيع</TabsTrigger>
          <TabsTrigger value="channels">القنوات</TabsTrigger>
          <TabsTrigger value="log">السجل</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">توزيع التقييمات العمرية</CardTitle>
            </CardHeader>
            <CardContent>
              <RatingDistribution distribution={distribution} total={reviewedCount} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">تقدم المراجعة حسب القناة</CardTitle>
            </CardHeader>
            <CardContent>
              <ChannelReviewTable channels={channelRows} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="log">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">سجل المراجعات</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewLog entries={logEntries} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
