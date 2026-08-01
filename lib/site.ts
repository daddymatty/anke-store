/**
 * Глобальна конфігурація сайту ANKE.
 * Навігація тут — статичний каркас; з Етапу 3 категорії підтягуються з Medusa,
 * цей файл лишається джерелом правди для службових посилань і контактів.
 */

export const SITE = {
  name: "ANKE",
  tagline: "SHOWROOM",
  description:
    "ANKE — жіночий одяг та аксесуари. Сукні, костюми, трикотаж і прикраси з доставкою Новою Поштою по Україні.",
  /** Фінальний домен підставиться через env, коли буде куплений */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://anke-store.example",
  locale: "uk",
  /** en вмикається після наповнення контентом (архітектура готова) */
  locales: ["uk"] as const,
  currency: "UAH",
  contacts: {
    // TODO(власник): реальні контакти перед запуском
    phone: "+380 00 000 00 00",
    email: "hello@anke-store.example",
    address: "м. Київ",
    schedule: "Пн–Нд 10:00–20:00",
    instagram: "https://instagram.com/anke.showroom",
    telegram: "https://t.me/anke_showroom",
  },
  /** Реквізити продавця для футера і юридичних сторінок */
  legal: {
    // TODO(власник): реальні реквізити ФОП перед запуском
    sellerName: "ФОП Прізвище Ім'я По батькові",
    edrpou: "0000000000",
    legalAddress: "Україна, м. Київ, вул. …",
  },
  freeShippingFrom: 2500, // грн, для прогрес-бара в кошику
} as const;

export type NavChild = { title: string; href: string };
export type NavItem = {
  title: string;
  href: string;
  accent?: boolean;
  children?: { title: string; href: string; items?: NavChild[] }[];
};

/** Дерево навігації (3 рівні): Одяг → Сукні → Міді */
export const NAV: NavItem[] = [
  {
    title: "Одяг",
    href: "/odyah",
    children: [
      {
        title: "Сукні",
        href: "/odyah/sukni",
        items: [
          { title: "Міді", href: "/odyah/sukni/midi" },
          { title: "Максі", href: "/odyah/sukni/maksi" },
          { title: "Міні", href: "/odyah/sukni/mini" },
          { title: "Вечірні", href: "/odyah/sukni/vechirni" },
        ],
      },
      { title: "Костюми", href: "/odyah/kostyumy" },
      { title: "Блузи та сорочки", href: "/odyah/bluzy-sorochky" },
      { title: "Спідниці", href: "/odyah/spidnytsi" },
      { title: "Штани", href: "/odyah/shtany" },
      { title: "Трикотаж", href: "/odyah/trykotazh" },
      { title: "Верхній одяг", href: "/odyah/verkhniy-odyah" },
    ],
  },
  { title: "Взуття", href: "/vzuttya" },
  {
    title: "Аксесуари",
    href: "/aksesuary",
    children: [
      { title: "Сумки", href: "/aksesuary/sumky" },
      { title: "Ремені", href: "/aksesuary/remeni" },
      { title: "Хустки", href: "/aksesuary/khustky" },
    ],
  },
  { title: "Прикраси", href: "/prykrasy" },
  { title: "Новинки", href: "/novynky" },
  { title: "SALE", href: "/sale", accent: true },
];

export const FOOTER_LINKS = {
  shop: [
    { title: "Новинки", href: "/novynky" },
    { title: "Одяг", href: "/odyah" },
    { title: "Аксесуари", href: "/aksesuary" },
    { title: "SALE", href: "/sale" },
    { title: "Lookbook", href: "/lookbook" },
  ],
  help: [
    { title: "Доставка й оплата", href: "/dostavka-oplata" },
    { title: "Обмін і повернення", href: "/povernennya" },
    { title: "Таблиця розмірів", href: "/rozmirna-sitka" },
    { title: "FAQ", href: "/faq" },
    { title: "Контакти", href: "/kontakty" },
  ],
  brand: [
    { title: "Про бренд", href: "/pro-brend" },
    { title: "Блог", href: "/blog" },
    { title: "Договір оферти", href: "/oferta" },
    { title: "Політика конфіденційності", href: "/konfidentsiynist" },
    { title: "Політика cookie", href: "/cookie" },
  ],
} as const;
