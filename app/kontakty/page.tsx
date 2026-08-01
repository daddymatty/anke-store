import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { ContactForm } from "@/components/ContactForm";
import { Container } from "@/components/ui/Container";
import { pageAlternates } from "@/lib/seo/meta";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Контакти — шоурум у Києві",
  description: `Шоурум ANKE в Києві: ${SITE.contacts.schedule}. Телефон ${SITE.contacts.phone}, Telegram, Instagram і форма звернення.`,
  alternates: pageAlternates("/kontakty"),
};

export default function ContactsPage() {
  return (
    <Container className="py-6 md:py-10">
      <Breadcrumbs items={[{ title: "Контакти", href: "/kontakty" }]} />
      <h1 className="mt-5 font-display text-display-sm font-light md:text-display">Контакти</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-2">
        <div>
          <dl className="space-y-5 text-[14px]">
            <div>
              <dt className="text-[12px] uppercase tracking-[0.16em] text-muted">Шоурум</dt>
              <dd className="mt-1">{SITE.contacts.address} · {SITE.contacts.schedule}</dd>
            </div>
            <div>
              <dt className="text-[12px] uppercase tracking-[0.16em] text-muted">Телефон</dt>
              <dd className="mt-1">
                <a href={`tel:${SITE.contacts.phone.replace(/\s/g, "")}`} className="hover:text-rose-deep">
                  {SITE.contacts.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[12px] uppercase tracking-[0.16em] text-muted">Email</dt>
              <dd className="mt-1">
                <a href={`mailto:${SITE.contacts.email}`} className="hover:text-rose-deep">
                  {SITE.contacts.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[12px] uppercase tracking-[0.16em] text-muted">Соцмережі</dt>
              <dd className="mt-1 flex gap-4">
                <a
                  href={SITE.contacts.instagram}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="underline underline-offset-4 hover:text-rose-deep"
                  data-analytics="messenger-click"
                >
                  Instagram
                </a>
                <a
                  href={SITE.contacts.telegram}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="underline underline-offset-4 hover:text-rose-deep"
                  data-analytics="messenger-click"
                >
                  Telegram
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[12px] uppercase tracking-[0.16em] text-muted">Реквізити продавця</dt>
              <dd className="mt-1 text-[13px] text-muted">
                {SITE.legal.sellerName} · РНОКПП {SITE.legal.edrpou}
                <br />
                {SITE.legal.legalAddress}
              </dd>
            </div>
          </dl>

          {/* Карта: статичний блок-плейсхолдер; embed підключається після фінальної адреси
              (зовнішній iframe свідомо не вантажимо — бюджет CWV) */}
          <div className="mt-8 flex aspect-[2/1] items-center justify-center border border-line bg-beige text-[13px] text-muted">
            Карта з&apos;явиться тут після підтвердження адреси шоурума
          </div>
        </div>

        <div>
          <h2 className="text-[13px] font-medium uppercase tracking-[0.16em]">Форма звернення споживача</h2>
          <p className="mt-2 text-[13px] text-muted">
            Питання, скарга чи пропозиція — відповімо протягом робочого дня.
          </p>
          <div className="mt-5">
            <ContactForm />
          </div>
        </div>
      </div>
    </Container>
  );
}
