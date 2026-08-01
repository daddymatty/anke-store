import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs } from "@/components/shop/Breadcrumbs";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LogoMark } from "@/components/ui/Logo";
import { FOUNDER } from "@/content/founder";
import { breadcrumbsJsonLd } from "@/lib/seo/jsonld";
import { pageAlternates } from "@/lib/seo/meta";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${FOUNDER.fullName} — засновниця ANKE`,
  description: `${FOUNDER.fullName} — засновниця українського бренду ANKE: як з'явився бренд, за якими правилами обираються тканини і чому кожна модель спершу перевіряється на собі.`,
  alternates: pageAlternates("/zasnovnytsia"),
  ...(FOUNDER.ogImage
    ? { openGraph: { images: [{ url: FOUNDER.ogImage, width: 1200, height: 630 }] } }
    : {}),
};

const crumbs = [{ title: "Засновниця", href: "/zasnovnytsia" }];

type Shot = { src: string; alt: string; placeholder: boolean; caption: string };

/**
 * Фото засновниці. Поки реального кадру немає (placeholder: true) — показуємо
 * стриману рамку з монограмою замість чужого зображення, щоб сторінка не
 * видавала тонову заглушку за портрет.
 */
function FounderPhoto({
  shot,
  sizes,
  priority,
  className,
}: {
  shot: Shot;
  sizes: string;
  priority?: boolean;
  className: string;
}) {
  if (shot.placeholder) {
    return (
      <div className={`${className} bg-beige p-3`}>
        <div className="flex h-full w-full flex-col items-center justify-center gap-5 border border-dashed border-ink/15">
          <LogoMark className="h-12 w-12 text-ink/20" />
          <p className="px-6 text-center text-[11px] uppercase tracking-[0.22em] text-muted">
            {shot.caption}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className={`${className} relative overflow-hidden bg-beige`}>
      <Image
        src={shot.src}
        alt={shot.alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
      />
    </div>
  );
}

export default function FounderPage() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Person",
            name: FOUNDER.fullName,
            givenName: "Анастасія",
            familyName: "Січко",
            jobTitle: FOUNDER.role,
            worksFor: { "@id": `${SITE.url}/#organization` },
            ...(FOUNDER.portrait.placeholder
              ? {}
              : { image: `${SITE.url}${FOUNDER.portrait.src}` }),
            url: `${SITE.url}/zasnovnytsia`,
          },
          breadcrumbsJsonLd(crumbs),
        ]}
      />

      <Container className="pt-6">
        <Breadcrumbs items={crumbs} />
      </Container>

      {/* Знайомство: портрет і хто це */}
      <Container className="mt-8 grid items-center gap-8 md:mt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        <FounderPhoto
          shot={FOUNDER.portrait}
          priority
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="aspect-[4/5] max-h-[68vh] w-full"
        />

        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-rose-deep">
            {FOUNDER.role}
          </p>
          <h1 className="mt-4 font-display text-display-sm font-light leading-[1.05] tracking-[0.06em] md:text-display">
            {FOUNDER.fullName}
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">{FOUNDER.lead}</p>
        </div>
      </Container>

      {/* Розповідь від першої особи */}
      <Container className="mt-16 md:mt-24">
        <div className="mx-auto max-w-2xl space-y-5 text-[15.5px] leading-[1.75] text-ink/90">
          {FOUNDER.story.map((par, i) => (
            <p key={i} className={i === 0 ? "font-display text-[21px] leading-snug" : undefined}>
              {par}
            </p>
          ))}
        </div>
      </Container>

      {/* Досьє — зверстане як бирка на одязі */}
      <Container className="mt-16 md:mt-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
          <Reveal>
            <FounderPhoto
              shot={FOUNDER.atelier}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="aspect-[4/3] w-full lg:aspect-[5/4]"
            />
          </Reveal>

          <Reveal delay={0.05}>
            <div className="border border-line p-6 md:p-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted">
                Досьє
              </p>
              <dl className="mt-5 divide-y divide-line">
                {FOUNDER.dossier.map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-6 py-3">
                    <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
                      {row.label}
                    </dt>
                    <dd className="text-right font-display text-[17px] leading-tight">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </Container>

      {/* Принципи роботи */}
      <section aria-labelledby="founder-principles" className="mt-16 bg-beige py-16 md:mt-24 md:py-20">
        <Container>
          <h2 id="founder-principles" className="font-display text-display-sm font-light">
            Правила, за якими шиємо
          </h2>
          <ul className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
            {FOUNDER.principles.map((p, i) => (
              <li key={p.title}>
                <Reveal delay={i * 0.05}>
                  <span
                    aria-hidden="true"
                    className="block h-8 w-8 border border-ink/25 shadow-[inset_0_0_0_2px_var(--color-paper)]"
                    style={{ backgroundColor: p.swatch }}
                  />
                  <h3 className="mt-4 font-display text-[21px] font-light leading-snug">{p.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">{p.text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Цитата */}
      <Container className="py-16 md:py-20">
        <blockquote className="mx-auto max-w-3xl text-center">
          <p className="font-display text-[26px] font-light leading-snug md:text-display-sm">
            «{FOUNDER.quote}»
          </p>
          <footer className="mt-6 text-[12px] uppercase tracking-[0.2em] text-muted">
            {FOUNDER.fullName} — {FOUNDER.role}
          </footer>
        </blockquote>
      </Container>

      {/* Куди далі */}
      <Container className="pb-20 md:pb-24">
        <div className="flex flex-col items-center gap-4 border-t border-line pt-10 md:flex-row md:justify-center">
          <ButtonLink href="/novynky" variant="primary" size="lg">
            Дивитись колекцію
          </ButtonLink>
          <ButtonLink href="/kontakty" variant="outline" size="lg">
            Прийти в шоурум
          </ButtonLink>
        </div>
      </Container>
    </>
  );
}
