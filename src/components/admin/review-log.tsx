"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { AgeRatingBadge } from "@/components/rating/age-rating-badge";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AGE_RATING_ORDER, AGE_RATING_LABELS } from "@/lib/constants";
import { Volume2, VolumeX } from "lucide-react";

type ReviewLogEntry = {
  id: string;
  videoId: string;
  videoTitle: string;
  videoYoutubeId: string;
  channelName: string;
  ageRating: string;
  hadAudio: boolean;
  createdAt: string;
};

type Props = {
  entries: ReviewLogEntry[];
};

export function ReviewLog({ entries }: Props) {
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("ALL");

  const filtered = entries.filter((e) => {
    if (search && !e.videoTitle.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (ratingFilter !== "ALL" && e.ageRating !== ratingFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input
          placeholder="بحث بعنوان الفيديو..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="التقييم العمري" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">الكل</SelectItem>
            {AGE_RATING_ORDER.map((r) => (
              <SelectItem key={r} value={r}>
                {AGE_RATING_LABELS[r].ar}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>العنوان</TableHead>
            <TableHead>القناة</TableHead>
            <TableHead>التقييم</TableHead>
            <TableHead>الصوت</TableHead>
            <TableHead>التاريخ</TableHead>
            <TableHead>التفاصيل</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="max-w-xs truncate font-medium">
                <Link
                  href={`/admin/videos/${entry.videoId}`}
                  className="hover:text-primary"
                >
                  {entry.videoTitle}
                </Link>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {entry.channelName}
              </TableCell>
              <TableCell>
                <AgeRatingBadge rating={entry.ageRating} size="sm" />
              </TableCell>
              <TableCell>
                {entry.hadAudio ? (
                  <Badge variant="secondary" className="gap-1">
                    <Volume2 className="h-3 w-3" />
                    نعم
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <VolumeX className="h-3 w-3" />
                    لا
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(entry.createdAt).toLocaleDateString("ar-SA")}
              </TableCell>
              <TableCell>
                <Link
                  href={`/admin/ai-review/${entry.videoId}`}
                  className="text-sm text-primary hover:underline"
                >
                  عرض
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                لا توجد نتائج
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
