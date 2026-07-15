import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

type Landmark = {
  slug: string;
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string | null;
  website?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  workingHours?: string | null;
  featured?: boolean;
  photoUrls: string[];
};

/**
 * Історичні памʼятки Дубна (місто + найближчі околиці).
 * Джерела: Державний ІКЗ м. Дубна, landmarks.in.ua, discover.ua,
 * Via Regia, Shtetl Routes, dubno-adm.gov.ua, Wikimedia.
 */
const LANDMARKS: Landmark[] = [
  {
    slug: "dubenskyi-zamok",
    title: "Дубенський замок",
    description:
      "Головна памʼятка міста й одна з «семи чудес» замків України. Камʼяну твердиню на мисі над Іквою ствердив князь Костянтин Іванович Острозький близько 1492 р. на місці давнішого укріплення. Комплекс включає палац князів Острозьких (XV–XVI ст.), палац князів Любомирських (XVIII ст.) і надбрамний корпус із гербом Острозьких. Це єдиний в Україні двобастіонний замок; завдяки 73 гарматам і заплавам Ікви його ніколи не брали штурмом. Тут розгорталися події повісті М. Гоголя «Тарас Бульба». Сьогодні в залі замку діють музейні експозиції, каземати, виставка історії тортур і нічні екскурсії. Вхідна каса Державного історико-культурного заповідника міста Дубна.",
    address: "вул. Замкова, 7а, Дубно",
    latitude: 50.42032,
    longitude: 25.7484201,
    phone: "+380984758621",
    website: "https://www.zamokdubno.com.ua/",
    facebook: "https://www.facebook.com/zamokdubno/",
    workingHours: "Щодня: 09:00–18:00 (зали зачиняються за 15 хв до кінця)",
    featured: true,
    photoUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/7/75/56-103-0213_Dubno_Castle_RB_24.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/7/7f/Dubno_Castle_1_RB.jpg",
    ],
  },
  {
    slug: "lutska-brama",
    title: "Луцька брама",
    description:
      "Рідкісний барбакан — одна з трьох подібних веж-барбаканів, що збереглися в Україні (дві інші — в Острозі). Зведена у 1623–1624 рр. за проєктом архітектора Якуба Мадлайна на давньому шляху на Луцьк. Входила до західної оборонної лінії міста: зʼєднувалася з валом, мала рів і підйомний міст, а підземним ходом з пивниць можна було дістатися замку. У 1785 р. наказ князя Михайла Любомирського істотно змінив вигляд брами (третій поверх, перепланування). Саме тут у XVIII ст. збиралася масонська ложа «Досконала таємниця». Памʼятка архітектури національного значення, частина Державного історико-культурного заповідника м. Дубна.",
    address: "вул. Данила Галицького, 32, Дубно",
    latitude: 50.4186581,
    longitude: 25.7338444,
    website: "https://www.zamokdubno.com.ua/",
    featured: true,
    photoUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/d/dc/Dubno_Lutsk_Gate_RB.jpg",
    ],
  },
  {
    slug: "velyka-synahoha",
    title: "Велика синагога",
    description:
      "Одна з найбільших синагог Західної України й яскравий зразок синагогального будівництва XVIII ст. Камʼяну будівлю зводили у 1782–1794/95 рр. на місці деревʼяної синагоги XVI ст. коштом кагалу за підтримки князя Михайла Любомирського. Над входом збереглася таблиця з гербом Любомирських і написом про молитву «хай буде, що буде». Стилістика поєднує елементи бароко, ренесансу й класицизму. Споруда постраждала у Першу світову (пожежа даху), але залишилася домінантою колишнього єврейського кварталу на південь від ринку. Входить до Державного історико-культурного заповідника м. Дубна.",
    address: "вул. Кирила і Мефодія, 23, Дубно",
    latitude: 50.4169655,
    longitude: 25.7444195,
    featured: true,
    photoUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/1/1b/Dubno_Synagogue_RB.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/8/8f/Dubno_synagogue_02.jpg",
    ],
  },
  {
    slug: "kostel-yana-nepomuka",
    title: "Костел святого Яна Непомука",
    description:
      "Фарний (парафіяльний) римо-католицький костел у центрі Дубна. Мурований храм зводили орієнтовно у 1817–1835 рр. (освячення — близько 1830 р.) на місці попередніх деревʼяних костелів парафії, яку свого часу заснував князь Януш Острозький. Дзвіниця поряд підкреслює вертикаль історичного середмістя. У радянський період (з 1959 р.) храм закрили, вівтар знищили, а приміщення віддали під спортшколу; вірянам повернено після 1990-х. Нині знову діючий костел, частина Державного історико-культурного заповідника м. Дубна.",
    address: "вул. Князя Острозького, 18, Дубно",
    latitude: 50.4201041,
    longitude: 25.7435729,
    featured: true,
    photoUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/7/73/Dubno_Church_of_St_Jan_Nepomuk_RB.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/9/99/Dubno_Belfry_of_Church_of_St_Jan_Nepomuk_RB.jpg",
    ],
  },
  {
    slug: "mykolaivskyi-sobor",
    title: "Миколаївський собор (монастир бернардинів)",
    description:
      "Колишній бернардинський монастир і костел, закладений князем Янушем Острозьким (будівництво близько 1617–1629 рр.). Масштабна споруда раннього бароко (орієнтовно 55×22 м) стояла біля міського валу й разом із Луцькою брамою відігравала оборонну роль; дзвіниця слугувала ще й дозорною вежею. Після пожежі 1784 р. відбудований; з кінця XVIII ст. переданий православним, у XIX ст. перебудований у псевдоросійському стилі під церкву св. Миколая. У різні періоди тут були жіночий монастир, знову бернардинці й уніатська семінарія. Нині — Свято-Миколаївський чоловічий монастир ПЦУ. Входить до Державного історико-культурного заповідника м. Дубна; у криптах повʼязують місцеві легенди з подіями «Тараса Бульби».",
    address: "вул. Данила Галицького, 28, Дубно",
    latitude: 50.4181843,
    longitude: 25.7400539,
    featured: true,
    photoUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/3/39/Dubno_Bernardine_Monastery_1_RB.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/f/fa/Bernardine_Monastery_in_Dubno_06.jpg",
    ],
  },
  {
    slug: "yuriivska-tserkva",
    title: "Юрʼївська (Георгіївська) церква",
    description:
      "Деревʼяна тридільна трибанна церква святого Юрія (Георгія) на камʼяному фундаменті в колишньому передмісті Сурмичі. Зведена близько 1700–1709 рр. у традиціях волинської школи українського бароко — з характерними пропорціями й окремою дзвіницею. Один із найгармонійніших зразків сакрального зодчества Дубна. Памʼятка входить до Державного історико-культурного заповідника міста Дубна.",
    address: "вул. Садова, 10, Дубно",
    latitude: 50.4155032,
    longitude: 25.7571668,
    featured: true,
    photoUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/b/be/Dubno_Church_of_St_George_RB.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/e/e6/Dubno_Bell_Tower_of_Church_of_St_George_RB.jpg",
    ],
  },
  {
    slug: "monastyr-karmelitek",
    title: "Монастир кармеліток (св. Варвари)",
    description:
      "Бароковий комплекс костелу (бл. 1630) і монастиря ордену кармеліток (завершення бл. 1686). Одна з візитівок «міста храмів» і памʼятка архітектури національного значення. Відомий також як комплекс св. Варвари / монастир св. Барбари. Масивні мури й силует костелу формують північний край історичного центру. Входить до Державного історико-культурного заповідника м. Дубна.",
    address: "вул. Тараса Шевченка, 51–54, Дубно",
    latitude: 50.4263697,
    longitude: 25.7417887,
    featured: true,
    photoUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/d/d1/Dubno_Carmelite_monastery_1_RB.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/5/5b/Dubno_Carmelite_monastery_2_RB.jpg",
    ],
  },
  {
    slug: "spaso-preobrazhenska-tserkva",
    title: "Спасо-Преображенська церква (на Кемпі)",
    description:
      "Єдина збережена споруда давнього Спасо-Преображенського монастиря на «Кемпі» (від польськ. «острів») серед заплави Ікви. Монастир повʼязують із князями Острозькими (XV ст.); на старовинному дзвоні — дата 1573 р. До 1630 р. обитель була православною, згодом — уніатською; після 1812 р. споруди знову передали православній церкві. У XIX ст. храм зазнав значних перебудов «під православний» стиль. Збереглися цінні ікони XVII ст., зокрема Богоматері та Ісуса Христа в срібних шатах. Одна з найдавніших мурованих культових памʼяток Дубна, частина історико-культурного заповідника.",
    address: "вул. Івана Франка, 21б / 30, Дубно",
    latitude: 50.4166344,
    longitude: 25.7352451,
    featured: true,
    photoUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/c/c9/56-103-0245_Dubno_Church_RB.jpg",
    ],
  },
  {
    slug: "sobor-proroka-illii",
    title: "Собор пророка Іллі",
    description:
      "Пʼятиверхий мурований православний собор 1908 р. у російсько-візантійському стилі, зведений коштом містян. Храм має дзвіницю й цінний іконостас початку XX ст. Розташований у історичному центрі поблизу дороги до замку. Входить до Державного історико-культурного заповідника міста Дубна як одна з ключових сакральних домінант міста.",
    address: "вул. Данила Галицького, 13, Дубно",
    latitude: 50.4180814,
    longitude: 25.7378733,
    featured: true,
    photoUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/6/61/Dubno_St_Elias_Cathedral_RB.jpg",
    ],
  },
  {
    slug: "tarakanivskyi-fort",
    title: "Тараканівський форт (форт-застава Дубно)",
    description:
      "Потужна фортифікація кінця XIX ст. (бл. 1890) біля с. Тараканів, за кілька кілометрів від Дубна. Зведена як форт-застава для захисту стратегічної залізниці Львів–Київ на російсько-австрійському кордоні. Бетонні каземати, підземні ходи й напівзруйновані зали залишилися «магнітом» для туристів і урбаністів. Місце часто називають містичним: густі зарості, волога й розгалужена система переходів. Найкраще відвідувати вдень, з ліхтарем і зручним взуттям.",
    address: "с. Тараканів (орієнтир траса М-06), біля Дубна",
    latitude: 50.3629697,
    longitude: 25.7162056,
    featured: true,
    photoUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/4/42/56-216-0041_Tarakaniv_Fort_RB.jpg",
    ],
  },
  {
    slug: "sobor-rizdva-bohorodytsi",
    title: "Собор Різдва Пресвятої Богородиці",
    description:
      "Величний пʼятибаневий мурований храм, «перлина» Дубна, що поєднує візантійські й українсько-барокові мотиви. Історія сягає монастиря, який у 1665 р. заснувала княжна Анна Пузина на землях маєтку у Страклеві (нині в межах міста). Собор хрестоподібний у плані, з багатоярусним різбленим іконостасом і цінними іконами; загальна площа понад 700 м². Оточений парковою зоною на вул. Полуботка — місце паломництва й тихої прогулянки.",
    address: "вул. Полуботка, 17, Дубно",
    latitude: 50.3805289,
    longitude: 25.735943,
    featured: true,
    photoUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/e/e5/%D0%A1%D0%BE%D0%B1%D0%BE%D1%80_%D0%A0%D1%96%D0%B7%D0%B4%D0%B2%D0%B0_%D0%9F%D1%80%D0%B5%D1%81%D0%B2%D1%8F%D1%82%D0%BE%D1%97_%D0%91%D0%BE%D0%B3%D0%BE%D1%80%D0%BE%D0%B4%D0%B8%D1%86%D1%96_%28%D0%94%D1%83%D0%B1%D0%BD%D0%BE%29.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/2/21/Church_of_the_Nativity_of_the_Theotokos%2C_Dubno_05.jpg",
    ],
  },
  {
    slug: "kontraktovyi-budynok",
    title: "Контрактовий будинок",
    description:
      "Будинок контрактів кінця XVIII — початку XIX ст. на колишній ринковій площі (нині майдан Незалежності / вул. Свободи). Споруда повʼязана з епохою знаменитих «дубенських контрактів» — великих оптових ярмарків, що зробили місто торговою столицею Волині. Архітектура еклектичного / класицистичного спрямування. У міжвоєнний період на першому поверсі були крамниці, на другому — кінотеатр і театральна зала; у радянські роки — Будинок культури. Нині тут працює міський будинок дітей та молоді. Охоронний № 21-Рв.",
    address: "вул. Свободи, 1, Дубно",
    latitude: 50.418893,
    longitude: 25.744262,
    featured: true,
    photoUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/5/5a/DSC_0363_%D0%91%D1%83%D0%B4%D0%B8%D0%BD%D0%BE%D0%BA_%D0%BA%D0%BE%D0%BD%D1%82%D1%80%D0%B0%D0%BA%D1%82%D1%96%D0%B2.jpg",
    ],
  },
  {
    slug: "park-derevianykh-skulptur",
    title: "Парк деревʼяних скульптур",
    description:
      "Відкрита галерея деревʼяних постатей у парку ім. Т. Шевченка — роботи місцевого різьбяра Миколи Бондарчука. Серед фігур — князь Острозький, Тарас Бульба, Михайло Грушевський, Кирило і Мефодій, ангел із тризубом, герої казок («Рукавичка», «Івасик-Телесик», «Дерево казок» тощо). Підсвітка фігур у темну пору доби робить алею популярною прогулянковою точкою центру. Це сучасна культурна памʼятка, тісно повʼязана з історичною ідентичністю міста.",
    address: "вул. Тараса Шевченка (парк ім. Шевченка), Дубно",
    latitude: 50.4218,
    longitude: 25.7435,
    featured: true,
    photoUrls: [
      "https://ua.igotoworld.com/frontend/webcontent/websites/1/images/gallery/2691213_800x600_P1000869.jpg",
      "https://ua.igotoworld.com/frontend/webcontent/websites/1/images/gallery/2691220_370x246_P1000868.jpg",
    ],
  },
  {
    slug: "pamyatnyk-shevchenku",
    title: "Памʼятник Тарасу Шевченку",
    description:
      "Одна з найвиразніших шевченкіанських композицій України — робота скульптора Л. Л. Бризьнюка (початок 1990-х). Три фігури показують життєвий шлях Кобзаря: хлопчика, молодого митця й сивочолого поета. Встановлений біля Будинку культури на вул. Данила Галицького на місці демонтованого памʼятника Леніну. Тарас Шевченко відвідував Дубно восени 1846 р. Композиція стала символічним орієнтиром центру міста.",
    address: "вул. Данила Галицького (біля Будинку культури), Дубно",
    latitude: 50.4181843,
    longitude: 25.7400539,
    featured: true,
    photoUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/4/47/Dubno_Shevchenko_Monument_RB.jpg",
    ],
  },
  {
    slug: "aleia-nebesnoi-sotni",
    title: "Алея Небесної Сотні",
    description:
      "Меморіальна алея на честь Героїв Небесної Сотні — місце памʼяті подій Революції Гідності. Розташована на Острівку в парку навпроти Дубенського замка; тут проходять щорічні заходи вшанування. Поруч — скамейки та памʼятний знак з іменами загиблих на Майдані.",
    address: "Острівок (парк навпроти замку), Дубно",
    latitude: 50.4222005,
    longitude: 25.7471918,
    featured: false,
    photoUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/3/38/Nebesna_Sotnja.Ostrivok.jpg",
    ],
  },
  {
    slug: "kraieznavchyi-muzei",
    title: "Краєзнавчий музей (ІКЗ м. Дубна)",
    description:
      "Музейна частина Державного історико-культурного заповідника міста Дубна. У фондах і експозиціях — ікони XVI–XIX ст. волинської школи, старовинні дзвони, царські врата XVII ст., портрети князів Острозьких, Любомирських, Сангушків, Заславських. Оглядові виставки доповнюють відвідування замку. Адреса й каса заповідника — вул. Замкова, 7а.",
    address: "вул. Замкова, 7а, Дубно",
    latitude: 50.42032,
    longitude: 25.7484201,
    phone: "+380984758621",
    website: "https://www.zamokdubno.com.ua/",
    workingHours: "Щодня: 09:00–18:00",
    featured: true,
    photoUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/7/7f/Dubno_Castle_1_RB.jpg",
    ],
  },
  {
    slug: "budynok-elberta",
    title: "Будинок Ельберта",
    description:
      "Історичний житловий будинок XIX ст. на вул. Тараса Бульби — зразок міської камʼяної забудови епохи зростання Дубна як торговельного й військового центру. Зберігає риси історичної житлової архітектури середмістя й входить до переліку визначних світських памʼяток міста.",
    address: "вул. Тараса Бульби, 4, Дубно",
    latitude: 50.420328,
    longitude: 25.739283,
    featured: false,
    photoUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/0/01/%D0%91%D1%83%D0%B4%D0%B8%D0%BD%D0%BE%D0%BA_%D0%95%D0%BB%D1%8C%D0%B1%D0%B5%D1%80%D1%82%D0%B0_%28%D0%BC%D1%83%D1%80.%29%2C_%D0%BC.%D0%94%D1%83%D0%B1%D0%BD%D0%BE%2C_%D0%B2%D1%83%D0%BB.%D0%A2.%D0%91%D1%83%D0%BB%D1%8C%D0%B1%D0%B8%2C_4.jpg",
    ],
  },
  {
    slug: "budynok-dombrovskoho",
    title: "Будинок Домбровського",
    description:
      "Особняк XIX ст. на вул. Михайла Грушевського — памʼятка житлової архітектури історичного Дубна. Будинок повʼязують із місцевою купецькою / міщанською елітою доби, коли місто активно розбудовувало камʼяні вулиці після контрактових ярмарків.",
    address: "вул. Михайла Грушевського, 156, Дубно",
    latitude: 50.398921,
    longitude: 25.757499,
    featured: false,
    photoUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/9/98/%D0%91%D1%83%D0%B4%D0%B8%D0%BD%D0%BE%D0%BA_%D0%94%D0%BE%D0%BC%D0%B1%D1%80%D0%BE%D0%B2%D1%81%D1%8C%D0%BA%D0%BE%D0%B3%D0%BE_%28%D0%BC%D1%83%D1%80.%29%2C_%D0%BC.%D0%94%D1%83%D0%B1%D0%BD%D0%BE%2C_%D0%B2%D1%83%D0%BB.%D0%93%D1%80%D1%83%D1%88%D0%B5%D0%B2%D1%81%D1%8C%D0%BA%D0%BE%D0%B3%D0%BE%2C_156.jpg",
    ],
  },
  {
    slug: "sadyba-shuvalovykh",
    title: "Садиба / комплекс економії (вул. Грушевського, 104)",
    description:
      "Комплекс будівель колишньої економії / садиби XIX ст. на вул. Михайла Грушевського. Світська заміська й міська архітектура, що ілюструє господарський устрій великих маєтків навколо Дубна. Збережені корпуси — частина історико-культурного ландшафту міста.",
    address: "вул. Михайла Грушевського, 104, Дубно",
    latitude: 50.399133,
    longitude: 25.755536,
    featured: false,
    photoUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/f/fb/%D0%94%D1%83%D0%B1%D0%BD%D0%BE_%D0%9A%D0%BE%D0%BC%D0%BF%D0%BB%D0%B5%D0%BA%D1%81_%D0%B1%D1%83%D0%B4%D1%96%D0%B2%D0%B5%D0%BB%D1%8C_%D0%B5%D0%BA%D0%BE%D0%BD%D0%BE%D0%BC%D1%96%D1%97_%D0%A8%D1%83%D0%B2%D0%B0%D0%BB%D0%BE%D0%B2%D0%BE%D1%97_%28XIX%E2%80%93XX_%D1%81%D1%82.%29.jpg",
    ],
  },
  {
    slug: "khmelefabruka",
    title: "Хмелефабрика XIX ст.",
    description:
      "Промислова памʼятка на вул. Свободи, 48 — будівля колишньої хмелефабрики XIX ст. Нагадує про господарську спеціалізацію Волині й розвиток переробної промисловості Дубна в імперський період. Цінний приклад індустріальної архітектури історичного центру.",
    address: "вул. Свободи, 48, Дубно",
    latitude: 50.418984,
    longitude: 25.739782,
    featured: false,
    photoUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/5/56/%D0%94%D1%83%D0%B1%D0%BD%D0%BE_%28113%29_%D0%A5%D0%BC%D0%B5%D0%BB%D0%B5%D1%84%D0%B0%D0%B1%D1%80%D0%B8%D0%BA%D0%B0.jpg",
    ],
  },
  {
    slug: "istorychni-budynky-svobody",
    title: "Історична забудова вул. Свободи",
    description:
      "Ансамбль камʼяних житлових і торгово-житлових будинків XIX ст. уздовж вул. Свободи (зокрема № 8–18). Формує «обличчя» центральної вулиці після епохи дубенських контрактів: купецькі фасади, лавки на перших поверхах, житло зверху. Разом із Контрактовим будинком це найкраще місце, щоб відчути історичне середмістя Дубна.",
    address: "вул. Свободи, 8–18, Дубно",
    latitude: 50.419212,
    longitude: 25.744834,
    featured: false,
    photoUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/2/27/%D0%96%D0%B8%D1%82%D0%BB%D0%BE%D0%B2%D0%B8%D0%B9_%D0%B1%D1%83%D0%B4%D0%B8%D0%BD%D0%BE%D0%BA%2C_%D0%94%D1%83%D0%B1%D0%BD%D0%BE%2C_%D0%B2%D1%83%D0%BB._%D0%A1%D0%B2%D0%BE%D0%B1%D0%BE%D0%B4%D0%B8%2C_8.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/a/a7/%D0%94%D1%83%D0%B1%D0%BD%D0%BE_%D0%B2%D1%83%D0%BB._%D0%A1%D0%B2%D0%BE%D0%B1%D0%BE%D0%B4%D0%B8%2C_14.jpg",
    ],
  },
  {
    slug: "kupezki-budynky-kyryla-mefodiia",
    title: "Купецькі будинки (Кирила і Мефодія)",
    description:
      "Комплекс купецьких і торгово-житлових будинків XVIII–XIX ст. на вул. Кирила і Мефодія (зокрема № 6, 10, 12) у колишньому єврейському торговельному кварталі біля синагоги. Щільна історична забудова зберігає планувальну тканину старого Дубна.",
    address: "вул. Кирила і Мефодія, 6–12, Дубно",
    latitude: 50.417322,
    longitude: 25.743473,
    featured: false,
    photoUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/2/22/%D0%91%D1%83%D0%B4%D0%B8%D0%BD%D0%BE%D0%BA_%D0%BA%D1%83%D0%BF%D1%86%D1%8F_%28%D0%BC%D1%83%D1%80.%29%2C_%D0%BC.%D0%94%D1%83%D0%B1%D0%BD%D0%BE%2C_%D0%B2%D1%83%D0%BB.%D0%9A%D0%B8%D1%80%D0%B8%D0%BB%D0%B0_%D1%96_%D0%9C%D0%B5%D1%84%D0%BE%D0%B4%D1%96%D1%8F%2C_6.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/1/12/%D0%94%D1%83%D0%B1%D0%BD%D0%BE_%D0%B2%D1%83%D0%BB.%D0%9A%D0%B8%D1%80%D0%B8%D0%BB%D0%B0_%D1%96_%D0%9C%D0%B5%D1%84%D0%BE%D0%B4%D1%96%D1%8F%2C_10.jpg",
    ],
  },
  {
    slug: "torhovi-budynky-drahomanova",
    title: "Торгово-житлові будинки (Драгоманова, 1)",
    description:
      "Історичні торгово-житлові будівлі XIX ст. на вул. Михайла Драгоманова, 1 — частина щільної ринкової забудови біля костелу Яна Непомука. Типовий приклад міської камʼяниці з комерційним низом і житлом над ним.",
    address: "вул. Михайла Драгоманова, 1, Дубно",
    latitude: 50.420269,
    longitude: 25.743869,
    featured: false,
    photoUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/e/ed/Dubno_Drahomanova_1_RB.jpg",
    ],
  },
  {
    slug: "kolyshnia-likarnia",
    title: "Колишня лікарня XIX ст.",
    description:
      "Будівля колишньої лікарні XIX ст. на вул. Вінниченка, 18 — приклад громадської архітектури міста імперської доби. Свідчить про розвиток міської медицини й соціальної інфраструктури Дубна поза сакральними й оборонними памʼятками.",
    address: "вул. Вінниченка, 18, Дубно",
    latitude: 50.419738,
    longitude: 25.739191,
    featured: false,
    photoUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/1/1f/%D0%9A%D0%BE%D0%BB%D0%B8%D1%88%D0%BD%D1%8F_%D0%BB%D1%96%D0%BA%D0%B0%D1%80%D0%BD%D1%8F_%28%D0%BC%D1%83%D1%80.%29%2C_%D0%BC.%D0%94%D1%83%D0%B1%D0%BD%D0%BE%2C_%D0%B2%D1%83%D0%BB.%D0%92%D1%96%D0%BD%D0%BD%D0%B8%D1%87%D0%B5%D0%BD%D0%BA%D0%B0%2C_18_1.jpg",
    ],
  },
  {
    slug: "sadyba-shevchenka-10",
    title: "Садиба 1870 р. (вул. Шевченка, 10)",
    description:
      "Міська садиба 1870 р. на вул. Тараса Шевченка — памʼятка житлової архітектури другої половини XIX ст. Компактний обʼєм і планування характерні для камʼяної забудови Дубна періоду після військово-адміністративного зростання міста.",
    address: "вул. Тараса Шевченка, 10, Дубно",
    latitude: 50.422556,
    longitude: 25.744209,
    featured: false,
    photoUrls: [
      "https://upload.wikimedia.org/wikipedia/commons/5/5c/%D0%A1%D0%B0%D0%B4%D0%B8%D0%B1%D0%B0_%28%D0%B7%D0%BC%D1%96%D1%88.%29%2C_%D0%BC.%D0%94%D1%83%D0%B1%D0%BD%D0%BE%2C_%D0%B2%D1%83%D0%BB.%D0%A8%D0%B5%D0%B2%D1%87%D0%B5%D0%BD%D0%BA%D0%B0%2C_10.jpg",
    ],
  },
];

async function ensureCategory() {
  return prisma.category.upsert({
    where: { slug: "pamyatky" },
    create: {
      name: "Памʼятки",
      slug: "pamyatky",
      icon: "Castle",
      description:
        "Замки, храми, памʼятники, історичні будинки та меморіали Дубна",
      sortOrder: 9,
    },
    update: {
      name: "Памʼятки",
      icon: "Castle",
      description:
        "Замки, храми, памʼятники, історичні будинки та меморіали Дубна",
      sortOrder: 9,
    },
  });
}

async function main() {
  const category = await ensureCategory();
  await prisma.category.updateMany({
    where: { slug: "parky" },
    data: {
      description: "Парки та місця відпочинку Дубна",
      sortOrder: 10,
    },
  });

  let created = 0;
  let updated = 0;

  for (const landmark of LANDMARKS) {
    const data = {
      title: landmark.title,
      slug: landmark.slug,
      description: landmark.description,
      categoryId: category.id,
      address: landmark.address,
      latitude: landmark.latitude,
      longitude: landmark.longitude,
      phone: landmark.phone ?? null,
      website: landmark.website ?? null,
      facebook: landmark.facebook ?? null,
      instagram: landmark.instagram ?? null,
      workingHours: landmark.workingHours ?? null,
      featured: Boolean(landmark.featured),
      images: landmark.photoUrls,
    };

    const existing = await prisma.place.findUnique({
      where: { slug: landmark.slug },
      select: { id: true, images: true },
    });

    if (existing) {
      // Keep already-uploaded blob images when present
      const images =
        existing.images.some((url) => url.includes("blob.vercel-storage.com"))
          ? existing.images
          : landmark.photoUrls;
      await prisma.place.update({
        where: { slug: landmark.slug },
        data: { ...data, images },
      });
      updated++;
      console.log(`↻ ${landmark.title}`);
    } else {
      await prisma.place.create({ data });
      created++;
      console.log(`+ ${landmark.title}`);
    }
  }

  console.log("Landmarks import done:", {
    total: LANDMARKS.length,
    created,
    updated,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
