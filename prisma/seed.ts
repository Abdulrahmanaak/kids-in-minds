import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const SEED_CHANNELS = [
  {
    youtubeChannelId: "UC8tgxAxKG7vYG6F7FoZVi4A",
    name: "Falcons",
    nameAr: "فالكونز",
    teamTag: "falcons",
  },
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
  console.log("Seeding channels...");

  for (const channel of SEED_CHANNELS) {
    await prisma.channel.upsert({
      where: { youtubeChannelId: channel.youtubeChannelId },
      create: channel,
      update: {
        name: channel.name,
        nameAr: channel.nameAr,
        teamTag: channel.teamTag,
      },
    });
    console.log(`  Upserted: ${channel.name} (${channel.nameAr})`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
