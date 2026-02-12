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
import { AiReviewButton } from "@/components/admin/ai-review-button";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { FileDown, X } from "lucide-react";

type Props = {
  searchParams: Promise<{ page?: string; channel?: string }>;
};

export default async function AdminVideosPage({ searchParams }: Props) {
  const { page: pageStr, channel: channelFilter } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));

  // Resolve channel filter
  let channelName: string | null = null;
  let channelWhere: { channelId?: string } = {};
  if (channelFilter) {
    const ch = await prisma.channel.findUnique({
      where: { youtubeChannelId: channelFilter },
      select: { id: true, name: true, nameAr: true },
    });
    if (ch) {
      channelWhere = { channelId: ch.id };
      channelName = ch.nameAr ?? ch.name;
    }
  }

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
      where: channelWhere,
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
      orderBy: { publishedAt: "desc" },
      include: { ratingAggregate: true, channel: true },
    }),
    prisma.video.count({ where: channelWhere }),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Build pagination query string
  function pageUrl(p: number) {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (channelFilter) params.set("channel", channelFilter);
    return `/admin/videos?${params.toString()}`;
  }

  return (
    <div>
      <AdminBreadcrumb items={[
        { label: "لوحة التحكم", href: "/admin" },
        ...(channelName
          ? [{ label: "القنوات", href: "/admin/channels" }, { label: channelName }]
          : [{ label: "الفيديوهات" }]
        ),
      ]} />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">
            الفيديوهات ({total.toLocaleString("ar-SA")})
          </h1>
          {channelName && (
            <Link href="/admin/videos">
              <Badge variant="secondary" className="gap-1 cursor-pointer">
                {channelName}
                <X className="h-3 w-3" />
              </Badge>
            </Link>
          )}
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="/api/admin/export">
            <FileDown className="h-4 w-4 me-2" />
            تصدير CSV
          </a>
        </Button>
      </div>
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
                  href={`/admin/videos/${video.id}`}
                  className="hover:text-primary"
                >
                  {video.title}
                </Link>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {video.channel ? (
                  <Link
                    href={`/admin/videos?channel=${video.channel.youtubeChannelId}`}
                    className="hover:text-primary"
                  >
                    {video.channel.nameAr ?? video.channel.name}
                  </Link>
                ) : (
                  "-"
                )}
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
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/admin/ratings/${video.youtubeVideoId}`}>
                      تقييم
                    </Link>
                  </Button>
                  <AiReviewButton youtubeVideoId={video.youtubeVideoId} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={pageUrl(page - 1)}>السابق</Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            صفحة {page} من {totalPages}
          </span>
          {page < totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link href={pageUrl(page + 1)}>التالي</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
