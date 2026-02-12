import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Film, Tv, Star, AlertTriangle } from "lucide-react";
import { RatingDistribution } from "@/components/admin/rating-distribution";
import { QuickActions } from "@/components/admin/quick-actions";
import { RecentActivity } from "@/components/admin/recent-activity";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    videoCount,
    channelCount,
    ratedCount,
    pendingReviews,
    distributionRaw,
    recentScans,
  ] = await Promise.all([
    prisma.video.count(),
    prisma.channel.count(),
    prisma.ratingAggregate.count(),
    prisma.reviewQueue.count({ where: { status: "PENDING" } }),
    prisma.ratingAggregate.groupBy({
      by: ["ageRating"],
      _count: { _all: true },
    }),
    prisma.scanRun.findMany({
      where: { clientType: "AI_GEMINI" },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        video: { include: { ratingAggregate: true } },
      },
    }),
  ]);

  const unreviewed = videoCount - ratedCount;
  const ratedPct = videoCount > 0 ? ((ratedCount / videoCount) * 100).toFixed(1) : "0";

  const distribution: Record<string, number> = {};
  for (const row of distributionRaw) {
    distribution[row.ageRating] = row._count._all;
  }

  const recentReviews = recentScans.map((sr) => ({
    videoId: sr.video.id,
    videoTitle: sr.video.title,
    ageRating: sr.video.ratingAggregate?.ageRating ?? "G",
    createdAt: sr.createdAt.toISOString(),
  }));

  const stats = [
    {
      label: "فيديوهات",
      value: videoCount,
      icon: Film,
      sub: `${unreviewed.toLocaleString("ar-SA")} غير مراجع`,
    },
    { label: "قنوات", value: channelCount, icon: Tv },
    {
      label: "تم تقييمها",
      value: ratedCount,
      icon: Star,
      sub: `${ratedPct}%`,
    },
    { label: "بانتظار المراجعة", value: pendingReviews, icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">لوحة التحكم</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                {stat.value.toLocaleString("ar-SA")}
              </div>
              {stat.sub && (
                <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">توزيع التقييمات العمرية</CardTitle>
          </CardHeader>
          <CardContent>
            <RatingDistribution distribution={distribution} total={ratedCount} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <QuickActions />
          <RecentActivity reviews={recentReviews} />
        </div>
      </div>
    </div>
  );
}
