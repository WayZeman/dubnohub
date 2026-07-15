import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

async function main() {
  const places = await prisma.place.findMany({
    where: { category: { slug: "pamyatky" } },
    select: { slug: true, title: true, images: true },
    orderBy: { slug: "asc" },
  });
  for (const p of places) {
    const first = p.images[0] ?? "(empty)";
    const tag = first.includes("blob.vercel-storage")
      ? "BLOB"
      : first.includes("wikimedia")
        ? "WM"
        : first.includes("igotoworld")
          ? "IGOTO"
          : first === "(empty)"
            ? "EMPTY"
            : "OTHER";
    const tip = first.slice(-55);
    console.log(`${tag.padEnd(6)} ${p.slug.padEnd(36)} …${tip}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
