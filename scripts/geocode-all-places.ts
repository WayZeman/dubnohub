import { config } from "dotenv";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { distMeters, geocodeAddress } from "../lib/geocode-dubno";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();
const DRY = process.argv.includes("--dry-run");
const SLEEP_MS = 1100;

async function main() {
  const places = await prisma.place.findMany({
    orderBy: { slug: "asc" },
    select: {
      id: true,
      slug: true,
      address: true,
      latitude: true,
      longitude: true,
    },
  });

  const results: Record<
    string,
    { latitude: number; longitude: number; source: string; address: string }
  > = {};
  const failed: string[] = [];
  let updated = 0;

  for (const place of places) {
    if (!place.address) {
      failed.push(`${place.slug}: no address`);
      continue;
    }

    const geo = await geocodeAddress(place.address, {
      delayMs: SLEEP_MS,
      slug: place.slug,
    });
    if (!geo) {
      failed.push(`${place.slug}: ${place.address}`);
      console.warn("FAIL", place.slug, place.address);
      continue;
    }

    const moved =
      place.latitude == null
        ? Infinity
        : distMeters(
            place.latitude,
            place.longitude ?? 0,
            geo.latitude,
            geo.longitude,
          );

    results[place.slug] = {
      latitude: geo.latitude,
      longitude: geo.longitude,
      source: geo.source,
      address: place.address,
    };

    console.log(
      `${DRY ? "[dry] " : ""}${place.slug}: ${geo.latitude.toFixed(6)}, ${geo.longitude.toFixed(6)} (${geo.source}, Δ${moved.toFixed(0)}m)`,
    );

    if (!DRY) {
      await prisma.place.update({
        where: { id: place.id },
        data: { latitude: geo.latitude, longitude: geo.longitude },
      });
      updated++;
    }
  }

  writeFileSync(
    resolve(process.cwd(), "scripts/place-coords.json"),
    JSON.stringify(results, null, 2) + "\n",
  );

  console.log(
    `\nDone: ${updated}/${places.length} updated, ${failed.length} failed`,
  );
  if (failed.length) {
    console.log("Failed:");
    for (const f of failed) console.log(" ", f);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
