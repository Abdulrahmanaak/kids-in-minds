import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Update Team Falcon to real Falcons channel ID
  const updated = await prisma.channel.update({
    where: { youtubeChannelId: "UCq-Fj5jknLsUf-MWSy4_brA" },
    data: {
      youtubeChannelId: "UC8tgxAxKG7vYG6F7FoZVi4A",
      name: "Falcons",
      nameAr: "فالكونز",
    },
  });
  console.log("Updated:", updated.name, "->", updated.youtubeChannelId);

  // Delete non-existent channels
  for (const id of [
    "UCkLO4oelRG2o4GRefd1Toew",
    "UCLXhHzRIQbg2ygEiSaKmr2g",
    "UCx9bOEKNIj3JMHX99-bfOtA",
  ]) {
    try {
      await prisma.channel.delete({ where: { youtubeChannelId: id } });
      console.log("Deleted:", id);
    } catch {
      console.log("Not found:", id);
    }
  }

  // List remaining
  const channels = await prisma.channel.findMany();
  console.log("\nRemaining channels:");
  for (const c of channels) {
    console.log(` ${c.name} (${c.nameAr}) - ${c.youtubeChannelId}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
