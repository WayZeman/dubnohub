import { config } from "dotenv";
import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

/**
 * Real Dubno photos only (Wikimedia, rivne.travel, UGCC / photographers.ua, drymba).
 * No Unsplash / stock.
 */
const PHOTO_FIXES: Record<string, string[]> = {
  "svyato-voznesenskyi-khram": [
    "https://f.rivne.travel/location/4280/AhHYW.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/e/e2/%D0%A1%D0%B2%D1%8F%D1%82%D0%BE_-%D0%92%D0%BE%D0%B7%D0%BD%D0%B5%D1%81%D0%B5%D0%BD%D1%81%D1%8C%D0%BA%D0%B8%D0%B9.jpg",
  ],
  "svyato-voznesenska-tserkva-pidbortsi": [
    "https://f.rivne.travel/location/4279/CVEvJ.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/1/18/Wooden_Church_of_the_Ascension_in_Dubno_01.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/d/d2/Wooden_Church_of_the_Ascension_in_Dubno_03.jpg",
    "https://photos.drymba.com/drb/000/212/21257_5e5_ht8n60.jpg",
  ],
  "tserkva-voznesinnia-hospodnoho": [
    "https://i.photographers.ua/images/pictures/2466/4jpg.jpg",
    "https://map.ugcc.ua/pub/base/0c97ab6ed7dcbc10.jpg",
  ],
  "tserkva-arkhanhela-havryila": [
    "https://f.rivne.travel/location/4287/d5Qn_.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/f/f1/%D0%94%D1%83%D0%B1%D0%BD%D0%BE_%D0%91%D1%83%D0%B4%D0%B8%D0%BD%D0%BE%D0%BA_%D0%94%D0%BE%D0%BC%D0%B1%D1%80%D0%BE%D0%B2%D1%81%D1%8C%D0%BA%D0%BE%D0%B3%D0%BE_%D0%A6%D0%B5%D1%80%D0%BA%D0%B2%D0%B0_%D0%B0%D1%80%D1%85%D0%B0%D0%BD%D0%B3%D0%B5%D0%BB%D0%B0_%D0%93%D0%B0%D0%B2%D1%80%D0%B8%D1%97%D0%BB%D0%B0.jpg",
  ],
  "tserkva-ehb-vifaniia": [
    "https://f.rivne.travel/location/4281/U7Vmw.png",
  ],
  // Same complex as Bernardine / St Nicholas monastery (historical Immaculate Conception)
  "kostel-neporochnogo-zachattia": [
    "https://f.rivne.travel/location/3276/vCQTj.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/3/39/Dubno_Bernardine_Monastery_1_RB.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/f/fa/Bernardine_Monastery_in_Dubno_06.jpg",
  ],
  "illinskyi-khram-stara": [
    "https://upload.wikimedia.org/wikipedia/commons/c/c8/Dubno_Rivnenska-Saint_Elijah_church-front_view.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/e/e5/Dubno_Rivnenska-Saint_Elijah_church-right_side_view.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/6/68/56-103-0228_Dubno_Church_RB.jpg",
  ],
  // Keep landmark places on Wikimedia (already real) — refresh covers if needed
  "sobor-proroka-illii": [
    "https://upload.wikimedia.org/wikipedia/commons/6/61/Dubno_St_Elias_Cathedral_RB.jpg",
  ],
  "sobor-rizdva-bohorodytsi": [
    "https://upload.wikimedia.org/wikipedia/commons/e/e5/%D0%A1%D0%BE%D0%B1%D0%BE%D1%80_%D0%A0%D1%96%D0%B7%D0%B4%D0%B2%D0%B0_%D0%9F%D1%80%D0%B5%D1%81%D0%B2%D1%8F%D1%82%D0%BE%D1%97_%D0%91%D0%BE%D0%B3%D0%BE%D1%80%D0%BE%D0%B4%D0%B8%D1%86%D1%96_%28%D0%94%D1%83%D0%B1%D0%BD%D0%BE%29.jpg",
  ],
  "spaso-preobrazhenska-tserkva": [
    "https://upload.wikimedia.org/wikipedia/commons/c/c9/56-103-0245_Dubno_Church_RB.jpg",
  ],
  "yuriivska-tserkva": [
    "https://upload.wikimedia.org/wikipedia/commons/b/be/Dubno_Church_of_St_George_RB.jpg",
  ],
  "kostel-yana-nepomuka": [
    "https://upload.wikimedia.org/wikipedia/commons/7/73/Dubno_Church_of_St_Jan_Nepomuk_RB.jpg",
  ],
  "mykolaivskyi-sobor": [
    "https://upload.wikimedia.org/wikipedia/commons/3/39/Dubno_Bernardine_Monastery_1_RB.jpg",
    "https://f.rivne.travel/location/3276/vCQTj.jpg",
  ],
};

async function fetchImageBuffer(
  url: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "DubnoHub/1.0 (religion photo fix)",
        Accept: "image/*,*/*",
        Referer: "https://dubnohub.vercel.app/",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength < 2000) return null;
    return { buffer, contentType: contentType.split(";")[0]! };
  } catch {
    return null;
  }
}

async function uploadPhotos(
  slug: string,
  urls: string[],
): Promise<string[]> {
  const uploaded: string[] = [];
  for (let i = 0; i < urls.length && uploaded.length < 3; i++) {
    const fetched = await fetchImageBuffer(urls[i]!);
    if (!fetched) {
      console.log(`  ✗ ${slug}[${i}] fetch failed`);
      continue;
    }
    const ext = fetched.contentType.includes("png")
      ? "png"
      : fetched.contentType.includes("webp")
        ? "webp"
        : "jpg";
    const blob = await put(
      `places/${slug}/real-${i}.${ext}`,
      fetched.buffer,
      {
        access: "public",
        addRandomSuffix: true,
        allowOverwrite: true,
        contentType: fetched.contentType,
      },
    );
    uploaded.push(blob.url);
    console.log(`  ✓ ${slug}[${i}]`);
  }
  return uploaded;
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is missing");
  }

  let updated = 0;
  for (const [slug, urls] of Object.entries(PHOTO_FIXES)) {
    const place = await prisma.place.findUnique({ where: { slug } });
    if (!place) {
      console.log(`skip missing ${slug}`);
      continue;
    }
    const images = await uploadPhotos(slug, urls);
    if (images.length === 0) {
      console.log(`skip empty ${slug}`);
      continue;
    }
    await prisma.place.update({
      where: { slug },
      data: { images },
    });
    updated++;
  }

  // Remove stock-only protestant placeholders that still have Unsplash-derived blobs
  // if we couldn't find building photos — clear to empty and leave admin to add later?
  // Prefer keeping SVG over wrong stock? User asked for real photos.
  // For remaining without sources, try Mapillary-less: leave note in console.

  const leftover = await prisma.place.findMany({
    where: {
      OR: [
        { category: { slug: "religiia" } },
        { categories: { some: { category: { slug: "religiia" } } } },
      ],
    },
    select: { slug: true, title: true, images: true },
  });

  console.log("\nReligion places after fix:");
  for (const p of leftover) {
    const img = p.images[0] ?? "";
    const kind = img.includes("unsplash")
      ? "STOCK"
      : img.endsWith(".svg") || img.includes("cover.svg")
        ? "SVG"
        : "OK";
    console.log(`  [${kind}] ${p.slug}`);
  }

  console.log("Updated:", updated);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
