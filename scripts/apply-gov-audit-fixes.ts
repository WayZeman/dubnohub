import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

const EMBLEM =
  "https://q4xumapvmzzua4yh.public.blob.vercel-storage.com/brands/gov-emblem.png";

/** Post-audit photo corrections (Google Maps verification 2026-07-16). */
const FIXES: Record<string, { local?: string; emblem?: boolean }> = {
  // Semydubska 9 plaque — wrong building for Грушевського 134
  "podatkova-dubno": { emblem: true },
  "dvs-dubno": { emblem: true },
  // Oranta insurance office, not the notary
  "notarialna-1-dubno": { emblem: true },
  // Shared building at Драгоманова 12 (Google POI photo for 2nd notary)
  "notarialna-2-dubno": { local: "/tmp/gov-audit/fix/notary2_g.jpg" },
  "tsentr-sssdm-dubno": {
    local: "/tmp/gov-audit/fix/notary2_g.jpg",
  },
  // Будинок культури / історична забудова на пл. Свободи
  "racs-dubno": { local: "/tmp/gov-audit/fix/svobody.jpg" },
  // Street View: червоноцегляна будівля за деревами, Пекарська 10
  "policia-dubno": { local: "/tmp/gov-audit/fix/pol_sv.jpg" },
};

async function upload(slug: string, local: string): Promise<string> {
  const buffer = await readFile(local);
  const blob = await put(`places/${slug}/0.jpg`, buffer, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "image/jpeg",
  });
  return blob.url;
}

async function main() {
  const shared = new Map<string, string>();

  for (const [slug, fix] of Object.entries(FIXES)) {
    let images: string[];
    if (fix.emblem) {
      images = [EMBLEM];
    } else if (fix.local) {
      const key = fix.local;
      if (!shared.has(key)) {
        console.log("upload", slug, key);
        shared.set(key, await upload(slug, key));
      }
      images = [shared.get(key)!];
    } else {
      continue;
    }

    await prisma.place.update({
      where: { slug },
      data: { images },
    });
    console.log("✓", slug);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
