import { config } from "dotenv";
import { writeFileSync } from "fs";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      places: {
        orderBy: { title: "asc" },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          address: true,
          latitude: true,
          longitude: true,
          phone: true,
          website: true,
          facebook: true,
          instagram: true,
          workingHours: true,
          images: true,
          featured: true,
          updatedAt: true,
        },
      },
    },
  });

  const summary = categories.map((c) => {
    const places = c.places.map((p) => {
      const issues: string[] = [];
      if (!p.title?.trim()) issues.push("no_title");
      if (!p.description?.trim() || (p.description?.length ?? 0) < 40) {
        issues.push("weak_description");
      }
      if (!p.address?.trim()) issues.push("no_address");
      if (p.latitude == null || p.longitude == null) issues.push("no_coords");
      if (!p.images?.length) issues.push("no_photo");
      if (!p.phone && !p.website && !p.facebook && !p.instagram) {
        issues.push("no_contacts");
      }
      return {
        ...p,
        issueFlags: issues,
        descLen: p.description?.length ?? 0,
        photoCount: p.images?.length ?? 0,
      };
    });

    return {
      category: {
        id: c.id,
        name: c.name,
        slug: c.slug,
        sortOrder: c.sortOrder,
      },
      count: places.length,
      withPhoto: places.filter((p) => p.photoCount > 0).length,
      withCoords: places.filter((p) => p.latitude != null).length,
      withPhone: places.filter((p) => Boolean(p.phone)).length,
      withWebsite: places.filter((p) => Boolean(p.website)).length,
      flagged: places.filter((p) => p.issueFlags.length > 0).length,
      places,
    };
  });

  writeFileSync("/tmp/dubno-audit-full.json", JSON.stringify(summary, null, 2));

  console.log(
    JSON.stringify(
      summary.map((s) => ({
        cat: s.category.name,
        slug: s.category.slug,
        n: s.count,
        photo: `${s.withPhoto}/${s.count}`,
        coords: `${s.withCoords}/${s.count}`,
        phone: `${s.withPhone}/${s.count}`,
        web: `${s.withWebsite}/${s.count}`,
        flagged: s.flagged,
      })),
      null,
      2
    )
  );
  console.log(
    "TOTAL",
    summary.reduce((a, s) => a + s.count, 0)
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
