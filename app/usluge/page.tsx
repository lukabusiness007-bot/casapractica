import { publicPageMetadata } from "@/lib/seo";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { getServices } from "@/lib/data";
import { ServiceCard } from "@/components/service-card";
import {
  isIndividualService,
  serviceCategories,
  serviceCategory,
} from "@/lib/catalog";
import Link from "@/components/localized-link";
import { ArrowUpRight } from "lucide-react";
export const dynamic = "force-dynamic";
export default async function Services() {
  const t = await getTranslator();

  const services = await getServices();
  return (
    <div className="container page-section catalog-page">
      <div className="center-heading catalog-heading">
        <span className="eyebrow">
          {t("MALE OBAVEZE. VIŠE VREMENA ZA VAS.")}
        </span>
        <h1>{t("Usluge za dom u Beogradu")}</h1>
        <p>
          {t(
            "Od montaže TV-a do sveže posteljine. Pažljiva briga o svakom detalju vašeg doma.",
          )}
        </p>
      </div>
      <nav className="category-nav" aria-label={t("Kategorije usluga")}>
        {serviceCategories.map((category) => (
          <a key={category.id} href={`#${category.id}`}>
            {t(category.title)}
          </a>
        ))}
      </nav>
      {serviceCategories.map((category) => {
        const group = services.filter(
          (service) =>
            isIndividualService(service) &&
            serviceCategory(service) === category.id,
        );
        if (!group.length) return null;
        return (
          <section
            className="catalog-category"
            id={category.id}
            key={category.id}
          >
            <div className="category-heading">
              <span className="eyebrow">{t(category.tagline)}</span>
              <h2>{t(category.title)}</h2>
              <p>{t(category.description)}</p>
            </div>
            <div className="catalog-grid">
              {group.map((service) => (
                <ServiceCard service={service} key={service.id} />
              ))}
            </div>
          </section>
        );
      })}
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
