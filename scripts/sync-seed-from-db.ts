import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { readFileSync, writeFileSync } from "node:fs";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

function fmtImages(urls: string[]) {
  return `images: [\n${urls.map((u) => `      "${u}",`).join("\n")}\n    ]`;
}

async function main() {
  const places = await prisma.place.findMany({
    select: { slug: true, images: true },
  });
  let s = readFileSync("prisma/seed.ts", "utf8");
  let updated = 0;

  for (const p of places) {
    if (!p.images?.length) continue;
    const re = new RegExp(
      `(slug:\\s*"${p.slug}"[\\s\\S]*?)images:\\s*\\[[\\s\\S]*?\\]`,
      "m",
    );
    if (!re.test(s)) {
      console.log("MISS", p.slug);
      continue;
    }
    s = s.replace(re, `$1${fmtImages(p.images)}`);
    updated++;
  }

  writeFileSync("prisma/seed.ts", s);

  const bad = places.filter((p) =>
    p.images.some((i) => i.includes("unsplash")),
  );
  console.log("seed synced", updated);
  console.log(
    "still unsplash:",
    bad.map((b) => b.slug),
  );
  console.log("sample", places[0]?.slug, places[0]?.images?.[0]?.slice(0, 90));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
