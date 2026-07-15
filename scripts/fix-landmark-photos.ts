import { config } from "dotenv";
import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

/**
 * Verified matching photos only (Commons / IGotoWorld for sculpture park).
 * Replaces wrong placeholders (Ikva river, Bazarchyk panoraма, etc.).
 */
const PHOTO_FIXES: Record<string, string[]> = {
  "budynok-elberta": [
    "https://upload.wikimedia.org/wikipedia/commons/0/01/%D0%91%D1%83%D0%B4%D0%B8%D0%BD%D0%BE%D0%BA_%D0%95%D0%BB%D1%8C%D0%B1%D0%B5%D1%80%D1%82%D0%B0_%28%D0%BC%D1%83%D1%80.%29%2C_%D0%BC.%D0%94%D1%83%D0%B1%D0%BD%D0%BE%2C_%D0%B2%D1%83%D0%BB.%D0%A2.%D0%91%D1%83%D0%BB%D1%8C%D0%B1%D0%B8%2C_4.jpg",
  ],
  "budynok-dombrovskoho": [
    "https://upload.wikimedia.org/wikipedia/commons/9/98/%D0%91%D1%83%D0%B4%D0%B8%D0%BD%D0%BE%D0%BA_%D0%94%D0%BE%D0%BC%D0%B1%D1%80%D0%BE%D0%B2%D1%81%D1%8C%D0%BA%D0%BE%D0%B3%D0%BE_%28%D0%BC%D1%83%D1%80.%29%2C_%D0%BC.%D0%94%D1%83%D0%B1%D0%BD%D0%BE%2C_%D0%B2%D1%83%D0%BB.%D0%93%D1%80%D1%83%D1%88%D0%B5%D0%B2%D1%81%D1%8C%D0%BA%D0%BE%D0%B3%D0%BE%2C_156.jpg",
  ],
  "sadyba-shuvalovykh": [
    "https://upload.wikimedia.org/wikipedia/commons/f/fb/%D0%94%D1%83%D0%B1%D0%BD%D0%BE_%D0%9A%D0%BE%D0%BC%D0%BF%D0%BB%D0%B5%D0%BA%D1%81_%D0%B1%D1%83%D0%B4%D1%96%D0%B2%D0%B5%D0%BB%D1%8C_%D0%B5%D0%BA%D0%BE%D0%BD%D0%BE%D0%BC%D1%96%D1%97_%D0%A8%D1%83%D0%B2%D0%B0%D0%BB%D0%BE%D0%B2%D0%BE%D1%97_%28XIX%E2%80%93XX_%D1%81%D1%82.%29.jpg",
  ],
  "sadyba-shevchenka-10": [
    "https://upload.wikimedia.org/wikipedia/commons/5/5c/%D0%A1%D0%B0%D0%B4%D0%B8%D0%B1%D0%B0_%28%D0%B7%D0%BC%D1%96%D1%88.%29%2C_%D0%BC.%D0%94%D1%83%D0%B1%D0%BD%D0%BE%2C_%D0%B2%D1%83%D0%BB.%D0%A8%D0%B5%D0%B2%D1%87%D0%B5%D0%BD%D0%BA%D0%B0%2C_10.jpg",
  ],
  "khmelefabruka": [
    "https://upload.wikimedia.org/wikipedia/commons/5/56/%D0%94%D1%83%D0%B1%D0%BD%D0%BE_%28113%29_%D0%A5%D0%BC%D0%B5%D0%BB%D0%B5%D1%84%D0%B0%D0%B1%D1%80%D0%B8%D0%BA%D0%B0.jpg",
  ],
  "istorychni-budynky-svobody": [
    "https://upload.wikimedia.org/wikipedia/commons/2/27/%D0%96%D0%B8%D1%82%D0%BB%D0%BE%D0%B2%D0%B8%D0%B9_%D0%B1%D1%83%D0%B4%D0%B8%D0%BD%D0%BE%D0%BA%2C_%D0%94%D1%83%D0%B1%D0%BD%D0%BE%2C_%D0%B2%D1%83%D0%BB._%D0%A1%D0%B2%D0%BE%D0%B1%D0%BE%D0%B4%D0%B8%2C_8.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/a/a7/%D0%94%D1%83%D0%B1%D0%BD%D0%BE_%D0%B2%D1%83%D0%BB._%D0%A1%D0%B2%D0%BE%D0%B1%D0%BE%D0%B4%D0%B8%2C_14.jpg",
  ],
  "kupezki-budynky-kyryla-mefodiia": [
    "https://upload.wikimedia.org/wikipedia/commons/2/22/%D0%91%D1%83%D0%B4%D0%B8%D0%BD%D0%BE%D0%BA_%D0%BA%D1%83%D0%BF%D1%86%D1%8F_%28%D0%BC%D1%83%D1%80.%29%2C_%D0%BC.%D0%94%D1%83%D0%B1%D0%BD%D0%BE%2C_%D0%B2%D1%83%D0%BB.%D0%9A%D0%B8%D1%80%D0%B8%D0%BB%D0%B0_%D1%96_%D0%9C%D0%B5%D1%84%D0%BE%D0%B4%D1%96%D1%8F%2C_6.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/1/12/%D0%94%D1%83%D0%B1%D0%BD%D0%BE_%D0%B2%D1%83%D0%BB.%D0%9A%D0%B8%D1%80%D0%B8%D0%BB%D0%B0_%D1%96_%D0%9C%D0%B5%D1%84%D0%BE%D0%B4%D1%96%D1%8F%2C_10.jpg",
  ],
  "torhovi-budynky-drahomanova": [
    "https://upload.wikimedia.org/wikipedia/commons/e/ed/Dubno_Drahomanova_1_RB.jpg",
  ],
  "kolyshnia-likarnia": [
    "https://upload.wikimedia.org/wikipedia/commons/1/1f/%D0%9A%D0%BE%D0%BB%D0%B8%D1%88%D0%BD%D1%8F_%D0%BB%D1%96%D0%BA%D0%B0%D1%80%D0%BD%D1%8F_%28%D0%BC%D1%83%D1%80.%29%2C_%D0%BC.%D0%94%D1%83%D0%B1%D0%BD%D0%BE%2C_%D0%B2%D1%83%D0%BB.%D0%92%D1%96%D0%BD%D0%BD%D0%B8%D1%87%D0%B5%D0%BD%D0%BA%D0%B0%2C_18_1.jpg",
  ],
  "kontraktovyi-budynok": [
    "https://upload.wikimedia.org/wikipedia/commons/5/5a/DSC_0363_%D0%91%D1%83%D0%B4%D0%B8%D0%BD%D0%BE%D0%BA_%D0%BA%D0%BE%D0%BD%D1%82%D1%80%D0%B0%D0%BA%D1%82%D1%96%D0%B2.jpg",
  ],
  "park-derevianykh-skulptur": [
    "https://ua.igotoworld.com/frontend/webcontent/websites/1/images/gallery/2691213_800x600_P1000869.jpg",
    "https://ua.igotoworld.com/frontend/webcontent/websites/1/images/gallery/2691220_370x246_P1000868.jpg",
  ],
  "kostel-yana-nepomuka": [
    "https://upload.wikimedia.org/wikipedia/commons/7/73/Dubno_Church_of_St_Jan_Nepomuk_RB.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/9/99/Dubno_Belfry_of_Church_of_St_Jan_Nepomuk_RB.jpg",
  ],
  // Museum sits in the castle complex — use gate/palace, not generic cityscape
  "kraieznavchyi-muzei": [
    "https://upload.wikimedia.org/wikipedia/commons/7/7f/Dubno_Castle_1_RB.jpg",
  ],
  "aleia-nebesnoi-sotni": [
    "https://upload.wikimedia.org/wikipedia/commons/3/38/Nebesna_Sotnja.Ostrivok.jpg",
  ],
};

/** No verified photo found — remove misleading image */
const CLEAR_IMAGES: string[] = [];

async function maybeUploadToBlob(
  slug: string,
  urls: string[],
): Promise<string[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return urls;
  const out: string[] = [];
  for (let i = 0; i < urls.length; i++) {
    const source = urls[i]!;
    try {
      await new Promise((r) => setTimeout(r, 400));
      const res = await fetch(source, {
        headers: { "User-Agent": "DubnoHub/1.0", Accept: "image/*,*/*" },
        redirect: "follow",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.byteLength < 800) throw new Error("too small");
      const contentType = res.headers.get("content-type") || "image/jpeg";
      const ext = contentType.includes("png") ? "png" : "jpg";
      const blob = await put(`places/${slug}/${i}.${ext}`, buffer, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: contentType.startsWith("image/")
          ? contentType.split(";")[0]!
          : "image/jpeg",
      });
      out.push(blob.url);
      console.log(`  blob ${slug}[${i}]`);
    } catch (error) {
      console.warn(
        `  keep source ${slug}[${i}]`,
        error instanceof Error ? error.message : error,
      );
      out.push(source);
    }
  }
  return out;
}

async function main() {
  for (const [slug, urls] of Object.entries(PHOTO_FIXES)) {
    console.log("fix", slug);
    const existing = await prisma.place.findUnique({
      where: { slug },
      select: { images: true },
    });
    const hasBlob =
      existing?.images.some((url) => url.includes("blob.vercel-storage.com")) ??
      false;
    if (hasBlob) {
      console.log("  keep existing blob images");
      continue;
    }
    const images = await maybeUploadToBlob(slug, urls);
    await prisma.place.update({
      where: { slug },
      data: { images },
    });
  }

  for (const slug of CLEAR_IMAGES) {
    await prisma.place.update({
      where: { slug },
      data: { images: [] },
    });
    console.log("cleared images", slug);
  }

  // Spot-check remaining places still on known-bad placeholders
  const bad = await prisma.place.findMany({
    where: {
      category: { slug: "pamyatky" },
      OR: [
        { images: { has: "Базарчик" } },
        { images: { hasSome: [] } },
      ],
    },
    select: { slug: true, images: true },
  });
  // Prisma hasSome empty is useless — check manually
  const all = await prisma.place.findMany({
    where: { category: { slug: "pamyatky" } },
    select: { slug: true, title: true, images: true },
  });
  console.log("\nAudit:");
  for (const p of all) {
    const joined = p.images.join(" ");
    const suspicious =
      joined.includes("Базарчик") ||
      joined.includes("Иква") ||
      joined.includes("%D0%98%D0%BA%D0%B2%D0%B0") ||
      joined.includes("Dubenska_MCB") ||
      (p.slug === "kupezki-budynky-kyryla-mefodiia" &&
        joined.includes("Synagogue")) ||
      (p.slug === "sadyba-shevchenka-10" && joined.includes("Carmelite")) ||
      (p.slug === "torhovi-budynky-drahomanova" &&
        joined.includes("Nepomuk")) ||
      (p.slug === "park-derevianykh-skulptur" && joined.includes("Ikva"));
    const empty = p.images.length === 0;
    console.log(
      empty ? "EMPTY" : suspicious ? "BAD?" : "ok",
      p.slug,
      p.images[0]?.slice(-50) ?? "-",
    );
  }
  void bad;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
