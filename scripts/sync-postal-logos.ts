import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

async function upload(local: string, remote: string) {
  const buffer = await readFile(resolve(process.cwd(), local));
  const blob = await put(remote, buffer, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "image/png",
  });
  console.log("uploaded", blob.url);
  return blob.url;
}

async function main() {
  const np = await upload(
    "public/brands/nova-poshta-logo.png",
    "brands/nova-poshta-logo.png",
  );
  const up = await upload(
    "public/brands/ukrposhta-logo.png",
    "brands/ukrposhta-logo.png",
  );

  const npRes = await prisma.place.updateMany({
    where: { slug: { startsWith: "nova-poshta-" } },
    data: { images: [np] },
  });
  const upRes = await prisma.place.updateMany({
    where: { slug: { startsWith: "ukrposhta-" } },
    data: { images: [up] },
  });

  console.log("updated NP", npRes.count, "UP", upRes.count);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
