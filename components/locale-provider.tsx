"use client";
import { createContext, useContext } from "react";
import type { Locale } from "@/lib/i18n/routing";
const LocaleContext = createContext<{
  locale: Locale;
  messages: Record<string, string>;
}>({ locale: "sr", messages: {} });
export function LocaleProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Record<string, string>;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ locale, messages }}>
      {children}
    </LocaleContext.Provider>
  );
}
export function useLocale() {
  return useContext(LocaleContext).locale;
}
export function useTranslation() {
  const { messages } = useContext(LocaleContext);
  return (source: string) =>
    messages[source.replace(/\s+/g, " ").trim()] ?? source;
}
