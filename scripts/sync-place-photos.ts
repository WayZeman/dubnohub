import { config } from "dotenv";
import { put } from "@vercel/blob";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

type PhotoMap = Record<string, string[]>;

function extFrom(url: string, contentType: string | null): string {
  const fromType = contentType?.split(";")[0]?.trim();
  if (fromType === "image/jpeg") return "jpg";
  if (fromType === "image/png") return "png";
  if (fromType === "image/webp") return "webp";
  if (fromType === "image/gif") return "gif";
  const path = url.split("?")[0] ?? url;
  const m = path.match(/\.(jpe?g|png|webp|gif)$/i);
  return m?.[1]?.toLowerCase().replace("jpeg", "jpg") ?? "jpg";
}

async function fetchBuffer(url: string): Promise<{
  buffer: Buffer;
  contentType: string | null;
}> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "DubnoHub/1.0 (city directory photo sync)",
      Accept: "image/*,*/*",
    },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const contentType = res.headers.get("content-type");
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength < 1000) {
    throw new Error(`Too small (${buffer.byteLength}B): ${url}`);
  }
  return { buffer, contentType };
}

async function fetchBufferInsecure(url: string): Promise<{
  buffer: Buffer;
  contentType: string | null;
}> {
  // Fallback for hosts with broken TLS (e.g. expired school certs)
  const { execFileSync } = await import("node:child_process");
  const out = execFileSync(
    "curl",
    ["-sS", "-L", "--max-time", "20", "-k", "-A", "DubnoHub/1.0", url],
    { maxBuffer: 20 * 1024 * 1024 },
  );
  if (out.byteLength < 1000) {
    throw new Error(`Too small insecure (${out.byteLength}B): ${url}`);
  }
  return { buffer: out, contentType: null };
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is missing");
  }

  const photos = JSON.parse(
    readFileSync(resolve("scripts/place-photos.json"), "utf8"),
  ) as PhotoMap;

  let ok = 0;
  let fail = 0;

  for (const [slug, urls] of Object.entries(photos)) {
    const uploaded: string[] = [];
    for (let i = 0; i < urls.length; i++) {
      const source = urls[i]!;
      try {
        let buffer: Buffer;
        let contentType: string | null;
        try {
          ({ buffer, contentType } = await fetchBuffer(source));
        } catch {
          ({ buffer, contentType } = await fetchBufferInsecure(source));
        }
        const ext = extFrom(source, contentType);
        const blob = await put(`places/${slug}/${i}.${ext}`, buffer, {
          access: "public",
          addRandomSuffix: true,
          contentType: contentType?.startsWith("image/")
            ? contentType.split(";")[0]!
            : `image/${ext === "jpg" ? "jpeg" : ext}`,
        });
        uploaded.push(blob.url);
        console.log(`✓ ${slug}[${i}] → blob`);
      } catch (e) {
        console.error(`✗ ${slug}[${i}]`, e instanceof Error ? e.message : e);
        fail++;
      }
    }

    if (uploaded.length === 0) {
      console.error(`skip DB update for ${slug}: no images`);
      continue;
    }

    const updated = await prisma.place.updateMany({
      where: { slug },
      data: { images: uploaded },
    });
    if (updated.count === 0) {
      console.error(`place not found: ${slug}`);
      fail++;
    } else {
      ok++;
      // keep seed-friendly remote URLs; DB gets durable blob copies
      photos[slug] = uploaded;
    }
  }

  console.log(`Done. Updated places: ${ok}. Failures: ${fail}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
