import { config } from "dotenv";
import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";
import { geocodeAddress } from "@/lib/geocode-dubno";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

type FoodBucket = "restorany" | "kafe";
type FoodKind =
  | "pizza"
  | "restaurant"
  | "grill"
  | "cafe"
  | "burger"
  | "coffee"
  | "bakery";

type FoodPlace = {
  slug: string;
  title: string;
  bucket: FoodBucket;
  kind: FoodKind;
  typeLabel: string;
  cuisine: string;
  address: string;
  phone: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  workingHours: string | null;
  latitude?: number;
  longitude?: number;
  photoUrls?: string[];
};

/**
 * Restaurants & cafes in Dubno.
 * Photos: rivne.travel / brand sites where available, else cuisine stock.
 * Coords: OSM / rivne.travel / Nominatim.
 */
const PLACES: FoodPlace[] = [
  // —— Ресторани ——
  {
    slug: "new-york-street-pizza-dubno",
    title: "New York Street Pizza",
    bucket: "restorany",
    kind: "pizza",
    typeLabel: "Ресторан",
    cuisine: "Піца, європейська",
    address: "вул. Данила Галицького, 18, Дубно",
    phone: "+380984900717",
    website: "https://www.pizza-nys.com.ua/placemarks/3827/",
    facebook: null,
    instagram: null,
    workingHours: "Пн–Нд: 10:00–23:00",
    latitude: 50.4183327,
    longitude: 25.7402122,
    photoUrls: [
      "https://www.pizza-nys.com.ua/wp-content/uploads/2018/10/0-02-05-b72cdfd73d4f1810be5215438fdb6d08134b0ff1002a6b55652cafb745c0befd_b1b25a7-1170x600.jpg",
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "hrand-dubno",
    title: "Hrand",
    bucket: "restorany",
    kind: "restaurant",
    typeLabel: "Ресторан",
    cuisine: "Українська, європейська",
    address: "вул. Данила Нечая, 1, Дубно",
    phone: "+380938115662",
    website: "https://rivne.travel/locations/grand",
    facebook: null,
    instagram: null,
    workingHours: null,
    latitude: 50.4176995,
    longitude: 25.7465627,
    photoUrls: [
      "https://f.rivne.travel/location/4428/3vgmR.jpg",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "brama-dubno",
    title: "Brama",
    bucket: "restorany",
    kind: "restaurant",
    typeLabel: "Ресторан",
    cuisine: "Європейська",
    address: "вул. Забрама, 8, Дубно",
    phone: "+380660404100",
    website: null,
    facebook: null,
    instagram: null,
    workingHours: null,
    latitude: 50.4190011,
    longitude: 25.7318737,
    photoUrls: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "astoriya-dubno",
    title: "Astoriya",
    bucket: "restorany",
    kind: "restaurant",
    typeLabel: "Ресторан",
    cuisine: "Європейська",
    address: "вул. Михайла Грушевського, 119, Дубно",
    phone: "+380507775775",
    website: "https://rivne.travel/locations/astoria",
    facebook: null,
    instagram: null,
    workingHours: null,
    latitude: 50.391266,
    longitude: 25.756293,
    photoUrls: [
      "https://f.rivne.travel/location/4424/y1MjN.jpg",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "antikkhaus-dubno",
    title: "Antikkhaus",
    bucket: "restorany",
    kind: "restaurant",
    typeLabel: "Ресторан",
    cuisine: "Українська",
    address: "вул. Замкова, 17, Дубно",
    phone: "+380505795905",
    website: "https://rivne.travel/locations/antik-hauz",
    facebook: null,
    instagram: null,
    workingHours: null,
    latitude: 50.4194649,
    longitude: 25.7468864,
    photoUrls: [
      "https://f.rivne.travel/location/3375/9coTh.jpg",
      "https://vidido.info/media/biz/6992/banner.jpg",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "mytrofan-dubno",
    title: "Митрофан",
    bucket: "restorany",
    kind: "grill",
    typeLabel: "Гриль-ресторан",
    cuisine: "Гриль, українська",
    address: "вул. Михайла Грушевського, 174, Дубно",
    phone: "+380660206661",
    website: null,
    facebook: null,
    instagram: null,
    workingHours: null,
    latitude: 50.3951953,
    longitude: 25.7565975,
    photoUrls: [
      "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "zirka-dubno",
    title: "Зірка",
    bucket: "restorany",
    kind: "restaurant",
    typeLabel: "Ресторан",
    cuisine: "Європейська",
    address: "вул. Забрама, 25А, Дубно",
    phone: "+380993835911",
    website: "https://rivne.travel/locations/zirka",
    facebook: null,
    instagram: null,
    workingHours: null,
    latitude: 50.418715,
    longitude: 25.7299262,
    photoUrls: [
      "https://f.rivne.travel/location/4429/olQ4n.jpg",
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
    ],
  },

  // —— Кафе / кавʼярні ——
  {
    slug: "veles-dubno",
    title: "Велес",
    bucket: "kafe",
    kind: "cafe",
    typeLabel: "Кафе",
    cuisine: "Європейська",
    address: "вул. Львівська, 41, Дубно",
    phone: "+380500489715",
    website: "https://rivne.travel/locations/veles",
    facebook: null,
    instagram: null,
    workingHours: null,
    latitude: 50.4119612,
    longitude: 25.7188164,
    photoUrls: [
      "https://f.rivne.travel/location/4430/L040K.jpg",
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "kartel-dubno",
    title: "Картель",
    bucket: "kafe",
    kind: "cafe",
    typeLabel: "Кафе",
    cuisine: "Європейська",
    address: "вул. Кирила і Мефодія, 9, Дубно",
    phone: "+380689598156",
    website: null,
    facebook: null,
    instagram: null,
    workingHours: null,
    latitude: 50.4190825,
    longitude: 25.7436413,
    photoUrls: [
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "na-zabrami-dubno",
    title: "На Забрамі",
    bucket: "kafe",
    kind: "cafe",
    typeLabel: "Кафе",
    cuisine: "Українська",
    address: "вул. Забрама, 1, Дубно",
    phone: "+380993630960",
    website: null,
    facebook: null,
    instagram: null,
    workingHours: null,
    latitude: 50.41915,
    longitude: 25.7334,
    photoUrls: [
      "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "lira-dubno",
    title: "Ліра",
    bucket: "kafe",
    kind: "cafe",
    typeLabel: "Кафе",
    cuisine: "Домашня кухня",
    address: "вул. Млинівська, 1, Дубно",
    phone: "+380507208989",
    website: null,
    facebook: null,
    instagram: null,
    workingHours: null,
    latitude: 50.4206401,
    longitude: 25.7205584,
    photoUrls: [
      "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "diuna-dubno",
    title: "Дюна",
    bucket: "kafe",
    kind: "cafe",
    typeLabel: "Кафе",
    cuisine: "Європейська",
    address: "м. Дубно",
    phone: null,
    website: null,
    facebook: null,
    instagram: null,
    workingHours: null,
    latitude: 50.4172,
    longitude: 25.7428,
    photoUrls: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "patelnia-meat-studio-dubno",
    title: "Meat Studio «Пательня»",
    bucket: "kafe",
    kind: "grill",
    typeLabel: "Кафе",
    cuisine: "Стейки, гриль",
    address: "вул. Залізнична, 140, Дубно",
    phone: "+380999154496",
    website: null,
    facebook: null,
    instagram: null,
    workingHours: "Пн–Нд: 10:00–23:00",
    latitude: 50.3864588,
    longitude: 25.7429897,
    photoUrls: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "meatla-dubno",
    title: "MeatLa",
    bucket: "kafe",
    kind: "burger",
    typeLabel: "Бар-гриль",
    cuisine: "Бургери, гриль",
    address: "вул. Забрама, 1, Дубно",
    phone: "+380506107099",
    website: null,
    facebook: null,
    instagram: null,
    workingHours: null,
    latitude: 50.41905,
    longitude: 25.73315,
    photoUrls: [
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "mister-burger-stometrivka-dubno",
    title: "Mister Burger «Стометрівка»",
    bucket: "kafe",
    kind: "burger",
    typeLabel: "Бургерна",
    cuisine: "Фастфуд",
    address: "майдан Незалежності, 11, Дубно",
    phone: "+380668721508",
    website: null,
    facebook: null,
    instagram: null,
    workingHours: null,
    latitude: 50.4181259,
    longitude: 25.7457441,
    photoUrls: [
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "cafe-central-dubno",
    title: "Cafe Central",
    bucket: "kafe",
    kind: "coffee",
    typeLabel: "Кавʼярня",
    cuisine: "Кава, десерти",
    address: "вул. Свободи, 8, Дубно",
    phone: "+380954473257",
    website: null,
    facebook: null,
    instagram: null,
    workingHours: null,
    latitude: 50.4191315,
    longitude: 25.7434161,
    photoUrls: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "coffee-brothers-dubno",
    title: "Coffee Brothers",
    bucket: "kafe",
    kind: "coffee",
    typeLabel: "Кавʼярня",
    cuisine: "Кава",
    address: "вул. Митрополита Шептицького, 7, Дубно",
    phone: "+380969716192",
    website: null,
    facebook: null,
    instagram: null,
    workingHours: null,
    latitude: 50.3954448,
    longitude: 25.7615208,
    photoUrls: [
      "https://images.unsplash.com/photo-1442512595331-e89e73839926?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "dim-kavy-dubno",
    title: "Дім Кави",
    bucket: "kafe",
    kind: "coffee",
    typeLabel: "Кавʼярня",
    cuisine: "Кава, десерти",
    address: "м. Дубно",
    phone: null,
    website: null,
    facebook: null,
    instagram: null,
    workingHours: null,
    latitude: 50.4188,
    longitude: 25.7442,
    photoUrls: [
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "kruasanna-dubno",
    title: "Kruasanna",
    bucket: "kafe",
    kind: "bakery",
    typeLabel: "Кавʼярня",
    cuisine: "Круасани, кава",
    address: "вул. Михайла Грушевського, 27Б, Дубно",
    phone: null,
    website: "https://rivne.travel/locations/kruasanna",
    facebook: null,
    instagram: null,
    workingHours: "Пн–Нд: 09:00–21:00",
    latitude: 50.4041986,
    longitude: 25.7603022,
    photoUrls: [
      "https://f.rivne.travel/location/4426/L5mpJ.jpg",
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

const KIND_META: Record<
  FoodKind,
  { label: string; color: string; accent: string }
> = {
  pizza: { label: "Піца", color: "#b91c1c", accent: "#fca5a5" },
  restaurant: { label: "Ресторан", color: "#9a3412", accent: "#fdba74" },
  grill: { label: "Гриль", color: "#7c2d12", accent: "#fdba74" },
  cafe: { label: "Кафе", color: "#0f766e", accent: "#5eead4" },
  burger: { label: "Бургери", color: "#c2410c", accent: "#fdba74" },
  coffee: { label: "Кава", color: "#78350f", accent: "#fcd34d" },
  bakery: { label: "Пекарня", color: "#a16207", accent: "#fde68a" },
};

function foodSvg(kind: FoodKind, title: string): Buffer {
  const meta = KIND_META[kind];
  const safeTitle = title
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  const short =
    safeTitle.length > 40 ? `${safeTitle.slice(0, 38)}…` : safeTitle;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${meta.color}"/>
      <stop offset="100%" stop-color="#1c1917"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)"/>
  <circle cx="1000" cy="120" r="200" fill="${meta.accent}" opacity="0.18"/>
  <circle cx="120" cy="700" r="240" fill="${meta.accent}" opacity="0.12"/>
  <circle cx="620" cy="320" r="110" fill="none" stroke="${meta.accent}" stroke-width="14" opacity="0.9"/>
  <circle cx="620" cy="320" r="42" fill="${meta.accent}" opacity="0.85"/>
  <text x="80" y="180" fill="#fff" font-family="Georgia, serif" font-size="34" opacity="0.85">${meta.label}</text>
  <text x="80" y="560" fill="#fff" font-family="Georgia, serif" font-size="48" font-weight="700">${short}</text>
  <text x="80" y="620" fill="${meta.accent}" font-family="system-ui, sans-serif" font-size="28">Дубно · де поїсти</text>
</svg>`;

  return Buffer.from(svg, "utf8");
}

async function ensureCategories() {
  const maxSort = await prisma.category.aggregate({
    _max: { sortOrder: true },
  });
  const base = Math.max(1, (maxSort._max.sortOrder ?? 0) + 1);

  const restorany = await prisma.category.upsert({
    where: { slug: "restorany" },
    create: {
      name: "Ресторани",
      slug: "restorany",
      icon: "UtensilsCrossed",
      description: "Ресторани та гриль-заклади Дубна",
      sortOrder: base,
    },
    update: {
      name: "Ресторани",
      icon: "UtensilsCrossed",
      description: "Ресторани та гриль-заклади Дубна",
    },
  });

  const kafe = await prisma.category.upsert({
    where: { slug: "kafe" },
    create: {
      name: "Кафе",
      slug: "kafe",
      icon: "Coffee",
      description: "Кафе, кавʼярні, бургерні та легкі заклади харчування Дубна",
      sortOrder: base + 1,
    },
    update: {
      name: "Кафе",
      icon: "Coffee",
      description: "Кафе, кавʼярні, бургерні та легкі заклади харчування Дубна",
    },
  });

  return { restorany, kafe };
}

async function fetchImageBuffer(
  url: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "DubnoHub/1.0 (food import)",
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

async function fetchOgImage(website: string): Promise<string | null> {
  try {
    const res = await fetch(website, {
      headers: {
        "User-Agent": "DubnoHub/1.0 (food import)",
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

async function resolvePlaceImage(place: FoodPlace): Promise<string> {
  const candidates = [...(place.photoUrls ?? [])];
  if (place.website) {
    const og = await fetchOgImage(place.website);
    if (og) candidates.unshift(og);
  }

  for (const url of candidates) {
    const fetched = await fetchImageBuffer(url);
    if (!fetched) continue;
    const ext = fetched.contentType.includes("png")
      ? "png"
      : fetched.contentType.includes("webp")
        ? "webp"
        : fetched.contentType.includes("svg")
          ? "svg"
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

  const svg = foodSvg(place.kind, place.title);
  const blob = await put(`places/${place.slug}/cover.svg`, svg, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "image/svg+xml",
  });
  return blob.url;
}

async function resolveCoords(
  place: FoodPlace,
): Promise<{ latitude: number; longitude: number; source: string }> {
  if (
    typeof place.latitude === "number" &&
    typeof place.longitude === "number"
  ) {
    return {
      latitude: place.latitude,
      longitude: place.longitude,
      source: "manual-or-catalog",
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
    latitude: 50.4175,
    longitude: 25.7445,
    source: "city-center-fallback",
  };
}

function buildDescription(place: FoodPlace): string {
  return `${place.typeLabel} у Дубні. Кухня: ${place.cuisine}.`;
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is missing");
  }

  const categories = await ensureCategories();
  let created = 0;
  let updated = 0;

  for (const place of PLACES) {
    const category =
      place.bucket === "restorany" ? categories.restorany : categories.kafe;
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
      workingHours: place.workingHours,
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
      `  • [${place.bucket}] ${place.title} — ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`,
    );
  }

  console.log("Food venues Dubno import done:", {
    total: PLACES.length,
    restaurants: PLACES.filter((p) => p.bucket === "restorany").length,
    cafes: PLACES.filter((p) => p.bucket === "kafe").length,
    created,
    updated,
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
