import { guideSlugs } from "@/lib/guide-routing";
import { collections } from "@/lib/growth";
import type { MetadataRoute } from "next";
import { getServices } from "@/lib/data";
import { locales } from "@/lib/i18n/routing";
import { absoluteUrl, languageAlternates } from "@/lib/seo";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const services = await getServices();
  const paths = [
    "/",
    "/usluge",
    "/ddd",
    "/klub",
    "/paketi",
    "/konsultacije",
    "/kolekcije",
    "/kontakt",
    "/o-nama",
    "/saveti",
    ...guideSlugs.map((slug) => `/saveti/${slug}`),
    ...collections.map((item) => `/kolekcije/${item.id}`),
    ...services.map((service) => `/usluge/${service.slug}`),
  ];
  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: absoluteUrl(path, locale),
      alternates: { languages: languageAlternates(path) },
    })),
  );
}
