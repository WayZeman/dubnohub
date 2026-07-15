import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

const photos: Record<string, string[]> = {
  "lutska-brama": [
    "https://upload.wikimedia.org/wikipedia/commons/d/dc/Dubno_Lutsk_Gate_RB.jpg",
  ],
  "velyka-synahoha": [
    "https://upload.wikimedia.org/wikipedia/commons/1/1b/Dubno_Synagogue_RB.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/8/8f/Dubno_synagogue_02.jpg",
  ],
  "kostel-yana-nepomuka": [
    "https://upload.wikimedia.org/wikipedia/commons/7/73/Dubno_Church_of_St_Jan_Nepomuk_RB.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/9/99/Dubno_Belfry_of_Church_of_St_Jan_Nepomuk_RB.jpg",
  ],
  "mykolaivskyi-sobor": [
    "https://upload.wikimedia.org/wikipedia/commons/3/39/Dubno_Bernardine_Monastery_1_RB.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/f/fa/Bernardine_Monastery_in_Dubno_06.jpg",
  ],
  "yuriivska-tserkva": [
    "https://upload.wikimedia.org/wikipedia/commons/b/be/Dubno_Church_of_St_George_RB.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/e/e6/Dubno_Bell_Tower_of_Church_of_St_George_RB.jpg",
  ],
  "monastyr-karmelitek": [
    "https://upload.wikimedia.org/wikipedia/commons/d/d1/Dubno_Carmelite_monastery_1_RB.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/5/5b/Dubno_Carmelite_monastery_2_RB.jpg",
  ],
  "spaso-preobrazhenska-tserkva": [
    "https://upload.wikimedia.org/wikipedia/commons/c/c9/56-103-0245_Dubno_Church_RB.jpg",
  ],
  "sobor-proroka-illii": [
    "https://upload.wikimedia.org/wikipedia/commons/6/61/Dubno_St_Elias_Cathedral_RB.jpg",
  ],
  "tarakanivskyi-fort": [
    "https://upload.wikimedia.org/wikipedia/commons/4/42/56-216-0041_Tarakaniv_Fort_RB.jpg",
  ],
};

async function main() {
  for (const [slug, images] of Object.entries(photos)) {
    const place = await prisma.place.findUnique({
      where: { slug },
      select: { images: true },
    });
    if (!place) continue;
    if (place.images.length === 0) {
      await prisma.place.update({ where: { slug }, data: { images } });
      console.log("filled", slug, images.length);
    } else {
      console.log("keep", slug, place.images.length);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
