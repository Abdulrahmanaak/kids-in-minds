import Link from "next/link";
import { Shield, ShieldCheck, ListChecks, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBar } from "@/components/search/search-bar";
import { VideoGrid } from "@/components/video/video-grid";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { prisma } from "@/lib/prisma";
import { APP_NAME } from "@/lib/constants";
import type { Thumbnails, VideoCardData } from "@/types/video";

export const dynamic = "force-dynamic";

const SHORTCUTS = [
  {
    href: "/safe-list",
    icon: ShieldCheck,
    label: "القائمة الآمنة",
    description: "مقاطع آمنة ومقيّمة لأطفالك",
  },
  {
    href: "/safe-list?ageRating=G",
    icon: ListChecks,
    label: "مناسب للجميع",
    description: "مقاطع تصنيف عام (G)",
  },
  {
    href: "/submit",
    icon: Send,
    label: "أرسل فيديو",
    description: "اطلب تقييم فيديو جديد",
  },
];

export default async function HomePage() {
  const latestVideos = await prisma.video.findMany({
    take: 8,
    orderBy: { publishedAt: "desc" },
    include: { ratingAggregate: true, channel: true },
  });

  const videoCards: VideoCardData[] = latestVideos.map((v: typeof latestVideos[number]) => {
    const thumbs = v.thumbnails as Thumbnails | null;
    return {
      id: v.id,
      youtubeVideoId: v.youtubeVideoId,
      title: v.title,
      channelName: v.channel?.nameAr ?? v.channel?.name ?? null,
      channelId: v.channelId,
      thumbnailUrl: thumbs?.medium?.url ?? thumbs?.high?.url ?? null,
      publishedAt: v.publishedAt?.toISOString() ?? null,
      durationSec: v.durationSec,
      ageRating: v.ratingAggregate?.ageRating ?? null,
      confidence: v.ratingAggregate?.confidence ?? null,
      status: v.ratingAggregate ? "SCANNED" : "UNSCANNED",
    };
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center mb-6">
              <Shield className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{APP_NAME}</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              ساعد أطفالك في مشاهدة محتوى آمن ومناسب. نقيّم مقاطع يوتيوب وفق
              المعايير الإسلامية والثقافية السعودية.
            </p>
            <div className="max-w-xl mx-auto">
              <SearchBar />
            </div>
          </div>
        </section>

        {/* Shortcuts */}
        <section className="container mx-auto px-4 -mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SHORTCUTS.map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="transition-shadow hover:shadow-md h-full">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Latest Videos */}
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">أحدث المقاطع</h2>
            <Button variant="outline" asChild>
              <Link href="/search">عرض الكل</Link>
            </Button>
          </div>
          {videoCards.length > 0 ? (
            <VideoGrid videos={videoCards} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>لا توجد مقاطع بعد. قم باستيراد القنوات من لوحة الإدارة.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
