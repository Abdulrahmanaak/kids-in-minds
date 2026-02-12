"use client";

import Link from "next/link";
import { Heart, Bookmark, Share2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/use-favorites";
import { useWatchlist } from "@/hooks/use-watchlist";

type Props = {
  youtubeVideoId: string;
  title: string;
  thumbnailUrl: string | null;
  channelName: string | null;
};

export function VideoActions({ youtubeVideoId, title, thumbnailUrl, channelName }: Props) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const fav = isFavorite(youtubeVideoId);
  const inWatchlist = isInWatchlist(youtubeVideoId);
  const item = { youtubeVideoId, title, thumbnailUrl, channelName };

  async function handleShare() {
    const url = `${window.location.origin}/video/${youtubeVideoId}`;
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={fav ? "default" : "outline"}
        size="sm"
        onClick={() => (fav ? removeFavorite(youtubeVideoId) : addFavorite(item))}
      >
        <Heart className={`h-4 w-4 me-1 ${fav ? "fill-current" : ""}`} />
        {fav ? "في المفضلة" : "أضف للمفضلة"}
      </Button>
      <Button
        variant={inWatchlist ? "default" : "outline"}
        size="sm"
        onClick={() =>
          inWatchlist ? removeFromWatchlist(youtubeVideoId) : addToWatchlist(item)
        }
      >
        <Bookmark className={`h-4 w-4 me-1 ${inWatchlist ? "fill-current" : ""}`} />
        {inWatchlist ? "في المشاهدة لاحقاً" : "شاهد لاحقاً"}
      </Button>
      <Button variant="outline" size="sm" onClick={handleShare}>
        <Share2 className="h-4 w-4 me-1" />
        مشاركة
      </Button>
      <Button variant="outline" size="sm" asChild>
        <Link href={`/report/${youtubeVideoId}`}>
          <Flag className="h-4 w-4 me-1" />
          إبلاغ
        </Link>
      </Button>
    </div>
  );
}
