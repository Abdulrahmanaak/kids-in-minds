import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgeRatingBadge } from "@/components/rating/age-rating-badge";
import { ConfidenceBadge } from "@/components/rating/confidence-badge";
import { AxisScoresPanel } from "@/components/rating/axis-scores-panel";
import { EvidenceList } from "@/components/rating/evidence-list";
import { VideoPlayer } from "@/components/video/video-player";
import { AiReviewButton } from "@/components/admin/ai-review-button";
import { ScanHistory } from "@/components/admin/scan-history";
import { TranscriptViewer } from "@/components/admin/transcript-viewer";
import { FetchTranscriptButton } from "@/components/admin/fetch-transcript-button";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { Volume2, VolumeX, Bot, ExternalLink, FileText } from "lucide-react";
import type { AxisKey } from "@/lib/rating/constants";
import type { EvidenceItem } from "@/types/rating";
import type { TranscriptSegment } from "@/lib/ai-review/transcript";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ videoId: string }>;
};

export default async function ScanDetailPage({ params }: Props) {
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
  const latestAiScan = video.scanRuns.find((s) => s.clientType === "AI_GEMINI");
  const qm = latestAiScan?.qualityMetrics as Record<string, unknown> | null;

  const scores = rating?.scores as Record<AxisKey, number> | undefined;
  const evidence = (rating?.evidencePreview as EvidenceItem[] | undefined) ?? [];
  const summary = typeof qm?.summary === "string" ? qm.summary : null;
  const transcript = Array.isArray(qm?.transcript) ? (qm.transcript as TranscriptSegment[]) : null;
  const transcriptLanguage = typeof qm?.transcriptLanguage === "string" ? qm.transcriptLanguage : null;

  return (
    <div className="space-y-6">
      <AdminBreadcrumb items={[
        { label: "لوحة التحكم", href: "/admin" },
        { label: "تقدم المراجعة", href: "/admin/ai-review" },
        { label: video.title },
      ]} />

      <h1 className="text-2xl font-bold">{video.title}</h1>

      {/* Video Info */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <VideoPlayer youtubeVideoId={video.youtubeVideoId} title={video.title} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">معلومات الفيديو</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {video.description && (
              <p className="text-muted-foreground line-clamp-4">{video.description}</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">القناة: </span>
                {video.channel ? (
                  <Link href="/admin/channels" className="font-medium text-primary hover:underline">
                    {video.channel.nameAr ?? video.channel.name}
                  </Link>
                ) : (
                  <span>-</span>
                )}
              </div>
              <div>
                <span className="text-muted-foreground">YouTube ID: </span>
                <span className="font-mono text-xs">{video.youtubeVideoId}</span>
              </div>
              {video.durationSec && (
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

      {/* Review Metadata */}
      {latestAiScan && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-4 w-4" />
              بيانات المراجعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">الصوت:</span>
                {qm?.hadAudio ? (
                  <Badge variant="secondary" className="gap-1">
                    <Volume2 className="h-3 w-3" />
                    متوفر
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <VolumeX className="h-3 w-3" />
                    غير متوفر
                  </Badge>
                )}
              </div>
              {qm?.audioDurationSec != null && (
                <div>
                  <span className="text-muted-foreground">مدة الصوت: </span>
                  <span>{Number(qm.audioDurationSec).toFixed(0)} ثانية</span>
                </div>
              )}
              {qm?.audioSizeBytes != null && (
                <div>
                  <span className="text-muted-foreground">حجم الصوت: </span>
                  <span>{(Number(qm.audioSizeBytes) / 1024 / 1024).toFixed(1)} MB</span>
                </div>
              )}
              {qm?.model != null && (
                <div>
                  <span className="text-muted-foreground">النموذج: </span>
                  <span className="font-mono text-xs">{String(qm.model)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Summary */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              ملخص الذكاء الاصطناعي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Rating Result */}
      {rating && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <AgeRatingBadge rating={rating.ageRating} size="lg" />
            <ConfidenceBadge confidence={rating.confidence} />
          </div>

          {scores && <AxisScoresPanel scores={scores} />}
          <EvidenceList evidence={evidence} />
        </div>
      )}

      {/* Transcript */}
      {latestAiScan && transcript && transcript.length > 0 && (
        <TranscriptViewer
          segments={transcript}
          evidence={evidence}
          language={transcriptLanguage}
        />
      )}

      {latestAiScan && !transcript && (
        <Card>
          <CardContent className="py-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">لا يتوفر نص تفريغي لهذا الفيديو</p>
            <FetchTranscriptButton videoId={video.id} />
          </CardContent>
        </Card>
      )}

      {!rating && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            لم تتم مراجعة هذا الفيديو بعد
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <AiReviewButton youtubeVideoId={video.youtubeVideoId} label="إعادة المراجعة بالذكاء الاصطناعي" />
        <Button variant="outline" asChild>
          <Link href={`/admin/videos/${video.id}`}>
            صفحة الفيديو
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/admin/ratings/${video.youtubeVideoId}`}>
            تقييم يدوي
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
