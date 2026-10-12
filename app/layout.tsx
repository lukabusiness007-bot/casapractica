import { dictionary } from "@/lib/i18n";
import { headers } from "next/headers";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { languageTags } from "@/lib/i18n/routing";
import { publicPageMetadata } from "@/lib/seo";
import { LocaleProvider } from "@/components/locale-provider";
import { Inter } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";
import { AnalyticsConsent } from "@/components/analytics-consent";
import { growthReady } from "@/lib/data";
const sans = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-sans",
});
export async function generateMetadata() {
  return publicPageMetadata(
    await getLocale(),
    (await headers()).get("x-site-path") || "/",
  );
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const t = await getTranslator();
  return (
    <html lang={languageTags[locale]}>
      <body className={sans.variable}>
        <LocaleProvider locale={locale} messages={dictionary(locale)}>
          <a href="#main" className="skip-link">
            {t("Pređi na sadržaj")}
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <AnalyticsConsent ready={await growthReady()} />
        </LocaleProvider>
      </body>
    </html>
  );
}
