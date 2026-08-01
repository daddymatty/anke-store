import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { faqJsonLd } from "@/lib/seo/jsonld";
import { pageAlternates } from "@/lib/seo/meta";

export const metadata: Metadata = {
  title: "Часті питання — доставка, оплата, обмін",
  description:
    "Відповіді на часті питання про замовлення в ANKE: строки доставки Новою Поштою, способи оплати, обмін і повернення, підбір розміру.",
  alternates: pageAlternates("/faq"),
};

const FAQ = [
  {
    q: "Скільки їде доставка Новою Поштою?",
    a: "Зазвичай 1–3 робочі дні по Україні. Замовлення, оформлені до 14:00, відправляємо того ж дня. Після відправки надішлемо ТТН у SMS і на email — трекінг доступний у кабінеті.",
  },
  {
    q: "Які способи оплати доступні?",
    a: "Онлайн-оплата карткою, Apple Pay / Google Pay, оплата частинами від monobank або накладений платіж при отриманні (з комісією перевізника). Онлайн-оплати фіскалізуються — чек приходить на email.",
  },
  {
    q: "Чи можна повернути або обміняти товар?",
    a: "Так, протягом 14 днів з моменту отримання згідно з Законом України «Про захист прав споживачів». Речі мають бути без слідів носіння, з бирками. Кошти повертаємо на картку протягом 3 робочих днів після отримання повернення.",
  },
  {
    q: "Як обрати розмір?",
    a: "На кожній картці товару є таблиця розмірів з обмірами в сантиметрах і параметри моделі на фото. Сумніваєтесь між двома розмірами — напишіть нам у Telegram, підкажемо по конкретній моделі.",
  },
  {
    q: "Мого розміру немає в наявності. Що робити?",
    a: "Натисніть «Повідомити про надходження» на картці товару і залиште email — щойно розмір з'явиться, ви дізнаєтесь першою.",
  },
  {
    q: "Чи є у вас шоурум?",
    a: "Так, шоурум ANKE працює в Києві щодня з 10:00 до 20:00. Можна приміряти будь-яку річ з каталогу — за бажанням відкладемо ваш розмір перед візитом.",
  },
  {
    q: "Звідки ваші речі?",
    a: "ANKE — шоурум: ми не шиємо, а відбираємо моделі й привозимо їх у Київ. Кожну річ перевіряємо руками до того, як вона потрапить у каталог: тканина, посадка, шви, фурнітура. Склад і догляд у картці товару — реальні.",
  },
];

export default function FaqPage() {
  return (
    <Container className="py-6 md:py-10">
      <JsonLd data={faqJsonLd(FAQ.map((f) => ({ q: f.q, a: f.a })))} />
      <Breadcrumbs items={[{ title: "FAQ", href: "/faq" }]} />
      <h1 className="mt-5 font-display text-display-sm font-light md:text-display">Часті питання</h1>
      <div className="mt-8 max-w-2xl divide-y divide-line border-y border-line">
        {FAQ.map((f) => (
          <details key={f.q} className="group py-4">
            <summary className="flex cursor-pointer items-center justify-between text-[14.5px] font-medium marker:content-none">
              {f.q}
              <span className="ml-4 text-muted transition-transform group-open:rotate-45" aria-hidden="true">
                +
              </span>
            </summary>
            <p className="mt-3 text-[13.5px] leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </Container>
  );
}
