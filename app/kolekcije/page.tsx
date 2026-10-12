import { CollectionCards } from "@/components/collection-cards";
import { ViewEvent } from "@/components/analytics-consent";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { publicPageMetadata } from "@/lib/seo";
export default async function Collections() {
  const t = await getTranslator();
  return (
    <div className="container page-section">
      <ViewEvent context="catalog" />
      <div className="center-heading catalog-heading">
        <span className="eyebrow">{t("CASA KOLEKCIJE")}</span>
        <h1>{t("Vaš trenutak. Sve spremno.")}</h1>
        <p>
          {t(
            "Stan spreman za povratak s puta, goste, novu sezonu ili useljenje. Povezane usluge i jedan dogovor za celu listu.",
          )}
        </p>
      </div>
      <CollectionCards />
    </div>
  );
}
export async function generateMetadata() {
  return publicPageMetadata(await getLocale(), "/kolekcije");
}
