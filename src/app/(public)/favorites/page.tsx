"use client";

import { Heart, Bookmark } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { useFavorites } from "@/hooks/use-favorites";
import { useWatchlist } from "@/hooks/use-watchlist";

export default function FavoritesPage() {
  const { favorites, removeFavorite, loaded: favLoaded } = useFavorites();
  const { watchlist, removeFromWatchlist, loaded: watchLoaded } = useWatchlist();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">المفضلة والمشاهدة لاحقاً</h1>

      <Tabs defaultValue="favorites">
        <TabsList>
          <TabsTrigger value="favorites" className="gap-1">
            <Heart className="h-4 w-4" />
            المفضلة ({favorites.length})
          </TabsTrigger>
          <TabsTrigger value="watchlist" className="gap-1">
            <Bookmark className="h-4 w-4" />
            شاهد لاحقاً ({watchlist.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="mt-4">
          {!favLoaded ? (
            <p className="text-muted-foreground">جارٍ التحميل...</p>
          ) : favorites.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="لا توجد مفضلات"
              description="أضف فيديوهات لمفضلتك من صفحة الفيديو"
            />
          ) : (
            <div className="space-y-3">
              {favorites.map((item) => (
                <Card key={item.youtubeVideoId}>
                  <CardContent className="flex items-center justify-between p-4">
                    <Link
                      href={`/video/${item.youtubeVideoId}`}
                      className="flex-1 hover:text-primary transition-colors"
                    >
                      <p className="font-medium line-clamp-1">{item.title}</p>
                      {item.channelName && (
                        <p className="text-sm text-muted-foreground">
                          {item.channelName}
                        </p>
                      )}
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFavorite(item.youtubeVideoId)}
                      className="text-destructive"
                    >
                      إزالة
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="watchlist" className="mt-4">
          {!watchLoaded ? (
            <p className="text-muted-foreground">جارٍ التحميل...</p>
          ) : watchlist.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="لا توجد عناصر"
              description="أضف فيديوهات لقائمة المشاهدة لاحقاً من صفحة الفيديو"
            />
          ) : (
            <div className="space-y-3">
              {watchlist.map((item) => (
                <Card key={item.youtubeVideoId}>
                  <CardContent className="flex items-center justify-between p-4">
                    <Link
                      href={`/video/${item.youtubeVideoId}`}
                      className="flex-1 hover:text-primary transition-colors"
                    >
                      <p className="font-medium line-clamp-1">{item.title}</p>
                      {item.channelName && (
                        <p className="text-sm text-muted-foreground">
                          {item.channelName}
                        </p>
                      )}
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromWatchlist(item.youtubeVideoId)}
                      className="text-destructive"
                    >
                      إزالة
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
