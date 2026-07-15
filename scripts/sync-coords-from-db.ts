import { config } from "dotenv";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

async function main() {
  const places = await prisma.place.findMany({
    orderBy: { slug: "asc" },
    select: { slug: true, address: true, latitude: true, longitude: true },
  });

  const coords: Record<string, unknown> = {};
  for (const p of places) {
    if (p.latitude == null || p.longitude == null) continue;
    coords[p.slug] = {
      latitude: p.latitude,
      longitude: p.longitude,
      address: p.address,
    };
  }

  writeFileSync(
    resolve(process.cwd(), "scripts/place-coords.json"),
    JSON.stringify(coords, null, 2) + "\n",
  );

  let file = readFileSync(
    resolve(process.cwd(), "scripts/import-landmarks.ts"),
    "utf8",
  );

  for (const p of places) {
    if (p.latitude == null || p.longitude == null) continue;
    const slugBlock = new RegExp(
      `(slug:\\s*"${p.slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[\\s\\S]*?latitude:\\s*)[\\d.]+(,\\s*\\n\\s*longitude:\\s*)[\\d.]+`,
    );
    if (!slugBlock.test(file)) continue;
    file = file.replace(
      slugBlock,
      `$1${p.latitude}$2${p.longitude}`,
    );
  }

  writeFileSync(
    resolve(process.cwd(), "scripts/import-landmarks.ts"),
    file,
  );

  console.log("Synced", places.length, "places to place-coords.json + import-landmarks.ts");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
