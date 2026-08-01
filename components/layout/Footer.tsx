import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { FOOTER_LINKS, SITE } from "@/lib/site";
import { FooterNewsletter } from "./FooterNewsletter";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-beige">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Бренд */}
          <div className="lg:col-span-2">
            <Logo variant="full" className="h-14 text-ink" />
            <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-muted">{SITE.description}</p>
            <FooterNewsletter />
          </div>

          <FooterCol title="Каталог" links={FOOTER_LINKS.shop} />
          <FooterCol title="Покупцям" links={FOOTER_LINKS.help} />
          <FooterCol title="Бренд" links={FOOTER_LINKS.brand} />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-beige-deep pt-6 text-[12px] text-muted md:flex-row md:items-center md:justify-between">
          {/* Реквізити продавця — обов'язкові за ЗУ «Про електронну комерцію» */}
          <p>
            {SITE.legal.sellerName} · РНОКПП {SITE.legal.edrpou} · {SITE.legal.legalAddress} ·{" "}
            {SITE.contacts.phone} · {SITE.contacts.email}
          </p>
          <p>© {new Date().getFullYear()} {SITE.name}. Всі права захищено.</p>
        </div>
      </Container>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: readonly { title: string; href: string }[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-[13px] text-muted transition-colors hover:text-ink">
              {l.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
