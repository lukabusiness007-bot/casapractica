import messages from "./messages.json";
import type { Locale } from "./routing";
export type Translator = (source: string) => string;
export function translator(locale: Locale): Translator {
  return (source) =>
    locale === "sr"
      ? source
      : ((messages as Record<string, Record<string, string>>)[locale]?.[
          source.replace(/\s+/g, " ").trim()
        ] ?? source);
}

export function dictionary(locale: Locale): Record<string, string> {
  return locale === "sr" ? {} : messages[locale];
}
