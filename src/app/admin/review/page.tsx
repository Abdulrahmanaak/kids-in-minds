import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReviewActions } from "./review-actions";

export const dynamic = "force-dynamic";

export default async function AdminReviewPage() {
  const items = await prisma.reviewQueue.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      submission: true,
      report: {
        include: { video: { select: { youtubeVideoId: true, title: true } } },
      },
    },
  });

  const pending = items.filter((i: typeof items[number]) => i.status === "PENDING");
  const reviewed = items.filter((i: typeof items[number]) => i.status !== "PENDING");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        قائمة المراجعة ({pending.length} بانتظار)
      </h1>

      <div className="space-y-4">
        {pending.length === 0 && (
          <p className="text-muted-foreground">لا توجد عناصر بانتظار المراجعة.</p>
        )}
        {pending.map((item: typeof pending[number]) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {item.itemType === "SUBMISSION" ? "طلب تقييم" : "بلاغ"}
                </CardTitle>
                <Badge variant="outline">{item.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {item.submission && (
                <>
                  <p className="text-sm">
                    <span className="font-medium">الرابط:</span>{" "}
                    <a
                      href={item.submission.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                      dir="ltr"
                    >
                      {item.submission.videoUrl}
                    </a>
                  </p>
                  {item.submission.note && (
                    <p className="text-sm text-muted-foreground">
                      {item.submission.note}
                    </p>
                  )}
                </>
              )}
              {item.report && (
                <>
                  <p className="text-sm">
                    <span className="font-medium">الفيديو:</span>{" "}
                    {item.report.video?.title ?? "غير معروف"}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">النوع:</span>{" "}
                    {item.report.category}
                  </p>
                  {item.report.message && (
                    <p className="text-sm text-muted-foreground">
                      {item.report.message}
                    </p>
                  )}
                </>
              )}
              <p className="text-xs text-muted-foreground">
                {item.createdAt.toLocaleDateString("ar-SA")}
              </p>
              <ReviewActions itemId={item.id} />
            </CardContent>
          </Card>
        ))}
      </div>

      {reviewed.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">تمت المراجعة</h2>
          <div className="space-y-2">
            {reviewed.map((item: typeof reviewed[number]) => (
              <Card key={item.id} className="opacity-60">
                <CardContent className="flex items-center justify-between py-3">
                  <span className="text-sm">
                    {item.itemType === "SUBMISSION" ? "طلب تقييم" : "بلاغ"}
                  </span>
                  <Badge>{item.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
