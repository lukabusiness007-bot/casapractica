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
              "Sve što vašem stanu treba: sitne popravke, montaža, nega i organizacija prostora. Izaberite zadatke za jednu posetu ili redovnu pomoć.",
            )}
          </p>
          <a className="text-link" href="#katalog">
            {t("Pronađite svoju uslugu")}
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
        <div className="catalog-hero-image">
          <Image
            src="/images/kitchen.jpg"
            alt={t("Pažnja prema svakom detalju doma")}
            width={900}
            height={700}
            sizes="(max-width: 760px) 100vw, 540px"
            preload
          />
          <span>{t("Beograd, sa pažnjom.")}</span>
        </div>
      </div>
      <ServiceCatalog services={services} initialRepair={(await searchParams).potreba === "popravke"} />
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
