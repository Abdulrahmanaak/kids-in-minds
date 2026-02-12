import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const SEED_CHANNELS = [
  {
    youtubeChannelId: "UCq-Fj5jknLsUf-MWSy4_brA",
    name: "Team Falcon",
    nameAr: "فريق الصقور",
    teamTag: "falcons",
  },
  {
    youtubeChannelId: "UC2Qw1dzXDBAZPwS7zm37g8g",
    name: "Power Team",
    nameAr: "فريق القوة",
    teamTag: "power",
  },
  {
    youtubeChannelId: "UCkLO4oelRG2o4GRefd1Toew",
    name: "Team Lynx",
    nameAr: "فريق الوشق",
    teamTag: "lynx",
  },
  {
    youtubeChannelId: "UCLXhHzRIQbg2ygEiSaKmr2g",
    name: "Al-Batabit",
    nameAr: "البتابت",
    teamTag: "batabit",
  },
  {
    youtubeChannelId: "UCx9bOEKNIj3JMHX99-bfOtA",
    name: "Paksx",
    nameAr: "باكس",
    teamTag: "paksx",
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
