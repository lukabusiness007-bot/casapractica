import { getServices } from "@/lib/data";
import { configured } from "@/lib/supabase";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { publicPageMetadata } from "@/lib/seo";
import { PackagesExperience } from "@/components/packages-experience";
export const dynamic = "force-dynamic";
export default async function Packages() {
  const t = await getTranslator();
  return (
    <div className="container page-section packages-page">
      <div className="center-heading catalog-heading">
        <span className="eyebrow">{t("CASA PLANOVI")}</span>
        <h1>{t("Vaš dom. Vaš ritam.")}</h1>
        <p>
          {t(
            "Od jedne pažljivo planirane posete do redovne brige o domu. Premium pažnja u svakom dolasku.",
          )}
        </p>
      </div>
      <PackagesExperience services={await getServices()} ready={configured()} />
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
