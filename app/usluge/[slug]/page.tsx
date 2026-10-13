import Image from "next/image";
import { pageMetadata, absoluteUrl, siteUrl } from "@/lib/seo";
import { StructuredData } from "@/components/structured-data";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import Link from "@/components/localized-link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { getServices, growthReady } from "@/lib/data";
import { relatedServices } from "@/lib/growth";
import { ViewEvent } from "@/components/analytics-consent";
import { RequestForm } from "@/components/request-form";
import { servicePricing } from "@/lib/service-pricing";
import { serviceScopes } from "@/lib/catalog-additions";
import { packageServiceId } from "@/lib/catalog";
import { WashingPriceList } from "@/components/washing-price-list";
import { ClubPrice } from "@/components/club-price";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const t = await getTranslator();

  const { slug } = await params;
  const service = (await getServices()).find((s) => s.slug === slug);
  if (!service) notFound();
  return pageMetadata(
    await getLocale(),
    `/usluge/${slug}`,
    `${t(service.name)} · ${t("BEOGRAD")}`,
    t(service.description),
    { image: service.image },
  );
}
export default async function ServiceDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const t = await getTranslator();

  const { slug } = await params;
  const service = (await getServices()).find((s) => s.slug === slug);
  if (!service) notFound();
  const scope = serviceScopes[service.slug];
  const locale = await getLocale();
  const url = absoluteUrl(`/usluge/${slug}`, locale);
  return (
    <div className="container page-section">
      <ViewEvent context={`service:${service.id}`} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Service",
              "@id": `${url}#service`,
              name: t(service.name),
              description: t(service.description),
              url,
              image: new URL(service.image, siteUrl).href,
              serviceType: t(service.name),
              areaServed: { "@type": "City", name: "Belgrade" },
              provider: {
                "@type": "Organization",
                "@id": `${siteUrl}/#organization`,
                name: "casa practica",
                url: siteUrl,
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: t("Početna"),
                  item: absoluteUrl("/", locale),
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: t("Naše usluge"),
                  item: absoluteUrl("/usluge", locale),
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: t(service.name),
                  item: url,
                },
              ],
            },
          ],
        }}
      />
      <Link href="/usluge" className="text-link back">
        <ArrowLeft size={15} />
        {t("Sve usluge")}
      </Link>
      <div className="detail-grid">
        <div>
          <div className={`detail-image${service.image.startsWith("/images/services/") ? " detail-image-service" : ""}`}>
            <Image
              width={900}
              height={service.image.startsWith("/images/services/") ? 600 : 1100}
              sizes="(max-width: 760px) 100vw, 50vw"
              unoptimized={!service.image.startsWith("/images/")}
              src={service.image}
              alt={t(service.name)}
              loading="eager"
              fetchPriority="high"
            />
          </div>
          <div className="detail-caption">
            <Check size={15} /> {t("Dogovorena cena pre dolaska")}{" "}
            <span>{t("BEOGRAD")}</span>
          </div>
        </div>
        <div className="detail-content">
          <span className="eyebrow">{t("JEDNA OBAVEZA MANJE")}</span>
          <h1>
            {t(service.name)}
            <span className="service-location">{t("BEOGRAD")}</span>
          </h1>
          <p className="lead">{t(service.tagline)}</p>
          <p>{t(service.description)}</p>
          {scope && (
            <div className="detail-service-scope">
              <h2>{t("Šta obuhvata usluga")}</h2>
              <ul>{scope.tasks.map((task) => <li key={task}><Check size={16} aria-hidden="true" /><span>{t(task)}</span></li>)}</ul>
              {scope.specialist && <p className="detail-specialist-note">{t("Za ove radove dogovaramo odgovarajućeg specijalistu, procenu i posebnu ponudu.")}</p>}
            </div>
          )}
          {servicePricing[service.slug] && <p className="service-price-scope">{t("Cena za standardni obim:")} <strong>{t(servicePricing[service.slug].scope)}</strong><small>{t("Konačnu cenu, dolazak, materijal i dodatne radove potvrđujete pre realizacije.")}</small></p>}
          <div className="price-line">
            <ClubPrice price={service.price} from unit={servicePricing[service.slug]?.unit} locale={locale} t={t} />
            <span>{t("Bez plaćanja prilikom slanja zahteva")}</span>
          </div>
          <p className="detail-club-link"><Link className="text-link" href="/klub#pristupi">{t("Učlanite se besplatno za klupsku cenu")}</Link></p>
          {service.slug === "pranje-tepiha" && <a className="text-link washing-price-jump" href="#cenovnik">{t("Pogledajte ceo cenovnik")}<ArrowLeft size={15} aria-hidden="true" /></a>}
          {service.id === packageServiceId ? (
            <Link className="button button-dark" href="/paketi#moj-paket">
              {t("Sastavite svoj paket")}
            </Link>
          ) : (
            <RequestForm
              service={service}
              ready={await growthReady()}
              recommendations={relatedServices(service, await getServices())}
            />
          )}
          <div className="detail-plan-link">
            <p>{t("Ovu uslugu možete uključiti u svoj Casa plan.")}</p>
            <Link className="text-link" href="/paketi#moj-paket">
              {t("Sastavite svoj paket")}
            </Link>
          </div>
        </div>
      </div>
      {service.slug === "pranje-tepiha" && <WashingPriceList />}
      {service.id !== packageServiceId && <a className="mobile-request-cta button button-dark" href="#zahtev">{t("Pošaljite zahtev")}</a>}
    </div>
  );
}
