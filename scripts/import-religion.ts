import { config } from "dotenv";
import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";
import { geocodeAddress } from "@/lib/geocode-dubno";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

type ReligionKind =
  | "orthodox"
  | "catholic"
  | "protestant"
  | "monastery"
  | "christian";

type ReligionPlace = {
  slug: string;
  title: string;
  kind: ReligionKind;
  typeLabel: string;
  denomination: string;
  address: string;
  phone: string | null;
  website: string | null;
  facebook: string | null;
  /** Existing place slug to attach Religion category to (no duplicate) */
  existingSlug?: string;
  latitude?: number;
  longitude?: number;
  photoUrls?: string[];
};

/**
 * Religious sites in Dubno.
 * Existing landmark matches keep their primary category and gain «Релігія».
 */
const PLACES: ReligionPlace[] = [
  {
    slug: "svyato-illinskyi-sobor-ptsu",
    title: "Свято-Іллінський собор ПЦУ",
    kind: "orthodox",
    typeLabel: "Православний собор",
    denomination: "Православна Церква України",
    address: "вул. Данила Галицького, 13, Дубно",
    phone: null,
    website: null,
    facebook: null,
    existingSlug: "sobor-proroka-illii",
  },
  {
    slug: "sobor-rizdva-presviatoi-bohorodytsi",
    title: "Собор Різдва Пресвятої Богородиці",
    kind: "orthodox",
    typeLabel: "Православний собор",
    denomination: "Православна Церква України",
    address: "вул. Павла Полуботка, 17, Дубно",
    phone: null,
    website: null,
    facebook: null,
    existingSlug: "sobor-rizdva-bohorodytsi",
  },
  {
    slug: "svyato-voznesenskyi-khram",
    title: "Свято-Вознесенський храм",
    kind: "orthodox",
    typeLabel: "Православний храм",
    denomination: "Православна Церква України",
    address: "вул. Миру, 6, Дубно",
    phone: null,
    website: null,
    facebook: null,
    latitude: 50.4158,
    longitude: 25.7485,
    photoUrls: [
      "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "tserkva-voznesinnia-hospodnoho",
    title: "Церква Вознесіння Господнього",
    kind: "orthodox",
    typeLabel: "Православний храм",
    denomination: "Православна Церква України",
    address: "вул. Митрополита Шептицького, 1А, Дубно",
    phone: "+380679875404",
    website: null,
    facebook: null,
    latitude: 50.3962,
    longitude: 25.7608,
    photoUrls: [
      "https://images.unsplash.com/photo-1519890231714-5fd3e8a0f8e3?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "svyato-voznesenska-tserkva-pidbortsi",
    title: "Свято-Вознесенська церква",
    kind: "orthodox",
    typeLabel: "Православна церква",
    denomination: "Православна Церква України",
    address: "вул. Підборці, 92, Дубно",
    phone: null,
    website: null,
    facebook: null,
    latitude: 50.4285,
    longitude: 25.7352,
    photoUrls: [
      "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "spaso-preobrazhenska-tserkva-religiia",
    title: "Спасо-Преображенська церква",
    kind: "orthodox",
    typeLabel: "Православна церква",
    denomination: "Православна Церква України",
    address: "вул. Івана Франка, 21Б, Дубно",
    phone: null,
    website: null,
    facebook: null,
    existingSlug: "spaso-preobrazhenska-tserkva",
  },
  {
    slug: "svyato-mykolaivskyi-cholovichyi-monastyr",
    title: "Свято-Миколаївський чоловічий монастир",
    kind: "monastery",
    typeLabel: "Монастир",
    denomination: "Православна Церква України",
    address: "вул. Данила Галицького, 28, Дубно",
    phone: null,
    website: null,
    facebook: null,
    existingSlug: "mykolaivskyi-sobor",
  },
  {
    slug: "svyato-heorhiivska-tserkva",
    title: "Свято-Георгіївська церква",
    kind: "orthodox",
    typeLabel: "Православна церква",
    denomination: "Українська Православна Церква",
    address: "вул. Садова, 10, Дубно",
    phone: null,
    website: null,
    facebook: null,
    existingSlug: "yuriivska-tserkva",
  },
  {
    slug: "tserkva-arkhanhela-havryila",
    title: "Церква Архангела Гавриїла",
    kind: "orthodox",
    typeLabel: "Православна церква",
    denomination: "Українська Православна Церква",
    address: "вул. Михайла Грушевського, 156, Дубно",
    phone: null,
    website: null,
    facebook: null,
    latitude: 50.3938,
    longitude: 25.7578,
    photoUrls: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "illinskyi-khram-stara",
    title: "Іллінський храм",
    kind: "orthodox",
    typeLabel: "Православна церква",
    denomination: "Українська Православна Церква",
    address: "вул. Стара, Дубно",
    phone: "+380993748200",
    website: null,
    facebook: null,
    latitude: 50.4124,
    longitude: 25.7412,
    photoUrls: [
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "kostel-svyatoho-yana-nepomuka",
    title: "Костел Святого Яна Непомука",
    kind: "catholic",
    typeLabel: "Костел",
    denomination: "Римо-католицька Церква",
    address: "вул. Князя Острозького, 18, Дубно",
    phone: null,
    website: null,
    facebook: null,
    existingSlug: "kostel-yana-nepomuka",
  },
  {
    slug: "kostel-neporochnogo-zachattia",
    title: "Костел Непорочного Зачаття Пресвятої Діви Марії",
    kind: "catholic",
    typeLabel: "Костел",
    denomination: "Римо-католицька Церква",
    address: "територія Дубенського замку, вул. Замкова, 7, Дубно",
    phone: null,
    website: null,
    facebook: null,
    // Castle church — near Dubno castle landmark
    latitude: 50.41955,
    longitude: 25.75095,
    photoUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/7/75/56-103-0213_Dubno_Castle_RB_24.jpg",
      "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "tserkva-ehb-vifaniia",
    title: "Церква ЄХБ «Віфанія»",
    kind: "protestant",
    typeLabel: "Протестантська церква",
    denomination: "Євангельські християни-баптисти",
    address: "вул. Венецька, 20, Дубно",
    phone: "+380938274874",
    website: null,
    facebook: null,
    latitude: 50.4082,
    longitude: 25.7524,
    photoUrls: [
      "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "dim-molytvy-ehb-dubno",
    title: "Дім молитви ЄХБ",
    kind: "protestant",
    typeLabel: "Протестантська церква",
    denomination: "Євангельські християни-баптисти",
    address: "вул. Михайла Грушевського, 142, Дубно",
    phone: "+380365622073",
    website: null,
    facebook: null,
    latitude: 50.3945,
    longitude: 25.7569,
    photoUrls: [
      "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "nehalezhna-tserkva-ehb-vidrodzhennia",
    title: "Незалежна Церква ЄХБ «Відродження»",
    kind: "protestant",
    typeLabel: "Протестантська церква",
    denomination: "Євангельські християни-баптисти",
    address: "вул. Конторська, 15, Дубно",
    phone: "+380979515431",
    website: null,
    facebook: null,
    latitude: 50.4178,
    longitude: 25.7415,
    photoUrls: [
      "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "tserkva-adventystiv-dubno",
    title: "Церква адвентистів сьомого дня",
    kind: "protestant",
    typeLabel: "Протестантська церква",
    denomination: "Адвентисти сьомого дня",
    address: "вул. Щоголева, 3, Дубно",
    phone: null,
    website: null,
    facebook: null,
    latitude: 50.4146,
    longitude: 25.7468,
    photoUrls: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "tserkva-svyatoho-andriia",
    title: "Церква Святого Андрія",
    kind: "christian",
    typeLabel: "Християнська церква",
    denomination: "Християнська громада",
    address: "вул. Петра Калнишевського, 29, Дубно",
    phone: "+380996777953",
    website: null,
    facebook: null,
    latitude: 50.4065,
    longitude: 25.7398,
    photoUrls: [
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

const KIND_META: Record<
  ReligionKind,
  { label: string; color: string; accent: string }
> = {
  orthodox: { label: "Православʼя", color: "#1e3a8a", accent: "#93c5fd" },
  catholic: { label: "Католицизм", color: "#7f1d1d", accent: "#fca5a5" },
  protestant: { label: "Протестантизм", color: "#365314", accent: "#bef264" },
  monastery: { label: "Монастир", color: "#4c1d95", accent: "#c4b5fd" },
  christian: { label: "Християнство", color: "#0f766e", accent: "#5eead4" },
};

function religionSvg(kind: ReligionKind, title: string): Buffer {
  const meta = KIND_META[kind];
  const safeTitle = title
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  const short =
    safeTitle.length > 42 ? `${safeTitle.slice(0, 40)}…` : safeTitle;

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
  <g fill="${meta.accent}" opacity="0.95">
    <rect x="560" y="200" width="28" height="220" rx="8"/>
    <rect x="500" y="260" width="148" height="28" rx="8"/>
  </g>
  <text x="80" y="180" fill="#fff" font-family="Georgia, serif" font-size="34" opacity="0.85">${meta.label}</text>
  <text x="80" y="520" fill="#fff" font-family="Georgia, serif" font-size="42" font-weight="700">${short}</text>
  <text x="80" y="580" fill="${meta.accent}" font-family="system-ui, sans-serif" font-size="28">Релігія · Дубно</text>
</svg>`;

  return Buffer.from(svg, "utf8");
}

async function ensureCategory() {
  const maxSort = await prisma.category.aggregate({
    _max: { sortOrder: true },
  });
  const sortOrder = Math.max(19, (maxSort._max.sortOrder ?? 0) + 1);

  return prisma.category.upsert({
    where: { slug: "religiia" },
    create: {
      name: "Релігія",
      slug: "religiia",
      icon: "Church",
      description:
        "Храми, собори, костели, монастирі та молитовні доми Дубна",
      sortOrder,
    },
    update: {
      name: "Релігія",
      icon: "Church",
      description:
        "Храми, собори, костели, монастирі та молитовні доми Дубна",
    },
  });
}

async function backfillPrimaryCategoryLinks() {
  const places = await prisma.place.findMany({
    select: { id: true, categoryId: true },
  });
  let linked = 0;
  for (const place of places) {
    await prisma.placeCategory.upsert({
      where: {
        placeId_categoryId: {
          placeId: place.id,
          categoryId: place.categoryId,
        },
      },
      create: { placeId: place.id, categoryId: place.categoryId },
      update: {},
    });
    linked++;
  }
  console.log(`Backfilled primary category links: ${linked}`);
}

async function fetchImageBuffer(
  url: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "DubnoHub/1.0 (religion import)",
        Accept: "image/*,*/*",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength < 1500) return null;
    return { buffer, contentType: contentType.split(";")[0]! };
  } catch {
    return null;
  }
}

async function resolvePlaceImage(
  place: ReligionPlace,
): Promise<string | null> {
  for (const url of place.photoUrls ?? []) {
    const fetched = await fetchImageBuffer(url);
    if (!fetched) continue;
    const ext = fetched.contentType.includes("png")
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

  const svg = religionSvg(place.kind, place.title);
  const blob = await put(`places/${place.slug}/cover.svg`, svg, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "image/svg+xml",
  });
  return blob.url;
}

async function resolveCoords(place: ReligionPlace) {
  if (
    typeof place.latitude === "number" &&
    typeof place.longitude === "number"
  ) {
    return {
      latitude: place.latitude,
      longitude: place.longitude,
      source: "manual",
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
  return { latitude: 50.4175, longitude: 25.7445, source: "fallback" };
}

async function linkReligion(placeId: string, religionCategoryId: string) {
  await prisma.placeCategory.upsert({
    where: {
      placeId_categoryId: {
        placeId,
        categoryId: religionCategoryId,
      },
    },
    create: { placeId, categoryId: religionCategoryId },
    update: {},
  });
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is missing");
  }

  const category = await ensureCategory();
  await backfillPrimaryCategoryLinks();

  let linkedExisting = 0;
  let created = 0;
  let updated = 0;

  for (const place of PLACES) {
    if (place.existingSlug) {
      const existing = await prisma.place.findUnique({
        where: { slug: place.existingSlug },
      });
      if (existing) {
        await linkReligion(existing.id, category.id);
        // Keep landmark description; enrich phone if empty
        if (place.phone && !existing.phone) {
          await prisma.place.update({
            where: { id: existing.id },
            data: { phone: place.phone },
          });
        }
        linkedExisting++;
        console.log(`  ↔ linked existing ${place.existingSlug} → Релігія`);
        continue;
      }
      console.log(
        `  ! existing slug missing (${place.existingSlug}), creating new`,
      );
    }

    const coords = await resolveCoords(place);
    const image = await resolvePlaceImage(place);
    const description = `${place.typeLabel}. Конфесія: ${place.denomination}.`;

    const data = {
      title: place.title,
      slug: place.slug,
      description,
      categoryId: category.id,
      address: place.address,
      latitude: coords.latitude,
      longitude: coords.longitude,
      phone: place.phone,
      website: place.website,
      facebook: place.facebook,
      instagram: null as string | null,
      workingHours: "Уточнюйте в громаді / розкладі богослужінь",
      featured: false,
      rating: 0,
      images: image ? [image] : [],
    };

    const existing = await prisma.place.findUnique({
      where: { slug: place.slug },
    });

    let placeId: string;
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
          workingHours: data.workingHours,
          images: data.images.length ? data.images : undefined,
        },
      });
      placeId = existing.id;
      updated++;
    } else {
      const createdPlace = await prisma.place.create({ data });
      placeId = createdPlace.id;
      created++;
    }

    await linkReligion(placeId, category.id);
    console.log(
      `  + ${place.title} — ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`,
    );
  }

  console.log("Religion Dubno import done:", {
    total: PLACES.length,
    linkedExisting,
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
