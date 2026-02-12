import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AgeRatingBadge } from "@/components/rating/age-rating-badge";
import { ITEMS_PER_PAGE } from "@/lib/constants";

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminVideosPage({ searchParams }: Props) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
      orderBy: { publishedAt: "desc" },
      include: { ratingAggregate: true, channel: true },
    }),
    prisma.video.count(),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">الفيديوهات ({total})</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>العنوان</TableHead>
            <TableHead>القناة</TableHead>
            <TableHead>التقييم</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>إجراء</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos.map((video: typeof videos[number]) => (
            <TableRow key={video.id}>
              <TableCell className="max-w-xs truncate font-medium">
                <Link
                  href={`/video/${video.youtubeVideoId}`}
                  className="hover:text-primary"
                >
                  {video.title}
                </Link>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {video.channel?.nameAr ?? video.channel?.name ?? "-"}
              </TableCell>
              <TableCell>
                {video.ratingAggregate ? (
                  <AgeRatingBadge
                    rating={video.ratingAggregate.ageRating}
                    size="sm"
                  />
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                <Badge variant={video.ratingAggregate ? "default" : "outline"}>
                  {video.ratingAggregate ? "مقيّم" : "غير مقيّم"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/admin/ratings/${video.youtubeVideoId}`}>
                    تقييم
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/videos?page=${page - 1}`}>السابق</Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            صفحة {page} من {totalPages}
          </span>
          {page < totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/videos?page=${page + 1}`}>التالي</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
