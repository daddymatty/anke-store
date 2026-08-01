import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { pageAlternates } from "@/lib/seo/meta";

export const metadata: Metadata = {
  title: "Lookbook — образи нової колекції",
  description:
    "Lookbook ANKE: готові образи нової колекції з посиланнями на кожну річ. Натхнення для вашої капсули.",
  alternates: pageAlternates("/lookbook"),
};

/** Луки збираються в адмінці (Етап 12); поки — куровані добірки з демо-обкладинками. */
const LOOKS = [
  {
    tone: "milk",
    title: "Ранок у місті",
    items: [
      { title: "Сорочка «Лея»", href: "/product/sorochka-oversaiz-bavovniana-leia-molochnyi" },
      { title: "Палаццо «Флоу»", href: "/product/shtany-palatstso-flou-bezhevyi" },
      { title: "Балетки «Грація»", href: "/product/baletky-shkiriani-hratsiia-chornyi" },
    ],
  },
  {
    tone: "powder",
    title: "Побачення о сьомій",
    items: [
      { title: "Сукня «Аделіна»", href: "/product/suknia-maksi-z-viskozy-adelina-pudrovyi" },
      { title: "Хустка «Політ»", href: "/product/khustka-shovkova-polit-pudrovyi" },
      { title: "Сережки «Крапля»", href: "/product/serezhky-kraplia-zolotystyi" },
    ],
  },
  {
    tone: "graphite",
    title: "Важлива зустріч",
    items: [
      { title: "Костюм «Класик»", href: "/product/kostium-briuchnyi-vovnianyi-klasyk-hrafitovyi" },
      { title: "Блуза «Аврора»", href: "/product/bluza-shovkova-avrora-molochnyi" },
      { title: "Сумка «Мінімал»", href: "/product/sumka-shkiriana-minimal-chornyi" },
    ],
  },
  {
    tone: "olive",
    title: "Літо за містом",
    items: [
      { title: "Сукня «Соломія»", href: "/product/suknia-midi-lliana-solomiia-olyvkovyi" },
      { title: "Босоніжки «Мія»", href: "/product/bosonizhky-shkiriani-miia-bezhevyi" },
    ],
  },
  {
    tone: "bordeaux",
    title: "Вечірній вихід",
    items: [
      { title: "Сукня «Ніч»", href: "/product/vechirnia-suknia-atlasna-nich-bordo" },
      { title: "Кольє «Лінія»", href: "/product/kolie-liniia-zolotystyi" },
    ],
  },
  {
    tone: "beige",
    title: "Перший холод",
    items: [
      { title: "Пальто «Осінь»", href: "/product/palto-vovniane-osin-bezhevyi" },
      { title: "Джемпер «Хмара»", href: "/product/dzhemper-kashemirovyi-khmara-molochnyi" },
    ],
  },
];

export default function LookbookPage() {
  return (
    <Container className="py-6 md:py-10">
      <Breadcrumbs items={[{ title: "Lookbook", href: "/lookbook" }]} />
      <h1 className="mt-5 font-display text-display-sm font-light md:text-display">Lookbook</h1>
      <p className="mt-2 max-w-xl text-[14px] text-muted">
        Готові образи нової колекції. Кожну річ з луку можна відкрити і замовити.
      </p>
      <ul className="mt-10 grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
        {LOOKS.map((look, i) => (
          <li key={look.title}>
            <Reveal delay={(i % 3) * 0.05}>
              <div className="relative aspect-[3/4] overflow-hidden bg-beige">
                <Image
                  src={`/demo/${look.tone}.jpg`}
                  alt={`Образ «${look.title}» — ANKE lookbook`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <h2 className="mt-4 font-display text-xl font-light">{look.title}</h2>
              <ul className="mt-2 space-y-1">
                {look.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-[13px] text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
                    >
                      {item.title} →
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          </li>
        ))}
      </ul>
    </Container>
  );
}
