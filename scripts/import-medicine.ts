import { config } from "dotenv";
import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";
import { geocodeAddress } from "@/lib/geocode-dubno";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

type MedKind =
  | "polyclinic"
  | "primary"
  | "ambulatory"
  | "private"
  | "ophthalmology"
  | "pediatrics"
  | "certificates";

type MedPlace = {
  slug: string;
  title: string;
  kind: MedKind;
  typeLabel: string;
  description: string;
  address: string;
  phone: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  latitude?: number;
  longitude?: number;
  photoUrls?: string[];
};

/**
 * Medical facilities in Dubno city.
 * Coords: OSM hospital/clinic where available, else Nominatim / provided maps.
 */
const PLACES: MedPlace[] = [
  {
    slug: "miska-poliklinika-dubno",
    title: "КНП «Міська поліклініка» Дубенської міської ради",
    kind: "polyclinic",
    typeLabel: "Державна поліклініка",
    description:
      "Багатопрофільна консультативно-діагностична поліклініка. Прийом вузьких спеціалістів, лабораторія, УЗД, рентген, ендоскопія, хірургія, профогляди.",
    address: "вул. Михайла Грушевського, 105, Дубно",
    phone: "+380365622011",
    website: null,
    facebook: null,
    instagram: null,
    // OSM hospital cluster on Hrushevskoho near 103–105
    latitude: 50.3962744,
    longitude: 25.7587792,
  },
  {
    slug: "cpmssd-zdorovia-plus-dubno",
    title: "КНП «Центр первинної медико-санітарної допомоги «Здоровʼя+»",
    kind: "primary",
    typeLabel: "Центр первинної медико-санітарної допомоги",
    description:
      "Сімейні лікарі, терапевти, педіатри, вакцинація, декларації з лікарями.",
    address: "вул. Михайла Грушевського, 105, Дубно",
    phone: "+380365622011",
    website: "https://dubno.med.ukraina.org.ua",
    facebook: "https://facebook.com/groups/618855845229794",
    instagram: null,
    latitude: 50.39635,
    longitude: 25.75895,
  },
  {
    slug: "ambulatoriia-1-zdorovia-plus",
    title: "Амбулаторія №1 ЦПМСД «Здоровʼя+»",
    kind: "ambulatory",
    typeLabel: "Амбулаторія сімейної медицини",
    description: "Прийом сімейних лікарів.",
    address: "вул. Михайла Грушевського, 105, Дубно",
    phone: "+380504009095",
    website: "https://dubno-centr-zdorov.in.ua",
    facebook: null,
    instagram: null,
    latitude: 50.39642,
    longitude: 25.7591,
  },
  {
    slug: "ambulatoriia-2-zdorovia-plus",
    title: "Амбулаторія №2 ЦПМСД «Здоровʼя+»",
    kind: "ambulatory",
    typeLabel: "Амбулаторія сімейної медицини",
    description: "Первинна медична допомога.",
    address: "вул. Михайла Грушевського, 105, Дубно",
    phone: "+380504009095",
    website: "https://dubno-centr-zdorov.in.ua",
    facebook: null,
    instagram: null,
    latitude: 50.3965,
    longitude: 25.75925,
  },
  {
    slug: "ambulatoriia-3-zdorovia-plus",
    title: "Амбулаторія №3 ЦПМСД «Здоровʼя+»",
    kind: "ambulatory",
    typeLabel: "Амбулаторія сімейної медицини",
    description: "Первинна медична допомога.",
    address: "вул. Михайла Грушевського, 103, Дубно",
    phone: "+380504009065",
    website: "https://dubno-centr-zdorov.in.ua",
    facebook: null,
    instagram: null,
    // OSM: hospital / дитяча поліклініка, Hrushevskoho 103
    latitude: 50.3973484,
    longitude: 25.7604758,
  },
  {
    slug: "piramida-ldc-dubno",
    title: "Лікувально-діагностичний центр «Піраміда»",
    kind: "private",
    typeLabel: "Приватний медичний центр",
    description: "Консультації лікарів, лабораторна діагностика, обстеження.",
    address: "вул. Скарбова, 6, Дубно",
    phone: "+380993209943",
    website: null,
    facebook: null,
    instagram: null,
    latitude: 50.4210217,
    longitude: 25.7422622,
  },
  {
    slug: "viziia-med-centr-dubno",
    title: "Медичний центр «Візія»",
    kind: "ophthalmology",
    typeLabel: "Приватний медичний центр",
    description: "Офтальмологія, консультації лікарів, діагностика зору.",
    address: "пров. Мирогощанський, 35, Дубно",
    phone: "+380983229898",
    website: null,
    facebook: null,
    instagram: null,
    latitude: 50.4086614,
    longitude: 25.7653964,
  },
  {
    slug: "pediatriia-liudmyla-iusyn",
    title: "Педіатрія Людмили Юсин",
    kind: "pediatrics",
    typeLabel: "Приватна педіатрична клініка",
    description: "Консультації педіатра, дитяча медицина.",
    address: "вул. Михайла Грушевського, 44, Дубно",
    phone: "+380967914041",
    website: null,
    facebook: null,
    instagram: null,
    latitude: 50.4048,
    longitude: 25.7542,
  },
  {
    slug: "medychni-dovidky-dubno",
    title: "Медичний центр «Медичні довідки»",
    kind: "certificates",
    typeLabel: "Медичний центр",
    description: "Медичні довідки, профогляди.",
    address: "вул. Михайла Грушевського, 170, Дубно",
    phone: null,
    website: null,
    facebook: null,
    instagram: null,
    latitude: 50.3963802,
    longitude: 25.757006,
  },
];

const KIND_META: Record<
  MedKind,
  { label: string; color: string; accent: string }
> = {
  polyclinic: { label: "Поліклініка", color: "#0f766e", accent: "#5eead4" },
  primary: { label: "Первинна допомога", color: "#0369a1", accent: "#7dd3fc" },
  ambulatory: { label: "Амбулаторія", color: "#1d4ed8", accent: "#93c5fd" },
  private: { label: "Медцентр", color: "#6d28d9", accent: "#c4b5fd" },
  ophthalmology: { label: "Офтальмологія", color: "#0e7490", accent: "#67e8f9" },
  pediatrics: { label: "Педіатрія", color: "#be185d", accent: "#f9a8d4" },
  certificates: { label: "Довідки", color: "#475569", accent: "#cbd5e1" },
};

function medicineSvg(kind: MedKind, title: string): Buffer {
  const meta = KIND_META[kind];
  const safeTitle = title
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  const short =
    safeTitle.length > 44 ? `${safeTitle.slice(0, 42)}…` : safeTitle;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${meta.color}"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)"/>
  <circle cx="980" cy="140" r="200" fill="${meta.accent}" opacity="0.16"/>
  <circle cx="140" cy="680" r="220" fill="${meta.accent}" opacity="0.12"/>
  <g fill="${meta.accent}" opacity="0.95">
    <rect x="520" y="220" width="80" height="240" rx="16"/>
    <rect x="440" y="300" width="240" height="80" rx="16"/>
  </g>
  <text x="80" y="180" fill="#fff" font-family="Georgia, serif" font-size="34" opacity="0.85">${meta.label}</text>
  <text x="80" y="520" fill="#fff" font-family="Georgia, serif" font-size="44" font-weight="700">${short}</text>
  <text x="80" y="580" fill="${meta.accent}" font-family="system-ui, sans-serif" font-size="28">Медицина · Дубно</text>
</svg>`;

  return Buffer.from(svg, "utf8");
}

async function ensureCategory() {
  const maxSort = await prisma.category.aggregate({
    _max: { sortOrder: true },
  });
  const sortOrder = Math.max(18, (maxSort._max.sortOrder ?? 0) + 1);

  return prisma.category.upsert({
    where: { slug: "medycyna" },
    create: {
      name: "Медицина",
      slug: "medycyna",
      icon: "Hospital",
      description:
        "Поліклініки, ЦПМСД, амбулаторії та приватні медичні центри Дубна",
      sortOrder,
    },
    update: {
      name: "Медицина",
      icon: "Hospital",
      description:
        "Поліклініки, ЦПМСД, амбулаторії та приватні медичні центри Дубна",
    },
  });
}

async function fetchImageBuffer(
  url: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "DubnoHub/1.0 (medicine import)",
        Accept: "image/*,*/*",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength < 800) return null;
    return { buffer, contentType: contentType.split(";")[0]! };
  } catch {
    return null;
  }
}

async function fetchOgImage(website: string): Promise<string | null> {
  try {
    const res = await fetch(website, {
      headers: {
        "User-Agent": "DubnoHub/1.0 (medicine import)",
        Accept: "text/html",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const patterns = [
      /property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
      /content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
      /rel=["']apple-touch-icon[^"']*["'][^>]*href=["']([^"']+)["']/i,
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m?.[1]) {
        try {
          return new URL(m[1], website).toString();
        } catch {
          /* ignore */
        }
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

async function resolvePlaceImage(place: MedPlace): Promise<string> {
  const candidates = [...(place.photoUrls ?? [])];
  if (place.website) {
    const og = await fetchOgImage(place.website);
    if (og) candidates.push(og);
  }

  for (const url of candidates) {
    const fetched = await fetchImageBuffer(url);
    if (!fetched) continue;
    const ext = fetched.contentType.includes("svg")
      ? "svg"
      : fetched.contentType.includes("png")
        ? "png"
        : fetched.contentType.includes("webp")
          ? "webp"
          : "jpg";
    const blob = await put(
      `places/${place.slug}/cover.${ext}`,
      fetched.buffer,
      {
        access: "public",
        addRandomSuffix: true,
        allowOverwrite: true,
        contentType: fetched.contentType,
      },
    );
    return blob.url;
  }

  const svg = medicineSvg(place.kind, place.title);
  const blob = await put(`places/${place.slug}/cover.svg`, svg, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "image/svg+xml",
  });
  return blob.url;
}

async function resolveCoords(
  place: MedPlace,
): Promise<{ latitude: number; longitude: number; source: string }> {
  if (
    typeof place.latitude === "number" &&
    typeof place.longitude === "number"
  ) {
    return {
      latitude: place.latitude,
      longitude: place.longitude,
      source: "manual-or-osm",
    };
  }

  const geo = await geocodeAddress(place.address, {
    slug: place.slug,
    delayMs: 1100,
  });
  if (geo) {
    return {
      latitude: geo.latitude,
      longitude: geo.longitude,
      source: geo.source,
    };
  }

  return {
    latitude: 50.4165,
    longitude: 25.745,
    source: "city-center-fallback",
  };
}

function buildDescription(place: MedPlace): string {
  return `${place.description} Тип: ${place.typeLabel}.`;
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is missing");
  }

  const category = await ensureCategory();
  let created = 0;
  let updated = 0;

  for (const place of PLACES) {
    const coords = await resolveCoords(place);
    const image = await resolvePlaceImage(place);

    const data = {
      title: place.title,
      slug: place.slug,
      description: buildDescription(place),
      categoryId: category.id,
      address: place.address,
      latitude: coords.latitude,
      longitude: coords.longitude,
      phone: place.phone,
      website: place.website,
      facebook: place.facebook,
      instagram: place.instagram,
      workingHours: "Уточнюйте в закладі",
      featured: false,
      rating: 0,
      images: [image],
    };

    const existing = await prisma.place.findUnique({
      where: { slug: place.slug },
    });

    if (existing) {
      await prisma.place.update({
        where: { slug: place.slug },
        data: {
          title: data.title,
          description: data.description,
          categoryId: data.categoryId,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          phone: data.phone,
          website: data.website,
          facebook: data.facebook,
          instagram: data.instagram,
          workingHours: data.workingHours,
          images: data.images,
        },
      });
      updated++;
    } else {
      await prisma.place.create({ data });
      created++;
    }

    console.log(
      `  • ${place.title} — ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)} (${coords.source})`,
    );
  }

  console.log("Medicine Dubno import done:", {
    total: PLACES.length,
    created,
    updated,
    categoryId: category.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
