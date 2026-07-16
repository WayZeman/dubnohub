import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

type BrandKey = "okko" | "wog" | "ukrnafta" | "upg" | "olas";

type GasStation = {
  slug: string;
  title: string;
  brand: BrandKey;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  website: string;
  facebook: string | null;
  instagram: string | null;
  workingHours: string;
  featured: boolean;
  description: string;
};

const BRAND_META: Record<
  BrandKey,
  {
    file: string;
    contentType: string;
    blobPath: string;
  }
> = {
  okko: {
    file: "public/brands/okko-logo.jpg",
    contentType: "image/jpeg",
    blobPath: "brands/okko-logo.jpg",
  },
  wog: {
    file: "public/brands/wog-logo.png",
    contentType: "image/png",
    blobPath: "brands/wog-logo.png",
  },
  ukrnafta: {
    file: "public/brands/ukrnafta-logo.png",
    contentType: "image/png",
    blobPath: "brands/ukrnafta-logo.png",
  },
  upg: {
    file: "public/brands/upg-logo.png",
    contentType: "image/png",
    blobPath: "brands/upg-logo.png",
  },
  olas: {
    file: "public/brands/olas-logo.png",
    contentType: "image/png",
    blobPath: "brands/olas-logo.png",
  },
};

/**
 * Verified city of Dubno fuel stations only (not district villages).
 * Sources: OSM amenity=fuel (2026-07), official brand sites / announcements,
 * AZSki / goldenpages / UPG news (Shevchenka 66 rebrand ANP→UPG).
 */
const STATIONS: GasStation[] = [
  {
    slug: "okko-17-dubno",
    title: "ОККО АЗК №17",
    brand: "okko",
    address: "вул. Михайла Грушевського, 88, Дубно",
    latitude: 50.3924392,
    longitude: 25.755127,
    phone: "+380800501101",
    website: "https://www.okko.ua/",
    facebook: "https://www.facebook.com/okkoua",
    instagram: "https://www.instagram.com/okkoua/",
    workingHours: "Цілодобово",
    featured: true,
    description:
      "Автозаправний комплекс мережі ОККО в Дубні (АЗК №17). Адреса підтверджена офіційними матеріалами ОККО та OSM. На станції — пальне мережі (зокрема А-95 / ДТ), магазин і супутні сервіси. Гаряча лінія: +380800501101.",
  },
  {
    slug: "wog-946-dubno",
    title: "WOG №946",
    brand: "wog",
    address: "вул. Комунальна, 2А, Дубно",
    latitude: 50.4284953,
    longitude: 25.741306,
    phone: "+380800300525",
    website: "https://wog.ua/",
    facebook: "https://www.facebook.com/azkWOG/",
    instagram: "https://www.instagram.com/azkwog/",
    workingHours: "Цілодобово",
    featured: true,
    description:
      "Автозаправний комплекс WOG №946 у Дубні. Координати та адреса збігаються з OSM і каталогом AZSki (вул. Комунальна, 2А). Пальне мережі: А-95, ДТ, газ та ін. Центр підтримки клієнтів WOG: +380800300525.",
  },
  {
    slug: "ukrnafta-17-031-dubno",
    title: "Укрнафта №17/031",
    brand: "ukrnafta",
    address: "вул. Залізнична, 144, Дубно",
    latitude: 50.3852987,
    longitude: 25.7383528,
    phone: "+380800404000",
    website: "https://azs.ukrnafta.com/",
    facebook: null,
    instagram: null,
    workingHours: "Цілодобово",
    featured: true,
    description:
      "АЗС мережі Укрнафта №17/031 у Дубні (вул. Залізнична, 144). Дані з OSM (ref=17/031) і довідників. Пальне: А-92/95/98, ДТ, AdBlue. Гаряча лінія Укрнафти: +380800404000.",
  },
  {
    slug: "ukrnafta-17-012-dubno",
    title: "Укрнафта №17/012",
    brand: "ukrnafta",
    address: "вул. Михайла Грушевського, 119Б, Дубно",
    latitude: 50.3921326,
    longitude: 25.7567245,
    phone: "+380800404000",
    website: "https://azs.ukrnafta.com/",
    facebook: null,
    instagram: null,
    workingHours: "Цілодобово",
    featured: false,
    description:
      "АЗС мережі Укрнафта №17/012 у Дубні (вул. Михайла Грушевського, 119Б). Підтверджено OSM (ref=17/012) і місцевими довідниками. Пальне: А-92/95/98, ДТ, AdBlue. Гаряча лінія: +380800404000.",
  },
  {
    slug: "upg-shevchenka-66-dubno",
    title: "UPG Шевченка, 66",
    brand: "upg",
    address: "вул. Шевченка, 66, Дубно",
    latitude: 50.4274003,
    longitude: 25.743093,
    phone: "+380800500064",
    website: "https://upg.ua/",
    facebook: "https://www.facebook.com/AZK.UPG",
    instagram: "https://www.instagram.com/upg.ua/",
    workingHours: "Цілодобово",
    featured: true,
    description:
      "Автозаправний комплекс UPG у Дубні за адресою вул. Шевченка, 66. Раніше станція працювала під брендом ANP; у березні 2026 мережа UPG офіційно підтвердила запуск/відновлення цієї локації. Координати з OSM (колишній ANP). Гаряча лінія UPG: +380800500064.",
  },
  {
    slug: "olas-zamkova-dubno",
    title: "ОЛАС Замкова",
    brand: "olas",
    address: "вул. Замкова, 32, Дубно",
    latitude: 50.4172918,
    longitude: 25.7512427,
    phone: "+380362683350",
    website: "https://olas.com.ua/",
    facebook: null,
    instagram: null,
    workingHours: "Уточнюйте на місці",
    featured: false,
    description:
      "АЗС мережі ОЛАС у Дубні. Офіційна адреса на сайті olas.com.ua — вул. Замкова, 32 (OSM помилково вказує №51; у каталозі використовуємо офіційну адресу, координати — з OSM-контуру станції). Контакт мережі: +380362683350.",
  },
];

async function ensureCategory() {
  const maxSort = await prisma.category.aggregate({ _max: { sortOrder: true } });
  const sortOrder = Math.max(15, (maxSort._max.sortOrder ?? 0) + 1);

  return prisma.category.upsert({
    where: { slug: "zapravky" },
    create: {
      name: "Заправки",
      slug: "zapravky",
      icon: "Fuel",
      description: "АЗС і автозаправні комплекси Дубна",
      sortOrder,
    },
    update: {
      name: "Заправки",
      icon: "Fuel",
      description: "АЗС і автозаправні комплекси Дубна",
    },
  });
}

async function uploadBrandLogos(): Promise<Record<BrandKey, string>> {
  const urls = {} as Record<BrandKey, string>;
  for (const brand of Object.keys(BRAND_META) as BrandKey[]) {
    const meta = BRAND_META[brand];
    const buffer = await readFile(resolve(process.cwd(), meta.file));
    const blob = await put(meta.blobPath, buffer, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: meta.contentType,
    });
    urls[brand] = blob.url;
    console.log(`Logo ${brand}: ${blob.url}`);
  }
  return urls;
}

async function main() {
  const category = await ensureCategory();
  const logos = await uploadBrandLogos();

  let created = 0;
  let updated = 0;

  for (const station of STATIONS) {
    const data = {
      title: station.title,
      slug: station.slug,
      description: station.description,
      categoryId: category.id,
      address: station.address,
      latitude: station.latitude,
      longitude: station.longitude,
      phone: station.phone,
      website: station.website,
      facebook: station.facebook,
      instagram: station.instagram,
      workingHours: station.workingHours,
      featured: station.featured,
      rating: 0,
      images: [logos[station.brand]],
    };

    const existing = await prisma.place.findUnique({
      where: { slug: station.slug },
    });

    if (existing) {
      await prisma.place.update({
        where: { slug: station.slug },
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
          featured: data.featured,
          images: data.images,
        },
      });
      updated++;
    } else {
      await prisma.place.create({ data });
      created++;
    }

    console.log(`  • ${station.title} — ${station.address}`);
  }

  console.log("Gas stations Dubno import done:", {
    total: STATIONS.length,
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
