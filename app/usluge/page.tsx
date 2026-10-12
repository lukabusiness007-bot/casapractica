import { publicPageMetadata } from "@/lib/seo";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { getServices } from "@/lib/data";
import { ServiceCard } from "@/components/service-card";
export const dynamic = "force-dynamic";
export default async function Services() {
  const t = await getTranslator();

  const services = await getServices();
  return (
    <div className="container page-section catalog-page">
      <div className="center-heading catalog-heading">
        <span className="eyebrow">{t("JEDNA OBAVEZA MANJE")}</span>
        <h1>{t("Usluge za dom u Beogradu")}</h1>
        <p>{t("Izaberite svoju uslugu. Detalje ćemo dogovoriti zajedno.")}</p>
      </div>
      <div className="catalog-grid">
        {services.map((service, i) => (
          <ServiceCard service={service} key={service.id} index={i} />
        ))}
      </div>
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
