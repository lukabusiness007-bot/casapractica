"use client";
import { usePathname } from "next/navigation";
import { Globe2, ChevronDown, Check } from "lucide-react";
import {
  languageNames,
  languageTags,
  locales,
  localePath,
} from "@/lib/i18n/routing";
import { useLocale, useTranslation } from "./locale-provider";
export function LanguageSwitcher() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslation();
  return (
    <details className="language-picker">
      <summary aria-label={t("Izaberite jezik")}>
        <Globe2 className="language-globe" size={14} strokeWidth={1} />
        {locale.toUpperCase()}
        <ChevronDown size={11} />
      </summary>
      <nav className="language-options" aria-label={t("Izaberite jezik")}>
        {locales.map((language) => (
          <a
            key={language}
            href={localePath(pathname, language)}
            lang={languageTags[language]}
            hrefLang={languageTags[language]}
            aria-current={locale === language ? "true" : undefined}
            onClick={(event) => {
              event.preventDefault();
              window.location.assign(
                localePath(pathname, language) +
                  window.location.search +
                  window.location.hash,
              );
            }}
          >
            {languageNames[language]}
            {locale === language && <Check size={12} />}
          </a>
        ))}
      </nav>
    </details>
  );
}
