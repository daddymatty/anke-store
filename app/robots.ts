import type { MetadataRoute } from "next";
import { SITE_INDEXABLE } from "@/lib/seo/meta";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!SITE_INDEXABLE) {
    // Плейсхолдер-домен: закрито все (запобіжник до запуску)
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/checkout", "/dyakuyemo/", "/kabinet", "/vishlist", "/poshuk"],
    },
    sitemap: [`${SITE.url}/sitemap/0.xml`, `${SITE.url}/sitemap/1.xml`, `${SITE.url}/sitemap/2.xml`],
    host: SITE.url,
  };
}
