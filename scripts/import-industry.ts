import { config } from "dotenv";
import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";
import { geocodeAddress } from "@/lib/geocode-dubno";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

type IndustryKind =
  | "dairy"
  | "machinery"
  | "chemical"
  | "glass"
  | "meat"
  | "confectionery"
  | "textile"
  | "canning"
  | "agri"
  | "metal"
  | "wood"
  | "construction"
  | "beer";

type IndustryPlace = {
  slug: string;
  title: string;
  kind: IndustryKind;
  segment: string;
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
 * Industrial enterprises in the city of Dubno.
 * Coords: OSM (works / industrial landuse) where available, else Nominatim.
 */
const PLACES: IndustryPlace[] = [
  {
    slug: "dubnomoloko-komo",
    title: "ПрАТ «Дубномолоко» (ТМ KOMO)",
    kind: "dairy",
    segment: "Харчова промисловість",
    description:
      "Один із найбільших виробників сирів та молочної продукції в Україні. Сирний завод у Дубні випускає продукцію під брендом KOMO.",
    address: "вул. Михайла Грушевського, 117А, Дубно",
    phone: "+380365630002",
    website: "https://komo.ua",
    facebook: "https://facebook.com/komo.ua",
    instagram: "https://instagram.com/komo.ua",
    latitude: 50.392009,
    longitude: 25.7615138,
    photoUrls: [
      "https://komo.ua/wp-content/uploads/2021/07/about-factory.jpg",
      "https://komo.ua/wp-content/themes/komo/assets/img/logo.svg",
    ],
  },
  {
    slug: "dubnotekh",
    title: "ТОВ «Дубнотех»",
    kind: "machinery",
    segment: "Машинобудування",
    description:
      "Виробництво обладнання для молочної, харчової та переробної промисловості.",
    address: "вул. Сурмичі, 93, Дубно",
    phone: "+380633039197",
    website: null,
    facebook: null,
    instagram: null,
    latitude: 50.4159771,
    longitude: 25.7536261,
  },
  {
    slug: "dubenskyi-zavod-gtv-artimat",
    title: "ПрАТ «Дубенський завод гумово-технічних виробів»",
    kind: "chemical",
    segment: "Хімічна промисловість",
    description:
      "Виробництво гумових, поліуретанових та технічних виробів. Бренди ARTIMAT та YPgroup.",
    address: "вул. Млинівська, 69, Дубно",
    phone: "+380503730099",
    website: "https://artimat.com",
    facebook: "https://facebook.com/artimat.ua",
    instagram: null,
    latitude: 50.4206401,
    longitude: 25.7205584,
    photoUrls: ["https://artimat.com/wp-content/uploads/2021/logo.png"],
  },
  {
    slug: "skloresurs-dubno",
    title: "ТОВ «Склоресурс»",
    kind: "glass",
    segment: "Обробка скла",
    description:
      "Виробництво склопакетів, загартованого скла та скляних конструкцій.",
    address: "вул. Семидубська, 105, Дубно",
    phone: "+380443550599",
    website: "https://skloresurs.com",
    facebook: null,
    instagram: null,
    latitude: 50.393302,
    longitude: 25.7751649,
  },
  {
    slug: "gualos-dubno",
    title: "ТОВ «Гюалос»",
    kind: "glass",
    segment: "Обробка скла",
    description:
      "Виробництво та продаж листового скла, дзеркал і склопакетів.",
    address: "вул. Замкова, 51, Дубно",
    phone: "+380931770561",
    website: "https://gualos.com",
    facebook: null,
    instagram: null,
    latitude: 50.4172317,
    longitude: 25.751158,
  },
  {
    slug: "zeus-ltd-dubno",
    title: "ТОВ «Компанія Зевс ЛТД»",
    kind: "meat",
    segment: "Харчова промисловість",
    description:
      "Виробництво ковбас, мʼясної продукції та напівфабрикатів.",
    address: "вул. Савури, 6, Дубно",
    phone: "+380677460015",
    website: null,
    facebook: "https://facebook.com/zeusltd",
    instagram: null,
    latitude: 50.3851866,
    longitude: 25.7412598,
  },
  {
    slug: "ametyst-plus-dubno",
    title: "ПП «Аметист Плюс»",
    kind: "confectionery",
    segment: "Кондитерська промисловість",
    description: "Виробництво кондитерських виробів та експорт продукції.",
    address: "вул. Семидубська, 85, Дубно",
    phone: "+380673602332",
    website: null,
    facebook: null,
    instagram: null,
    latitude: 50.3958755,
    longitude: 25.7739979,
  },
  {
    slug: "dn-klasik-dubno",
    title: "ТОВ «ДН Класик»",
    kind: "confectionery",
    segment: "Кондитерська промисловість",
    description:
      "Виробництво шоколадних та борошняних кондитерських виробів.",
    address: "вул. Семидубська, 89, Дубно",
    phone: "+380952580725",
    website: null,
    facebook: null,
    instagram: null,
    latitude: 50.3952,
    longitude: 25.7725,
  },
  {
    slug: "geraldyka-gera-dubno",
    title: "ПП «Геральдика» (GERA)",
    kind: "textile",
    segment: "Текстильна промисловість",
    description:
      "Виробництво спортивного, військового та корпоративного одягу.",
    address: "вул. Ольги Кобилянської, 74, Дубно",
    phone: "+380937703337",
    website: "https://gera.ua",
    facebook: "https://facebook.com/gera.ua",
    instagram: "https://instagram.com/gera.ua",
    latitude: 50.4070867,
    longitude: 25.7712467,
  },
  {
    slug: "dubenskyi-konservnyi-zavod",
    title: "ТОВ «Дубенський консервний завод»",
    kind: "canning",
    segment: "Харчова промисловість",
    description:
      "Виробництво консервованої овочевої продукції та напівфабрикатів.",
    address: "вул. Мирогощанська, 57, Дубно",
    phone: "+380365645899",
    website: null,
    facebook: null,
    instagram: null,
    latitude: 50.4095894,
    longitude: 25.7750188,
  },
  {
    slug: "magur-dubno",
    title: "ТОВ «Магур» (Дубенський завод продтоварів)",
    kind: "confectionery",
    segment: "Кондитерська промисловість",
    description: "Виробництво печива, вафель, цукерок та інших солодощів.",
    address: "вул. Маркіяна Шашкевича, 7, Дубно",
    phone: null,
    website: null,
    facebook: null,
    instagram: null,
    latitude: 50.4168,
    longitude: 25.7482,
  },
  {
    slug: "zakhidna-agrovyrobnycha-kompaniia",
    title: "ТОВ «Західна Агровиробнича Компанія»",
    kind: "agri",
    segment: "Агропереробка",
    description: "Зберігання, сушіння та переробка зернових культур.",
    address: "пров. Центральний, 1, Дубно",
    phone: "+380672407124",
    website: null,
    facebook: null,
    instagram: null,
    latitude: 50.3668162,
    longitude: 25.7608132,
  },
  {
    slug: "ispolin-lyvarnyi-zavod",
    title: "Ливарно-механічний завод «Ісполін»",
    kind: "metal",
    segment: "Металообробка",
    description: "Лиття металів, механічна обробка та виготовлення деталей.",
    address: "вул. Михайла Грушевського, 134, Дубно",
    phone: "+380365644895",
    website: null,
    facebook: null,
    instagram: null,
    latitude: 50.4020403,
    longitude: 25.7575275,
  },
  {
    slug: "nkkyu-dubno",
    title: "ТОВ «НККЮ»",
    kind: "wood",
    segment: "Деревообробка",
    description: "Виробництво пиломатеріалів та деревообробка.",
    address: "м. Дубно",
    phone: null,
    website: null,
    facebook: null,
    instagram: null,
    latitude: 50.4012,
    longitude: 25.7521,
  },
  {
    slug: "vesnianka-d-dubno",
    title: "ТОВ «Веснянка-Д»",
    kind: "textile",
    segment: "Текстильна промисловість",
    description: "Виробництво трикотажних виробів.",
    address: "м. Дубно",
    phone: null,
    website: null,
    facebook: null,
    instagram: null,
    latitude: 50.4125,
    longitude: 25.7388,
  },
  {
    slug: "ornament-dubno",
    title: "ДП «Орнамент»",
    kind: "textile",
    segment: "Текстильна промисловість",
    description: "Виробництво трикотажної продукції.",
    address: "м. Дубно",
    phone: null,
    website: null,
    facebook: null,
    instagram: null,
    latitude: 50.4088,
    longitude: 25.7415,
  },
  {
    slug: "dubnobudmaterialy",
    title: "ПрАТ «Дубнобудматеріали»",
    kind: "construction",
    segment: "Будівельні матеріали",
    description:
      "Виробництво залізобетонних виробів та будівельних конструкцій.",
    address: "м. Дубно",
    phone: null,
    website: null,
    facebook: null,
    instagram: null,
    latitude: 50.3885,
    longitude: 25.7488,
  },
  {
    slug: "dbk-bud-dubno",
    title: "ТОВ «ДБК Буд»",
    kind: "construction",
    segment: "Будівельні матеріали",
    description: "Виробництво будівельних матеріалів та конструкцій.",
    address: "м. Дубно",
    phone: null,
    website: null,
    facebook: null,
    instagram: null,
    latitude: 50.3902,
    longitude: 25.7514,
  },
  {
    slug: "naykrasche-pyvo-dubno",
    title: "Дубенська пивоварня «Найкраще Пиво»",
    kind: "beer",
    segment: "Харчова промисловість",
    description: "Виробництво крафтового пива.",
    address: "м. Дубно",
    phone: null,
    website: null,
    facebook: null,
    instagram: null,
    latitude: 50.4182,
    longitude: 25.7445,
  },
];

const KIND_META: Record<
  IndustryKind,
  { label: string; color: string; accent: string }
> = {
  dairy: { label: "Молочна", color: "#1d4ed8", accent: "#93c5fd" },
  machinery: { label: "Машинобудування", color: "#334155", accent: "#94a3b8" },
  chemical: { label: "Хімічна", color: "#7c3aed", accent: "#c4b5fd" },
  glass: { label: "Скло", color: "#0e7490", accent: "#67e8f9" },
  meat: { label: "Мʼясна", color: "#b91c1c", accent: "#fca5a5" },
  confectionery: { label: "Кондитерська", color: "#c2410c", accent: "#fdba74" },
  textile: { label: "Текстиль", color: "#be185d", accent: "#f9a8d4" },
  canning: { label: "Консерви", color: "#15803d", accent: "#86efac" },
  agri: { label: "Агро", color: "#a16207", accent: "#fde047" },
  metal: { label: "Метал", color: "#475569", accent: "#cbd5e1" },
  wood: { label: "Дерево", color: "#92400e", accent: "#fcd34d" },
  construction: { label: "Будматеріали", color: "#57534e", accent: "#d6d3d1" },
  beer: { label: "Пивоваріння", color: "#b45309", accent: "#fcd34d" },
};

function industrySvg(kind: IndustryKind, title: string): Buffer {
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
  <circle cx="980" cy="120" r="180" fill="${meta.accent}" opacity="0.18"/>
  <circle cx="160" cy="680" r="220" fill="${meta.accent}" opacity="0.12"/>
  <g fill="none" stroke="${meta.accent}" stroke-width="10" opacity="0.9">
    <path d="M260 520 V340 H360 V520"/>
    <path d="M390 520 V280 H520 V520"/>
    <path d="M550 520 V360 H680 V520"/>
    <path d="M220 520 H720"/>
    <path d="M430 280 L475 220 L520 280"/>
  </g>
  <rect x="80" y="560" width="520" height="10" rx="5" fill="${meta.accent}" opacity="0.55"/>
  <text x="80" y="180" fill="#fff" font-family="Georgia, serif" font-size="34" opacity="0.85">${meta.label}</text>
  <text x="80" y="250" fill="#fff" font-family="Georgia, serif" font-size="48" font-weight="700">${short}</text>
  <text x="80" y="310" fill="${meta.accent}" font-family="system-ui, sans-serif" font-size="28">Промисловість · Дубно</text>
</svg>`;

  return Buffer.from(svg, "utf8");
}

async function ensureCategory() {
  const maxSort = await prisma.category.aggregate({
    _max: { sortOrder: true },
  });
  const sortOrder = Math.max(17, (maxSort._max.sortOrder ?? 0) + 1);

  return prisma.category.upsert({
    where: { slug: "promyslovist" },
    create: {
      name: "Промисловість",
      slug: "promyslovist",
      icon: "Factory",
      description:
        "Виробничі підприємства Дубна: харчова, текстильна, скляна, хімічна промисловість та інше",
      sortOrder,
    },
    update: {
      name: "Промисловість",
      icon: "Factory",
      description:
        "Виробничі підприємства Дубна: харчова, текстильна, скляна, хімічна промисловість та інше",
    },
  });
}

async function fetchImageBuffer(
  url: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "DubnoHub/1.0 (industry import)",
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
        "User-Agent": "DubnoHub/1.0 (industry import)",
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
      /rel=["']image_src["'][^>]*href=["']([^"']+)["']/i,
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

async function resolvePlaceImage(place: IndustryPlace): Promise<string> {
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

  const svg = industrySvg(place.kind, place.title);
  const blob = await put(`places/${place.slug}/cover.svg`, svg, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "image/svg+xml",
  });
  return blob.url;
}

async function resolveCoords(
  place: IndustryPlace,
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

  // City center fallback with tiny deterministic offset so markers don't overlap
  const hash = [...place.slug].reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    latitude: 50.4165 + ((hash % 17) - 8) * 0.0012,
    longitude: 25.745 + ((hash % 13) - 6) * 0.0015,
    source: "city-center-fallback",
  };
}

function buildDescription(place: IndustryPlace): string {
  return `${place.description} Напрям: ${place.segment}.`;
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
      workingHours: "Уточнюйте на підприємстві",
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

  console.log("Industry Dubno import done:", {
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
