import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  const places = await prisma.place.findMany({
    where: { category: { slug: "navchalni-zaklady" } },
    orderBy: { title: "asc" },
    select: {
      slug: true,
      title: true,
      description: true,
      address: true,
      latitude: true,
      longitude: true,
      website: true,
      images: true,
    },
  });
  for (const p of places) {
    console.log(
      JSON.stringify({
        slug: p.slug,
        title: p.title,
        hasPhoto: p.images.length > 0,
        lat: p.latitude,
        lng: p.longitude,
        website: p.website,
        address: p.address,
      })
    );
  }
  await prisma.$disconnect();
}

main();
