import { prisma } from "@/lib/prisma";
import { YOUTUBE_DAILY_QUOTA } from "@/lib/constants";

const QUOTA_COSTS: Record<string, number> = {
  search: 100,
  "videos.list": 1,
  "channels.list": 1,
  "playlistItems.list": 1,
};

export async function trackQuota(endpoint: string, units?: number) {
  const cost = units ?? QUOTA_COSTS[endpoint] ?? 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.quotaLog.create({
    data: {
      date: today,
      endpoint,
      unitsCost: cost,
    },
  });
}

export async function getDailyUsage(date?: Date): Promise<number> {
  const target = date ?? new Date();
  target.setHours(0, 0, 0, 0);
  const nextDay = new Date(target);
  nextDay.setDate(nextDay.getDate() + 1);

  const result = await prisma.quotaLog.aggregate({
    _sum: { unitsCost: true },
    where: {
      date: {
        gte: target,
        lt: nextDay,
      },
    },
  });

  return result._sum.unitsCost ?? 0;
}

export async function hasQuotaBudget(requiredUnits: number, budgetLimit?: number): Promise<boolean> {
  const usage = await getDailyUsage();
  const limit = budgetLimit ?? YOUTUBE_DAILY_QUOTA;
  return usage + requiredUnits <= limit;
}
