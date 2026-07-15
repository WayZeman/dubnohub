import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

/**
 * Verified coordinates (via-regia.org.ua, landmarks.in.ua, sobory.ru, Nominatim).
 * Fixes map pins that pointed to wrong locations.
 */
export const COORD_FIXES: Record<string, { latitude: number; longitude: number }> =
  {
    // ~3.7 km off — was in castle district instead of Strakliv / Polubotka
    "sobor-rizdva-bohorodytsi": {
      latitude: 50.3804809,
      longitude: 25.7356404,
    },
    // ~350 m off — pin was south of the complex
    "monastyr-karmelitek": {
      latitude: 50.4263697,
      longitude: 25.7417887,
    },
    // ~970 m off — was in riverside park, memorial is on Ostrivok
    "aleia-nebesnoi-sotni": {
      latitude: 50.4222005,
      longitude: 25.7471918,
    },
    // House of Culture / monument area
    "pamyatnyk-shevchenku": {
      latitude: 50.4187767,
      longitude: 25.7368502,
    },
    "dubenskyi-zamok": {
      latitude: 50.4195637,
      longitude: 25.7475829,
    },
    "kraieznavchyi-muzei": {
      latitude: 50.4195637,
      longitude: 25.7475829,
    },
    "lutska-brama": {
      latitude: 50.4186581,
      longitude: 25.7338444,
    },
    "velyka-synahoha": {
      latitude: 50.4170704,
      longitude: 25.7443725,
    },
    "kostel-yana-nepomuka": {
      latitude: 50.420271,
      longitude: 25.7433143,
    },
    "yuriivska-tserkva": {
      latitude: 50.4154726,
      longitude: 25.7572719,
    },
    "spaso-preobrazhenska-tserkva": {
      latitude: 50.4163097,
      longitude: 25.7350463,
    },
    "tarakanivskyi-fort": {
      latitude: 50.3629697,
      longitude: 25.7162056,
    },
    "torhovi-budynky-drahomanova": {
      latitude: 50.4208303,
      longitude: 25.744284,
    },
    // Ukrposhta — refined geocoding for Dubno branches
    "ukrposhta-35601-dubno": {
      latitude: 50.3668162,
      longitude: 25.7608132,
    },
    "ukrposhta-35602-dubno": {
      latitude: 50.386617,
      longitude: 25.742763,
    },
    "ukrposhta-35603-dubno": {
      latitude: 50.41815,
      longitude: 25.73685,
    },
    "ukrposhta-35604-dubno": {
      latitude: 50.401993,
      longitude: 25.758833,
    },
  };

async function main() {
  let updated = 0;
  for (const [slug, coords] of Object.entries(COORD_FIXES)) {
    const place = await prisma.place.findUnique({ where: { slug } });
    if (!place) {
      console.warn("missing", slug);
      continue;
    }
    await prisma.place.update({
      where: { slug },
      data: coords,
    });
    updated++;
    console.log("fixed", slug, coords.latitude, coords.longitude);
  }
  console.log("Updated", updated, "places");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
