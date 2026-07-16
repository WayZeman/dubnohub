import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

const HOURS_STD =
  "Пн–Чт: 08:00–17:15, Пт: 08:00–16:00 (уточнюйте в установі)";
const HOURS_CNAP = "Пн–Чт: 08:00–17:00, Пт: 08:00–16:00";
const HOURS_24 = "Цілодобово (екстрені виклики: 101 / 102)";

type GovPlace = {
  slug: string;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  facebook: string | null;
  workingHours: string | null;
  featured: boolean;
  description: string;
};

/**
 * Public-facing state & municipal institutions in the city of Dubno.
 * Primary sources: dubno-adm.gov.ua (infrastructure, justice, contacts),
 * cnap.dubno-adm.gov.ua, dubnorda.rv.gov.ua, court.gov.ua, OSM.
 * Schools / libraries / КП utilities are out of scope (other categories).
 */
const PLACES: GovPlace[] = [
  {
    slug: "miska-rada-dubno",
    title: "Дубенська міська рада",
    address: "вул. Замкова, 4, Дубно",
    latitude: 50.4208735,
    longitude: 25.7452898,
    phone: "+380365632200",
    website: "https://dubno-adm.gov.ua/",
    facebook: null,
    workingHours: HOURS_STD,
    featured: true,
    description:
      "Орган місцевого самоврядування Дубенської міської територіальної громади. Приймальна міського голови: +380365632200. Адреса підтверджена офіційним сайтом міської ради та OSM.",
  },
  {
    slug: "cnap-dubno",
    title: "ЦНАП Дубенської міської ради",
    address: "вул. Замкова, 4, Дубно",
    latitude: 50.4208735,
    longitude: 25.7452898,
    phone: "+380365632471",
    website: "https://cnap.dubno-adm.gov.ua/",
    facebook: null,
    workingHours: HOURS_CNAP,
    featured: true,
    description:
      "Центр надання адміністративних послуг (головний офіс). Телефони: +380365632471, моб. +380683960308. Послуги: реєстрація проживання, бізнесу, речових прав, паспортні та соціальні сервіси. Джерело: cnap.dubno-adm.gov.ua.",
  },
  {
    slug: "cnap-vrm-dubno",
    title: "ЦНАП — віддалене робоче місце",
    address: "вул. Кирила і Мефодія, 16, Дубно",
    latitude: 50.418555,
    longitude: 25.7437272,
    phone: "+380365632471",
    website: "https://cnap.dubno-adm.gov.ua/contacts",
    facebook: null,
    workingHours: HOURS_CNAP,
    featured: false,
    description:
      "Віддалене робоче місце ЦНАП Дубенської міської ради. Телефони ті самі, що в головного офісу: +380365632471, +380683960308. Джерело: офіційна сторінка контактів ЦНАП.",
  },
  {
    slug: "soczahyst-dubno",
    title: "Управління соціального захисту населення",
    address: "вул. Кирила і Мефодія, 16, Дубно",
    latitude: 50.418555,
    longitude: 25.7437272,
    phone: "+380365632381",
    website: "https://dubno-adm.gov.ua/",
    facebook: null,
    workingHours: HOURS_STD,
    featured: true,
    description:
      "Управління соціального захисту населення Дубенської міської ради. Телефони з офіційного розділу інфраструктури: +380365632381, +380365632287, +380365649506.",
  },
  {
    slug: "rda-dubno",
    title: "Дубенська районна державна адміністрація",
    address: "вул. Данила Галицького, 17, Дубно",
    latitude: 50.4182197,
    longitude: 25.7357284,
    phone: "+380365649489",
    website: "https://dubnorda.rv.gov.ua/",
    facebook: null,
    workingHours: HOURS_STD,
    featured: true,
    description:
      "Дубенська районна державна адміністрація Рівненської області. Адреса — вул. Данила Галицького, 17 (офіційний перелік установ міста). Координати будівлі — Google Maps / OSM.",
  },
  {
    slug: "rayonna-rada-dubno",
    title: "Дубенська районна рада",
    address: "вул. Данила Галицького, 17, Дубно",
    latitude: 50.4182197,
    longitude: 25.7357284,
    phone: "+380365649389",
    website: "https://dubnorda.rv.gov.ua/",
    facebook: null,
    workingHours: HOURS_STD,
    featured: false,
    description:
      "Дубенська районна рада. Розташована за адресою вул. Данила Галицького, 17 (разом із РДА). Телефон з офіційного переліку інфраструктури міста: +380365649389.",
  },
  {
    slug: "sud-dubno",
    title: "Дубенський міськрайонний суд",
    address: "вул. Данила Галицького, 22, Дубно",
    latitude: 50.4187959,
    longitude: 25.7379333,
    phone: "+380365649564",
    website: "https://db.rv.court.gov.ua/",
    facebook: null,
    workingHours: HOURS_STD,
    featured: true,
    description:
      "Дубенський міськрайонний суд Рівненської області. Офіційна адреса та телефон з court.gov.ua: вул. Д. Галицького, 22; +380365649564 (факс +380365642189). Email: inbox@db.rv.court.gov.ua.",
  },
  {
    slug: "policia-dubno",
    title: "Дубенський відділ поліції",
    address: "вул. Пекарська, 10, Дубно",
    latitude: 50.4218685,
    longitude: 25.7435122,
    phone: "+380365632702",
    website: "https://rv.npu.gov.ua/",
    facebook: null,
    workingHours: HOURS_24,
    featured: true,
    description:
      "Дубенський районний відділ поліції ГУНП в Рівненській області. Офіційна адреса (ГУНП / міська рада): вул. Пекарська, 10. Екстрений виклик: 102. Телефон чергової: +380365632702.",
  },
  {
    slug: "prokuratura-dubno",
    title: "Дубенська окружна прокуратура",
    address: "вул. Івана Франка, 10, Дубно",
    latitude: 50.4175387,
    longitude: 25.7345523,
    phone: "+380365632540",
    website: "https://rivne.gp.gov.ua/",
    facebook: null,
    workingHours: HOURS_STD,
    featured: true,
    description:
      "Дубенська окружна прокуратура. Адреса вул. Івана Франка, 10 підтверджена офіційним переліком установ міста. Телефон: +380365632540 (у довідниках також +380365649132).",
  },
  {
    slug: "podatkova-dubno",
    title: "Дубенська ДПІ",
    address: "вул. Михайла Грушевського, 134, Дубно",
    latitude: 50.4021606,
    longitude: 25.75914,
    phone: "+380800501007",
    website: "https://rv.tax.gov.ua/",
    facebook: null,
    workingHours: HOURS_STD,
    featured: true,
    description:
      "Дубенська державна податкова інспекція / центр обслуговування платників ГУ ДПС у Рівненській області. Адреса: вул. Грушевського, 134. Локальний телефон консультанта: +380365646154; гаряча лінія ДПС: +380800501007.",
  },
  {
    slug: "pensiynyi-fond-dubno",
    title: "Пенсійний фонд (Дубенський район)",
    address: "вул. Шевченка, 27, Дубно",
    latitude: 50.4237165,
    longitude: 25.7429349,
    phone: "+380800503753",
    website: "https://www.pfu.gov.ua/",
    facebook: null,
    workingHours: "Пн–Чт: 08:00–17:00, Пт: 08:00–15:45",
    featured: true,
    description:
      "Територіальний підрозділ Пенсійного фонду України (сектор/обслуговування Дубенського району). Адреса: вул. Шевченка, 27. Локальний телефон: +380365649432; гаряча лінія ПФУ: +380800503753.",
  },
  {
    slug: "tck-dubno",
    title: "Дубенський РТЦК та СП",
    address: "вул. Пекарська, 3, Дубно",
    latitude: 50.4216657,
    longitude: 25.7424975,
    phone: "+380365632340",
    website: "https://dubnorda.rv.gov.ua/adresy-terytorialnykh-tsentriv-komplektuvannia-ta-sotsialnoi-pidtrymky",
    facebook: null,
    workingHours: "Уточнюйте за телефоном",
    featured: true,
    description:
      "Дубенський районний територіальний центр комплектування та соціальної підтримки. Офіційна адреса РДА: вул. Пекарська, 3; тел. +380365632340. Координати — Google Maps для адреси Пекарська, 3.",
  },
  {
    slug: "dsns-dubno",
    title: "ДСНС — ДПРЧ-5",
    address: "вул. Михайла Грушевського, 119, Дубно",
    latitude: 50.3922105,
    longitude: 25.7578057,
    phone: null,
    website: "https://rv.dsns.gov.ua/",
    facebook: null,
    workingHours: HOURS_24,
    featured: true,
    description:
      "5-та державна пожежно-рятувальна частина / підрозділ 4 ДПРЗ ГУ ДСНС України у Рівненській області. Адреса: вул. Михайла Грушевського, 119 (OSM + ЄДРПОУ). Екстрений виклик: 101.",
  },
  {
    slug: "racs-dubno",
    title: "Дубенський відділ ДРАЦС",
    address: "вул. Свободи, 1, Дубно",
    latitude: 50.4189028,
    longitude: 25.7440387,
    phone: "+380365649551",
    website: "https://dubno-adm.gov.ua/dubenchaninu/zabezpechennja-zakonnosti-i-porjadku/justicija.html",
    facebook: null,
    workingHours: HOURS_STD,
    featured: true,
    description:
      "Дубенський міськрайонний відділ державної реєстрації актів цивільного стану. Адреса за офіційною сторінкою міської ради (юстиція): вул. Свободи, 1. Телефони: +380365649551, +380365642100.",
  },
  {
    slug: "notarialna-1-dubno",
    title: "Перша державна нотаріальна контора",
    address: "вул. Скарбова, 10, Дубно",
    latitude: 50.4210928,
    longitude: 25.7411074,
    phone: "+380365643268",
    website: "https://dubno-adm.gov.ua/dubenchaninu/zabezpechennja-zakonnosti-i-porjadku/justicija.html",
    facebook: null,
    workingHours: HOURS_STD,
    featured: false,
    description:
      "Перша Дубенська державна нотаріальна контора. Адреса та телефон з офіційної сторінки міської ради: вул. Скарбова, 10; +380365643268.",
  },
  {
    slug: "notarialna-2-dubno",
    title: "Друга державна нотаріальна контора",
    address: "вул. Драгоманова, 12, Дубно",
    latitude: 50.4210537,
    longitude: 25.744658,
    phone: "+380365632307",
    website: "https://dubno-adm.gov.ua/dubenchaninu/zabezpechennja-zakonnosti-i-porjadku/justicija.html",
    facebook: null,
    workingHours: HOURS_STD,
    featured: false,
    description:
      "Друга Дубенська державна нотаріальна контора. Адреса: вул. Драгоманова, 12; тел. +380365632307 (офіційна сторінка юстиції міської ради).",
  },
  {
    slug: "dvs-dubno",
    title: "Відділ державної виконавчої служби",
    address: "вул. Михайла Грушевського, 134, Дубно",
    latitude: 50.4021606,
    longitude: 25.75914,
    phone: "+380365621610",
    website: "https://dubno-adm.gov.ua/dubenchaninu/zabezpechennja-zakonnosti-i-porjadku/justicija.html",
    facebook: null,
    workingHours: HOURS_STD,
    featured: false,
    description:
      "Дубенський міськрайонний відділ державної виконавчої служби. Адреса: вул. Грушевського, 134 (разом із податковою). Телефони: +380365621610, +380365621390.",
  },
  {
    slug: "tersentr-dubno",
    title: "Територіальний центр соцобслуговування",
    address: "вул. Михайла Грушевського, 171, Дубно",
    latitude: 50.3960805,
    longitude: 25.757607,
    phone: "+380365621333",
    website:
      "https://dubno-adm.gov.ua/dubenchaninu/socialnii-zakhist/teritorialnii-centr-socialnogo-obslugovuvannja.html",
    facebook: null,
    workingHours: "Пн–Чт: 08:00–17:15, Пт: 08:00–16:00",
    featured: false,
    description:
      "Територіальний центр соціального обслуговування (надання соціальних послуг) м. Дубно. Офіційна адреса: вул. Грушевського, 171. Телефони: +380365621333, +380365622123.",
  },
  {
    slug: "upravlinnya-osvity-dubno",
    title: "Управління освіти",
    address: "вул. Тараса Бульби, 4, Дубно",
    latitude: 50.4204222,
    longitude: 25.7393433,
    phone: "+380365642180",
    website: "https://dubno-adm.gov.ua/",
    facebook: null,
    workingHours: HOURS_STD,
    featured: false,
    description:
      "Управління освіти Дубенської міської ради. Адреса: вул. Тараса Бульби, 4. Телефони: +380365642180, +380365632591 (офіційний перелік інфраструктури).",
  },
  {
    slug: "arkhiv-dubno",
    title: "Архівний відділ міської ради",
    address: "вул. Ольги Кобилянської, 72, Дубно",
    latitude: 50.4077502,
    longitude: 25.7739346,
    phone: "+380365644056",
    website: "https://dubno-adm.gov.ua/",
    facebook: null,
    workingHours: HOURS_STD,
    featured: false,
    description:
      "Архівний відділ Дубенської міської ради. Адреса: вул. Ольги Кобилянської, 72. Телефон: +380365644056.",
  },
  {
    slug: "tsentr-sssdm-dubno",
    title: "Центр соціальних служб для сімʼї",
    address: "вул. Драгоманова, 12, Дубно",
    latitude: 50.4210537,
    longitude: 25.744658,
    phone: "+380365632394",
    website: "https://dubno-adm.gov.ua/",
    facebook: null,
    workingHours: HOURS_STD,
    featured: false,
    description:
      "Міський центр соціальної служби для сімʼї, дітей та молоді. Адреса: вул. Драгоманова, 12. Телефон: +380365632394 (офіційний перелік інфраструктури).",
  },
];

async function ensureCategory() {
  const maxSort = await prisma.category.aggregate({
    _max: { sortOrder: true },
  });
  const sortOrder = Math.max(16, (maxSort._max.sortOrder ?? 0) + 1);

  return prisma.category.upsert({
    where: { slug: "derzhavni-ustanovy" },
    create: {
      name: "Державні установи",
      slug: "derzhavni-ustanovy",
      icon: "Building2",
      description:
        "Органи влади, суд, поліція, ЦНАП, податкова, пенсійний фонд та інші держустанови Дубна",
      sortOrder,
    },
    update: {
      name: "Державні установи",
      icon: "Building2",
      description:
        "Органи влади, суд, поліція, ЦНАП, податкова, пенсійний фонд та інші держустанови Дубна",
    },
  });
}

async function ensureLogo(): Promise<string> {
  const buffer = await readFile(
    resolve(process.cwd(), "public/brands/gov-emblem.png"),
  );
  const blob = await put("brands/gov-emblem.png", buffer, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "image/png",
  });
  return blob.url;
}

async function main() {
  const category = await ensureCategory();
  const logo = await ensureLogo();

  let created = 0;
  let updated = 0;

  for (const place of PLACES) {
    const data = {
      title: place.title,
      slug: place.slug,
      description: place.description,
      categoryId: category.id,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      phone: place.phone,
      website: place.website,
      facebook: place.facebook,
      instagram: null as string | null,
      workingHours: place.workingHours,
      featured: place.featured,
      rating: 0,
      images: [logo],
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

    console.log(`  • ${place.title} — ${place.address}`);
  }

  console.log("Government institutions Dubno import done:", {
    total: PLACES.length,
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
