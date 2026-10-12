import { getServices, growthReady } from "@/lib/data";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { publicPageMetadata } from "@/lib/seo";
import Link from "@/components/localized-link";
import { ViewEvent } from "@/components/analytics-consent";
import { PackagesExperience } from "@/components/packages-experience";
export const dynamic = "force-dynamic";
export default async function Packages() {
  const t = await getTranslator();
  return (
    <div className="container page-section packages-page">
      <ViewEvent context="plans" />
      <div className="center-heading catalog-heading">
        <span className="eyebrow">{t("CASA PLANOVI")}</span>
        <h1>{t("Vaš dom. Vaš ritam.")}</h1>
        <p>
          {t(
            "Od jedne pažljivo planirane posete do redovne brige o domu. Premium pažnja u svakom dolasku.",
          )}
        </p>
      </div>
      <PackagesExperience
        services={await getServices()}
        ready={await growthReady()}
      />
      <section className="premium-standard">
        <div>
          <h2>{t("Počnite jednom posetom.")}</h2>
          <p>
            {t(
              "Možete odabrati jednu potrebu, manji broj dolazaka ili sezonsku kolekciju. Isti Casa standard, uz manje obaveze.",
            )}
          </p>
        </div>
        <Link className="button button-dark" href="/konsultacije">
          {t("Zakažite prvu Casa posetu")}
        </Link>
        <Link className="text-link" href="/kolekcije">
          {t("Casa kolekcije")}
        </Link>
      </section>
      <section className="package-terms">
        <h2>{t("Jasan dogovor, od prvog dana.")}</h2>
        <p>
          {t(
            "Za redovne planove dogovaramo mesečnu ponudu i uplatu unapred, nakon aktiviranja naplate. Trajanje poseta, promene termina i eventualni prenos posete navode se u vašoj ponudi. Majstorski rad ima zaseban obračun u okviru istog plana.",
          )}
        </p>
      </section>
    </div>
  );
}
export async function generateMetadata() {
  return publicPageMetadata(await getLocale(), "/paketi");
}
