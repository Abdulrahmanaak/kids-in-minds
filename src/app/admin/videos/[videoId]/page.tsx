import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AgeRatingBadge } from "@/components/rating/age-rating-badge";
import { ConfidenceBadge } from "@/components/rating/confidence-badge";
import { AxisScoresPanel } from "@/components/rating/axis-scores-panel";
import { EvidenceList } from "@/components/rating/evidence-list";
import { VideoPlayer } from "@/components/video/video-player";
import { AiReviewButton } from "@/components/admin/ai-review-button";
import { ScanHistory } from "@/components/admin/scan-history";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { ExternalLink } from "lucide-react";
import type { AxisKey } from "@/lib/rating/constants";
import type { EvidenceItem } from "@/types/rating";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ videoId: string }>;
};

export default async function AdminVideoDetailPage({ params }: Props) {
  const { videoId } = await params;

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: {
      channel: true,
      ratingAggregate: true,
      scanRuns: {
        orderBy: { createdAt: "desc" },
        include: { evidence: true },
      },
    },
  });

  if (!video) notFound();

  const rating = video.ratingAggregate;
  const scores = rating?.scores as Record<AxisKey, number> | undefined;
  const evidence = (rating?.evidencePreview as EvidenceItem[] | undefined) ?? [];

  return (
    <div className="space-y-6">
      <AdminBreadcrumb items={[
        { label: "لوحة التحكم", href: "/admin" },
        { label: "الفيديوهات", href: "/admin/videos" },
        { label: video.title },
      ]} />

      <h1 className="text-2xl font-bold">{video.title}</h1>

      {/* Video Player + Metadata */}
      <div className="grid gap-6 lg:grid-cols-2">
        <VideoPlayer youtubeVideoId={video.youtubeVideoId} title={video.title} />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">معلومات الفيديو</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {video.description && (
              <p className="text-muted-foreground line-clamp-4">{video.description}</p>
            )}
            <div className="grid grid-cols-2 gap-y-2">
              <div>
                <span className="text-muted-foreground">القناة: </span>
                {video.channel ? (
                  <Link href={`/admin/channels`} className="font-medium text-primary hover:underline">
                    {video.channel.nameAr ?? video.channel.name}
                  </Link>
                ) : (
                  <span>-</span>
                )}
              </div>
              {video.publishedAt && (
                <div>
                  <span className="text-muted-foreground">تاريخ النشر: </span>
                  <span>{new Date(video.publishedAt).toLocaleDateString("ar-SA")}</span>
                </div>
              )}
              {video.durationSec != null && (
                <div>
                  <span className="text-muted-foreground">المدة: </span>
                  <span>
                    {Math.floor(video.durationSec / 60)}:{String(video.durationSec % 60).padStart(2, "0")}
                  </span>
                </div>
              )}
              {video.viewCount != null && (
                <div>
                  <span className="text-muted-foreground">المشاهدات: </span>
                  <span>{video.viewCount.toLocaleString("ar-SA")}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Rating */}
      {rating && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">التقييم الحالي</h2>
            <AgeRatingBadge rating={rating.ageRating} size="lg" />
            <ConfidenceBadge confidence={rating.confidence} />
          </div>
          {scores && <AxisScoresPanel scores={scores} />}
          <EvidenceList evidence={evidence} />
        </div>
      )}

      {!rating && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            لم يتم تقييم هذا الفيديو بعد
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" asChild>
          <Link href={`/admin/ratings/${video.youtubeVideoId}`}>
            تقييم يدوي
          </Link>
        </Button>
        <AiReviewButton youtubeVideoId={video.youtubeVideoId} label="مراجعة بالذكاء الاصطناعي" />
        <Button variant="outline" asChild>
          <Link href={`/admin/ai-review/${video.id}`}>
            عرض تفاصيل المراجعة
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/video/${video.youtubeVideoId}`} target="_blank">
            <ExternalLink className="h-4 w-4 me-1" />
            الصفحة العامة
          </Link>
        </Button>
      </div>

      {/* Scan History */}
      <ScanHistory scanRuns={video.scanRuns.map((sr) => ({
        id: sr.id,
        clientType: sr.clientType,
        createdAt: sr.createdAt.toISOString(),
        qualityMetrics: sr.qualityMetrics as Record<string, unknown> | null,
        evidenceCount: sr.evidence.length,
      }))} />
    </div>
  );
}
