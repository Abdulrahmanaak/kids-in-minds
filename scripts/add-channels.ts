import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const CHANNELS = [
  {
    youtubeChannelId: "UCm6dEXyAMIy0njEOW-suLww",
    name: "POWR eSports",
    nameAr: "باور",
    teamTag: "power",
  },
  {
    youtubeChannelId: "UCf-YhOHjRunKHY3wxLove_w",
    name: "Peaks",
    nameAr: "بيكس",
    teamTag: "peaks",
  },
  {
    youtubeChannelId: "UCoDdwMx_GBfjbK3x-kw5iUA",
    name: "Lynx",
    nameAr: "لينكس",
    teamTag: "lynx",
  },
  {
    youtubeChannelId: "UC48YH6lbbscWDsyoKqgg9Aw",
    name: "ALBatabet",
    nameAr: "البتابيت",
    teamTag: "batabit",
  },
];

async function main() {
  // Remove the wrong COLORS channel
  try {
    await prisma.channel.delete({ where: { youtubeChannelId: "UC2Qw1dzXDBAZPwS7zm37g8g" } });
    console.log("Deleted COLORS channel (wrong ID)");
  } catch {
    console.log("COLORS channel not found, skipping");
  }

  // Upsert the 4 new channels
  for (const ch of CHANNELS) {
    await prisma.channel.upsert({
      where: { youtubeChannelId: ch.youtubeChannelId },
      create: ch,
      update: { name: ch.name, nameAr: ch.nameAr, teamTag: ch.teamTag },
    });
    console.log(`Upserted: ${ch.name} (${ch.nameAr}) - ${ch.youtubeChannelId}`);
  }

  // List all channels
  const all = await prisma.channel.findMany();
  console.log(`\nAll ${all.length} channels:`);
  for (const c of all) {
    console.log(`  ${c.name} (${c.nameAr}) - ${c.youtubeChannelId}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
