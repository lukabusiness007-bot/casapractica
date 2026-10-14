import { getLocale } from "@/lib/i18n/server";
import { seoCopy } from "@/lib/seo-copy";
import { businessDetails } from "@/lib/business";
import { publicPageMetadata } from "@/lib/seo";
import { TrustStandard } from "@/components/trust-standard";
import { BusinessContact } from "@/components/business-contact";
import { ViewEvent } from "@/components/analytics-consent";
import Link from "@/components/localized-link";
export default async function About() {
  const copy = seoCopy(await getLocale());
  const business = businessDetails();
  return (
    <div className="container page-section">
      <ViewEvent context="about" />
      <article className="prose">
        <h1>{copy.aboutTitle}</h1>
        <h2>{copy.approachTitle}</h2>
        <p>{copy.approachText}</p>
        <h2>{copy.accessTitle}</h2>
        <p>{copy.accessText}</p>
        <h2>{copy.serviceAreaTitle}</h2>
        <p>{copy.serviceArea}</p>
        {business.legalName && <p>{business.legalName}</p>}
        {business.address && <p>{business.address}</p>}
        <BusinessContact placeholder />
        <Link href="/kontakt" className="text-link">
          {copy.contactTitle} →
        </Link>
      </article>
      <TrustStandard />
      <article className="prose">
        <h2>{copy.recurringTitle}</h2>
        <p>{copy.recurringText}</p>
        <Link className="button button-dark" href="/paketi#redovni-planovi">
          {copy.plansLink}
        </Link>
      </article>
    </div>
  );
}
export async function generateMetadata() {
  return publicPageMetadata(await getLocale(), "/o-nama");
}
