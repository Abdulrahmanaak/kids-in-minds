import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Film, Tv, Star, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [videoCount, channelCount, ratedCount, pendingReviews] =
    await Promise.all([
      prisma.video.count(),
      prisma.channel.count(),
      prisma.ratingAggregate.count(),
      prisma.reviewQueue.count({ where: { status: "PENDING" } }),
    ]);

  const stats = [
    { label: "فيديوهات", value: videoCount, icon: Film },
    { label: "قنوات", value: channelCount, icon: Tv },
    { label: "تم تقييمها", value: ratedCount, icon: Star },
    { label: "بانتظار المراجعة", value: pendingReviews, icon: AlertTriangle },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">لوحة التحكم</h1>
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
