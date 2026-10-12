export const locales = ["sr", "en", "ru", "de", "tr"] as const;
export type Locale = (typeof locales)[number];
export const languageNames: Record<Locale, string> = {
  sr: "Srpski",
  en: "English",
  ru: "Русский",
  de: "Deutsch",
  tr: "Türkçe",
};
export const languageTags: Record<Locale, string> = {
  sr: "sr-Latn",
  en: "en",
  ru: "ru",
  de: "de",
  tr: "tr",
};
export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
export function splitLocale(path: string): { locale: Locale; path: string } {
  const match = path.match(/^\/(sr|en|ru|de|tr)(?=\/|\?|#|$)/);
  return {
    locale: match ? (match[1] as Locale) : "sr",
    path: match ? path.slice(match[0].length) || "/" : path,
  };
}
export function localePath(path: string, locale: Locale): string {
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    /^\/(api|admin|auth\/callback)(\/|\?|$)/.test(path)
  )
    return path;
  const bare = splitLocale(path).path;
  return locale === "sr"
    ? bare
    : `/${locale}${bare === "/" ? "" : bare.startsWith("/") ? bare : `/${bare}`}`;
}
