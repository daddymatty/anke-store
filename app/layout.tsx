import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ConsentBanner } from "@/components/analytics/ConsentBanner";
import { Gtm, GtmNoScript } from "@/components/analytics/Gtm";
import { Providers } from "@/components/providers";
import { JsonLd } from "@/components/seo/JsonLd";
import { catalog } from "@/lib/catalog";
import { cormorant, montserrat } from "@/lib/fonts";
import { buildNav } from "@/lib/nav";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/seo/jsonld";
import { SITE_INDEXABLE } from "@/lib/seo/meta";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — жіночий одяг та аксесуари | Купити в Києві та Україні`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    siteName: SITE.name,
    locale: "uk_UA",
    type: "website",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: SITE_INDEXABLE
    ? { index: true, follow: true }
    : // Запобіжник: поки NEXT_PUBLIC_SITE_URL — плейсхолдер, сайт не індексується.
      // Після покупки домену постав реальний URL в env — noindex зніметься сам.
      { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nav = buildNav(await catalog.getCategoryTree());
  return (
    <html lang="uk" className={`${cormorant.variable} ${montserrat.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <Gtm />
        <GtmNoScript />
        <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />
        <Providers>
          <Header nav={nav} />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
        <ConsentBanner />
      </body>
    </html>
  );
}
