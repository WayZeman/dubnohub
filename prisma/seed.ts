import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { execSync } from "node:child_process";

const prisma = new PrismaClient();

const categories = [
  { name: "Кафе", slug: "kafe", icon: "Coffee", description: "Кавʼярні та кафе Дубна", sortOrder: 1 },
  { name: "Ресторани", slug: "restorany", icon: "UtensilsCrossed", description: "Ресторани міста", sortOrder: 2 },
  { name: "Аптеки", slug: "apteky", icon: "Pill", description: "Аптеки Дубна", sortOrder: 3 },
  { name: "Лікарні", slug: "likarni", icon: "Hospital", description: "Медзаклади", sortOrder: 4 },
  { name: "Стоматології", slug: "stomatologii", icon: "Smile", description: "Стоматологічні клініки", sortOrder: 5 },
  { name: "Банки", slug: "banky", icon: "Landmark", description: "Банки та відділення", sortOrder: 6 },
  { name: "Автомийки", slug: "avtomyyky", icon: "Car", description: "Автомийки", sortOrder: 7 },
  {
    name: "Заправки",
    slug: "zapravky",
    icon: "Fuel",
    description: "АЗС і автозаправні комплекси Дубна",
    sortOrder: 8,
  },
  {
    name: "Навчальні заклади",
    slug: "navchalni-zaklady",
    icon: "GraduationCap",
    description:
      "Школи, садочки, ліцеї, коледжі, університетські підрозділи та позашкільна освіта Дубна",
    sortOrder: 9,
  },
  {
    name: "Памʼятки",
    slug: "pamyatky",
    icon: "Castle",
    description: "Замки, храми, памʼятники та історичні будівлі Дубна",
    sortOrder: 10,
  },
  { name: "Парки", slug: "parky", icon: "Trees", description: "Парки та місця відпочинку Дубна", sortOrder: 11 },
  { name: "Магазини", slug: "magazyny", icon: "ShoppingBag", description: "Супермаркети та магазини", sortOrder: 12 },
  {
    name: "Пошта",
    slug: "poshta",
    icon: "Mail",
    description: "Відділення та поштомати Нової Пошти та інших операторів",
    sortOrder: 13,
  },
  { name: "Спортзали", slug: "sportzaly", icon: "Dumbbell", description: "Спорт і фітнес", sortOrder: 14 },
  { name: "Салони краси", slug: "salony-krasy", icon: "Sparkles", description: "Салони краси", sortOrder: 15 },
  {
    name: "Державні установи",
    slug: "derzhavni-ustanovy",
    icon: "Building2",
    description:
      "Органи влади, суд, поліція, ЦНАП, податкова, пенсійний фонд та інші держустанови Дубна",
    sortOrder: 16,
  },
  {
    name: "Промисловість",
    slug: "promyslovist",
    icon: "Factory",
    description:
      "Виробничі підприємства Дубна: харчова, текстильна, скляна, хімічна промисловість та інше",
    sortOrder: 17,
  },
  {
    name: "Медицина",
    slug: "medycyna",
    icon: "Hospital",
    description:
      "Поліклініки, ЦПМСД, амбулаторії та приватні медичні центри Дубна",
    sortOrder: 18,
  },
];

async function main() {
  console.log("Resetting directory data…");
  await prisma.review.deleteMany();
  await prisma.place.deleteMany();
  await prisma.category.deleteMany();

  console.log("Seeding categories…");
  for (const category of categories) {
    await prisma.category.create({ data: category });
  }

  await prisma.settings.upsert({
    where: { key: "site.name" },
    create: { key: "site.name", value: "DubnoHub" },
    update: { value: "DubnoHub" },
  });

  console.log("Importing Nova Poshta points in Dubno…");
  execSync("npx tsx scripts/import-nova-poshta.ts", {
    stdio: "inherit",
    env: process.env,
  });

  console.log("Importing Ukrposhta branches in Dubno…");
  execSync("npx tsx scripts/import-ukrposhta.ts", {
    stdio: "inherit",
    env: process.env,
  });

  console.log("Importing Meest points in Dubno…");
  execSync("npx tsx scripts/import-meest.ts", {
    stdio: "inherit",
    env: process.env,
  });

  console.log("Importing historical landmarks in Dubno…");
  execSync("npx tsx scripts/import-landmarks.ts", {
    stdio: "inherit",
    env: process.env,
  });

  console.log("Importing educational institutions in Dubno…");
  execSync("npx tsx scripts/import-schools.ts", {
    stdio: "inherit",
    env: process.env,
  });

  console.log("Importing gas stations in Dubno…");
  execSync("npx tsx scripts/import-gas-stations.ts", {
    stdio: "inherit",
    env: process.env,
  });

  console.log("Importing government institutions in Dubno…");
  execSync("npx tsx scripts/import-government.ts", {
    stdio: "inherit",
    env: process.env,
  });

  console.log("Importing industry enterprises in Dubno…");
  execSync("npx tsx scripts/import-industry.ts", {
    stdio: "inherit",
    env: process.env,
  });

  console.log("Importing medical facilities in Dubno…");
  execSync("npx tsx scripts/import-medicine.ts", {
    stdio: "inherit",
    env: process.env,
  });

  const placeCount = await prisma.place.count();
  console.log(`Done: ${categories.length} categories, ${placeCount} places`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
