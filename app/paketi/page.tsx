import { getServices, growthReady } from "@/lib/data";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { publicPageMetadata } from "@/lib/seo";
import { ViewEvent } from "@/components/analytics-consent";
import { PackagesExperience } from "@/components/packages-experience";
export const dynamic = "force-dynamic";
export default async function Packages() {
  const t = await getTranslator();
  return (
    <div className="container page-section packages-page">
      <ViewEvent context="plans" />
      <div className="center-heading catalog-heading">
        <span className="eyebrow">{t("JEDNOKRATNA I REDOVNA POMOĆ")}</span>
        <h1>{t("Koliko često vam treba pomoć?")}</h1>
        <p>
          {t(
            "Izaberite jedan dolazak ili redovnu pomoć. Recite nam koje poslove imate, a mi pripremamo ponudu sa cenom i terminima.",
          )}
        </p>
      </div>
      <PackagesExperience
        services={await getServices()}
        ready={await growthReady()}
      />
      <details className="package-terms">
        <summary>{t("Kako se dogovaraju cena i plaćanje?")}</summary>
        <p>
          {t(
            "Za redovne planove dogovaramo mesečnu ponudu i uplatu unapred, nakon aktiviranja naplate. Trajanje poseta, promene termina i eventualni prenos posete navode se u vašoj ponudi. Majstorski rad ima zaseban obračun u okviru istog plana.",
          )}
        </p>
      </details>
    </div>
  );
}
export async function generateMetadata() {
  return publicPageMetadata(await getLocale(), "/paketi");
}
