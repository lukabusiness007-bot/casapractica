import { getLocale } from "@/lib/i18n/server";
import { seoCopy } from "@/lib/seo-copy";
import { publicPageMetadata } from "@/lib/seo";
import { BusinessContact } from "@/components/business-contact";
import { getServices, growthReady } from "@/lib/data";
import { packageServiceId } from "@/lib/catalog";
import { RequestForm } from "@/components/request-form";
import Link from "@/components/localized-link";
import { ViewEvent } from "@/components/analytics-consent";
export default async function Contact() {
  const copy = seoCopy(await getLocale());
  const service = (await getServices()).find(
    (item) => item.id === packageServiceId,
  );
  return (
    <div className="container page-section">
      <ViewEvent context="contact" />
      <div className="center-heading">
        <h1>{copy.contactTitle}</h1>
        <p>{copy.contactDescription}</p>
      </div>
      <div className="consultation-grid">
        <section className="prose">
          <BusinessContact placeholder />
          <h2>{copy.serviceAreaTitle}</h2>
          <p>{copy.serviceArea}</p>
          <Link href="/paketi#redovni-planovi" className="text-link">
            {copy.plansLink} →
          </Link>
        </section>
        {service && (
          <div className="panel">
            <h2>{copy.requestQuote}</h2>
            <RequestForm
              service={service}
              ready={await growthReady()}
              commerce={{ intent: "visit" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
export async function generateMetadata() {
  return publicPageMetadata(await getLocale(), "/kontakt");
}
