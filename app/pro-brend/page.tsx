import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { pageAlternates } from "@/lib/seo/meta";

export const metadata: Metadata = {
  title: "Про бренд",
  description:
    "ANKE — український бренд жіночого одягу: власне виробництво в Києві, натуральні тканини, стримана естетика і чесні ціни.",
  alternates: pageAlternates("/pro-brend"),
};

export default function AboutPage() {
  return (
    <Container className="py-6 md:py-10">
      <Breadcrumbs items={[{ title: "Про бренд", href: "/pro-brend" }]} />
      <div className="mx-auto mt-10 max-w-2xl">
        <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-rose-deep">ANKE Showroom</p>
        <h1 className="mt-3 font-display text-display-sm font-light md:text-display">
          Одяг, який не кричить. Він просто добре сидить
        </h1>
        <div className="relative mt-10 aspect-[2/1] overflow-hidden bg-beige">
          <Image src="/demo/beige.jpg" alt="Шоурум ANKE у Києві" fill sizes="672px" className="object-cover" />
        </div>
        <div className="mt-10 space-y-5 text-[15px] leading-relaxed text-ink/90">
          <p>
            ANKE народився зі звичайного жіночого «нічого вдягнути» — коли шафа повна, а вдягнути
            справді нічого. Ми почали як маленький шоурум у Києві і виросли в бренд з власним
            виробництвом, але правило лишилось те саме: кожна річ має працювати в гардеробі, а не
            висіти в ньому.
          </p>
          <p>
            Ми шиємо в Україні — на власному виробництві та у перевірених київських цехах. Тканини
            обираємо руками: льон, який дихає у спеку; кашемір, який не колеться; віскозу, яка
            струмує в русі. Жодного поліестеру там, де тіло хоче дихати.
          </p>
          <p>
            Наша естетика — багато повітря і мала амплітуда: монохромна база, точні силуети, один
            акцент. Речі ANKE дружать між собою — тому капсула з п’яти позицій дає два тижні
            небанальних образів.
          </p>
          <p>
            Ми віримо у повільну моду: краще одна сукня, яку носитимеш п’ять років, ніж п’ять — на
            один сезон. Тому даємо чесні склади тканин, реальні фото без ретуші силуетів і 14 днів
            на обмін чи повернення без питань.
          </p>
        </div>
        <div className="mt-10 flex gap-3">
          <ButtonLink href="/novynky" variant="primary" size="lg">
            Нова колекція
          </ButtonLink>
          <ButtonLink href="/kontakty" variant="outline" size="lg">
            Прийти в шоурум
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
