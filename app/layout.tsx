import { dictionary } from "@/lib/i18n";
import { headers } from "next/headers";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { languageTags } from "@/lib/i18n/routing";
import { publicPageMetadata } from "@/lib/seo";
import { LocaleProvider } from "@/components/locale-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "lenis/dist/lenis.css";
import "./globals.css";
import { SmoothScroll } from "@/components/smooth-scroll";
import { AnalyticsConsent } from "@/components/analytics-consent";
import { growthReady } from "@/lib/data";
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
    <html lang={languageTags[locale]} data-scroll-behavior="smooth">
      <body>
        <LocaleProvider locale={locale} messages={dictionary(locale)}>
          <SmoothScroll />
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
