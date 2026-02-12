import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminChannelsPage() {
  const channels = await prisma.channel.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { videos: true } } },
  });

  return (
    <div>
      <AdminBreadcrumb items={[
        { label: "لوحة التحكم", href: "/admin" },
        { label: "القنوات" },
      ]} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">القنوات ({channels.length})</h1>
        <Button asChild>
          <Link href="/admin/import">استيراد قنوات</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم</TableHead>
            <TableHead>الاسم بالعربية</TableHead>
            <TableHead>التصنيف</TableHead>
            <TableHead>الفيديوهات</TableHead>
            <TableHead>آخر استيراد</TableHead>
            <TableHead>إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {channels.map((channel: typeof channels[number]) => (
            <TableRow key={channel.id}>
              <TableCell className="font-medium">{channel.name}</TableCell>
              <TableCell>{channel.nameAr ?? "-"}</TableCell>
              <TableCell>{channel.teamTag ?? "-"}</TableCell>
              <TableCell>
                <Link
                  href={`/admin/videos?channel=${channel.youtubeChannelId}`}
                  className="text-primary hover:underline"
                >
                  {channel._count.videos}
                </Link>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {channel.lastImportedAt
                  ? channel.lastImportedAt.toLocaleDateString("ar-SA")
                  : "لم يتم"}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/admin/videos?channel=${channel.youtubeChannelId}`}>
                      الفيديوهات
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/channel/${channel.youtubeChannelId}`} target="_blank">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
