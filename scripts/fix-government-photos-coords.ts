import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

/** Corrected pins (Google Maps address / place pages, cross-checked). */
const COORDS: Record<
  string,
  { latitude: number; longitude: number; address?: string }
> = {
  "miska-rada-dubno": { latitude: 50.4208735, longitude: 25.7452898 },
  "cnap-dubno": { latitude: 50.4208735, longitude: 25.7452898 },
  "cnap-vrm-dubno": { latitude: 50.418555, longitude: 25.7437272 },
  "soczahyst-dubno": { latitude: 50.418555, longitude: 25.7437272 },
  "rda-dubno": { latitude: 50.4182197, longitude: 25.7357284 },
  "rayonna-rada-dubno": { latitude: 50.4182197, longitude: 25.7357284 },
  "sud-dubno": { latitude: 50.4187959, longitude: 25.7379333 },
  "policia-dubno": {
    latitude: 50.4218685,
    longitude: 25.7435122,
    address: "вул. Пекарська, 10, Дубно",
  },
  "prokuratura-dubno": { latitude: 50.4175387, longitude: 25.7345523 },
  "podatkova-dubno": { latitude: 50.4021606, longitude: 25.75914 },
  "dvs-dubno": { latitude: 50.4021606, longitude: 25.75914 },
  "pensiynyi-fond-dubno": { latitude: 50.4237165, longitude: 25.7429349 },
  "tck-dubno": { latitude: 50.4216657, longitude: 25.7424975 },
  "dsns-dubno": { latitude: 50.3922105, longitude: 25.7578057 },
  "racs-dubno": { latitude: 50.4189028, longitude: 25.7440387 },
  "notarialna-1-dubno": { latitude: 50.4210928, longitude: 25.7411074 },
  "notarialna-2-dubno": { latitude: 50.4210537, longitude: 25.744658 },
  "tsentr-sssdm-dubno": { latitude: 50.4210537, longitude: 25.744658 },
  "tersentr-dubno": { latitude: 50.3960805, longitude: 25.757607 },
  "upravlinnya-osvity-dubno": { latitude: 50.4204222, longitude: 25.7393433 },
  "arkhiv-dubno": { latitude: 50.4077502, longitude: 25.7739346 },
};

/**
 * Verified façades only (signage / address SV). Local files under /tmp/gov-photos/v2
 * or remote URLs. Shared buildings reuse the same blob key via `blobSlug`.
 */
type PhotoSpec = {
  local?: string;
  remote?: string;
  /** Blob path prefix (defaults to place slug) */
  blobSlug?: string;
};

const PHOTOS: Record<string, PhotoSpec> = {
  "miska-rada-dubno": { local: "/tmp/gov-photos/v2/miska.jpg" },
  "cnap-dubno": {
    local: "/tmp/gov-photos/v2/miska.jpg",
    blobSlug: "miska-rada-dubno",
  },
  "rda-dubno": { local: "/tmp/gov-photos/v2/rda.jpg" },
  "rayonna-rada-dubno": {
    local: "/tmp/gov-photos/v2/rda.jpg",
    blobSlug: "rda-dubno",
  },
  "sud-dubno": { local: "/tmp/gov-photos/v2/sud.jpg" },
  "podatkova-dubno": { local: "/tmp/gov-photos/v2/podatkova.jpg" },
  "dvs-dubno": {
    local: "/tmp/gov-photos/v2/podatkova.jpg",
    blobSlug: "podatkova-dubno",
  },
  "dsns-dubno": { local: "/tmp/gov-photos/v2/dsns_facade.jpg" },
  "soczahyst-dubno": { local: "/tmp/gov-photos/v2/soc_g.jpg" },
  "cnap-vrm-dubno": {
    local: "/tmp/gov-photos/v2/soc_g.jpg",
    blobSlug: "soczahyst-dubno",
  },
  "prokuratura-dubno": { local: "/tmp/gov-photos/v2/prokur_sv.jpg" },
  "notarialna-2-dubno": { local: "/tmp/gov-photos/v2/notary2_sv.jpg" },
  "tsentr-sssdm-dubno": {
    local: "/tmp/gov-photos/v2/notary2_sv.jpg",
    blobSlug: "notarialna-2-dubno",
  },
  "notarialna-1-dubno": { local: "/tmp/gov-photos/v2/notary1_sv.jpg" },
  "arkhiv-dubno": { local: "/tmp/gov-photos/v2/arkhiv_sv.jpg" },
  "tck-dubno": { local: "/tmp/gov-photos/v2/tck_sv.jpg" },
  "upravlinnya-osvity-dubno": {
    remote:
      "https://q4xumapvmzzua4yh.public.blob.vercel-storage.com/places/budynok-elberta/0.jpg",
  },
};

async function uploadPhoto(slug: string, spec: PhotoSpec): Promise<string> {
  const blobSlug = spec.blobSlug ?? slug;
  let buffer: Buffer;
  let contentType = "image/jpeg";

  if (spec.local) {
    buffer = await readFile(spec.local);
  } else if (spec.remote) {
    if (spec.remote.includes("blob.vercel-storage.com")) {
      return spec.remote;
    }
    const res = await fetch(spec.remote, {
      headers: { "User-Agent": "DubnoHub/1.0", Accept: "image/*,*/*" },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${spec.remote}`);
    buffer = Buffer.from(await res.arrayBuffer());
    contentType = res.headers.get("content-type")?.split(";")[0] || contentType;
  } else {
    throw new Error(`No source for ${slug}`);
  }

  if (buffer.byteLength < 800) throw new Error(`too small: ${slug}`);

  const blob = await put(`places/${blobSlug}/0.jpg`, buffer, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
  });
  return blob.url;
}

async function main() {
  const uploaded = new Map<string, string>();

  for (const [slug, spec] of Object.entries(PHOTOS)) {
    const key = spec.blobSlug ?? slug;
    if (!uploaded.has(key)) {
      console.log("upload", key);
      uploaded.set(key, await uploadPhoto(slug, spec));
    }
  }

  for (const [slug, coords] of Object.entries(COORDS)) {
    const existing = await prisma.place.findUnique({
      where: { slug },
      select: { id: true, images: true, address: true },
    });
    if (!existing) {
      console.warn("missing", slug);
      continue;
    }

    const photoKey = PHOTOS[slug]
      ? (PHOTOS[slug]!.blobSlug ?? slug)
      : null;
    const imageUrl = photoKey ? uploaded.get(photoKey) : undefined;

    await prisma.place.update({
      where: { slug },
      data: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        ...(coords.address ? { address: coords.address } : {}),
        ...(imageUrl ? { images: [imageUrl] } : {}),
      },
    });

    console.log(
      `✓ ${slug} → ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` +
        (imageUrl ? " +photo" : " (coords only)"),
    );
  }

  // Police description note about official address №10
  await prisma.place.updateMany({
    where: { slug: "policia-dubno" },
    data: {
      description:
        "Дубенський районний відділ поліції ГУНП в Рівненській області. Офіційна адреса (ГУНП / міська рада): вул. Пекарська, 10. Екстрений виклик: 102. Телефон чергової: +380365632702.",
    },
  });

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
