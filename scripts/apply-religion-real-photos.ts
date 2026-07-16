import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

/** Real Dubno sources only — Wikimedia, rivne.travel, UGCC / photographers.ua */
const REAL: Record<string, string[]> = {
  "svyato-voznesenskyi-khram": [
    "https://f.rivne.travel/location/4280/AhHYW.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/e/e2/%D0%A1%D0%B2%D1%8F%D1%82%D0%BE_-%D0%92%D0%BE%D0%B7%D0%BD%D0%B5%D1%81%D0%B5%D0%BD%D1%81%D1%8C%D0%BA%D0%B8%D0%B9.jpg",
  ],
  "svyato-voznesenska-tserkva-pidbortsi": [
    "https://f.rivne.travel/location/4279/CVEvJ.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/1/18/Wooden_Church_of_the_Ascension_in_Dubno_01.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/d/d2/Wooden_Church_of_the_Ascension_in_Dubno_03.jpg",
  ],
  "tserkva-voznesinnia-hospodnoho": [
    "https://i.photographers.ua/images/pictures/2466/4jpg.jpg",
    "https://map.ugcc.ua/pub/base/0c97ab6ed7dcbc10.jpg",
  ],
  "tserkva-arkhanhela-havryila": [
    "https://f.rivne.travel/location/4287/d5Qn_.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/f/f1/%D0%94%D1%83%D0%B1%D0%BD%D0%BE_%D0%91%D1%83%D0%B4%D0%B8%D0%BD%D0%BE%D0%BA_%D0%94%D0%BE%D0%BC%D0%B1%D1%80%D0%BE%D0%B2%D1%81%D1%8C%D0%BA%D0%BE%D0%B3%D0%BE_%D0%A6%D0%B5%D1%80%D0%BA%D0%B2%D0%B0_%D0%B0%D1%80%D1%85%D0%B0%D0%BD%D0%B3%D0%B5%D0%BB%D0%B0_%D0%93%D0%B0%D0%B2%D1%80%D0%B8%D1%97%D0%BB%D0%B0.jpg",
  ],
  "tserkva-ehb-vifaniia": ["https://f.rivne.travel/location/4281/U7Vmw.png"],
  "kostel-neporochnogo-zachattia": [
    "https://f.rivne.travel/location/3276/vCQTj.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/3/39/Dubno_Bernardine_Monastery_1_RB.jpg",
  ],
  "illinskyi-khram-stara": [
    "https://upload.wikimedia.org/wikipedia/commons/c/c8/Dubno_Rivnenska-Saint_Elijah_church-front_view.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/6/68/56-103-0228_Dubno_Church_RB.jpg",
  ],
  "mykolaivskyi-sobor": [
    "https://upload.wikimedia.org/wikipedia/commons/3/39/Dubno_Bernardine_Monastery_1_RB.jpg",
    "https://f.rivne.travel/location/3276/vCQTj.jpg",
  ],
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
};

const CLEAR_STOCK = [
  "dim-molytvy-ehb-dubno",
  "nehalezhna-tserkva-ehb-vidrodzhennia",
  "tserkva-adventystiv-dubno",
  "tserkva-svyatoho-andriia",
];

async function main() {
  for (const [slug, images] of Object.entries(REAL)) {
    const r = await prisma.place.updateMany({
      where: { slug },
      data: { images },
    });
    console.log("set", slug, r.count);
  }
  for (const slug of CLEAR_STOCK) {
    const r = await prisma.place.updateMany({
      where: { slug },
      data: { images: [] },
    });
    console.log("cleared stock", slug, r.count);
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
