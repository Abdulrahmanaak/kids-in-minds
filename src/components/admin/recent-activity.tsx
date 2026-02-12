import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgeRatingBadge } from "@/components/rating/age-rating-badge";
import { Bot } from "lucide-react";

type RecentReview = {
  videoId: string;
  videoTitle: string;
  ageRating: string;
  createdAt: string;
};

type Props = {
  reviews: RecentReview[];
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "الآن";
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  if (diffHr < 24) return `منذ ${diffHr} ساعة`;
  return `منذ ${diffDay} يوم`;
}

export function RecentActivity({ reviews }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bot className="h-4 w-4" />
          آخر المراجعات
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            لا توجد مراجعات حديثة
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <Link
                key={r.videoId}
                href={`/admin/ai-review/${r.videoId}`}
                className="flex items-center justify-between gap-2 rounded-md p-1.5 -mx-1.5 hover:bg-accent transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.videoTitle}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(r.createdAt)}</p>
                </div>
                <AgeRatingBadge rating={r.ageRating} size="sm" />
              </Link>
            ))}
            <Link
              href="/admin/ai-review"
              className="block text-sm text-primary hover:underline text-center pt-2"
            >
              عرض الكل
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
