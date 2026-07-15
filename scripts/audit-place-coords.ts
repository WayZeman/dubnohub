import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

function distMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

async function geocode(query: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "DubnoHub/1.0 (location audit; https://dubnohub.vercel.app)",
    },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;
  if (!data[0]) return null;
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    display: data[0].display_name,
  };
}

async function main() {
  const only = process.argv.find((a) => a.startsWith("--cat="))?.split("=")[1];
  const places = await prisma.place.findMany({
    where: only ? { category: { slug: only } } : undefined,
    include: { category: { select: { slug: true } } },
    orderBy: { slug: "asc" },
  });

  const issues: string[] = [];
  for (const p of places) {
    if (p.latitude == null || p.longitude == null) {
      issues.push(`NO_COORDS ${p.slug}`);
      continue;
    }
    const q = `${p.address ?? p.title}, Дубно, Рівненська область, Україна`;
    await new Promise((r) => setTimeout(r, 1100));
    const g = await geocode(q);
    if (!g) {
      issues.push(`GEOCODE_FAIL ${p.slug} | ${p.address}`);
      continue;
    }
    const d = distMeters(p.latitude, p.longitude, g.lat, g.lng);
    const threshold = p.category.slug === "pamyatky" ? 250 : 150;
    if (d > threshold) {
      issues.push(
        [
          `MISMATCH ${d.toFixed(0)}m [${p.category.slug}] ${p.slug}`,
          `  DB:  ${p.latitude}, ${p.longitude}`,
          `  GEO: ${g.lat}, ${g.lng}`,
          `  ADDR: ${p.address}`,
        ].join("\n"),
      );
    } else if (d > 50) {
      console.log(`ok-ish ${d.toFixed(0)}m ${p.slug}`);
    }
  }

  console.log(`\nChecked ${places.length} places`);
  console.log(`Issues: ${issues.length}\n`);
  for (const i of issues) console.log(`${i}\n---`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
