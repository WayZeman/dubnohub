import { config } from "dotenv";
import { writeFileSync } from "fs";
import { PrismaClient } from "@prisma/client";
import { geocodeAddress } from "../lib/geocode-dubno";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

type Row = {
  slug: string;
  title: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  categorySlug: string;
};

function haversineM(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function main() {
  const places = await prisma.place.findMany({
    include: { category: { select: { slug: true, name: true } } },
    orderBy: { title: "asc" },
  });

  const rows: Row[] = places.map((p) => ({
    slug: p.slug,
    title: p.title,
    address: p.address,
    latitude: p.latitude,
    longitude: p.longitude,
    categorySlug: p.category.slug,
  }));

  // Exact coordinate duplicates across different places
  const byCoord = new Map<string, Row[]>();
  for (const r of rows) {
    if (r.latitude == null || r.longitude == null) continue;
    const key = `${r.latitude.toFixed(6)},${r.longitude.toFixed(6)}`;
    const list = byCoord.get(key) ?? [];
    list.push(r);
    byCoord.set(key, list);
  }

  console.log("\n=== EXACT COORD DUPLICATES ===");
  const exactDupes: { key: string; places: Row[] }[] = [];
  for (const [key, list] of byCoord) {
    if (list.length < 2) continue;
    // castle + museum same address is OK
    const slugs = new Set(list.map((x) => x.slug));
    const okCastleMuseum =
      list.length === 2 &&
      slugs.has("dubenskyi-zamok") &&
      slugs.has("kraieznavchyi-muzei");
    if (okCastleMuseum) {
      console.log(`OK shared (castle/museum): ${key}`);
      continue;
    }
    exactDupes.push({ key, places: list });
    console.log(`DUPE ${key}:`);
    for (const p of list) {
      console.log(`  - ${p.slug} | ${p.title} | ${p.address}`);
    }
  }

  // Near-duplicates within 15m for different addresses
  console.log("\n=== NEAR DUPES (<15m, different address) ===");
  const near: { a: Row; b: Row; m: number }[] = [];
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const a = rows[i]!;
      const b = rows[j]!;
      if (
        a.latitude == null ||
        a.longitude == null ||
        b.latitude == null ||
        b.longitude == null
      )
        continue;
      const m = haversineM(
        { lat: a.latitude, lng: a.longitude },
        { lat: b.latitude, lng: b.longitude }
      );
      if (m < 15 && a.address !== b.address) {
        near.push({ a, b, m });
      }
    }
  }
  for (const n of near.sort((x, y) => x.m - y.m)) {
    console.log(
      `${n.m.toFixed(1)}m | ${n.a.slug} (${n.a.address}) ↔ ${n.b.slug} (${n.b.address})`
    );
  }

  // Suspects to regeocode
  const suspects = [
    "kostel-yana-nepomuka",
    "medychnyi-koledzh-dubno",
    "pamyatnyk-shevchenku",
    "mykolaivskyi-sobor",
    "litsey-7-dubno",
    "zdo-2-dubno",
    "sobor-rizdva-bohorodytsi",
    "budynok-ditei-molodi-dubno",
    "tsentr-natsionalno-patriotychnoho-vykhovannia-dubno",
    "kontraktovyi-budynok",
    "khmelefabruka",
    "meest-21-dubno",
  ];

  console.log("\n=== REGEOCODE SUSPECTS ===");
  const regeo: Record<
    string,
    {
      address: string;
      old: { lat: number | null; lng: number | null };
      neo: { lat: number; lng: number; source: string } | null;
      deltaM: number | null;
    }
  > = {};

  for (const slug of suspects) {
    const p = places.find((x) => x.slug === slug);
    if (!p) continue;
    const neo = await geocodeAddress(p.address, { slug, delayMs: 1100 });
    let deltaM: number | null = null;
    if (neo && p.latitude != null && p.longitude != null) {
      deltaM = haversineM(
        { lat: p.latitude, lng: p.longitude },
        { lat: neo.latitude, lng: neo.longitude }
      );
    }
    regeo[slug] = {
      address: p.address,
      old: { lat: p.latitude, lng: p.longitude },
      neo: neo
        ? { lat: neo.latitude, lng: neo.longitude, source: neo.source }
        : null,
      deltaM,
    };
    console.log(
      `${slug}: old=${p.latitude},${p.longitude} → ${
        neo ? `${neo.latitude},${neo.longitude} (${neo.source}) Δ=${deltaM?.toFixed(0)}m` : "FAIL"
      }`
    );
  }

  writeFileSync(
    "/tmp/dubno-coord-audit.json",
    JSON.stringify({ exactDupes, near, regeo }, null, 2)
  );
  console.log("\nWrote /tmp/dubno-coord-audit.json");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
