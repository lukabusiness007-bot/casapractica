import { publicPageMetadata } from "@/lib/seo";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { getServices } from "@/lib/data";
import { ServiceCatalog } from "@/components/service-catalog";
import Link from "@/components/localized-link";
import { ViewEvent } from "@/components/analytics-consent";
import { ArrowUpRight } from "lucide-react";
export const dynamic = "force-dynamic";
export default async function Services() {
  const t = await getTranslator();

  const services = await getServices();
  return (
    <div className="container page-section catalog-page">
      <ViewEvent context="catalog" />
      <div className="center-heading catalog-heading">
        <span className="eyebrow">
          {t("MALE OBAVEZE. VIŠE VREMENA ZA VAS.")}
        </span>
        <h1>{t("Usluge za dom u Beogradu")}</h1>
        <p>
          {t(
            "Popravke, održavanje, montaža i svakodnevna pomoć. Pronađite sve što vašem domu treba, uz premijum pažnju prema svakom detalju.",
          )}
        </p>
      </div>
      <ServiceCatalog services={services} />
      <section className="premium-standard">
        <div>
          <h2>{t("Više zadataka. Jedan Casa plan.")}</h2>
          <p>
            {t(
              "Kombinujte montažu, održavanje i svakodnevnu pomoć u paketu koji prati vaše navike.",
            )}
          </p>
        </div>
        <Link className="button button-dark" href="/paketi">
          {t("Sastavite svoj paket")}
          <ArrowUpRight size={17} />
        </Link>
      </section>
      <p className="center muted">
        {t(
          "Usluge su dostupne u Beogradu. Cenu i termin potvrđujemo nakon dogovora.",
        )}
      </p>
    </div>
  );
}

export async function generateMetadata() {
  return publicPageMetadata(await getLocale(), "/usluge");
}
