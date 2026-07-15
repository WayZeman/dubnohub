import { config } from "dotenv";
import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";
import { geocodeAddress } from "../lib/geocode-dubno";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

const UP_WEBSITE = "https://www.ukrposhta.ua/";
const UP_FACEBOOK = "https://www.facebook.com/ukrposhta";
const UP_INSTAGRAM = "https://www.instagram.com/ukrposhta/";
const UP_PHONE = "+380800300545";
/**
 * Усі міські відділення Укрпошти в Дубні.
 * Джерела: офіційні індекси/адреси + координати з каталогу відділень.
 */
const BRANCHES = [
  {
    index: "35601",
    number: 1,
    address: "пров. Центральний, 8, Дубно",
    latitude: 50.3668162,
    longitude: 25.7608132,
    workingHours: "Пн–Пт: 08:00–19:00, Сб: 09:00–18:00",
  },
  {
    index: "35602",
    number: 2,
    address: "пров. Залізничний, 2Б, Дубно",
    latitude: 50.386617,
    longitude: 25.742763,
    workingHours: "Пн–Пт: 08:00–19:00, Сб–Нд: 09:00–18:00",
  },
  {
    index: "35603",
    number: 3,
    address: "вул. Данила Галицького, 15, Дубно",
    latitude: 50.41815,
    longitude: 25.73685,
    workingHours: "Пн–Пт: 08:00–19:00, Сб–Нд: 09:00–18:00",
  },
  {
    index: "35604",
    number: 4,
    address: "вул. Михайла Грушевського, 134, Дубно",
    latitude: 50.401993,
    longitude: 25.758833,
    workingHours: "Пн–Пт: 08:00–19:00, Сб–Нд: 09:00–18:00",
  },
] as const;

async function ensureLogo(): Promise<string> {
  const { readFile } = await import("node:fs/promises");
  const { resolve } = await import("node:path");
  const buffer = await readFile(
    resolve(process.cwd(), "public/brands/ukrposhta-logo.png"),
  );
  const blob = await put("brands/ukrposhta-logo.png", buffer, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "image/png",
  });
  return blob.url;
}

async function ensureCategory() {
  return prisma.category.upsert({
    where: { slug: "poshta" },
    create: {
      name: "Пошта",
      slug: "poshta",
      icon: "Mail",
      description: "Відділення та поштомати Укрпошти, Нової Пошти та інших операторів",
      sortOrder: 11,
    },
    update: {
      description:
        "Відділення та поштомати Укрпошти, Нової Пошти та інших операторів",
    },
  });
}

async function main() {
  const category = await ensureCategory();
  const logo = await ensureLogo();

  let created = 0;
  let updated = 0;

  for (const branch of BRANCHES) {
    const slug = `ukrposhta-${branch.index}-dubno`;
    const geo = await geocodeAddress(branch.address, { slug, delayMs: 1100 });
    const latitude = geo?.latitude ?? branch.latitude;
    const longitude = geo?.longitude ?? branch.longitude;

    const data = {
      title: `Укрпошта №${branch.number} (${branch.index})`,
      slug,
      description: `Міське відділення поштового звʼязку №${branch.number} АТ «Укрпошта» в Дубні. Поштовий індекс ${branch.index}. Відправлення та отримання листів і посилок, платежі та базові поштові послуги. Контакт-центр: ${UP_PHONE}.`,
      categoryId: category.id,
      address: branch.address,
      latitude,
      longitude,
      phone: UP_PHONE,
      website: UP_WEBSITE,
      facebook: UP_FACEBOOK,
      instagram: UP_INSTAGRAM,
      workingHours: branch.workingHours,
      featured: true,
      rating: 0,
      images: [logo],
    };

    const existing = await prisma.place.findUnique({ where: { slug } });
    if (existing) {
      await prisma.place.update({
        where: { slug },
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
  }

  console.log("Ukrposhta Dubno import done:", {
    total: BRANCHES.length,
    created,
    updated,
    logo,
  });
  for (const b of BRANCHES) {
    console.log(`  • №${b.number} (${b.index}) — ${b.address}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
