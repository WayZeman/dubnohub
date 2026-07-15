import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

const updates: Record<string, string[]> = {
  "sobor-rizdva-bohorodytsi": [
    "https://upload.wikimedia.org/wikipedia/commons/e/e5/%D0%A1%D0%BE%D0%B1%D0%BE%D1%80_%D0%A0%D1%96%D0%B7%D0%B4%D0%B2%D0%B0_%D0%9F%D1%80%D0%B5%D1%81%D0%B2%D1%8F%D1%82%D0%BE%D1%97_%D0%91%D0%BE%D0%B3%D0%BE%D1%80%D0%BE%D0%B4%D0%B8%D1%86%D1%96_%28%D0%94%D1%83%D0%B1%D0%BD%D0%BE%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/2/21/Church_of_the_Nativity_of_the_Theotokos%2C_Dubno_05.jpg",
  ],
  "kontraktovyi-budynok": [
    "https://upload.wikimedia.org/wikipedia/commons/f/f6/%D0%9A%D0%BE%D0%BD%D1%82%D1%80%D0%B0%D0%BA%D1%82%D0%BE%D0%B2%D0%B8%D0%B9_%D0%B1%D1%83%D0%B4%D0%B8%D0%BD%D0%BE%D0%BA_%D0%B2_%D0%94%D1%83%D0%B1%D0%BD%D0%BE.JPG",
  ],
  "pamyatnyk-shevchenku": [
    "https://upload.wikimedia.org/wikipedia/commons/4/47/Dubno_Shevchenko_Monument_RB.jpg",
  ],
};

async function main() {
  for (const [slug, images] of Object.entries(updates)) {
    await prisma.place.update({ where: { slug }, data: { images } });
    console.log("photos", slug);
  }
  const n = await prisma.place.count({
    where: { category: { slug: "pamyatky" } },
  });
  console.log("total pamyatky", n);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
