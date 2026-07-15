import { config } from "dotenv";
import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

const URLS: Record<string, string[]> = {
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
  khmelefabruka: [
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
  "kostel-yana-nepomuka": [
    "https://upload.wikimedia.org/wikipedia/commons/7/73/Dubno_Church_of_St_Jan_Nepomuk_RB.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/9/99/Dubno_Belfry_of_Church_of_St_Jan_Nepomuk_RB.jpg",
  ],
  "kraieznavchyi-muzei": [
    "https://upload.wikimedia.org/wikipedia/commons/7/7f/Dubno_Castle_1_RB.jpg",
  ],
};

async function main() {
  for (const [slug, list] of Object.entries(URLS)) {
    const out: string[] = [];
    for (let i = 0; i < list.length; i++) {
      await new Promise((r) => setTimeout(r, 2500));
      const source = list[i]!;
      try {
        const res = await fetch(source, {
          headers: {
            "User-Agent":
              "DubnoHub/1.0 (heritage catalog; https://dubnohub.vercel.app)",
          },
          redirect: "follow",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buffer = Buffer.from(await res.arrayBuffer());
        const blob = await put(`places/${slug}/${i}.jpg`, buffer, {
          access: "public",
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: "image/jpeg",
        });
        out.push(blob.url);
        console.log("blob", slug, i);
      } catch (error) {
        out.push(source);
        console.warn(
          "fail",
          slug,
          i,
          error instanceof Error ? error.message : error,
        );
      }
    }
    await prisma.place.update({ where: { slug }, data: { images: out } });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
