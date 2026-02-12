import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

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
            <TableHead>إجراء</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {channels.map((channel: typeof channels[number]) => (
            <TableRow key={channel.id}>
              <TableCell className="font-medium">{channel.name}</TableCell>
              <TableCell>{channel.nameAr ?? "-"}</TableCell>
              <TableCell>{channel.teamTag ?? "-"}</TableCell>
              <TableCell>{channel._count.videos}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {channel.lastImportedAt
                  ? channel.lastImportedAt.toLocaleDateString("ar-SA")
                  : "لم يتم"}
              </TableCell>
              <TableCell>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/channel/${channel.youtubeChannelId}`}>
                    عرض
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
