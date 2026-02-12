import type { Channel } from "@/generated/prisma/client";

export type ChannelWithStats = Channel & {
  _count: {
    videos: number;
  };
};
