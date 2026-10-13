import type { Metadata } from "next";
import { locales, languageTags, localePath, type Locale } from "./i18n/routing";
import { translator } from "./i18n";
import { resolveSiteUrl, isPublicProductionSite } from "./site-url";
export const siteUrl = resolveSiteUrl();
export const productionSite = isPublicProductionSite();
const ogLocales = {
  sr: "sr_RS",
  en: "en_GB",
  ru: "ru_RU",
  de: "de_DE",
  tr: "tr_TR",
};
export function absoluteUrl(path: string, locale: Locale = "sr") {
  return new URL(localePath(path, locale), siteUrl).href;
}
export function languageAlternates(path: string) {
  return Object.fromEntries([
    ...locales.map((locale) => [
      languageTags[locale],
      absoluteUrl(path, locale),
    ]),
    ["x-default", absoluteUrl(path)],
  ]);
}
export function pageMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
  options: { noindex?: boolean; image?: string } = {},
): Metadata {
  const fullTitle = `${title} | casa practica`;
  const image = options.image || "/opengraph-image";
  return {
    metadataBase: new URL(siteUrl),
    title: { absolute: fullTitle },
    description,
    alternates: {
      canonical: absoluteUrl(path, locale),
      ...(!options.noindex ? { languages: languageAlternates(path) } : {}),
    },
    robots:
      options.noindex || !productionSite
        ? { index: false, follow: true }
        : {
            index: true,
            follow: true,
            googleBot: {
              index: true,
              follow: true,
              "max-image-preview": "large",
              "max-snippet": -1,
              "max-video-preview": -1,
            },
          },
    openGraph: {
      type: "website",
      siteName: "casa practica",
      title: fullTitle,
      description,
      url: absoluteUrl(path, locale),
      locale: ogLocales[locale],
      alternateLocale: locales
        .filter((l) => l !== locale)
        .map((l) => ogLocales[l]),
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
  };
}
export const homeTitle = "Usluge za stan u Beogradu";
export const homeDescription =
  "Usluge za stan u Beogradu: čišćenje doma, krečenje, iznošenje smeća i šuta, montaža TV-a i polica, popravke i servis klime.";
export function publicPageMetadata(locale: Locale, path: string) {
  const t = translator(locale);
  if (path === "/kolekcije")
    return pageMetadata(
      locale,
      path,
      t("Casa kolekcije"),
      t(
        "Stan spreman za povratak s puta, goste, novu sezonu ili useljenje. Povezane usluge i jedan dogovor za celu listu.",
      ),
    );
  if (path === "/konsultacije")
    return pageMetadata(
      locale,
      path,
      t("Zakažite posetu"),
      t(
        "Recite nam šta vam je važno. Naš tim predlaže usluge, dogovara detalje i priprema jednu preglednu ponudu.",
      ),
    );
  if (path === "/paketi")
    return pageMetadata(
      locale,
      path,
      t("Mesečna pomoć za vaš stan"),
      t(
        "Izaberite obaveze koje želite da prepustite nama. Jedna mesečna cena, dogovoreni dolasci i vaš Casa koordinator.",
      ),
    );
  if (path === "/" || path === "/usluge")
    return pageMetadata(
      locale,
      path,
      path === "/" ? t(homeTitle) : `${t("Naše usluge")} · ${t("BEOGRAD")}`,
      t(homeDescription),
    );
  if (path === "/klub")
    return pageMetadata(
      locale,
      path,
      t("casa practica klub"),
      t(
        "Besplatan klub sa članskim ponudama i ranijim pristupom novim uslugama za dom u Beogradu. Saznajte kako da postanete članica.",
      ),
    );
  const titles: Record<string, string> = {
    "/nalog": "Moj nalog",
    "/prijava": "Prijavite se",
    "/registracija": "Napravite nalog",
    "/auth/oporavak": "Vaša nova lozinka.",
    "/privatnost": "Obaveštenje o privatnosti",
    "/uslovi": "Uslovi korišćenja",
    "/admin": "Administracija",
  };
  return pageMetadata(
    locale,
    path,
    t(titles[path] || "Usluga nije pronađena"),
    t(titles[path] || homeDescription),
    { noindex: true },
  );
}
