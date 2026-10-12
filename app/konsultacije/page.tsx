import { getServices, growthReady } from "@/lib/data";
import { packageServiceId } from "@/lib/catalog";
import { RequestForm } from "@/components/request-form";
import { ViewEvent } from "@/components/analytics-consent";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { publicPageMetadata } from "@/lib/seo";
import Link from "@/components/localized-link";
export const dynamic = "force-dynamic";
export default async function Consultation({
  searchParams,
}: {
  searchParams: Promise<{
    tier?: string;
    intent?: string;
    change?: string;
    ref?: string;
  }>;
}) {
  const t = await getTranslator();
  const query = await searchParams;
  const tier =
    query.tier === "signature" || query.tier === "private"
      ? query.tier
      : "once";
  const intent =
    query.intent === "plan-change"
      ? "plan-change"
      : tier === "once"
        ? "visit"
        : "managed";
  const change =
    query.change === "less-often" || query.change === "seasonal"
      ? query.change
      : "pause";
  const service = (await getServices()).find(
    (service) => service.id === packageServiceId,
  );
  return (
    <div className="container page-section consultation-page">
      <ViewEvent context="consultation" />
      <div className="center-heading catalog-heading">
        <span className="eyebrow">CASA CONCIERGE</span>
        <h1>
          {intent === "plan-change"
            ? t("Ritam koji se menja sa vama.")
            : tier === "once"
              ? t("Vaša prva Casa poseta.")
              : t("Prepustite nam brigu o domu.")}
        </h1>
        <p>
          {t(
            "Recite nam šta vam je važno. Naš tim predlaže usluge, dogovara detalje i priprema jednu preglednu ponudu.",
          )}
        </p>
      </div>
      <div className="consultation-grid">
        <section className="concierge-copy">
          <h2>{t("Jedan kontakt. Detalji rešeni.")}</h2>
          <p>
            {t(
              "Možete nam prepustiti izbor usluga ili poslati svoju listu. Za vas, vaše domaćinstvo ili osobu koju zastupate.",
            )}
          </p>
          <ul>
            <li>
              {t("Tačna adresa i tehnički detalji dogovaraju se naknadno.")}
            </li>
            <li>{t("Svaki posao i doplatu potvrđujete pre realizacije.")}</li>
            <li>
              {t("Redovan plan može imati manji obim ili sezonski ritam.")}
            </li>
          </ul>
          <Link className="text-link" href="/paketi#moj-paket">
            {t("Želim da sastavim svoj paket")}
          </Link>
        </section>
        <div className="panel">
          {service ? (
            <RequestForm
              service={service}
              ready={await growthReady()}
              commerce={{
                intent,
                tier,
                ...(/^[a-f0-9]{12}$/.test(query.ref || "")
                  ? { referral_code: query.ref }
                  : {}),
                ...(intent === "plan-change" ? { plan_change: change } : {}),
              }}
            />
          ) : (
            <p className="notice">
              {t("Prijem zahteva za pakete otvaramo nakon aktiviranja ponude.")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
export async function generateMetadata() {
  return publicPageMetadata(await getLocale(), "/konsultacije");
}
