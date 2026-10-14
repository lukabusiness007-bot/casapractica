import { publicPageMetadata } from "@/lib/seo";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { getServices } from "@/lib/data";
import { ServiceCatalog } from "@/components/service-catalog";
import Link from "@/components/localized-link";
import { ViewEvent } from "@/components/analytics-consent";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
export const dynamic = "force-dynamic";
export default async function Services({ searchParams }: { searchParams: Promise<{ potreba?: string }> }) {
  const t = await getTranslator();

  const services = await getServices();
  return (
    <div className="container page-section catalog-page">
      <ViewEvent context="catalog" />
      <div className="catalog-hero">
        <div className="catalog-heading">
          <span className="eyebrow">
            {t("MALE OBAVEZE. VIŠE VREMENA ZA VAS.")}
          </span>
          <h1>{t("Usluge za stan u Beogradu")}</h1>
          <p>
            {t(
              "Premijum usluge za dom u Beogradu: čišćenje, održavanje i DDD zaštita. Izaberite uslugu uz pažljivo dogovoren obim i ponudu prema svom prostoru.",
            )}
          </p>
          <a className="text-link" href="#katalog">
            {t("Pronađite svoju uslugu")}
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
        <div className="catalog-hero-image">
          <Image
            src="/images/services-hero-belgrade.webp"
            alt={t("Pažnja prema svakom detalju doma")}
            width={1440}
            height={960}
            sizes="(max-width: 760px) 100vw, 540px"
            preload
          />
          <span>{t("Beograd, sa pažnjom.")}</span>
        </div>
      </div>
      <ServiceCatalog services={services} initialRepair={(await searchParams).potreba === "popravke"} />
      <section className="premium-standard">
        <div><h2>{t("DDD zaštita i dezinfekcija")}</h2><p>{t("Deratizacija, dezinsekcija, dezinfekcija i srodne usluge za vaš prostor.")}</p></div>
        <Link className="button button-dark" href="/ddd">{t("Istražite DDD usluge")} →</Link>
      </section>
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
