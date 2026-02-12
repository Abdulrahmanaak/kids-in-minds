import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ChannelRow = {
  id: string;
  name: string;
  nameAr: string | null;
  totalVideos: number;
  reviewedVideos: number;
};

type Props = {
  channels: ChannelRow[];
};

export function ChannelReviewTable({ channels }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>القناة</TableHead>
          <TableHead className="text-center">إجمالي</TableHead>
          <TableHead className="text-center">تم مراجعتها</TableHead>
          <TableHead className="text-center">النسبة</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {channels.map((ch) => {
          const pct = ch.totalVideos > 0 ? (ch.reviewedVideos / ch.totalVideos) * 100 : 0;
          return (
            <TableRow key={ch.id}>
              <TableCell className="font-medium">
                {ch.nameAr ?? ch.name}
              </TableCell>
              <TableCell className="text-center">
                {ch.totalVideos.toLocaleString("ar-SA")}
              </TableCell>
              <TableCell className="text-center">
                {ch.reviewedVideos.toLocaleString("ar-SA")}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center gap-2 justify-center">
                  <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-start">
                    {pct.toFixed(0)}%
                  </span>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
        {channels.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
              لا توجد قنوات
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
