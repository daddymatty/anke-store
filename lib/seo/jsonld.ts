import type { CategoryNode, Product, ProductCard } from "@/lib/catalog/types";
import { priceDecimal } from "@/lib/money";
import { SITE } from "@/lib/site";

/**
 * Білдери Schema.org JSON-LD (розділ 4 ТЗ).
 * Рендер — компонент <JsonLd data={...} />.
 */

type JsonLdObject = Record<string, unknown>;

export function organizationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/icon.png`,
    sameAs: [SITE.contacts.instagram, SITE.contacts.telegram],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE.contacts.phone.replace(/\s/g, ""),
      contactType: "customer service",
      availableLanguage: ["Ukrainian"],
    },
  };
}

export function localBusinessJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "@id": `${SITE.url}/#localbusiness`,
    name: `${SITE.name} Showroom`,
    url: SITE.url,
    image: `${SITE.url}/og-default.jpg`,
    telephone: SITE.contacts.phone.replace(/\s/g, ""),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Київ",
      addressCountry: "UA",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "10:00",
      closes: "20:00",
    },
    priceRange: "₴₴",
  };
}

export function webSiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    inLanguage: "uk",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE.url}/poshuk?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbsJsonLd(items: { title: string; href: string }[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Головна", item: SITE.url },
      ...items.map((c, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: c.title,
        item: `${SITE.url}${c.href}`,
      })),
    ],
  };
}

export function productJsonLd(product: Product): JsonLdObject {
  const url = `${SITE.url}/product/${product.slug}`;
  const data: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.title,
    sku: product.sku,
    mpn: product.sku,
    brand: { "@type": "Brand", name: product.brand },
    description: product.description,
    image: product.images.map((i) => `${SITE.url}${i.url}`),
    color: product.color.name,
    material: product.materialFull,
    countryOfOrigin: "UA",
    inProductGroupWithID: product.colorGroupId,
    offers: {
      "@type": "Offer",
      url,
      price: priceDecimal(product.price),
      priceCurrency: "UAH",
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@id": `${SITE.url}/#organization` },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "UAH" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "UA" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "UA",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnShippingFees",
      },
    },
  };
  if (product.rating) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating.value,
      reviewCount: product.rating.count,
      bestRating: 5,
    };
    data.review = product.reviews
      .filter((r) => r.approved)
      .map((r) => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.author },
        datePublished: r.date,
        reviewBody: r.text,
        reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
      }));
  }
  return data;
}

export function itemListJsonLd(category: CategoryNode, items: ProductCard[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category.title,
    numberOfItems: items.length,
    itemListElement: items.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE.url}/product/${p.slug}`,
      name: p.title,
    })),
  };
}

export function faqJsonLd(items: { q: string; a: string }[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function articleJsonLd(a: {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    mainEntityOfPage: `${SITE.url}/blog/${a.slug}`,
    datePublished: a.datePublished,
    dateModified: a.dateModified ?? a.datePublished,
    image: a.image ? `${SITE.url}${a.image}` : `${SITE.url}/og-default.jpg`,
    author: { "@id": `${SITE.url}/#organization` },
    publisher: { "@id": `${SITE.url}/#organization` },
    inLanguage: "uk",
  };
}
