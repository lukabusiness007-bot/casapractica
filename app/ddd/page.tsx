import Image from "next/image";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { getServices } from "@/lib/data";
import { isPestService } from "@/lib/pest-services";
import { collections } from "@/lib/growth";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { ServiceCatalog } from "@/components/service-catalog";
import { PestServiceContent } from "@/components/pest-service-content";
import { StructuredData } from "@/components/structured-data";
import { ViewEvent } from "@/components/analytics-consent";
import Link from "@/components/localized-link";
import { PremiumServiceNote } from "@/components/premium-service-note";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const t = await getTranslator();
  return pageMetadata(await getLocale(), "/ddd", t("DDD usluge u Beogradu"), t("Deratizacija, dezinsekcija i dezinfekcija za domove, zgrade i poslovne prostore u Beogradu. Procena, dogovorena ponuda i plan kontrolnih poseta."), { image: "/images/services/ddd-zastita.webp" });
}

export default async function DddServices() {
  const t = await getTranslator();
  const locale = await getLocale();
  const available = await getServices();
  const services = available.filter(service => isPestService(service.slug));
  const title = t("DDD usluge u Beogradu");
  const url = absoluteUrl("/ddd", locale);
  return (
    <div className="container page-section catalog-page pest-page">
      <ViewEvent context="catalog" />
      <StructuredData data={{
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "CollectionPage", "@id": url, url, name: title,
            description: t("Deratizacija, dezinsekcija i dezinfekcija za domove, zgrade i poslovne prostore u Beogradu. Procena, dogovorena ponuda i plan kontrolnih poseta."),
            mainEntity: { "@type": "ItemList", itemListElement: services.map((service, index) => ({ "@type": "ListItem", position: index + 1, name: t(service.name), url: absoluteUrl(`/usluge/${service.slug}`, locale) })) } },
          { "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: t("Početna"), item: absoluteUrl("/", locale) },
            { "@type": "ListItem", position: 2, name: t("Naše usluge"), item: absoluteUrl("/usluge", locale) },
            { "@type": "ListItem", position: 3, name: title, item: url },
          ] },
        ],
      }} />
      <nav className="seo-breadcrumb" aria-label={t("Naše usluge")}><Link href="/">{t("Početna")}</Link><span>/</span><Link href="/usluge">{t("Naše usluge")}</Link><span>/</span><span>{t("DDD zaštita i dezinfekcija")}</span></nav>
      <div className="catalog-hero">
        <div className="catalog-heading">
          <span className="eyebrow">{t("DDD ZAŠTITA PROSTORA")}</span>
          <h1>{title}</h1>
          <p>{t("DDD znači deratizacija, dezinsekcija i dezinfekcija. Izaberite uslugu prema problemu ili zatražite preventivni plan za stan, kuću, stambenu zgradu ili poslovni prostor. Obim, cenu i termin potvrđujemo nakon procene.")}</p>
          <a className="button button-dark" href="#katalog">{t("Zatražite procenu")} →</a>
          <PremiumServiceNote />
        </div>
        <div className="catalog-hero-image"><Image src="/images/services/ddd-zastita.webp" alt={t("Pregled prostora i plan zaštite")} width={1200} height={800} sizes="(max-width: 760px) 100vw, 540px" preload /><span>{t("Beograd, sa pažnjom.")}</span></div>
      </div>
      <ServiceCatalog services={services} />
      <section className="pest-packages" id="paketi-zastite"><h2>{t("Paketi zaštite prostora")}</h2>
        <div className="regular-plan-grid">
          {collections.filter(item => item.id.startsWith("zastita-")).map(item => <article className="regular-plan-card" key={item.id}>
            <h3>{t(item.name)}</h3><p>{t(item.description)}</p><strong>{t("Cena po proceni")}</strong>
            <Link className="button button-dark" href={`/kolekcije/${item.id}`}>{t("Zatražite procenu")} →</Link>
          </article>)}
        </div>
      </section>
      <PestServiceContent available={available} />
    </div>
  );
}
