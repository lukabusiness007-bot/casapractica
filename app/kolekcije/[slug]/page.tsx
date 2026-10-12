import Image from "next/image";
import { notFound } from "next/navigation";
import { collections } from "@/lib/growth";
import { getServices, growthReady } from "@/lib/data";
import { packageServiceId } from "@/lib/catalog";
import { RequestForm } from "@/components/request-form";
import { ViewEvent } from "@/components/analytics-consent";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";
import Link from "@/components/localized-link";
export const dynamic = "force-dynamic";
export default async function Collection({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = collections.find((item) => item.id === slug);
  if (!item) notFound();
  const t = await getTranslator();
  const services = await getServices();
  const choices = item.slugs.flatMap((slug) =>
    services.filter((service) => service.slug === slug),
  );
  const bundle = services.find((service) => service.id === packageServiceId);
  const ready = choices.length === item.slugs.length && !!bundle;
  return (
    <div className="container page-section">
      <ViewEvent context={`collection:${item.id}`} />
      <Link className="text-link back" href="/kolekcije">
        ← {t("Casa kolekcije")}
      </Link>
      <div className="detail-grid">
        <div>
          <div className="detail-image">
            <Image
              src={item.image}
              width={900}
              height={1000}
              sizes="(max-width:760px) 100vw, 50vw"
              alt={t(item.name)}
            />
          </div>
        </div>
        <section className="detail-content">
          <span className="eyebrow">{t("CASA KOLEKCIJE")}</span>
          <h1>{t(item.name)}</h1>
          <p className="lead">{t(item.description)}</p>
          <ul className="collection-includes">
            {choices.map((service) => (
              <li key={service.id}>
                <Link href={`/usluge/${service.slug}`}>{t(service.name)}</Link>
              </li>
            ))}
          </ul>
          <p className="notice">
            {t(
              "Sadržaj, obim i cena potvrđuju se u jednoj ponudi. Materijal i kupljeni proizvodi navode se odvojeno.",
            )}
          </p>
          {ready && bundle ? (
            <RequestForm
              service={bundle}
              ready={await growthReady()}
              commerce={{ collection_id: item.id }}
              packageSelection={{
                plan_id: "once",
                items: choices.map((service) => ({
                  service_id: service.id,
                  frequency: "once",
                })),
              }}
            />
          ) : (
            <p className="notice">
              {t(
                "Prijem zahteva za ovu kolekciju otvaramo kada sve uključene usluge budu dostupne.",
              )}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = collections.find((item) => item.id === slug);
  if (!item) notFound();
  const t = await getTranslator();
  return pageMetadata(
    await getLocale(),
    `/kolekcije/${slug}`,
    t(item.name),
    t(item.description),
  );
}
