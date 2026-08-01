import { slugify } from "@/lib/translit";
import { uah } from "@/lib/money";
import type {
  CategoryNode,
  Product,
  ProductImage,
  ProductReview,
  SizeStock,
} from "./types";

/**
 * Демо-каталог для розробки: 21 модель × кольори ≈ 44 товари.
 * У продакшні джерелом даних стає Medusa (адмінка) — цей сід також
 * імпортується скриптом medusa/src/scripts/seed-anke.ts.
 * Фото — тонові плейсхолдери /public/demo/*.jpg до появи реальних зйомок.
 */

// ---------- Категорії ----------

const c = (
  slug: string,
  title: string,
  path: string[],
  description: string,
  children: CategoryNode[] = [],
  seoText?: string,
): CategoryNode => ({ id: `cat_${path.join("-")}`, slug, path, title, description, seoText, children });

/** SEO-тексти під лістингом (редагуються в адмінці; 800–1500 знаків) */
const SEO_SUKNI =
  "Купити сукню в Києві з доставкою по Україні — просто: у каталозі ANKE зібрані сукні власного виробництва на кожен сценарій життя. Лляні міді на щодень і в офіс, віскозні максі на відпустку, твідові міні на побачення і атласні вечірні — на події, де хочеться бути найкрасивішою.\n\nМи шиємо в Україні з натуральних тканин: льон 190 г/м², італійська віскоза, шовк і твід з вовною. У кожній картці — чесний склад, обміри в сантиметрах і параметри моделі на фото, щоб розмір було легко вгадати з першого разу. Якщо сумніваєтесь — стилісти ANKE підкажуть у Telegram.\n\nЗамовлення відправляємо Новою Поштою того ж дня (до 14:00), доставка 1–3 дні. Не підійшло — обмін або повернення протягом 14 днів без зайвих питань. А ще сукню можна приміряти в шоурумі в Києві — відкладемо ваш розмір перед візитом.";
const SEO_ODYAH =
  "Жіночий одяг ANKE — це гардероб, який збирається як конструктор: сукні, костюми, блузи, трикотаж і верхній одяг у спільній палітрі та стриманій естетиці. Кожна модель шиється в Україні з тканин, які ми обираємо руками: льон, вовна, кашемір, шовк, щільна бавовна.\n\nМи віримо в повільну моду: речі ANKE носяться роками і дружать між собою, тому капсула з п'яти позицій дає десятки образів. У кожній картці — чесний склад, догляд і параметри моделі; у кабінеті — трекінг замовлення до дверей.\n\nДоставка Новою Поштою по Україні 1–3 дні, оплата карткою, частинами або при отриманні. Обмін і повернення — 14 днів.";

export const CATEGORY_TREE: CategoryNode[] = [
  c("odyah", "Одяг", ["odyah"], "Жіночий одяг ANKE: сукні, костюми, трикотаж і верхній одяг українського виробництва.", [
    c("sukni", "Сукні", ["odyah", "sukni"], "Сукні ANKE — від лляних міді на щодень до атласних вечірніх.", [
      c("midi", "Сукні міді", ["odyah", "sukni", "midi"], "Сукні міді — довжина, що працює і в офісі, і на вечері."),
      c("maksi", "Сукні максі", ["odyah", "sukni", "maksi"], "Максі-сукні з легких тканин на теплий сезон."),
      c("mini", "Сукні міні", ["odyah", "sukni", "mini"], "Міні-сукні: твід, бавовна, впевнені силуети."),
      c("vechirni", "Вечірні сукні", ["odyah", "sukni", "vechirni"], "Атлас і шовк для особливих подій."),
    ], SEO_SUKNI),
    c("kostyumy", "Костюми", ["odyah", "kostyumy"], "Жіночі костюми: льон на літо, вовна на прохолодний сезон."),
    c("bluzy-sorochky", "Блузи та сорочки", ["odyah", "bluzy-sorochky"], "Шовкові блузи й бавовняні сорочки вільного крою."),
    c("spidnytsi", "Спідниці", ["odyah", "spidnytsi"], "Спідниці міді та плісе."),
    c("shtany", "Штани", ["odyah", "shtany"], "Палаццо, прямі та звужені силуети."),
    c("trykotazh", "Трикотаж", ["odyah", "trykotazh"], "Кашемір і вовна: джемпери, кардигани."),
    c("verkhniy-odyah", "Верхній одяг", ["odyah", "verkhniy-odyah"], "Пальта й тренчі на міжсезоння."),
  ], SEO_ODYAH),
  c("vzuttya", "Взуття", ["vzuttya"], "Шкіряне взуття ANKE: босоніжки, балетки."),
  c("aksesuary", "Аксесуари", ["aksesuary"], "Аксесуари зі шкіри та шовку.", [
    c("sumky", "Сумки", ["aksesuary", "sumky"], "Шкіряні сумки мінімалістичних форм."),
    c("remeni", "Ремені", ["aksesuary", "remeni"], "Шкіряні ремені ручної роботи."),
    c("khustky", "Хустки", ["aksesuary", "khustky"], "Шовкові хустки з авторськими принтами."),
  ]),
  c("prykrasy", "Прикраси", ["prykrasy"], "Лаконічні прикраси з позолотою."),
];

// ---------- Допоміжне ----------

type ToneKey =
  | "milk" | "beige" | "powder" | "dusty-rose" | "olive" | "graphite"
  | "black" | "sky" | "terracotta" | "lavender" | "emerald" | "bordeaux";

const TONE_HEX: Record<ToneKey, string> = {
  milk: "#F3EEE5", beige: "#DFD2BE", powder: "#EAD2DB", "dusty-rose": "#D2A5B6",
  olive: "#ABAF97", graphite: "#5C5C5C", black: "#1F1F1F", sky: "#BFCEDC",
  terracotta: "#CD9878", lavender: "#C8C0DC", emerald: "#6F927F", bordeaux: "#7E3F50",
};

type ColorDef = { name: string; tone: ToneKey };

type ModelDef = {
  title: string;
  categoryPath: string[];
  priceUAH: number;
  compareAtUAH?: number;
  material: string;      // коротко, для фільтра: "Льон"
  materialFull: string;  // "Льон 100%"
  care: string[];
  colors: ColorDef[];
  sizes: string[];
  /** Розміри без наявності, за назвою кольору (детерміновано) */
  outOfStock?: Record<string, string[]>;
  isNew?: boolean;
  description: string;
  modelParams?: string;
  outfitWith?: string[]; // базові назви моделей для «Створи образ»
  reviews?: Omit<ProductReview, "id" | "approved">[];
};

const CARE_STANDARD = ["Прання при 30°C у делікатному режимі", "Не відбілювати", "Прасування при низькій температурі"];
const CARE_DRYCLEAN = ["Тільки хімчистка", "Не прати", "Зберігати на плічках"];
const CARE_KNIT = ["Ручне прання при 30°C", "Сушити горизонтально", "Зберігати складеним"];
const CARE_LEATHER = ["Протирати м'якою сухою тканиною", "Уникати тривалого контакту з водою", "Зберігати в пилозахисному мішку"];

const MODEL_170 = "Параметри моделі: зріст 170 см, на моделі розмір S";
const MODEL_175 = "Параметри моделі: зріст 175 см, на моделі розмір S";

// ---------- Моделі ----------

const MODELS: ModelDef[] = [
  {
    title: "Сукня міді лляна «Соломія»",
    categoryPath: ["odyah", "sukni", "midi"],
    priceUAH: 2890,
    material: "Льон",
    materialFull: "Льон 100%",
    care: CARE_STANDARD,
    colors: [{ name: "Молочний", tone: "milk" }, { name: "Оливковий", tone: "olive" }, { name: "Чорний", tone: "black" }],
    sizes: ["XS", "S", "M", "L"],
    outOfStock: { Молочний: ["XS"], Чорний: ["L"] },
    isNew: true,
    description:
      "Сукня міді з натурального льону з відрізною талією і спідницею-кльош. Тримає форму, дихає у спеку і не потребує складного догляду. Ґудзики з натурального перламутру, бічні кишені в швах.",
    modelParams: MODEL_175,
    outfitWith: ["Босоніжки шкіряні «Мія»", "Сумка шкіряна «Мінімал»"],
    reviews: [
      { author: "Олена", rating: 5, text: "Льон щільний, не просвічує. Розмір відповідає сітці, брала S на 44.", date: "2026-06-14" },
      { author: "Ірина", rating: 5, text: "Найкраща сукня літа, ношу і в офіс, і на прогулянки.", date: "2026-07-02" },
    ],
  },
  {
    title: "Сукня максі з віскози «Аделіна»",
    categoryPath: ["odyah", "sukni", "maksi"],
    priceUAH: 3290,
    material: "Віскоза",
    materialFull: "Віскоза 95%, еластан 5%",
    care: CARE_STANDARD,
    colors: [{ name: "Пудровий", tone: "powder" }, { name: "Блакитний", tone: "sky" }],
    sizes: ["XS", "S", "M", "L"],
    isNew: true,
    description:
      "Струмка максі-сукня з м'якої віскози з регульованими бретелями і розрізом. Тканина приємно холодить і красиво драпірується в русі. Підкладка по ліфу, потайна блискавка.",
    modelParams: MODEL_175,
    outfitWith: ["Хустка шовкова «Політ»", "Босоніжки шкіряні «Мія»"],
  },
  {
    title: "Сукня міні твідова «Ірен»",
    categoryPath: ["odyah", "sukni", "mini"],
    priceUAH: 2690,
    compareAtUAH: 3190,
    material: "Твід",
    materialFull: "Поліестер 60%, вовна 25%, бавовна 15%",
    care: CARE_DRYCLEAN,
    colors: [{ name: "Бежевий", tone: "beige" }, { name: "Чорний", tone: "black" }],
    sizes: ["XS", "S", "M"],
    outOfStock: { Бежевий: ["XS"] },
    description:
      "Твідова міні-сукня прямого крою з фактурною нитку і підкладкою. Класика, що працює з балетками вдень і підборами ввечері. Кромка з бахромою, золотисті ґудзики.",
    modelParams: MODEL_170,
    outfitWith: ["Балетки шкіряні «Грація»"],
    reviews: [{ author: "Марія", rating: 4, text: "Якість чудова, але майнула швидко — беріть свій розмір одразу.", date: "2026-05-21" }],
  },
  {
    title: "Вечірня сукня атласна «Ніч»",
    categoryPath: ["odyah", "sukni", "vechirni"],
    priceUAH: 4590,
    material: "Атлас",
    materialFull: "Поліестер 97%, еластан 3%",
    care: CARE_DRYCLEAN,
    colors: [{ name: "Бордо", tone: "bordeaux" }, { name: "Чорний", tone: "black" }],
    sizes: ["XS", "S", "M", "L"],
    isNew: true,
    description:
      "Атласна сукня в білизняному стилі з косим кроєм, що м'яко облягає силует. Тонкі бретелі регулюються, виріз на спині. Сукня, в якій нічого зайвого — тільки блиск тканини і лінія руху.",
    modelParams: MODEL_175,
    outfitWith: ["Кольє «Лінія»", "Сережки «Крапля»"],
  },
  {
    title: "Костюм лляний «Мрія»",
    categoryPath: ["odyah", "kostyumy"],
    priceUAH: 4890,
    material: "Льон",
    materialFull: "Льон 85%, віскоза 15%",
    care: CARE_STANDARD,
    colors: [{ name: "Бежевий", tone: "beige" }, { name: "Молочний", tone: "milk" }],
    sizes: ["XS", "S", "M", "L"],
    isNew: true,
    description:
      "Лляний костюм-двійка: вільний жакет без підкладки і штани-палаццо на високій посадці. Виглядає зібрано навіть у +30. Кожну частину можна носити окремо — з джинсами або базовою футболкою.",
    modelParams: MODEL_175,
    outfitWith: ["Блуза шовкова «Аврора»", "Сумка шкіряна «Мінімал»"],
    reviews: [{ author: "Наталія", rating: 5, text: "Купила на конференцію — отримала десяток компліментів.", date: "2026-06-30" }],
  },
  {
    title: "Костюм брючний вовняний «Класик»",
    categoryPath: ["odyah", "kostyumy"],
    priceUAH: 5490,
    compareAtUAH: 6290,
    material: "Вовна",
    materialFull: "Вовна 70%, поліестер 28%, еластан 2%",
    care: CARE_DRYCLEAN,
    colors: [{ name: "Графітовий", tone: "graphite" }, { name: "Чорний", tone: "black" }],
    sizes: ["S", "M", "L"],
    outOfStock: { Графітовий: ["S"] },
    description:
      "Строгий костюм з італійської вовняної тканини: однобортний жакет на підкладці і прямі штани зі стрілками. Той випадок, коли крій робить усе сам. Внутрішня кишеня, ґудзики в тон.",
    modelParams: MODEL_170,
  },
  {
    title: "Блуза шовкова «Аврора»",
    categoryPath: ["odyah", "bluzy-sorochky"],
    priceUAH: 2190,
    material: "Шовк",
    materialFull: "Шовк 92%, еластан 8%",
    care: CARE_DRYCLEAN,
    colors: [{ name: "Молочний", tone: "milk" }, { name: "Пудровий", tone: "powder" }, { name: "Блакитний", tone: "sky" }],
    sizes: ["XS", "S", "M", "L"],
    isNew: true,
    description:
      "Шовкова блуза з м'яким бантом-зав'язкою, який можна носити і розпущеним. Натуральний шовк красиво ловить світло і не електризується. Перламутрові ґудзики, подовжена спинка.",
    modelParams: MODEL_170,
    outfitWith: ["Костюм лляний «Мрія»", "Штани палаццо «Флоу»"],
  },
  {
    title: "Сорочка оверсайз бавовняна «Лея»",
    categoryPath: ["odyah", "bluzy-sorochky"],
    priceUAH: 1790,
    material: "Бавовна",
    materialFull: "Бавовна 100%",
    care: CARE_STANDARD,
    colors: [{ name: "Молочний", tone: "milk" }, { name: "Лавандовий", tone: "lavender" }],
    sizes: ["S", "M", "L"],
    description:
      "Оверсайз-сорочка зі щільної бавовни з чоловічого гардероба — тільки з жіночими пропорціями. Опущена лінія плеча, об'ємний рукав з широким манжетом. Ідеальна база під усе.",
    modelParams: MODEL_175,
  },
  {
    title: "Спідниця міді плісе «Хвиля»",
    categoryPath: ["odyah", "spidnytsi"],
    priceUAH: 1990,
    material: "Поліестер",
    materialFull: "Поліестер 100%",
    care: ["Прання при 30°C", "Не викручувати", "Не прасувати плісировку"],
    colors: [{ name: "Пудровий", tone: "powder" }, { name: "Графітовий", tone: "graphite" }],
    sizes: ["XS", "S", "M", "L"],
    description:
      "Спідниця-плісе довжини міді на еластичному поясі. Тримає складку після прання, не мнеться у валізі. Рухається за кроком — саме за це ми її любимо.",
    modelParams: MODEL_170,
    outfitWith: ["Джемпер кашеміровий «Хмара»"],
  },
  {
    title: "Штани палаццо «Флоу»",
    categoryPath: ["odyah", "shtany"],
    priceUAH: 2290,
    material: "Віскоза",
    materialFull: "Віскоза 78%, поліестер 22%",
    care: CARE_STANDARD,
    colors: [{ name: "Бежевий", tone: "beige" }, { name: "Чорний", tone: "black" }],
    sizes: ["XS", "S", "M", "L"],
    isNew: true,
    description:
      "Широкі штани на високій посадці з тканини, що струмує. Подовжують ноги і не сковують крок. Приховані кишені, застібка на гачок і потайну блискавку.",
    modelParams: MODEL_175,
    outfitWith: ["Блуза шовкова «Аврора»"],
  },
  {
    title: "Джемпер кашеміровий «Хмара»",
    categoryPath: ["odyah", "trykotazh"],
    priceUAH: 3890,
    material: "Кашемір",
    materialFull: "Кашемір 70%, вовна мериноса 30%",
    care: CARE_KNIT,
    colors: [{ name: "Молочний", tone: "milk" }, { name: "Пудрово-рожевий", tone: "dusty-rose" }, { name: "Блакитний", tone: "sky" }],
    sizes: ["XS", "S", "M", "L"],
    outOfStock: { "Пудрово-рожевий": ["XS", "S"] },
    isNew: true,
    description:
      "Джемпер з кашеміру з мериносом — той, який не хочеться знімати. Невагомий, не колеться, тримає тепло без об'єму. Спущене плече, злегка подовжена спинка.",
    modelParams: MODEL_170,
    outfitWith: ["Спідниця міді плісе «Хвиля»", "Штани палаццо «Флоу»"],
    reviews: [
      { author: "Вікторія", rating: 5, text: "М'якість неймовірна. Після трьох прань виглядає як новий.", date: "2026-03-08" },
      { author: "Дарія", rating: 5, text: "Брала мамі в подарунок, тепер замовляю собі.", date: "2026-04-17" },
    ],
  },
  {
    title: "Кардиган вовняний «Затишок»",
    categoryPath: ["odyah", "trykotazh"],
    priceUAH: 2990,
    compareAtUAH: 3490,
    material: "Вовна",
    materialFull: "Вовна 55%, акрил 45%",
    care: CARE_KNIT,
    colors: [{ name: "Бежевий", tone: "beige" }, { name: "Оливковий", tone: "olive" }],
    sizes: ["S", "M", "L"],
    description:
      "Об'ємний кардиган великої в'язки з накладними кишенями і ґудзиками з рогу. Працює як легке пальто в міжсезоння і як плед у подорожі.",
    modelParams: MODEL_175,
  },
  {
    title: "Пальто вовняне «Осінь»",
    categoryPath: ["odyah", "verkhniy-odyah"],
    priceUAH: 6890,
    material: "Вовна",
    materialFull: "Вовна 80%, поліамід 20%",
    care: CARE_DRYCLEAN,
    colors: [{ name: "Бежевий", tone: "beige" }, { name: "Графітовий", tone: "graphite" }],
    sizes: ["S", "M", "L"],
    isNew: true,
    description:
      "Однобортне пальто прямого крою з м'якої вовняної тканини з кашеміровим туше. Лацкани ручної обробки, глибокі кишені, шліца. Довжина нижче коліна — универсальна для будь-якого зросту.",
    modelParams: MODEL_175,
    outfitWith: ["Джемпер кашеміровий «Хмара»", "Сумка шкіряна «Мінімал»"],
  },
  {
    title: "Тренч класичний «Лондон»",
    categoryPath: ["odyah", "verkhniy-odyah"],
    priceUAH: 5590,
    material: "Бавовна",
    materialFull: "Бавовна 65%, поліестер 35%, водовідштовхувальне просочення",
    care: CARE_DRYCLEAN,
    colors: [{ name: "Бежевий", tone: "beige" }],
    sizes: ["XS", "S", "M", "L"],
    description:
      "Двобортний тренч з усіма канонічними деталями: погони, шторм-клапан, пояс з пряжкою, розріз зі шліцею. Щільна бавовна з просоченням тримає мряку і вітер.",
    modelParams: MODEL_175,
  },
  {
    title: "Босоніжки шкіряні «Мія»",
    categoryPath: ["vzuttya"],
    priceUAH: 2790,
    material: "Шкіра",
    materialFull: "Натуральна шкіра, підкладка — шкіра, підошва — TR",
    care: CARE_LEATHER,
    colors: [{ name: "Бежевий", tone: "beige" }, { name: "Чорний", tone: "black" }],
    sizes: ["36", "37", "38", "39", "40"],
    outOfStock: { Бежевий: ["36"], Чорний: ["40"] },
    isNew: true,
    description:
      "Босоніжки на стійких підборах 5 см з м'якими шкіряними ремінцями. Колодка перевірена сотнями кілометрів міста — не натирають з першого дня.",
  },
  {
    title: "Балетки шкіряні «Грація»",
    categoryPath: ["vzuttya"],
    priceUAH: 2390,
    material: "Шкіра",
    materialFull: "Натуральна шкіра, устілка — шкіра",
    care: CARE_LEATHER,
    colors: [{ name: "Чорний", tone: "black" }, { name: "Пудровий", tone: "powder" }],
    sizes: ["36", "37", "38", "39", "40"],
    description:
      "Класичні балетки з квадратним носом з м'якої наппи. Гнучка підошва, непомітна гумка по канту — сидять щільно без тиску.",
  },
  {
    title: "Сумка шкіряна «Мінімал»",
    categoryPath: ["aksesuary", "sumky"],
    priceUAH: 3490,
    material: "Шкіра",
    materialFull: "Натуральна шкіра, фурнітура з покриттям під золото",
    care: CARE_LEATHER,
    colors: [{ name: "Чорний", tone: "black" }, { name: "Теракотовий", tone: "terracotta" }],
    sizes: ["One size"],
    isNew: true,
    description:
      "Сумка-тоут з гладкої шкіри без зайвих деталей: одна секція, внутрішня кишеня на блискавці, магнітна застібка. Вміщує ноутбук 13″.",
    reviews: [{ author: "Оксана", rating: 5, text: "Шкіра щільна, тримає форму. Фурнітура не темніє.", date: "2026-05-05" }],
  },
  {
    title: "Ремінь шкіряний «Тонкий»",
    categoryPath: ["aksesuary", "remeni"],
    priceUAH: 890,
    material: "Шкіра",
    materialFull: "Натуральна шкіра рослинного дублення",
    care: CARE_LEATHER,
    colors: [{ name: "Чорний", tone: "black" }],
    sizes: ["S", "M", "L"],
    description:
      "Вузький ремінь 1,5 см з латунною пряжкою. Той самый штрих, що збирає сукню або оверсайз-сорочку в силует.",
  },
  {
    title: "Хустка шовкова «Політ»",
    categoryPath: ["aksesuary", "khustky"],
    priceUAH: 1290,
    material: "Шовк",
    materialFull: "Шовк 100%, ручна обробка краю",
    care: ["Тільки хімчистка", "Прасувати через тканину"],
    colors: [{ name: "Пудровий", tone: "powder" }, { name: "Смарагдовий", tone: "emerald" }],
    sizes: ["One size"],
    isNew: true,
    description:
      "Шовкова хустка 70×70 см з авторським принтом. Носіть на шиї, у волоссі або на ручці сумки — тримає колір і шовковистість роками.",
  },
  {
    title: "Сережки «Крапля»",
    categoryPath: ["prykrasy"],
    priceUAH: 990,
    material: "Латунь",
    materialFull: "Латунь з позолотою 18К, гіпоалергенні швензи",
    care: ["Зберігати в сухому місці", "Уникати контакту з парфумами"],
    colors: [{ name: "Золотистий", tone: "milk" }],
    sizes: ["One size"],
    description:
      "Витончені сережки-краплі з позолотою. Легкі — вуха не втомлюються навіть за цілий день.",
  },
  {
    title: "Кольє «Лінія»",
    categoryPath: ["prykrasy"],
    priceUAH: 1190,
    material: "Латунь",
    materialFull: "Латунь з позолотою 18К",
    care: ["Зберігати в сухому місці", "Уникати контакту з водою"],
    colors: [{ name: "Золотистий", tone: "milk" }],
    sizes: ["One size"],
    isNew: true,
    description:
      "Тонке кольє-ланцюжок з мініатюрною підвіскою-планкою. Носиться соло або в багатошаровості з іншими прикрасами.",
  },
];

// ---------- Експансія: модель × колір → Product ----------

function imagesFor(tone: ToneKey, title: string, colorName: string): ProductImage[] {
  const alt = (suffix: string) => `${title} — ${colorName} — ANKE${suffix}`;
  const img = (t: ToneKey, suffix: string): ProductImage => ({
    url: `/demo/${t}.jpg`, alt: alt(suffix), width: 1200, height: 1600,
  });
  // Плейсхолдери: основний тон + «деталі» в нейтральних тонах
  return [img(tone, ""), img("milk", " — деталь"), img("beige", " — фактура"), img(tone, " — вигляд ззаду")];
}

function buildProducts(): Product[] {
  const products: Product[] = [];
  const titleToSlugByColor = new Map<string, string>();

  // Перший прохід: обчислюємо слаги
  for (const m of MODELS) {
    for (const col of m.colors) {
      titleToSlugByColor.set(`${m.title}|${col.name}`, slugify(`${m.title} ${col.name}`));
    }
  }
  const firstSlugOf = (title: string) => {
    const m = MODELS.find((x) => x.title === title);
    if (!m) return undefined;
    return titleToSlugByColor.get(`${title}|${m.colors[0].name}`);
  };

  let skuCounter = 100;
  for (const m of MODELS) {
    const groupId = `grp-${slugify(m.title)}`;
    skuCounter += 1;
    let colorIdx = 0;
    for (const col of m.colors) {
      colorIdx += 1;
      const slug = titleToSlugByColor.get(`${m.title}|${col.name}`)!;
      const oos = new Set(m.outOfStock?.[col.name] ?? []);
      const sizes: SizeStock[] = m.sizes.map((s) => ({ size: s, inStock: !oos.has(s) }));
      const reviews: ProductReview[] = (m.reviews ?? []).map((r, i) => ({
        ...r, id: `rev-${slug}-${i}`, approved: true,
      }));
      const rating = reviews.length
        ? { value: Math.round((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10) / 10, count: reviews.length }
        : undefined;

      products.push({
        id: `prod_${slug}`,
        slug,
        title: `${m.title} — ${col.name.toLowerCase()}`,
        brand: "ANKE",
        sku: `ANK-${skuCounter}-${colorIdx}`,
        price: uah(m.priceUAH),
        compareAtPrice: m.compareAtUAH ? uah(m.compareAtUAH) : undefined,
        images: imagesFor(col.tone, m.title, col.name),
        color: { name: col.name, hex: TONE_HEX[col.tone] },
        colorGroupId: groupId,
        sizes,
        inStock: sizes.some((s) => s.inStock),
        isNew: Boolean(m.isNew),
        categoryPath: m.categoryPath,
        material: m.material,
        description: m.description,
        materialFull: m.materialFull,
        care: m.care,
        madeIn: "Україна",
        modelParams: m.modelParams,
        colors: m.colors
          .filter((c2) => c2.name !== col.name)
          .map((c2) => ({
            name: c2.name,
            hex: TONE_HEX[c2.tone],
            productSlug: titleToSlugByColor.get(`${m.title}|${c2.name}`)!,
          })),
        outfitWith: (m.outfitWith ?? [])
          .map((t) => firstSlugOf(t))
          .filter((s): s is string => Boolean(s)),
        rating,
        reviews,
      });
    }
  }
  return products;
}

export const PRODUCTS: Product[] = buildProducts();
