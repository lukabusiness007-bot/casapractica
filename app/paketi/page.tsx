import { getServices, growthReady } from "@/lib/data";
import { getLocale, getTranslator } from "@/lib/i18n/server";
import { publicPageMetadata } from "@/lib/seo";
import { ViewEvent } from "@/components/analytics-consent";
import { SubscriptionPlans } from "@/components/subscription-plans";
import { PackagesExperience } from "@/components/packages-experience";
export const dynamic = "force-dynamic";
export default async function Packages() {
  const t = await getTranslator();
  return (
    <div className="container page-section packages-page">
      <ViewEvent context="plans" />
      <div className="center-heading catalog-heading">
        <span className="eyebrow">{t("JEDNOKRATNA I REDOVNA POMOĆ")}</span>
        <h1>{t("Mesečne pretplate za vaš dom")}</h1>
        <p>
          {t(
            "Izaberite obaveze koje želite da prepustite nama. Jedna mesečna cena, dogovoreni dolasci i vaš Casa koordinator.",
          )}
        </p>
      </div>
      <SubscriptionPlans />
      <p className="fine-print subscription-confirmation">{t("Slanje zahteva ne aktivira pretplatu ni automatsku naplatu. Obim, dostupnost, početak i mesečno plaćanje potvrđujemo zajedno.")}</p>
      <section className="premium-standard">
        <div><h2>{t("Usluge po potrebi plaćaju se posebno.")}</h2><p>{t("Montaža TV-a, servis klime, popravke i materijal imaju zasebnu ponudu koju potvrđujete pre rada.")}</p></div>
      </section>
      <PackagesExperience
        services={await getServices()}
        ready={await growthReady()}
      />
      <details className="package-terms">
        <summary>{t("Jedna adresa. Jednostavna promena ritma.")}</summary>
        <p>{t("Paket važi za jednu adresu. Casa Ritam uključuje četiri dolaska po mesečnom ciklusu. Pomeranje termina, pauzu i otkazivanje dogovarate sa koordinatorom preko WhatsApp-a, pre sledeće uplate.")}</p>
      </details>
      <details className="package-terms">
        <summary>{t("Kako se dogovaraju cena i plaćanje?")}</summary>
        <p>
          {t(
            "Za redovne planove dogovaramo mesečnu ponudu i uplatu unapred, nakon aktiviranja naplate. Trajanje poseta, promene termina i eventualni prenos posete navode se u vašoj ponudi. Majstorski rad ima zaseban obračun u okviru istog plana.",
          )}
        </p>
      </details>
    </div>
  );
}
export async function generateMetadata() {
  return publicPageMetadata(await getLocale(), "/paketi");
}
