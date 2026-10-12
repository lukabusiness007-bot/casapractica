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
import { money, packageServiceId } from "@/lib/catalog";
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
          <div className="detail-image">
            <Image
              width={900}
              height={1100}
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
          <div className="price-line">
            {service.price
              ? `${t("Od")} ${money(service.price, locale)}`
              : t("Cena na upit")}
            <span>{t("Bez plaćanja prilikom slanja zahteva")}</span>
          </div>
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
    </div>
  );
}
