import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

const INHERIT_COORDS: Record<string, string> = {
  "nova-poshta-poshtomat-42616-dubno": "nova-poshta-viddilennya-4-dubno",
  "nova-poshta-poshtomat-42617-dubno": "nova-poshta-viddilennya-3-dubno",
  "nova-poshta-poshtomat-42618-dubno": "nova-poshta-viddilennya-2-dubno",
  "nova-poshta-poshtomat-36028-dubno": "meest-6-dubno",
};

async function getCoords(slug: string) {
  const p = await prisma.place.findUnique({
    where: { slug },
    select: { latitude: true, longitude: true },
  });
  if (p?.latitude == null || p?.longitude == null) return null;
  return { latitude: p.latitude, longitude: p.longitude };
}

async function main() {
  for (const [slug, fromSlug] of Object.entries(INHERIT_COORDS)) {
    const src = await getCoords(fromSlug);
    if (!src) {
      console.warn("skip", slug);
      continue;
    }
    await prisma.place.update({
      where: { slug },
      data: src,
    });
    console.log("inherit", slug, src);
  }

  const { geocodeAddress } = await import("../lib/geocode-dubno");
  const retry = [
    "nova-poshta-poshtomat-36172-dubno",
    "nova-poshta-poshtomat-59529-dubno",
    "nova-poshta-poshtomat-62270-dubno",
    "nova-poshta-punkt-54410-dubno",
  ];

  for (const slug of retry) {
    const place = await prisma.place.findUnique({
      where: { slug },
      select: { address: true },
    });
    if (!place?.address) continue;
    await new Promise((r) => setTimeout(r, 1100));
    const geo = await geocodeAddress(place.address, { slug });
    if (!geo) {
      console.warn("still fail", slug);
      continue;
    }
    await prisma.place.update({
      where: { slug },
      data: { latitude: geo.latitude, longitude: geo.longitude },
    });
    console.log("geocoded", slug, geo);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
